import { useState, useRef, useEffect, Fragment } from "react";
import {
  C, VENDORS, COMPANY_CODES, CURRENCIES, ccName, PURCHASING_GROUPS,
  fmtDate, idr, uid, pg, mob,
  g2, g3,
  Badge, Btn, Inp, AmtInp, DateInp, Sel, TA, Lbl, Val, Sep, Modal,
  FilterBar, FioriBar, FField, SapIcon, Card, Th, Td,
  ValueHelpInp, ValueHelpDialog, DateRangePicker, DatePickerInp,
} from "./shared";

const PAYMENT_TERMS = [
  {v:"Net 14 Days",l:"Net 14 Days"},{v:"Net 30 Days",l:"Net 30 Days"},{v:"Net 45 Days",l:"Net 45 Days"},
  {v:"Net 60 Days",l:"Net 60 Days"},{v:"Net 90 Days",l:"Net 90 Days"},{v:"30/2 Net 60",l:"30/2 Net 60 (2% Early Pay)"},
  {v:"COD",l:"Cash on Delivery"},{v:"Advance 50%",l:"50% Advance, 50% on Delivery"},{v:"Advance 100%",l:"100% Advance Payment"},
];
const INCOTERMS = [
  {v:"EXW",l:"EXW – Ex Works"},{v:"FCA",l:"FCA – Free Carrier"},{v:"CPT",l:"CPT – Carriage Paid To"},
  {v:"CIP",l:"CIP – Carriage & Insurance Paid"},{v:"DAP",l:"DAP – Delivered at Place"},{v:"DPU",l:"DPU – Delivered at Place Unloaded"},
  {v:"DDP",l:"DDP – Delivered Duty Paid"},{v:"FAS",l:"FAS – Free Alongside Ship"},{v:"FOB",l:"FOB – Free on Board"},
  {v:"CFR",l:"CFR – Cost & Freight"},{v:"CIF",l:"CIF – Cost, Insurance & Freight"},
  {v:"N/A – Service Contract",l:"N/A – Service Contract"},{v:"N/A – Rental Contract",l:"N/A – Rental Contract"},{v:"N/A – Professional Service",l:"N/A – Professional Service"},
];
const pgLabel = code => { const p = PURCHASING_GROUPS.find(x=>x.v===code); return p ? `${p.v} – ${p.l}` : (code||"—"); };
const VDR_COLORS = ["#0a6ed1","#107e3e","#8b5cf6","#d97706","#dc2626","#0891b2"];

const AWARD_RATIONALE_OPTS = [
  "Best overall score", "Competitive price", "Lowest net total", "Preferred vendor",
  "Best warranty", "Fastest delivery", "Best payment terms", "Backup vendor",
  "Risk mitigation", "Strategic supplier", "Local content (TKDN)", "Technical compliance",
  "Price too high", "Low evaluation score", "Technical non-compliance", "Short validity",
  "Capacity insufficient", "Delivery too slow"
];

const SERVICE_RATIONALE_OPTS = [
  "Highest score", "Best SLA response time", "Full parts + labor warranty",
  "Proven track record", "Best price", "Preferred vendor", "Local presence",
  "Technical expertise", "Price too high", "Low score", "SLA not meeting requirement", "Limited coverage"
];

// ── Quotation Form Modal ───────────────────────────────────────
export const QtFormModal = ({rfq,qt,onSave,onClose,vendorId,vendorName}) => {
  const [f,setF]=useState(qt?{...qt}:{
    rfqId:rfq.id,rfqTitle:rfq.title,vendorId,vendorName,submittedDate:"",validUntil:"",notes:"",status:"Draft",files:[],
    salesPerson:"",purchGroup:"",termsOfPayment:"",deliveryTerms:"",leadTime:"",warrantyPeriod:"",
    priceConditions:{discount:0,surcharge:0,freight:0,insurance:0},
    totalAmt:rfq.items.reduce((s,i)=>s+i.estPrice*i.qty,0),
    items:rfq.items.map(i=>({...i,unitPrice:i.estPrice,total:i.estPrice*i.qty})),
  });
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const updItem=(idx,k,val)=>{
    const items=f.items.map((it,i)=>{if(i!==idx)return it;const u={...it,[k]:Number(val)};u.total=u.qty*u.unitPrice;return u;});
    setF(p=>({...p,items,totalAmt:items.reduce((sum,it)=>sum+it.total,0)}));
  };
  const save=draft=>{
    onSave({...f,id:f.id||`QT-${uid()}`,status:draft?"Draft":"Submitted",submittedDate:draft?"":new Date().toISOString().split("T")[0],files:f.files.length===0&&!draft?["quotation.pdf"]:f.files});
  };
  return (
    <Modal title={qt?`Edit Quotation: ${rfq.title}`:`Submit Quotation: ${rfq.title}`} onClose={onClose} width={740}>
      <div style={{padding:"8px 12px",background:C.infoBg,borderRadius:4,marginBottom:14,fontSize:12}}>
        <strong>RFQ:</strong> {rfq.id} · Closing: {rfq.closingDate} · Est. Value: {idr(rfq.estVal)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:12}}>
        <div><Lbl>Valid Until *</Lbl><DateInp value={f.validUntil} onChange={v=>s("validUntil",v)}/></div>
        <div><Lbl>Total Amount (IDR)</Lbl><Inp value={idr(f.totalAmt)} onChange={()=>{}}/></div>
      </div>
      <div style={{marginBottom:14}}>
        <Lbl>Line Items</Lbl>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginTop:6}}>
          <thead><tr style={{background:C.subtle}}>{["#","Description","Qty","UoM","Unit Price (IDR)","Total"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.t2}}>{h}</th>)}</tr></thead>
          <tbody>{f.items.map((it,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"6px 10px"}}>{it.no}</td>
              <td style={{padding:"6px 10px"}}>{it.desc}</td>
              <td style={{padding:"6px 10px"}}>{it.qty}</td>
              <td style={{padding:"6px 10px"}}>{it.uom}</td>
              <td style={{padding:"4px 10px"}}><Inp type="number" value={f.items[i].unitPrice} onChange={v=>updItem(i,"unitPrice",v)} style={{padding:"4px 7px"}}/></td>
              <td style={{padding:"6px 10px",fontWeight:700}}>{idr(it.total)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.8,marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>Commercial Terms</div>
        <div style={{display:"grid",gridTemplateColumns:g2(),gap:10,marginBottom:10}}>
          <div><Lbl>Sales Person / Contact</Lbl><Inp value={f.salesPerson||""} onChange={v=>s("salesPerson",v)} placeholder="Contact name"/></div>
          <div><Lbl>Purchasing Group</Lbl><Sel value={f.purchGroup||""} onChange={v=>s("purchGroup",v)} opts={[{v:"",l:"— Select —"},...PURCHASING_GROUPS.map(p=>({v:p.v,l:`${p.v} – ${p.l}`}))]}/></div>
          <div><Lbl>Terms of Payment</Lbl><Sel value={f.termsOfPayment||""} onChange={v=>s("termsOfPayment",v)} opts={[{v:"",l:"— Select —"},...PAYMENT_TERMS]}/></div>
          <div><Lbl>Delivery Terms (Incoterms)</Lbl><Sel value={f.deliveryTerms||""} onChange={v=>s("deliveryTerms",v)} opts={[{v:"",l:"— Select —"},...INCOTERMS]}/></div>
          <div><Lbl>Lead Time</Lbl><Inp value={f.leadTime||""} onChange={v=>s("leadTime",v)} placeholder="e.g. 14 days"/></div>
          <div><Lbl>Warranty Period</Lbl><Inp value={f.warrantyPeriod||""} onChange={v=>s("warrantyPeriod",v)} placeholder="e.g. 1 year"/></div>
        </div>
        <div style={{background:C.subtle,borderRadius:5,padding:"10px 12px",marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:8}}>Price Conditions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            <div><Lbl>Discount (%)</Lbl><AmtInp value={f.priceConditions?.discount||0} onChange={v=>s("priceConditions",{...f.priceConditions,discount:Number(v)})}/></div>
            <div><Lbl>Surcharge (%)</Lbl><AmtInp value={f.priceConditions?.surcharge||0} onChange={v=>s("priceConditions",{...f.priceConditions,surcharge:Number(v)})}/></div>
            <div><Lbl>Freight Cost (IDR)</Lbl><AmtInp value={f.priceConditions?.freight||0} onChange={v=>s("priceConditions",{...f.priceConditions,freight:Number(v)})}/></div>
            <div><Lbl>Insurance (IDR)</Lbl><AmtInp value={f.priceConditions?.insurance||0} onChange={v=>s("priceConditions",{...f.priceConditions,insurance:Number(v)})}/></div>
          </div>
        </div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Notes</Lbl><TA value={f.notes} onChange={v=>s("notes",v)} placeholder="Additional notes…"/></div>
      <div style={{padding:12,background:C.subtle,borderRadius:6,border:`1px dashed ${C.border}`}}>
        <Lbl>Attachments</Lbl>
        {(f.files||[]).map((a,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:C.card,borderRadius:4,marginBottom:5,border:`1px solid ${C.border}`,fontSize:12}}>
            <span style={{display:"flex",alignItems:"center",gap:5}}><SapIcon name="document" size={12} color={C.t2}/>{a}</span>
            <button onClick={()=>s("files",f.files.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:11}}>Remove</button>
          </div>
        ))}
        <Btn v="neutral" sm onClick={()=>s("files",[...f.files,`quotation_doc_${uid()}.pdf`])}>+ Upload Document</Btn>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
        <Btn v="neutral" onClick={onClose}>Cancel</Btn>
        <Btn v="ghost" onClick={()=>save(true)}>Save as Draft</Btn>
        <Btn v="primary" onClick={()=>save(false)}>Submit Quotation</Btn>
      </div>
    </Modal>
  );
};

