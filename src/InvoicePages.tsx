import React, { useState, useEffect, useRef } from "react";
import {
  C, STC, VENDORS, COMPANY_CODES, CURRENCIES, WHT_TYPES, PAYMENT_TERMS, calcDueDate,
  fmtAmt, fmtDate, fmtPOs, ccName, uid, idr,
  mob, g2, g4, pg,
  Badge, StatusTag, Btn, Inp, AmtInp, DateInp, Ui5DatePicker, Sel, TA, Lbl, Val, Sep, Modal,
  FioriBar, FField, DateRangePicker, SapIcon, Card, Th, Td,
  ValueHelpDialog, ValueHelpInp, InvTypeMultiComboBox,
} from "./shared";

// ── PO Mock Master Data ────────────────────────────────────────
export const MOCK_POS = [
  {v:"4500001234",companyCode:"BRMS",currency:"IDR",amount:25000000,desc:"Office Supplies & Stationery Q2 2025"},
  {v:"4500001235",companyCode:"BRMS",currency:"IDR",amount:87500000,desc:"IT Equipment & Peripherals Procurement"},
  {v:"4500001236",companyCode:"CPMS",currency:"IDR",amount:45000000,desc:"Facility Maintenance Services"},
  {v:"4500001237",companyCode:"BRMS",currency:"USD",amount:8500,desc:"Enterprise Software License Renewal"},
  {v:"4500001238",companyCode:"GMIN",currency:"IDR",amount:125000000,desc:"Mining Equipment Spare Parts"},
  {v:"4500001239",companyCode:"SHSI",currency:"IDR",amount:56000000,desc:"Logistics & Transportation Services"},
  {v:"4500001240",companyCode:"LMRS",currency:"IDR",amount:18500000,desc:"Technical Consulting Services"},
  {v:"4500001241",companyCode:"BRMS",currency:"IDR",amount:92000000,desc:"Construction & Civil Works Materials"},
  {v:"4500001242",companyCode:"CPMS",currency:"IDR",amount:35000000,desc:"Environmental Management Services"},
  {v:"4500001243",companyCode:"BRMS",currency:"IDR",amount:150000000,desc:"Heavy Equipment Rental"},
  {v:"4500001244",companyCode:"GMIN",currency:"IDR",amount:68000000,desc:"Chemical Reagents & Lab Supplies"},
  {v:"4500001245",companyCode:"SHSI",currency:"SGD",amount:12500,desc:"Safety Equipment & PPE Procurement"},
  {v:"4500001246",companyCode:"BRMS",currency:"IDR",amount:210000000,desc:"Drilling Services & Equipment"},
  {v:"4500001247",companyCode:"LMRS",currency:"IDR",amount:44000000,desc:"Surveying & Mapping Services"},
  {v:"4500001248",companyCode:"CPMS",currency:"IDR",amount:78000000,desc:"Water Treatment Plant Maintenance"},
];

