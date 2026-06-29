import { useState, useRef, useEffect } from "react";
import {
  C, VENDORS, COMPANY_CODES, CURRENCIES, ccName,
  fmtDate, idr, uid, pg, mob,
  g2, g3,
  Badge, Btn, Inp, AmtInp, DateInp, Sel, TA, Lbl, Val, Sep, Modal,
  FilterBar, FioriBar, FField, SapIcon, Card, Th, Td,
  ValueHelpInp, ValueHelpDialog, DateRangePicker,
} from "./shared";

// ── Quotation Form Modal ───────────────────────────────────────
export const QtFormModal = ({rfq,qt,onSave,onClose,vendorId,vendorName}) => {
  const [f,setF]=useState(qt?{...qt}:{
    rfqId:rfq.id,rfqTitle:rfq.title,vendorId,vendorName,submittedDate:"",validUntil:"",notes:"",status:"Draft",files:[],
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
      <div style={{marginBottom:14}}><Lbl>Notes / Commercial Terms</Lbl><TA value={f.notes} onChange={v=>s("notes",v)} placeholder="Delivery terms, warranty, payment terms…"/></div>
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
  const myRfqs=rfqs.filter(r=>r.targets.includes(user.vendorId));
  const mine=quotations.filter(q=>q.vendorId===user.vendorId);
  const mineF=mine.filter(q=>flt==="All"||q.status===flt);
  const quoted=rfqId=>mine.find(q=>q.rfqId===rfqId);
  const save=qt=>{setQuotations(p=>p.find(q=>q.id===qt.id)?p.map(q=>q.id===qt.id?qt:q):[...p,qt]);setQR(null);setEQ(null);};
  const withdraw=id=>{if(window.confirm("Withdraw quotation?"))setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Withdrawn"}:q));};
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
                  {rfq.status==="Open"&&!q&&<Btn onClick={()=>setQR(rfq)}>Submit Quotation</Btn>}
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
          <FilterBar opts={["All","Draft","Submitted","Accepted","Win","Completed"]} val={flt} onChange={setFlt}/>
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
      {quotingRfq&&<QtFormModal rfq={quotingRfq} qt={editingQt} onSave={save} onClose={()=>{setQR(null);setEQ(null);}} vendorId={user.vendorId} vendorName={VENDORS[user.vendorId].name}/>}
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
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#8a8d91",fontSize:14,pointerEvents:"none"}}>🔍</span>
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
  const toggle=id=>setExpanded(p=>({[id]:!p[id]}));
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

  const ALL_QT_STATUSES=["Draft","Submitted","Accepted","Win","Completed"];
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
  const completeSel=()=>{setQuotations(p=>p.map(q=>selIds.has(q.id)&&(q.status==="Submitted"||q.status==="Accepted")?{...q,status:"Completed"}:q));setSelIds(new Set());};
  const acceptSel  =()=>{setQuotations(p=>p.map(q=>selIds.has(q.id)&&q.status==="Submitted"?{...q,status:"Accepted"}:q));setSelIds(new Set());};
  const rejectSel  =()=>{if(!window.confirm(`Reject ${selRows.filter(q=>q.status==="Submitted").length} quotation(s)?`))return;setQuotations(p=>p.map(q=>selIds.has(q.id)&&q.status==="Submitted"?{...q,status:"Win"}:q));setSelIds(new Set());};

  const HDR_COLS=["","Status","SAP Quotation No","Quotation ID","RFQ Title","Vendor","Submitted","Valid Until","Total Amount",""];
  const [colW,setColW]=useState([28,90,145,115,210,140,95,95,115,32]);
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
    <div style={{padding:pg()}}>
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

      <FilterBar opts={["All","Draft","Submitted","Accepted","Win","Completed"]} val={flt} onChange={setFlt}/>

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
              {tbBtn("✔ Complete", completeSel, canComplete, "")}
              {tbBtn("✓ Accept",   acceptSel,   canAccept,   "")}
              {tbBtn("✗ Reject",   rejectSel,   canReject,   "")}
              {sep}
              {selRows.length>0&&<span style={{fontSize:11,color:C.t2,marginLeft:4}}>{selRows.length} selected</span>}
            </>;
          })()}
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
                {/* status badge */}
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center"}}><Badge s={qt.status}/></div>
                {/* sap quotation no */}
                {(()=>{const sapNo=qt.sapQtNo||(qt.submittedDate?`80${qt.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");return(
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap"}}>
                  {sapNo==="—"?<span style={{fontSize:13,color:C.t2}}>—</span>:<a href="#" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:13,fontWeight:600,color:C.primary,textDecoration:"none",borderBottom:`1px solid ${C.primary}`,overflow:"hidden",textOverflow:"ellipsis"}}>{sapNo}</a>}
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
                {/* expand arrow */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 0"}}>
                  <span style={{fontSize:16,color:"#32363a",fontWeight:300,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>›</span>
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
      </div>
    </div>
  );
};

// ── BRM RFQ Mgmt ───────────────────────────────────────────────
// Status indicator — all 4 shapes in a row; active = filled color, inactive = grey fill + dark outline
const RfqStatusIcon = ({s}) => {
  const STEPS = [
    {key:"Open",       shape:"square",   color:"#BB0000"},
    {key:"On Process", shape:"triangle", color:"#E9730C"},
    {key:"Complete",   shape:"circle",   color:"#188918"},
    {key:"Closed",     shape:"circle2",  color:"#0070F2"},
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

export const BrmRfq = ({rfqs,setRfqs,quotations}) => {
  const [showForm,setForm]=useState(false);
  const [flt,setFlt]=useState("All");
  const [expanded,setExpanded]=useState({});
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const ALL_RFQ_STATUSES=["Open","On Process","Complete","Closed"];
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

  const [f,setF]=useState({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",companyCode:"",plant:"",purchOrg:"",
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
  const toggle=id=>setExpanded(p=>({[id]:!p[id]}));
  const addItem=()=>setF(p=>({...p,items:[...p.items,{no:p.items.length+1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]}));
  const updItem=(i,k,v)=>setF(p=>({...p,items:p.items.map((it,j)=>j===i?{...it,[k]:v}:it)}));
  const publish=()=>{
    if(!f.title||!f.closingDate||f.targets.length===0){alert("Please fill title, closing date, and select at least one vendor.");return;}
    setRfqs(p=>[...p,{...f,id:`RFQ-${uid()}`,postedDate:new Date().toISOString().split("T")[0],postedBy:"Ahmad Rizki",status:"Open",estVal:Number(f.estVal),
      items:f.items.map(it=>({...it,qty:Number(it.qty),estPrice:Number(it.estPrice)}))}]);
    setForm(false);
    setF({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",companyCode:"",plant:"",purchOrg:"",
      items:[{no:1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]});
  };

  const HDR_COLS = ["Status","SAP RFQ No","RFQ Number","Description","Created Date","Open Date","Closing Date","Tender Admin","Budget","Co. Code","Plant","Quotations"];
  const [colW, setColW] = useState([90,130,115,180,85,85,90,105,120,60,50,75]);
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
    <div style={{padding:pg()}}>
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

      <FilterBar opts={["All","Open","On Process","Complete","Closed"]} val={flt} onChange={setFlt}/>

      <div style={{overflowX:"auto",borderRadius:8,border:`1px solid ${C.border}`}}>
      <div style={{minWidth:rfqMinW,background:C.card}}>
        <div style={{display:"grid",gridTemplateColumns:gridCols,background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
          {HDR_COLS.map((h,i)=>(
            <div key={i} style={{position:"relative",padding:"8px 10px",fontSize:12,fontWeight:700,color:C.t2,whiteSpace:"nowrap",overflow:"hidden",userSelect:"none"}}>
              {h}
              {i<HDR_COLS.length-1&&(
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
                <div style={cell({justifyContent:"flex-start"})}><Badge s={rfq.status}/></div>
                {(()=>{const sapNo=rfq.sapRfqNo||(rfq.status!=="Open"?`70${rfq.id.replace(/\D/g,"").slice(-8).padStart(8,"0")}`:"—");return(
                <div style={cell({overflow:"hidden"})}>
                  {sapNo==="—"?<span style={{fontSize:12,color:C.t2}}>—</span>:<a href="#" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:12,fontWeight:600,color:C.primary,textDecoration:"none",borderBottom:`1px solid ${C.primary}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{sapNo}</a>}
                </div>);})()}
                <div style={cell({fontSize:12,fontWeight:700,color:C.primary})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.id}</span></div>
                <div style={cell({fontSize:12,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.title}</span></div>
                <div style={cell({fontSize:12,color:C.t2})}>{fmtDate(rfq.postedDate)}</div>
                <div style={cell({fontSize:12,color:C.t2})}>{fmtDate(rfq.postedDate)}</div>
                <div style={cell({fontSize:12,fontWeight:600,color:C.t1})}>{fmtDate(rfq.closingDate)}</div>
                <div style={cell({fontSize:12,color:C.t2})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{rfq.postedBy}</span></div>
                <div style={cell({fontSize:12,fontWeight:700,color:C.t1})}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{idr(rfq.estVal)}</span></div>
                <div style={cell({fontSize:12,color:C.t2})}>{rfq.companyCode||"—"}</div>
                <div style={cell({fontSize:12,color:C.t2})}>{rfq.plant||"—"}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",overflow:"hidden"}}>
                  {qts.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontWeight:700,flexShrink:0}}>{qts.length}</span>}
                  <span style={{fontSize:16,color:"#32363a",fontWeight:300,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)",marginLeft:"auto"}}>›</span>
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
                      <div style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Received Quotations</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {qts.map(qt=>(
                          <div key={qt.id} style={{padding:"5px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:4,fontSize:12,display:"flex",alignItems:"center",gap:8}}>
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
            <div style={{gridColumn:"1/-1"}}><Lbl>Estimated Budget (IDR)</Lbl><AmtInp value={f.estVal} onChange={v=>sf("estVal",v)}/></div>
          </div>
          <div style={{marginBottom:12}}><Lbl>Description / Scope</Lbl><TA value={f.desc} onChange={v=>sf("desc",v)} placeholder="Describe the requirement…"/></div>
          <div style={{marginBottom:12}}>
            <Lbl>Target Vendors *</Lbl>
            <div style={{display:"flex",gap:14,marginTop:6}}>
              {Object.keys(VENDORS).map(vid=>(
                <label key={vid} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}>
                  <input type="checkbox" checked={f.targets.includes(vid)} onChange={e=>sf("targets",e.target.checked?[...f.targets,vid]:f.targets.filter(v=>v!==vid))}/>
                  {VENDORS[vid].name}
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
            <Btn v="primary" onClick={publish}>Publish RFQ to Vendors</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};