// ── Vendor Quotation ───────────────────────────────────────────
export const VendorQuotation = ({user,quotations,setQuotations,rfqs}) => {
  const [tab,setTab]=useState("rfq"); const [quotingRfq,setQR]=useState(null); const [editingQt,setEQ]=useState(null); const [viewQt,setVQ]=useState(null); const [flt,setFlt]=useState("All");
  const myRfqs=rfqs.filter(r=>r.targets.includes(user.vendorId)&&r.status!=="Created");
  const mine=quotations.filter(q=>q.vendorId===user.vendorId);
  const mineF=mine.filter(q=>flt==="All"||q.status===flt);
  const quoted=rfqId=>mine.find(q=>q.rfqId===rfqId);
  const save=qt=>{setQuotations(p=>p.find(q=>q.id===qt.id)?p.map(q=>q.id===qt.id?qt:q):[...p,qt]);setQR(null);setEQ(null);};
  const withdraw=id=>{if(window.confirm("Withdraw quotation?"))setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Withdrawn"}:q));};
  const [inviteStatus,setInviteStatus]=useState<{[rfqId:string]:"accepted"|"declined"}>({});
  const acceptInvite=(rfqId)=>setInviteStatus(p=>({...p,[rfqId]:"accepted"}));
  const declineInvite=(rfqId)=>setInviteStatus(p=>({...p,[rfqId]:"declined"}));
  return (
    <div style={{padding:pg()}}>
      <div style={{marginBottom:18,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:20,fontWeight:700,color:C.t1}}>Quotation & RFQ</div>
        <div style={{fontSize:12,color:C.t2,marginTop:4}}>📡 RFQ: SAP Purchasing API (A_PurchaseRequisition) · Quotation: Custom CDS Table on BTP</div>
      </div>
      <div style={{display:"flex",gap:0,marginBottom:18,borderBottom:`1px solid ${C.border}`}}>
        {[{id:"rfq",l:`Open RFQs (${myRfqs.filter(r=>r.status==="Open").length})`},{id:"my",l:`My Quotations (${mine.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 18px",cursor:"pointer",border:"none",background:"none",fontFamily:"inherit",fontSize:14,fontWeight:tab===t.id?700:400,color:tab===t.id?C.primary:C.t2,borderBottom:`2px solid ${tab===t.id?C.primary:"transparent"}`}}>{t.l}</button>
        ))}
      </div>
      {tab==="rfq"&&(
        <div>{myRfqs.map(rfq=>{
          const q=quoted(rfq.id);
          return(
            <Card key={rfq.id}>
              {rfq.status==="Open"&&!q&&!inviteStatus[rfq.id]&&(
                <div style={{background:C.infoBg,border:`1px solid ${C.info}`,borderRadius:6,padding:"10px 14px",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#0854a0",marginBottom:4}}>📨 New Invitation to Quote</div>
                  <div style={{fontSize:11,color:C.t2,marginBottom:8}}>Invitation No: {rfq.invitationNo||rfq.id} · Submission Deadline: {fmtDate(rfq.closingDate)}</div>
                  <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                    <Btn v="ghost" sm onClick={()=>declineInvite(rfq.id)}>Decline</Btn>
                    <Btn v="primary" sm onClick={()=>acceptInvite(rfq.id)}>Accept Invitation</Btn>
                  </div>
                </div>
              )}
              {rfq.status==="Open"&&!q&&inviteStatus[rfq.id]==="declined"&&(
                <div style={{fontSize:11,color:C.t2,fontStyle:"italic",marginBottom:6}}>⊘ Invitation declined – you have opted not to submit a quotation for this RFQ.</div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,fontSize:14}}>{rfq.title}</span>
                    <Badge s={rfq.status}/>
                    {q&&<span style={{fontSize:11,color:C.ok,fontWeight:700}}>✓ Quoted · {idr(q.totalAmt)}</span>}
                  </div>
                  <div style={{fontSize:11,color:C.t2,marginBottom:6}}>{rfq.id} · {rfq.cat} · Posted: {fmtDate(rfq.postedDate)} · Closing: <strong>{fmtDate(rfq.closingDate)}</strong></div>
                  <div style={{fontSize:12,color:C.t1,marginBottom:8}}>{rfq.desc}</div>
                  <div style={{fontSize:11,color:C.t2}}>{rfq.items.length} items · Est. {idr(rfq.estVal)}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",marginLeft:16}}>
                  {rfq.status==="Open"&&!q&&inviteStatus[rfq.id]==="accepted"&&<Btn onClick={()=>setQR(rfq)}>Submit Quotation</Btn>}
                  {rfq.status==="Open"&&q&&<Btn v="ghost" onClick={()=>{setEQ(q);setQR(rfq);}}>Edit Quotation</Btn>}
                </div>
              </div>
              <Sep/>
              <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                <thead><tr style={{color:C.t2}}>{["Description","Qty","UoM","Est. Unit Price"].map(h=><th key={h} style={{textAlign:"left",padding:"3px 8px",fontWeight:600}}>{h}</th>)}</tr></thead>
                <tbody>{rfq.items.map((it,i)=><tr key={i}><td style={{padding:"3px 8px"}}>{it.desc}</td><td style={{padding:"3px 8px"}}>{it.qty}</td><td style={{padding:"3px 8px"}}>{it.uom}</td><td style={{padding:"3px 8px"}}>{idr(it.estPrice)}</td></tr>)}</tbody>
              </table>
            </Card>
          );
        })}</div>
      )}
      {tab==="my"&&(
        <div>
          <FilterBar opts={["All","Draft","Submitted","Accepted","Rejected","Win","Lost","Revised","PO Ready","Withdrawn"]} val={flt} onChange={setFlt}/>
          <Card style={{padding:0,overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
              <thead><tr>{["RFQ Title","Submitted","Valid Until","Total Amount","Files","Status","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {mineF.length===0?<tr><Td colSpan={7} style={{textAlign:"center",padding:40,color:C.t2}}>No quotations found.</Td></tr>:mineF.map(qt=>(
                  <tr key={qt.id}>
                    <Td><button onClick={()=>setVQ(qt)} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontWeight:700,fontSize:13,padding:0}}>{qt.rfqTitle}</button><div style={{fontSize:10,color:C.t2}}>{qt.rfqId}</div></Td>
                    <Td>{fmtDate(qt.submittedDate)}</Td><Td>{fmtDate(qt.validUntil)}</Td>
                    <Td style={{fontWeight:700}}>{idr(qt.totalAmt)}</Td>
                    <Td>{qt.files?.length>0?<span style={{color:C.ok,fontSize:12,display:"inline-flex",alignItems:"center",gap:4}}><SapIcon name="accept" size={12} color={C.ok}/>{qt.files.length}</span>:"—"}</Td>
                    <Td><Badge s={qt.status}/></Td>
                    <Td><div style={{display:"flex",gap:5}}>
                      {["Draft","Submitted"].includes(qt.status)&&<Btn v="ghost" sm onClick={()=>{setEQ(qt);setQR(rfqs.find(r=>r.id===qt.rfqId));}}>Edit</Btn>}
                      {qt.status==="Submitted"&&<Btn v="neutral" sm onClick={()=>withdraw(qt.id)}>Withdraw</Btn>}
                    </div></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
      {viewQt&&(
        <Modal title={`Quotation Detail`} onClose={()=>setVQ(null)} width={680}>
          <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:14}}>
            {[["ID",viewQt.id],["RFQ",viewQt.rfqId],["Submitted",fmtDate(viewQt.submittedDate)],["Valid Until",fmtDate(viewQt.validUntil)],["Total",idr(viewQt.totalAmt)],["Status",null]].map(([l,val])=>(
              <div key={l}><Lbl>{l}</Lbl>{l==="Status"?<Badge s={viewQt.status}/>:<Val>{val}</Val>}</div>
            ))}
          </div>
          <Lbl>Line Items</Lbl>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,margin:"6px 0 14px"}}>
            <thead><tr style={{background:C.subtle}}>{["Description","Qty","UoM","Unit Price","Total"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{viewQt.items.map((it,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"6px 10px"}}>{it.desc}</td><td style={{padding:"6px 10px"}}>{it.qty}</td><td style={{padding:"6px 10px"}}>{it.uom}</td><td style={{padding:"6px 10px"}}>{idr(it.unitPrice)}</td><td style={{padding:"6px 10px",fontWeight:700}}>{idr(it.total)}</td></tr>)}</tbody>
          </table>
          {viewQt.notes&&<div><Lbl>Notes</Lbl><Val>{viewQt.notes}</Val></div>}
        </Modal>
      )}
      {quotingRfq&&<QtFormModal rfq={quotingRfq} qt={editingQt} onSave={save} onClose={()=>{setQR(null);setEQ(null);}} vendorId={user.vendorId} vendorName={VENDORS[user.vendorId]?.name||user.name}/>}
    </div>
  );
};

// ── Adapt Filters Dialog (shared by BrmQuotation & BrmRfq) ────
const ALL_QT_FILTER_FIELDS = [
  {id:"vendorIds",      label:"Vendor",               defaultOn:true },
  {id:"statuses",       label:"Status",               defaultOn:true },
  {id:"rfqId",          label:"RFQ Number",           defaultOn:true },
  {id:"rfqTitle",       label:"RFQ Title",            defaultOn:true },
  {id:"materialNo",     label:"Material No",          defaultOn:true },
  {id:"submittedDate",  label:"Submitted Date Range", defaultOn:true },
  {id:"validUntil",     label:"Valid Until Range",    defaultOn:false},
  {id:"totalAmtMin",    label:"Total Amount (From)",  defaultOn:false},
  {id:"totalAmtMax",    label:"Total Amount (To)",    defaultOn:false},
];

const ALL_RFQ_FILTER_FIELDS = [
  {id:"companyCodes",   label:"Company Code",         defaultOn:true },
  {id:"statuses",       label:"Status",               defaultOn:true },
  {id:"rfqNo",          label:"RFQ Number",           defaultOn:true },
  {id:"rfqTitle",       label:"RFQ Title",            defaultOn:true },
  {id:"category",       label:"Category",             defaultOn:true },
  {id:"postedBy",       label:"Tender Administrator", defaultOn:true },
  {id:"openDate",       label:"Open Date Range",      defaultOn:false},
  {id:"closingDate",    label:"Closing Date Range",   defaultOn:false},
  {id:"purchOrg",       label:"Purchasing Org",       defaultOn:false},
  {id:"plant",          label:"Plant",                defaultOn:false},
  {id:"estValMin",      label:"Est. Value (From)",    defaultOn:false},
  {id:"estValMax",      label:"Est. Value (To)",      defaultOn:false},
];

function AdaptFiltersDialog({open,onClose,visibleFields,onSave,draft,allFields,hasValue}:{open:boolean,onClose:()=>void,visibleFields:Set<string>,onSave:(s:Set<string>)=>void,draft:any,allFields:{id:string,label:string,defaultOn:boolean}[],hasValue?:(id:string)=>boolean}) {
  const [local,setLocal]=useState<Set<string>>(new Set(visibleFields));
  const [search,setSearch]=useState("");
  const [view,setView]=useState<"All"|"Active"|"Inactive">("All");
  useEffect(()=>{if(open){setLocal(new Set(visibleFields));setSearch("");setView("All");}},[open]);
  const isActive=(id:string)=>{
    if(hasValue) return hasValue(id);
    const v=draft[id];
    return Array.isArray(v)?v.length>0:!!v;
  };
  const display=allFields.filter(f=>{
    if(search&&!f.label.toLowerCase().includes(search.toLowerCase()))return false;
    if(view==="Active")return local.has(f.id);
    if(view==="Inactive")return !local.has(f.id);
    return true;
  });
  if(!open)return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",width:560,maxHeight:620,borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.24)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{height:52,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",borderBottom:"1px solid #d9d9d9",flexShrink:0}}>
          <span style={{fontSize:16,fontWeight:700,color:"#32363a"}}>Adapt Filters</span>
          <button onClick={()=>setLocal(new Set(allFields.filter(f=>f.defaultOn).map(f=>f.id)))} style={{background:"none",border:"none",color:"#0a6ed1",fontSize:13,cursor:"pointer",padding:"4px 8px"}}>Reset</button>
        </div>
        <div style={{height:40,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:"#f5f6f7",borderBottom:"1px solid #e5e5e5",flexShrink:0}}>
          <select value={view} onChange={e=>setView(e.target.value as any)} style={{width:80,height:28,border:"1px solid #d9d9d9",borderRadius:4,fontSize:13,background:"#fff",color:"#32363a"}}>
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
          <span style={{fontSize:13,color:"#0a6ed1",cursor:"pointer"}}>Show Values</span>
        </div>
        <div style={{padding:"8px 16px",flexShrink:0}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",display:"flex",alignItems:"center"}}><SapIcon name="search" size={14} color="#8a8d91"/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for Filters"
              style={{width:"100%",height:32,border:"1px solid #d9d9d9",borderRadius:4,paddingLeft:28,paddingRight:8,fontSize:13,color:"#32363a",boxSizing:"border-box" as const,outline:"none"}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed" as const}}>
            <colgroup><col style={{width:32}}/><col style={{width:40}}/><col/><col style={{width:80}}/></colgroup>
            <thead>
              <tr style={{background:"#f2f2f2",height:32}}>
                <th style={{fontSize:11,fontWeight:700,color:"#6a6d70",textTransform:"uppercase" as const,border:"none"}}></th>
                <th style={{fontSize:11,fontWeight:700,color:"#6a6d70",textTransform:"uppercase" as const,border:"none"}}></th>
                <th style={{fontSize:11,fontWeight:700,color:"#6a6d70",textTransform:"uppercase" as const,border:"none",textAlign:"left" as const,paddingLeft:8}}>Field Name</th>
                <th style={{fontSize:11,fontWeight:700,color:"#6a6d70",textTransform:"uppercase" as const,border:"none",textAlign:"center" as const}}>Active</th>
              </tr>
            </thead>
            <tbody>
              {display.map(f=>{
                const checked=local.has(f.id);
                const active=isActive(f.id);
                return (
                  <tr key={f.id} style={{height:44,borderBottom:"1px solid #f2f2f2",cursor:"default"}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#f5f6f7")}
                    onMouseLeave={e=>(e.currentTarget.style.background="")}>
                    <td style={{textAlign:"center",color:"#c8cdd0",fontSize:16,userSelect:"none" as const}}>⠿</td>
                    <td style={{textAlign:"center"}}><input type="checkbox" checked={checked} onChange={e=>{const ns=new Set(local);e.target.checked?ns.add(f.id):ns.delete(f.id);setLocal(ns);}} style={{accentColor:"#0a6ed1",width:16,height:16,cursor:"pointer"}}/></td>
                    <td style={{fontSize:14,color:"#32363a",paddingLeft:8}}>{f.label}</td>
                    <td style={{textAlign:"center",fontSize:10,color:"#0a6ed1"}}>{checked&&active?"●":""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{height:52,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,padding:"0 16px",borderTop:"1px solid #d9d9d9",flexShrink:0}}>
          <button onClick={onClose} style={{height:36,padding:"0 16px",borderRadius:4,border:"1px solid #d9d9d9",background:"#fff",fontSize:14,cursor:"pointer",color:"#32363a"}}>Cancel</button>
          <button onClick={()=>{onSave(local);onClose();}} style={{height:36,padding:"0 16px",borderRadius:4,border:"none",background:"#0a6ed1",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>OK</button>
        </div>
      </div>
    </div>
  );
}

// ── BRM Quotation Mgmt ─────────────────────────────────────────
export const BrmQuotation = ({quotations,setQuotations,rfqs}) => {
  const [flt,setFlt]=useState("All");
  const [expanded,setExpanded]=useState({});
  const [allExpanded,setAllExpanded]=useState(false);
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));
  const [detailQt,setDetailQt]=useState<any>(null);
  const [qtTab,setQtTab]=useState("general");
  const [split,setSplit]=useState(48);
  const containerRef=useRef<HTMLDivElement>(null);
  const onSplitterDrag=(e)=>{
    e.preventDefault();
    const startX=e.clientX,startSplit=split;
    const containerW=containerRef.current?.offsetWidth||window.innerWidth;
    const onMove=(me)=>{const dx=me.clientX-startX;setSplit(Math.min(75,Math.max(25,startSplit-(dx/containerW)*100)));};
    const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  };
  const scrollRef=useRef<HTMLDivElement>(null);
  const drag=useRef({active:false,startX:0,scrollLeft:0});
  const onDragDown=(e)=>{if(!scrollRef.current)return;drag.current={active:true,startX:e.pageX-scrollRef.current.offsetLeft,scrollLeft:scrollRef.current.scrollLeft};scrollRef.current.style.cursor="grabbing";};
  const onDragMove=(e)=>{if(!drag.current.active||!scrollRef.current)return;e.preventDefault();const x=e.pageX-scrollRef.current.offsetLeft;scrollRef.current.scrollLeft=drag.current.scrollLeft-(x-drag.current.startX);};
  const onDragEnd=()=>{drag.current.active=false;if(scrollRef.current)scrollRef.current.style.cursor="grab";};

  const [adaptOpen,setAdaptOpen]=useState(false);
  const [visibleFields,setVisibleFields]=useState<Set<string>>(new Set(ALL_QT_FILTER_FIELDS.filter(f=>f.defaultOn).map(f=>f.id)));

  const EMPTY_FLT={rfqTitle:"",rfqId:"",materialNo:"",vendorIds:[],statuses:[],submittedFrom:"",submittedTo:"",validFrom:"",validTo:"",totalAmtMin:"",totalAmtMax:""};
  const [draft,setDraft]=useState(EMPTY_FLT);
  const [applied,setApplied]=useState(EMPTY_FLT);
  const sd=(k,v)=>setDraft(p=>({...p,[k]:v}));
  const applyFilters=()=>setApplied({...draft});
  const resetFilters=()=>{setDraft(EMPTY_FLT);setApplied(EMPTY_FLT);};
  const [vhOpen,setVhOpen]=useState<string|null>(null);
  const clrA=(k)=>{setDraft(p=>({...p,[k]:Array.isArray(EMPTY_FLT[k])?[]:EMPTY_FLT[k]}));setApplied(p=>({...p,[k]:Array.isArray(EMPTY_FLT[k])?[]:EMPTY_FLT[k]}));};

  const ALL_QT_STATUSES=["Draft","Submitted","Accepted","Rejected","Win","Lost","Revised","PO Ready","Withdrawn"];
  const VENDOR_ROWS=Object.values(VENDORS).map((v:any)=>({v:v.id,l:v.name}));

  const activeTokens=[
    applied.vendorIds.length>0&&{label:"Vendor",val:applied.vendorIds.length===1?(VENDORS[applied.vendorIds[0]] as any)?.name||applied.vendorIds[0]:`${applied.vendorIds.length} selected`,onClear:()=>clrA("vendorIds")},
    applied.statuses.length>0&&{label:"Status",val:applied.statuses.length===1?applied.statuses[0]:`${applied.statuses.length} selected`,onClear:()=>clrA("statuses")},
    applied.rfqId&&{label:"RFQ No",val:applied.rfqId,onClear:()=>clrA("rfqId")},
    applied.rfqTitle&&{label:"RFQ Title",val:applied.rfqTitle,onClear:()=>clrA("rfqTitle")},
    applied.materialNo&&{label:"Material No",val:applied.materialNo,onClear:()=>clrA("materialNo")},
    (applied.submittedFrom||applied.submittedTo)&&{label:"Submitted Date",val:[applied.submittedFrom&&fmtDate(applied.submittedFrom),applied.submittedTo&&fmtDate(applied.submittedTo)].filter(Boolean).join(" – "),onClear:()=>{clrA("submittedFrom");clrA("submittedTo");}},
    (applied.validFrom||applied.validTo)&&{label:"Valid Until",val:[applied.validFrom&&fmtDate(applied.validFrom),applied.validTo&&fmtDate(applied.validTo)].filter(Boolean).join(" – "),onClear:()=>{clrA("validFrom");clrA("validTo");}},
    applied.totalAmtMin&&{label:"Total Amt ≥",val:`IDR ${Number(applied.totalAmtMin).toLocaleString()}`,onClear:()=>clrA("totalAmtMin")},
    applied.totalAmtMax&&{label:"Total Amt ≤",val:`IDR ${Number(applied.totalAmtMax).toLocaleString()}`,onClear:()=>clrA("totalAmtMax")},
  ].filter(Boolean);

  const getRfqItems=(qt)=>rfqs.find(r=>r.id===qt.rfqId)?.items||[];
  const list=quotations
    .filter(q=>flt==="All"||q.status===flt)
    .filter(q=>applied.vendorIds.length===0||applied.vendorIds.includes(q.vendorId))
    .filter(q=>applied.statuses.length===0||applied.statuses.includes(q.status))
    .filter(q=>!applied.rfqId    ||q.rfqId?.toLowerCase().includes(applied.rfqId.toLowerCase()))
    .filter(q=>!applied.rfqTitle ||q.rfqTitle?.toLowerCase().includes(applied.rfqTitle.toLowerCase()))
    .filter(q=>!applied.materialNo||getRfqItems(q).some(it=>it.materialNo?.toLowerCase().includes(applied.materialNo.toLowerCase())))
    .filter(q=>!applied.submittedFrom||(q.submittedDate&&q.submittedDate>=applied.submittedFrom))
    .filter(q=>!applied.submittedTo  ||(q.submittedDate&&q.submittedDate<=applied.submittedTo))
    .filter(q=>!applied.validFrom||(q.validUntil&&q.validUntil>=applied.validFrom))
    .filter(q=>!applied.validTo  ||(q.validUntil&&q.validUntil<=applied.validTo))
    .filter(q=>!applied.totalAmtMin||q.totalAmt>=Number(applied.totalAmtMin))
    .filter(q=>!applied.totalAmtMax||q.totalAmt<=Number(applied.totalAmtMax));

  const [selIds,setSelIds]=useState(new Set<string>());
  const toggleSel=(id)=>setSelIds(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const allSel=list.length>0&&list.every(q=>selIds.has(q.id));
  const toggleAll=()=>setSelIds(allSel?new Set():new Set(list.map(q=>q.id)));
  const selRows=list.filter(q=>selIds.has(q.id));
  const canAward    = selRows.some(q=>q.status==="Submitted"||q.status==="Accepted");
  const canComplete = selRows.some(q=>q.status==="Submitted"||q.status==="Accepted");
  const canAccept   = selRows.some(q=>q.status==="Submitted");
  const canReject   = selRows.some(q=>q.status==="Submitted");

  const awardSel   =()=>{setQuotations(p=>p.map(q=>selIds.has(q.id)&&(q.status==="Submitted"||q.status==="Accepted")?{...q,status:"Win"}:q));setSelIds(new Set());};
  const completeSel=()=>{setQuotations(p=>p.map(q=>selIds.has(q.id)&&(q.status==="Submitted"||q.status==="Accepted")?{...q,status:"Lost"}:q));setSelIds(new Set());};
  const acceptSel  =()=>{setQuotations(p=>p.map(q=>selIds.has(q.id)&&q.status==="Submitted"?{...q,status:"Accepted"}:q));setSelIds(new Set());};
  const rejectSel  =()=>{if(!window.confirm(`Reject ${selRows.filter(q=>q.status==="Submitted").length} quotation(s)?`))return;setQuotations(p=>p.map(q=>selIds.has(q.id)&&q.status==="Submitted"?{...q,status:"Rejected"}:q));setSelIds(new Set());};

  const exportQtCSV=()=>{
    const rows=selIds.size>0?list.filter(q=>selIds.has(q.id)):list;
    if(rows.length===0){alert("No quotations to export.");return;}
    const esc=(s:any)=>{const t=String(s??'');return t.includes(',')||t.includes('"')||t.includes('\n')?`"${t.replace(/"/g,'""')}"`:t;};
    const hdr=["SAP Quotation No","Quotation ID","RFQ ID","RFQ Title","Vendor ID","Vendor Name","Submitted Date","Valid Until","Total Amount","Status","Notes"];
    const data=rows.map(q=>{const sapNo=q.sapQtNo||(["Accepted","Win","PO Ready"].includes(q.status)?`80${q.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"");return[sapNo,q.id,q.rfqId,q.rfqTitle,q.vendorId,q.vendorName,q.submittedDate,q.validUntil,q.totalAmt,q.status,q.notes].map(esc).join(",");});
    const csv=[hdr.join(","),...data].join("\r\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download=`quotations_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
  };

  const HDR_COLS=["","","Status","SAP Quotation No","Quotation ID","RFQ Title","Vendor","Submitted","Valid Until","Total Amount",""];
  const [colW,setColW]=useState([28,32,90,145,115,210,140,95,95,115,32]);
  const colResize=useRef<{idx:number,startX:number,startW:number}|null>(null);
  const onResizeStart=(e,idx)=>{
    e.stopPropagation();e.preventDefault();
    colResize.current={idx,startX:e.clientX,startW:colW[idx]};
    const onMove=(me)=>{if(!colResize.current)return;const newW=Math.max(40,colResize.current.startW+(me.clientX-colResize.current.startX));setColW(prev=>prev.map((w,i)=>i===colResize.current!.idx?newW:w));};
    const onUp=()=>{colResize.current=null;document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);};
    document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);
  };
  const _qtTot=colW.reduce((a,b)=>a+b,0);
  const qtMinW=_qtTot;
  const gridCols=colW.map(w=>`${(w/_qtTot*100).toFixed(3)}%`).join(" ");

  const ITEM_HDRS=["#","Material No","Description","Qty","UoM","Unit Price","Total"];
  const [colW2,setColW2]=useState([40,130,220,60,80,140,140]);
  const colResize2=useRef<{idx:number,startX:number,startW:number}|null>(null);
  const onResizeStart2=(e,idx)=>{
    e.stopPropagation();e.preventDefault();
    colResize2.current={idx,startX:e.clientX,startW:colW2[idx]};
    const onMove=(me)=>{if(!colResize2.current)return;const newW=Math.max(30,colResize2.current.startW+(me.clientX-colResize2.current.startX));setColW2(prev=>prev.map((w,i)=>i===colResize2.current!.idx?newW:w));};
    const onUp=()=>{colResize2.current=null;document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);};
    document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);
  };
  const gridCols2=colW2.map(w=>`${w}px`).join(" ");

  return (
    <div ref={containerRef} style={{display:"flex",alignItems:"flex-start",overflow:"hidden",width:"100%"}}>
    <div style={{flex:detailQt?`0 0 ${100-split}%`:"1",padding:pg(),overflowX:"hidden",minWidth:0,transition:"flex 0.15s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>Quotation Management – All Vendors</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>📡 Vendor quotations from Custom CDS Table on BTP · Compare and award to best bidder</div>
        </div>
      </div>

      <FioriBar activeTokens={activeTokens} onGo={applyFilters} onReset={resetFilters} onAdaptFilters={()=>setAdaptOpen(true)} adaptFiltersCount={visibleFields.size}>
        {visibleFields.has("vendorIds")&&<FField label="Vendor"><ValueHelpInp selected={draft.vendorIds} getLabel={k=>(VENDORS[k] as any)?.name||k} onOpen={()=>setVhOpen("vendor")} placeholder="All Vendors"/></FField>}
        {visibleFields.has("statuses")&&<FField label="Status"><ValueHelpInp selected={draft.statuses} getLabel={k=>k} onOpen={()=>setVhOpen("status")} placeholder="All Statuses"/></FField>}
        {visibleFields.has("rfqId")&&<FField label="RFQ Number"><Inp value={draft.rfqId} onChange={v=>sd("rfqId",v)} placeholder="e.g. RFQ-2025-0001"/></FField>}
        {visibleFields.has("rfqTitle")&&<FField label="RFQ Title"><Inp value={draft.rfqTitle} onChange={v=>sd("rfqTitle",v)} placeholder="e.g. Laptops"/></FField>}
        {visibleFields.has("materialNo")&&<FField label="Material No"><Inp value={draft.materialNo} onChange={v=>sd("materialNo",v)} placeholder="e.g. IT-LPT-001"/></FField>}
        {visibleFields.has("submittedDate")&&<FField label="Submitted Date Range"><DateRangePicker from={draft.submittedFrom} to={draft.submittedTo} onChange={(f,t)=>{sd("submittedFrom",f);sd("submittedTo",t);}}/></FField>}
        {visibleFields.has("validUntil")&&<FField label="Valid Until Range"><DateRangePicker from={draft.validFrom} to={draft.validTo} onChange={(f,t)=>{sd("validFrom",f);sd("validTo",t);}}/></FField>}
        {visibleFields.has("totalAmtMin")&&<FField label="Total Amount (From)"><Inp type="number" value={draft.totalAmtMin} onChange={v=>sd("totalAmtMin",v)} placeholder="Min (IDR)"/></FField>}
        {visibleFields.has("totalAmtMax")&&<FField label="Total Amount (To)"><Inp type="number" value={draft.totalAmtMax} onChange={v=>sd("totalAmtMax",v)} placeholder="Max (IDR)"/></FField>}
      </FioriBar>

      <AdaptFiltersDialog open={adaptOpen} onClose={()=>setAdaptOpen(false)} visibleFields={visibleFields}
        onSave={s=>setVisibleFields(s)} draft={draft} allFields={ALL_QT_FILTER_FIELDS}
        hasValue={id=>{
          if(id==="vendorIds")return draft.vendorIds.length>0;
          if(id==="statuses")return draft.statuses.length>0;
          if(id==="submittedDate")return !!(draft.submittedFrom||draft.submittedTo);
          if(id==="validUntil")return !!(draft.validFrom||draft.validTo);
          return !!(draft as any)[id];
        }}/>

      {vhOpen==="vendor"&&(
        <ValueHelpDialog title="Vendor" cols={[{key:"v",label:"Vendor ID",width:100},{key:"l",label:"Vendor Name",width:220}]}
          rows={VENDOR_ROWS} keyField="v" labelField="l"
          selected={draft.vendorIds} onConfirm={s=>{sd("vendorIds",s);setVhOpen(null);}} onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="status"&&(
        <ValueHelpDialog title="Status" cols={[{key:"v",label:"Status",width:180}]}
          rows={ALL_QT_STATUSES.map(s=>({v:s,l:s}))} keyField="v" labelField="l"
          selected={draft.statuses} onConfirm={s=>{sd("statuses",s);setVhOpen(null);}} onClose={()=>setVhOpen(null)}/>
      )}

      <FilterBar opts={["All","Draft","Submitted","Accepted","Rejected","Win","Lost","Revised","PO Ready","Withdrawn"]} val={flt} onChange={setFlt}/>

      {/* Toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 12px",height:44,background:C.card,border:`1px solid ${C.border}`,borderBottom:"none",borderRadius:"8px 8px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:14,fontWeight:700,color:C.t1,marginRight:6}}>Quotations</span>
          <span style={{fontSize:12,color:C.t2,marginRight:10}}>({list.length})</span>
          {(()=>{
            const tbBtn=(label,onClick,enabled,icon)=>{
              const dis=!enabled;
              return <button key={label} disabled={dis} onClick={onClick} style={{background:"transparent",border:"none",color:dis?C.t2:C.t1,fontSize:12,fontFamily:"inherit",cursor:dis?"default":"pointer",padding:"0 8px",height:32,display:"flex",alignItems:"center",gap:4,opacity:dis?0.4:1,borderRadius:4,transition:"background .12s"}}
                onMouseEnter={e=>{if(!dis)(e.currentTarget as HTMLButtonElement).style.background=C.subtle;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
                <span style={{fontSize:13}}>{icon}</span>{label}
              </button>;
            };
            const sep=<div style={{width:1,height:20,background:C.border,margin:"0 4px",flexShrink:0,alignSelf:"center"}}/>;
            return <>
              {tbBtn("🏆 Award",    awardSel,    canAward,    "")}
              {tbBtn("✗ Mark Lost", completeSel, canComplete, "")}
              {tbBtn("✓ Accept",   acceptSel,   canAccept,   "")}
              {tbBtn("✗ Reject",   rejectSel,   canReject,   "")}
              {sep}
              {selRows.length>0&&<span style={{fontSize:11,color:C.t2,marginLeft:4}}>{selRows.length} selected</span>}
            </>;
          })()}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>{if(allExpanded){setExpanded({});setAllExpanded(false);}else{const m={};list.forEach(q=>{m[q.id]=true;});setExpanded(m);setAllExpanded(true);}}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.75rem",fontSize:12,fontFamily:"inherit",cursor:"pointer",height:28,display:"flex",alignItems:"center",gap:4}}>
            <SapIcon name={allExpanded?"collapse-all":"expand-all"} size={13} color={C.t1}/>{allExpanded?"Collapse All":"Expand All"}
          </button>
          <button onClick={exportQtCSV} title={selIds.size>0?`Export ${selIds.size} selected`:"Export all filtered"}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.75rem",fontSize:12,fontFamily:"inherit",cursor:"pointer",height:28,display:"flex",alignItems:"center",gap:4}}>
            <SapIcon name="excel-attachment" size={13} color={C.t1}/> Export
          </button>
        </div>
      </div>

      <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:"0 0 8px 8px"}}>
      <div style={{minWidth:qtMinW,background:C.card}}>
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:gridCols,background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
          {HDR_COLS.map((h,i)=>(
            <div key={i} style={{position:"relative",padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",userSelect:"none",display:"flex",alignItems:"center"}}>
              {i===0
                ? <input type="checkbox" checked={allSel} onChange={toggleAll} style={{cursor:"pointer",width:13,height:13,accentColor:"#0854a0"}}/>
                : h
              }
              {i>0&&i<HDR_COLS.length-1&&(
                <div onMouseDown={e=>onResizeStart(e,i)} style={{position:"absolute",right:0,top:0,width:5,height:"100%",cursor:"col-resize",zIndex:10,background:"transparent"}}
                  onMouseEnter={e=>(e.currentTarget.style.background=`${C.border}`)}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}/>
              )}
            </div>
          ))}
        </div>

        {list.length===0&&<div style={{padding:"28px 16px",textAlign:"center",color:C.t2,fontSize:13}}>No quotations found.</div>}

        {list.map((qt,ri)=>{
          const open=!!expanded[qt.id];
          const isSel=selIds.has(qt.id);
          const rowBg=isSel?C.selection:C.card;
          return (
            <div key={qt.id} style={{borderBottom:`1px solid ${C.border}`}}>
              {/* Main row */}
              <div onClick={()=>toggle(qt.id)} style={{display:"grid",gridTemplateColumns:gridCols,background:rowBg,cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=C.hover;}}
                onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
                {/* checkbox */}
                <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"flex-start",padding:"10px 10px"}}>
                  <input type="checkbox" checked={isSel} onChange={()=>toggleSel(qt.id)} style={{cursor:"pointer",width:13,height:13,accentColor:"#0854a0"}}/>
                </div>
                {/* expand toggle */}
                <div onClick={e=>{e.stopPropagation();toggle(qt.id);}} style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"10px 6px"}}>
                  <span style={{fontSize:10,color:C.primary,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                </div>
                {/* status badge */}
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center"}}><Badge s={qt.status}/></div>
                {/* sap quotation no */}
                {(()=>{const sapNo=qt.sapQtNo||(["Accepted","Win","PO Ready"].includes(qt.status)?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");return(
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap"}}>
                  {sapNo==="—"?<span style={{fontSize:13,color:C.t2}}>—</span>:<a href="#" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:13,fontWeight:600,color:C.primary,textDecoration:"none",borderBottom:`1px solid ${C.primary}`,overflow:"hidden",textOverflow:"ellipsis"}}>{sapNo}</a>}
                  {qt.poSapNo&&<span style={{fontSize:11,color:"#6f2da8",fontWeight:700,marginLeft:6}}>PO: {qt.poSapNo}</span>}
                </div>);})()}
                {/* quotation id */}
                <div style={{padding:"8px 10px",fontSize:13,fontWeight:700,color:C.primary,display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{qt.id}</div>
                {/* rfq title */}
                <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden"}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{qt.rfqTitle}</span>
                  <span style={{fontSize:11,color:C.t2,marginTop:2}}>{qt.rfqId}</span>
                </div>
                {/* vendor */}
                <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden"}}>
                  <span style={{fontSize:13,color:C.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{qt.vendorName}</span>
                  <span style={{fontSize:11,color:C.t2,marginTop:2}}>{qt.vendorId}</span>
                </div>
                {/* submitted */}
                <div style={{padding:"8px 10px",fontSize:13,color:C.t2,display:"flex",alignItems:"center"}}>{fmtDate(qt.submittedDate)||"—"}</div>
                {/* valid until */}
                <div style={{padding:"8px 10px",fontSize:13,color:C.t2,display:"flex",alignItems:"center"}}>{fmtDate(qt.validUntil)||"—"}</div>
                {/* total */}
                <div style={{padding:"8px 10px",fontSize:13,fontWeight:700,color:C.t1,display:"flex",alignItems:"center"}}>{idr(qt.totalAmt)}</div>
                {/* detail panel arrow */}
                <div onClick={e=>{e.stopPropagation();setDetailQt(qt);setQtTab("general");}} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 0",cursor:"pointer"}}>
                  <span style={{fontSize:16,color:detailQt?.id===qt.id?C.primary:"#32363a",fontWeight:detailQt?.id===qt.id?700:300}}>›</span>
                </div>
              </div>

              {/* Expanded detail */}
              {open&&(
                <div style={{background:C.infoBg,borderTop:`1px solid ${C.border}`}}>
                  {/* line items sub-header */}
                  <div style={{display:"grid",gridTemplateColumns:gridCols2,background:"rgba(0,112,242,0.07)",borderBottom:`1px solid ${C.border}`}}>
                    {ITEM_HDRS.map((h,i)=>(
                      <div key={i} style={{position:"relative",padding:"6px 10px",fontSize:12,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap",userSelect:"none"}}>
                        {h}
                        {i<ITEM_HDRS.length-1&&(
                          <div onMouseDown={e=>onResizeStart2(e,i)} style={{position:"absolute",right:0,top:0,width:5,height:"100%",cursor:"col-resize",zIndex:10,background:"transparent"}}
                            onMouseEnter={e=>(e.currentTarget.style.background=`${C.border}`)}
                            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}/>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* line items */}
                  {qt.items?.map((it,ii)=>{
                    const rfqItem=getRfqItems(qt)[ii];
                    return (
                    <div key={ii} style={{display:"grid",gridTemplateColumns:gridCols2,borderBottom:ii<qt.items.length-1?`1px solid ${C.border}`:"none",background:ii%2===0?"transparent":"rgba(0,0,0,0.02)"}}>
                      <div style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2}}>{String(ii+1).padStart(3,"0")}</div>
                      <div style={{padding:"8px 10px",fontSize:11,color:C.primary,fontFamily:"monospace",display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>{rfqItem?.materialNo||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:C.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.desc}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t1,display:"flex",alignItems:"center"}}>{it.qty}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t2,display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>{it.uom}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t1,display:"flex",alignItems:"center"}}>{idr(it.unitPrice)}</div>
                      <div style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t1,display:"flex",alignItems:"center"}}>{idr(it.total)}</div>
                    </div>
                    );
                  })}
                  {/* notes + files + actions */}
                  <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start",justifyContent:"space-between"}}>
                    <div style={{flex:1,minWidth:200}}>
                      {qt.notes&&<div style={{marginBottom:8}}><span style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Notes: </span><span style={{fontSize:12,color:C.t2}}>{qt.notes}</span></div>}
                      {qt.files?.length>0&&(
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {qt.files.map(f=>(
                            <span key={f} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:C.primary,background:C.infoBg,border:`1px solid ${C.info}40`,borderRadius:4,padding:"2px 8px"}}>
                              <SapIcon name="document" size={11} color={C.primary}/>{f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quotation Status Legend */}
      <div style={{margin:"20px 0 4px",padding:"14px 18px",background:C.subtle,border:`1px solid ${C.border}`,borderRadius:8}}>
        <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:10,textTransform:"uppercase",letterSpacing:.6}}>Quotation Status Legend</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"10px 24px",marginBottom:14}}>
          {[
            {s:"Draft",    desc:"Quotation saved but not yet submitted to buyer"},
            {s:"Submitted",desc:"Quotation submitted – awaiting buyer evaluation"},
            {s:"Accepted", desc:"Quotation accepted into scoring round by buyer"},
            {s:"Rejected", desc:"Quotation rejected by buyer during evaluation"},
            {s:"Win",      desc:"Awarded as winner after scoring and approval"},
            {s:"Lost",     desc:"Not selected – automatically set when winner is determined"},
            {s:"Revised",  desc:"Quotation re-opened for revision after approval rejection"},
            {s:"PO Ready", desc:"Purchase Order confirmed in SAP system"},
          ].map(({s,desc})=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:7,minWidth:300}}>
              <Badge s={s}/><span style={{fontSize:12,color:C.t2}}>{desc}</span>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
          <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginRight:4}}>Status Flow:</span>
          {["Draft","Submitted","Accepted","Win","PO Ready"].map((s,i,arr)=>(
            <span key={s} style={{display:"flex",alignItems:"center",gap:6}}>
              <Badge s={s}/>{i<arr.length-1&&<span style={{color:C.t2,fontSize:12}}>→</span>}
            </span>
          ))}
          <span style={{color:C.t2,fontSize:12,marginLeft:8}}>· Rejected / Lost (terminal)</span>
        </div>
      </div>

      </div>
    </div>{/* end left panel */}

    {detailQt&&<>
      {/* Splitter */}
      <div onMouseDown={onSplitterDrag} style={{width:8,flexShrink:0,cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",background:C.subtle,borderLeft:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,userSelect:"none",alignSelf:"stretch",zIndex:5}}>
        <div style={{display:"flex",flexDirection:"column",gap:3,pointerEvents:"none"}}>
          {[0,1,2,3,4].map(i=><div key={i} style={{width:3,height:3,borderRadius:"50%",background:C.t2,opacity:.5}}/>)}
        </div>
      </div>

      {/* Detail Panel */}
      {(()=>{
        const qt=detailQt;
        const sapNo=qt.sapQtNo||(["Accepted","Win","PO Ready"].includes(qt.status)?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");
        const rfq=rfqs.find(r=>r.id===qt.rfqId);
        const rfqSapNo=rfq?(rfq.sapRfqNo||`70${rfq.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`):null;
        const items=qt.items||[];
        const TABS=["general","payment","items","notes","attachments","approval"];
        const TAB_LABELS={general:"General Information",payment:"Delivery and Payment Terms",items:`Items (${items.length})`,notes:"Notes",attachments:"Attachments",approval:"Approval Details"};
        const field=(label,val,link?)=>(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.t2,marginBottom:2}}>{label}:</div>
            {link?<a href="#" onClick={e=>e.preventDefault()} style={{fontSize:13,color:C.primary,fontWeight:500,textDecoration:"none"}}>{val}</a>
            :<div style={{fontSize:13,color:C.t1,fontWeight:500}}>{val||"—"}</div>}
          </div>
        );
        const sHdr=(title)=><div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:14,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{title}</div>;
        const APPROVAL_STEPS=[
          {type:"⚙",name:"1. Automatic Release of Supplier Quotation",status:"Supplier Quotation Released",processor:"Workflow System",recipient:"Recipients determined automatically"},
          {type:"👤",name:"2. Procurement Officer Review",status:qt.status==="Submitted"?"Pending":qt.status==="Accepted"||qt.status==="Win"||qt.status==="PO Ready"?"Approved":"In Progress",processor:(VENDORS[qt.vendorId] as any)?.name||qt.vendorName,recipient:"Procurement Officer"},
          {type:"👤",name:"3. Senior Buyer Approval",status:qt.status==="Win"||qt.status==="PO Ready"?"Approved":qt.status==="Accepted"?"In Review":"Pending",processor:"Siti Rahma",recipient:"Senior Buyer"},
          {type:"👤",name:"4. Procurement Manager Final Approval",status:qt.status==="PO Ready"?"Approved":qt.status==="Win"?"In Review":"Pending",processor:"Ahmad Rizki",recipient:"Procurement Manager"},
        ];
        return(
        <div style={{flex:`0 0 ${split}%`,position:"sticky",top:0,maxHeight:"100vh",display:"flex",flexDirection:"column",background:C.card,overflow:"hidden",boxShadow:"-2px 0 10px rgba(0,0,0,0.08)"}}>
          {/* Header */}
          <div style={{padding:"14px 16px 0",borderBottom:`1px solid ${C.border}`,background:C.card,flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:C.t1}}>Quotation</div>
                <div style={{fontSize:12,color:C.t2,fontFamily:"monospace",marginTop:2}}>{sapNo}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <Badge s={qt.status}/>
                <button onClick={()=>setDetailQt(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,padding:"0 2px"}}>×</button>
              </div>
            </div>
            {/* Created by / Net Value / Bidder row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px 8px",fontSize:11,marginBottom:10}}>
              <div><span style={{color:C.t2}}>Created By: </span><span style={{color:C.primary,fontWeight:600}}>{qt.vendorName}</span></div>
              <div><span style={{color:C.t2}}>Created On: </span><span style={{color:C.t1}}>{fmtDate(qt.submittedDate)||"—"}</span></div>
              <div><span style={{color:C.t2}}>Bidder: </span><span style={{color:C.primary,fontWeight:600}}>{qt.vendorName}</span></div>
              <div style={{gridColumn:"1/-1",display:"flex",gap:16,marginTop:4}}>
                <div><span style={{fontSize:12,color:C.t2}}>Net Value: </span><span style={{fontSize:14,fontWeight:700,color:C.t1}}>{idr(qt.totalAmt)}</span><span style={{fontSize:11,color:C.t2,marginLeft:4}}>IDR</span></div>
              </div>
            </div>
            {/* Tabs */}
            <div style={{display:"flex",overflowX:"auto",gap:0}}>
              {TABS.map(t=>(
                <button key={t} onClick={()=>setQtTab(t)} style={{background:"none",border:"none",borderBottom:qtTab===t?`2px solid ${C.primary}`:"2px solid transparent",color:qtTab===t?C.primary:C.t2,fontFamily:"inherit",fontSize:12,fontWeight:qtTab===t?700:400,cursor:"pointer",padding:"8px 12px",whiteSpace:"nowrap",marginBottom:-1}}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{flex:1,overflowY:"auto",padding:16}}>

            {qtTab==="general"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 24px",marginBottom:16}}>
                  <div>
                    {sHdr("Basic Data")}
                    {field("Type","Internal Quotation")}
                    {field("Supplier/Bidder",qt.vendorName,true)}
                    {field("Address",(VENDORS[qt.vendorId] as any)?.address||"Indonesia")}
                    {field("Country/Region Key","Indonesia")}
                    {field("Quotation Submission Date",fmtDate(qt.submittedDate))}
                  </div>
                  <div>
                    {sHdr("Request for Quotation")}
                    {field("RFQ",rfqSapNo?`Int. Sourcing Req. (${rfqSapNo})`:(rfq?.title||qt.rfqId),true)}
                    {field("Quotation Deadline",fmtDate(qt.validUntil))}
                    {field("RFQ Description",rfq?.title||qt.rfqTitle)}
                    {field("RFQ Number",qt.rfqId)}
                  </div>
                  <div>
                    {sHdr("Follow-On Document")}
                    {field("Follow-On Document Type","PO Project (PO03)")}
                    {field("SAP Quotation No",sapNo)}
                    {field("SAP PO No",qt.poSapNo||"—")}
                    {field("Status",qt.status)}
                    {field("Valid Until",fmtDate(qt.validUntil))}
                  </div>
                </div>
              </div>
            )}

            {qtTab==="payment"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 24px"}}>
                  <div>
                    {sHdr("Payment Terms")}
                    {field("Payment Terms","Due within 14 Days (Z014)")}
                    {field("Days 1","14")}
                    {field("Days 2","0")}
                    {field("Days Net","0")}
                  </div>
                  <div>
                    {sHdr("Cash Discount")}
                    {field("CD Percentage 1","0.000")}
                    {field("CD Percentage 2","0.000")}
                    {field("Incoterms Version","Incoterms 2020 (2020)")}
                    {field("Incoterms","Ex Works (EXW)")}
                  </div>
                  <div>
                    {sHdr("Incoterms Locations")}
                    {field("Incoterms Location 1","Ex-Work Toko")}
                    {field("Incoterms Location 2","—")}
                    {field("Currency","Indonesian Rupiah (IDR)")}
                  </div>
                </div>
              </div>
            )}

            {qtTab==="items"&&(
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:10}}>Items ({items.length}) <span style={{fontSize:12,fontWeight:400,color:C.primary,marginLeft:8}}>Standard ▾</span></div>
                {items.length===0&&<div style={{color:C.t2,fontSize:13}}>No items.</div>}
                {items.map((it,i)=>{
                  const rfqItem=rfq?.items?.[i];
                  return(
                  <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:6,marginBottom:8,overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"40px 1fr 1fr 80px 80px 80px 80px",background:C.subtle,borderBottom:`1px solid ${C.border}`}}>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2}}>#</div>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2}}>Short Text</div>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2}}>Material</div>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"right"}}>Req. Qty</div>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"right"}}>Qt. Qty</div>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"right"}}>Awarded</div>
                      <div style={{padding:"6px 8px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"right"}}>UoM</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"40px 1fr 1fr 80px 80px 80px 80px",background:C.card}}>
                      <div style={{padding:"8px",fontSize:12,fontWeight:700,color:C.t2}}>{String((i+1)*10).padStart(2,"0")}</div>
                      <div style={{padding:"8px",fontSize:13,color:C.t1,fontWeight:600}}>{it.desc}</div>
                      <div style={{padding:"8px",fontSize:12,color:C.primary,fontFamily:"monospace"}}>{rfqItem?.materialNo||"—"}</div>
                      <div style={{padding:"8px",fontSize:12,color:C.t1,textAlign:"right"}}>{rfqItem?.qty||it.qty}</div>
                      <div style={{padding:"8px",fontSize:12,color:C.t1,textAlign:"right"}}>{it.qty}</div>
                      <div style={{padding:"8px",fontSize:12,color:qt.status==="Win"||qt.status==="PO Ready"?C.ok:C.t2,textAlign:"right",fontWeight:700}}>{qt.status==="Win"||qt.status==="PO Ready"?it.qty:"—"}</div>
                      <div style={{padding:"8px",fontSize:12,color:C.t2,textAlign:"right"}}>{it.uom}</div>
                    </div>
                    <div style={{padding:"8px 12px",background:"rgba(0,112,242,0.04)",borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,fontSize:12}}>
                      <div><span style={{color:C.t2}}>Net Order Price: </span><span style={{fontWeight:600,color:C.t1}}>{idr(it.unitPrice)} IDR</span></div>
                      <div><span style={{color:C.t2}}>Quotation Net Value: </span><span style={{fontWeight:600,color:C.t1}}>{idr(it.total)} IDR</span></div>
                      <div><span style={{color:C.t2}}>Purchasing Info Record: </span><span style={{color:C.t2}}>—</span></div>
                    </div>
                  </div>
                );})}
              </div>
            )}

            {qtTab==="notes"&&(
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:10}}>Notes (0)</div>
                <div style={{color:C.t2,fontSize:13,textAlign:"center",padding:"24px 0"}}>{qt.notes||"No Notes Available"}</div>
              </div>
            )}

            {qtTab==="attachments"&&(
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:10}}>Attachments ({qt.files?.length||0})</div>
                {(!qt.files||qt.files.length===0)&&<div style={{color:C.t2,fontSize:13,textAlign:"center",padding:"24px 0"}}>No attachments.</div>}
                {qt.files?.map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:`1px solid ${C.border}`,borderRadius:6,marginBottom:8,background:C.subtle}}>
                    <SapIcon name="document" size={22} color={C.primary}/>
                    <div>
                      <div style={{fontSize:13,color:C.primary,fontWeight:600}}>{f}</div>
                      <div style={{fontSize:11,color:C.t2,marginTop:2}}>Uploaded By: {qt.vendorName} · Source: DMS</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {qtTab==="approval"&&(
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12}}>Workflow Steps</div>
                <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"36px 1fr 120px 140px 160px",background:C.subtle,borderBottom:`1px solid ${C.border}`}}>
                    {["Type","Name","Status","Processors","Recipients"].map((h,i)=>(
                      <div key={i} style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:C.t2}}>{h}</div>
                    ))}
                  </div>
                  {APPROVAL_STEPS.map((step,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"36px 1fr 120px 140px 160px",borderBottom:i<APPROVAL_STEPS.length-1?`1px solid ${C.border}`:"none",background:C.card}}>
                      <div style={{padding:"10px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>{step.type}</div>
                      <div style={{padding:"10px",fontSize:13,color:C.t1,fontWeight:600}}>{step.name}</div>
                      <div style={{padding:"10px"}}>
                        <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:700,
                          background:step.status==="Approved"?C.okBg:step.status==="In Review"||step.status==="In Progress"?C.warnBg:step.status.includes("Released")?C.infoBg:C.subtle,
                          color:step.status==="Approved"?C.ok:step.status==="In Review"||step.status==="In Progress"?C.warn:step.status.includes("Released")?C.info:C.t2}}>
                          {step.status}
                        </span>
                      </div>
                      <div style={{padding:"10px",fontSize:12,color:step.processor==="Workflow System"?C.primary:C.t1}}>{step.processor}</div>
                      <div style={{padding:"10px",fontSize:12,color:C.t2}}>{step.recipient}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        );
      })()}
    </>}
  </div>
  );
};