// ── PO Value Help Dialog ───────────────────────────────────────
export const PoValueHelp = ({values,onConfirm,onClose,companyCode=""}:any) => {
  const [tab,setTab]=useState<"search"|"define">("search");
  const [search,setSearch]=useState("");
  const [sel,setSel]=useState<Set<string>>(new Set(values));
  const [conditions,setConditions]=useState([{field:"poNo",op:"contains",val:""}]);
  const allPos = companyCode ? MOCK_POS.filter(p=>p.companyCode===companyCode) : MOCK_POS;
  const filtered = allPos.filter(po=>!search||po.v.includes(search)||po.desc.toLowerCase().includes(search.toLowerCase())||po.companyCode.toLowerCase().includes(search.toLowerCase()));
  const toggle=(v:string)=>{const n=new Set(sel);n.has(v)?n.delete(v):n.add(v);setSel(n);};
  const toggleAll=(checked:boolean)=>{const n=new Set(sel);filtered.forEach(p=>checked?n.add(p.v):n.delete(p.v));setSel(n);};
  const applyConditions=()=>{
    const matching=MOCK_POS.filter(po=>conditions.every(c=>{
      const fv=c.field==="poNo"?po.v:c.field==="companyCode"?po.companyCode:po.desc;
      if(!c.val)return true;
      if(c.op==="contains")return fv.toLowerCase().includes(c.val.toLowerCase());
      if(c.op==="equals")return fv===c.val;
      if(c.op==="startsWith")return fv.toLowerCase().startsWith(c.val.toLowerCase());
      return true;
    }));
    const n=new Set(sel);matching.forEach(p=>n.add(p.v));setSel(n);setTab("search");setSearch("");
  };
  const TabBtn=({id,label}:any)=>(
    <button onClick={()=>setTab(id)} style={{background:"none",border:"none",borderBottom:`2px solid ${tab===id?C.primary:"transparent"}`,cursor:"pointer",padding:"8px 16px 10px",fontSize:14,color:tab===id?C.primary:C.t2,fontFamily:"inherit",fontWeight:tab===id?600:400,marginBottom:-1}}>{label}</button>
  );
  return (
    <Modal title="Purchasing Document" onClose={onClose} width={740}>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:16,marginTop:-4}}>
        <TabBtn id="search" label="Search and Select"/>
        <TabBtn id="define" label="Define Conditions"/>
      </div>
      {tab==="search"&&<>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <div style={{flex:1,display:"flex",alignItems:"center",border:`1px solid ${C.border}`,borderRadius:2,background:C.field,padding:"0 10px",gap:6}}>
            <SapIcon name="search" size={14} color={C.t2}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setSearch(search)} placeholder="Search by PO number, description, or company code..."
              style={{flex:1,border:"none",background:"none",outline:"none",fontSize:13,color:C.t1,padding:"8px 0",fontFamily:"inherit"}}/>
          </div>
          <Btn v="primary" onClick={()=>setSearch(search)}>Go</Btn>
        </div>
        <div style={{fontSize:12,color:C.t2,marginBottom:6}}>Items ({filtered.length}) <span style={{fontSize:10}}>📡 SAP API: A_PurchaseOrder (OData v4)</span></div>
        <div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"auto",maxHeight:300}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:C.subtle}}>
                <th style={{width:36,padding:"7px 10px",borderBottom:`1px solid ${C.border}`}}><input type="checkbox" checked={filtered.length>0&&filtered.every(p=>sel.has(p.v))} onChange={e=>toggleAll(e.target.checked)}/></th>
                {["PO Number","Company Code","Description","Currency","Total Amount"].map(h=>(
                  <th key={h} style={{padding:"7px 10px",fontWeight:700,fontSize:12,color:C.t2,textAlign:"left",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap" as const}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((po,i)=>(
                <tr key={po.v} onClick={()=>toggle(po.v)} style={{background:sel.has(po.v)?"#e8f1fb":i%2===0?C.card:C.subtle,cursor:"pointer"}}>
                  <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`}}><input type="checkbox" checked={sel.has(po.v)} onChange={()=>toggle(po.v)} onClick={e=>e.stopPropagation()}/></td>
                  <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontWeight:600,color:C.primary}}>{po.v}</td>
                  <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,color:C.t1,fontWeight:600}}>{po.companyCode}</td>
                  <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,color:C.t1}}>{po.desc}</td>
                  <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,color:C.t2}}>{po.currency}</td>
                  <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,textAlign:"right",fontVariantNumeric:"tabular-nums" as const,fontWeight:600}}>{fmtAmt(po.amount,po.currency)}</td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={6} style={{padding:"20px",textAlign:"center",color:C.t2,fontStyle:"italic",fontSize:13}}>No POs found. Try a different search term.</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
      {tab==="define"&&<>
        <div style={{fontSize:12,color:C.t2,marginBottom:10}}>Add conditions to filter POs. Click "Apply" to select matching POs and switch to Search &amp; Select view.</div>
        {conditions.map((c,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <Sel value={c.field} onChange={v=>setConditions(p=>{const n=[...p];n[i]={...n[i],field:v};return n;})} opts={[{v:"poNo",l:"PO Number"},{v:"companyCode",l:"Company Code"},{v:"desc",l:"Description"}]}/>
            <Sel value={c.op} onChange={v=>setConditions(p=>{const n=[...p];n[i]={...n[i],op:v};return n;})} opts={[{v:"contains",l:"contains"},{v:"equals",l:"equals"},{v:"startsWith",l:"starts with"}]}/>
            <Inp value={c.val} onChange={v=>setConditions(p=>{const n=[...p];n[i]={...n[i],val:v};return n;})} placeholder="Value..."/>
            {i>0&&<button onClick={()=>setConditions(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:16,padding:"0 4px"}}>✕</button>}
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <Btn v="neutral" sm onClick={()=>setConditions(p=>[...p,{field:"poNo",op:"contains",val:""}])}>+ Add Condition</Btn>
          <Btn v="primary" onClick={applyConditions}>Apply & Select Matching POs</Btn>
        </div>
      </>}
      <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:16,paddingTop:12,borderTop:`1px solid ${C.border}`,alignItems:"center"}}>
        <span style={{fontSize:13,color:C.t2}}>{sel.size} PO{sel.size!==1?"s":""} selected</span>
        <div style={{display:"flex",gap:8}}>
          <Btn v="neutral" onClick={onClose}>Cancel</Btn>
          <Btn v="primary" onClick={()=>onConfirm([...sel])}>Confirm ({sel.size} PO{sel.size!==1?"s":""})</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ── Invoice Form Modal ─────────────────────────────────────────
const PO_MOCK_POOL = [
  {matCode:"MAT-1001",matDesc:"Activated Carbon Filter Media",uom:"KG",unitAmt:850000},
  {matCode:"MAT-1002",matDesc:'Stainless Steel Pipe 2"',uom:"M",unitAmt:1250000},
  {matCode:"MAT-1003",matDesc:"Industrial Filter Bag 25μm",uom:"PCS",unitAmt:420000},
  {matCode:"MAT-1004",matDesc:"Centrifugal Pump Assembly",uom:"EA",unitAmt:18500000},
  {matCode:"MAT-1005",matDesc:"Chemical Reagent H₂SO₄ 98%",uom:"L",unitAmt:320000},
  {matCode:"MAT-2001",matDesc:"Technical Consulting Services",uom:"HR",unitAmt:1500000},
  {matCode:"MAT-2002",matDesc:"Maintenance & Repair Service",uom:"LS",unitAmt:25000000},
  {matCode:"MAT-3001",matDesc:"Safety Equipment & PPE Kit",uom:"SET",unitAmt:2800000},
];
const getMockPoItem = (po:string) => {
  const h=po.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const m=PO_MOCK_POOL[h%PO_MOCK_POOL.length];
  const qty=10+(h%41);
  const poAmt=m.unitAmt*qty;
  const grPct=0.6+((h*7)%41)/100;
  const grAmt=Math.round(poAmt*grPct);
  const dpAmt=Math.round(grAmt*((h*3)%31)/100);
  const invAmt=grAmt-dpAmt;
  return {...m,item:"10",qty,poAmt,grAmt,dpAmt,invAmt};
};
const VAT_RATES = [
  {v:"0",l:"0%",r:0},{v:"1.1",l:"1.1% (PPN PMSE)",r:0.011},
  {v:"10",l:"10%",r:0.10},{v:"11",l:"11% (Standard PPN)",r:0.11},{v:"12",l:"12%",r:0.12},
];
const WHT_CODES:Record<string,{v:string,l:string,rate:number}[]> = {
  PPh21:  [{v:"21-100-99",l:"21-100-99 – Pegawai Tetap (5%)",rate:5}],
  PPh22:  [{v:"22-100-01",l:"22-100-01 – Industri (1.5%)",rate:1.5}],
  PPh23:  [{v:"23-100-04",l:"23-100-04 – Jasa Lain (2%)",rate:2},{v:"23-100-01",l:"23-100-01 – Sewa (2%)",rate:2}],
  PPh26:  [{v:"26-100-01",l:"26-100-01 – Non-Resident (20%)",rate:20}],
  PPh4a2: [{v:"04-100-01",l:"04-100-01 – Sewa Tanah/Bangunan (10%)",rate:10},{v:"04-200-01",l:"04-200-01 – Jasa Konstruksi (2%)",rate:2}],
};
export const InvoiceFormModal = ({inv,onSave,onClose,vendorId,vendorName,allInvoices=[],addNotif}:any) => {
  const assignedCCs=(VENDORS[vendorId]?.lfb1||[]).map((r:any)=>r.bukrs);
  const allowedCCs=assignedCCs.length>0?COMPANY_CODES.filter(c=>assignedCCs.includes(c.v)):COMPANY_CODES;
  const defaultPmtTerm = ((VENDORS[vendorId]?.lfb1||[]) as any[])[0]?.zterm || "Z030";
  const isNew=!inv;
  const todayISO=new Date().toISOString().split("T")[0];
  const initOtherFees = inv?.otherFees || (inv?.additionalFee>0?[{category:inv.feeCategory||"",amount:Number(inv.additionalFee)}]:[]);
  const [f,setF]=useState(inv?
    {...inv,paymentTerms:inv.paymentTerms||"Z030",vatRate:inv.vatRate||"11",whtCode:inv.whtCode||"",otherFees:initOtherFees}:
    {invoiceType:"Invoice",invoiceNo:"",invoiceDate:todayISO,dueDate:calcDueDate(todayISO,defaultPmtTerm),
     paymentTerms:defaultPmtTerm,poNumbers:[],companyCode:"",currency:"IDR",amount:"",
     vatRate:"11",vatBase:0,vatAmt:0,whtType:"",whtCode:"",whtBase:0,whtAmt:0,
     otherFees:[],additionalFee:0,feeCategory:"",desc:"",taxDoc:"",status:"Draft",files:[],vendorId,vendorName});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const [showPoHelp,setShowPoHelp]=useState(false);
  const [poDropOpen,setPoDropOpen]=useState(false);
  const [poSearch,setPoSearch]=useState("");
  const poRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(poRef.current&&!poRef.current.contains(e.target as Node))setPoDropOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);
  const [expanded,setExpanded]=useState(false);
  const [attRefs,setAttRefs]=useState<Record<string,string>>(inv?.attRefs||{"invoice.pdf":"","faktur_pajak.pdf":"","gr_document.pdf":""});
  const updateAttRef=(key:string,v:string)=>setAttRefs(p=>({...p,[key]:v}));
  const [poItemChecked,setPoItemChecked]=useState<Record<string,boolean>>(()=>{const o:any={};(inv?.poNumbers||[]).forEach((po:string)=>{o[po]=true;});return o;});
  const addPo=(po:string)=>{s("poNumbers",[...(f.poNumbers||[]),po]);setPoItemChecked(p=>({...p,[po]:true}));};
  const removePo=(po:string)=>{s("poNumbers",(f.poNumbers||[]).filter((x:string)=>x!==po));setPoItemChecked(p=>{const n={...p};delete n[po];return n;});};
  const removeUnchecked=()=>{const keep=(f.poNumbers||[]).filter((po:string)=>poItemChecked[po]!==false);s("poNumbers",keep);setPoItemChecked(p=>{const n:any={};keep.forEach(po=>n[po]=p[po]);return n;});};
  const autoCalcVat=(base:any,rate:string)=>Math.round(Number(base||0)*(VAT_RATES.find(r=>r.v===rate)?.r||0.11));
  const getWhtRate=(whtType:string,whtCode:string)=>(WHT_CODES[whtType]||[]).find(c=>c.v===whtCode)?.rate||0;
  const totalOtherFee=(f.otherFees||[]).reduce((s:number,r:any)=>s+Number(r.amount||0),0);
  const netBalance=Number(f.amount||0)+Number(f.vatAmt||0)+totalOtherFee-Number(f.whtAmt||0);
  const FIXED_ATT=[{key:"invoice.pdf",label:"Invoice",placeholder:"INV/AXX/2026/001"},{key:"faktur_pajak.pdf",label:"Faktur Pajak",placeholder:"FP-00214141041"},{key:"gr_document.pdf",label:"GR Document",placeholder:"50002103"}];
  const addFile=(name:string)=>{if(!(f.files||[]).includes(name))s("files",[...(f.files||[]),name]);};
  const rmFile=(name:string)=>s("files",(f.files||[]).filter((x:string)=>x!==name));
  const addFeeRow=()=>s("otherFees",[...(f.otherFees||[]),{category:"",amount:0}]);
  const updateFee=(i:number,k:string,v:any)=>{const fees=[...(f.otherFees||[])];fees[i]={...fees[i],[k]:v};s("otherFees",fees);};
  const removeFee=(i:number)=>s("otherFees",(f.otherFees||[]).filter((_:any,j:number)=>j!==i));
  const save=draft=>{
    if(!draft&&!(f.poNumbers||[]).length){alert("Please add at least one PO Number before submitting.");return;}
    if(!draft&&!f.companyCode){alert("Please select a Company Code before submitting.");return;}
    if(!draft&&!f.taxDoc&&f.invoiceType==="Invoice"){alert("Please enter Faktur Pajak number before submitting.");return;}
    if(!draft&&(f.files||[]).length<2){alert("Please upload both Invoice PDF and Faktur Pajak PDF before submitting.");return;}
    const dupNo=allInvoices.find(i=>i.id!==f.id&&i.invoiceNo.trim().toLowerCase()===f.invoiceNo.trim().toLowerCase());
    if(dupNo){alert(`Invoice number "${f.invoiceNo}" already exists (${dupNo.id}). Please use a unique invoice number.`);return;}
    const usedPOs=(f.poNumbers||[]).filter(po=>allInvoices.some(i=>i.id!==f.id&&(i.poNumbers||[]).includes(po)&&i.status!=="Rejected"));
    if(usedPOs.length>0){alert(`The following PO number(s) are already used in another invoice:\n${usedPOs.join(", ")}\n\nEach PO can only be referenced once across active invoices.`);return;}
    const fees=f.otherFees||[];
    const additionalFee=fees.reduce((s:number,r:any)=>s+Number(r.amount||0),0);
    const feeCategory=fees.filter((r:any)=>r.category).map((r:any)=>r.category).join(", ");
    const obj={...f,vatRate:f.vatRate,whtCode:f.whtCode,otherFees:fees,additionalFee,feeCategory,attRefs,
      status:draft?"Draft":"Submitted",id:f.id||`PI-${uid()}`,
      submittedAt:draft?null:new Date().toISOString().split("T")[0]};
    onSave(obj);
    if(!draft)addNotif?.({title:"New Invoice Submitted",desc:`${obj.vendorName} submitted invoice ${obj.invoiceNo}`,forRole:"brm",icon:"add-document",iconColor:"#0a6ed1"});
  };
  const SHdr=({children}:any)=>(
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0 10px",borderTop:`2px solid ${C.border}`,paddingTop:14}}>
      <span style={{fontSize:15,fontWeight:700,color:C.primary,letterSpacing:0.1,whiteSpace:"nowrap" as const}}>{children}</span>
      <div style={{flex:1,height:1,background:C.border}}/>
    </div>
  );
  const fixedKeys=FIXED_ATT.map(a=>a.key);
  return (
    <Modal title={isNew?"Add New Invoice":`Edit Invoice: ${inv.invoiceNo}`} onClose={onClose} width={860} expanded={expanded} onToggleExpand={()=>setExpanded(p=>!p)}>
      {/* Invoice balance strip */}
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"8px 12px",background:C.subtle,borderRadius:4,marginBottom:4,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:12,fontWeight:600,color:C.t2}}>Invoice Balance:</div>
        <div style={{fontSize:15,fontWeight:700,color:netBalance>=0?C.ok:C.err,fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(netBalance,f.currency||"IDR")}</div>
        <div style={{flex:1,fontSize:11,color:C.t2}}>Check: invoice amount consistent with Item (PO Invoice amount + VAT Amount + Other Fee)</div>
      </div>

      {/* GENERAL INFORMATION */}
      <SHdr>General Information</SHdr>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}>
        <div>
          <Lbl>Document Type *</Lbl>
          <Sel value={f.invoiceType} onChange={v=>s("invoiceType",v)} opts={[{v:"Invoice",l:"Invoice"},{v:"Supplier DPR",l:"Down Payment Request"}]}/>
          <div style={{fontSize:10,color:"#c87941",marginTop:2}}>{f.invoiceType==="Supplier DPR"?"📡 Routes to SAP BPA Down Payment workflow":"📡 Indonesian vendor · SAP Flexible Workflow"}</div>
        </div>
        <div>
          <Lbl>Company Code *</Lbl>
          <Sel value={f.companyCode} onChange={v=>{const term=(VENDORS[vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===v)?.zterm||f.paymentTerms;setF(p=>({...p,companyCode:v,paymentTerms:term,dueDate:calcDueDate(p.invoiceDate,term)}));}} opts={[{v:"",l:"— Select Company Code —"},...allowedCCs.map(c=>({v:c.v,l:`${c.v} – ${c.l}`}))]}/>
          <div style={{fontSize:10,color:C.t2,marginTop:2}}>📡 SAP CDS: I_CompanyCode</div>
        </div>
        <div>
          <Lbl>Currency *</Lbl>
          <Sel value={f.currency} onChange={v=>s("currency",v)} opts={CURRENCIES.map(c=>({v:c.v,l:c.l}))}/>
          <div style={{fontSize:10,color:C.t2,marginTop:2}}>📡 SAP API: I_Currency</div>
        </div>
        <div><Lbl>Invoice Date *</Lbl><Ui5DatePicker value={f.invoiceDate} onChange={v=>{if(v&&f.paymentTerms)setF(p=>({...p,invoiceDate:v,dueDate:calcDueDate(v,p.paymentTerms)}));else s("invoiceDate",v);}}/></div>
        <div><Lbl>Invoice Number *</Lbl><Inp value={f.invoiceNo} onChange={v=>s("invoiceNo",v)} placeholder="INV/XXX/2025/001"/></div>
        <div>
          <Lbl>Terms of Payment *</Lbl>
          <Sel value={f.paymentTerms||""} onChange={v=>setF(p=>({...p,paymentTerms:v,dueDate:calcDueDate(p.invoiceDate,v)}))} opts={[{v:"",l:"— Select Payment Terms —"},...PAYMENT_TERMS.map(p=>({v:p.v,l:`${p.v} – ${p.l}`}))]}/>
          <div style={{fontSize:10,color:C.t2,marginTop:2}}>📡 SAP CDS: I_PaymentTerms</div>
        </div>
        <div>
          <Lbl>Due Date (auto-calculated)</Lbl>
          <div style={{padding:"0 10px",height:36,background:C.subtle,border:`1px solid ${C.border}`,borderRadius:2,fontSize:13,color:f.dueDate?C.t1:C.t2,display:"flex",alignItems:"center"}}>
            {f.dueDate?fmtDate(f.dueDate):<span style={{fontStyle:"italic"}}>Select Invoice Date and Terms of Payment</span>}
          </div>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <Lbl>Invoice Amount *</Lbl>
          <AmtInp value={f.amount} onChange={v=>{const base=Number(v||0);const vat=autoCalcVat(base,f.vatRate);setF(p=>({...p,amount:v,vatBase:base,vatAmt:vat,whtBase:base,whtAmt:p.whtType?Math.round(base*(getWhtRate(p.whtType,p.whtCode)/100)):0}));}}/>
        </div>
      </div>

      {/* PURCHASING DOCUMENT REFERENCE */}
      <SHdr>Purchasing Document Reference</SHdr>
      <div style={{marginBottom:8}} ref={poRef}>
        <Lbl>Purchasing Document *</Lbl>
        <div>
          <div style={{display:"flex",border:`1px solid ${poDropOpen?C.primary:C.border}`,borderRadius:2,background:C.field,minHeight:38}}>
            <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:4,padding:"4px 8px",alignContent:"flex-start",minHeight:34}}>
              {(f.poNumbers||[]).map((po,i)=>(
                <span key={i} style={{display:"inline-flex",alignItems:"center",background:"#f2f4f5",border:"1px solid #8a9bb0",borderRadius:4,padding:"2px 6px",fontSize:12,gap:4,lineHeight:"18px",color:C.t1,maxWidth:200}}>
                  <span style={{fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{po}</span>
                  <button onClick={e=>{e.stopPropagation();removePo(po);}} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:11,padding:0,lineHeight:1,flexShrink:0}}>✕</button>
                </span>
              ))}
              <input value={poSearch} onChange={e=>setPoSearch(e.target.value)} onFocus={()=>setPoDropOpen(true)}
                placeholder={(f.poNumbers||[]).length===0?"Search or select PO numbers...":""}
                style={{border:"none",background:"none",outline:"none",fontSize:13,color:C.t1,padding:"4px 0",minWidth:160,flex:1,fontFamily:"inherit"}}/>
            </div>
            <button onClick={()=>{setShowPoHelp(true);setPoDropOpen(false);}} title="Value Help (F4)" style={{padding:"0 12px",background:C.subtle,border:"none",borderLeft:`1px solid ${C.border}`,cursor:"pointer",fontSize:11,color:C.t1,fontWeight:700,letterSpacing:0.5,whiteSpace:"nowrap" as const}}>⊞ F4</button>
          </div>
          {poDropOpen&&(()=>{
            const byCC=f.companyCode?MOCK_POS.filter(p=>p.companyCode===f.companyCode):MOCK_POS;
            const avail=byCC.filter(p=>!(f.poNumbers||[]).includes(p.v)&&(!poSearch||p.v.includes(poSearch)||p.desc.toLowerCase().includes(poSearch.toLowerCase())));
            return(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 4px 4px",boxShadow:"0 4px 12px rgba(0,0,0,0.12)",maxHeight:220,overflowY:"auto",marginBottom:4}}>
                {!f.companyCode&&<div style={{padding:"8px 14px",background:"#fef6ee",borderBottom:`1px solid ${C.border}`,fontSize:12,color:"#c87941"}}>Select a Company Code to filter available POs.</div>}
                {avail.length===0?<div style={{padding:"12px 14px",color:C.t2,fontSize:13,fontStyle:"italic"}}>No available POs{poSearch?` matching "${poSearch}"`:f.companyCode?` for ${f.companyCode}`:""}.</div>:
                avail.map((po,idx)=>(
                  <div key={po.v} onMouseDown={e=>{e.preventDefault();addPo(po.v);setPoSearch("");}}
                    style={{padding:"8px 14px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"center",background:idx%2===0?C.card:C.subtle}}>
                    <span style={{fontFamily:"monospace",fontWeight:700,color:C.primary,fontSize:13,minWidth:90}}>{po.v}</span>
                    <span style={{fontSize:13,color:C.t1,flex:1}}>{po.desc}</span>
                    <span style={{fontSize:12,color:C.t2,minWidth:80,textAlign:"right" as const,fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(po.amount,po.currency)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 SAP API: A_PurchaseOrder · Type to search, or press <strong>⊞ F4</strong> for full value help dialog</div>
      </div>
      {(f.poNumbers||[]).length>0&&(
        <div style={{marginBottom:4}}>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
            <Btn v="danger" sm onClick={removeUnchecked}>Remove Unchecked</Btn>
          </div>
          <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:4}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:900}}>
              <thead>
                <tr style={{background:"#e8f1fb"}}>
                  <th style={{padding:"7px 9px",width:36,borderBottom:"1px solid #c0d4ed"}}>
                    <input type="checkbox" title="Select all"
                      checked={(f.poNumbers||[]).every((po:string)=>poItemChecked[po]!==false)}
                      onChange={e=>{const v=e.target.checked;setPoItemChecked(p=>{const n={...p};(f.poNumbers||[]).forEach((po:string)=>{n[po]=v;});return n;});}}
                      style={{cursor:"pointer"}}/>
                  </th>
                  {["Purchasing Document","PO Item","Material Code","Material Desc","PO Quant","UOM","Unit Amount","PO Amount","GR Amount","DP Amount","Invoicable Amount","Invoice Amount"].map(h=>(
                    <th key={h} style={{padding:"7px 9px",fontWeight:700,color:"#0854a0",textAlign:"left",whiteSpace:"nowrap" as const,borderBottom:"1px solid #c0d4ed",fontSize:12}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(f.poNumbers||[]).map((po:string,pi:number)=>{
                  const m=getMockPoItem(po);
                  const checked=poItemChecked[po]!==false;
                  return(
                  <tr key={pi} style={{background:checked?(pi%2===0?C.card:C.subtle):"#fff8f8",opacity:checked?1:0.65}}>
                    <td style={{padding:"7px 9px",textAlign:"center"}}>
                      <input type="checkbox" checked={checked}
                        onChange={e=>setPoItemChecked(p=>({...p,[po]:e.target.checked}))}
                        style={{cursor:"pointer"}}/>
                    </td>
                    <td style={{padding:"7px 9px",fontFamily:"monospace",fontSize:13,color:C.primary,fontWeight:600}}>{po}</td>
                    <td style={{padding:"7px 9px",color:C.t2,textAlign:"center"}}>{m.item}</td>
                    <td style={{padding:"7px 9px",color:C.t2,fontFamily:"monospace",fontSize:12}}>{m.matCode}</td>
                    <td style={{padding:"7px 9px",color:C.t1}}>{m.matDesc}</td>
                    <td style={{padding:"7px 9px",color:C.t2,textAlign:"right"}}>{m.qty.toLocaleString()}</td>
                    <td style={{padding:"7px 9px",color:C.t2}}>{m.uom}</td>
                    <td style={{padding:"7px 9px",color:C.t2,textAlign:"right",fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(m.unitAmt,f.currency||"IDR")}</td>
                    <td style={{padding:"7px 9px",color:C.t2,textAlign:"right",fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(m.poAmt,f.currency||"IDR")}</td>
                    <td style={{padding:"7px 9px",color:C.t2,textAlign:"right",fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(m.grAmt,f.currency||"IDR")}</td>
                    <td style={{padding:"7px 9px",color:m.dpAmt>0?C.gold:C.t2,textAlign:"right",fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(m.dpAmt,f.currency||"IDR")}</td>
                    <td style={{padding:"7px 9px",color:C.primary,textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(m.invAmt,f.currency||"IDR")}</td>
                    <td style={{padding:"5px 7px",minWidth:110}}><AmtInp value="" onChange={()=>{}}/></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{padding:"4px 8px",background:C.subtle,fontSize:10,color:C.t2,borderTop:`1px solid ${C.border}`}}>Invoicable Amount = GR Amount – DP Amount · Uncheck a row and click "Remove Unchecked" to exclude it from this invoice</div>
          </div>
        </div>
      )}

      {/* TAX INFORMATION */}
      <SHdr>Tax Information</SHdr>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 16px"}}>
        <div>
          <Lbl>VAT Base Amount</Lbl>
          <AmtInp value={f.vatBase} onChange={v=>{const vat=autoCalcVat(v,f.vatRate);s("vatBase",v);s("vatAmt",vat);}}/>
        </div>
        <div>
          <Lbl>VAT Rate</Lbl>
          <Sel value={f.vatRate||"11"} onChange={v=>{const vat=autoCalcVat(f.vatBase,v);s("vatRate",v);s("vatAmt",vat);}} opts={VAT_RATES.map(r=>({v:r.v,l:r.l}))}/>
        </div>
        <div>
          <Lbl>VAT Amount (auto)</Lbl>
          <div style={{padding:"0 10px",height:36,background:C.subtle,border:`1px solid ${C.border}`,borderRadius:2,fontSize:13,color:C.t1,display:"flex",alignItems:"center",fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(f.vatAmt||0,f.currency||"IDR")}</div>
        </div>
        <div>
          <Lbl>WHT Type</Lbl>
          <Sel value={f.whtType||""} onChange={v=>{const first=(WHT_CODES[v]||[])[0];const rate=first?.rate||0;const whtAmt=Math.round(Number(f.whtBase||0)*(rate/100));setF(p=>({...p,whtType:v,whtCode:first?.v||"",whtAmt}));}} opts={WHT_TYPES}/>
          <div style={{fontSize:10,color:C.t2,marginTop:2}}>📡 SAP API: WithholdingTaxType</div>
        </div>
        <div>
          <Lbl>WHT Code</Lbl>
          <Sel value={f.whtCode||""} onChange={v=>{const rate=(WHT_CODES[f.whtType]||[]).find((c:any)=>c.v===v)?.rate||0;const whtAmt=Math.round(Number(f.whtBase||0)*(rate/100));setF(p=>({...p,whtCode:v,whtAmt}));}} opts={[{v:"",l:"— None —"},...(WHT_CODES[f.whtType]||[]).map(c=>({v:c.v,l:c.l}))]}/>
          <div style={{fontSize:10,color:C.t2,marginTop:2}}>📡 SAP API: WithholdingTaxCode</div>
        </div>
        <div>
          <Lbl>WHT Rate (auto)</Lbl>
          <div style={{padding:"0 10px",height:36,background:C.subtle,border:`1px solid ${C.border}`,borderRadius:2,fontSize:13,color:C.t1,display:"flex",alignItems:"center"}}>{f.whtType?(getWhtRate(f.whtType,f.whtCode)||0)+"%":"—"}</div>
        </div>
        <div>
          <Lbl>WHT Base Amount</Lbl>
          <AmtInp value={f.whtBase} onChange={v=>{const rate=getWhtRate(f.whtType,f.whtCode);const whtAmt=Math.round(Number(v||0)*(rate/100));setF(p=>({...p,whtBase:v,whtAmt}));}}/>
        </div>
        <div>
          <Lbl>WHT Amount (auto)</Lbl>
          <div style={{padding:"0 10px",height:36,background:C.subtle,border:`1px solid ${C.border}`,borderRadius:2,fontSize:13,color:C.t1,display:"flex",alignItems:"center",fontVariantNumeric:"tabular-nums" as const}}>{fmtAmt(f.whtAmt||0,f.currency||"IDR")}</div>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <Lbl>Faktur Pajak (Tax Doc No.) {f.invoiceType==="Invoice"?"*":""}</Lbl>
          <Inp value={f.taxDoc} onChange={v=>s("taxDoc",v)} placeholder="FP-010.000-25.00000001"/>
        </div>
      </div>

      {/* OTHER FEE */}
      <SHdr>Other Fee</SHdr>
      {(f.otherFees||[]).length===0&&<div style={{fontSize:12,color:C.t2,marginBottom:8}}>No other fees added.</div>}
      {(f.otherFees||[]).length>0&&(
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8,fontSize:13,border:`1px solid ${C.border}`,borderRadius:4}}>
          <thead>
            <tr style={{background:C.subtle}}>
              <th style={{padding:"5px 10px",fontWeight:700,fontSize:11,color:C.t2,textAlign:"left",borderBottom:`1px solid ${C.border}`}}>Fee Category</th>
              <th style={{padding:"5px 10px",fontWeight:700,fontSize:11,color:C.t2,textAlign:"right",borderBottom:`1px solid ${C.border}`}}>Fee Amount</th>
              <th style={{width:40,borderBottom:`1px solid ${C.border}`}}/>
            </tr>
          </thead>
          <tbody>
            {(f.otherFees||[]).map((row:any,i:number)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"4px 6px"}}>
                  <Sel value={row.category||""} onChange={v=>updateFee(i,"category",v)} opts={[{v:"",l:"— Select Category —"},{v:"Stamp Duty Fee",l:"Stamp Duty Fee"},{v:"Admin Fee",l:"Admin Fee"},{v:"Interest / Penalty Fee",l:"Interest / Penalty Fee"}]}/>
                </td>
                <td style={{padding:"4px 6px"}}><AmtInp value={row.amount||0} onChange={v=>updateFee(i,"amount",v)}/></td>
                <td style={{padding:"4px 6px",textAlign:"center"}}><button onClick={()=>removeFee(i)} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:13,padding:"0 4px"}}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Btn v="neutral" sm onClick={addFeeRow}>+ Add Fee</Btn>

      {/* ATTACHMENT */}
      <SHdr>Attachment</SHdr>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8,border:`1px solid ${C.border}`,borderRadius:4,fontSize:13}}>
        <thead>
          <tr style={{background:C.subtle}}>
            <th style={{padding:"5px 10px",fontWeight:700,fontSize:11,color:C.t2,textAlign:"left",borderBottom:`1px solid ${C.border}`}}>Document</th>
            <th style={{padding:"5px 10px",fontWeight:700,fontSize:11,color:C.t2,textAlign:"left",borderBottom:`1px solid ${C.border}`}}>Reference No.</th>
            <th style={{padding:"5px 10px",fontWeight:700,fontSize:11,color:C.t2,textAlign:"center",borderBottom:`1px solid ${C.border}`}}>Upload</th>
          </tr>
        </thead>
        <tbody>
          {FIXED_ATT.map(att=>{
            const uploaded=(f.files||[]).includes(att.key);
            return(
              <tr key={att.key} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"6px 10px",fontWeight:600,color:C.t1,whiteSpace:"nowrap" as const}}>{att.label}</td>
                <td style={{padding:"4px 6px"}}>
                  <Inp value={attRefs[att.key]||""} onChange={v=>updateAttRef(att.key,v)} placeholder={att.placeholder}/>
                </td>
                <td style={{padding:"6px 10px",textAlign:"center",whiteSpace:"nowrap" as const}}>
                  {uploaded
                    ?<span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:C.ok}}>
                        <SapIcon name="accept" size={12} color={C.ok}/>{att.key}
                        <button onClick={()=>rmFile(att.key)} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:11,padding:0}}>✕</button>
                      </span>
                    :<Btn v="neutral" sm onClick={()=>addFile(att.key)}>Upload</Btn>}
                </td>
              </tr>
            );
          })}
          {(f.files||[]).filter((fn:string)=>!fixedKeys.includes(fn)).map((fn:string,i:number)=>(
            <tr key={fn} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"6px 10px",color:C.t2,fontStyle:"italic"}}>Additional</td>
              <td style={{padding:"6px 10px",color:C.t1,fontSize:12,fontFamily:"monospace"}}>{fn}</td>
              <td style={{padding:"6px 10px",textAlign:"center"}}><button onClick={()=>rmFile(fn)} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:12}}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* NOTES */}
      <SHdr>Notes</SHdr>
      <div style={{marginBottom:14}}><TA value={f.desc} onChange={v=>s("desc",v)} placeholder="Description of goods / services" rows={3}/></div>

      {/* BUTTONS */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <Btn v="neutral" onClick={onClose}>Cancel</Btn>
        <Btn v="ghost" onClick={()=>save(true)}>Save as Draft</Btn>
        <Btn v="primary" onClick={()=>save(false)}>Submit Invoice</Btn>
      </div>
      {showPoHelp&&<PoValueHelp values={f.poNumbers||[]} companyCode={f.companyCode||""} onConfirm={pns=>{s("poNumbers",pns);setShowPoHelp(false);}} onClose={()=>setShowPoHelp(false)}/>}
    </Modal>
  );
};

// ── PDF Preview Components ─────────────────────────────────────
export const InvoiceDoc = ({inv}) => {
  const vd=VENDORS[inv.vendorId]||{};
  const net=Number(inv.amount||0)+Number(inv.vatAmt||0)-Number(inv.whtAmt||0);
  const rows=[["Amount",fmtAmt(inv.amount,inv.currency)],["VAT Base Amount",fmtAmt(inv.vatBase||0,inv.currency)],["VAT Amount (PPN 11%)",fmtAmt(inv.vatAmt||0,inv.currency)],
    ...(inv.whtType?[[WHT_TYPES.find(w=>w.v===inv.whtType)?.l||inv.whtType,""],["WHT Base Amount",fmtAmt(inv.whtBase||0,inv.currency)],["WHT Amount","("+fmtAmt(inv.whtAmt||0,inv.currency)+")"]]:[])] ;
  return (
    <div style={{fontFamily:"Arial,sans-serif",fontSize:11,color:"#222",lineHeight:1.55}}>
      <div style={{display:"flex",justifyContent:"space-between",paddingBottom:10,borderBottom:"2px solid #0070F2",marginBottom:14}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#0070F2"}}>PRE-INVOICE</div><div style={{fontSize:9,color:"#aaa",marginTop:2}}>{inv.id}</div></div>
        <div style={{textAlign:"right",fontSize:10}}><div style={{fontWeight:700,fontSize:12}}>{inv.invoiceNo}</div><div>Date: {fmtDate(inv.invoiceDate)}</div><div>Due: {fmtDate(inv.dueDate)}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12,padding:"8px 10px",background:"#f5f5f5",borderRadius:4,fontSize:10}}>
        <div><div style={{fontWeight:700,fontSize:9,color:"#888",textTransform:"uppercase",marginBottom:3}}>From (Vendor)</div><div style={{fontWeight:600}}>{inv.vendorName}</div><div style={{color:"#666",fontSize:9}}>{vd.addr}</div><div>NPWP: {vd.tax}</div></div>
        <div><div style={{fontWeight:700,fontSize:9,color:"#888",textTransform:"uppercase",marginBottom:3}}>Bill To</div><div style={{fontWeight:600}}>{ccName(inv.companyCode)}</div><div style={{color:"#666"}}>Code: {inv.companyCode}</div><div>PO: {fmtPOs(inv)}</div></div>
      </div>
      <div style={{padding:"6px 10px",background:"#EBF5FB",borderLeft:"3px solid #0070F2",marginBottom:12,fontSize:10}}>{inv.desc}</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,marginBottom:10}}><tbody>
        {rows.map(([l,v],i)=><tr key={i} style={{background:i%2?"#f9f9f9":"#fff"}}><td style={{padding:"4px 8px",borderBottom:"1px solid #ececec"}}>{l}</td><td style={{padding:"4px 8px",textAlign:"right",borderBottom:"1px solid #ececec",fontFamily:"monospace"}}>{v}</td></tr>)}
        <tr style={{background:"#0070F2",color:"#fff"}}><td style={{padding:"6px 8px",fontWeight:700}}>Net Payable</td><td style={{padding:"6px 8px",textAlign:"right",fontWeight:700,fontFamily:"monospace"}}>{fmtAmt(net,inv.currency)}</td></tr>
      </tbody></table>
      <div style={{fontSize:9,color:"#aaa",display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:"1px solid #e0e0e0"}}><span>Faktur Pajak: {inv.taxDoc||"—"}</span><span>BRM Vendor Portal</span></div>
    </div>
  );
};
export const FakturDoc = ({inv}) => {
  const vd=VENDORS[inv.vendorId]||{};
  return (
    <div style={{fontFamily:"Arial,sans-serif",fontSize:11,color:"#222",lineHeight:1.55}}>
      <div style={{textAlign:"center",borderBottom:"2px solid #222",paddingBottom:10,marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:800,letterSpacing:1}}>FAKTUR PAJAK</div>
        <div style={{fontSize:9,color:"#888",marginTop:2}}>Kode dan Nomor Seri Faktur Pajak</div>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:2,marginTop:3}}>{inv.taxDoc||"—"}</div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12,fontSize:10}}><tbody>
        {[["Nama PKP Penjual",inv.vendorName,true],["NPWP Penjual",vd.tax||"—",false],["Alamat Penjual",vd.addr||"—",false]].map(([l,v,b])=>(
          <tr key={l}><td style={{padding:"3px 0",color:"#888",width:150}}>{l}</td><td>: <span style={{fontWeight:b?700:400}}>{v}</span></td></tr>
        ))}
        <tr><td colSpan={2} style={{padding:"4px 0",borderTop:"1px solid #ddd"}}></td></tr>
        {[["Nama Pembeli",ccName(inv.companyCode),true],["Kode Perusahaan",inv.companyCode,false],["Tanggal Faktur",fmtDate(inv.invoiceDate),false]].map(([l,v,b])=>(
          <tr key={l}><td style={{padding:"3px 0",color:"#888",width:150}}>{l}</td><td>: <span style={{fontWeight:b?700:400}}>{v}</span></td></tr>
        ))}
      </tbody></table>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12,fontSize:10}}>
        <thead><tr style={{background:"#f0f0f0"}}><th style={{padding:"4px 8px",border:"1px solid #ccc",textAlign:"left",width:30}}>No.</th><th style={{padding:"4px 8px",border:"1px solid #ccc"}}>BKP / Jasa Kena Pajak</th><th style={{padding:"4px 8px",border:"1px solid #ccc",textAlign:"right"}}>Harga</th></tr></thead>
        <tbody><tr><td style={{padding:"4px 8px",border:"1px solid #ccc"}}>1</td><td style={{padding:"4px 8px",border:"1px solid #ccc"}}>{inv.desc}</td><td style={{padding:"4px 8px",border:"1px solid #ccc",textAlign:"right",fontFamily:"monospace"}}>{fmtAmt(inv.vatBase||inv.amount||0,inv.currency)}</td></tr></tbody>
      </table>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,fontSize:10,marginBottom:16}}>
        <div style={{display:"flex",gap:20}}><span style={{color:"#888"}}>Dasar Pengenaan Pajak (DPP)</span><span style={{fontFamily:"monospace"}}>{fmtAmt(inv.vatBase||0,inv.currency)}</span></div>
        <div style={{display:"flex",gap:20,fontWeight:700,borderTop:"1px solid #333",paddingTop:4}}><span>PPN (11%)</span><span style={{fontFamily:"monospace"}}>{fmtAmt(inv.vatAmt||0,inv.currency)}</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,fontSize:9,color:"#888",textAlign:"center",borderTop:"1px solid #ddd",paddingTop:10}}>
        <div>Pembeli<br/><br/><br/>________________<br/>{ccName(inv.companyCode)}</div>
        <div>{inv.vendorName}<br/><br/><br/>________________<br/>Kuasa Penjual</div>
      </div>
      <div style={{textAlign:"center",fontSize:9,color:"#aaa",marginTop:10,paddingTop:6,borderTop:"1px solid #ececec"}}>Diterbitkan melalui BRM Vendor Portal</div>
    </div>
  );
};
export const PdfViewer = ({filename,inv,onClose}) => {
  const isFaktur=filename.toLowerCase().includes("faktur");
  const dl=()=>{
    const txt=isFaktur
      ?`FAKTUR PAJAK\nNo: ${inv.taxDoc||"—"}\nPenjual: ${inv.vendorName}\nNPWP: ${VENDORS[inv.vendorId]?.tax||"—"}\nPembeli: ${ccName(inv.companyCode)}\nDPP: ${fmtAmt(inv.vatBase||0,inv.currency)}\nPPN: ${fmtAmt(inv.vatAmt||0,inv.currency)}`
      :`PRE-INVOICE\nNo: ${inv.invoiceNo}\nDate: ${fmtDate(inv.invoiceDate)}\nFrom: ${inv.vendorName}\nTo: ${ccName(inv.companyCode)}\nPO: ${fmtPOs(inv)}\nAmount: ${fmtAmt(inv.amount,inv.currency)}\nNet: ${fmtAmt(Number(inv.amount||0)+Number(inv.vatAmt||0)-Number(inv.whtAmt||0),inv.currency)}`;
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain"}));a.download=filename.replace(".pdf",".txt");a.click();
  };
  const print=()=>{
    const el=document.getElementById("bvp-pdf-doc");if(!el)return;
    const w=window.open("","_blank","width=720,height=900");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;padding:32px;color:#222;font-size:11px}table{width:100%;border-collapse:collapse}td,th{padding:4px 8px}@media print{body{padding:16px}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();setTimeout(()=>{w.focus();w.print();},400);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100,padding:16}}>
      <div style={{background:C.card,borderRadius:8,width:680,maxWidth:"95vw",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 16px 48px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:`1px solid ${C.border}`,background:C.subtle,borderRadius:"8px 8px 0 0",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,fontWeight:700,color:C.t1,display:"flex",alignItems:"center",gap:6}}><SapIcon name="document" size={14} color={C.t1}/>{filename}</span>
            <span style={{fontSize:10,color:C.t2,padding:"1px 8px",border:`1px solid ${C.border}`,borderRadius:10}}>Demo Preview</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Btn v="ghost" sm onClick={print}>Print</Btn>
            <Btn v="primary" sm onClick={dl}>Download</Btn>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.t2,lineHeight:1,marginLeft:4}}>✕</button>
          </div>
        </div>
        <div style={{background:"#d8d8d8",padding:20,flex:1,overflowY:"auto"}}>
          <div id="bvp-pdf-doc" style={{background:"#fff",maxWidth:540,margin:"0 auto",padding:mob()?"20px 16px":"36px 44px",boxShadow:"0 2px 14px rgba(0,0,0,0.18)"}}>
            {isFaktur?<FakturDoc inv={inv}/>:<InvoiceDoc inv={inv}/>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Document Flow ─────────────────────────────────────────────
export const DocFlow = ({inv}) => {
  const seed = str => { let h=5381; for(const c of str) h=((h<<5)+h^c.charCodeAt(0))>>>0; return h; };
  const n5   = h => String(h%100000).padStart(5,"0");
  const pos  = inv.poNumbers?.length ? inv.poNumbers : inv.poNumber ? [inv.poNumber] : [];

  const chains = pos.map(po => {
    const h = seed(po);
    return {po, prNo:`1000${n5(h)}`, sqNo:h%3!==2?`1800${n5(h+7)}`:null, grNos:Array.from({length:(h%2)+1},(_,i)=>`5000${n5(h+(i+1)*53)}`)};
  });

  const sapAccNo = ["Posted","Converted to Invoice","Cleared"].includes(inv.status) ? `${inv.sapDocNo||`5100${n5(seed(inv.id))}/2025`}` : null;
  const invSt    = ["Confirmed","Posted","Converted to Invoice","Cleared"].includes(inv.status) ? "Posted" : inv.status==="Rejected" ? "Rejected" : "In Process";
  const isCleared = inv.status==="Cleared";

  const allPRs = chains.map(c=>c.prNo);
  const allSQs = chains.map(c=>c.sqNo).filter(Boolean);
  const allPOs = pos;
  const allGRs = chains.flatMap(c=>c.grNos);

  // Phase lanes matching SAP Process Flow: Purchasing / Receiving / Invoicing / Accounting / Clearing
  const PHASES = [
    {
      id:"purchasing", label:"Purchasing", ico:"cart",
      docs:[
        ...allPRs.map(d=>({type:"Purchase Requisition",no:d,status:"Completed",qty:null,postDate:"2025-04-10"})),
        ...allSQs.map(d=>({type:"Supplier Quotation",no:d,status:"Completed",qty:null,postDate:"2025-04-18"})),
        ...allPOs.map(d=>({type:"Purchase Order",no:d,status:"Active",qty:`1 LUM`,postDate:"2025-05-01"})),
      ],
    },
    {
      id:"receiving", label:"Receiving", ico:"shipping-status",
      docs: allGRs.map((d,i)=>({type:"Goods Receipt",no:d,status:"Posted",qty:`${(0.5+i*0.1).toFixed(3)} LUM`,postDate:"2025-05-20"})),
    },
    {
      id:"invoicing", label:"Invoicing", ico:"document-text",
      docs:[{type:"Invoice Receipt",no:inv.id,status:invSt,qty:null,postDate:inv.submittedAt||inv.invoiceDate||""}],
    },
    {
      id:"accounting", label:"Accounting", ico:"accounting-document-verification",
      docs: sapAccNo?[{type:"Journal Entry",no:sapAccNo,status:"Posted",qty:null,postDate:inv.postedAt||""}]:[],
    },
    {
      id:"clearing", label:"Clearing", ico:"complete",
      docs: isCleared&&inv.clearingDocNo?[{type:"Clearing Entry",no:inv.clearingDocNo,status:"Posted",qty:null,postDate:""}]:[],
    },
  ];

  // status styling — matches SAP Fiori: green=Posted/Completed, blue=Active/InProcess, red=Rejected, orange=warn
  const stColor = (s:string) => s==="Posted"||s==="Completed"?"#107e3e":s==="Active"||s==="In Process"?"#0070f2":s==="Rejected"?"#bb0000":"#e9730c";
  const stBgCol = (s:string) => s==="Posted"||s==="Completed"?"#f1fdf6":s==="Active"||s==="In Process"?"#e8f4fd":s==="Rejected"?"#fdf3f3":"#fef6ee";
  const stIcon  = (s:string) => s==="Posted"||s==="Completed"?"✓":s==="Rejected"?"✕":"●";
  const stLabel = (s:string) => s==="In Process"?"In Process":s;

  // Phase circle: gray if no docs yet (future), green if all done, blue if active
  const phaseColor = (ph:any) => {
    if(ph.docs.length===0)return"#899898";
    const done = ph.docs.every((d:any)=>d.status==="Posted"||d.status==="Completed");
    const active = ph.docs.some((d:any)=>d.status==="Active"||d.status==="In Process");
    return done?"#107e3e":active?"#0070f2":"#899898";
  };

  return (
    <>
      <Sep/>
      <div style={{fontSize:11,color:C.t2,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:1,marginBottom:4}}>Document Flow</div>
      <div style={{fontSize:10,color:C.t2,marginBottom:12,display:"flex",alignItems:"center",gap:4}}>
        <SapIcon name="connected" size={11} color={C.t2}/> SAP S/4HANA — procurement chain from request to invoice posting
      </div>

      <div style={{overflowX:"auto",paddingBottom:4}}>
        <div style={{minWidth:"max-content"}}>

          {/* ── Phase header row ── */}
          <div style={{display:"flex",alignItems:"center",marginBottom:16}}>
            {PHASES.map((ph,i)=>(
              <React.Fragment key={ph.id}>
                <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",minWidth:120}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:phaseColor(ph),display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 0 3px ${phaseColor(ph)}33`}}>
                    <SapIcon name={ph.ico} size={18} color="#fff"/>
                  </div>
                  <div style={{fontSize:11,fontWeight:600,color:C.t1,marginTop:6,textAlign:"center" as const}}>{ph.label}</div>
                </div>
                {i<PHASES.length-1&&(
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:20,color:"#899898",fontSize:14,fontWeight:700,letterSpacing:2,minWidth:32}}>›&thinsp;›&thinsp;›</div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Document cards row ── */}
          <div style={{display:"flex",alignItems:"flex-start"}}>
            {PHASES.map((ph,pi)=>(
              <React.Fragment key={ph.id}>
                <div style={{minWidth:120,display:"flex",flexDirection:"column" as const,gap:6}}>
                  {ph.docs.map((doc:any,di:number)=>{
                    const sc=stColor(doc.status); const sbg=stBgCol(doc.status);
                    return(
                      <div key={di} style={{
                        background:C.card,
                        border:`1px solid ${C.border}`,
                        borderLeft:`3px solid ${sc}`,
                        borderRadius:4,
                        padding:"8px 10px",
                        boxShadow:"0 1px 3px rgba(0,0,0,0.08)",
                        fontSize:11,
                        width:112,
                      }}>
                        <div style={{fontWeight:700,color:C.t1,fontSize:11,marginBottom:2,lineHeight:1.3}}>{doc.type}</div>
                        <div style={{fontFamily:"monospace",fontSize:9,color:C.primary,marginBottom:5,wordBreak:"break-all" as const}}>{doc.no}</div>
                        <div style={{display:"inline-flex",alignItems:"center",gap:3,background:sbg,borderRadius:10,padding:"1px 6px",marginBottom:doc.qty||doc.postDate?4:0}}>
                          <span style={{fontSize:9,fontWeight:800,color:sc}}>{stIcon(doc.status)}</span>
                          <span style={{fontSize:9,fontWeight:600,color:sc}}>{stLabel(doc.status)}</span>
                        </div>
                        {doc.qty&&<div style={{fontSize:9,color:C.t2,marginBottom:1}}>Quantity: <span style={{color:C.t1}}>{doc.qty}</span></div>}
                        {doc.postDate&&<div style={{fontSize:9,color:C.t2}}>Posting Date: <span style={{color:C.t1}}>{fmtDate(doc.postDate)}</span></div>}
                      </div>
                    );
                  })}
                </div>
                {pi<PHASES.length-1&&(
                  <div style={{minWidth:32,flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:1,color:"#c0c0c0",fontSize:9,fontWeight:700,letterSpacing:1}}>
                      <div style={{width:0,height:0,borderTop:"4px solid transparent",borderBottom:"4px solid transparent",borderLeft:"6px solid #c0c0c0"}}/>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>

      {pos.length>1&&(
        <div style={{fontSize:11,color:C.info,marginTop:10,padding:"6px 10px",background:C.infoBg,borderRadius:4,border:`1px solid ${C.info}44`,display:"flex",alignItems:"center",gap:6}}>
          <SapIcon name="message-information" size={13} color={C.info}/>
          This invoice covers {pos.length} PO references with {allGRs.length} Goods Receipts across all lines.
        </div>
      )}
    </>
  );
};

// ── SAP Multi-Value Input (sap.m.MultiInput) ───────────────────
export type Cond = {op:string,v1:string,v2:string};
export const INCL_OPS = ["contains","equal to","between","starts with","ends with","less than","less than or equal to","greater than","greater than or equal to","empty"];
export const EXCL_OPS = ["does not contain","not equal to","not between","does not start with","does not end with","not less than","not less than or equal to","not greater than","not greater than or equal to","not empty"];
export const NUM_INCL_OPS = ["equal to","between","less than","less than or equal to","greater than","greater than or equal to","empty"];
export const NUM_EXCL_OPS = ["not equal to","not between","not less than","not less than or equal to","not greater than","not greater than or equal to","not empty"];
export const NO_VAL_OPS  = new Set(["empty","not empty"]);
export const BETWEEN_OPS = new Set(["between","not between"]);

export const evalCond = (val:string, c:Cond):boolean => {
  const v=val.toLowerCase(), c1=c.v1.toLowerCase(), c2=c.v2.toLowerCase();
  switch(c.op){
    case "contains":                return v.includes(c1);
    case "equal to":                return v===c1;
    case "between":                 return v>=c1&&v<=c2;
    case "starts with":             return v.startsWith(c1);
    case "ends with":               return v.endsWith(c1);
    case "less than":               return v<c1;
    case "less than or equal to":   return v<=c1;
    case "greater than":            return v>c1;
    case "greater than or equal to":return v>=c1;
    case "empty":                   return !val.trim();
    case "does not contain":        return !v.includes(c1);
    case "not equal to":            return v!==c1;
    case "not between":             return !(v>=c1&&v<=c2);
    case "does not start with":     return !v.startsWith(c1);
    case "does not end with":       return !v.endsWith(c1);
    case "not less than":           return !(v<c1);
    case "not less than or equal to":return !(v<=c1);
    case "not greater than":        return !(v>c1);
    case "not greater than or equal to":return !(v>=c1);
    case "not empty":               return !!val.trim();
    default: return true;
  }
};
export const evalNumCond = (num:number, c:Cond):boolean => {
  const n1=parseFloat(c.v1), n2=parseFloat(c.v2);
  switch(c.op){
    case "equal to":                 return num===n1;
    case "not equal to":             return num!==n1;
    case "less than":                return num<n1;
    case "less than or equal to":    return num<=n1;
    case "greater than":             return num>n1;
    case "greater than or equal to": return num>=n1;
    case "between":                  return num>=n1&&num<=n2;
    case "not between":              return !(num>=n1&&num<=n2);
    case "empty":                    return false;
    case "not empty":                return true;
    default: return true;
  }
};

export const condLabel = (c:Cond):string => {
  if(NO_VAL_OPS.has(c.op)) return c.op;
  if(BETWEEN_OPS.has(c.op)) return `${c.op} ${c.v1} and ${c.v2}`;
  return `${c.op==="contains"||c.op==="equal to"?"":c.op+" "}${c.v1}`;
};

export const DefineConditionsModal = ({title,conditions,onSave,onClose,numeric}:{title:string,conditions:Cond[],onSave:(c:Cond[])=>void,onClose:()=>void,numeric?:boolean}) => {
  const inclOps=numeric?NUM_INCL_OPS:INCL_OPS;
  const exclOps=numeric?NUM_EXCL_OPS:EXCL_OPS;
  const [conds,setConds]=useState<Cond[]>([...conditions]);
  const [op,setOp]=useState(numeric?"equal to":"contains");
  const [v1,setV1]=useState("");
  const [v2,setV2]=useState("");
  const [pasteInput,setPasteInput]=useState("");
  const noVal=NO_VAL_OPS.has(op);
  const isBetween=BETWEEN_OPS.has(op);

  const addCond = (extraConds?:Cond[]) => {
    if(extraConds){setConds(p=>[...p,...extraConds]);return;}
    setConds(p=>[...p,{op,v1:noVal?"":v1.trim(),v2:isBetween?v2.trim():""}]);
    setV1("");setV2("");
  };

  const handleV1Paste=(e:any)=>{
    const text=e.clipboardData?.getData("text")||"";
    const lines=text.split(/[\n\r]+/).map((s:string)=>s.trim()).filter(Boolean);
    if(lines.length>1){
      e.preventDefault();
      addCond(lines.map((l:string)=>({op,v1:l,v2:""})));
    }
  };

  const handlePasteInput=(e:any)=>{
    const text=e.clipboardData?.getData("text")||"";
    const lines=text.split(/[\n\r]+/).map((s:string)=>s.trim()).filter(Boolean);
    if(lines.length>0){
      e.preventDefault();
      addCond(lines.map((l:string)=>({op:"equal to",v1:l,v2:""})));
      setPasteInput("");
    }
  };

  const inpStyle:any={
    flex:1,padding:"5px 8px",fontSize:14,fontFamily:"inherit",color:C.t1,
    border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,outline:"none",
    boxSizing:"border-box" as const,
  };
  const opSelStyle:any={
    padding:"5px 8px",fontSize:14,fontFamily:"inherit",color:C.info,
    border:`1px solid ${C.info}`,borderRadius:2,background:C.field,outline:"none",
    minWidth:200,cursor:"pointer",
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.4)"}}>
      <div style={{background:C.card,borderRadius:4,boxShadow:"0 8px 32px rgba(0,0,0,0.22)",resize:"both",overflow:"hidden",width:700,minWidth:480,minHeight:420,maxWidth:"95vw",maxHeight:"92vh",display:"flex",flexDirection:"column",fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:C.t1}}>Define Conditions: {title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,padding:"0 4px",lineHeight:1}}>×</button>
        </div>
        {/* Body — scrollable */}
        <div style={{flex:1,overflow:"auto",padding:16}}>
          {/* Operator + value row — wraps on narrow widths */}
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
            <select value={op} onChange={e=>setOp(e.target.value)} style={opSelStyle}>
              <optgroup label="Include" style={{fontWeight:700,color:C.t1}}>
                {inclOps.map(o=><option key={o} value={o}>{o}</option>)}
              </optgroup>
              <optgroup label="Exclude" style={{fontWeight:700,color:C.t1}}>
                {exclOps.map(o=><option key={o} value={o}>{o}</option>)}
              </optgroup>
            </select>

            {!noVal&&(
              <input style={{...inpStyle,minWidth:100}} value={v1} onChange={e=>setV1(e.target.value)}
                onPaste={handleV1Paste}
                onKeyDown={e=>{if(e.key==="Enter")addCond();}}
                placeholder="Value" aria-label="Value"/>
            )}
            {isBetween&&(
              <>
                <span style={{fontSize:13,color:C.t2,flexShrink:0}}>and</span>
                <input style={{...inpStyle,minWidth:100}} value={v2} onChange={e=>setV2(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCond();}}
                  placeholder="Value" aria-label="Second Value"/>
              </>
            )}
            {!noVal&&(
              <button onClick={()=>{setV1("");setV2("");}}
                style={{background:"none",border:"none",color:C.info,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1,flexShrink:0}}>
                ×
              </button>
            )}
            <button onClick={()=>addCond()}
              style={{background:C.card,border:`1px solid ${C.primaryDk}`,color:C.primaryDk,borderRadius:4,padding:"5px 14px",fontSize:13,fontFamily:"inherit",fontWeight:600,cursor:"pointer",flexShrink:0}}>
              Add Condition
            </button>
          </div>

          <div style={{minHeight:160,border:`1px solid ${C.border}`,borderRadius:2,padding:12,marginBottom:12,background:C.card,overflowY:"auto"}}>
            {conds.length===0?(
              <div style={{color:C.info,fontSize:14,padding:"8px 0"}}>No Conditions Selected</div>
            ):(
              conds.map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderBottom:i<conds.length-1?`1px solid ${C.border}`:"none",fontSize:13,color:C.t1}}>
                  <span style={{color:C.t2,minWidth:180,fontSize:12,fontStyle:"italic"}}>{c.op}</span>
                  <span style={{flex:1,fontWeight:NO_VAL_OPS.has(c.op)?400:600}}>
                    {NO_VAL_OPS.has(c.op)?"—":BETWEEN_OPS.has(c.op)?`${c.v1}  –  ${c.v2}`:c.v1}
                  </span>
                  <button onClick={()=>setConds(p=>p.filter((_,j)=>j!==i))}
                    style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>
                </div>
              ))
            )}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <input value={pasteInput} onChange={e=>setPasteInput(e.target.value)}
              onPaste={handlePasteInput}
              placeholder="Paste multiple values here (one per line = one condition each)"
              style={{...inpStyle,fontSize:12,color:C.t2}}/>
            {pasteInput&&(
              <button onClick={()=>setPasteInput("")}
                style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1,flexShrink:0}}>×</button>
            )}
          </div>
        </div>
        {/* Footer */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:12,color:C.t2}}>{conds.length>0?`${conds.length} condition${conds.length!==1?"s":""} defined`:""}</span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose}
              style={{background:C.card,border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"6px 20px",fontSize:14,fontFamily:"inherit",cursor:"pointer"}}>
              Cancel
            </button>
            <button onClick={()=>onSave(conds)}
              style={{background:C.primary,border:`1px solid ${C.primary}`,color:"#fff",borderRadius:4,padding:"6px 20px",fontSize:14,fontFamily:"inherit",fontWeight:600,cursor:"pointer"}}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MultiValueInp = ({fieldTitle,conditions,onChange,numeric}:{fieldTitle:string,conditions:Cond[],onChange:(c:Cond[])=>void,numeric?:boolean}) => {
  const [showModal,setShowModal]=useState(false);
  const [quickVal,setQuickVal]=useState("");
  const defaultOp=numeric?"equal to":"contains";

  const addQuick=()=>{
    if(!quickVal.trim()) return;
    onChange([...conditions,{op:defaultOp,v1:quickVal.trim(),v2:""}]);
    setQuickVal("");
  };

  const handlePaste=(e:any)=>{
    const text=e.clipboardData?.getData("text")||"";
    const lines=text.split(/[\n\r]+/).map((s:string)=>s.trim()).filter(Boolean);
    if(lines.length>1){
      e.preventDefault();
      onChange([...conditions,...lines.map((l:string)=>({op:defaultOp,v1:l,v2:""}))]);
      setQuickVal("");
    }
  };

  return(
    <>
      <div style={{
        display:"flex",flexWrap:"wrap",alignItems:"center",gap:4,
        border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,
        minHeight:34,padding:"3px 30px 3px 6px",position:"relative",
        boxSizing:"border-box" as const,cursor:"text",
      }}
        onClick={e=>{(e.currentTarget.querySelector("input") as HTMLInputElement)?.focus();}}>

        {conditions.map((c,i)=>(
          <span key={i} style={{
            display:"inline-flex",alignItems:"center",gap:3,
            background:C.selection,border:`1px solid ${C.info}44`,borderRadius:4,
            padding:"1px 4px 1px 6px",fontSize:11,color:C.info,
            lineHeight:1.6,flexShrink:0,maxWidth:160,overflow:"hidden",
          }}>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {condLabel(c)}
            </span>
            <button onClick={e=>{e.stopPropagation();onChange(conditions.filter((_,j)=>j!==i));}}
              style={{background:"none",border:"none",color:C.info,cursor:"pointer",fontSize:13,padding:"0 1px",lineHeight:1,flexShrink:0}}>×</button>
          </span>
        ))}

        <input
          type="text"
          value={quickVal}
          onChange={e=>setQuickVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")addQuick();}}
          onPaste={handlePaste}
          placeholder={conditions.length===0?(numeric?"e.g. 100000000":"INV/MJB/2025/001"):""}
          aria-haspopup="dialog"
          aria-roledescription="Multi Value Input"
          style={{
            flex:1,minWidth:60,border:"none",outline:"none",
            background:"transparent",fontSize:14,padding:0,
            fontFamily:"inherit",color:C.t1,
          }}/>

        <button
          onClick={e=>{e.stopPropagation();setShowModal(true);}}
          title="Define Conditions"
          style={{
            position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",
            background:"none",border:"none",cursor:"pointer",
            color:C.t2,padding:"2px 3px",lineHeight:1,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
          <SapIcon name="value-help" size={16} color="#6a6d70"/>
        </button>
      </div>

      {showModal&&(
        <DefineConditionsModal
          title={fieldTitle}
          conditions={conditions}
          onSave={c=>{onChange(c);setShowModal(false);}}
          onClose={()=>setShowModal(false)}
          numeric={numeric}/>
      )}
    </>
  );
};

// ── Invoice Status Icon (matches RFQ Management style) ─────────
const InvoiceStatusIcon = ({s}) => {
  const map:Record<string,{shape:string,color:string}> = {
    "Draft":               {shape:"square",  color:"#8c8c8c"},
    "Submitted":           {shape:"square",  color:"#0070F2"},
    "Under Review":        {shape:"triangle",color:"#E9730C"},
    "Confirmed":           {shape:"circle",  color:"#188918"},
    "Posted":              {shape:"circle",  color:"#0070F2"},
    "Converted to Invoice":{shape:"circle",  color:"#188918"},
    "Cleared":             {shape:"circle",  color:"#188918"},
    "Rejected":            {shape:"square",  color:"#BB0000"},
  };
  const m = map[s]||{shape:"square",color:"#8c8c8c"};
  if(m.shape==="triangle") return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{flexShrink:0,marginTop:1}}>
      <polygon points="7,1 13,13 1,13" fill={m.color}/>
    </svg>
  );
  if(m.shape==="circle") return <div style={{width:13,height:13,borderRadius:"50%",background:m.color,flexShrink:0}}/>;
  return <div style={{width:13,height:13,borderRadius:2,background:m.color,flexShrink:0}}/>;
};

// ── Column Settings Popup ──────────────────────────────────────
const fmtInvType=(t:string)=>t==="Supplier DPR"?"Down Payment Req":(t||"Invoice");
const COL_DEFS = [
  {key:"status",       label:"Status",        defW:120},
  {key:"invoiceNo",    label:"Invoice No.",   defW:200},
  {key:"invoiceType",  label:"Invoice Type",  defW:130},
  {key:"compCode",     label:"Company Code",  defW:150},
  {key:"invDate",      label:"Invoice Date",  defW:100},
  {key:"dueDate",      label:"Due Date",      defW:100},
  {key:"pmtTerms",       label:"Payment Terms",        defW:110},
  {key:"pmtTermsStatus", label:"Payment Terms Status",  defW:140},
  {key:"totalAmt",     label:"Total Amount",    defW:130},
  {key:"vatAmt",     label:"VAT Amount",      defW:110},
  {key:"whtAmt",     label:"WHT Amount",      defW:110},
  {key:"otherFee",   label:"Other Fee Amount",defW:120},
  {key:"attach",     label:"Attachments",     defW:100},
  {key:"actions",    label:"Actions",         defW:90},
];
const ColumnSettingsPopup = ({col,x,y,sort,onSort,groupBy,onGroupBy,width,onWidth,onClose}:any) => {
  const [w,setW]=useState(width);
  const [grp,setGrp]=useState(!!groupBy);
  const clamp=(n:number)=>Math.max(48,Math.min(2560,n));
  const seg=[{title:"No Sorting",icon:"sort"},  {title:"Ascending",icon:"sort-ascending"},{title:"Descending",icon:"sort-descending"}];
  const vals=["none","asc","desc"];
  const toggleGrp=(e:any)=>{e.stopPropagation();const next=!grp;setGrp(next);onGroupBy(next);};
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:499}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left:Math.min(x,window.innerWidth-270),top:Math.min(y,window.innerHeight-320),zIndex:500,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.18)",width:260,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",fontSize:13}}>
        {/* Title */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 8px",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontWeight:700,fontSize:14,color:C.t1}}>Column Settings</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.t2,padding:"0 2px",lineHeight:1}}>×</button>
        </div>
        {/* Sort By */}
        <div style={{padding:"10px 14px 8px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Sort By</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.t1,fontSize:13}}>{col}</span>
            <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
              {seg.map((s,i)=>(
                <button key={s.title} title={s.title} onClick={()=>onSort(vals[i])}
                  style={{width:32,height:28,display:"flex",alignItems:"center",justifyContent:"center",border:"none",borderRight:i<2?`1px solid ${C.border}`:"none",cursor:"pointer",background:sort===vals[i]?C.primary:C.card,padding:0}}>
                  <SapIcon name={s.icon} size={14} color={sort===vals[i]?"#fff":C.t2}/>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{height:1,background:C.border,margin:"0 14px"}}/>
        {/* Group By */}
        <div style={{padding:"10px 14px 8px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Group By</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.t1,fontSize:13}}>{col}</span>
            <div onClick={toggleGrp} style={{width:40,height:22,borderRadius:11,background:grp?C.primary:C.border,cursor:"pointer",position:"relative",transition:"background .15s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:grp?20:3,width:16,height:16,borderRadius:"50%",background:C.card,transition:"left .15s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
            </div>
          </div>
        </div>
        <div style={{height:1,background:C.border,margin:"0 14px"}}/>
        {/* More Column Settings */}
        <div style={{padding:"10px 14px 12px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>More Column Settings</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.t1,fontSize:13}}>Resize column width (pixel)</span>
            <div style={{display:"flex",alignItems:"center",border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden",height:28}}>
              <button onClick={()=>{const n=clamp(w-1);setW(n);onWidth(n);}} style={{width:24,height:"100%",background:C.subtle,border:"none",borderRight:`1px solid ${C.border}`,cursor:"pointer",fontSize:16,color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>−</button>
              <input type="text" value={w} onChange={e=>{const n=parseInt(e.target.value)||w;setW(n);}} onBlur={()=>{const n=clamp(w);setW(n);onWidth(n);}}
                style={{width:42,textAlign:"center",border:"none",outline:"none",fontSize:13,fontFamily:"inherit",background:C.field,color:C.t1,height:"100%",padding:0}}/>
              <button onClick={()=>{const n=clamp(w+1);setW(n);onWidth(n);}} style={{width:24,height:"100%",background:C.subtle,border:"none",borderLeft:`1px solid ${C.border}`,cursor:"pointer",fontSize:16,color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>+</button>
            </div>
          </div>
        </div>
        {/* Gear icon row */}
        <div style={{padding:"4px 14px 10px",display:"flex",justifyContent:"flex-end"}}>
          <SapIcon name="action-settings" size={16} color="#6a6d70"/>
        </div>
      </div>
    </>
  );
};

// ── View Settings Dialog ───────────────────────────────────────
function ViewSettingsDialog({colDefs,hidden,onClose,onApply}:{
  colDefs:{key:string,label:string}[],hidden:Set<string>,onClose:()=>void,onApply:(h:Set<string>)=>void
}){
  const [tab,setTab]=useState("columns");
  const [search,setSearch]=useState("");
  const [draft,setDraft]=useState(new Set(hidden));
  const toggle=(key:string)=>setDraft(p=>{const n=new Set(p);n.has(key)?n.delete(key):n.add(key);return n;});
  const filtered=colDefs.filter(c=>c.label.toLowerCase().includes(search.toLowerCase()));
  const visCount=colDefs.filter(c=>!draft.has(c.key)).length;
  const TABS=["Columns","Sort","Group"];
  return(
    <Modal title="View Settings" onClose={onClose} width={480}>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
        {TABS.map(t=>{const tk=t.toLowerCase();return(
          <button key={tk} onClick={()=>setTab(tk)} style={{background:"none",border:"none",borderBottom:tab===tk?`2px solid ${C.primary}`:"2px solid transparent",cursor:"pointer",padding:"6px 16px",fontSize:13,fontWeight:tab===tk?700:400,color:tab===tk?C.primary:C.t2,fontFamily:"inherit",marginBottom:-1}}>
            {t}{tk==="columns"&&` (${visCount}/${colDefs.length})`}
          </button>
        );})}
      </div>
      {tab==="columns"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12,color:C.t2}}>{visCount} of {colDefs.length} columns visible</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search columns..."
              style={{border:`1px solid ${C.border}`,borderRadius:2,padding:"4px 8px",fontSize:12,outline:"none",fontFamily:"inherit",width:170,color:C.t1,background:C.card}}/>
          </div>
          <div style={{maxHeight:320,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:2}}>
            {filtered.map((col,i)=>(
              <label key={col.key} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",cursor:"pointer",background:i%2===0?C.subtle:C.card,borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none",fontSize:13,color:C.t1,userSelect:"none" as const}}>
                <input type="checkbox" checked={!draft.has(col.key)} onChange={()=>toggle(col.key)} style={{accentColor:C.primary,cursor:"pointer",width:14,height:14,flexShrink:0}}/>
                {col.label}
              </label>
            ))}
          </div>
        </>
      )}
      {(tab==="sort"||tab==="group")&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"32px 0",color:C.t2}}>
          <SapIcon name="table-column" size={32} color={C.t2}/>
          <span style={{fontSize:13}}>Click a column header to configure {tab} settings.</span>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
        <button onClick={()=>setDraft(new Set())} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 1rem",fontSize:13,fontFamily:"inherit",cursor:"pointer",height:32}}>Reset</button>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 1rem",fontSize:13,fontFamily:"inherit",cursor:"pointer",height:32}}>Cancel</button>
        <button onClick={()=>{onApply(draft);onClose();}} style={{background:C.primary,border:`1px solid ${C.primary}`,color:"#fff",borderRadius:4,padding:"0 1rem",fontSize:13,fontFamily:"inherit",cursor:"pointer",height:32,fontWeight:600}}>OK</button>
      </div>
    </Modal>
  );
}

// ── Group-by helpers ───────────────────────────────────────────
const GRP_KEY:Record<string,(i:any)=>string>={
  invoiceNo: i=>i.invoiceNo[0]?.toUpperCase()||"?",
  vendor:    i=>i.vendorName||i.vendorId||"Unknown",
  poNumber:  i=>fmtPOs(i)||"—",
  compCode:  i=>i.companyCode?`${i.companyCode} – ${ccName(i.companyCode)}`:"No Company Code",
  invDate:   i=>(i.invoiceDate||"").slice(0,7)||"Unknown Date",
  dueDate:   i=>(i.dueDate||"").slice(0,7)||"Unknown Due",
  amount:    i=>i.currency||"Unknown Currency",
  attach:    i=>(i.files?.length>=2)?"Attachments Complete":"Attachments Incomplete",
  status:    i=>i.status||"Unknown",
  actions:   i=>i.status||"Unknown",
  pmtTerms:  i=>i.paymentTerms||"—",
  pmtTermsStatus: i=>{const ct=(VENDORS[i.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===i.companyCode)?.zterm;return ct&&i.paymentTerms?i.paymentTerms===ct?"Compliant":"Differs":"Unknown";},
};
const GRP_ICON:Record<string,string>={
  status:"flag",compCode:"building",vendor:"employee",invDate:"calendar",dueDate:"calendar",
  amount:"currency",attach:"attachment","default":"group",
};
function buildGroups(list:any[], colGroup:Record<string,boolean>, fields:string[]):
  {mode:"flat",rows:any[]}|{mode:"grouped",key:string,groupKey:string,rows:any[]}[] {
  const activeGrp=fields.find(k=>colGroup[k]);
  if(!activeGrp)return {mode:"flat",rows:list};
  const fn=GRP_KEY[activeGrp]||(i=>String(i[activeGrp]||""));
  const order:string[]=[]; const map:Record<string,any[]>={};
  list.forEach(i=>{const k=fn(i);if(!map[k]){order.push(k);map[k]=[];}map[k].push(i);});
  return order.map(k=>({mode:"grouped" as const,key:activeGrp,groupKey:k,rows:map[k]}));
}
const GroupHeaderRow=({colSpan,label,count,icon}:any)=>(
  <tr>
    <td colSpan={colSpan} style={{padding:"0 0.75rem",height:30,background:C.subtle,borderBottom:`1px solid ${C.border}`,borderTop:`2px solid ${C.primary}`,verticalAlign:"middle"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <SapIcon name={icon||"group"} size={13} color={C.primary}/>
        <span style={{fontSize:12,fontWeight:700,color:C.primary}}>{label}</span>
        <span style={{fontSize:11,color:C.t2,marginLeft:2}}>({count} item{count!==1?"s":""})</span>
      </div>
    </td>
  </tr>
);

// ── Vendor Invoice ─────────────────────────────────────────────
const ALL_VENDOR_FILTER_FIELDS = [
  {id:"invoiceNo",    label:"Invoice No.",      defaultOn:true },
  {id:"companyCode",  label:"Company Code",     defaultOn:true },
  {id:"status",       label:"Status",           defaultOn:true },
  {id:"currency",     label:"Currency",         defaultOn:true },
  {id:"invoiceDate",  label:"Invoice Date",     defaultOn:true },
  {id:"poNumber",     label:"PO Number",        defaultOn:false},
  {id:"invoiceType",  label:"Invoice Type",     defaultOn:true},
  {id:"dueDate",      label:"Due Date",         defaultOn:false},
  {id:"amount",       label:"Amount",           defaultOn:false},
  {id:"whtType",      label:"WHT Type",         defaultOn:false},
  {id:"submittedDate",label:"Submitted Date",   defaultOn:false},
  {id:"pmtTerms",     label:"Payment Terms",     defaultOn:false},
  {id:"pmtTermsStatus",label:"Payment Terms Status",defaultOn:false},
];

// ── Vendor Invoice Detail Panel (SAP S/4HANA Supplier Invoice style) ──────────
const VendorInvoiceDetailPanel = ({view,onClose,onPdf,onEdit,onWithdraw,fullScreen,onToggleFullScreen,panelFlex}) => {
  const [activeTab,setActiveTab]=useState("general");
  const canEdit     = ["Draft","Rejected"].includes(view.status);
  const canWithdraw = view.status==="Submitted";
  const pos         = (view.poNumbers||[view.poNumber]).filter(Boolean);
  const totalAmt    = Number(view.amount||0)+Number(view.vatAmt||0)+Number(view.additionalFee||0);

  const Lbl = ({children}:any) => <div style={{fontSize:11,color:C.t2,marginBottom:2,lineHeight:1.3}}>{children}</div>;
  const Val = ({children,bold,blue}:any) => <div style={{fontSize:13,color:blue?C.primary:C.t1,fontWeight:bold?700:400,lineHeight:1.5,wordBreak:"break-word"}}>{children||"—"}</div>;
  const Sep = () => <div style={{height:1,background:C.border,margin:"10px 0"}}/>;
  const SecHdr = ({children}:any) => <div style={{fontWeight:700,fontSize:12,color:C.t1,borderBottom:`1px solid ${C.border}`,paddingBottom:6,marginBottom:12,marginTop:4}}>{children}</div>;

  const btnStyle = (active:boolean) => ({
    background:"transparent",border:"none",
    color:active?C.t1:"#bfbfbf",
    fontFamily:"'72','72full',Arial,Helvetica,sans-serif",
    fontSize:13,fontWeight:400 as const,cursor:active?"pointer":"default",
    height:36,padding:"0 10px",display:"inline-flex" as const,alignItems:"center" as const,
    gap:5,opacity:active?1:0.4,
  });

  const files = view.files||[];
  const FILE_META:Record<string,{size:string}> = {
    "invoice.pdf":      {size:"124 KB"},
    "faktur_pajak.pdf": {size:"87 KB"},
  };
  const getFileMeta = (f:string) => FILE_META[f]||{size:"—"};
  const uploadDate = view.submittedAt||view.invoiceDate||"";

  const TABS = [
    {id:"general",    label:"General Information"},
    {id:"purch",      label:"Purch. Doc. References"},
    {id:"tax",        label:"Tax"},
    {id:"attachments",label:"Attachments"},
    {id:"docflow",    label:"Document Flow"},
  ];

  return (
    <div style={{flex:panelFlex||"0 0 40%",position:"sticky",top:0,maxHeight:"100vh",display:"flex",flexDirection:"column",background:C.card,overflow:"hidden",borderLeft:`1px solid ${C.border}`,boxShadow:"-2px 0 8px rgba(0,0,0,0.06)"}}>

      {/* ── Page header: title + action buttons ── */}
      <div style={{padding:"10px 16px 0",background:C.subtle,borderBottom:"none",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:C.t1,lineHeight:1.2}}>
              {view.invoiceType==="Supplier DPR"?"Supplier DPR":"Supplier Invoice"}
            </div>
            <div style={{fontSize:12,color:C.t2,marginTop:2}}>{view.id}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
            <button style={btnStyle(canEdit)} disabled={!canEdit} onClick={()=>canEdit&&onEdit(view)}>
              <SapIcon name="edit" size={13} color={canEdit?C.t1:"#bfbfbf"}/>Edit
            </button>
            <button style={btnStyle(canWithdraw)} disabled={!canWithdraw} onClick={()=>canWithdraw&&onWithdraw(view.id)}>
              <SapIcon name="undo" size={13} color={canWithdraw?C.t1:"#bfbfbf"}/>Withdraw
            </button>
            <div style={{width:1,height:20,background:C.border,margin:"0 2px"}}/>
            <button onClick={onToggleFullScreen} title={fullScreen?"Restore":"Full Screen"} style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer"}}>
              <SapIcon name={fullScreen?"exit-full-screen":"full-screen"} size={13} color={C.t2}/>
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,padding:"0 2px"}}>×</button>
          </div>
        </div>

        {/* ── Key info strip (Gross Invoice Amount / Invoicing Party / Status / Approval) ── */}
        <div style={{display:"flex",gap:0,marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10,flexWrap:"wrap",rowGap:8}}>
          <div style={{paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <Lbl>Gross Invoice Amount</Lbl>
            <div style={{fontSize:16,fontWeight:700,color:C.t1,fontVariantNumeric:"tabular-nums"}}>{fmtAmt(totalAmt,view.currency)}</div>
          </div>
          <div style={{paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <Lbl>Invoicing Party</Lbl>
            <div style={{fontSize:13,color:C.primary,fontWeight:600}}>{view.vendorName}</div>
            <div style={{fontSize:11,color:C.t2}}>{view.vendorId}</div>
          </div>
          <div style={{paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <Lbl>Invoice Status</Lbl>
            <Badge s={view.status}/>
          </div>
          <div>
            <Lbl>Document Type</Lbl>
            <Val>{view.invoiceType||"Invoice"}</Val>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{display:"flex",gap:0,marginTop:10,borderBottom:`1px solid ${C.border}`}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              background:"none",border:"none",cursor:"pointer",
              padding:"6px 12px",fontSize:12,fontFamily:"inherit",
              color:activeTab===t.id?C.primary:C.t2,
              fontWeight:activeTab===t.id?700:400,
              borderBottom:activeTab===t.id?`2px solid ${C.primary}`:"2px solid transparent",
              marginBottom:-1,whiteSpace:"nowrap" as const,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>

        {/* ── GENERAL INFORMATION ── */}
        {activeTab==="general"&&<>
          <SecHdr>Basic Data</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>Transaction</Lbl><Val>{view.invoiceType||"Invoice"}</Val></div>
            <div><Lbl>Invoice Date</Lbl><Val>{fmtDate(view.invoiceDate)}</Val></div>
            <div><Lbl>Invoicing Party</Lbl><Val blue>{view.vendorName}</Val></div>
            <div><Lbl>Company Code</Lbl><Val>{view.companyCode?`${view.companyCode} – ${ccName(view.companyCode)}`:"—"}</Val></div>
            <div><Lbl>Posting Date</Lbl><Val>{view.postedAt?fmtDate(view.postedAt):view.confirmedAt?fmtDate(view.confirmedAt):"—"}</Val></div>
            <div><Lbl>Reference</Lbl><Val>{view.invoiceNo}</Val></div>
            <div><Lbl>Gross Invoice Amount</Lbl><Val bold>{fmtAmt(totalAmt,view.currency)}</Val></div>
            <div><Lbl>Due Date</Lbl><Val>{fmtDate(view.dueDate)}</Val></div>
            <div><Lbl>Faktur Pajak</Lbl><Val>{view.taxDoc||"—"}</Val></div>
          </div>

          <SecHdr>Status &amp; Workflow</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>Invoice Status</Lbl><Badge s={view.status}/></div>
            <div><Lbl>Approval Status</Lbl><Val>{["Confirmed","Posted","Converted to Invoice","Cleared"].includes(view.status)?"Approved":["Submitted","Under Review"].includes(view.status)?"Pending":"—"}</Val></div>
            <div><Lbl>Submission Date</Lbl><Val>{view.submittedAt?fmtDate(view.submittedAt):"—"}</Val></div>
            <div><Lbl>Pre-Invoice ID</Lbl><Val>{view.id}</Val></div>
            <div><Lbl>Vendor ID</Lbl><Val>{view.vendorId}</Val></div>
            <div><Lbl>Approval Date</Lbl><Val>{view.confirmedAt?fmtDate(view.confirmedAt):"—"}</Val></div>
          </div>

          {view.status==="Rejected"&&view.rejReason&&(
            <div style={{marginBottom:12,padding:12,background:C.errBg,border:`1px solid ${C.err}44`,borderRadius:4}}>
              <div style={{fontWeight:700,fontSize:12,color:C.err,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><SapIcon name="decline" size={13} color={C.err}/>Rejection Reason</div>
              <div style={{fontSize:13,color:C.t1}}>{view.rejReason}</div>
            </div>
          )}

          <SecHdr>Notes</SecHdr>
          <div style={{fontSize:13,color:C.t1,lineHeight:1.5,marginBottom:16}}>{view.desc||"—"}</div>

          {view.sapDocNo&&(
            <div style={{padding:"10px 12px",background:"#ecf8f0",border:"1px solid #b7dfcc",borderRadius:4,display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <SapIcon name="connected" size={14} color="#107e3e"/>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#107e3e"}}>SAP Document Created</div>
                <div style={{fontSize:13,color:"#1d2d3e",fontWeight:600,fontFamily:"monospace"}}>{view.sapDocNo}</div>
                {view.postedAt&&<div style={{fontSize:11,color:"#6a6d70"}}>Posted: {fmtDate(view.postedAt)}</div>}
              </div>
            </div>
          )}
          {(view.convertedDocNo||view.clearingDocNo)&&(
            <div style={{padding:"10px 12px",background:"#dff0fd",border:"1px solid #b3d7f5",borderRadius:4,marginBottom:12}}>
              {view.convertedDocNo&&<div style={{fontSize:12,marginBottom:4}}><strong>Invoice Doc:</strong> <span style={{fontFamily:"monospace"}}>{view.convertedDocNo}</span></div>}
              {view.clearingDocNo&&<div style={{fontSize:12}}><strong>Clearing Doc:</strong> <span style={{fontFamily:"monospace"}}>{view.clearingDocNo}</span></div>}
            </div>
          )}
        </>}

        {/* ── PURCHASING DOCUMENT REFERENCES ── */}
        {activeTab==="purch"&&<>
          <SecHdr>PO Numbers</SecHdr>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {pos.length?pos.map((po:any,i:number)=>(
              <span key={i} style={{background:C.subtle,border:`1px solid ${C.border}`,borderRadius:3,padding:"3px 10px",fontSize:13,fontFamily:"monospace",color:C.t1}}>{po}</span>
            )):<span style={{fontSize:13,color:C.t2}}>—</span>}
          </div>

          {view.items&&view.items.length>0&&<>
            <SecHdr>Items ({view.items.length})</SecHdr>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:"#e8f1fb"}}>
                    {["#","Short Text / PO Item","Amount","Quantity","Tax Code","Tax Rate"].map(h=>(
                      <th key={h} style={{padding:"5px 8px",fontWeight:700,color:"#0854a0",textAlign:h==="Amount"||h==="Quantity"||h==="Tax Rate"?"right":"left",whiteSpace:"nowrap",borderBottom:"1px solid #c0d4ed",fontSize:11}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {view.items.map((item:any,idx:number)=>(
                    <tr key={idx} style={{background:idx%2===0?C.card:C.subtle}}>
                      <td style={{padding:"4px 8px",color:C.t2,fontSize:11}}>{idx+1}</td>
                      <td style={{padding:"4px 8px",color:C.t1,fontSize:11}}>
                        <div style={{fontFamily:"monospace",fontSize:10,color:C.primary}}>{item.poNo||"—"} / {item.poItem||"—"}</div>
                        <div style={{color:C.t1}}>{item.materialDesc||"—"}</div>
                      </td>
                      <td style={{padding:"4px 8px",textAlign:"right",fontVariantNumeric:"tabular-nums",fontWeight:600,color:C.t1,fontSize:11}}>{fmtAmt((item.unitPrice||0)*(item.qty||0),view.currency)}</td>
                      <td style={{padding:"4px 8px",textAlign:"right",color:C.t1,fontSize:11}}>{item.qty??""} {item.uom||""}</td>
                      <td style={{padding:"4px 8px",color:C.t2,fontSize:11}}>{item.vatCode||"—"}</td>
                      <td style={{padding:"4px 8px",textAlign:"right",color:C.t2,fontSize:11}}>11.000%(VST)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}
        </>}

        {/* ── TAX ── */}
        {activeTab==="tax"&&<>
          <SecHdr>Tax Information</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>VAT Base Amount</Lbl><Val>{fmtAmt(view.vatBase||0,view.currency)}</Val></div>
            <div><Lbl>VAT Rate</Lbl><Val>{view.vatRate?view.vatRate+"%":"11%"}</Val></div>
            <div><Lbl>VAT Amount</Lbl><Val>{fmtAmt(view.vatAmt||0,view.currency)}</Val></div>
          </div>
          {view.whtType&&<>
            <SecHdr>Withholding Tax</SecHdr>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 16px",marginBottom:16}}>
              <div><Lbl>WHT Type</Lbl><Val>{WHT_TYPES.find((w:any)=>w.v===view.whtType)?.l||view.whtType}</Val></div>
              <div><Lbl>WHT Code</Lbl><Val>{view.whtCode||"—"}</Val></div>
              <div><Lbl>WHT Rate</Lbl><Val>{view.whtCode?((WHT_CODES[view.whtType]||[]).find((c:any)=>c.v===view.whtCode)?.rate||0)+"%":"—"}</Val></div>
              <div><Lbl>WHT Base Amount</Lbl><Val>{fmtAmt(view.whtBase||0,view.currency)}</Val></div>
              <div><Lbl>WHT Amount</Lbl><Val>{fmtAmt(view.whtAmt||0,view.currency)}</Val></div>
            </div>
          </>}
          <SecHdr>Financial Summary</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>Item Amount (subtotal)</Lbl><Val>{fmtAmt(view.amount,view.currency)}</Val></div>
            <div><Lbl>VAT Amount</Lbl><Val>{fmtAmt(view.vatAmt||0,view.currency)}</Val></div>
            {(view.additionalFee||0)>0&&<>
              <div><Lbl>Other Fee</Lbl><Val>{fmtAmt(view.additionalFee,view.currency)}</Val></div>
              <div><Lbl>Fee Category</Lbl><Val>{view.feeCategory||"—"}</Val></div>
            </>}
            <div><Lbl>WHT Amount</Lbl><Val>{fmtAmt(view.whtAmt||0,view.currency)}</Val></div>
            <div><Lbl>Net Payable</Lbl><Val bold blue>{fmtAmt(totalAmt-Number(view.whtAmt||0),view.currency)}</Val></div>
          </div>
          <div style={{padding:10,background:C.infoBg,borderRadius:4,fontSize:11,color:C.primary,marginTop:4}}>
            <strong>SAP Integration:</strong>{" "}
            {view.invoiceType==="Supplier DPR"
              ?<>Routes to <code>SAP Build Process Automation</code> for Down Payment workflow.</>
              :<>Calls <code>API_SUPPLIERINVOICE_PROCESS_SRV</code> → SAP Flexible Workflow for posting approval.</>}
          </div>
        </>}

        {/* ── ATTACHMENTS ── */}
        {activeTab==="attachments"&&<>
          <div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:C.subtle,borderBottom:files.length?`1px solid ${C.border}`:"none"}}>
              <span style={{fontWeight:600,fontSize:12,color:C.t1}}>Uploaded ({files.length})</span>
              {canEdit&&<span style={{fontSize:11,color:C.t2,flex:1}}>Add new files to upload:</span>}
              {!canEdit&&<span style={{flex:1}}/>}
              {canEdit&&<button style={{width:22,height:22,background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",fontSize:14,color:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>}
            </div>
            {files.length===0&&<div style={{padding:"20px",textAlign:"center",color:C.t2,fontSize:12}}>No attachments uploaded.</div>}
            {files.map((f:string,i:number)=>{
              const m=getFileMeta(f);
              return(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<files.length-1?`1px solid ${C.border}`:"none",background:C.card}}
                  onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
                  onMouseLeave={e=>(e.currentTarget.style.background=C.card)}>
                  <div style={{flexShrink:0,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:C.subtle,borderRadius:4,border:`1px solid ${C.border}`}}>
                    <SapIcon name="pdf-attachment" size={18} color={C.primary}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <button onClick={()=>onPdf(f)} style={{background:"none",border:"none",padding:0,cursor:"pointer",color:C.primary,fontSize:13,fontWeight:600,fontFamily:"inherit",textAlign:"left",display:"block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f}</button>
                    <div style={{fontSize:11,color:C.t2,marginTop:1}}>
                      Uploaded By: <span style={{color:C.t1}}>{view.vendorName||"Vendor"}</span>
                      {uploadDate&&<> · Uploaded On: <span style={{color:C.t1}}>{fmtDate(uploadDate)}</span></>}
                      {" "}· File Size: <span style={{color:C.t1}}>{m.size}</span>
                    </div>
                  </div>
                  {canEdit&&<button title="Remove" style={{width:22,height:22,background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRadius:3}}
                    onMouseEnter={e=>(e.currentTarget.style.color=C.err)}
                    onMouseLeave={e=>(e.currentTarget.style.color=C.t2)}>✕</button>}
                </div>
              );
            })}
          </div>
        </>}

        {/* ── DOCUMENT FLOW ── */}
        {activeTab==="docflow"&&<>
          <DocFlow inv={view}/>
        </>}

      </div>
    </div>
  );
};

export const VendorInvoice = ({user,invoices,setInvoices,drillInvoiceNo,onClearDrill,addNotif}:any) => {
  const [showForm,setForm]=useState(false); const [editing,setEd]=useState(null); const [view,setView]=useState(null); const [pdfView,setPdfView]=useState(null);
  const [hovRow,setHovRow]=useState<string|null>(null);
  const [split,setSplit]=useState(60); // left panel %
  const [fullScreen,setFullScreen]=useState(false);
  const containerRef=useRef<HTMLDivElement>(null);
  const onSplitterDrag=(e:React.MouseEvent)=>{
    e.preventDefault();
    const startX=e.clientX, startSplit=split;
    const containerW=containerRef.current?.offsetWidth||window.innerWidth;
    const onMove=(me:MouseEvent)=>{
      const dx=me.clientX-startX;
      setSplit(Math.min(75,Math.max(30,startSplit+(dx/containerW)*100)));
    };
    const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp);
  };
  const [selRows,setSelRows]=useState<Set<string>>(new Set());
  const [vhOpen,setVhOpen]=useState<null|"companyCode"|"status"|"currency"|"whtType">(null);
  const [colSort,setColSort]=useState<Record<string,string>>({});
  const [colWidth,setColWidth]=useState<Record<string,number>>(Object.fromEntries(COL_DEFS.map(c=>[c.key,c.defW])));
  const [colGroup,setColGroup]=useState<Record<string,boolean>>({});
  const [colMenu,setColMenu]=useState<{key:string,label:string,x:number,y:number}|null>(null);
  const [hiddenCols,setHiddenCols]=useState<Set<string>>(new Set());
  const [vsOpen,setVsOpen]=useState(false);
  const visCols=COL_DEFS.filter(c=>!hiddenCols.has(c.key));
  const [adaptOpen,setAdaptOpen]=useState(false);
  const [visibleFields,setVisibleFields]=useState<Set<string>>(
    new Set(ALL_VENDOR_FILTER_FIELDS.filter(f=>f.defaultOn).map(f=>f.id))
  );
  const emptyF={
    invoiceNoConds:[] as Cond[],companyCodes:[] as string[],statuses:[] as string[],currencies:[] as string[],
    dateFrom:"",dateTo:"",
    poNumbers:[] as string[],invoiceTypes:[] as string[],
    dueDateFrom:"",dueDateTo:"",
    amountConds:[] as Cond[],
    whtTypes:[] as string[],
    submittedFrom:"",submittedTo:"",
    pmtTerms:[] as string[],
    pmtTermsStatus:[] as string[],
  };
  const [draft,setDraft]=useState({...emptyF}); const [active,setActive]=useState({...emptyF});
  useEffect(()=>{if(drillInvoiceNo){const c={op:"equal to",v1:drillInvoiceNo,v2:""};setDraft(p=>({...p,invoiceNoConds:[c]}));setActive(p=>({...p,invoiceNoConds:[c]}));onClearDrill?.();}}, [drillInvoiceNo]);
  const [expanded,setExpanded]=useState<Set<string>>(new Set());
  const [allExpanded,setAllExpanded]=useState(false);
  const toggleExpanded=(id:string)=>setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const sd=(k,v)=>setDraft(p=>({...p,[k]:v}));
  const go=()=>setActive({...draft});
  const reset=()=>{setDraft({...emptyF});setActive({...emptyF});};
  const clr=k=>{
    const dateKeys:Record<string,string[]>={dateRange:["dateFrom","dateTo"],dueDateRange:["dueDateFrom","dueDateTo"],submittedDate:["submittedFrom","submittedTo"]};
    if(dateKeys[k]){const [a,b]=dateKeys[k];setActive(p=>({...p,[a]:"", [b]:""}));setDraft(p=>({...p,[a]:"", [b]:""}));}
    else if(k==="invoiceNoConds"){setActive(p=>({...p,invoiceNoConds:[]}));setDraft(p=>({...p,invoiceNoConds:[]}));}
    else{setActive(p=>({...p,[k]:[]}));setDraft(p=>({...p,[k]:[]}));}
  };
  const v=VENDORS[user.vendorId];
  const exportCSV=()=>{
    const rows=selRows.size>0?mine.filter(i=>selRows.has(i.id)):mine;
    if(rows.length===0){alert("No invoices to export.");return;}
    const esc=(s:any)=>{const t=String(s??'');return t.includes(',')||t.includes('"')||t.includes('\n')?`"${t.replace(/"/g,'""')}"`:t;};
    const hdr=["Pre-Invoice ID","Invoice No.","Company Code","Invoice Date","Due Date","PO Numbers","Currency","Amount","VAT Base","VAT Amount","WHT Type","WHT Amount","Net Amount","Status","Description","Vendor ID","Vendor Name"];
    const data=rows.map(i=>[i.id,i.invoiceNo,i.companyCode,i.invoiceDate,i.dueDate,fmtPOs(i),i.currency,i.amount,i.vatBase,i.vatAmt,i.whtType,i.whtAmt,Number(i.amount||0)+Number(i.vatAmt||0)-Number(i.whtAmt||0),i.status,i.desc,i.vendorId,i.vendorName].map(esc).join(","));
    const csv=[hdr.join(","),...data].join("\r\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    a.download=`invoices_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();URL.revokeObjectURL(a.href);
  };
  const assignedCCs=(VENDORS[user.vendorId]?.lfb1||[]).map((r:any)=>r.bukrs);
  const mineFiltered=invoices.filter(i=>i.vendorId===user.vendorId&&(assignedCCs.length===0||assignedCCs.includes(i.companyCode))).filter(i=>
    (active.invoiceNoConds.length===0||active.invoiceNoConds.some(c=>evalCond(i.invoiceNo,c)))&&
    (active.statuses.length===0||active.statuses.includes(i.status))&&
    (active.companyCodes.length===0||active.companyCodes.includes(i.companyCode))&&
    (active.currencies.length===0||active.currencies.includes(i.currency))&&
    (!active.dateFrom||i.invoiceDate>=active.dateFrom)&&
    (!active.dateTo||i.invoiceDate<=active.dateTo)&&
    (active.poNumbers.length===0||active.poNumbers.some(p=>(i.poNumbers||[i.poNumber]).includes(p)))&&
    (active.invoiceTypes.length===0||active.invoiceTypes.includes(i.invoiceType||"Invoice"))&&
    (!active.dueDateFrom||i.dueDate>=active.dueDateFrom)&&
    (!active.dueDateTo||i.dueDate<=active.dueDateTo)&&
    (active.amountConds.length===0||active.amountConds.every(c=>evalNumCond(Number(i.amount),c)))&&
    (active.whtTypes.length===0||active.whtTypes.includes(i.whtType||""))&&
    (!active.submittedFrom||(i.submittedAt&&i.submittedAt>=active.submittedFrom))&&
    (!active.submittedTo||(i.submittedAt&&i.submittedAt<=active.submittedTo))&&
    (active.pmtTerms.length===0||active.pmtTerms.includes(i.paymentTerms||""))&&
    (active.pmtTermsStatus.length===0||(()=>{const ct=(VENDORS[i.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===i.companyCode)?.zterm;const ok=ct&&i.paymentTerms?i.paymentTerms===ct:null;const st=ok===null?"unknown":ok?"compliant":"differs";return active.pmtTermsStatus.includes(st);})())
  );
  const SORT_FIELDS:Record<string,(i:any)=>any>={
    invoiceNo:i=>i.invoiceNo, poNumber:i=>fmtPOs(i), compCode:i=>i.companyCode,
    invDate:i=>i.invoiceDate, dueDate:i=>i.dueDate, amount:i=>Number(i.amount||0),
    attach:i=>i.files?.length||0, status:i=>i.status, actions:i=>i.status,
    pmtTerms:i=>i.paymentTerms||"",
    pmtTermsStatus:i=>{const ct=(VENDORS[i.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===i.companyCode)?.zterm;return ct&&i.paymentTerms?i.paymentTerms===ct?"Compliant":"Differs":"Unknown";},
  };
  const activeSort=Object.entries(colSort).find(([,v])=>v!=="none");
  const mine=[...mineFiltered].sort((a,b)=>{
    if(!activeSort)return 0;
    const [key,dir]=activeSort;
    const fn=SORT_FIELDS[key]||(()=>"");
    const va=fn(a),vb=fn(b);
    const cmp=typeof va==="number"?va-vb:String(va).localeCompare(String(vb));
    return dir==="asc"?cmp:-cmp;
  });
  const tokens=[
    active.invoiceNoConds.length>0&&{label:"Invoice No.",val:active.invoiceNoConds.length===1?condLabel(active.invoiceNoConds[0]):`${active.invoiceNoConds.length} conditions`,onClear:()=>clr("invoiceNoConds")},
    active.statuses.length>0&&{label:"Status",val:active.statuses.length===1?active.statuses[0]:`${active.statuses.length} selected`,onClear:()=>clr("statuses")},
    active.companyCodes.length>0&&{label:"Company Code",val:active.companyCodes.length===1?`${active.companyCodes[0]} – ${ccName(active.companyCodes[0])}`:`${active.companyCodes.length} selected`,onClear:()=>clr("companyCodes")},
    active.currencies.length>0&&{label:"Currency",val:active.currencies.length===1?active.currencies[0]:`${active.currencies.length} selected`,onClear:()=>clr("currencies")},
    (active.dateFrom||active.dateTo)&&{label:"Invoice Date",val:[active.dateFrom&&fmtDate(active.dateFrom),active.dateTo&&fmtDate(active.dateTo)].filter(Boolean).join(" – "),onClear:()=>clr("dateRange")},
    active.poNumbers.length>0&&{label:"PO Number",val:active.poNumbers.join(", "),onClear:()=>clr("poNumbers")},
    active.invoiceTypes.length>0&&{label:"Invoice Type",val:active.invoiceTypes.map(fmtInvType).join(", "),onClear:()=>clr("invoiceTypes")},
    (active.dueDateFrom||active.dueDateTo)&&{label:"Due Date",val:[active.dueDateFrom&&fmtDate(active.dueDateFrom),active.dueDateTo&&fmtDate(active.dueDateTo)].filter(Boolean).join(" – "),onClear:()=>clr("dueDateRange")},
    active.amountConds.length>0&&{label:"Amount",val:active.amountConds.length===1?condLabel(active.amountConds[0]):`${active.amountConds.length} conditions`,onClear:()=>clr("amountConds")},
    active.whtTypes.length>0&&{label:"WHT Type",val:active.whtTypes[0],onClear:()=>clr("whtTypes")},
    (active.submittedFrom||active.submittedTo)&&{label:"Submitted Date",val:[active.submittedFrom&&fmtDate(active.submittedFrom),active.submittedTo&&fmtDate(active.submittedTo)].filter(Boolean).join(" – "),onClear:()=>clr("submittedDate")},
    active.pmtTerms.length>0&&{label:"Payment Terms",val:active.pmtTerms.join(", "),onClear:()=>clr("pmtTerms")},
    active.pmtTermsStatus.length>0&&{label:"Pmt Terms Status",val:active.pmtTermsStatus.map(s=>s==="compliant"?"Compliant":s==="differs"?"Differs":"Unknown").join(", "),onClear:()=>clr("pmtTermsStatus")},
  ].filter(Boolean);
  const save=obj=>{setInvoices(p=>p.find(i=>i.id===obj.id)?p.map(i=>i.id===obj.id?obj:i):[...p,obj]);setForm(false);setEd(null);};
  const withdraw=id=>{if(window.confirm("Withdraw this invoice? Status will return to Draft."))setInvoices(p=>p.map(i=>i.id===id?{...i,status:"Draft",submittedAt:null}:i));};
  const toggleSel=(id)=>setSelRows(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const allSel=mine.length>0&&selRows.size===mine.length;
  const toggleAll=()=>setSelRows(allSel?new Set():new Set(mine.map(i=>i.id)));

  const TK={
    hdrBg:C.subtle,      hdrBorder:C.border,    hdrText:C.t2,
    rowBg:C.card,        rowBorder:C.border,     rowText:C.t1,
    hovBg:C.hover,       selBg:C.selection,
    link:C.primary,      linkHov:C.primaryDk,
    footerBg:C.subtle,   footerText:C.t1,
    toolbarBg:C.card,
  };
  const FS={base:14,sm:12,xs:11};

  return (
    <div ref={containerRef} style={{display:"flex",alignItems:"flex-start",fontFamily:"'72','72full',Arial,Helvetica,sans-serif",overflow:"hidden"}}>
      <div style={{flex:view&&!fullScreen?`0 0 ${split}%`:"1",padding:mob()?"12px 10px":"20px 24px",overflowX:"hidden",minWidth:0,transition:"flex 0.15s ease",display:fullScreen?"none":"block"}}>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:20,fontWeight:700,color:C.t1,letterSpacing:0.1}}>Invoice Management</div>
        <div style={{fontSize:FS.sm,color:C.t2,marginTop:3,display:"flex",alignItems:"center",gap:5}}>
          <SapIcon name="connected" size={12} color={C.t2}/>
          Pre-Invoice → Custom CDS Table → SAP Supplier Invoice API (on BRM confirmation) → Flexible Workflow
        </div>
      </div>

      <FioriBar activeTokens={tokens} onGo={go} onReset={reset} onAdaptFilters={()=>setAdaptOpen(true)} adaptFiltersCount={visibleFields.size}>
        {visibleFields.has("invoiceNo")&&<FField label="Invoice No."><MultiValueInp fieldTitle="Invoice No." conditions={draft.invoiceNoConds} onChange={v=>sd("invoiceNoConds",v)}/></FField>}
        {visibleFields.has("companyCode")&&<FField label="Company Code">
          <ValueHelpInp selected={draft.companyCodes} getLabel={k=>`${k} – ${ccName(k)}`} onOpen={()=>setVhOpen("companyCode")} placeholder="All Company Codes"/>
        </FField>}
        {visibleFields.has("status")&&<FField label="Status">
          <ValueHelpInp selected={draft.statuses} getLabel={k=>k} onOpen={()=>setVhOpen("status")} placeholder="All Statuses"/>
        </FField>}
        {visibleFields.has("currency")&&<FField label="Currency">
          <ValueHelpInp selected={draft.currencies} getLabel={k=>k} onOpen={()=>setVhOpen("currency")} placeholder="All Currencies"/>
        </FField>}
        {visibleFields.has("invoiceDate")&&<FField label="Invoice Date Range"><DateRangePicker from={draft.dateFrom} to={draft.dateTo} onChange={(f,t)=>{sd("dateFrom",f);sd("dateTo",t);}}/></FField>}
        {visibleFields.has("poNumber")&&<FField label="PO Number"><Inp value={draft.poNumbers[0]||""} onChange={e=>setDraft(d=>({...d,poNumbers:e?[e]:[]}))} placeholder="e.g. 4500001234"/></FField>}
        {visibleFields.has("invoiceType")&&<FField label="Invoice Type"><InvTypeMultiComboBox value={draft.invoiceTypes} onChange={v=>setDraft(d=>({...d,invoiceTypes:v}))}/></FField>}
        {visibleFields.has("dueDate")&&<FField label="Due Date Range"><DateRangePicker from={draft.dueDateFrom} to={draft.dueDateTo} onChange={(f,t)=>{setDraft(d=>({...d,dueDateFrom:f,dueDateTo:t}));}}/></FField>}
        {visibleFields.has("amount")&&<FField label="Amount"><MultiValueInp fieldTitle="Gross Invoice Amount" conditions={draft.amountConds} onChange={v=>setDraft(d=>({...d,amountConds:v}))} numeric/></FField>}
        {visibleFields.has("whtType")&&<FField label="WHT Type"><ValueHelpInp selected={draft.whtTypes} getLabel={k=>WHT_TYPES.find(w=>w.v===k)?.l||k} onOpen={()=>setVhOpen("whtType")} placeholder="All WHT Types"/></FField>}
        {visibleFields.has("submittedDate")&&<FField label="Submitted Date"><div style={{display:"flex",gap:4}}><DateInp value={draft.submittedFrom} onChange={v=>setDraft(d=>({...d,submittedFrom:v}))}/><DateInp value={draft.submittedTo} onChange={v=>setDraft(d=>({...d,submittedTo:v}))}/></div></FField>}
        {visibleFields.has("pmtTerms")&&<FField label="Payment Terms"><Sel value={draft.pmtTerms[0]||""} onChange={v=>setDraft(d=>({...d,pmtTerms:v?[v]:[]}))} opts={[{v:"",l:"All Payment Terms"},...PAYMENT_TERMS.map(p=>({v:p.v,l:`${p.v} – ${p.l}`}))]}/></FField>}
        {visibleFields.has("pmtTermsStatus")&&<FField label="Pmt Terms Status"><Sel value={draft.pmtTermsStatus[0]||""} onChange={v=>setDraft(d=>({...d,pmtTermsStatus:v?[v]:[]}))} opts={[{v:"",l:"All Statuses"},{v:"compliant",l:"Compliant"},{v:"differs",l:"Differs"},{v:"unknown",l:"Unknown"}]}/></FField>}
      </FioriBar>

      {vhOpen==="companyCode"&&(
        <ValueHelpDialog title="Company Code"
          cols={[{key:"v",label:"Company...",width:80},{key:"l",label:"Company Name",width:200},{key:"ctrl",label:"Controlling...",width:100},{key:"city",label:"City",width:100},{key:"country",label:"Country/Reg...",width:90},{key:"currency",label:"Currency",width:80},{key:"lang",label:"Language...",width:80},{key:"chart",label:"Chart of",width:70}]}
          rows={COMPANY_CODES.filter(c=>assignedCCs.length===0||assignedCCs.includes(c.v))} keyField="v" labelField="l"
          selected={draft.companyCodes}
          onConfirm={s=>{sd("companyCodes",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="status"&&(
        <ValueHelpDialog title="Status"
          cols={[{key:"v",label:"Status",width:160},{key:"desc",label:"Description",width:260}]}
          rows={[{v:"Draft",desc:"Invoice saved but not submitted"},{v:"Submitted",desc:"Awaiting BRM review"},{v:"Under Review",desc:"BRM is reviewing the invoice"},{v:"Confirmed",desc:"Invoice approved by BRM"},{v:"Rejected",desc:"Invoice rejected by BRM"}]}
          keyField="v" labelField="v"
          selected={draft.statuses}
          onConfirm={s=>{sd("statuses",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="currency"&&(
        <ValueHelpDialog title="Currency"
          cols={[{key:"v",label:"Currency Key",width:120},{key:"l",label:"Description",width:300}]}
          rows={CURRENCIES} keyField="v" labelField="l"
          selected={draft.currencies}
          onConfirm={s=>{sd("currencies",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="whtType"&&(
        <ValueHelpDialog title="WHT Type"
          cols={[{key:"v",label:"WHT Code",width:100},{key:"l",label:"Description",width:360}]}
          rows={WHT_TYPES.filter(w=>w.v)} keyField="v" labelField="l"
          selected={draft.whtTypes}
          onConfirm={s=>{setDraft(d=>({...d,whtTypes:s}));setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}

      <AdaptFiltersDialog
        open={adaptOpen}
        onClose={()=>setAdaptOpen(false)}
        visibleFields={visibleFields}
        onSave={s=>{setVisibleFields(s);setAdaptOpen(false);}}
        draft={draft}
        allFields={ALL_VENDOR_FILTER_FIELDS}
        hasValue={(id)=>{
          if(id==="invoiceNo")   return draft.invoiceNoConds.length>0;
          if(id==="companyCode") return draft.companyCodes.length>0;
          if(id==="status")      return draft.statuses.length>0;
          if(id==="currency")    return draft.currencies.length>0;
          if(id==="invoiceDate") return !!(draft.dateFrom||draft.dateTo);
          if(id==="poNumber")    return draft.poNumbers.length>0;
          if(id==="invoiceType") return draft.invoiceTypes.length>0;
          if(id==="dueDate")     return !!(draft.dueDateFrom||draft.dueDateTo);
          if(id==="amount")      return draft.amountConds.length>0;
          if(id==="whtType")     return draft.whtTypes.length>0;
          if(id==="submittedDate") return !!(draft.submittedFrom||draft.submittedTo);
          if(id==="pmtTerms")      return draft.pmtTerms.length>0;
          if(id==="pmtTermsStatus")return draft.pmtTermsStatus.length>0;
          return false;
        }}
      />

      <div style={{border:`1px solid ${TK.hdrBorder}`,background:TK.rowBg}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 0.75rem",height:44,background:TK.toolbarBg,borderBottom:`1px solid ${TK.hdrBorder}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:FS.base,fontWeight:700,color:TK.rowText}}>Invoices</span>
            <span style={{fontSize:FS.sm,color:C.t2,fontWeight:400}}>({mine.length})</span>
          </div>
          <div style={{display:"flex",gap:0,alignItems:"center"}}>
            <button onClick={()=>{if(allExpanded){setExpanded(new Set());setAllExpanded(false);}else{setExpanded(new Set(mine.map((i:any)=>i.id)));setAllExpanded(true);}}}
              style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.625rem",fontSize:FS.sm,fontFamily:"inherit",fontWeight:400,cursor:"pointer",height:36,display:"flex",alignItems:"center",gap:4}}>
              <SapIcon name={allExpanded?"collapse-all":"expand-all"} size={14} color={C.t1}/> {allExpanded?"Collapse All":"Expand All"}
            </button>
            <div style={{width:1,height:20,background:C.border,margin:"0 4px"}}/>
            <button onClick={()=>{setSelRows(new Set());setEd(null);setForm(true);}}
              style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.625rem",fontSize:FS.sm,fontFamily:"inherit",fontWeight:400,cursor:"pointer",height:36,display:"flex",alignItems:"center",gap:4}}>
              <SapIcon name="add" size={14} color={C.t1}/> Create
            </button>
            <div style={{width:1,height:20,background:C.border,margin:"0 4px"}}/>
            <button onClick={exportCSV} title={selRows.size>0?`Export ${selRows.size} selected row(s)`:"Export all filtered invoices"}
              style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.5rem",fontSize:FS.sm,fontFamily:"inherit",cursor:"pointer",height:36,display:"flex",alignItems:"center",gap:3}}>
              <SapIcon name="excel-attachment" size={16} color="#217346"/>
            </button>
            <button onClick={()=>setVsOpen(true)} title="View Settings"
              style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.5rem",fontSize:FS.sm,fontFamily:"inherit",cursor:"pointer",height:36,display:"flex",alignItems:"center"}}>
              <SapIcon name="action-settings" size={16} color={C.t2}/>
            </button>
          </div>
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:900,tableLayout:"fixed",fontSize:FS.sm}}>
            <colgroup>
              <col style={{width:32}}/>
              <col style={{width:20}}/>
              {visCols.map(c=><col key={c.key} style={{width:colWidth[c.key]}}/>)}
              <col style={{width:32}}/>
            </colgroup>

            <thead>
              <tr style={{background:TK.hdrBg,height:32}}>
                <th style={{padding:"0 0 0 10px",borderBottom:`1px solid ${TK.hdrBorder}`,textAlign:"center"}}>
                  <input type="checkbox" checked={allSel} onChange={toggleAll} style={{cursor:"pointer",width:13,height:13,accentColor:"#0854a0"}}/>
                </th>
                <th style={{borderBottom:`1px solid ${TK.hdrBorder}`,width:20}}/>

                {visCols.map((col)=>{
                  const sortVal=colSort[col.key]||"none";
                  const sortIcon=sortVal==="asc"?"▲":sortVal==="desc"?"▼":null;
                  const isRight=["totalAmt","vatAmt","whtAmt","otherFee"].includes(col.key);
                  return(
                    <th key={col.key}
                      onClick={e=>{e.stopPropagation();setColMenu(p=>p?.key===col.key?null:{key:col.key,label:col.label,x:e.clientX,y:e.clientY+4});}}
                      style={{padding:"0 0.5rem",textAlign:isRight?"right":"left",fontSize:FS.sm,fontWeight:700,color:TK.hdrText,borderBottom:`1px solid ${TK.hdrBorder}`,whiteSpace:"nowrap",userSelect:"none" as const,letterSpacing:0,cursor:"pointer",position:"relative"}}
                      title={`Click to configure ${col.label}`}>
                      {col.label}{sortIcon&&<span style={{fontSize:9,marginLeft:3,color:C.primary}}>{sortIcon}</span>}
                    </th>
                  );
                })}
                <th style={{borderBottom:`1px solid ${TK.hdrBorder}`,width:32}}/>
              </tr>
            </thead>

            <tbody>
              {mine.length===0?(
                <tr><td colSpan={visCols.length+3}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"48px 0",color:C.t2,fontSize:FS.base}}>
                    <SapIcon name="document" size={36} color={C.t2}/>
                    <span style={{fontSize:FS.base,color:C.t2}}>No items found.</span>
                  </div>
                </td></tr>
              ):((grpResult=>grpResult.mode==="flat"
                  ?grpResult.rows
                  :grpResult.flatMap((g:any)=>[{__grpHdr:true,key:g.key,groupKey:g.groupKey,count:g.rows.length},...g.rows])
                )(buildGroups(mine,colGroup,COL_DEFS.map(c=>c.key)))).map((inv:any)=>{
                if(inv.__grpHdr)return <GroupHeaderRow key={`grp-${inv.groupKey}`} colSpan={visCols.length+3} label={inv.groupKey} count={inv.count} icon={GRP_ICON[inv.key]||"group"}/>;
                const isSel=selRows.has(inv.id);
                const isHov=hovRow===inv.id;
                const rowBg=view?.id===inv.id?C.selection:isSel?C.selection:isHov?TK.hovBg:TK.rowBg;
                const cs:any={
                  padding:"0 0.5rem",height:36,
                  borderBottom:`1px solid ${TK.rowBorder}`,
                  fontSize:FS.sm,color:TK.rowText,verticalAlign:"middle",
                };
                const isExpanded=expanded.has(inv.id);
                const hasItems=inv.items&&inv.items.length>0;
                return(<React.Fragment key={inv.id}>
                  <tr
                    onMouseEnter={()=>setHovRow(inv.id)}
                    onMouseLeave={()=>setHovRow(null)}
                    style={{background:rowBg,transition:"background .08s",cursor:"default"}}>

                    <td style={{...cs,padding:"0 0 0 10px",textAlign:"center",width:32}}>
                      <input type="checkbox" checked={isSel} onChange={()=>toggleSel(inv.id)} style={{cursor:"pointer",width:13,height:13,accentColor:"#0854a0"}}/>
                    </td>
                    <td style={{...cs,padding:0,textAlign:"center",width:20}}>
                      {hasItems&&<button onClick={()=>toggleExpanded(inv.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.primary,padding:0,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",width:20,height:36}}>
                        <span style={{display:"inline-block",transition:"transform .18s",transform:isExpanded?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                      </button>}
                    </td>

                    {!hiddenCols.has("status")&&<td style={cs}><StatusTag s={inv.status}/></td>}

                    {!hiddenCols.has("invoiceNo")&&<td style={cs}>
                      <button onClick={()=>setView(inv)} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:"left",color:TK.link,fontSize:FS.sm,fontWeight:600,textDecoration:isHov?"underline":"none",lineHeight:1.5,display:"block",fontFamily:"inherit"}}>{inv.invoiceNo}</button>
                      <div style={{fontSize:FS.xs,color:C.t2,lineHeight:1.4}}>{inv.id}</div>
                    </td>}

                    {!hiddenCols.has("invoiceType")&&<td style={cs}>
                      {inv.invoiceType==="Supplier DPR"
                        ?<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#fef6ee",color:"#c87941",border:"1px solid #f5c98a",borderRadius:3,padding:"2px 7px",fontSize:FS.xs,fontWeight:700,whiteSpace:"nowrap" as const}}>Down Payment Req</span>
                        :<span style={{display:"inline-flex",alignItems:"center",gap:4,background:C.infoBg,color:C.info,border:`1px solid ${C.info}40`,borderRadius:3,padding:"2px 7px",fontSize:FS.xs,fontWeight:600,whiteSpace:"nowrap" as const}}>Invoice</span>
                      }
                    </td>}


                    {!hiddenCols.has("compCode")&&<td style={cs}>
                      <span style={{fontSize:FS.sm,fontWeight:600,color:TK.link}}>{inv.companyCode||"—"}</span>
                      <div style={{fontSize:FS.xs,color:C.t2,lineHeight:1.4}}>{ccName(inv.companyCode)}</div>
                    </td>}

                    {!hiddenCols.has("invDate")&&<td style={cs}><span style={{fontSize:FS.sm}}>{fmtDate(inv.invoiceDate)}</span></td>}
                    {!hiddenCols.has("dueDate")&&<td style={cs}><span style={{fontSize:FS.sm}}>{fmtDate(inv.dueDate)}</span></td>}
                    {!hiddenCols.has("pmtTerms")&&<td style={cs}><span style={{fontFamily:"monospace",fontWeight:600,fontSize:FS.sm}}>{inv.paymentTerms||"—"}</span></td>}
                    {!hiddenCols.has("pmtTermsStatus")&&(()=>{const ct=(VENDORS[inv.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===inv.companyCode)?.zterm;const ok=ct&&inv.paymentTerms?inv.paymentTerms===ct:null;return(<td style={cs}>{ok===null?<span style={{color:C.t2,fontSize:FS.sm}}>—</span>:ok?<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#107e3e",fontSize:FS.sm}}><SapIcon name="accept" size={13} color="#107e3e"/>Compliant</span>:<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#df6e0c",fontSize:FS.sm}}><SapIcon name="alert" size={13} color="#df6e0c"/>Differs ({ct})</span>}</td>);})()}

                    {!hiddenCols.has("totalAmt")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtAmt((inv.amount||0)+(inv.vatAmt||0)+(inv.additionalFee||0),inv.currency)}</span>
                    </td>}
                    {!hiddenCols.has("vatAmt")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontVariantNumeric:"tabular-nums",color:C.t2}}>{inv.vatAmt?fmtAmt(inv.vatAmt,inv.currency):"—"}</span>
                    </td>}
                    {!hiddenCols.has("whtAmt")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontVariantNumeric:"tabular-nums",color:C.t2}}>{inv.whtAmt?fmtAmt(inv.whtAmt,inv.currency):"—"}</span>
                    </td>}
                    {!hiddenCols.has("otherFee")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontVariantNumeric:"tabular-nums",color:C.t2}}>{inv.additionalFee?fmtAmt(inv.additionalFee,inv.currency):"—"}</span>
                    </td>}

                    {!hiddenCols.has("attach")&&<td style={cs}>
                      {inv.files?.length>=2
                        ?<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#107e3e",fontSize:FS.sm}}><SapIcon name="accept" size={13} color="#107e3e"/><span style={{fontWeight:600}}>{inv.files.length} file(s)</span></span>
                        :<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#df6e0c",fontSize:FS.sm}}><SapIcon name="alert" size={13} color="#df6e0c"/><span>Incomplete</span></span>
                      }
                    </td>}

                    {!hiddenCols.has("actions")&&<td style={cs}>
                      <div style={{display:"flex",gap:4}}>
                        {["Draft","Rejected"].includes(inv.status)&&(
                          <button onClick={()=>{setEd(inv);setForm(true);}} style={{background:"transparent",border:"1px solid #0854a0",color:"#0854a0",borderRadius:4,padding:"0 0.625rem",fontSize:FS.xs,fontFamily:"inherit",fontWeight:600,cursor:"pointer",height:22}}>Edit</button>
                        )}
                        {inv.status==="Submitted"&&(
                          <button onClick={()=>withdraw(inv.id)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.t1,borderRadius:4,padding:"0 0.625rem",fontSize:FS.xs,fontFamily:"inherit",fontWeight:400,cursor:"pointer",height:22}}>Withdraw</button>
                        )}
                      </div>
                    </td>}

                    <td onClick={()=>setView(inv)} style={{...cs,textAlign:"center",color:view?.id===inv.id?C.primary:C.t2,fontSize:16,fontWeight:300,padding:0,width:32,cursor:"pointer"}}>
                      ›
                    </td>
                  </tr>
                  {isExpanded&&hasItems&&(
                    <tr style={{background:C.bg}}>
                      <td colSpan={visCols.length+3} style={{padding:0,borderBottom:`1px solid ${TK.rowBorder}`}}>
                        <div style={{paddingLeft:60,paddingBottom:8,paddingTop:4,paddingRight:8}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:FS.xs,tableLayout:"auto"}}>
                            <thead>
                              <tr style={{background:"#e8f1fb",height:28}}>
                                {["PO Number","PO Item","Qty","UoM","Material ID","Material Description","Unit Price","Item Amount","VAT Code"].map(h=>(
                                  <th key={h} style={{padding:"0 0.5rem",fontWeight:700,color:"#0854a0",textAlign:h==="Qty"||h==="Unit Price"||h==="Item Amount"?"right":"left",whiteSpace:"nowrap",borderBottom:"1px solid #c0d4ed",fontSize:FS.xs}}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map((item:any,idx:number)=>(
                                <tr key={idx} style={{background:idx%2===0?C.card:C.subtle}}>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,whiteSpace:"nowrap"}}>{item.poNo||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t2,fontSize:FS.xs}}>{item.poItem||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,textAlign:"right"}}>{item.qty??""}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t2,fontSize:FS.xs}}>{item.uom||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,fontFamily:"monospace"}}>{item.materialId||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs}}>{item.materialDesc||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmtAmt(item.unitPrice,inv.currency)}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,textAlign:"right",fontVariantNumeric:"tabular-nums",fontWeight:600}}>{fmtAmt((item.unitPrice||0)*(item.qty||0),inv.currency)}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t2,fontSize:FS.xs}}>{item.vatCode||"—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>);
              })}
            </tbody>
          </table>
        </div>

        <div style={{display:"flex",alignItems:"center",padding:"0 0.75rem",height:32,background:TK.footerBg,borderTop:`1px solid ${TK.hdrBorder}`}}>
          <span style={{fontSize:FS.xs,color:C.t2}}>{mine.length} item{mine.length!==1?"s":""}</span>
        </div>
      </div>
      </div>
      {view&&<>
        {/* Draggable splitter */}
        {!fullScreen&&(
          <div onMouseDown={onSplitterDrag}
            style={{width:8,flexShrink:0,cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",background:C.subtle,borderLeft:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,userSelect:"none",alignSelf:"stretch",zIndex:5}}>
            <div style={{display:"flex",flexDirection:"column",gap:3,pointerEvents:"none"}}>
              {[0,1,2,3,4].map(i=><div key={i} style={{width:3,height:3,borderRadius:"50%",background:C.t2,opacity:0.5}}/>)}
            </div>
          </div>
        )}
        <VendorInvoiceDetailPanel
          view={view} onClose={()=>{setView(null);setFullScreen(false);}}
          onPdf={setPdfView} onEdit={inv=>{setEd(inv);setForm(true);}}
          onWithdraw={withdraw} fullScreen={fullScreen}
          onToggleFullScreen={()=>setFullScreen(f=>!f)}
          panelFlex={fullScreen?"1":`0 0 ${100-split}%`}
        />
      </>}
      {showForm&&<InvoiceFormModal inv={editing} onSave={save} onClose={()=>{setForm(false);setEd(null);}} vendorId={user.vendorId} vendorName={v.name} allInvoices={invoices} addNotif={addNotif}/>}
      {pdfView&&view&&<PdfViewer filename={pdfView} inv={view} onClose={()=>setPdfView(null)}/>}
      {colMenu&&(
        <ColumnSettingsPopup
          col={colMenu.label} x={colMenu.x} y={colMenu.y}
          sort={colSort[colMenu.key]||"none"}
          onSort={v=>{setColSort(p=>({...p,[colMenu.key]:v}));}}
          groupBy={!!colGroup[colMenu.key]}
          onGroupBy={v=>setColGroup(v?{[colMenu.key]:true}:{[colMenu.key]:false})}
          width={colWidth[colMenu.key]}
          onWidth={v=>setColWidth(p=>({...p,[colMenu.key]:v}))}
          onClose={()=>setColMenu(null)}/>
      )}
      {vsOpen&&<ViewSettingsDialog colDefs={COL_DEFS} hidden={hiddenCols} onClose={()=>setVsOpen(false)} onApply={h=>{setHiddenCols(new Set(h));setVsOpen(false);}}/>}
    </div>
  );
};

// ── Adapt Filters ─────────────────────────────────────────────
const ALL_FILTER_FIELDS = [
  { id:"invoiceNo",      label:"Invoice No.",           defaultOn:true  },
  { id:"vendor",         label:"Vendor",                defaultOn:true  },
  { id:"poNumber",       label:"PO Number",             defaultOn:false },
  { id:"companyCode",    label:"Company Code",          defaultOn:true  },
  { id:"invoiceType",    label:"Invoice Type",          defaultOn:true },
  { id:"status",         label:"Status",                defaultOn:true  },
  { id:"currency",       label:"Currency",              defaultOn:true  },
  { id:"invoiceDate",    label:"Invoice Date",          defaultOn:true  },
  { id:"submittedDate",  label:"Submitted Date",        defaultOn:false },
  { id:"approvedDate",   label:"Approved Date",         defaultOn:false },
  { id:"postedDate",     label:"Posted Date",           defaultOn:false },
  { id:"amount",         label:"Amount",                defaultOn:false },
  { id:"sapDocNo",       label:"SAP Document No.",      defaultOn:false },
  { id:"whtType",        label:"WHT Type",              defaultOn:false },
  { id:"rejReason",      label:"Rejection Reason",      defaultOn:false },
  { id:"pmtTerms",       label:"Payment Terms",         defaultOn:false },
  { id:"pmtTermsStatus", label:"Payment Terms Status",  defaultOn:false },
];

function AdaptFiltersDialog({ open, onClose, visibleFields, onSave, draft, allFields, hasValue }: {
  open: boolean;
  onClose: () => void;
  visibleFields: Set<string>;
  onSave: (fields: Set<string>) => void;
  draft: any;
  allFields?: {id:string,label:string,defaultOn:boolean}[];
  hasValue?: (id:string)=>boolean;
}) {
  const fields = allFields || ALL_FILTER_FIELDS;
  const [localVisible, setLocalVisible] = useState<Set<string>>(new Set(visibleFields));
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"All"|"Active"|"Inactive">("All");

  useEffect(() => {
    if (open) {
      setLocalVisible(new Set(visibleFields));
      setSearch("");
      setViewFilter("All");
    }
  }, [open]);

  function isFieldActive(id: string): boolean {
    if (hasValue) return hasValue(id);
    switch(id) {
      case "invoiceNo": return draft.invoiceNoConds?.length > 0;
      case "vendor": return draft.vendorIds?.length > 0;
      case "poNumber": return draft.poNumbers?.length > 0;
      case "companyCode": return draft.companyCodes?.length > 0;
      case "invoiceType": return draft.invoiceTypes?.length > 0;
      case "status": return draft.statuses?.length > 0;
      case "currency": return draft.currencies?.length > 0;
      case "invoiceDate": return !!(draft.dateFrom || draft.dateTo);
      case "submittedDate": return !!(draft.submittedFrom || draft.submittedTo);
      case "approvedDate": return !!(draft.approvedFrom || draft.approvedTo);
      case "postedDate": return !!(draft.postedFrom || draft.postedTo);
      case "amountMin": return !!draft.amountMin;
      case "amountMax": return !!draft.amountMax;
      case "sapDocNo": return draft.sapDocNoConds?.length > 0;
      case "whtType": return draft.whtTypes?.length > 0;
      default: return false;
    }
  }

  const displayFields = fields.filter(f => {
    if (search && !f.label.toLowerCase().includes(search.toLowerCase())) return false;
    if (viewFilter === "Active") return localVisible.has(f.id);
    if (viewFilter === "Inactive") return !localVisible.has(f.id);
    return true;
  });

  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.card,width:560,maxHeight:620,borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.24)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{height:52,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:16,fontWeight:700,color:C.t1}}>Adapt Filters</span>
          <button
            onClick={() => { setLocalVisible(new Set(fields.filter(f=>f.defaultOn).map(f=>f.id))); }}
            style={{background:"none",border:"none",color:C.primary,fontSize:13,cursor:"pointer",padding:"4px 8px"}}
          >Reset</button>
        </div>
        {/* Sub-header */}
        <div style={{height:40,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:C.subtle,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <select value={viewFilter} onChange={e=>setViewFilter(e.target.value as any)}
            style={{width:80,height:28,border:`1px solid ${C.border}`,borderRadius:4,fontSize:13,background:C.field,color:C.t1}}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button style={{background:"none",border:"none",color:C.primary,fontSize:13,cursor:"pointer"}}>Show Values</button>
          </div>
        </div>
        {/* Search */}
        <div style={{padding:"8px 16px",flexShrink:0}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",display:"flex",alignItems:"center"}}><SapIcon name="search" size={14} color={C.t2}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search for Filters"
              style={{width:"100%",height:32,border:`1px solid ${C.border}`,borderRadius:4,paddingLeft:28,paddingRight:8,fontSize:13,color:C.t1,background:C.field,boxSizing:"border-box",outline:"none"}} />
          </div>
        </div>
        {/* Field list */}
        <div style={{flex:1,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
            <colgroup>
              <col style={{width:32}} />
              <col style={{width:40}} />
              <col />
              <col style={{width:80}} />
            </colgroup>
            <thead>
              <tr style={{background:C.subtle,height:32}}>
                <th style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",border:"none",textAlign:"center"}}></th>
                <th style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",border:"none"}}></th>
                <th style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",border:"none",textAlign:"left",paddingLeft:8}}>Field Name</th>
                <th style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",border:"none",textAlign:"center"}}>Active</th>
              </tr>
            </thead>
            <tbody>
              {displayFields.map(f => {
                const checked = localVisible.has(f.id);
                const active = isFieldActive(f.id);
                return (
                  <tr key={f.id} style={{height:44,borderBottom:`1px solid ${C.border}`,cursor:"default"}}
                    onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
                    onMouseLeave={e=>(e.currentTarget.style.background="")}>
                    <td style={{textAlign:"center",color:C.t2,fontSize:16,userSelect:"none"}}>⠿</td>
                    <td style={{textAlign:"center"}}>
                      <input type="checkbox" checked={checked}
                        onChange={e=>{
                          const ns = new Set(localVisible);
                          if(e.target.checked) ns.add(f.id); else ns.delete(f.id);
                          setLocalVisible(ns);
                        }}
                        style={{accentColor:C.primary,width:16,height:16,cursor:"pointer"}} />
                    </td>
                    <td style={{fontSize:14,color:C.t1,paddingLeft:8}}>{f.label}</td>
                    <td style={{textAlign:"center",fontSize:10,color:C.primary}}>{checked && active ? "●" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div style={{height:52,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,padding:"0 16px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={onClose}
            style={{height:36,padding:"0 16px",borderRadius:4,border:`1px solid ${C.border}`,background:C.card,fontSize:14,cursor:"pointer",color:C.t1}}>
            Cancel
          </button>
          <button onClick={()=>{ onSave(localVisible); onClose(); }}
            style={{height:36,padding:"0 16px",borderRadius:4,border:"none",background:C.primary,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BRM Invoice Mgmt ───────────────────────────────────────────
const COL_DEFS_BRM = [
  {key:"status",       label:"Status",          defW:130},
  {key:"invoiceNo",    label:"Invoice No.",     defW:175},
  {key:"invoiceType",  label:"Invoice Type",    defW:130},
  {key:"vendor",       label:"Vendor",          defW:145},
  {key:"compCode",     label:"Company Code",    defW:120},
  {key:"pmtTerms",       label:"Payment Terms",        defW:110},
  {key:"pmtTermsStatus", label:"Payment Terms Status",  defW:140},
  {key:"invDate",      label:"Invoice Date",    defW:88},
  {key:"submittedAt",  label:"Submitted Date",  defW:88},
  {key:"confirmedAt",  label:"Approved Date",   defW:88},
  {key:"totalAmt",   label:"Total Amount",     defW:115},
  {key:"vatAmt",     label:"VAT Amount",       defW:100},
  {key:"whtAmt",     label:"WHT Amount",       defW:100},
  {key:"otherFee",   label:"Other Fee Amount", defW:110},
  {key:"sapDocNo",   label:"SAP Document",     defW:160},
];
// Map internal status → document terminology shown in BRM view
const BRM_STATUS_LABEL:Record<string,string> = {
  "Draft":               "Draft",
  "Submitted":           "Open",
  "Under Review":        "On Progress",
  "Confirmed":           "On Progress",
  "Posted":              "Posted",
  "Converted to Invoice":"Converted to Invoice",
  "Cleared":             "Cleared to Invoice",
  "Rejected":            "Rejected",
};
// ── BRM Invoice Detail Panel (SAP S/4HANA Supplier Invoice style) ───────────
const BrmInvoiceDetailPanel = ({view,onClose,onPdf,fullScreen,onToggleFullScreen,panelFlex,onReview,onAccept,onReject,onPost,onConvert,onClear}) => {
  const [activeTab,setActiveTab]=useState("general");
  const pos = (view.poNumbers||[view.poNumber]).filter(Boolean);
  const totalAmt = Number(view.amount||0)+Number(view.vatAmt||0)+Number(view.additionalFee||0);

  const canReview  = ["Submitted"].includes(view.status);
  const canAccept  = ["Submitted","Under Review"].includes(view.status);
  const canReject  = ["Submitted","Under Review"].includes(view.status);
  const canPost    = view.status==="Confirmed";
  const canConvert = view.status==="Posted"&&view.invoiceType==="Supplier DPR";
  const canClear   = view.status==="Converted to Invoice";

  const Lbl = ({children}:any) => <div style={{fontSize:11,color:C.t2,marginBottom:2,lineHeight:1.3}}>{children}</div>;
  const Val = ({children,bold,blue}:any) => <div style={{fontSize:13,color:blue?C.primary:C.t1,fontWeight:bold?700:400,lineHeight:1.5,wordBreak:"break-word"}}>{children||"—"}</div>;
  const SecHdr = ({children}:any) => <div style={{fontWeight:700,fontSize:12,color:C.t1,borderBottom:`1px solid ${C.border}`,paddingBottom:6,marginBottom:12,marginTop:4}}>{children}</div>;
  const btnStyle = (active:boolean) => ({
    background:"transparent",border:"none",
    color:active?C.t1:"#bfbfbf",
    fontFamily:"'72','72full',Arial,Helvetica,sans-serif",
    fontSize:13,fontWeight:400 as const,cursor:active?"pointer":"default",
    height:36,padding:"0 8px",display:"inline-flex" as const,alignItems:"center" as const,
    gap:4,opacity:active?1:0.4,
  });

  const files = view.files||[];
  const FILE_META:Record<string,{size:string}> = {"invoice.pdf":{size:"124 KB"},"faktur_pajak.pdf":{size:"87 KB"}};
  const getFileMeta = (f:string) => FILE_META[f]||{size:"—"};
  const uploadDate = view.submittedAt||view.invoiceDate||"";

  const TABS = [
    {id:"general",     label:"General Information"},
    {id:"purch",       label:"Purch. Doc. References"},
    {id:"tax",         label:"Tax"},
    {id:"attachments", label:"Attachments"},
    {id:"docflow",     label:"Document Flow"},
  ];

  return (
    <div style={{flex:panelFlex,position:"sticky",top:0,maxHeight:"100vh",display:"flex",flexDirection:"column",background:C.card,overflow:"hidden",borderLeft:`1px solid ${C.border}`,boxShadow:"-2px 0 8px rgba(0,0,0,0.06)"}}>

      {/* ── Page header ── */}
      <div style={{padding:"10px 16px 0",background:C.subtle,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:C.t1,lineHeight:1.2}}>
              {view.invoiceType==="Supplier DPR"?"Supplier DPR":"Supplier Invoice"}
            </div>
            <div style={{fontSize:12,color:C.t2,marginTop:2}}>{view.id}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2,flexWrap:"wrap" as const,justifyContent:"flex-end" as const}}>
            <button style={btnStyle(canReview)} disabled={!canReview} onClick={()=>canReview&&onReview(view.id)}><SapIcon name="user-edit" size={13} color={canReview?C.t1:"#bfbfbf"}/>Review</button>
            <button style={btnStyle(canAccept)} disabled={!canAccept} onClick={()=>canAccept&&onAccept(view.id)}><SapIcon name="accept" size={13} color={canAccept?C.t1:"#bfbfbf"}/>Accept</button>
            <button style={btnStyle(canReject)} disabled={!canReject} onClick={()=>canReject&&onReject(view)}><SapIcon name="decline" size={13} color={canReject?C.t1:"#bfbfbf"}/>Reject</button>
            <div style={{width:1,height:20,background:C.border,margin:"0 2px"}}/>
            <button style={btnStyle(canConvert)} disabled={!canConvert} onClick={()=>canConvert&&onConvert(view)}><SapIcon name="convert" size={13} color={canConvert?C.t1:"#bfbfbf"}/>Convert</button>
            <button style={btnStyle(canClear)} disabled={!canClear} onClick={()=>canClear&&onClear(view)}><SapIcon name="complete" size={13} color={canClear?C.t1:"#bfbfbf"}/>Clear</button>
            <div style={{width:1,height:20,background:C.border,margin:"0 2px"}}/>
            <button onClick={onToggleFullScreen} title={fullScreen?"Restore":"Full Screen"} style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer"}}>
              <SapIcon name={fullScreen?"exit-full-screen":"full-screen"} size={13} color={C.t2}/>
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,padding:"0 2px"}}>×</button>
          </div>
        </div>

        {/* ── Key info strip ── */}
        <div style={{display:"flex",gap:0,marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10,flexWrap:"wrap",rowGap:8}}>
          <div style={{paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <Lbl>Gross Invoice Amount</Lbl>
            <div style={{fontSize:16,fontWeight:700,color:C.t1,fontVariantNumeric:"tabular-nums"}}>{fmtAmt(totalAmt,view.currency)}</div>
          </div>
          <div style={{paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <Lbl>Invoicing Party</Lbl>
            <div style={{fontSize:13,color:C.primary,fontWeight:600}}>{view.vendorName}</div>
            <div style={{fontSize:11,color:C.t2}}>{view.vendorId}</div>
          </div>
          <div style={{paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <Lbl>Invoice Status</Lbl>
            <Badge s={view.status}/>
          </div>
          <div>
            <Lbl>Document Type</Lbl>
            <Val>{view.invoiceType||"Invoice"}</Val>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{display:"flex",gap:0,marginTop:10,borderBottom:`1px solid ${C.border}`}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              background:"none",border:"none",cursor:"pointer",
              padding:"6px 12px",fontSize:12,fontFamily:"inherit",
              color:activeTab===t.id?C.primary:C.t2,
              fontWeight:activeTab===t.id?700:400,
              borderBottom:activeTab===t.id?`2px solid ${C.primary}`:"2px solid transparent",
              marginBottom:-1,whiteSpace:"nowrap" as const,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>

        {/* GENERAL INFORMATION */}
        {activeTab==="general"&&<>
          <SecHdr>Basic Data</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>Transaction</Lbl><Val>{view.invoiceType||"Invoice"}</Val></div>
            <div><Lbl>Invoice Date</Lbl><Val>{fmtDate(view.invoiceDate)}</Val></div>
            <div><Lbl>Invoicing Party</Lbl><Val blue>{view.vendorName}</Val></div>
            <div><Lbl>Company Code</Lbl><Val>{view.companyCode?`${view.companyCode} – ${ccName(view.companyCode)}`:"—"}</Val></div>
            <div><Lbl>Posting Date</Lbl><Val>{view.postedAt?fmtDate(view.postedAt):view.confirmedAt?fmtDate(view.confirmedAt):"—"}</Val></div>
            <div><Lbl>Reference</Lbl><Val>{view.invoiceNo}</Val></div>
            <div><Lbl>Gross Invoice Amount</Lbl><Val bold>{fmtAmt(totalAmt,view.currency)}</Val></div>
            <div><Lbl>Due Date</Lbl><Val>{fmtDate(view.dueDate)}</Val></div>
            <div><Lbl>Faktur Pajak</Lbl><Val>{view.taxDoc||"—"}</Val></div>
          </div>

          <SecHdr>Status &amp; Workflow</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>Invoice Status</Lbl><Badge s={view.status}/></div>
            <div><Lbl>Approval Status</Lbl><Val>{["Confirmed","Posted","Converted to Invoice","Cleared"].includes(view.status)?"Approved":["Submitted","Under Review"].includes(view.status)?"Pending":"—"}</Val></div>
            <div><Lbl>Submission Date</Lbl><Val>{view.submittedAt?fmtDate(view.submittedAt):"—"}</Val></div>
            <div><Lbl>Pre-Invoice ID</Lbl><Val>{view.id}</Val></div>
            <div><Lbl>Vendor ID</Lbl><Val>{view.vendorId}</Val></div>
            <div><Lbl>Approval Date</Lbl><Val>{view.confirmedAt?fmtDate(view.confirmedAt):"—"}</Val></div>
          </div>

          {view.status==="Rejected"&&view.rejReason&&(
            <div style={{marginBottom:12,padding:12,background:C.errBg,border:`1px solid ${C.err}44`,borderRadius:4}}>
              <div style={{fontWeight:700,fontSize:12,color:C.err,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><SapIcon name="decline" size={13} color={C.err}/>Rejection Reason</div>
              <div style={{fontSize:13,color:C.t1}}>{view.rejReason}</div>
            </div>
          )}

          <SecHdr>Notes</SecHdr>
          <div style={{fontSize:13,color:C.t1,lineHeight:1.5,marginBottom:16}}>{view.desc||"—"}</div>

          {view.sapDocNo&&(
            <div style={{padding:"10px 12px",background:"#ecf8f0",border:"1px solid #b7dfcc",borderRadius:4,display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <SapIcon name="connected" size={14} color="#107e3e"/>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#107e3e"}}>SAP Document Created</div>
                <div style={{fontSize:13,color:"#1d2d3e",fontWeight:600,fontFamily:"monospace"}}>{view.sapDocNo}</div>
                {view.postedAt&&<div style={{fontSize:11,color:"#6a6d70"}}>Posted: {fmtDate(view.postedAt)}</div>}
              </div>
            </div>
          )}
          {(view.convertedDocNo||view.clearingDocNo)&&(
            <div style={{padding:"10px 12px",background:"#dff0fd",border:"1px solid #b3d7f5",borderRadius:4,marginBottom:12}}>
              {view.convertedDocNo&&<div style={{fontSize:12,marginBottom:4}}><strong>Invoice Doc:</strong> <span style={{fontFamily:"monospace"}}>{view.convertedDocNo}</span></div>}
              {view.clearingDocNo&&<div style={{fontSize:12}}><strong>Clearing Doc:</strong> <span style={{fontFamily:"monospace"}}>{view.clearingDocNo}</span></div>}
            </div>
          )}
        </>}

        {/* PURCHASING DOCUMENT REFERENCES */}
        {activeTab==="purch"&&<>
          <SecHdr>PO Numbers</SecHdr>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {pos.length?pos.map((po:any,i:number)=>(
              <span key={i} style={{background:C.subtle,border:`1px solid ${C.border}`,borderRadius:3,padding:"3px 10px",fontSize:13,fontFamily:"monospace",color:C.t1}}>{po}</span>
            )):<span style={{fontSize:13,color:C.t2}}>—</span>}
          </div>
          {view.items&&view.items.length>0&&<>
            <SecHdr>Items ({view.items.length})</SecHdr>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:"#e8f1fb"}}>
                    {["#","Short Text / PO Item","Amount","Quantity","Tax Code","Tax Rate"].map(h=>(
                      <th key={h} style={{padding:"5px 8px",fontWeight:700,color:"#0854a0",textAlign:h==="Amount"||h==="Quantity"||h==="Tax Rate"?"right":"left",whiteSpace:"nowrap",borderBottom:"1px solid #c0d4ed",fontSize:11}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {view.items.map((item:any,idx:number)=>(
                    <tr key={idx} style={{background:idx%2===0?C.card:C.subtle}}>
                      <td style={{padding:"4px 8px",color:C.t2,fontSize:11}}>{idx+1}</td>
                      <td style={{padding:"4px 8px",color:C.t1,fontSize:11}}>
                        <div style={{fontFamily:"monospace",fontSize:10,color:C.primary}}>{item.poNo||"—"} / {item.poItem||"—"}</div>
                        <div>{item.materialDesc||"—"}</div>
                      </td>
                      <td style={{padding:"4px 8px",textAlign:"right",fontVariantNumeric:"tabular-nums",fontWeight:600,color:C.t1,fontSize:11}}>{fmtAmt((item.unitPrice||0)*(item.qty||0),view.currency)}</td>
                      <td style={{padding:"4px 8px",textAlign:"right",color:C.t1,fontSize:11}}>{item.qty??""} {item.uom||""}</td>
                      <td style={{padding:"4px 8px",color:C.t2,fontSize:11}}>{item.vatCode||"—"}</td>
                      <td style={{padding:"4px 8px",textAlign:"right",color:C.t2,fontSize:11}}>11.000%(VST)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}
        </>}

        {/* TAX */}
        {activeTab==="tax"&&<>
          <SecHdr>Tax Information</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>VAT Base Amount</Lbl><Val>{fmtAmt(view.vatBase||0,view.currency)}</Val></div>
            <div><Lbl>VAT Rate</Lbl><Val>{view.vatRate?view.vatRate+"%":"11%"}</Val></div>
            <div><Lbl>VAT Amount</Lbl><Val>{fmtAmt(view.vatAmt||0,view.currency)}</Val></div>
          </div>
          {view.whtType&&<>
            <SecHdr>Withholding Tax</SecHdr>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 16px",marginBottom:16}}>
              <div><Lbl>WHT Type</Lbl><Val>{WHT_TYPES.find((w:any)=>w.v===view.whtType)?.l||view.whtType}</Val></div>
              <div><Lbl>WHT Code</Lbl><Val>{view.whtCode||"—"}</Val></div>
              <div><Lbl>WHT Rate</Lbl><Val>{view.whtCode?((WHT_CODES[view.whtType]||[]).find((c:any)=>c.v===view.whtCode)?.rate||0)+"%":"—"}</Val></div>
              <div><Lbl>WHT Base Amount</Lbl><Val>{fmtAmt(view.whtBase||0,view.currency)}</Val></div>
              <div><Lbl>WHT Amount</Lbl><Val>{fmtAmt(view.whtAmt||0,view.currency)}</Val></div>
            </div>
          </>}
          <SecHdr>Financial Summary</SecHdr>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:16}}>
            <div><Lbl>Item Amount (subtotal)</Lbl><Val>{fmtAmt(view.amount,view.currency)}</Val></div>
            <div><Lbl>VAT Amount</Lbl><Val>{fmtAmt(view.vatAmt||0,view.currency)}</Val></div>
            {(view.additionalFee||0)>0&&<>
              <div><Lbl>Other Fee</Lbl><Val>{fmtAmt(view.additionalFee,view.currency)}</Val></div>
              <div><Lbl>Fee Category</Lbl><Val>{view.feeCategory||"—"}</Val></div>
            </>}
            <div><Lbl>WHT Amount</Lbl><Val>{fmtAmt(view.whtAmt||0,view.currency)}</Val></div>
            <div><Lbl>Net Payable</Lbl><Val bold blue>{fmtAmt(totalAmt-Number(view.whtAmt||0),view.currency)}</Val></div>
          </div>
          <div style={{padding:10,background:C.infoBg,borderRadius:4,fontSize:11,color:C.primary,marginTop:4}}>
            <strong>SAP Integration:</strong>{" "}
            {view.invoiceType==="Supplier DPR"
              ?<>Routes to <code>SAP Build Process Automation</code> for Down Payment workflow.</>
              :<>Calls <code>API_SUPPLIERINVOICE_PROCESS_SRV</code> → SAP Flexible Workflow for posting approval.</>}
          </div>
        </>}

        {/* ATTACHMENTS */}
        {activeTab==="attachments"&&<>
          <div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:C.subtle,borderBottom:files.length?`1px solid ${C.border}`:"none"}}>
              <span style={{fontWeight:600,fontSize:12,color:C.t1}}>Uploaded ({files.length})</span>
              <span style={{flex:1}}/>
            </div>
            {files.length===0&&<div style={{padding:"20px",textAlign:"center",color:C.t2,fontSize:12}}>No attachments uploaded.</div>}
            {files.map((f:string,i:number)=>{
              const m=getFileMeta(f);
              return(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<files.length-1?`1px solid ${C.border}`:"none",background:C.card}}
                  onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
                  onMouseLeave={e=>(e.currentTarget.style.background=C.card)}>
                  <div style={{flexShrink:0,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:C.subtle,borderRadius:4,border:`1px solid ${C.border}`}}>
                    <SapIcon name="pdf-attachment" size={18} color={C.primary}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <button onClick={()=>onPdf(f)} style={{background:"none",border:"none",padding:0,cursor:"pointer",color:C.primary,fontSize:13,fontWeight:600,fontFamily:"inherit",textAlign:"left",display:"block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f}</button>
                    <div style={{fontSize:11,color:C.t2,marginTop:1}}>
                      Uploaded By: <span style={{color:C.t1}}>{view.vendorName||"Vendor"}</span>
                      {uploadDate&&<> · Uploaded On: <span style={{color:C.t1}}>{fmtDate(uploadDate)}</span></>}
                      {" "}· File Size: <span style={{color:C.t1}}>{m.size}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* DOCUMENT FLOW */}
        {activeTab==="docflow"&&<DocFlow inv={view}/>}

      </div>
    </div>
  );
};

export const BrmInvoice = ({invoices,setInvoices,drillInvoiceNo,onClearDrill,addNotif}:any) => {
  const [view,setView]=useState(null); const [rejModal,setRejM]=useState(null); const [rejR,setRejR]=useState(""); const [pdfView,setPdfView]=useState(null);
  const [hovRow,setHovRow]=useState<string|null>(null);
  const [selRows,setSelRows]=useState<Set<string>>(new Set());
  const [vhOpen,setVhOpen]=useState<null|"vendor"|"companyCode"|"status"|"currency"|"whtType">(null);
  const [colSort,setColSort]=useState<Record<string,string>>({});
  const [colWidth,setColWidth]=useState<Record<string,number>>(Object.fromEntries(COL_DEFS_BRM.map(c=>[c.key,c.defW])));
  const [colGroup,setColGroup]=useState<Record<string,boolean>>({});
  const [colMenu,setColMenu]=useState<{key:string,label:string,x:number,y:number}|null>(null);
  const [hiddenCols,setHiddenCols]=useState<Set<string>>(new Set());
  const [vsOpen,setVsOpen]=useState(false);
  const visCols=COL_DEFS_BRM.filter(c=>!hiddenCols.has(c.key));
  const [adaptOpen, setAdaptOpen] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(
    new Set(ALL_FILTER_FIELDS.filter(f=>f.defaultOn).map(f=>f.id))
  );
  const emptyF={invoiceNoConds:[] as Cond[],vendorIds:[] as string[],companyCodes:[] as string[],statuses:[] as string[],currencies:[] as string[],dateFrom:"",dateTo:"",poNumbers:[] as string[],invoiceTypes:[] as string[],submittedFrom:"",submittedTo:"",approvedFrom:"",approvedTo:"",postedFrom:"",postedTo:"",amountConds:[] as Cond[],sapDocNoConds:[] as any[],whtTypes:[] as string[],pmtTerms:[] as string[],pmtTermsStatus:[] as string[]};
  const [draft,setDraft]=useState({...emptyF}); const [active,setActive]=useState({...emptyF});
  useEffect(()=>{if(drillInvoiceNo){const c={op:"equal to",v1:drillInvoiceNo,v2:""};setDraft(p=>({...p,invoiceNoConds:[c]}));setActive(p=>({...p,invoiceNoConds:[c]}));onClearDrill?.();}}, [drillInvoiceNo]);
  const [expanded,setExpanded]=useState<Set<string>>(new Set());
  const [allExpanded,setAllExpanded]=useState(false);
  const [split,setSplit]=useState(60);
  const [fullScreen,setFullScreen]=useState(false);
  const containerRef=useRef<HTMLDivElement>(null);
  const toggleExpanded=(id:string)=>setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const onSplitterDrag=(e:React.MouseEvent)=>{
    e.preventDefault();
    const startX=e.clientX, startSplit=split;
    const containerW=containerRef.current?.offsetWidth||window.innerWidth;
    const onMove=(me:MouseEvent)=>{const dx=me.clientX-startX;setSplit(Math.min(75,Math.max(30,startSplit+(dx/containerW)*100)));};
    const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp);
  };
  const sd=(k,v)=>setDraft(p=>({...p,[k]:v}));
  const go=()=>setActive({...draft});
  const reset=()=>{setDraft({...emptyF});setActive({...emptyF});};
  const clr=k=>{if(k==="dateRange"){setActive(p=>({...p,dateFrom:"",dateTo:""}));setDraft(p=>({...p,dateFrom:"",dateTo:""}));}else if(k==="invoiceNoConds"){setActive(p=>({...p,invoiceNoConds:[]}));setDraft(p=>({...p,invoiceNoConds:[]}))}else{setActive(p=>({...p,[k]:[]}));setDraft(p=>({...p,[k]:[]}))}};

  const listFiltered=invoices.filter(i=>
    (active.invoiceNoConds.length===0||active.invoiceNoConds.some(c=>evalCond(i.invoiceNo,c)))&&
    (active.vendorIds.length===0||active.vendorIds.includes(i.vendorId))&&
    (active.statuses.length===0||active.statuses.includes(i.status))&&
    (active.companyCodes.length===0||active.companyCodes.includes(i.companyCode))&&
    (active.currencies.length===0||active.currencies.includes(i.currency))&&
    (!active.dateFrom||i.invoiceDate>=active.dateFrom)&&
    (!active.dateTo||i.invoiceDate<=active.dateTo)
  ).filter(inv => !active.poNumbers?.length || (inv.poNumbers||[]).some((p:string) => active.poNumbers.includes(p)))
   .filter(inv => !active.invoiceTypes?.length || active.invoiceTypes.includes(inv.invoiceType))
   .filter(inv => !active.submittedFrom || (inv.submittedAt||"") >= active.submittedFrom)
   .filter(inv => !active.submittedTo || (inv.submittedAt||"") <= active.submittedTo)
   .filter(inv => !active.approvedFrom || (inv.confirmedAt||"") >= active.approvedFrom)
   .filter(inv => !active.approvedTo || (inv.confirmedAt||"") <= active.approvedTo)
   .filter(inv => !active.postedFrom || (inv.postedAt||"") >= active.postedFrom)
   .filter(inv => !active.postedTo || (inv.postedAt||"") <= active.postedTo)
   .filter(inv => !active.amountConds?.length || active.amountConds.every(c=>evalNumCond(Number(inv.amount),c)))
   .filter(inv => !active.sapDocNoConds?.length || active.sapDocNoConds.every((c:any) => evalCond(inv.sapDocNo||"", c)))
   .filter(inv => !active.whtTypes?.length || active.whtTypes.includes(inv.whtType))
   .filter(inv => !active.pmtTerms?.length || active.pmtTerms.includes(inv.paymentTerms||""))
   .filter(inv => {
     if(!active.pmtTermsStatus?.length) return true;
     const ct=(VENDORS[inv.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===inv.companyCode)?.zterm;
     const ok=ct&&inv.paymentTerms?inv.paymentTerms===ct:null;
     const st=ok===null?"unknown":ok?"compliant":"differs";
     return active.pmtTermsStatus.includes(st);
   });
  const SORT_FIELDS_BRM:Record<string,(i:any)=>any>={
    invoiceNo:i=>i.invoiceNo, vendor:i=>i.vendorName, poNumber:i=>fmtPOs(i),
    compCode:i=>i.companyCode, invDate:i=>i.invoiceDate, submittedAt:i=>i.submittedAt||"",
    confirmedAt:i=>i.confirmedAt||"", amount:i=>Number(i.amount||0),
    sapDocNo:i=>i.sapDocNo||"", status:i=>i.status,
    pmtTerms:i=>i.paymentTerms||"",
    pmtTermsStatus:i=>{const ct=(VENDORS[i.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===i.companyCode)?.zterm;return ct&&i.paymentTerms?i.paymentTerms===ct?"Compliant":"Differs":"Unknown";},
  };
  const activeSort=Object.entries(colSort).find(([,v])=>v!=="none");
  const list=[...listFiltered].sort((a,b)=>{
    if(!activeSort)return 0;
    const [key,dir]=activeSort; const fn=SORT_FIELDS_BRM[key]||(()=>"");
    const va=fn(a),vb=fn(b);
    const cmp=typeof va==="number"?va-vb:String(va).localeCompare(String(vb));
    return dir==="asc"?cmp:-cmp;
  });

  const tokens=[
    active.invoiceNoConds.length>0&&{label:"Invoice No.",val:active.invoiceNoConds.length===1?condLabel(active.invoiceNoConds[0]):`${active.invoiceNoConds.length} conditions`,onClear:()=>clr("invoiceNoConds")},
    active.vendorIds.length>0&&{label:"Vendor",val:active.vendorIds.length===1?(VENDORS[active.vendorIds[0]]?.name||active.vendorIds[0]):`${active.vendorIds.length} selected`,onClear:()=>clr("vendorIds")},
    active.statuses.length>0&&{label:"Status",val:active.statuses.length===1?active.statuses[0]:`${active.statuses.length} selected`,onClear:()=>clr("statuses")},
    active.companyCodes.length>0&&{label:"Company Code",val:active.companyCodes.length===1?`${active.companyCodes[0]} – ${ccName(active.companyCodes[0])}`:`${active.companyCodes.length} selected`,onClear:()=>clr("companyCodes")},
    active.currencies.length>0&&{label:"Currency",val:active.currencies.length===1?active.currencies[0]:`${active.currencies.length} selected`,onClear:()=>clr("currencies")},
    (active.dateFrom||active.dateTo)&&{label:"Date Range",val:[active.dateFrom&&fmtDate(active.dateFrom),active.dateTo&&fmtDate(active.dateTo)].filter(Boolean).join(" – "),onClear:()=>clr("dateRange")},
    active.poNumbers?.length>0&&{label:"PO Number",val:active.poNumbers.length===1?active.poNumbers[0]:`${active.poNumbers.length} selected`,onClear:()=>clr("poNumbers")},
    active.invoiceTypes?.length>0&&{label:"Invoice Type",val:active.invoiceTypes.map(fmtInvType).join(", "),onClear:()=>clr("invoiceTypes")},
    (active.submittedFrom||active.submittedTo)&&{label:"Submitted Date",val:[active.submittedFrom&&fmtDate(active.submittedFrom),active.submittedTo&&fmtDate(active.submittedTo)].filter(Boolean).join(" – "),onClear:()=>{setActive(p=>({...p,submittedFrom:"",submittedTo:""}));setDraft(p=>({...p,submittedFrom:"",submittedTo:""}));}},
    (active.approvedFrom||active.approvedTo)&&{label:"Approved Date",val:[active.approvedFrom&&fmtDate(active.approvedFrom),active.approvedTo&&fmtDate(active.approvedTo)].filter(Boolean).join(" – "),onClear:()=>{setActive(p=>({...p,approvedFrom:"",approvedTo:""}));setDraft(p=>({...p,approvedFrom:"",approvedTo:""}));}},
    (active.postedFrom||active.postedTo)&&{label:"Posted Date",val:[active.postedFrom&&fmtDate(active.postedFrom),active.postedTo&&fmtDate(active.postedTo)].filter(Boolean).join(" – "),onClear:()=>{setActive(p=>({...p,postedFrom:"",postedTo:""}));setDraft(p=>({...p,postedFrom:"",postedTo:""}));}},
    active.amountConds?.length>0&&{label:"Amount",val:active.amountConds.length===1?condLabel(active.amountConds[0]):`${active.amountConds.length} conditions`,onClear:()=>clr("amountConds")},
    active.sapDocNoConds?.length>0&&{label:"SAP Doc No.",val:`${active.sapDocNoConds.length} condition${active.sapDocNoConds.length!==1?"s":""}`,onClear:()=>clr("sapDocNoConds")},
    active.whtTypes?.length>0&&{label:"WHT Type",val:active.whtTypes.length===1?active.whtTypes[0]:`${active.whtTypes.length} selected`,onClear:()=>clr("whtTypes")},
    active.pmtTerms?.length>0&&{label:"Payment Terms",val:active.pmtTerms.join(", "),onClear:()=>clr("pmtTerms")},
    active.pmtTermsStatus?.length>0&&{label:"Pmt Terms Status",val:active.pmtTermsStatus.map(s=>s==="compliant"?"Compliant":s==="differs"?"Differs":"Unknown").join(", "),onClear:()=>clr("pmtTermsStatus")},
  ].filter(Boolean);

  const accept=id=>{const inv=invoices.find(i=>i.id===id);setInvoices(p=>p.map(i=>i.id===id?{...i,status:"Confirmed",confirmedAt:new Date().toISOString().split("T")[0]}:i));if(inv)addNotif?.({title:"Invoice Confirmed",desc:`Your invoice ${inv.invoiceNo} has been confirmed.`,forRole:"vendor",forVendorId:inv.vendorId,icon:"accept",iconColor:"#107e3e"});setView(null);};
  const reject=()=>{if(!rejR){alert("Provide a rejection reason.");return;}const inv=invoices.find(i=>i.id===rejModal.id);setInvoices(p=>p.map(i=>i.id===rejModal.id?{...i,status:"Rejected",rejReason:rejR}:i));if(inv)addNotif?.({title:"Invoice Rejected",desc:`Your invoice ${inv.invoiceNo} was rejected: ${rejR}`,forRole:"vendor",forVendorId:inv.vendorId,icon:"decline",iconColor:"#bb0000"});setRejM(null);setRejR("");setView(null);};
  const setUR=id=>{const inv=invoices.find(i=>i.id===id);setInvoices(p=>p.map(i=>i.id===id?{...i,status:"Under Review"}:i));if(inv)addNotif?.({title:"Invoice Under Review",desc:`Your invoice ${inv.invoiceNo} is now under review.`,forRole:"vendor",forVendorId:inv.vendorId,icon:"pending",iconColor:"#e9730c"});};
  const postToSAP=(inv)=>{
    const isInv=inv.invoiceType==="Invoice";
    const num=(100000000+Math.floor(Math.random()*899999999)).toString();
    const docNo=isInv?`${num.slice(0,10)}/2025`:`${inv.companyCode||"BRMS"}/${num}/2025`;
    if(window.confirm(`Post to SAP S/4HANA?\n\nDocument: ${inv.invoiceNo}\nType: ${inv.invoiceType||"Invoice"}\nSimulated SAP Doc No: ${docNo}\n\nThis will call API_SUPPLIERINVOICE_PROCESS_SRV and trigger the SAP workflow.`)){
      setInvoices(p=>p.map(i=>i.id===inv.id?{...i,status:"Posted",sapDocNo:docNo,postedAt:new Date().toISOString().split("T")[0]}:i));
      if(view?.id===inv.id)setView(p=>({...p,status:"Posted",sapDocNo:docNo,postedAt:new Date().toISOString().split("T")[0]}));
    }
  };
  const convertDPR=(inv)=>{
    const docNo=`${(100000000+Math.floor(Math.random()*899999999)).toString().slice(0,10)}/2025`;
    if(window.confirm(`Convert Down Payment Request to Supplier Invoice?\n\nDPR: ${inv.invoiceNo}\nSAP DPR Doc: ${inv.sapDocNo}\nNew SAP Invoice Doc: ${docNo}\n\nThis will call API_SUPPLIERINVOICE_PROCESS_SRV to create a posted invoice.`)){
      setInvoices(p=>p.map(i=>i.id===inv.id?{...i,status:"Converted to Invoice",convertedDocNo:docNo,convertedAt:new Date().toISOString().split("T")[0]}:i));
      if(view?.id===inv.id)setView(p=>({...p,status:"Converted to Invoice",convertedDocNo:docNo}));
    }
  };
  const clearDPR=(inv)=>{
    const clrDoc=`${inv.companyCode||"BRMS"}/${(100000+Math.floor(Math.random()*899999)).toString()}/2025`;
    if(window.confirm(`Clear Down Payment against Invoice?\n\nThis will call SAP API to create clearing document.\nSimulated Clearing Doc: ${clrDoc}`)){
      setInvoices(p=>p.map(i=>i.id===inv.id?{...i,status:"Cleared",clearingDocNo:clrDoc,clearedAt:new Date().toISOString().split("T")[0]}:i));
      if(view?.id===inv.id)setView(p=>({...p,status:"Cleared",clearingDocNo:clrDoc}));
    }
  };
  const toggleSel=(id)=>setSelRows(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const allSel=list.length>0&&selRows.size===list.length;
  const toggleAll=()=>setSelRows(allSel?new Set():new Set(list.map(i=>i.id)));
  const exportCSV=()=>{
    const rows=selRows.size>0?list.filter(i=>selRows.has(i.id)):list;
    if(rows.length===0){alert("No invoices to export.");return;}
    const esc=(s:any)=>{const t=String(s??'');return t.includes(',')||t.includes('"')||t.includes('\n')?`"${t.replace(/"/g,'""')}"`:t;};
    const hdr=["Pre-Invoice ID","Invoice No.","Vendor","Vendor ID","Company Code","Invoice Date","Due Date","PO Numbers","Currency","Amount","VAT Amount","WHT Amount","Net Amount","Status","Description"];
    const data=rows.map(i=>[i.id,i.invoiceNo,i.vendorName,i.vendorId,i.companyCode,i.invoiceDate,i.dueDate,fmtPOs(i),i.currency,i.amount,i.vatAmt,i.whtAmt,Number(i.amount||0)+Number(i.vatAmt||0)-Number(i.whtAmt||0),i.status,i.desc].map(esc).join(","));
    const csv=[hdr.join(","),...data].join("\r\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    a.download=`invoices_brm_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const TK={hdrBg:C.subtle,hdrBorder:C.border,hdrText:C.t2,rowBg:C.card,rowBorder:C.border,rowText:C.t1,hovBg:C.hover,selBg:C.selection,link:C.primary,toolbarBg:C.card,footerBg:C.subtle};
  const FS={base:14,sm:12,xs:11};

  return (
    <div ref={containerRef} style={{display:"flex",alignItems:"flex-start",fontFamily:"'72','72full',Arial,Helvetica,sans-serif",overflow:"hidden"}}>
      <div style={{flex:view&&!fullScreen?`0 0 ${split}%`:"1",padding:mob()?"12px 10px":"20px 24px",overflowX:"hidden",minWidth:0,transition:"flex 0.15s ease",display:fullScreen?"none":"block"}}>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:20,fontWeight:700,color:C.t1,letterSpacing:0.1}}>Invoice Management</div>
        <div style={{fontSize:FS.sm,color:C.t2,marginTop:3,display:"flex",alignItems:"center",gap:5}}>
          <SapIcon name="connected" size={12} color={C.t2}/>
          On Accept: API_SUPPLIERINVOICE_PROCESS_SRV → SAP Flexible Workflow (Parked → Posted)
        </div>
      </div>

      <FioriBar activeTokens={tokens} onGo={go} onReset={reset} onAdaptFilters={()=>setAdaptOpen(true)} adaptFiltersCount={visibleFields.size}>
        {visibleFields.has("invoiceNo")&&<FField label="Invoice No."><MultiValueInp fieldTitle="Invoice No." conditions={draft.invoiceNoConds} onChange={v=>sd("invoiceNoConds",v)}/></FField>}
        {visibleFields.has("vendor")&&<FField label="Vendor">
          <ValueHelpInp selected={draft.vendorIds} getLabel={k=>VENDORS[k]?.name||k} onOpen={()=>setVhOpen("vendor")} placeholder="All Vendors"/>
        </FField>}
        {visibleFields.has("companyCode")&&<FField label="Company Code">
          <ValueHelpInp selected={draft.companyCodes} getLabel={k=>`${k} – ${ccName(k)}`} onOpen={()=>setVhOpen("companyCode")} placeholder="All Company Codes"/>
        </FField>}
        {visibleFields.has("status")&&<FField label="Status">
          <ValueHelpInp selected={draft.statuses} getLabel={k=>k} onOpen={()=>setVhOpen("status")} placeholder="All Statuses"/>
        </FField>}
        {visibleFields.has("currency")&&<FField label="Currency">
          <ValueHelpInp selected={draft.currencies} getLabel={k=>k} onOpen={()=>setVhOpen("currency")} placeholder="All Currencies"/>
        </FField>}
        {visibleFields.has("invoiceDate")&&<FField label="Invoice Date Range"><DateRangePicker from={draft.dateFrom} to={draft.dateTo} onChange={(f,t)=>{sd("dateFrom",f);sd("dateTo",t);}}/></FField>}
        {visibleFields.has("poNumber")&&<FField label="PO Number"><Inp value={draft.poNumbers[0]||""} onChange={e=>setDraft(d=>({...d,poNumbers:e?[e]:[]}))} placeholder="PO Number" /></FField>}
        {visibleFields.has("invoiceType")&&<FField label="Invoice Type"><InvTypeMultiComboBox value={draft.invoiceTypes} onChange={v=>setDraft(d=>({...d,invoiceTypes:v}))}/></FField>}
        {visibleFields.has("submittedDate")&&<FField label="Submitted Date"><div style={{display:"flex",gap:4}}><DateInp value={draft.submittedFrom} onChange={v=>setDraft(d=>({...d,submittedFrom:v}))} /><DateInp value={draft.submittedTo} onChange={v=>setDraft(d=>({...d,submittedTo:v}))} /></div></FField>}
        {visibleFields.has("approvedDate")&&<FField label="Approved Date"><div style={{display:"flex",gap:4}}><DateInp value={draft.approvedFrom} onChange={v=>setDraft(d=>({...d,approvedFrom:v}))} /><DateInp value={draft.approvedTo} onChange={v=>setDraft(d=>({...d,approvedTo:v}))} /></div></FField>}
        {visibleFields.has("postedDate")&&<FField label="Posted Date"><div style={{display:"flex",gap:4}}><DateInp value={draft.postedFrom} onChange={v=>setDraft(d=>({...d,postedFrom:v}))} /><DateInp value={draft.postedTo} onChange={v=>setDraft(d=>({...d,postedTo:v}))} /></div></FField>}
        {visibleFields.has("amount")&&<FField label="Amount"><MultiValueInp fieldTitle="Gross Invoice Amount" conditions={draft.amountConds} onChange={v=>setDraft(d=>({...d,amountConds:v}))} numeric/></FField>}
        {visibleFields.has("sapDocNo")&&<FField label="SAP Doc No."><MultiValueInp fieldTitle="SAP Doc No." conditions={draft.sapDocNoConds} onChange={v=>setDraft(d=>({...d,sapDocNoConds:v}))}/></FField>}
        {visibleFields.has("whtType")&&<FField label="WHT Type"><ValueHelpInp selected={draft.whtTypes} getLabel={k=>WHT_TYPES.find(w=>w.v===k)?.l||k} onOpen={()=>setVhOpen("whtType")} placeholder="All WHT Types"/></FField>}
        {visibleFields.has("pmtTerms")&&<FField label="Payment Terms"><Sel value={draft.pmtTerms[0]||""} onChange={v=>setDraft(d=>({...d,pmtTerms:v?[v]:[]}))} opts={[{v:"",l:"All Payment Terms"},...PAYMENT_TERMS.map(p=>({v:p.v,l:`${p.v} – ${p.l}`}))]}/></FField>}
        {visibleFields.has("pmtTermsStatus")&&<FField label="Pmt Terms Status"><Sel value={draft.pmtTermsStatus[0]||""} onChange={v=>setDraft(d=>({...d,pmtTermsStatus:v?[v]:[]}))} opts={[{v:"",l:"All Statuses"},{v:"compliant",l:"Compliant"},{v:"differs",l:"Differs"},{v:"unknown",l:"Unknown"}]}/></FField>}
      </FioriBar>

      {vhOpen==="vendor"&&(
        <ValueHelpDialog title="Vendor"
          cols={[{key:"v",label:"Vendor ID",width:110},{key:"l",label:"Vendor Name",width:260}]}
          rows={Object.values(VENDORS).map((v:any)=>({v:v.id,l:v.name}))}
          keyField="v" labelField="l"
          selected={draft.vendorIds}
          onConfirm={s=>{sd("vendorIds",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="companyCode"&&(
        <ValueHelpDialog title="Company Code"
          cols={[{key:"v",label:"Company...",width:80},{key:"l",label:"Company Name",width:200},{key:"ctrl",label:"Controlling...",width:100},{key:"city",label:"City",width:100},{key:"country",label:"Country/Reg...",width:90},{key:"currency",label:"Currency",width:80},{key:"lang",label:"Language...",width:80},{key:"chart",label:"Chart of",width:70}]}
          rows={COMPANY_CODES} keyField="v" labelField="l"
          selected={draft.companyCodes}
          onConfirm={s=>{sd("companyCodes",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="status"&&(
        <ValueHelpDialog title="Status"
          cols={[{key:"v",label:"Status",width:160},{key:"desc",label:"Description",width:260}]}
          rows={[{v:"Submitted",desc:"Awaiting BRM review"},{v:"Under Review",desc:"BRM is reviewing the invoice"},{v:"Confirmed",desc:"Invoice approved by BRM"},{v:"Rejected",desc:"Invoice rejected by BRM"}]}
          keyField="v" labelField="v"
          selected={draft.statuses}
          onConfirm={s=>{sd("statuses",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="currency"&&(
        <ValueHelpDialog title="Currency"
          cols={[{key:"v",label:"Currency Key",width:120},{key:"l",label:"Description",width:300}]}
          rows={CURRENCIES} keyField="v" labelField="l"
          selected={draft.currencies}
          onConfirm={s=>{sd("currencies",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}
      {vhOpen==="whtType"&&(
        <ValueHelpDialog title="WHT Type"
          cols={[{key:"v",label:"WHT Code",width:120},{key:"l",label:"Description",width:360}]}
          rows={WHT_TYPES.filter(w=>w.v)} keyField="v" labelField="l"
          selected={draft.whtTypes}
          onConfirm={s=>{sd("whtTypes",s);setVhOpen(null);}}
          onClose={()=>setVhOpen(null)}/>
      )}

      <div style={{border:`1px solid ${TK.hdrBorder}`,background:TK.rowBg}}>
        {/* Toolbar — SAP Fiori transparent button bar, always visible */}
        {(()=>{
          const sel=list.filter(i=>selRows.has(i.id));
          const allSameStatus=sel.length>0&&sel.every(i=>i.status===sel[0].status);
          const status=allSameStatus?sel[0]?.status:null;

          // canX: whether currently-selected rows qualify for each action
          const canReview   = status==="Submitted";
          const canAccept   = status==="Submitted"||status==="Under Review";
          const canReject   = status==="Submitted"||status==="Under Review";
          const canPost     = status==="Confirmed";
          const canConvert  = status==="Posted"&&sel.every(i=>i.invoiceType==="Supplier DPR");
          const canClear    = status==="Converted to Invoice";

          // SAP Fiori transparent button — exactly matches "Create / Upload / Copy / Reverse" style
          // Active: dark text, no fill, no border; hover handled via onMouseEnter/Leave
          // Inactive: same but 40% opacity, no cursor
          const [hovBtn,setHovBtn]=useState<string|null>(null);
          const tbBtn=(label,onClick,icon,active)=>{
            const isHov=hovBtn===label&&active;
            return(
              <button key={label} onClick={active?onClick:undefined} disabled={!active}
                onMouseEnter={()=>active&&setHovBtn(label)} onMouseLeave={()=>setHovBtn(null)}
                title={active?undefined:`Select invoice(s) with applicable status to use "${label}"`}
                style={{
                  background:isHov?"#f5f6f7":"transparent",
                  border:"none",
                  color:C.t1,
                  borderRadius:4,
                  padding:"0 0.5625rem",
                  fontSize:14,
                  fontFamily:"'72','72full',Arial,Helvetica,sans-serif",
                  cursor:active?"pointer":"default",
                  height:36,
                  display:"inline-flex",
                  alignItems:"center",
                  gap:5,
                  whiteSpace:"nowrap" as const,
                  fontWeight:"400",
                  letterSpacing:0,
                  opacity:active?1:0.4,
                  transition:"background .08s,opacity .1s",
                  flexShrink:0,
                }}>
                {icon&&<SapIcon name={icon} size={14} color="#32363a"/>}
                <bdi>{label}</bdi>
              </button>
            );
          };

          const sep=<div style={{width:1,height:20,background:C.border,margin:"0 4px",flexShrink:0,alignSelf:"center"}}/>;

          return(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 0.75rem",height:44,background:TK.toolbarBg,borderBottom:`1px solid ${TK.hdrBorder}`}}>
              <div style={{display:"flex",alignItems:"center",gap:0}}>
                <span style={{fontSize:FS.base,fontWeight:700,color:TK.rowText,marginRight:8}}>Invoices</span>
                <span style={{fontSize:FS.sm,color:C.t2,fontWeight:400,marginRight:8}}>({list.length})</span>
                {tbBtn("Review",           ()=>sel.forEach(i=>setUR(i.id)),  "pending", canReview)}
                {tbBtn("Accept",           ()=>sel.forEach(i=>accept(i.id)), "accept",           canAccept)}
                {tbBtn("Reject",           ()=>{if(sel.length===1){setRejM(sel[0]);}else{if(window.confirm(`Reject ${sel.length} selected invoices?`))sel.forEach(i=>setInvoices(p=>p.map(x=>x.id===i.id?{...x,status:"Rejected",rejReason:"Bulk rejection"}:x)));}},"decline",canReject)}
                {sep}
                {tbBtn("Convert to Invoice",()=>sel.forEach(i=>convertDPR(i)), "switch-classes", canConvert)}
                {tbBtn("Clear",            ()=>sel.forEach(i=>clearDPR(i)),    "complete",        canClear)}
                {sel.length>0&&<span style={{fontSize:FS.xs,color:C.t2,marginLeft:8,flexShrink:0}}>{sel.length} selected</span>}
              </div>
              <div style={{display:"flex",gap:0,alignItems:"center"}}>
                <button onClick={()=>{if(allExpanded){setExpanded(new Set());setAllExpanded(false);}else{setExpanded(new Set(list.map((i:any)=>i.id)));setAllExpanded(true);}}}
                  style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.625rem",fontSize:FS.sm,fontFamily:"inherit",fontWeight:400,cursor:"pointer",height:36,display:"flex",alignItems:"center",gap:4}}>
                  <SapIcon name={allExpanded?"collapse-all":"expand-all"} size={14} color={C.t1}/> {allExpanded?"Collapse All":"Expand All"}
                </button>
                <div style={{width:1,height:20,background:C.border,margin:"0 4px"}}/>
                <button onClick={exportCSV} title={selRows.size>0?`Export ${selRows.size} selected row(s)`:"Export all filtered invoices"}
                  style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.5rem",fontSize:FS.sm,fontFamily:"inherit",cursor:"pointer",height:36,display:"flex",alignItems:"center",gap:3}}>
                  <SapIcon name="excel-attachment" size={16} color="#217346"/>
                </button>
                <button onClick={()=>setVsOpen(true)} title="View Settings"
                  style={{background:"transparent",border:"none",color:C.t1,borderRadius:4,padding:"0 0.5rem",fontSize:FS.sm,fontFamily:"inherit",cursor:"pointer",height:36,display:"flex",alignItems:"center"}}>
                  <SapIcon name="action-settings" size={16} color={C.t2}/>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Table */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:1000,tableLayout:"fixed",fontSize:FS.sm}}>
            <colgroup>
              <col style={{width:32}}/>
              <col style={{width:20}}/>
              {visCols.map(c=><col key={c.key} style={{width:colWidth[c.key]}}/>)}
              <col style={{width:32}}/>
            </colgroup>
            <thead>
              <tr style={{background:TK.hdrBg,height:32}}>
                <th style={{padding:"0 0 0 10px",borderBottom:`1px solid ${TK.hdrBorder}`,textAlign:"center"}}>
                  <input type="checkbox" checked={allSel} onChange={toggleAll} style={{cursor:"pointer",width:13,height:13,accentColor:"#0854a0"}}/>
                </th>
                <th style={{borderBottom:`1px solid ${TK.hdrBorder}`,width:20}}/>

                {visCols.map(col=>{
                  const sortVal=colSort[col.key]||"none";
                  const sortIcon=sortVal==="asc"?"▲":sortVal==="desc"?"▼":null;
                  const isRight=["totalAmt","vatAmt","whtAmt","otherFee"].includes(col.key);
                  return(
                    <th key={col.key}
                      onClick={e=>{e.stopPropagation();setColMenu(p=>p?.key===col.key?null:{key:col.key,label:col.label,x:e.clientX,y:e.clientY+4});}}
                      style={{padding:"0 0.5rem",textAlign:isRight?"right":"left",fontSize:FS.sm,fontWeight:700,color:TK.hdrText,borderBottom:`1px solid ${TK.hdrBorder}`,whiteSpace:"nowrap",userSelect:"none" as const,letterSpacing:0,cursor:"pointer"}}
                      title={`Click to configure ${col.label}`}>
                      {col.label}{sortIcon&&<span style={{fontSize:9,marginLeft:3,color:C.primary}}>{sortIcon}</span>}
                    </th>
                  );
                })}
                <th style={{borderBottom:`1px solid ${TK.hdrBorder}`,width:32}}/>
              </tr>
            </thead>
            <tbody>
              {list.length===0?(
                <tr><td colSpan={visCols.length+3}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"48px 0",color:"#6a6d70"}}>
                    <SapIcon name="document" size={36} color="#c8cdd0"/>
                    <span style={{fontSize:FS.base,color:"#6a6d70"}}>No items found.</span>
                  </div>
                </td></tr>
              ):((grpResult=>grpResult.mode==="flat"
                  ?grpResult.rows
                  :grpResult.flatMap((g:any)=>[{__grpHdr:true,key:g.key,groupKey:g.groupKey,count:g.rows.length},...g.rows])
                )(buildGroups(list,colGroup,COL_DEFS_BRM.map(c=>c.key)))).map((inv:any)=>{
                if(inv.__grpHdr)return <GroupHeaderRow key={`grp-${inv.groupKey}`} colSpan={visCols.length+3} label={inv.groupKey} count={inv.count} icon={GRP_ICON[inv.key]||"group"}/>;
                const isSel=selRows.has(inv.id); const isHov=hovRow===inv.id;
                const rowBg=view?.id===inv.id?C.selection:isSel?C.selection:isHov?TK.hovBg:TK.rowBg;
                const cs:any={padding:"0 0.5rem",height:36,borderBottom:`1px solid ${TK.rowBorder}`,fontSize:FS.sm,color:TK.rowText,verticalAlign:"middle"};
                const isExpanded=expanded.has(inv.id);
                const hasItems=inv.items&&inv.items.length>0;
                return(<React.Fragment key={inv.id}>
                  <tr onMouseEnter={()=>setHovRow(inv.id)} onMouseLeave={()=>setHovRow(null)}
                    style={{background:rowBg,transition:"background .08s",cursor:"default"}}>
                    <td style={{...cs,padding:"0 0 0 10px",textAlign:"center",width:32}}>
                      <input type="checkbox" checked={isSel} onChange={()=>toggleSel(inv.id)} style={{cursor:"pointer",width:13,height:13,accentColor:"#0854a0"}}/>
                    </td>
                    <td style={{...cs,padding:0,textAlign:"center",width:20}}>
                      {hasItems&&<button onClick={()=>toggleExpanded(inv.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.primary,padding:0,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",width:20,height:36}}>
                        <span style={{display:"inline-block",transition:"transform .18s",transform:isExpanded?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                      </button>}
                    </td>
                    {!hiddenCols.has("status")&&<td style={cs}>
                      <StatusTag s={inv.status}/>
                      {BRM_STATUS_LABEL[inv.status]&&BRM_STATUS_LABEL[inv.status]!==inv.status&&(
                        <div style={{fontSize:9,color:C.t2,marginTop:2}}>{BRM_STATUS_LABEL[inv.status]}</div>
                      )}
                    </td>}
                    {!hiddenCols.has("invoiceNo")&&<td style={cs}>
                      <button onClick={()=>setView(inv)} style={{background:"none",border:"none",color:TK.link,cursor:"pointer",fontWeight:600,fontSize:FS.sm,padding:0,fontFamily:"inherit",textAlign:"left"}}>{inv.invoiceNo}</button>
                      <div style={{fontSize:FS.xs,color:C.t2,marginTop:1}}>{inv.id}</div>
                    </td>}
                    {!hiddenCols.has("invoiceType")&&<td style={cs}>
                      {inv.invoiceType==="Supplier DPR"
                        ?<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#fef6ee",color:"#c87941",border:"1px solid #f5c98a",borderRadius:3,padding:"2px 7px",fontSize:FS.xs,fontWeight:700,whiteSpace:"nowrap" as const}}>Down Payment Req</span>
                        :<span style={{display:"inline-flex",alignItems:"center",gap:4,background:C.infoBg,color:C.info,border:`1px solid ${C.info}40`,borderRadius:3,padding:"2px 7px",fontSize:FS.xs,fontWeight:600,whiteSpace:"nowrap" as const}}>Invoice</span>
                      }
                    </td>}
                    {!hiddenCols.has("vendor")&&<td style={cs}>
                      <div style={{fontWeight:500,fontSize:FS.sm}}>{inv.vendorName}</div>
                      <div style={{fontSize:FS.xs,color:C.t2}}>{inv.vendorId}</div>
                    </td>}
                    {!hiddenCols.has("compCode")&&<td style={cs}>
                      <span style={{fontFamily:"monospace",fontWeight:600,fontSize:FS.sm,color:TK.link}}>{inv.companyCode||"—"}</span>
                      <div style={{fontSize:FS.xs,color:C.t2}}>{ccName(inv.companyCode)}</div>
                    </td>}
                    {!hiddenCols.has("pmtTerms")&&<td style={cs}><span style={{fontFamily:"monospace",fontWeight:600,fontSize:FS.sm}}>{inv.paymentTerms||"—"}</span></td>}
                    {!hiddenCols.has("pmtTermsStatus")&&(()=>{const ct=(VENDORS[inv.vendorId]?.lfb1||[]).find((r:any)=>r.bukrs===inv.companyCode)?.zterm;const ok=ct&&inv.paymentTerms?inv.paymentTerms===ct:null;return(<td style={cs}>{ok===null?<span style={{color:C.t2,fontSize:FS.sm}}>—</span>:ok?<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#107e3e",fontSize:FS.sm}}><SapIcon name="accept" size={13} color="#107e3e"/>Compliant</span>:<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#df6e0c",fontSize:FS.sm}}><SapIcon name="alert" size={13} color="#df6e0c"/>Differs ({ct})</span>}</td>);})()}
                    {!hiddenCols.has("invDate")&&<td style={cs}><span style={{fontSize:FS.sm}}>{fmtDate(inv.invoiceDate)||"—"}</span></td>}
                    {!hiddenCols.has("submittedAt")&&<td style={cs}><span style={{fontSize:FS.sm}}>{inv.submittedAt?fmtDate(inv.submittedAt):"—"}</span></td>}
                    {!hiddenCols.has("confirmedAt")&&<td style={cs}><span style={{fontSize:FS.sm}}>{inv.confirmedAt?fmtDate(inv.confirmedAt):"—"}</span></td>}
                    {!hiddenCols.has("totalAmt")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontWeight:700,fontSize:FS.sm,fontVariantNumeric:"tabular-nums"}}>{fmtAmt((inv.amount||0)+(inv.vatAmt||0)+(inv.additionalFee||0),inv.currency)}</span>
                    </td>}
                    {!hiddenCols.has("vatAmt")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontVariantNumeric:"tabular-nums",color:C.t2}}>{inv.vatAmt?fmtAmt(inv.vatAmt,inv.currency):"—"}</span>
                    </td>}
                    {!hiddenCols.has("whtAmt")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontVariantNumeric:"tabular-nums",color:C.t2}}>{inv.whtAmt?fmtAmt(inv.whtAmt,inv.currency):"—"}</span>
                    </td>}
                    {!hiddenCols.has("otherFee")&&<td style={{...cs,textAlign:"right"}}>
                      <span style={{fontSize:FS.sm,fontVariantNumeric:"tabular-nums",color:C.t2}}>{inv.additionalFee?fmtAmt(inv.additionalFee,inv.currency):"—"}</span>
                    </td>}
                    {!hiddenCols.has("sapDocNo")&&<td style={cs}>
                      {inv.sapDocNo?(
                        <div>
                          <div style={{display:"inline-flex",alignItems:"center",gap:4}}>
                            <SapIcon name="connected" size={11} color="#107e3e"/>
                            <span style={{fontFamily:"monospace",fontSize:FS.xs,fontWeight:700,color:"#107e3e"}}>{inv.sapDocNo}</span>
                          </div>
                          <div style={{fontSize:9,color:C.t2,marginTop:1}}>{inv.invoiceType==="Supplier DPR"?"SAP FI (DPR)":"SAP MIRO"}</div>
                          {inv.convertedDocNo&&<div style={{fontSize:9,color:C.info,marginTop:1}}>Inv: {inv.convertedDocNo}</div>}
                          {inv.clearingDocNo&&<div style={{fontSize:9,color:C.t2,marginTop:1}}>Clr: {inv.clearingDocNo}</div>}
                        </div>
                      ):(
                        <span style={{fontSize:FS.xs,color:C.t2}}>—</span>
                      )}
                    </td>}
                    <td onClick={()=>setView(inv)} style={{...cs,textAlign:"center",color:view?.id===inv.id?C.primary:C.t2,fontSize:16,fontWeight:300,padding:0,width:32,cursor:"pointer"}}>›</td>
                  </tr>
                  {isExpanded&&hasItems&&(
                    <tr style={{background:C.bg}}>
                      <td colSpan={visCols.length+3} style={{padding:0,borderBottom:`1px solid ${TK.rowBorder}`}}>
                        <div style={{paddingLeft:60,paddingBottom:8,paddingTop:4,paddingRight:8}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:FS.xs,tableLayout:"auto"}}>
                            <thead>
                              <tr style={{background:"#e8f1fb",height:28}}>
                                {["PO Number","PO Item","Qty","UoM","Material ID","Material Description","Unit Price","Item Amount","VAT Code"].map(h=>(
                                  <th key={h} style={{padding:"0 0.5rem",fontWeight:700,color:"#0854a0",textAlign:h==="Qty"||h==="Unit Price"||h==="Item Amount"?"right":"left",whiteSpace:"nowrap",borderBottom:"1px solid #c0d4ed",fontSize:FS.xs}}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map((item:any,idx:number)=>(
                                <tr key={idx} style={{background:idx%2===0?C.card:C.subtle}}>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,whiteSpace:"nowrap"}}>{item.poNo||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t2,fontSize:FS.xs}}>{item.poItem||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,textAlign:"right"}}>{item.qty??""}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t2,fontSize:FS.xs}}>{item.uom||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,fontFamily:"monospace"}}>{item.materialId||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs}}>{item.materialDesc||"—"}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmtAmt(item.unitPrice,inv.currency)}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t1,fontSize:FS.xs,textAlign:"right",fontVariantNumeric:"tabular-nums",fontWeight:600}}>{fmtAmt((item.unitPrice||0)*(item.qty||0),inv.currency)}</td>
                                  <td style={{padding:"4px 0.5rem",color:C.t2,fontSize:FS.xs}}>{item.vatCode||"—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>);
              })}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div style={{display:"flex",alignItems:"center",padding:"0 0.75rem",height:32,background:TK.footerBg,borderTop:`1px solid ${TK.hdrBorder}`}}>
          <span style={{fontSize:FS.xs,color:C.t2}}>{list.length} item{list.length!==1?"s":""}</span>
        </div>
      </div>
      </div>

      {/* FCL Detail Panel with draggable splitter */}
      {view&&<>
        {!fullScreen&&(
          <div onMouseDown={onSplitterDrag}
            style={{width:8,flexShrink:0,cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",background:C.subtle,borderLeft:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,userSelect:"none",alignSelf:"stretch",zIndex:5}}>
            <div style={{display:"flex",flexDirection:"column",gap:3,pointerEvents:"none"}}>
              {[0,1,2,3,4].map(i=><div key={i} style={{width:3,height:3,borderRadius:"50%",background:C.t2,opacity:0.5}}/>)}
            </div>
          </div>
        )}
        <BrmInvoiceDetailPanel
          view={view}
          onClose={()=>{setView(null);setFullScreen(false);}}
          onPdf={setPdfView}
          fullScreen={fullScreen}
          onToggleFullScreen={()=>setFullScreen((f:boolean)=>!f)}
          panelFlex={fullScreen?"1":`0 0 ${100-split}%`}
          onReview={(id:string)=>setUR(id)}
          onAccept={(id:string)=>accept(id)}
          onReject={(inv:any)=>{setRejM(inv);setView(null);}}
          onPost={(inv:any)=>postToSAP(inv)}
          onConvert={(inv:any)=>convertDPR(inv)}
          onClear={(inv:any)=>clearDPR(inv)}
        />
      </>}
      {rejModal&&(
        <Modal title={`Reject Invoice: ${rejModal.invoiceNo}`} onClose={()=>{setRejM(null);setRejR("");}} width={480}>
          <div style={{marginBottom:14}}><Lbl>Rejection Reason *</Lbl><TA value={rejR} onChange={setRejR} placeholder="Explain clearly to the vendor why the invoice is rejected…" rows={4}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="neutral" onClick={()=>{setRejM(null);setRejR("");}}>Cancel</Btn><Btn v="danger" onClick={reject}>Confirm Rejection</Btn></div>
        </Modal>
      )}
      {pdfView&&view&&<PdfViewer filename={pdfView} inv={view} onClose={()=>setPdfView(null)}/>}
      {colMenu&&(
        <ColumnSettingsPopup
          col={colMenu.label} x={colMenu.x} y={colMenu.y}
          sort={colSort[colMenu.key]||"none"}
          onSort={v=>{setColSort(p=>({...p,[colMenu.key]:v}));}}
          groupBy={!!colGroup[colMenu.key]}
          onGroupBy={v=>setColGroup(v?{[colMenu.key]:true}:{[colMenu.key]:false})}
          width={colWidth[colMenu.key]}
          onWidth={v=>setColWidth(p=>({...p,[colMenu.key]:v}))}
          onClose={()=>setColMenu(null)}/>
      )}
      {vsOpen&&<ViewSettingsDialog colDefs={COL_DEFS_BRM} hidden={hiddenCols} onClose={()=>setVsOpen(false)} onApply={h=>{setHiddenCols(new Set(h));setVsOpen(false);}}/>}
      <AdaptFiltersDialog
        open={adaptOpen}
        onClose={()=>setAdaptOpen(false)}
        visibleFields={visibleFields}
        onSave={fields=>setVisibleFields(fields)}
        draft={draft}
        allFields={ALL_FILTER_FIELDS}
        hasValue={(id)=>{
          if(id==="invoiceNo")      return draft.invoiceNoConds.length>0;
          if(id==="vendor")         return draft.vendorIds.length>0;
          if(id==="companyCode")    return draft.companyCodes.length>0;
          if(id==="status")         return draft.statuses.length>0;
          if(id==="currency")       return draft.currencies.length>0;
          if(id==="invoiceDate")    return !!(draft.dateFrom||draft.dateTo);
          if(id==="poNumber")       return draft.poNumbers.length>0;
          if(id==="invoiceType")    return draft.invoiceTypes.length>0;
          if(id==="submittedDate")  return !!(draft.submittedFrom||draft.submittedTo);
          if(id==="approvedDate")   return !!(draft.approvedFrom||draft.approvedTo);
          if(id==="postedDate")     return !!(draft.postedFrom||draft.postedTo);
          if(id==="amount")         return draft.amountConds.length>0;
          if(id==="sapDocNo")       return draft.sapDocNoConds?.length>0;
          if(id==="whtType")        return draft.whtTypes.length>0;
          if(id==="pmtTerms")       return draft.pmtTerms.length>0;
          if(id==="pmtTermsStatus") return draft.pmtTermsStatus.length>0;
          return false;
        }}
      />
    </div>
  );
};
