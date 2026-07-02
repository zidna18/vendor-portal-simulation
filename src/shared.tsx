import { useState, useEffect, useRef } from "react";

// â"€â"€ Mock Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export const USERS = [
  { id:"V001", role:"vendor", username:"vendor1", password:"demo123", name:"PT Maju Bersama",    vendorId:"10000001" },
  { id:"V002", role:"vendor", username:"vendor2", password:"demo123", name:"CV Sukses Mandiri",  vendorId:"10000002" },
  { id:"V003", role:"vendor", username:"vendor3", password:"demo123", name:"PT Solusi Nusantara",vendorId:"10000003" },
  { id:"B001", role:"brm",    username:"brm.user", password:"demo123", name:"Ahmad Rizki",  title:"Procurement Manager" },
  { id:"B002", role:"brm",    username:"buyer1",   password:"demo123", name:"Siti Rahma",   title:"Senior Buyer" },
  { id:"A001", role:"approver", username:"approver1", password:"demo123", name:"Budi Santoso", title:"Finance Approver" },
  { id:"D001", role:"director", username:"director1", password:"demo123", name:"Arief Budiman", title:"Director" },
];
export const VENDORS = {
  "10000001":{ id:"10000001", name:"PT Maju Bersama",    tax:"01.234.567.8-901.000", addr:"Jl. Sudirman No. 123, Jakarta Selatan 12190", phone:"+62 21 5555-1234", email:"ap@majubersama.co.id",
    banks:[
      {no:1, name:"Bank Mandiri",           branch:"KCP Jakarta Sudirman",   acc:"1234-5678-9012",    aname:"PT MAJU BERSAMA",   currency:"IDR", swift:"BMRIIDJA", primary:true  },
      {no:2, name:"Bank Central Asia (BCA)",branch:"KCP Jakarta Selatan",    acc:"8877-6655-4433",    aname:"PT MAJU BERSAMA",   currency:"IDR", swift:"CENAIDJA", primary:false },
      {no:3, name:"Citibank N.A.",           branch:"Jakarta Branch",         acc:"4011-2233-4455-66", aname:"PT MAJU BERSAMA",   currency:"USD", swift:"CITIIDJX", primary:false },
    ],
    cat:"Goods & Services", since:"2019-03-15", rep:"Budi Santoso", status:"Active",
    npwpAddress:"Jl. Sudirman No. 123, Jakarta Selatan 12190", pkp:"PKP", taxStatus:"Active",
    certExpiry:"2027-03-14", website:"www.majubersama.co.id", fax:"+62 21 5555-1235",
    lfb1:[
      { bukrs:"BRMS", akont:"160000", zterm:"Z030", zwels:"T", reprf:true,  busab:"BRM001", fdgrp:"01", reconcAcct:"Accounts Payable - Trade" },
      { bukrs:"CPMS", akont:"160000", zterm:"Z030", zwels:"T", reprf:true,  busab:"CPM001", fdgrp:"01", reconcAcct:"Accounts Payable - Trade" },
      { bukrs:"GMIN", akont:"160000", zterm:"Z014", zwels:"T", reprf:false, busab:"GMN001", fdgrp:"02", reconcAcct:"Accounts Payable - Trade" },
    ],
    lfm1:[
      { ekorg:"BRMS", bukrs:"BRMS", waers:"IDR", zterm:"Z030", inco1:"DAP", inco2:"Jakarta",   minbw:0,         verkf:"Budi Santoso", telf1:"+62 21 5555-1234", autom:true  },
      { ekorg:"CPMS", bukrs:"CPMS", waers:"IDR", zterm:"Z030", inco1:"DAP", inco2:"Poboya",    minbw:5000000,   verkf:"Budi Santoso", telf1:"+62 21 5555-1234", autom:true  },
      { ekorg:"GMIN", bukrs:"GMIN", waers:"IDR", zterm:"Z014", inco1:"CIF", inco2:"Gorontalo", minbw:10000000,  verkf:"Budi Santoso", telf1:"+62 21 5555-1234", autom:false },
    ],
  },
  "10000003":{ id:"10000003", name:"PT Solusi Nusantara",  tax:"03.456.789.0-123.000", addr:"Jl. HR Rasuna Said Kav. 62, Jakarta Selatan 12940", phone:"+62 21 5555-9012", email:"procurement@solusinus.co.id",
    banks:[
      {no:1, name:"Bank Rakyat Indonesia (BRI)", branch:"KCP Jakarta Selatan", acc:"0012-3456-7890", aname:"PT SOLUSI NUSANTARA", currency:"IDR", swift:"BRINIDJA", primary:true},
      {no:2, name:"Bank Mandiri",                branch:"KCP Kuningan",        acc:"1100-2200-3300", aname:"PT SOLUSI NUSANTARA", currency:"IDR", swift:"BMRIIDJA", primary:false},
    ],
    cat:"Goods & Services", since:"2018-09-01", rep:"Fajar Nugraha", status:"Active",
    npwpAddress:"Jl. HR Rasuna Said Kav. 62, Jakarta Selatan 12940", pkp:"PKP", taxStatus:"Active",
    certExpiry:"2027-08-31", website:"www.solusinus.co.id", fax:"+62 21 5555-9013",
    lfb1:[
      { bukrs:"BRMS", akont:"160000", zterm:"Z030", zwels:"T", reprf:true,  busab:"BRM003", fdgrp:"01", reconcAcct:"Accounts Payable - Trade" },
      { bukrs:"SHSI", akont:"160001", zterm:"Z030", zwels:"T", reprf:true,  busab:"SHS003", fdgrp:"01", reconcAcct:"Accounts Payable - Services" },
      { bukrs:"LMRS", akont:"160001", zterm:"Z045", zwels:"U", reprf:false, busab:"LMR003", fdgrp:"02", reconcAcct:"Accounts Payable - Services" },
    ],
    lfm1:[
      { ekorg:"BRMS", bukrs:"BRMS", waers:"IDR", zterm:"Z030", inco1:"DAP", inco2:"Jakarta",   minbw:0,         verkf:"Fajar Nugraha", telf1:"+62 21 5555-9012", autom:true  },
      { ekorg:"SHSI", bukrs:"SHSI", waers:"IDR", zterm:"Z030", inco1:"DAP", inco2:"Banten",    minbw:2000000,   verkf:"Fajar Nugraha", telf1:"+62 21 5555-9012", autom:true  },
      { ekorg:"LMRS", bukrs:"LMRS", waers:"IDR", zterm:"Z045", inco1:"FCA", inco2:"Aceh",      minbw:5000000,   verkf:"Fajar Nugraha", telf1:"+62 21 5555-9012", autom:false },
    ],
  },
  "10000002":{ id:"10000002", name:"CV Sukses Mandiri",  tax:"02.345.678.9-012.000", addr:"Jl. Gatot Subroto No. 45, Jakarta Pusat 10270", phone:"+62 21 5555-5678", email:"finance@suksesmandiri.co.id",
    banks:[
      {no:1, name:"Bank Central Asia (BCA)",branch:"KCP Jakarta Pusat",      acc:"9876-5432-1098",    aname:"CV SUKSES MANDIRI", currency:"IDR", swift:"CENAIDJA", primary:true  },
      {no:2, name:"Bank Negara Indonesia",  branch:"Kantor Cabang Jakarta",  acc:"3344-5566-7788",    aname:"CV SUKSES MANDIRI", currency:"IDR", swift:"BNINIDJA", primary:false },
    ],
    cat:"Services", since:"2021-07-22", rep:"Dewi Kusuma", status:"Active",
    npwpAddress:"Jl. Gatot Subroto No. 45, Jakarta Pusat 10270", pkp:"Non-PKP", taxStatus:"Active",
    certExpiry:"2026-07-21", website:"www.suksesmandiri.co.id", fax:"+62 21 5555-5679",
    lfb1:[
      { bukrs:"CPMS", akont:"160000", zterm:"Z030", zwels:"T", reprf:true,  busab:"CPM002", fdgrp:"01", reconcAcct:"Accounts Payable - Trade" },
      { bukrs:"GMIN", akont:"160000", zterm:"Z030", zwels:"T", reprf:true,  busab:"GMN002", fdgrp:"01", reconcAcct:"Accounts Payable - Trade" },
      { bukrs:"SHSI", akont:"160001", zterm:"Z045", zwels:"U", reprf:false, busab:"SHS001", fdgrp:"02", reconcAcct:"Accounts Payable - Services" },
      { bukrs:"LMRS", akont:"160001", zterm:"Z045", zwels:"U", reprf:false, busab:"LMR001", fdgrp:"02", reconcAcct:"Accounts Payable - Services" },
    ],
    lfm1:[
      { ekorg:"CPMS", bukrs:"CPMS", waers:"IDR", zterm:"Z030", inco1:"DAP", inco2:"Poboya",    minbw:0,        verkf:"Dewi Kusuma", telf1:"+62 21 5555-5678", autom:true  },
      { ekorg:"GMIN", bukrs:"GMIN", waers:"IDR", zterm:"Z030", inco1:"DAP", inco2:"Gorontalo", minbw:0,        verkf:"Dewi Kusuma", telf1:"+62 21 5555-5678", autom:true  },
      { ekorg:"SHSI", bukrs:"SHSI", waers:"IDR", zterm:"Z045", inco1:"FCA", inco2:"Banten",    minbw:2000000,  verkf:"Dewi Kusuma", telf1:"+62 21 5555-5678", autom:false },
      { ekorg:"LMRS", bukrs:"LMRS", waers:"IDR", zterm:"Z045", inco1:"FCA", inco2:"Aceh",      minbw:2000000,  verkf:"Dewi Kusuma", telf1:"+62 21 5555-5678", autom:false },
    ],
  },
};
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
// ── Invoice seed generator â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const _genItems = (poNumbers:string[], seed:number) => {
  const MATS = [
    {id:"MAT-OFF-001",desc:"A4 Paper 80gsm",              uom:"Ream",     p:50000},
    {id:"MAT-OFF-002",desc:"Stationery & Office Supplies", uom:"Set",      p:250000},
    {id:"MAT-IT-001", desc:"Laptop 14\" Core i7",          uom:"Unit",     p:8000000},
    {id:"MAT-IT-002", desc:"Monitor 24\" LED",             uom:"Unit",     p:2500000},
    {id:"MAT-IT-003", desc:"Wireless Keyboard & Mouse",    uom:"Set",      p:350000},
    {id:"MAT-SVC-001",desc:"Maintenance Service",          uom:"Man-Day",  p:2500000},
    {id:"MAT-SVC-002",desc:"Consulting Service",           uom:"Man-Hour", p:500000},
    {id:"MAT-MFG-001",desc:"Steel Pipe 2\" Sch.40",        uom:"Meter",    p:180000},
    {id:"MAT-MFG-002",desc:"Industrial Valve DN50",        uom:"Pcs",      p:750000},
    {id:"MAT-CHM-001",desc:"Lubricant Oil 20L",            uom:"Drum",     p:1200000},
    {id:"MAT-ELC-001",desc:"Cable NYY 4x10mm",             uom:"Meter",    p:95000},
    {id:"MAT-PPE-001",desc:"Safety Helmet",                uom:"Pcs",      p:250000},
    {id:"MAT-FUL-001",desc:"HSD Diesel Fuel",              uom:"Liter",    p:14000},
    {id:"MAT-CLN-001",desc:"Cleaning Chemical Supplies",   uom:"Liter",    p:45000},
    {id:"MAT-MED-001",desc:"First Aid Kit",                uom:"Kit",      p:350000},
  ];
  const VAT_CODES = ["V1","V1","V1","V2","V0"];
  let s = (seed+1)*1013904223;
  const rng = () => { s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; };
  const ri = (a:number,b:number)=>Math.floor(rng()*(b-a+1))+a;
  // Each PO must appear at least once; total items = max(poCount, 1-3)
  const extraItems = ri(0,2);
  const numItems = poNumbers.length + extraItems;
  const items:any[]=[];
  for(let i=0;i<numItems;i++){
    // First pass: one item per PO in order; extra items use random PO
    const po = i < poNumbers.length ? poNumbers[i] : poNumbers[Math.floor(rng()*poNumbers.length)];
    const mat=MATS[ri(0,MATS.length-1)];
    const qty=ri(2,50);
    const unitPrice=Math.round(mat.p*(0.8+rng()*0.4)/1000)*1000;
    items.push({poNo:po,poItem:String((i+1)*10).padStart(5,"0"),qty,uom:mat.uom,materialId:mat.id,materialDesc:mat.desc,unitPrice,vatCode:VAT_CODES[ri(0,VAT_CODES.length-1)]});
  }
  return items;
};

const _genInvoices = () => {
  const V = [
    {id:"10000001",name:"PT Maju Bersama",   pfx:"MJB", ccs:["BRMS","CPMS","GMIN"]},
    {id:"10000002",name:"CV Sukses Mandiri", pfx:"CSM", ccs:["CPMS","GMIN","SHSI","LMRS"]},
  ];
  const CURRS:[string,number,number][] = [
    // [currency, minAmt, maxAmt]
    ["IDR",  5000000,  500000000],
    ["IDR", 20000000,  800000000],
    ["IDR", 10000000,  300000000],
    ["USD",      5000,     95000],
    ["EUR",      3000,     80000],
    ["SGD",      8000,    120000],
    ["AUD",      6000,    110000],
    ["JPY",   1000000,  15000000],
    ["CNY",     50000,    900000],
    ["GBP",      2000,     60000],
    ["MYR",     20000,    350000],
  ];
  const DESCS = [
    "Office supplies and stationery Q{q} {y}",
    "IT hardware procurement – {mon} {y}",
    "Maintenance services {mon} {y}",
    "Consulting & advisory services Q{q} {y}",
    "Cleaning & hygiene services contract",
    "Security guard services – monthly",
    "Logistics and courier services {mon} {y}",
    "Engineering spare parts supply",
    "Software license & subscription renewal",
    "Training and development services",
    "Printing and documentation services",
    "Catering services – monthly contract",
    "Fuel & energy supply {mon} {y}",
    "Laboratory equipment and reagents",
    "HSE safety equipment procurement",
    "Medical supplies and first aid kit",
    "Uniforms and PPE procurement",
    "Network infrastructure maintenance",
    "Waste management services",
    "Vehicle rental and transportation",
    "Cloud hosting & managed services",
    "Civil construction works – Phase {q}",
    "Electrical installation & maintenance",
    "HVAC preventive maintenance {mon} {y}",
    "Inspection & quality audit services",
    "Mining survey and geotechnical study",
    "Drilling equipment supply – batch {q}",
    "Explosives handling and blasting",
    "Environmental monitoring services",
    "Import duties and freight forwarding",
  ];
  const MONS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const STATUSES = ["Draft","Draft","Submitted","Submitted","Submitted","Under Review","Under Review","Confirmed","Posted","Posted","Posted","Rejected","Converted to Invoice","Cleared"];
  const WHT = ["","","","PPh23","PPh23","PPh26","PPh4a2"];
  const pick = <T,>(arr:T[]):T => arr[Math.floor(Math.abs(Math.sin(arr.length)*99999)%arr.length)];

  // deterministic-ish seeded pseudo-random to avoid hydration differences
  let seed = 42;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  const ri  = (min,max) => Math.floor(rng()*(max-min+1))+min;
  const rp  = <T,>(arr:T[]):T => arr[ri(0,arr.length-1)];

  const dateAdd = (base:string, days:number) => {
    const d = new Date(base); d.setDate(d.getDate()+days); return d.toISOString().split("T")[0];
  };
  const fmtSeq = (n:number) => String(n).padStart(3,"0");
  const fpNum  = (n:number) => String(n).padStart(8,"0");

  const rows:any[] = [];
  // Keep the 8 canonical seed rows first (hand-written below), then append generated
  const BASE_PO = 4500001244;
  const seqCounters:{[k:string]:number} = {"MJB":5,"CSM":5};

  for(let i=0;i<250;i++){
    const vendor   = rp(V);
    const pfx      = vendor.pfx;
    seqCounters[pfx] = (seqCounters[pfx]||0)+1;
    const seq      = seqCounters[pfx];
    const cc       = rp(vendor.ccs);
    const [curr,mn,mx] = rp(CURRS);
    const rawAmt   = ri(mn,mx);
    const amount   = curr==="IDR"?Math.round(rawAmt/1000)*1000:Math.round(rawAmt*100)/100;
    const vatBase  = amount;
    const vatAmt   = Math.round(vatBase*0.11*100)/100;
    const whtType  = rp(WHT);
    const whtRate  = whtType==="PPh23"?0.02:whtType==="PPh26"?0.20:whtType==="PPh4a2"?0.04:whtType==="PPh21"?0.05:0;
    const whtBase  = whtType?amount:0;
    const whtAmt   = Math.round(whtBase*whtRate*100)/100;
    const invType  = rng()<0.18?"Supplier DPR":"Invoice";

    const year     = ri(2024,2025);
    const month    = ri(1,12);
    const day      = ri(1,28);
    const invDate  = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const paymentTerms = rp(["Z014","Z030","Z030","Z030","Z045","Z060"]);
    const dueDate  = dateAdd(invDate, _topDays[paymentTerms]);

    const status   = rp(STATUSES);
    const hasTax   = invType==="Invoice"&&rng()>0.25;
    const taxDoc   = hasTax?`FP-010.000-${String(year).slice(2)}.${fpNum(100+i)}`:"";
    const numPOs   = rng()<0.25?2:1;
    const poNumbers= Array.from({length:numPOs},(_,k)=>String(BASE_PO+i*3+k));

    const submittedAt  = ["Draft"].includes(status)?null:dateAdd(invDate,ri(1,5));
    const confirmedAt  = ["Draft","Submitted","Under Review","Rejected"].includes(status)?null:
                         submittedAt?dateAdd(submittedAt,ri(2,7)):null;
    const postedAt     = ["Posted","Converted to Invoice","Cleared"].includes(status)&&confirmedAt?dateAdd(confirmedAt,ri(1,4)):null;
    const sapDocNo     = postedAt
                         ? (invType==="Supplier DPR"?`${cc}/${String(1000000+i).padStart(10,"0").slice(0,10)}/2025`:`${String(5100000+i).padStart(10,"0").slice(0,10)}/2025`)
                         : null;
    const convertedDocNo = status==="Converted to Invoice"||status==="Cleared"?`${String(5200000+i).padStart(10,"0").slice(0,10)}/2025`:null;
    const clearingDocNo  = status==="Cleared"?`${cc}/${String(400000+i)}/2025`:null;

    const mon = MONS[month-1];
    const q   = Math.ceil(month/3);
    const rawDesc = rp(DESCS).replace("{mon}",mon).replace("{y}",String(year)).replace("{q}",String(q));

    rows.push({
      id:`PI-GEN-${String(i+1).padStart(4,"0")}`,
      invoiceType:invType,
      vendorId:vendor.id, vendorName:vendor.name,
      invoiceNo:`INV/${pfx}/${year}/${fmtSeq(seq)}`,
      invoiceDate:invDate, dueDate, paymentTerms,
      poNumbers, companyCode:cc,
      amount, currency:curr,
      vatBase, vatAmt, whtType, whtBase, whtAmt,
      desc:rawDesc, status,
      sapDocNo, postedAt, taxDoc,
      files: rng()>0.4?["invoice.pdf","faktur_pajak.pdf"]:rng()>0.5?["invoice.pdf"]:[],
      submittedAt, confirmedAt,
      convertedDocNo, clearingDocNo,
      additionalFee: rng()<0.25?Math.round(rng()*amount*0.02/1000)*1000:0,
      feeCategory: rng()<0.25?rp(["Stamp Duty Fee","Interest / Penalty Fee"]):"",
      rejReason: status==="Rejected"?rp(["Missing supporting documents.","PO number mismatch. Please verify.","Duplicate invoice detected.","Amount exceeds PO value. Revise and resubmit.","Faktur Pajak not valid. Check tax document number."]):"",
      items: _genItems(poNumbers, i),
    });
  }
  return rows;
};