// ── Quotation Compare Modal ────────────────────────────────────
// ── Award Decision Modal (buyer view — editable) ───────────────
const AwardDecisionModal = ({rfq, quotations, user, onClose, onSubmit}) => {
  const isService = rfq.rfqType === "Service";
  const calcNet = qt => {
    const pc = qt.priceConditions||{};
    const sub = qt.totalAmt;
    return sub - sub*(pc.discount||0)/100 + sub*(pc.surcharge||0)/100 + (pc.freight||0) + (pc.insurance||0);
  };
  const nets = quotations.map(calcNet);
  const bestNet = Math.min(...nets);
  const LABEL_W = 220;
  const COL_W = Math.max(190, Math.floor(880/quotations.length));

  // Award state per vendor
  const [allocations, setAllocations] = useState<{[qtId:string]:{mode:"Full"|"Partial"|"None", qtys:{[no:number]:number}, rationales:string[], note:string}}>(
    () => Object.fromEntries(quotations.map(qt => [qt.id, {mode:"None" as "Full"|"Partial"|"None", qtys:{}, rationales:[], note:""}]))
  );
  // Service: single winner
  const [serviceWinner, setServiceWinner] = useState("");
  const [serviceRationales, setServiceRationales] = useState<string[]>([]);
  const [serviceNote, setServiceNote] = useState("");

  const setMode = (qtId, mode) => setAllocations(p => ({...p, [qtId]: {...p[qtId], mode}}));
  const setQty = (qtId, no, val) => setAllocations(p => ({...p, [qtId]: {...p[qtId], qtys: {...p[qtId].qtys, [no]: Number(val)}}}));
  const toggleRationale = (qtId, opt) => setAllocations(p => {
    const cur = p[qtId].rationales;
    const next = cur.includes(opt) ? cur.filter(x=>x!==opt) : [...cur, opt];
    return {...p, [qtId]: {...p[qtId], rationales: next}};
  });
  const setNote = (qtId, val) => setAllocations(p => ({...p, [qtId]: {...p[qtId], note: val}}));

  const toggleServiceRationale = (opt) => setServiceRationales(p => p.includes(opt) ? p.filter(x=>x!==opt) : [...p, opt]);

  const ratOpts = isService ? SERVICE_RATIONALE_OPTS : AWARD_RATIONALE_OPTS;

  const buildPreview = (qtId) => {
    const a = allocations[qtId];
    const qt = quotations.find(q=>q.id===qtId);
    if (!qt) return "";
    if (a.mode === "None") return `${qt.vendorName} is not awarded on this RFQ.`;
    if (a.mode === "Full") {
      const parts = a.rationales.length > 0 ? ` Rationale: ${a.rationales.slice(0,3).join(", ")}.` : "";
      return `${qt.vendorName} is awarded the full scope of this RFQ.${parts}`;
    }
    const lines = (rfq.items||[]).map(it => {
      const q = a.qtys[it.no];
      if (!q || q <= 0) return null;
      return `${it.desc}: ${q} ${it.uom}`;
    }).filter(Boolean);
    const parts2 = a.rationales.length > 0 ? ` Rationale: ${a.rationales.slice(0,3).join(", ")}.` : "";
    return `${qt.vendorName} is awarded a partial scope: ${lines.join("; ")}.${parts2}`;
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split("T")[0];
    let proposal: any;
    if (isService) {
      if (!serviceWinner) { alert("Please select a winner vendor for Service RFQ."); return; }
      proposal = { type:"Service", winnerId: serviceWinner, rationales: serviceRationales, note: serviceNote, proposedBy: user?.name||"Buyer", proposedAt: today };
    } else {
      const awarded = Object.entries(allocations).filter(([,a])=>a.mode!=="None");
      if (awarded.length === 0) { alert("Please assign at least one vendor an award allocation."); return; }
      proposal = { type:"Material", allocations, proposedBy: user?.name||"Buyer", proposedAt: today };
    }
    onSubmit(proposal);
  };

  const SectionHdr = ({title}) => (
    <tr><td colSpan={quotations.length+1} style={{padding:"7px 14px",background:C.subtle,fontWeight:700,fontSize:10,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.8,borderTop:`2px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>{title}</td></tr>
  );
  const Row = ({label, vals, fmt=null, bestVal=null, bold=false, sub=false}:any) => (
    <tr style={{borderBottom:`1px solid ${C.border}`}}>
      <td style={{padding:"7px 14px",fontSize:sub?11:12,color:sub?C.t2:C.t1,fontWeight:500,background:C.card,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W,whiteSpace:"nowrap" as const,paddingLeft:sub?24:14}}>{label}</td>
      {vals.map((v,i)=>{
        const isBest = bestVal!=null && v===bestVal && quotations.length>1;
        return (
          <td key={i} style={{padding:"7px 14px",fontSize:12,fontWeight:bold?700:400,textAlign:"right" as const,color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.card,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
            {fmt ? fmt(v) : (v||"—")}
            {isBest && <span style={{fontSize:9,marginLeft:4,color:C.ok,fontWeight:700}}>★ BEST</span>}
          </td>
        );
      })}
    </tr>
  );
  const itemBestPrice = (rfq.items||[]).map((_,ii)=>{
    const prices = quotations.map(qt=>qt.items?.[ii]?.unitPrice??Infinity).filter(p=>isFinite(p));
    return prices.length ? Math.min(...prices) : null;
  });

  return (
    <Modal title={`Award Decision — ${rfq.id}`} onClose={onClose} width="92vw">
      {/* Header meta */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <span style={{fontSize:15,fontWeight:700,color:C.t1}}>{rfq.title}</span>
          <span style={{background:isService?"#f3eeff":"#e8f5fb",color:isService?"#6f2da8":"#0a6ed1",border:`1px solid ${isService?"#d0b8ff":"#a8d8f0"}`,borderRadius:12,fontSize:11,fontWeight:700,padding:"2px 10px"}}>{isService?"Service":"Material"}</span>
        </div>
        {/* Info banner */}
        <div style={{background:"#fff8e1",border:"1px solid #f0d080",borderRadius:5,padding:"8px 14px",fontSize:12,display:"flex",gap:18,flexWrap:"wrap" as const,color:"#5d4037"}}>
          <span><strong>Status:</strong> {rfq.status}</span>
          <span><strong>Deadline:</strong> {fmtDate(rfq.closingDate)}</span>
          <span><strong>Currency:</strong> IDR</span>
          <span><strong>Quotations:</strong> {quotations.length}</span>
          <span><strong>Split award:</strong> {isService ? "not applicable (Service RFQ)" : "allowed"}</span>
        </div>
      </div>
      {/* Vendor header cards */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" as const}}>
        {quotations.map((qt,i)=>(
          <div key={qt.id} style={{flex:1,minWidth:160,padding:"10px 14px",background:C.subtle,borderRadius:6,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:VDR_COLORS[i%VDR_COLORS.length]}}>{qt.vendorName}</div>
            <div style={{fontSize:10,color:C.t2,marginTop:2}}>{qt.vendorId} · {qt.id}</div>
            <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" as const}}>
              <Badge s={qt.status}/>
              <span style={{fontSize:11,fontWeight:700,color:calcNet(qt)===bestNet&&quotations.length>1?C.ok:C.t1}}>{idr(calcNet(qt))}</span>
              {calcNet(qt)===bestNet&&quotations.length>1&&<span style={{fontSize:10,color:C.ok,fontWeight:700}}>★ Lowest</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Comparison table */}
      <div style={{overflow:"auto",border:`1px solid ${C.border}`,borderRadius:6,maxHeight:"40vh",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:LABEL_W+COL_W*quotations.length}}>
          <thead><tr style={{position:"sticky" as const,top:0,zIndex:2}}>
            <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"left" as const,background:C.subtle,borderRight:`1px solid ${C.border}`,borderBottom:`2px solid ${C.border}`,minWidth:LABEL_W}}>Parameter</th>
            {quotations.map((qt,i)=>(
              <th key={qt.id} style={{padding:"9px 14px",fontSize:11,fontWeight:700,textAlign:"center" as const,color:VDR_COLORS[i%VDR_COLORS.length],background:C.subtle,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,minWidth:COL_W}}>{qt.vendorName}</th>
            ))}
          </tr></thead>
          <tbody>
            <SectionHdr title="Vendor Information"/>
            <Row label="Vendor Number" vals={quotations.map(q=>q.vendorId)}/>
            <Row label="Vendor Name" vals={quotations.map(q=>q.vendorName)}/>
            <Row label="Sales Person / Contact" vals={quotations.map(q=>q.salesPerson||"—")}/>
            <Row label="Submitted Date" vals={quotations.map(q=>fmtDate(q.submittedDate))}/>
            <Row label="Valid Until" vals={quotations.map(q=>fmtDate(q.validUntil))}/>
            <SectionHdr title="Commercial Terms"/>
            <Row label="Terms of Payment" vals={quotations.map(q=>q.termsOfPayment||"—")}/>
            <Row label="Delivery Terms (Incoterms)" vals={quotations.map(q=>q.deliveryTerms||"—")}/>
            <Row label="Lead Time" vals={quotations.map(q=>q.leadTime||"—")}/>
            <Row label="Warranty Period" vals={quotations.map(q=>q.warrantyPeriod||"—")}/>
            <SectionHdr title="Line Items — Price Comparison"/>
            {(rfq.items||[]).map((item,ii)=>(
              <Fragment key={ii}>
                <tr style={{background:C.infoBg}}>
                  <td colSpan={quotations.length+1} style={{padding:"5px 14px 5px 28px",fontSize:11,fontWeight:700,color:C.info,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
                    {String(item.no).padStart(3,"0")} · {item.desc}<span style={{fontWeight:400,color:C.t2,marginLeft:8}}>({item.qty} {item.uom})</span>
                  </td>
                </tr>
                <Row label="Unit Price (IDR)" vals={quotations.map(q=>q.items?.[ii]?.unitPrice||0)} fmt={v=>idr(v)} bestVal={itemBestPrice[ii]} bold sub/>
                <Row label="Item Total (IDR)" vals={quotations.map(q=>q.items?.[ii]?.total||0)} fmt={v=>idr(v)} sub/>
              </Fragment>
            ))}
            <SectionHdr title="Price Conditions & Summary"/>
            <Row label="Subtotal" vals={quotations.map(q=>q.totalAmt)} fmt={v=>idr(v)}/>
            <Row label="Discount (%)" vals={quotations.map(q=>`${q.priceConditions?.discount||0}%`)}/>
            <Row label="Freight Cost" vals={quotations.map(q=>q.priceConditions?.freight||0)} fmt={v=>v>0?idr(v):"—"}/>
            <tr style={{background:C.subtle,borderTop:`2px solid ${C.border}`}}>
              <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.t1,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W}}>NET TOTAL (IDR)</td>
              {quotations.map((qt,i)=>{
                const net=nets[i]; const isBest=net===bestNet&&quotations.length>1;
                return (
                  <td key={qt.id} style={{padding:"11px 14px",fontSize:14,fontWeight:700,textAlign:"right" as const,color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.subtle,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
                    {idr(net)}{isBest&&<div style={{fontSize:10,color:C.ok,fontWeight:700,marginTop:2}}>★ Recommended</div>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Award Decision section */}
      <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"10px 16px",background:"#e8f0fb",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:12,color:"#0a3d6b"}}>
          Award Allocation per Vendor — Buyer's Proposal
        </div>
        {isService ? (
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:12,color:C.t2,marginBottom:10}}>Service RFQ: Select a single winner. Split award is not applicable for service contracts.</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap" as const,marginBottom:14}}>
              {quotations.map((qt,i)=>(
                <div key={qt.id} onClick={()=>setServiceWinner(qt.id)}
                  style={{flex:1,minWidth:160,padding:"12px 16px",borderRadius:6,border:`2px solid ${serviceWinner===qt.id?VDR_COLORS[i%VDR_COLORS.length]:C.border}`,background:serviceWinner===qt.id?C.infoBg:C.card,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="radio" checked={serviceWinner===qt.id} onChange={()=>setServiceWinner(qt.id)} style={{accentColor:VDR_COLORS[i%VDR_COLORS.length]}}/>
                    <span style={{fontWeight:700,fontSize:13,color:VDR_COLORS[i%VDR_COLORS.length]}}>{qt.vendorName}</span>
                  </div>
                  <div style={{fontSize:11,color:C.t2,marginTop:4}}>{idr(calcNet(qt))}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:6}}>Rationale (select all that apply):</div>
              <div style={{display:"flex",flexWrap:"wrap" as const,gap:6}}>
                {ratOpts.map(opt=>(
                  <button key={opt} onClick={()=>toggleServiceRationale(opt)}
                    style={{padding:"4px 10px",borderRadius:12,border:`1px solid ${serviceRationales.includes(opt)?C.primary:C.border}`,background:serviceRationales.includes(opt)?C.infoBg:C.card,color:serviceRationales.includes(opt)?C.primary:C.t2,fontSize:11,cursor:"pointer",fontWeight:serviceRationales.includes(opt)?700:400}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:4}}>Additional Note:</div>
              <TA value={serviceNote} onChange={setServiceNote} placeholder="Optional justification note…"/>
            </div>
          </div>
        ) : (
          <div style={{display:"flex",gap:0}}>
            {quotations.map((qt,i)=>{
              const a = allocations[qt.id];
              return (
                <div key={qt.id} style={{flex:1,padding:"14px 16px",borderRight:i<quotations.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{fontWeight:700,fontSize:12,color:VDR_COLORS[i%VDR_COLORS.length],marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${VDR_COLORS[i%VDR_COLORS.length]}33`}}>{qt.vendorName}</div>
                  {/* Segmented toggle */}
                  <div style={{display:"flex",borderRadius:4,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:12}}>
                    {(["Full","Partial","None"] as const).map(m=>(
                      <button key={m} onClick={()=>setMode(qt.id,m)}
                        style={{flex:1,padding:"5px 0",fontSize:11,fontFamily:"inherit",cursor:"pointer",fontWeight:a.mode===m?700:400,
                          background:a.mode===m?(m==="None"?C.errBg:m==="Full"?C.okBg:C.infoBg):C.card,
                          color:a.mode===m?(m==="None"?C.err:m==="Full"?C.ok:C.info):C.t2,
                          border:"none",borderLeft:m!=="Full"?`1px solid ${C.border}`:"none"}}>
                        {m}
                      </button>
                    ))}
                  </div>
                  {/* Partial qty table */}
                  {a.mode==="Partial"&&(
                    <div style={{marginBottom:12}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                        <thead><tr style={{background:C.subtle}}>
                          <th style={{padding:"5px 8px",textAlign:"left" as const,color:C.t2,fontWeight:700}}>Item</th>
                          <th style={{padding:"5px 8px",textAlign:"right" as const,color:C.t2,fontWeight:700}}>Max Qty</th>
                          <th style={{padding:"5px 8px",textAlign:"right" as const,color:C.t2,fontWeight:700}}>Award Qty</th>
                        </tr></thead>
                        <tbody>{(rfq.items||[]).map(it=>(
                          <tr key={it.no} style={{borderBottom:`1px solid ${C.border}`}}>
                            <td style={{padding:"4px 8px",color:C.t1,fontSize:11,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}} title={it.desc}>{it.desc}</td>
                            <td style={{padding:"4px 8px",textAlign:"right" as const,color:C.t2}}>{it.qty} {it.uom}</td>
                            <td style={{padding:"3px 8px",textAlign:"right" as const}}>
                              <input type="number" min={0} max={it.qty} value={a.qtys[it.no]||""} onChange={e=>setQty(qt.id,it.no,e.target.value)}
                                style={{width:60,padding:"3px 5px",border:`1px solid ${C.border}`,borderRadius:3,background:C.field,color:C.t1,fontSize:11,textAlign:"right" as const}}/>
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                  {/* Rationale chips */}
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.t2,marginBottom:5,textTransform:"uppercase" as const,letterSpacing:.5}}>Rationale</div>
                    <div style={{display:"flex",flexWrap:"wrap" as const,gap:4}}>
                      {ratOpts.map(opt=>(
                        <button key={opt} onClick={()=>toggleRationale(qt.id,opt)}
                          style={{padding:"3px 8px",borderRadius:10,border:`1px solid ${a.rationales.includes(opt)?VDR_COLORS[i%VDR_COLORS.length]:C.border}`,background:a.rationales.includes(opt)?"rgba(10,110,209,0.08)":C.card,color:a.rationales.includes(opt)?VDR_COLORS[i%VDR_COLORS.length]:C.t2,fontSize:10,cursor:"pointer",fontWeight:a.rationales.includes(opt)?700:400}}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Preview sentence */}
                  {a.mode!=="None"&&(
                    <div style={{marginTop:8,padding:"7px 10px",background:C.subtle,borderRadius:4,fontSize:11,color:C.t2,fontStyle:"italic",lineHeight:1.5}}>
                      {buildPreview(qt.id)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <a href="https://sap.example.com/F2238" target="_blank" rel="noreferrer"
          style={{fontSize:12,color:C.primary,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>
          <SapIcon name="action" size={12} color={C.primary}/> Open in SAP F2238 ↗
        </a>
        <div style={{display:"flex",gap:8}}>
          <Btn v="neutral" onClick={onClose}>Cancel</Btn>
          <Btn v="ghost" onClick={()=>{
            // Save draft — just close without transitioning status
            onClose();
          }}>Save draft</Btn>
          <Btn v="primary" onClick={handleSubmit}>Submit for Approval →</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ── Review Award Modal (approver view — read-only) ─────────────
const ReviewAwardModal = ({rfq, quotations, user, onClose, onApprove, onReject}) => {
  const isService = rfq.rfqType === "Service";
  const proposal = rfq.awardProposal;
  const calcNet = qt => {
    const pc = qt.priceConditions||{};
    const sub = qt.totalAmt;
    return sub - sub*(pc.discount||0)/100 + sub*(pc.surcharge||0)/100 + (pc.freight||0) + (pc.insurance||0);
  };
  const nets = quotations.map(calcNet);
  const bestNet = Math.min(...nets);
  const LABEL_W = 220;
  const COL_W = Math.max(190, Math.floor(880/quotations.length));
  const itemBestPrice = (rfq.items||[]).map((_,ii)=>{
    const prices = quotations.map(qt=>qt.items?.[ii]?.unitPrice??Infinity).filter(p=>isFinite(p));
    return prices.length ? Math.min(...prices) : null;
  });
  const SectionHdr = ({title}) => (
    <tr><td colSpan={quotations.length+1} style={{padding:"7px 14px",background:C.subtle,fontWeight:700,fontSize:10,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.8,borderTop:`2px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>{title}</td></tr>
  );
  const Row = ({label, vals, fmt=null, bestVal=null, bold=false, sub=false}:any) => (
    <tr style={{borderBottom:`1px solid ${C.border}`}}>
      <td style={{padding:"7px 14px",fontSize:sub?11:12,color:sub?C.t2:C.t1,fontWeight:500,background:C.card,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W,whiteSpace:"nowrap" as const,paddingLeft:sub?24:14}}>{label}</td>
      {vals.map((v,i)=>{
        const isBest = bestVal!=null && v===bestVal && quotations.length>1;
        return (
          <td key={i} style={{padding:"7px 14px",fontSize:12,fontWeight:bold?700:400,textAlign:"right" as const,color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.card,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
            {fmt ? fmt(v) : (v||"—")}
            {isBest && <span style={{fontSize:9,marginLeft:4,color:C.ok,fontWeight:700}}>★ BEST</span>}
          </td>
        );
      })}
    </tr>
  );
  const handleReject = () => {
    if (!window.confirm("Reject this award proposal? It will be returned to the buyer.")) return;
    onReject();
  };
  return (
    <Modal title={`Review Award Proposal — ${rfq.id}`} onClose={onClose} width="92vw">
      {/* Header */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <span style={{fontSize:15,fontWeight:700,color:C.t1}}>{rfq.title}</span>
          <span style={{background:"#fff8e1",color:"#856404",border:"1px solid #f0d080",borderRadius:12,fontSize:11,fontWeight:700,padding:"2px 10px"}}>Award Proposed — Read Only</span>
          <span style={{background:isService?"#f3eeff":"#e8f5fb",color:isService?"#6f2da8":"#0a6ed1",border:`1px solid ${isService?"#d0b8ff":"#a8d8f0"}`,borderRadius:12,fontSize:11,fontWeight:700,padding:"2px 10px"}}>{isService?"Service":"Material"}</span>
        </div>
        {/* Info banner */}
        <div style={{background:"#f3eeff",border:"1px solid #d0b8ff",borderRadius:5,padding:"8px 14px",fontSize:12,display:"flex",gap:18,flexWrap:"wrap" as const,color:"#4a235a"}}>
          <span><strong>Status:</strong> {rfq.status}</span>
          <span><strong>Proposed by:</strong> {proposal?.proposedBy||"—"}</span>
          <span><strong>Submitted:</strong> {fmtDate(proposal?.proposedAt)}</span>
          <span><strong>Quotations:</strong> {quotations.length}</span>
        </div>
      </div>
      {/* Vendor header cards */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" as const}}>
        {quotations.map((qt,i)=>(
          <div key={qt.id} style={{flex:1,minWidth:160,padding:"10px 14px",background:C.subtle,borderRadius:6,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:VDR_COLORS[i%VDR_COLORS.length]}}>{qt.vendorName}</div>
            <div style={{fontSize:10,color:C.t2,marginTop:2}}>{qt.vendorId} · {qt.id}</div>
            <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" as const}}>
              <Badge s={qt.status}/>
              <span style={{fontSize:11,fontWeight:700,color:calcNet(qt)===bestNet&&quotations.length>1?C.ok:C.t1}}>{idr(calcNet(qt))}</span>
              {calcNet(qt)===bestNet&&quotations.length>1&&<span style={{fontSize:10,color:C.ok,fontWeight:700}}>★ Lowest</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Comparison table */}
      <div style={{overflow:"auto",border:`1px solid ${C.border}`,borderRadius:6,maxHeight:"40vh",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:LABEL_W+COL_W*quotations.length}}>
          <thead><tr style={{position:"sticky" as const,top:0,zIndex:2}}>
            <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"left" as const,background:C.subtle,borderRight:`1px solid ${C.border}`,borderBottom:`2px solid ${C.border}`,minWidth:LABEL_W}}>Parameter</th>
            {quotations.map((qt,i)=>(
              <th key={qt.id} style={{padding:"9px 14px",fontSize:11,fontWeight:700,textAlign:"center" as const,color:VDR_COLORS[i%VDR_COLORS.length],background:C.subtle,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,minWidth:COL_W}}>{qt.vendorName}</th>
            ))}
          </tr></thead>
          <tbody>
            <SectionHdr title="Vendor Information"/>
            <Row label="Vendor Number" vals={quotations.map(q=>q.vendorId)}/>
            <Row label="Vendor Name" vals={quotations.map(q=>q.vendorName)}/>
            <Row label="Submitted Date" vals={quotations.map(q=>fmtDate(q.submittedDate))}/>
            <Row label="Valid Until" vals={quotations.map(q=>fmtDate(q.validUntil))}/>
            <SectionHdr title="Commercial Terms"/>
            <Row label="Terms of Payment" vals={quotations.map(q=>q.termsOfPayment||"—")}/>
            <Row label="Delivery Terms" vals={quotations.map(q=>q.deliveryTerms||"—")}/>
            <Row label="Lead Time" vals={quotations.map(q=>q.leadTime||"—")}/>
            <SectionHdr title="Line Items — Price Comparison"/>
            {(rfq.items||[]).map((item,ii)=>(
              <Fragment key={ii}>
                <tr style={{background:C.infoBg}}>
                  <td colSpan={quotations.length+1} style={{padding:"5px 14px 5px 28px",fontSize:11,fontWeight:700,color:C.info,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
                    {String(item.no).padStart(3,"0")} · {item.desc}<span style={{fontWeight:400,color:C.t2,marginLeft:8}}>({item.qty} {item.uom})</span>
                  </td>
                </tr>
                <Row label="Unit Price (IDR)" vals={quotations.map(q=>q.items?.[ii]?.unitPrice||0)} fmt={v=>idr(v)} bestVal={itemBestPrice[ii]} bold sub/>
                <Row label="Item Total (IDR)" vals={quotations.map(q=>q.items?.[ii]?.total||0)} fmt={v=>idr(v)} sub/>
              </Fragment>
            ))}
            <SectionHdr title="Price Conditions & Summary"/>
            <Row label="Subtotal" vals={quotations.map(q=>q.totalAmt)} fmt={v=>idr(v)}/>
            <Row label="Discount (%)" vals={quotations.map(q=>`${q.priceConditions?.discount||0}%`)}/>
            <tr style={{background:C.subtle,borderTop:`2px solid ${C.border}`}}>
              <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.t1,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W}}>NET TOTAL (IDR)</td>
              {quotations.map((qt,i)=>{
                const net=nets[i]; const isBest=net===bestNet&&quotations.length>1;
                return (
                  <td key={qt.id} style={{padding:"11px 14px",fontSize:14,fontWeight:700,textAlign:"right" as const,color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.subtle,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
                    {idr(net)}{isBest&&<div style={{fontSize:10,color:C.ok,fontWeight:700,marginTop:2}}>★ Recommended</div>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Award proposal read-only section */}
      <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden",marginBottom:16,pointerEvents:"none",opacity:0.9}}>
        <div style={{padding:"10px 16px",background:"#fff8e1",borderBottom:`1px solid #f0d080`,fontWeight:700,fontSize:12,color:"#856404"}}>
          Buyer's Award Proposal (Read Only)
        </div>
        {proposal ? (
          <div style={{padding:"14px 16px"}}>
            {isService && proposal.type==="Service" ? (
              <div>
                <div style={{fontSize:12,color:C.t2,marginBottom:8}}><strong>Winner:</strong> {quotations.find(q=>q.id===proposal.winnerId)?.vendorName||proposal.winnerId}</div>
                {proposal.rationales?.length>0&&<div style={{fontSize:12,color:C.t2,marginBottom:8}}><strong>Rationale:</strong> {proposal.rationales.join(", ")}</div>}
                {proposal.note&&<div style={{fontSize:12,color:C.t2}}><strong>Note:</strong> {proposal.note}</div>}
              </div>
            ) : (
              <div style={{display:"flex",gap:0}}>
                {quotations.map((qt,i)=>{
                  const a = proposal.allocations?.[qt.id];
                  return (
                    <div key={qt.id} style={{flex:1,padding:"12px 14px",borderRight:i<quotations.length-1?`1px solid ${C.border}`:"none"}}>
                      <div style={{fontWeight:700,fontSize:12,color:VDR_COLORS[i%VDR_COLORS.length],marginBottom:8}}>{qt.vendorName}</div>
                      <div style={{padding:"5px 10px",borderRadius:4,display:"inline-block",fontSize:12,fontWeight:700,marginBottom:8,
                        background:a?.mode==="None"?C.errBg:a?.mode==="Full"?C.okBg:C.infoBg,
                        color:a?.mode==="None"?C.err:a?.mode==="Full"?C.ok:C.info}}>
                        {a?.mode||"None"}
                      </div>
                      {a?.rationales?.length>0&&<div style={{fontSize:11,color:C.t2,marginBottom:6}}>{a.rationales.join(", ")}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div style={{padding:"14px 16px",color:C.t2,fontSize:12,fontStyle:"italic"}}>No proposal data available.</div>
        )}
      </div>
      {/* Footer */}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <Btn v="neutral" onClick={onClose}>Cancel</Btn>
        <Btn v="danger" onClick={handleReject}>Reject</Btn>
        <Btn v="success" onClick={onApprove}>Approve Award</Btn>
      </div>
    </Modal>
  );
};

const QuotationCompareModal = ({rfq, quotations, onClose}) => {
  const calcNet = qt => {
    const pc = qt.priceConditions||{};
    const sub = qt.totalAmt;
    return sub - sub*(pc.discount||0)/100 + sub*(pc.surcharge||0)/100 + (pc.freight||0) + (pc.insurance||0);
  };
  const nets = quotations.map(calcNet);
  const bestNet = Math.min(...nets);
  const itemBestPrice = (rfq.items||[]).map((_,ii)=>{
    const prices = quotations.map(qt=>qt.items?.[ii]?.unitPrice??Infinity).filter(p=>isFinite(p));
    return prices.length ? Math.min(...prices) : null;
  });
  const LABEL_W = 220;
  const COL_W = Math.max(190, Math.floor(880/quotations.length));
  const SectionHdr = ({title}) => (
    <tr><td colSpan={quotations.length+1} style={{padding:"7px 14px",background:C.subtle,fontWeight:700,fontSize:10,color:C.t2,textTransform:"uppercase",letterSpacing:.8,borderTop:`2px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>{title}</td></tr>
  );
  const Row = ({label, vals, fmt=null, bestVal=null, bold=false, sub=false}:any) => (
    <tr style={{borderBottom:`1px solid ${C.border}`}}>
      <td style={{padding:"7px 14px",fontSize:sub?11:12,color:sub?C.t2:C.t1,fontWeight:500,background:C.card,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W,whiteSpace:"nowrap",paddingLeft:sub?24:14}}>{label}</td>
      {vals.map((v,i)=>{
        const isBest = bestVal!=null && v===bestVal && quotations.length>1;
        return (
          <td key={i} style={{padding:"7px 14px",fontSize:12,fontWeight:bold?700:400,textAlign:"right",color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.card,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
            {fmt ? fmt(v) : (v||"—")}
            {isBest && <span style={{fontSize:9,marginLeft:4,color:C.ok,fontWeight:700}}>★ BEST</span>}
          </td>
        );
      })}
    </tr>
  );
  return (
    <Modal title={`Quotation Comparison · ${rfq.title}`} onClose={onClose} width="90vw">
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {quotations.map((qt,i)=>(
          <div key={qt.id} style={{flex:1,minWidth:160,padding:"10px 14px",background:C.subtle,borderRadius:6,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:VDR_COLORS[i%VDR_COLORS.length]}}>{qt.vendorName}</div>
            <div style={{fontSize:10,color:C.t2,marginTop:2}}>{qt.vendorId} · {qt.id}</div>
            <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <Badge s={qt.status}/>
              <span style={{fontSize:11,fontWeight:700,color:calcNet(qt)===bestNet&&quotations.length>1?C.ok:C.t1}}>{idr(calcNet(qt))}</span>
              {calcNet(qt)===bestNet&&quotations.length>1&&<span style={{fontSize:10,color:C.ok,fontWeight:700}}>★ Lowest</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"6px 12px",background:C.infoBg,borderRadius:4,marginBottom:12,fontSize:11,color:C.info,display:"flex",gap:16,flexWrap:"wrap"}}>
        <span><strong>RFQ:</strong> {rfq.id}</span>
        <span><strong>Category:</strong> {rfq.cat}</span>
        <span><strong>Purch. Org:</strong> {rfq.purchOrg||"—"}</span>
        <span><strong>Purch. Group:</strong> {pgLabel(rfq.purchGroup)}</span>
        <span><strong>Company:</strong> {rfq.companyCode||"—"}</span>
        <span><strong>Plant:</strong> {rfq.plant||"—"}</span>
        <span><strong>Est. Budget:</strong> {idr(rfq.estVal)}</span>
      </div>
      <div style={{overflow:"auto",border:`1px solid ${C.border}`,borderRadius:6,maxHeight:"55vh"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:LABEL_W+COL_W*quotations.length}}>
          <thead><tr style={{position:"sticky",top:0,zIndex:2}}>
            <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"left",background:C.subtle,borderRight:`1px solid ${C.border}`,borderBottom:`2px solid ${C.border}`,minWidth:LABEL_W}}>Parameter</th>
            {quotations.map((qt,i)=>(
              <th key={qt.id} style={{padding:"9px 14px",fontSize:11,fontWeight:700,textAlign:"center",color:VDR_COLORS[i%VDR_COLORS.length],background:C.subtle,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,minWidth:COL_W}}>{qt.vendorName}</th>
            ))}
          </tr></thead>
          <tbody>
            <SectionHdr title="Vendor Information"/>
            <Row label="Vendor Number" vals={quotations.map(q=>q.vendorId)}/>
            <Row label="Vendor Name" vals={quotations.map(q=>q.vendorName)}/>
            <Row label="Sales Person / Contact" vals={quotations.map(q=>q.salesPerson||"—")}/>
            <Row label="Quotation ID" vals={quotations.map(q=>q.id)}/>
            <Row label="Submitted Date" vals={quotations.map(q=>fmtDate(q.submittedDate))}/>
            <Row label="Valid Until" vals={quotations.map(q=>fmtDate(q.validUntil))}/>
            <Row label="Status" vals={quotations.map(q=>q.status)}/>
            <SectionHdr title="Purchasing Details"/>
            <Row label="Purchasing Organization" vals={quotations.map(()=>rfq.purchOrg||"—")}/>
            <Row label="Purchasing Group" vals={quotations.map(q=>pgLabel(q.purchGroup||rfq.purchGroup))}/>
            <SectionHdr title="Commercial Terms"/>
            <Row label="Terms of Payment" vals={quotations.map(q=>q.termsOfPayment||"—")}/>
            <Row label="Delivery Terms (Incoterms)" vals={quotations.map(q=>q.deliveryTerms||"—")}/>
            <Row label="Lead Time" vals={quotations.map(q=>q.leadTime||"—")}/>
            <Row label="Warranty Period" vals={quotations.map(q=>q.warrantyPeriod||"—")}/>
            <SectionHdr title="Line Items — Price Comparison"/>
            {(rfq.items||[]).map((item,ii)=>(
              <>
                <tr key={`ih-${ii}`} style={{background:C.infoBg}}>
                  <td colSpan={quotations.length+1} style={{padding:"5px 14px 5px 28px",fontSize:11,fontWeight:700,color:C.info,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
                    {String(item.no).padStart(3,"0")} · {item.desc}<span style={{fontWeight:400,color:C.t2,marginLeft:8}}>({item.qty} {item.uom})</span>
                  </td>
                </tr>
                <Row key={`mg-${ii}`} label="Product / Material Group" vals={quotations.map(q=>q.items?.[ii]?.materialGroup||item.materialGroup||"—")} sub/>
                <Row key={`up-${ii}`} label="Unit Price (IDR)" vals={quotations.map(q=>q.items?.[ii]?.unitPrice||0)} fmt={v=>idr(v)} bestVal={itemBestPrice[ii]} bold sub/>
                <Row key={`tot-${ii}`} label="Item Total (IDR)" vals={quotations.map(q=>q.items?.[ii]?.total||0)} fmt={v=>idr(v)} sub/>
              </>
            ))}
            <SectionHdr title="Price Conditions & Summary"/>
            <Row label="Subtotal" vals={quotations.map(q=>q.totalAmt)} fmt={v=>idr(v)}/>
            <Row label="Discount (%)" vals={quotations.map(q=>`${q.priceConditions?.discount||0}%`)}/>
            <Row label="Discount Amount" vals={quotations.map(q=>q.totalAmt*(q.priceConditions?.discount||0)/100)} fmt={v=>v>0?`(${idr(v)})`:"—"} sub/>
            <Row label="Surcharge (%)" vals={quotations.map(q=>`${q.priceConditions?.surcharge||0}%`)}/>
            <Row label="Surcharge Amount" vals={quotations.map(q=>q.totalAmt*(q.priceConditions?.surcharge||0)/100)} fmt={v=>v>0?idr(v):"—"} sub/>
            <Row label="Freight Cost" vals={quotations.map(q=>q.priceConditions?.freight||0)} fmt={v=>v>0?idr(v):"—"}/>
            <Row label="Insurance Cost" vals={quotations.map(q=>q.priceConditions?.insurance||0)} fmt={v=>v>0?idr(v):"—"}/>
            <tr style={{background:C.subtle,borderTop:`2px solid ${C.border}`}}>
              <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.t1,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W}}>NET TOTAL (IDR)</td>
              {quotations.map((qt,i)=>{
                const net=nets[i]; const isBest=net===bestNet&&quotations.length>1;
                return (
                  <td key={qt.id} style={{padding:"11px 14px",fontSize:14,fontWeight:700,textAlign:"right",color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.subtle,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
                    {idr(net)}
                    {isBest&&<div style={{fontSize:10,color:C.ok,fontWeight:700,marginTop:2}}>★ Recommended (Lowest Net)</div>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{marginTop:12,padding:"10px 14px",background:C.subtle,borderRadius:4,fontSize:11,color:C.t2}}>
        <strong style={{color:C.t1}}>💡 Other suggested evaluation criteria (not automated):</strong>
        {" "}TKDN / Local Content %, ISO & SNI Certification, After-Sales Support SLA, Vendor Track Record & References, Financial Health (Bonafide Score), HSE Compliance Record, Delivery Reliability History, ESG Rating.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
        <Btn v="neutral" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
};

// ── Discussion Box ─────────────────────────────────────────────
const ROLE_COLOR_MAP = {
  "Procurement Manager": "#0a6ed1",
  "Senior Buyer":        "#107e3e",
  "Finance Approver":    "#6f2da8",
};
const userRoleLabel = (user) => {
  if(!user) return "BRM";
  if(user.role==="approver") return "Finance Approver";
  if(user.name==="Siti Rahma") return "Senior Buyer";
  return "Procurement Manager";
};
const avatarInitials = (name="") => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

const DiscussionBox = ({rfqId, discussions=[], onPost, user}) => {
  const [msg, setMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const submit = () => {
    const t = msg.trim();
    if(!t) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2,"0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    onPost(rfqId, {
      id: `D-${uid()}`,
      userId:   user.username,
      userName: user.name,
      role:     userRoleLabel(user),
      postedAt: ts,
      message:  t,
    });
    setMsg("");
    setTimeout(() => endRef.current?.scrollIntoView({behavior:"smooth"}), 50);
  };

  const myRole = userRoleLabel(user);

  return (
    <div style={{borderTop:`1px solid ${C.border}`, padding:"14px 16px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
        <SapIcon name="discussion" size={14} color={C.t2}/>
        <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>
          Discussion ({discussions.length})
        </span>
      </div>

      {/* Messages */}
      <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:300,overflowY:"auto",marginBottom:14,paddingRight:4}}>
        {discussions.length===0&&(
          <div style={{padding:"10px 0",color:C.t2,fontSize:13,fontStyle:"italic"}}>
            No discussion yet. Be the first to comment.
          </div>
        )}
        {discussions.map((d,i)=>{
          const isMe = d.userId===user?.username;
          const roleColor = ROLE_COLOR_MAP[d.role] || C.t2;
          return (
            <div key={d.id||i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:roleColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:"#fff"}}>
                {avatarInitials(d.userName)}
              </div>
              <div style={{flex:1,background:isMe?C.infoBg:C.subtle,borderRadius:8,padding:"8px 12px",border:`1px solid ${isMe?C.primary+"44":C.border}`}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap" as const,marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:12,color:roleColor}}>{d.userName}</span>
                  <span style={{fontSize:11,color:C.t2,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"0 6px"}}>{d.role}</span>
                  <span style={{fontSize:11,color:C.t2,marginLeft:"auto"}}>{d.postedAt}</span>
                </div>
                <div style={{fontSize:13,color:C.t1,lineHeight:1.55,whiteSpace:"pre-wrap" as const}}>{d.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:ROLE_COLOR_MAP[myRole]||C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:"#fff"}}>
          {avatarInitials(user?.name||"U")}
        </div>
        <div style={{flex:1,border:`1px solid ${C.fieldBorder}`,borderRadius:6,background:C.field,overflow:"hidden"}}>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}
            placeholder="Write your suggestion, note, or question… (Enter to send, Shift+Enter for newline)"
            rows={2}
            style={{width:"100%",border:"none",outline:"none",resize:"none" as const,padding:"8px 10px",fontSize:13,fontFamily:"inherit",background:"transparent",color:C.t1,boxSizing:"border-box" as const}}/>
        </div>
        <Btn v="primary" sm onClick={submit}>
          <SapIcon name="paper-plane" size={13} color="#fff"/> Send
        </Btn>
      </div>
      <div style={{fontSize:11,color:C.t2,marginTop:4,marginLeft:40}}>Enter to send · Shift+Enter for new line</div>
    </div>
  );
};

// ── BRM RFQ Mgmt ───────────────────────────────────────────────
// Status indicator — all 4 shapes in a row; active = filled color, inactive = grey fill + dark outline
const RfqStatusIcon = ({s}) => {
  const STEPS = [
    {key:"Created",    shape:"diamond",  color:"#5b738b"},
    {key:"Open",       shape:"square",   color:"#0854a0"},
    {key:"Scored",     shape:"triangle", color:"#6f2da8"},
    {key:"Closed",     shape:"circle",   color:"#6a6d70"},
  ];
  const SZ = 13;
  const INACTIVE_FILL   = "#C8CDD2";
  const INACTIVE_STROKE = "#2C3E50";
  const SW = 1.2;
  return (
    <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
      {STEPS.map(st => {
        const active = st.key === s;
        const fill   = active ? st.color : INACTIVE_FILL;
        const stroke = active ? st.color : INACTIVE_STROKE;
        if (st.shape === "diamond") return (
          <svg key={st.key} width={SZ} height={SZ} viewBox="0 0 18 18" style={{flexShrink:0}}>
            <polygon points="9,1 17,9 9,17 1,9" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round"/>
          </svg>
        );
        if (st.shape === "triangle") return (
          <svg key={st.key} width={SZ} height={SZ} viewBox="0 0 18 18" style={{flexShrink:0}}>
            <polygon points="9,2 16.5,15.5 1.5,15.5" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round"/>
          </svg>
        );
        if (st.shape === "circle" || st.shape === "circle2") return (
          <svg key={st.key} width={SZ} height={SZ} viewBox="0 0 18 18" style={{flexShrink:0}}>
            <circle cx="9" cy="9" r="7" fill={fill} stroke={stroke} strokeWidth={SW}/>
          </svg>
        );
        return (
          <svg key={st.key} width={SZ} height={SZ} viewBox="0 0 18 18" style={{flexShrink:0}}>
            <rect x="1.5" y="1.5" width="15" height="15" rx="1" fill={fill} stroke={stroke} strokeWidth={SW}/>
          </svg>
        );
      })}
    </div>
  );
};

const RfqDocumentFlow = ({rfq, quotations}) => {
  const ap = rfq.awardProposal;
  const isService = rfq.rfqType==="Service";

  const getWinnerVendorId = () => {
    if(!ap) return null;
    if(isService) return ap.serviceWinner;
    if(!ap.allocations) return null;
    for(const [qtId, alloc] of Object.entries(ap.allocations as any)) {
      if((alloc as any).mode==="Full"||(alloc as any).mode==="Partial") {
        const qt = quotations.find(q=>q.id===qtId);
        return qt?.vendorId || null;
      }
    }
    return null;
  };
  const winVendorId = getWinnerVendorId();

  const sapNo = rfq.sapRfqNo||(`70${rfq.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);

  const l1Done = !!ap?.l1Approved || rfq.status==="Award Approved" || rfq.status==="Closed";
  const l2Done = !!ap?.l2Approved || rfq.status==="Award Approved" || rfq.status==="Closed";
  const awardDone = rfq.status==="Closed";

  const phaseLabel = (txt) => (
    <div style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:1,marginBottom:8,textAlign:"center" as const}}>{txt}</div>
  );

  const docCard = ({title,sub,status,statusColor,borderColor,faded=false}:{title:string,sub?:string,status:string,statusColor:string,borderColor:string,faded?:boolean}) => (
    <div style={{position:"relative",width:140,background:faded?"#f8f9fa":C.card,border:`1px solid ${borderColor}`,borderRadius:4,padding:"10px 10px 8px 10px",opacity:faded?0.55:1,overflow:"hidden",boxShadow:faded?"none":"0 1px 3px rgba(0,0,0,0.08)"}}>
      <div style={{position:"absolute",top:0,right:0,width:0,height:0,borderStyle:"solid",borderWidth:"12px 12px 0 0",borderColor:`${borderColor} transparent transparent transparent`}}/>
      <div style={{fontSize:11,fontWeight:700,color:faded?C.t2:C.t1,marginBottom:3,paddingRight:14,lineHeight:1.3}}>{title}</div>
      {sub&&<div style={{fontSize:10,color:C.t2,marginBottom:6,lineHeight:1.3}}>{sub}</div>}
      <div style={{display:"inline-block",fontSize:10,fontWeight:700,color:statusColor,background:`${statusColor}18`,padding:"1px 7px",borderRadius:8,border:`1px solid ${statusColor}40`}}>{status}</div>
    </div>
  );

  const arrow = (active:boolean, idx:number) => (
    <div style={{display:"flex",alignItems:"center",flexShrink:0,padding:"0 4px"}}>
      <svg width={40} height={20} viewBox="0 0 40 20">
        <defs>
          <marker id={`arrhd-${idx}-${active?1:0}`} markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={active?"#107e3e":"#c8cdd0"}/>
          </marker>
        </defs>
        <line x1={2} y1={10} x2={33} y2={10} stroke={active?"#107e3e":"#c8cdd0"} strokeWidth={1.5} strokeDasharray={active?"none":"4 3"} markerEnd={`url(#arrhd-${idx}-${active?1:0})`}/>
      </svg>
    </div>
  );

  const targets = rfq.targets || [];

  return (
    <div style={{overflowX:"auto",paddingBottom:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:0,minWidth:"fit-content",padding:"8px 4px"}}>

        {/* Phase 1: Sourcing */}
        <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center"}}>
          {phaseLabel("Sourcing")}
          {docCard({title:rfq.id,sub:sapNo,status:"In SAP",statusColor:"#0070f2",borderColor:"#b3c8f5"})}
        </div>

        <div style={{display:"flex",alignItems:"center",paddingTop:26}}>{arrow(true,0)}</div>

        {/* Phase 2: Evaluation */}
        <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center"}}>
          {phaseLabel("Evaluation")}
          <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
            {targets.map((vid,vi)=>{
              const qt = quotations.find(q=>q.rfqId===rfq.id&&q.vendorId===vid);
              const isWinner = vid===winVendorId && !!ap;
              const isRejected = qt?.status==="Rejected";
              const isLost = qt?.status==="Lost";
              const vendorName = qt?.vendorName || VENDORS[vid]?.name || vid;
              const shortName = vendorName.length>22 ? vendorName.substring(0,20)+"…" : vendorName;
              const statusTxt = isWinner?"Win":isRejected?"Rejected":isLost?"Lost":qt?"Submitted":"Pending";
              const statusColor = isWinner?"#107e3e":isRejected?"#bb0000":isLost?"#6a6d70":"#0070f2";
              const borderColor = isWinner?"#9FE1CB":isRejected?"#f5c2c2":C.border;
              return(
                <div key={vid} style={{position:"relative",width:140,background:C.card,border:`1px solid ${borderColor}`,borderLeft:`3px solid ${statusColor}`,borderRadius:4,padding:"8px 10px 6px 10px",overflow:"hidden",boxShadow:isWinner?"0 1px 4px rgba(16,126,62,0.2)":"0 1px 2px rgba(0,0,0,0.05)"}}>
                  <div style={{position:"absolute",top:0,right:0,width:0,height:0,borderStyle:"solid",borderWidth:"10px 10px 0 0",borderColor:`${borderColor} transparent transparent transparent`}}/>
                  <div style={{fontSize:11,fontWeight:700,color:C.t1,paddingRight:12,lineHeight:1.3,marginBottom:2}}>{shortName}</div>
                  {qt&&<div style={{fontSize:10,color:C.t2,marginBottom:4}}>{qt.id}</div>}
                  <div style={{display:"inline-block",fontSize:10,fontWeight:700,color:statusColor,background:`${statusColor}18`,padding:"1px 6px",borderRadius:8,border:`1px solid ${statusColor}40`}}>{statusTxt}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",paddingTop:26}}>{arrow(!!ap,1)}</div>

        {/* Phase 3: Approval L1 */}
        <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center"}}>
          {phaseLabel("Approval L1")}
          {docCard({
            title:"Finance Approver",
            sub:"Budi Santoso",
            status:l1Done?"Approved":rfq.status==="Award Proposed"&&!l1Done?"Pending":"Not Yet",
            statusColor:l1Done?"#107e3e":rfq.status==="Award Proposed"&&!l1Done?"#856404":"#6a6d70",
            borderColor:l1Done?"#9FE1CB":rfq.status==="Award Proposed"&&!l1Done?"#f0d080":C.border,
            faded:!ap,
          })}
        </div>

        <div style={{display:"flex",alignItems:"center",paddingTop:26}}>{arrow(l1Done,2)}</div>

        {/* Phase 4: Approval L2 */}
        <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center"}}>
          {phaseLabel("Approval L2")}
          {docCard({
            title:"Director",
            sub:"Arief Budiman",
            status:l2Done?"Approved":l1Done&&rfq.status==="Award Proposed"?"Pending":"Not Yet",
            statusColor:l2Done?"#107e3e":l1Done&&rfq.status==="Award Proposed"?"#856404":"#6a6d70",
            borderColor:l2Done?"#9FE1CB":l1Done&&rfq.status==="Award Proposed"?"#f0d080":C.border,
            faded:!l1Done,
          })}
        </div>

        <div style={{display:"flex",alignItems:"center",paddingTop:26}}>{arrow(l2Done,3)}</div>

        {/* Phase 5: Award */}
        <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center"}}>
          {phaseLabel("Award")}
          {docCard({
            title:"Purchase Order",
            sub:rfq.poNo||"—",
            status:awardDone?"PO Created":"Pending",
            statusColor:awardDone?"#107e3e":"#6a6d70",
            borderColor:awardDone?"#9FE1CB":C.border,
            faded:!l2Done,
          })}
        </div>

      </div>
    </div>
  );
};

export const BrmRfq = ({rfqs,setRfqs,quotations,setQuotations,user}) => {
  const [showForm,setForm]=useState(false);
  const [flt,setFlt]=useState("All");
  const [expanded,setExpanded]=useState({});
  const [compareData,setCompareData]=useState<any>(null);
  const [allExpanded,setAllExpanded]=useState(false);
  const [detailRfq,setDetailRfq]=useState<any>(null);
  const [awardModal,setAwardModal]=useState<{rfq:any,qts:any[]}|null>(null);
  const [reviewModal,setReviewModal]=useState<{rfq:any,qts:any[]}|null>(null);
  const getQtsForRfq = (rfqId) => quotations.filter(q=>q.rfqId===rfqId&&(q.status==="Submitted"||q.status==="Accepted"));
  const openAwardModal = (rfq) => { const qts=getQtsForRfq(rfq.id); setAwardModal({rfq,qts}); };
  const openReviewModal = (rfq) => { const qts=getQtsForRfq(rfq.id); setReviewModal({rfq,qts}); };
  const submitAwardProposal = (rfqId, proposal) => {
    setRfqs(p=>p.map(r=>r.id===rfqId?{...r,status:"Award Proposed",awardProposal:proposal}:r));
    setAwardModal(null);
  };
  const approveAward = (rfqId) => {
    const today = new Date().toISOString().split("T")[0];
    setRfqs(p=>p.map(r=>r.id===rfqId?{...r,status:"Award Approved",approvedBy:user?.name||user?.username||"Approver",approvedAt:today,awardProposal:{...r.awardProposal,status:"Approved"}}:r));
    setReviewModal(null);
  };
  const rejectAward = (rfqId) => {
    if(!window.confirm("Reject this award proposal? The RFQ will return to Scored status so the buyer can revise."))return;
    const today = new Date().toISOString().split("T")[0];
    setRfqs(p=>p.map(r=>r.id===rfqId?{...r,status:"Scored",awardProposal:{...r.awardProposal,status:"Rejected",rejectedBy:user.username,rejectedAt:today}}:r));
    setReviewModal(null);
  };
  const postDiscussion = (rfqId, entry) => setRfqs(p=>p.map(r=>r.id===rfqId?{...r,discussions:[...(r.discussions||[]),entry]}:r));
  const [rfqTab,setRfqTab]=useState("general");
  const [split,setSplit]=useState(52);
  const containerRef=useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const onSplitterDrag=(e)=>{
    e.preventDefault();
    const startX=e.clientX,startSplit=split;
    const containerW=containerRef.current?.offsetWidth||window.innerWidth;
    const onMove=(me)=>{const dx=me.clientX-startX;setSplit(Math.min(75,Math.max(25,startSplit-(dx/containerW)*100)));};
    const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  };
  const drag = useRef({active:false,startX:0,scrollLeft:0});
  const onDragDown = (e) => { if(!scrollRef.current)return; drag.current={active:true,startX:e.pageX-scrollRef.current.offsetLeft,scrollLeft:scrollRef.current.scrollLeft}; scrollRef.current.style.cursor="grabbing"; };
  const onDragMove = (e) => { if(!drag.current.active||!scrollRef.current)return; e.preventDefault(); const x=e.pageX-scrollRef.current.offsetLeft; scrollRef.current.scrollLeft=drag.current.scrollLeft-(x-drag.current.startX); };
  const onDragEnd  = () => { drag.current.active=false; if(scrollRef.current)scrollRef.current.style.cursor="grab"; };
  const [adaptOpen2,setAdaptOpen2]=useState(false);
  const [visibleFields2,setVisibleFields2]=useState<Set<string>>(new Set(ALL_RFQ_FILTER_FIELDS.filter(f=>f.defaultOn).map(f=>f.id)));

  const EMPTY_FLT2={rfqNo:"",rfqTitle:"",companyCodes:[],statuses:[],postedBy:"",category:"",openFrom:"",openTo:"",closingFrom:"",closingTo:"",purchOrg:"",plant:"",estValMin:"",estValMax:""};
  const [draft2,setDraft2]=useState(EMPTY_FLT2);
  const [applied,setApplied]=useState(EMPTY_FLT2);
  const sd2=(k,v)=>setDraft2(p=>({...p,[k]:v}));
  const applyFilters=()=>setApplied({...draft2});
  const resetFilters=()=>{setDraft2(EMPTY_FLT2);setApplied(EMPTY_FLT2);};
  const [vhOpen2,setVhOpen2]=useState<string|null>(null);
  const clrA2=(k)=>{setDraft2(p=>({...p,[k]:Array.isArray(EMPTY_FLT2[k])?[]:EMPTY_FLT2[k]}));setApplied(p=>({...p,[k]:Array.isArray(EMPTY_FLT2[k])?[]:EMPTY_FLT2[k]}));};

  const ALL_RFQ_STATUSES=["Created","Open","Scored","Award Proposed","Award Approved","Closed"];
  const ALL_CATEGORIES=[...new Set(rfqs.map(r=>r.cat).filter(Boolean))].sort();
  const POSTED_BY_ROWS=[...new Set(rfqs.map(r=>r.postedBy).filter(Boolean))].sort().map(n=>({v:n,l:n}));

  const activeTokens=[
    applied.companyCodes.length>0&&{label:"Company Code",val:applied.companyCodes.length===1?`${applied.companyCodes[0]} – ${ccName(applied.companyCodes[0])}`:`${applied.companyCodes.length} selected`,onClear:()=>clrA2("companyCodes")},
    applied.statuses.length>0&&{label:"Status",val:applied.statuses.length===1?applied.statuses[0]:`${applied.statuses.length} selected`,onClear:()=>clrA2("statuses")},
    applied.rfqNo&&{label:"RFQ No",val:applied.rfqNo,onClear:()=>clrA2("rfqNo")},
    applied.rfqTitle&&{label:"RFQ Title",val:applied.rfqTitle,onClear:()=>clrA2("rfqTitle")},
    applied.postedBy&&{label:"Tender Admin",val:applied.postedBy,onClear:()=>clrA2("postedBy")},
    applied.category&&{label:"Category",val:applied.category,onClear:()=>clrA2("category")},
    (applied.openFrom||applied.openTo)&&{label:"Open Date",val:[applied.openFrom&&fmtDate(applied.openFrom),applied.openTo&&fmtDate(applied.openTo)].filter(Boolean).join(" – "),onClear:()=>{clrA2("openFrom");clrA2("openTo");}},
    (applied.closingFrom||applied.closingTo)&&{label:"Closing Date",val:[applied.closingFrom&&fmtDate(applied.closingFrom),applied.closingTo&&fmtDate(applied.closingTo)].filter(Boolean).join(" – "),onClear:()=>{clrA2("closingFrom");clrA2("closingTo");}},
    applied.purchOrg&&{label:"Purch. Org",val:applied.purchOrg,onClear:()=>clrA2("purchOrg")},
    applied.plant&&{label:"Plant",val:applied.plant,onClear:()=>clrA2("plant")},
    applied.estValMin&&{label:"Est. Value ≥",val:`IDR ${Number(applied.estValMin).toLocaleString()}`,onClear:()=>clrA2("estValMin")},
    applied.estValMax&&{label:"Est. Value ≤",val:`IDR ${Number(applied.estValMax).toLocaleString()}`,onClear:()=>clrA2("estValMax")},
  ].filter(Boolean);

  const [f,setF]=useState({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",companyCode:"",plant:"",purchOrg:"",purchGroup:"",
    items:[{no:1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]});
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const list=rfqs
    .filter(r=>flt==="All"||r.status===flt)
    .filter(r=>applied.companyCodes.length===0||applied.companyCodes.includes(r.companyCode))
    .filter(r=>applied.statuses.length===0||applied.statuses.includes(r.status))
    .filter(r=>!applied.rfqNo    ||r.id?.toLowerCase().includes(applied.rfqNo.toLowerCase()))
    .filter(r=>!applied.rfqTitle ||r.title?.toLowerCase().includes(applied.rfqTitle.toLowerCase()))
    .filter(r=>!applied.postedBy ||r.postedBy?.toLowerCase().includes(applied.postedBy.toLowerCase()))
    .filter(r=>!applied.category ||r.cat===applied.category)
    .filter(r=>!applied.openFrom   ||(r.postedDate&&r.postedDate>=applied.openFrom))
    .filter(r=>!applied.openTo     ||(r.postedDate&&r.postedDate<=applied.openTo))
    .filter(r=>!applied.closingFrom||(r.closingDate&&r.closingDate>=applied.closingFrom))
    .filter(r=>!applied.closingTo  ||(r.closingDate&&r.closingDate<=applied.closingTo))
    .filter(r=>!applied.purchOrg   ||r.purchOrg?.toLowerCase().includes(applied.purchOrg.toLowerCase()))
    .filter(r=>!applied.plant      ||r.plant?.toLowerCase().includes(applied.plant.toLowerCase()))
    .filter(r=>!applied.estValMin  ||r.estVal>=Number(applied.estValMin))
    .filter(r=>!applied.estValMax  ||r.estVal<=Number(applied.estValMax));
  const getQts=rfqId=>quotations.filter(q=>q.rfqId===rfqId);
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));
  const [selIds,setSelIds]=useState(new Set<string>());
  const toggleSel=(id)=>setSelIds(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const allSel=list.length>0&&list.every(r=>selIds.has(r.id));
  const toggleAll=()=>setSelIds(allSel?new Set():new Set(list.map(r=>r.id)));
  const [showApproval,setShowApproval]=useState(false);
  const [showPublish,setShowPublish]=useState(false);
  // Derive contact info from VENDORS (populated from mockData in mock mode; empty object in BTP mode)
  const VENDOR_EMAILS:Record<string,{name:string,email:string,pic:string,phone:string}> = Object.fromEntries(
    Object.values(VENDORS as any).map((v:any)=>([v.id,{name:v.name,email:v.email||"",pic:v.rep||"",phone:v.phone||""}]))
  );
  const DEFAULT_REQ_DOCS=[
    {id:"doc1",label:"Company Profile",required:true,checked:true},
    {id:"doc2",label:"Proposal Teknis",required:true,checked:true},
    {id:"doc3",label:"Quotation / Penawaran Harga",required:true,checked:true},
    {id:"doc4",label:"Laporan Keuangan 2 Tahun Terakhir",required:true,checked:true},
    {id:"doc5",label:"NPWP / NIB (Nomor Induk Berusaha)",required:true,checked:true},
    {id:"doc6",label:"Akta Pendirian Perusahaan",required:false,checked:false},
    {id:"doc7",label:"Sertifikat ISO / Kompetensi",required:false,checked:false},
    {id:"doc8",label:"HSE Plan / Kebijakan K3",required:false,checked:false},
    {id:"doc9",label:"Surat Referensi / Pengalaman Kerja",required:false,checked:false},
    {id:"doc10",label:"Rekening Koran 3 Bulan Terakhir",required:false,checked:false},
  ];
  const EMPTY_PUB={invitationNo:"",invitationDate:new Date().toISOString().split("T")[0],submissionDeadline:"",submissionMethod:"Portal",notes:"",termsAndConditions:"",vendorInvitees:[] as {vendorId:string,name:string,email:string,pic:string,phone:string,include:boolean}[],requiredDocs:DEFAULT_REQ_DOCS.map(d=>({...d})),attachments:[] as {name:string,size:string,type:string}[]};
  const [pubForm,setPubForm]=useState<any>(EMPTY_PUB);
  const pu=(k,v)=>setPubForm(p=>({...p,[k]:v}));
  const updateInvitee=(vid,field,val)=>setPubForm(p=>({...p,vendorInvitees:p.vendorInvitees.map((v:any)=>v.vendorId===vid?{...v,[field]:val}:v)}));

  const openPublish=()=>{
    const sel=[...selIds].map(id=>rfqs.find(r=>r.id===id)).filter(Boolean);
    const allTargetIds=[...new Set(sel.flatMap((r:any)=>r.targets||[]))];
    const today=new Date().toISOString().split("T")[0];
    const latestClose=sel.map((r:any)=>r.closingDate).sort().reverse()[0]||"";
    const invNo=sel.length===1?sel[0].id:sel.map((r:any)=>r.id).join(", ");
    const invitees=allTargetIds.map(vid=>{const ve=VENDOR_EMAILS[vid]||{name:vid,email:"",pic:"",phone:""};return{vendorId:vid,...ve,include:true};});
    const rfqList=sel.map((r:any)=>`• ${r.id} – ${r.title}`).join("\n");
    const defaultNotes=`Yth. Tim Pengadaan,\n\nDengan hormat kami mengundang perusahaan Anda untuk berpartisipasi dalam proses pengadaan berikut:\n\n${rfqList}\n\nMohon menyampaikan penawaran harga sesuai dengan spesifikasi yang telah kami lampirkan. Penawaran dapat disubmit melalui BRM Vendor Portal sebelum batas waktu yang ditentukan.\n\nHormat kami,\nTim Pengadaan BRM Group`;
    const defaultTnc=`1. Penawaran harus disampaikan dalam format PDF melalui BRM Vendor Portal.\n2. Penawaran yang disampaikan setelah batas waktu tidak akan diproses.\n3. Harga penawaran harus dalam IDR dan sudah termasuk pajak (PPN 11%).\n4. Masa berlaku penawaran minimal 60 hari kalender sejak tanggal pengiriman.\n5. BRM Group berhak untuk menerima atau menolak penawaran tanpa memberikan alasan.\n6. Vendor wajib menjaga kerahasiaan dokumen pengadaan ini.\n7. Informasi lebih lanjut dapat menghubungi Procurement Team melalui portal.`;
    setPubForm({invitationNo:invNo,invitationDate:today,submissionDeadline:latestClose,submissionMethod:"Portal",notes:defaultNotes,termsAndConditions:defaultTnc,vendorInvitees:invitees,requiredDocs:DEFAULT_REQ_DOCS.map(d=>({...d})),attachments:[]});
    setShowPublish(true);
  };

  const submitPublish=()=>{
    const activeInvitees=pubForm.vendorInvitees.filter((v:any)=>v.include);
    if(activeInvitees.length===0){alert("Please include at least one vendor.");return;}
    const today=new Date().toISOString().split("T")[0];
    const sel=[...selIds];
    setRfqs(p=>p.map(r=>sel.includes(r.id)?{...r,status:"Open",publishedAt:today,invitationNo:pubForm.invitationNo,publishNotes:pubForm.notes}:r));
    setShowPublish(false);setPubForm(EMPTY_PUB);setSelIds(new Set());
  };

  const COMMITTEE_GROUPS={
    "Bulk Material":[{name:"Ahmad Rizki",role:"Chairperson"},{name:"Budi Santoso",role:"Member"},{name:"Dewi Rahayu",role:"Member"},{name:"Eko Prasetyo",role:"Secretary"},{name:"Farida Hanum",role:"Member"}],
    "Civil":[{name:"Ahmad Rizki",role:"Chairperson"},{name:"Gunawan Setiawan",role:"Member"},{name:"Hendra Wijaya",role:"Member"},{name:"Indah Pertiwi",role:"Secretary"},{name:"Joko Susilo",role:"Member"}],
    "Plant":[{name:"Ahmad Rizki",role:"Chairperson"},{name:"Krisna Murti",role:"Member"},{name:"Lestari Wulandari",role:"Member"},{name:"Muhamad Fauzi",role:"Secretary"},{name:"Nita Sari",role:"Member"}],
    "Mining":[{name:"Ahmad Rizki",role:"Chairperson"},{name:"Odi Pranata",role:"Member"},{name:"Putri Andini",role:"Member"},{name:"Rendra Kusuma",role:"Secretary"},{name:"Sari Dewi",role:"Member"}],
    "General":[{name:"Ahmad Rizki",role:"Chairperson"},{name:"Toni Wahyudi",role:"Member"},{name:"Umar Hakim",role:"Member"},{name:"Vera Kusumawati",role:"Secretary"},{name:"Wahyu Nugroho",role:"Member"}],
  };
  const EMPTY_APV={committeeGroup:"",justification:"",targetDate:"",priority:"Normal",budgetRef:"",wbsElement:"",attachments:[] as string[],remarks:""};
  const [apvForm,setApvForm]=useState(EMPTY_APV);
  const apv=(k,v)=>setApvForm(p=>({...p,[k]:v}));
  const COMMON_DOCS=["Technical Evaluation Report","Budget Approval Letter","Vendor Qualification Certificate","Scope of Work Document","Risk Assessment Report"];
  const toggleDoc=(doc)=>setApvForm(p=>({...p,attachments:p.attachments.includes(doc)?p.attachments.filter(d=>d!==doc):[...p.attachments,doc]}));
  const submitApproval=()=>{
    if(!apvForm.committeeGroup){alert("Please select a Tender Committee Group.");return;}
    if(!apvForm.justification){alert("Please provide approval justification.");return;}
    if(!apvForm.targetDate){alert("Please set a target approval date.");return;}
    const sel=[...selIds];
    const today=new Date().toISOString().split("T")[0];
    setRfqs(p=>p.map(r=>sel.includes(r.id)?{...r,status:"Scored",submittedForApprovalAt:today,submittedForApprovalBy:"Ahmad Rizki",committeeGroup:apvForm.committeeGroup,approvalPriority:apvForm.priority,approvalTargetDate:apvForm.targetDate}:r));
    setShowApproval(false);setApvForm(EMPTY_APV);setSelIds(new Set());
  };
  // ── Scoring (buyer step, produces Scored status) ──
  const [scoreModal,setScoreModal]=useState<any>(null);
  const [scores,setScores]=useState<{[qtId:string]:{technical:string,commercial:string,hse:string}}>({});
  const [scoreNotes,setScoreNotes]=useState("");
  const SCORE_CRITERIA=[
    {key:"technical",label:"Technical Aspect",weight:0.40,desc:"Scope coverage, methodology, experience, proposed team"},
    {key:"commercial",label:"Commercial Aspect",weight:0.40,desc:"Total price, payment terms, validity, price competitiveness"},
    {key:"hse",label:"HSE & Compliance",weight:0.20,desc:"Safety record, K3 certifications, BPJS enrollment, environmental permits"},
  ];
  const initScores=(qts)=>{const s={};qts.forEach(qt=>{const ex=qt.scores||{};s[qt.id]={technical:String(ex.technical||""),commercial:String(ex.commercial||""),hse:String(ex.hse||"")};});return s;};
  const getWeightedTotal=(qtId)=>{const s=scores[qtId]||{};const t=Number(s.technical)||0,c=Number(s.commercial)||0,h=Number(s.hse)||0;if(!s.technical&&!s.commercial&&!s.hse)return null;return Math.round(t*0.4+c*0.4+h*0.2);};
  const submitBuyerScores=()=>{
    if(!scoreNotes.trim()){alert("Please enter evaluation notes before submitting.");return;}
    const {rfq}=scoreModal;
    const today=new Date().toISOString().split("T")[0];
    setQuotations(p=>p.map(q=>{if(!scores[q.id])return q;const s=scores[q.id];return{...q,scores:{technical:Number(s.technical)||0,commercial:Number(s.commercial)||0,hse:Number(s.hse)||0,weighted:getWeightedTotal(q.id)||0}};}));
    setRfqs(p=>p.map(r=>r.id===rfq.id?{...r,status:"Scored",scoredAt:today,scoredBy:user?.name||"Buyer",scoreNotes}:r));
    setScoreModal(null);setScores({});setScoreNotes("");
    alert("Scoring submitted. RFQ is now in Scored status and ready for approval submission.");
  };
  const addItem=()=>setF(p=>({...p,items:[...p.items,{no:p.items.length+1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]}));
  const updItem=(i,k,v)=>setF(p=>({...p,items:p.items.map((it,j)=>j===i?{...it,[k]:v}:it)}));
  const publish=()=>{
    if(!f.title||!f.closingDate||f.targets.length===0){alert("Please fill title, closing date, and select at least one vendor.");return;}
    setRfqs(p=>[...p,{...f,id:`RFQ-${uid()}`,postedDate:new Date().toISOString().split("T")[0],postedBy:"Ahmad Rizki",status:"Created",estVal:Number(f.estVal),
      items:f.items.map(it=>({...it,qty:Number(it.qty),estPrice:Number(it.estPrice)}))}]);
    setForm(false);
    setF({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",companyCode:"",plant:"",purchOrg:"",purchGroup:"",
      items:[{no:1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]});
  };

  const HDR_COLS = ["","","Status","SAP RFQ No","RFQ Number","Description","Created Date","Open Date","Closing Date","Tender Admin","Budget","Co. Code","Plant","Quotations"];
  const [colW, setColW] = useState([28,32,90,130,115,180,85,85,90,105,120,60,50,75]);
  const colResize = useRef<{idx:number,startX:number,startW:number}|null>(null);
  const onResizeStart = (e,idx) => {
    e.stopPropagation(); e.preventDefault();
    colResize.current = {idx, startX:e.clientX, startW:colW[idx]};
    const onMove = (me) => {
      if(!colResize.current) return;
      const newW = Math.max(40, colResize.current.startW + (me.clientX - colResize.current.startX));
      setColW(prev => prev.map((w,i) => i===colResize.current!.idx ? newW : w));
    };
    const onUp = () => { colResize.current=null; document.removeEventListener("mousemove",onMove); document.removeEventListener("mouseup",onUp); };
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseup",onUp);
  };
  const _rfqTot = colW.reduce((a,b)=>a+b,0);
  const rfqMinW = _rfqTot;
  const gridCols = colW.map(w=>`${(w/_rfqTot*100).toFixed(3)}%`).join(" ");

  const CHILD_HDRS = ["#","Material / Service","Mat. No.","Material Group","Plant","Qty","UoM","Requirement Date"];
  const [colW2, setColW2] = useState([50,200,110,150,70,60,90,170]);
  const colResize2 = useRef<{idx:number,startX:number,startW:number}|null>(null);
  const onResizeStart2 = (e,idx) => {
    e.stopPropagation(); e.preventDefault();
    colResize2.current = {idx, startX:e.clientX, startW:colW2[idx]};
    const onMove = (me) => {
      if(!colResize2.current) return;
      const newW = Math.max(30, colResize2.current.startW + (me.clientX - colResize2.current.startX));
      setColW2(prev => prev.map((w,i) => i===colResize2.current!.idx ? newW : w));
    };
    const onUp = () => { colResize2.current=null; document.removeEventListener("mousemove",onMove); document.removeEventListener("mouseup",onUp); };
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseup",onUp);
  };
  const gridCols2 = colW2.map(w=>`${w}px`).join(" ");

  return (
  <div ref={containerRef} style={{display:"flex",alignItems:"flex-start",overflow:"hidden",width:"100%"}}>
    <div style={{flex:detailRfq?`0 0 ${100-split}%`:"1",padding:pg(),overflowX:"hidden",minWidth:0,transition:"flex 0.15s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>RFQ Management</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>📡 RFQ published to BTP Vendor Portal → Vendor notified → Quotations collected</div>
        </div>
      </div>

      <FioriBar activeTokens={activeTokens} onGo={applyFilters} onReset={resetFilters} onAdaptFilters={()=>setAdaptOpen2(true)} adaptFiltersCount={visibleFields2.size}>
        {visibleFields2.has("companyCodes")&&<FField label="Company Code"><ValueHelpInp selected={draft2.companyCodes} getLabel={k=>`${k} – ${ccName(k)}`} onOpen={()=>setVhOpen2("companyCode")} placeholder="All Company Codes"/></FField>}
        {visibleFields2.has("statuses")&&<FField label="Status"><ValueHelpInp selected={draft2.statuses} getLabel={k=>k} onOpen={()=>setVhOpen2("status")} placeholder="All Statuses"/></FField>}
        {visibleFields2.has("rfqNo")&&<FField label="RFQ Number"><Inp value={draft2.rfqNo} onChange={v=>sd2("rfqNo",v)} placeholder="e.g. RFQ-2025-0001"/></FField>}
        {visibleFields2.has("rfqTitle")&&<FField label="RFQ Title"><Inp value={draft2.rfqTitle} onChange={v=>sd2("rfqTitle",v)} placeholder="e.g. Laptops"/></FField>}
        {visibleFields2.has("category")&&<FField label="Category"><ValueHelpInp selected={draft2.category?[draft2.category]:[]} getLabel={k=>k} onOpen={()=>setVhOpen2("category")} placeholder="All Categories"/></FField>}
        {visibleFields2.has("postedBy")&&<FField label="Tender Administrator"><Inp value={draft2.postedBy} onChange={v=>sd2("postedBy",v)} placeholder="e.g. Ahmad Rizki"/></FField>}
        {visibleFields2.has("openDate")&&<FField label="Open Date Range"><DateRangePicker from={draft2.openFrom} to={draft2.openTo} onChange={(f,t)=>{sd2("openFrom",f);sd2("openTo",t);}}/></FField>}
        {visibleFields2.has("closingDate")&&<FField label="Closing Date Range"><DateRangePicker from={draft2.closingFrom} to={draft2.closingTo} onChange={(f,t)=>{sd2("closingFrom",f);sd2("closingTo",t);}}/></FField>}
        {visibleFields2.has("purchOrg")&&<FField label="Purchasing Org"><Inp value={draft2.purchOrg} onChange={v=>sd2("purchOrg",v)} placeholder="e.g. PO10"/></FField>}
        {visibleFields2.has("plant")&&<FField label="Plant"><Inp value={draft2.plant} onChange={v=>sd2("plant",v)} placeholder="e.g. PL01"/></FField>}
        {visibleFields2.has("estValMin")&&<FField label="Est. Value (From)"><Inp type="number" value={draft2.estValMin} onChange={v=>sd2("estValMin",v)} placeholder="Min (IDR)"/></FField>}
        {visibleFields2.has("estValMax")&&<FField label="Est. Value (To)"><Inp type="number" value={draft2.estValMax} onChange={v=>sd2("estValMax",v)} placeholder="Max (IDR)"/></FField>}
      </FioriBar>

      <AdaptFiltersDialog open={adaptOpen2} onClose={()=>setAdaptOpen2(false)} visibleFields={visibleFields2}
        onSave={s=>setVisibleFields2(s)} draft={draft2} allFields={ALL_RFQ_FILTER_FIELDS}
        hasValue={id=>{
          if(id==="companyCodes")return draft2.companyCodes.length>0;
          if(id==="statuses")return draft2.statuses.length>0;
          if(id==="openDate")return !!(draft2.openFrom||draft2.openTo);
          if(id==="closingDate")return !!(draft2.closingFrom||draft2.closingTo);
          return !!(draft2 as any)[id];
        }}/>

      {vhOpen2==="companyCode"&&(
        <ValueHelpDialog title="Company Code" cols={[{key:"v",label:"Code",width:80},{key:"l",label:"Company Name",width:220}]}
          rows={COMPANY_CODES} keyField="v" labelField="l"
          selected={draft2.companyCodes} onConfirm={s=>{sd2("companyCodes",s);setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}
      {vhOpen2==="status"&&(
        <ValueHelpDialog title="Status" cols={[{key:"v",label:"Status",width:180}]}
          rows={ALL_RFQ_STATUSES.map(s=>({v:s,l:s}))} keyField="v" labelField="l"
          selected={draft2.statuses} onConfirm={s=>{sd2("statuses",s);setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}
      {vhOpen2==="category"&&(
        <ValueHelpDialog title="Category" cols={[{key:"v",label:"Category",width:200}]}
          rows={ALL_CATEGORIES.map(c=>({v:c,l:c}))} keyField="v" labelField="l"
          selected={draft2.category?[draft2.category]:[]} multiSelect={false}
          onConfirm={s=>{sd2("category",s[0]||"");setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}

      <FilterBar opts={["All","Created","Open","Scored","Award Proposed","Award Approved","Closed"]} val={flt} onChange={setFlt}/>

      {/* Toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 12px",height:44,background:C.card,border:`1px solid ${C.border}`,borderBottom:"none",borderRadius:"8px 8px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14,fontWeight:700,color:C.t1,marginRight:6}}>RFQs</span>
          <span style={{fontSize:12,color:C.t2}}>({list.length})</span>
          {(()=>{
            const selList=[...selIds].map(id=>rfqs.find(r=>r.id===id)).filter(Boolean);
            const allCreated=selList.length>0&&selList.every(r=>r.status==="Created");
            const selRfq=selList.length===1?selList[0]:null;
            const canSendApproval=selList.length===1&&selRfq?.status==="Scored"&&(user?.username==="buyer1"||user?.username==="brm.user");
            const selRfqQts=selRfq?getQts(selRfq.id):[];
            const canEvaluate=!!selRfq&&selRfq.status==="Open"&&selRfqQts.length>=2&&selRfqQts.every(q=>q.status==="Accepted");
            const evaluateTitle=selIds.size===0?"Select 1 RFQ first":selList.length>1?"Select only 1 RFQ":!selRfq||selRfq.status!=="Open"?"RFQ must be Open to evaluate":selRfqQts.length===0?"No quotations received":selRfqQts.length<2?"At least 2 quotations required to evaluate":!selRfqQts.every(q=>q.status==="Accepted")?"All quotations must be Accepted before scoring":"";
            return(<>
              <button onClick={()=>{if(!allCreated)return;openPublish();}} disabled={!allCreated}
                style={{background:allCreated?"#107e3e":C.subtle,border:`1px solid ${allCreated?"transparent":C.border}`,color:allCreated?"#fff":C.t2,borderRadius:4,padding:"0 0.9rem",fontSize:12,fontFamily:"inherit",cursor:allCreated?"pointer":"not-allowed",height:28,display:"flex",alignItems:"center",gap:5,fontWeight:600,opacity:allCreated?1:0.6,transition:"all .15s"}}
                title={selIds.size===0?"Select RFQ(s) first":!allCreated?"Only 'Created' RFQs can be published to vendors":""}>
                <SapIcon name="paper-plane" size={13} color={allCreated?"#fff":C.t2}/> Publish{selList.length>0&&allCreated?` (${selList.length})`:""}
              </button>
              <button onClick={()=>{if(!canSendApproval||!selRfq)return;openAwardModal(selRfq);}} disabled={!canSendApproval}
                style={{background:canSendApproval?"#0a6ed1":C.subtle,border:`1px solid ${canSendApproval?"transparent":C.border}`,color:canSendApproval?"#fff":C.t2,borderRadius:4,padding:"0 0.9rem",fontSize:12,fontFamily:"inherit",cursor:canSendApproval?"pointer":"not-allowed",height:28,display:"flex",alignItems:"center",gap:5,fontWeight:600,opacity:canSendApproval?1:0.6,transition:"all .15s"}}
                title={selIds.size===0?"Select RFQ(s) first":selList.length>1?"Select only 1 RFQ":user?.username!=="buyer1"&&user?.username!=="brm.user"?"Only buyers can make award decisions":!selRfq||selRfq.status!=="Scored"?"RFQ must be in Scored status":""}>
                <SapIcon name="checklist" size={13} color={canSendApproval?"#fff":C.t2}/> Award Decision
              </button>
              <button onClick={()=>{if(!canEvaluate||!selRfq)return;setScoreModal({rfq:selRfq,qts:selRfqQts});setScores(initScores(selRfqQts));setScoreNotes("");}} disabled={!canEvaluate}
                style={{background:canEvaluate?"#6f2da8":C.subtle,border:`1px solid ${canEvaluate?"transparent":C.border}`,color:canEvaluate?"#fff":C.t2,borderRadius:4,padding:"0 0.9rem",fontSize:12,fontFamily:"inherit",cursor:canEvaluate?"pointer":"not-allowed",height:28,display:"flex",alignItems:"center",gap:5,fontWeight:600,opacity:canEvaluate?1:0.6,transition:"all .15s"}}
                title={evaluateTitle}>
                <SapIcon name="quality-issue" size={13} color={canEvaluate?"#fff":C.t2}/> Evaluate &amp; Score
              </button>
              {/* Proceed to SAP button — always visible, lights up: buyers only + 1 Award Approved RFQ checked */}
              {(()=>{const fullyApproved=!!selRfq?.awardProposal?.l1Approved&&!!selRfq?.awardProposal?.l2Approved;const canProceed=(user?.username==="buyer1"||user?.username==="brm.user")&&!!selRfq&&selRfq.status==="Award Approved"&&fullyApproved;const proceedTitle=selIds.size===0?"Check an Award Approved RFQ first":selList.length>1?"Select only 1 RFQ":user?.username!=="buyer1"&&user?.username!=="brm.user"?"Only buyers can proceed to SAP":!selRfq||selRfq.status!=="Award Approved"?"RFQ must be Award Approved":!fullyApproved?"Awaiting full approval from L1 and L2 before proceeding to SAP":"";return(
                <button onClick={()=>{if(!canProceed||!selRfq)return;const today=new Date().toISOString().split("T")[0];const poNo=`4500${String(Math.floor(Math.random()*1000000)).padStart(6,"0")}`;setRfqs(p=>p.map(r=>r.id===selRfq.id?{...r,status:"Closed",closedAt:today,closedBy:user?.username,poNo}:r));setSelIds(new Set());alert(`Award finalized. SAP Purchase Order ${poNo} created. RFQ ${selRfq.id} is now Closed.`);}} disabled={!canProceed}
                  style={{background:canProceed?"#107e3e":C.subtle,border:`1px solid ${canProceed?"transparent":C.border}`,color:canProceed?"#fff":C.t2,borderRadius:4,padding:"0 0.9rem",fontSize:12,fontFamily:"inherit",cursor:canProceed?"pointer":"not-allowed",height:28,display:"flex",alignItems:"center",gap:5,fontWeight:600,opacity:canProceed?1:0.6,transition:"all .15s"}}
                  title={proceedTitle}>
                  <SapIcon name="sys-enter" size={13} color={canProceed?"#fff":C.t2}/> Proceed to SAP ↗
                </button>
              );})()}
            </>);
          })()}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>{if(allExpanded){setExpanded({});setAllExpanded(false);}else{const m={};list.forEach(r=>{m[r.id]=true;});setExpanded(m);setAllExpanded(true);}}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.75rem",fontSize:12,fontFamily:"inherit",cursor:"pointer",height:28,display:"flex",alignItems:"center",gap:4}}>
            <SapIcon name={allExpanded?"collapse-all":"expand-all"} size={13} color={C.t1}/>{allExpanded?"Collapse All":"Expand All"}
          </button>
          <button onClick={()=>{
            if(list.length===0){alert("No RFQs to export.");return;}
            const esc=(s:any)=>{const t=String(s??'');return t.includes(',')||t.includes('"')||t.includes('\n')?`"${t.replace(/"/g,'""')}"`:t;};
            const hdr=["SAP RFQ No","RFQ Number","Description","Status","Created Date","Open Date","Closing Date","Tender Admin","Budget","Co. Code","Plant"];
            const data=list.map(r=>{const sapNo=r.sapRfqNo||(r.status!=="Created"?`70${r.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"");return[sapNo,r.id,r.title,r.status,fmtDate(r.postedDate),fmtDate(r.postedDate),fmtDate(r.closingDate),r.postedBy,r.estVal,r.companyCode,r.plant].map(esc).join(",");});
            const csv=[hdr.join(","),...data].join("\r\n");
            const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download=`rfqs_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
          }} title="Export all filtered RFQs"
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.75rem",fontSize:12,fontFamily:"inherit",cursor:"pointer",height:28,display:"flex",alignItems:"center",gap:4}}>
            <SapIcon name="excel-attachment" size={13} color={C.t1}/> Export
          </button>
        </div>
      </div>

      <div style={{overflowX:"auto",borderRadius:"0 0 8px 8px",border:`1px solid ${C.border}`}}>
      <div style={{minWidth:rfqMinW,background:C.card}}>
        <div style={{display:"grid",gridTemplateColumns:gridCols,background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
          {HDR_COLS.map((h,i)=>(
            <div key={i} style={{position:"relative",padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2,whiteSpace:"nowrap",overflow:"hidden",userSelect:"none",display:"flex",alignItems:"center"}}>
              {i===0?<input type="checkbox" checked={allSel} onChange={toggleAll} onClick={e=>e.stopPropagation()} style={{cursor:"pointer",accentColor:C.primary}}/>:h}
              {i>0&&i<HDR_COLS.length-1&&(
                <div onMouseDown={e=>onResizeStart(e,i)} style={{position:"absolute",right:0,top:0,width:5,height:"100%",cursor:"col-resize",zIndex:10,background:"transparent"}}
                  onMouseEnter={e=>(e.currentTarget.style.background=`${C.border}`)}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}/>
              )}
            </div>
          ))}
        </div>

        {list.length===0&&<div style={{padding:"28px 16px",textAlign:"center",color:C.t2,fontSize:13}}>No RFQs found.</div>}

        {list.map((rfq,ri)=>{
          const open=!!expanded[rfq.id];
          const qts=getQts(rfq.id);
          const rowBg = C.card;
          const cell = (extra?:any) => ({padding:"8px 10px",display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap" as const,...extra});
          return (
            <div key={rfq.id} style={{borderBottom:`1px solid ${C.border}`}}>
              <div
                onClick={()=>toggle(rfq.id)}
                style={{display:"grid",gridTemplateColumns:gridCols,background:rowBg,cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.infoBg}
                onMouseLeave={e=>e.currentTarget.style.background=rowBg}
              >
                <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 6px"}}>
                  <input type="checkbox" checked={selIds.has(rfq.id)} onChange={()=>toggleSel(rfq.id)} style={{cursor:"pointer",accentColor:C.primary}}/>
                </div>
                <div onClick={e=>{e.stopPropagation();toggle(rfq.id);}} style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"10px 6px",flexShrink:0}}>
                  <span style={{fontSize:10,color:C.primary,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                </div>
                <div style={cell({justifyContent:"flex-start"})}><Badge s={rfq.status}/></div>
                {(()=>{const sapNo=rfq.sapRfqNo||(`70${rfq.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);return(
                <div style={cell({overflow:"hidden"})}>
                  {sapNo==="—"?<span style={{fontSize:13,color:C.t2}}>—</span>:<a href="#" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:13,fontWeight:600,color:C.primary,textDecoration:"none",borderBottom:`1px solid ${C.primary}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{sapNo}</a>}
                </div>);})()}
                <div style={cell({fontSize:13,fontWeight:700,color:C.primary})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.id}</span></div>
                <div style={cell({fontSize:13,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.title}</span></div>
                <div style={cell({fontSize:13,color:C.t2})}>{fmtDate(rfq.postedDate)}</div>
                <div style={cell({fontSize:13,color:C.t2})}>{fmtDate(rfq.postedDate)}</div>
                <div style={cell({fontSize:13,fontWeight:600,color:C.t1})}>{fmtDate(rfq.closingDate)}</div>
                <div style={cell({fontSize:13,color:C.t2})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.postedBy}</span></div>
                <div style={cell({fontSize:13,fontWeight:700,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{idr(rfq.estVal)}</span></div>
                <div style={cell({fontSize:13,color:C.t2})}>{rfq.companyCode||"—"}</div>
                <div style={cell({fontSize:13,color:C.t2})}>{rfq.plant||"—"}</div>
                <div onClick={e=>{e.stopPropagation();setDetailRfq(rfq);setRfqTab("general");}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",overflow:"hidden",cursor:"pointer"}}>
                  {qts.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontWeight:700,flexShrink:0}}>{qts.length}</span>}
                  <span style={{fontSize:16,color:detailRfq?.id===rfq.id?C.primary:"#32363a",fontWeight:detailRfq?.id===rfq.id?700:300,marginLeft:"auto"}}>›</span>
                </div>
              </div>

              {open&&(
                <div style={{background:C.infoBg,borderTop:`1px solid ${C.border}`}}>
                  <div style={{display:"grid",gridTemplateColumns:gridCols2,background:"rgba(0,112,242,0.07)",borderBottom:`1px solid ${C.border}`,padding:"0"}}>
                    {CHILD_HDRS.map((h,i)=>(
                      <div key={i} style={{position:"relative",padding:"6px 10px",fontSize:12,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap",userSelect:"none"}}>
                        {h}
                        {i<CHILD_HDRS.length-1&&(
                          <div onMouseDown={e=>onResizeStart2(e,i)} style={{position:"absolute",right:0,top:0,width:5,height:"100%",cursor:"col-resize",zIndex:10,background:"transparent"}}
                            onMouseEnter={e=>(e.currentTarget.style.background=`${C.border}`)}
                            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}/>
                        )}
                      </div>
                    ))}
                  </div>
                  {rfq.items.map((it,ii)=>(
                    <div key={ii} style={{display:"grid",gridTemplateColumns:gridCols2,borderBottom:ii<rfq.items.length-1?`1px solid ${C.border}`:"none",background:ii%2===0?"transparent":"rgba(0,0,0,0.02)"}}>
                      <div style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2}}>{String(it.no).padStart(3,"0")}</div>
                      <div style={{padding:"8px 10px"}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.t1}}>{it.desc}</div>
                        <div style={{fontSize:11,color:C.t2,marginTop:2}}>
                          <span style={{background:it.type==="Service"?C.warnBg:C.okBg,color:it.type==="Service"?C.warn:C.ok,borderRadius:3,padding:"1px 6px",fontWeight:700,marginRight:6}}>{it.type}</span>
                          {it.acctAssign}
                        </div>
                      </div>
                      <div style={{padding:"8px 10px",fontSize:12,fontFamily:"monospace",color:C.t1,display:"flex",alignItems:"center"}}>{it.materialNo||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t2,display:"flex",alignItems:"center"}}>{it.materialGroup||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t2,display:"flex",alignItems:"center"}}>{it.plant||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:C.t1,display:"flex",alignItems:"center"}}>{it.qty}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t2,display:"flex",alignItems:"center"}}>{it.uom}</div>
                      <div style={{padding:"8px 10px",fontSize:12,color:C.t2,display:"flex",alignItems:"center"}}>
                        {it.type==="Material"
                          ? <span>{fmtDate(it.requirementDate)||"—"}</span>
                          : <span>{fmtDate(it.startDate)||"—"} – {fmtDate(it.endDate)||"—"}</span>
                        }
                      </div>
                    </div>
                  ))}
                  {qts.length>0&&(
                    <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:"rgba(0,0,0,0.02)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Received Quotations ({qts.length})</div>
                        <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:6}}>
                          <Btn sm v="ghost" onClick={()=>setCompareData({rfq,quotations:qts})}>⊞ Compare Quotations</Btn>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {qts.map((qt,qi)=>(
                          <div key={qt.id} style={{padding:"5px 12px",background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${VDR_COLORS[qi%VDR_COLORS.length]}`,borderRadius:4,fontSize:12,display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontWeight:600}}>{qt.vendorName}</span>
                            <span style={{color:C.t2}}>·</span>
                            <span style={{fontWeight:700}}>{idr(qt.totalAmt)}</span>
                            <Badge s={qt.status}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{padding:"8px 16px 12px",borderTop:`1px solid ${C.border}`}}>
                    <span style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Scope: </span>
                    <span style={{fontSize:12,color:C.t2}}>{rfq.desc}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>


      {showPublish&&(
        <Modal title="Publish RFQ — Vendor Invitation" onClose={()=>{setShowPublish(false);setPubForm(EMPTY_PUB);}} width={700}>
          <div style={{display:"flex",flexDirection:"column",gap:18,padding:"4px 0"}}>

            {/* Selected RFQs summary */}
            <div style={{background:"#e8f0fe",border:"1px solid #b3c8f5",borderRadius:6,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <SapIcon name="information" size={16} color="#0057D2"/>
              <div style={{fontSize:12.5,color:"#0057D2",lineHeight:1.6}}>
                <b>Publishing {[...selIds].length} RFQ(s) to vendors.</b> Invited vendors will be notified via email and can immediately submit quotations through the portal.
                <div style={{marginTop:4,color:"#1a56c4"}}>
                  {[...selIds].map(id=>rfqs.find(r=>r.id===id)).filter(Boolean).map((r:any)=>(
                    <span key={r.id} style={{display:"inline-flex",alignItems:"center",gap:4,background:"#c5d9f8",borderRadius:3,padding:"1px 7px",marginRight:5,marginTop:2,fontSize:11.5,fontWeight:600}}>{r.id} – {r.title}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Invitation Details */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:10}}>Invitation Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 18px"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.t2,marginBottom:3}}>Invitation Reference No.</div>
                  <Inp value={pubForm.invitationNo} onChange={v=>pu("invitationNo",v)} placeholder="e.g. BRM-INV-20250701-01"/>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.t2,marginBottom:3}}>Invitation Date</div>
                  <DateInp value={pubForm.invitationDate} onChange={v=>pu("invitationDate",v)}/>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.t2,marginBottom:3}}>Submission Deadline</div>
                  <DateInp value={pubForm.submissionDeadline} onChange={v=>pu("submissionDeadline",v)}/>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.t2,marginBottom:3}}>Submission Method</div>
                  <Sel value={pubForm.submissionMethod} onChange={v=>pu("submissionMethod",v)}
                    opts={["Portal","Email","Portal + Hard Copy","Hard Copy Only"].map(x=>({v:x,l:x}))}/>
                </div>
              </div>
            </div>

            {/* Vendor Invitation List */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:10}}>
                Vendor Invitation List
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                <thead>
                  <tr style={{background:C.subtle}}>
                    <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.t2,borderBottom:`1px solid ${C.border}`,width:30}}></th>
                    <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.t2,borderBottom:`1px solid ${C.border}`}}>Vendor Name</th>
                    <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.t2,borderBottom:`1px solid ${C.border}`}}>Contact Person</th>
                    <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.t2,borderBottom:`1px solid ${C.border}`}}>Email Address</th>
                    <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.t2,borderBottom:`1px solid ${C.border}`,width:30}}></th>
                  </tr>
                </thead>
                <tbody>
                  {pubForm.vendorInvitees.map((v:any,i:number)=>(
                    <tr key={v.vendorId||i} style={{borderBottom:`1px solid ${C.border}`,opacity:v.include?1:0.45}}>
                      <td style={{padding:"5px 8px",textAlign:"center"}}>
                        <input type="checkbox" checked={v.include} onChange={e=>updateInvitee(v.vendorId,"include",e.target.checked)} style={{cursor:"pointer"}}/>
                      </td>
                      <td style={{padding:"5px 8px",fontWeight:600,color:C.t1}}>{v.name}</td>
                      <td style={{padding:"5px 8px"}}>
                        <input value={v.pic} onChange={e=>updateInvitee(v.vendorId,"pic",e.target.value)}
                          style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:3,padding:"3px 7px",fontSize:12,background:C.field,color:C.t1,fontFamily:"inherit"}}/>
                      </td>
                      <td style={{padding:"5px 8px"}}>
                        <input value={v.email} onChange={e=>updateInvitee(v.vendorId,"email",e.target.value)}
                          style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:3,padding:"3px 7px",fontSize:12,background:C.field,color:C.t1,fontFamily:"inherit"}}/>
                      </td>
                      <td style={{padding:"5px 8px",textAlign:"center"}}>
                        <button onClick={()=>setPubForm(p=>({...p,vendorInvitees:p.vendorInvitees.filter((_:any,j:number)=>j!==i)}))}
                          style={{background:"none",border:"none",cursor:"pointer",color:"#BB0000",fontSize:15,lineHeight:1}} title="Remove">×</button>
                      </td>
                    </tr>
                  ))}
                  {/* Add row */}
                  <tr>
                    <td colSpan={5} style={{padding:"6px 8px"}}>
                      <button onClick={()=>setPubForm(p=>({...p,vendorInvitees:[...p.vendorInvitees,{vendorId:`ext-${Date.now()}`,name:"",email:"",pic:"",phone:"",include:true}]}))}
                        style={{background:"none",border:`1px dashed ${C.border}`,borderRadius:4,padding:"4px 12px",fontSize:12,color:C.primary,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                        <SapIcon name="add" size={12} color={C.primary}/> Add Vendor
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Buyer Notes / Cover Letter */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:6}}>Buyer Notes / Cover Letter</div>
              <TA value={pubForm.notes} onChange={v=>pu("notes",v)} rows={6} placeholder="Enter cover letter or notes for vendors..."/>
            </div>

            {/* Terms & Conditions */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:6}}>Terms &amp; Conditions</div>
              <TA value={pubForm.termsAndConditions} onChange={v=>pu("termsAndConditions",v)} rows={5} placeholder="Enter terms and conditions..."/>
            </div>

            {/* Required Documents */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:4}}>Required Documents to Submit</div>
              <div style={{fontSize:11.5,color:C.t2,marginBottom:10}}>Check the documents vendors must include in their submission.</div>
              <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
                <div style={{background:C.subtle,padding:"6px 12px",display:"grid",gridTemplateColumns:"1fr 64px 72px",fontSize:11,fontWeight:700,color:C.t2,borderBottom:`1px solid ${C.border}`}}>
                  <span>Document</span>
                  <span style={{textAlign:"center"}}>Include</span>
                  <span style={{textAlign:"center"}}>Mandatory</span>
                </div>
                {pubForm.requiredDocs.map((doc,i)=>(
                  <div key={doc.id} style={{display:"grid",gridTemplateColumns:"1fr 64px 72px",alignItems:"center",padding:"7px 12px",borderBottom:i<pubForm.requiredDocs.length-1?`1px solid ${C.border}`:"none",background:doc.checked?C.card:C.subtle}}>
                    <span style={{fontSize:13,color:doc.checked?C.t1:C.t2}}>{doc.label}</span>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <input type="checkbox" checked={doc.checked}
                        onChange={e=>pu("requiredDocs",pubForm.requiredDocs.map((d,j)=>j===i?{...d,checked:e.target.checked,required:e.target.checked?d.required:false}:d))}
                        style={{cursor:"pointer",width:15,height:15,accentColor:C.primary}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <input type="checkbox" checked={doc.required} disabled={!doc.checked}
                        onChange={e=>pu("requiredDocs",pubForm.requiredDocs.map((d,j)=>j===i?{...d,required:e.target.checked}:d))}
                        style={{cursor:doc.checked?"pointer":"not-allowed",width:15,height:15,accentColor:"#BB0000",opacity:doc.checked?1:0.35}}/>
                    </div>
                  </div>
                ))}
                {/* Custom doc row */}
                <div style={{padding:"6px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center"}}>
                  <input id="customDocInp" placeholder="+ Tambah dokumen lainnya..."
                    style={{flex:1,border:`1px dashed ${C.border}`,borderRadius:3,padding:"4px 8px",fontSize:12,background:C.field,color:C.t1,fontFamily:"inherit",outline:"none"}}
                    onKeyDown={e=>{if(e.key==="Enter"){const inp=e.target as HTMLInputElement;const v=inp.value.trim();if(v){pu("requiredDocs",[...pubForm.requiredDocs,{id:`cust-${Date.now()}`,label:v,checked:true,required:false}]);inp.value="";}}}}/>
                  <span style={{fontSize:11,color:C.t2}}>Enter to add</span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:4}}>Buyer Attachments</div>
              <div style={{fontSize:11.5,color:C.t2,marginBottom:10}}>Attach reference files, specs, or templates for vendors (e.g. Bill of Quantity, Technical Specification).</div>
              <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
                {pubForm.attachments.length>0&&(
                  <div>
                    {pubForm.attachments.map((att,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderBottom:`1px solid ${C.border}`,background:C.card}}>
                        <SapIcon name="attachment" size={14} color={C.t2}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12.5,color:C.t1,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{att.name}</div>
                          <div style={{fontSize:11,color:C.t2}}>{att.size} · {att.type}</div>
                        </div>
                        <button onClick={()=>pu("attachments",pubForm.attachments.filter((_,j)=>j!==i))}
                          style={{background:"none",border:"none",cursor:"pointer",color:"#BB0000",fontSize:16,lineHeight:1,padding:"0 2px"}} title="Remove">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{padding:"12px",textAlign:"center"}}>
                  <label style={{display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",background:C.subtle,border:`1px dashed ${C.border}`,borderRadius:5,padding:"8px 18px",fontSize:12.5,color:C.primary,fontFamily:"inherit"}}>
                    <SapIcon name="upload" size={13} color={C.primary}/>
                    <span>Choose File(s) to Attach</span>
                    <input type="file" multiple style={{display:"none"}} onChange={e=>{
                      const files=Array.from(e.target.files||[]);
                      const newAtts=files.map(f=>({name:f.name,size:f.size>1024*1024?`${(f.size/1024/1024).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`,type:f.type||"application/octet-stream"}));
                      pu("attachments",[...pubForm.attachments,...newAtts]);
                      e.target.value="";
                    }}/>
                  </label>
                  {pubForm.attachments.length===0&&<div style={{fontSize:11,color:C.t2,marginTop:6}}>No attachments added yet</div>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:6,borderTop:`1px solid ${C.border}`}}>
              <Btn variant="ghost" onClick={()=>{setShowPublish(false);setPubForm(EMPTY_PUB);}}>Cancel</Btn>
              <Btn variant="success" onClick={submitPublish}>
                <SapIcon name="paper-plane" size={13} color="#fff"/> Publish to Vendors
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {showApproval&&(
        <Modal title="Send RFQ for Tender Committee Approval" onClose={()=>{setShowApproval(false);setApvForm(EMPTY_APV);}} width={640}>
          {/* Selected RFQs summary */}
          <div style={{background:C.infoBg,border:`1px solid ${C.info}40`,borderRadius:6,padding:"10px 14px",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:C.info,marginBottom:6}}>Selected RFQs ({selIds.size})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {list.filter(r=>selIds.has(r.id)).map(r=>(
                <span key={r.id} style={{fontSize:11,background:C.card,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px 8px",color:C.t1}}>{r.id} – {r.title.slice(0,30)}{r.title.length>30?"…":""}</span>
              ))}
            </div>
          </div>

          {/* Tender Committee Group */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Tender Committee Group <span style={{color:C.err}}>*</span></label>
            <Sel value={apvForm.committeeGroup} onChange={v=>apv("committeeGroup",v)} opts={[{v:"",l:"— Select Committee Group —"},...Object.keys(COMMITTEE_GROUPS).map(g=>({v:g,l:g}))]}/>

            {apvForm.committeeGroup&&(
              <div style={{marginTop:10,border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
                <div style={{background:C.subtle,padding:"6px 12px",fontSize:11,fontWeight:700,color:C.t2,borderBottom:`1px solid ${C.border}`}}>Committee Members</div>
                {COMMITTEE_GROUPS[apvForm.committeeGroup].map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",fontSize:12,borderBottom:i<4?`1px solid ${C.border}`:"none",background:i%2===0?C.card:C.subtle}}>
                    <span style={{fontWeight:600,color:C.t1}}>{m.name}</span>
                    <span style={{color:m.role==="Chairperson"?C.primary:C.t2,fontWeight:m.role==="Chairperson"?700:400}}>{m.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two-column grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Priority Level <span style={{color:C.err}}>*</span></label>
              <Sel value={apvForm.priority} onChange={v=>apv("priority",v)} opts={[{v:"Normal",l:"Normal"},{v:"Urgent",l:"Urgent"},{v:"Critical",l:"Critical"}]}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Target Approval Date <span style={{color:C.err}}>*</span></label>
              <DatePickerInp value={apvForm.targetDate} onChange={v=>apv("targetDate",v)}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Budget Reference / Cost Center <span style={{fontSize:10,fontWeight:400,color:C.t2,marginLeft:4}}>View Only</span></label>
              <div style={{padding:"7px 10px",background:C.subtle,border:`1px solid ${C.border}`,borderRadius:4,fontSize:13,color:C.t1,fontFamily:"monospace"}}>CC-PROC-2025-Q3</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>WBS Element <span style={{fontSize:10,fontWeight:400,color:C.t2,marginLeft:4}}>View Only</span></label>
              <div style={{padding:"7px 10px",background:C.subtle,border:`1px solid ${C.border}`,borderRadius:4,fontSize:13,color:C.t1,fontFamily:"monospace"}}>WBS-MINE-PRO-2025.001</div>
            </div>
          </div>

          {/* Justification */}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Approval Justification / Notes <span style={{color:C.err}}>*</span></label>
            <TA value={apvForm.justification} onChange={v=>apv("justification",v)} placeholder="Provide rationale for approval — business need, urgency, strategic alignment, etc." rows={3}/>
          </div>

          {/* Remarks */}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Additional Remarks</label>
            <TA value={apvForm.remarks} onChange={v=>apv("remarks",v)} placeholder="Any additional notes for the committee..." rows={2}/>
          </div>

          {/* Attached Files (pre-populated from DMS) */}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:8}}>Attached Files <span style={{fontSize:11,fontWeight:400,color:C.t2,marginLeft:4}}>Auto-attached from DMS</span></label>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {name:"RFQ_Summary_Report.pdf",      by:"Ahmad Rizki",   date:"2025-06-30",size:"128 KB", icon:"pdf-attachment"},
                {name:"Technical_Evaluation.xlsx",   by:"Siti Rahma",    date:"2025-07-01",size:"84 KB",  icon:"excel-attachment"},
                {name:"Budget_Allocation_Letter.pdf",by:"Finance Dept",  date:"2025-07-02",size:"212 KB", icon:"pdf-attachment"},
                {name:"Vendor_Qualification_Docs.zip",by:"Procurement",  date:"2025-07-03",size:"3.4 MB", icon:"attachment"},
              ].map(f=>(
                <div key={f.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.subtle,border:`1px solid ${C.border}`,borderRadius:6}}>
                  <SapIcon name={f.icon} size={20} color={C.primary}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.primary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                    <div style={{fontSize:11,color:C.t2,marginTop:1}}>Uploaded by: {f.by} · {fmtDate(f.date)} · {f.size} · Source: DMS</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Documents checkboxes */}
          <div style={{marginBottom:18}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:8}}>Additional Supporting Documents <span style={{fontSize:11,fontWeight:400,color:C.t2}}>(select all that apply)</span></label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>
              {COMMON_DOCS.map(doc=>(
                <label key={doc} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.t1,cursor:"pointer"}}>
                  <input type="checkbox" checked={apvForm.attachments.includes(doc)} onChange={()=>toggleDoc(doc)} style={{accentColor:C.primary}}/>
                  {doc}
                </label>
              ))}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            <Btn v="neutral" onClick={()=>{setShowApproval(false);setApvForm(EMPTY_APV);}}>Cancel</Btn>
            <Btn v="primary" onClick={submitApproval}>Submit for Approval</Btn>
          </div>
        </Modal>
      )}
      {showForm&&(
        <Modal title="Create & Publish New RFQ" onClose={()=>setForm(false)} width={800}>
          <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><Lbl>RFQ Title *</Lbl><Inp value={f.title} onChange={v=>sf("title",v)} placeholder="e.g. Procurement of Office Chairs"/></div>
            <div><Lbl>Category *</Lbl><Inp value={f.cat} onChange={v=>sf("cat",v)} placeholder="e.g. Furniture"/></div>
            <div><Lbl>Closing Date *</Lbl><DateInp value={f.closingDate} onChange={v=>sf("closingDate",v)}/></div>
            <div>
              <Lbl>Company Code</Lbl>
              <Sel value={f.companyCode} onChange={v=>sf("companyCode",v)} opts={[{v:"",l:"— Select —"},...COMPANY_CODES.map(c=>({v:c.v,l:`${c.v} – ${c.l}`}))]}/>
            </div>
            <div><Lbl>Plant</Lbl><Inp value={f.plant} onChange={v=>sf("plant",v)} placeholder="e.g. PL01"/></div>
            <div>
              <Lbl>Purchasing Org</Lbl>
              <Sel value={f.purchOrg} onChange={v=>sf("purchOrg",v)} opts={[{v:"",l:"— Select —"},{v:"PO10",l:"PO10 – Procurement Central"},{v:"PO20",l:"PO20 – Procurement Regional"}]}/>
            </div>
            <div>
              <Lbl>Purchasing Group</Lbl>
              <Sel value={f.purchGroup} onChange={v=>sf("purchGroup",v)} opts={[{v:"",l:"— Select —"},...PURCHASING_GROUPS.map(p=>({v:p.v,l:`${p.v} – ${p.l}`}))]}/>
            </div>
            <div style={{gridColumn:"1/-1"}}><Lbl>Estimated Budget (IDR)</Lbl><AmtInp value={f.estVal} onChange={v=>sf("estVal",v)}/></div>
          </div>
          <div style={{marginBottom:12}}><Lbl>Description / Scope</Lbl><TA value={f.desc} onChange={v=>sf("desc",v)} placeholder="Describe the requirement…"/></div>
          <div style={{marginBottom:12}}>
            <Lbl>Target Vendors *</Lbl>
            <div style={{display:"flex",gap:14,marginTop:6}}>
              {Object.keys(VENDORS).map(vid=>(
                <label key={vid} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}>
                  <input type="checkbox" checked={f.targets.includes(vid)} onChange={e=>sf("targets",e.target.checked?[...f.targets,vid]:f.targets.filter(v=>v!==vid))}/>
                  {VENDORS[vid]?.name||vid}
                </label>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Lbl>Line Items</Lbl>
              <Btn v="ghost" sm onClick={addItem}>+ Add Item</Btn>
            </div>
            {f.items.map((it,i)=>(
              <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 12px",marginBottom:10,background:C.subtle}}>
                <div style={{display:"grid",gridTemplateColumns:mob()?"1fr":"2fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
                  <div><Lbl>Description</Lbl><Inp value={it.desc} onChange={v=>updItem(i,"desc",v)} placeholder="Item description"/></div>
                  <div><Lbl>Type</Lbl><Sel value={it.type} onChange={v=>updItem(i,"type",v)} opts={[{v:"Material",l:"Material"},{v:"Service",l:"Service"}]}/></div>
                  <div><Lbl>Qty</Lbl><AmtInp value={it.qty} onChange={v=>updItem(i,"qty",v)}/></div>
                  <div><Lbl>UoM</Lbl><Inp value={it.uom} onChange={v=>updItem(i,"uom",v)} placeholder="Unit"/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:mob()?"1fr":"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
                  <div><Lbl>Acct Assignment</Lbl><Inp value={it.acctAssign} onChange={v=>updItem(i,"acctAssign",v)} placeholder="K – Cost Center"/></div>
                  <div><Lbl>Material / Svc No.</Lbl><Inp value={it.materialNo} onChange={v=>updItem(i,"materialNo",v)} placeholder="MAT-001"/></div>
                  <div><Lbl>Material Group</Lbl><Inp value={it.materialGroup} onChange={v=>updItem(i,"materialGroup",v)} placeholder="IT Hardware"/></div>
                  <div><Lbl>Plant</Lbl><Inp value={it.plant} onChange={v=>updItem(i,"plant",v)} placeholder="PL01"/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:mob()?"1fr":"1fr 1fr 1fr",gap:8}}>
                  <div><Lbl>Est. Unit Price (IDR)</Lbl><AmtInp value={it.estPrice} onChange={v=>updItem(i,"estPrice",v)}/></div>
                  {it.type==="Material"
                    ?<div><Lbl>Requirement Date</Lbl><DateInp value={it.requirementDate} onChange={v=>updItem(i,"requirementDate",v)}/></div>
                    :<><div><Lbl>Start Date</Lbl><DateInp value={it.startDate} onChange={v=>updItem(i,"startDate",v)}/></div>
                      <div><Lbl>End Date</Lbl><DateInp value={it.endDate} onChange={v=>updItem(i,"endDate",v)}/></div></>
                  }
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn v="neutral" onClick={()=>setForm(false)}>Cancel</Btn>
            <Btn v="primary" onClick={publish}>Save RFQ</Btn>
          </div>
        </Modal>
      )}

      {/* RFQ Status Legend */}
      <div style={{margin:"20px 0 4px",padding:"14px 18px",background:C.subtle,border:`1px solid ${C.border}`,borderRadius:8}}>
        <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:12,textTransform:"uppercase",letterSpacing:.6}}>RFQ Status Legend</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"10px 28px",marginBottom:14}}>
          {[
            {s:"Created",        desc:"RFQ created in SAP – not yet published to vendors"},
            {s:"Open",           desc:"Published to vendors – collecting and evaluating quotations"},
            {s:"Scored",         desc:"Scoring session completed – submitted to Tender Committee for approval"},
            {s:"Award Proposed", desc:"Buyer submitted split/full award proposal – pending Procurement Manager approval"},
            {s:"Award Approved", desc:"Award approved – buyer can proceed to SAP to generate Purchase Order"},
            {s:"Closed",         desc:"PO issued – procurement process complete"},
          ].map(({s,desc})=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:7,minWidth:300}}>
              <Badge s={s}/>
              <span style={{fontSize:12,color:C.t2}}>{desc}</span>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Status Flow:</span>
          {["Created","Open","Scored","Award Proposed","Award Approved","Closed"].map((s,i,arr)=>(
            <span key={s} style={{display:"flex",alignItems:"center",gap:6}}>
              <Badge s={s}/>
              {i<arr.length-1&&<span style={{color:C.t2,fontSize:12}}>→</span>}
            </span>
          ))}
        </div>
      </div>

    </div>{/* end left panel */}

    {detailRfq&&<>
      {/* Splitter */}
      <div onMouseDown={onSplitterDrag} style={{width:8,flexShrink:0,cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",background:C.subtle,borderLeft:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,userSelect:"none",alignSelf:"stretch",zIndex:5}}>
        <div style={{display:"flex",flexDirection:"column",gap:3,pointerEvents:"none"}}>
          {[0,1,2,3,4].map(i=><div key={i} style={{width:3,height:3,borderRadius:"50%",background:C.t2,opacity:.5}}/>)}
        </div>
      </div>

      {/* Detail Panel */}
      {(()=>{
        const r=detailRfq;
        const qts=getQts(r.id);
        const sapNo=r.sapRfqNo||(`70${r.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);
        const TABS=["general","items","quotations","notes","discussion","docflow"];
        const TAB_LABELS={"general":"General Information","items":`Items (${r.items?.length||0})`,"quotations":`Quotations (${qts.length})`,"notes":"Notes","discussion":`Discussion (${(r.discussions||[]).length})`,"docflow":"Document Flow"};
        const field=(label,val)=>(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:C.t2,marginBottom:2}}>{label}:</div>
            <div style={{fontSize:13,color:C.t1,fontWeight:500}}>{val||"—"}</div>
          </div>
        );
        const sectionHdr=(title)=><div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{title}</div>;
        return(
        <div style={{flex:`0 0 ${split}%`,position:"sticky",top:0,maxHeight:"100vh",display:"flex",flexDirection:"column",background:C.card,overflow:"hidden",boxShadow:"-2px 0 10px rgba(0,0,0,0.08)"}}>
          {/* Panel Header */}
          <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${C.border}`,background:C.subtle,flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:C.t1,lineHeight:1.3}}>{r.title}</div>
                <div style={{fontSize:11,color:C.t2,marginTop:3,fontFamily:"monospace"}}>{sapNo}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <Badge s={r.status}/>
                <button onClick={()=>setDetailRfq(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,padding:"0 2px",marginLeft:4}}>×</button>
              </div>
            </div>
            {/* Metadata row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:11}}>
              <div><span style={{color:C.t2}}>Created By: </span><span style={{color:C.t1,fontWeight:600}}>{r.postedBy}</span></div>
              <div><span style={{color:C.t2}}>Status: </span><span style={{color:C.t1,fontWeight:600}}>{r.status}</span></div>
              <div><span style={{color:C.t2}}>Created On: </span><span style={{color:C.t1}}>{fmtDate(r.postedDate)}</span></div>
              <div><span style={{color:C.t2}}>Target Value: </span><span style={{color:C.t1,fontWeight:600}}>{idr(r.estVal)}</span></div>
              <div><span style={{color:C.t2}}>Publishing Date: </span><span style={{color:C.t1}}>{fmtDate(r.postedDate)}</span></div>
              <div><span style={{color:C.t2}}>Quotation Deadline: </span><span style={{color:C.t1,fontWeight:600}}>{fmtDate(r.closingDate)}</span></div>
            </div>
          </div>

          {/* Award Approved banner — visible to buyer1 */}
          {r.status==="Award Approved"&&user?.username==="buyer1"&&(
            <div style={{padding:"8px 16px",background:C.okBg,borderBottom:`1px solid ${C.ok}`,fontSize:12,color:C.ok,display:"flex",alignItems:"center",gap:8}}>
              <SapIcon name="accept" size={13} color={C.ok}/>
              <span>Award approved by <strong>{r.approvedBy||"Approver"}</strong> on {fmtDate(r.approvedAt)}. Click 'Proceed to SAP' to finalize.</span>
            </div>
          )}

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card,flexShrink:0,overflowX:"auto"}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setRfqTab(t)} style={{background:"none",border:"none",borderBottom:rfqTab===t?`2px solid ${C.primary}`:"2px solid transparent",color:rfqTab===t?C.primary:C.t2,fontFamily:"inherit",fontSize:12,fontWeight:rfqTab===t?700:400,cursor:"pointer",padding:"10px 14px",whiteSpace:"nowrap",transition:"color .15s",marginBottom:-1}}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {r.status==="Award Approved"&&user?.username==="buyer1"&&r.awardProposal&&(
            <div style={{padding:"10px 16px",background:"#e8f5e9",borderTop:`1px solid #9FE1CB`,display:"flex",gap:8,alignItems:"center",fontSize:12,color:"#107e3e",fontWeight:600,flexShrink:0}}>
              <SapIcon name="accept" size={14} color="#107e3e"/>
              Award approved by <strong style={{marginLeft:4,marginRight:4}}>{r.awardProposal.approvedBy}</strong> on <strong style={{marginLeft:4}}>{r.awardProposal.approvedAt}</strong>. Click &apos;Proceed to SAP&apos; to finalize.
            </div>
          )}
          {/* Tab Content */}
          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>

            {rfqTab==="general"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:16}}>
                  <div>
                    {sectionHdr("Basic Data")}
                    {field("RFQ Number",r.id)}
                    {field("RFQ Type","Int. Sourcing Req. (RQ)")}
                    {field("RFQ Description",r.title)}
                    {field("Category",r.cat)}
                    {field("Language Key","English (EN)")}
                  </div>
                  <div>
                    {sectionHdr("Organization")}
                    {field("Purchasing Organization",r.purchOrg)}
                    {field("Company Code",r.companyCode)}
                    {field("Plant",r.plant)}
                    {field("Tender Admin",r.postedBy)}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:16}}>
                  <div>
                    {sectionHdr("Important Dates")}
                    {field("Apply By",fmtDate(r.closingDate))}
                    {field("Quotation Deadline",fmtDate(r.closingDate))}
                    {field("Binding Period",fmtDate(r.closingDate))}
                    {field("Publishing Date",fmtDate(r.postedDate))}
                  </div>
                  <div>
                    {sectionHdr("Delivery & Payment")}
                    {field("Payment Terms","Due within 14 Days (Z014)")}
                    {field("Currency","Indonesian Rupiah (IDR)")}
                    {field("Incoterms","Ex Works (EXW)")}
                    {field("Target Value",idr(r.estVal))}
                  </div>
                </div>
                <div>
                  {sectionHdr("Scope")}
                  <div style={{fontSize:13,color:C.t2,lineHeight:1.6}}>{r.desc||"—"}</div>
                </div>
              </div>
            )}

            {rfqTab==="items"&&(
              <div>
                {(r.items||[]).length===0&&<div style={{color:C.t2,fontSize:13}}>No items.</div>}
                {(r.items||[]).map((it,i)=>(
                  <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:10,background:C.subtle}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.t2,minWidth:28}}>#{String(it.no).padStart(3,"0")}</span>
                      <span style={{fontSize:13,fontWeight:700,color:C.t1}}>{it.desc}</span>
                      <span style={{marginLeft:"auto",background:it.type==="Service"?C.warnBg:C.okBg,color:it.type==="Service"?C.warn:C.ok,borderRadius:3,padding:"1px 7px",fontSize:11,fontWeight:700}}>{it.type}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px 16px",fontSize:12}}>
                      {it.materialNo&&<div><span style={{color:C.t2}}>Mat. No: </span><span style={{fontFamily:"monospace",color:C.t1}}>{it.materialNo}</span></div>}
                      {it.materialGroup&&<div><span style={{color:C.t2}}>Mat. Group: </span><span style={{color:C.t1}}>{it.materialGroup}</span></div>}
                      <div><span style={{color:C.t2}}>Plant: </span><span style={{color:C.t1}}>{it.plant||r.plant||"—"}</span></div>
                      <div><span style={{color:C.t2}}>Qty: </span><span style={{fontWeight:600,color:C.t1}}>{it.qty} {it.uom}</span></div>
                      {it.acctAssign&&<div><span style={{color:C.t2}}>Acct: </span><span style={{color:C.t1}}>{it.acctAssign}</span></div>}
                      {it.type==="Material"
                        ?<div><span style={{color:C.t2}}>Req. Date: </span><span style={{color:C.t1}}>{fmtDate(it.requirementDate)||"—"}</span></div>
                        :<div><span style={{color:C.t2}}>Period: </span><span style={{color:C.t1}}>{fmtDate(it.startDate)||"—"} – {fmtDate(it.endDate)||"—"}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rfqTab==="quotations"&&(
              <div>
                {qts.length===0&&<div style={{color:C.t2,fontSize:13}}>No quotations received yet.</div>}
                {qts.map(qt=>{
                  const sapQtNo=qt.sapQtNo||(["Accepted","Win","PO Ready"].includes(qt.status)?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");
                  return(
                  <div key={qt.id} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:8,background:C.card}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:C.t1}}>{qt.vendorName}</div>
                        <div style={{fontSize:11,color:C.t2,fontFamily:"monospace",marginTop:1}}>{qt.id} · SAP {sapQtNo}</div>
                      </div>
                      <Badge s={qt.status}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px 12px",fontSize:12}}>
                      <div><span style={{color:C.t2}}>Total: </span><span style={{fontWeight:700,color:C.t1}}>{idr(qt.totalAmt)}</span></div>
                      <div><span style={{color:C.t2}}>Submitted: </span><span style={{color:C.t1}}>{fmtDate(qt.submittedDate)||"—"}</span></div>
                      <div><span style={{color:C.t2}}>Valid Until: </span><span style={{color:C.t1}}>{fmtDate(qt.validUntil)||"—"}</span></div>
                    </div>
                    {qt.notes&&<div style={{marginTop:6,fontSize:11,color:C.t2,fontStyle:"italic"}}>{qt.notes}</div>}
                  </div>
                );})}
              </div>
            )}

            {rfqTab==="notes"&&(
              <div>
                <div style={{fontSize:13,color:C.t1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.desc||"No notes."}</div>
                {r.targets&&r.targets.length>0&&(
                  <div style={{marginTop:16}}>
                    {sectionHdr("Invited Vendors")}
                    {r.targets.map(vid=>(
                      <div key={vid} style={{fontSize:13,color:C.t1,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                        {VENDORS[vid]?.name||vid} <span style={{color:C.t2,fontSize:11}}>· {vid}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rfqTab==="discussion"&&(
              <DiscussionBox rfqId={r.id} discussions={r.discussions||[]} onPost={postDiscussion} user={user}/>
            )}

            {rfqTab==="docflow"&&(
              <RfqDocumentFlow rfq={r} quotations={qts}/>
            )}

          </div>
        </div>
        );
      })()}
    </>}
    {compareData&&<QuotationCompareModal rfq={compareData.rfq} quotations={compareData.quotations} onClose={()=>setCompareData(null)}/>}

    {/* Score Quotations Modal (buyer) */}
    {scoreModal&&(()=>{
      const {rfq,qts}=scoreModal;
      const maxTotal=Math.max(0,...qts.map(qt=>getWeightedTotal(qt.id)||0));
      const LABEL_W=240;
      const COL_W=Math.max(200,Math.floor(760/qts.length));
      return(
      <Modal title={`Evaluation Scoring · ${rfq.title}`} onClose={()=>{setScoreModal(null);setScores({});setScoreNotes("");}} width="90vw">
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {qts.map((qt,i)=>(
            <div key={qt.id} style={{flex:1,minWidth:160,padding:"10px 14px",background:C.subtle,borderRadius:6,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:VDR_COLORS[i%VDR_COLORS.length]}}>{qt.vendorName}</div>
              <div style={{fontSize:10,color:C.t2,marginTop:2}}>{qt.vendorId} · {qt.id}</div>
              <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <Badge s={qt.status}/>
                <span style={{fontSize:11,fontWeight:700,color:C.t1}}>{idr(qt.totalAmt)}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"6px 12px",background:C.infoBg,borderRadius:4,marginBottom:12,fontSize:11,color:C.info,display:"flex",gap:16,flexWrap:"wrap"}}>
          <span><strong>RFQ:</strong> {rfq.id}</span>
          <span><strong>Category:</strong> {rfq.cat||"—"}</span>
          <span><strong>Company:</strong> {rfq.companyCode||"—"}</span>
          <span><strong>Est. Budget:</strong> {idr(rfq.estVal)}</span>
        </div>
        <div style={{overflow:"auto",border:`1px solid ${C.border}`,borderRadius:6,maxHeight:"55vh",marginBottom:16}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:LABEL_W+COL_W*qts.length}}>
            <thead><tr style={{position:"sticky",top:0,zIndex:2}}>
              <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"left",background:C.subtle,borderRight:`1px solid ${C.border}`,borderBottom:`2px solid ${C.border}`,minWidth:LABEL_W}}>Criteria</th>
              {qts.map((qt,i)=>(<th key={qt.id} style={{padding:"9px 14px",fontSize:11,fontWeight:700,textAlign:"center",color:VDR_COLORS[i%VDR_COLORS.length],background:C.subtle,borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`,borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,minWidth:COL_W}}>{qt.vendorName}</th>))}
            </tr></thead>
            <tbody>
              {/* ── Quotation Comparison (full) ── */}
              {(()=>{
                const calcNetLocal=(qt)=>{const pc=qt.priceConditions||{};const sub=qt.totalAmt;return sub-sub*(pc.discount||0)/100+sub*(pc.surcharge||0)/100+(pc.freight||0)+(pc.insurance||0);};
                const netsLocal=qts.map(calcNetLocal);
                const bestNetLocal=Math.min(...netsLocal);
                const itemBestPriceLocal=(rfq.items||[]).map((_,ii)=>{const prices=qts.map(qt=>qt.items?.[ii]?.unitPrice??Infinity).filter(p=>isFinite(p));return prices.length?Math.min(...prices):null;});
                const SHdr=({title})=>(<tr><td colSpan={qts.length+1} style={{padding:"7px 14px",background:C.subtle,fontWeight:700,fontSize:10,color:C.t2,textTransform:"uppercase",letterSpacing:.8,borderTop:`2px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>{title}</td></tr>);
                const CRow=({label,vals,fmt=null,bestVal=null,bold=false,sub=false}:any)=>(
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"7px 14px",fontSize:sub?11:12,color:sub?C.t2:C.t1,fontWeight:500,background:C.card,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W,whiteSpace:"nowrap" as const,paddingLeft:sub?24:14}}>{label}</td>
                    {vals.map((v,i)=>{const isBest=bestVal!=null&&v===bestVal&&qts.length>1;return(<td key={i} style={{padding:"7px 14px",fontSize:12,fontWeight:bold?700:400,textAlign:"right",color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.card,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>{fmt?fmt(v):(v||"—")}{isBest&&<span style={{fontSize:9,marginLeft:4,color:C.ok,fontWeight:700}}>★ BEST</span>}</td>);})}
                  </tr>
                );
                return(<>
                  <SHdr title="Vendor Information"/>
                  <CRow label="Vendor Number" vals={qts.map(q=>q.vendorId)}/>
                  <CRow label="Vendor Name" vals={qts.map(q=>q.vendorName)}/>
                  <CRow label="Sales Person / Contact" vals={qts.map(q=>q.salesPerson||"—")}/>
                  <CRow label="Quotation ID" vals={qts.map(q=>q.id)}/>
                  <CRow label="Submitted Date" vals={qts.map(q=>fmtDate(q.submittedDate))}/>
                  <CRow label="Valid Until" vals={qts.map(q=>fmtDate(q.validUntil))}/>
                  <CRow label="Status" vals={qts.map(q=>q.status)}/>
                  <SHdr title="Purchasing Details"/>
                  <CRow label="Purchasing Organization" vals={qts.map(()=>rfq.purchOrg||"—")}/>
                  <CRow label="Purchasing Group" vals={qts.map(q=>pgLabel(q.purchGroup||rfq.purchGroup))}/>
                  <SHdr title="Commercial Terms"/>
                  <CRow label="Terms of Payment" vals={qts.map(q=>q.termsOfPayment||"—")}/>
                  <CRow label="Delivery Terms (Incoterms)" vals={qts.map(q=>q.deliveryTerms||"—")}/>
                  <CRow label="Lead Time" vals={qts.map(q=>q.leadTime||"—")}/>
                  <CRow label="Warranty Period" vals={qts.map(q=>q.warrantyPeriod||"—")}/>
                  <SHdr title="Line Items — Price Comparison"/>
                  {(rfq.items||[]).map((item,ii)=>(
                    <Fragment key={`ci-${ii}`}>
                      <tr style={{background:C.infoBg}}>
                        <td colSpan={qts.length+1} style={{padding:"5px 14px 5px 28px",fontSize:11,fontWeight:700,color:C.info,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
                          {String(item.no).padStart(3,"0")} · {item.desc}<span style={{fontWeight:400,color:C.t2,marginLeft:8}}>({item.qty} {item.uom})</span>
                        </td>
                      </tr>
                      <CRow label="Product / Material Group" vals={qts.map(q=>q.items?.[ii]?.materialGroup||item.materialGroup||"—")} sub/>
                      <CRow label="Unit Price (IDR)" vals={qts.map(q=>q.items?.[ii]?.unitPrice||0)} fmt={v=>idr(v)} bestVal={itemBestPriceLocal[ii]} bold sub/>
                      <CRow label="Item Total (IDR)" vals={qts.map(q=>q.items?.[ii]?.total||0)} fmt={v=>idr(v)} sub/>
                    </Fragment>
                  ))}
                  <SHdr title="Price Conditions & Summary"/>
                  <CRow label="Subtotal" vals={qts.map(q=>q.totalAmt)} fmt={v=>idr(v)}/>
                  <CRow label="Discount (%)" vals={qts.map(q=>`${q.priceConditions?.discount||0}%`)}/>
                  <CRow label="Discount Amount" vals={qts.map(q=>q.totalAmt*(q.priceConditions?.discount||0)/100)} fmt={v=>v>0?`(${idr(v)})`:"—"} sub/>
                  <CRow label="Surcharge (%)" vals={qts.map(q=>`${q.priceConditions?.surcharge||0}%`)}/>
                  <CRow label="Surcharge Amount" vals={qts.map(q=>q.totalAmt*(q.priceConditions?.surcharge||0)/100)} fmt={v=>v>0?idr(v):"—"} sub/>
                  <CRow label="Freight Cost" vals={qts.map(q=>q.priceConditions?.freight||0)} fmt={v=>v>0?idr(v):"—"}/>
                  <CRow label="Insurance Cost" vals={qts.map(q=>q.priceConditions?.insurance||0)} fmt={v=>v>0?idr(v):"—"}/>
                  <tr style={{background:C.subtle,borderTop:`2px solid ${C.border}`}}>
                    <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.t1,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W}}>NET TOTAL (IDR)</td>
                    {qts.map((qt,i)=>{const net=netsLocal[i];const isBest=net===bestNetLocal&&qts.length>1;return(<td key={qt.id} style={{padding:"11px 14px",fontSize:14,fontWeight:700,textAlign:"right",color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.subtle,borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>{idr(net)}{isBest&&<div style={{fontSize:10,color:C.ok,fontWeight:700,marginTop:2}}>★ Recommended (Lowest Net)</div>}</td>);})}
                  </tr>
                </>);
              })()}
              <tr><td colSpan={qts.length+1} style={{padding:"7px 14px",background:"rgba(0,112,242,0.08)",fontWeight:700,fontSize:10,color:C.primary,textTransform:"uppercase",letterSpacing:.8,borderBottom:`1px solid ${C.border}`}}>Evaluation Scoring (0 – 100 per criteria)</td></tr>
              {SCORE_CRITERIA.map((crit,ri)=>(
                <tr key={crit.key} style={{borderBottom:`1px solid ${C.border}`,background:ri%2===0?C.card:C.subtle}}>
                  <td style={{padding:"10px 14px",borderRight:`1px solid ${C.border}`,minWidth:LABEL_W,background:C.card}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.t1}}>{crit.label} <span style={{fontSize:10,fontWeight:400,color:C.primary}}>({(crit.weight*100).toFixed(0)}%)</span></div>
                    <div style={{fontSize:11,color:C.t2,marginTop:2}}>{crit.desc}</div>
                  </td>
                  {qts.map((qt,i)=>{
                    const val=(scores[qt.id]||{})[crit.key]||"";
                    const num=Number(val);
                    const scoreColor=val===""?C.border:num>=80?"#107e3e":num>=60?VDR_COLORS[i%VDR_COLORS.length]:num>=40?"#e9730c":"#bb0000";
                    return(
                      <td key={qt.id} style={{padding:"10px 14px",borderRight:`1px solid ${C.border}`,textAlign:"center",verticalAlign:"middle",minWidth:COL_W}}>
                        <input type="number" min={0} max={100} value={val}
                          onChange={e=>setScores(p=>({...p,[qt.id]:{...(p[qt.id]||{}),[crit.key]:e.target.value}}))}
                          style={{width:80,textAlign:"center",padding:"6px 10px",border:`2px solid ${scoreColor}`,borderRadius:6,fontSize:16,fontWeight:700,color:scoreColor===C.border?C.t2:scoreColor,background:C.card,outline:"none",fontFamily:"inherit"}}
                          placeholder="—"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{background:"rgba(0,112,242,0.05)",borderTop:`2px solid ${C.primary}`}}>
                <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.t1,borderRight:`1px solid ${C.border}`,minWidth:LABEL_W}}>
                  WEIGHTED TOTAL SCORE
                  <div style={{fontSize:10,fontWeight:400,color:C.t2,marginTop:2}}>40% Tech + 40% Commercial + 20% HSE</div>
                </td>
                {qts.map((qt,i)=>{
                  const total=getWeightedTotal(qt.id);
                  const isTop=total!==null&&total===maxTotal&&maxTotal>0;
                  return(
                    <td key={qt.id} style={{padding:"11px 14px",fontSize:14,fontWeight:700,textAlign:"center",color:isTop?"#107e3e":C.t1,background:isTop?"#e8f5e9":"rgba(0,112,242,0.05)",borderRight:`1px solid ${C.border}`,minWidth:COL_W}}>
                      {total!==null?<><div style={{fontSize:28,fontWeight:700}}>{total}</div>{isTop&&<div style={{fontSize:10,color:"#107e3e",fontWeight:700,marginTop:4}}>★ Top Score</div>}</>:<span style={{fontSize:13,color:C.t2}}>—</span>}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Evaluation Notes / Remarks</label>
          <TA value={scoreNotes} onChange={setScoreNotes} rows={3} placeholder="Summarize evaluation rationale, key differentiators, or committee remarks…"/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",alignItems:"center"}}>
          <span style={{fontSize:11,color:C.t2,flex:1}}>Submitting scores moves this RFQ to Scored status, ready to be sent for approval.</span>
          <Btn v="ghost" onClick={()=>{setScoreModal(null);setScores({});setScoreNotes("");}}>Cancel</Btn>
          <Btn v="success" onClick={()=>{
            const allFilled=qts.every(qt=>SCORE_CRITERIA.every(c=>(scores[qt.id]||{})[c.key]!==""));
            if(!allFilled){alert("Please fill in all scores for all vendors before submitting.");return;}
            submitBuyerScores();
          }}>
            <SapIcon name="accept" size={13} color="#fff"/> Submit Scoring
          </Btn>
        </div>
      </Modal>
      );
    })()}
    {awardModal&&<AwardDecisionModal rfq={awardModal.rfq} quotations={awardModal.qts} user={user} onClose={()=>setAwardModal(null)} onSubmit={(p)=>submitAwardProposal(awardModal.rfq.id,p)}/>}
    {reviewModal&&<ReviewAwardModal rfq={reviewModal.rfq} quotations={reviewModal.qts} user={user} onClose={()=>setReviewModal(null)} onApprove={()=>approveAward(reviewModal.rfq.id)} onReject={()=>rejectAward(reviewModal.rfq.id)}/>}
  </div>
  );
};

// ── Approver RFQ ──────────────────────────────────────────────
export const ApproverRfq = ({rfqs, setRfqs, quotations, setQuotations, user}) => {
  const [flt,setFlt]=useState("Award Proposed");
  const [expanded,setExpanded]=useState({});
  const [allExpanded,setAllExpanded]=useState(false);
  const [adaptOpen2,setAdaptOpen2]=useState(false);
  const [visibleFields2,setVisibleFields2]=useState<Set<string>>(new Set(ALL_RFQ_FILTER_FIELDS.filter(f=>f.defaultOn).map(f=>f.id)));
  const EMPTY_FLT2={rfqNo:"",rfqTitle:"",companyCodes:[],statuses:[],postedBy:"",category:"",openFrom:"",openTo:"",closingFrom:"",closingTo:"",purchOrg:"",plant:"",estValMin:"",estValMax:""};
  const [draft2,setDraft2]=useState(EMPTY_FLT2);
  const [applied,setApplied]=useState(EMPTY_FLT2);
  const sd2=(k,v)=>setDraft2(p=>({...p,[k]:v}));
  const applyFilters=()=>setApplied({...draft2});
  const resetFilters=()=>{setDraft2(EMPTY_FLT2);setApplied(EMPTY_FLT2);};
  const [vhOpen2,setVhOpen2]=useState<string|null>(null);
  const clrA2=(k)=>{setDraft2(p=>({...p,[k]:Array.isArray(EMPTY_FLT2[k])?[]:EMPTY_FLT2[k]}));setApplied(p=>({...p,[k]:Array.isArray(EMPTY_FLT2[k])?[]:EMPTY_FLT2[k]}));};
  const ALL_RFQ_STATUSES=["Award Proposed","Award Approved","Closed"];
  const ALL_CATEGORIES=[...new Set(rfqs.map(r=>r.cat).filter(Boolean))].sort();

  const [selIds,setSelIds]=useState(new Set<string>());
  const [compareData,setCompareData]=useState<any>(null);
  const [aprRfqTabs,setAprRfqTabs]=useState<{[id:string]:string}>({});
  const aprTab=(rfqId)=>aprRfqTabs[rfqId]||"overview";
  const setAprTab=(rfqId,tab)=>setAprRfqTabs(p=>({...p,[rfqId]:tab}));
  const postDiscussion = (rfqId, entry) => setRfqs(p=>p.map(r=>r.id===rfqId?{...r,discussions:[...(r.discussions||[]),entry]}:r));
  const [detailAprRfq,setDetailAprRfq]=useState<any>(null);
  const [aprDetailTab,setAprDetailTab]=useState("general");

  // Approve/Reject modal state
  const [actionModal,setActionModal]=useState<{rfq:any,action:"approve"|"reject"}|null>(null);
  const [reviewModal,setReviewModal]=useState<{rfq:any,qts:any[]}|null>(null);
  const [winnerVendorId,setWinnerVendorId]=useState("");
  const [actionNotes,setActionNotes]=useState("");

  const getWeightedTotal=(qt)=>{
    const s=qt.scores||{};
    if(s.weighted!=null) return s.weighted;
    const t=Number(s.technical)||0, c=Number(s.commercial)||0, h=Number(s.hse)||0;
    if(!s.technical&&!s.commercial&&!s.hse) return null;
    return Math.round(t*0.4+c*0.4+h*0.2);
  };

  const activeTokens=[
    applied.companyCodes.length>0&&{label:"Company Code",val:applied.companyCodes.length===1?`${applied.companyCodes[0]} – ${ccName(applied.companyCodes[0])}`:`${applied.companyCodes.length} selected`,onClear:()=>clrA2("companyCodes")},
    applied.statuses.length>0&&{label:"Status",val:applied.statuses.length===1?applied.statuses[0]:`${applied.statuses.length} selected`,onClear:()=>clrA2("statuses")},
    applied.rfqNo&&{label:"RFQ No",val:applied.rfqNo,onClear:()=>clrA2("rfqNo")},
    applied.rfqTitle&&{label:"RFQ Title",val:applied.rfqTitle,onClear:()=>clrA2("rfqTitle")},
    applied.postedBy&&{label:"Tender Admin",val:applied.postedBy,onClear:()=>clrA2("postedBy")},
    applied.category&&{label:"Category",val:applied.category,onClear:()=>clrA2("category")},
    (applied.openFrom||applied.openTo)&&{label:"Open Date",val:[applied.openFrom&&fmtDate(applied.openFrom),applied.openTo&&fmtDate(applied.openTo)].filter(Boolean).join(" – "),onClear:()=>{clrA2("openFrom");clrA2("openTo");}},
    (applied.closingFrom||applied.closingTo)&&{label:"Closing Date",val:[applied.closingFrom&&fmtDate(applied.closingFrom),applied.closingTo&&fmtDate(applied.closingTo)].filter(Boolean).join(" – "),onClear:()=>{clrA2("closingFrom");clrA2("closingTo");}},
    applied.estValMin&&{label:"Est. Value ≥",val:`IDR ${Number(applied.estValMin).toLocaleString()}`,onClear:()=>clrA2("estValMin")},
    applied.estValMax&&{label:"Est. Value ≤",val:`IDR ${Number(applied.estValMax).toLocaleString()}`,onClear:()=>clrA2("estValMax")},
  ].filter(Boolean);

  const list=rfqs
    .filter(r=>{
      if(flt==="All") return r.status==="Award Proposed"&&!r.awardProposal?.l1Approved;
      return r.status===flt&&!r.awardProposal?.l1Approved;
    })
    .filter(r=>applied.companyCodes.length===0||applied.companyCodes.includes(r.companyCode))
    .filter(r=>applied.statuses.length===0||applied.statuses.includes(r.status))
    .filter(r=>!applied.rfqNo    ||r.id?.toLowerCase().includes(applied.rfqNo.toLowerCase()))
    .filter(r=>!applied.rfqTitle ||r.title?.toLowerCase().includes(applied.rfqTitle.toLowerCase()))
    .filter(r=>!applied.postedBy ||r.postedBy?.toLowerCase().includes(applied.postedBy.toLowerCase()))
    .filter(r=>!applied.category ||r.cat===applied.category)
    .filter(r=>!applied.openFrom   ||(r.postedDate&&r.postedDate>=applied.openFrom))
    .filter(r=>!applied.openTo     ||(r.postedDate&&r.postedDate<=applied.openTo))
    .filter(r=>!applied.closingFrom||(r.closingDate&&r.closingDate>=applied.closingFrom))
    .filter(r=>!applied.closingTo  ||(r.closingDate&&r.closingDate<=applied.closingTo))
    .filter(r=>!applied.estValMin  ||r.estVal>=Number(applied.estValMin))
    .filter(r=>!applied.estValMax  ||r.estVal<=Number(applied.estValMax));

  const getQts=rfqId=>quotations.filter(q=>q.rfqId===rfqId);
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));

  const HDR_COLS=["","","Status","SAP RFQ No","RFQ Number","Description","Created Date","Closing Date","Tender Admin","Budget","Co. Code","Quotations"];
  const [colW,setColW]=useState([32,32,90,130,115,200,85,90,120,120,60,75]);
  const _rfqTot=colW.reduce((a,b)=>a+b,0);
  const rfqMinW=_rfqTot;
  const gridCols=colW.map(w=>`${(w/_rfqTot*100).toFixed(3)}%`).join(" ");

  const CHILD_HDRS=["#","Material / Service","Mat. No.","Qty","UoM","Req. Date"];
  const colW2=[50,220,130,60,90,170];
  const gridCols2=colW2.map(w=>`${w}px`).join(" ");

  const submitAction=()=>{
    if(!actionModal) return;
    const {rfq}=actionModal;
    const today=new Date().toISOString().split("T")[0];
    if(!actionNotes.trim()){alert("Please provide rejection notes.");return;}
    setRfqs(p=>p.map(r=>r.id===rfq.id?{...r,status:"Scored",rejectedByApprover:true,approverRejNotes:actionNotes,approverRejAt:today}:r));
    setActionModal(null);setActionNotes("");
  };
  const approveRfq=(rfq)=>{
    const today=new Date().toISOString().split("T")[0];
    setRfqs(p=>p.map(r=>r.id===rfq.id?{...r,awardProposal:{...r.awardProposal,l1Approved:true,l1ApprovedBy:user?.username,l1ApprovedAt:today}}:r));
  };

  return (
    <div style={{padding:pg()}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>RFQ Approval</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>Tender Committee review · Approve winner or reject back to buyer</div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f3eeff",border:`1px solid #6f2da840`,borderRadius:6,marginBottom:16,fontSize:13,color:"#6f2da8"}}>
        <SapIcon name="approvals" size={16} color="#6f2da8"/>
        <span>Showing RFQs pending your Level 1 approval. Expand an RFQ to compare vendor quotations side-by-side before deciding.</span>
      </div>

      {/* Action Modal (Reject only) */}
      {actionModal&&(
        <Modal title="Reject RFQ – Send Back to Buyer" onClose={()=>{setActionModal(null);setActionNotes("");}}>
          <div style={{padding:20,minWidth:420,maxWidth:560}}>
            <div style={{marginBottom:14,padding:"10px 14px",background:C.subtle,borderRadius:6,fontSize:13}}>
              <span style={{fontWeight:700,color:C.t1}}>{actionModal.rfq.id}</span>
              <span style={{color:C.t2,marginLeft:8}}>{actionModal.rfq.title}</span>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Rejection Reason <span style={{color:C.err}}>*</span></label>
              <TA value={actionNotes} onChange={setActionNotes} rows={3} placeholder="Provide reason for rejection…"/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn v="ghost" onClick={()=>{setActionModal(null);setActionNotes("");}}>Cancel</Btn>
              <Btn v="danger" onClick={submitAction}>Reject – Return to Buyer</Btn>
            </div>
          </div>
        </Modal>
      )}

      <FioriBar activeTokens={activeTokens} onGo={applyFilters} onReset={resetFilters} onAdaptFilters={()=>setAdaptOpen2(true)} adaptFiltersCount={visibleFields2.size}>
        {visibleFields2.has("companyCodes")&&<FField label="Company Code"><ValueHelpInp selected={draft2.companyCodes} getLabel={k=>`${k} – ${ccName(k)}`} onOpen={()=>setVhOpen2("companyCode")} placeholder="All Company Codes"/></FField>}
        {visibleFields2.has("statuses")&&<FField label="Status"><ValueHelpInp selected={draft2.statuses} getLabel={k=>k} onOpen={()=>setVhOpen2("status")} placeholder="All Statuses"/></FField>}
        {visibleFields2.has("rfqNo")&&<FField label="RFQ Number"><Inp value={draft2.rfqNo} onChange={v=>sd2("rfqNo",v)} placeholder="e.g. RFQ-2025-0001"/></FField>}
        {visibleFields2.has("rfqTitle")&&<FField label="RFQ Title"><Inp value={draft2.rfqTitle} onChange={v=>sd2("rfqTitle",v)} placeholder="e.g. Laptops"/></FField>}
        {visibleFields2.has("postedBy")&&<FField label="Tender Administrator"><Inp value={draft2.postedBy} onChange={v=>sd2("postedBy",v)} placeholder="e.g. Ahmad Rizki"/></FField>}
        {visibleFields2.has("category")&&<FField label="Category"><ValueHelpInp selected={draft2.category?[draft2.category]:[]} getLabel={k=>k} onOpen={()=>setVhOpen2("category")} placeholder="All Categories"/></FField>}
        {visibleFields2.has("openDate")&&<FField label="Open Date Range"><DateRangePicker from={draft2.openFrom} to={draft2.openTo} onChange={(f,t)=>{sd2("openFrom",f);sd2("openTo",t);}}/></FField>}
        {visibleFields2.has("closingDate")&&<FField label="Closing Date Range"><DateRangePicker from={draft2.closingFrom} to={draft2.closingTo} onChange={(f,t)=>{sd2("closingFrom",f);sd2("closingTo",t);}}/></FField>}
        {visibleFields2.has("estValMin")&&<FField label="Est. Value (From)"><Inp type="number" value={draft2.estValMin} onChange={v=>sd2("estValMin",v)} placeholder="Min (IDR)"/></FField>}
        {visibleFields2.has("estValMax")&&<FField label="Est. Value (To)"><Inp type="number" value={draft2.estValMax} onChange={v=>sd2("estValMax",v)} placeholder="Max (IDR)"/></FField>}
      </FioriBar>

      <AdaptFiltersDialog open={adaptOpen2} onClose={()=>setAdaptOpen2(false)} visibleFields={visibleFields2}
        onSave={s=>setVisibleFields2(s)} draft={draft2} allFields={ALL_RFQ_FILTER_FIELDS}
        hasValue={id=>{
          if(id==="companyCodes")return draft2.companyCodes.length>0;
          if(id==="statuses")return draft2.statuses.length>0;
          if(id==="openDate")return !!(draft2.openFrom||draft2.openTo);
          if(id==="closingDate")return !!(draft2.closingFrom||draft2.closingTo);
          return !!(draft2 as any)[id];
        }}/>

      {vhOpen2==="companyCode"&&(
        <ValueHelpDialog title="Company Code" cols={[{key:"v",label:"Code",width:80},{key:"l",label:"Company Name",width:220}]}
          rows={COMPANY_CODES} keyField="v" labelField="l"
          selected={draft2.companyCodes} onConfirm={s=>{sd2("companyCodes",s);setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}
      {vhOpen2==="status"&&(
        <ValueHelpDialog title="Status" cols={[{key:"v",label:"Status",width:180}]}
          rows={ALL_RFQ_STATUSES.map(s=>({v:s,l:s}))} keyField="v" labelField="l"
          selected={draft2.statuses} onConfirm={s=>{sd2("statuses",s);setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}
      {vhOpen2==="category"&&(
        <ValueHelpDialog title="Category" cols={[{key:"v",label:"Category",width:200}]}
          rows={ALL_CATEGORIES.map(c=>({v:c,l:c}))} keyField="v" labelField="l"
          selected={draft2.category?[draft2.category]:[]} multiSelect={false}
          onConfirm={s=>{sd2("category",s[0]||"");setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}

      <FilterBar opts={["All","Award Proposed","Award Approved","Closed"]} val={flt} onChange={setFlt}/>

      {/* Toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 12px",height:44,background:C.card,border:`1px solid ${C.border}`,borderBottom:"none",borderRadius:"8px 8px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14,fontWeight:700,color:C.t1,marginRight:6}}>RFQs</span>
          <span style={{fontSize:12,color:C.t2}}>({list.length})</span>
          {(()=>{
            const selList=[...selIds].map(id=>rfqs.find(r=>r.id===id)).filter(Boolean);
            const selRfq=selList.length===1?selList[0]:null;
            const canReviewAward=!!selRfq&&selRfq.status==="Award Proposed";
            const reviewTitle=selIds.size===0?"Check an Award Proposed RFQ first":selList.length>1?"Select only 1 RFQ":!selRfq||selRfq.status!=="Award Proposed"?"RFQ must be in Award Proposed status":"";
            return(
              <button onClick={()=>{if(!canReviewAward||!selRfq)return;const qts=quotations.filter(q=>q.rfqId===selRfq.id);setReviewModal({rfq:selRfq,qts});}} disabled={!canReviewAward}
                style={{background:canReviewAward?"#6f2da8":C.subtle,border:`1px solid ${canReviewAward?"transparent":C.border}`,color:canReviewAward?"#fff":C.t2,borderRadius:4,padding:"0 0.9rem",fontSize:12,fontFamily:"inherit",cursor:canReviewAward?"pointer":"not-allowed",height:28,display:"flex",alignItems:"center",gap:5,fontWeight:600,opacity:canReviewAward?1:0.6,transition:"all .15s"}}
                title={reviewTitle}>
                <SapIcon name="process" size={13} color={canReviewAward?"#fff":C.t2}/> Review Award
              </button>
            );
          })()}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>{if(allExpanded){setExpanded({});setAllExpanded(false);}else{const m={};list.forEach(r=>{m[r.id]=true;});setExpanded(m);setAllExpanded(true);}}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.75rem",fontSize:12,fontFamily:"inherit",cursor:"pointer",height:28,display:"flex",alignItems:"center",gap:4}}>
            <SapIcon name={allExpanded?"collapse-all":"expand-all"} size={13} color={C.t1}/>{allExpanded?"Collapse All":"Expand All"}
          </button>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"flex-start",gap:0,position:"relative"}}>
        <div style={{flex:detailAprRfq?"0 0 52%":"1 1 100%",overflowX:"auto",borderRadius:"0 0 8px 8px",border:`1px solid ${C.border}`,transition:"flex .2s"}}>
        <div style={{minWidth:rfqMinW,background:C.card}}>
        <div style={{display:"grid",gridTemplateColumns:gridCols,background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
          <div style={{padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <input type="checkbox" checked={list.length>0&&list.every(r=>selIds.has(r.id))}
              onChange={e=>{const s=new Set(selIds);if(e.target.checked)list.forEach(r=>s.add(r.id));else list.forEach(r=>s.delete(r.id));setSelIds(s);}}
              style={{accentColor:C.primary,cursor:"pointer"}}/>
          </div>
          {HDR_COLS.slice(1).map((h,i)=>(
            <div key={i} style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2,whiteSpace:"nowrap",overflow:"hidden",userSelect:"none",display:"flex",alignItems:"center"}}>{h}</div>
          ))}
        </div>

        {list.length===0&&<div style={{padding:"28px 16px",textAlign:"center",color:C.t2,fontSize:13}}>No RFQs found.</div>}

        {list.map(rfq=>{
          const open=!!expanded[rfq.id];
          const qts=getQts(rfq.id);
          const sel=selIds.has(rfq.id);
          const rowBg=sel?C.selection:C.card;
          const cell=(extra?:any)=>({padding:"8px 10px",display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap" as const,...extra});
          const sapNo=rfq.sapRfqNo||(`70${rfq.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);
          return (
            <div key={rfq.id} style={{borderBottom:`1px solid ${C.border}`}}>
              <div onClick={()=>toggle(rfq.id)} style={{display:"grid",gridTemplateColumns:gridCols,background:rowBg,cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>e.currentTarget.style.background=sel?C.selection:C.infoBg}
                onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
                <div onClick={e=>{e.stopPropagation();const s=new Set(selIds);sel?s.delete(rfq.id):s.add(rfq.id);setSelIds(s);}} style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"10px 6px",flexShrink:0}}>
                  <input type="checkbox" checked={sel} onChange={()=>{}} style={{accentColor:C.primary,cursor:"pointer"}}/>
                </div>
                <div onClick={e=>{e.stopPropagation();toggle(rfq.id);}} style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"10px 6px",flexShrink:0}}>
                  <span style={{fontSize:10,color:C.primary,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                </div>
                <div style={cell({justifyContent:"flex-start"})}><Badge s={rfq.status}/></div>
                <div style={cell({overflow:"hidden"})}>
                  {sapNo==="—"?<span style={{fontSize:13,color:C.t2}}>—</span>:<span style={{fontSize:13,fontWeight:600,color:C.primary,overflow:"hidden",textOverflow:"ellipsis"}}>{sapNo}</span>}
                </div>
                <div style={cell({fontSize:13,fontWeight:700,color:C.primary})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.id}</span></div>
                <div style={cell({fontSize:13,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.title}</span></div>
                <div style={cell({fontSize:13,color:C.t2})}>{fmtDate(rfq.postedDate)}</div>
                <div style={cell({fontSize:13,fontWeight:600,color:C.t1})}>{fmtDate(rfq.closingDate)}</div>
                <div style={cell({fontSize:13,color:C.t2})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.postedBy}</span></div>
                <div style={cell({fontSize:13,fontWeight:700,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{idr(rfq.estVal)}</span></div>
                <div style={cell({fontSize:13,color:C.t2})}>{rfq.companyCode||"—"}</div>
                <div onClick={e=>{e.stopPropagation();setDetailAprRfq(rfq);setAprDetailTab("general");}} style={{...cell({cursor:"pointer",justifyContent:"space-between"})}}>
                  <span>
                    {qts.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontWeight:700}}>{qts.length}</span>}
                    {qts.length===0&&<span style={{color:C.t2}}>0</span>}
                  </span>
                  <span style={{fontSize:16,color:detailAprRfq?.id===rfq.id?C.primary:"#32363a",fontWeight:detailAprRfq?.id===rfq.id?700:300}}>›</span>
                </div>
              </div>

              {open&&(
                <div style={{background:C.infoBg,borderTop:`1px solid ${C.border}`}}>
                  {/* Tab bar */}
                  <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card,overflowX:"auto"}}>
                    {[{k:"overview",label:"Overview"},{k:"notes",label:"Notes"},{k:"discussion",label:`Discussion (${(rfq.discussions||[]).length})`}].map(t=>(
                      <button key={t.k} onClick={()=>setAprTab(rfq.id,t.k)} style={{background:"none",border:"none",borderBottom:aprTab(rfq.id)===t.k?`2px solid ${C.primary}`:"2px solid transparent",color:aprTab(rfq.id)===t.k?C.primary:C.t2,fontFamily:"inherit",fontSize:12,fontWeight:aprTab(rfq.id)===t.k?700:400,cursor:"pointer",padding:"9px 14px",whiteSpace:"nowrap",transition:"color .15s",marginBottom:-1}}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Overview tab */}
                  {aprTab(rfq.id)==="overview"&&(<>
                    {/* Scope */}
                    <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Scope: </span>
                      <span style={{fontSize:12,color:C.t2}}>{rfq.desc}</span>
                    </div>

                    {/* Side-by-side Quotation Comparison */}
                    {qts.length>0&&(
                      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Quotation Comparison</div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{borderCollapse:"collapse",minWidth:500,width:"100%",fontSize:12}}>
                            <thead>
                              <tr style={{background:"rgba(0,112,242,0.07)"}}>
                                <th style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:C.t2,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>Criteria</th>
                                {qts.map(qt=>(
                                  <th key={qt.id} style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:C.primary,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap",borderLeft:`1px solid ${C.border}`}}>
                                    <div>{qt.vendorName}</div>
                                    <div style={{fontWeight:400,fontSize:11,color:C.t2}}>{qt.id}</div>
                                    <Badge s={qt.status}/>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                {label:"Total Amount",render:(qt)=><strong style={{color:C.t1}}>{idr(qt.totalAmt)}</strong>},
                                {label:"Validity Date",render:(qt)=><span style={{color:C.t2}}>{fmtDate(qt.validUntil)||"—"}</span>},
                                {label:"Delivery Terms",render:(qt)=><span style={{color:C.t2}}>{qt.deliveryTerms||"—"}</span>},
                                {label:"Payment Terms",render:(qt)=><span style={{color:C.t2}}>{qt.paymentTerms||"—"}</span>},
                                {label:"Notes",render:(qt)=><span style={{color:C.t2}}>{qt.notes||"—"}</span>},
                              ].map((row,ri)=>(
                                <tr key={ri} style={{background:ri%2===0?"transparent":"rgba(0,0,0,0.02)"}}>
                                  <td style={{padding:"7px 10px",fontWeight:600,color:C.t1,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{row.label}</td>
                                  {qts.map(qt=>(
                                    <td key={qt.id} style={{padding:"7px 10px",textAlign:"center",borderBottom:`1px solid ${C.border}`,borderLeft:`1px solid ${C.border}`}}>{row.render(qt)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {qts.length===0&&(
                      <div style={{padding:"12px 16px",color:C.t2,fontSize:13,fontStyle:"italic",borderBottom:`1px solid ${C.border}`}}>No quotations received for this RFQ.</div>
                    )}

                    {/* Action buttons for Award Proposed RFQs pending L1 approval */}
                    {rfq.status==="Award Proposed"&&!rfq.awardProposal?.l1Approved&&(
                      <div style={{padding:"12px 16px",display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:12,color:C.t2,marginRight:4}}>Proposed by <strong style={{color:C.t1}}>{rfq.awardProposal?.submittedByName||rfq.submittedForApprovalBy||"Buyer"}</strong> on {fmtDate(rfq.awardProposal?.submittedAt||rfq.submittedForApprovalAt)}</span>
                        <div style={{flex:1}}/>
                        <Btn v="danger" sm onClick={()=>{setActionModal({rfq,action:"reject"});setActionNotes("");}}>
                          <SapIcon name="cancel" size={13} color="#fff"/> Reject – Return to Buyer
                        </Btn>
                        <Btn v="success" sm onClick={()=>approveRfq(rfq)}>
                          <SapIcon name="accept" size={13} color="#fff"/> Approve (L1)
                        </Btn>
                      </div>
                    )}
                    {!(rfq.status==="Award Proposed"&&!rfq.awardProposal?.l1Approved)&&(
                      <div style={{padding:"8px 16px 10px"}}>
                        <span style={{fontSize:11,color:C.t2,fontStyle:"italic"}}>This RFQ is {rfq.status.toLowerCase()} — no action required.</span>
                      </div>
                    )}
                  </>)}

                  {/* Notes tab */}
                  {aprTab(rfq.id)==="notes"&&(
                    <div style={{padding:"16px"}}>
                      <div style={{fontSize:13,color:C.t1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{rfq.desc||"No notes."}</div>
                    </div>
                  )}

                  {/* Discussion tab */}
                  {aprTab(rfq.id)==="discussion"&&(
                    <DiscussionBox rfqId={rfq.id} discussions={rfq.discussions||[]} onPost={postDiscussion} user={user}/>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
        </div>

        {/* Detail panel — same as BrmRfq */}
        {detailAprRfq&&(()=>{
          const r=detailAprRfq;
          const qts=getQts(r.id);
          const sapNo=r.sapRfqNo||(`70${r.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);
          const TABS=["general","items","quotations","notes","discussion","docflow"];
          const TAB_LABELS={"general":"General Information","items":`Items (${r.items?.length||0})`,"quotations":`Quotations (${qts.length})`,"notes":"Notes","discussion":`Discussion (${(r.discussions||[]).length})`,"docflow":"Document Flow"};
          const field=(label,val)=>(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:C.t2,marginBottom:2}}>{label}:</div>
              <div style={{fontSize:13,color:C.t1,fontWeight:500}}>{val||"—"}</div>
            </div>
          );
          const sectionHdr=(title)=><div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{title}</div>;
          return(
          <div style={{flex:"0 0 48%",position:"sticky",top:0,maxHeight:"100vh",display:"flex",flexDirection:"column",background:C.card,overflow:"hidden",boxShadow:"-2px 0 10px rgba(0,0,0,0.08)"}}>
            {/* Panel Header */}
            <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${C.border}`,background:C.subtle,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:C.t1,lineHeight:1.3}}>{r.title}</div>
                  <div style={{fontSize:11,color:C.t2,marginTop:3,fontFamily:"monospace"}}>{sapNo}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <Badge s={r.status}/>
                  <button onClick={()=>setDetailAprRfq(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,padding:"0 2px",marginLeft:4}}>×</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:11}}>
                <div><span style={{color:C.t2}}>Created By: </span><span style={{color:C.t1,fontWeight:600}}>{r.postedBy}</span></div>
                <div><span style={{color:C.t2}}>Status: </span><span style={{color:C.t1,fontWeight:600}}>{r.status}</span></div>
                <div><span style={{color:C.t2}}>Created On: </span><span style={{color:C.t1}}>{fmtDate(r.postedDate)}</span></div>
                <div><span style={{color:C.t2}}>Target Value: </span><span style={{color:C.t1,fontWeight:600}}>{idr(r.estVal)}</span></div>
                <div><span style={{color:C.t2}}>Publishing Date: </span><span style={{color:C.t1}}>{fmtDate(r.postedDate)}</span></div>
                <div><span style={{color:C.t2}}>Quotation Deadline: </span><span style={{color:C.t1,fontWeight:600}}>{fmtDate(r.closingDate)}</span></div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card,flexShrink:0,overflowX:"auto"}}>
              {TABS.map(t=>(
                <button key={t} onClick={()=>setAprDetailTab(t)} style={{background:"none",border:"none",borderBottom:aprDetailTab===t?`2px solid ${C.primary}`:"2px solid transparent",color:aprDetailTab===t?C.primary:C.t2,fontFamily:"inherit",fontSize:12,fontWeight:aprDetailTab===t?700:400,cursor:"pointer",padding:"10px 14px",whiteSpace:"nowrap",transition:"color .15s",marginBottom:-1}}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>

              {aprDetailTab==="general"&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:16}}>
                    <div>
                      {sectionHdr("Basic Data")}
                      {field("RFQ Number",r.id)}
                      {field("RFQ Type","Int. Sourcing Req. (RQ)")}
                      {field("RFQ Description",r.title)}
                      {field("Category",r.cat)}
                      {field("Language Key","English (EN)")}
                    </div>
                    <div>
                      {sectionHdr("Organization")}
                      {field("Purchasing Organization",r.purchOrg)}
                      {field("Company Code",r.companyCode)}
                      {field("Plant",r.plant)}
                      {field("Tender Admin",r.postedBy)}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:16}}>
                    <div>
                      {sectionHdr("Important Dates")}
                      {field("Apply By",fmtDate(r.closingDate))}
                      {field("Quotation Deadline",fmtDate(r.closingDate))}
                      {field("Binding Period",fmtDate(r.closingDate))}
                      {field("Publishing Date",fmtDate(r.postedDate))}
                    </div>
                    <div>
                      {sectionHdr("Delivery & Payment")}
                      {field("Payment Terms","Due within 14 Days (Z014)")}
                      {field("Currency","Indonesian Rupiah (IDR)")}
                      {field("Incoterms","Ex Works (EXW)")}
                      {field("Target Value",idr(r.estVal))}
                    </div>
                  </div>
                  <div>
                    {sectionHdr("Scope")}
                    <div style={{fontSize:13,color:C.t2,lineHeight:1.6}}>{r.desc||"—"}</div>
                  </div>
                </div>
              )}

              {aprDetailTab==="items"&&(
                <div>
                  {(r.items||[]).length===0&&<div style={{color:C.t2,fontSize:13}}>No items.</div>}
                  {(r.items||[]).map((it,i)=>(
                    <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:10,background:C.subtle}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:C.t2,minWidth:28}}>#{String(it.no).padStart(3,"0")}</span>
                        <span style={{fontSize:13,fontWeight:700,color:C.t1}}>{it.desc}</span>
                        <span style={{marginLeft:"auto",background:it.type==="Service"?C.warnBg:C.okBg,color:it.type==="Service"?C.warn:C.ok,borderRadius:3,padding:"1px 7px",fontSize:11,fontWeight:700}}>{it.type}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px 16px",fontSize:12}}>
                        {it.materialNo&&<div><span style={{color:C.t2}}>Mat. No: </span><span style={{fontFamily:"monospace",color:C.t1}}>{it.materialNo}</span></div>}
                        {it.materialGroup&&<div><span style={{color:C.t2}}>Mat. Group: </span><span style={{color:C.t1}}>{it.materialGroup}</span></div>}
                        <div><span style={{color:C.t2}}>Plant: </span><span style={{color:C.t1}}>{it.plant||r.plant||"—"}</span></div>
                        <div><span style={{color:C.t2}}>Qty: </span><span style={{fontWeight:600,color:C.t1}}>{it.qty} {it.uom}</span></div>
                        {it.acctAssign&&<div><span style={{color:C.t2}}>Acct: </span><span style={{color:C.t1}}>{it.acctAssign}</span></div>}
                        {it.type==="Material"
                          ?<div><span style={{color:C.t2}}>Req. Date: </span><span style={{color:C.t1}}>{fmtDate(it.requirementDate)||"—"}</span></div>
                          :<div><span style={{color:C.t2}}>Period: </span><span style={{color:C.t1}}>{fmtDate(it.startDate)||"—"} – {fmtDate(it.endDate)||"—"}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aprDetailTab==="quotations"&&(
                <div>
                  {qts.length===0&&<div style={{color:C.t2,fontSize:13}}>No quotations received yet.</div>}
                  {qts.map(qt=>{
                    const sapQtNo=qt.sapQtNo||(["Accepted","Win","PO Ready"].includes(qt.status)?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");
                    return(
                    <div key={qt.id} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:8,background:C.card}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:C.t1}}>{qt.vendorName}</div>
                          <div style={{fontSize:11,color:C.t2,fontFamily:"monospace",marginTop:1}}>{qt.id} · SAP {sapQtNo}</div>
                        </div>
                        <Badge s={qt.status}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px 12px",fontSize:12}}>
                        <div><span style={{color:C.t2}}>Total: </span><span style={{fontWeight:700,color:C.t1}}>{idr(qt.totalAmt)}</span></div>
                        <div><span style={{color:C.t2}}>Submitted: </span><span style={{color:C.t1}}>{fmtDate(qt.submittedDate)||"—"}</span></div>
                        <div><span style={{color:C.t2}}>Valid Until: </span><span style={{color:C.t1}}>{fmtDate(qt.validUntil)||"—"}</span></div>
                        {qt.deliveryTerms&&<div style={{gridColumn:"1/-1"}}><span style={{color:C.t2}}>Delivery: </span><span style={{color:C.t1}}>{qt.deliveryTerms}</span></div>}
                        {qt.paymentTerms&&<div style={{gridColumn:"1/-1"}}><span style={{color:C.t2}}>Payment: </span><span style={{color:C.t1}}>{qt.paymentTerms}</span></div>}
                        {qt.scores&&<div style={{gridColumn:"1/-1",marginTop:4,padding:"6px 10px",background:C.infoBg,borderRadius:4,fontSize:11}}>
                          <span style={{fontWeight:700,color:C.t1}}>Score: </span>
                          <span style={{color:C.t2}}>Tech {qt.scores.technical} · Com {qt.scores.commercial} · HSE {qt.scores.hse} · </span>
                          <span style={{fontWeight:700,color:C.primary}}>Weighted {qt.scores.weighted}</span>
                        </div>}
                      </div>
                      {qt.notes&&<div style={{marginTop:6,fontSize:11,color:C.t2,fontStyle:"italic"}}>{qt.notes}</div>}
                    </div>
                  );})}
                </div>
              )}

              {aprDetailTab==="notes"&&(
                <div>
                  <div style={{fontSize:13,color:C.t1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.desc||"No notes."}</div>
                  {r.targets&&r.targets.length>0&&(
                    <div style={{marginTop:16}}>
                      {sectionHdr("Invited Vendors")}
                      {r.targets.map(vid=>(
                        <div key={vid} style={{fontSize:13,color:C.t1,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                          {VENDORS[vid]?.name||vid} <span style={{color:C.t2,fontSize:11}}>· {vid}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {aprDetailTab==="discussion"&&(
                <DiscussionBox rfqId={r.id} discussions={r.discussions||[]} onPost={postDiscussion} user={user}/>
              )}

              {aprDetailTab==="docflow"&&(
                <RfqDocumentFlow rfq={r} quotations={qts}/>
              )}

            </div>
          </div>
          );
        })()}
      </div>
      {compareData&&<QuotationCompareModal rfq={compareData.rfq} quotations={compareData.quotations} onClose={()=>setCompareData(null)}/>}
      {reviewModal&&<ReviewAwardModal rfq={reviewModal.rfq} quotations={reviewModal.qts} user={user}
        onApprove={()=>{approveRfq(reviewModal.rfq);setReviewModal(null);}}
        onReject={()=>{
          setActionModal({rfq:reviewModal.rfq,action:"reject"});setActionNotes("");setReviewModal(null);
        }}
        onClose={()=>setReviewModal(null)}/>}
    </div>
  );
};

// ── Approver Quotation (PO Confirmation) ────────────────────────
export const ApproverQuotation = ({quotations, setQuotations, rfqs, user}) => {
  const [flt,setFlt]=useState("Win");
  const [aprModal,setAprModal]=useState<{qt:any,action:"approve"|"reject"}|null>(null);
  const [notes,setNotes]=useState("");

  const EMPTY_FLT={rfqTitle:"",rfqId:"",vendorIds:[],statuses:[],submittedFrom:"",submittedTo:""};
  const [draft,setDraft]=useState(EMPTY_FLT);
  const [applied,setApplied]=useState(EMPTY_FLT);
  const sd=(k,v)=>setDraft(p=>({...p,[k]:v}));
  const applyFilters=()=>setApplied({...draft});
  const resetFilters=()=>{setDraft(EMPTY_FLT);setApplied(EMPTY_FLT);};
  const [adaptOpen,setAdaptOpen]=useState(false);
  const [visibleFields,setVisibleFields]=useState<Set<string>>(new Set(["vendorIds","statuses","rfqId","rfqTitle","submittedDate"]));
  const [vhOpen,setVhOpen]=useState<string|null>(null);
  const clrA=(k)=>{setDraft(p=>({...p,[k]:Array.isArray(EMPTY_FLT[k])?[]:EMPTY_FLT[k]}));setApplied(p=>({...p,[k]:Array.isArray(EMPTY_FLT[k])?[]:EMPTY_FLT[k]}));};

  const VENDOR_ROWS=Object.values(VENDORS).map((v:any)=>({v:v.id,l:v.name}));
  const ALL_QT_STATUSES=["Draft","Submitted","Accepted","Rejected","Win","Lost","Revised","PO Ready","Withdrawn"];

  const activeTokens=[
    applied.vendorIds.length>0&&{label:"Vendor",val:applied.vendorIds.length===1?(VENDORS[applied.vendorIds[0]] as any)?.name||applied.vendorIds[0]:`${applied.vendorIds.length} selected`,onClear:()=>clrA("vendorIds")},
    applied.statuses.length>0&&{label:"Status",val:applied.statuses.length===1?applied.statuses[0]:`${applied.statuses.length} selected`,onClear:()=>clrA("statuses")},
    applied.rfqId&&{label:"RFQ No",val:applied.rfqId,onClear:()=>clrA("rfqId")},
    applied.rfqTitle&&{label:"RFQ Title",val:applied.rfqTitle,onClear:()=>clrA("rfqTitle")},
    (applied.submittedFrom||applied.submittedTo)&&{label:"Submitted Date",val:[applied.submittedFrom&&fmtDate(applied.submittedFrom),applied.submittedTo&&fmtDate(applied.submittedTo)].filter(Boolean).join(" – "),onClear:()=>{clrA("submittedFrom");clrA("submittedTo");}},
  ].filter(Boolean);

  const list=quotations
    .filter(q=>flt==="All"||q.status===flt)
    .filter(q=>applied.vendorIds.length===0||applied.vendorIds.includes(q.vendorId))
    .filter(q=>applied.statuses.length===0||applied.statuses.includes(q.status))
    .filter(q=>!applied.rfqId    ||q.rfqId?.toLowerCase().includes(applied.rfqId.toLowerCase()))
    .filter(q=>!applied.rfqTitle ||q.rfqTitle?.toLowerCase().includes(applied.rfqTitle.toLowerCase()))
    .filter(q=>!applied.submittedFrom||(q.submittedDate&&q.submittedDate>=applied.submittedFrom))
    .filter(q=>!applied.submittedTo  ||(q.submittedDate&&q.submittedDate<=applied.submittedTo));

  const APR_FILTER_FIELDS=[
    {id:"vendorIds",     label:"Vendor",               defaultOn:true},
    {id:"statuses",      label:"Status",               defaultOn:true},
    {id:"rfqId",         label:"RFQ Number",           defaultOn:true},
    {id:"rfqTitle",      label:"RFQ Title",            defaultOn:true},
    {id:"submittedDate", label:"Submitted Date Range", defaultOn:true},
  ];

  const openApprove=(qt)=>{setNotes("");setAprModal({qt,action:"approve"});};
  const openReject=(qt)=>{setNotes("");setAprModal({qt,action:"reject"});};
  const confirmAction=()=>{
    if(!aprModal)return;
    setQuotations(prev=>prev.map(q=>
      q.id===aprModal.qt.id
        ?{...q,status:"PO Ready",poSapNo:notes.trim()||"—",approvedBy:user.name,approvedAt:new Date().toISOString().split("T")[0]}
        :q
    ));
    setAprModal(null);setNotes("");
  };

  return (
    <div style={{padding:pg()}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>PO Confirmation</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>📦 Confirm PO creation from SAP for winning quotations — triggers "PO Ready" status</div>
        </div>
      </div>

      <FioriBar activeTokens={activeTokens} onGo={applyFilters} onReset={resetFilters} onAdaptFilters={()=>setAdaptOpen(true)} adaptFiltersCount={visibleFields.size}>
        {visibleFields.has("vendorIds")&&<FField label="Vendor"><ValueHelpInp selected={draft.vendorIds} getLabel={k=>(VENDORS[k] as any)?.name||k} onOpen={()=>setVhOpen("vendor")} placeholder="All Vendors"/></FField>}
        {visibleFields.has("statuses")&&<FField label="Status"><ValueHelpInp selected={draft.statuses} getLabel={k=>k} onOpen={()=>setVhOpen("status")} placeholder="All Statuses"/></FField>}
        {visibleFields.has("rfqId")&&<FField label="RFQ Number"><Inp value={draft.rfqId} onChange={v=>sd("rfqId",v)} placeholder="e.g. RFQ-2025-0001"/></FField>}
        {visibleFields.has("rfqTitle")&&<FField label="RFQ Title"><Inp value={draft.rfqTitle} onChange={v=>sd("rfqTitle",v)} placeholder="e.g. Laptops"/></FField>}
        {visibleFields.has("submittedDate")&&<FField label="Submitted Date Range"><DateRangePicker from={draft.submittedFrom} to={draft.submittedTo} onChange={(f,t)=>{sd("submittedFrom",f);sd("submittedTo",t);}}/></FField>}
      </FioriBar>

      <AdaptFiltersDialog open={adaptOpen} onClose={()=>setAdaptOpen(false)} visibleFields={visibleFields}
        onSave={s=>setVisibleFields(s)} draft={draft} allFields={APR_FILTER_FIELDS}
        hasValue={id=>{
          if(id==="vendorIds")return draft.vendorIds.length>0;
          if(id==="statuses")return draft.statuses.length>0;
          if(id==="submittedDate")return !!(draft.submittedFrom||draft.submittedTo);
          return !!(draft as any)[id];
        }}/>

      {vhOpen==="vendor"&&(
        <ValueHelpDialog title="Vendor" cols={[{key:"v",label:"Vendor ID",width:100},{key:"l",label:"Vendor Name",width:220}]}
          rows={VENDOR_ROWS} keyField="v" labelField="l"
          selected={draft.vendorIds} onConfirm={s=>{sd("vendorIds",s);setVhOpen(null);}} onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="status"&&(
        <ValueHelpDialog title="Status" cols={[{key:"v",label:"Status",width:180}]}
          rows={ALL_QT_STATUSES.map(s=>({v:s,l:s}))} keyField="v" labelField="l"
          selected={draft.statuses} onConfirm={s=>{sd("statuses",s);setVhOpen(null);}} onClose={()=>setVhOpen(null)}/>
      )}

      <FilterBar opts={["All","Win","PO Ready"]} val={flt} onChange={setFlt}/>

      {/* Toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 12px",height:44,background:C.card,border:`1px solid ${C.border}`,borderBottom:"none",borderRadius:"8px 8px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14,fontWeight:700,color:C.t1,marginRight:6}}>Quotations</span>
          <span style={{fontSize:12,color:C.t2}}>({list.length})</span>
        </div>
      </div>

      <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:"0 0 8px 8px"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}>
          <thead>
            <tr style={{background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
              {["Status","SAP Quotation No","Quotation ID","RFQ Title","Vendor","Submitted","Valid Until","Total Amount","SAP PO No","Actions"].map(h=>(
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length===0&&(
              <tr><Td colSpan={10} style={{textAlign:"center",padding:40,color:C.t2}}>No quotations found.</Td></tr>
            )}
            {list.map(qt=>{
              const sapNo=qt.sapQtNo||(["Accepted","Win","PO Ready"].includes(qt.status)?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");
              const canAct=qt.status==="Win";
              return (
                <tr key={qt.id} style={{borderBottom:`1px solid ${C.border}`}}
                  onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
                  onMouseLeave={e=>(e.currentTarget.style.background="")}>
                  <Td><Badge s={qt.status}/></Td>
                  <Td><span style={{fontSize:12,color:C.primary,fontFamily:"monospace"}}>{sapNo}</span></Td>
                  <Td><span style={{fontSize:12,fontWeight:700,color:C.primary}}>{qt.id}</span></Td>
                  <Td>
                    <div style={{fontSize:13,fontWeight:600,color:C.t1}}>{qt.rfqTitle}</div>
                    <div style={{fontSize:11,color:C.t2}}>{qt.rfqId}</div>
                  </Td>
                  <Td>
                    <div style={{fontSize:13,color:C.t1}}>{qt.vendorName}</div>
                    <div style={{fontSize:11,color:C.t2}}>{qt.vendorId}</div>
                  </Td>
                  <Td style={{fontSize:12,color:C.t2}}>{fmtDate(qt.submittedDate)||"—"}</Td>
                  <Td style={{fontSize:12,color:C.t2}}>{fmtDate(qt.validUntil)||"—"}</Td>
                  <Td style={{fontSize:13,fontWeight:700,color:C.t1}}>{idr(qt.totalAmt)}</Td>
                  <Td>
                    {qt.poSapNo&&qt.poSapNo!=="—"
                      ?<span style={{fontSize:12,fontWeight:700,color:"#6f2da8",fontFamily:"monospace"}}>{qt.poSapNo}</span>
                      :<span style={{fontSize:11,color:C.t2,fontStyle:"italic"}}>—</span>}
                  </Td>
                  <Td>
                    {canAct&&(
                      <Btn v="primary" sm onClick={()=>openApprove(qt)}>
                        <SapIcon name="po-create" size={12} color="#fff"/> Confirm PO from SAP
                      </Btn>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Approval Modal */}
      {aprModal&&(
        <Modal title="Confirm PO Creation from SAP" onClose={()=>setAprModal(null)} width={540}>
          <div style={{marginBottom:14,padding:"10px 14px",background:C.infoBg,border:`1px solid ${C.info}`,borderRadius:6,fontSize:12,color:C.info}}>
            <strong>SAP Outbound Confirmation</strong> — This action simulates SAP sending a PO creation notification. The quotation status will be updated to <strong>PO Ready</strong>.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><Lbl>Quotation ID</Lbl><Val>{aprModal.qt.id}</Val></div>
            <div><Lbl>RFQ</Lbl><Val>{aprModal.qt.rfqTitle}</Val></div>
            <div><Lbl>Vendor</Lbl><Val>{aprModal.qt.vendorName}</Val></div>
            <div><Lbl>Total Amount</Lbl><Val style={{fontWeight:700,color:C.t1}}>{idr(aprModal.qt.totalAmt)}</Val></div>
          </div>
          <div style={{marginBottom:16}}>
            <Lbl>SAP PO Reference / Notes (optional)</Lbl>
            <TA value={notes} onChange={setNotes} placeholder="e.g. SAP PO No: 4500012345 created on 2025-07-02…" rows={2}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            <Btn v="ghost" onClick={()=>setAprModal(null)}>Cancel</Btn>
            <Btn v="primary" onClick={confirmAction}><SapIcon name="sales-order" size={13} color="#fff"/> Confirm – Set PO Ready</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Director Home ──────────────────────────────────────────────
export const DirectorHome = ({user, rfqs, quotations, setSection}) => {
  const today = new Date().toISOString().split("T")[0];
  const totalRfqs = rfqs.length;
  const created = rfqs.filter(r=>r.status==="Created");
  const pending = rfqs.filter(r=>r.status==="Scored");
  const closed = rfqs.filter(r=>r.status==="Closed");
  const open = rfqs.filter(r=>r.status==="Open");
  const scored = rfqs.filter(r=>r.status==="Scored");
  const totalBudget = rfqs.reduce((s,r)=>s+(r.estVal||0),0);
  const pendingBudget = pending.reduce((s,r)=>s+(r.estVal||0),0);

  const statuses = [
    {label:"Created",count:created.length,color:"#5b738b",bg:"#e8edf1"},
    {label:"Open",count:open.length,color:"#0854a0",bg:"#dbeeff"},
    {label:"Scored",count:scored.length,color:"#6f2da8",bg:"#f3eeff"},
    {label:"Closed",count:closed.length,color:"#6a6d70",bg:"#f4f4f4"},
  ];

  // Group pending by priority
  const highVal = pending.filter(r=>(r.estVal||0)>=1000000000);
  const recentDiscussions = rfqs.filter(r=>(r.discussions||[]).length>0)
    .sort((a,b)=>(b.discussions||[]).length-(a.discussions||[]).length).slice(0,5);
  const scoredPending = pending;

  const KpiCard = ({icon,label,value,sub,color="#0a6ed1",onClick=null}:any) => (
    <div onClick={onClick} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px",borderTop:`3px solid ${color}`,cursor:onClick?"pointer":"default",transition:"box-shadow .15s"}}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.1)")}
      onMouseLeave={e=>onClick&&(e.currentTarget.style.boxShadow="none")}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <SapIcon name={icon} size={16} color={color}/>
        <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6}}>{label}</span>
      </div>
      <div style={{fontSize:28,fontWeight:700,color:C.t1,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.t2,marginTop:4}}>{sub}</div>}
    </div>
  );

  return (
    <div style={{padding:pg(),maxWidth:1280,margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:C.t2,marginBottom:2}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        <div style={{fontSize:22,fontWeight:700,color:C.t1}}>Hi <span style={{color:C.primary}}>{user.name.split(" ")[0]}</span>!</div>
        <div style={{fontSize:13,color:C.t2,marginTop:2}}>{user.title} · RFQ Oversight Dashboard</div>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
        <KpiCard icon="org-chart" label="Total RFQs" value={totalRfqs} sub={`IDR ${(totalBudget/1e9).toFixed(1)}B total budget`} color="#32363a"/>
        <KpiCard icon="approvals" label="Scored (Pending Approval)" value={pending.length} sub={`IDR ${(pendingBudget/1e9).toFixed(1)}B awaiting decision`} color="#6f2da8" onClick={()=>setSection("dir-rfq")}/>
        <KpiCard icon="complete" label="Closed (Winner)" value={closed.length} sub={`${closed.length} awarded`} color="#107e3e"/>
        <KpiCard icon="performance" label="Open RFQs" value={open.length} sub="collecting & evaluating quotes" color="#0070f2"/>
        <KpiCard icon="discussion" label="Active Discussions" value={rfqs.filter(r=>(r.discussions||[]).length>0).length} sub="RFQs with discussion threads" color="#e76500"/>
      </div>

      {/* Status breakdown */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px",marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12}}>RFQ Status Overview</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap" as const,marginBottom:12}}>
          {statuses.map(s=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:s.bg,borderRadius:20,border:`1px solid ${s.color}22`}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0,display:"inline-block"}}/>
              <span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.count}</span>
              <span style={{fontSize:12,color:C.t2}}>{s.label}</span>
            </div>
          ))}
        </div>
        {/* Budget bar */}
        <div style={{fontSize:11,color:C.t2,marginBottom:6}}>Budget Pipeline by Status</div>
        <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:1}}>
          {statuses.filter(s=>s.count>0).map(s=>{
            const val = rfqs.filter(r=>r.status===s.label).reduce((a,r)=>a+(r.estVal||0),0);
            const pct = totalBudget>0?val/totalBudget*100:0;
            return pct>0?<div key={s.label} style={{width:`${pct}%`,background:s.color,transition:"width .3s"}} title={`${s.label}: IDR ${(val/1e9).toFixed(1)}B`}/>:null;
          })}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Pending Approvals urgency */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:C.t1}}>Pending Approval RFQs</div>
            <button onClick={()=>setSection("dir-rfq")} style={{fontSize:11,color:C.primary,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>View All →</button>
          </div>
          {pending.length===0&&<div style={{fontSize:12,color:C.t2,fontStyle:"italic"}}>No RFQs pending approval.</div>}
          {pending.slice(0,5).map(r=>{
            const isScored=r.status==="Scored"||!!r.scoredAt;
            const daysLeft=r.closingDate?Math.ceil((new Date(r.closingDate).getTime()-Date.now())/(1000*60*60*24)):null;
            return(
              <div key={r.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:isScored?"#107e3e":"#6f2da8",flexShrink:0,marginTop:5}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</div>
                  <div style={{fontSize:11,color:C.t2}}>{r.id} · {idr(r.estVal)} · {r.companyCode}</div>
                  <div style={{fontSize:11,marginTop:2,display:"flex",gap:8,alignItems:"center"}}>
                    {isScored
                      ?<span style={{color:"#107e3e",fontWeight:700}}>✓ Scored by {r.closedBy||"PIC"}</span>
                      :<span style={{color:"#6f2da8"}}>Awaiting score from PIC</span>}
                    {daysLeft!==null&&<span style={{color:daysLeft<0?"#bb0000":daysLeft<7?"#e76500":C.t2}}>Closed {Math.abs(daysLeft)}d {daysLeft<0?"ago":"left"}</span>}
                  </div>
                </div>
                <div style={{fontSize:11,fontWeight:700,color:isScored?"#107e3e":"#6f2da8",flexShrink:0}}>{isScored?"Scored":"Pending"}</div>
              </div>
            );
          })}
        </div>

        {/* Discussion activity */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12}}>Active Discussion Threads</div>
          {recentDiscussions.length===0&&<div style={{fontSize:12,color:C.t2,fontStyle:"italic"}}>No discussions yet.</div>}
          {recentDiscussions.map(r=>{
            const last=(r.discussions||[]).slice(-1)[0];
            return(
              <div key={r.id} style={{padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"}}>{r.title}</span>
                  <span style={{fontSize:10,background:C.infoBg,color:C.info,padding:"1px 6px",borderRadius:8,fontWeight:700,flexShrink:0}}>{(r.discussions||[]).length} msgs</span>
                </div>
                <div style={{fontSize:11,color:C.t2}}>{r.id}</div>
                {last&&<div style={{fontSize:11,color:C.t2,marginTop:3,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Last: <strong>{last.userName}</strong> — "{last.message.slice(0,60)}…"</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring progress */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px",marginTop:16}}>
        <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12}}>Evaluation Scoring Progress</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <div style={{flex:1,height:10,borderRadius:5,background:C.subtle,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:5,background:"#107e3e",width:pending.length>0?`${(scoredPending.length/pending.length*100).toFixed(0)}%`:"0%",transition:"width .4s"}}/>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:C.t1,minWidth:60}}>{scoredPending.length}/{pending.length} scored</span>
        </div>
        <div style={{fontSize:11,color:C.t2}}>{pending.length-scoredPending.length} RFQ{pending.length-scoredPending.length!==1?"s":""} still awaiting evaluation score from Finance Approver.</div>
      </div>
    </div>
  );
};

// ── Director RFQ Management ────────────────────────────────────
export const DirectorRfq = ({rfqs, quotations, user, setRfqs}) => {
  const [flt,setFlt]=useState("Award Proposed");
  const [expanded,setExpanded]=useState({});
  const [allExpanded,setAllExpanded]=useState(false);
  const [adaptOpen2,setAdaptOpen2]=useState(false);
  const [visibleFields2,setVisibleFields2]=useState<Set<string>>(new Set(ALL_RFQ_FILTER_FIELDS.filter(f=>f.defaultOn).map(f=>f.id)));
  const EMPTY_FLT2={rfqNo:"",rfqTitle:"",companyCodes:[],statuses:[],postedBy:"",category:"",openFrom:"",openTo:"",closingFrom:"",closingTo:"",purchOrg:"",plant:"",estValMin:"",estValMax:""};
  const [draft2,setDraft2]=useState(EMPTY_FLT2);
  const [applied,setApplied]=useState(EMPTY_FLT2);
  const sd2=(k,v)=>setDraft2(p=>({...p,[k]:v}));
  const applyFilters=()=>setApplied({...draft2});
  const resetFilters=()=>{setDraft2(EMPTY_FLT2);setApplied(EMPTY_FLT2);};
  const [vhOpen2,setVhOpen2]=useState<string|null>(null);
  const clrA2=(k)=>{setDraft2(p=>({...p,[k]:Array.isArray(EMPTY_FLT2[k])?[]:EMPTY_FLT2[k]}));setApplied(p=>({...p,[k]:Array.isArray(EMPTY_FLT2[k])?[]:EMPTY_FLT2[k]}));};
  const ALL_RFQ_STATUSES=["Award Proposed","Award Approved","Closed"];
  const ALL_CATEGORIES=[...new Set(rfqs.map(r=>r.cat).filter(Boolean))].sort();

  const [selIds,setSelIds]=useState(new Set<string>());
  const [compareData,setCompareData]=useState<any>(null);
  const [dirRfqTabs,setDirRfqTabs]=useState<{[id:string]:string}>({});
  const dirTab=(rfqId)=>dirRfqTabs[rfqId]||"overview";
  const setDirTab=(rfqId,tab)=>setDirRfqTabs(p=>({...p,[rfqId]:tab}));
  const postDiscussion = (rfqId, entry) => setRfqs(p=>p.map(r=>r.id===rfqId?{...r,discussions:[...(r.discussions||[]),entry]}:r));
  const [detailDirRfq,setDetailDirRfq]=useState<any>(null);
  const [dirDetailTab,setDirDetailTab]=useState("general");

  const [dirActionModal,setDirActionModal]=useState<{rfq:any,action:"approve"|"reject"}|null>(null);
  const [dirReviewModal,setDirReviewModal]=useState<{rfq:any,qts:any[]}|null>(null);
  const [dirNotes,setDirNotes]=useState("");

  const getQts=(rfqId)=>quotations.filter(q=>q.rfqId===rfqId);
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));

  const activeTokens=[
    applied.companyCodes.length>0&&{label:"Company Code",val:applied.companyCodes.length===1?`${applied.companyCodes[0]} – ${ccName(applied.companyCodes[0])}`:`${applied.companyCodes.length} selected`,onClear:()=>clrA2("companyCodes")},
    applied.statuses.length>0&&{label:"Status",val:applied.statuses.length===1?applied.statuses[0]:`${applied.statuses.length} selected`,onClear:()=>clrA2("statuses")},
    applied.rfqNo&&{label:"RFQ No",val:applied.rfqNo,onClear:()=>clrA2("rfqNo")},
    applied.rfqTitle&&{label:"RFQ Title",val:applied.rfqTitle,onClear:()=>clrA2("rfqTitle")},
    applied.postedBy&&{label:"Tender Admin",val:applied.postedBy,onClear:()=>clrA2("postedBy")},
    applied.category&&{label:"Category",val:applied.category,onClear:()=>clrA2("category")},
    (applied.openFrom||applied.openTo)&&{label:"Open Date",val:[applied.openFrom&&fmtDate(applied.openFrom),applied.openTo&&fmtDate(applied.openTo)].filter(Boolean).join(" – "),onClear:()=>{clrA2("openFrom");clrA2("openTo");}},
    (applied.closingFrom||applied.closingTo)&&{label:"Closing Date",val:[applied.closingFrom&&fmtDate(applied.closingFrom),applied.closingTo&&fmtDate(applied.closingTo)].filter(Boolean).join(" – "),onClear:()=>{clrA2("closingFrom");clrA2("closingTo");}},
    applied.estValMin&&{label:"Est. Value ≥",val:`IDR ${Number(applied.estValMin).toLocaleString()}`,onClear:()=>clrA2("estValMin")},
    applied.estValMax&&{label:"Est. Value ≤",val:`IDR ${Number(applied.estValMax).toLocaleString()}`,onClear:()=>clrA2("estValMax")},
  ].filter(Boolean);

  const list=rfqs
    .filter(r=>{
      if(flt==="All") return (r.status==="Award Proposed"&&r.awardProposal?.l1Approved===true)||r.status==="Award Approved"||r.status==="Closed";
      if(flt==="Award Proposed") return r.status==="Award Proposed"&&r.awardProposal?.l1Approved===true;
      return r.status===flt;
    })
    .filter(r=>applied.companyCodes.length===0||applied.companyCodes.includes(r.companyCode))
    .filter(r=>applied.statuses.length===0||applied.statuses.includes(r.status))
    .filter(r=>!applied.rfqNo    ||r.id?.toLowerCase().includes(applied.rfqNo.toLowerCase()))
    .filter(r=>!applied.rfqTitle ||r.title?.toLowerCase().includes(applied.rfqTitle.toLowerCase()))
    .filter(r=>!applied.postedBy ||r.postedBy?.toLowerCase().includes(applied.postedBy.toLowerCase()))
    .filter(r=>!applied.category ||r.cat===applied.category)
    .filter(r=>!applied.openFrom   ||(r.postedDate&&r.postedDate>=applied.openFrom))
    .filter(r=>!applied.openTo     ||(r.postedDate&&r.postedDate<=applied.openTo))
    .filter(r=>!applied.closingFrom||(r.closingDate&&r.closingDate>=applied.closingFrom))
    .filter(r=>!applied.closingTo  ||(r.closingDate&&r.closingDate<=applied.closingTo))
    .filter(r=>!applied.estValMin  ||r.estVal>=Number(applied.estValMin))
    .filter(r=>!applied.estValMax  ||r.estVal<=Number(applied.estValMax));

  const HDR_COLS=["","","Status","SAP RFQ No","RFQ Number","Description","Created Date","Closing Date","Tender Admin","Budget","Co. Code","Quotations"];
  const [colW,setColW]=useState([32,32,90,130,115,200,85,90,120,120,60,75]);
  const _rfqTot=colW.reduce((a,b)=>a+b,0);
  const rfqMinW=_rfqTot;
  const gridCols=colW.map(w=>`${(w/_rfqTot*100).toFixed(3)}%`).join(" ");

  const approveL2=(rfqId)=>{
    const today=new Date().toISOString().split("T")[0];
    setRfqs(p=>p.map(r=>r.id===rfqId?{...r,status:"Award Approved",awardProposal:{...r.awardProposal,l2Approved:true,l2ApprovedBy:user?.username,l2ApprovedAt:today}}:r));
  };

  const submitDirReject=()=>{
    if(!dirActionModal)return;
    if(!dirNotes.trim()){alert("Please provide rejection notes.");return;}
    const today=new Date().toISOString().split("T")[0];
    setRfqs(p=>p.map(r=>r.id===dirActionModal.rfq.id?{...r,status:"Scored",directorRejNotes:dirNotes,directorRejAt:today,awardProposal:{...r.awardProposal,l1Approved:false}}:r));
    setDirActionModal(null);setDirNotes("");
  };

  return (
    <div style={{padding:pg()}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>RFQ Approval (L2)</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>Director review · Final award decision after Finance Approver endorsement</div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f3eeff",border:`1px solid #6f2da840`,borderRadius:6,marginBottom:16,fontSize:13,color:"#6f2da8"}}>
        <SapIcon name="approvals" size={16} color="#6f2da8"/>
        <span>Showing RFQs pending your Level 2 approval. L1 (Finance Approver) has already endorsed these.</span>
      </div>

      {/* Action Modal (Reject only) */}
      {dirActionModal&&(
        <Modal title="Reject Award – Return to Buyer" onClose={()=>{setDirActionModal(null);setDirNotes("");}}>
          <div style={{padding:20,minWidth:420,maxWidth:560}}>
            <div style={{marginBottom:14,padding:"10px 14px",background:C.subtle,borderRadius:6,fontSize:13}}>
              <span style={{fontWeight:700,color:C.t1}}>{dirActionModal.rfq.id}</span>
              <span style={{color:C.t2,marginLeft:8}}>{dirActionModal.rfq.title}</span>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.t1,marginBottom:6}}>Rejection Reason <span style={{color:C.err}}>*</span></label>
              <TA value={dirNotes} onChange={setDirNotes} rows={3} placeholder="Provide reason for rejection…"/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn v="ghost" onClick={()=>{setDirActionModal(null);setDirNotes("");}}>Cancel</Btn>
              <Btn v="danger" onClick={submitDirReject}>Reject – Return to Buyer</Btn>
            </div>
          </div>
        </Modal>
      )}

      <FioriBar activeTokens={activeTokens} onGo={applyFilters} onReset={resetFilters} onAdaptFilters={()=>setAdaptOpen2(true)} adaptFiltersCount={visibleFields2.size}>
        {visibleFields2.has("companyCodes")&&<FField label="Company Code"><ValueHelpInp selected={draft2.companyCodes} getLabel={k=>`${k} – ${ccName(k)}`} onOpen={()=>setVhOpen2("companyCode")} placeholder="All Company Codes"/></FField>}
        {visibleFields2.has("statuses")&&<FField label="Status"><ValueHelpInp selected={draft2.statuses} getLabel={k=>k} onOpen={()=>setVhOpen2("status")} placeholder="All Statuses"/></FField>}
        {visibleFields2.has("rfqNo")&&<FField label="RFQ Number"><Inp value={draft2.rfqNo} onChange={v=>sd2("rfqNo",v)} placeholder="e.g. RFQ-2025-0001"/></FField>}
        {visibleFields2.has("rfqTitle")&&<FField label="RFQ Title"><Inp value={draft2.rfqTitle} onChange={v=>sd2("rfqTitle",v)} placeholder="e.g. Laptops"/></FField>}
        {visibleFields2.has("postedBy")&&<FField label="Tender Administrator"><Inp value={draft2.postedBy} onChange={v=>sd2("postedBy",v)} placeholder="e.g. Ahmad Rizki"/></FField>}
        {visibleFields2.has("category")&&<FField label="Category"><ValueHelpInp selected={draft2.category?[draft2.category]:[]} getLabel={k=>k} onOpen={()=>setVhOpen2("category")} placeholder="All Categories"/></FField>}
        {visibleFields2.has("openDate")&&<FField label="Open Date Range"><DateRangePicker from={draft2.openFrom} to={draft2.openTo} onChange={(f,t)=>{sd2("openFrom",f);sd2("openTo",t);}}/></FField>}
        {visibleFields2.has("closingDate")&&<FField label="Closing Date Range"><DateRangePicker from={draft2.closingFrom} to={draft2.closingTo} onChange={(f,t)=>{sd2("closingFrom",f);sd2("closingTo",t);}}/></FField>}
        {visibleFields2.has("estValMin")&&<FField label="Est. Value (From)"><Inp type="number" value={draft2.estValMin} onChange={v=>sd2("estValMin",v)} placeholder="Min (IDR)"/></FField>}
        {visibleFields2.has("estValMax")&&<FField label="Est. Value (To)"><Inp type="number" value={draft2.estValMax} onChange={v=>sd2("estValMax",v)} placeholder="Max (IDR)"/></FField>}
      </FioriBar>

      <AdaptFiltersDialog open={adaptOpen2} onClose={()=>setAdaptOpen2(false)} visibleFields={visibleFields2}
        onSave={s=>setVisibleFields2(s)} draft={draft2} allFields={ALL_RFQ_FILTER_FIELDS}
        hasValue={id=>{
          if(id==="companyCodes")return draft2.companyCodes.length>0;
          if(id==="statuses")return draft2.statuses.length>0;
          if(id==="openDate")return !!(draft2.openFrom||draft2.openTo);
          if(id==="closingDate")return !!(draft2.closingFrom||draft2.closingTo);
          return !!(draft2 as any)[id];
        }}/>

      {vhOpen2==="companyCode"&&(
        <ValueHelpDialog title="Company Code" cols={[{key:"v",label:"Code",width:80},{key:"l",label:"Company Name",width:220}]}
          rows={COMPANY_CODES} keyField="v" labelField="l"
          selected={draft2.companyCodes} onConfirm={s=>{sd2("companyCodes",s);setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}
      {vhOpen2==="status"&&(
        <ValueHelpDialog title="Status" cols={[{key:"v",label:"Status",width:180}]}
          rows={ALL_RFQ_STATUSES.map(s=>({v:s,l:s}))} keyField="v" labelField="l"
          selected={draft2.statuses} onConfirm={s=>{sd2("statuses",s);setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}
      {vhOpen2==="category"&&(
        <ValueHelpDialog title="Category" cols={[{key:"v",label:"Category",width:200}]}
          rows={ALL_CATEGORIES.map(c=>({v:c,l:c}))} keyField="v" labelField="l"
          selected={draft2.category?[draft2.category]:[]} multiSelect={false}
          onConfirm={s=>{sd2("category",s[0]||"");setVhOpen2(null);}} onClose={()=>setVhOpen2(null)}/>
      )}

      <FilterBar opts={["All","Award Proposed","Award Approved","Closed"]} val={flt} onChange={setFlt}/>

      {/* Toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 12px",height:44,background:C.card,border:`1px solid ${C.border}`,borderBottom:"none",borderRadius:"8px 8px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14,fontWeight:700,color:C.t1,marginRight:6}}>RFQs</span>
          <span style={{fontSize:12,color:C.t2}}>({list.length})</span>
          {(()=>{
            const selList=[...selIds].map(id=>rfqs.find(r=>r.id===id)).filter(Boolean);
            const selRfq=selList.length===1?selList[0]:null;
            const canReviewAward=!!selRfq&&selRfq.status==="Award Proposed"&&selRfq.awardProposal?.l1Approved===true;
            const reviewTitle=selIds.size===0?"Check an Award Proposed RFQ first":selList.length>1?"Select only 1 RFQ":!selRfq||selRfq.status!=="Award Proposed"?"RFQ must be in Award Proposed status (L1 approved)":"";
            return(
              <button onClick={()=>{if(!canReviewAward||!selRfq)return;const qts=quotations.filter(q=>q.rfqId===selRfq.id);setDirReviewModal({rfq:selRfq,qts});}} disabled={!canReviewAward}
                style={{background:canReviewAward?"#6f2da8":C.subtle,border:`1px solid ${canReviewAward?"transparent":C.border}`,color:canReviewAward?"#fff":C.t2,borderRadius:4,padding:"0 0.9rem",fontSize:12,fontFamily:"inherit",cursor:canReviewAward?"pointer":"not-allowed",height:28,display:"flex",alignItems:"center",gap:5,fontWeight:600,opacity:canReviewAward?1:0.6,transition:"all .15s"}}
                title={reviewTitle}>
                <SapIcon name="process" size={13} color={canReviewAward?"#fff":C.t2}/> Review Award (L2)
              </button>
            );
          })()}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>{if(allExpanded){setExpanded({});setAllExpanded(false);}else{const m={};list.forEach(r=>{m[r.id]=true;});setExpanded(m);setAllExpanded(true);}}}
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.75rem",fontSize:12,fontFamily:"inherit",cursor:"pointer",height:28,display:"flex",alignItems:"center",gap:4}}>
            <SapIcon name={allExpanded?"collapse-all":"expand-all"} size={13} color={C.t1}/>{allExpanded?"Collapse All":"Expand All"}
          </button>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"flex-start",gap:0,position:"relative"}}>
        <div style={{flex:detailDirRfq?"0 0 52%":"1 1 100%",overflowX:"auto",borderRadius:"0 0 8px 8px",border:`1px solid ${C.border}`,transition:"flex .2s"}}>
        <div style={{minWidth:rfqMinW,background:C.card}}>
        <div style={{display:"grid",gridTemplateColumns:gridCols,background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
          <div style={{padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <input type="checkbox" checked={list.length>0&&list.every(r=>selIds.has(r.id))}
              onChange={e=>{const s=new Set(selIds);if(e.target.checked)list.forEach(r=>s.add(r.id));else list.forEach(r=>s.delete(r.id));setSelIds(s);}}
              style={{accentColor:C.primary,cursor:"pointer"}}/>
          </div>
          {HDR_COLS.slice(1).map((h,i)=>(
            <div key={i} style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2,whiteSpace:"nowrap",overflow:"hidden",userSelect:"none",display:"flex",alignItems:"center"}}>{h}</div>
          ))}
        </div>

        {list.length===0&&<div style={{padding:"28px 16px",textAlign:"center",color:C.t2,fontSize:13}}>No RFQs found.</div>}

        {list.map(rfq=>{
          const open=!!expanded[rfq.id];
          const qts=getQts(rfq.id);
          const sel=selIds.has(rfq.id);
          const rowBg=sel?C.selection:C.card;
          const cell=(extra?:any)=>({padding:"8px 10px",display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap" as const,...extra});
          const sapNo=rfq.sapRfqNo||(`70${rfq.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);
          return (
            <div key={rfq.id} style={{borderBottom:`1px solid ${C.border}`}}>
              <div onClick={()=>toggle(rfq.id)} style={{display:"grid",gridTemplateColumns:gridCols,background:rowBg,cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>e.currentTarget.style.background=sel?C.selection:C.infoBg}
                onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
                <div onClick={e=>{e.stopPropagation();const s=new Set(selIds);sel?s.delete(rfq.id):s.add(rfq.id);setSelIds(s);}} style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"10px 6px",flexShrink:0}}>
                  <input type="checkbox" checked={sel} onChange={()=>{}} style={{accentColor:C.primary,cursor:"pointer"}}/>
                </div>
                <div onClick={e=>{e.stopPropagation();toggle(rfq.id);}} style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"10px 6px",flexShrink:0}}>
                  <span style={{fontSize:10,color:C.primary,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                </div>
                <div style={cell({justifyContent:"flex-start"})}><Badge s={rfq.status}/></div>
                <div style={cell({overflow:"hidden"})}>
                  {sapNo==="—"?<span style={{fontSize:13,color:C.t2}}>—</span>:<span style={{fontSize:13,fontWeight:600,color:C.primary,overflow:"hidden",textOverflow:"ellipsis"}}>{sapNo}</span>}
                </div>
                <div style={cell({fontSize:13,fontWeight:700,color:C.primary})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.id}</span></div>
                <div style={cell({fontSize:13,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.title}</span></div>
                <div style={cell({fontSize:13,color:C.t2})}>{fmtDate(rfq.postedDate)}</div>
                <div style={cell({fontSize:13,fontWeight:600,color:C.t1})}>{fmtDate(rfq.closingDate)}</div>
                <div style={cell({fontSize:13,color:C.t2})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.postedBy}</span></div>
                <div style={cell({fontSize:13,fontWeight:700,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{idr(rfq.estVal)}</span></div>
                <div style={cell({fontSize:13,color:C.t2})}>{rfq.companyCode||"—"}</div>
                <div onClick={e=>{e.stopPropagation();setDetailDirRfq(rfq);setDirDetailTab("general");}} style={{...cell({cursor:"pointer",justifyContent:"space-between"})}}>
                  <span>
                    {qts.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontWeight:700}}>{qts.length}</span>}
                    {qts.length===0&&<span style={{color:C.t2}}>0</span>}
                  </span>
                  <span style={{fontSize:16,color:detailDirRfq?.id===rfq.id?C.primary:"#32363a",fontWeight:detailDirRfq?.id===rfq.id?700:300}}>›</span>
                </div>
              </div>

              {open&&(
                <div style={{background:C.infoBg,borderTop:`1px solid ${C.border}`}}>
                  {/* Tab bar */}
                  <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card,overflowX:"auto"}}>
                    {[{k:"overview",label:"Overview"},{k:"notes",label:"Notes"},{k:"discussion",label:`Discussion (${(rfq.discussions||[]).length})`}].map(t=>(
                      <button key={t.k} onClick={()=>setDirTab(rfq.id,t.k)} style={{background:"none",border:"none",borderBottom:dirTab(rfq.id)===t.k?`2px solid ${C.primary}`:"2px solid transparent",color:dirTab(rfq.id)===t.k?C.primary:C.t2,fontFamily:"inherit",fontSize:12,fontWeight:dirTab(rfq.id)===t.k?700:400,cursor:"pointer",padding:"9px 14px",whiteSpace:"nowrap",transition:"color .15s",marginBottom:-1}}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Overview tab */}
                  {dirTab(rfq.id)==="overview"&&(<>
                    <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Scope: </span>
                      <span style={{fontSize:12,color:C.t2}}>{rfq.desc}</span>
                    </div>

                    {qts.length>0&&(
                      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Quotation Comparison</div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{borderCollapse:"collapse",minWidth:500,width:"100%",fontSize:12}}>
                            <thead>
                              <tr style={{background:"rgba(0,112,242,0.07)"}}>
                                <th style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:C.t2,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>Criteria</th>
                                {qts.map(qt=>(
                                  <th key={qt.id} style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:C.primary,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap",borderLeft:`1px solid ${C.border}`}}>
                                    <div>{qt.vendorName}</div>
                                    <div style={{fontWeight:400,fontSize:11,color:C.t2}}>{qt.id}</div>
                                    <Badge s={qt.status}/>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                {label:"Total Amount",render:(qt)=><strong style={{color:C.t1}}>{idr(qt.totalAmt)}</strong>},
                                {label:"Validity Date",render:(qt)=><span style={{color:C.t2}}>{fmtDate(qt.validUntil)||"—"}</span>},
                                {label:"Delivery Terms",render:(qt)=><span style={{color:C.t2}}>{qt.deliveryTerms||"—"}</span>},
                                {label:"Payment Terms",render:(qt)=><span style={{color:C.t2}}>{qt.paymentTerms||"—"}</span>},
                                {label:"Notes",render:(qt)=><span style={{color:C.t2}}>{qt.notes||"—"}</span>},
                              ].map((row,ri)=>(
                                <tr key={ri} style={{background:ri%2===0?"transparent":"rgba(0,0,0,0.02)"}}>
                                  <td style={{padding:"7px 10px",fontWeight:600,color:C.t1,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{row.label}</td>
                                  {qts.map(qt=>(
                                    <td key={qt.id} style={{padding:"7px 10px",textAlign:"center",borderBottom:`1px solid ${C.border}`,borderLeft:`1px solid ${C.border}`}}>{row.render(qt)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {qts.length===0&&(
                      <div style={{padding:"12px 16px",color:C.t2,fontSize:13,fontStyle:"italic",borderBottom:`1px solid ${C.border}`}}>No quotations received for this RFQ.</div>
                    )}

                    {/* Inline action for L2 decision */}
                    {rfq.status==="Award Proposed"&&rfq.awardProposal?.l1Approved===true&&(
                      <div style={{padding:"12px 16px",display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:12,color:C.t2,marginRight:4}}>L1 approved by <strong style={{color:C.t1}}>{rfq.awardProposal?.l1ApprovedBy||"Finance Approver"}</strong>. Your L2 decision:</span>
                        <div style={{flex:1}}/>
                        <Btn v="danger" sm onClick={()=>{setDirActionModal({rfq,action:"reject"});setDirNotes("");}}>
                          <SapIcon name="cancel" size={13} color="#fff"/> Reject – Return to Buyer
                        </Btn>
                        <Btn v="success" sm onClick={()=>approveL2(rfq.id)}>
                          <SapIcon name="accept" size={13} color="#fff"/> Approve Award (L2)
                        </Btn>
                      </div>
                    )}
                    {!(rfq.status==="Award Proposed"&&rfq.awardProposal?.l1Approved===true)&&(
                      <div style={{padding:"8px 16px 10px"}}>
                        <span style={{fontSize:11,color:C.t2,fontStyle:"italic"}}>This RFQ is {rfq.status.toLowerCase()} — no action required.</span>
                      </div>
                    )}
                  </>)}

                  {/* Notes tab */}
                  {dirTab(rfq.id)==="notes"&&(
                    <div style={{padding:"16px"}}>
                      <div style={{fontSize:13,color:C.t1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{rfq.desc||"No notes."}</div>
                    </div>
                  )}

                  {/* Discussion tab */}
                  {dirTab(rfq.id)==="discussion"&&(
                    <DiscussionBox rfqId={rfq.id} discussions={rfq.discussions||[]} onPost={postDiscussion} user={user}/>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
        </div>

        {/* Detail panel */}
        {detailDirRfq&&(()=>{
          const r=detailDirRfq;
          const qts=getQts(r.id);
          const sapNo=r.sapRfqNo||(`70${r.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`);
          const TABS=["general","items","quotations","notes","discussion","docflow"];
          const TAB_LABELS={"general":"General Information","items":`Items (${r.items?.length||0})`,"quotations":`Quotations (${qts.length})`,"notes":"Notes","discussion":`Discussion (${(r.discussions||[]).length})`,"docflow":"Document Flow"};
          const field=(label,val)=>(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:C.t2,marginBottom:2}}>{label}:</div>
              <div style={{fontSize:13,color:C.t1,fontWeight:500}}>{val||"—"}</div>
            </div>
          );
          const sectionHdr=(title)=><div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{title}</div>;
          return(
          <div style={{flex:"0 0 48%",position:"sticky",top:0,maxHeight:"100vh",display:"flex",flexDirection:"column",background:C.card,overflow:"hidden",boxShadow:"-2px 0 10px rgba(0,0,0,0.08)"}}>
            <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${C.border}`,background:C.subtle,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:C.t1,lineHeight:1.3}}>{r.title}</div>
                  <div style={{fontSize:11,color:C.t2,marginTop:3,fontFamily:"monospace"}}>{sapNo}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <Badge s={r.status}/>
                  <button onClick={()=>setDetailDirRfq(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,padding:"0 2px",marginLeft:4}}>×</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:11}}>
                <div><span style={{color:C.t2}}>Created By: </span><span style={{color:C.t1,fontWeight:600}}>{r.postedBy}</span></div>
                <div><span style={{color:C.t2}}>Status: </span><span style={{color:C.t1,fontWeight:600}}>{r.status}</span></div>
                <div><span style={{color:C.t2}}>Created On: </span><span style={{color:C.t1}}>{fmtDate(r.postedDate)}</span></div>
                <div><span style={{color:C.t2}}>Target Value: </span><span style={{color:C.t1,fontWeight:600}}>{idr(r.estVal)}</span></div>
                <div><span style={{color:C.t2}}>Publishing Date: </span><span style={{color:C.t1}}>{fmtDate(r.postedDate)}</span></div>
                <div><span style={{color:C.t2}}>Quotation Deadline: </span><span style={{color:C.t1,fontWeight:600}}>{fmtDate(r.closingDate)}</span></div>
              </div>
            </div>

            <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card,flexShrink:0,overflowX:"auto"}}>
              {TABS.map(t=>(
                <button key={t} onClick={()=>setDirDetailTab(t)} style={{background:"none",border:"none",borderBottom:dirDetailTab===t?`2px solid ${C.primary}`:"2px solid transparent",color:dirDetailTab===t?C.primary:C.t2,fontFamily:"inherit",fontSize:12,fontWeight:dirDetailTab===t?700:400,cursor:"pointer",padding:"10px 14px",whiteSpace:"nowrap",transition:"color .15s",marginBottom:-1}}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>

              {dirDetailTab==="general"&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:16}}>
                    <div>
                      {sectionHdr("Basic Data")}
                      {field("RFQ Number",r.id)}
                      {field("RFQ Type","Int. Sourcing Req. (RQ)")}
                      {field("RFQ Description",r.title)}
                      {field("Category",r.cat)}
                      {field("Language Key","English (EN)")}
                    </div>
                    <div>
                      {sectionHdr("Organization")}
                      {field("Purchasing Organization",r.purchOrg)}
                      {field("Company Code",r.companyCode)}
                      {field("Plant",r.plant)}
                      {field("Tender Admin",r.postedBy)}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:16}}>
                    <div>
                      {sectionHdr("Important Dates")}
                      {field("Apply By",fmtDate(r.closingDate))}
                      {field("Quotation Deadline",fmtDate(r.closingDate))}
                      {field("Binding Period",fmtDate(r.closingDate))}
                      {field("Publishing Date",fmtDate(r.postedDate))}
                    </div>
                    <div>
                      {sectionHdr("Delivery & Payment")}
                      {field("Payment Terms","Due within 14 Days (Z014)")}
                      {field("Currency","Indonesian Rupiah (IDR)")}
                      {field("Incoterms","Ex Works (EXW)")}
                      {field("Target Value",idr(r.estVal))}
                    </div>
                  </div>
                  <div>
                    {sectionHdr("Scope")}
                    <div style={{fontSize:13,color:C.t2,lineHeight:1.6}}>{r.desc||"—"}</div>
                  </div>
                </div>
              )}

              {dirDetailTab==="items"&&(
                <div>
                  {(r.items||[]).length===0&&<div style={{color:C.t2,fontSize:13}}>No items.</div>}
                  {(r.items||[]).map((it,i)=>(
                    <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:10,background:C.subtle}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:C.t2,minWidth:28}}>#{String(it.no).padStart(3,"0")}</span>
                        <span style={{fontSize:13,fontWeight:700,color:C.t1}}>{it.desc}</span>
                        <span style={{marginLeft:"auto",background:it.type==="Service"?C.warnBg:C.okBg,color:it.type==="Service"?C.warn:C.ok,borderRadius:3,padding:"1px 7px",fontSize:11,fontWeight:700}}>{it.type}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px 16px",fontSize:12}}>
                        {it.materialNo&&<div><span style={{color:C.t2}}>Mat. No: </span><span style={{fontFamily:"monospace",color:C.t1}}>{it.materialNo}</span></div>}
                        {it.materialGroup&&<div><span style={{color:C.t2}}>Mat. Group: </span><span style={{color:C.t1}}>{it.materialGroup}</span></div>}
                        <div><span style={{color:C.t2}}>Plant: </span><span style={{color:C.t1}}>{it.plant||r.plant||"—"}</span></div>
                        <div><span style={{color:C.t2}}>Qty: </span><span style={{fontWeight:600,color:C.t1}}>{it.qty} {it.uom}</span></div>
                        {it.acctAssign&&<div><span style={{color:C.t2}}>Acct: </span><span style={{color:C.t1}}>{it.acctAssign}</span></div>}
                        {it.type==="Material"
                          ?<div><span style={{color:C.t2}}>Req. Date: </span><span style={{color:C.t1}}>{fmtDate(it.requirementDate)||"—"}</span></div>
                          :<div><span style={{color:C.t2}}>Period: </span><span style={{color:C.t1}}>{fmtDate(it.startDate)||"—"} – {fmtDate(it.endDate)||"—"}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dirDetailTab==="quotations"&&(
                <div>
                  {qts.length===0&&<div style={{color:C.t2,fontSize:13}}>No quotations received yet.</div>}
                  {qts.map(qt=>{
                    const sapQtNo=qt.sapQtNo||(["Accepted","Win","PO Ready"].includes(qt.status)?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");
                    return(
                    <div key={qt.id} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:8,background:C.card}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:C.t1}}>{qt.vendorName}</div>
                          <div style={{fontSize:11,color:C.t2,fontFamily:"monospace",marginTop:1}}>{qt.id} · SAP {sapQtNo}</div>
                        </div>
                        <Badge s={qt.status}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px 12px",fontSize:12}}>
                        <div><span style={{color:C.t2}}>Total: </span><span style={{fontWeight:700,color:C.t1}}>{idr(qt.totalAmt)}</span></div>
                        <div><span style={{color:C.t2}}>Submitted: </span><span style={{color:C.t1}}>{fmtDate(qt.submittedDate)||"—"}</span></div>
                        <div><span style={{color:C.t2}}>Valid Until: </span><span style={{color:C.t1}}>{fmtDate(qt.validUntil)||"—"}</span></div>
                        {qt.deliveryTerms&&<div style={{gridColumn:"1/-1"}}><span style={{color:C.t2}}>Delivery: </span><span style={{color:C.t1}}>{qt.deliveryTerms}</span></div>}
                        {qt.paymentTerms&&<div style={{gridColumn:"1/-1"}}><span style={{color:C.t2}}>Payment: </span><span style={{color:C.t1}}>{qt.paymentTerms}</span></div>}
                        {qt.scores&&<div style={{gridColumn:"1/-1",marginTop:4,padding:"6px 10px",background:C.infoBg,borderRadius:4,fontSize:11}}>
                          <span style={{fontWeight:700,color:C.t1}}>Score: </span>
                          <span style={{color:C.t2}}>Tech {qt.scores.technical} · Com {qt.scores.commercial} · HSE {qt.scores.hse} · </span>
                          <span style={{fontWeight:700,color:C.primary}}>Weighted {qt.scores.weighted}</span>
                        </div>}
                      </div>
                      {qt.notes&&<div style={{marginTop:6,fontSize:11,color:C.t2,fontStyle:"italic"}}>{qt.notes}</div>}
                    </div>
                  );})}
                </div>
              )}

              {dirDetailTab==="notes"&&(
                <div>
                  <div style={{fontSize:13,color:C.t1,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.desc||"No notes."}</div>
                  {r.targets&&r.targets.length>0&&(
                    <div style={{marginTop:16}}>
                      {sectionHdr("Invited Vendors")}
                      {r.targets.map(vid=>(
                        <div key={vid} style={{fontSize:13,color:C.t1,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                          {VENDORS[vid]?.name||vid} <span style={{color:C.t2,fontSize:11}}>· {vid}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {dirDetailTab==="discussion"&&(
                <DiscussionBox rfqId={r.id} discussions={r.discussions||[]} onPost={postDiscussion} user={user}/>
              )}

              {dirDetailTab==="docflow"&&(
                <RfqDocumentFlow rfq={r} quotations={qts}/>
              )}

            </div>
          </div>
          );
        })()}
      </div>
      {compareData&&<QuotationCompareModal rfq={compareData.rfq} quotations={compareData.quotations} onClose={()=>setCompareData(null)}/>}
      {dirReviewModal&&<ReviewAwardModal rfq={dirReviewModal.rfq} quotations={dirReviewModal.qts} user={user}
        onApprove={()=>{approveL2(dirReviewModal.rfq.id);setDirReviewModal(null);}}
        onReject={()=>{
          setDirActionModal({rfq:dirReviewModal.rfq,action:"reject"});setDirNotes("");setDirReviewModal(null);
        }}
        onClose={()=>setDirReviewModal(null)}/>}
    </div>
  );
};
