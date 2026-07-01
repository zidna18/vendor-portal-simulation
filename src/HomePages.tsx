import { useState } from "react";
import {
  C, VENDORS,
  fmtAmt, fmtDate, idr, g2, g3, g4,
  Badge, SapIcon, Btn, TA, Modal,
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
export const BrmHome = ({user,invoices,quotations,rfqs,setSection,onDrillInvoice}) => {
  const [showKpi,setShowKpi]       = useState(true);
  const [showPages,setShowPages]   = useState(true);
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

        {/* ── Pages tiles ── */}
        <SecHdr title="Pages" open={showPages} onToggle={()=>setShowPages(p=>!p)}/>
        {showPages&&(
          <div style={{display:"grid",gridTemplateColumns:g3(),gap:16,marginBottom:4}}>
            {[
              {id:"brm-invoice",   ico:"document-text", t:"Invoice Management",   sub:"Supplier Invoice API",      bg:"#107e3e"},
              {id:"brm-quotation", ico:"notes",         t:"Quotation Management", sub:"Sourcing & Contracting",    bg:"#b44800"},
              {id:"brm-rfq",       ico:"megamenu",      t:"RFQ Management",       sub:"Request for Quotation",     bg:"#1b5fac"},
            ].map(p=>(
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
                  <div key={inv.id} onClick={()=>onDrillInvoice(inv.invoiceNo)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:idx<Math.min(pending.length,5)-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}
                    onMouseEnter={e=>(e.currentTarget.style.background=C.hover)} onMouseLeave={e=>(e.currentTarget.style.background="")}>
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

// ── Approver Dashboard ─────────────────────────────────────────
export const ApproverHome = ({user, quotations, setQuotations, rfqs, setRfqs, setSection}) => {
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const pendingRfqs = rfqs.filter(r => r.status === "Pending Approval");
  const closedRfqs  = rfqs.filter(r => r.status === "Closed");
  const totalPendingVal = pendingRfqs.reduce((s,r) => s + (r.estVal||0), 0);
  const totalClosedVal  = closedRfqs.reduce((s,r)  => s + (r.estVal||0), 0);

  const rfqPriority = (r) => {
    const v = r.estVal||0;
    if (v >= 2000000000) return {l:"High Priority",   c:"#bb0000", bg:"#fdecea"};
    if (v >= 500000000)  return {l:"Medium Priority", c:"#e76500", bg:"#fef3e2"};
    return                     {l:"Low Priority",     c:"#107e3e", bg:"#e6f4ea"};
  };

  const highPri = pendingRfqs.filter(r=>(r.estVal||0)>=2000000000);
  const medPri  = pendingRfqs.filter(r=>{const v=r.estVal||0;return v>=500000000&&v<2000000000;});
  const lowPri  = pendingRfqs.filter(r=>(r.estVal||0)<500000000);

  const closureRate = (closedRfqs.length + pendingRfqs.length) > 0
    ? Math.round(closedRfqs.length / (closedRfqs.length + pendingRfqs.length) * 100) : 0;

  const doReject = () => {
    if (!notes.trim()) { alert("Please enter rejection notes."); return; }
    const today = new Date().toISOString().split("T")[0];
    setRfqs((prev:any[]) => prev.map(r =>
      r.id === rejectModal.id ? {...r, status:"Complete", rejectedByApprover:true, approverRejNotes:notes, approverRejAt:today} : r
    ));
    setRejectModal(null); setNotes("");
  };

  const kpis = [
    {l:"Pending Approval", n:pendingRfqs.length,  c:"#6f2da8", ico:"approvals",   s:"apr-rfq"},
    {l:"Closed (Winner Decided)", n:closedRfqs.length, c:"#107e3e", ico:"accept", s:"apr-rfq"},
    {l:"All RFQs",         n:rfqs.length,          c:C.primary, ico:"document",   s:"apr-rfq"},
    {l:"Total Pending Value", n:idr(totalPendingVal), c:"#e76500", ico:"money-bills", s:"apr-rfq", big:true},
  ];

  // Buyer breakdown from submitted-for-approval RFQs
  const buyerBreakdown = Object.values(
    rfqs.filter(r=>r.submittedForApprovalBy).reduce((acc:any, r) => {
      const k = r.submittedForApprovalBy||"Unknown";
      if (!acc[k]) acc[k]={name:k, pending:0, closed:0, total:0, val:0};
      acc[k].total++;
      acc[k].val += r.estVal||0;
      if (r.status==="Pending Approval") acc[k].pending++;
      if (r.status==="Closed") acc[k].closed++;
      return acc;
    }, {})
  ) as any[];

  return (
    <div style={{background:C.bg, minHeight:"100%"}}>

      {/* Welcome banner */}
      <div style={{background:"linear-gradient(100deg,#4a1a7c 0%,#6f2da8 100%)", padding:"20px 32px"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",marginBottom:2}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:3}}>Hi {user.name.split(" ")[0]}!</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.78)"}}>{user.title} · Tender Committee – RFQ Approval</div>
      </div>

      <div style={{padding:"0 32px"}}>

        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:g4(),gap:14,padding:"18px 0 4px"}}>
          {kpis.map(k=>(
            <div key={k.l} onClick={()=>setSection(k.s)}
              style={{background:C.card,borderRadius:4,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"16px 18px",cursor:"pointer",transition:"box-shadow .15s"}}
              onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.11)")}
              onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.07)")}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.4}}>{k.l}</span>
                <SapIcon name={k.ico} size={18} color={k.c} style={{opacity:.7}}/>
              </div>
              <div style={{fontSize:(k as any).big?18:34,fontWeight:700,color:k.c,lineHeight:1}}>{k.n}</div>
              <div style={{fontSize:12,color:C.primary,fontWeight:600,marginTop:8,borderTop:`1px solid ${C.border}`,paddingTop:8}}>View all →</div>
            </div>
          ))}
        </div>

        {/* To-Dos header */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0 10px"}}>
          <span style={{fontSize:15,fontWeight:700,color:C.t1}}>Pending RFQ Approvals</span>
          <span style={{fontSize:12,color:"#fff",background:"#6f2da8",borderRadius:10,padding:"1px 9px",fontWeight:700}}>{pendingRfqs.length}</span>
          <div style={{flex:1,height:1,background:C.border}}/>
          {pendingRfqs.length>0&&<button onClick={()=>setSection("apr-rfq")} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:600,padding:0}}>View All →</button>}
        </div>

        {/* Horizontal scroll row — 5 RFQ cards visible */}
        {pendingRfqs.length === 0 ? (
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:"28px 20px",textAlign:"center" as const,color:C.t2,fontSize:14,marginBottom:20}}>
            <SapIcon name="accept" size={28} color="#107e3e"/><br/>
            <span style={{marginTop:8,display:"block"}}>All clear! No RFQs pending your approval.</span>
          </div>
        ) : (
          <div style={{display:"flex",gap:14,overflowX:"auto" as const,paddingBottom:12,marginBottom:4,scrollSnapType:"x mandatory" as const,WebkitOverflowScrolling:"touch" as const}}>
            {pendingRfqs.map(rfq => {
              const p = rfqPriority(rfq);
              const qts = quotations.filter(q=>q.rfqId===rfq.id);
              return (
                <div key={rfq.id} style={{flex:"0 0 calc(20% - 12px)",minWidth:260,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column" as const,overflow:"hidden",scrollSnapAlign:"start" as const,transition:"box-shadow .15s"}}
                  onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.13)")}
                  onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.08)")}>

                  {/* Priority stripe */}
                  <div style={{height:4,background:p.c}}/>

                  {/* Card body */}
                  <div onClick={()=>setSection("apr-rfq")} style={{padding:"14px 16px",flex:1,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                      <div style={{width:32,height:32,borderRadius:4,background:"#f3eeff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <SapIcon name="approvals" size={16} color="#6f2da8"/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.t1,marginBottom:2,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.id}</div>
                        <span style={{fontSize:10,fontWeight:700,color:p.c,background:p.bg,padding:"1px 7px",borderRadius:8}}>{p.l}</span>
                      </div>
                    </div>

                    <div style={{fontSize:12,fontWeight:600,color:C.t1,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}} title={rfq.title}>{rfq.title}</div>

                    <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:10,color:C.t2}}>Est. Value</span>
                        <span style={{fontSize:12,fontWeight:700,color:C.t1}}>{idr(rfq.estVal||0)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:10,color:C.t2}}>Submitted by</span>
                        <span style={{fontSize:11,fontWeight:600,color:C.t1,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{rfq.submittedForApprovalBy||"—"}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:10,color:C.t2}}>Date</span>
                        <span style={{fontSize:11,color:C.t1}}>{fmtDate(rfq.submittedForApprovalAt||"")}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontSize:10,color:C.t2}}>Quotations</span>
                        <span style={{fontSize:11,fontWeight:700,color:C.primary}}>{qts.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{display:"flex",gap:6,padding:"8px 12px",borderTop:`1px solid ${C.border}`,background:C.subtle}}>
                    <button onClick={e=>{e.stopPropagation();setRejectModal(rfq);setNotes("");}}
                      style={{flex:1,padding:"5px 0",fontSize:12,fontWeight:600,color:"#bb0000",background:"#fdecea",border:"1px solid #f5c6c6",borderRadius:3,cursor:"pointer",fontFamily:"inherit"}}>Reject</button>
                    <button onClick={e=>{e.stopPropagation();setSection("apr-rfq");}}
                      style={{flex:1,padding:"5px 0",fontSize:12,fontWeight:600,color:"#6f2da8",background:"#f3eeff",border:"1px solid #c9aaef",borderRadius:3,cursor:"pointer",fontFamily:"inherit"}}>Review →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insight tiles row */}
        <div style={{display:"grid",gridTemplateColumns:g2(),gap:16,marginTop:20,marginBottom:28}}>

          {/* Tile 1: RFQ Approval Overview */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
              <SapIcon name="bar-chart" size={16} color="#6f2da8"/>
              <span style={{fontWeight:700,fontSize:14,color:C.t1}}>Approval Overview & Risk</span>
            </div>
            <div style={{padding:"16px 20px"}}>
              {/* Closure rate bar */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:C.t2,fontWeight:600}}>RFQ Closure Rate</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#107e3e"}}>{closureRate}%</span>
                </div>
                <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${closureRate}%`,background:"linear-gradient(90deg,#107e3e,#34a853)",borderRadius:4,transition:"width .4s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:C.t2}}>
                  <span>{closedRfqs.length} closed</span><span>{pendingRfqs.length} pending</span>
                </div>
              </div>

              {/* Priority breakdown */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.4,marginBottom:8}}>Pending by Priority</div>
                {[{l:"High Priority",n:highPri.length,v:highPri.reduce((s,r)=>s+(r.estVal||0),0),c:"#bb0000",bg:"#fdecea"},
                  {l:"Medium Priority",n:medPri.length,v:medPri.reduce((s,r)=>s+(r.estVal||0),0),c:"#e76500",bg:"#fef3e2"},
                  {l:"Low Priority",n:lowPri.length,v:lowPri.reduce((s,r)=>s+(r.estVal||0),0),c:"#107e3e",bg:"#e6f4ea"}].map(row=>(
                  <div key={row.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",background:row.bg,borderRadius:3,marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:row.c}}/>
                      <span style={{fontSize:12,color:C.t1}}>{row.l}</span>
                      <span style={{fontSize:11,fontWeight:700,color:row.c,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"0 6px"}}>{row.n}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:C.t1}}>{idr(row.v)}</span>
                  </div>
                ))}
              </div>

              {/* Total at risk */}
              <div style={{background:"#fff8e1",border:"1px solid #ffe082",borderRadius:4,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <SapIcon name="alert" size={16} color="#e76500"/>
                <div>
                  <div style={{fontSize:11,color:"#b26a00",fontWeight:700}}>Total RFQ Value Pending Decision</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#e76500"}}>{idr(totalPendingVal)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 2: Buyer Submission Summary */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
              <SapIcon name="group" size={16} color="#6f2da8"/>
              <span style={{fontWeight:700,fontSize:14,color:C.t1}}>Buyer Submission Summary</span>
            </div>
            <div style={{padding:"16px 20px"}}>
              {/* Value closed vs pending */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[{l:"Closed Value",v:idr(totalClosedVal),c:"#107e3e",bg:"#e6f4ea",ico:"accept"},
                  {l:"Pending Value",v:idr(totalPendingVal),c:"#6f2da8",bg:"#f3eeff",ico:"approvals"}].map(t=>(
                  <div key={t.l} style={{background:t.bg,borderRadius:4,padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <SapIcon name={t.ico} size={12} color={t.c}/>
                      <span style={{fontSize:10,fontWeight:700,color:t.c,textTransform:"uppercase" as const,letterSpacing:.3}}>{t.l}</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:t.c}}>{t.v}</div>
                  </div>
                ))}
              </div>

              {/* Per-buyer breakdown */}
              <div style={{fontSize:12,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.4,marginBottom:8}}>RFQs Submitted by Buyer</div>
              {buyerBreakdown.length===0&&<div style={{color:C.t2,fontSize:12,fontStyle:"italic"}}>No data yet.</div>}
              <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                {buyerBreakdown.map((bd:any)=>(
                  <div key={bd.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:3,background:C.subtle}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:"#e8f0fb",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <SapIcon name="employee" size={14} color={C.primary}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.t1,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{bd.name}</div>
                      <div style={{fontSize:11,color:C.t2,marginTop:1}}>{bd.total} RFQ{bd.total!==1?"s":""} · {idr(bd.val)}</div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      {bd.pending>0&&<span style={{fontSize:10,fontWeight:700,color:"#6f2da8",background:"#f3eeff",borderRadius:8,padding:"2px 7px"}}>{bd.pending} pending</span>}
                      {bd.closed>0&&<span style={{fontSize:10,fontWeight:700,color:"#107e3e",background:"#e6f4ea",borderRadius:8,padding:"2px 7px"}}>✓ {bd.closed} closed</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Reject modal */}
      {rejectModal&&(
        <Modal title={`Reject RFQ – Return to Buyer`} onClose={()=>setRejectModal(null)} width={480}>
          <div style={{marginBottom:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px",marginBottom:14,padding:"12px 14px",background:C.subtle,borderRadius:4,border:`1px solid ${C.border}`}}>
              <div><div style={{fontSize:11,color:C.t2}}>RFQ ID</div><div style={{fontSize:13,fontWeight:600,color:C.t1}}>{rejectModal.id}</div></div>
              <div><div style={{fontSize:11,color:C.t2}}>Submitted By</div><div style={{fontSize:13,fontWeight:600,color:C.t1}}>{rejectModal.submittedForApprovalBy||"—"}</div></div>
              <div><div style={{fontSize:11,color:C.t2}}>Title</div><div style={{fontSize:13,color:C.t1}}>{rejectModal.title}</div></div>
              <div><div style={{fontSize:11,color:C.t2}}>Est. Value</div><div style={{fontSize:13,fontWeight:700,color:C.t1}}>{idr(rejectModal.estVal||0)}</div></div>
            </div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Rejection Notes <span style={{color:"#bb0000"}}>*</span></label>
            <TA value={notes} onChange={setNotes} placeholder="Enter reason for rejection…" rows={4}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn v="ghost" onClick={()=>setRejectModal(null)}>Cancel</Btn>
            <Btn v="danger" onClick={doReject}>Confirm Reject</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};
