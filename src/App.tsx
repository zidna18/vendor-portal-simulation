import { useState, useEffect } from "react";

// ── Mock Data ──────────────────────────────────────────────────
const USERS = [
  { id:"V001", role:"vendor", username:"vendor1", password:"demo123", name:"PT Maju Bersama", vendorId:"10000001" },
  { id:"V002", role:"vendor", username:"vendor2", password:"demo123", name:"CV Sukses Mandiri", vendorId:"10000002" },
  { id:"B001", role:"brm",    username:"brm.user", password:"demo123", name:"Ahmad Rizki",  title:"Procurement Manager" },
  { id:"B002", role:"brm",    username:"buyer1",   password:"demo123", name:"Siti Rahma",   title:"Senior Buyer" },
];
const VENDORS = {
  "10000001":{ id:"10000001", name:"PT Maju Bersama",    tax:"01.234.567.8-901.000", addr:"Jl. Sudirman No. 123, Jakarta Selatan 12190", phone:"+62 21 5555-1234", email:"ap@majubersama.co.id",   bank:{name:"Bank Mandiri", acc:"1234-5678-9012", aname:"PT MAJU BERSAMA"},    cat:"Goods & Services", since:"2019-03-15", rep:"Budi Santoso",   status:"Active" },
  "10000002":{ id:"10000002", name:"CV Sukses Mandiri",  tax:"02.345.678.9-012.000", addr:"Jl. Gatot Subroto No. 45, Jakarta Pusat 10270", phone:"+62 21 5555-5678", email:"finance@suksesmandiri.co.id", bank:{name:"BCA",         acc:"9876-5432-1098", aname:"CV SUKSES MANDIRI"}, cat:"Services",         since:"2021-07-22", rep:"Dewi Kusuma",   status:"Active" },
};
// SAP I_CompanyCode — five legal entities
const COMPANY_CODES = [
  { v:"BRMS", l:"PT Bumi Resource Minerals" },
  { v:"CPMS", l:"PT Citra Palu Minerals" },
  { v:"GMIN", l:"PT Gorontalo Minerals" },
  { v:"SHSI", l:"PT Suma Heksa Sinergi" },
  { v:"LMRS", l:"PT Linge Minerals" },
];
const ccName = code => COMPANY_CODES.find(c=>c.v===code)?.l || "";
// SAP I_Currency — ISO 4217 transaction currencies
const CURRENCIES = [
  {v:"IDR",l:"IDR – Indonesian Rupiah"}, {v:"USD",l:"USD – US Dollar"},
  {v:"EUR",l:"EUR – Euro"},              {v:"SGD",l:"SGD – Singapore Dollar"},
  {v:"AUD",l:"AUD – Australian Dollar"}, {v:"JPY",l:"JPY – Japanese Yen"},
  {v:"CNY",l:"CNY – Chinese Yuan"},      {v:"GBP",l:"GBP – British Pound"},
  {v:"MYR",l:"MYR – Malaysian Ringgit"}, {v:"HKD",l:"HKD – Hong Kong Dollar"},
  {v:"SAR",l:"SAR – Saudi Riyal"},
];
// SAP WithholdingTaxType / WithholdingTaxCode — Indonesian Pasal WHT
const WHT_TYPES = [
  {v:"",      l:"— None / Not Applicable —"},
  {v:"PPh21", l:"PPh Pasal 21 – Employment & Professional Income"},
  {v:"PPh22", l:"PPh Pasal 22 – Import & Certain Goods (1.5%)"},
  {v:"PPh23", l:"PPh Pasal 23 – Services, Rent & Royalties (2%)"},
  {v:"PPh26", l:"PPh Pasal 26 – Foreign Entity / Non-Resident (20%)"},
  {v:"PPh4a2",l:"PPh Pasal 4(2) – Final Tax: Rent & Construction (2–4%)"},
];
const INIT_INV = [
  { id:"PI-2025-0001", vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/001", invoiceDate:"2025-06-01", dueDate:"2025-07-01", poNumbers:["4500001234"], companyCode:"BRMS", amount:125000000, currency:"IDR", vatBase:125000000, vatAmt:13750000, whtType:"",      whtBase:0,         whtAmt:0,       desc:"Office supplies Q2 2025",                          status:"Confirmed",    taxDoc:"FP-010.000-25.00000001", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-02", confirmedAt:"2025-06-05", rejReason:"" },
  { id:"PI-2025-0002", vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/002", invoiceDate:"2025-06-10", dueDate:"2025-07-10", poNumbers:["4500001235"], companyCode:"CPMS", amount:87500000,  currency:"IDR", vatBase:87500000,  vatAmt:9625000,  whtType:"",      whtBase:0,         whtAmt:0,       desc:"IT peripherals and accessories",                    status:"Under Review", taxDoc:"FP-010.000-25.00000002", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-11", confirmedAt:null,          rejReason:"" },
  { id:"PI-2025-0003", vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/003", invoiceDate:"2025-06-15", dueDate:"2025-07-15", poNumbers:["4500001236","4500001237"], companyCode:"BRMS", amount:45000000,  currency:"IDR", vatBase:45000000,  vatAmt:4950000,  whtType:"PPh23", whtBase:45000000,  whtAmt:900000,  desc:"Maintenance services June 2025",                    status:"Draft",        taxDoc:"",                       files:[],                                 submittedAt:null,          confirmedAt:null,          rejReason:"" },
  { id:"PI-2025-0004", vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/001", invoiceDate:"2025-06-05", dueDate:"2025-07-05", poNumbers:["4500001238"], companyCode:"SHSI", amount:230000000, currency:"IDR", vatBase:230000000, vatAmt:25300000, whtType:"PPh23", whtBase:230000000, whtAmt:4600000, desc:"Cleaning services contract Q2",                     status:"Submitted",    taxDoc:"FP-010.000-25.00000003", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-06", confirmedAt:null,          rejReason:"" },
  { id:"PI-2025-0005", vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/002", invoiceDate:"2025-06-18", dueDate:"2025-07-18", poNumbers:["4500001239","4500001240"], companyCode:"LMRS", amount:15000000,  currency:"IDR", vatBase:15000000,  vatAmt:1650000,  whtType:"PPh23", whtBase:15000000,  whtAmt:300000,  desc:"Courier services May 2025",                         status:"Rejected",     taxDoc:"FP-010.000-25.00000004", files:["invoice.pdf"],                    submittedAt:"2025-06-19", confirmedAt:null,          rejReason:"Missing Faktur Pajak. Please resubmit with complete tax document." },
  { id:"PI-2025-0006", vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/004", invoiceDate:"2025-06-20", dueDate:"2025-07-20", poNumbers:["4500001241"], companyCode:"GMIN", amount:8500,       currency:"USD", vatBase:8500,       vatAmt:935,      whtType:"PPh26", whtBase:8500,       whtAmt:1700,    desc:"Enterprise software license renewal (Salesforce)",  status:"Submitted",    taxDoc:"FP-010.000-25.00000005", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-21", confirmedAt:null,          rejReason:"" },
  { id:"PI-2025-0007", vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/003", invoiceDate:"2025-06-20", dueDate:"2025-07-20", poNumbers:["4500001242"], companyCode:"CPMS", amount:12000,      currency:"AUD", vatBase:12000,      vatAmt:1320,     whtType:"PPh23", whtBase:12000,      whtAmt:240,     desc:"Training & consulting services – Sydney workshop",  status:"Under Review", taxDoc:"FP-010.000-25.00000006", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-22", confirmedAt:null,          rejReason:"" },
  { id:"PI-2025-0008", vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/004", invoiceDate:"2025-06-22", dueDate:"2025-07-22", poNumbers:["4500001243"], companyCode:"GMIN", amount:45000,      currency:"CNY", vatBase:45000,      vatAmt:4950,     whtType:"",      whtBase:0,         whtAmt:0,       desc:"Manufacturing components supply – June batch",       status:"Draft",        taxDoc:"",                       files:[],                                 submittedAt:null,          confirmedAt:null,          rejReason:"" },
];
const INIT_RFQS = [
  { id:"RFQ-2025-0001", title:"Procurement of Laptops & Workstations", postedDate:"2025-06-01", closingDate:"2025-06-20", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"IT Equipment",    estVal:500000000, desc:"BRM requires 50 laptops and 20 workstations for office expansion.", items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",estPrice:8000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",estPrice:12500000}], status:"Open" },
  { id:"RFQ-2025-0002", title:"Office Supplies Annual Contract",         postedDate:"2025-06-10", closingDate:"2025-06-30", postedBy:"Siti Rahma",   targets:["10000001"],           cat:"Office Supplies", estVal:150000000, desc:"Annual supply of office stationery and printing consumables.",       items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",estPrice:50000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",estPrice:300000}],  status:"Open" },
  { id:"RFQ-2025-0003", title:"Security Services – HO Building",         postedDate:"2025-05-20", closingDate:"2025-06-10", postedBy:"Ahmad Rizki",  targets:["10000002"],           cat:"Services",        estVal:360000000, desc:"Security guard services for Head Office 24/7, 12 months.",           items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",estPrice:8000000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",estPrice:10000000}], status:"Closed" },
];
const INIT_QT = [
  { id:"QT-2025-0001", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations", vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-06-12", validUntil:"2025-07-12", totalAmt:490000000, notes:"Price includes 2-year warranty and free delivery.", status:"Submitted", files:["quotation.pdf"],                    items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:7800000,total:390000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },
  { id:"QT-2025-0002", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract",         vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"",           validUntil:"",           totalAmt:145000000, notes:"Free delivery for orders above IDR 5,000,000.",     status:"Draft",     files:[],                                  items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",unitPrice:45000,total:45000000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",unitPrice:250000,total:50000000}] },
  { id:"QT-2025-0003", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building",         vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-06-08", validUntil:"2025-07-08", totalAmt:350000000, notes:"Includes supervisor and CCTV monitoring.",           status:"Accepted",  files:["quotation.pdf","company_profile.pdf"], items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",unitPrice:7500000,total:90000000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",unitPrice:9000000,total:108000000}] },
];

