import { useState, useEffect, useRef } from "react";

export let VENDORS: Record<string,any> = {};

// SAP I_CompanyCode – five legal entities
export const COMPANY_CODES = [
  { v:"BRMS", l:"PT Bumi Resource Minerals",  ctrl:"A000", city:"Jakarta",   country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"CPMS", l:"PT Citra Palu Minerals",      ctrl:"A000", city:"Poboya",    country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"GMIN", l:"PT Gorontalo Minerals",       ctrl:"A000", city:"Gorontalo", country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"SHSI", l:"PT Suma Heksa Sinergi",       ctrl:"A000", city:"Banten",    country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"LMRS", l:"PT Linge Minerals",           ctrl:"A000", city:"Aceh",      country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
];
export const ccName = code => COMPANY_CODES.find(c=>c.v===code)?.l || "";
export const PURCHASING_GROUPS = [
  {v:"A00",l:"Finance & Accounting"},{v:"A01",l:"Finance"},{v:"A02",l:"Accounting"},{v:"A03",l:"Tax"},{v:"A04",l:"Assets & Cost Center"},
  {v:"B00",l:"Support & Service"},{v:"B01",l:"Human Resources"},{v:"B02",l:"General Affair"},{v:"B03",l:"ITE"},{v:"B04",l:"Facilities Maintenance"},
  {v:"C00",l:"Supply Chain Management"},{v:"C01",l:"Procurement"},{v:"C02",l:"Warehouse & Inventory"},{v:"C03",l:"Logistics"},
  {v:"D00",l:"External Relations"},{v:"D01",l:"Government Relations"},{v:"D02",l:"Community Relations"},{v:"D03",l:"Community Development"},{v:"D04",l:"Land Management"},{v:"D05",l:"Security"},
  {v:"E00",l:"Geology Development"},{v:"E01",l:"Exploration"},{v:"E02",l:"Resource Development"},
  {v:"F00",l:"Mining Open Pit"},{v:"F01",l:"OP Mine Operation"},{v:"F02",l:"OP Mine Geo"},{v:"F03",l:"OP Mine Technical"},{v:"F04",l:"OP Infrastructure & Maintenance"},
  {v:"G00",l:"Mining Underground"},{v:"G01",l:"UG Mine Operation"},{v:"G02",l:"UG Mine Geo"},{v:"G03",l:"UG Technical Services"},{v:"G04",l:"UG Infrastructure & Maintenance"},
  {v:"H00",l:"HSE & Compliance"},{v:"H01",l:"Health"},{v:"H02",l:"Safety"},{v:"H03",l:"Environment"},{v:"H04",l:"Reporting & Compliance"},{v:"H05",l:"Emergency Response"},
  {v:"I00",l:"Infrastructure"},{v:"I01",l:"Engineering"},{v:"I02",l:"Building & Facilities"},{v:"I03",l:"Utilities"},
  {v:"J00",l:"Processing Plant"},{v:"J01",l:"CIL Plant Operations"},{v:"J02",l:"HL Plant Operations"},{v:"J03",l:"Metallurgy"},{v:"J04",l:"Plant Project Improvement"},{v:"J05",l:"Dry Tailing & Dewatering"},{v:"J06",l:"Plant Maintenance"},
  {v:"K00",l:"Legal & Corporate"},{v:"L00",l:"Investor Relations"},{v:"M00",l:"Internal Audit"},{v:"N00",l:"Risk Management"},
  {v:"Z10",l:"Bulk Materials"},{v:"Z20",l:"Corporate & Digital"},{v:"Z30",l:"Plant"},{v:"Z40",l:"Mining"},{v:"Z50",l:"Civil Work"},{v:"Z60",l:"Technical Services"},{v:"Z70",l:"Operations Support"},
];
// SAP Purchasing Org – code mirrors Company Code 1:1
export const PURCH_ORGS = [
  { v:"BRMS", l:"Purchasing Org. Jakarta",   bukrs:"BRMS" },
  { v:"CPMS", l:"Purchasing Org. Palu",      bukrs:"CPMS" },
  { v:"GMIN", l:"Purchasing Org. Gorontalo", bukrs:"GMIN" },
  { v:"SHSI", l:"Purchasing Org. Banten",    bukrs:"SHSI" },
  { v:"LMRS", l:"Purchasing Org. Aceh",      bukrs:"LMRS" },
];
// SAP I_Currency – ISO 4217 transaction currencies
export const CURRENCIES = [
  {v:"IDR",l:"IDR – Indonesian Rupiah"}, {v:"USD",l:"USD – US Dollar"},
  {v:"EUR",l:"EUR – Euro"},              {v:"SGD",l:"SGD – Singapore Dollar"},
  {v:"AUD",l:"AUD – Australian Dollar"}, {v:"JPY",l:"JPY – Japanese Yen"},
  {v:"CNY",l:"CNY – Chinese Yuan"},      {v:"GBP",l:"GBP – British Pound"},
  {v:"MYR",l:"MYR – Malaysian Ringgit"}, {v:"HKD",l:"HKD – Hong Kong Dollar"},
  {v:"SAR",l:"SAR – Saudi Riyal"},
];
// SAP WithholdingTaxType / WithholdingTaxCode – Indonesian Pasal WHT
export const WHT_TYPES = [
  {v:"",      l:"– None / Not Applicable –"},
  {v:"PPh21", l:"PPh Pasal 21 – Employment & Professional Income"},
  {v:"PPh22", l:"PPh Pasal 22 – Import & Certain Goods (1.5%)"},
  {v:"PPh23", l:"PPh Pasal 23 – Services, Rent & Royalties (2%)"},
  {v:"PPh26", l:"PPh Pasal 26 – Foreign Entity / Non-Resident (20%)"},
  {v:"PPh4a2",l:"PPh Pasal 4(2) – Final Tax: Rent & Construction (2–4%)"},
];
// SAP I_PaymentTerms
export const PAYMENT_TERMS = [
  {v:"Z000", l:"Due immediately",    days:0},
  {v:"Z007", l:"Due within 7 days",  days:7},
  {v:"Z014", l:"Due within 14 days", days:14},
  {v:"Z030", l:"Due within 30 days", days:30},
  {v:"Z045", l:"Due within 45 days", days:45},
  {v:"Z060", l:"Due within 60 days", days:60},
];
const _topDays:{[k:string]:number}={Z000:0,Z007:7,Z014:14,Z030:30,Z045:45,Z060:60};
export const calcDueDate=(invDate:string,top:string):string=>{if(!invDate||!top)return "";const d=new Date(invDate);d.setDate(d.getDate()+(_topDays[top]||0));return d.toISOString().split("T")[0];};


// â"€â"€ Theme â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// SAP Fiori Quartz Light – exact design tokens from quartzlight.css
const LIGHT = {
  shell:"#354a5f", shellHov:"rgba(255,255,255,0.15)",
  primary:"#0a6ed1", primaryDk:"#0854a0",
  bg:"#f7f7f7", card:"#ffffff", field:"#ffffff", subtle:"#f2f2f2", border:"#d9d9d9", fieldBorder:"#89919a",
  t1:"#1d2d3e", t2:"#6a6d70",
  ok:"#107e3e", okBg:"#f1fdf6",
  warn:"#df6e0c", warnBg:"#fef7f1",
  err:"#bb0000", errBg:"#ffebeb",
  info:"#0a6ed1", infoBg:"#dff0fd",
  draft:"#6a6d70", draftBg:"#f4f4f4",
  gold:"#c87941",
  hover:"#ededed", selection:"#e8f2fb",
};
// SAP Fiori Horizon Dark
const DARK = {
  shell:"#1b2534", shellHov:"rgba(255,255,255,0.14)",
  primary:"#64b5f6", primaryDk:"#4da3ff",
  bg:"#16191d", card:"#1c2128", field:"#23292f", subtle:"#252c36", border:"#3d444d", fieldBorder:"#56616d",
  t1:"#d1e4f4", t2:"#8696a9",
  ok:"#4cc15a", okBg:"#16301c",
  warn:"#f0913d", warnBg:"#36281a",
  err:"#ff6b6b", errBg:"#3a1e1e",
  info:"#64b5f6", infoBg:"#162338",
  draft:"#8696a9", draftBg:"#252c36",
  gold:"#d8945c",
  hover:"#2d3540", selection:"#1a2d42",
};
// C and STC are mutable bindings reassigned by applyTheme; every component
// reads them from module scope at render time, so a re-render picks up the swap.
export let C = LIGHT;
const buildSTC = () => ({
  Draft:       {c:C.draft, bg:C.draftBg},
  Submitted:   {c:C.info,  bg:C.infoBg},
  "Under Review":{c:C.warn, bg:C.warnBg},
  Confirmed:   {c:C.ok,   bg:C.okBg},
  Rejected:    {c:C.err,  bg:C.errBg},
  Created:     {c:"#5b738b", bg:"#e8edf1"},
  Open:        {c:"#0854a0", bg:"#dbeeff"},
  Scored:      {c:"#6f2da8", bg:"#f3eeff"},
  Closed:      {c:"#6a6d70", bg:"#f4f4f4"},
  Accepted:    {c:C.ok,   bg:C.okBg},
  Withdrawn:   {c:C.draft,bg:C.draftBg},
  Revised:     {c:C.warn, bg:C.warnBg},
  Win:         {c:"#188918", bg:"#eaf7ea"},
  Lost:        {c:C.err,  bg:C.errBg},
  "PO Ready":  {c:"#6f2da8", bg:"#f3eeff"},
  Active:      {c:C.ok,   bg:C.okBg},
  "Posted":              {c:C.ok,    bg:C.okBg},
  "Converted to Invoice":{c:C.info,  bg:C.infoBg},
  "Cleared":             {c:C.draft, bg:C.draftBg},
  "Supplier DPR":        {c:C.gold,  bg:C.warnBg},
  "Award Proposed":      {bg:"#fff8e1", color:"#856404", border:"#f0d080", c:"#856404"},
  "Award Approved":      {bg:"#e8f5e9", color:"#107e3e", border:"#9FE1CB", c:"#107e3e"},
});
export let STC = buildSTC();
export const applyTheme = mode => { C = mode==="dark"?DARK:LIGHT; STC = buildSTC(); };

// â"€â"€ Helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export let SETTINGS = { numFmt:"comma", dateFmt:"YYYY-MM-DD" };
export const applySettings = s => { SETTINGS = {...SETTINGS,...s}; };

export const idr = n => {
  const t = SETTINGS.numFmt==="dot" ? "." : ",";
  return "IDR " + Math.round(Number(n||0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, t);
};
export const fmtAmt = (n, currency = "IDR") => {
  const dec = currency==="IDR" ? 0 : 2;
  const t = SETTINGS.numFmt==="dot" ? "." : ",";
  const d = SETTINGS.numFmt==="dot" ? "," : ".";
  const [ip, dp] = Number(n||0).toFixed(dec).split(".");
  return `${currency} ${ip.replace(/\B(?=(\d{3})+(?!\d))/g, t)}${dp ? d+dp : ""}`;
};
export const fmtDate = d => {
  if (!d) return "–";
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
export const parseToISO = raw => {
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
export const uid = () => Date.now().toString(36);
export const fmtPOs = inv => { const a=inv.poNumbers?.length?inv.poNumbers:inv.poNumber?[inv.poNumber]:[]; return a.join(", ")||"–"; };

// â"€â"€ Responsive helpers (read VP.w at render time, updated by resize listener) â"€â"€
export let VP = {w: typeof window!=="undefined" ? window.innerWidth : 1280};
export const mob = () => VP.w < 768;
export const tab = () => VP.w < 1024;
export const g2  = () => mob() ? "1fr" : "1fr 1fr";
export const g3  = () => mob() ? "1fr" : tab() ? "1fr 1fr" : "repeat(3,1fr)";
export const g4  = () => mob() ? "1fr" : tab() ? "repeat(2,1fr)" : "repeat(4,1fr)";
export const pg  = () => mob() ? "12px 10px" : 24;

// SAP Fiori Avatar – 10 accent color variants (Quartz Light design tokens)
const AVT_ACCENTS = [
  {bg:"#E5E0EC",fg:"#6C32A9"},{bg:"#FFDDE2",fg:"#CC1677"},
  {bg:"#D3F0EA",fg:"#046C7A"},{bg:"#DAEEFF",fg:"#0854A0"},
  {bg:"#FEF0D0",fg:"#C87741"},{bg:"#E3F1E2",fg:"#256F3A"},
  {bg:"#FFF0DB",fg:"#BE5B00"},{bg:"#E0CFEC",fg:"#7030A0"},
  {bg:"#E8ECF0",fg:"#364DA0"},{bg:"#F0F4EF",fg:"#1B6B35"},
];
export const avtColor = id => AVT_ACCENTS[(id||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0) % AVT_ACCENTS.length];
export const avtIni = name => { const p=name.trim().split(/\s+/); return p.length===1?p[0].slice(0,2).toUpperCase():(p[0][0]+p[1][0]).toUpperCase(); };

export const Badge = ({s,sq=false}:{s:string,sq?:boolean}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:sq?3:12,fontSize:12,fontWeight:700,color:x.c,background:x.bg,border:`1px solid ${x.c}40`,letterSpacing:0.2}}>{s}</span>;
};

const STATUS_ICONS:Record<string,string> = {
  "Draft":               "edit-document",
  "Submitted":           "paper-plane",
  "Under Review":        "pending",
  "Confirmed":           "accept",
  "Rejected":            "decline",
  "Posted":              "complete",
  "Converted to Invoice":"document-text",
  "Cleared":             "complete",
  "Withdrawn":           "undo",
  "Open":                "add-document",
  "Closed":              "sys-cancel",
  "Accepted":            "accept",
  "Active":              "complete",
};
export const StatusTag = ({s}:{s:string}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  const icon = STATUS_ICONS[s]||"status-inactive";
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,color:x.c,fontSize:12,fontWeight:600,whiteSpace:"nowrap" as const}}>
      <SapIcon name={icon} size={13} color={x.c}/>
      {s}
    </span>
  );
};

