// AdminPages.tsx — IT Admin · Role Maintenance Cockpit
// Tabs: Vendor Sync | BRM User Sync | BRM Role Matrix
import { useState, useEffect } from "react";
import { loadAdminVendors, createPortalUser, loadBrmUsers, syncBrmUsersFromSap, assignBrmRole, saveAllScopes } from "./apiService";
import {
  C, COMPANY_CODES,
  pg, mob,
  Btn, Inp, SapIcon,
} from "./shared";
import { toast } from "./lib/useToast";

const ROLE_DEFS = [
  { code:"AP_ADMIN",  label:"AP Admin",   abbr:"AP" },
  { code:"BUYER",     label:"Buyer",      abbr:"BY" },
  { code:"TENDER",    label:"Tender",     abbr:"TC" },
  { code:"DIRECTOR",  label:"Director",   abbr:"DR" },
];

const XSUAA_OPTS = [
  { v:"",             l:"— No role assigned —"               },
  { v:"BRM_AP_ADMIN", l:"BRM_AP_ADMIN — Invoice & AP"        },
  { v:"BRM_BUYER",    l:"BRM_BUYER — RFQ & Quotation"        },
  { v:"BRM_TENDER",   l:"BRM_TENDER — Quotation Approval"    },
  { v:"BRM_DIRECTOR", l:"BRM_DIRECTOR — Executive Approval"  },
];

