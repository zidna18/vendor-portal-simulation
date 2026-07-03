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
  // ── CREATED (8) ── Not yet published
  { id:"RFQ-2025-0041", title:"Conveyor Belt Replacement – Plant A",        postedDate:"2025-08-15", closingDate:"2025-09-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Plant & Equipment",  estVal:320000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG01", desc:"Replacement of 12 conveyor belt units at Plant A due to wear and corrosion.", status:"Created",
    items:[{no:1,desc:"Conveyor Belt 1200mm Width",type:"Material",acctAssign:"K – Cost Center",materialNo:"PLT-CVB-001",materialGroup:"Plant Equipment",plant:"PL01",qty:12,uom:"Unit",estPrice:22000000,requirementDate:"2025-10-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0042", title:"Cloud ERP Subscription – Annual License",    postedDate:"2025-08-16", closingDate:"2025-09-16", postedBy:"Siti Rahma",   targets:["10000001","10000002"],            cat:"IT Services",        estVal:480000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG02", desc:"Annual subscription for cloud ERP platform covering all BRM Group subsidiaries.", status:"Created",
    items:[{no:1,desc:"ERP Cloud License (per entity)",type:"Service",acctAssign:"K – Cost Center",materialNo:"IT-ERP-001",materialGroup:"IT Services",plant:"PL02",qty:5,uom:"Entity/Year",estPrice:96000000,requirementDate:"",startDate:"2026-01-01",endDate:"2026-12-31"}]},
  { id:"RFQ-2025-0043", title:"Bulk Bag (FIBC) Supply – Mining Operations",  postedDate:"2025-08-17", closingDate:"2025-09-17", postedBy:"Ahmad Rizki",  targets:["10000001","10000003"],            cat:"Goods",              estVal:156000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG03", desc:"Supply of 1-tonne FIBC bulk bags for ore concentrate packaging and transport.", status:"Created",
    items:[{no:1,desc:"FIBC Bulk Bag 1-Tonne",type:"Material",acctAssign:"P – Project",materialNo:"MIN-FBC-001",materialGroup:"Mining Materials",plant:"PL04",qty:3000,uom:"Pcs",estPrice:52000,requirementDate:"2025-11-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0044", title:"Stationery & Office Consumables – Annual",    postedDate:"2025-08-18", closingDate:"2025-09-18", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Office Supplies",    estVal:85000000,   companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", purchGroup:"PG01", desc:"Annual supply of stationery, printer consumables, and general office supplies.", status:"Created",
    items:[{no:1,desc:"A4 Paper 80gsm",type:"Material",acctAssign:"K – Cost Center",materialNo:"OFF-PPR-001",materialGroup:"Office Supplies",plant:"PL03",qty:500,uom:"Ream",estPrice:50000,requirementDate:"2025-10-01",startDate:"",endDate:""},{no:2,desc:"Toner Cartridge (Various)",type:"Material",acctAssign:"K – Cost Center",materialNo:"OFF-TNR-002",materialGroup:"Office Supplies",plant:"PL03",qty:100,uom:"Pcs",estPrice:450000,requirementDate:"2025-10-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0045", title:"Pump Overhaul – Slurry Pump Service",         postedDate:"2025-08-19", closingDate:"2025-09-19", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"Services",           estVal:275000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", purchGroup:"PG04", desc:"Overhaul and reconditioning of 8 slurry pumps at Linge Minerals processing plant.", status:"Created",
    items:[{no:1,desc:"Slurry Pump Overhaul (per unit)",type:"Service",acctAssign:"P – Project",materialNo:"SVC-PMP-001",materialGroup:"Maintenance Services",plant:"PL05",qty:8,uom:"Unit",estPrice:30000000,requirementDate:"",startDate:"2025-11-01",endDate:"2025-12-31"}]},
  { id:"RFQ-2025-0046", title:"Uniform & Workwear – Annual Supply",          postedDate:"2025-08-20", closingDate:"2025-09-20", postedBy:"Siti Rahma",   targets:["10000001","10000002"],            cat:"Goods",              estVal:120000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG01", desc:"Annual supply of corporate uniforms and operational workwear for all staff.", status:"Created",
    items:[{no:1,desc:"Corporate Uniform Set",type:"Material",acctAssign:"K – Cost Center",materialNo:"UNI-COR-001",materialGroup:"Apparel",plant:"PL01",qty:500,uom:"Set",estPrice:180000,requirementDate:"2025-11-01",startDate:"",endDate:""},{no:2,desc:"Operational Workwear Set",type:"Material",acctAssign:"K – Cost Center",materialNo:"UNI-OPS-002",materialGroup:"Apparel",plant:"PL01",qty:300,uom:"Set",estPrice:120000,requirementDate:"2025-11-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0047", title:"CCTV & Access Control – HO Expansion",        postedDate:"2025-08-21", closingDate:"2025-09-21", postedBy:"Ahmad Rizki",  targets:["10000002","10000003"],            cat:"IT Equipment",       estVal:380000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG02", desc:"Supply and installation of CCTV cameras and access control systems for new HO wing.", status:"Created",
    items:[{no:1,desc:"IP Camera 4MP Outdoor",type:"Material",acctAssign:"K – Cost Center",materialNo:"SEC-CAM-001",materialGroup:"Security Systems",plant:"PL02",qty:40,uom:"Unit",estPrice:3500000,requirementDate:"2025-11-15",startDate:"",endDate:""},{no:2,desc:"Access Control System (door)",type:"Material",acctAssign:"K – Cost Center",materialNo:"SEC-ACS-002",materialGroup:"Security Systems",plant:"PL02",qty:20,uom:"Unit",estPrice:12000000,requirementDate:"2025-11-15",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0048", title:"Photovoltaic Solar Panel – Camp Power",        postedDate:"2025-08-22", closingDate:"2025-09-22", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Energy Equipment",   estVal:650000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG03", desc:"Supply and installation of 500kWp solar PV system for mining camp self-sufficiency.", status:"Created",
    items:[{no:1,desc:"Solar Panel 550Wp Monocrystalline",type:"Material",acctAssign:"P – Project",materialNo:"ENR-SOL-001",materialGroup:"Energy Equipment",plant:"PL04",qty:910,uom:"Unit",estPrice:350000,requirementDate:"",startDate:"2026-02-01",endDate:"2026-04-30"},{no:2,desc:"Inverter 50kW",type:"Material",acctAssign:"P – Project",materialNo:"ENR-INV-002",materialGroup:"Energy Equipment",plant:"PL04",qty:10,uom:"Unit",estPrice:32000000,requirementDate:"",startDate:"2026-02-01",endDate:"2026-04-30"}]},

  // ── OPEN (8) ── Published, collecting & evaluating quotations
  { id:"RFQ-2025-0001", title:"Procurement of Laptops & Workstations",       postedDate:"2025-06-01", closingDate:"2025-07-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"IT Equipment",       estVal:500000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG02", desc:"BRM requires 50 laptops and 20 workstations for office expansion across all subsidiaries.", status:"Open", publishedAt:"2025-06-01", invitationNo:"BRM-INV-20250601-01",
    items:[{no:1,desc:"Laptop 14\" Core i7",type:"Material",acctAssign:"K – Cost Center",materialNo:"IT-LPT-001",materialGroup:"IT Hardware",plant:"PL01",qty:50,uom:"Unit",estPrice:8000000,requirementDate:"2025-08-01",startDate:"",endDate:""},{no:2,desc:"Workstation Dell XPS",type:"Material",acctAssign:"K – Cost Center",materialNo:"IT-WKS-002",materialGroup:"IT Hardware",plant:"PL01",qty:20,uom:"Unit",estPrice:12500000,requirementDate:"2025-08-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0005", title:"Explosive Materials – Blasting Supplies",     postedDate:"2025-06-20", closingDate:"2025-07-20", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",              estVal:875000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG03", desc:"Supply of ANFO, detonators, and blasting accessories for open-pit mining operations.", status:"Open", publishedAt:"2025-06-20", invitationNo:"BRM-INV-20250620-01",
    items:[{no:1,desc:"ANFO Bulk Explosive",type:"Material",acctAssign:"P – Project",materialNo:"MIN-EXP-001",materialGroup:"Mining Materials",plant:"PL02",qty:50000,uom:"KG",estPrice:8500,requirementDate:"2025-09-01",startDate:"",endDate:""},{no:2,desc:"Electric Detonator",type:"Material",acctAssign:"P – Project",materialNo:"MIN-DET-002",materialGroup:"Mining Materials",plant:"PL02",qty:2000,uom:"Pcs",estPrice:35000,requirementDate:"2025-09-01",startDate:"",endDate:""},{no:3,desc:"Safety Fuse (100m/roll)",type:"Material",acctAssign:"P – Project",materialNo:"MIN-FUS-003",materialGroup:"Mining Materials",plant:"PL02",qty:500,uom:"Roll",estPrice:125000,requirementDate:"2025-09-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0007", title:"Personal Protective Equipment (PPE)",          postedDate:"2025-06-25", closingDate:"2025-07-25", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",              estVal:120000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG01", desc:"Annual PPE procurement for all subsidiaries: helmets, boots, vests, gloves, and goggles.", status:"Open", publishedAt:"2025-06-25", invitationNo:"BRM-INV-20250625-01",
    items:[{no:1,desc:"Safety Helmet (SNI certified)",type:"Material",acctAssign:"K – Cost Center",materialNo:"PPE-HLM-001",materialGroup:"Safety Equipment",plant:"PL01",qty:500,uom:"Pcs",estPrice:75000,requirementDate:"2025-08-20",startDate:"",endDate:""},{no:2,desc:"Safety Boot (Steel Toe)",type:"Material",acctAssign:"K – Cost Center",materialNo:"PPE-BOT-002",materialGroup:"Safety Equipment",plant:"PL01",qty:300,uom:"Pair",estPrice:350000,requirementDate:"2025-08-20",startDate:"",endDate:""},{no:3,desc:"High-Visibility Safety Vest",type:"Material",acctAssign:"K – Cost Center",materialNo:"PPE-VST-003",materialGroup:"Safety Equipment",plant:"PL01",qty:600,uom:"Pcs",estPrice:85000,requirementDate:"2025-08-20",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0009", title:"Water Treatment Chemicals – Mining Site",      postedDate:"2025-06-28", closingDate:"2025-07-28", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Goods",              estVal:195000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG03", desc:"Supply of coagulants, flocculants, and pH adjustment chemicals for wastewater treatment.", status:"Open", publishedAt:"2025-06-28", invitationNo:"BRM-INV-20250628-01",
    items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",type:"Material",acctAssign:"K – Cost Center",materialNo:"CHM-PAC-001",materialGroup:"Chemicals",plant:"PL02",qty:500,uom:"Bag",estPrice:180000,requirementDate:"2025-09-01",startDate:"",endDate:""},{no:2,desc:"Anionic Flocculant (20 kg/bag)",type:"Material",acctAssign:"K – Cost Center",materialNo:"CHM-FLC-002",materialGroup:"Chemicals",plant:"PL02",qty:300,uom:"Bag",estPrice:250000,requirementDate:"2025-09-01",startDate:"",endDate:""},{no:3,desc:"Caustic Soda NaOH 50kg/drum",type:"Material",acctAssign:"K – Cost Center",materialNo:"CHM-CSH-003",materialGroup:"Chemicals",plant:"PL02",qty:150,uom:"Drum",estPrice:200000,requirementDate:"2025-09-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0010", title:"Medical & First Aid Supplies – All Sites",     postedDate:"2025-07-01", closingDate:"2025-08-01", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Medical Supplies",   estVal:92000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG01", desc:"Annual medical and first aid supplies for all BRM Group sites and offices.", status:"Open", publishedAt:"2025-07-01", invitationNo:"BRM-INV-20250701-01",
    items:[{no:1,desc:"First Aid Kit (50-person)",type:"Material",acctAssign:"K – Cost Center",materialNo:"MED-FAK-001",materialGroup:"Medical Supplies",plant:"PL01",qty:25,uom:"Set",estPrice:1200000,requirementDate:"2025-09-01",startDate:"",endDate:""},{no:2,desc:"AED Defibrillator",type:"Material",acctAssign:"K – Cost Center",materialNo:"MED-AED-002",materialGroup:"Medical Equipment",plant:"PL01",qty:5,uom:"Unit",estPrice:12000000,requirementDate:"2025-09-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0012", title:"Heavy Equipment Rental – Excavator & Dozer",  postedDate:"2025-07-05", closingDate:"2025-08-05", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Equipment Rental",   estVal:960000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG03", desc:"Rental of hydraulic excavators (36T) and bulldozers (D85) for open-pit overburden removal.", status:"Open", publishedAt:"2025-07-05", invitationNo:"BRM-INV-20250705-01",
    items:[{no:1,desc:"Hydraulic Excavator 36T",type:"Service",acctAssign:"P – Project",materialNo:"EQP-EXC-001",materialGroup:"Equipment Rental",plant:"PL04",qty:12,uom:"Month",estPrice:53000000,requirementDate:"",startDate:"2025-10-01",endDate:"2026-09-30"},{no:2,desc:"Bulldozer D85",type:"Service",acctAssign:"P – Project",materialNo:"EQP-DOZ-002",materialGroup:"Equipment Rental",plant:"PL04",qty:12,uom:"Month",estPrice:27000000,requirementDate:"",startDate:"2025-10-01",endDate:"2026-09-30"}]},
  { id:"RFQ-2025-0016", title:"Waste Management & Environmental Services",   postedDate:"2025-07-08", closingDate:"2025-08-08", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Services",           estVal:285000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", purchGroup:"PG04", desc:"B3 hazardous waste and non-B3 waste management services for all mining sites.", status:"Open", publishedAt:"2025-07-08", invitationNo:"BRM-INV-20250708-01",
    discussions:[
      {id:"D-016-001",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-21 09:15",message:"Both quotations received and accepted. QT-2025-0019 (PT Maju Bersama, IDR 277.8M — 2.5% under budget) and QT-2025-0020 (CV Sukses Mandiri, IDR 289.2M — 1.5% over budget). Ready to commence evaluation scoring."},
      {id:"D-016-002",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-21 10:30",message:"The budget variance must be reflected in Commercial scoring. Maju Bersama's B3 handling rate of IDR 3,381/kg vs CV Sukses Mandiri IDR 3,519/kg — at 50,000 KG volume that's a total difference of IDR 6.9M. Make sure line item rates are individually scored, not just total price."},
      {id:"D-016-003",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-21 13:45",message:"Understood. I also want to flag: both vendors offered Net 30/45 Days payment terms. Maju Bersama's 'Net 30 Days' is better for our cash flow, but Sukses Mandiri's 'Net 45 Days' gives them working capital advantage. Should payment terms carry weight in Commercial scoring this round?"},
      {id:"D-016-004",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-22 08:00",message:"Yes, payment terms are part of Commercial criteria. Net 30 Days is preferred per our policy — Maju Bersama should score higher on that dimension. Also please verify KLHK permit status for both vendors before finalising HSE scores. That's a disqualification criterion if expired."},
      {id:"D-016-005",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-22 11:20",message:"KLHK licenses verified — both valid through 2026. PT Maju Bersama holds ISO 14001:2015 certification. CV Sukses Mandiri has PROPER Biru rating from KLHK (2024). Both qualify on HSE eligibility. Maju Bersama's ISO cert gives them a slight edge on HSE process maturity. Proceeding to full scoring now."},
    ],
    items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",type:"Service",acctAssign:"K – Cost Center",materialNo:"ENV-B3H-001",materialGroup:"Environmental Services",plant:"PL05",qty:50000,uom:"KG",estPrice:3450,requirementDate:"",startDate:"2025-10-01",endDate:"2026-09-30"},{no:2,desc:"Non-B3 Waste Disposal (month)",type:"Service",acctAssign:"K – Cost Center",materialNo:"ENV-WD2-002",materialGroup:"Environmental Services",plant:"PL05",qty:12,uom:"Month",estPrice:9250000,requirementDate:"",startDate:"2025-10-01",endDate:"2026-09-30"}]},
  { id:"RFQ-2025-0017", title:"Fuel Supply – Diesel & Aviation Gasoline",    postedDate:"2025-07-10", closingDate:"2025-08-10", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"],            cat:"Goods",              estVal:1200000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG03", desc:"Annual supply of HSD diesel fuel and aviation gasoline for mining operations and helicopter.", status:"Open", publishedAt:"2025-07-10", invitationNo:"BRM-INV-20250710-01",
    items:[{no:1,desc:"HSD Diesel Fuel (Liter)",type:"Material",acctAssign:"P – Project",materialNo:"FUL-HSD-001",materialGroup:"Fuel",plant:"PL02",qty:3000000,uom:"Liter",estPrice:325,requirementDate:"2025-10-01",startDate:"",endDate:""},{no:2,desc:"Aviation Gasoline Avgas 100LL",type:"Material",acctAssign:"P – Project",materialNo:"FUL-AVG-002",materialGroup:"Fuel",plant:"PL02",qty:5000,uom:"Liter",estPrice:18000,requirementDate:"2025-10-01",startDate:"",endDate:""}]},

  // ── SCORED (6) ── Scoring done, submitted to approver
  { id:"RFQ-2025-0002", title:"Office Supplies Annual Contract",              postedDate:"2025-06-10", closingDate:"2025-06-30", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Office Supplies",    estVal:150000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG01", desc:"Annual supply of office stationery and printing consumables for all subsidiaries.", status:"Scored", publishedAt:"2025-06-10", invitationNo:"BRM-INV-20250610-01", submittedForApprovalAt:"2025-07-05", submittedForApprovalBy:"Siti Rahma", committeeGroup:"General", approvalPriority:"Low", approvalTargetDate:"2025-07-15", scoredAt:"2025-07-03", scoredBy:"Siti Rahma", scoreNotes:"PT Solusi Nusantara showed best price-quality ratio. All three vendors scored competitively on delivery reliability and certifications.",
    discussions:[
      {id:"D-002-001",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-01 10:00",message:"Completed initial review of all three quotations. PT Solusi Nusantara is lowest at IDR 104.5M (30% below budget), PT Maju Bersama IDR 107.8M, CV Sukses Mandiri IDR 112.2M. Proceeding to score."},
      {id:"D-002-002",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-02 08:30",message:"Siti, I want to challenge the Technical score of 85 for PT Solusi Nusantara. Their catalog submission only had 12 product lines versus Maju Bersama's 27. How did they score higher on product coverage?"},
      {id:"D-002-003",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-02 09:45",message:"Good question. Solusi Nusantara updated their catalog this quarter — they added 3M, Pilot, and Bantex product lines which were missing last year. I verified against their distributor certificate. The 85 reflects actual current coverage, not last year's profile."},
      {id:"D-002-004",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-02 11:15",message:"Understood. What about the Commercial score of 88 for Solusi Nusantara versus Maju Bersama's 82? The price difference is only IDR 3.3M — that alone doesn't justify a 6-point gap."},
      {id:"D-002-005",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-02 14:00",message:"The 6-point gap isn't only about price. Solusi Nusantara offered Cash on Delivery (no advance payment risk), a 5% discount versus Maju Bersama's 3%, and a 3-day lead time versus 5 days. Combined, those commercial terms clearly differentiate."},
      {id:"D-002-006",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-03 08:00",message:"Scores validated. PT Solusi Nusantara weighted score 85 is the clear winner. Proceed with submission to Tender Committee for approval."},
    ],
    items:[{no:1,desc:"A4 Paper 80gsm",type:"Material",acctAssign:"K – Cost Center",materialNo:"OFF-PPR-001",materialGroup:"Office Supplies",plant:"PL02",qty:1000,uom:"Ream",estPrice:50000,requirementDate:"2025-08-01",startDate:"",endDate:""},{no:2,desc:"Ink Cartridge (Various)",type:"Material",acctAssign:"K – Cost Center",materialNo:"OFF-INK-002",materialGroup:"Office Supplies",plant:"PL02",qty:200,uom:"Pcs",estPrice:300000,requirementDate:"2025-08-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0006", title:"Genset Rental – Remote Site Power",            postedDate:"2025-06-22", closingDate:"2025-07-22", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Equipment Rental",   estVal:480000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", purchGroup:"PG04", desc:"Rental of diesel generators (500 kVA) for Linge Minerals remote field site for 12 months.", status:"Scored", publishedAt:"2025-06-22", invitationNo:"BRM-INV-20250622-01", submittedForApprovalAt:"2025-07-20", submittedForApprovalBy:"Ahmad Rizki", committeeGroup:"Plant", approvalPriority:"Medium", approvalTargetDate:"2025-07-30", scoredAt:"2025-07-18", scoredBy:"Ahmad Rizki", scoreNotes:"CV Sukses Mandiri scored highest on HSE (94) and has best field support track record for remote sites.",
    discussions:[
      {id:"D-006-001",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-16 09:00",message:"PT Maju Bersama is disqualified at technical review. Their proposed unit (Perkins 1100 Series, 400 kVA rated) does not meet our 500 kVA continuous rating spec. Technical score = 0, eliminated from further evaluation."},
      {id:"D-006-002",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-16 10:30",message:"Confirmed. Additionally, Maju Bersama's HSE submission was incomplete — no SIUJK construction license and no field maintenance SOP included. Even without the spec failure, they would have scored below threshold on HSE. Disqualification is sound."},
      {id:"D-006-003",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-17 08:15",message:"Moving to compare CV Sukses Mandiri (Caterpillar C18 ATAAC, 500 kVA) versus PT Solusi Nusantara (Cummins C550 D5, 500 kVA). Both meet the spec. CV Sukses Mandiri's HSE score of 94 reflects their verified 3-year track record at the Linge site — zero unplanned downtime incidents."},
      {id:"D-006-004",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-17 11:00",message:"I want to challenge the Commercial score gap — Sukses Mandiri 85 vs Solusi Nusantara 80. Their quoted prices are within IDR 33M of each other and both offered similar payment terms. What specifically drove the 5-point difference?"},
      {id:"D-006-005",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-17 14:30",message:"Sukses Mandiri includes a dedicated on-site technician (24/7) and a guaranteed 48-hour spare parts delivery commitment in their scope — Solusi Nusantara only offers 72-hour parts SLA and weekly site visits. For a remote site, that operational support difference carries significant commercial value and justifies the 5-point gap."},
      {id:"D-006-006",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-18 09:00",message:"Agreed — that distinction is material for the Linge site. CV Sukses Mandiri weighted score 88 is the clear winner. Scores finalised and submitted to Tender Committee."},
    ],
    items:[{no:1,desc:"Genset 500 kVA Rental",type:"Service",acctAssign:"P – Project",materialNo:"SVC-GEN-001",materialGroup:"Equipment Rental",plant:"PL05",qty:12,uom:"Month",estPrice:40000000,requirementDate:"",startDate:"2025-09-01",endDate:"2026-08-31"}]},
  { id:"RFQ-2025-0008", title:"ERP Consulting Services – SAP Add-On",         postedDate:"2025-06-10", closingDate:"2025-07-10", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"IT Services",        estVal:650000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG02", desc:"Consulting & implementation for SAP Public Cloud add-on modules (BTP, Analytics Cloud).", status:"Scored", publishedAt:"2025-06-10", invitationNo:"BRM-INV-20250610-02", submittedForApprovalAt:"2025-07-18", submittedForApprovalBy:"Ahmad Rizki", committeeGroup:"General", approvalPriority:"High", approvalTargetDate:"2025-07-28", scoredAt:"2025-07-15", scoredBy:"Ahmad Rizki", scoreNotes:"PT Maju Bersama scored highest technically (87) with SAP Activate certified team. Price IDR 630M vs IDR 680M CV Sukses Mandiri.",
    items:[{no:1,desc:"SAP BTP Integration Consultant",type:"Service",acctAssign:"P – Project",materialNo:"SVC-SAP-001",materialGroup:"IT Consulting",plant:"PL01",qty:6,uom:"Month",estPrice:85000000,requirementDate:"",startDate:"2025-09-01",endDate:"2026-02-28"},{no:2,desc:"SAP Analytics Cloud Specialist",type:"Service",acctAssign:"P – Project",materialNo:"SVC-SAP-002",materialGroup:"IT Consulting",plant:"PL01",qty:4,uom:"Month",estPrice:75000000,requirementDate:"",startDate:"2025-10-01",endDate:"2026-01-31"}],
    discussions:[
      {id:"D-008-001",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-14 14:00",message:"PT Maju Bersama quoted IDR 793.8M with a SAP Activate-certified team (6 BTP consultants + 4 Analytics Cloud specialists). CV Sukses Mandiri quoted IDR 826.2M with senior profiles but no Activate certification. PT Solusi Nusantara IDR 769.5M — lowest price but their CVs show no live S/4HANA Public Cloud delivery experience."},
      {id:"D-008-002",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-14 16:00",message:"Solusi Nusantara's technical score of 0 (rejected) — is that right? Their price is competitive. Are we certain about the experience gap?"},
      {id:"D-008-003",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-14 17:15",message:"Yes. We verified their consultant CVs — all previous projects were S/4HANA On-Premise, not Public Cloud. BTP integration on Public Cloud has fundamentally different architecture. Their reference client also confirmed the project scope was limited to FI/CO only, not the BTP extension suite we need. Rejection stands."},
      {id:"D-008-004",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-15 08:30",message:"Fair. Now — Maju Bersama's Technical score 87 vs Sukses Mandiri 80. A 7-point gap seems high when both teams have senior-level consultants. Walk me through the breakdown."},
      {id:"D-008-005",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-15 10:00",message:"Maju Bersama has 3 SAP Activate certified leads vs Sukses Mandiri's 0 certified. Maju Bersama also provided a detailed project methodology with sprint plan, testing protocol, and hypercare period. Sukses Mandiri's methodology was a generic 4-page document with no BTP-specific delivery approach. That's why technical score reflects a 7-point gap."},
      {id:"D-008-006",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-15 09:30",message:"Scoring complete and validated. PT Maju Bersama leads on technical (87) and commercial (82). Weighted score 83 is the clear recommendation. Submitting to Tender Committee now."},
    ]},
  { id:"RFQ-2025-0020", title:"Training – Mine Safety & Emergency Response",  postedDate:"2025-07-01", closingDate:"2025-07-25", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Services",           estVal:280000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG03", desc:"Mine safety (SIMTK) and emergency response training for 300 personnel across all mining sites.", status:"Scored", publishedAt:"2025-07-01", invitationNo:"BRM-INV-20250701-02", submittedForApprovalAt:"2025-07-28", submittedForApprovalBy:"Siti Rahma", committeeGroup:"Mining", approvalPriority:"High", approvalTargetDate:"2025-08-07", scoredAt:"2025-07-26", scoredBy:"Siti Rahma", scoreNotes:"PT Solusi Nusantara offered most comprehensive curriculum and lowest per-head cost among all 3 vendors.",
    discussions:[
      {id:"D-020-001",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-24 09:00",message:"Scores submitted: PT Solusi Nusantara weighted 90 (Tech 88, Commercial 91, HSE 90), PT Maju Bersama weighted 82 (Tech 80, Commercial 83, HSE 85), CV Sukses Mandiri weighted 80 (Tech 78, Commercial 80, HSE 82). Solusi Nusantara is recommended."},
      {id:"D-020-002",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-24 11:30",message:"I want to challenge the HSE scores. PT Maju Bersama's lead trainer holds active BNSP certification (BNSP-K3-2024-0341), which is a nationally recognised mine safety credential. Solusi Nusantara's trainers only have internal company certification. Shouldn't BNSP carry more weight here?"},
      {id:"D-020-003",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-24 14:00",message:"Our evaluation criteria rates BNSP as 'preferred' but not mandatory — both are qualified under the SIMTK regulation. Solusi Nusantara scored 90 on HSE based on their 5-year continuous mine site delivery record and zero-incident history across 12 client sites. Their track record compensates for the certification level difference."},
      {id:"D-020-004",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-25 08:00",message:"Understood on HSE. Now I'm questioning the Commercial score of 91 for Solusi Nusantara. Their price of IDR 228M is only IDR 7.2M cheaper than Maju Bersama's IDR 235.2M — that's a 3% difference. A 91 vs 83 commercial gap of 8 points seems disproportionate to the price gap alone."},
      {id:"D-020-005",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-25 10:30",message:"The commercial score isn't only price. Solusi Nusantara included 12-month free e-learning access (valued IDR ~15M), flexible rescheduling with 48-hour notice, and a post-training competency assessment tool. Maju Bersama's scope is strictly classroom delivery with no value-adds. The 8-point gap reflects total commercial value, not just headline price."},
      {id:"D-020-006",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-26 09:00",message:"The e-learning access and assessment tools are significant differentiators for ongoing competency management. Scores are justified. PT Solusi Nusantara recommended. Approved for submission to Tender Committee."},
    ],
    items:[{no:1,desc:"Mine Safety (SIMTK) Training",type:"Service",acctAssign:"K – Cost Center",materialNo:"TRN-SMK-001",materialGroup:"Training Services",plant:"PL04",qty:300,uom:"Person",estPrice:500000,requirementDate:"",startDate:"2025-10-01",endDate:"2025-12-31"},{no:2,desc:"Emergency Response Drill",type:"Service",acctAssign:"K – Cost Center",materialNo:"TRN-ERD-002",materialGroup:"Training Services",plant:"PL04",qty:6,uom:"Session",estPrice:15000000,requirementDate:"",startDate:"2025-10-01",endDate:"2025-12-31"}]},
  { id:"RFQ-2025-0022", title:"Lubricants & Greases – Heavy Equipment Fleet",  postedDate:"2025-07-15", closingDate:"2025-08-10", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Goods",              estVal:400000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", purchGroup:"PG04", desc:"Annual supply of engine oils, hydraulic fluids, and greases for heavy equipment fleet.", status:"Scored", publishedAt:"2025-07-15", invitationNo:"BRM-INV-20250715-01", submittedForApprovalAt:"2025-08-12", submittedForApprovalBy:"Ahmad Rizki", committeeGroup:"Plant", approvalPriority:"Medium", approvalTargetDate:"2025-08-22", scoredAt:"2025-08-10", scoredBy:"Ahmad Rizki", scoreNotes:"CV Sukses Mandiri (Castrol) edges PT Maju Bersama (Shell) on price and delivery lead time. PT Solusi Nusantara disqualified on HSE.",
    discussions:[
      {id:"D-022-001",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-08 09:00",message:"PT Solusi Nusantara is disqualified. Their proposed lubricants are non-OEM unbranded products that fail our Komatsu PC4000 specification — viscosity index (VI) of 108 vs required minimum 120. Engineering confirmed this would void Komatsu equipment warranty. Eliminated from evaluation."},
      {id:"D-022-002",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-08 10:45",message:"Correct. I'd also note their HSE documentation didn't include a Material Safety Data Sheet (MSDS) for their hydraulic fluid — which is a mandatory submission. Between CV Sukses Mandiri (Castrol Optigear) and PT Maju Bersama (Shell Rimula), both are OEM-approved. Proceeding to score those two."},
      {id:"D-022-003",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-09 08:30",message:"I scored CV Sukses Mandiri at 86 Commercial vs PT Maju Bersama 80. Main drivers: Castrol offers a 2% higher discount (total IDR 9.4M saving) and their lead time is 10 days shorter. Maju Bersama's Shell Rimula quoted Net 30 Days vs Sukses Mandiri Net 45 — note that Net 30 is our preferred payment term."},
      {id:"D-022-004",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-09 11:00",message:"I want to challenge this. You've given Sukses Mandiri higher Commercial despite their Net 45 Days payment terms, which is unfavourable versus our policy. Also, Shell Rimula R4 has a higher VI (125 vs Castrol's 121) which is better for our high-altitude Shasta site operations. Shouldn't Technical reflect this?"},
      {id:"D-022-005",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-09 14:00",message:"Valid point on VI. However both are within OEM spec and the 4-point VI difference doesn't translate to measurable performance difference at our operating conditions — Engineering confirmed this. On payment terms: the Net 45 disadvantage costs us ~IDR 1.2M in opportunity cost, while the discount saving is IDR 9.4M net. Commercial score stands. Technical difference of 84 vs 82 adequately reflects the minor VI gap."},
      {id:"D-022-006",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-10 09:00",message:"Accepted. The financial analysis supports Sukses Mandiri. Weighted score 85 vs 81 — CV Sukses Mandiri is the clear recommendation. Scores finalised and submitted."},
    ],
    items:[{no:1,desc:"Engine Oil 15W-40 (208L drum)",type:"Material",acctAssign:"K – Cost Center",materialNo:"LUB-OIL-001",materialGroup:"Lubricants",plant:"PL03",qty:300,uom:"Drum",estPrice:920000,requirementDate:"2025-10-01",startDate:"",endDate:""},{no:2,desc:"Hydraulic Fluid VG-46 (208L drum)",type:"Material",acctAssign:"K – Cost Center",materialNo:"LUB-HYD-002",materialGroup:"Lubricants",plant:"PL03",qty:100,uom:"Drum",estPrice:880000,requirementDate:"2025-10-01",startDate:"",endDate:""},{no:3,desc:"Multi-purpose Grease (18kg bucket)",type:"Material",acctAssign:"K – Cost Center",materialNo:"LUB-GRS-003",materialGroup:"Lubricants",plant:"PL03",qty:200,uom:"Bucket",estPrice:500000,requirementDate:"2025-10-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0025", title:"Fire Protection System – Plant Building",       postedDate:"2025-07-20", closingDate:"2025-08-15", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Services",           estVal:780000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG04", desc:"Design, supply, and installation of fire sprinkler and hydrant system for new plant building.", status:"Scored", publishedAt:"2025-07-20", invitationNo:"BRM-INV-20250720-01", submittedForApprovalAt:"2025-08-18", submittedForApprovalBy:"Siti Rahma", committeeGroup:"Civil", approvalPriority:"High", approvalTargetDate:"2025-08-28", scoredAt:"2025-08-16", scoredBy:"Siti Rahma", scoreNotes:"PT Maju Bersama: NFPA-compliant design, competitive price IDR 748M, 1-year post-installation maintenance included.",
    discussions:[
      {id:"D-025-001",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-14 10:00",message:"PT Solusi Nusantara disqualified at Technical gate — they hold only SNI 03-3989 certification and lack NFPA 13 compliance. Our plant specification explicitly requires NFPA 13 for the sprinkler system. Their score of 0 on Technical is correct; they cannot proceed further."},
      {id:"D-025-002",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-14 11:30",message:"Confirmed. NFPA 13 is a hard requirement per our EPC contract with the plant builder. No waiver is possible. Now — between PT Maju Bersama (IDR 764.4M, weighted 88) and CV Sukses Mandiri (IDR 795.6M, weighted 82), I want to understand the HSE score difference: Maju Bersama 88 vs Sukses Mandiri 80. That's a large gap."},
      {id:"D-025-003",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-14 14:00",message:"The HSE gap is driven by two factors. First, PT Maju Bersama includes 12 months post-installation maintenance and annual hydrostatic pressure testing in their scope — Sukses Mandiri's scope ends at commissioning. Second, Maju Bersama's site safety plan included a detailed fire watch protocol during hot work phases; Sukses Mandiri's was a generic template. Both are material HSE differentiators."},
      {id:"D-025-004",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-15 08:30",message:"I also want to challenge the Technical score of 90 for Maju Bersama. They proposed a 2-zone wet pipe system versus Sukses Mandiri's 3-zone dry pipe. Isn't a 3-zone system more comprehensive? Why does fewer zones score higher?"},
      {id:"D-025-005",userId:"buyer1",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-15 10:00",message:"Engineering reviewed both designs. Wet pipe is preferred for our fully enclosed indoor plant environment — it has faster response time (no air purge delay) and lower failure risk than dry pipe in tropical humidity. The 2-zone design is intentionally simpler: fewer control valves, lower annual maintenance cost, and easier fault isolation. Engineering scored it as the technically superior solution for this application."},
      {id:"D-025-006",userId:"brm.user",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-16 09:00",message:"Engineering's validation is decisive. PT Maju Bersama's design is technically superior and their post-installation commitment reduces long-term operational risk. Weighted score 88 is clear. Approving the recommendation and submitting to Tender Committee today."},
    ],
    items:[{no:1,desc:"Sprinkler System Design & Install",type:"Service",acctAssign:"P – Project",materialNo:"FPS-SPR-001",materialGroup:"Fire Protection",plant:"PL01",qty:1,uom:"Lump Sum",estPrice:550000000,requirementDate:"",startDate:"2025-11-01",endDate:"2026-02-28"},{no:2,desc:"Fire Hydrant & Hose Reel",type:"Material",acctAssign:"P – Project",materialNo:"FPS-HYD-002",materialGroup:"Fire Protection",plant:"PL01",qty:20,uom:"Unit",estPrice:11500000,requirementDate:"2025-11-01",startDate:"",endDate:""}]},

  // ── CLOSED (8) ── Winner determined, PO issued
  { id:"RFQ-2025-0003", title:"Security Services – HO Building",              postedDate:"2025-05-20", closingDate:"2025-06-10", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Services",           estVal:360000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", purchGroup:"PG01", desc:"Security guard services for Head Office 24/7, 12 months contract.", status:"Closed", publishedAt:"2025-05-20", invitationNo:"BRM-INV-20250520-01", closedAt:"2025-06-25", closedBy:"Budi Santoso", winnerVendorId:"10000002", approvalNotes:"CV Sukses Mandiri awarded. Best HSE score (95) and competitive pricing. BPJS compliance verified.",
    discussions:[
      {id:"d1",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-06-26 08:15",message:"I need clarity on why CV Sukses Mandiri was selected over the other bidders. Was this purely on HSE score, or were commercial factors equally weighted?"},
      {id:"d2",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-06-26 09:30",message:"The evaluation used a 40/60 technical-commercial split. CV Sukses Mandiri scored 95 on HSE and their all-in rate was IDR 18M/person-month, which came in 12% below the next lowest bid."},
      {id:"d3",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-06-26 10:45",message:"Were BPJS Ketenagakerjaan certificates independently verified for all guards listed in the proposal, or only the supervisors?"},
      {id:"d4",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-06-26 11:20",message:"Verification was done at the company level via BPJS online portal — the vendor's corporate registration was active and in good standing. Guard-level individual records are contractually their obligation."},
      {id:"d5",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-06-27 08:00",message:"Acceptable. Please ensure the monthly BPJS payment receipts are submitted as a contract deliverable so Finance can track compliance throughout the service period."},
    ],
    items:[{no:1,desc:"Security Guard Day Shift",type:"Service",acctAssign:"P – Project",materialNo:"SVC-SEC-001",materialGroup:"Security Services",plant:"PL03",qty:12,uom:"Person/Month",estPrice:8000000,requirementDate:"",startDate:"2025-07-01",endDate:"2026-06-30"},{no:2,desc:"Security Guard Night Shift",type:"Service",acctAssign:"P – Project",materialNo:"SVC-SEC-002",materialGroup:"Security Services",plant:"PL03",qty:12,uom:"Person/Month",estPrice:10000000,requirementDate:"",startDate:"2025-07-01",endDate:"2026-06-30"}]},
  { id:"RFQ-2025-0004", title:"HVAC Maintenance Contract",                    postedDate:"2025-05-15", closingDate:"2025-06-15", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Services",           estVal:240000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG04", desc:"Annual preventive maintenance for HVAC systems across all floors of mining HQ.", status:"Closed", publishedAt:"2025-05-15", invitationNo:"BRM-INV-20250515-01", closedAt:"2025-06-28", closedBy:"Budi Santoso", winnerVendorId:"10000001", approvalNotes:"PT Maju Bersama awarded. Lowest bid at IDR 228M with spare parts included.",
    discussions:[
      {id:"d1",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-06-29 09:00",message:"Lowest bid does not automatically mean best value. Were the spare parts specified in scope actually comparable across all three vendors, or only PT Maju Bersama included them voluntarily?"},
      {id:"d2",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-06-29 10:15",message:"The RFQ scope explicitly required a BOM for OEM spare parts covering one full maintenance cycle. Both PT Maju and the other bidders were required to include them — the other two bidders priced spare parts separately, making their effective totals IDR 267M and IDR 291M respectively."},
      {id:"d3",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-06-30 08:30",message:"Was there a technical evaluation of the proposed spare parts brands? I want assurance we are not getting cheaper substitute parts that could void equipment warranties."},
      {id:"d4",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-06-30 09:45",message:"PT Maju Bersama's BOM specifies Daikin and Carrier OEM parts only — this was scored in the technical evaluation. The contract will include a clause requiring part certificates of authenticity on delivery."},
    ],
    items:[{no:1,desc:"Preventive Maintenance Visit",type:"Service",acctAssign:"K – Cost Center",materialNo:"SVC-HVC-001",materialGroup:"Facility Services",plant:"PL04",qty:12,uom:"Visit",estPrice:20000000,requirementDate:"",startDate:"2025-08-01",endDate:"2026-07-31"}]},
  { id:"RFQ-2025-0011", title:"Drone Survey & Aerial Mapping Services",       postedDate:"2025-06-05", closingDate:"2025-07-05", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Services",           estVal:320000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG03", desc:"Drone aerial survey and 3D mapping of mining concession area (2,500 hectares).", status:"Closed", publishedAt:"2025-06-05", invitationNo:"BRM-INV-20250605-01", closedAt:"2025-07-18", closedBy:"Budi Santoso", winnerVendorId:"10000002", approvalNotes:"CV Sukses Mandiri awarded. DJI Matrice 350 RTK, NATA-accredited deliverables, fastest turnaround.",
    discussions:[
      {id:"d1",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-07-19 07:45",message:"The DJI Matrice 350 RTK is a Chinese-manufactured platform. Given our data security policy and the sensitivity of concession area coordinates, was this risk assessed before award?"},
      {id:"d2",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-19 09:00",message:"The IT Security team reviewed the data handling workflow. All point cloud data is processed on-site and transferred via encrypted drive — no DJI cloud services are used. This was confirmed in the vendor's technical submission."},
      {id:"d3",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-07-19 10:30",message:"NATA accreditation for which specific testing standard? I need to confirm this is applicable to Indonesian regulatory requirements for mining survey submissions."},
      {id:"d4",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-19 11:15",message:"NATA accreditation covers ISO/IEC 17025 for spatial data — deliverables are also compatible with ESDM Directorate General reporting format. Accreditation certificate is on file."},
    ],
    items:[{no:1,desc:"Drone Aerial Survey (per hectare)",type:"Service",acctAssign:"P – Project",materialNo:"SVC-DRN-001",materialGroup:"Survey Services",plant:"PL04",qty:2500,uom:"Ha",estPrice:110000,requirementDate:"",startDate:"2025-08-15",endDate:"2025-11-30"},{no:2,desc:"3D Point Cloud Processing & Report",type:"Service",acctAssign:"P – Project",materialNo:"SVC-DRN-002",materialGroup:"Survey Services",plant:"PL04",qty:1,uom:"Lump Sum",estPrice:30000000,requirementDate:"",startDate:"2025-08-15",endDate:"2025-11-30"}]},
  { id:"RFQ-2025-0013", title:"Laboratory Testing Services – Ore Samples",    postedDate:"2025-06-08", closingDate:"2025-07-08", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Services",           estVal:155000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG03", desc:"Fire assay and ICP-MS multi-element analysis for ore samples from Palu mining site.", status:"Closed", publishedAt:"2025-06-08", invitationNo:"BRM-INV-20250608-01", closedAt:"2025-07-22", closedBy:"Budi Santoso", winnerVendorId:"10000001", approvalNotes:"PT Maju Bersama awarded. NATA-accredited lab, 5-day turnaround, best technical score.",
    discussions:[
      {id:"d1",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-07-23 09:00",message:"PT Maju Bersama's rate of IDR 43,000 per fire assay sample is significantly below market — are we confident this is sustainable pricing that won't lead to quality shortcuts mid-contract?"},
      {id:"d2",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-23 10:30",message:"The price was validated against three independent lab benchmarks. PT Maju Bersama achieves lower cost through batch processing efficiency. Their quality track record on two prior BRM contracts shows zero QAQC failures."},
      {id:"d3",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-07-24 08:00",message:"What is the accreditation scope of their NATA certification — does it explicitly cover fire assay Au and ICP-MS multi-element, or is it a general chemistry accreditation?"},
      {id:"d4",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-24 09:15",message:"The NATA scope document confirms both fire assay (Au, Ag) and ICP-MS 48-element packages are listed methods. I've attached the accreditation schedule to the sourcing record."},
    ],
    items:[{no:1,desc:"Fire Assay Au (per sample)",type:"Service",acctAssign:"P – Project",materialNo:"LAB-FAS-001",materialGroup:"Laboratory Services",plant:"PL02",qty:2000,uom:"Sample",estPrice:43000,requirementDate:"",startDate:"2025-09-01",endDate:"2026-08-31"},{no:2,desc:"ICP-MS Multi-element Analysis",type:"Service",acctAssign:"P – Project",materialNo:"LAB-ICP-002",materialGroup:"Laboratory Services",plant:"PL02",qty:1500,uom:"Sample",estPrice:38000,requirementDate:"",startDate:"2025-09-01",endDate:"2026-08-31"}]},
  { id:"RFQ-2025-0014", title:"Catering & Mess Hall Services – Aceh Camp",    postedDate:"2025-06-10", closingDate:"2025-07-10", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Services",           estVal:550000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", purchGroup:"PG01", desc:"Daily catering services for 500 personnel at Aceh mining camp, 3 meals + 2 snacks per day.", status:"Closed", publishedAt:"2025-06-10", invitationNo:"BRM-INV-20250610-03", closedAt:"2025-07-25", closedBy:"Budi Santoso", winnerVendorId:"10000002", approvalNotes:"CV Sukses Mandiri awarded. Halal certified, best menu variety, strong camp catering track record.",
    discussions:[
      {id:"d1",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-07-26 08:00",message:"IDR 82,500 per person per day seems high for camp catering. What benchmark did the team use, and was the scope tested against a per-meal alternative to verify cost efficiency?"},
      {id:"d2",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-26 09:30",message:"The benchmark was ESDM camp catering norms for remote Aceh, which range IDR 78,000–95,000 PPD. The rate includes logistics to a remote site with limited road access — a per-meal split was evaluated but added contract complexity without cost savings."},
      {id:"d3",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-07-26 10:45",message:"Was the Halal certification from MUI or a body recognized by BPJPH? Aceh province has specific requirements and we need to ensure regulatory compliance, not just contractual compliance."},
      {id:"d4",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-26 11:30",message:"Certification is MUI-issued and has been registered with BPJPH — the registration number is in the vendor's qualification documents. This was a mandatory pass/fail criterion during pre-qualification."},
    ],
    items:[{no:1,desc:"Catering per Person per Day",type:"Service",acctAssign:"P – Project",materialNo:"CAT-PPD-001",materialGroup:"Catering Services",plant:"PL02",qty:54750,uom:"Person/Day",estPrice:82500,requirementDate:"",startDate:"2025-09-01",endDate:"2026-08-31"}]},
  { id:"RFQ-2025-0015", title:"Telecommunication – VSAT & Radio System",      postedDate:"2025-06-12", closingDate:"2025-07-12", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"IT Services",        estVal:420000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", purchGroup:"PG02", desc:"Installation and 12-month operation of VSAT satellite internet and VHF radio for remote site.", status:"Closed", publishedAt:"2025-06-12", invitationNo:"BRM-INV-20250612-01", closedAt:"2025-07-28", closedBy:"Budi Santoso", winnerVendorId:"10000002", approvalNotes:"CV Sukses Mandiri awarded. Hughes VSAT HT2000W, 99.5% SLA uptime, 24/7 remote NOC.",
    discussions:[
      {id:"d1",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-07-29 09:00",message:"A 99.5% SLA sounds strong but that still allows 43 hours of downtime per year. For a remote mine site, what is the penalty regime if SLA is missed, and is it proportionate to operational impact?"},
      {id:"d2",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-07-29 10:15",message:"The contract includes service credits of 5% of the monthly fee per hour of downtime beyond SLA, capped at 20% of the monthly fee. For extended outages, there is an escalation clause for on-site intervention within 48 hours."},
      {id:"d3",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-07-30 08:00",message:"Was the 24/7 NOC evaluated as a dedicated remote site NOC or a shared NOC covering multiple clients? Response time guarantees should be based on dedicated capacity."},
      {id:"d4",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-07-30 09:30",message:"CV Sukses Mandiri's NOC is shared but with a guaranteed response SLA of 15 minutes for critical alerts. This was validated during the site visit — their NOC team had LMRS site configuration pre-loaded for rapid response."},
      {id:"d5",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-07-30 11:00",message:"Satisfactory. Ensure the 15-minute response SLA is written explicitly into the SLA schedule, not just referenced in the proposal document."},
    ],
    items:[{no:1,desc:"VSAT Installation & Hardware",type:"Service",acctAssign:"P – Project",materialNo:"TEL-VST-001",materialGroup:"Telecommunications",plant:"PL05",qty:1,uom:"Set",estPrice:185000000,requirementDate:"",startDate:"2025-09-01",endDate:"2026-08-31"},{no:2,desc:"VSAT Monthly Bandwidth 100Mbps",type:"Service",acctAssign:"P – Project",materialNo:"TEL-BWD-002",materialGroup:"Telecommunications",plant:"PL05",qty:12,uom:"Month",estPrice:19583333,requirementDate:"",startDate:"2025-09-01",endDate:"2026-08-31"}]},
  { id:"RFQ-2025-0018", title:"Tailings Dam Monitoring – Instrumentation",    postedDate:"2025-06-15", closingDate:"2025-07-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002","10000003"], cat:"Services",           estVal:380000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", purchGroup:"PG03", desc:"Supply and installation of geotechnical instrumentation for tailings dam safety monitoring.", status:"Closed", publishedAt:"2025-06-15", invitationNo:"BRM-INV-20250615-01", closedAt:"2025-08-01", closedBy:"Arief Budiman", winnerVendorId:"10000001", approvalNotes:"PT Maju Bersama awarded. Geo-Instruments USA equipment, best technical score (91).",
    discussions:[
      {id:"d1",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-08-02 08:30",message:"Tailings dam monitoring is a safety-critical scope. I want to understand how a technical score of 91 was validated — who reviewed the geotechnical methodology and signed off on technical sufficiency?"},
      {id:"d2",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-02 10:00",message:"Technical evaluation was conducted by our internal geotechnical engineer and cross-checked against ANCOLD Dam Safety Guidelines. PT Maju Bersama's proposed sensor layout covered all critical failure modes — seepage, slope deformation, and pore pressure."},
      {id:"d3",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-08-02 11:30",message:"The IDR 380M estimate — is this for equipment supply only, or does it include installation, commissioning, and annual data reporting? The scope summary in the RFQ is ambiguous."},
      {id:"d4",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-02 13:00",message:"The contract value covers supply, installation, calibration, and 12 months of quarterly data reports. Annual recalibration in year two onward will be subject to a separate service order priced at the agreed day rates in the contract schedule."},
      {id:"d5",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-08-03 08:00",message:"Good. Given the regulatory implications under Government Regulation 78/2010 on tailings management, ensure the geotechnical engineer's sign-off letter is attached to the contract file before PO issuance."},
    ],
    items:[{no:1,desc:"Piezometer (vibrating wire)",type:"Material",acctAssign:"P – Project",materialNo:"GEO-PIZ-001",materialGroup:"Instrumentation",plant:"PL04",qty:20,uom:"Unit",estPrice:8200000,requirementDate:"2025-10-01",startDate:"",endDate:""},{no:2,desc:"Inclinometer Casing & Probe",type:"Material",acctAssign:"P – Project",materialNo:"GEO-INC-002",materialGroup:"Instrumentation",plant:"PL04",qty:5,uom:"Set",estPrice:24500000,requirementDate:"2025-10-01",startDate:"",endDate:""},{no:3,desc:"Data Logger & Telemetry Unit",type:"Material",acctAssign:"P – Project",materialNo:"GEO-DLG-003",materialGroup:"Instrumentation",plant:"PL04",qty:3,uom:"Unit",estPrice:27000000,requirementDate:"2025-10-01",startDate:"",endDate:""}]},
  { id:"RFQ-2025-0019", title:"Office Renovation – Jakarta HQ 5th Floor",     postedDate:"2025-06-18", closingDate:"2025-07-18", postedBy:"Siti Rahma",   targets:["10000001","10000002","10000003"], cat:"Civil Works",         estVal:870000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", purchGroup:"PG04", desc:"Interior renovation and fitout of 5th floor Jakarta HQ including design, build, and furniture.", status:"Closed", publishedAt:"2025-06-18", invitationNo:"BRM-INV-20250618-01", closedAt:"2025-08-05", closedBy:"Budi Santoso", winnerVendorId:"10000002", approvalNotes:"CV Sukses Mandiri awarded. Portfolio: Accenture Jakarta, Unilever HQ. ISO 9001 certified.",
    discussions:[
      {id:"d1",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-08-06 08:00",message:"IDR 870M for a 5th floor renovation is a significant spend. Was an independent quantity surveyor engaged to validate the BOQ, or was the estimate based solely on vendor submissions?"},
      {id:"d2",userId:"U-BRM-001",userName:"Ahmad Rizki",role:"Procurement Manager",postedAt:"2025-08-06 09:30",message:"An independent QS from Aecom Indonesia reviewed the BOQ prior to RFQ issuance and confirmed the estimate was within market range. Their report is in the sourcing file. All three vendors priced within 8% of each other, which validates the estimate."},
      {id:"d3",userId:"U-APR-001",userName:"Budi Santoso",role:"Finance Approver",postedAt:"2025-08-06 11:00",message:"The Accenture Jakarta and Unilever HQ references are corporate clients — did we verify those projects were comparable in scale and complexity to this scope, or are they simply brand-name references?"},
      {id:"d4",userId:"U-BRM-002",userName:"Siti Rahma",role:"Senior Buyer",postedAt:"2025-08-06 13:00",message:"Reference checks confirmed: Accenture Jakarta was a 3-floor fitout at IDR 2.1B and Unilever HQ was a full floor renovation at IDR 950M — both larger and comparable in specification. Client contacts confirmed on-time delivery and quality sign-off."},
      {id:"d5",userId:"U-DIR-001",userName:"Arief Budiman",role:"Director",postedAt:"2025-08-07 08:00",message:"Noted. Ensure the construction timeline is locked into the contract with milestone-based payment terms — I do not want progress payments released without completed milestone sign-off by Facilities Management."},
    ],
    items:[{no:1,desc:"Interior Design & Build Works",type:"Service",acctAssign:"P – Project",materialNo:"CIV-IDB-001",materialGroup:"Civil Works",plant:"PL01",qty:1,uom:"Lump Sum",estPrice:700000000,requirementDate:"",startDate:"2025-10-01",endDate:"2026-01-31"},{no:2,desc:"Furniture & Fitout Supply",type:"Service",acctAssign:"P – Project",materialNo:"CIV-FFS-002",materialGroup:"Civil Works",plant:"PL01",qty:1,uom:"Lump Sum",estPrice:170000000,requirementDate:"",startDate:"2025-10-01",endDate:"2026-01-31"}]},
];
export const INIT_QT = [
  // ── Open RFQ quotations ──
  { id:"QT-2025-0001", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-13", validUntil:"2025-07-01", totalAmt:637000000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Site", leadTime:"7 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:3500000,insurance:1200000}, items:[{no:1,desc:"Laptop 14\" Core i7",materialGroup:"IT Equipment",qty:50,uom:"Unit",unitPrice:7840000,total:392000000},{no:2,desc:"Workstation Dell XPS",materialGroup:"IT Equipment",qty:20,uom:"Unit",unitPrice:12250000,total:245000000}] },
  { id:"QT-2025-0002", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-13", validUntil:"2025-07-01", totalAmt:663000000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"10 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:5000000,insurance:1500000}, items:[{no:1,desc:"Laptop 14\" Core i7",materialGroup:"IT Equipment",qty:50,uom:"Unit",unitPrice:8160000,total:408000000},{no:2,desc:"Workstation Dell XPS",materialGroup:"IT Equipment",qty:20,uom:"Unit",unitPrice:12750000,total:255000000}] },
  { id:"QT-2025-0003", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"", validUntil:"", totalAmt:617500000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Draft", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:4,surcharge:0,freight:2500000,insurance:900000}, items:[{no:1,desc:"Laptop 14\" Core i7",materialGroup:"IT Equipment",qty:50,uom:"Unit",unitPrice:7600000,total:380000000},{no:2,desc:"Workstation Dell XPS",materialGroup:"IT Equipment",qty:20,uom:"Unit",unitPrice:11875000,total:237500000}] },
  { id:"QT-2025-0004", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-17", validUntil:"2025-07-20", totalAmt:546350000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"30% DP, 70% upon delivery", deliveryTerms:"DAP Site", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:8000000,insurance:2500000}, items:[{no:1,desc:"ANFO Bulk Explosive",materialGroup:"Explosives & Blasting",qty:50000,uom:"KG",unitPrice:8330,total:416500000},{no:2,desc:"Electric Detonator",materialGroup:"Explosives & Blasting",qty:2000,uom:"Pcs",unitPrice:34300,total:68600000},{no:3,desc:"Safety Fuse (100m/roll)",materialGroup:"Explosives & Blasting",qty:500,uom:"Roll",unitPrice:122500,total:61250000}] },
  { id:"QT-2025-0005", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-17", validUntil:"2025-07-20", totalAmt:568650000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"18 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:9500000,insurance:2800000}, items:[{no:1,desc:"ANFO Bulk Explosive",materialGroup:"Explosives & Blasting",qty:50000,uom:"KG",unitPrice:8670,total:433500000},{no:2,desc:"Electric Detonator",materialGroup:"Explosives & Blasting",qty:2000,uom:"Pcs",unitPrice:35700,total:71400000},{no:3,desc:"Safety Fuse (100m/roll)",materialGroup:"Explosives & Blasting",qty:500,uom:"Roll",unitPrice:127500,total:63750000}] },
  { id:"QT-2025-0006", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-17", validUntil:"2025-07-20", totalAmt:529625000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"10 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:7000000,insurance:2000000}, items:[{no:1,desc:"ANFO Bulk Explosive",materialGroup:"Explosives & Blasting",qty:50000,uom:"KG",unitPrice:8075,total:403750000},{no:2,desc:"Electric Detonator",materialGroup:"Explosives & Blasting",qty:2000,uom:"Pcs",unitPrice:33250,total:66500000},{no:3,desc:"Safety Fuse (100m/roll)",materialGroup:"Explosives & Blasting",qty:500,uom:"Roll",unitPrice:118750,total:59375000}] },
  { id:"QT-2025-0007", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-22", validUntil:"2025-07-25", totalAmt:189630000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:2000000,insurance:750000}, items:[{no:1,desc:"Safety Helmet (SNI certified)",materialGroup:"Safety Equipment",qty:500,uom:"Pcs",unitPrice:73500,total:36750000},{no:2,desc:"Safety Boot (Steel Toe)",materialGroup:"Safety Equipment",qty:300,uom:"Pair",unitPrice:343000,total:102900000},{no:3,desc:"High-Visibility Safety Vest",materialGroup:"Safety Equipment",qty:600,uom:"Pcs",unitPrice:83300,total:49980000}] },
  { id:"QT-2025-0008", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-22", validUntil:"2025-07-25", totalAmt:197370000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"12 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:3000000,insurance:900000}, items:[{no:1,desc:"Safety Helmet (SNI certified)",materialGroup:"Safety Equipment",qty:500,uom:"Pcs",unitPrice:76500,total:38250000},{no:2,desc:"Safety Boot (Steel Toe)",materialGroup:"Safety Equipment",qty:300,uom:"Pair",unitPrice:357000,total:107100000},{no:3,desc:"High-Visibility Safety Vest",materialGroup:"Safety Equipment",qty:600,uom:"Pcs",unitPrice:86700,total:52020000}] },
  { id:"QT-2025-0009", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-22", validUntil:"2025-07-25", totalAmt:183825000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:5,surcharge:0,freight:1500000,insurance:500000}, items:[{no:1,desc:"Safety Helmet (SNI certified)",materialGroup:"Safety Equipment",qty:500,uom:"Pcs",unitPrice:71250,total:35625000},{no:2,desc:"Safety Boot (Steel Toe)",materialGroup:"Safety Equipment",qty:300,uom:"Pair",unitPrice:332500,total:99750000},{no:3,desc:"High-Visibility Safety Vest",materialGroup:"Safety Equipment",qty:600,uom:"Pcs",unitPrice:80750,total:48450000}] },
  { id:"QT-2025-0010", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-25", validUntil:"2025-07-28", totalAmt:191100000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Site", leadTime:"10 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:4000000,insurance:1000000}, items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",materialGroup:"Chemicals & Reagents",qty:500,uom:"Bag",unitPrice:176400,total:88200000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",materialGroup:"Chemicals & Reagents",qty:300,uom:"Bag",unitPrice:245000,total:73500000},{no:3,desc:"Caustic Soda NaOH 50kg/drum",materialGroup:"Chemicals & Reagents",qty:150,uom:"Drum",unitPrice:196000,total:29400000}] },
  { id:"QT-2025-0011", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"", validUntil:"", totalAmt:198900000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Draft", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"CIF Jakarta", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:6000000,insurance:1500000}, items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",materialGroup:"Chemicals & Reagents",qty:500,uom:"Bag",unitPrice:183600,total:91800000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",materialGroup:"Chemicals & Reagents",qty:300,uom:"Bag",unitPrice:255000,total:76500000},{no:3,desc:"Caustic Soda NaOH 50kg/drum",materialGroup:"Chemicals & Reagents",qty:150,uom:"Drum",unitPrice:204000,total:30600000}] },
  { id:"QT-2025-0012", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-25", validUntil:"2025-07-28", totalAmt:185250000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"EXW Surabaya Warehouse", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:4,surcharge:0,freight:3000000,insurance:800000}, items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",materialGroup:"Chemicals & Reagents",qty:500,uom:"Bag",unitPrice:171000,total:85500000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",materialGroup:"Chemicals & Reagents",qty:300,uom:"Bag",unitPrice:237500,total:71250000},{no:3,desc:"Caustic Soda NaOH 50kg/drum",materialGroup:"Chemicals & Reagents",qty:150,uom:"Drum",unitPrice:190000,total:28500000}] },
  { id:"QT-2025-0013", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-13", validUntil:"2025-08-01", totalAmt:88200000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:1500000,insurance:600000}, items:[{no:1,desc:"First Aid Kit (50-person)",materialGroup:"Medical Supplies",qty:25,uom:"Set",unitPrice:1176000,total:29400000},{no:2,desc:"AED Defibrillator",materialGroup:"Medical Supplies",qty:5,uom:"Unit",unitPrice:11760000,total:58800000}] },
  { id:"QT-2025-0014", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-13", validUntil:"2025-08-01", totalAmt:91800000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"10 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:2000000,insurance:800000}, items:[{no:1,desc:"First Aid Kit (50-person)",materialGroup:"Medical Supplies",qty:25,uom:"Set",unitPrice:1224000,total:30600000},{no:2,desc:"AED Defibrillator",materialGroup:"Medical Supplies",qty:5,uom:"Unit",unitPrice:12240000,total:61200000}] },
  { id:"QT-2025-0015", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-13", validUntil:"2025-08-01", totalAmt:85500000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Rejected", files:["quotation.pdf"], rejectionNote:"Tidak memenuhi persyaratan sertifikasi minimum.", termsOfPayment:"Cash on Delivery", deliveryTerms:"FCA Surabaya", leadTime:"4 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:5,surcharge:0,freight:1200000,insurance:400000}, items:[{no:1,desc:"First Aid Kit (50-person)",materialGroup:"Medical Supplies",qty:25,uom:"Set",unitPrice:1140000,total:28500000},{no:2,desc:"AED Defibrillator",materialGroup:"Medical Supplies",qty:5,uom:"Unit",unitPrice:11400000,total:57000000}] },
  { id:"QT-2025-0016", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-17", validUntil:"2025-08-05", totalAmt:940800000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], termsOfPayment:"30% DP, 70% upon delivery", deliveryTerms:"DAP Balikpapan", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:9000000,insurance:2500000}, items:[{no:1,desc:"Hydraulic Excavator 36T",materialGroup:"Heavy Equipment Rental",qty:12,uom:"Month",unitPrice:51940000,total:623280000},{no:2,desc:"Bulldozer D85",materialGroup:"Heavy Equipment Rental",qty:12,uom:"Month",unitPrice:26460000,total:317520000}] },
  { id:"QT-2025-0017", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-17", validUntil:"2025-08-05", totalAmt:979200000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"21 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:10000000,insurance:3000000}, items:[{no:1,desc:"Hydraulic Excavator 36T",materialGroup:"Heavy Equipment Rental",qty:12,uom:"Month",unitPrice:54060000,total:648720000},{no:2,desc:"Bulldozer D85",materialGroup:"Heavy Equipment Rental",qty:12,uom:"Month",unitPrice:27540000,total:330480000}] },
  { id:"QT-2025-0018", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-17", validUntil:"2025-08-05", totalAmt:912000000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"10 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:4,surcharge:0,freight:7500000,insurance:2000000}, items:[{no:1,desc:"Hydraulic Excavator 36T",materialGroup:"Heavy Equipment Rental",qty:12,uom:"Month",unitPrice:50350000,total:604200000},{no:2,desc:"Bulldozer D85",materialGroup:"Heavy Equipment Rental",qty:12,uom:"Month",unitPrice:25650000,total:307800000}] },
  { id:"QT-2025-0019", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-20", validUntil:"2025-08-08", totalAmt:277830000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Site", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:5000000,insurance:1500000}, items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",materialGroup:"Environmental Services",qty:50000,uom:"KG",unitPrice:3381,total:169050000},{no:2,desc:"Non-B3 Waste Disposal (month)",materialGroup:"Environmental Services",qty:12,uom:"Month",unitPrice:9065000,total:108780000}] },
  { id:"QT-2025-0020", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-20", validUntil:"2025-08-08", totalAmt:289170000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:7000000,insurance:2000000}, items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",materialGroup:"Environmental Services",qty:50000,uom:"KG",unitPrice:3519,total:175950000},{no:2,desc:"Non-B3 Waste Disposal (month)",materialGroup:"Environmental Services",qty:12,uom:"Month",unitPrice:9435000,total:113220000}] },
  { id:"QT-2025-0021", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Aviation Gasoline", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-22", validUntil:"2025-08-10", totalAmt:1042200000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Submitted", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Site", leadTime:"3 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:8500000,insurance:2500000}, items:[{no:1,desc:"HSD Diesel Fuel (Liter)",materialGroup:"Fuel & Lubricants",qty:3000000,uom:"Liter",unitPrice:318,total:954000000},{no:2,desc:"Aviation Gasoline Avgas 100LL",materialGroup:"Fuel & Lubricants",qty:5000,uom:"Liter",unitPrice:17640,total:88200000}] },
  { id:"QT-2025-0022", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Aviation Gasoline", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"", validUntil:"", totalAmt:1087800000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Draft", files:["quotation.pdf"], termsOfPayment:"Net 60 Days", deliveryTerms:"CIF Jakarta", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:10000000,insurance:3000000}, items:[{no:1,desc:"HSD Diesel Fuel (Liter)",materialGroup:"Fuel & Lubricants",qty:3000000,uom:"Liter",unitPrice:332,total:996000000},{no:2,desc:"Aviation Gasoline Avgas 100LL",materialGroup:"Fuel & Lubricants",qty:5000,uom:"Liter",unitPrice:18360,total:91800000}] },
  // ── Scored RFQ quotations (with scores) ──
  { id:"QT-2025-0023", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:107800000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], scores:{technical:78,commercial:82,hse:80,weighted:80}, termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"3 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:500000,insurance:200000}, items:[{no:1,desc:"A4 Paper 80gsm",materialGroup:"Office Supplies",qty:1000,uom:"Ream",unitPrice:49000,total:49000000},{no:2,desc:"Ink Cartridge (Various)",materialGroup:"Office Supplies",qty:200,uom:"Pcs",unitPrice:294000,total:58800000}] },
  { id:"QT-2025-0024", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:112200000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], scores:{technical:75,commercial:79,hse:77,weighted:77}, termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:800000,insurance:300000}, items:[{no:1,desc:"A4 Paper 80gsm",materialGroup:"Office Supplies",qty:1000,uom:"Ream",unitPrice:51000,total:51000000},{no:2,desc:"Ink Cartridge (Various)",materialGroup:"Office Supplies",qty:200,uom:"Pcs",unitPrice:306000,total:61200000}] },
  { id:"QT-2025-0025", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:104500000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Accepted", files:["quotation.pdf"], scores:{technical:85,commercial:88,hse:83,weighted:85}, termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"2 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:5,surcharge:0,freight:400000,insurance:150000}, items:[{no:1,desc:"A4 Paper 80gsm",materialGroup:"Office Supplies",qty:1000,uom:"Ream",unitPrice:47500,total:47500000},{no:2,desc:"Ink Cartridge (Various)",materialGroup:"Office Supplies",qty:200,uom:"Pcs",unitPrice:285000,total:57000000}] },
  { id:"QT-2025-0026", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-19", validUntil:"2025-07-22", totalAmt:470400000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Rejected", files:["quotation.pdf"], rejectionNote:"Gugur pada tahap evaluasi teknis / HSE.", termsOfPayment:"50% DP, 50% upon delivery", deliveryTerms:"DAP Site", leadTime:"14 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:6000000,insurance:1800000}, items:[{no:1,desc:"Genset 500 kVA Rental",materialGroup:"Electrical Equipment",qty:12,uom:"Month",unitPrice:39200000,total:470400000}] },
  { id:"QT-2025-0027", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-19", validUntil:"2025-07-22", totalAmt:489600000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], scores:{technical:88,commercial:85,hse:94,weighted:88}, termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"21 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:8000000,insurance:2200000}, items:[{no:1,desc:"Genset 500 kVA Rental",materialGroup:"Electrical Equipment",qty:12,uom:"Month",unitPrice:40800000,total:489600000}] },
  { id:"QT-2025-0028", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-19", validUntil:"2025-07-22", totalAmt:456000000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Accepted", files:["quotation.pdf"], scores:{technical:82,commercial:80,hse:86,weighted:82}, termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"10 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:4,surcharge:0,freight:5000000,insurance:1500000}, items:[{no:1,desc:"Genset 500 kVA Rental",materialGroup:"Electrical Equipment",qty:12,uom:"Month",unitPrice:38000000,total:456000000}] },
  { id:"QT-2025-0029", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:793800000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], scores:{technical:87,commercial:82,hse:79,weighted:83}, termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"SAP BTP Integration Consultant",materialGroup:"IT Services",qty:6,uom:"Month",unitPrice:83300000,total:499800000},{no:2,desc:"SAP Analytics Cloud Specialist",materialGroup:"IT Services",qty:4,uom:"Month",unitPrice:73500000,total:294000000}] },
  { id:"QT-2025-0030", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:826200000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], scores:{technical:80,commercial:76,hse:82,weighted:79}, termsOfPayment:"Net 45 Days", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"SAP BTP Integration Consultant",materialGroup:"IT Services",qty:6,uom:"Month",unitPrice:86700000,total:520200000},{no:2,desc:"SAP Analytics Cloud Specialist",materialGroup:"IT Services",qty:4,uom:"Month",unitPrice:76500000,total:306000000}] },
  { id:"QT-2025-0031", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:769500000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Rejected", files:["quotation.pdf"], rejectionNote:"Gugur pada tahap evaluasi teknis / HSE.", termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"3 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:5,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"SAP BTP Integration Consultant",materialGroup:"IT Services",qty:6,uom:"Month",unitPrice:80750000,total:484500000},{no:2,desc:"SAP Analytics Cloud Specialist",materialGroup:"IT Services",qty:4,uom:"Month",unitPrice:71250000,total:285000000}] },
  { id:"QT-2025-0032", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-13", validUntil:"2025-08-01", totalAmt:235200000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], scores:{technical:80,commercial:83,hse:85,weighted:82}, termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Site", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Mine Safety (SIMTK) Training",materialGroup:"Training & Development",qty:300,uom:"Person",unitPrice:490000,total:147000000},{no:2,desc:"Emergency Response Drill",materialGroup:"Training & Development",qty:6,uom:"Session",unitPrice:14700000,total:88200000}] },
  { id:"QT-2025-0033", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-13", validUntil:"2025-08-01", totalAmt:244800000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], scores:{technical:78,commercial:80,hse:82,weighted:80}, termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Mine Safety (SIMTK) Training",materialGroup:"Training & Development",qty:300,uom:"Person",unitPrice:510000,total:153000000},{no:2,desc:"Emergency Response Drill",materialGroup:"Training & Development",qty:6,uom:"Session",unitPrice:15300000,total:91800000}] },
  { id:"QT-2025-0034", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-13", validUntil:"2025-08-01", totalAmt:228000000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Accepted", files:["quotation.pdf"], scores:{technical:88,commercial:91,hse:90,weighted:90}, termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:4,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Mine Safety (SIMTK) Training",materialGroup:"Training & Development",qty:300,uom:"Person",unitPrice:475000,total:142500000},{no:2,desc:"Emergency Response Drill",materialGroup:"Training & Development",qty:6,uom:"Session",unitPrice:14250000,total:85500000}] },
  { id:"QT-2025-0035", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-27", validUntil:"2025-08-15", totalAmt:454720000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], scores:{technical:82,commercial:80,hse:83,weighted:81}, termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Site", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:5500000,insurance:1500000}, items:[{no:1,desc:"Engine Oil 15W-40 (208L drum)",materialGroup:"Fuel & Lubricants",qty:300,uom:"Drum",unitPrice:901600,total:270480000},{no:2,desc:"Hydraulic Fluid VG-46 (208L drum)",materialGroup:"Fuel & Lubricants",qty:100,uom:"Drum",unitPrice:862400,total:86240000},{no:3,desc:"Multi-purpose Grease (18kg bucket)",materialGroup:"Fuel & Lubricants",qty:200,uom:"Bucket",unitPrice:490000,total:98000000}] },
  { id:"QT-2025-0036", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-27", validUntil:"2025-08-15", totalAmt:473280000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], scores:{technical:84,commercial:86,hse:85,weighted:85}, termsOfPayment:"Net 45 Days", deliveryTerms:"CIF Jakarta", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:7000000,insurance:2000000}, items:[{no:1,desc:"Engine Oil 15W-40 (208L drum)",materialGroup:"Fuel & Lubricants",qty:300,uom:"Drum",unitPrice:938400,total:281520000},{no:2,desc:"Hydraulic Fluid VG-46 (208L drum)",materialGroup:"Fuel & Lubricants",qty:100,uom:"Drum",unitPrice:897600,total:89760000},{no:3,desc:"Multi-purpose Grease (18kg bucket)",materialGroup:"Fuel & Lubricants",qty:200,uom:"Bucket",unitPrice:510000,total:102000000}] },
  { id:"QT-2025-0037", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-27", validUntil:"2025-08-15", totalAmt:440800000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Rejected", files:["quotation.pdf"], rejectionNote:"Gugur pada tahap evaluasi teknis / HSE.", termsOfPayment:"Net 30 Days", deliveryTerms:"EXW Surabaya Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:5,surcharge:0,freight:4000000,insurance:1200000}, items:[{no:1,desc:"Engine Oil 15W-40 (208L drum)",materialGroup:"Fuel & Lubricants",qty:300,uom:"Drum",unitPrice:874000,total:262200000},{no:2,desc:"Hydraulic Fluid VG-46 (208L drum)",materialGroup:"Fuel & Lubricants",qty:100,uom:"Drum",unitPrice:836000,total:83600000},{no:3,desc:"Multi-purpose Grease (18kg bucket)",materialGroup:"Fuel & Lubricants",qty:200,uom:"Bucket",unitPrice:475000,total:95000000}] },
  { id:"QT-2025-0038", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-07-17", validUntil:"2025-08-20", totalAmt:764400000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Accepted", files:["quotation.pdf"], scores:{technical:90,commercial:85,hse:88,weighted:88}, termsOfPayment:"30% DP, 70% upon delivery", deliveryTerms:"DAP Site", leadTime:"21 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:4000000,insurance:1500000}, items:[{no:1,desc:"Sprinkler System Design & Install",materialGroup:"Safety Equipment",qty:1,uom:"Lump Sum",unitPrice:539000000,total:539000000},{no:2,desc:"Fire Hydrant & Hose Reel",materialGroup:"Safety Equipment",qty:20,uom:"Unit",unitPrice:11270000,total:225400000}] },
  { id:"QT-2025-0039", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-07-17", validUntil:"2025-08-20", totalAmt:795600000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Accepted", files:["quotation.pdf"], scores:{technical:83,commercial:82,hse:80,weighted:82}, termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"28 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:5500000,insurance:2000000}, items:[{no:1,desc:"Sprinkler System Design & Install",materialGroup:"Safety Equipment",qty:1,uom:"Lump Sum",unitPrice:561000000,total:561000000},{no:2,desc:"Fire Hydrant & Hose Reel",materialGroup:"Safety Equipment",qty:20,uom:"Unit",unitPrice:11730000,total:234600000}] },
  { id:"QT-2025-0040", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-07-17", validUntil:"2025-08-20", totalAmt:741000000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Rejected", files:["quotation.pdf"], rejectionNote:"Gugur pada tahap evaluasi teknis / HSE.", termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"14 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:4,surcharge:0,freight:3000000,insurance:1000000}, items:[{no:1,desc:"Sprinkler System Design & Install",materialGroup:"Safety Equipment",qty:1,uom:"Lump Sum",unitPrice:522500000,total:522500000},{no:2,desc:"Fire Hydrant & Hose Reel",materialGroup:"Safety Equipment",qty:20,uom:"Unit",unitPrice:10925000,total:218500000}] },
  // ── Closed RFQ quotations (Win / Lost) ──
  { id:"QT-2025-0041", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-05-17", validUntil:"2025-06-20", totalAmt:211680000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Site", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Security Guard Day Shift",materialGroup:"Security Services",qty:12,uom:"Person/Month",unitPrice:7840000,total:94080000},{no:2,desc:"Security Guard Night Shift",materialGroup:"Security Services",qty:12,uom:"Person/Month",unitPrice:9800000,total:117600000}] },
  { id:"QT-2025-0042", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-05-17", validUntil:"2025-06-20", totalAmt:220320000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010003", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Security Guard Day Shift",materialGroup:"Security Services",qty:12,uom:"Person/Month",unitPrice:8160000,total:97920000},{no:2,desc:"Security Guard Night Shift",materialGroup:"Security Services",qty:12,uom:"Person/Month",unitPrice:10200000,total:122400000}] },
  { id:"QT-2025-0043", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-05-17", validUntil:"2025-06-20", totalAmt:205200000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:4,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Security Guard Day Shift",materialGroup:"Security Services",qty:12,uom:"Person/Month",unitPrice:7600000,total:91200000},{no:2,desc:"Security Guard Night Shift",materialGroup:"Security Services",qty:12,uom:"Person/Month",unitPrice:9500000,total:114000000}] },
  { id:"QT-2025-0044", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-05-27", validUntil:"2025-06-15", totalAmt:235200000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010004", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Site", leadTime:"3 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Preventive Maintenance Visit",materialGroup:"Facility Services",qty:12,uom:"Visit",unitPrice:19600000,total:235200000}] },
  { id:"QT-2025-0045", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-05-27", validUntil:"2025-06-15", totalAmt:244800000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Preventive Maintenance Visit",materialGroup:"Facility Services",qty:12,uom:"Visit",unitPrice:20400000,total:244800000}] },
  { id:"QT-2025-0046", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-05-27", validUntil:"2025-06-15", totalAmt:228000000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"2 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:5,surcharge:0,freight:0,insurance:0}, items:[{no:1,desc:"Preventive Maintenance Visit",materialGroup:"Facility Services",qty:12,uom:"Visit",unitPrice:19000000,total:228000000}] },
  { id:"QT-2025-0047", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-17", validUntil:"2025-07-05", totalAmt:298900000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"DAP Site", leadTime:"10 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:2000000,insurance:700000}, items:[{no:1,desc:"Drone Aerial Survey (per hectare)",materialGroup:"Survey & Mapping",qty:2500,uom:"Ha",unitPrice:107800,total:269500000},{no:2,desc:"3D Point Cloud Processing & Report",materialGroup:"Survey & Mapping",qty:1,uom:"Lump Sum",unitPrice:29400000,total:29400000}] },
  { id:"QT-2025-0048", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-17", validUntil:"2025-07-05", totalAmt:311100000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010011", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:3000000,insurance:1000000}, items:[{no:1,desc:"Drone Aerial Survey (per hectare)",materialGroup:"Survey & Mapping",qty:2500,uom:"Ha",unitPrice:112200,total:280500000},{no:2,desc:"3D Point Cloud Processing & Report",materialGroup:"Survey & Mapping",qty:1,uom:"Lump Sum",unitPrice:30600000,total:30600000}] },
  { id:"QT-2025-0049", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-17", validUntil:"2025-07-05", totalAmt:289750000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:4,surcharge:0,freight:1500000,insurance:500000}, items:[{no:1,desc:"Drone Aerial Survey (per hectare)",materialGroup:"Survey & Mapping",qty:2500,uom:"Ha",unitPrice:104500,total:261250000},{no:2,desc:"3D Point Cloud Processing & Report",materialGroup:"Survey & Mapping",qty:1,uom:"Lump Sum",unitPrice:28500000,total:28500000}] },
  { id:"QT-2025-0050", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-20", validUntil:"2025-07-08", totalAmt:140140000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010013", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:2,surcharge:0,freight:1000000,insurance:500000}, items:[{no:1,desc:"Fire Assay Au (per sample)",materialGroup:"Laboratory Services",qty:2000,uom:"Sample",unitPrice:42140,total:84280000},{no:2,desc:"ICP-MS Multi-element Analysis",materialGroup:"Laboratory Services",qty:1500,uom:"Sample",unitPrice:37240,total:55860000}] },
  { id:"QT-2025-0051", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-20", validUntil:"2025-07-08", totalAmt:145860000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"10 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:1500000,insurance:600000}, items:[{no:1,desc:"Fire Assay Au (per sample)",materialGroup:"Laboratory Services",qty:2000,uom:"Sample",unitPrice:43860,total:87720000},{no:2,desc:"ICP-MS Multi-element Analysis",materialGroup:"Laboratory Services",qty:1500,uom:"Sample",unitPrice:38760,total:58140000}] },
  { id:"QT-2025-0052", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-20", validUntil:"2025-07-08", totalAmt:135850000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Surabaya", leadTime:"4 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:5,surcharge:0,freight:800000,insurance:300000}, items:[{no:1,desc:"Fire Assay Au (per sample)",materialGroup:"Laboratory Services",qty:2000,uom:"Sample",unitPrice:40850,total:81700000},{no:2,desc:"ICP-MS Multi-element Analysis",materialGroup:"Laboratory Services",qty:1500,uom:"Sample",unitPrice:36100,total:54150000}] },
  { id:"QT-2025-0053", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:4426537500, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Site", leadTime:"7 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:3,surcharge:0,freight:5000000,insurance:1500000}, items:[{no:1,desc:"Catering per Person per Day",materialGroup:"Catering & Hospitality",qty:54750,uom:"Person/Day",unitPrice:80850,total:4426537500}] },
  { id:"QT-2025-0054", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:4607212500, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010014", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"14 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:1,surcharge:0,freight:7000000,insurance:2000000}, items:[{no:1,desc:"Catering per Person per Day",materialGroup:"Catering & Hospitality",qty:54750,uom:"Person/Day",unitPrice:84150,total:4607212500}] },
  { id:"QT-2025-0055", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-22", validUntil:"2025-07-10", totalAmt:4291031250, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"5 hari kerja", warrantyPeriod:"12 bulan", priceConditions:{discount:4,surcharge:0,freight:4000000,insurance:1200000}, items:[{no:1,desc:"Catering per Person per Day",materialGroup:"Catering & Hospitality",qty:54750,uom:"Person/Day",unitPrice:78375,total:4291031250}] },
  { id:"QT-2025-0056", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-24", validUntil:"2025-07-12", totalAmt:411599992, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"30% DP, 70% upon delivery", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"21 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:3500000,insurance:1000000}, items:[{no:1,desc:"VSAT Installation & Hardware",materialGroup:"Telecommunications",qty:1,uom:"Set",unitPrice:181300000,total:181300000},{no:2,desc:"VSAT Monthly Bandwidth 100Mbps",materialGroup:"Telecommunications",qty:12,uom:"Month",unitPrice:19191666,total:230299992}] },
  { id:"QT-2025-0057", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-24", validUntil:"2025-07-12", totalAmt:428400000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010015", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 45 Days", deliveryTerms:"CIF Jakarta", leadTime:"28 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:5000000,insurance:1500000}, items:[{no:1,desc:"VSAT Installation & Hardware",materialGroup:"Telecommunications",qty:1,uom:"Set",unitPrice:188700000,total:188700000},{no:2,desc:"VSAT Monthly Bandwidth 100Mbps",materialGroup:"Telecommunications",qty:12,uom:"Month",unitPrice:19975000,total:239700000}] },
  { id:"QT-2025-0058", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-24", validUntil:"2025-07-12", totalAmt:398999992, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Surabaya", leadTime:"14 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:5,surcharge:0,freight:2500000,insurance:800000}, items:[{no:1,desc:"VSAT Installation & Hardware",materialGroup:"Telecommunications",qty:1,uom:"Set",unitPrice:175750000,total:175750000},{no:2,desc:"VSAT Monthly Bandwidth 100Mbps",materialGroup:"Telecommunications",qty:12,uom:"Month",unitPrice:18604166,total:223249992}] },
  { id:"QT-2025-0059", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-27", validUntil:"2025-07-15", totalAmt:360150000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010018", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 30 Days after GR", deliveryTerms:"DAP Site", leadTime:"14 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:3000000,insurance:1000000}, items:[{no:1,desc:"Piezometer (vibrating wire)",materialGroup:"Instrumentation",qty:20,uom:"Unit",unitPrice:8036000,total:160720000},{no:2,desc:"Inclinometer Casing & Probe",materialGroup:"Instrumentation",qty:5,uom:"Set",unitPrice:24010000,total:120050000},{no:3,desc:"Data Logger & Telemetry Unit",materialGroup:"Instrumentation",qty:3,uom:"Unit",unitPrice:26460000,total:79380000}] },
  { id:"QT-2025-0060", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-27", validUntil:"2025-07-15", totalAmt:374850000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 45 Days", deliveryTerms:"CIF Jakarta", leadTime:"21 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:4500000,insurance:1500000}, items:[{no:1,desc:"Piezometer (vibrating wire)",materialGroup:"Instrumentation",qty:20,uom:"Unit",unitPrice:8364000,total:167280000},{no:2,desc:"Inclinometer Casing & Probe",materialGroup:"Instrumentation",qty:5,uom:"Set",unitPrice:24990000,total:124950000},{no:3,desc:"Data Logger & Telemetry Unit",materialGroup:"Instrumentation",qty:3,uom:"Unit",unitPrice:27540000,total:82620000}] },
  { id:"QT-2025-0061", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-27", validUntil:"2025-07-15", totalAmt:349125000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"10 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:4,surcharge:0,freight:2000000,insurance:700000}, items:[{no:1,desc:"Piezometer (vibrating wire)",materialGroup:"Instrumentation",qty:20,uom:"Unit",unitPrice:7790000,total:155800000},{no:2,desc:"Inclinometer Casing & Probe",materialGroup:"Instrumentation",qty:5,uom:"Set",unitPrice:23275000,total:116375000},{no:3,desc:"Data Logger & Telemetry Unit",materialGroup:"Instrumentation",qty:3,uom:"Unit",unitPrice:25650000,total:76950000}] },
  { id:"QT-2025-0062", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor", vendorId:"10000001", vendorName:"PT Maju Bersama", salesPerson:"Budi Hartono · +62-811-2345-001", submittedDate:"2025-06-15", validUntil:"2025-07-18", totalAmt:852600000, notes:"Harga sudah termasuk pengiriman & garansi. Tim bersertifikasi siap mobilisasi.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"50% DP, 50% upon delivery", deliveryTerms:"DAP Jakarta Warehouse", leadTime:"30 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:2,surcharge:0,freight:6000000,insurance:2000000}, items:[{no:1,desc:"Interior Design & Build Works",materialGroup:"Civil & Construction",qty:1,uom:"Lump Sum",unitPrice:686000000,total:686000000},{no:2,desc:"Furniture & Fitout Supply",materialGroup:"Civil & Construction",qty:1,uom:"Lump Sum",unitPrice:166600000,total:166600000}] },
  { id:"QT-2025-0063", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor", vendorId:"10000002", vendorName:"CV Sukses Mandiri", salesPerson:"Dewi Kusuma · +62-812-9876-002", submittedDate:"2025-06-15", validUntil:"2025-07-18", totalAmt:887400000, notes:"Distributor resmi. Garansi keaslian produk, dukungan purna jual 24/7.", status:"PO Ready", files:["quotation.pdf"], poSapNo:"4500010019", approvedBy:"Budi Santoso", approvedAt:"2025-07-30", termsOfPayment:"Net 45 Days", deliveryTerms:"DDU Jobsite", leadTime:"45 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:1,surcharge:0,freight:8000000,insurance:2500000}, items:[{no:1,desc:"Interior Design & Build Works",materialGroup:"Civil & Construction",qty:1,uom:"Lump Sum",unitPrice:714000000,total:714000000},{no:2,desc:"Furniture & Fitout Supply",materialGroup:"Civil & Construction",qty:1,uom:"Lump Sum",unitPrice:173400000,total:173400000}] },
  { id:"QT-2025-0064", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor", vendorId:"10000003", vendorName:"PT Solusi Nusantara", salesPerson:"Fajar Nugraha · +62-811-9012-003", submittedDate:"2025-06-15", validUntil:"2025-07-18", totalAmt:826500000, notes:"Penawaran kompetitif dengan lead time tercepat. Sertifikat lengkap terlampir.", status:"Lost", files:["quotation.pdf"], termsOfPayment:"Net 30 Days", deliveryTerms:"FCA Vendor Warehouse", leadTime:"21 hari kerja", warrantyPeriod:"24 bulan", priceConditions:{discount:4,surcharge:0,freight:5000000,insurance:1500000}, items:[{no:1,desc:"Interior Design & Build Works",materialGroup:"Civil & Construction",qty:1,uom:"Lump Sum",unitPrice:665000000,total:665000000},{no:2,desc:"Furniture & Fitout Supply",materialGroup:"Civil & Construction",qty:1,uom:"Lump Sum",unitPrice:161500000,total:161500000}] },
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