// ── Theme ──────────────────────────────────────────────────────
const LIGHT = {
  shell:"#1D2D3E", shellHov:"rgba(255,255,255,0.12)",
  primary:"#0070F2", primaryDk:"#0854A0",
  bg:"#F5F6F7", card:"#FFF", field:"#FFF", subtle:"#F4F4F4", border:"#D9D9D9",
  t1:"#32363A", t2:"#6A6D70",
  ok:"#188918", okBg:"#F1FDF6",
  warn:"#E9730C", warnBg:"#FEF7F1",
  err:"#BB0000", errBg:"#FFF2F2",
  info:"#0070F2", infoBg:"#EBF5FB",
  draft:"#6A6D70", draftBg:"#F4F4F4",
  gold:"#C87941",
};
const DARK = {
  shell:"#0B1622", shellHov:"rgba(255,255,255,0.14)",
  primary:"#4DA3FF", primaryDk:"#0854A0",
  bg:"#16191D", card:"#24282E", field:"#2C3137", subtle:"#2A2E34", border:"#3A3F46",
  t1:"#E4E6E8", t2:"#A2A6AB",
  ok:"#4CC15A", okBg:"#16301C",
  warn:"#F0913D", warnBg:"#36281A",
  err:"#FF6B6B", errBg:"#3A2020",
  info:"#4DA3FF", infoBg:"#16293A",
  draft:"#A2A6AB", draftBg:"#2A2E34",
  gold:"#D8945C",
};
// C and STC are mutable bindings reassigned by applyTheme; every component
// reads them from module scope at render time, so a re-render picks up the swap.
let C = LIGHT;
const buildSTC = () => ({
  Draft:       {c:C.draft, bg:C.draftBg},
  Submitted:   {c:C.info,  bg:C.infoBg},
  "Under Review":{c:C.warn, bg:C.warnBg},
  Confirmed:   {c:C.ok,   bg:C.okBg},
  Rejected:    {c:C.err,  bg:C.errBg},
  Open:        {c:C.ok,   bg:C.okBg},
  Closed:      {c:C.draft,bg:C.draftBg},
  Accepted:    {c:C.ok,   bg:C.okBg},
  Withdrawn:   {c:C.draft,bg:C.draftBg},
  Active:      {c:C.ok,   bg:C.okBg},
});
let STC = buildSTC();
const applyTheme = mode => { C = mode==="dark"?DARK:LIGHT; STC = buildSTC(); };

// ── Helpers ────────────────────────────────────────────────────
let SETTINGS = { numFmt:"comma", dateFmt:"YYYY-MM-DD" };
const applySettings = s => { SETTINGS = {...SETTINGS,...s}; };

const idr = n => {
  const t = SETTINGS.numFmt==="dot" ? "." : ",";
  return "IDR " + Math.round(Number(n||0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, t);
};
const fmtAmt = (n, currency = "IDR") => {
  const dec = currency==="IDR" ? 0 : 2;
  const t = SETTINGS.numFmt==="dot" ? "." : ",";
  const d = SETTINGS.numFmt==="dot" ? "," : ".";
  const [ip, dp] = Number(n||0).toFixed(dec).split(".");
  return `${currency} ${ip.replace(/\B(?=(\d{3})+(?!\d))/g, t)}${dp ? d+dp : ""}`;
};
const fmtDate = d => {
  if (!d) return "—";
  const p = String(d).split("-");
  if (p.length !== 3 || p[0].length !== 4) return d;
  const [y,m,day] = p;
  switch(SETTINGS.dateFmt) {
    case "DD/MM/YYYY": return `${day}/${m}/${y}`;
    case "MM/DD/YYYY": return `${m}/${day}/${y}`;
    case "DD.MM.YYYY": return `${day}.${m}.${y}`;
    case "MM.DD.YYYY": return `${m}.${day}.${y}`;
    case "DD-MM-YYYY": return `${day}-${m}-${y}`;
    case "YYYY/MM/DD": return `${y}/${m}/${day}`;
    default: return d;
  }
};
const parseToISO = raw => {
  if (!raw) return "";
  const fmt = SETTINGS.dateFmt;
  const sep = fmt.includes("/") ? "/" : fmt.includes(".") ? "." : "-";
  const parts = raw.split(sep);
  if (parts.length !== 3) return "";
  let y, m, day;
  if (fmt.startsWith("DD"))      { [day, m, y] = parts; }
  else if (fmt.startsWith("MM")) { [m, day, y] = parts; }
  else                           { [y, m, day] = parts; }
  if (!y || y.length !== 4) return "";
  const iso = `${y}-${m.padStart(2,"0")}-${day.padStart(2,"0")}`;
  return isNaN(new Date(iso).getTime()) ? "" : iso;
};
const uid = () => Date.now().toString(36);
const fmtPOs = inv => { const a=inv.poNumbers?.length?inv.poNumbers:inv.poNumber?[inv.poNumber]:[]; return a.join(", ")||"—"; };

const Badge = ({s}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  return <span style={{display:"inline-block",padding:"2px 9px",borderRadius:4,fontSize:11,fontWeight:700,color:x.c,background:x.bg,border:`1px solid ${x.c}33`}}>{s}</span>;
};

const Card = ({children,style={}}) => (
  <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:20,marginBottom:14,...style}}>{children}</div>
);

