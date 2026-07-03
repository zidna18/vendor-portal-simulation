import { useState, useRef } from "react";
import {
  C, VENDORS, COMPANY_CODES, CURRENCIES, PURCHASING_GROUPS,
  fmtDate, idr, uid, pg, mob,
  g2, g3,
  Badge, Btn, Inp, AmtInp, DateInp, Sel, TA, Lbl, Val, Sep, Modal,
  FilterBar, FioriBar, FField, SapIcon, Card, Th, Td,
} from "./shared";

// ── Local constants ────────────────────────────────────────────
const PAYMENT_TERMS = [
  {v:"Net 14 Days",l:"Net 14 Days"}, {v:"Net 30 Days",l:"Net 30 Days"},
  {v:"Net 45 Days",l:"Net 45 Days"}, {v:"Net 60 Days",l:"Net 60 Days"},
  {v:"Net 90 Days",l:"Net 90 Days"}, {v:"30/2 Net 60",l:"30/2 Net 60 (2% Early Pay)"},
  {v:"COD",l:"Cash on Delivery"},    {v:"Advance 50%",l:"50% Advance, 50% on Delivery"},
  {v:"Advance 100%",l:"100% Advance Payment"},
];
const INCOTERMS = [
  {v:"EXW",l:"EXW – Ex Works"},          {v:"FCA",l:"FCA – Free Carrier"},
  {v:"CPT",l:"CPT – Carriage Paid To"},  {v:"CIP",l:"CIP – Carriage & Insurance Paid"},
  {v:"DAP",l:"DAP – Delivered at Place"},{v:"DPU",l:"DPU – Delivered at Place Unloaded"},
  {v:"DDP",l:"DDP – Delivered Duty Paid"},{v:"FAS",l:"FAS – Free Alongside Ship"},
  {v:"FOB",l:"FOB – Free on Board"},     {v:"CFR",l:"CFR – Cost & Freight"},
  {v:"CIF",l:"CIF – Cost, Insurance & Freight"},
  {v:"N/A – Service Contract",l:"N/A – Service Contract"},
  {v:"N/A – Rental Contract",l:"N/A – Rental Contract"},
  {v:"N/A – Professional Service",l:"N/A – Professional Service"},
];
const pgLabel = code => {
  const p = PURCHASING_GROUPS.find(x=>x.v===code);
  return p ? `${p.v} – ${p.l}` : (code||"—");
};
const VDR_COLORS = ["#0a6ed1","#107e3e","#8b5cf6","#d97706","#dc2626","#0891b2"];

// ── Quotation Form Modal ───────────────────────────────────────
export const QtFormModal = ({rfq,qt,onSave,onClose,vendorId,vendorName}) => {
  const [f,setF]=useState(qt?{...qt}:{
    rfqId:rfq.id,rfqTitle:rfq.title,vendorId,vendorName,submittedDate:"",validUntil:"",notes:"",status:"Draft",files:[],
    totalAmt:rfq.items.reduce((s,i)=>s+i.estPrice*i.qty,0),
    items:rfq.items.map(i=>({...i,unitPrice:i.estPrice,total:i.estPrice*i.qty})),
    salesPerson:"",termsOfPayment:"Net 30 Days",deliveryTerms:"DDP – Delivered Duty Paid",
    leadTime:"",warrantyPeriod:"",purchGroup:rfq.purchGroup||"",
    priceConditions:{discount:0,surcharge:0,freight:0,insurance:0},
  });
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const updItem=(idx,k,val)=>{
    const items=f.items.map((it,i)=>{if(i!==idx)return it;const u={...it,[k]:Number(val)};u.total=u.qty*u.unitPrice;return u;});
    setF(p=>({...p,items,totalAmt:items.reduce((sum,it)=>sum+it.total,0)}));
  };
  const save=draft=>{
    onSave({...f,id:f.id||`QT-${uid()}`,status:draft?"Draft":"Submitted",submittedDate:draft?"":new Date().toISOString().split("T")[0],files:f.files.length===0&&!draft?["quotation.pdf"]:f.files});
  };
  const pc=f.priceConditions||{discount:0,surcharge:0,freight:0,insurance:0};
  const updPc=(k,v)=>s("priceConditions",{...pc,[k]:Number(v)});
  return (
    <Modal title={qt?`Edit Quotation: ${rfq.title}`:`Submit Quotation: ${rfq.title}`} onClose={onClose} width={780}>
      <div style={{padding:"8px 12px",background:C.infoBg,borderRadius:4,marginBottom:14,fontSize:12}}>
        <strong>RFQ:</strong> {rfq.id} · Closing: {rfq.closingDate} · Est. Value: {idr(rfq.estVal)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:12}}>
        <div><Lbl>Valid Until *</Lbl><DateInp value={f.validUntil} onChange={v=>s("validUntil",v)}/></div>
        <div><Lbl>Total Amount (IDR)</Lbl><Inp value={idr(f.totalAmt)} onChange={()=>{}}/></div>
      </div>

      {/* Commercial Terms section */}
      <div style={{marginBottom:14,padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:6,background:C.subtle}}>
        <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.6,marginBottom:10}}>Commercial Terms</div>
        <div style={{display:"grid",gridTemplateColumns:g2(),gap:10,marginBottom:10}}>
          <div><Lbl>Sales Person / Contact</Lbl><Inp value={f.salesPerson} onChange={v=>s("salesPerson",v)} placeholder="Name / Phone or Email"/></div>
          <div>
            <Lbl>Purchasing Group</Lbl>
            <Sel value={f.purchGroup} onChange={v=>s("purchGroup",v)} opts={[{v:"",l:"— Select —"},...PURCHASING_GROUPS.map(p=>({v:p.v,l:`${p.v} – ${p.l}`}))]}/>
          </div>
          <div>
            <Lbl>Terms of Payment</Lbl>
            <Sel value={f.termsOfPayment} onChange={v=>s("termsOfPayment",v)} opts={PAYMENT_TERMS}/>
          </div>
          <div>
            <Lbl>Delivery Terms (Incoterms)</Lbl>
            <Sel value={f.deliveryTerms} onChange={v=>s("deliveryTerms",v)} opts={INCOTERMS}/>
          </div>
          <div><Lbl>Lead Time</Lbl><Inp value={f.leadTime} onChange={v=>s("leadTime",v)} placeholder="e.g. 14 days"/></div>
          <div><Lbl>Warranty Period</Lbl><Inp value={f.warrantyPeriod} onChange={v=>s("warrantyPeriod",v)} placeholder="e.g. 12 months"/></div>
        </div>
        <div style={{borderTop:`1px dashed ${C.border}`,paddingTop:10}}>
          <div style={{fontSize:11,color:C.t2,fontWeight:600,marginBottom:8}}>Price Conditions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
            <div><Lbl>Discount (%)</Lbl><AmtInp value={pc.discount} onChange={v=>updPc("discount",v)}/></div>
            <div><Lbl>Surcharge (%)</Lbl><AmtInp value={pc.surcharge} onChange={v=>updPc("surcharge",v)}/></div>
            <div><Lbl>Freight (IDR)</Lbl><AmtInp value={pc.freight} onChange={v=>updPc("freight",v)}/></div>
            <div><Lbl>Insurance (IDR)</Lbl><AmtInp value={pc.insurance} onChange={v=>updPc("insurance",v)}/></div>
          </div>
        </div>
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

