import {
  C, VENDORS,
  fmtAmt, fmtDate, idr, pg, g2, g3, g4,
  Badge, Card, SapIcon,
} from "./shared";

// ── Vendor Dashboard ───────────────────────────────────────────
export const VendorHome = ({user,invoices,quotations,rfqs,setSection}) => {
  const v=VENDORS[user.vendorId];
  const mi=invoices.filter(i=>i.vendorId===user.vendorId);
  const mq=quotations.filter(q=>q.vendorId===user.vendorId);
  const mr=rfqs.filter(r=>r.targets.includes(user.vendorId));
  const stats=[
    {l:"Total Invoices",n:mi.length,sub:`${mi.filter(i=>i.status==="Confirmed").length} Confirmed`,c:C.primary,ico:"document"},
    {l:"Pending Review",n:mi.filter(i=>["Submitted","Under Review"].includes(i.status)).length,sub:"Awaiting BRM action",c:C.warn,ico:"time-entry-request"},
    {l:"Open RFQs",n:mr.filter(r=>r.status==="Open").length,sub:"Pending your quotation",c:C.ok,ico:"request-for-quotation"},
    {l:"My Quotations",n:mq.length,sub:`${mq.filter(q=>q.status==="Accepted").length} Accepted`,c:C.gold,ico:"accept"},
  ];
  const tiles=[
    {id:"profile",  ico:"employee",      t:"Vendor Profile",    d:"View company info, bank details, and tax registration sourced from SAP Business Partner API", accent:C.info},
    {id:"invoice",  ico:"document-text", t:"Invoice Submission", d:"Submit invoices with mandatory legal documents. Track status from submission to SAP posting.",  accent:C.ok},
    {id:"quotation",ico:"notes",         t:"Quotation & RFQ",    d:"View RFQs sent by BRM and submit competitive quotations with pricing and commercial terms.",     accent:C.warn},
  ];
  return (
    <div style={{padding:pg(),maxWidth:1100,margin:"0 auto"}}>
      <div style={{marginBottom:22,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:22,fontWeight:700,color:C.t1}}>Welcome, {v.name}</div>
        <div style={{fontSize:13,color:C.t2,marginTop:4}}>Vendor ID: {user.vendorId} · {v.cat} · Status: <span style={{color:C.ok,fontWeight:600}}>Active</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:g4(),gap:16,marginBottom:22}}>
        {stats.map(s=>(
          <div key={s.l} style={{background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:"16px 18px",borderLeft:`4px solid ${s.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:12,color:C.t2,fontWeight:600,textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>{s.l}</div>
                <div style={{fontSize:32,fontWeight:700,color:s.c,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:12,color:C.t2,marginTop:6}}>{s.sub}</div>
              </div>
              <SapIcon name={s.ico} size={24} color={s.c} style={{opacity:0.75}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:g3(),gap:16,marginBottom:18}}>
        {tiles.map(t=>(
          <div key={t.id} onClick={()=>setSection(t.id)} style={{background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:22,cursor:"pointer",transition:"box-shadow .2s,transform .15s",borderTop:`3px solid ${t.accent}`}}>
            <div style={{marginBottom:12}}><SapIcon name={t.ico} size={28} color={t.accent}/></div>
            <div style={{fontSize:15,fontWeight:700,color:C.t1,marginBottom:8}}>{t.t}</div>
            <div style={{fontSize:13,color:C.t2,lineHeight:1.6}}>{t.d}</div>
            <div style={{marginTop:16,color:t.accent,fontSize:13,fontWeight:600}}>Open →</div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.t1}}>Recent Invoice Activity</div>
        {mi.length===0?<div style={{color:C.t2,fontSize:14}}>No invoices submitted yet.</div>:mi.slice(0,4).map(inv=>(
          <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
            <div><div style={{fontWeight:600,fontSize:14}}>{inv.invoiceNo}</div><div style={{fontSize:12,color:C.t2,marginTop:2}}>{inv.desc} · {fmtDate(inv.invoiceDate)}</div></div>
            <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
              <div style={{fontSize:13,fontWeight:700}}>{fmtAmt(inv.amount, inv.currency)}</div>
              <Badge s={inv.status}/>
            </div>
          </div>
        ))}
        <button onClick={()=>setSection("invoice")} style={{marginTop:12,background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:13,fontWeight:600,padding:0}}>View all invoices →</button>
      </Card>
    </div>
  );
};

// ── BRM Dashboard ──────────────────────────────────────────────
export const BrmHome = ({user,invoices,quotations,rfqs,setSection}) => {
  const pending=invoices.filter(i=>["Submitted","Under Review"].includes(i.status));
  const confirmed=invoices.filter(i=>i.status==="Confirmed");
  const pendingQt=quotations.filter(q=>q.status==="Submitted");
  const stats=[
    {l:"Invoices Pending",n:pending.length,c:C.warn,ico:"time-entry-request",s:"brm-invoice"},
    {l:"Invoices Confirmed",n:confirmed.length,c:C.ok,ico:"accept",s:"brm-invoice"},
    {l:"Quotations to Evaluate",n:pendingQt.length,c:C.primary,ico:"request-for-quotation",s:"brm-quotation"},
    {l:"Open RFQs",n:rfqs.filter(r=>r.status==="Open").length,c:C.gold,ico:"megamenu",s:"brm-rfq"},
  ];
  return (
    <div style={{padding:pg(),maxWidth:1100,margin:"0 auto"}}>
      <div style={{marginBottom:22,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:22,fontWeight:700,color:C.t1}}>Procurement Dashboard</div>
        <div style={{fontSize:13,color:C.t2,marginTop:4}}>Welcome, {user.name} · {user.title} · SAP S/4HANA Public Cloud (BTP Vendor Portal)</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:g4(),gap:16,marginBottom:22}}>
        {stats.map(s=>(
          <div key={s.l} onClick={()=>setSection(s.s)} style={{background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:"16px 18px",cursor:"pointer",borderLeft:`4px solid ${s.c}`,transition:"box-shadow .15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontSize:12,color:C.t2,fontWeight:600,textTransform:"uppercase",letterSpacing:.4}}>{s.l}</div>
              <SapIcon name={s.ico} size={22} color={s.c} style={{opacity:0.7}}/>
            </div>
            <div style={{fontSize:32,fontWeight:700,color:s.c,lineHeight:1,marginBottom:8}}>{s.n}</div>
            <div style={{fontSize:12,color:C.primary,fontWeight:600}}>View →</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:g2(),gap:16}}>
        <Card>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.t1,display:"flex",alignItems:"center",gap:7}}><SapIcon name="time-entry-request" size={16} color={C.warn}/> Invoices Awaiting Action</div>
          {pending.length===0?<div style={{color:C.t2,fontSize:14}}>No invoices pending review.</div>:pending.slice(0,5).map(inv=>(
            <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{fontWeight:600,fontSize:14}}>{inv.invoiceNo}</div><div style={{fontSize:12,color:C.t2,marginTop:2}}>{inv.vendorName} · {fmtDate(inv.invoiceDate)}</div></div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}><div style={{fontSize:13,fontWeight:700}}>{fmtAmt(inv.amount, inv.currency)}</div><Badge s={inv.status}/></div>
            </div>
          ))}
          {pending.length>5&&<button onClick={()=>setSection("brm-invoice")} style={{marginTop:12,background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:13,fontWeight:600,padding:0}}>View all {pending.length} pending →</button>}
        </Card>
        <Card>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.t1,display:"flex",alignItems:"center",gap:7}}><SapIcon name="request-for-quotation" size={16} color={C.primary}/> Quotations to Evaluate</div>
          {pendingQt.length===0?<div style={{color:C.t2,fontSize:14}}>No quotations awaiting evaluation.</div>:pendingQt.slice(0,5).map(qt=>(
            <div key={qt.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{fontWeight:600,fontSize:14,maxWidth:180,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{qt.rfqTitle}</div><div style={{fontSize:12,color:C.t2,marginTop:2}}>{qt.vendorName}</div></div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}><div style={{fontSize:13,fontWeight:700}}>{idr(qt.totalAmt)}</div><Badge s={qt.status}/></div>
            </div>
          ))}
          {pendingQt.length>5&&<button onClick={()=>setSection("brm-quotation")} style={{marginTop:12,background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:13,fontWeight:600,padding:0}}>View all →</button>}
        </Card>
      </div>
    </div>
  );
};