export function AdminCockpit() {
  const [tab, setTab] = useState(0);

  // Vendor sync
  const [vendors, setVendors]     = useState<any[]>([]);
  const [vendSearch, setVendSearch] = useState("");
  const [vendFilter, setVendFilter] = useState("all");
  const [vCreating, setVCreating]  = useState<Set<string>>(new Set());

  // BRM user sync
  const [brmUsers, setBrmUsers]   = useState<any[]>([]);
  const [brmRoles, setBrmRoles]   = useState<Record<string,string>>({});
  const [brmApplying, setBrmApplying] = useState<Set<string>>(new Set());
  const [brmSyncing, setBrmSyncing] = useState(false);

  // Role matrix
  const [scopes, setScopes]       = useState<Record<string,Record<string,string[]>>>({});
  const [matrixDirty, setMatrixDirty] = useState(false);
  const [matrixSaving, setMatrixSaving] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [vList, uList] = await Promise.all([loadAdminVendors(), loadBrmUsers()]);
        setVendors(vList);
        setBrmUsers(uList);
        const sc: Record<string,Record<string,string[]>> = {};
        const roles: Record<string,string> = {};
        uList.forEach((u: any) => {
          sc[u.id] = u.scopes || {};
          roles[u.id] = u.xsuaaRole || "";
        });
        setScopes(sc);
        setBrmRoles(roles);
      } catch (e: any) {
        toast("Failed to load admin data: " + e.message, "err");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreateUser = async (bp: string) => {
    const v = vendors.find(x => x.bp === bp);
    if (!v) return;
    if (!v.email) { toast("No contact email on file for " + v.name + ". Update the SAP BP record first.", "err"); return; }
    setVCreating(p => new Set([...p, bp]));
    try {
      await createPortalUser(bp);
      setVendors(p => p.map(x => x.bp === bp ? { ...x, iasStatus:"pending" } : x));
      toast(`IAS user created — activation email sent to ${v.email}. VENDOR role collection assigned via XSUAA.`, "ok");
    } catch (e: any) {
      toast("Create failed: " + e.message, "err");
    } finally {
      setVCreating(p => { const n = new Set(p); n.delete(bp); return n; });
    }
  };

  const handleAssignRole = async (userId: string) => {
    const u = brmUsers.find(x => x.id === userId);
    if (!u) return;
    setBrmApplying(p => new Set([...p, userId]));
    try {
      await assignBrmRole(u.email, brmRoles[userId] || "");
      setBrmUsers(p => p.map(x => x.id === userId ? { ...x, xsuaaRole: brmRoles[userId] || "" } : x));
      toast("XSUAA role updated for " + u.name, "ok");
    } catch (e: any) {
      toast("Assign failed: " + e.message, "err");
    } finally {
      setBrmApplying(p => { const n = new Set(p); n.delete(userId); return n; });
    }
  };

  const toggleScope = (userId: string, cc: string, roleCode: string) => {
    setScopes(prev => {
      const us = { ...(prev[userId] || {}) };
      const cr = [...(us[cc] || [])];
      const idx = cr.indexOf(roleCode);
      idx > -1 ? cr.splice(idx, 1) : cr.push(roleCode);
      us[cc] = cr;
      return { ...prev, [userId]: us };
    });
    setMatrixDirty(true);
  };

  const handleSaveMatrix = async () => {
    setMatrixSaving(true);
    try {
      const payload: any[] = [];
      Object.entries(scopes).forEach(([userId, ccMap]) => {
        Object.entries(ccMap).forEach(([cc, roles]) => payload.push({ userId, cc, roles }));
      });
      await saveAllScopes(payload);
      setMatrixDirty(false);
      toast("Role matrix saved — UserScopes (HANA) and XSUAA role collections updated.", "ok");
    } catch (e: any) {
      toast("Save failed: " + e.message, "err");
    } finally {
      setMatrixSaving(false);
    }
  };

  const handleAddMatrixUser = () => {
    const email = addUserEmail.trim().toLowerCase();
    if (!email || brmUsers.find(u => u.id === email)) {
      if (!email) return;
      toast("User already in matrix.", "err"); return;
    }
    const newUser = { id: email, email, name: email, scopes: {}, xsuaaRole: "" };
    setBrmUsers(p => [...p, newUser]);
    setScopes(p => ({ ...p, [email]: {} }));
    setMatrixDirty(true);
    setAddUserEmail("");
  };

  const filteredVendors = vendors.filter(v => {
    const q = vendSearch.toLowerCase();
    const matchSearch = !q || v.bp.includes(vendSearch) || v.name.toLowerCase().includes(q) || (v.email||"").toLowerCase().includes(q);
    const matchFilter = vendFilter==="all"
      || (vendFilter==="active"  && v.iasStatus==="active")
      || (vendFilter==="pending" && v.iasStatus==="pending")
      || (vendFilter==="none"    && !v.iasStatus);
    return matchSearch && matchFilter;
  });

  const stats = {
    total:   vendors.length,
    active:  vendors.filter(v => v.iasStatus==="active").length,
    pending: vendors.filter(v => v.iasStatus==="pending").length,
    none:    vendors.filter(v => !v.iasStatus).length,
  };

  const roleColor = (code: string) => ({
    AP_ADMIN:  { c:C.primary, bg:C.infoBg  },
    BUYER:     { c:C.ok,      bg:C.okBg    },
    TENDER:    { c:C.warn,    bg:C.warnBg  },
    DIRECTOR:  { c:"#6f2da8", bg:"#f3eeff" },
  }[code] || { c:C.t2, bg:C.subtle });

  const isMob = mob();
  const p = pg();

  const TABS = [
    { label:"Vendor sync",     icon:"building"            },
    { label:"BRM user sync",   icon:"employee-approvals"  },
    { label:"BRM role matrix", icon:"table-view"          },
  ];

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:12,color:C.t2,fontSize:14}}>
      <div style={{width:24,height:24,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.primary}`,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      Loading admin data…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const TH = ({children, w=undefined, right=false}: any) => (
    <th style={{padding:"8px 12px",fontWeight:600,fontSize:12,color:C.t2,textAlign:right?"right":"left",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap" as const,...(w?{width:w}:{})}}>
      {children}
    </th>
  );

  const TD = ({children, mono=false, faint=false, right=false, style={}}: any) => (
    <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,color:faint?C.t2:C.t1,textAlign:right?"right":"left",...(mono?{fontFamily:"monospace"}:{}),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,...style}}>
      {children}
    </td>
  );

  const Pill = ({label, c, bg}: any) => (
    <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:bg,color:c,border:`1px solid ${c}40`,display:"inline-block"}}>
      {label}
    </span>
  );

  return (
    <div style={{maxWidth:1400,margin:"0 auto",padding:p}}>

      {/* ── Page header ── */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <div style={{width:38,height:38,borderRadius:6,background:C.infoBg,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.primary}30`,flexShrink:0}}>
          <SapIcon name="it-instance" size={20} color={C.primary}/>
        </div>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.t1,lineHeight:1.2}}>Role Maintenance Cockpit</div>
          <div style={{fontSize:12,color:C.t2}}>IT Admin · Hybrid model — XSUAA parent roles + portal company code scope</div>
        </div>
        <span style={{marginLeft:"auto",fontSize:11,padding:"3px 10px",background:C.warnBg,border:`1px solid ${C.warn}50`,borderRadius:20,color:C.warn,fontWeight:600,flexShrink:0}}>
          {typeof import.meta !== "undefined" ? "Sandbox / Mock" : "BTP Mode"}
        </span>
      </div>

      {/* ── Tab bar ── */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        {TABS.map((t,i) => (
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:"10px 20px",fontSize:14,fontFamily:"inherit",border:"none",background:"none",
            cursor:"pointer",color:tab===i?C.primary:C.t2,
            borderBottom:`2px solid ${tab===i?C.primary:"transparent"}`,marginBottom:-1,
            fontWeight:tab===i?600:400,display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" as const,
          }}>
            <SapIcon name={t.icon} size={14} color={tab===i?C.primary:C.t2}/>
            {t.label}
          </button>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────
          Tab 0 — Vendor Sync
      ────────────────────────────────────────────────────────── */}
      {tab===0 && <>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:`repeat(${isMob?"2":"4"},1fr)`,gap:12,marginBottom:16}}>
          {[
            { label:"Total vendors",       val:stats.total,   c:C.t1,  bg:C.card   },
            { label:"Portal access (IAS)", val:stats.active,  c:C.ok,  bg:C.okBg  },
            { label:"Pending activation",  val:stats.pending, c:C.warn, bg:C.warnBg },
            { label:"Not provisioned",     val:stats.none,    c:C.t2,  bg:C.subtle },
          ].map(s => (
            <div key={s.label} style={{background:s.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"14px 16px"}}>
              <div style={{fontSize:11,color:s.c,marginBottom:4,opacity:.8,fontWeight:600,letterSpacing:.3}}>{s.label}</div>
              <div style={{fontSize:28,fontWeight:700,color:s.c,lineHeight:1}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" as const,alignItems:"center"}}>
          <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",border:`1px solid ${C.border}`,borderRadius:2,background:C.field,padding:"0 10px",gap:6}}>
            <SapIcon name="search" size={14} color={C.t2}/>
            <input value={vendSearch} onChange={e=>setVendSearch(e.target.value)} placeholder="Search BP number, name, or email…"
              style={{flex:1,border:"none",background:"none",outline:"none",fontSize:13,color:C.t1,padding:"8px 0",fontFamily:"inherit"}}/>
          </div>
          <select value={vendFilter} onChange={e=>setVendFilter(e.target.value)}
            style={{padding:"7px 10px",fontSize:13,border:`1px solid ${C.border}`,borderRadius:2,background:C.field,color:C.t1,fontFamily:"inherit",cursor:"pointer"}}>
            <option value="all">All status</option>
            <option value="active">Active in IAS</option>
            <option value="pending">Pending activation</option>
            <option value="none">Not provisioned</option>
          </select>
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <Btn v="neutral" sm onClick={()=>toast("SAP API_BUSINESS_PARTNER synced — vendor list refreshed.","ok")}>
              <SapIcon name="synchronize" size={13} color={C.t1}/>&nbsp;Sync from SAP
            </Btn>
            <Btn v="ghost" sm onClick={()=>toast("Bulk CSV import — coming soon","")}>
              <SapIcon name="upload" size={13} color={C.t2}/>&nbsp;Bulk CSV
            </Btn>
          </div>
        </div>

        {/* Table */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:13,tableLayout:"fixed" as const,minWidth:700}}>
              <colgroup>
                <col style={{width:104}}/><col/><col style={{width:210}}/><col style={{width:150}}/><col style={{width:90}}/><col style={{width:120}}/><col style={{width:120}}/>
              </colgroup>
              <thead>
                <tr style={{background:C.subtle}}>
                  <TH>BP No.</TH><TH>Vendor name</TH><TH>Email</TH><TH>NPWP</TH>
                  <TH w={90}>SAP status</TH><TH w={120}>IAS status</TH><TH w={120} right>Action</TH>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((v,i) => {
                  const isCreating = vCreating.has(v.bp);
                  const iasLbl = v.iasStatus==="active" ? "Active" : v.iasStatus==="pending" ? "Pending" : "Not created";
                  const iasC   = v.iasStatus==="active" ? C.ok : v.iasStatus==="pending" ? C.warn : C.t2;
                  const iasBg  = v.iasStatus==="active" ? C.okBg : v.iasStatus==="pending" ? C.warnBg : C.subtle;
                  return (
                    <tr key={v.bp} style={{background:i%2===0?C.card:C.subtle}}>
                      <TD mono style={{color:C.primary,fontWeight:600}}>{v.bp}</TD>
                      <TD style={{fontWeight:500}}>{v.name}</TD>
                      <TD faint style={{fontSize:12}}>{v.email||<em style={{color:C.t2}}>No email on file</em>}</TD>
                      <TD faint style={{fontSize:11,fontFamily:"monospace"}}>{v.taxId||"—"}</TD>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>
                        <Pill label={v.sapStatus||"—"} c={v.sapStatus==="Active"?C.ok:C.err} bg={v.sapStatus==="Active"?C.okBg:C.errBg}/>
                      </td>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>
                        <Pill label={iasLbl} c={iasC} bg={iasBg}/>
                      </td>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                        {v.iasStatus==="active"
                          ? <Btn v="ghost" sm onClick={()=>toast(`IAS profile: ${v.iasEmail||v.email}`,"")}><SapIcon name="employee" size={12} color={C.t2}/>&nbsp;View</Btn>
                          : v.iasStatus==="pending"
                          ? <Btn v="neutral" sm onClick={()=>toast("Activation email resent to "+v.email,"ok")}>Resend</Btn>
                          : <Btn v="primary" sm onClick={()=>handleCreateUser(v.bp)} disabled={isCreating||!v.email}>
                              {isCreating?"Creating…":"Create user"}
                            </Btn>
                        }
                      </td>
                    </tr>
                  );
                })}
                {filteredVendors.length===0 && (
                  <tr><td colSpan={7} style={{padding:32,textAlign:"center",color:C.t2,fontStyle:"italic"}}>No vendors match the current filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:4}}>
            <span style={{fontSize:11,color:C.t2}}>Showing {filteredVendors.length} of {vendors.length}</span>
            <span style={{fontSize:11,color:C.t2}}>📡 SAP: API_BUSINESS_PARTNER · IAS: POST /scim/v2/Users · XSUAA: VENDOR role collection</span>
          </div>
        </div>

        {/* IAS domain note */}
        <div style={{marginTop:12,padding:"10px 14px",background:C.subtle,border:`1px solid ${C.border}`,borderRadius:4,fontSize:12,color:C.t2}}>
          <strong style={{color:C.t1}}>IAS multi-domain note:</strong> Vendors may have any email domain. Domain restriction applies to self-service registration only — SCIM API provisioning accepts any domain. Configure <em>Allowed Email Domains</em> in IAS Admin Console → Applications &amp; Resources → Tenant Settings to "unrestricted" for this use case.
        </div>
      </>}

      {/* ──────────────────────────────────────────────────────────
          Tab 1 — BRM User Sync
      ────────────────────────────────────────────────────────── */}
      {tab===1 && <>

        <div style={{background:C.infoBg,border:`1px solid ${C.info}40`,borderRadius:4,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.info,display:"flex",gap:8,alignItems:"flex-start"}}>
          <SapIcon name="information" size={15} color={C.info}/>
          <span>
            <strong>No user creation needed.</strong> BRM/CB users already have IAS accounts via corporate IdP federation.
            This panel assigns the <strong>parent XSUAA role collection</strong> only.
            Company code-level scope is set in the&nbsp;
            <button onClick={()=>setTab(2)} style={{color:C.primary,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,textDecoration:"underline",padding:0}}>Role Matrix</button> tab.
          </span>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
          <Btn v="neutral" sm disabled={brmSyncing} onClick={async()=>{
            setBrmSyncing(true);
            try {
              const uList = await syncBrmUsersFromSap();
              setBrmUsers(uList);
              const roles: Record<string,string> = {};
              const sc: Record<string,Record<string,string[]>> = {};
              uList.forEach((u:any) => { roles[u.id]=u.xsuaaRole||""; sc[u.id]=u.scopes||{}; });
              setBrmRoles(roles); setScopes(sc);
              toast(`Synced ${uList.length} user(s) from SAP S/4HANA.`, "ok");
            } catch(e:any) {
              toast("Sync failed: "+e.message, "err");
            } finally { setBrmSyncing(false); }
          }}>
            <SapIcon name="synchronize" size={13} color={C.t1}/>&nbsp;{brmSyncing?"Syncing…":"Sync from SAP"}
          </Btn>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:13,tableLayout:"fixed" as const,minWidth:680}}>
              <colgroup>
                <col style={{width:170}}/><col style={{width:200}}/><col style={{width:150}}/><col style={{width:120}}/><col style={{width:90}}/><col/><col style={{width:90}}/>
              </colgroup>
              <thead>
                <tr style={{background:C.subtle}}>
                  <TH>Name</TH><TH>Email</TH><TH>Title</TH><TH>SAP User ID</TH><TH>IAS</TH><TH>XSUAA role</TH><TH right>Action</TH>
                </tr>
              </thead>
              <tbody>
                {brmUsers.map((u,i) => {
                  const isApplying = brmApplying.has(u.id);
                  const dirty = (brmRoles[u.id]||"") !== (u.xsuaaRole||"");
                  return (
                    <tr key={u.id} style={{background:i%2===0?C.card:C.subtle}}>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{fontWeight:500,color:C.t1}}>{u.name}</div>
                      </td>
                      <TD faint style={{fontSize:12}}>{u.email}</TD>
                      <TD faint style={{fontSize:12}}>{u.title||"—"}</TD>
                      <TD faint style={{fontSize:11,fontFamily:"monospace"}}>{u.sapUserId||"—"}</TD>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>
                        <Pill label={u.iasConfirmed?"Confirmed":"Not found"} c={u.iasConfirmed?C.ok:C.t2} bg={u.iasConfirmed?C.okBg:C.subtle}/>
                      </td>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>
                        <select value={brmRoles[u.id]||""} onChange={e=>setBrmRoles(p=>({...p,[u.id]:e.target.value}))}
                          style={{width:"100%",padding:"5px 8px",fontSize:12,border:`1px solid ${dirty?C.primary:C.border}`,borderRadius:2,background:C.field,color:C.t1,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
                          {XSUAA_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </td>
                      <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                        <Btn v={dirty?"primary":"ghost"} sm onClick={()=>handleAssignRole(u.id)} disabled={isApplying||!dirty}>
                          {isApplying?"Saving…":"Apply"}
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`}}>
            <span style={{fontSize:11,color:C.t2}}>📡 XSUAA: PUT /Groups/&#123;roleCollId&#125;/members · SAP: API_BUSINESSUSER for user sync</span>
          </div>
        </div>
      </>}

      {/* ──────────────────────────────────────────────────────────
          Tab 2 — BRM Role Matrix
      ────────────────────────────────────────────────────────── */}
      {tab===2 && <>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap" as const,gap:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.t1}}>Company code × user role matrix</div>
            <div style={{fontSize:12,color:C.t2,marginTop:2}}>Click cells to toggle. Save writes to UserScopes (HANA) and updates XSUAA role collections per company code.</div>
          </div>
          <Btn v={matrixDirty?"primary":"ghost"} onClick={handleSaveMatrix} disabled={matrixSaving||!matrixDirty}>
            {matrixSaving?"Saving…":matrixDirty?"Save changes":"No changes"}
          </Btn>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,overflow:"auto"}}>
          <table style={{borderCollapse:"collapse" as const,fontSize:12,whiteSpace:"nowrap" as const}}>
            <thead>
              {/* Company code group row */}
              <tr style={{background:C.subtle}}>
                <th style={{padding:"8px 14px",textAlign:"left",fontWeight:600,color:C.t2,fontSize:12,borderBottom:`1px solid ${C.border}`,position:"sticky" as const,left:0,background:C.subtle,zIndex:2,minWidth:170}}>
                  User
                </th>
                {COMPANY_CODES.map(cc => (
                  <th key={cc.v} colSpan={ROLE_DEFS.length} style={{padding:"8px 0",textAlign:"center",fontWeight:700,fontSize:12,color:C.t1,borderBottom:`1px solid ${C.border}`,borderLeft:`1px solid ${C.border}`,minWidth:ROLE_DEFS.length*36}}>
                    {cc.v}
                    <div style={{fontSize:10,fontWeight:400,color:C.t2,marginTop:1}}>{cc.l.replace(/^(PT|CV|UD) /,"")}</div>
                  </th>
                ))}
              </tr>
              {/* Role abbreviation sub-row */}
              <tr style={{background:C.subtle}}>
                <th style={{position:"sticky" as const,left:0,background:C.subtle,zIndex:2,borderBottom:`1px solid ${C.border}`,padding:"4px 0"}}/>
                {COMPANY_CODES.map(cc => ROLE_DEFS.map((r,ri) => {
                  const rc = roleColor(r.code);
                  return (
                    <th key={cc.v+r.code} title={r.label} style={{padding:"4px 2px",textAlign:"center",fontSize:10,fontWeight:600,color:rc.c,borderBottom:`1px solid ${C.border}`,borderLeft:ri===0?`1px solid ${C.border}`:"none",width:36}}>
                      {r.abbr}
                    </th>
                  );
                }))}
              </tr>
            </thead>
            <tbody>
              {brmUsers.map((u,ri) => (
                <tr key={u.id} style={{background:ri%2===0?C.card:C.subtle}}>
                  <td style={{padding:"8px 14px",position:"sticky" as const,left:0,background:ri%2===0?C.card:C.subtle,zIndex:1,borderBottom:`1px solid ${C.border}`,minWidth:170}}>
                    <div style={{fontWeight:500,color:C.t1,fontSize:13}}>{u.name}</div>
                    <div style={{fontSize:10,color:C.t2,marginTop:1}}>{u.title||u.email}</div>
                  </td>
                  {COMPANY_CODES.map(cc => ROLE_DEFS.map((r,rk) => {
                    const active = (scopes[u.id]?.[cc.v]||[]).includes(r.code);
                    const rc = roleColor(r.code);
                    return (
                      <td key={cc.v+r.code} style={{padding:"5px 2px",textAlign:"center",borderBottom:`1px solid ${C.border}`,borderLeft:rk===0?`1px solid ${C.border}`:"none"}}>
                        <button
                          onClick={()=>toggleScope(u.id,cc.v,r.code)}
                          title={`${u.name} · ${cc.v} · ${r.label}`}
                          style={{width:28,height:24,borderRadius:3,cursor:"pointer",fontSize:11,fontWeight:600,
                            border:`1px solid ${active?rc.c+"80":C.border}`,
                            background:active?rc.bg:"transparent",
                            color:active?rc.c:C.t2,
                            transition:"background .1s,border-color .1s"}}>
                          {active?"✓":""}
                        </button>
                      </td>
                    );
                  }))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add user row */}
        <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
          <Inp value={addUserEmail} onChange={e=>setAddUserEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleAddMatrixUser()}
            placeholder="Add BRM user by email (e.g. zidnaqoulan@gmail.com)"
            style={{flex:1,maxWidth:380}}/>
          <Btn v="neutral" sm onClick={handleAddMatrixUser}>+ Add to matrix</Btn>
        </div>

        {brmUsers.length===0&&<div style={{padding:"32px 0",textAlign:"center",color:C.t2,fontSize:13,fontStyle:"italic"}}>
          No BRM users yet. Add a user above or use BRM User Sync to import from SAP.
        </div>}

        {/* Legend */}
        <div style={{marginTop:10,display:"flex",gap:16,flexWrap:"wrap" as const,alignItems:"center"}}>
          {ROLE_DEFS.map(r => {
            const rc = roleColor(r.code);
            return (
              <span key={r.code} style={{fontSize:11,color:C.t2,display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:14,height:14,borderRadius:3,background:rc.bg,border:`1px solid ${rc.c}60`,display:"inline-block"}}/>
                {r.label}
              </span>
            );
          })}
          <span style={{fontSize:11,color:C.t2,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:14,height:14,borderRadius:3,background:"transparent",border:`1px solid ${C.border}`,display:"inline-block"}}/>
            No access
          </span>
          <span style={{marginLeft:"auto",fontSize:11,color:C.t2}}>📡 HANA: vendor.portal.UserScopes · XSUAA: Role collections per company code</span>
        </div>
      </>}

    </div>
  );
}