export const Card = ({children,style={}}) => (
  <div style={{background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:20,marginBottom:14,...style}}>{children}</div>
);

export const Btn = ({children,onClick,v="primary",sm,disabled,style={}}) => {
  const VS:any = {
    primary:{background:C.primary,  color:"#fff",    border:`1px solid ${C.primary}`,   hov:C.primaryDk},
    ghost:  {background:"transparent",color:C.primary,border:"1px solid transparent",   hov:C.selection},
    danger: {background:C.err,      color:"#fff",    border:`1px solid ${C.err}`,        hov:"#9e0000"},
    success:{background:C.ok,       color:"#fff",    border:`1px solid ${C.ok}`,         hov:"#0d6b34"},
    neutral:{background:C.card,     color:C.t1,      border:`1px solid #89919a`,          hov:C.subtle},
  };
  const [hov,setHov]=useState(false);
  const s=VS[v]||VS.primary;
  return <button
    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    onClick={onClick} disabled={disabled}
    style={{
      background:hov&&!disabled?s.hov:s.background,
      color:s.color, border:s.border,
      borderRadius:"0.25rem",
      cursor:disabled?"not-allowed":"pointer",
      fontFamily:"'72','72full',Arial,Helvetica,sans-serif",
      fontWeight:600, fontSize:sm?12:14,
      height:sm?"1.5rem":"2.25rem",
      padding:sm?"0 0.75rem":"0 1rem",
      opacity:disabled?.4:1,
      transition:"background .1s,opacity .1s",
      lineHeight:1, display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap" as const,
      ...style
    }}>{children}</button>;
};

