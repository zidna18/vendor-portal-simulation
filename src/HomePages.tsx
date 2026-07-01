import { useState } from "react";
import {
  C, VENDORS,
  fmtAmt, fmtDate, idr, g2, g3, g4,
  Badge, SapIcon,
} from "./shared";

// ── shared section header ──────────────────────────────────────
const SecHdr = ({title,open,onToggle,action=null}:any) => (
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 0 10px"}}>
    <button onClick={onToggle} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}>
      <SapIcon name={open?"slim-arrow-down":"slim-arrow-right"} size={14} color={C.t1}/>
      <span style={{fontSize:15,fontWeight:600,color:C.t1}}>{title}</span>
    </button>
    <div style={{flex:1,height:1,background:C.border}}/>
    {action}
  </div>
);

// ── Vendor Dashboard ───────────────────────────────────────────
export const VendorHome = ({user,invoices,quotations,rfqs,setSection,onDrillInvoice}) => {
  const [showKpi,setShowKpi]   = useState(true);
  const [showPages,setShowPages]     = useState(true);
  const [showActivity,setShowActivity] = useState(true);

  const v  = VENDORS[user.vendorId];
  const mi = invoices.filter(i=>i.vendorId===user.vendorId);
  const mq = quotations.filter(q=>q.vendorId===user.vendorId);
  const mr = rfqs.filter(r=>r.targets.includes(user.vendorId));

  const kpis = [
    {l:"Total Invoices",   n:mi.length,                                                             sub:`${mi.filter(i=>i.status==="Confirmed").length} Confirmed`,    c:C.primary, ico:"document"},
    {l:"Pending Review",   n:mi.filter(i=>["Submitted","Under Review"].includes(i.status)).length,  sub:"Awaiting BRM action",                                          c:C.warn,    ico:"time-entry-request"},
    {l:"Open RFQs",        n:mr.filter(r=>r.status==="Open").length,                                sub:"Pending your quotation",                                       c:C.ok,      ico:"sales-quote"},
    {l:"My Quotations",    n:mq.length,                                                             sub:`${mq.filter(q=>q.status==="Accepted").length} Accepted`,       c:"#6f2da8", ico:"accept"},
  ];

  const pages = [
    {id:"profile",   ico:"employee",      t:"Vendor Profile",    sub:"Business Partner API",     bg:"#1b5fac"},
    {id:"invoice",   ico:"document-text", t:"Invoice Submission",sub:"Flexible Workflow",         bg:"#107e3e"},
    {id:"quotation", ico:"notes",         t:"Quotation & RFQ",   sub:"Sourcing & Contracting",   bg:"#b44800"},
  ];

  const btnBase:any = {border:"none",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600};

  return (
    <div style={{background:C.bg,minHeight:"100%"}}>

      {/* ── Welcome banner ── */}
      <div style={{background:"linear-gradient(100deg,#1b4f8a 0%,#0a6ed1 100%)",padding:"20px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:12}}>
        <div>
          <div style={{fontSize:18,fontWeight:600,color:"#fff",marginBottom:3}}>
            Hi {v.name.split(" ")[0]}, great to see you!
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.78)"}}>
            Vendor ID: {user.vendorId} · {v.cat} · Status:&nbsp;
            <span style={{color:"#a8e6c0",fontWeight:600}}>Active</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setSection("invoice")} style={{...btnBase,background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.35)",color:"#fff"}}>
            + New Invoice
          </button>
          <button onClick={()=>setSection("quotation")} style={{...btnBase,background:"rgba(255,255,255,0.09)",border:"1px solid rgba(255,255,255,0.22)",color:"rgba(255,255,255,0.88)",fontWeight:400}}>
            My Quotations
          </button>
        </div>
      </div>

      <div style={{padding:"0 32px"}}>

        {/* ── KPI cards ── */}
        <SecHdr title="Overview" open={showKpi} onToggle={()=>setShowKpi(p=>!p)}/>
        {showKpi&&(
          <div style={{display:"grid",gridTemplateColumns:g4(),gap:16,marginBottom:4}}>
            {kpis.map(k=>(
              <div key={k.l} style={{background:C.card,borderRadius:4,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.4}}>{k.l}</span>
                  <SapIcon name={k.ico} size={20} color={k.c} style={{opacity:0.65}}/>
                </div>
                <div style={{fontSize:36,fontWeight:700,color:k.c,lineHeight:1}}>{k.n}</div>
                <div style={{fontSize:12,color:C.t2,marginTop:8,borderTop:`1px solid ${C.border}`,paddingTop:8}}>{k.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pages tiles ── */}
        <SecHdr title="Pages" open={showPages} onToggle={()=>setShowPages(p=>!p)}/>
        {showPages&&(
          <div style={{display:"grid",gridTemplateColumns:g3(),gap:16,marginBottom:4}}>
            {pages.map(p=>(
              <div key={p.id} onClick={()=>setSection(p.id)}
                style={{background:p.bg,borderRadius:4,padding:"22px 20px",cursor:"pointer",minHeight:110,display:"flex",flexDirection:"column" as const,justifyContent:"space-between",transition:"filter .15s"}}
                onMouseEnter={e=>(e.currentTarget.style.filter="brightness(1.1)")}
                onMouseLeave={e=>(e.currentTarget.style.filter="none")}>
                <div>
                  <div style={{marginBottom:10}}><SapIcon name={p.ico} size={26} color="rgba(255,255,255,0.92)"/></div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:3}}>{p.t}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.68)"}}>{p.sub}</div>
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontWeight:600,marginTop:14}}>Open →</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Recent Invoice Activity ── */}
        <SecHdr title="Recent Invoice Activity" open={showActivity} onToggle={()=>setShowActivity(p=>!p)}
          action={<button onClick={()=>setSection("invoice")} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:600,padding:0}}>View all →</button>}/>
        {showActivity&&(
          <div style={{background:C.card,borderRadius:4,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"hidden",marginBottom:28}}>
            {mi.length===0
              ?<div style={{padding:"20px",color:C.t2,fontSize:14}}>No invoices submitted yet.</div>
              :mi.slice(0,5).map((inv,idx)=>(
              <div key={inv.id}
                onClick={()=>{onDrillInvoice(inv.invoiceNo);setSection("invoice");}}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:idx<Math.min(mi.length,5)-1?`1px solid ${C.border}`:"none",cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>(e.currentTarget.style.background=C.subtle)}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:C.infoBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <SapIcon name="document-text" size={16} color={C.primary}/>
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:C.primary}}>{inv.invoiceNo}</div>
                    <div style={{fontSize:12,color:C.t2,marginTop:2}}>{inv.desc} · {fmtDate(inv.invoiceDate)}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:20}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.t1}}>{fmtAmt(inv.amount,inv.currency)}</div>
                  <Badge s={inv.status}/>
                  <SapIcon name="slim-arrow-right" size={14} color={C.t2}/>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// ── BRM Dashboard ──────────────────────────────────────────────
export const BrmHome = ({user,invoices,quotations,rfqs,setSection}) => {
  const [showKpi,setShowKpi]       = useState(true);
  const [showInv,setShowInv]       = useState(true);
  const [showQt,setShowQt]         = useState(true);

  const pending   = invoices.filter(i=>["Submitted","Under Review"].includes(i.status));
  const confirmed = invoices.filter(i=>i.status==="Confirmed");
  const pendingQt = quotations.filter(q=>q.status==="Submitted");

  const kpis = [
    {l:"Invoices Pending",       n:pending.length,                       c:C.warn,    ico:"time-entry-request", s:"brm-invoice"},
    {l:"Invoices Confirmed",     n:confirmed.length,                     c:C.ok,      ico:"accept",             s:"brm-invoice"},
    {l:"Quotations to Evaluate", n:pendingQt.length,                     c:C.primary, ico:"sales-quote",        s:"brm-quotation"},
    {l:"Open RFQs",              n:rfqs.filter(r=>r.status==="Open").length, c:"#6f2da8", ico:"megamenu",       s:"brm-rfq"},
  ];

  return (
    <div style={{background:C.bg,minHeight:"100%"}}>

      {/* ── Welcome banner ── */}
      <div style={{background:"linear-gradient(100deg,#1b4f8a 0%,#0a6ed1 100%)",padding:"20px 32px"}}>
        <div style={{fontSize:18,fontWeight:600,color:"#fff",marginBottom:3}}>
          Hi {user.name.split(" ")[0]}, great to see you!
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.78)"}}>
          {user.title} · SAP S/4HANA Public Cloud (BTP Vendor Portal)
        </div>
      </div>

      <div style={{padding:"0 32px"}}>

        {/* ── KPI cards ── */}
        <SecHdr title="Overview" open={showKpi} onToggle={()=>setShowKpi(p=>!p)}/>
        {showKpi&&(
          <div style={{display:"grid",gridTemplateColumns:g4(),gap:16,marginBottom:4}}>
            {kpis.map(k=>(
              <div key={k.l} onClick={()=>setSection(k.s)}
                style={{background:C.card,borderRadius:4,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",padding:"18px 20px",cursor:"pointer",transition:"box-shadow .15s"}}
                onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.11)")}
                onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.08)")}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.4}}>{k.l}</span>
                  <SapIcon name={k.ico} size={20} color={k.c} style={{opacity:0.65}}/>
                </div>
                <div style={{fontSize:36,fontWeight:700,color:k.c,lineHeight:1}}>{k.n}</div>
                <div style={{fontSize:12,color:C.primary,fontWeight:600,marginTop:8,borderTop:`1px solid ${C.border}`,paddingTop:8}}>View →</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:g2(),gap:16}}>

          {/* ── Invoices awaiting action ── */}
          <div>
            <SecHdr title="Invoices Awaiting Action" open={showInv} onToggle={()=>setShowInv(p=>!p)}
              action={pending.length>5&&<button onClick={()=>setSection("brm-invoice")} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:600,padding:0}}>View all {pending.length} →</button>}/>
            {showInv&&(
              <div style={{background:C.card,borderRadius:4,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"hidden",marginBottom:4}}>
                {pending.length===0
                  ?<div style={{padding:"20px",color:C.t2,fontSize:14}}>No invoices pending review.</div>
                  :pending.slice(0,5).map((inv,idx)=>(
                  <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:idx<Math.min(pending.length,5)-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:C.warnBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <SapIcon name="time-entry-request" size={15} color={C.warn}/>
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:C.primary}}>{inv.invoiceNo}</div>
                        <div style={{fontSize:12,color:C.t2,marginTop:1}}>{inv.vendorName} · {fmtDate(inv.invoiceDate)}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right" as const}}>
                      <div style={{fontSize:13,fontWeight:700}}>{fmtAmt(inv.amount,inv.currency)}</div>
                      <div style={{marginTop:4}}><Badge s={inv.status}/></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Quotations to evaluate ── */}
          <div>
            <SecHdr title="Quotations to Evaluate" open={showQt} onToggle={()=>setShowQt(p=>!p)}
              action={pendingQt.length>5&&<button onClick={()=>setSection("brm-quotation")} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:600,padding:0}}>View all →</button>}/>
            {showQt&&(
              <div style={{background:C.card,borderRadius:4,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"hidden",marginBottom:4}}>
                {pendingQt.length===0
                  ?<div style={{padding:"20px",color:C.t2,fontSize:14}}>No quotations awaiting evaluation.</div>
                  :pendingQt.slice(0,5).map((qt,idx)=>(
                  <div key={qt.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:idx<Math.min(pendingQt.length,5)-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:C.infoBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <SapIcon name="sales-quote" size={15} color={C.primary}/>
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:C.t1,maxWidth:180,overflow:"hidden",whiteSpace:"nowrap" as const,textOverflow:"ellipsis"}}>{qt.rfqTitle}</div>
                        <div style={{fontSize:12,color:C.t2,marginTop:1}}>{qt.vendorName}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right" as const}}>
                      <div style={{fontSize:13,fontWeight:700}}>{idr(qt.totalAmt)}</div>
                      <div style={{marginTop:4}}><Badge s={qt.status}/></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