// ── Quotation Compare Modal ────────────────────────────────────
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

  const LABEL_W = 210;
  const COL_W = Math.max(190, Math.floor(880/quotations.length));

  const SectionHdr = ({title}) => (
    <tr>
      <td colSpan={quotations.length+1} style={{
        padding:"7px 14px",background:C.subtle,fontWeight:700,fontSize:10,
        color:C.t2,textTransform:"uppercase",letterSpacing:.8,
        borderTop:`2px solid ${C.border}`,borderBottom:`1px solid ${C.border}`
      }}>{title}</td>
    </tr>
  );

  const Row = ({label, vals, fmt, bestVal, bold, sub}) => (
    <tr style={{borderBottom:`1px solid ${C.border}`}}>
      <td style={{
        padding:"7px 14px",fontSize:sub?11:12,color:sub?C.t2:C.t1,fontWeight:500,
        background:C.card,borderRight:`1px solid ${C.border}`,
        minWidth:LABEL_W,whiteSpace:"nowrap",paddingLeft:sub?24:14
      }}>{label}</td>
      {vals.map((v,i)=>{
        const isBest = bestVal!=null && v===bestVal && quotations.length>1;
        return (
          <td key={i} style={{
            padding:"7px 14px",fontSize:12,fontWeight:bold?700:400,textAlign:"right",
            color: isBest ? C.ok : C.t1,
            background: isBest ? C.okBg : C.card,
            borderRight:`1px solid ${C.border}`,minWidth:COL_W
          }}>
            {fmt ? fmt(v) : (v||"—")}
            {isBest && quotations.length>1 && <span style={{fontSize:9,marginLeft:4,color:C.ok,fontWeight:700}}>★ BEST</span>}
          </td>
        );
      })}
    </tr>
  );

  return (
    <Modal title={`Quotation Comparison · ${rfq.title}`} onClose={onClose} width="90vw">
      {/* Vendor header cards */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {quotations.map((qt,i)=>(
          <div key={qt.id} style={{
            flex:1,minWidth:160,padding:"10px 14px",background:C.subtle,borderRadius:6,
            borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,border:`1px solid ${C.border}`
          }}>
            <div style={{fontSize:13,fontWeight:700,color:VDR_COLORS[i%VDR_COLORS.length]}}>{qt.vendorName}</div>
            <div style={{fontSize:10,color:C.t2,marginTop:2}}>{qt.vendorId} · {qt.id}</div>
            <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <Badge s={qt.status}/>
              <span style={{fontSize:11,fontWeight:700,color: calcNet(qt)===bestNet&&quotations.length>1?C.ok:C.t1}}>{idr(calcNet(qt))}</span>
              {calcNet(qt)===bestNet&&quotations.length>1&&<span style={{fontSize:10,color:C.ok,fontWeight:700}}>★ Lowest</span>}
            </div>
          </div>
        ))}
      </div>

      {/* RFQ meta strip */}
      <div style={{padding:"6px 12px",background:C.infoBg,borderRadius:4,marginBottom:12,fontSize:11,color:C.info,display:"flex",gap:16,flexWrap:"wrap"}}>
        <span><strong>RFQ:</strong> {rfq.id}</span>
        <span><strong>Category:</strong> {rfq.cat}</span>
        <span><strong>Purch. Org:</strong> {rfq.purchOrg||"—"}</span>
        <span><strong>Purch. Group:</strong> {pgLabel(rfq.purchGroup)}</span>
        <span><strong>Company:</strong> {rfq.companyCode||"—"}</span>
        <span><strong>Plant:</strong> {rfq.plant||"—"}</span>
        <span><strong>Est. Budget:</strong> {idr(rfq.estVal)}</span>
      </div>

      {/* Comparison table */}
      <div style={{overflow:"auto",border:`1px solid ${C.border}`,borderRadius:6,maxHeight:"58vh"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:LABEL_W+COL_W*quotations.length}}>
          <thead>
            <tr style={{position:"sticky",top:0,zIndex:2}}>
              <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:C.t2,textAlign:"left",
                background:C.subtle,borderRight:`1px solid ${C.border}`,borderBottom:`2px solid ${C.border}`,
                minWidth:LABEL_W}}>Parameter</th>
              {quotations.map((qt,i)=>(
                <th key={qt.id} style={{padding:"9px 14px",fontSize:11,fontWeight:700,textAlign:"center",
                  color:VDR_COLORS[i%VDR_COLORS.length],background:C.subtle,
                  borderBottom:`2px solid ${C.border}`,borderRight:`1px solid ${C.border}`,
                  borderTop:`3px solid ${VDR_COLORS[i%VDR_COLORS.length]}`,minWidth:COL_W}}>
                  {qt.vendorName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* VENDOR INFORMATION */}
            <SectionHdr title="Vendor Information"/>
            <Row label="Vendor Number"           vals={quotations.map(q=>q.vendorId)}/>
            <Row label="Vendor Name"             vals={quotations.map(q=>q.vendorName)}/>
            <Row label="Sales Person / Contact"  vals={quotations.map(q=>q.salesPerson||"—")}/>
            <Row label="Quotation ID"            vals={quotations.map(q=>q.id)}/>
            <Row label="Submitted Date"          vals={quotations.map(q=>fmtDate(q.submittedDate))}/>
            <Row label="Valid Until"             vals={quotations.map(q=>fmtDate(q.validUntil))}/>
            <Row label="Status"                  vals={quotations.map(q=>q.status)}/>

            {/* PURCHASING DETAILS */}
            <SectionHdr title="Purchasing Details"/>
            <Row label="Purchasing Organization" vals={quotations.map(()=>rfq.purchOrg||"—")}/>
            <Row label="Purchasing Group"        vals={quotations.map(q=>pgLabel(q.purchGroup))}/>

            {/* COMMERCIAL TERMS */}
            <SectionHdr title="Commercial Terms"/>
            <Row label="Terms of Payment"        vals={quotations.map(q=>q.termsOfPayment||"—")}/>
            <Row label="Delivery Terms"          vals={quotations.map(q=>q.deliveryTerms||"—")}/>
            <Row label="Lead Time"               vals={quotations.map(q=>q.leadTime||"—")}/>
            <Row label="Warranty Period"         vals={quotations.map(q=>q.warrantyPeriod||"—")}/>

            {/* LINE ITEMS */}
            <SectionHdr title="Line Items — Price Comparison"/>
            {(rfq.items||[]).map((item,ii)=>(
              <>
                <tr key={`ih-${ii}`} style={{background:C.infoBg}}>
                  <td colSpan={quotations.length+1} style={{
                    padding:"5px 14px 5px 28px",fontSize:11,fontWeight:700,
                    color:C.info,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`
                  }}>
                    {String(item.no).padStart(3,"0")} · {item.desc}
                    <span style={{fontWeight:400,color:C.t2,marginLeft:8}}>({item.qty} {item.uom})</span>
                  </td>
                </tr>
                <Row key={`mg-${ii}`} label="Material / Product Group"
                  vals={quotations.map(q=>q.items?.[ii]?.materialGroup||item.materialGroup||"—")} sub/>
                <Row key={`up-${ii}`} label="Unit Price (IDR)"
                  vals={quotations.map(q=>q.items?.[ii]?.unitPrice||0)}
                  fmt={v=>idr(v)} bestVal={itemBestPrice[ii]} bold sub/>
                <Row key={`tot-${ii}`} label="Item Total (IDR)"
                  vals={quotations.map(q=>q.items?.[ii]?.total||0)}
                  fmt={v=>idr(v)} sub/>
              </>
            ))}

            {/* PRICE CONDITIONS */}
            <SectionHdr title="Price Conditions & Summary"/>
            <Row label="Subtotal"              vals={quotations.map(q=>q.totalAmt)} fmt={v=>idr(v)}/>
            <Row label="Discount (%)"          vals={quotations.map(q=>`${q.priceConditions?.discount||0}%`)}/>
            <Row label="Discount Amount"       vals={quotations.map(q=>q.totalAmt*(q.priceConditions?.discount||0)/100)}
              fmt={v=>v>0?`(${idr(v)})`:"—"} sub/>
            <Row label="Surcharge (%)"         vals={quotations.map(q=>`${q.priceConditions?.surcharge||0}%`)}/>
            <Row label="Surcharge Amount"      vals={quotations.map(q=>q.totalAmt*(q.priceConditions?.surcharge||0)/100)}
              fmt={v=>v>0?idr(v):"—"} sub/>
            <Row label="Freight Cost"          vals={quotations.map(q=>q.priceConditions?.freight||0)} fmt={v=>v>0?idr(v):"—"}/>
            <Row label="Insurance Cost"        vals={quotations.map(q=>q.priceConditions?.insurance||0)} fmt={v=>v>0?idr(v):"—"}/>

            {/* NET TOTAL highlight row */}
            <tr style={{background:C.subtle,borderTop:`2px solid ${C.border}`}}>
              <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.t1,
                borderRight:`1px solid ${C.border}`,minWidth:LABEL_W}}>NET TOTAL (IDR)</td>
              {quotations.map((qt,i)=>{
                const net=nets[i];
                const isBest=net===bestNet&&quotations.length>1;
                return (
                  <td key={qt.id} style={{
                    padding:"11px 14px",fontSize:14,fontWeight:700,textAlign:"right",
                    color:isBest?C.ok:C.t1,background:isBest?C.okBg:C.subtle,
                    borderRight:`1px solid ${C.border}`,minWidth:COL_W
                  }}>
                    {idr(net)}
                    {isBest&&quotations.length>1&&<div style={{fontSize:10,color:C.ok,fontWeight:700,marginTop:2}}>★ Recommended (Lowest Net)</div>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Suggested additional parameters */}
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
          <FilterBar opts={["All","Draft","Submitted","Accepted","Rejected","Withdrawn"]} val={flt} onChange={setFlt}/>
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
          {viewQt.salesPerson&&<div style={{marginBottom:10}}><Lbl>Sales Person / Contact</Lbl><Val>{viewQt.salesPerson}</Val></div>}
          <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:14}}>
            {viewQt.termsOfPayment&&<div><Lbl>Terms of Payment</Lbl><Val>{viewQt.termsOfPayment}</Val></div>}
            {viewQt.deliveryTerms&&<div><Lbl>Delivery Terms</Lbl><Val>{viewQt.deliveryTerms}</Val></div>}
            {viewQt.leadTime&&<div><Lbl>Lead Time</Lbl><Val>{viewQt.leadTime}</Val></div>}
            {viewQt.warrantyPeriod&&<div><Lbl>Warranty Period</Lbl><Val>{viewQt.warrantyPeriod}</Val></div>}
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

// ── BRM Quotation Mgmt ─────────────────────────────────────────
export const BrmQuotation = ({quotations,setQuotations,rfqs}) => {
  const [flt,setFlt]=useState("All"); const [view,setView]=useState(null);
  const list=quotations.filter(q=>flt==="All"||q.status===flt);
  const accept=id=>{setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Accepted"}:q));setView(null);};
  const reject=id=>{if(window.confirm("Reject this quotation?"))setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Rejected"}:q));setView(null);};
  return (
    <div style={{padding:pg()}}>
      <div style={{marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:20,fontWeight:700,color:C.t1}}>Quotation Management – All Vendors</div>
        <div style={{fontSize:12,color:C.t2,marginTop:4}}>📡 Vendor quotations from Custom CDS Table on BTP · Compare and award to best bidder</div>
      </div>
      <FilterBar opts={["All","Submitted","Accepted","Rejected","Withdrawn"]} val={flt} onChange={setFlt}/>
      <Card style={{padding:0,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
          <thead><tr>{["RFQ Title","Vendor","Submitted","Valid Until","Total Amount","Status","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {list.length===0?<tr><Td colSpan={7} style={{textAlign:"center",padding:40,color:C.t2}}>No quotations found.</Td></tr>:list.map(qt=>(
              <tr key={qt.id}>
                <Td><button onClick={()=>setView(qt)} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontWeight:700,fontSize:13,padding:0}}>{qt.rfqTitle}</button><div style={{fontSize:10,color:C.t2}}>{qt.rfqId}</div></Td>
                <Td><div>{qt.vendorName}</div><div style={{fontSize:10,color:C.t2}}>{qt.vendorId}</div></Td>
                <Td>{fmtDate(qt.submittedDate)}</Td><Td>{fmtDate(qt.validUntil)}</Td>
                <Td style={{fontWeight:700}}>{idr(qt.totalAmt)}</Td>
                <Td><Badge s={qt.status}/></Td>
                <Td><div style={{display:"flex",gap:5}}>
                  <Btn v="ghost" sm onClick={()=>setView(qt)}>View</Btn>
                  {qt.status==="Submitted"&&<><Btn v="success" sm onClick={()=>accept(qt.id)}>Award</Btn><Btn v="danger" sm onClick={()=>reject(qt.id)}>Reject</Btn></>}
                </div></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {view&&(
        <Modal title={`Quotation Detail: ${view.rfqTitle}`} onClose={()=>setView(null)} width={720}>
          <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:14}}>
            {[["Quotation ID",view.id],["RFQ ID",view.rfqId],["Vendor",view.vendorName],["Vendor ID",view.vendorId],["Submitted",fmtDate(view.submittedDate)],["Valid Until",fmtDate(view.validUntil)],["Total",idr(view.totalAmt)],["Status",null]].map(([l,val])=>(
              <div key={l}><Lbl>{l}</Lbl>{l==="Status"?<Badge s={view.status}/>:<Val>{val}</Val>}</div>
            ))}
          </div>
          {view.salesPerson&&<div style={{marginBottom:10}}><Lbl>Sales Person / Contact</Lbl><Val>{view.salesPerson}</Val></div>}
          <div style={{display:"grid",gridTemplateColumns:g2(),gap:12,marginBottom:14}}>
            {view.termsOfPayment&&<div><Lbl>Terms of Payment</Lbl><Val>{view.termsOfPayment}</Val></div>}
            {view.deliveryTerms&&<div><Lbl>Delivery Terms</Lbl><Val>{view.deliveryTerms}</Val></div>}
            {view.leadTime&&<div><Lbl>Lead Time</Lbl><Val>{view.leadTime}</Val></div>}
            {view.warrantyPeriod&&<div><Lbl>Warranty Period</Lbl><Val>{view.warrantyPeriod}</Val></div>}
            {view.purchGroup&&<div><Lbl>Purchasing Group</Lbl><Val>{pgLabel(view.purchGroup)}</Val></div>}
          </div>
          <Lbl>Line Items</Lbl>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,margin:"6px 0 14px"}}>
            <thead><tr style={{background:C.subtle}}>{["Description","Qty","UoM","Unit Price","Total"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{view.items.map((it,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"6px 10px"}}>{it.desc}</td><td style={{padding:"6px 10px"}}>{it.qty}</td><td style={{padding:"6px 10px"}}>{it.uom}</td><td style={{padding:"6px 10px"}}>{idr(it.unitPrice)}</td><td style={{padding:"6px 10px",fontWeight:700}}>{idr(it.total)}</td></tr>)}</tbody>
          </table>
          {view.notes&&<div style={{marginBottom:12}}><Lbl>Notes / Commercial Terms</Lbl><Val>{view.notes}</Val></div>}
          {view.files?.length>0&&<div style={{marginBottom:14}}><Lbl>Attachments</Lbl>{view.files.map(a=><div key={a} style={{fontSize:13,color:C.primary,display:"flex",alignItems:"center",gap:5}}><SapIcon name="document" size={13} color={C.primary}/>{a}</div>)}</div>}
          {view.status==="Submitted"&&(
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <Btn v="danger" onClick={()=>reject(view.id)}>Reject Quotation</Btn>
              <Btn v="success" onClick={()=>accept(view.id)}>Accept & Award Contract</Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

const DiscussionBox = ({rfqId, discussions=[], onPost, user}) => {
  const [msg, setMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const ROLE_COLOR = {
    "Procurement Manager": "#0a6ed1",
    "Senior Buyer": "#107e3e",
    "Finance Approver": "#6f2da8",
  };

  const submit = () => {
    const t = msg.trim();
    if(!t) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2,"0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    onPost(rfqId, {
      id: `D-${uid()}`,
      userId: user.username,
      userName: user.name,
      role: user.role==="approver" ? "Finance Approver" : user.role==="brm" ? (user.name==="Siti Rahma" ? "Senior Buyer" : "Procurement Manager") : user.role,
      postedAt: ts,
      message: t,
    });
    setMsg("");
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),50);
  };

  const initials = (name) => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
        <SapIcon name="discussion" size={14} color={C.t2}/>
        <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Discussion ({discussions.length})</span>
      </div>

      {/* Message list */}
      {discussions.length===0&&(
        <div style={{padding:"12px 0",color:C.t2,fontSize:13,fontStyle:"italic"}}>No discussion yet. Be the first to comment.</div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:280,overflowY:"auto",marginBottom:12,paddingRight:4}}>
        {discussions.map((d,i)=>{
          const isMe = d.userId===user.username;
          const roleColor = ROLE_COLOR[d.role] || C.t2;
          return (
            <div key={d.id||i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              {/* Avatar */}
              <div style={{width:32,height:32,borderRadius:"50%",background:roleColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:"#fff"}}>
                {initials(d.userName)}
              </div>
              <div style={{flex:1,background:isMe?"#e8f2fb":C.subtle,borderRadius:8,padding:"8px 12px",border:`1px solid ${isMe?"#b3d4f5":C.border}`}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:12,color:roleColor}}>{d.userName}</span>
                  <span style={{fontSize:11,color:C.t2,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"0 6px"}}>{d.role}</span>
                  <span style={{fontSize:11,color:C.t2,marginLeft:"auto"}}>{d.postedAt}</span>
                </div>
                <div style={{fontSize:13,color:C.t1,lineHeight:1.5}}>{d.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input area */}
      <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:ROLE_COLOR[user.role==="approver"?"Finance Approver":user.role==="brm"?(user.name==="Siti Rahma"?"Senior Buyer":"Procurement Manager"):"BRM"]||C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:"#fff"}}>
          {initials(user.name||"U")}
        </div>
        <div style={{flex:1,border:`1px solid ${C.fieldBorder}`,borderRadius:6,background:C.field,overflow:"hidden"}}>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}
            placeholder="Write your suggestion, note, or question… (Enter to send, Shift+Enter for newline)"
            rows={2}
            style={{width:"100%",border:"none",outline:"none",resize:"none",padding:"8px 10px",fontSize:13,fontFamily:"inherit",background:"transparent",color:C.t1,boxSizing:"border-box" as const}}/>
        </div>
        <Btn v="primary" sm onClick={submit} disabled={!msg.trim()}>
          <SapIcon name="paper-plane" size={13} color="#fff"/> Send
        </Btn>
      </div>
      <div style={{fontSize:11,color:C.t2,marginTop:4,marginLeft:40}}>Enter to send · Shift+Enter for new line</div>
    </div>
  );
};

// ── BRM RFQ Mgmt ───────────────────────────────────────────────
const RfqStatusIcon = ({s}) => {
  const map = {
    "Open":       {shape:"square",  color:"#BB0000"},
    "On Process": {shape:"triangle",color:"#E9730C"},
    "Complete":   {shape:"circle",  color:"#188918"},
    "Closed":     {shape:"circle",  color:"#0070F2"},
  };
  const m = map[s]||{shape:"square",color:C.t2};
  if(m.shape==="triangle") return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{flexShrink:0,marginTop:1}}>
      <polygon points="7,1 13,13 1,13" fill={m.color}/>
    </svg>
  );
  if(m.shape==="circle") return <div style={{width:13,height:13,borderRadius:"50%",background:m.color,flexShrink:0}}/>;
  return <div style={{width:13,height:13,borderRadius:2,background:m.color,flexShrink:0}}/>;
};

export const BrmRfq = ({rfqs,setRfqs,quotations,user}) => {
  const [showForm,setForm]=useState(false);
  const postDiscussion = (rfqId, entry) => {
    setRfqs(p => p.map(r => r.id===rfqId ? {...r, discussions:[...(r.discussions||[]), entry]} : r));
  };
  const [flt,setFlt]=useState("All");
  const [expanded,setExpanded]=useState({});
  const [compare,setCompare]=useState(null);
  const EMPTY_FLT={company:"",purchOrg:"",plant:"",rfqNo:"",tenderAdmin:""};
  const [filters,setFilters]=useState(EMPTY_FLT);
  const [applied,setApplied]=useState(EMPTY_FLT);
  const sf2=(k,v)=>setFilters(p=>({...p,[k]:v}));
  const applyFilters=()=>setApplied({...filters});
  const resetFilters=()=>{setFilters(EMPTY_FLT);setApplied(EMPTY_FLT);};
  const activeTokens=[
    applied.company     &&{label:"Company",     val:applied.company,     onClear:()=>{setFilters(p=>({...p,company:""}));    setApplied(p=>({...p,company:""}));}},
    applied.purchOrg    &&{label:"Purch. Org",  val:applied.purchOrg,    onClear:()=>{setFilters(p=>({...p,purchOrg:""}));   setApplied(p=>({...p,purchOrg:""}));}},
    applied.plant       &&{label:"Plant",        val:applied.plant,       onClear:()=>{setFilters(p=>({...p,plant:""}));      setApplied(p=>({...p,plant:""}));}},
    applied.rfqNo       &&{label:"RFQ No",       val:applied.rfqNo,       onClear:()=>{setFilters(p=>({...p,rfqNo:""}));      setApplied(p=>({...p,rfqNo:""}));}},
    applied.tenderAdmin &&{label:"Tender Admin", val:applied.tenderAdmin, onClear:()=>{setFilters(p=>({...p,tenderAdmin:""}));setApplied(p=>({...p,tenderAdmin:""}));}},
  ].filter(Boolean);

  const [f,setF]=useState({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",companyCode:"",plant:"",purchOrg:"",purchGroup:"",
    items:[{no:1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]});
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const list=rfqs
    .filter(r=>flt==="All"||r.status===flt)
    .filter(r=>!applied.company     || r.companyCode?.toLowerCase().includes(applied.company.toLowerCase()))
    .filter(r=>!applied.purchOrg    || r.purchOrg?.toLowerCase().includes(applied.purchOrg.toLowerCase()))
    .filter(r=>!applied.plant       || r.plant?.toLowerCase().includes(applied.plant.toLowerCase()))
    .filter(r=>!applied.rfqNo       || r.id?.toLowerCase().includes(applied.rfqNo.toLowerCase()))
    .filter(r=>!applied.tenderAdmin || r.postedBy?.toLowerCase().includes(applied.tenderAdmin.toLowerCase()));
  const getQts=rfqId=>quotations.filter(q=>q.rfqId===rfqId);
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));
  const addItem=()=>setF(p=>({...p,items:[...p.items,{no:p.items.length+1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]}));
  const updItem=(i,k,v)=>setF(p=>({...p,items:p.items.map((it,j)=>j===i?{...it,[k]:v}:it)}));
  const publish=()=>{
    if(!f.title||!f.closingDate||f.targets.length===0){alert("Please fill title, closing date, and select at least one vendor.");return;}
    setRfqs(p=>[...p,{...f,id:`RFQ-${uid()}`,postedDate:new Date().toISOString().split("T")[0],postedBy:"Ahmad Rizki",status:"Open",estVal:Number(f.estVal),
      items:f.items.map(it=>({...it,qty:Number(it.qty),estPrice:Number(it.estPrice)}))}]);
    setForm(false);
    setF({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",companyCode:"",plant:"",purchOrg:"",purchGroup:"",
      items:[{no:1,desc:"",type:"Material",acctAssign:"",materialNo:"",materialGroup:"",plant:"",qty:1,uom:"Unit",estPrice:0,requirementDate:"",startDate:"",endDate:""}]});
  };

  const HDR_COLS = ["","Status","RFQ Number","Description","Open Date","Closing Date","Tender Admin","Budget","Co. Code","Plant",""];

  return (
    <div style={{padding:pg()}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>RFQ Management</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>📡 RFQ published to BTP Vendor Portal → Vendor notified → Quotations collected</div>
        </div>
        <Btn onClick={()=>setForm(true)}>+ Create RFQ</Btn>
      </div>

      <FioriBar activeTokens={activeTokens} onGo={applyFilters} onReset={resetFilters}>
        <FField label="Company">
          <Sel value={filters.company} onChange={v=>sf2("company",v)} opts={[{v:"",l:"— All —"},...COMPANY_CODES.map(c=>({v:c.v,l:`${c.v} – ${c.l}`}))]}/>
        </FField>
        <FField label="Purchasing Org">
          <Sel value={filters.purchOrg} onChange={v=>sf2("purchOrg",v)} opts={[{v:"",l:"— All —"},{v:"PO10",l:"PO10 – Procurement Central"},{v:"PO20",l:"PO20 – Procurement Regional"}]}/>
        </FField>
        <FField label="Plant">
          <Sel value={filters.plant} onChange={v=>sf2("plant",v)} opts={[{v:"",l:"— All —"},{v:"PL01",l:"PL01"},{v:"PL02",l:"PL02"},{v:"PL03",l:"PL03"},{v:"PL04",l:"PL04"}]}/>
        </FField>
        <FField label="RFQ Number">
          <Inp value={filters.rfqNo} onChange={v=>sf2("rfqNo",v)} placeholder="e.g. RFQ-2025-0001"/>
        </FField>
        <FField label="Tender Administrator">
          <Inp value={filters.tenderAdmin} onChange={v=>sf2("tenderAdmin",v)} placeholder="e.g. Ahmad Rizki"/>
        </FField>
      </FioriBar>
      <FilterBar opts={["All","Open","On Process","Complete","Closed"]} val={flt} onChange={setFlt}/>

      <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",background:C.card}}>
        <div style={{display:"grid",gridTemplateColumns:"28px 90px 130px 1fr 100px 110px 120px 130px 80px 70px 36px",background:C.subtle,borderBottom:`2px solid ${C.border}`}}>
          {HDR_COLS.map((h,i)=>(
            <div key={i} style={{padding:"8px 10px",fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}</div>
          ))}
        </div>

        {list.length===0&&<div style={{padding:"28px 16px",textAlign:"center",color:C.t2,fontSize:13}}>No RFQs found.</div>}

        {list.map((rfq,ri)=>{
          const open=!!expanded[rfq.id];
          const qts=getQts(rfq.id);
          const rowBg = ri%2===0 ? C.card : C.subtle;
          return (
            <div key={rfq.id} style={{borderBottom:`1px solid ${C.border}`}}>
              <div
                onClick={()=>toggle(rfq.id)}
                style={{display:"grid",gridTemplateColumns:"28px 90px 130px 1fr 100px 110px 120px 130px 80px 70px 36px",background:rowBg,cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.infoBg}
                onMouseLeave={e=>e.currentTarget.style.background=rowBg}
              >
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 0"}}>
                  <span style={{fontSize:10,color:C.t2,transition:"transform .2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 10px"}}>
                  <RfqStatusIcon s={rfq.status}/>
                  <span style={{fontSize:11,fontWeight:600,color:C.t1,whiteSpace:"nowrap"}}>{rfq.status}</span>
                </div>
                <div style={{padding:"10px 10px",fontSize:12,fontWeight:700,color:C.primary,display:"flex",alignItems:"center"}}>{rfq.id}</div>
                <div style={{padding:"10px 10px",fontSize:12,color:C.t1,display:"flex",alignItems:"center",overflow:"hidden"}}>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rfq.title}</span>
                </div>
                <div style={{padding:"10px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center"}}>{fmtDate(rfq.postedDate)}</div>
                <div style={{padding:"10px 10px",fontSize:11,fontWeight:600,color:C.t1,display:"flex",alignItems:"center"}}>{fmtDate(rfq.closingDate)}</div>
                <div style={{padding:"10px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center",overflow:"hidden"}}>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rfq.postedBy}</span>
                </div>
                <div style={{padding:"10px 10px",fontSize:11,fontWeight:700,color:C.t1,display:"flex",alignItems:"center"}}>{idr(rfq.estVal)}</div>
                <div style={{padding:"10px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center"}}>{rfq.companyCode||"—"}</div>
                <div style={{padding:"10px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center"}}>{rfq.plant||"—"}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 4px"}}>
                  {qts.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 7px",fontWeight:700}}>{qts.length}</span>}
                </div>
              </div>

              {open&&(
                <div style={{background:C.infoBg,borderTop:`1px solid ${C.border}`}}>
                  {/* Item columns header */}
                  <div style={{display:"grid",gridTemplateColumns:"28px 40px 1fr 130px 120px 80px 80px 60px 110px",background:"rgba(0,112,242,0.07)",borderBottom:`1px solid ${C.border}`}}>
                    {["","#","Material / Service","Mat. No.","Material Group","Plant","Qty","UoM","Date"].map((h,i)=>(
                      <div key={i} style={{padding:"6px 10px",fontSize:10,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:.4}}>{h}</div>
                    ))}
                  </div>
                  {rfq.items.map((it,ii)=>(
                    <div key={ii} style={{display:"grid",gridTemplateColumns:"28px 40px 1fr 130px 120px 80px 80px 60px 110px",borderBottom:ii<rfq.items.length-1?`1px solid ${C.border}`:"none",background:ii%2===0?"transparent":"rgba(0,0,0,0.02)"}}>
                      <div/>
                      <div style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:C.t2}}>{String(it.no).padStart(3,"0")}</div>
                      <div style={{padding:"8px 10px"}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.t1}}>{it.desc}</div>
                        <div style={{fontSize:10,color:C.t2,marginTop:2}}>
                          <span style={{background:it.type==="Service"?C.warnBg:C.okBg,color:it.type==="Service"?C.warn:C.ok,borderRadius:3,padding:"1px 6px",fontWeight:700,marginRight:6}}>{it.type}</span>
                          {it.acctAssign}
                        </div>
                      </div>
                      <div style={{padding:"8px 10px",fontSize:11,fontFamily:"monospace",color:C.t1,display:"flex",alignItems:"center"}}>{it.materialNo||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center"}}>{it.materialGroup||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center"}}>{it.plant||"—"}</div>
                      <div style={{padding:"8px 10px",fontSize:11,fontWeight:600,color:C.t1,display:"flex",alignItems:"center"}}>{it.qty}</div>
                      <div style={{padding:"8px 10px",fontSize:11,color:C.t2,display:"flex",alignItems:"center"}}>{it.uom}</div>
                      <div style={{padding:"8px 10px",fontSize:10,color:C.t2,display:"flex",alignItems:"center"}}>
                        {it.type==="Material"
                          ? <span><span style={{color:C.t2,fontWeight:600}}>Req: </span>{fmtDate(it.requirementDate)||"—"}</span>
                          : <span><span style={{color:C.t2,fontWeight:600}}>Start: </span>{fmtDate(it.startDate)||"—"}<br/><span style={{color:C.t2,fontWeight:600}}>End: </span>{fmtDate(it.endDate)||"—"}</span>
                        }
                      </div>
                    </div>
                  ))}

                  {/* Received Quotations with Compare button */}
                  {qts.length>0&&(
                    <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:"rgba(0,0,0,0.02)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>
                          Received Quotations ({qts.length})
                        </div>
                        <div onClick={e=>e.stopPropagation()}>
                          <Btn sm v="ghost" onClick={()=>setCompare({rfq,quotations:qts})}>
                            ⊞ Compare Quotations
                          </Btn>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {qts.map((qt,qi)=>(
                          <div key={qt.id} style={{
                            padding:"5px 12px",background:C.card,border:`1px solid ${C.border}`,
                            borderLeft:`3px solid ${VDR_COLORS[qi%VDR_COLORS.length]}`,
                            borderRadius:4,fontSize:12,display:"flex",alignItems:"center",gap:8
                          }}>
                            <span style={{fontWeight:600}}>{qt.vendorName}</span>
                            <span style={{color:C.t2}}>·</span>
                            <span style={{fontWeight:700}}>{idr(qt.totalAmt)}</span>
                            <Badge s={qt.status}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{padding:"8px 16px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:20,flexWrap:"wrap",alignItems:"baseline"}}>
                    <div>
                      <span style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5}}>Scope: </span>
                      <span style={{fontSize:12,color:C.t2}}>{rfq.desc}</span>
                    </div>
                    {rfq.purchGroup&&(
                      <span style={{fontSize:11,color:C.t2,whiteSpace:"nowrap"}}>
                        <span style={{fontWeight:700}}>Purch. Group:</span> {pgLabel(rfq.purchGroup)}
                      </span>
                    )}
                  </div>
                  {user&&<DiscussionBox rfqId={rfq.id} discussions={rfq.discussions||[]} onPost={postDiscussion} user={user}/>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
        {[["Open","square","#BB0000"],["On Process","triangle","#E9730C"],["Complete","circle","#188918"],["Closed","circle","#0070F2"]].map(([s,sh,col])=>(
          <div key={s} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.t2}}>
            {sh==="triangle"
              ?<svg width="11" height="11" viewBox="0 0 14 14"><polygon points="7,1 13,13 1,13" fill={col}/></svg>
              :<div style={{width:11,height:11,borderRadius:sh==="circle"?"50%":2,background:col}}/>
            }
            {s}
          </div>
        ))}
      </div>

      {/* Create RFQ Modal */}
      {showForm&&(
        <Modal title="Create & Publish New RFQ" onClose={()=>setForm(false)} width={820}>
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

      {/* Quotation Compare Modal */}
      {compare&&<QuotationCompareModal rfq={compare.rfq} quotations={compare.quotations} onClose={()=>setCompare(null)}/>}
    </div>
  );
};