export const Inp = ({value,onChange,placeholder="",type="text",style={}}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",...style}}/>
);
// Positive-only amount input – no spinner buttons, rejects negative/non-numeric input
export const AmtInp = ({value,onChange,placeholder="0",style={}}) => (
  <input type="text" inputMode="decimal" value={value} onChange={e=>{const v=e.target.value;if(v===""||/^\d*\.?\d*$/.test(v))onChange(v);}} placeholder={placeholder}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",...style}}/>
);
export const DateInp = ({value, onChange, style={}}) => {
  const [raw, setRaw] = useState(value ? fmtDate(value) : "");
  const handle = v => {
    setRaw(v);
    if (!v) { onChange(""); return; }
    const iso = parseToISO(v);
    if (iso) onChange(iso);
  };
  return <Inp value={raw} onChange={handle} placeholder={SETTINGS.dateFmt} style={style}/>;
};

export const Ui5DatePicker = ({value, onChange}:{value:string, onChange:(v:string)=>void}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const initDate = value ? new Date(value+"T00:00:00") : new Date();
  const [viewY, setViewY] = useState(initDate.getFullYear());
  const [viewM, setViewM] = useState(initDate.getMonth()); // 0-indexed
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[open]);
  useEffect(()=>{
    if(value){ const d=new Date(value+"T00:00:00"); setViewY(d.getFullYear()); setViewM(d.getMonth()); }
  },[value]);
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS=["Mo","Tu","We","Th","Fr","Sa","Su"];
  const prevM=()=>{ if(viewM===0){setViewM(11);setViewY(y=>y-1);}else setViewM(m=>m-1); };
  const nextM=()=>{ if(viewM===11){setViewM(0);setViewY(y=>y+1);}else setViewM(m=>m+1); };
  const firstDow = new Date(viewY, viewM, 1).getDay(); // 0=Sun
  const offset = firstDow===0?6:firstDow-1; // shift so Mon=0
  const daysInMonth = new Date(viewY, viewM+1, 0).getDate();
  const cells:Array<number|null> = [...Array(offset).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while(cells.length%7!==0) cells.push(null);
  const toISO=(d:number)=>`${viewY}-${String(viewM+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const pick=(d:number)=>{ onChange(toISO(d)); setOpen(false); };
  const disp = value ? fmtDate(value) : "";
  return (
    <div ref={ref} style={{position:"relative",width:"100%"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${open?C.primary:C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px 0 10px",gap:8,boxSizing:"border-box" as const,outline:open?`2px solid ${C.primary}40`:"none"}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2}}>{disp||SETTINGS.dateFmt}</span>
        <SapIcon name="calendar" size={14} color={open?C.primary:C.t2}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:600,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 8px 24px rgba(0,0,0,0.18)",width:280,padding:"8px 0 10px"}}>
          {/* header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px 6px",borderBottom:`1px solid ${C.border}`}}>
            <button onClick={prevM} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 6px",borderRadius:2,fontSize:16,color:C.t1,lineHeight:1}}>‹</button>
            <span style={{fontWeight:700,fontSize:13,color:C.t1}}>{MONTHS[viewM]} {viewY}</span>
            <button onClick={nextM} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 6px",borderRadius:2,fontSize:16,color:C.t1,lineHeight:1}}>›</button>
          </div>
          {/* day-of-week header */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"6px 8px 2px",gap:0}}>
            {DAYS.map(d=><div key={d} style={{textAlign:"center" as const,fontSize:11,fontWeight:700,color:C.t2,padding:"2px 0"}}>{d}</div>)}
          </div>
          {/* day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px",gap:0}}>
            {cells.map((d,i)=>{
              if(!d) return <div key={i}/>;
              const iso=toISO(d);
              const isToday=iso===todayStr;
              const isSel=iso===value;
              return (
                <div key={i} onClick={()=>pick(d)}
                  style={{textAlign:"center" as const,fontSize:13,padding:"5px 2px",borderRadius:2,cursor:"pointer",
                    background:isSel?C.primary:"transparent",color:isSel?"#fff":isToday?C.primary:C.t1,
                    fontWeight:isSel||isToday?700:400,
                    outline:isToday&&!isSel?`1px solid ${C.primary}`:"none"}}
                  onMouseEnter={e=>{ if(!isSel)(e.currentTarget as HTMLElement).style.background=C.infoBg; }}
                  onMouseLeave={e=>{ if(!isSel)(e.currentTarget as HTMLElement).style.background="transparent"; }}>
                  {d}
                </div>
              );
            })}
          </div>
          {/* footer — today button */}
          <div style={{padding:"6px 10px 0",borderTop:`1px solid ${C.border}`,marginTop:6,display:"flex",justifyContent:"center"}}>
            <span onClick={()=>{ onChange(todayStr); setOpen(false); }} style={{fontSize:12,color:C.primary,cursor:"pointer",fontWeight:600}}>Today</span>
          </div>
        </div>
      )}
    </div>
  );
};
export const DatePickerInp = ({value, onChange}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<string|null>(null);
  const [manVal, setManVal] = useState(value||"");
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];
  const iso = (d:Date) => d.toISOString().split("T")[0];
  const addDays = (d:Date, n:number) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
  useEffect(()=>{ setManVal(value||""); },[value]);
  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setMode(null);} };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const pick = (v:string) => { onChange(v); setOpen(false); setMode(null); };
  const clr = () => { onChange(""); setManVal(""); setMode(null); };
  const rowSt = (active:boolean):any => ({padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:13,color:C.t1,background:active?C.infoBg:"transparent"});
  const secHdr = (title:string) => <div style={{padding:"6px 14px 3px",fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.6,marginTop:2}}>{title}</div>;
  const row = (k:string, label:string, onPick?:()=>void) => (
    <div key={k}>
      <div onClick={()=>{ if(onPick){onPick();}else{setMode(m=>m===k?null:k);} }}
        style={rowSt(mode===k)}
        onMouseEnter={e=>(e.currentTarget.style.background=C.infoBg)}
        onMouseLeave={e=>(e.currentTarget.style.background=mode===k?C.infoBg:"transparent")}>
        <span>{label}</span>
        {!onPick&&<SapIcon name="slim-arrow-right" size={12} color={C.t2}/>}
      </div>
      {mode===k&&(
        <div style={{padding:"4px 14px 10px",display:"flex",flexDirection:"column",gap:6}}>
          <DateInp value={manVal} onChange={v=>{setManVal(v);}}/>
          <div style={{display:"flex",gap:6}}>
            <Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn>
            <Btn v="primary" sm onClick={()=>{if(manVal)pick(manVal);}}>Apply</Btn>
          </div>
        </div>
      )}
    </div>
  );
  const disp = value ? fmtDate(value) : "";
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px",gap:8,boxSizing:"border-box" as const}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{disp||"Select date…"}</span>
        <SapIcon name="calendar" size={14} color={C.t2}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:500,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",minWidth:220,maxHeight:360,overflowY:"auto" as const}}>
          {secHdr("Quick Select")}
          {row("today","Today",()=>pick(today))}
          {row("tomorrow","Tomorrow",()=>pick(iso(addDays(new Date(),1))))}
          {row("in-7","In 7 days",()=>pick(iso(addDays(new Date(),7))))}
          {row("in-14","In 14 days",()=>pick(iso(addDays(new Date(),14))))}
          {row("in-30","In 30 days",()=>pick(iso(addDays(new Date(),30))))}
          {secHdr("Specific Date")}
          {row("specific","Enter date…")}
          {value&&(
            <>
              <div style={{height:1,background:C.border,margin:"4px 0"}}/>
              <div onClick={clr} style={{...rowSt(false),color:C.err}}
                onMouseEnter={e=>(e.currentTarget.style.background=C.infoBg)}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                Clear
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export const Sel = ({value,onChange,opts,style={}}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,outline:"none",boxSizing:"border-box",background:C.field,...style}}>
    {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);
export const TA = ({value,onChange,placeholder="",rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
);
export const Lbl = ({children}) => <div style={{fontSize:12,color:C.t2,marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{children}</div>;
export const Val = ({children}) => <div style={{fontSize:14,color:C.t1,lineHeight:1.5}}>{children||"–"}</div>;
export const Sep = () => <div style={{height:1,background:C.border,margin:"14px 0"}}/>;

export const Modal = ({title,onClose,children,width=640,expanded=false,onToggleExpand=null}:any) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:expanded?0:16}}>
    <div style={{background:C.card,borderRadius:expanded?0:6,width:expanded?"100%":width,maxWidth:expanded?"100vw":"95vw",maxHeight:expanded?"100vh":"90vh",height:expanded?"100vh":"auto",overflow:"auto",boxShadow:"0 16px 48px rgba(0,0,0,0.22)"}}>
      <div style={{padding:"14px 20px",borderBottom:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.card,zIndex:1}}>
        <span style={{fontWeight:700,fontSize:16,color:C.t1}}>{title}</span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {onToggleExpand&&<button onClick={onToggleExpand} title={expanded?"Restore":"Full Screen"} style={{background:"none",border:"1px solid "+C.border,cursor:"pointer",fontSize:13,color:C.t2,lineHeight:1,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>{expanded?"⊡":"⊞"}</button>}
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>✕</button>
        </div>
      </div>
      <div style={{padding:mob()?14:20}}>{children}</div>
    </div>
  </div>
);

export const FilterBar = ({opts,val,onChange}) => (
  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
    {opts.map(f=>(
      <button key={f} onClick={()=>onChange(f)} style={{padding:"5px 14px",borderRadius:16,cursor:"pointer",fontSize:12,border:`1px solid ${val===f?C.primary:C.border}`,background:val===f?C.selection:C.card,color:val===f?C.primary:C.t2,fontWeight:val===f?700:400,fontFamily:"inherit",transition:"background .12s"}}>
        {f}
      </button>
    ))}
  </div>
);
// SAP Fiori-style compact filter bar
export const FioriBar = ({activeTokens=[],onGo,onReset,onAdaptFilters,adaptFiltersCount,children}:{activeTokens?:any[],onGo?:()=>void,onReset?:()=>void,onAdaptFilters?:()=>void,adaptFiltersCount?:number,children?:any}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
    <div style={{padding:"12px 16px 10px",display:"grid",gridTemplateColumns:g4(),gap:"10px 16px"}}>
      {children}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 16px 10px",flexWrap:"wrap" as const,gap:6}}>
      <div style={{display:"flex",flexWrap:"wrap" as const,gap:4,alignItems:"center",flex:1,minWidth:0}}>
        {activeTokens.length>0&&<span style={{fontSize:11,color:C.t2,fontWeight:600,marginRight:4,letterSpacing:0.3,flexShrink:0}}>Active:</span>}
        {activeTokens.map((t,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",height:"1.625rem",background:C.selection,border:`1px solid #8bb1d1`,borderRadius:"0.25rem",padding:"0 0 0 0.5rem",fontSize:12,color:C.t1,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",maxWidth:260}}>
            <span style={{fontWeight:600,color:C.t2,marginRight:3,flexShrink:0}}>{t.label}:</span>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{t.val}</span>
            <button onClick={t.onClear} title={`Remove ${t.label} filter`}
              style={{background:"none",border:"none",cursor:"pointer",color:"#6a6d70",fontSize:16,padding:"0 0.375rem",lineHeight:1,display:"flex",alignItems:"center",flexShrink:0,height:"100%"}}>{"×"}</button>
          </span>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        {onAdaptFilters&&<button onClick={onAdaptFilters} style={{background:"transparent",color:C.primary,border:`1px solid ${C.border}`,borderRadius:4,padding:"0 12px",height:"1.5rem",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Adapt Filters{adaptFiltersCount!=null?` (${adaptFiltersCount})`:""}</button>}
        <Btn v="neutral" sm onClick={onReset}>Reset</Btn>
        <Btn v="primary" sm onClick={onGo}>Go</Btn>
      </div>
    </div>
  </div>
);
// Compact filter field label wrapper (Fiori style)
export const FField = ({label,children,style={}}) => (
  <div style={style}>
    <div style={{fontSize:11,color:C.t2,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:0.6}}>{label}</div>
    {children}
  </div>
);
export const DateRangePicker = ({from,to,onChange}) => {
  const [open,setOpen]=useState(false);
  const [mode,setMode]=useState<string|null>(null);
  const [tf,setTf]=useState(from||"");
  const [tt,setTt]=useState(to||"");
  const [xVal,setXVal]=useState("7");
  const [yVal,setYVal]=useState("0");
  const [xUnit,setXUnit]=useState("Days");
  const [monSel,setMonSel]=useState<{y:number,m:number}>(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const ref=useRef<HTMLDivElement>(null);
  const today=new Date().toISOString().split("T")[0];
  useEffect(()=>{setTf(from||"");},[from]);
  useEffect(()=>{setTt(to||"");},[to]);
  useEffect(()=>{
    if(!open)return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setMode(null);}};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const apply=(f:string,t:string)=>{onChange(f,t);setOpen(false);setMode(null);};
  const clr=()=>{onChange("","");setTf("");setTt("");setMode(null);};
  const iso=(d:Date)=>d.toISOString().split("T")[0];
  const addDays=(d:Date,n:number)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r;};
  const addMonths=(d:Date,n:number)=>{const r=new Date(d);r.setMonth(r.getMonth()+n);return r;};
  const weekRange=(off:number)=>{const d=new Date();const dow=d.getDay();const mon=addDays(d,-(dow===0?6:dow-1)+off*7);return[iso(mon),iso(addDays(mon,6))];};
  const monthRange=(off:number)=>{const d=new Date();const f=new Date(d.getFullYear(),d.getMonth()+off,1);const l=new Date(d.getFullYear(),d.getMonth()+off+1,0);return[iso(f),iso(l)];};
  const qRange=(qOff:number,fixQ?:number)=>{const d=new Date();let y=d.getFullYear();let q=fixQ!==undefined?fixQ:Math.floor(d.getMonth()/3)+qOff;y+=Math.floor(q/4);q=((q%4)+4)%4;const f=new Date(y,q*3,1);const l=new Date(y,q*3+3,0);return[iso(f),iso(l)];};
  const yearRange=(off:number)=>{const y=new Date().getFullYear()+off;return[`${y}-01-01`,`${y}-12-31`];};
  const offsetDate=(d:Date,n:number,unit:string)=>{const r=new Date(d);if(unit==="Days")r.setDate(r.getDate()+n);else if(unit==="Weeks")r.setDate(r.getDate()+n*7);else if(unit==="Months")r.setMonth(r.getMonth()+n);else if(unit==="Quarters")r.setMonth(r.getMonth()+n*3);else if(unit==="Years")r.setFullYear(r.getFullYear()+n);else if(unit==="Hours")r.setHours(r.getHours()+n);else if(unit==="Minutes")r.setMinutes(r.getMinutes()+n);return r;};
  const UNITS=["Minutes","Hours","Days","Weeks","Months","Quarters","Years"];
  const MNAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const handleOpt=(k:string)=>{
    const d=new Date();
    if(k==="today"){apply(today,today);return;}
    if(k==="yesterday"){const y=iso(addDays(d,-1));apply(y,y);return;}
    if(k==="tomorrow"){const t=iso(addDays(d,1));apply(t,t);return;}
    if(k==="year-to-date"){apply(`${d.getFullYear()}-01-01`,today);return;}
    if(k==="date-to-year"){apply(today,`${d.getFullYear()}-12-31`);return;}
    if(k==="this-week"){const[f,t]=weekRange(0);apply(f,t);return;}
    if(k==="last-week"){const[f,t]=weekRange(-1);apply(f,t);return;}
    if(k==="next-week"){const[f,t]=weekRange(1);apply(f,t);return;}
    if(k==="this-month"){const[f,t]=monthRange(0);apply(f,t);return;}
    if(k==="last-month"){const[f,t]=monthRange(-1);apply(f,t);return;}
    if(k==="next-month"){const[f,t]=monthRange(1);apply(f,t);return;}
    if(k==="this-quarter"){const[f,t]=qRange(0);apply(f,t);return;}
    if(k==="last-quarter"){const[f,t]=qRange(-1);apply(f,t);return;}
    if(k==="next-quarter"){const[f,t]=qRange(1);apply(f,t);return;}
    if(k==="q1"){const[f,t]=qRange(0,0);apply(f,t);return;}
    if(k==="q2"){const[f,t]=qRange(0,1);apply(f,t);return;}
    if(k==="q3"){const[f,t]=qRange(0,2);apply(f,t);return;}
    if(k==="q4"){const[f,t]=qRange(0,3);apply(f,t);return;}
    if(k==="this-year"){const[f,t]=yearRange(0);apply(f,t);return;}
    if(k==="last-year"){const[f,t]=yearRange(-1);apply(f,t);return;}
    if(k==="next-year"){const[f,t]=yearRange(1);apply(f,t);return;}
    setMode(m=>m===k?null:k);
    if(k!==mode){setTf(from||"");setTt(to||"");}
  };
  const applyLastX=()=>{const n=parseInt(xVal)||1;const s=iso(offsetDate(new Date(),-n,xUnit));apply(s,today);};
  const applyNextX=()=>{const n=parseInt(xVal)||1;const e=iso(offsetDate(new Date(),n,xUnit));apply(today,e);};
  const applyTodayXY=()=>{const x=parseInt(xVal)||0;const y=parseInt(yVal)||0;const f=iso(addDays(new Date(),-x));const t=iso(addDays(new Date(),y));apply(f,t);};
  const disp=from&&to?`${fmtDate(from)} – ${fmtDate(to)}`:from?`From: ${fmtDate(from)}`:to?`To: ${fmtDate(to)}`:"";
  const rowSt=(active:boolean):any=>({padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:13,color:C.t1,background:active?C.infoBg:"transparent"});
  const secHdr=(title:string)=>(
    <div style={{padding:"6px 14px 3px",fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.6,marginTop:2}}>{title}</div>
  );
  const row=(k:string,label:string,ico?:boolean)=>(
    <div key={k}>
      <div onClick={()=>handleOpt(k)} style={rowSt(mode===k)}
        onMouseEnter={e=>(e.currentTarget.style.background=C.infoBg)}
        onMouseLeave={e=>(e.currentTarget.style.background=mode===k?C.infoBg:"transparent")}>
        <span>{label}</span>
        {ico&&<SapIcon name="appointment-2" size={13} color={C.t2}/>}
      </div>
      {mode===k&&subInp(k)}
    </div>
  );
  const subInpSt:any={padding:"4px 14px 10px",display:"flex",flexDirection:"column",gap:6};
  const numInpSt:any={width:64,padding:"4px 8px",fontSize:13,fontFamily:"inherit",color:C.t1,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,outline:"none"};
  const unitSelSt:any={flex:1,padding:"4px 8px",fontSize:13,fontFamily:"inherit",color:C.t1,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,outline:"none",cursor:"pointer"};
  const subInp=(k:string)=>{
    if(k==="date"||k==="date-time")return(
      <div style={subInpSt}><DateInp value={tf} onChange={v=>{setTf(v);if(v)apply(v,v);}}/></div>
    );
    if(k==="from-to"||k==="from-to-dt")return(
      <div style={subInpSt}>
        <DateInp value={tf} onChange={v=>setTf(v)}/>
        <DateInp value={tt} onChange={v=>setTt(v)}/>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={()=>apply(tf,tt)}>Apply</Btn></div>
      </div>
    );
    if(k==="from")return(<div style={subInpSt}><DateInp value={tf} onChange={v=>{setTf(v);if(v)apply(v,to||"");}}/></div>);
    if(k==="to")return(<div style={subInpSt}><DateInp value={tt} onChange={v=>{setTt(v);if(v)apply(from||"",v);}}/></div>);
    if(k==="last-x")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input style={numInpSt} type="number" min={1} value={xVal} onChange={e=>setXVal(e.target.value)}/>
          <select style={unitSelSt} value={xUnit} onChange={e=>setXUnit(e.target.value)}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select>
        </div>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={applyLastX}>Apply</Btn></div>
      </div>
    );
    if(k==="next-x")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input style={numInpSt} type="number" min={1} value={xVal} onChange={e=>setXVal(e.target.value)}/>
          <select style={unitSelSt} value={xUnit} onChange={e=>setXUnit(e.target.value)}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select>
        </div>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={applyNextX}>Apply</Btn></div>
      </div>
    );
    if(k==="today-xy")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:6,alignItems:"center",fontSize:12,color:C.t2}}>
          <span style={{whiteSpace:"nowrap" as const}}>-X days:</span>
          <input style={numInpSt} type="number" min={0} value={xVal} onChange={e=>setXVal(e.target.value)}/>
          <span style={{whiteSpace:"nowrap" as const}}>+Y days:</span>
          <input style={numInpSt} type="number" min={0} value={yVal} onChange={e=>setYVal(e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={applyTodayXY}>Apply</Btn></div>
      </div>
    );
    if(k==="month")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={()=>setMonSel(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,width:24,height:24,cursor:"pointer",color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{"‹"}</button>
          <span style={{flex:1,textAlign:"center" as const,fontSize:12,fontWeight:700,color:C.t1}}>{MNAMES[monSel.m]} {monSel.y}</span>
          <button onClick={()=>setMonSel(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,width:24,height:24,cursor:"pointer",color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{"›"}</button>
        </div>
        <Btn v="primary" sm onClick={()=>{const f=`${monSel.y}-${String(monSel.m+1).padStart(2,"0")}-01`;const l=new Date(monSel.y,monSel.m+1,0);apply(f,iso(l));}}>Select Month</Btn>
      </div>
    );
    return null;
  };
  return(
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px",gap:8,boxSizing:"border-box" as const}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{disp||"Select date range…"}</span>
        {(from||to)&&<button onClick={e=>{e.stopPropagation();clr();}} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:18,padding:"0",lineHeight:1,flexShrink:0}}>{"×"}</button>}
        <SapIcon name="calendar" size={14} color={C.t2} style={{flexShrink:0}}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 2px)",left:0,zIndex:600,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 20px rgba(0,0,0,0.18)",minWidth:260,maxHeight:480,overflowY:"auto" as const}}>
          {secHdr("Single Dates")}
          {row("date","Date",true)}
          {row("today","Today")}
          {row("yesterday","Yesterday")}
          {row("tomorrow","Tomorrow")}
          {row("date-time","Date and Time",true)}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Date Ranges")}
          {row("from-to","From / To",true)}
          {row("from-to-dt","From / To (Date and Time)",true)}
          {row("from","From",true)}
          {row("to","To",true)}
          {row("year-to-date","Year to Date")}
          {row("date-to-year","Date to Year")}
          {row("last-x","Last X Minutes / Hours / Days…")}
          {row("next-x","Next X Minutes / Hours / Days…")}
          {row("today-xy","Today -X / +Y Days")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Weeks")}
          {row("this-week","This Week")}
          {row("last-week","Last Week")}
          {row("next-week","Next Week")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Months")}
          {row("month","Month",true)}
          {row("this-month","This Month")}
          {row("last-month","Last Month")}
          {row("next-month","Next Month")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Quarters")}
          {row("this-quarter","This Quarter")}
          {row("last-quarter","Last Quarter")}
          {row("next-quarter","Next Quarter")}
          {row("q1","First Quarter")}
          {row("q2","Second Quarter")}
          {row("q3","Third Quarter")}
          {row("q4","Fourth Quarter")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Years")}
          {row("this-year","This Year")}
          {row("last-year","Last Year")}
          {row("next-year","Next Year")}
          <div style={{height:8}}/>
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line
declare global { namespace JSX { interface IntrinsicElements { 'ui5-icon': any; 'ui5-multi-combobox': any; 'ui5-mcb-item': any; 'ui5-date-picker': any } } }
export const SapIcon = ({name,size=16,color="",style={}}:{name:string,size?:number,color?:string,style?:any}) => (
  <ui5-icon name={name} style={{width:size,height:size,display:"inline-block",verticalAlign:"middle",...(color?{color}:{}),...style}}/>
);

const INV_TYPE_OPTS = [
  {key:"Invoice",      text:"Invoice"},
  {key:"Supplier DPR", text:"Down Payment Req"},
];

// Generic inline multi-select combobox — same visual style as InvTypeMultiComboBox
export const FilterMultiComboBox = ({opts,value=[],onChange,placeholder="All"}:{opts:{key:string,text:string}[],value:string[],onChange:(v:string[])=>void,placeholder?:string}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef<any>(null);
  useEffect(()=>{
    if(!open)return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[open]);
  const toggle=(key:string)=>{const next=value.includes(key)?value.filter(v=>v!==key):[...value,key];onChange(next);};
  const remove=(key:string,e:React.MouseEvent)=>{e.stopPropagation();onChange(value.filter(v=>v!==key));};
  return(
    <div ref={ref} style={{position:"relative" as const,fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
      <div onClick={()=>setOpen(p=>!p)} style={{display:"flex",flexWrap:"wrap" as const,alignItems:"center",gap:4,minHeight:"2.25rem",padding:"3px 28px 3px 6px",border:`1px solid ${open?C.primary:C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",position:"relative" as const,boxSizing:"border-box" as const,boxShadow:open?`0 0 0 2px ${C.primary}22`:"none",transition:"border-color .1s"}}>
        {value.length===0&&<span style={{color:C.t2,fontSize:14,padding:"2px 2px"}}>{placeholder}</span>}
        {value.map(k=>{
          const opt=opts.find(o=>o.key===k);
          return(
            <span key={k} style={{display:"inline-flex",alignItems:"center",height:22,background:C.selection,border:`1px solid ${C.primary}55`,borderRadius:2,padding:"0 0 0 8px",fontSize:12,color:C.t1,lineHeight:1}}>
              {opt?.text||k}
              <button onClick={e=>remove(k,e)} style={{background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:15,padding:"0 5px",lineHeight:1,display:"flex",alignItems:"center"}}>{"×"}</button>
            </span>
          );
        })}
        <span style={{position:"absolute" as const,right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" as const}}>
          <SapIcon name="slim-arrow-down" size={12} color={C.t2}/>
        </span>
      </div>
      {open&&(
        <div style={{position:"absolute" as const,top:"calc(100% + 2px)",left:0,right:0,zIndex:1000,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",overflow:"hidden",maxHeight:220,overflowY:"auto" as const}}>
          {opts.map(opt=>(
            <div key={opt.key} onClick={()=>toggle(opt.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:value.includes(opt.key)?C.selection:"transparent",fontSize:14,color:C.t1}}
              onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
              onMouseLeave={e=>(e.currentTarget.style.background=value.includes(opt.key)?C.selection:"transparent")}>
              <input type="checkbox" readOnly checked={value.includes(opt.key)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary,flexShrink:0}}/>
              <span>{opt.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export const InvTypeMultiComboBox = ({value=[],onChange}:{value:string[],onChange:(v:string[])=>void}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef<any>(null);
  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[open]);
  const toggle=(key:string)=>{
    const next=value.includes(key)?value.filter(v=>v!==key):[...value,key];
    onChange(next);
  };
  const remove=(key:string,e:React.MouseEvent)=>{
    e.stopPropagation();
    onChange(value.filter(v=>v!==key));
  };
  return (
    <div ref={ref} style={{position:"relative" as const,fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
      <div onClick={()=>setOpen(p=>!p)} style={{display:"flex",flexWrap:"wrap" as const,alignItems:"center",gap:4,minHeight:"2.25rem",padding:"3px 28px 3px 6px",border:`1px solid ${open?C.primary:C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",position:"relative" as const,boxSizing:"border-box" as const,boxShadow:open?`0 0 0 2px ${C.primary}22`:"none",transition:"border-color .1s"}}>
        {value.length===0&&<span style={{color:C.t2,fontSize:14,padding:"2px 2px"}}>All Types</span>}
        {value.map(k=>{
          const opt=INV_TYPE_OPTS.find(o=>o.key===k);
          return(
            <span key={k} style={{display:"inline-flex",alignItems:"center",height:22,background:C.selection,border:`1px solid ${C.primary}55`,borderRadius:2,padding:"0 0 0 8px",fontSize:12,color:C.t1,lineHeight:1}}>
              {opt?.text||k}
              <button onClick={e=>remove(k,e)} style={{background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:15,padding:"0 5px",lineHeight:1,display:"flex",alignItems:"center"}}>{"×"}</button>
            </span>
          );
        })}
        <span style={{position:"absolute" as const,right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" as const}}>
          <SapIcon name="slim-arrow-down" size={12} color={C.t2}/>
        </span>
      </div>
      {open&&(
        <div style={{position:"absolute" as const,top:"calc(100% + 2px)",left:0,right:0,zIndex:1000,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",overflow:"hidden"}}>
          {INV_TYPE_OPTS.map(opt=>(
            <div key={opt.key} onClick={()=>toggle(opt.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:value.includes(opt.key)?C.selection:"transparent",fontSize:14,color:C.t1}}
              onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
              onMouseLeave={e=>(e.currentTarget.style.background=value.includes(opt.key)?C.selection:"transparent")}>
              <input type="checkbox" readOnly checked={value.includes(opt.key)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary,flexShrink:0}}/>
              <span>{opt.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Th = ({children}) => <th style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:700,color:C.t2,borderBottom:`2px solid ${C.border}`,background:C.subtle,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{children}</th>;
export const Td = ({children,style={}}) => <td style={{padding:"10px 14px",fontSize:14,color:C.t1,borderBottom:`1px solid ${C.border}`,...style}}>{children}</td>;

// â"€â"€ Value Help Dialog (sap.ui.comp.valuehelpdialog.ValueHelpDialog) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const VH_OPS = ["equal to","not equal to","starts with","contains","does not contain","empty","not empty"];
const VH_NOVAL = new Set(["empty","not empty"]);
export type VHCol = {key:string, label:string, width?:string|number};
export const ValueHelpDialog = ({title,cols,rows,keyField="v",labelField="l",selected=[],multiSelect=true,onConfirm,onClose}:{title:string,cols:VHCol[],rows:any[],keyField?:string,labelField?:string,selected:string[],multiSelect?:boolean,onConfirm:(s:string[])=>void,onClose:()=>void}) => {
  const [tab,setTab]=useState<"sel"|"cond">("sel");
  const [search,setSearch]=useState("");
  const [localSel,setLocalSel]=useState<string[]>([...selected]);
  const [conds,setConds]=useState<{op:string,val:string}[]>([]);
  const [condOp,setCondOp]=useState(VH_OPS[0]);
  const [condVal,setCondVal]=useState("");
  const filtered=rows.filter(r=>!search||cols.some(c=>String(r[c.key]||"").toLowerCase().includes(search.toLowerCase())));
  const allSel=filtered.length>0&&filtered.every(r=>localSel.includes(r[keyField]));
  const toggleAll=()=>{
    if(allSel)setLocalSel(p=>p.filter(k=>!filtered.find(r=>r[keyField]===k)));
    else setLocalSel(p=>[...new Set([...p,...filtered.map(r=>r[keyField])])]);
  };
  const toggleRow=(key:string)=>{
    if(!multiSelect){setLocalSel([key]);return;}
    setLocalSel(p=>p.includes(key)?p.filter(k=>k!==key):[...p,key]);
  };
  const getLabel=(key:string)=>{const r=rows.find(r=>r[keyField]===key);return r?`${key} – ${r[labelField]||key}`:key;};
  const addCond=()=>{if(!VH_NOVAL.has(condOp)&&!condVal.trim())return;setConds(p=>[...p,{op:condOp,val:condVal.trim()}]);setCondVal("");};
  const confirm=()=>{
    let sel=[...localSel];
    if(conds.length>0){
      const matched=rows.filter(r=>conds.some(c=>{const v=String(r[keyField]||"").toLowerCase(),cv=c.val.toLowerCase();
        if(c.op==="equal to")return v===cv;if(c.op==="not equal to")return v!==cv;
        if(c.op==="starts with")return v.startsWith(cv);if(c.op==="contains")return v.includes(cv);
        if(c.op==="does not contain")return!v.includes(cv);if(c.op==="empty")return!v;if(c.op==="not empty")return!!v;return false;
      })).map(r=>r[keyField]);
      sel=[...new Set([...sel,...matched])];
    }
    onConfirm(sel);
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)"}}>
      <div style={{background:C.card,borderRadius:4,boxShadow:"0 8px 32px rgba(0,0,0,0.22)",width:"min(880px,95vw)",maxHeight:"85vh",display:"flex",flexDirection:"column",fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
        {/* Title + tabs */}
        <div style={{padding:"14px 16px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:16,fontWeight:700,color:C.t1,marginBottom:10}}>{title}</div>
          <div style={{display:"flex"}}>
            {(["sel","cond"] as const).map((t,i)=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 16px 10px",fontSize:14,color:tab===t?C.info:C.t2,fontFamily:"inherit",fontWeight:tab===t?600:400,borderBottom:`2px solid ${tab===t?C.info:"transparent"}`,marginBottom:-1}}>
                {i===0?"Search and Select":"Define Conditions"}
              </button>
            ))}
          </div>
        </div>
        {/* Body */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {tab==="sel"?(
            <>
              <div style={{padding:"12px 16px 6px",display:"flex",gap:8,alignItems:"center"}}>
                <div style={{flex:1,position:"relative"}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"
                    style={{width:"100%",height:32,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"0 30px 0 8px",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",background:C.field,color:C.t1}}/>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><SapIcon name="search" size={14} color={C.t2}/></span>
                </div>
                <button style={{background:C.primary,color:"#fff",border:`1px solid ${C.primaryDk}`,borderRadius:4,height:32,padding:"0 16px",fontSize:14,fontFamily:"inherit",fontWeight:600,cursor:"pointer"}}>Go</button>
                <button style={{background:"none",border:"none",color:C.info,fontSize:14,fontFamily:"inherit",cursor:"pointer"}}>Show Filters</button>
              </div>
              <div style={{padding:"2px 16px 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:14,fontWeight:700,color:C.t1}}>Items ({filtered.length})</span>
                <SapIcon name="copy" size={15} color={C.t2}/>
              </div>
              <div style={{flex:1,overflow:"auto",borderTop:`1px solid ${C.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:C.subtle,position:"sticky",top:0,zIndex:1}}>
                      <th style={{width:36,padding:"7px 8px 7px 14px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
                        <input type="checkbox" checked={allSel} onChange={toggleAll} style={{cursor:"pointer",accentColor:C.primaryDk}}/>
                      </th>
                      {cols.map(c=>(
                        <th key={c.key} style={{padding:"7px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,color:C.t2,fontSize:12,fontWeight:700,whiteSpace:"nowrap",width:c.width,maxWidth:c.width}}>
                          {c.label} <span style={{color:C.t2,fontSize:9}}>{"▲"}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r,i)=>{const key=r[keyField];const sel=localSel.includes(key);return(
                      <tr key={key} onClick={()=>toggleRow(key)} style={{background:sel?C.selection:i%2===0?C.card:C.subtle,cursor:"pointer"}}
                        onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background=C.hover;}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=sel?C.selection:i%2===0?C.card:C.subtle;}}>
                        <td style={{padding:"7px 8px 7px 14px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
                          <input type="checkbox" checked={sel} onChange={()=>toggleRow(key)} onClick={e=>e.stopPropagation()} style={{cursor:"pointer",accentColor:C.primaryDk}}/>
                        </td>
                        {cols.map((c,ci)=>(
                          <td key={c.key} style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:c.width||140,color:ci===0?C.info:C.t1,fontWeight:ci===0?600:400}}>
                            {r[c.key]??""}</td>
                        ))}
                      </tr>
                    );})}
                    {filtered.length===0&&<tr><td colSpan={cols.length+1} style={{textAlign:"center",padding:"28px",color:C.t2,fontSize:13}}>No items found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          ):(
            <div style={{padding:16,flex:1,overflow:"auto"}}>
              <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                <select value={condOp} onChange={e=>setCondOp(e.target.value)} style={{height:32,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"0 8px",fontSize:13,fontFamily:"inherit",cursor:"pointer",background:C.field,color:C.t1}}>
                  {VH_OPS.map(o=><option key={o}>{o}</option>)}
                </select>
                {!VH_NOVAL.has(condOp)&&<input value={condVal} onChange={e=>setCondVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCond()} placeholder="Value…"
                  style={{flex:1,height:32,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"0 8px",fontSize:13,fontFamily:"inherit",outline:"none",background:C.field,color:C.t1}}/>}
                <button onClick={addCond} style={{background:C.primary,color:"#fff",border:"none",borderRadius:4,height:32,padding:"0 14px",fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:600}}>Add Condition</button>
              </div>
              {conds.length>0?(
                <div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
                  {conds.map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",padding:"8px 12px",borderBottom:i<conds.length-1?`1px solid ${C.border}`:"none",background:i%2===0?C.card:C.subtle,gap:8}}>
                      <span style={{fontSize:12,color:C.t2,minWidth:120}}>{c.op}</span>
                      <span style={{fontSize:13,color:C.t1,flex:1}}>{c.val||<em style={{color:C.t2}}>any</em>}</span>
                      <button onClick={()=>setConds(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>{"×"}</button>
                    </div>
                  ))}
                </div>
              ):<div style={{color:C.t2,fontSize:13,textAlign:"center",padding:32}}>No conditions defined.</div>}
            </div>
          )}
        </div>
        {/* Selected tokens bar */}
        <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,background:C.subtle}}>
          <div style={{fontSize:12,color:C.t2,marginBottom:5}}>
            {localSel.length===0&&conds.length===0?"No Items or Conditions Selected":`${localSel.length>0?`${localSel.length} Item${localSel.length!==1?"s":""}`:""} ${conds.length>0?`${conds.length} Condition${conds.length!==1?"s":""}`:""} Selected`}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,minHeight:30,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"3px 8px",background:C.field,flexWrap:"wrap"}}>
            {localSel.length===0&&conds.length===0&&<span style={{color:C.t2,fontSize:12}}>No selection</span>}
            {localSel.map(key=>(
              <span key={key} style={{display:"inline-flex",alignItems:"center",gap:3,background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 8px 1px 8px",fontSize:12,color:C.info,whiteSpace:"nowrap"}}>
                {getLabel(key)}
                <button onClick={()=>setLocalSel(p=>p.filter(k=>k!==key))} style={{background:"none",border:"none",cursor:"pointer",color:C.info,padding:"0 0 0 2px",fontSize:14,lineHeight:1}}>{"×"}</button>
              </span>
            ))}
            {localSel.length>0&&<button onClick={()=>{setLocalSel([]);setConds([]);}} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:18,padding:"0 2px",lineHeight:1}} title="Clear all">{"×"}</button>}
          </div>
        </div>
        {/* Footer */}
        <div style={{padding:"10px 16px",display:"flex",justifyContent:"flex-end",gap:8,borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,height:32,padding:"0 16px",fontSize:14,fontFamily:"inherit",cursor:"pointer",color:C.t1}}>Cancel</button>
          <button onClick={confirm} style={{background:C.primary,border:`1px solid ${C.primaryDk}`,borderRadius:4,height:32,padding:"0 16px",fontSize:14,fontFamily:"inherit",fontWeight:600,cursor:"pointer",color:"#fff"}}>OK</button>
        </div>
      </div>
    </div>
  );
};

export const ValueHelpInp = ({selected=[],getLabel,onOpen,placeholder="Select…"}:{selected:string[],getLabel:(k:string)=>string,onOpen:()=>void,placeholder?:string}) => (
  <div onClick={onOpen} style={{position:"relative",display:"flex",alignItems:"center",minHeight:36,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,padding:"2px 28px 2px 6px",flexWrap:"wrap",gap:3,cursor:"pointer"}}>
    {selected.length===0&&<span style={{color:C.t2,fontSize:12,padding:"1px 2px"}}>{placeholder}</span>}
    {selected.map(k=>(
      <span key={k} style={{display:"inline-flex",alignItems:"center",background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 7px",fontSize:11,color:C.info,whiteSpace:"nowrap"}}>{getLabel(k)}</span>
    ))}
    <button onClick={e=>{e.stopPropagation();onOpen();}} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}>
      <SapIcon name="value-help" size={14} color={C.t2}/>
    </button>
  </div>
);