export const INIT_INV = (() => {
  const base = [
  { id:"PI-2025-0001", invoiceType:"Invoice",      vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/001", invoiceDate:"2025-06-01", dueDate:"2025-07-01", paymentTerms:"Z030", poNumbers:["4500001234"], companyCode:"BRMS", amount:125000000, currency:"IDR", vatBase:125000000, vatAmt:13750000, whtType:"",      whtBase:0,         whtAmt:0,       additionalFee:500000,  feeCategory:"Stamp Duty Fee",   desc:"Office supplies Q2 2025",                          status:"Posted",               sapDocNo:"5100000001/2025",      postedAt:"2025-06-10", taxDoc:"FP-010.000-25.00000001", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-02", confirmedAt:"2025-06-05", convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0002", invoiceType:"Invoice",      vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/002", invoiceDate:"2025-06-10", dueDate:"2025-07-10", paymentTerms:"Z030", poNumbers:["4500001235"], companyCode:"CPMS", amount:87500000,  currency:"IDR", vatBase:87500000,  vatAmt:9625000,  whtType:"",      whtBase:0,         whtAmt:0,       additionalFee:0,       feeCategory:"",                  desc:"IT peripherals and accessories",                    status:"Under Review",         sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000002", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-11", confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0003", invoiceType:"Invoice",      vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/003", invoiceDate:"2025-06-15", dueDate:"2025-07-15", paymentTerms:"Z030", poNumbers:["4500001236","4500001237"], companyCode:"BRMS", amount:45000000, currency:"IDR", vatBase:45000000, vatAmt:4950000, whtType:"PPh23", whtBase:45000000, whtAmt:900000,  additionalFee:0,       feeCategory:"",                  desc:"Maintenance services June 2025",                    status:"Draft",                sapDocNo:null,                   postedAt:null,          taxDoc:"",                       files:[],                                 submittedAt:null,          confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0004", invoiceType:"Invoice",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/001", invoiceDate:"2025-06-05", dueDate:"2025-07-05", paymentTerms:"Z030", poNumbers:["4500001238"], companyCode:"SHSI", amount:230000000, currency:"IDR", vatBase:230000000, vatAmt:25300000, whtType:"PPh23", whtBase:230000000, whtAmt:4600000, additionalFee:1000000, feeCategory:"Interest / Penalty Fee", desc:"Cleaning services contract Q2",                     status:"Submitted",            sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000003", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-06", confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0005", invoiceType:"Invoice",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/002", invoiceDate:"2025-06-18", dueDate:"2025-07-18", paymentTerms:"Z030", poNumbers:["4500001239","4500001240"], companyCode:"LMRS", amount:15000000, currency:"IDR", vatBase:15000000, vatAmt:1650000, whtType:"PPh23", whtBase:15000000, whtAmt:300000,  additionalFee:0,       feeCategory:"",                  desc:"Courier services May 2025",                         status:"Rejected",        sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000004", files:["invoice.pdf"],                    submittedAt:"2025-06-19", confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"Missing Faktur Pajak. Please resubmit with complete tax document." },
  { id:"PI-2025-0006", invoiceType:"Supplier DPR", vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/004", invoiceDate:"2025-06-20", dueDate:"2025-07-20", paymentTerms:"Z030", poNumbers:["4500001241"], companyCode:"GMIN", amount:8500,      currency:"USD", vatBase:8500,      vatAmt:935,      whtType:"PPh26", whtBase:8500,      whtAmt:1700,    additionalFee:0,       feeCategory:"",                  desc:"Enterprise software license renewal (Salesforce)",  status:"Posted",               sapDocNo:"BRMS/1000000001/2025", postedAt:"2025-06-25", taxDoc:"FP-010.000-25.00000005", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-21", confirmedAt:"2025-06-23", convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0007", invoiceType:"Supplier DPR", vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/003", invoiceDate:"2025-06-20", dueDate:"2025-07-20", paymentTerms:"Z030", poNumbers:["4500001242"], companyCode:"CPMS", amount:12000,     currency:"AUD", vatBase:12000,     vatAmt:1320,     whtType:"PPh23", whtBase:12000,     whtAmt:240,     additionalFee:0,       feeCategory:"",                  desc:"Training & consulting services – Sydney workshop",  status:"Confirmed",            sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000006", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-22", confirmedAt:"2025-06-24", convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0008", invoiceType:"Invoice",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/004", invoiceDate:"2025-06-22", dueDate:"2025-07-22", paymentTerms:"Z030", poNumbers:["4500001243"], companyCode:"GMIN", amount:45000,     currency:"CNY", vatBase:45000,     vatAmt:4950,     whtType:"",      whtBase:0,         whtAmt:0,       additionalFee:0,       feeCategory:"",                  desc:"Manufacturing components supply – June batch",      status:"Draft",                sapDocNo:null,                   postedAt:null,          taxDoc:"",                       files:[],                                 submittedAt:null,          confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  ..._genInvoices(),
  ];
  return base.map((inv:any,idx:number)=>inv.items?inv:{...inv,items:_genItems(inv.poNumbers,idx+100)});
})();
export const INIT_RFQS = [
  { id:"RFQ-2025-0041", title:"Conveyor Belt Replacement – Crushing Plant",      postedDate:"2025-08-15", closingDate:"2025-09-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:680000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Replacement of conveyor belts ST1200 grade for primary and secondary crushing plant.", status:"Created",
    items:[
      {no:1, desc:"Conveyor Belt ST1200 – 1200mm W (per meter)", type:"Material", acctAssign:"P – Project", materialNo:"CBT-ST1-001", materialGroup:"Conveyor Parts", plant:"PL02", qty:800,  uom:"Meter", estPrice:750000, requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:2, desc:"Belt Fastener & Splicing Kit",                 type:"Material", acctAssign:"P – Project", materialNo:"CBT-FST-002", materialGroup:"Conveyor Parts", plant:"PL02", qty:30,   uom:"Set",   estPrice:3500000,requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0042", title:"Cloud ERP Subscription – SAP S/4HANA Public Cloud", postedDate:"2025-08-16", closingDate:"2025-09-16", postedBy:"Siti Rahma",   targets:["10000001","10000003"],            cat:"IT Services",      estVal:1500000000, companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual subscription and implementation support for SAP S/4HANA Public Cloud for BRM Group.", status:"Created",
    items:[
      {no:1, desc:"SAP S/4HANA Public Cloud – Annual Subscription", type:"Service", acctAssign:"K – Cost Center", materialNo:"SAP-SUB-001", materialGroup:"Software License", plant:"PL01", qty:1, uom:"Annual", estPrice:1200000000, requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:2, desc:"SAP Basis & Support Services",                    type:"Service", acctAssign:"K – Cost Center", materialNo:"SAP-BSS-002", materialGroup:"IT Consulting",    plant:"PL01", qty:12,uom:"Month",  estPrice:25000000,  requirementDate:"", startDate:"2026-01-01", endDate:"2026-12-31"},
    ]},
  { id:"RFQ-2025-0043", title:"Bulk Bag (FIBC) Supply – Mineral Concentrate",     postedDate:"2025-08-17", closingDate:"2025-09-17", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:320000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Annual supply of 1-ton FIBC bulk bags for mineral concentrate export packaging.", status:"Created",
    items:[
      {no:1, desc:"FIBC Bulk Bag 1T – 4-loop (per unit)", type:"Material", acctAssign:"P – Project", materialNo:"PKG-FBC-001", materialGroup:"Packaging Materials", plant:"PL05", qty:20000, uom:"Pcs", estPrice:16000, requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0044", title:"Stationery & Office Consumables – Q4 2025",        postedDate:"2025-08-18", closingDate:"2025-09-18", postedBy:"Siti Rahma",   targets:["10000001","10000003"],            cat:"Office Supplies",  estVal:75000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Q4 procurement of stationery, toner cartridges, and general office consumables for all departments.", status:"Created",
    items:[
      {no:1, desc:"A4 Paper 80gsm (500 sheets/ream)",      type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-PPR-004", materialGroup:"Office Supplies", plant:"PL01", qty:2000, uom:"Ream", estPrice:55000,  requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Laser Toner Cartridge (HP LaserJet)",   type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-TNR-002", materialGroup:"Office Supplies", plant:"PL01", qty:150,  uom:"Pcs",  estPrice:350000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:3, desc:"Whiteboard Marker Set (12 colors)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-MRK-003", materialGroup:"Office Supplies", plant:"PL01", qty:100,  uom:"Set",  estPrice:85000,  requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0045", title:"Pump Overhaul – Slurry Pumps Batch 2025",          postedDate:"2025-08-19", closingDate:"2025-09-19", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"Engineering",      estVal:560000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Overhaul and reconditioning of 8 units slurry pumps at SHS processing plant – annual maintenance program.", status:"Created",
    items:[
      {no:1, desc:"Slurry Pump Overhaul (per unit)",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"PMP-OVH-001", materialGroup:"Maintenance Svc", plant:"PL03", qty:8,  uom:"Unit",    estPrice:55000000, requirementDate:"", startDate:"2025-11-01", endDate:"2025-12-31"},
      {no:2, desc:"Wear Parts Kit (impeller, casing liner)", type:"Material", acctAssign:"K – Cost Center", materialNo:"PMP-WPK-002", materialGroup:"Spare Parts",     plant:"PL03", qty:8,  uom:"Set",     estPrice:15000000, requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0046", title:"Uniform & Workwear – Annual Supply 2026",          postedDate:"2025-08-20", closingDate:"2025-09-20", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:180000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual supply of company uniforms and field workwear for all BRM Group employees (estimated 600 persons).", status:"Created",
    items:[
      {no:1, desc:"Office Uniform Set (shirt + pants)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"UNF-OFC-001", materialGroup:"Uniforms", plant:"PL01", qty:600,  uom:"Set", estPrice:180000, requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:2, desc:"Field Coverall Wearpack",                type:"Material", acctAssign:"K – Cost Center", materialNo:"UNF-FLD-002", materialGroup:"Uniforms", plant:"PL01", qty:400,  uom:"Pcs", estPrice:120000, requirementDate:"2026-01-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0047", title:"CCTV & Access Control – Site Security Upgrade",    postedDate:"2025-08-21", closingDate:"2025-09-21", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"IT Equipment",     estVal:420000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply and installation of IP CCTV cameras, NVR, and access control system for CPMS site perimeter.", status:"Created",
    items:[
      {no:1, desc:"IP Camera 4MP Outdoor (Hikvision)",      type:"Material", acctAssign:"P – Project", materialNo:"SEC-CAM-001", materialGroup:"Security Equip", plant:"PL02", qty:80,  uom:"Unit",    estPrice:2500000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"NVR 64-channel + Storage (30TB)",        type:"Material", acctAssign:"P – Project", materialNo:"SEC-NVR-002", materialGroup:"Security Equip", plant:"PL02", qty:4,   uom:"Unit",    estPrice:45000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:3, desc:"Access Control System – Gate",           type:"Service",  acctAssign:"P – Project", materialNo:"SEC-ACS-003", materialGroup:"Security Equip", plant:"PL02", qty:1,   uom:"Lump Sum",estPrice:80000000, requirementDate:"", startDate:"2025-11-15", endDate:"2025-12-31"},
    ]},
  { id:"RFQ-2025-0048", title:"Photovoltaic Solar Panel – Camp Power",            postedDate:"2025-08-22", closingDate:"2025-09-22", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Engineering",      estVal:1100000000, companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Design, supply, and installation of 500 kWp solar PV hybrid system to reduce diesel dependency at Linge camp.", status:"Created",
    items:[
      {no:1, desc:"Solar Panel 550Wp Monocrystalline",      type:"Material", acctAssign:"P – Project", materialNo:"SOL-PNL-001", materialGroup:"Energy Equip", plant:"PL05", qty:910,  uom:"Unit",    estPrice:850000,    requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:2, desc:"Inverter 100kW Grid-Tie",                type:"Material", acctAssign:"P – Project", materialNo:"SOL-INV-002", materialGroup:"Energy Equip", plant:"PL05", qty:5,    uom:"Unit",    estPrice:75000000,  requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:3, desc:"EPC & Commissioning Service",            type:"Service",  acctAssign:"P – Project", materialNo:"SOL-EPC-003", materialGroup:"Energy Equip", plant:"PL05", qty:1,    uom:"Lump Sum",estPrice:325000000, requirementDate:"", startDate:"2026-01-15", endDate:"2026-04-30"},
    ]},
  { id:"RFQ-2025-0049", title:"Drilling Consumables – Diamond Core Bits",         postedDate:"2025-08-23", closingDate:"2025-09-23", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:490000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Supply of diamond core drill bits (NQ, HQ, PQ) and drill rods for Gorontalo exploration program.", status:"Created",
    items:[
      {no:1, desc:"Diamond Core Bit NQ (per unit)",         type:"Material", acctAssign:"P – Project", materialNo:"DRL-BIT-001", materialGroup:"Drilling Supplies", plant:"PL04", qty:500,  uom:"Pcs", estPrice:550000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:2, desc:"Diamond Core Bit HQ (per unit)",         type:"Material", acctAssign:"P – Project", materialNo:"DRL-BIT-002", materialGroup:"Drilling Supplies", plant:"PL04", qty:300,  uom:"Pcs", estPrice:750000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:3, desc:"Drill Rod NQ 3m (per rod)",              type:"Material", acctAssign:"P – Project", materialNo:"DRL-ROD-003", materialGroup:"Drilling Supplies", plant:"PL04", qty:200,  uom:"Pcs", estPrice:1200000,  requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0050", title:"Air Compressor Rental – Plant Maintenance",        postedDate:"2025-08-24", closingDate:"2025-09-24", postedBy:"Siti Rahma",   targets:["10000002","10000003"],            cat:"Equipment Rental",  estVal:216000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Rental of portable diesel air compressors (375 CFM) for plant maintenance and pneumatic tool operations.", status:"Created",
    items:[
      {no:1, desc:"Air Compressor 375 CFM Diesel Rental",   type:"Service",  acctAssign:"K – Cost Center", materialNo:"EQP-ACP-001", materialGroup:"Equipment Rental", plant:"PL03", qty:12, uom:"Month", estPrice:18000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-10-31"},
    ]},
  { id:"RFQ-2025-0001", title:"Procurement of Laptops & Workstations", postedDate:"2025-06-01", closingDate:"2025-06-20", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"IT Equipment",    estVal:500000000, companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"BRM requires 50 laptops and 20 workstations for office expansion.", status:"Complete",
    items:[
      {no:1, desc:"Laptop 14\" Core i7",   type:"Material", acctAssign:"K – Cost Center", materialNo:"IT-LPT-001", materialGroup:"IT Hardware",  plant:"PL01", qty:50,  uom:"Unit",         estPrice:8000000,  requirementDate:"2025-07-15", startDate:"", endDate:""},
      {no:2, desc:"Workstation Dell XPS",  type:"Material", acctAssign:"K – Cost Center", materialNo:"IT-WKS-002", materialGroup:"IT Hardware",  plant:"PL01", qty:20,  uom:"Unit",         estPrice:12500000, requirementDate:"2025-07-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0002", title:"Office Supplies Annual Contract",         postedDate:"2025-06-10", closingDate:"2025-06-30", postedBy:"Siti Rahma",   targets:["10000001","10000003"],           cat:"Office Supplies", estVal:150000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Annual supply of office stationery and printing consumables.", status:"On Process",
    items:[
      {no:1, desc:"A4 Paper 80gsm",              type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-PPR-001", materialGroup:"Office Supplies", plant:"PL02", qty:1000, uom:"Ream", estPrice:50000,  requirementDate:"2025-07-01", startDate:"", endDate:""},
      {no:2, desc:"Ink Cartridge (Various)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-INK-002", materialGroup:"Office Supplies", plant:"PL02", qty:200,  uom:"Pcs",  estPrice:300000, requirementDate:"2025-07-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0003", title:"Security Services – HO Building",         postedDate:"2025-05-20", closingDate:"2025-06-10", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],           cat:"Services",        estVal:360000000, companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Security guard services for Head Office 24/7, 12 months.", status:"Pending Approval", submittedForApprovalAt:"2025-06-12", submittedForApprovalBy:"Ahmad Rizki",
    items:[
      {no:1, desc:"Security Guard Day Shift",   type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-SEC-001", materialGroup:"Security Services", plant:"PL03", qty:12, uom:"Person/Month", estPrice:8000000,  requirementDate:"", startDate:"2025-07-01", endDate:"2026-06-30"},
      {no:2, desc:"Security Guard Night Shift", type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-SEC-002", materialGroup:"Security Services", plant:"PL03", qty:12, uom:"Person/Month", estPrice:10000000, requirementDate:"", startDate:"2025-07-01", endDate:"2026-06-30"},
    ],
    discussions:[
      {id:"D-003-001", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-06-12 09:15", message:"I have reviewed the quotation from CV Sukses Mandiri. Pricing is within budget and their track record for security services is solid. Recommending for approval."},
      {id:"D-003-002", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-06-12 10:30", message:"Agreed. I also checked their TKDN compliance — they meet the 40% local content threshold. Contract duration 12 months is appropriate."},
      {id:"D-003-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-06-13 08:45", message:"Noted. Please confirm: does this contract include BPJS Ketenagakerjaan for all security personnel? This is a compliance requirement before I can approve."},
      {id:"D-003-004", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-06-13 09:20", message:"Yes, confirmed. Vendor has submitted BPJS enrollment proof for all 24 guards. Documents attached in the quotation file. We are ready for your approval, Pak Budi."},
    ]},
  { id:"RFQ-2025-0004", title:"HVAC Maintenance Contract",                    postedDate:"2025-06-15", closingDate:"2025-07-15", postedBy:"Siti Rahma",  targets:["10000001","10000002","10000003"], cat:"Services",         estVal:240000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Annual preventive maintenance for HVAC systems across all floors.", status:"Closed",
    items:[
      {no:1, desc:"Preventive Maintenance Visit",      type:"Service",  acctAssign:"K – Cost Center", materialNo:"SVC-HVC-001", materialGroup:"Facility Services",   plant:"PL04", qty:12,   uom:"Visit",     estPrice:20000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-07-31"},
    ]},
  { id:"RFQ-2025-0005", title:"Explosive Materials – Blasting Supplies",      postedDate:"2025-06-20", closingDate:"2025-07-20", postedBy:"Ahmad Rizki", targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:875000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply of ANFO, detonators, and blasting accessories for open-pit operations.", status:"Open",
    items:[
      {no:1, desc:"ANFO Bulk Explosive",               type:"Material", acctAssign:"P – Project",     materialNo:"MIN-EXP-001", materialGroup:"Mining Materials",    plant:"PL02", qty:50000,uom:"KG",      estPrice:8500,     requirementDate:"2025-08-15", startDate:"", endDate:""},
      {no:2, desc:"Electric Detonator",                type:"Material", acctAssign:"P – Project",     materialNo:"MIN-DET-002", materialGroup:"Mining Materials",    plant:"PL02", qty:2000, uom:"Pcs",     estPrice:35000,    requirementDate:"2025-08-15", startDate:"", endDate:""},
      {no:3, desc:"Safety Fuse (100m/roll)",           type:"Material", acctAssign:"P – Project",     materialNo:"MIN-FUS-003", materialGroup:"Mining Materials",    plant:"PL02", qty:500,  uom:"Roll",    estPrice:125000,   requirementDate:"2025-08-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0006", title:"Genset Rental – Remote Site Power",            postedDate:"2025-06-22", closingDate:"2025-07-22", postedBy:"Siti Rahma",  targets:["10000002","10000003"],            cat:"Services",         estVal:480000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Rental of diesel generators (500 kVA) for Linge Minerals remote field site for 12 months.", status:"On Process",
    items:[
      {no:1, desc:"Genset 500 kVA Rental",             type:"Service",  acctAssign:"P – Project",     materialNo:"SVC-GEN-001", materialGroup:"Equipment Rental",    plant:"PL05", qty:12,   uom:"Month",   estPrice:40000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-07-31"},
    ]},
  { id:"RFQ-2025-0007", title:"Personal Protective Equipment (PPE)",          postedDate:"2025-06-25", closingDate:"2025-07-25", postedBy:"Ahmad Rizki", targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:120000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual PPE procurement for all subsidiaries: helmets, boots, vests, gloves, and goggles.", status:"Open",
    items:[
      {no:1, desc:"Safety Helmet (SNI certified)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"PPE-HLM-001", materialGroup:"Safety Equipment",    plant:"PL01", qty:500,  uom:"Pcs",     estPrice:75000,    requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:2, desc:"Safety Boot (Steel Toe)",           type:"Material", acctAssign:"K – Cost Center", materialNo:"PPE-BOT-002", materialGroup:"Safety Equipment",    plant:"PL01", qty:300,  uom:"Pair",    estPrice:350000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:3, desc:"High-Visibility Safety Vest",       type:"Material", acctAssign:"K – Cost Center", materialNo:"PPE-VST-003", materialGroup:"Safety Equipment",    plant:"PL01", qty:600,  uom:"Pcs",     estPrice:85000,    requirementDate:"2025-08-20", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0008", title:"ERP Consulting Services – SAP Add-On",         postedDate:"2025-06-10", closingDate:"2025-07-10", postedBy:"Ahmad Rizki", targets:["10000001","10000002","10000003"], cat:"IT Services",      estVal:650000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Consulting & implementation services for SAP Public Cloud add-on modules (BTP, Analytics).", status:"Pending Approval", submittedForApprovalAt:"2025-06-25", submittedForApprovalBy:"Siti Rahma",
    items:[
      {no:1, desc:"SAP BTP Integration Consultant",   type:"Service",  acctAssign:"P – Project",     materialNo:"SVC-SAP-001", materialGroup:"IT Consulting",       plant:"PL01", qty:6,    uom:"Month",   estPrice:85000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-01-31"},
      {no:2, desc:"SAP Analytics Cloud Specialist",   type:"Service",  acctAssign:"P – Project",     materialNo:"SVC-SAP-002", materialGroup:"IT Consulting",       plant:"PL01", qty:4,    uom:"Month",   estPrice:75000000, requirementDate:"", startDate:"2025-09-01", endDate:"2025-12-31"},
    ],
    discussions:[
      {id:"D-008-001", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-06-25 14:00", message:"Both vendors submitted strong technical proposals. PT Maju Bersama quoted IDR 630M with 2 consultants (SAP BTP + Analytics Cloud), while CV Sukses Mandiri quoted IDR 680M with senior profiles. I recommend PT Maju Bersama based on value for money."},
      {id:"D-008-002", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-06-25 15:30", message:"Concur with Siti. PT Maju Bersama's consultants have SAP Activate certification. I suggest we negotiate a 5% reduction given the 10-month engagement — bringing effective cost to ~IDR 598M, very competitive."},
      {id:"D-008-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-06-26 09:00", message:"Budget cap for IT consulting this year is IDR 700M — both vendors are within range. My concern is knowledge transfer. Please ensure the SOW includes mandatory handover sessions and documentation of all custom developments before go-live."},
      {id:"D-008-004", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-06-26 10:15", message:"Understood, Pak Budi. We will include knowledge transfer milestone (minimum 2 sessions) in the contract. Submitting for your final approval with the updated SOW clause."},
    ]},
  { id:"RFQ-2025-0009", title:"Water Treatment Chemicals – Mining Site",       postedDate:"2025-06-28", closingDate:"2025-07-28", postedBy:"Siti Rahma",  targets:["10000001","10000002","10000003"], cat:"Goods",            estVal:195000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply of coagulants, flocculants, and pH adjustment chemicals for wastewater treatment at Palu site.", status:"Open",
    items:[
      {no:1, desc:"Coagulant PAC (25 kg/bag)",        type:"Material", acctAssign:"K – Cost Center", materialNo:"CHM-PAC-001", materialGroup:"Chemicals",           plant:"PL02", qty:500,  uom:"Bag",     estPrice:180000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:2, desc:"Anionic Flocculant (20 kg/bag)",   type:"Material", acctAssign:"K – Cost Center", materialNo:"CHM-FLC-002", materialGroup:"Chemicals",           plant:"PL02", qty:300,  uom:"Bag",     estPrice:250000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:3, desc:"Caustic Soda (NaOH) 50 kg/drum",  type:"Material", acctAssign:"K – Cost Center", materialNo:"CHM-NHO-003", materialGroup:"Chemicals",           plant:"PL02", qty:150,  uom:"Drum",    estPrice:420000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0010", title:"Medical & First Aid Supplies – All Sites",      postedDate:"2025-06-29", closingDate:"2025-07-29", postedBy:"Siti Rahma",  targets:["10000001","10000002","10000003"], cat:"Medical Supplies", estVal:88000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual procurement of first aid kits, medicines, and medical consumables for all 5 site clinics.", status:"Open",
    items:[
      {no:1, desc:"First Aid Kit (50-person)",        type:"Material", acctAssign:"K – Cost Center", materialNo:"MED-FAK-001", materialGroup:"Medical Supplies",    plant:"PL01", qty:25,   uom:"Set",     estPrice:1200000,  requirementDate:"2025-08-10", startDate:"", endDate:""},
      {no:2, desc:"AED Defibrillator",                type:"Material", acctAssign:"K – Cost Center", materialNo:"MED-AED-002", materialGroup:"Medical Equipment",   plant:"PL01", qty:5,    uom:"Unit",    estPrice:12000000, requirementDate:"2025-08-10", startDate:"", endDate:""},
      {no:3, desc:"Stretcher & Immobilization Board", type:"Material", acctAssign:"K – Cost Center", materialNo:"MED-STR-003", materialGroup:"Medical Equipment",   plant:"PL01", qty:10,   uom:"Pcs",     estPrice:850000,   requirementDate:"2025-08-10", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0011", title:"Drone Survey & Aerial Mapping Services",        postedDate:"2025-06-30", closingDate:"2025-07-30", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"Survey Services",   estVal:320000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Topographic drone survey and 3D terrain modelling for Gorontalo open-pit expansion area (Â±2,500 ha).", status:"Open",
    items:[
      {no:1, desc:"Drone Aerial Survey (per hectare)", type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-DRN-001", materialGroup:"Survey Services",     plant:"PL04", qty:2500, uom:"Ha",      estPrice:120000,   requirementDate:"2025-08-25", startDate:"", endDate:""},
      {no:2, desc:"3D Point Cloud Processing & Report",type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-DRN-002", materialGroup:"Survey Services",     plant:"PL04", qty:1,    uom:"Lump Sum",estPrice:45000000, requirementDate:"2025-09-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0012", title:"Heavy Equipment Rental – Excavator & Dozer",   postedDate:"2025-07-01", closingDate:"2025-08-01", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Equipment Rental",  estVal:960000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Rental of heavy earthmoving equipment for Palu open-pit stripping operations – 12 months.", status:"Open",
    items:[
      {no:1, desc:"Hydraulic Excavator 36T (Komatsu PC360)", type:"Service", acctAssign:"P – Project", materialNo:"EQP-EXC-001", materialGroup:"Heavy Equipment", plant:"PL02", qty:12, uom:"Month", estPrice:55000000, requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
      {no:2, desc:"Bulldozer D85 (Komatsu)",                  type:"Service", acctAssign:"P – Project", materialNo:"EQP-DZR-002", materialGroup:"Heavy Equipment", plant:"PL02", qty:12, uom:"Month", estPrice:25000000, requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
    ]},
  { id:"RFQ-2025-0013", title:"Laboratory Testing Services – Ore Samples",     postedDate:"2025-07-02", closingDate:"2025-08-02", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"Lab Services",      estVal:144000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Third-party geochemical assay and fire assay services for Gorontalo gold ore samples.", status:"Open",
    items:[
      {no:1, desc:"Fire Assay – Au (per sample)",     type:"Service",  acctAssign:"P – Project",    materialNo:"LAB-FAS-001", materialGroup:"Lab Services",        plant:"PL04", qty:2000, uom:"Sample", estPrice:45000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
      {no:2, desc:"ICP-MS Multi-element Analysis",   type:"Service",  acctAssign:"P – Project",    materialNo:"LAB-ICP-002", materialGroup:"Lab Services",        plant:"PL04", qty:1500, uom:"Sample", estPrice:55000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0014", title:"Catering & Mess Hall Services – Aceh Camp",     postedDate:"2025-07-03", closingDate:"2025-08-03", postedBy:"Siti Rahma",   targets:["10000002","10000003"],            cat:"Services",          estVal:540000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Full catering services for 150-person mining camp at Linge Minerals, Aceh – 12 months.", status:"On Process",
    items:[
      {no:1, desc:"Catering per Person per Day",      type:"Service",  acctAssign:"K – Cost Center", materialNo:"CAT-MPD-001", materialGroup:"Catering Services",   plant:"PL05", qty:54750, uom:"Person/Day", estPrice:85000, requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
    ]},
  { id:"RFQ-2025-0015", title:"Telecommunication – VSAT & Radio System",       postedDate:"2025-07-05", closingDate:"2025-08-05", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"IT Services",       estVal:410000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"VSAT internet and VHF/UHF radio communication system for remote Aceh camp.", status:"Closed",
    items:[
      {no:1, desc:"VSAT Installation & Hardware",    type:"Material", acctAssign:"P – Project",    materialNo:"TEL-VST-001", materialGroup:"Telecom Equipment",   plant:"PL05", qty:1,    uom:"Set",     estPrice:180000000, requirementDate:"2025-09-15", startDate:"", endDate:""},
      {no:2, desc:"VSAT Monthly Bandwidth (100Mbps)",type:"Service",  acctAssign:"P – Project",    materialNo:"TEL-BND-002", materialGroup:"Telecom Services",    plant:"PL05", qty:12,   uom:"Month",   estPrice:15000000,  requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0016", title:"Waste Management & Environmental Services",      postedDate:"2025-07-07", closingDate:"2025-08-07", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Environmental",     estVal:280000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Hazardous and non-hazardous waste collection, treatment, and disposal services for all BRM sites.", status:"Open",
    items:[
      {no:1, desc:"B3 Hazardous Waste Handling (kg)", type:"Service", acctAssign:"K – Cost Center", materialNo:"ENV-B3W-001", materialGroup:"Waste Management",    plant:"PL01", qty:50000,uom:"KG",      estPrice:3500,      requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
      {no:2, desc:"Non-B3 Waste Disposal (month)",   type:"Service",  acctAssign:"K – Cost Center", materialNo:"ENV-NBW-002", materialGroup:"Waste Management",    plant:"PL01", qty:12,   uom:"Month",   estPrice:8000000,   requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
    ]},
  { id:"RFQ-2025-0017", title:"Fuel Supply – Diesel & Avgas",                   postedDate:"2025-07-08", closingDate:"2025-08-08", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",             estVal:1200000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Annual supply of HSD diesel fuel and aviation gasoline for plant and helicopter operations in Palu.", status:"Open",
    items:[
      {no:1, desc:"HSD Diesel Fuel (Liter)",         type:"Material", acctAssign:"P – Project",    materialNo:"FUL-HSD-001", materialGroup:"Fuel & Energy",       plant:"PL02", qty:3000000,uom:"Liter",  estPrice:330,       requirementDate:"2025-09-01", startDate:"", endDate:""},
      {no:2, desc:"Aviation Gasoline – Avgas 100LL", type:"Material", acctAssign:"P – Project",    materialNo:"FUL-AVG-002", materialGroup:"Fuel & Energy",       plant:"PL02", qty:50000,  uom:"Liter",  estPrice:18000,     requirementDate:"2025-09-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0018", title:"Tailings Dam Monitoring – Instrumentation",      postedDate:"2025-07-10", closingDate:"2025-08-10", postedBy:"Siti Rahma",   targets:["10000001","10000003"],            cat:"Engineering",       estVal:375000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Supply and installation of geotechnical instrumentation for tailings storage facility monitoring at SHS.", status:"Open",
    items:[
      {no:1, desc:"Piezometer (vibrating wire)",     type:"Material", acctAssign:"P – Project",    materialNo:"GEO-PIZ-001", materialGroup:"Geotechnical Equip",  plant:"PL03", qty:20,   uom:"Unit",    estPrice:8500000,   requirementDate:"2025-09-20", startDate:"", endDate:""},
      {no:2, desc:"Inclinometer Casing & Probe",     type:"Material", acctAssign:"P – Project",    materialNo:"GEO-INC-002", materialGroup:"Geotechnical Equip",  plant:"PL03", qty:5,    uom:"Set",     estPrice:25000000,  requirementDate:"2025-09-20", startDate:"", endDate:""},
      {no:3, desc:"Data Logger & Telemetry Unit",    type:"Material", acctAssign:"P – Project",    materialNo:"GEO-DLG-003", materialGroup:"Geotechnical Equip",  plant:"PL03", qty:3,    uom:"Unit",    estPrice:35000000,  requirementDate:"2025-09-20", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0019", title:"Office Renovation – Jakarta HQ 5th Floor",       postedDate:"2025-07-12", closingDate:"2025-08-12", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Construction",      estVal:850000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Interior renovation of BRM HQ 5th floor: open-plan workspace, meeting rooms, and executive lounge.", status:"Complete",
    items:[
      {no:1, desc:"Interior Design & Build Works",   type:"Service",  acctAssign:"K – Cost Center", materialNo:"CON-INT-001", materialGroup:"Construction Works",  plant:"PL01", qty:1,    uom:"Lump Sum",estPrice:700000000, requirementDate:"", startDate:"2025-10-01", endDate:"2026-01-31"},
      {no:2, desc:"Furniture & Fitout Supply",       type:"Material", acctAssign:"K – Cost Center", materialNo:"FRN-OFC-002", materialGroup:"Furniture",           plant:"PL01", qty:1,    uom:"Lump Sum",estPrice:150000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0020", title:"Training – Mine Safety & Emergency Response",    postedDate:"2025-07-14", closingDate:"2025-08-14", postedBy:"Siti Rahma",   targets:["10000002","10000003"],            cat:"Training",          estVal:96000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Mandatory mine safety, first aid, fire-fighting, and emergency response training for 200 employees.", status:"Open",
    items:[
      {no:1, desc:"Mine Safety (SIMTK) Training",    type:"Service",  acctAssign:"K – Cost Center", materialNo:"TRN-SFT-001", materialGroup:"Training Services",   plant:"PL01", qty:200,  uom:"Person",  estPrice:200000,    requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Emergency Response Drill",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"TRN-EMG-002", materialGroup:"Training Services",   plant:"PL01", qty:4,    uom:"Session", estPrice:12000000,  requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  // ── RFQ-2025-0021 to 0040 ────────────────────────────────────
  { id:"RFQ-2025-0021", title:"Road Infrastructure – Haul Road Upgrade",         postedDate:"2025-07-15", closingDate:"2025-08-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Construction",       estVal:2500000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Upgrade 15km haul road from pit to ROM pad: subgrade, base, asphalt surfacing, and drainage.", status:"Pending Approval", submittedForApprovalAt:"2025-08-10", submittedForApprovalBy:"Ahmad Rizki",
    items:[
      {no:1, desc:"Road Subgrade Preparation",        type:"Service",  acctAssign:"P – Project", materialNo:"CON-RDS-001", materialGroup:"Civil Works",          plant:"PL02", qty:15000, uom:"M2",      estPrice:45000,     requirementDate:"", startDate:"2025-09-15", endDate:"2025-12-31"},
      {no:2, desc:"Asphalt Wearing Course (AC-WC)",   type:"Material", acctAssign:"P – Project", materialNo:"CON-ASP-002", materialGroup:"Civil Works",          plant:"PL02", qty:15000, uom:"M2",      estPrice:120000,    requirementDate:"2025-10-01", startDate:"", endDate:""},
    ],
    discussions:[
      {id:"D-021-001", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-08-10 10:00", message:"Both quotations received. PT Maju Bersama at IDR 1.85B (lowest) vs CV Sukses Mandiri at IDR 1.92B. PT Maju Bersama's method statement references proven experience on similar haul roads at Freeport and Adaro sites. Strong recommendation to award."},
      {id:"D-021-002", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-08-10 11:45", message:"Technical evaluation score: PT Maju Bersama 87/100, CV Sukses Mandiri 81/100. The IDR 70M price difference further supports PT Maju Bersama. I have verified their heavy equipment availability — 4 excavators + 2 dozers on standby."},
      {id:"D-021-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-08-11 08:30", message:"This is a high-value construction contract — IDR 1.85B. Before approving I need: (1) BPJS Ketenagakerjaan certificate, (2) SIUJK construction license Grade B minimum, (3) Site mobilization plan. Can you provide these?"},
      {id:"D-021-004", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-08-11 13:00", message:"All documents collected from PT Maju Bersama: SIUJK Grade B certified, BPJS active for 45 workers, mobilization plan shows D+7 site entry. Attaching to the vendor file. Ready for your approval, Pak Budi."},
      {id:"D-021-005", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-08-12 09:15", message:"Thank you Ahmad. Documents reviewed. One last point — please confirm payment terms. I suggest 30% DP, 60% progress-based, 10% retention. This protects BRM from non-performance risk on a 15km road project."},
    ]},
  { id:"RFQ-2025-0022", title:"Lubricants & Greases – Heavy Equipment Fleet",    postedDate:"2025-07-17", closingDate:"2025-08-17", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Goods",              estVal:420000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Annual supply of engine oils, hydraulic fluid, and greases for heavy equipment fleet at Gorontalo site.", status:"Pending Approval", submittedForApprovalAt:"2025-08-15", submittedForApprovalBy:"Siti Rahma",
    items:[
      {no:1, desc:"Shell Rimula R4 15W-40 (208L drum)", type:"Material", acctAssign:"K – Cost Center", materialNo:"LUB-OIL-001", materialGroup:"Lubricants", plant:"PL04", qty:300, uom:"Drum",   estPrice:950000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
      {no:2, desc:"Shell Gadus S3 Grease (18kg bucket)",type:"Material", acctAssign:"K – Cost Center", materialNo:"LUB-GRS-002", materialGroup:"Lubricants", plant:"PL04", qty:200, uom:"Bucket", estPrice:500000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
    ],
    discussions:[
      {id:"D-022-001", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-08-15 09:00", message:"Two vendors submitted: PT Maju Bersama (Shell authorized distributor, IDR 385M) and CV Sukses Mandiri (Castrol distributor, IDR 371.5M). CV Sukses Mandiri is IDR 13.5M lower. Both products meet OEM specs for our Komatsu and Hitachi fleet."},
      {id:"D-022-002", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-08-15 10:30", message:"I prefer Shell Rimula R4 — it's been our standard for 3 years and the maintenance team is familiar with its performance intervals. The IDR 13.5M saving from Castrol doesn't justify switching mid-year. Recommend staying with PT Maju Bersama."},
      {id:"D-022-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-08-16 08:00", message:"Brand consistency for lubrication is valid from a maintenance perspective. However, IDR 385M is a significant spend — has PT Maju Bersama offered any volume discount or rebate for annual commitment?"},
      {id:"D-022-004", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-08-16 09:30", message:"Good point Pak Budi. I contacted their sales rep (Budi Hartono). They can offer 3% rebate for payment within 14 days, bringing effective cost to IDR 373.5M — competitive with Castrol. Recommend proceeding with PT Maju Bersama on early payment terms."},
    ]},
  { id:"RFQ-2025-0023", title:"Legal Advisory Services – Mining Permits",         postedDate:"2025-07-18", closingDate:"2025-08-18", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"Professional Svc",  estVal:420000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Legal advisory retainer for mining permit renewals (IUP, PKP2B) and regulatory compliance at ESDM.", status:"Open",
    items:[
      {no:1, desc:"Legal Retainer – Mining Law",       type:"Service",  acctAssign:"K – Cost Center", materialNo:"LGL-RTN-001", materialGroup:"Legal Services", plant:"PL01", qty:12,   uom:"Month",   estPrice:35000000,  requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0024", title:"Insurance – Property All Risk & Public Liability", postedDate:"2025-07-20", closingDate:"2025-08-20", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Insurance",          estVal:600000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual insurance coverage for all assets and public liability for BRM Group subsidiaries.", status:"Complete",
    items:[
      {no:1, desc:"Property All Risk Premium",         type:"Service",  acctAssign:"K – Cost Center", materialNo:"INS-PAR-001", materialGroup:"Insurance",      plant:"PL01", qty:1,    uom:"Annual",  estPrice:360000000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Public Liability Premium",          type:"Service",  acctAssign:"K – Cost Center", materialNo:"INS-PLI-002", materialGroup:"Insurance",      plant:"PL01", qty:1,    uom:"Annual",  estPrice:200000000, requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0025", title:"Fire Protection System – Plant Building",          postedDate:"2025-07-22", closingDate:"2025-08-22", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"Engineering",        estVal:780000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Design, supply, and installation of NFPA 13 automatic sprinkler and fire hydrant system.", status:"Complete",
    items:[
      {no:1, desc:"Sprinkler System Installation",     type:"Service",  acctAssign:"P – Project",     materialNo:"FPS-SPR-001", materialGroup:"Fire Safety",    plant:"PL03", qty:1,    uom:"Lump Sum",estPrice:540000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-01-31"},
      {no:2, desc:"Fire Hydrant & Hose Reel",          type:"Material", acctAssign:"P – Project",     materialNo:"FPS-HYD-002", materialGroup:"Fire Safety",    plant:"PL03", qty:20,   uom:"Unit",    estPrice:10000000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0026", title:"Chartered Flight – Helicopter Services",           postedDate:"2025-07-24", closingDate:"2025-08-24", postedBy:"Siti Rahma",   targets:["10000002","10000003"],            cat:"Services",           estVal:1620000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Monthly charter of Bell 412 helicopter for personnel rotation and cargo between Palu HQ and remote camps.", status:"Open",
    items:[
      {no:1, desc:"Helicopter Charter – Bell 412",    type:"Service",  acctAssign:"P – Project",     materialNo:"AIR-HLP-001", materialGroup:"Aviation",       plant:"PL02", qty:12,   uom:"Month",   estPrice:135000000, requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0027", title:"Scaffolding & Access Services – Plant Shutdown",   postedDate:"2025-07-26", closingDate:"2025-08-26", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Services",           estVal:320000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Scaffolding erection, maintenance, and dismantling for annual plant shutdown turnaround.", status:"Complete",
    items:[
      {no:1, desc:"Scaffold Erection & Dismantling",  type:"Service",  acctAssign:"K – Cost Center", materialNo:"SCA-ERC-001", materialGroup:"Access Services", plant:"PL04", qty:5000, uom:"M2",      estPrice:45000,     requirementDate:"", startDate:"2025-10-01", endDate:"2025-11-30"},
      {no:2, desc:"Scaffold Monthly Rental",          type:"Service",  acctAssign:"K – Cost Center", materialNo:"SCA-RNT-002", materialGroup:"Access Services", plant:"PL04", qty:2,    uom:"Month",   estPrice:35000000,  requirementDate:"", startDate:"2025-10-01", endDate:"2025-11-30"},
    ]},
  { id:"RFQ-2025-0028", title:"IT Hardware Refresh – Server & Network",           postedDate:"2025-07-28", closingDate:"2025-08-28", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"IT Equipment",       estVal:2200000000, companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Refresh of data centre servers and core network switches across BRM Group HQ and all site offices.", status:"Pending Approval", submittedForApprovalAt:"2025-08-25", submittedForApprovalBy:"Ahmad Rizki",
    items:[
      {no:1, desc:"HPE ProLiant DL380 Gen11 Server",  type:"Material", acctAssign:"K – Cost Center", materialNo:"ITH-SVR-001", materialGroup:"IT Hardware",     plant:"PL01", qty:5,    uom:"Unit",    estPrice:320000000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Cisco Catalyst 9300 Switch 48P",   type:"Material", acctAssign:"K – Cost Center", materialNo:"ITH-SWT-002", materialGroup:"IT Hardware",     plant:"PL01", qty:10,   uom:"Unit",    estPrice:55000000,  requirementDate:"2025-10-01", startDate:"", endDate:""},
    ],
    discussions:[
      {id:"D-028-001", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-08-25 11:00", message:"Two quotations received: PT Maju Bersama (HPE ProLiant Gen11, IDR 2.15B) and CV Sukses Mandiri (Dell PowerEdge R760, IDR 2.08B). Both include 3-year warranty. IT team prefers HPE due to existing VMware compatibility with our current infrastructure."},
      {id:"D-028-002", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-08-25 13:15", message:"IT infrastructure team confirmed HPE compatibility score is 95% vs Dell at 72% due to existing HBA cards and storage fabric. Migration cost from Dell would add ~IDR 80M in professional services — making effective total IDR 2.16B, higher than HPE."},
      {id:"D-028-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-08-26 08:45", message:"The TCO analysis makes sense — IDR 2.15B HPE with full compatibility is better value than IDR 2.16B effective Dell cost. Is the IDR 2.2B budget sufficient? Data centre migrations often have unforeseen costs — rack & stack, cabling, power capacity upgrades."},
      {id:"D-028-004", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-08-26 10:00", message:"HPE quote includes rack & stack service. PT Maju Bersama confirmed cabling and power assessment are within scope. Remaining budget IDR 50M allocated as contingency — we are within the budget envelope."},
      {id:"D-028-005", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-08-26 11:30", message:"All clear from procurement side. Submitting for final approval. Requesting expedited decision — data centre capacity will be critically low by end of September 2025."},
    ]},
  { id:"RFQ-2025-0029", title:"Manpower Supply – Plant Operators",                postedDate:"2025-07-30", closingDate:"2025-08-30", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"Manpower",           estVal:780000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply of certified plant operators for ore processing facility 3-shift rotation, 12 months.", status:"Open",
    items:[
      {no:1, desc:"Plant Operator (Shift)",           type:"Service",  acctAssign:"K – Cost Center", materialNo:"MNP-OPR-001", materialGroup:"Manpower Services",plant:"PL02", qty:10,   uom:"Person/Month",estPrice:6500000, requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0030", title:"Pipe & Valve Procurement – Process Plant",         postedDate:"2025-08-01", closingDate:"2025-09-01", postedBy:"Siti Rahma",   targets:["10000001","10000003"],            cat:"Goods",              estVal:1400000000, companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Procurement of carbon steel pipes, fittings, and valves for SHS process plant expansion.", status:"Open",
    items:[
      {no:1, desc:"Carbon Steel Pipe 6\" Sch40 (6m)", type:"Material", acctAssign:"P – Project",     materialNo:"PIP-CST-001", materialGroup:"Piping Materials", plant:"PL03", qty:500,  uom:"Pcs",     estPrice:1800000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:2, desc:"Gate Valve 6\" Class 150",         type:"Material", acctAssign:"P – Project",     materialNo:"VLV-GAT-002", materialGroup:"Valves & Fittings",plant:"PL03", qty:80,   uom:"Pcs",     estPrice:5500000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0031", title:"Environmental Impact Assessment (AMDAL)",           postedDate:"2025-08-03", closingDate:"2025-09-03", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"Environmental",      estVal:1000000000, companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Full AMDAL study for Gorontalo mine expansion area including EIS, RKL-RPL, and public consultation.", status:"Open",
    items:[
      {no:1, desc:"AMDAL Study & Documentation",      type:"Service",  acctAssign:"P – Project",     materialNo:"ENV-AMD-001", materialGroup:"Environmental Svc",plant:"PL04", qty:1,    uom:"Lump Sum",estPrice:650000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"RKL-RPL Annual Reporting",         type:"Service",  acctAssign:"P – Project",     materialNo:"ENV-RKL-002", materialGroup:"Environmental Svc",plant:"PL04", qty:2,    uom:"Year",    estPrice:175000000, requirementDate:"", startDate:"2026-01-01", endDate:"2027-12-31"},
    ]},
  { id:"RFQ-2025-0032", title:"Welding & Fabrication – Steel Structure",           postedDate:"2025-08-05", closingDate:"2025-09-05", postedBy:"Siti Rahma",   targets:["10000001","10000003"],            cat:"Engineering",        estVal:650000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Fabrication and erection of structural steel for Linge Minerals ore stockpile shed (span 40m×80m).", status:"On Process",
    items:[
      {no:1, desc:"Structural Steel Fabrication",     type:"Service",  acctAssign:"P – Project",     materialNo:"FAB-STL-001", materialGroup:"Fabrication Works", plant:"PL05", qty:200,  uom:"Ton",     estPrice:2800000,   requirementDate:"", startDate:"2025-11-01", endDate:"2026-02-28"},
      {no:2, desc:"NDT / UT Inspection",              type:"Service",  acctAssign:"P – Project",     materialNo:"FAB-NDT-002", materialGroup:"Fabrication Works", plant:"PL05", qty:1,    uom:"Lump Sum",estPrice:65000000,  requirementDate:"2025-12-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0033", title:"Corporate Event – Annual Meeting & Gala",           postedDate:"2025-08-07", closingDate:"2025-09-07", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"Services",           estVal:500000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual shareholders meeting and gala dinner for 400 participants including Board of Directors and guests.", status:"On Process",
    items:[
      {no:1, desc:"Venue, Catering & Decoration",    type:"Service",  acctAssign:"K – Cost Center", materialNo:"EVT-VEN-001", materialGroup:"Event Services",   plant:"PL01", qty:400,  uom:"Pax",     estPrice:850000,    requirementDate:"2025-11-15", startDate:"", endDate:""},
      {no:2, desc:"AV, Lighting & Entertainment",    type:"Service",  acctAssign:"K – Cost Center", materialNo:"EVT-AVL-002", materialGroup:"Event Services",   plant:"PL01", qty:1,    uom:"Lump Sum",estPrice:145000000, requirementDate:"2025-11-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0034", title:"Fuel Storage Tank – 1,000 KL Installation",        postedDate:"2025-08-08", closingDate:"2025-09-08", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Engineering",        estVal:3200000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Fabrication and installation of 1,000 KL above-ground diesel storage tank with secondary containment.", status:"Open",
    items:[
      {no:1, desc:"Tank Fabrication (1,000 KL)",     type:"Service",  acctAssign:"P – Project",     materialNo:"TNK-FAB-001", materialGroup:"Tank Works",        plant:"PL02", qty:1,    uom:"Lump Sum",estPrice:2200000000,requirementDate:"", startDate:"2025-11-01", endDate:"2026-04-30"},
      {no:2, desc:"Civil Foundation & Bund Wall",    type:"Service",  acctAssign:"P – Project",     materialNo:"TNK-CIV-002", materialGroup:"Civil Works",       plant:"PL02", qty:1,    uom:"Lump Sum",estPrice:800000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-03-31"},
    ]},
  { id:"RFQ-2025-0035", title:"Cybersecurity Assessment & Penetration Testing",    postedDate:"2025-08-09", closingDate:"2025-09-09", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"IT Services",        estVal:380000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Comprehensive security assessment, vulnerability scan, and penetration testing for BRM IT infrastructure.", status:"Open",
    items:[
      {no:1, desc:"Network Pentest & Vulnerability Assessment", type:"Service", acctAssign:"K – Cost Center", materialNo:"SEC-PEN-001", materialGroup:"IT Security", plant:"PL01", qty:1, uom:"Engagement", estPrice:280000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"Security Audit Report & Remediation Plan",   type:"Service", acctAssign:"K – Cost Center", materialNo:"SEC-AUD-002", materialGroup:"IT Security", plant:"PL01", qty:1, uom:"Engagement", estPrice:100000000, requirementDate:"2025-12-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0036", title:"Electrical Cable – MV & LV Supply",                postedDate:"2025-08-10", closingDate:"2025-09-10", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Goods",              estVal:760000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Supply of medium voltage (20kV) and low voltage (380V) power cables for plant electrical installation.", status:"On Process",
    items:[
      {no:1, desc:"MV Cable 20kV 3x185mm² (per meter)", type:"Material", acctAssign:"P – Project", materialNo:"ELC-MVC-001", materialGroup:"Electrical Materials", plant:"PL03", qty:5000, uom:"Meter", estPrice:85000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"LV Cable 380V 4x70mm² (per meter)",  type:"Material", acctAssign:"P – Project", materialNo:"ELC-LVC-002", materialGroup:"Electrical Materials", plant:"PL03", qty:8000, uom:"Meter", estPrice:42000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0037", title:"Fleet Management System – GPS Tracking",            postedDate:"2025-08-11", closingDate:"2025-09-11", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"IT Services",        estVal:240000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"GPS vehicle tracking and fleet management system for 120 units heavy equipment and light vehicles.", status:"Closed",
    items:[
      {no:1, desc:"GPS Hardware Unit & Installation", type:"Material", acctAssign:"K – Cost Center", materialNo:"FMS-GPS-001", materialGroup:"Fleet Management", plant:"PL01", qty:120, uom:"Unit",  estPrice:1500000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"FMS Platform Subscription",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"FMS-PLT-002", materialGroup:"Fleet Management", plant:"PL01", qty:24,  uom:"Month", estPrice:3750000, requirementDate:"", startDate:"2025-10-01", endDate:"2027-09-30"},
    ]},
  { id:"RFQ-2025-0038", title:"Pontoon & Barge Rental – River Transport",          postedDate:"2025-08-12", closingDate:"2025-09-12", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Services",           estVal:840000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Rental of 250-ton pontoon barge for ore transport along Krueng Alas river, Aceh – 12 months.", status:"Open",
    items:[
      {no:1, desc:"Pontoon Barge 250T Rental",        type:"Service",  acctAssign:"P – Project",     materialNo:"MAR-BRG-001", materialGroup:"Marine Transport",  plant:"PL05", qty:12,  uom:"Month", estPrice:70000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-10-31"},
    ]},
  { id:"RFQ-2025-0039", title:"Accounting & Tax Advisory – Annual Retainer",       postedDate:"2025-08-13", closingDate:"2025-09-13", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"Professional Svc",  estVal:360000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual accounting, tax compliance, transfer pricing documentation, and advisory for BRM Group.", status:"Open",
    items:[
      {no:1, desc:"Accounting & Tax Retainer",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"TAX-RTN-001", materialGroup:"Professional Svc",  plant:"PL01", qty:12,  uom:"Month", estPrice:30000000, requirementDate:"", startDate:"2026-01-01", endDate:"2026-12-31"},
    ]},
  { id:"RFQ-2025-0040", title:"Mine Reclamation – Revegetation & Soil Rehab",      postedDate:"2025-08-14", closingDate:"2025-09-14", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Environmental",      estVal:1800000000, companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Revegetation and soil rehabilitation of 500 ha post-mining land per ESDM reclamation plan approval.", status:"Open",
    items:[
      {no:1, desc:"Topsoil Spreading & Seeding",      type:"Service",  acctAssign:"P – Project",     materialNo:"REC-TOP-001", materialGroup:"Reclamation Works", plant:"PL04", qty:500, uom:"Ha",    estPrice:2400000,  requirementDate:"", startDate:"2026-01-01", endDate:"2026-12-31"},
      {no:2, desc:"Native Tree Planting (per stem)",  type:"Service",  acctAssign:"P – Project",     materialNo:"REC-TRE-002", materialGroup:"Reclamation Works", plant:"PL04", qty:50000,uom:"Stem", estPrice:15000,    requirementDate:"", startDate:"2026-02-01", endDate:"2026-12-31"},
    ]},

  // ── Sample RFQs for evaluation demo ─────────────────────────
  // 1. FULLY EVALUATED — all vendors scored, winner selected, approvalNotes filled
  { id:"RFQ-2025-0051", title:"Geotechnical Investigation – Open Pit Expansion", postedDate:"2025-05-10", closingDate:"2025-06-05", postedBy:"Ahmad Rizki", targets:["10000001","10000002","10000003"], cat:"Engineering", estVal:920000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS",
    desc:"Geotechnical investigation and slope stability analysis for CPMS open pit expansion – Phase 3 (50 ha). Includes borehole drilling, laboratory testing, and detailed geotechnical report.",
    status:"Pending Approval", submittedForApprovalAt:"2025-06-08", submittedForApprovalBy:"Ahmad Rizki",
    scored:true, closedAt:"2025-06-15", closedBy:"Budi Santoso", winnerVendorId:"10000001",
    approvalNotes:"Evaluation completed by Finance Approver (Budi Santoso) on 15 Jun 2025.\n\nPT Maju Bersama scores highest across all criteria — particularly Technical (88) due to their certified geotechnical engineers and prior experience with CPMS Phase 2 pit. Commercial score (82) reflects competitive pricing with comprehensive lab test package included. HSE score (90) confirmed by site safety record — zero LTI in last 24 months.\n\nCV Sukses Mandiri competitive on price but lower technical score (72) due to limited slope stability analysis portfolio.\n\nRecommendation: Award to PT Maju Bersama (Weighted Total: 86). Contract value IDR 895,000,000. Requesting Director approval to proceed to PO issuance.",
    items:[
      {no:1, desc:"Borehole Drilling & Sampling (per meter)", type:"Service", acctAssign:"P – Project", materialNo:"GEO-DRL-001", materialGroup:"Geotech Services", plant:"PL02", qty:1500, uom:"Meter",    estPrice:350000,    requirementDate:"", startDate:"2025-07-01", endDate:"2025-09-30"},
      {no:2, desc:"Laboratory Testing (per sample)",          type:"Service", acctAssign:"P – Project", materialNo:"GEO-LAB-002", materialGroup:"Geotech Services", plant:"PL02", qty:800,  uom:"Sample",   estPrice:180000,    requirementDate:"2025-08-01", startDate:"", endDate:""},
      {no:3, desc:"Geotechnical Report & Slope Analysis",     type:"Service", acctAssign:"P – Project", materialNo:"GEO-RPT-003", materialGroup:"Geotech Services", plant:"PL02", qty:1,    uom:"Lump Sum", estPrice:200000000, requirementDate:"2025-10-15", startDate:"", endDate:""},
    ],
    discussions:[
      {id:"D-051-001", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-06-06 09:00", message:"Both quotations received. PT Maju Bersama submitted a very comprehensive technical proposal including CV of 3 certified geotechnical engineers. Forwarding to Finance Approver for evaluation."},
      {id:"D-051-002", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-06-10 10:15", message:"Technical review completed. PT Maju Bersama clearly stronger on methodology — their slope stability model references Phase 2 data which is highly relevant. Starting commercial review."},
      {id:"D-051-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-06-15 14:30", message:"Scoring finalized. PT Maju Bersama recommended as winner. Evaluation notes submitted. Requesting Director's approval to proceed."},
    ]},

  // 2. PARTIALLY EVALUATED — scoring started, only 1 of 2 vendors scored (commercial missing for vendor 2)
  { id:"RFQ-2025-0052", title:"Port Handling & Stevedoring – Mineral Export", postedDate:"2025-06-01", closingDate:"2025-06-28", postedBy:"Siti Rahma", targets:["10000001","10000002","10000003"], cat:"Services", estVal:1450000000, companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS",
    desc:"Annual contract for port handling, stevedoring, and vessel loading services for LMRS mineral concentrate export through Lhokseumawe Port. Estimated 120,000 MT per year.",
    status:"Pending Approval", submittedForApprovalAt:"2025-07-01", submittedForApprovalBy:"Siti Rahma",
    scored:false,
    items:[
      {no:1, desc:"Stevedoring – Loading (per MT)",          type:"Service", acctAssign:"P – Project", materialNo:"PRT-STD-001", materialGroup:"Port Services", plant:"PL05", qty:120000, uom:"MT",      estPrice:8500,      requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
      {no:2, desc:"Port Storage / Stockpile Management",     type:"Service", acctAssign:"P – Project", materialNo:"PRT-STK-002", materialGroup:"Port Services", plant:"PL05", qty:12,     uom:"Month",   estPrice:35000000,  requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
      {no:3, desc:"Ship Agency & Documentation",             type:"Service", acctAssign:"P – Project", materialNo:"PRT-AGC-003", materialGroup:"Port Services", plant:"PL05", qty:24,     uom:"Vessel",  estPrice:12500000,  requirementDate:"", startDate:"", endDate:""},
    ],
    discussions:[
      {id:"D-052-001", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-07-02 08:30", message:"Two quotations received. Both vendors have Lhokseumawe Port operating licenses. CV Sukses Mandiri has 5 years track record at this port; PT Maju Bersama is newer but pricing is more competitive."},
      {id:"D-052-002", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-07-05 11:00", message:"I have completed the technical review for PT Maju Bersama. Still reviewing CV Sukses Mandiri's HSE documentation — they need to submit their ISPS Code compliance certificate. Will complete scoring once received."},
      {id:"D-052-003", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-07-07 09:15", message:"Chased CV Sukses Mandiri — ISPS certificate coming by end of this week. Approver please hold scoring until then."},
    ]},

  // 3. WAITING FOR EVALUATION — Pending Approval, no scoring done yet
  { id:"RFQ-2025-0053", title:"Concrete Batching Plant – Ready Mix Supply", postedDate:"2025-06-15", closingDate:"2025-07-10", postedBy:"Ahmad Rizki", targets:["10000001","10000002","10000003"], cat:"Goods", estVal:2800000000, companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI",
    desc:"Supply of ready-mix concrete (K-300, K-350, K-400) for SHS Processing Plant civil construction works – estimated 25,000 M³ over 18 months. Vendor to provide mobile batching plant on-site.",
    status:"Pending Approval", submittedForApprovalAt:"2025-07-12", submittedForApprovalBy:"Ahmad Rizki",
    scored:false,
    items:[
      {no:1, desc:"Ready Mix Concrete K-300 (per M³)",  type:"Material", acctAssign:"P – Project", materialNo:"CON-K30-001", materialGroup:"Construction Material", plant:"PL03", qty:12000, uom:"M³",      estPrice:950000,    requirementDate:"", startDate:"2025-09-01", endDate:"2026-03-31"},
      {no:2, desc:"Ready Mix Concrete K-350 (per M³)",  type:"Material", acctAssign:"P – Project", materialNo:"CON-K35-002", materialGroup:"Construction Material", plant:"PL03", qty:9000,  uom:"M³",      estPrice:1050000,   requirementDate:"", startDate:"2025-09-01", endDate:"2026-03-31"},
      {no:3, desc:"Ready Mix Concrete K-400 (per M³)",  type:"Material", acctAssign:"P – Project", materialNo:"CON-K40-003", materialGroup:"Construction Material", plant:"PL03", qty:4000,  uom:"M³",      estPrice:1150000,   requirementDate:"", startDate:"2025-10-01", endDate:"2026-06-30"},
      {no:4, desc:"Mobile Batching Plant – On-site",    type:"Service",  acctAssign:"P – Project", materialNo:"CON-BAT-004", materialGroup:"Construction Material", plant:"PL03", qty:18,    uom:"Month",    estPrice:25000000,  requirementDate:"", startDate:"2025-08-15", endDate:"2026-02-14"},
    ],
    discussions:[
      {id:"D-053-001", userId:"brm.user",  userName:"Ahmad Rizki",  role:"Procurement Manager", postedAt:"2025-07-11 10:00", message:"Two quotations received before closing. Both vendors propose on-site batching plant which is our requirement. Submitting for Approver evaluation."},
      {id:"D-053-002", userId:"buyer1",    userName:"Siti Rahma",   role:"Senior Buyer",        postedAt:"2025-07-11 11:30", message:"Confirmed — PT Maju Bersama offers Liebherr batching plant (120 M³/hr capacity), CV Sukses Mandiri offers ELKON (100 M³/hr). Both meet minimum spec of 80 M³/hr. Ready for evaluation."},
      {id:"D-053-003", userId:"approver1", userName:"Budi Santoso", role:"Finance Approver",    postedAt:"2025-07-14 09:00", message:"Received the quotations. Will start evaluation this week — currently reviewing the technical specifications and concrete mix design proposals from both vendors."},
    ]},
];
export const INIT_QT = [
  { id:"QT-2025-0001", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations",      vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-06-12", validUntil:"2025-07-12", totalAmt:490000000, notes:"Price includes 2-year warranty and free delivery.",                                   status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:7800000,total:390000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },
  { id:"QT-2025-0002", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract",              vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"",           validUntil:"",           totalAmt:145000000, notes:"Free delivery for orders above IDR 5,000,000.",                                       status:"Draft",     files:[],                                         items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",unitPrice:45000,total:45000000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",unitPrice:250000,total:50000000}] },
  { id:"QT-2025-0003", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building",              vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-06-08", validUntil:"2025-07-08", totalAmt:350000000, notes:"Includes supervisor and CCTV monitoring.",                                           deliveryTerms:"On-site deployment within 3 days of PO issuance", paymentTerms:"Net 30 days after monthly service invoice", status:"Approved",  files:["quotation.pdf","company_profile.pdf"],    items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",unitPrice:7500000,total:90000000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",unitPrice:9000000,total:108000000}] },
  { id:"QT-2025-0029", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-06-14", validUntil:"2025-07-14", totalAmt:510000000, notes:"Lenovo ThinkPad & ThinkStation. Includes 3-year on-site warranty.",                         status:"Submitted", files:["quotation.pdf","spec_sheet.pdf"],          items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:8200000,total:410000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },
  { id:"QT-2025-0030", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites",     vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-14", validUntil:"2025-08-14", totalAmt:90500000,  notes:"Distributor resmi alkes. Garansi keaslian produk & sertifikat BPOM.",                      status:"Submitted", files:["quotation.pdf"],                           items:[{no:1,desc:"First Aid Kit (50-person)",qty:25,uom:"Set",unitPrice:1250000,total:31250000},{no:2,desc:"AED Defibrillator",qty:5,uom:"Unit",unitPrice:12000000,total:60000000},{no:3,desc:"Stretcher & Immobilization Board",qty:10,uom:"Pcs",unitPrice:925000,total:9250000}] },
  { id:"QT-2025-0031", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System",       vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-09", validUntil:"2025-08-09", totalAmt:412000000, notes:"Hughes VSAT HT2000W. Remote support 24/7. SLA 99.5% uptime guaranteed.",                   status:"Win",  files:["quotation.pdf","technical_proposal.pdf"],  items:[{no:1,desc:"VSAT Installation & Hardware",qty:1,uom:"Set",unitPrice:182000000,total:182000000},{no:2,desc:"VSAT Monthly Bandwidth (100Mbps)",qty:12,uom:"Month",unitPrice:19166667,total:230000000}] },
  { id:"QT-2025-0032", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-21", validUntil:"2025-08-21", totalAmt:283500000, notes:"Izin TPS B3 dari DLH. Armada truk khusus B3. Manifest digital terintegrasi.",               status:"Submitted", files:["quotation.pdf","izin_dlh.pdf"],             items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",qty:50000,uom:"KG",unitPrice:3450,total:172500000},{no:2,desc:"Non-B3 Waste Disposal (month)",qty:12,uom:"Month",unitPrice:9250000,total:111000000}] },
  { id:"QT-2025-0004", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract",                    vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-07-01", validUntil:"2025-08-01", totalAmt:228000000, notes:"Price includes spare parts and refrigerant top-up.",                                  status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"Preventive Maintenance Visit",qty:12,uom:"Visit",unitPrice:19000000,total:228000000}] },
  { id:"QT-2025-0005", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract",                    vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-02", validUntil:"2025-08-02", totalAmt:240000000, notes:"2-hour SLA for emergency call-outs. Covers all 4 floors.",                           status:"Submitted", files:["quotation.pdf","technical_spec.pdf"],     items:[{no:1,desc:"Preventive Maintenance Visit",qty:12,uom:"Visit",unitPrice:20000000,total:240000000}] },
  { id:"QT-2025-0006", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies",     vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-07-05", validUntil:"2025-08-05", totalAmt:862500000, notes:"Price includes licensed transport & handling. MSDS provided.",                       status:"Draft",     files:[],                                         items:[{no:1,desc:"ANFO Bulk Explosive",qty:50000,uom:"KG",unitPrice:8000,total:400000000},{no:2,desc:"Electric Detonator",qty:2000,uom:"Pcs",unitPrice:33000,total:66000000},{no:3,desc:"Safety Fuse (100m/roll)",qty:500,uom:"Roll",unitPrice:115000,total:57500000}] },
  { id:"QT-2025-0007", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies",     vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-06", validUntil:"2025-08-06", totalAmt:891000000, notes:"Stock available immediately. Delivery within 5 business days.",                      status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"ANFO Bulk Explosive",qty:50000,uom:"KG",unitPrice:8800,total:440000000},{no:2,desc:"Electric Detonator",qty:2000,uom:"Pcs",unitPrice:34000,total:68000000},{no:3,desc:"Safety Fuse (100m/roll)",qty:500,uom:"Roll",unitPrice:118000,total:59000000}] },
  { id:"QT-2025-0008", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power",            vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-08", validUntil:"2025-08-08", totalAmt:468000000, notes:"Includes fuel management and 24/7 on-site technician during operation.",              status:"Submitted", files:["quotation.pdf","genset_spec.pdf"],         items:[{no:1,desc:"Genset 500 kVA Rental",qty:12,uom:"Month",unitPrice:39000000,total:468000000}] },
  { id:"QT-2025-0009", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)",          vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:118500000, notes:"All items SNI-certified. Free delivery to all sites.",                               status:"Submitted", files:["quotation.pdf","catalogue.pdf"],           items:[{no:1,desc:"Safety Helmet (SNI certified)",qty:500,uom:"Pcs",unitPrice:72000,total:36000000},{no:2,desc:"Safety Boot (Steel Toe)",qty:300,uom:"Pair",unitPrice:330000,total:99000000},{no:3,desc:"High-Visibility Safety Vest",qty:600,uom:"Pcs",unitPrice:82000,total:49200000}] },
  { id:"QT-2025-0010", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)",          vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:126750000, notes:"Bulk discount applied. 1-year warranty on boots.",                                   status:"Completed", files:["quotation.pdf"],                          items:[{no:1,desc:"Safety Helmet (SNI certified)",qty:500,uom:"Pcs",unitPrice:78000,total:39000000},{no:2,desc:"Safety Boot (Steel Toe)",qty:300,uom:"Pair",unitPrice:360000,total:108000000},{no:3,desc:"High-Visibility Safety Vest",qty:600,uom:"Pcs",unitPrice:88000,total:52800000}] },
  { id:"QT-2025-0011", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On",         vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-06-25", validUntil:"2025-07-25", totalAmt:630000000, notes:"Team of 2 certified SAP consultants. Includes UAT support and go-live.",              deliveryTerms:"Resource mobilization within 2 weeks of contract signing", paymentTerms:"Monthly invoicing, net 14 days", status:"Accepted",  files:["quotation.pdf","cv_consultant.pdf"],       items:[{no:1,desc:"SAP BTP Integration Consultant",qty:6,uom:"Month",unitPrice:82000000,total:492000000},{no:2,desc:"SAP Analytics Cloud Specialist",qty:4,uom:"Month",unitPrice:70000000,total:280000000}] },
  { id:"QT-2025-0012", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On",         vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-06-26", validUntil:"2025-07-26", totalAmt:680000000, notes:"Senior consultants with 8+ years SAP Public Cloud experience.",                      deliveryTerms:"Resources available immediately upon PO issuance", paymentTerms:"Monthly invoicing, net 21 days", status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"SAP BTP Integration Consultant",qty:6,uom:"Month",unitPrice:88000000,total:528000000},{no:2,desc:"SAP Analytics Cloud Specialist",qty:4,uom:"Month",unitPrice:76000000,total:304000000}] },
  { id:"QT-2025-0013", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site",      vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:188500000, notes:"All chemicals have MSDS and BPOM certification. Delivery ex-Surabaya.",               status:"Submitted", files:["quotation.pdf","msds.pdf"],               items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",qty:500,uom:"Bag",unitPrice:175000,total:87500000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",qty:300,uom:"Bag",unitPrice:240000,total:72000000},{no:3,desc:"Caustic Soda (NaOH) 50 kg/drum",qty:150,uom:"Drum",unitPrice:193333,total:29000000}] },
  { id:"QT-2025-0014", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:197250000, notes:"Stock guaranteed for 6 months. Complimentary dosing pump included.",                  status:"Draft",     files:[],                                         items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",qty:500,uom:"Bag",unitPrice:185000,total:92500000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",qty:300,uom:"Bag",unitPrice:260000,total:78000000},{no:3,desc:"Caustic Soda (NaOH) 50 kg/drum",qty:150,uom:"Drum",unitPrice:178333,total:26750000}] },
  { id:"QT-2025-0015", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites",     vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:86750000,  notes:"Items sourced from certified medical distributors. Expiry min. 2 years.",              status:"Submitted", files:["quotation.pdf","product_catalogue.pdf"],  items:[{no:1,desc:"First Aid Kit (50-person)",qty:25,uom:"Set",unitPrice:1150000,total:28750000},{no:2,desc:"AED Defibrillator",qty:5,uom:"Unit",unitPrice:11500000,total:57500000},{no:3,desc:"Stretcher & Immobilization Board",qty:10,uom:"Pcs",unitPrice:50000,total:500000}] },
  { id:"QT-2025-0016", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services",        vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-13", validUntil:"2025-08-13", totalAmt:315000000,  notes:"Using DJI Matrice 350 RTK. Deliverables: orthophoto, DEM, shapefile.",                     status:"Submitted", files:["quotation.pdf","drone_spec.pdf","portfolio.pdf"],  items:[{no:1,desc:"Drone Aerial Survey (per hectare)",qty:2500,uom:"Ha",unitPrice:114000,total:285000000},{no:2,desc:"3D Point Cloud Processing & Report",qty:1,uom:"Lump Sum",unitPrice:30000000,total:30000000}] },
  { id:"QT-2025-0017", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer",   vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-07-15", validUntil:"2025-08-15", totalAmt:936000000,  notes:"Operators included. Mobilization cost covered within quote.",                              status:"Submitted", files:["quotation.pdf","equipment_spec.pdf"],               items:[{no:1,desc:"Hydraulic Excavator 36T",qty:12,uom:"Month",unitPrice:53000000,total:636000000},{no:2,desc:"Bulldozer D85",qty:12,uom:"Month",unitPrice:25000000,total:300000000}] },
  { id:"QT-2025-0018", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer",   vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-16", validUntil:"2025-08-16", totalAmt:984000000,  notes:"Komatsu PC360 & D85 in excellent condition. 24/7 breakdown support.",                       status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Hydraulic Excavator 36T",qty:12,uom:"Month",unitPrice:57000000,total:684000000},{no:2,desc:"Bulldozer D85",qty:12,uom:"Month",unitPrice:25000000,total:300000000}] },
  { id:"QT-2025-0019", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples",     vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-07-17", validUntil:"2025-08-17", totalAmt:142500000,  notes:"NATA-accredited lab. Turnaround 5 business days. Online result portal.",                    status:"Approved",  files:["quotation.pdf","accreditation.pdf"],                items:[{no:1,desc:"Fire Assay – Au (per sample)",qty:2000,uom:"Sample",unitPrice:43000,total:86000000},{no:2,desc:"ICP-MS Multi-element Analysis",qty:1500,uom:"Sample",unitPrice:38000,total:57000000}] },
  { id:"QT-2025-0020", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp",     vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-18", validUntil:"2025-08-18", totalAmt:527812500,  notes:"Menu rotates weekly. Halal certified. 3 meals + 2 snacks daily.",                          status:"Submitted", files:["quotation.pdf","menu_sample.pdf"],                  items:[{no:1,desc:"Catering per Person per Day",qty:54750,uom:"Person/Day",unitPrice:82500,total:527812500}] },
  { id:"QT-2025-0021", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System",       vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-07-08", validUntil:"2025-08-08", totalAmt:398000000,  notes:"Includes 1-year hardware warranty and remote NOC monitoring.",                             status:"Completed",  files:["quotation.pdf","technical_proposal.pdf"],           items:[{no:1,desc:"VSAT Installation & Hardware",qty:1,uom:"Set",unitPrice:175000000,total:175000000},{no:2,desc:"VSAT Monthly Bandwidth (100Mbps)",qty:12,uom:"Month",unitPrice:14250000,total:171000000}] },
  { id:"QT-2025-0022", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services",      vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-07-20", validUntil:"2025-08-20", totalAmt:271000000,  notes:"Licensed by KLHK. Manifest provided for all B3 waste movements.",                          status:"Submitted", files:["quotation.pdf","klhk_license.pdf"],                 items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",qty:50000,uom:"KG",unitPrice:3300,total:165000000},{no:2,desc:"Non-B3 Waste Disposal (month)",qty:12,uom:"Month",unitPrice:8833333,total:106000000}] },
  { id:"QT-2025-0023", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Avgas",                   vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-22", validUntil:"2025-08-22", totalAmt:1189000000, notes:"Price locked for 6 months. Free delivery to site with min. 10,000L order.",                status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"HSD Diesel Fuel (Liter)",qty:3000000,uom:"Liter",unitPrice:325,total:975000000},{no:2,desc:"Aviation Gasoline – Avgas 100LL",qty:5000,uom:"Liter",unitPrice:17800,total:89000000}] },
  { id:"QT-2025-0024", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Avgas",                   vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-07-23", validUntil:"2025-08-23", totalAmt:1205000000, notes:"Pertamina authorised distributor. Consistent supply guaranteed.",                           status:"Draft",     files:[],                                                   items:[{no:1,desc:"HSD Diesel Fuel (Liter)",qty:3000000,uom:"Liter",unitPrice:332,total:996000000},{no:2,desc:"Aviation Gasoline – Avgas 100LL",qty:5000,uom:"Liter",unitPrice:18200,total:91000000}] },
  { id:"QT-2025-0025", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation",      vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-07-24", validUntil:"2025-08-24", totalAmt:367500000,  notes:"Instruments sourced from Geo-Instruments USA. Includes installation and commissioning.",    status:"Submitted", files:["quotation.pdf","datasheet.pdf"],                    items:[{no:1,desc:"Piezometer (vibrating wire)",qty:20,uom:"Unit",unitPrice:8200000,total:164000000},{no:2,desc:"Inclinometer Casing & Probe",qty:5,uom:"Set",unitPrice:24500000,total:122500000},{no:3,desc:"Data Logger & Telemetry Unit",qty:3,uom:"Unit",unitPrice:27000000,total:81000000}] },
  { id:"QT-2025-0026", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor",       vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:832000000,  notes:"Portfolio: Accenture Jakarta, Unilever HQ. ISO 9001 certified contractor.",                status:"Win",  files:["quotation.pdf","portfolio.pdf","company_profile.pdf"], items:[{no:1,desc:"Interior Design & Build Works",qty:1,uom:"Lump Sum",unitPrice:690000000,total:690000000},{no:2,desc:"Furniture & Fitout Supply",qty:1,uom:"Lump Sum",unitPrice:142000000,total:142000000}] },
  { id:"QT-2025-0027", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor",       vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:856000000,  notes:"10% down payment. Balance upon milestone completion. 6-month defect liability.",           status:"Completed", files:["quotation.pdf"],                                    items:[{no:1,desc:"Interior Design & Build Works",qty:1,uom:"Lump Sum",unitPrice:710000000,total:710000000},{no:2,desc:"Furniture & Fitout Supply",qty:1,uom:"Lump Sum",unitPrice:146000000,total:146000000}] },
  { id:"QT-2025-0028", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response",    vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-07-25", validUntil:"2025-08-25", totalAmt:93600000,   notes:"Trainers certified by BNSP & Kemnaker. Training held on-site. Certificate issued.",        status:"Submitted", files:["quotation.pdf","trainer_cv.pdf"],                   items:[{no:1,desc:"Mine Safety (SIMTK) Training",qty:200,uom:"Person",unitPrice:195000,total:39000000},{no:2,desc:"Emergency Response Drill",qty:4,uom:"Session",unitPrice:13650000,total:54600000}] },
  // ── New quotations for RFQ-2025-0021 to 0040 ────────────────
  { id:"QT-2025-0033", rfqId:"RFQ-2025-0021", rfqTitle:"Road Infrastructure – Haul Road Upgrade",         vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-07-28", validUntil:"2025-08-28", totalAmt:1850000000, notes:"Subbase, base, and asphalt pavement. Includes drainage works.",                           deliveryTerms:"Mobilization in 2 weeks; project completion in 6 months", paymentTerms:"30% down payment, 60% on progress milestones, 10% on completion",                           status:"Submitted", files:["quotation.pdf","method_statement.pdf"],             items:[{no:1,desc:"Road Subgrade Preparation",qty:15000,uom:"M2",unitPrice:45000,total:675000000},{no:2,desc:"Asphalt Wearing Course (AC-WC)",qty:15000,uom:"M2",unitPrice:115000,total:1725000000}] },
  { id:"QT-2025-0034", rfqId:"RFQ-2025-0021", rfqTitle:"Road Infrastructure – Haul Road Upgrade",         vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-07-29", validUntil:"2025-08-29", totalAmt:1920000000, notes:"Experienced road contractor. Mobilization within 2 weeks.",                               deliveryTerms:"Mobilization in 3 weeks; project completion in 7 months", paymentTerms:"20% down payment, 70% on progress milestones, 10% retention",                               status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Road Subgrade Preparation",qty:15000,uom:"M2",unitPrice:48000,total:720000000},{no:2,desc:"Asphalt Wearing Course (AC-WC)",qty:15000,uom:"M2",unitPrice:120000,total:1800000000}] },
  { id:"QT-2025-0035", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet",    vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-08-02", validUntil:"2025-09-02", totalAmt:385000000,  notes:"Authorized Shell distributor. Available in 20L, 208L, and IBC.",                          deliveryTerms:"Ex-Jakarta warehouse, delivery within 7 days of PO", paymentTerms:"Net 30 days; 3% discount if paid within 10 days",                          status:"Submitted", files:["quotation.pdf","product_sheet.pdf"],                items:[{no:1,desc:"Shell Rimula R4 15W-40 (208L drum)",qty:300,uom:"Drum",unitPrice:950000,total:285000000},{no:2,desc:"Shell Gadus S3 V220C Grease (18kg)",qty:200,uom:"Bucket",unitPrice:500000,total:100000000}] },
  { id:"QT-2025-0036", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet",    vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-08-03", validUntil:"2025-09-03", totalAmt:371500000,  notes:"Castrol authorized distributor. Volume pricing applied.",                                 deliveryTerms:"Ex-Surabaya warehouse, 5 days lead time to site", paymentTerms:"Net 30 days from invoice date",                                 status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Castrol Vecton 15W-40 (208L drum)",qty:300,uom:"Drum",unitPrice:920000,total:276000000},{no:2,desc:"Castrol Spheerol EPLX 220-2 (18kg)",qty:190,uom:"Bucket",unitPrice:503000,total:95570000}] },
  { id:"QT-2025-0037", rfqId:"RFQ-2025-0023", rfqTitle:"Legal Advisory Services – Mining Permits",         vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-08-05", validUntil:"2025-09-05", totalAmt:420000000,  notes:"Partner-level mining law expertise. Track record at ESDM.",                               status:"Submitted", files:["quotation.pdf","firm_profile.pdf"],                 items:[{no:1,desc:"Legal Retainer – Mining Law",qty:12,uom:"Month",unitPrice:35000000,total:420000000}] },
  { id:"QT-2025-0038", rfqId:"RFQ-2025-0024", rfqTitle:"Insurance – Property All Risk & Public Liability", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-08-08", validUntil:"2025-09-08", totalAmt:560000000,  notes:"AM Best A-rated reinsurance backing. Claims settlement SLA 14 days.",                      status:"Submitted", files:["quotation.pdf","policy_wording.pdf"],               items:[{no:1,desc:"Property All Risk Premium",qty:1,uom:"Annual",unitPrice:360000000,total:360000000},{no:2,desc:"Public Liability Premium",qty:1,uom:"Annual",unitPrice:200000000,total:200000000}] },
  { id:"QT-2025-0039", rfqId:"RFQ-2025-0024", rfqTitle:"Insurance – Property All Risk & Public Liability", vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-08-09", validUntil:"2025-09-09", totalAmt:540000000,  notes:"Tugu / Asuransi Wahana Tata. Competitive premium. Full OJK registered.",                  status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Property All Risk Premium",qty:1,uom:"Annual",unitPrice:345000000,total:345000000},{no:2,desc:"Public Liability Premium",qty:1,uom:"Annual",unitPrice:195000000,total:195000000}] },
  { id:"QT-2025-0040", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building",          vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-08-10", validUntil:"2025-09-10", totalAmt:748000000,  notes:"NFPA and SNI compliant. 1-year maintenance included post-installation.",                  status:"Submitted", files:["quotation.pdf","design_drawing.pdf"],               items:[{no:1,desc:"Sprinkler System Installation",qty:1,uom:"Lump Sum",unitPrice:540000000,total:540000000},{no:2,desc:"Fire Hydrant & Hose Reel",qty:20,uom:"Unit",unitPrice:10400000,total:208000000}] },
  { id:"QT-2025-0041", rfqId:"RFQ-2025-0026", rfqTitle:"Chartered Flight – Helicopter Services",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-08-12", validUntil:"2025-09-12", totalAmt:1620000000, notes:"Bell 412 helicopter, 15-seat. Pilot & co-pilot included. Based in Palu.",                  status:"Submitted", files:["quotation.pdf","aoc_certificate.pdf"],              items:[{no:1,desc:"Helicopter Charter – Bell 412",qty:12,uom:"Month",unitPrice:135000000,total:1620000000}] },
  { id:"QT-2025-0042", rfqId:"RFQ-2025-0027", rfqTitle:"Scaffolding & Access Services – Plant Shutdown",   vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-08-14", validUntil:"2025-09-14", totalAmt:295000000,  notes:"Ringlock system. SCAFFOLD certified workers. Includes design drawing.",                    status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Scaffold Erection & Dismantling",qty:5000,uom:"M2",unitPrice:45000,total:225000000},{no:2,desc:"Scaffold Monthly Rental",qty:2,uom:"Month",unitPrice:35000000,total:70000000}] },
  { id:"QT-2025-0043", rfqId:"RFQ-2025-0027", rfqTitle:"Scaffolding & Access Services – Plant Shutdown",   vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-08-15", validUntil:"2025-09-15", totalAmt:311500000,  notes:"Cup lock system. Fast mobilization. Safety record zero LTI.",                             status:"Submitted", files:["quotation.pdf","safety_record.pdf"],                items:[{no:1,desc:"Scaffold Erection & Dismantling",qty:5000,uom:"M2",unitPrice:48000,total:240000000},{no:2,desc:"Scaffold Monthly Rental",qty:2,uom:"Month",unitPrice:35750000,total:71500000}] },
  { id:"QT-2025-0044", rfqId:"RFQ-2025-0028", rfqTitle:"IT Hardware Refresh – Server & Network",           vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",  submittedDate:"2025-08-16", validUntil:"2025-09-16", totalAmt:2150000000, notes:"HPE ProLiant Gen11. 3-year next-business-day warranty. Rack & stack included.",            deliveryTerms:"DDP to data center; 8–10 weeks after receipt of order", paymentTerms:"50% upon PO issuance, 50% upon delivery & acceptance",            status:"Submitted", files:["quotation.pdf","spec_sheet.pdf"],                   items:[{no:1,desc:"HPE ProLiant DL380 Gen11 Server",qty:5,uom:"Unit",unitPrice:320000000,total:1600000000},{no:2,desc:"Cisco Catalyst 9300 Switch 48P",qty:10,uom:"Unit",unitPrice:55000000,total:550000000}] },
  { id:"QT-2025-0045", rfqId:"RFQ-2025-0028", rfqTitle:"IT Hardware Refresh – Server & Network",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-08-17", validUntil:"2025-09-17", totalAmt:2080000000, notes:"Dell PowerEdge R760. Includes migration support. Extended 5-year warranty available.",     deliveryTerms:"DDP to customer site; 6–8 weeks after receipt of order", paymentTerms:"30% down payment, 70% upon delivery and commissioning",     status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Dell PowerEdge R760 Server",qty:5,uom:"Unit",unitPrice:308000000,total:1540000000},{no:2,desc:"Cisco Catalyst 9300 Switch 48P",qty:10,uom:"Unit",unitPrice:54000000,total:540000000}] },
  { id:"QT-2025-0046", rfqId:"RFQ-2025-0029", rfqTitle:"Manpower Supply – Plant Operators",                vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-08-19", validUntil:"2025-09-19", totalAmt:780000000,  notes:"All operators K3 certified. BPJS Ketenagakerjaan enrolled. Overtime included.",            status:"Submitted", files:["quotation.pdf","worker_list.pdf"],                  items:[{no:1,desc:"Plant Operator (Shift)",qty:12,uom:"Person/Month",unitPrice:6500000,total:78000000}] },
  { id:"QT-2025-0047", rfqId:"RFQ-2025-0030", rfqTitle:"Pipe & Valve Procurement – Process Plant",         vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-08-21", validUntil:"2025-09-21", totalAmt:1340000000, notes:"API 5L and ASME B16.34 compliant. Mill certificates included.",                           status:"Submitted", files:["quotation.pdf","mill_cert.pdf"],                    items:[{no:1,desc:"Carbon Steel Pipe 6\" Sch40 (6m)",qty:500,uom:"Pcs",unitPrice:1800000,total:900000000},{no:2,desc:"Gate Valve 6\" Class 150",qty:80,uom:"Pcs",unitPrice:5500000,total:440000000}] },
  { id:"QT-2025-0048", rfqId:"RFQ-2025-0031", rfqTitle:"Environmental Impact Assessment (AMDAL)",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",  submittedDate:"2025-08-22", validUntil:"2025-09-22", totalAmt:980000000,  notes:"KLHK-registered consultant. RKL/RPL tracking system included.",                           status:"Submitted", files:["quotation.pdf","lsv_license.pdf"],                  items:[{no:1,desc:"AMDAL Study & Documentation",qty:1,uom:"Lump Sum",unitPrice:650000000,total:650000000},{no:2,desc:"RKL-RPL Annual Reporting",qty:2,uom:"Year",unitPrice:165000000,total:330000000}] },
  { id:"QT-2025-0049", rfqId:"RFQ-2025-0032", rfqTitle:"Welding & Fabrication – Steel Structure",           vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-08-25", validUntil:"2025-09-25", totalAmt:620000000,  notes:"SMAW & GTAW certified welders. NDT testing included.",                                    status:"Submitted", files:["quotation.pdf","welder_certs.pdf"],                 items:[{no:1,desc:"Structural Steel Fabrication",qty:200,uom:"Ton",unitPrice:2800000,total:560000000},{no:2,desc:"NDT / UT Inspection",qty:1,uom:"Lump Sum",unitPrice:60000000,total:60000000}] },
  { id:"QT-2025-0050", rfqId:"RFQ-2025-0033", rfqTitle:"Corporate Event – Annual Meeting & Gala",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",   submittedDate:"2025-08-27", validUntil:"2025-09-27", totalAmt:480000000,  notes:"Venue: Grand Hyatt Jakarta. AV, catering, entertainment all-in package.",                 status:"Submitted", files:["quotation.pdf","venue_layout.pdf"],                 items:[{no:1,desc:"Event Venue & Catering",qty:400,uom:"Pax",unitPrice:850000,total:340000000},{no:2,desc:"AV & Entertainment Package",qty:1,uom:"Lump Sum",unitPrice:140000000,total:140000000}] },

  // ── 3rd-vendor quotations (PT Solusi Nusantara 10000003) ─────
  // + missing 2nd-vendor fills so every RFQ has ≥ 3 quotations

  // RFQ-0001 – Laptops & Workstations (+1)
  { id:"QT-2025-0057", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-15", validUntil:"2025-07-15", totalAmt:501000000, notes:"ASUS ExpertBook & ProArt Station. Enterprise warranty 3yr on-site. Pre-loaded with licensed software.",deliveryTerms:"DDP Jakarta, 3 weeks after PO",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:8020000,total:401000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },

  // RFQ-0002 – Office Supplies (+2: 10000002 + 10000003)
  { id:"QT-2025-0058", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-28", validUntil:"2025-07-28", totalAmt:140000000, notes:"Distributor resmi alat tulis. Pengiriman gratis min. IDR 1jt. Ready stock.", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",unitPrice:48000,total:48000000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",unitPrice:260000,total:52000000}] },
  { id:"QT-2025-0059", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-29", validUntil:"2025-07-29", totalAmt:151000000, notes:"Produk bergaransi keaslian. Bisa custom bundle per departemen.",deliveryTerms:"Pengiriman 2 hari kerja",paymentTerms:"Net 14 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",unitPrice:52000,total:52000000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",unitPrice:295000,total:59000000}] },

  // RFQ-0003 – Security Services (+2: 10000001 + 10000003)
  { id:"QT-2025-0060", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-07", validUntil:"2025-07-07", totalAmt:372000000, notes:"Security bersertifikat Gada Pratama. BPJS enrolled. Laporan harian digital.",deliveryTerms:"Deployment 3 hari setelah PO",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",unitPrice:8000000,total:96000000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",unitPrice:9500000,total:114000000}] },
  { id:"QT-2025-0061", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-09", validUntil:"2025-07-09", totalAmt:360000000, notes:"10 tahun pengalaman pengamanan gedung perkantoran. CCTV monitoring tambahan.",deliveryTerms:"On-site dalam 5 hari kerja",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","company_profile.pdf"], items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",unitPrice:7800000,total:93600000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",unitPrice:9200000,total:110400000}] },

  // RFQ-0004 – HVAC Maintenance (+1: 10000003)
  { id:"QT-2025-0062", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-03", validUntil:"2025-08-03", totalAmt:235000000, notes:"Teknisi bersertifikat. Respon darurat 4 jam. Suku cadang original.",deliveryTerms:"Kontrak mulai 1 Agustus 2025",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Preventive Maintenance Visit",qty:12,uom:"Visit",unitPrice:19583333,total:235000000}] },

  // RFQ-0005 – Explosive Materials (+1: 10000003)
  { id:"QT-2025-0063", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-07", validUntil:"2025-08-07", totalAmt:876500000, notes:"Distributor resmi Orica Indonesia. Izin angkut explosive aktif. Stok siap 2 minggu.",deliveryTerms:"Pengiriman ke site, termasuk biaya escorting",paymentTerms:"50% DP, 50% sebelum pengiriman", status:"Submitted", files:["quotation.pdf","izin_explosif.pdf"], items:[{no:1,desc:"ANFO Bulk Explosive",qty:50000,uom:"KG",unitPrice:8600,total:430000000},{no:2,desc:"Electric Detonator",qty:2000,uom:"Pcs",unitPrice:34750,total:69500000},{no:3,desc:"Safety Fuse (100m/roll)",qty:500,uom:"Roll",unitPrice:120000,total:60000000}] },

  // RFQ-0006 – Genset Rental (+2: 10000001 + 10000003)
  { id:"QT-2025-0064", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-07", validUntil:"2025-08-07", totalAmt:444000000, notes:"Caterpillar 500 kVA. Teknisi on-site 24/7. Termasuk BBM management.",deliveryTerms:"Mobilisasi 2 minggu setelah PO",paymentTerms:"Monthly invoicing, net 30 days", status:"Submitted", files:["quotation.pdf","genset_spec.pdf"], items:[{no:1,desc:"Genset 500 kVA Rental",qty:12,uom:"Month",unitPrice:37000000,total:444000000}] },
  { id:"QT-2025-0065", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-09", validUntil:"2025-08-09", totalAmt:456000000, notes:"Perkins 500 kVA. Monitoring remote via IoT. Backup unit tersedia di gudang.",deliveryTerms:"Mobilisasi dalam 10 hari kerja",paymentTerms:"Net 21 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Genset 500 kVA Rental",qty:12,uom:"Month",unitPrice:38000000,total:456000000}] },

  // RFQ-0007 – PPE (+1: 10000003)
  { id:"QT-2025-0066", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:121500000, notes:"Distributor 3M & MSA Indonesia. Semua item SNI. Pengiriman ke semua site.",deliveryTerms:"DDP ke semua site, 7 hari kerja",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","catalogue.pdf"], items:[{no:1,desc:"Safety Helmet (SNI certified)",qty:500,uom:"Pcs",unitPrice:75000,total:37500000},{no:2,desc:"Safety Boot (Steel Toe)",qty:300,uom:"Pair",unitPrice:345000,total:103500000},{no:3,desc:"High-Visibility Safety Vest",qty:600,uom:"Pcs",unitPrice:83500,total:50100000}] },

  // RFQ-0008 – ERP Consulting (+1: 10000003)
  { id:"QT-2025-0067", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-27", validUntil:"2025-07-27", totalAmt:654000000, notes:"SAP Gold Partner Indonesia. Tim konsultan berpengalaman min. 7 tahun. Termasuk hypercare 3 bulan.",deliveryTerms:"Resource mobilisasi dalam 2 minggu",paymentTerms:"Monthly invoicing, net 14 days", status:"Submitted", files:["quotation.pdf","cv_consultant.pdf"], items:[{no:1,desc:"SAP BTP Integration Consultant",qty:6,uom:"Month",unitPrice:85000000,total:510000000},{no:2,desc:"SAP Analytics Cloud Specialist",qty:4,uom:"Month",unitPrice:36000000,total:144000000}] },

  // RFQ-0009 – Water Treatment Chemicals (+1: 10000003)
  { id:"QT-2025-0068", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:193500000, notes:"Distributor Kemira & BASF. Semua produk berMSDS dan KAN. Stok gudang Jakarta.",deliveryTerms:"Ex-Jakarta, pengiriman 5 hari kerja",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","msds.pdf"], items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",qty:500,uom:"Bag",unitPrice:182000,total:91000000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",qty:300,uom:"Bag",unitPrice:255000,total:76500000},{no:3,desc:"Caustic Soda (NaOH) 50 kg/drum",qty:150,uom:"Drum",unitPrice:186667,total:28000000}] },

  // RFQ-0010 – Medical & First Aid (+1: 10000003)
  { id:"QT-2025-0069", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-13", validUntil:"2025-08-13", totalAmt:92500000, notes:"Distributor alkes resmi. Semua item CE marked dan BPOM. Expiry min. 18 bulan.",deliveryTerms:"Pengiriman ke semua site dalam 7 hari",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"First Aid Kit (50-person)",qty:25,uom:"Set",unitPrice:1300000,total:32500000},{no:2,desc:"AED Defibrillator",qty:5,uom:"Unit",unitPrice:11500000,total:57500000},{no:3,desc:"Stretcher & Immobilization Board",qty:10,uom:"Pcs",unitPrice:250000,total:2500000}] },

  // RFQ-0011 – Drone Survey (+2: 10000001 + 10000003)
  { id:"QT-2025-0070", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:302000000, notes:"DJI Phantom 4 RTK & Matrice 300. Pilot & operator bersertifikat DGCA. Turnaround 7 hari.",deliveryTerms:"Mobilisasi tim dalam 1 minggu",paymentTerms:"50% DP, 50% setelah deliverable", status:"Submitted", files:["quotation.pdf","pilot_license.pdf"], items:[{no:1,desc:"Drone Aerial Survey (per hectare)",qty:2500,uom:"Ha",unitPrice:110000,total:275000000},{no:2,desc:"3D Point Cloud Processing & Report",qty:1,uom:"Lump Sum",unitPrice:27000000,total:27000000}] },
  { id:"QT-2025-0071", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-14", validUntil:"2025-08-14", totalAmt:328000000, notes:"WingtraOne fixed-wing drone – akurasi tertinggi. Termasuk ground control point survey.",deliveryTerms:"Mobilisasi 10 hari kerja",paymentTerms:"Net 30 days setelah deliverable", status:"Submitted", files:["quotation.pdf","equipment_spec.pdf"], items:[{no:1,desc:"Drone Aerial Survey (per hectare)",qty:2500,uom:"Ha",unitPrice:122000,total:305000000},{no:2,desc:"3D Point Cloud Processing & Report",qty:1,uom:"Lump Sum",unitPrice:23000000,total:23000000}] },

  // RFQ-0012 – Heavy Equipment Rental (+1: 10000003)
  { id:"QT-2025-0072", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-17", validUntil:"2025-08-17", totalAmt:960000000, notes:"Hitachi ZX350 & Komatsu D85. Operator & mekanik on-site. Penggantian unit jika breakdown > 24 jam.",deliveryTerms:"Mobilisasi 3 minggu setelah PO",paymentTerms:"Monthly invoicing, net 30 days", status:"Submitted", files:["quotation.pdf","equipment_list.pdf"], items:[{no:1,desc:"Hydraulic Excavator 36T",qty:12,uom:"Month",unitPrice:55000000,total:660000000},{no:2,desc:"Bulldozer D85",qty:12,uom:"Month",unitPrice:25000000,total:300000000}] },

  // RFQ-0013 – Laboratory Testing (+2: 10000002 + 10000003)
  { id:"QT-2025-0073", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003", submittedDate:"2025-07-18", validUntil:"2025-08-18", totalAmt:153500000, notes:"Lab KAN-akreditasi. TAT 7 hari kerja. Laporan digital dan fisik.",deliveryTerms:"Pengambilan sampel di site atau antar ke lab",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","accreditation.pdf"], items:[{no:1,desc:"Fire Assay – Au (per sample)",qty:2000,uom:"Sample",unitPrice:47000,total:94000000},{no:2,desc:"ICP-MS Multi-element Analysis",qty:1500,uom:"Sample",unitPrice:39667,total:59500000}] },
  { id:"QT-2025-0074", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-19", validUntil:"2025-08-19", totalAmt:147500000, notes:"Partner SGS Indonesia. Akreditasi KAN & ISO 17025. TAT 5 hari kerja.",deliveryTerms:"Pick-up di site, pengiriman ke lab Balikpapan",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Fire Assay – Au (per sample)",qty:2000,uom:"Sample",unitPrice:41000,total:82000000},{no:2,desc:"ICP-MS Multi-element Analysis",qty:1500,uom:"Sample",unitPrice:43667,total:65500000}] },

  // RFQ-0014 – Catering (+2: 10000001 + 10000003)
  { id:"QT-2025-0075", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-17", validUntil:"2025-08-17", totalAmt:511125000, notes:"Sertifikasi halal MUI. Menu rotasi harian. Dietitian on-site. Kapasitas 600 pax.",deliveryTerms:"Operasional mulai 1 September 2025",paymentTerms:"Monthly invoicing, net 21 days", status:"Submitted", files:["quotation.pdf","halal_cert.pdf"], items:[{no:1,desc:"Catering per Person per Day",qty:54750,uom:"Person/Day",unitPrice:79750,total:4366125000}] },
  { id:"QT-2025-0076", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-19", validUntil:"2025-08-19", totalAmt:540562500, notes:"Menu western & lokal. Halal bersertifikat. Chef berpengalaman catering mining camp.",deliveryTerms:"Operasional mulai 1 September 2025",paymentTerms:"Monthly invoicing, net 30 days", status:"Submitted", files:["quotation.pdf","menu_sample.pdf"], items:[{no:1,desc:"Catering per Person per Day",qty:54750,uom:"Person/Day",unitPrice:85000,total:4653750000}] },

  // RFQ-0015 – VSAT & Radio (+1: 10000003)
  { id:"QT-2025-0077", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:421000000, notes:"Viasat & Intelsat backbone. SLA 99.7% uptime. NOC 24/7 berbasis Jakarta.",deliveryTerms:"Instalasi dalam 3 minggu setelah PO",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","technical_proposal.pdf"], items:[{no:1,desc:"VSAT Installation & Hardware",qty:1,uom:"Set",unitPrice:190000000,total:190000000},{no:2,desc:"VSAT Monthly Bandwidth (100Mbps)",qty:12,uom:"Month",unitPrice:19250000,total:231000000}] },

  // RFQ-0016 – Waste Management (+1: 10000003)
  { id:"QT-2025-0078", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-22", validUntil:"2025-08-22", totalAmt:278500000, notes:"Izin TPS B3 aktif dari DLH Provinsi. Manifest elektronik terintegrasi SIMPEL KLHK.",deliveryTerms:"Armada siap mobilisasi 2 minggu setelah kontrak",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","klhk_license.pdf"], items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",qty:50000,uom:"KG",unitPrice:3400,total:170000000},{no:2,desc:"Non-B3 Waste Disposal (month)",qty:12,uom:"Month",unitPrice:9041667,total:108500000}] },

  // RFQ-0017 – Fuel Supply (+1: 10000003)
  { id:"QT-2025-0079", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Avgas", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-23", validUntil:"2025-08-23", totalAmt:1172000000, notes:"Distributor resmi BBM Pertamina. Harga kontrak 6 bulan. Pengiriman ke site min. 8,000L.",deliveryTerms:"Delivery ke site, 3 hari kerja",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"HSD Diesel Fuel (Liter)",qty:3000000,uom:"Liter",unitPrice:320,total:960000000},{no:2,desc:"Aviation Gasoline – Avgas 100LL",qty:5000,uom:"Liter",unitPrice:17800,total:89000000}] },

  // RFQ-0018 – Tailings Dam Monitoring (+2: 10000002 + 10000003)
  { id:"QT-2025-0080", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-25", validUntil:"2025-08-25", totalAmt:351000000, notes:"Instrumen Sisgeo Italia. Instalasi oleh geoteknik engineer bersertifikat.",deliveryTerms:"Delivery & instalasi 6 minggu setelah PO",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","datasheet.pdf"], items:[{no:1,desc:"Piezometer (vibrating wire)",qty:20,uom:"Unit",unitPrice:7800000,total:156000000},{no:2,desc:"Inclinometer Casing & Probe",qty:5,uom:"Set",unitPrice:23500000,total:117500000},{no:3,desc:"Data Logger & Telemetry Unit",qty:3,uom:"Unit",unitPrice:25833333,total:77500000}] },
  { id:"QT-2025-0081", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-26", validUntil:"2025-08-26", totalAmt:382000000, notes:"Campbell Scientific logger. Real-time cloud monitoring dashboard included. 2-yr warranty.",deliveryTerms:"Delivery 8 minggu, instalasi termasuk",paymentTerms:"50% DP, 50% setelah komisioning", status:"Submitted", files:["quotation.pdf","system_spec.pdf"], items:[{no:1,desc:"Piezometer (vibrating wire)",qty:20,uom:"Unit",unitPrice:8500000,total:170000000},{no:2,desc:"Inclinometer Casing & Probe",qty:5,uom:"Set",unitPrice:25500000,total:127500000},{no:3,desc:"Data Logger & Telemetry Unit",qty:3,uom:"Unit",unitPrice:28166667,total:84500000}] },

  // RFQ-0019 – Office Renovation (+1: 10000003)
  { id:"QT-2025-0082", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:820000000, notes:"Kontraktor interior berpengalaman. Portofolio: Astra, Telkom, Pertamina. ISO 9001 certified.",deliveryTerms:"Penyelesaian dalam 90 hari kalender",paymentTerms:"30% DP, 60% progress, 10% setelah selesai", status:"Submitted", files:["quotation.pdf","portfolio.pdf"], items:[{no:1,desc:"Interior Design & Build Works",qty:1,uom:"Lump Sum",unitPrice:680000000,total:680000000},{no:2,desc:"Furniture & Fitout Supply",qty:1,uom:"Lump Sum",unitPrice:140000000,total:140000000}] },

  // RFQ-0020 – Mine Safety Training (+2: 10000001 + 10000003)
  { id:"QT-2025-0083", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-07-24", validUntil:"2025-08-24", totalAmt:89500000, notes:"Trainer BNSP & Kemnaker certified. Modul custom untuk kondisi site BRM.",deliveryTerms:"Jadwal training fleksibel sesuai operasional",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","trainer_profile.pdf"], items:[{no:1,desc:"Mine Safety (SIMTK) Training",qty:200,uom:"Person",unitPrice:185000,total:37000000},{no:2,desc:"Emergency Response Drill",qty:4,uom:"Session",unitPrice:13375000,total:53500000}] },
  { id:"QT-2025-0084", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-26", validUntil:"2025-08-26", totalAmt:98200000, notes:"Certified by BNSP, Kemnaker, dan ESDM. Termasuk simulasi rescue dan P3K tingkat lanjut.",deliveryTerms:"Bisa dilaksanakan on-site maupun di training center",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Mine Safety (SIMTK) Training",qty:200,uom:"Person",unitPrice:210000,total:42000000},{no:2,desc:"Emergency Response Drill",qty:4,uom:"Session",unitPrice:14050000,total:56200000}] },

  // RFQ-0021 – Road Infrastructure (+1: 10000003)
  { id:"QT-2025-0085", rfqId:"RFQ-2025-0021", rfqTitle:"Road Infrastructure – Haul Road Upgrade", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-30", validUntil:"2025-08-30", totalAmt:1880000000, notes:"Kontraktor jalan berpengalaman 15 tahun. AMP sendiri. Metode Asphalt Concrete sesuai Bina Marga.",deliveryTerms:"Mobilisasi 3 minggu, penyelesaian 7 bulan",paymentTerms:"20% DP, 70% progress, 10% retensi", status:"Submitted", files:["quotation.pdf","method_statement.pdf","equipment_list.pdf"], items:[{no:1,desc:"Road Subgrade Preparation",qty:15000,uom:"M2",unitPrice:46667,total:700000000},{no:2,desc:"Asphalt Wearing Course (AC-WC)",qty:15000,uom:"M2",unitPrice:118667,total:1780000000}] },

  // RFQ-0022 – Lubricants (+1: 10000003)
  { id:"QT-2025-0086", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-04", validUntil:"2025-09-04", totalAmt:378500000, notes:"Distributor Mobil Oil & ExxonMobil. Analisa oli gratis per semester. Pengiriman ke site.",deliveryTerms:"Ex-Surabaya, 7 hari ke site",paymentTerms:"Net 30 days; 2% diskon jika bayar 7 hari", status:"Submitted", files:["quotation.pdf","product_sheet.pdf"], items:[{no:1,desc:"Shell Rimula R4 15W-40 (208L drum)",qty:300,uom:"Drum",unitPrice:935000,total:280500000},{no:2,desc:"Shell Gadus S3 V220C Grease (18kg)",qty:200,uom:"Bucket",unitPrice:490000,total:98000000}] },

  // RFQ-0023 – Legal Advisory (+2: 10000002 + 10000003)
  { id:"QT-2025-0087", rfqId:"RFQ-2025-0023", rfqTitle:"Legal Advisory Services – Mining Permits", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003", submittedDate:"2025-08-06", validUntil:"2025-09-06", totalAmt:396000000, notes:"Law firm spesialisasi hukum pertambangan. Partner berpengalaman 15 tahun di ESDM.",deliveryTerms:"Retainer mulai sejak penandatanganan kontrak",paymentTerms:"Monthly retainer, net 14 days", status:"Submitted", files:["quotation.pdf","firm_profile.pdf"], items:[{no:1,desc:"Legal Retainer – Mining Law",qty:12,uom:"Month",unitPrice:33000000,total:396000000}] },
  { id:"QT-2025-0088", rfqId:"RFQ-2025-0023", rfqTitle:"Legal Advisory Services – Mining Permits", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-07", validUntil:"2025-09-07", totalAmt:432000000, notes:"Firm dengan jaringan konsultan ESDM dan OSS. Tracking perizinan berbasis sistem digital.",deliveryTerms:"Retainer efektif sejak PO diterbitkan",paymentTerms:"Monthly retainer, net 21 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Legal Retainer – Mining Law",qty:12,uom:"Month",unitPrice:36000000,total:432000000}] },

  // RFQ-0024 – Insurance (+1: 10000003)
  { id:"QT-2025-0089", rfqId:"RFQ-2025-0024", rfqTitle:"Insurance – Property All Risk & Public Liability", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-10", validUntil:"2025-09-10", totalAmt:548000000, notes:"Asuransi Jasindo OJK-terdaftar. Reasuransi Munich Re. SLA klaim 10 hari kerja.",deliveryTerms:"Polis aktif 14 hari setelah premi diterima",paymentTerms:"Annual premium, net 30 days", status:"Submitted", files:["quotation.pdf","policy_sample.pdf"], items:[{no:1,desc:"Property All Risk Premium",qty:1,uom:"Annual",unitPrice:352000000,total:352000000},{no:2,desc:"Public Liability Premium",qty:1,uom:"Annual",unitPrice:196000000,total:196000000}] },

  // RFQ-0025 – Fire Protection (+2: 10000002 + 10000003)
  { id:"QT-2025-0090", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-08-11", validUntil:"2025-09-11", totalAmt:723000000, notes:"Kontraktor proteksi kebakaran. Sertifikasi Dinas Pemadam. Garansi instalasi 2 tahun.",deliveryTerms:"Penyelesaian dalam 4 bulan",paymentTerms:"30% DP, 70% setelah komisioning", status:"Submitted", files:["quotation.pdf","design_drawing.pdf"], items:[{no:1,desc:"Sprinkler System Installation",qty:1,uom:"Lump Sum",unitPrice:520000000,total:520000000},{no:2,desc:"Fire Hydrant & Hose Reel",qty:20,uom:"Unit",unitPrice:10150000,total:203000000}] },
  { id:"QT-2025-0091", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-12", validUntil:"2025-09-12", totalAmt:763000000, notes:"NFPA 13 & SNI 03-3989 compliant. Engineering & commissioning oleh fire engineer bersertifikat.",deliveryTerms:"Engineering 4 minggu, instalasi 3 bulan",paymentTerms:"25% DP, 50% progress, 25% komisioning", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Sprinkler System Installation",qty:1,uom:"Lump Sum",unitPrice:558000000,total:558000000},{no:2,desc:"Fire Hydrant & Hose Reel",qty:20,uom:"Unit",unitPrice:10250000,total:205000000}] },

  // RFQ-0026 – Helicopter (+2: 10000001 + 10000003)
  { id:"QT-2025-0092", rfqId:"RFQ-2025-0026", rfqTitle:"Chartered Flight – Helicopter Services", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-08-11", validUntil:"2025-09-11", totalAmt:1560000000, notes:"Eurocopter AS365 Dauphin, 12-seat. Berpengalaman di lokasi tambang Kalimantan & Sulawesi.",deliveryTerms:"Base di Palu, siap operasi 2 minggu setelah kontrak",paymentTerms:"Monthly charter fee, net 14 days", status:"Submitted", files:["quotation.pdf","aoc_certificate.pdf"], items:[{no:1,desc:"Helicopter Charter – Bell 412",qty:12,uom:"Month",unitPrice:130000000,total:1560000000}] },
  { id:"QT-2025-0093", rfqId:"RFQ-2025-0026", rfqTitle:"Chartered Flight – Helicopter Services", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-13", validUntil:"2025-09-13", totalAmt:1680000000, notes:"Sikorsky S-76D, 12-seat. Full avionics IFR. Pilot & co-pilot experienced in mountain terrain.",deliveryTerms:"Base di Palu/Gorontalo sesuai kebutuhan",paymentTerms:"Monthly charter fee, net 21 days", status:"Submitted", files:["quotation.pdf","aoc.pdf","aircraft_spec.pdf"], items:[{no:1,desc:"Helicopter Charter – Bell 412",qty:12,uom:"Month",unitPrice:140000000,total:1680000000}] },

  // RFQ-0027 – Scaffolding (+1: 10000003)
  { id:"QT-2025-0094", rfqId:"RFQ-2025-0027", rfqTitle:"Scaffolding & Access Services – Plant Shutdown", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-16", validUntil:"2025-09-16", totalAmt:303000000, notes:"Layher sistem scaffolding. Tim SCAFFOLD certified 50 orang. Pengalaman turnaround plant Pertamina.",deliveryTerms:"Mobilisasi 1 minggu sebelum shutdown",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","safety_record.pdf"], items:[{no:1,desc:"Scaffold Erection & Dismantling",qty:5000,uom:"M2",unitPrice:46500,total:232500000},{no:2,desc:"Scaffold Monthly Rental",qty:2,uom:"Month",unitPrice:35250000,total:70500000}] },

  // RFQ-0028 – IT Hardware (+1: 10000003)
  { id:"QT-2025-0095", rfqId:"RFQ-2025-0028", rfqTitle:"IT Hardware Refresh – Server & Network", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-18", validUntil:"2025-09-18", totalAmt:2110000000, notes:"Lenovo ThinkSystem SR650 Gen3 & Cisco Catalyst. Termasuk rack, cabling, dan konfigurasi awal.",deliveryTerms:"DDP ke data center; 7-9 minggu",paymentTerms:"40% DP, 60% setelah delivery & acceptance", status:"Submitted", files:["quotation.pdf","spec_sheet.pdf"], items:[{no:1,desc:"HPE ProLiant DL380 Gen11 Server",qty:5,uom:"Unit",unitPrice:312000000,total:1560000000},{no:2,desc:"Cisco Catalyst 9300 Switch 48P",qty:10,uom:"Unit",unitPrice:55000000,total:550000000}] },

  // RFQ-0029 – Manpower Supply (+2: 10000001 + 10000003)
  { id:"QT-2025-0096", rfqId:"RFQ-2025-0029", rfqTitle:"Manpower Supply – Plant Operators", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-08-18", validUntil:"2025-09-18", totalAmt:750000000, notes:"Operator bersertifikat SIO. BPJS Ketenagakerjaan & Kesehatan enrolled. 3 shift coverage.",deliveryTerms:"Mobilisasi operator dalam 2 minggu",paymentTerms:"Monthly invoicing, net 30 days", status:"Submitted", files:["quotation.pdf","worker_cv.pdf"], items:[{no:1,desc:"Plant Operator (Shift)",qty:10,uom:"Person/Month",unitPrice:7500000,total:75000000}] },
  { id:"QT-2025-0097", rfqId:"RFQ-2025-0029", rfqTitle:"Manpower Supply – Plant Operators", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-20", validUntil:"2025-09-20", totalAmt:780000000, notes:"Operator pengalaman min. 3 tahun di industri mining. Semua bersertifikat K3 dan SIO.",deliveryTerms:"Mobilisasi operator dalam 3 minggu",paymentTerms:"Monthly invoicing, net 21 days", status:"Submitted", files:["quotation.pdf"], items:[{no:1,desc:"Plant Operator (Shift)",qty:10,uom:"Person/Month",unitPrice:7800000,total:78000000}] },

  // RFQ-0030 – Pipe & Valve (+2: 10000002 + 10000003)
  { id:"QT-2025-0098", rfqId:"RFQ-2025-0030", rfqTitle:"Pipe & Valve Procurement – Process Plant", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-08-20", validUntil:"2025-09-20", totalAmt:1295000000, notes:"Distributor resmi Schuller & Honeywell. Mill cert & MTR tersedia. Ex-gudang Cikarang.",deliveryTerms:"Ex-Cikarang, pengiriman 14 hari ke site",paymentTerms:"Net 30 days", status:"Submitted", files:["quotation.pdf","mill_cert.pdf"], items:[{no:1,desc:"Carbon Steel Pipe 6\" Sch40 (6m)",qty:500,uom:"Pcs",unitPrice:1750000,total:875000000},{no:2,desc:"Gate Valve 6\" Class 150",qty:80,uom:"Pcs",unitPrice:5250000,total:420000000}] },
  { id:"QT-2025-0099", rfqId:"RFQ-2025-0030", rfqTitle:"Pipe & Valve Procurement – Process Plant", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-22", validUntil:"2025-09-22", totalAmt:1378000000, notes:"Pipa API 5L dan valve ASME B16.34. Sertifikat mill dari pabrik. Ready stock sebagian.",deliveryTerms:"Ex-Surabaya, 10 hari ke site",paymentTerms:"Net 30 days; DP 30% untuk indent item", status:"Submitted", files:["quotation.pdf","product_catalogue.pdf"], items:[{no:1,desc:"Carbon Steel Pipe 6\" Sch40 (6m)",qty:500,uom:"Pcs",unitPrice:1860000,total:930000000},{no:2,desc:"Gate Valve 6\" Class 150",qty:80,uom:"Pcs",unitPrice:5600000,total:448000000}] },

  // RFQ-0031 – AMDAL (+2: 10000001 + 10000003)
  { id:"QT-2025-0100", rfqId:"RFQ-2025-0031", rfqTitle:"Environmental Impact Assessment (AMDAL)", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Hendra Wijaya · +62-811-2345-005", submittedDate:"2025-08-21", validUntil:"2025-09-21", totalAmt:945000000, notes:"Konsultan AMDAL terdaftar KLHK. Pengalaman 20+ studi AMDAL tambang di Kalimantan & Sulawesi.",deliveryTerms:"Studi selesai 12 bulan; RKL-RPL per tahun",paymentTerms:"Quarterly billing, net 30 days", status:"Submitted", files:["quotation.pdf","lsv_license.pdf","portofolio.pdf"], items:[{no:1,desc:"AMDAL Study & Documentation",qty:1,uom:"Lump Sum",unitPrice:620000000,total:620000000},{no:2,desc:"RKL-RPL Annual Reporting",qty:2,uom:"Year",unitPrice:162500000,total:325000000}] },
  { id:"QT-2025-0101", rfqId:"RFQ-2025-0031", rfqTitle:"Environmental Impact Assessment (AMDAL)", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-23", validUntil:"2025-09-23", totalAmt:1010000000, notes:"Registered KLHK consultant. Spesialisasi AMDAL pertambangan. Tim multidisiplin 12 ahli.",deliveryTerms:"Studi 10 bulan; laporan RKL-RPL tahunan",paymentTerms:"Milestone-based billing, net 30 days", status:"Submitted", files:["quotation.pdf","lsv_license.pdf"], items:[{no:1,desc:"AMDAL Study & Documentation",qty:1,uom:"Lump Sum",unitPrice:680000000,total:680000000},{no:2,desc:"RKL-RPL Annual Reporting",qty:2,uom:"Year",unitPrice:165000000,total:330000000}] },

  // RFQ-0032 – Welding & Fabrication (+2: 10000002 + 10000003)
  { id:"QT-2025-0102", rfqId:"RFQ-2025-0032", rfqTitle:"Welding & Fabrication – Steel Structure", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003", submittedDate:"2025-08-24", validUntil:"2025-09-24", totalAmt:605000000, notes:"Fabrikator baja berpengalaman. Welder bersertifikat BNSP. Workshop di Cibitung, Bekasi.",deliveryTerms:"Fabrikasi 3 bulan; erection 1 bulan",paymentTerms:"Monthly progress billing, net 30 days", status:"Submitted", files:["quotation.pdf","welder_certs.pdf"], items:[{no:1,desc:"Structural Steel Fabrication",qty:200,uom:"Ton",unitPrice:2750000,total:550000000},{no:2,desc:"NDT / UT Inspection",qty:1,uom:"Lump Sum",unitPrice:55000000,total:55000000}] },
  { id:"QT-2025-0103", rfqId:"RFQ-2025-0032", rfqTitle:"Welding & Fabrication – Steel Structure", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-26", validUntil:"2025-09-26", totalAmt:638000000, notes:"Fabrikator ISO 3834 certified. Tim 40 welder bersertifikat. CNC cutting & drilling tersedia.",deliveryTerms:"Fabrikasi 3.5 bulan; erection on-site",paymentTerms:"30% DP, 50% progress, 20% selesai", status:"Submitted", files:["quotation.pdf","iso_cert.pdf"], items:[{no:1,desc:"Structural Steel Fabrication",qty:200,uom:"Ton",unitPrice:2890000,total:578000000},{no:2,desc:"NDT / UT Inspection",qty:1,uom:"Lump Sum",unitPrice:60000000,total:60000000}] },

  // RFQ-0033 – Corporate Event (+2: 10000001 + 10000003)
  { id:"QT-2025-0104", rfqId:"RFQ-2025-0033", rfqTitle:"Corporate Event – Annual Meeting & Gala", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Andi Setiawan · +62-811-2345-004", submittedDate:"2025-08-26", validUntil:"2025-09-26", totalAmt:462000000, notes:"EO berpengalaman event korporat BUMN & swasta. Venue alternatif Ritz-Carlton Pacific Place.",deliveryTerms:"Event readiness T-7 hari",paymentTerms:"50% DP, 50% H+3 hari setelah event", status:"Submitted", files:["quotation.pdf","portfolio.pdf"], items:[{no:1,desc:"Event Venue & Catering",qty:400,uom:"Pax",unitPrice:820000,total:328000000},{no:2,desc:"AV & Entertainment Package",qty:1,uom:"Lump Sum",unitPrice:134000000,total:134000000}] },
  { id:"QT-2025-0105", rfqId:"RFQ-2025-0033", rfqTitle:"Corporate Event – Annual Meeting & Gala", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-08-28", validUntil:"2025-09-28", totalAmt:498000000, notes:"Full EO service. Venue: Hotel Indonesia Kempinski. Live streaming & hibur internasional tersedia.",deliveryTerms:"Full service H-14 planning, H-1 rehearsal",paymentTerms:"40% DP, 60% setelah event", status:"Submitted", files:["quotation.pdf","venue_layout.pdf"], items:[{no:1,desc:"Event Venue & Catering",qty:400,uom:"Pax",unitPrice:880000,total:352000000},{no:2,desc:"AV & Entertainment Package",qty:1,uom:"Lump Sum",unitPrice:146000000,total:146000000}] },

  // RFQ-0051 – Geotechnical Investigation (+1: 10000003 — partially scored like a 3rd evaluand)
  { id:"QT-2025-0106", rfqId:"RFQ-2025-0051", rfqTitle:"Geotechnical Investigation – Open Pit Expansion", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-05", validUntil:"2025-07-05", totalAmt:910000000, notes:"Tim geoteknik berpengalaman. Peralatan CPT & Vane Shear tersedia. Laboratorium akreditasi KAN.",deliveryTerms:"Mobilisasi 3 minggu setelah PO",paymentTerms:"Monthly progress billing, net 21 days", status:"Accepted", scores:{technical:79,commercial:80,hse:85,weighted:80}, files:["quotation.pdf","technical_proposal.pdf"], items:[{no:1,desc:"Borehole Drilling & Sampling",qty:1500,uom:"Meter",unitPrice:348000,total:522000000},{no:2,desc:"Laboratory Testing",qty:800,uom:"Sample",unitPrice:176250,total:141000000},{no:3,desc:"Geotechnical Report & Slope Analysis",qty:1,uom:"Lump Sum",unitPrice:247000000,total:247000000}] },

  // RFQ-0052 – Port Handling (+1: 10000003 — unscored, partial eval scenario)
  { id:"QT-2025-0107", rfqId:"RFQ-2025-0052", rfqTitle:"Port Handling & Stevedoring – Mineral Export", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-27", validUntil:"2025-07-27", totalAmt:1420000000, notes:"Operator pelabuhan berpengalaman. Kapasitas angkut 150.000 MT/tahun. Izin lengkap dari KSOP.",deliveryTerms:"Operasional dalam 3 minggu setelah kontrak",paymentTerms:"Monthly invoicing, net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf","port_license.pdf"], items:[{no:1,desc:"Stevedoring – Loading",qty:120000,uom:"MT",unitPrice:8200,total:984000000},{no:2,desc:"Port Storage / Stockpile Management",qty:12,uom:"Month",unitPrice:28833333,total:346000000},{no:3,desc:"Ship Agency & Documentation",qty:24,uom:"Vessel",unitPrice:3750000,total:90000000}] },

  // RFQ-0053 – Concrete Batching Plant (+1: 10000003 — unscored, waiting eval)
  { id:"QT-2025-0108", rfqId:"RFQ-2025-0053", rfqTitle:"Concrete Batching Plant – Ready Mix Supply", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:2760000000, notes:"Schwing Stetter batching plant 150 M³/hr – kapasitas tertinggi. Laboratorium beton on-site. Semua mix design telah diuji.",deliveryTerms:"Plant on-site 1 September 2025; produksi mulai 7 September",paymentTerms:"Monthly billing per delivery note, net 21 days", status:"Submitted", scores:{}, files:["quotation.pdf","mix_design.pdf","plant_spec.pdf","lab_result.pdf"], items:[{no:1,desc:"Ready Mix Concrete K-300",qty:12000,uom:"M³",unitPrice:930000,total:11160000000},{no:2,desc:"Ready Mix Concrete K-350",qty:9000,uom:"M³",unitPrice:1035000,total:9315000000},{no:3,desc:"Ready Mix Concrete K-400",qty:4000,uom:"M³",unitPrice:1135000,total:4540000000},{no:4,desc:"Mobile Batching Plant – On-site",qty:18,uom:"Month",unitPrice:23500000,total:423000000}] },

  // ── Quotations for evaluation demo RFQs ─────────────────────
  // RFQ-2025-0051: FULLY EVALUATED — both vendors scored
  { id:"QT-2025-0051", rfqId:"RFQ-2025-0051", rfqTitle:"Geotechnical Investigation – Open Pit Expansion",
    vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Budi Hartono · +62-811-2345-001",
    submittedDate:"2025-06-03", validUntil:"2025-07-03", totalAmt:895000000,
    notes:"Team of 3 certified geotechnical engineers. Includes slope stability modelling using Phase 2 existing data. All lab tests accredited by KAN.",
    deliveryTerms:"Mobilization within 2 weeks of PO", paymentTerms:"Monthly progress billing, net 14 days",
    status:"Win",
    scores:{ technical:88, commercial:82, hse:90, weighted:87 },
    files:["quotation.pdf","technical_proposal.pdf","team_cv.pdf"],
    items:[
      {no:1,desc:"Borehole Drilling & Sampling",qty:1500,uom:"Meter",unitPrice:340000,total:510000000},
      {no:2,desc:"Laboratory Testing",qty:800,uom:"Sample",unitPrice:170000,total:136000000},
      {no:3,desc:"Geotechnical Report & Slope Analysis",qty:1,uom:"Lump Sum",unitPrice:249000000,total:249000000},
    ]},
  { id:"QT-2025-0052", rfqId:"RFQ-2025-0051", rfqTitle:"Geotechnical Investigation – Open Pit Expansion",
    vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",
    submittedDate:"2025-06-04", validUntil:"2025-07-04", totalAmt:872000000,
    notes:"Lower unit price on drilling. Lab tests subcontracted to certified partner. Limited slope stability modelling experience for open-pit scale.",
    deliveryTerms:"Mobilization within 3 weeks of PO", paymentTerms:"Monthly progress billing, net 21 days",
    status:"Accepted",
    scores:{ technical:72, commercial:85, hse:78, weighted:78 },
    files:["quotation.pdf","technical_proposal.pdf"],
    items:[
      {no:1,desc:"Borehole Drilling & Sampling",qty:1500,uom:"Meter",unitPrice:325000,total:487500000},
      {no:2,desc:"Laboratory Testing",qty:800,uom:"Sample",unitPrice:178125,total:142500000},
      {no:3,desc:"Geotechnical Report & Slope Analysis",qty:1,uom:"Lump Sum",unitPrice:242000000,total:242000000},
    ]},

  // RFQ-2025-0052: PARTIALLY EVALUATED — only PT Maju Bersama scored, CV Sukses Mandiri pending
  { id:"QT-2025-0053", rfqId:"RFQ-2025-0052", rfqTitle:"Port Handling & Stevedoring – Mineral Export",
    vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Hendra Wijaya · +62-811-2345-005",
    submittedDate:"2025-06-25", validUntil:"2025-07-25", totalAmt:1380000000,
    notes:"New entrant at Lhokseumawe Port but competitive on price. Has ISPS compliance and ILO 152 certified. 2-year track record at Kuala Tanjung Port.",
    deliveryTerms:"Operational within 4 weeks of contract signing", paymentTerms:"Monthly invoicing, net 30 days",
    status:"Submitted",
    scores:{ technical:76, commercial:88, hse:80, weighted:81 },
    files:["quotation.pdf","isps_certificate.pdf"],
    items:[
      {no:1,desc:"Stevedoring – Loading",qty:120000,uom:"MT",unitPrice:8000,total:960000000},
      {no:2,desc:"Port Storage / Stockpile Management",qty:12,uom:"Month",unitPrice:30000000,total:360000000},
      {no:3,desc:"Ship Agency & Documentation",qty:24,uom:"Vessel",unitPrice:2500000,total:60000000},
    ]},
  { id:"QT-2025-0054", rfqId:"RFQ-2025-0052", rfqTitle:"Port Handling & Stevedoring – Mineral Export",
    vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Rizky Pratama · +62-812-9876-003",
    submittedDate:"2025-06-26", validUntil:"2025-07-26", totalAmt:1465000000,
    notes:"5-year track record at Lhokseumawe Port. Owns 3 units harbour crane. ISPS compliance certificate being renewed (expected end of July).",
    deliveryTerms:"Operational within 2 weeks of contract signing", paymentTerms:"Monthly invoicing, net 21 days",
    status:"Submitted",
    scores:{},
    files:["quotation.pdf","company_profile.pdf"],
    items:[
      {no:1,desc:"Stevedoring – Loading",qty:120000,uom:"MT",unitPrice:8800,total:1056000000},
      {no:2,desc:"Port Storage / Stockpile Management",qty:12,uom:"Month",unitPrice:29083333,total:349000000},
      {no:3,desc:"Ship Agency & Documentation",qty:24,uom:"Vessel",unitPrice:2500000,total:60000000},
    ]},

  // RFQ-2025-0053: WAITING FOR EVALUATION — no scores at all
  { id:"QT-2025-0055", rfqId:"RFQ-2025-0053", rfqTitle:"Concrete Batching Plant – Ready Mix Supply",
    vendorId:"10000001", vendorName:"PT Maju Bersama",   salesPerson:"Andi Setiawan · +62-811-2345-004",
    submittedDate:"2025-07-08", validUntil:"2025-08-08", totalAmt:2730000000,
    notes:"Liebherr Mobilmix 2.5 batching plant – 120 M³/hr. All concrete mixes meet SNI 03-2834. Dedicated quality control lab on-site.",
    deliveryTerms:"Batching plant on-site by 15 Aug 2025; first pour within 7 days of plant commissioning", paymentTerms:"Monthly billing per delivery docket, net 30 days",
    status:"Submitted",
    scores:{},
    files:["quotation.pdf","mix_design.pdf","plant_spec.pdf"],
    items:[
      {no:1,desc:"Ready Mix Concrete K-300",qty:12000,uom:"M³",unitPrice:920000,total:11040000000},
      {no:2,desc:"Ready Mix Concrete K-350",qty:9000,uom:"M³",unitPrice:1020000,total:9180000000},
      {no:3,desc:"Ready Mix Concrete K-400",qty:4000,uom:"M³",unitPrice:1120000,total:4480000000},
      {no:4,desc:"Mobile Batching Plant – On-site",qty:18,uom:"Month",unitPrice:22000000,total:396000000},
    ]},
  { id:"QT-2025-0056", rfqId:"RFQ-2025-0053", rfqTitle:"Concrete Batching Plant – Ready Mix Supply",
    vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002",
    submittedDate:"2025-07-09", validUntil:"2025-08-09", totalAmt:2815000000,
    notes:"ELKON ELKOMatic 100 batching plant – 100 M³/hr. Concrete tested at independent KAN-accredited lab. 3-year track record supplying major civil contractors.",
    deliveryTerms:"Batching plant on-site by 20 Aug 2025; production starts within 5 days", paymentTerms:"Monthly billing, net 21 days; 2% discount if paid within 10 days",
    status:"Submitted",
    scores:{},
    files:["quotation.pdf","mix_design.pdf"],
    items:[
      {no:1,desc:"Ready Mix Concrete K-300",qty:12000,uom:"M³",unitPrice:945000,total:11340000000},
      {no:2,desc:"Ready Mix Concrete K-350",qty:9000,uom:"M³",unitPrice:1048000,total:9432000000},
      {no:3,desc:"Ready Mix Concrete K-400",qty:4000,uom:"M³",unitPrice:1148000,total:4592000000},
      {no:4,desc:"Mobile Batching Plant – On-site",qty:18,uom:"Month",unitPrice:24500000,total:441000000},
    ]},

  // ── Quotations for RFQs 0034–0050 (3 vendors each) ───────────────────────

  // RFQ-0034: Tank Fabrication & Civil Foundation
  { id:"QT-2025-0109", rfqId:"RFQ-2025-0034", rfqTitle:"Tank Fabrication & Civil Foundation Works", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-05-10", validUntil:"2025-06-10", totalAmt:3080000000, notes:"Pengalaman 15 tahun fabrikasi tangki storage. Baja SS304/316 tersertifikasi. Tim sipil berpengalaman pondasi bored pile.", deliveryTerms:"Selesai dalam 4 bulan setelah kontrak", paymentTerms:"30% down payment, progress billing bulanan", status:"Submitted", scores:{}, files:["quotation.pdf","tank_spec.pdf"], items:[{no:1,desc:"Tank Fabrication 500KL",qty:1,uom:"Lump Sum",unitPrice:2150000000,total:2150000000},{no:2,desc:"Civil Foundation Bored Pile",qty:1,uom:"Lump Sum",unitPrice:930000000,total:930000000}] },
  { id:"QT-2025-0110", rfqId:"RFQ-2025-0034", rfqTitle:"Tank Fabrication & Civil Foundation Works", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-05-11", validUntil:"2025-06-11", totalAmt:3250000000, notes:"Partner dengan pabrik baja domestik. Harga material lebih tinggi namun kualitas premium ASTM A516.", deliveryTerms:"Selesai dalam 5 bulan setelah kontrak", paymentTerms:"Monthly billing, net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Tank Fabrication 500KL",qty:1,uom:"Lump Sum",unitPrice:2350000000,total:2350000000},{no:2,desc:"Civil Foundation Bored Pile",qty:1,uom:"Lump Sum",unitPrice:900000000,total:900000000}] },
  { id:"QT-2025-0111", rfqId:"RFQ-2025-0034", rfqTitle:"Tank Fabrication & Civil Foundation Works", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-05-12", validUntil:"2025-06-12", totalAmt:2980000000, notes:"Penawaran kompetitif. Fabrikasi dilakukan di workshop sendiri di Cikarang. Jaminan thickness test 100%.", deliveryTerms:"Selesai dalam 3,5 bulan setelah kontrak", paymentTerms:"Net 45 days per termin", status:"Submitted", scores:{}, files:["quotation.pdf","workshop_cert.pdf"], items:[{no:1,desc:"Tank Fabrication 500KL",qty:1,uom:"Lump Sum",unitPrice:2100000000,total:2100000000},{no:2,desc:"Civil Foundation Bored Pile",qty:1,uom:"Lump Sum",unitPrice:880000000,total:880000000}] },

  // RFQ-0035: Network Penetration Test & Security Audit
  { id:"QT-2025-0112", rfqId:"RFQ-2025-0035", rfqTitle:"IT Security – Network Pentest & Security Audit", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-05-15", validUntil:"2025-06-15", totalAmt:370000000, notes:"Tim bersertifikat CEH, OSCP, dan CISSP. Pengalaman audit BSSN. Laporan terstruktur sesuai PTES.", deliveryTerms:"Mulai dalam 1 minggu setelah kontrak, selesai 6 minggu", paymentTerms:"50% DP, 50% setelah laporan final", status:"Submitted", scores:{}, files:["quotation.pdf","cert_list.pdf"], items:[{no:1,desc:"Network Penetration Test",qty:1,uom:"Engagement",unitPrice:270000000,total:270000000},{no:2,desc:"Security Audit & Compliance Review",qty:1,uom:"Engagement",unitPrice:100000000,total:100000000}] },
  { id:"QT-2025-0113", rfqId:"RFQ-2025-0035", rfqTitle:"IT Security – Network Pentest & Security Audit", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-05-16", validUntil:"2025-06-16", totalAmt:395000000, notes:"Metodologi OWASP dan NIST SP 800-115. Termasuk laporan eksekutif dan teknis. Remediation workshop included.", deliveryTerms:"Mulai dalam 2 minggu, selesai 8 minggu", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Network Penetration Test",qty:1,uom:"Engagement",unitPrice:290000000,total:290000000},{no:2,desc:"Security Audit & Compliance Review",qty:1,uom:"Engagement",unitPrice:105000000,total:105000000}] },
  { id:"QT-2025-0114", rfqId:"RFQ-2025-0035", rfqTitle:"IT Security – Network Pentest & Security Audit", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-05-17", validUntil:"2025-06-17", totalAmt:360000000, notes:"Penawaran terbaik dengan tim junior-senior mix. Deliverable: laporan PDF + presentasi board. Garansi re-test gratis.", deliveryTerms:"Mulai dalam 1 minggu, selesai 5 minggu", paymentTerms:"Monthly invoicing", status:"Submitted", scores:{}, files:["quotation.pdf","methodology.pdf"], items:[{no:1,desc:"Network Penetration Test",qty:1,uom:"Engagement",unitPrice:265000000,total:265000000},{no:2,desc:"Security Audit & Compliance Review",qty:1,uom:"Engagement",unitPrice:95000000,total:95000000}] },

  // RFQ-0036: MV & LV Cable Supply
  { id:"QT-2025-0115", rfqId:"RFQ-2025-0036", rfqTitle:"MV/LV Cable Supply – Mining Site Electrification", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-05-20", validUntil:"2025-06-20", totalAmt:758000000, notes:"Kabel Nexans / Prysmian tersertifikasi SNI. Pengiriman dari gudang Surabaya dalam 2 minggu. Test report per drum.", deliveryTerms:"Pengiriman bertahap mulai 3 minggu setelah PO", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf","cable_spec.pdf"], items:[{no:1,desc:"MV Cable 20kV XLPE 3x185",qty:5000,uom:"Meter",unitPrice:86000,total:430000000},{no:2,desc:"LV Cable 4x70mm²",qty:8000,uom:"Meter",unitPrice:41000,total:328000000}] },
  { id:"QT-2025-0116", rfqId:"RFQ-2025-0036", rfqTitle:"MV/LV Cable Supply – Mining Site Electrification", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-05-21", validUntil:"2025-06-21", totalAmt:790000000, notes:"Kabel Supreme/Eterna lokal premium. Stok ready di Jakarta. COA dan type test certificate tersedia.", deliveryTerms:"Ready stock, pengiriman dalam 1 minggu setelah PO", paymentTerms:"DP 30%, sisanya COD", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"MV Cable 20kV XLPE 3x185",qty:5000,uom:"Meter",unitPrice:90000,total:450000000},{no:2,desc:"LV Cable 4x70mm²",qty:8000,uom:"Meter",unitPrice:42500,total:340000000}] },
  { id:"QT-2025-0117", rfqId:"RFQ-2025-0036", rfqTitle:"MV/LV Cable Supply – Mining Site Electrification", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-05-22", validUntil:"2025-06-22", totalAmt:745000000, notes:"Import langsung dari pabrik Turkcell Kablo. Harga kompetitif karena volume. Lead time 4 minggu dari pelabuhan.", deliveryTerms:"Pengiriman 4 minggu setelah LC/TT", paymentTerms:"LC at sight atau TT 100% sebelum kirim", status:"Submitted", scores:{}, files:["quotation.pdf","import_doc.pdf"], items:[{no:1,desc:"MV Cable 20kV XLPE 3x185",qty:5000,uom:"Meter",unitPrice:84000,total:420000000},{no:2,desc:"LV Cable 4x70mm²",qty:8000,uom:"Meter",unitPrice:40625,total:325000000}] },

  // RFQ-0037: GPS Fleet Management System
  { id:"QT-2025-0118", rfqId:"RFQ-2025-0037", rfqTitle:"GPS Fleet Management System – Mining Fleet", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-05-25", validUntil:"2025-06-25", totalAmt:243000000, notes:"Platform Teltonika + Wialon. Real-time tracking, idle alert, geofencing. Sudah digunakan di 3 site tambang aktif.", deliveryTerms:"Instalasi selesai 3 minggu setelah PO", paymentTerms:"50% DP, 50% setelah go-live", status:"Submitted", scores:{}, files:["quotation.pdf","demo_video.pdf"], items:[{no:1,desc:"GPS Tracking Hardware",qty:120,uom:"Unit",unitPrice:1550000,total:186000000},{no:2,desc:"FMS Platform Subscription",qty:24,uom:"Month",unitPrice:2375000,total:57000000}] },
  { id:"QT-2025-0119", rfqId:"RFQ-2025-0037", rfqTitle:"GPS Fleet Management System – Mining Fleet", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-05-26", validUntil:"2025-06-26", totalAmt:255000000, notes:"Sistem Fleet Complete berbasis Samsara. Dashboard analitik advanced. API integration ke SAP PM tersedia.", deliveryTerms:"Instalasi selesai 4 minggu setelah PO", paymentTerms:"Net 30 days bulanan", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"GPS Tracking Hardware",qty:120,uom:"Unit",unitPrice:1625000,total:195000000},{no:2,desc:"FMS Platform Subscription",qty:24,uom:"Month",unitPrice:2500000,total:60000000}] },
  { id:"QT-2025-0120", rfqId:"RFQ-2025-0037", rfqTitle:"GPS Fleet Management System – Mining Fleet", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-05-27", validUntil:"2025-06-27", totalAmt:232000000, notes:"Hardware Concox lokal dengan platform in-house. Biaya langganan paling rendah. SLA uptime 99.5% dijamin.", deliveryTerms:"Instalasi selesai 2 minggu setelah PO", paymentTerms:"Tahunan, bayar di muka", status:"Submitted", scores:{}, files:["quotation.pdf","sla_doc.pdf"], items:[{no:1,desc:"GPS Tracking Hardware",qty:120,uom:"Unit",unitPrice:1450000,total:174000000},{no:2,desc:"FMS Platform Subscription",qty:24,uom:"Month",unitPrice:2416667,total:58000000}] },

  // RFQ-0038: Pontoon Barge Charter
  { id:"QT-2025-0121", rfqId:"RFQ-2025-0038", rfqTitle:"Pontoon Barge Charter – Material Transport", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-01", validUntil:"2025-07-01", totalAmt:864000000, notes:"Pontoon 300T kapasitas dengan crane 25T. Dokumen SIUPAL lengkap. Pengalaman 8 tahun angkutan sungai Kalimantan.", deliveryTerms:"Unit tersedia mulai 1 Juli 2025", paymentTerms:"Monthly charter, net 14 days", status:"Submitted", scores:{}, files:["quotation.pdf","vessel_cert.pdf"], items:[{no:1,desc:"Pontoon Barge Charter 300T + Crane",qty:12,uom:"Month",unitPrice:72000000,total:864000000}] },
  { id:"QT-2025-0122", rfqId:"RFQ-2025-0038", rfqTitle:"Pontoon Barge Charter – Material Transport", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-02", validUntil:"2025-07-02", totalAmt:900000000, notes:"Barge 280T dengan crew 6 orang. Asuransi P&I termasuk. Pengalaman muatan batu bara dan mineral.", deliveryTerms:"Unit tersedia mulai 15 Juli 2025", paymentTerms:"Monthly charter, net 21 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Pontoon Barge Charter 280T + Crane",qty:12,uom:"Month",unitPrice:75000000,total:900000000}] },
  { id:"QT-2025-0123", rfqId:"RFQ-2025-0038", rfqTitle:"Pontoon Barge Charter – Material Transport", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-03", validUntil:"2025-07-03", totalAmt:816000000, notes:"Pontoon 250T harga terbaik. Crane 20T onboard. Bisa mulai operasi bulan depan. Kontrak fleksibel.", deliveryTerms:"Unit tersedia dalam 2 minggu", paymentTerms:"Monthly charter, net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf","barge_photo.pdf"], items:[{no:1,desc:"Pontoon Barge Charter 250T + Crane",qty:12,uom:"Month",unitPrice:68000000,total:816000000}] },

  // RFQ-0039: Accounting & Tax Retainer
  { id:"QT-2025-0124", rfqId:"RFQ-2025-0039", rfqTitle:"Accounting & Tax Consulting Retainer", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-05", validUntil:"2025-07-05", totalAmt:372000000, notes:"KAP berafiliasi Big4. Tim pajak berpengalaman BUMN dan pertambangan. Termasuk audit support dan tax planning.", deliveryTerms:"Mulai bulan berikutnya setelah kontrak", paymentTerms:"Bulanan di muka, net 7 days", status:"Submitted", scores:{}, files:["quotation.pdf","firm_profile.pdf"], items:[{no:1,desc:"Accounting & Tax Retainer",qty:12,uom:"Month",unitPrice:31000000,total:372000000}] },
  { id:"QT-2025-0125", rfqId:"RFQ-2025-0039", rfqTitle:"Accounting & Tax Consulting Retainer", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-06", validUntil:"2025-07-06", totalAmt:396000000, notes:"Partner senior ex-DJP dan auditor BAPEPAM. Spesialisasi PPh 22 pertambangan dan PPN. SLA laporan bulanan.", deliveryTerms:"Mulai bulan berikutnya setelah kontrak", paymentTerms:"Bulanan, net 14 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Accounting & Tax Retainer",qty:12,uom:"Month",unitPrice:33000000,total:396000000}] },
  { id:"QT-2025-0126", rfqId:"RFQ-2025-0039", rfqTitle:"Accounting & Tax Consulting Retainer", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-07", validUntil:"2025-07-07", totalAmt:348000000, notes:"Konsultan pajak tersertifikasi Brevet C. Harga kompetitif. Termasuk e-filing pajak bulanan dan laporan keuangan.", deliveryTerms:"Mulai bulan berikutnya setelah kontrak", paymentTerms:"Bulanan di muka", status:"Submitted", scores:{}, files:["quotation.pdf","brevet_cert.pdf"], items:[{no:1,desc:"Accounting & Tax Retainer",qty:12,uom:"Month",unitPrice:29000000,total:348000000}] },

  // RFQ-0040: Reclamation – Topsoil & Tree Planting
  { id:"QT-2025-0127", rfqId:"RFQ-2025-0040", rfqTitle:"Mine Reclamation – Topsoil Spreading & Tree Planting", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-10", validUntil:"2025-07-10", totalAmt:1870000000, notes:"Tim reklamasi bersertifikat ESDM. Bibit pohon lokal endemik. Termasuk penyiraman dan pemeliharaan 12 bulan.", deliveryTerms:"Mobilisasi dalam 3 minggu, selesai 8 bulan", paymentTerms:"Monthly progress billing, net 21 days", status:"Submitted", scores:{}, files:["quotation.pdf","nursery_cert.pdf"], items:[{no:1,desc:"Topsoil Spreading",qty:500,uom:"Hektar",unitPrice:2500000,total:1250000000},{no:2,desc:"Tree Planting & Maintenance",qty:50000,uom:"Pohon",unitPrice:12400,total:620000000}] },
  { id:"QT-2025-0128", rfqId:"RFQ-2025-0040", rfqTitle:"Mine Reclamation – Topsoil Spreading & Tree Planting", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-11", validUntil:"2025-07-11", totalAmt:1950000000, notes:"Partner nursery di Kalimantan Timur. Bibit jenis sengon dan akasia. Pemeliharaan 18 bulan included.", deliveryTerms:"Mobilisasi dalam 4 minggu, selesai 10 bulan", paymentTerms:"Monthly billing, net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Topsoil Spreading",qty:500,uom:"Hektar",unitPrice:2600000,total:1300000000},{no:2,desc:"Tree Planting & Maintenance",qty:50000,uom:"Pohon",unitPrice:13000,total:650000000}] },
  { id:"QT-2025-0129", rfqId:"RFQ-2025-0040", rfqTitle:"Mine Reclamation – Topsoil Spreading & Tree Planting", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-12", validUntil:"2025-07-12", totalAmt:1790000000, notes:"Spesialis reklamasi ex-Adaro. Bibit pohon buah produktif. Success rate 85% survival rate. Harga paling efisien.", deliveryTerms:"Mobilisasi dalam 2 minggu, selesai 7 bulan", paymentTerms:"Per tahap sesuai progress", status:"Submitted", scores:{}, files:["quotation.pdf","track_record.pdf"], items:[{no:1,desc:"Topsoil Spreading",qty:500,uom:"Hektar",unitPrice:2350000,total:1175000000},{no:2,desc:"Tree Planting & Maintenance",qty:50000,uom:"Pohon",unitPrice:12300,total:615000000}] },

  // RFQ-0041: Conveyor Belt & Fasteners
  { id:"QT-2025-0130", rfqId:"RFQ-2025-0041", rfqTitle:"Conveyor Belt ST1200 & Belt Fastener Supply", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-15", validUntil:"2025-07-15", totalAmt:705000000, notes:"Belt Bridgestone ST1200 original. Fastener Flexco MR+ hot vulcanized. Termasuk jasa pasang dan balancing.", deliveryTerms:"Pengiriman dalam 3 minggu setelah PO", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf","belt_spec.pdf"], items:[{no:1,desc:"Conveyor Belt ST1200 800m",qty:800,uom:"Meter",unitPrice:780000,total:624000000},{no:2,desc:"Belt Fastener Flexco MR+",qty:30,uom:"Set",unitPrice:2700000,total:81000000}] },
  { id:"QT-2025-0131", rfqId:"RFQ-2025-0041", rfqTitle:"Conveyor Belt ST1200 & Belt Fastener Supply", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-16", validUntil:"2025-07-16", totalAmt:735000000, notes:"Belt Fenner Dunlop premium. Fastener Boltco with 2 year warranty. Instalasi oleh teknisi bersertifikat.", deliveryTerms:"Pengiriman dalam 4 minggu setelah PO", paymentTerms:"DP 40%, sisa setelah instalasi", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Conveyor Belt ST1200 800m",qty:800,uom:"Meter",unitPrice:810000,total:648000000},{no:2,desc:"Belt Fastener Boltco",qty:30,uom:"Set",unitPrice:2900000,total:87000000}] },
  { id:"QT-2025-0132", rfqId:"RFQ-2025-0041", rfqTitle:"Conveyor Belt ST1200 & Belt Fastener Supply", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-17", validUntil:"2025-07-17", totalAmt:678000000, notes:"Belt Phoenix import langsung. Harga terbaik tanpa jasa instalasi (by owner). Stok ready di Balikpapan.", deliveryTerms:"Pengiriman dalam 2 minggu setelah PO", paymentTerms:"Net 45 days", status:"Submitted", scores:{}, files:["quotation.pdf","stock_cert.pdf"], items:[{no:1,desc:"Conveyor Belt ST1200 800m",qty:800,uom:"Meter",unitPrice:750000,total:600000000},{no:2,desc:"Belt Fastener Phoenix",qty:30,uom:"Set",unitPrice:2600000,total:78000000}] },

  // RFQ-0042: SAP License & Basis Support
  { id:"QT-2025-0133", rfqId:"RFQ-2025-0042", rfqTitle:"SAP License Renewal & Basis Support", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-20", validUntil:"2025-07-20", totalAmt:1520000000, notes:"SAP Authorized Reseller. Harga lisensi sesuai SAP Price List 2025. Tim Basis bersertifikat SAP BC.", deliveryTerms:"Lisensi aktif dalam 5 hari kerja setelah kontrak", paymentTerms:"Lisensi: tahunan di muka; Support: bulanan net 14 days", status:"Submitted", scores:{}, files:["quotation.pdf","sap_cert.pdf"], items:[{no:1,desc:"SAP S/4HANA Annual Subscription",qty:1,uom:"Annual",unitPrice:1250000000,total:1250000000},{no:2,desc:"SAP Basis Support",qty:12,uom:"Month",unitPrice:22500000,total:270000000}] },
  { id:"QT-2025-0134", rfqId:"RFQ-2025-0042", rfqTitle:"SAP License Renewal & Basis Support", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-21", validUntil:"2025-07-21", totalAmt:1580000000, notes:"Partner SAP Gold. Termasuk 2 hari onsite support per bulan. SLA response time < 2 jam untuk critical.", deliveryTerms:"Lisensi aktif dalam 3 hari kerja setelah kontrak", paymentTerms:"Tahunan untuk lisensi, bulanan untuk support", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"SAP S/4HANA Annual Subscription",qty:1,uom:"Annual",unitPrice:1280000000,total:1280000000},{no:2,desc:"SAP Basis Support Premium",qty:12,uom:"Month",unitPrice:25000000,total:300000000}] },
  { id:"QT-2025-0135", rfqId:"RFQ-2025-0042", rfqTitle:"SAP License Renewal & Basis Support", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-22", validUntil:"2025-07-22", totalAmt:1460000000, notes:"Harga terbaik untuk paket bundling. Tim Basis remote 24/7. Tidak termasuk onsite. Cocok untuk operasi stabil.", deliveryTerms:"Lisensi aktif dalam 7 hari kerja", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf","team_cv.pdf"], items:[{no:1,desc:"SAP S/4HANA Annual Subscription",qty:1,uom:"Annual",unitPrice:1200000000,total:1200000000},{no:2,desc:"SAP Basis Support",qty:12,uom:"Month",unitPrice:21667000,total:260000000}] },

  // RFQ-0043: FIBC Bulk Bag
  { id:"QT-2025-0136", rfqId:"RFQ-2025-0043", rfqTitle:"FIBC Bulk Bag Supply – Mineral Packaging", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-25", validUntil:"2025-07-25", totalAmt:335000000, notes:"FIBC PP woven SWL 1000kg. CE certified. MOQ 5000 pcs. Pengiriman dari gudang Semarang dalam 2 minggu.", deliveryTerms:"Pengiriman bertahap, 5000 pcs per gelombang", paymentTerms:"DP 30%, sisanya NET 30", status:"Submitted", scores:{}, files:["quotation.pdf","fibc_spec.pdf"], items:[{no:1,desc:"FIBC Bulk Bag 1000kg SWL",qty:20000,uom:"Pcs",unitPrice:16750,total:335000000}] },
  { id:"QT-2025-0137", rfqId:"RFQ-2025-0043", rfqTitle:"FIBC Bulk Bag Supply – Mineral Packaging", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-26", validUntil:"2025-07-26", totalAmt:350000000, notes:"Import dari India (Emmbi / RKW). Food grade liner tersedia. Kualitas premium, harga sedikit lebih tinggi.", deliveryTerms:"Lead time 4 minggu dari India", paymentTerms:"LC 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"FIBC Bulk Bag 1000kg SWL Premium",qty:20000,uom:"Pcs",unitPrice:17500,total:350000000}] },
  { id:"QT-2025-0138", rfqId:"RFQ-2025-0043", rfqTitle:"FIBC Bulk Bag Supply – Mineral Packaging", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-27", validUntil:"2025-07-27", totalAmt:318000000, notes:"Produksi lokal pabrik sendiri di Tangerang. Harga terendah. Kapasitas produksi 10.000 pcs/minggu. QC in-house.", deliveryTerms:"Produksi dan kirim dalam 3 minggu", paymentTerms:"Net 21 days", status:"Submitted", scores:{}, files:["quotation.pdf","factory_cert.pdf"], items:[{no:1,desc:"FIBC Bulk Bag 1000kg SWL",qty:20000,uom:"Pcs",unitPrice:15900,total:318000000}] },

  // RFQ-0044: Office Supplies
  { id:"QT-2025-0139", rfqId:"RFQ-2025-0044", rfqTitle:"Office Supplies – Paper, Toner & Stationery", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-01", validUntil:"2025-08-01", totalAmt:77500000, notes:"Distributor resmi APP Sinarmas (Paperone). Toner kompatibel HP/Canon. Pengiriman door-to-door.", deliveryTerms:"Pengiriman dalam 3 hari kerja setelah PO", paymentTerms:"Net 14 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"A4 Paper 80gsm Paperone",qty:2000,uom:"Rim",unitPrice:58000,total:116000000},{no:2,desc:"Toner Cartridge HP Compatible",qty:150,uom:"Pcs",unitPrice:355000,total:53250000},{no:3,desc:"Whiteboard Marker",qty:100,uom:"Box",unitPrice:82000,total:8200000}] },
  { id:"QT-2025-0140", rfqId:"RFQ-2025-0044", rfqTitle:"Office Supplies – Paper, Toner & Stationery", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-02", validUntil:"2025-08-02", totalAmt:81000000, notes:"Grosir ATK terpercaya 10 tahun. Stok ready semua item. Bisa antar ke 5 lokasi berbeda sekaligus.", deliveryTerms:"Pengiriman dalam 2 hari kerja", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"A4 Paper 80gsm IK",qty:2000,uom:"Rim",unitPrice:60000,total:120000000},{no:2,desc:"Toner Cartridge Original",qty:150,uom:"Pcs",unitPrice:358000,total:53700000},{no:3,desc:"Whiteboard Marker",qty:100,uom:"Box",unitPrice:86000,total:8600000}] },
  { id:"QT-2025-0141", rfqId:"RFQ-2025-0044", rfqTitle:"Office Supplies – Paper, Toner & Stationery", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-03", validUntil:"2025-08-03", totalAmt:73500000, notes:"Harga paling rendah dengan kualitas standar. Bisa order online via portal B2B. Free ongkir untuk pembelian > 5jt.", deliveryTerms:"Pengiriman dalam 1 hari kerja (area Jabodetabek)", paymentTerms:"Cash on delivery", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"A4 Paper 80gsm Sidu",qty:2000,uom:"Rim",unitPrice:54000,total:108000000},{no:2,desc:"Toner Cartridge Compatible",qty:150,uom:"Pcs",unitPrice:342000,total:51300000},{no:3,desc:"Whiteboard Marker",qty:100,uom:"Box",unitPrice:80000,total:8000000}] },

  // RFQ-0045: Pump Overhaul & Wear Parts
  { id:"QT-2025-0142", rfqId:"RFQ-2025-0045", rfqTitle:"Pump Overhaul & Wear Parts Supply", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-05", validUntil:"2025-08-05", totalAmt:565000000, notes:"Mekanik bersertifikat Warman/Metso. Overhaul termasuk re-lining, balancing, dan pressure test. Wear parts OEM.", deliveryTerms:"Overhaul selesai 2 minggu per unit, wear parts ready stock", paymentTerms:"Per unit completion, net 14 days", status:"Submitted", scores:{}, files:["quotation.pdf","cert_warman.pdf"], items:[{no:1,desc:"Pump Overhaul Warman 6x4",qty:8,uom:"Unit",unitPrice:57000000,total:456000000},{no:2,desc:"Wear Parts (Impeller+Liner Set)",qty:8,uom:"Set",unitPrice:13625000,total:109000000}] },
  { id:"QT-2025-0143", rfqId:"RFQ-2025-0045", rfqTitle:"Pump Overhaul & Wear Parts Supply", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-06", validUntil:"2025-08-06", totalAmt:590000000, notes:"Workshop pump overhaul di Samarinda. Tim 4 mekanik. Termasuk test run sebelum return ke site. Garansi 3 bulan.", deliveryTerms:"Turn-around time 3 minggu per unit", paymentTerms:"Net 30 days per batch", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Pump Overhaul Warman 6x4",qty:8,uom:"Unit",unitPrice:59000000,total:472000000},{no:2,desc:"Wear Parts (Impeller+Liner Set)",qty:8,uom:"Set",unitPrice:14750000,total:118000000}] },
  { id:"QT-2025-0144", rfqId:"RFQ-2025-0045", rfqTitle:"Pump Overhaul & Wear Parts Supply", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-07", validUntil:"2025-08-07", totalAmt:540000000, notes:"Wear parts aftermarket berkualitas dengan harga 15% lebih hemat. Overhaul by onsite team. Tidak ada transport cost.", deliveryTerms:"Overhaul onsite, selesai 3 minggu total untuk 8 unit", paymentTerms:"Net 45 days", status:"Submitted", scores:{}, files:["quotation.pdf","parts_catalog.pdf"], items:[{no:1,desc:"Pump Overhaul Warman 6x4",qty:8,uom:"Unit",unitPrice:54500000,total:436000000},{no:2,desc:"Wear Parts Aftermarket (Impeller+Liner)",qty:8,uom:"Set",unitPrice:13000000,total:104000000}] },

  // RFQ-0046: Uniform & Coverall
  { id:"QT-2025-0145", rfqId:"RFQ-2025-0046", rfqTitle:"Office Uniform & Coverall Supply", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:183000000, notes:"Konveksi sendiri di Bandung. Bahan TC 65/35 untuk office, Nomex FR untuk coverall. Sablon/bordir logo included.", deliveryTerms:"Produksi dan kirim dalam 4 minggu setelah ukuran disubmit", paymentTerms:"DP 50%, lunas saat terima barang", status:"Submitted", scores:{}, files:["quotation.pdf","fabric_spec.pdf"], items:[{no:1,desc:"Office Uniform Kemeja+Celana",qty:600,uom:"Set",unitPrice:185000,total:111000000},{no:2,desc:"Coverall FR Nomex",qty:400,uom:"Pcs",unitPrice:180000,total:72000000}] },
  { id:"QT-2025-0146", rfqId:"RFQ-2025-0046", rfqTitle:"Office Uniform & Coverall Supply", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:195000000, notes:"Partner pabrik tekstil Kahatex. Kualitas ekspor. Bisa 10 warna pilihan. Bordir komputer presisi tinggi.", deliveryTerms:"Produksi dan kirim dalam 5 minggu", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Office Uniform Kemeja+Celana",qty:600,uom:"Set",unitPrice:198000,total:118800000},{no:2,desc:"Coverall FR Nomex",qty:400,uom:"Pcs",unitPrice:190500,total:76200000}] },
  { id:"QT-2025-0147", rfqId:"RFQ-2025-0046", rfqTitle:"Office Uniform & Coverall Supply", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:171000000, notes:"Harga termurah. Bahan TC lokal. Coverall standar SNI K3. Logo sablon (bukan bordir). Pilihan warna terbatas.", deliveryTerms:"Produksi dan kirim dalam 3 minggu", paymentTerms:"Cash before delivery", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Office Uniform Kemeja+Celana",qty:600,uom:"Set",unitPrice:170000,total:102000000},{no:2,desc:"Coverall SNI K3",qty:400,uom:"Pcs",unitPrice:172500,total:69000000}] },

  // RFQ-0047: CCTV & Access Control
  { id:"QT-2025-0148", rfqId:"RFQ-2025-0047", rfqTitle:"CCTV, NVR & Access Control System", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-15", validUntil:"2025-08-15", totalAmt:435000000, notes:"Integrasi Hikvision + Suprema. Termasuk instalasi kabel, konfigurasi VLAN, dan training operator 2 hari.", deliveryTerms:"Instalasi selesai dalam 4 minggu setelah PO", paymentTerms:"DP 30%, progress 40%, 30% setelah uji terima", status:"Submitted", scores:{}, files:["quotation.pdf","hikvision_cert.pdf"], items:[{no:1,desc:"IP Camera 4MP Hikvision",qty:80,uom:"Unit",unitPrice:2600000,total:208000000},{no:2,desc:"NVR 64CH Hikvision",qty:4,uom:"Unit",unitPrice:46250000,total:185000000},{no:3,desc:"Access Control System Suprema",qty:1,uom:"Lump Sum",unitPrice:82000000,total:82000000}] },
  { id:"QT-2025-0149", rfqId:"RFQ-2025-0047", rfqTitle:"CCTV, NVR & Access Control System", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-16", validUntil:"2025-08-16", totalAmt:455000000, notes:"Sistem Dahua + ZKTeco terintegrasi. Fitur AI analytics (face recognition, perimeter intrusion detection). 3 tahun garansi.", deliveryTerms:"Instalasi selesai dalam 5 minggu setelah PO", paymentTerms:"Net 45 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"IP Camera 4MP Dahua AI",qty:80,uom:"Unit",unitPrice:2700000,total:216000000},{no:2,desc:"NVR 64CH Dahua",qty:4,uom:"Unit",unitPrice:47500000,total:190000000},{no:3,desc:"Access Control ZKTeco",qty:1,uom:"Lump Sum",unitPrice:84500000,total:84500000}] },
  { id:"QT-2025-0150", rfqId:"RFQ-2025-0047", rfqTitle:"CCTV, NVR & Access Control System", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-17", validUntil:"2025-08-17", totalAmt:410000000, notes:"Harga kompetitif. Brand Hikvision. Tanpa AI analytics. Instalasi oleh mitra teknisi terlatih. Garansi 1 tahun.", deliveryTerms:"Instalasi selesai dalam 3 minggu setelah PO", paymentTerms:"50% DP, 50% setelah selesai", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"IP Camera 4MP Hikvision",qty:80,uom:"Unit",unitPrice:2450000,total:196000000},{no:2,desc:"NVR 64CH Hikvision",qty:4,uom:"Unit",unitPrice:43750000,total:175000000},{no:3,desc:"Access Control Basic",qty:1,uom:"Lump Sum",unitPrice:78000000,total:78000000}] },

  // RFQ-0048: Solar Power Plant EPC
  { id:"QT-2025-0151", rfqId:"RFQ-2025-0048", rfqTitle:"Solar Power Plant EPC – PLTS Atap 500kWp", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-20", validUntil:"2025-08-20", totalAmt:1125000000, notes:"EPC solar berpengalaman 12 proyek. Panel LONGi LR5-72HBD 550Wp. Inverter SMA Sunny Tripower. Garansi sistem 10 tahun.", deliveryTerms:"Commissioning dalam 3 bulan setelah kontrak", paymentTerms:"20% DP, milestone-based billing", status:"Submitted", scores:{}, files:["quotation.pdf","longi_cert.pdf","sma_cert.pdf"], items:[{no:1,desc:"Solar Panel LONGi 550Wp",qty:910,uom:"Unit",unitPrice:870000,total:791700000},{no:2,desc:"Inverter SMA 100kW",qty:5,uom:"Unit",unitPrice:76000000,total:380000000},{no:3,desc:"EPC Installation",qty:1,uom:"Lump Sum",unitPrice:328000000,total:328000000}] },
  { id:"QT-2025-0152", rfqId:"RFQ-2025-0048", rfqTitle:"Solar Power Plant EPC – PLTS Atap 500kWp", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-21", validUntil:"2025-08-21", totalAmt:1185000000, notes:"Panel JA Solar 545Wp + Inverter Growatt. Termasuk monitoring SCADA real-time. Jaminan produksi P90.", deliveryTerms:"Commissioning dalam 4 bulan setelah kontrak", paymentTerms:"Net 30 days per termin", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Solar Panel JA Solar 545Wp",qty:910,uom:"Unit",unitPrice:900000,total:819000000},{no:2,desc:"Inverter Growatt 100kW",qty:5,uom:"Unit",unitPrice:79000000,total:395000000},{no:3,desc:"EPC Installation + SCADA",qty:1,uom:"Lump Sum",unitPrice:345000000,total:345000000}] },
  { id:"QT-2025-0153", rfqId:"RFQ-2025-0048", rfqTitle:"Solar Power Plant EPC – PLTS Atap 500kWp", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-22", validUntil:"2025-08-22", totalAmt:1075000000, notes:"Harga EPC terbaik. Panel Risen Energy. Inverter Huawei SUN2000. Tidak termasuk monitoring premium. Garansi 5 tahun.", deliveryTerms:"Commissioning dalam 2,5 bulan setelah kontrak", paymentTerms:"30% DP, sisanya termin", status:"Submitted", scores:{}, files:["quotation.pdf","epc_portfolio.pdf"], items:[{no:1,desc:"Solar Panel Risen Energy 540Wp",qty:910,uom:"Unit",unitPrice:840000,total:764400000},{no:2,desc:"Inverter Huawei SUN2000 100kW",qty:5,uom:"Unit",unitPrice:72000000,total:360000000},{no:3,desc:"EPC Installation",qty:1,uom:"Lump Sum",unitPrice:310000000,total:310000000}] },

  // RFQ-0049: Drill Bits & Rods
  { id:"QT-2025-0154", rfqId:"RFQ-2025-0049", rfqTitle:"Drill Bits & Drill Rods – Core Drilling Consumables", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-25", validUntil:"2025-08-25", totalAmt:497500000, notes:"Distributor resmi Boart Longyear. Bit impregnated diamond premium. Rod flush joint high-strength. Tersedia ready stock.", deliveryTerms:"Pengiriman dalam 1 minggu dari Jakarta", paymentTerms:"Net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf","boart_catalog.pdf"], items:[{no:1,desc:"Diamond Bit NQ Impregnated",qty:500,uom:"Pcs",unitPrice:560000,total:280000000},{no:2,desc:"Diamond Bit HQ Impregnated",qty:300,uom:"Pcs",unitPrice:760000,total:228000000},{no:3,desc:"Drill Rod NQ Flush Joint",qty:200,uom:"Pcs",unitPrice:1150000,total:230000000}] },
  { id:"QT-2025-0155", rfqId:"RFQ-2025-0049", rfqTitle:"Drill Bits & Drill Rods – Core Drilling Consumables", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-26", validUntil:"2025-08-26", totalAmt:520000000, notes:"Brand Atlas Copco original. Umur pakai lebih panjang 20% vs standard. Performa di formasi keras sangat baik.", deliveryTerms:"Pengiriman dalam 2 minggu", paymentTerms:"DP 30%, NET 30 sisanya", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Diamond Bit NQ Atlas Copco",qty:500,uom:"Pcs",unitPrice:575000,total:287500000},{no:2,desc:"Diamond Bit HQ Atlas Copco",qty:300,uom:"Pcs",unitPrice:780000,total:234000000},{no:3,desc:"Drill Rod NQ Atlas Copco",qty:200,uom:"Pcs",unitPrice:1250000,total:250000000}] },
  { id:"QT-2025-0156", rfqId:"RFQ-2025-0049", rfqTitle:"Drill Bits & Drill Rods – Core Drilling Consumables", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-27", validUntil:"2025-08-27", totalAmt:472000000, notes:"Bit dan rod aftermarket Kimdrill dari Korea. Harga 10% di bawah OEM. Cocok untuk formasi sedang. Stok terbatas.", deliveryTerms:"Pengiriman dalam 3 minggu (impor)", paymentTerms:"LC at sight", status:"Submitted", scores:{}, files:["quotation.pdf","kimdrill_spec.pdf"], items:[{no:1,desc:"Diamond Bit NQ Kimdrill",qty:500,uom:"Pcs",unitPrice:540000,total:270000000},{no:2,desc:"Diamond Bit HQ Kimdrill",qty:300,uom:"Pcs",unitPrice:740000,total:222000000},{no:3,desc:"Drill Rod NQ Kimdrill",qty:200,uom:"Pcs",unitPrice:1200000,total:240000000}] },

  // RFQ-0050: Air Compressor Rental
  { id:"QT-2025-0157", rfqId:"RFQ-2025-0050", rfqTitle:"Air Compressor Rental – Mining Operations", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-28", validUntil:"2025-08-28", totalAmt:222000000, notes:"Compressor Atlas Copco XAHS 365 diesel. Termasuk operator dan consumables. Kapasitas 365 cfm @ 12 bar.", deliveryTerms:"Unit tersedia dalam 1 minggu", paymentTerms:"Monthly rental, net 14 days", status:"Submitted", scores:{}, files:["quotation.pdf","unit_photo.pdf"], items:[{no:1,desc:"Air Compressor Atlas Copco XAHS 365",qty:12,uom:"Month",unitPrice:18500000,total:222000000}] },
  { id:"QT-2025-0158", rfqId:"RFQ-2025-0050", rfqTitle:"Air Compressor Rental – Mining Operations", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-29", validUntil:"2025-08-29", totalAmt:234000000, notes:"Compressor Doosan 375 cfm. Termasuk maintenance bulanan dan operator shift. Backup unit tersedia jika breakdown.", deliveryTerms:"Unit tersedia dalam 2 minggu", paymentTerms:"Monthly rental, net 21 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Air Compressor Doosan 375 cfm",qty:12,uom:"Month",unitPrice:19500000,total:234000000}] },
  { id:"QT-2025-0159", rfqId:"RFQ-2025-0050", rfqTitle:"Air Compressor Rental – Mining Operations", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-30", validUntil:"2025-08-30", totalAmt:210000000, notes:"Harga sewa terbaik. Compressor Chicago Pneumatic 350 cfm. Tanpa operator (by owner). Maintenance setiap 250 jam.", deliveryTerms:"Unit tersedia dalam 3 hari", paymentTerms:"Monthly rental, net 30 days", status:"Submitted", scores:{}, files:["quotation.pdf"], items:[{no:1,desc:"Air Compressor Chicago Pneumatic 350 cfm",qty:12,uom:"Month",unitPrice:17500000,total:210000000}] },
];

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
  Open:        {c:C.err,  bg:C.errBg},
  "On Process":{c:C.warn, bg:C.warnBg},
  Complete:           {c:"#0a6ed1", bg:"#dbeeff"},
  "Pending Approval": {c:"#6f2da8", bg:"#f3eeff"},
  Closed:             {c:"#6a6d70", bg:"#f4f4f4"},
  Accepted:    {c:C.ok,   bg:C.okBg},
  Withdrawn:   {c:C.draft,bg:C.draftBg},
  Win:         {c:"#188918", bg:"#eaf7ea"},
  Completed:   {c:"#6a6d70", bg:"#f4f4f4"},
  Approved:    {c:"#6f2da8", bg:"#f3eeff"},
  Active:      {c:C.ok,   bg:C.okBg},
  "Posted":              {c:C.ok,    bg:C.okBg},
  "Converted to Invoice":{c:C.info,  bg:C.infoBg},
  "Cleared":             {c:C.draft, bg:C.draftBg},
  "Supplier DPR":        {c:C.gold,  bg:C.warnBg},
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
        {value.length===0&&<span style={{color:"#bfbfbf",fontSize:14,padding:"2px 2px"}}>All Types</span>}
        {value.map(k=>{
          const opt=INV_TYPE_OPTS.find(o=>o.key===k);
          return(
            <span key={k} style={{display:"inline-flex",alignItems:"center",height:22,background:"#e8f1fb",border:"1px solid #91b9e3",borderRadius:2,padding:"0 0 0 8px",fontSize:12,color:C.t1,lineHeight:1}}>
              {opt?.text||k}
              <button onClick={e=>remove(k,e)} style={{background:"none",border:"none",cursor:"pointer",color:"#6a6d70",fontSize:15,padding:"0 5px",lineHeight:1,display:"flex",alignItems:"center"}}>{"×"}</button>
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
    {selected.length===0&&<span style={{color:"#bfbfbf",fontSize:12,padding:"1px 2px"}}>{placeholder}</span>}
    {selected.map(k=>(
      <span key={k} style={{display:"inline-flex",alignItems:"center",background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 7px",fontSize:11,color:C.info,whiteSpace:"nowrap"}}>{getLabel(k)}</span>
    ))}
    <button onClick={e=>{e.stopPropagation();onOpen();}} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}>
      <SapIcon name="value-help" size={14} color="#6a6d70"/>
    </button>
  </div>
);