const Btn = ({children,onClick,v="primary",sm,disabled,style={}}) => {
  const VS = {
    primary:{background:C.primary,color:"#fff",border:"none"},
    ghost:  {background:"transparent",color:C.primary,border:`1px solid ${C.primary}`},
    danger: {background:C.err,color:"#fff",border:"none"},
    success:{background:C.ok,color:"#fff",border:"none"},
    neutral:{background:C.subtle,color:C.t1,border:`1px solid ${C.border}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...VS[v],borderRadius:4,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:600,fontSize:sm?12:13,padding:sm?"3px 10px":"7px 14px",opacity:disabled?.5:1,transition:"opacity .15s",...style}}>{children}</button>;
};

const Inp = ({value,onChange,placeholder="",type="text",style={}}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",padding:"7px 9px",borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",...style}}/>
);
const DateInp = ({value, onChange, style={}}) => {
  const [raw, setRaw] = useState(value ? fmtDate(value) : "");
  const handle = v => {
    setRaw(v);
    if (!v) { onChange(""); return; }
    const iso = parseToISO(v);
    if (iso) onChange(iso);
  };
  return <Inp value={raw} onChange={handle} placeholder={SETTINGS.dateFmt} style={style}/>;
};
const Sel = ({value,onChange,opts,style={}}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"7px 9px",borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.t1,outline:"none",boxSizing:"border-box",background:C.field,...style}}>
    {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);
const TA = ({value,onChange,placeholder="",rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:"100%",padding:"7px 9px",borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
);
const Lbl = ({children}) => <div style={{fontSize:11,color:C.t2,marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:.4}}>{children}</div>;
const Val = ({children}) => <div style={{fontSize:13,color:C.t1}}>{children||"—"}</div>;
const Sep = () => <div style={{height:1,background:C.border,margin:"14px 0"}}/>;

const Modal = ({title,onClose,children,width=640}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
    <div style={{background:C.card,borderRadius:8,width,maxWidth:"95vw",maxHeight:"90vh",overflow:"auto",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.card,zIndex:1}}>
        <span style={{fontWeight:700,fontSize:15,color:C.t1}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.t2,lineHeight:1}}>✕</button>
      </div>
      <div style={{padding:18}}>{children}</div>
    </div>
  </div>
);

const FilterBar = ({opts,val,onChange}) => (
  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
    {opts.map(f=>(
      <button key={f} onClick={()=>onChange(f)} style={{padding:"4px 13px",borderRadius:14,cursor:"pointer",fontSize:12,border:`1px solid ${val===f?C.primary:C.border}`,background:val===f?C.infoBg:C.card,color:val===f?C.primary:C.t2,fontWeight:val===f?700:400,fontFamily:"inherit"}}>
        {f}
      </button>
    ))}
  </div>
);

const Th = ({children}) => <th style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:C.t2,borderBottom:`1px solid ${C.border}`,background:C.subtle,textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap"}}>{children}</th>;
const Td = ({children,style={}}) => <td style={{padding:"9px 12px",fontSize:13,color:C.t1,borderBottom:`1px solid ${C.border}`,...style}}>{children}</td>;

// ── Shell Bar ──────────────────────────────────────────────────
const Shell = ({user,onLogout,section,setSection,theme,onToggleTheme,onOpenSettings}) => {
  const nav = user.role==="vendor"
    ? [{id:"dashboard",l:"🏠 Home"},{id:"profile",l:"👤 Profile"},{id:"invoice",l:"🧾 Invoice"},{id:"quotation",l:"📝 Quotation"}]
    : [{id:"dashboard",l:"🏠 Home"},{id:"brm-invoice",l:"🧾 Invoice Mgmt"},{id:"brm-quotation",l:"📋 Quotation Mgmt"},{id:"brm-rfq",l:"📢 RFQ Mgmt"}];
  return (
    <div style={{background:C.shell,color:"#fff",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
      <div style={{display:"flex",alignItems:"center",padding:"0 16px",height:46}}>
        <div style={{fontWeight:800,fontSize:15,marginRight:20,whiteSpace:"nowrap",letterSpacing:.3}}>
          <span style={{color:"#F0A500"}}>▣ </span>BRM Vendor Portal
        </div>
        <div style={{display:"flex",gap:2,flex:1,overflow:"auto"}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setSection(n.id)} style={{
              background:section===n.id?C.shellHov:"transparent",
              color:"#fff",border:"none",cursor:"pointer",padding:"0 13px",height:46,fontFamily:"inherit",
              fontSize:12,fontWeight:section===n.id?700:400,whiteSpace:"nowrap",
              borderBottom:`2px solid ${section===n.id?"#F0A500":"transparent"}`,
            }}>{n.l}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:10}}>
          <button onClick={onToggleTheme} title={theme==="dark"?"Switch to light mode":"Switch to dark mode"} style={{background:"rgba(255,255,255,0.13)",color:"#fff",border:"none",cursor:"pointer",borderRadius:4,width:30,height:30,fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>{theme==="dark"?"☀️":"🌙"}</button>
          <button onClick={onOpenSettings} title="Settings" style={{background:"rgba(255,255,255,0.13)",color:"#fff",border:"none",cursor:"pointer",borderRadius:4,width:30,height:30,fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>⚙️</button>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:10,opacity:.65}}>{user.role==="vendor"?"Supplier":"BRM Employee"}</div>
          </div>
          <div style={{width:30,height:30,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{user.name[0]}</div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.13)",color:"#fff",border:"none",cursor:"pointer",borderRadius:4,padding:"4px 10px",fontSize:11,fontFamily:"inherit"}}>Sign Out</button>
        </div>
      </div>
    </div>
  );
};

// ── Login ──────────────────────────────────────────────────────
const Login = ({onLogin}) => {
  const [username,setU]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setL]=useState(false); const [role,setRole]=useState("vendor");
  const go=()=>{
    setL(true);setErr("");
    setTimeout(()=>{
      const u=USERS.find(x=>x.username===username&&x.password===pw&&x.role===role);
      u?onLogin(u):(setErr("Invalid credentials. Please try again."),setL(false));
    },700);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0D1B2A 0%,#1D2D3E 55%,#2C3E50 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{marginBottom:28,textAlign:"center",color:"#fff"}}>
        <div style={{fontSize:13,letterSpacing:3,color:"#F0A500",fontWeight:700,marginBottom:8}}>SAP BTP · ACCENTURE</div>
        <div style={{fontSize:30,fontWeight:800,letterSpacing:.5}}>BRM Vendor Portal</div>
        <div style={{fontSize:13,opacity:.55,marginTop:5}}>End-to-end digital collaboration platform</div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:32,width:370,boxShadow:"0 20px 60px rgba(0,0,0,0.35)"}}>
        <div style={{fontSize:18,fontWeight:800,color:C.t1,marginBottom:4}}>Sign In</div>
        <div style={{fontSize:12,color:C.t2,marginBottom:20}}>Select your role and enter credentials</div>
        <div style={{marginBottom:14}}>
          <Lbl>Login As</Lbl>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            {[["vendor","🏭 Vendor"],["brm","🏢 BRM Employee"]].map(([r,l])=>(
              <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"8px 0",borderRadius:4,cursor:"pointer",border:`2px solid ${role===r?C.primary:C.border}`,background:role===r?"#EBF5FB":"#fff",color:role===r?C.primary:C.t2,fontWeight:700,fontSize:12,fontFamily:"inherit"}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:12}}><Lbl>Username</Lbl><Inp value={username} onChange={setU} placeholder="username"/></div>
        <div style={{marginBottom:18}}><Lbl>Password</Lbl><Inp value={pw} onChange={setPw} placeholder="password" type="password"/></div>
        {err&&<div style={{color:C.err,fontSize:12,marginBottom:14,padding:"8px 10px",background:C.errBg,borderRadius:4}}>{err}</div>}
        <Btn onClick={go} disabled={loading} style={{width:"100%",padding:"9px 0",justifyContent:"center"}}>{loading?"Signing in…":"Sign In"}</Btn>
        <div style={{marginTop:22,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.t2,fontWeight:700,marginBottom:8,letterSpacing:.5}}>QUICK DEMO ACCESS</div>
          {[["vendor1","🏭 PT Maju Bersama (Vendor)"],["vendor2","🏭 CV Sukses Mandiri (Vendor)"],["brm.user","🏢 Ahmad Rizki – Procurement Manager"]].map(([u,l])=>(
            <button key={u} onClick={()=>onLogin(USERS.find(x=>x.username===u))} style={{display:"block",width:"100%",textAlign:"left",padding:"7px 10px",marginBottom:5,borderRadius:4,border:`1px solid ${C.border}`,background:"#F9F9F9",cursor:"pointer",fontSize:12,fontFamily:"inherit",color:C.t1}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:20}}>© 2025 BRM · Accenture · SAP BTP Public Cloud</div>
    </div>
  );
};

// ── Vendor Dashboard ───────────────────────────────────────────
const VendorHome = ({user,invoices,quotations,rfqs,setSection}) => {
  const v=VENDORS[user.vendorId];
  const mi=invoices.filter(i=>i.vendorId===user.vendorId);
  const mq=quotations.filter(q=>q.vendorId===user.vendorId);
  const mr=rfqs.filter(r=>r.targets.includes(user.vendorId));
  const stats=[
    {l:"Total Invoices",n:mi.length,sub:`${mi.filter(i=>i.status==="Confirmed").length} Confirmed`,c:C.primary,ico:"📄"},
    {l:"Pending Review",n:mi.filter(i=>["Submitted","Under Review"].includes(i.status)).length,sub:"Awaiting BRM action",c:C.warn,ico:"⏳"},
    {l:"Open RFQs",n:mr.filter(r=>r.status==="Open").length,sub:"Pending your quotation",c:C.ok,ico:"📋"},
    {l:"My Quotations",n:mq.length,sub:`${mq.filter(q=>q.status==="Accepted").length} Accepted`,c:C.gold,ico:"✅"},
  ];
  const tiles=[
    {id:"profile", ico:"👤", t:"Vendor Profile",     d:"View company info, bank details, and tax registration sourced from SAP Business Partner API",  bg:C.infoBg},
    {id:"invoice", ico:"🧾", t:"Invoice Submission",  d:"Submit invoices with mandatory legal documents. Track status from submission to SAP posting.",   bg:C.okBg},
    {id:"quotation",ico:"📝",t:"Quotation & RFQ",     d:"View RFQs sent by BRM and submit competitive quotations with pricing and commercial terms.",      bg:C.warnBg},
  ];
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.t1}}>Welcome, {v.name}</div>
        <div style={{fontSize:12,color:C.t2,marginTop:3}}>Vendor ID: {user.vendorId} · {v.cat} · Status: <span style={{color:C.ok,fontWeight:700}}>Active</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {stats.map(s=>(
          <Card key={s.l} style={{padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:11,color:C.t2,fontWeight:600}}>{s.l}</div>
                <div style={{fontSize:30,fontWeight:800,color:s.c,margin:"4px 0"}}>{s.n}</div>
                <div style={{fontSize:11,color:C.t2}}>{s.sub}</div>
              </div>
              <span style={{fontSize:22}}>{s.ico}</span>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
        {tiles.map(t=>(
          <div key={t.id} onClick={()=>setSection(t.id)} style={{background:t.bg,borderRadius:8,border:`1px solid ${C.border}`,padding:22,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",transition:"box-shadow .2s"}}>
            <div style={{fontSize:28,marginBottom:10}}>{t.ico}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.t1,marginBottom:7}}>{t.t}</div>
            <div style={{fontSize:12,color:C.t2,lineHeight:1.6}}>{t.d}</div>
            <div style={{marginTop:14,color:C.primary,fontSize:12,fontWeight:700}}>Open →</div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:C.t1}}>Recent Invoice Activity</div>
        {mi.length===0?<div style={{color:C.t2,fontSize:13}}>No invoices submitted yet.</div>:mi.slice(0,4).map(inv=>(
          <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
            <div><div style={{fontWeight:600,fontSize:13}}>{inv.invoiceNo}</div><div style={{fontSize:11,color:C.t2}}>{inv.desc} · {fmtDate(inv.invoiceDate)}</div></div>
            <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <div style={{fontSize:12,fontWeight:700}}>{fmtAmt(inv.amount, inv.currency)}</div>
              <Badge s={inv.status}/>
            </div>
          </div>
        ))}
        <button onClick={()=>setSection("invoice")} style={{marginTop:10,background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:700,padding:0}}>View all invoices →</button>
      </Card>
    </div>
  );
};

// ── Vendor Profile ─────────────────────────────────────────────
const VendorProfile = ({user}) => {
  const [loading,setL]=useState(true);
  useEffect(()=>{setTimeout(()=>setL(false),700);},[]);
  const v=VENDORS[user.vendorId];
  if(loading) return <div style={{padding:60,textAlign:"center",color:C.t2,fontSize:14}}>⏳ Fetching data from SAP Business Partner API (A_BusinessPartner)…</div>;
  return (
    <div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>Vendor Profile</div>
          <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 OData: /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('{v.id}')</div>
        </div>
        <Badge s={v.status}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <div style={{fontWeight:700,fontSize:13,color:C.primary,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>Company Information</div>
          {[["Business Partner ID",v.id],["Legal Name",v.name],["Tax ID (NPWP)",v.tax],["Category",v.cat],["Vendor Since",fmtDate(v.since)],["PIC / Representative",v.rep]].map(([l,val])=>(
            <div key={l} style={{marginBottom:12}}><Lbl>{l}</Lbl><Val>{val}</Val></div>
          ))}
        </Card>
        <div>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:C.primary,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>Contact & Address</div>
            {[["Registered Address",v.addr],["Phone",v.phone],["Email",v.email]].map(([l,val])=>(
              <div key={l} style={{marginBottom:12}}><Lbl>{l}</Lbl><Val>{val}</Val></div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:C.primary,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>Bank Account</div>
            {[["Bank Name",v.bank.name],["Account Number",v.bank.acc],["Account Holder",v.bank.aname]].map(([l,val])=>(
              <div key={l} style={{marginBottom:12}}><Lbl>{l}</Lbl><Val>{val}</Val></div>
            ))}
          </Card>
        </div>
      </div>
      <div style={{padding:12,background:C.warnBg,borderRadius:6,border:`1px solid ${C.warn}33`,fontSize:12,color:C.t2}}>
        ℹ️ <strong style={{color:C.warn}}>Read-only view.</strong> Vendor master data is managed directly in SAP S/4HANA Public Cloud. Changes must be submitted through the official vendor data change process.
      </div>
    </div>
  );
};

// ── PO Value Help ──────────────────────────────────────────────
const PoValueHelp = ({values,onConfirm,onClose}) => {
  const [items,setItems]=useState([...values]);
  const [raw,setRaw]=useState("");
  const parse=txt=>txt.split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean);
  const applyRaw=()=>{const p=parse(raw);if(p.length)setItems(prev=>[...new Set([...prev,...p])]);setRaw("");};
  const pasteClip=async()=>{
    try{const t=await navigator.clipboard.readText();const p=parse(t);if(p.length)setItems(prev=>[...new Set([...prev,...p])]);setRaw("");}
    catch{alert("Clipboard access denied. Please paste manually into the field.");}
  };
  return (
    <Modal title="PO Number – Value Help" onClose={onClose} width={500}>
      <div style={{fontSize:10,color:C.t2,marginBottom:12}}>📡 SAP API: A_PurchaseOrder (OData v4) · Separate entries by newline, comma, or semicolon</div>
      <Lbl>Paste or type PO numbers</Lbl>
      <div style={{display:"flex",gap:8,marginBottom:6}}>
        <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"4500001234\n4500001235\n4500001236"} rows={4}
          style={{flex:1,padding:"7px 10px",background:C.field,border:`1px solid ${C.border}`,borderRadius:4,color:C.t1,fontSize:12,fontFamily:"monospace",resize:"vertical",outline:"none"}}/>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <Btn v="neutral" sm onClick={pasteClip}>Paste</Btn>
          <Btn v="primary" sm onClick={applyRaw}>Add →</Btn>
        </div>
      </div>
      <div style={{marginBottom:14,fontSize:11,color:C.t2}}>Click <strong>Paste</strong> to read from clipboard automatically, or type and click <strong>Add</strong>.</div>
      <Lbl>Selected PO Numbers ({items.length})</Lbl>
      <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden",marginBottom:16,minHeight:40}}>
        {items.length===0&&<div style={{padding:"12px 16px",color:C.t2,fontSize:12,textAlign:"center"}}>No PO numbers selected yet.</div>}
        {items.map((po,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:i%2===0?C.subtle:C.card,borderBottom:i<items.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontFamily:"monospace",fontSize:12}}>{po}</span>
            <button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:12,padding:"0 4px"}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn v="neutral" onClick={onClose}>Cancel</Btn>
        <Btn v="primary" onClick={()=>onConfirm(items)}>Confirm ({items.length} PO{items.length!==1?"s":""})</Btn>
      </div>
    </Modal>
  );
};

// ── Invoice Form Modal ─────────────────────────────────────────
const InvoiceFormModal = ({inv,onSave,onClose,vendorId,vendorName}) => {
  const isNew=!inv;
  const [f,setF]=useState(inv?{...inv}:{invoiceNo:"",invoiceDate:"",dueDate:"",poNumbers:[],companyCode:"",currency:"IDR",amount:"",vatBase:0,vatAmt:0,whtType:"",whtBase:0,whtAmt:0,desc:"",taxDoc:"",status:"Draft",files:[],vendorId,vendorName});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const [showPoHelp,setShowPoHelp]=useState(false);
  const addFile=name=>{if(!f.files.includes(name))s("files",[...(f.files||[]),name]);};
  const rmFile=i=>s("files",f.files.filter((_,j)=>j!==i));
  const save=draft=>{
    if(!draft&&!(f.poNumbers||[]).length){alert("Please add at least one PO Number before submitting.");return;}
    if(!draft&&!f.companyCode){alert("Please select a Company Code before submitting.");return;}
    if(!draft&&!f.taxDoc){alert("Please enter Faktur Pajak number before submitting.");return;}
    if(!draft&&(f.files||[]).length<2){alert("Please upload both Invoice PDF and Faktur Pajak PDF before submitting.");return;}
    const obj={...f,status:draft?"Draft":"Submitted",id:f.id||`PI-${uid()}`,submittedAt:draft?null:new Date().toISOString().split("T")[0]};
    onSave(obj);
  };
  return (
    <Modal title={isNew?"Add New Invoice":`Edit Invoice: ${inv.invoiceNo}`} onClose={onClose} width={740}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{gridColumn:"1/-1"}}>
          <Lbl>Company Code *</Lbl>
          <Sel value={f.companyCode} onChange={v=>s("companyCode",v)} opts={[{v:"",l:"— Select Company Code —"},...COMPANY_CODES.map(c=>({v:c.v,l:`${c.v} – ${c.l}`}))]}/>
          <div style={{fontSize:10,color:C.t2,marginTop:3}}>📡 SAP CDS: I_CompanyCode</div>
        </div>
        <div><Lbl>Invoice Number *</Lbl><Inp value={f.invoiceNo} onChange={v=>s("invoiceNo",v)} placeholder="INV/XXX/2025/001"/></div>
        <div style={{gridColumn:"1/-1"}}>
          <Lbl>PO Number *</Lbl>
          <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden",background:C.field,minHeight:38}}>
            <div onClick={()=>setShowPoHelp(true)} style={{flex:1,display:"flex",flexWrap:"wrap",gap:4,padding:"5px 8px",alignContent:"flex-start",cursor:"pointer",minHeight:36}}>
              {!(f.poNumbers||[]).length&&<span style={{color:C.t2,fontSize:12,alignSelf:"center",pointerEvents:"none"}}>— click or press value help to add PO numbers —</span>}
              {(f.poNumbers||[]).map((po,i)=>(
                <span key={i} style={{display:"inline-flex",alignItems:"center",background:C.card,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px 8px",fontSize:12,gap:6,lineHeight:"20px"}}>
                  <span style={{fontFamily:"monospace"}}>{po}</span>
                  <button onClick={e=>{e.stopPropagation();s("poNumbers",(f.poNumbers||[]).filter((_,j)=>j!==i));}} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:11,padding:0,lineHeight:1}}>✕</button>
                </span>
              ))}
            </div>
            <button onClick={()=>setShowPoHelp(true)} title="Open Value Help" style={{padding:"0 14px",background:C.subtle,border:"none",borderLeft:`1px solid ${C.border}`,cursor:"pointer",fontSize:12,color:C.t1,fontWeight:700,letterSpacing:1}}>...</button>
          </div>
          <div style={{fontSize:10,color:C.t2,marginTop:3}}>📡 SAP API: A_PurchaseOrder · Click field or <strong>...</strong> for Value Help (F4)</div>
        </div>
        <div><Lbl>Invoice Date *</Lbl><DateInp value={f.invoiceDate} onChange={v=>s("invoiceDate",v)}/></div>
        <div><Lbl>Due Date *</Lbl><DateInp value={f.dueDate} onChange={v=>s("dueDate",v)}/></div>
        <div>
          <Lbl>Transaction Currency *</Lbl>
          <Sel value={f.currency} onChange={v=>s("currency",v)} opts={CURRENCIES.map(c=>({v:c.v,l:c.l}))}/>
          <div style={{fontSize:10,color:C.t2,marginTop:3}}>📡 SAP API: I_Currency</div>
        </div>
        <div><Lbl>Amount *</Lbl><Inp type="number" value={f.amount} onChange={v=>s("amount",v)} placeholder="0"/></div>
        <div><Lbl>VAT Base Amount</Lbl><Inp type="number" value={f.vatBase} onChange={v=>s("vatBase",v)} placeholder="0"/></div>
        <div><Lbl>VAT Amount</Lbl><Inp type="number" value={f.vatAmt} onChange={v=>s("vatAmt",v)} placeholder="0"/></div>
        <div style={{gridColumn:"1/-1"}}>
          <Lbl>WHT Type</Lbl>
          <Sel value={f.whtType} onChange={v=>s("whtType",v)} opts={WHT_TYPES}/>
          <div style={{fontSize:10,color:C.t2,marginTop:3}}>📡 SAP API: WithholdingTaxType / WithholdingTaxCode</div>
        </div>
        <div><Lbl>WHT Base Amount</Lbl><Inp type="number" value={f.whtBase} onChange={v=>s("whtBase",v)} placeholder="0"/></div>
        <div><Lbl>WHT Amount</Lbl><Inp type="number" value={f.whtAmt} onChange={v=>s("whtAmt",v)} placeholder="0"/></div>
        <div style={{gridColumn:"1/-1"}}><Lbl>Faktur Pajak (Tax Doc No.) *</Lbl><Inp value={f.taxDoc} onChange={v=>s("taxDoc",v)} placeholder="FP-010.000-25.00000001"/></div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Description *</Lbl><TA value={f.desc} onChange={v=>s("desc",v)} placeholder="Description of goods / services"/></div>
      <div style={{padding:14,background:C.subtle,borderRadius:6,border:`1px dashed ${C.border}`}}>
        <div style={{fontWeight:700,fontSize:12,marginBottom:6}}>📎 Mandatory Attachments</div>
        <div style={{fontSize:11,color:C.t2,marginBottom:10}}>Both Invoice PDF and Faktur Pajak PDF are required before submission.</div>
        {(f.files||[]).map((a,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:C.card,borderRadius:4,marginBottom:6,border:`1px solid ${C.border}`,fontSize:12}}>
            <span>📄 {a}</span>
            <button onClick={()=>rmFile(i)} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:11}}>Remove</button>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          {!f.files?.includes("invoice.pdf")&&<Btn v="neutral" sm onClick={()=>addFile("invoice.pdf")}>+ Upload Invoice PDF</Btn>}
          {!f.files?.includes("faktur_pajak.pdf")&&<Btn v="neutral" sm onClick={()=>addFile("faktur_pajak.pdf")}>+ Upload Faktur Pajak PDF</Btn>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
        <Btn v="neutral" onClick={onClose}>Cancel</Btn>
        <Btn v="ghost" onClick={()=>save(true)}>Save as Draft</Btn>
        <Btn v="primary" onClick={()=>save(false)}>Submit Invoice</Btn>
      </div>
      {showPoHelp&&<PoValueHelp values={f.poNumbers||[]} onConfirm={pns=>{s("poNumbers",pns);setShowPoHelp(false);}} onClose={()=>setShowPoHelp(false)}/>}
    </Modal>
  );
};

// ── Vendor Invoice ─────────────────────────────────────────────
const VendorInvoice = ({user,invoices,setInvoices}) => {
  const [showForm,setForm]=useState(false); const [editing,setEd]=useState(null); const [view,setView]=useState(null); const [flt,setFlt]=useState("All");
  const v=VENDORS[user.vendorId];
  const mine=invoices.filter(i=>i.vendorId===user.vendorId).filter(i=>flt==="All"||i.status===flt);
  const save=obj=>{setInvoices(p=>p.find(i=>i.id===obj.id)?p.map(i=>i.id===obj.id?obj:i):[...p,obj]);setForm(false);setEd(null);};
  const withdraw=id=>{if(window.confirm("Withdraw this invoice? Status will return to Draft."))setInvoices(p=>p.map(i=>i.id===id?{...i,status:"Draft",submittedAt:null}:i));};
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>Invoice Management</div>
          <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 Pre-Invoice → Custom CDS Table → SAP Supplier Invoice API (on BRM confirmation) → Flexible Workflow</div>
        </div>
        <Btn onClick={()=>{setEd(null);setForm(true);}}>+ Add Invoice</Btn>
      </div>
      <FilterBar opts={["All","Draft","Submitted","Under Review","Confirmed","Rejected"]} val={flt} onChange={setFlt}/>
      <Card style={{padding:0,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
          <thead><tr>{["Invoice No.","PO Number","Company Code","Date","Due Date","Amount","Files","Status","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {mine.length===0?<tr><Td colSpan={9} style={{textAlign:"center",padding:40,color:C.t2}}>No invoices found.</Td></tr>:mine.map(inv=>(
              <tr key={inv.id}>
                <Td><button onClick={()=>setView(inv)} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontWeight:700,fontSize:13,padding:0}}>{inv.invoiceNo}</button><div style={{fontSize:10,color:C.t2}}>{inv.id}</div></Td>
                <Td>{fmtPOs(inv)}</Td>
                <Td><span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:C.primary}}>{inv.companyCode||"—"}</span><div style={{fontSize:10,color:C.t2}}>{ccName(inv.companyCode)}</div></Td>
                <Td>{fmtDate(inv.invoiceDate)}</Td><Td>{fmtDate(inv.dueDate)}</Td>
                <Td style={{fontWeight:700}}>{fmtAmt(inv.amount, inv.currency)}</Td>
                <Td>{inv.files?.length>=2?<span style={{color:C.ok,fontSize:12}}>✓ {inv.files.length} file(s)</span>:<span style={{color:C.warn,fontSize:12}}>⚠ Incomplete</span>}</Td>
                <Td><Badge s={inv.status}/></Td>
                <Td><div style={{display:"flex",gap:5}}>
                  {["Draft","Rejected"].includes(inv.status)&&<Btn v="ghost" sm onClick={()=>{setEd(inv);setForm(true);}}>Edit</Btn>}
                  {inv.status==="Submitted"&&<Btn v="neutral" sm onClick={()=>withdraw(inv.id)}>Withdraw</Btn>}
                </div></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {view&&(
        <Modal title={`Invoice Detail: ${view.invoiceNo}`} onClose={()=>setView(null)} width={660}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["Invoice No.",view.invoiceNo],["Pre-Invoice ID",view.id],["Company Code",view.companyCode?`${view.companyCode} – ${ccName(view.companyCode)}`:"—"],["Invoice Date",fmtDate(view.invoiceDate)],["Due Date",fmtDate(view.dueDate)],["Amount",fmtAmt(view.amount,view.currency)],["Faktur Pajak",view.taxDoc],["Submitted",fmtDate(view.submittedAt)]].map(([l,val])=>(
              <div key={l}><Lbl>{l}</Lbl><Val>{val}</Val></div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <Lbl>PO Numbers</Lbl>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
              {(view.poNumbers||[view.poNumber]).filter(Boolean).map((po,i)=><span key={i} style={{background:C.subtle,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px 8px",fontSize:12,fontFamily:"monospace"}}>{po}</span>)}
            </div>
          </div>
          <Sep/>
          <div style={{fontWeight:700,fontSize:11,color:C.t2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Tax & Financial Breakdown</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div><Lbl>VAT Base Amount</Lbl><Val>{fmtAmt(view.vatBase||0,view.currency)}</Val></div>
            <div><Lbl>VAT Amount</Lbl><Val>{fmtAmt(view.vatAmt||0,view.currency)}</Val></div>
            {view.whtType&&<><div style={{gridColumn:"1/-1"}}><Lbl>WHT Type</Lbl><Val>{WHT_TYPES.find(w=>w.v===view.whtType)?.l||view.whtType}</Val></div><div><Lbl>WHT Base Amount</Lbl><Val>{fmtAmt(view.whtBase||0,view.currency)}</Val></div><div><Lbl>WHT Amount</Lbl><Val>{fmtAmt(view.whtAmt||0,view.currency)}</Val></div></>}
          </div>
          <div style={{marginBottom:12}}><Lbl>Description</Lbl><Val>{view.desc}</Val></div>
          <div style={{marginBottom:12}}><Lbl>Status</Lbl><Badge s={view.status}/></div>
          <div style={{marginBottom:12}}><Lbl>Attachments</Lbl>{(view.files||[]).map(a=><div key={a} style={{fontSize:13,color:C.primary}}>📄 {a}</div>)}{!view.files?.length&&<Val/>}</div>
          {view.rejReason&&<div style={{padding:10,background:C.errBg,borderRadius:4,fontSize:12,color:C.err,marginBottom:12}}><strong>Rejection Reason:</strong> {view.rejReason}</div>}
          {view.status==="Confirmed"&&<div style={{padding:10,background:C.okBg,borderRadius:4,fontSize:12,color:C.ok}}>✓ Invoice confirmed by BRM. SAP Supplier Invoice created via <code>API_SUPPLIERINVOICE_PROCESS_SRV</code>. Flexible Workflow initiated for payment approval.</div>}
        </Modal>
      )}
      {showForm&&<InvoiceFormModal inv={editing} onSave={save} onClose={()=>{setForm(false);setEd(null);}} vendorId={user.vendorId} vendorName={v.name}/>}
    </div>
  );
};

// ── Quotation Form Modal ───────────────────────────────────────
const QtFormModal = ({rfq,qt,onSave,onClose,vendorId,vendorName}) => {
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
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
            📄 {a}
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
const VendorQuotation = ({user,quotations,setQuotations,rfqs}) => {
  const [tab,setTab]=useState("rfq"); const [quotingRfq,setQR]=useState(null); const [editingQt,setEQ]=useState(null); const [viewQt,setVQ]=useState(null); const [flt,setFlt]=useState("All");
  const myRfqs=rfqs.filter(r=>r.targets.includes(user.vendorId));
  const mine=quotations.filter(q=>q.vendorId===user.vendorId);
  const mineF=mine.filter(q=>flt==="All"||q.status===flt);
  const quoted=rfqId=>mine.find(q=>q.rfqId===rfqId);
  const save=qt=>{setQuotations(p=>p.find(q=>q.id===qt.id)?p.map(q=>q.id===qt.id?qt:q):[...p,qt]);setQR(null);setEQ(null);};
  const withdraw=id=>{if(window.confirm("Withdraw quotation?"))setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Withdrawn"}:q));};
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:800}}>Quotation & RFQ</div>
        <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 RFQ: SAP Purchasing API (A_PurchaseRequisition) · Quotation: Custom CDS Table on BTP</div>
      </div>
      <div style={{display:"flex",gap:0,marginBottom:18,borderBottom:`1px solid ${C.border}`}}>
        {[{id:"rfq",l:`Open RFQs (${myRfqs.filter(r=>r.status==="Open").length})`},{id:"my",l:`My Quotations (${mine.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 18px",cursor:"pointer",border:"none",background:"none",fontFamily:"inherit",fontSize:13,fontWeight:tab===t.id?700:400,color:tab===t.id?C.primary:C.t2,borderBottom:`2px solid ${tab===t.id?C.primary:"transparent"}`}}>{t.l}</button>
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
                    <Td>{qt.files?.length>0?<span style={{color:C.ok,fontSize:12}}>✓ {qt.files.length}</span>:"—"}</Td>
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
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
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

// ── BRM Dashboard ──────────────────────────────────────────────
const BrmHome = ({user,invoices,quotations,rfqs,setSection}) => {
  const pending=invoices.filter(i=>["Submitted","Under Review"].includes(i.status));
  const confirmed=invoices.filter(i=>i.status==="Confirmed");
  const pendingQt=quotations.filter(q=>q.status==="Submitted");
  const stats=[
    {l:"Invoices Pending",n:pending.length,c:C.warn,ico:"⏳",s:"brm-invoice"},
    {l:"Invoices Confirmed",n:confirmed.length,c:C.ok,ico:"✅",s:"brm-invoice"},
    {l:"Quotations to Evaluate",n:pendingQt.length,c:C.primary,ico:"📋",s:"brm-quotation"},
    {l:"Open RFQs",n:rfqs.filter(r=>r.status==="Open").length,c:C.gold,ico:"📢",s:"brm-rfq"},
  ];
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:800}}>Procurement Dashboard</div>
        <div style={{fontSize:12,color:C.t2,marginTop:3}}>Welcome, {user.name} · {user.title} · SAP S/4HANA Public Cloud (BTP Vendor Portal)</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {stats.map(s=>(
          <div key={s.l} onClick={()=>setSection(s.s)} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:16,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:11,color:C.t2,fontWeight:600}}>{s.l}</div><span style={{fontSize:20}}>{s.ico}</span></div>
            <div style={{fontSize:30,fontWeight:800,color:s.c,margin:"6px 0"}}>{s.n}</div>
            <div style={{fontSize:12,color:C.primary}}>View →</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>⏳ Invoices Awaiting Action</div>
          {pending.length===0?<div style={{color:C.t2,fontSize:13}}>No invoices pending review.</div>:pending.slice(0,5).map(inv=>(
            <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{fontWeight:600,fontSize:13}}>{inv.invoiceNo}</div><div style={{fontSize:11,color:C.t2}}>{inv.vendorName} · {fmtDate(inv.invoiceDate)}</div></div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><div style={{fontSize:12,fontWeight:700}}>{fmtAmt(inv.amount, inv.currency)}</div><Badge s={inv.status}/></div>
            </div>
          ))}
          {pending.length>5&&<button onClick={()=>setSection("brm-invoice")} style={{marginTop:10,background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:700,padding:0}}>View all {pending.length} pending →</button>}
        </Card>
        <Card>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📋 Quotations to Evaluate</div>
          {pendingQt.length===0?<div style={{color:C.t2,fontSize:13}}>No quotations awaiting evaluation.</div>:pendingQt.slice(0,5).map(qt=>(
            <div key={qt.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{fontWeight:600,fontSize:12,maxWidth:180,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{qt.rfqTitle}</div><div style={{fontSize:11,color:C.t2}}>{qt.vendorName}</div></div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><div style={{fontSize:12,fontWeight:700}}>{idr(qt.totalAmt)}</div><Badge s={qt.status}/></div>
            </div>
          ))}
          {pendingQt.length>5&&<button onClick={()=>setSection("brm-quotation")} style={{marginTop:10,background:"none",border:"none",color:C.primary,cursor:"pointer",fontSize:12,fontWeight:700,padding:0}}>View all →</button>}
        </Card>
      </div>
    </div>
  );
};

// ── BRM Invoice Mgmt ───────────────────────────────────────────
const BrmInvoice = ({invoices,setInvoices}) => {
  const [flt,setFlt]=useState("All"); const [vFlt,setVFlt]=useState("All"); const [view,setView]=useState(null); const [rejModal,setRejM]=useState(null); const [rejR,setRejR]=useState("");
  const vids=[...new Set(invoices.map(i=>i.vendorId))];
  const list=invoices.filter(i=>flt==="All"||i.status===flt).filter(i=>vFlt==="All"||i.vendorId===vFlt);
  const accept=id=>{setInvoices(p=>p.map(i=>i.id===id?{...i,status:"Confirmed",confirmedAt:new Date().toISOString().split("T")[0]}:i));setView(null);};
  const reject=()=>{if(!rejR){alert("Provide a rejection reason.");return;}setInvoices(p=>p.map(i=>i.id===rejModal.id?{...i,status:"Rejected",rejReason:rejR}:i));setRejM(null);setRejR("");setView(null);};
  const setUR=id=>setInvoices(p=>p.map(i=>i.id===id?{...i,status:"Under Review"}:i));
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:800}}>Invoice Management – All Vendors</div>
        <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 On Accept: <code>API_SUPPLIERINVOICE_PROCESS_SRV</code> triggered → SAP Flexible Workflow initiated (Parked → Posted)</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <FilterBar opts={["All","Submitted","Under Review","Confirmed","Rejected"]} val={flt} onChange={setFlt}/>
        <Sel value={vFlt} onChange={setVFlt} style={{width:200}} opts={[{v:"All",l:"All Vendors"},...vids.map(id=>({v:id,l:VENDORS[id]?.name||id}))]}/>
      </div>
      <Card style={{padding:0,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
          <thead><tr>{["Invoice No.","Vendor","Company Code","PO No.","Inv. Date","Amount","Files","Status","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {list.length===0?<tr><Td colSpan={9} style={{textAlign:"center",padding:40,color:C.t2}}>No invoices found.</Td></tr>:list.map(inv=>(
              <tr key={inv.id}>
                <Td><button onClick={()=>setView(inv)} style={{background:"none",border:"none",color:C.primary,cursor:"pointer",fontWeight:700,fontSize:13,padding:0}}>{inv.invoiceNo}</button><div style={{fontSize:10,color:C.t2}}>{inv.id}</div></Td>
                <Td><div style={{fontWeight:500}}>{inv.vendorName}</div><div style={{fontSize:10,color:C.t2}}>{inv.vendorId}</div></Td>
                <Td><span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:C.primary}}>{inv.companyCode||"—"}</span><div style={{fontSize:10,color:C.t2}}>{ccName(inv.companyCode)}</div></Td>
                <Td>{fmtPOs(inv)}</Td><Td>{fmtDate(inv.invoiceDate)}</Td>
                <Td style={{fontWeight:700}}>{fmtAmt(inv.amount, inv.currency)}</Td>
                <Td>{inv.files?.length>=2?<span style={{color:C.ok,fontSize:12}}>✓ Complete</span>:<span style={{color:C.warn,fontSize:12}}>⚠ Incomplete</span>}</Td>
                <Td><Badge s={inv.status}/></Td>
                <Td><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {inv.status==="Submitted"&&<><Btn v="neutral" sm onClick={()=>setUR(inv.id)}>Review</Btn><Btn v="success" sm onClick={()=>accept(inv.id)}>Accept</Btn><Btn v="danger" sm onClick={()=>setRejM(inv)}>Reject</Btn></>}
                  {inv.status==="Under Review"&&<><Btn v="success" sm onClick={()=>accept(inv.id)}>Accept</Btn><Btn v="danger" sm onClick={()=>setRejM(inv)}>Reject</Btn></>}
                </div></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {view&&(
        <Modal title={`Invoice Review: ${view.invoiceNo}`} onClose={()=>setView(null)} width={680}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["Invoice No.",view.invoiceNo],["Pre-Invoice ID",view.id],["Vendor",view.vendorName],["Vendor ID",view.vendorId],["Company Code",view.companyCode?`${view.companyCode} – ${ccName(view.companyCode)}`:"—"],["Invoice Date",fmtDate(view.invoiceDate)],["Due Date",fmtDate(view.dueDate)],["Amount",fmtAmt(view.amount,view.currency)],["Faktur Pajak",view.taxDoc],["Status",null]].map(([l,val])=>(
              <div key={l}><Lbl>{l}</Lbl>{l==="Status"?<Badge s={view.status}/>:<Val>{val}</Val>}</div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <Lbl>PO Numbers</Lbl>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
              {(view.poNumbers||[view.poNumber]).filter(Boolean).map((po,i)=><span key={i} style={{background:C.subtle,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px 8px",fontSize:12,fontFamily:"monospace"}}>{po}</span>)}
            </div>
          </div>
          <Sep/>
          <div style={{fontWeight:700,fontSize:11,color:C.t2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Tax & Financial Breakdown</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div><Lbl>VAT Base Amount</Lbl><Val>{fmtAmt(view.vatBase||0,view.currency)}</Val></div>
            <div><Lbl>VAT Amount</Lbl><Val>{fmtAmt(view.vatAmt||0,view.currency)}</Val></div>
            {view.whtType&&<><div style={{gridColumn:"1/-1"}}><Lbl>WHT Type</Lbl><Val>{WHT_TYPES.find(w=>w.v===view.whtType)?.l||view.whtType}</Val></div><div><Lbl>WHT Base Amount</Lbl><Val>{fmtAmt(view.whtBase||0,view.currency)}</Val></div><div><Lbl>WHT Amount</Lbl><Val>{fmtAmt(view.whtAmt||0,view.currency)}</Val></div></>}
          </div>
          <div style={{marginBottom:12}}><Lbl>Description</Lbl><Val>{view.desc}</Val></div>
          <div style={{marginBottom:14}}><Lbl>Attachments</Lbl>{(view.files||[]).map(a=><div key={a} style={{fontSize:13,color:C.primary}}>📄 {a}</div>)}{!view.files?.length&&<Val/>}</div>
          <div style={{padding:10,background:C.infoBg,borderRadius:4,fontSize:11,color:C.primary,marginBottom:14}}>
            <strong>SAP Integration:</strong> Accepting will call <code>API_SUPPLIERINVOICE_PROCESS_SRV</code> to park the Supplier Invoice in SAP S/4HANA Public Cloud and trigger Flexible Workflow for posting approval.
          </div>
          {["Submitted","Under Review"].includes(view.status)&&(
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn v="danger" onClick={()=>{setRejM(view);setView(null);}}>Reject</Btn>
              <Btn v="success" onClick={()=>accept(view.id)}>Accept & Create SAP Invoice</Btn>
            </div>
          )}
        </Modal>
      )}
      {rejModal&&(
        <Modal title={`Reject Invoice: ${rejModal.invoiceNo}`} onClose={()=>{setRejM(null);setRejR("");}} width={480}>
          <div style={{marginBottom:14}}><Lbl>Rejection Reason *</Lbl><TA value={rejR} onChange={setRejR} placeholder="Explain clearly to the vendor why the invoice is rejected…" rows={4}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="neutral" onClick={()=>{setRejM(null);setRejR("");}}>Cancel</Btn><Btn v="danger" onClick={reject}>Confirm Rejection</Btn></div>
        </Modal>
      )}
    </div>
  );
};

// ── BRM Quotation Mgmt ─────────────────────────────────────────
const BrmQuotation = ({quotations,setQuotations,rfqs}) => {
  const [flt,setFlt]=useState("All"); const [view,setView]=useState(null);
  const list=quotations.filter(q=>flt==="All"||q.status===flt);
  const accept=id=>{setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Accepted"}:q));setView(null);};
  const reject=id=>{if(window.confirm("Reject this quotation?"))setQuotations(p=>p.map(q=>q.id===id?{...q,status:"Rejected"}:q));setView(null);};
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:800}}>Quotation Management – All Vendors</div>
        <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 Vendor quotations from Custom CDS Table on BTP · Compare and award to best bidder</div>
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
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["Quotation ID",view.id],["RFQ ID",view.rfqId],["Vendor",view.vendorName],["Vendor ID",view.vendorId],["Submitted",fmtDate(view.submittedDate)],["Valid Until",fmtDate(view.validUntil)],["Total",idr(view.totalAmt)],["Status",null]].map(([l,val])=>(
              <div key={l}><Lbl>{l}</Lbl>{l==="Status"?<Badge s={view.status}/>:<Val>{val}</Val>}</div>
            ))}
          </div>
          <Lbl>Line Items</Lbl>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,margin:"6px 0 14px"}}>
            <thead><tr style={{background:C.subtle}}>{["Description","Qty","UoM","Unit Price","Total"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{view.items.map((it,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"6px 10px"}}>{it.desc}</td><td style={{padding:"6px 10px"}}>{it.qty}</td><td style={{padding:"6px 10px"}}>{it.uom}</td><td style={{padding:"6px 10px"}}>{idr(it.unitPrice)}</td><td style={{padding:"6px 10px",fontWeight:700}}>{idr(it.total)}</td></tr>)}</tbody>
          </table>
          {view.notes&&<div style={{marginBottom:12}}><Lbl>Notes / Commercial Terms</Lbl><Val>{view.notes}</Val></div>}
          {view.files?.length>0&&<div style={{marginBottom:14}}><Lbl>Attachments</Lbl>{view.files.map(a=><div key={a} style={{fontSize:13,color:C.primary}}>📄 {a}</div>)}</div>}
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

// ── BRM RFQ Mgmt ───────────────────────────────────────────────
const BrmRfq = ({rfqs,setRfqs,quotations}) => {
  const [showForm,setForm]=useState(false); const [view,setView]=useState(null); const [flt,setFlt]=useState("All");
  const [f,setF]=useState({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",items:[{no:1,desc:"",qty:1,uom:"Unit",estPrice:0}]});
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const list=rfqs.filter(r=>flt==="All"||r.status===flt);
  const getQts=rfqId=>quotations.filter(q=>q.rfqId===rfqId);
  const addItem=()=>setF(p=>({...p,items:[...p.items,{no:p.items.length+1,desc:"",qty:1,uom:"Unit",estPrice:0}]}));
  const updItem=(i,k,v)=>setF(p=>({...p,items:p.items.map((it,j)=>j===i?{...it,[k]:v}:it)}));
  const publish=()=>{
    if(!f.title||!f.closingDate||f.targets.length===0){alert("Please fill title, closing date, and select at least one vendor.");return;}
    setRfqs(p=>[...p,{...f,id:`RFQ-${uid()}`,postedDate:new Date().toISOString().split("T")[0],postedBy:"Ahmad Rizki",status:"Open",estVal:Number(f.estVal),items:f.items.map(it=>({...it,qty:Number(it.qty),estPrice:Number(it.estPrice)}))}]);
    setForm(false);
    setF({title:"",cat:"",closingDate:"",desc:"",targets:[],estVal:"",items:[{no:1,desc:"",qty:1,uom:"Unit",estPrice:0}]});
  };
  return (
    <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>RFQ Management</div>
          <div style={{fontSize:11,color:C.t2,marginTop:3}}>📡 RFQ published to BTP Vendor Portal → Vendor notified → Quotations collected</div>
        </div>
        <Btn onClick={()=>setForm(true)}>+ Create RFQ</Btn>
      </div>
      <FilterBar opts={["All","Open","Closed"]} val={flt} onChange={setFlt}/>
      {list.map(rfq=>{
        const qts=getQts(rfq.id);
        return(
          <Card key={rfq.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:14}}>{rfq.title}</span>
                  <Badge s={rfq.status}/>
                  <span style={{fontSize:11,color:C.t2}}>{qts.length} quotation(s) received</span>
                </div>
                <div style={{fontSize:11,color:C.t2,marginBottom:6}}>{rfq.id} · {rfq.cat} · Posted: {fmtDate(rfq.postedDate)} · Closing: <strong>{fmtDate(rfq.closingDate)}</strong> · By: {rfq.postedBy}</div>
                <div style={{fontSize:12,color:C.t1,marginBottom:6}}>{rfq.desc}</div>
                <div style={{fontSize:11,color:C.t2}}>Vendors: {rfq.targets.map(v=>VENDORS[v]?.name).join(", ")} · Est. {idr(rfq.estVal)}</div>
              </div>
              <Btn v="ghost" sm onClick={()=>setView(rfq)} style={{marginLeft:12}}>Details</Btn>
            </div>
            {qts.length>0&&(
              <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:8}}>RECEIVED QUOTATIONS</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {qts.map(qt=>(
                    <div key={qt.id} style={{padding:"6px 12px",background:C.subtle,borderRadius:4,fontSize:12,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:600}}>{qt.vendorName}</span>
                      <span style={{color:C.t2}}>·</span>
                      <span style={{fontWeight:700}}>{idr(qt.totalAmt)}</span>
                      <Badge s={qt.status}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {view&&(
        <Modal title={`RFQ Detail: ${view.title}`} onClose={()=>setView(null)} width={700}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["RFQ ID",view.id],["Category",view.cat],["Posted",fmtDate(view.postedDate)],["Closing",fmtDate(view.closingDate)],["Est. Value",idr(view.estVal)],["Status",null]].map(([l,val])=>(
              <div key={l}><Lbl>{l}</Lbl>{l==="Status"?<Badge s={view.status}/>:<Val>{val}</Val>}</div>
            ))}
          </div>
          <div style={{marginBottom:12}}><Lbl>Description</Lbl><Val>{view.desc}</Val></div>
          <div style={{marginBottom:12}}><Lbl>Target Vendors</Lbl>{view.targets.map(v=><div key={v} style={{fontSize:13}}>🏭 {VENDORS[v]?.name} ({v})</div>)}</div>
          <Lbl>Line Items</Lbl>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,margin:"6px 0"}}>
            <thead><tr style={{background:C.subtle}}>{["Description","Qty","UoM","Est. Price","Total Est."].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{view.items.map((it,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"6px 10px"}}>{it.desc}</td><td style={{padding:"6px 10px"}}>{it.qty}</td><td style={{padding:"6px 10px"}}>{it.uom}</td><td style={{padding:"6px 10px"}}>{idr(it.estPrice)}</td><td style={{padding:"6px 10px",fontWeight:700}}>{idr(it.estPrice*it.qty)}</td></tr>)}</tbody>
          </table>
        </Modal>
      )}
      {showForm&&(
        <Modal title="Create & Publish New RFQ" onClose={()=>setForm(false)} width={760}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><Lbl>RFQ Title *</Lbl><Inp value={f.title} onChange={v=>sf("title",v)} placeholder="e.g. Procurement of Office Chairs"/></div>
            <div><Lbl>Category *</Lbl><Inp value={f.cat} onChange={v=>sf("cat",v)} placeholder="e.g. Furniture"/></div>
            <div><Lbl>Closing Date *</Lbl><DateInp value={f.closingDate} onChange={v=>sf("closingDate",v)}/></div>
            <div style={{gridColumn:"1/-1"}}><Lbl>Estimated Value (IDR)</Lbl><Inp type="number" value={f.estVal} onChange={v=>sf("estVal",v)}/></div>
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
              <div key={i} style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr 2fr",gap:8,marginBottom:8}}>
                <Inp value={it.desc} onChange={v=>updItem(i,"desc",v)} placeholder="Item description"/>
                <Inp type="number" value={it.qty} onChange={v=>updItem(i,"qty",v)} placeholder="Qty"/>
                <Inp value={it.uom} onChange={v=>updItem(i,"uom",v)} placeholder="UoM"/>
                <Inp type="number" value={it.estPrice} onChange={v=>updItem(i,"estPrice",v)} placeholder="Est. Unit Price"/>
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

// ── Settings Modal ─────────────────────────────────────────────
const SettingsModal = ({settings,onUpdate,onClose}) => {
  const btnStyle = (active) => ({
    display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:8,
    borderRadius:6,border:`2px solid ${active?C.primary:C.border}`,
    background:active?C.infoBg:C.card,cursor:"pointer",width:"100%",textAlign:"left",
    fontFamily:"inherit",
  });
  const NUM_FMTS = [
    {v:"comma", sample:"1,234,567.89", desc:"Comma — thousand separator, dot — decimal"},
    {v:"dot",   sample:"1.234.567,89", desc:"Dot — thousand separator, comma — decimal"},
  ];
  const DATE_FMTS = [
    {v:"YYYY-MM-DD", ex:"2025-06-25"},
    {v:"DD/MM/YYYY", ex:"25/06/2025"},
    {v:"MM/DD/YYYY", ex:"06/25/2025"},
    {v:"DD.MM.YYYY", ex:"25.06.2025"},
    {v:"MM.DD.YYYY", ex:"06.25.2025"},
    {v:"DD-MM-YYYY", ex:"25-06-2025"},
    {v:"YYYY/MM/DD", ex:"2025/06/25"},
  ];
  return (
    <Modal title="⚙️ Settings" onClose={onClose} width={520}>
      <div style={{marginBottom:6,fontWeight:700,fontSize:13,color:C.t1}}>Number Format</div>
      <div style={{fontSize:11,color:C.t2,marginBottom:12}}>Controls thousand and decimal separators for all amounts.</div>
      {NUM_FMTS.map(f=>(
        <button key={f.v} style={btnStyle(settings.numFmt===f.v)} onClick={()=>onUpdate({numFmt:f.v})}>
          <input type="radio" readOnly checked={settings.numFmt===f.v} style={{accentColor:C.primary,flexShrink:0}}/>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.t1,fontFamily:"monospace"}}>{f.sample}</div>
            <div style={{fontSize:11,color:C.t2,marginTop:2}}>{f.desc}</div>
          </div>
        </button>
      ))}
      <Sep/>
      <div style={{marginBottom:6,fontWeight:700,fontSize:13,color:C.t1}}>Date Format</div>
      <div style={{fontSize:11,color:C.t2,marginBottom:12}}>Controls how dates are displayed across the portal.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {DATE_FMTS.map(f=>(
          <button key={f.v} style={{...btnStyle(settings.dateFmt===f.v),flexDirection:"column",alignItems:"flex-start",gap:2}} onClick={()=>onUpdate({dateFmt:f.v})}>
            <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
              <input type="radio" readOnly checked={settings.dateFmt===f.v} style={{accentColor:C.primary,flexShrink:0}}/>
              <span style={{fontWeight:700,fontSize:12,color:C.t1,fontFamily:"monospace"}}>{f.v}</span>
            </div>
            <div style={{fontSize:11,color:C.t2,paddingLeft:24}}>{f.ex}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
};

// ── App Root ───────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [section,setSection]=useState("dashboard");
  const [theme,setTheme]=useState("light");
  const toggleTheme=()=>{const n=theme==="dark"?"light":"dark";applyTheme(n);setTheme(n);};
  const [settings,setSettings]=useState({numFmt:"comma",dateFmt:"YYYY-MM-DD"});
  const [showSettings,setShowSettings]=useState(false);
  const updateSettings=s=>{const n={...settings,...s};applySettings(n);setSettings(n);};
  const [invoices,setInvoices]=useState(INIT_INV);
  const [quotations,setQuotations]=useState(INIT_QT);
  const [rfqs,setRfqs]=useState(INIT_RFQS);
  const login=u=>{setUser(u);setSection("dashboard");};
  const logout=()=>{setUser(null);setSection("dashboard");};
  if(!user) return <Login onLogin={login}/>;
  const render=()=>{
    if(user.role==="vendor") switch(section){
      case "profile":   return <VendorProfile user={user}/>;
      case "invoice":   return <VendorInvoice user={user} invoices={invoices} setInvoices={setInvoices}/>;
      case "quotation": return <VendorQuotation user={user} quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      default:          return <VendorHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection}/>;
    }
    switch(section){
      case "brm-invoice":   return <BrmInvoice invoices={invoices} setInvoices={setInvoices}/>;
      case "brm-quotation": return <BrmQuotation quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      case "brm-rfq":       return <BrmRfq rfqs={rfqs} setRfqs={setRfqs} quotations={quotations}/>;
      default:              return <BrmHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection}/>;
    }
  };
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",fontSize:13,color:C.t1}}>
      <Shell user={user} onLogout={logout} section={section} setSection={setSection} theme={theme} onToggleTheme={toggleTheme} onOpenSettings={()=>setShowSettings(true)}/>
      {showSettings&&<SettingsModal settings={settings} onUpdate={updateSettings} onClose={()=>setShowSettings(false)}/>}
      <div style={{minHeight:"calc(100vh - 46px)"}}>{render()}</div>
      <div style={{textAlign:"center",padding:"16px 0",fontSize:11,color:C.t2,borderTop:`1px solid ${C.border}`,background:C.card,marginTop:20}}>
        BRM Vendor Portal · Powered by SAP BTP & Accenture · © 2025 BRM
      </div>
    </div>
  );
}
