import { useState, useEffect, useRef } from "react";

// ── Mock Data ──────────────────────────────────────────────────
export const USERS = [
  { id:"V001", role:"vendor", username:"vendor1", password:"demo123", name:"PT Maju Bersama", vendorId:"10000001" },
  { id:"V002", role:"vendor", username:"vendor2", password:"demo123", name:"CV Sukses Mandiri", vendorId:"10000002" },
  { id:"B001", role:"brm",    username:"brm.user", password:"demo123", name:"Ahmad Rizki",  title:"Procurement Manager" },
  { id:"B002", role:"brm",    username:"buyer1",   password:"demo123", name:"Siti Rahma",   title:"Senior Buyer" },
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
  },
  "10000002":{ id:"10000002", name:"CV Sukses Mandiri",  tax:"02.345.678.9-012.000", addr:"Jl. Gatot Subroto No. 45, Jakarta Pusat 10270", phone:"+62 21 5555-5678", email:"finance@suksesmandiri.co.id",
    banks:[
      {no:1, name:"Bank Central Asia (BCA)",branch:"KCP Jakarta Pusat",      acc:"9876-5432-1098",    aname:"CV SUKSES MANDIRI", currency:"IDR", swift:"CENAIDJA", primary:true  },
      {no:2, name:"Bank Negara Indonesia",  branch:"Kantor Cabang Jakarta",  acc:"3344-5566-7788",    aname:"CV SUKSES MANDIRI", currency:"IDR", swift:"BNINIDJA", primary:false },
    ],
    cat:"Services", since:"2021-07-22", rep:"Dewi Kusuma", status:"Active",
    npwpAddress:"Jl. Gatot Subroto No. 45, Jakarta Pusat 10270", pkp:"Non-PKP", taxStatus:"Active",
    certExpiry:"2026-07-21", website:"www.suksesmandiri.co.id", fax:"+62 21 5555-5679",
  },
};
// SAP I_CompanyCode — five legal entities
export const COMPANY_CODES = [
  { v:"BRMS", l:"PT Bumi Resource Minerals",  ctrl:"A000", city:"Jakarta",   country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"CPMS", l:"PT Citra Palu Minerals",      ctrl:"A000", city:"Poboya",    country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"GMIN", l:"PT Gorontalo Minerals",       ctrl:"A000", city:"Gorontalo", country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"SHSI", l:"PT Suma Heksa Sinergi",       ctrl:"A000", city:"Banten",    country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
  { v:"LMRS", l:"PT Linge Minerals",           ctrl:"A000", city:"Aceh",      country:"ID", currency:"IDR", lang:"ID", chart:"YCOA" },
];
export const ccName = code => COMPANY_CODES.find(c=>c.v===code)?.l || "";
// SAP I_Currency — ISO 4217 transaction currencies
export const CURRENCIES = [
  {v:"IDR",l:"IDR – Indonesian Rupiah"}, {v:"USD",l:"USD – US Dollar"},
  {v:"EUR",l:"EUR – Euro"},              {v:"SGD",l:"SGD – Singapore Dollar"},
  {v:"AUD",l:"AUD – Australian Dollar"}, {v:"JPY",l:"JPY – Japanese Yen"},
  {v:"CNY",l:"CNY – Chinese Yuan"},      {v:"GBP",l:"GBP – British Pound"},
  {v:"MYR",l:"MYR – Malaysian Ringgit"}, {v:"HKD",l:"HKD – Hong Kong Dollar"},
  {v:"SAR",l:"SAR – Saudi Riyal"},
];
// SAP WithholdingTaxType / WithholdingTaxCode — Indonesian Pasal WHT
export const WHT_TYPES = [
  {v:"",      l:"— None / Not Applicable —"},
  {v:"PPh21", l:"PPh Pasal 21 – Employment & Professional Income"},
  {v:"PPh22", l:"PPh Pasal 22 – Import & Certain Goods (1.5%)"},
  {v:"PPh23", l:"PPh Pasal 23 – Services, Rent & Royalties (2%)"},
  {v:"PPh26", l:"PPh Pasal 26 – Foreign Entity / Non-Resident (20%)"},
  {v:"PPh4a2",l:"PPh Pasal 4(2) – Final Tax: Rent & Construction (2–4%)"},
];
// ── Invoice seed generator ─────────────────────────────────────
const _genInvoices = () => {
  const V = [
    {id:"10000001",name:"PT Maju Bersama",   pfx:"MJB"},
    {id:"10000002",name:"CV Sukses Mandiri", pfx:"CSM"},
  ];
  const CCS   = ["BRMS","CPMS","GMIN","SHSI","LMRS"];
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
    const cc       = rp(CCS);
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
    const dueDate  = dateAdd(invDate, ri(28,60));

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
      invoiceDate:invDate, dueDate,
      poNumbers, companyCode:cc,
      amount, currency:curr,
      vatBase, vatAmt, whtType, whtBase, whtAmt,
      desc:rawDesc, status,
      sapDocNo, postedAt, taxDoc,
      files: rng()>0.4?["invoice.pdf","faktur_pajak.pdf"]:rng()>0.5?["invoice.pdf"]:[],
      submittedAt, confirmedAt,
      convertedDocNo, clearingDocNo,
      rejReason: status==="Rejected"?rp(["Missing supporting documents.","PO number mismatch. Please verify.","Duplicate invoice detected.","Amount exceeds PO value. Revise and resubmit.","Faktur Pajak not valid. Check tax document number."]):"",
    });
  }
  return rows;
};

export const INIT_INV = [
  { id:"PI-2025-0001", invoiceType:"Invoice",      vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/001", invoiceDate:"2025-06-01", dueDate:"2025-07-01", poNumbers:["4500001234"], companyCode:"BRMS", amount:125000000, currency:"IDR", vatBase:125000000, vatAmt:13750000, whtType:"",      whtBase:0,         whtAmt:0,       desc:"Office supplies Q2 2025",                          status:"Posted",               sapDocNo:"5100000001/2025",      postedAt:"2025-06-10", taxDoc:"FP-010.000-25.00000001", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-02", confirmedAt:"2025-06-05", convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0002", invoiceType:"Invoice",      vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/002", invoiceDate:"2025-06-10", dueDate:"2025-07-10", poNumbers:["4500001235"], companyCode:"CPMS", amount:87500000,  currency:"IDR", vatBase:87500000,  vatAmt:9625000,  whtType:"",      whtBase:0,         whtAmt:0,       desc:"IT peripherals and accessories",                    status:"Under Review",         sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000002", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-11", confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0003", invoiceType:"Invoice",      vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/003", invoiceDate:"2025-06-15", dueDate:"2025-07-15", poNumbers:["4500001236","4500001237"], companyCode:"BRMS", amount:45000000, currency:"IDR", vatBase:45000000, vatAmt:4950000, whtType:"PPh23", whtBase:45000000, whtAmt:900000,  desc:"Maintenance services June 2025",                    status:"Draft",                sapDocNo:null,                   postedAt:null,          taxDoc:"",                       files:[],                                 submittedAt:null,          confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0004", invoiceType:"Invoice",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/001", invoiceDate:"2025-06-05", dueDate:"2025-07-05", poNumbers:["4500001238"], companyCode:"SHSI", amount:230000000, currency:"IDR", vatBase:230000000, vatAmt:25300000, whtType:"PPh23", whtBase:230000000, whtAmt:4600000, desc:"Cleaning services contract Q2",                     status:"Submitted",            sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000003", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-06", confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0005", invoiceType:"Invoice",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/002", invoiceDate:"2025-06-18", dueDate:"2025-07-18", poNumbers:["4500001239","4500001240"], companyCode:"LMRS", amount:15000000, currency:"IDR", vatBase:15000000, vatAmt:1650000, whtType:"PPh23", whtBase:15000000, whtAmt:300000,  desc:"Courier services May 2025",                         status:"Rejected",             sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000004", files:["invoice.pdf"],                    submittedAt:"2025-06-19", confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"Missing Faktur Pajak. Please resubmit with complete tax document." },
  { id:"PI-2025-0006", invoiceType:"Supplier DPR", vendorId:"10000001", vendorName:"PT Maju Bersama",   invoiceNo:"INV/MJB/2025/004", invoiceDate:"2025-06-20", dueDate:"2025-07-20", poNumbers:["4500001241"], companyCode:"GMIN", amount:8500,      currency:"USD", vatBase:8500,      vatAmt:935,      whtType:"PPh26", whtBase:8500,      whtAmt:1700,    desc:"Enterprise software license renewal (Salesforce)",  status:"Posted",               sapDocNo:"BRMS/1000000001/2025", postedAt:"2025-06-25", taxDoc:"FP-010.000-25.00000005", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-21", confirmedAt:"2025-06-23", convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0007", invoiceType:"Supplier DPR", vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/003", invoiceDate:"2025-06-20", dueDate:"2025-07-20", poNumbers:["4500001242"], companyCode:"CPMS", amount:12000,     currency:"AUD", vatBase:12000,     vatAmt:1320,     whtType:"PPh23", whtBase:12000,     whtAmt:240,     desc:"Training & consulting services – Sydney workshop",  status:"Confirmed",            sapDocNo:null,                   postedAt:null,          taxDoc:"FP-010.000-25.00000006", files:["invoice.pdf","faktur_pajak.pdf"], submittedAt:"2025-06-22", confirmedAt:"2025-06-24", convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  { id:"PI-2025-0008", invoiceType:"Invoice",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", invoiceNo:"INV/CSM/2025/004", invoiceDate:"2025-06-22", dueDate:"2025-07-22", poNumbers:["4500001243"], companyCode:"GMIN", amount:45000,     currency:"CNY", vatBase:45000,     vatAmt:4950,     whtType:"",      whtBase:0,         whtAmt:0,       desc:"Manufacturing components supply – June batch",      status:"Draft",                sapDocNo:null,                   postedAt:null,          taxDoc:"",                       files:[],                                 submittedAt:null,          confirmedAt:null,          convertedDocNo:null, clearingDocNo:null, rejReason:"" },
  ..._genInvoices(),
];
export const INIT_RFQS = [
  { id:"RFQ-2025-0001", title:"Procurement of Laptops & Workstations", postedDate:"2025-06-01", closingDate:"2025-06-20", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"IT Equipment",    estVal:500000000, companyCode:"BRMS", plant:"PL01", purchOrg:"PO10", desc:"BRM requires 50 laptops and 20 workstations for office expansion.", status:"Open",
    items:[
      {no:1, desc:"Laptop 14\" Core i7",   type:"Material", acctAssign:"K – Cost Center", materialNo:"IT-LPT-001", materialGroup:"IT Hardware",  plant:"PL01", qty:50,  uom:"Unit",         estPrice:8000000,  requirementDate:"2025-07-15", startDate:"", endDate:""},
      {no:2, desc:"Workstation Dell XPS",  type:"Material", acctAssign:"K – Cost Center", materialNo:"IT-WKS-002", materialGroup:"IT Hardware",  plant:"PL01", qty:20,  uom:"Unit",         estPrice:12500000, requirementDate:"2025-07-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0002", title:"Office Supplies Annual Contract",         postedDate:"2025-06-10", closingDate:"2025-06-30", postedBy:"Siti Rahma",   targets:["10000001"],           cat:"Office Supplies", estVal:150000000, companyCode:"CPMS", plant:"PL02", purchOrg:"PO20", desc:"Annual supply of office stationery and printing consumables.", status:"On Process",
    items:[
      {no:1, desc:"A4 Paper 80gsm",              type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-PPR-001", materialGroup:"Office Supplies", plant:"PL02", qty:1000, uom:"Ream", estPrice:50000,  requirementDate:"2025-07-01", startDate:"", endDate:""},
      {no:2, desc:"Ink Cartridge (Various)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-INK-002", materialGroup:"Office Supplies", plant:"PL02", qty:200,  uom:"Pcs",  estPrice:300000, requirementDate:"2025-07-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0003", title:"Security Services – HO Building",         postedDate:"2025-05-20", closingDate:"2025-06-10", postedBy:"Ahmad Rizki",  targets:["10000002"],           cat:"Services",        estVal:360000000, companyCode:"SHSI", plant:"PL03", purchOrg:"PO10", desc:"Security guard services for Head Office 24/7, 12 months.", status:"Complete",
    items:[
      {no:1, desc:"Security Guard Day Shift",   type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-SEC-001", materialGroup:"Security Services", plant:"PL03", qty:12, uom:"Person/Month", estPrice:8000000,  requirementDate:"", startDate:"2025-07-01", endDate:"2026-06-30"},
      {no:2, desc:"Security Guard Night Shift", type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-SEC-002", materialGroup:"Security Services", plant:"PL03", qty:12, uom:"Person/Month", estPrice:10000000, requirementDate:"", startDate:"2025-07-01", endDate:"2026-06-30"},
    ]},
  { id:"RFQ-2025-0004", title:"HVAC Maintenance Contract",                postedDate:"2025-06-15", closingDate:"2025-07-15", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Services",        estVal:240000000, companyCode:"GMIN", plant:"PL04", purchOrg:"PO20", desc:"Annual preventive maintenance for HVAC systems across all floors.", status:"Closed",
    items:[
      {no:1, desc:"Preventive Maintenance Visit", type:"Service", acctAssign:"K – Cost Center", materialNo:"SVC-HVC-001", materialGroup:"Facility Services", plant:"PL04", qty:12, uom:"Visit", estPrice:20000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-07-31"},
    ]},
];
export const INIT_QT = [
  { id:"QT-2025-0001", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations", vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-06-12", validUntil:"2025-07-12", totalAmt:490000000, notes:"Price includes 2-year warranty and free delivery.", status:"Submitted", files:["quotation.pdf"],                    items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:7800000,total:390000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },
  { id:"QT-2025-0002", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract",         vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"",           validUntil:"",           totalAmt:145000000, notes:"Free delivery for orders above IDR 5,000,000.",     status:"Draft",     files:[],                                  items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",unitPrice:45000,total:45000000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",unitPrice:250000,total:50000000}] },
  { id:"QT-2025-0003", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building",         vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-06-08", validUntil:"2025-07-08", totalAmt:350000000, notes:"Includes supervisor and CCTV monitoring.",           status:"Accepted",  files:["quotation.pdf","company_profile.pdf"], items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",unitPrice:7500000,total:90000000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",unitPrice:9000000,total:108000000}] },
];

// ── Theme ──────────────────────────────────────────────────────
// SAP Fiori Quartz Light — exact design tokens from quartzlight.css
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
  Open:        {c:C.ok,   bg:C.okBg},
  Closed:      {c:C.draft,bg:C.draftBg},
  Accepted:    {c:C.ok,   bg:C.okBg},
  Withdrawn:   {c:C.draft,bg:C.draftBg},
  Active:      {c:C.ok,   bg:C.okBg},
  "Posted":              {c:C.ok,    bg:C.okBg},
  "Converted to Invoice":{c:C.info,  bg:C.infoBg},
  "Cleared":             {c:C.draft, bg:C.draftBg},
  "Supplier DPR":        {c:C.gold,  bg:C.warnBg},
});
export let STC = buildSTC();
export const applyTheme = mode => { C = mode==="dark"?DARK:LIGHT; STC = buildSTC(); };

// ── Helpers ────────────────────────────────────────────────────
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
export const fmtPOs = inv => { const a=inv.poNumbers?.length?inv.poNumbers:inv.poNumber?[inv.poNumber]:[]; return a.join(", ")||"—"; };

// ── Responsive helpers (read VP.w at render time, updated by resize listener) ──
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

export const Badge = ({s}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:700,color:x.c,background:x.bg,border:`1px solid ${x.c}40`,letterSpacing:0.2}}>{s}</span>;
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
// Positive-only amount input — no spinner buttons, rejects negative/non-numeric input
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
export const Val = ({children}) => <div style={{fontSize:14,color:C.t1,lineHeight:1.5}}>{children||"—"}</div>;
export const Sep = () => <div style={{height:1,background:C.border,margin:"14px 0"}}/>;

export const Modal = ({title,onClose,children,width=640}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
    <div style={{background:C.card,borderRadius:6,width,maxWidth:"95vw",maxHeight:"90vh",overflow:"auto",boxShadow:"0 16px 48px rgba(0,0,0,0.22)"}}>
      <div style={{padding:"14px 20px",borderBottom:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.card,zIndex:1}}>
        <span style={{fontWeight:700,fontSize:16,color:C.t1}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>✕</button>
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
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",background:C.subtle,borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:13,fontWeight:700,color:C.t1}}>Filters</span>
        {activeTokens.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:10,fontSize:11,padding:"1px 9px",fontWeight:700}}>{activeTokens.length} active</span>}
      </div>
      <div style={{display:"flex",gap:8}}>
        {onAdaptFilters&&<button onClick={onAdaptFilters} style={{background:"transparent",color:C.primary,border:`1px solid ${C.border}`,borderRadius:4,padding:"0 12px",height:32,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Adapt Filters{adaptFiltersCount!=null?` (${adaptFiltersCount})`:""}</button>}
        <Btn v="neutral" sm onClick={onReset}>Reset</Btn>
        <Btn v="primary" sm onClick={onGo}>Go</Btn>
      </div>
    </div>
    <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:g4(),gap:"12px 16px"}}>
      {children}
    </div>
    {activeTokens.length>0&&(
      <div style={{padding:"6px 16px 10px",borderTop:`1px solid ${C.border}`,display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.t2,fontWeight:600,marginRight:6,letterSpacing:0.3}}>Active:</span>
        {activeTokens.map((t,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",height:"1.625rem",background:C.selection,border:`1px solid #8bb1d1`,borderRadius:"0.25rem",padding:"0 0 0 0.5rem",fontSize:12,color:C.t1,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",maxWidth:260}}>
            <span style={{fontWeight:600,color:C.t2,marginRight:3,flexShrink:0}}>{t.label}:</span>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{t.val}</span>
            <button onClick={t.onClear} title={`Remove ${t.label} filter`}
              style={{background:"none",border:"none",cursor:"pointer",color:"#6a6d70",fontSize:16,padding:"0 0.375rem",lineHeight:1,display:"flex",alignItems:"center",flexShrink:0,height:"100%"}}>×</button>
          </span>
        ))}
      </div>
    )}
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
  const [hov,setHov]=useState<string|null>(null);
  const [tf,setTf]=useState(from||"");
  const [tt,setTt]=useState(to||"");
  const todayStr=new Date().toISOString().split("T")[0];
  const [lm,setLm]=useState(()=>{const d=from?new Date(from+"T00:00"):new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{setTf(from||"");},[from]);
  useEffect(()=>{setTt(to||"");},[to]);
  useEffect(()=>{
    if(!open)return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const rm=lm.m===11?{y:lm.y+1,m:0}:{y:lm.y,m:lm.m+1};
  const prev=()=>setLm(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1});
  const next=()=>setLm(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1});
  const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DN=["Su","Mo","Tu","We","Th","Fr","Sa"];
  const mk=(y:number,m:number,d:number)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const clickDay=(ds:string)=>{if(!tf||(tf&&tt)){setTf(ds);setTt("");}else{if(ds<tf){setTt(tf);setTf(ds);}else setTt(ds);}};
  const effEnd=(!tt&&hov)?hov:tt;
  const inR=(ds:string)=>{if(!tf||!effEnd)return false;const[a,b]=tf<=effEnd?[tf,effEnd]:[effEnd,tf];return ds>a&&ds<b;};
  const isS=(ds:string)=>ds===tf;
  const isE=(ds:string)=>!!effEnd&&ds===effEnd;
  const renderMon=(y:number,m:number)=>{
    const fd=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),picking=!!(tf&&!tt);
    return(
      <div style={{flex:1}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center"}}>
          {DN.map(d=><div key={d} style={{fontSize:11,color:C.t2,fontWeight:700,padding:"4px 0"}}>{d}</div>)}
          {Array.from({length:fd},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:dim},(_,i)=>{
            const d=i+1,ds=mk(y,m,d),s=isS(ds),e=isE(ds),ir=inR(ds),isT=ds===todayStr;
            const bg=s||e?C.primary:ir?C.infoBg:"transparent";
            const col=s||e?"#fff":C.t1;
            const br=s||e?"50%":ir?"0%":"50%";
            return(
              <div key={d} onMouseEnter={()=>{if(picking)setHov(ds);}} onMouseLeave={()=>setHov(null)} onClick={()=>clickDay(ds)}
                style={{display:"flex",alignItems:"center",justifyContent:"center",height:30,cursor:"pointer",fontSize:12,
                  fontWeight:s||e?700:400,userSelect:"none" as const,background:bg,borderRadius:br,color:col,
                  ...(isT&&!s&&!e?{outline:`1.5px solid ${C.primary}`,outlineOffset:"-1px",borderRadius:"50%"}:{})
                }}
              >{d}</div>
            );
          })}
        </div>
      </div>
    );
  };
  const apply=()=>{onChange(tf,tt);setOpen(false);};
  const cancel=()=>{setTf(from||"");setTt(to||"");setHov(null);setOpen(false);};
  const clrPick=()=>{setTf("");setTt("");setHov(null);};
  const disp=from&&to?`${fmtDate(from)} – ${fmtDate(to)}`:from?`${fmtDate(from)} – …`:"";
  const isMob=mob();
  return(
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px",gap:8,boxSizing:"border-box"}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{disp||"Select date range…"}</span>
        {disp&&<button onClick={e=>{e.stopPropagation();clrPick();onChange("","");}} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:18,padding:"0",lineHeight:1,flexShrink:0}}>×</button>}
        <SapIcon name="calendar" size={14} color={C.t2} style={{flexShrink:0}}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:600,background:C.card,border:`1px solid ${C.border}`,borderRadius:6,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",padding:16,minWidth:isMob?240:490}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:10,gap:8}}>
            <button onClick={prev} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",color:C.t1,width:28,height:28,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0",fontFamily:"inherit"}}>‹</button>
            <div style={{display:"flex",flex:1,justifyContent:"space-around"}}>
              <span style={{fontWeight:700,fontSize:13,color:C.t1}}>{MN[lm.m]} {lm.y}</span>
              {!isMob&&<span style={{fontWeight:700,fontSize:13,color:C.t1}}>{MN[rm.m]} {rm.y}</span>}
            </div>
            <button onClick={next} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",color:C.t1,width:28,height:28,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0",fontFamily:"inherit"}}>›</button>
          </div>
          <div style={{display:"flex",gap:16}}>
            {renderMon(lm.y,lm.m)}
            {!isMob&&<><div style={{width:1,background:C.border,margin:"0 4px",alignSelf:"stretch"}}/>{renderMon(rm.y,rm.m)}</>}
          </div>
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:C.t2}}>
              {tf?<><span style={{fontWeight:700,color:C.t1}}>{fmtDate(tf)}</span><span style={{margin:"0 5px"}}>–</span>{tt?<span style={{fontWeight:700,color:C.t1}}>{fmtDate(tt)}</span>:<span style={{fontStyle:"italic"}}>pick end date</span>}</>:<span>Click a start date</span>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <Btn v="neutral" sm onClick={clrPick}>Clear</Btn>
              <Btn v="neutral" sm onClick={cancel}>Cancel</Btn>
              <Btn v="primary" sm onClick={apply}>Apply</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line
declare global { namespace JSX { interface IntrinsicElements { 'ui5-icon': any } } }
export const SapIcon = ({name,size=16,color="",style={}}:{name:string,size?:number,color?:string,style?:any}) => (
  <ui5-icon name={name} style={{width:size,height:size,display:"inline-block",verticalAlign:"middle",...(color?{color}:{}),...style}}/>
);

export const Th = ({children}) => <th style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:700,color:C.t2,borderBottom:`2px solid ${C.border}`,background:C.subtle,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{children}</th>;
export const Td = ({children,style={}}) => <td style={{padding:"10px 14px",fontSize:14,color:C.t1,borderBottom:`1px solid ${C.border}`,...style}}>{children}</td>;

// ── Value Help Dialog (sap.ui.comp.valuehelpdialog.ValueHelpDialog) ──────────
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
                          {c.label} <span style={{color:C.t2,fontSize:9}}>▲</span>
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
                      <button onClick={()=>setConds(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
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
                <button onClick={()=>setLocalSel(p=>p.filter(k=>k!==key))} style={{background:"none",border:"none",cursor:"pointer",color:C.info,padding:"0 0 0 2px",fontSize:14,lineHeight:1}}>×</button>
              </span>
            ))}
            {localSel.length>0&&<button onClick={()=>{setLocalSel([]);setConds([]);}} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:18,padding:"0 2px",lineHeight:1}} title="Clear all">×</button>}
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
  <div onClick={onOpen} style={{position:"relative",display:"flex",alignItems:"center",minHeight:28,border:`1px solid ${C.border}`,borderRadius:2,background:C.field,padding:"2px 28px 2px 4px",flexWrap:"wrap",gap:3,cursor:"pointer"}}>
    {selected.length===0&&<span style={{color:"#bfbfbf",fontSize:12,padding:"1px 2px"}}>{placeholder}</span>}
    {selected.map(k=>(
      <span key={k} style={{display:"inline-flex",alignItems:"center",background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 7px",fontSize:11,color:C.info,whiteSpace:"nowrap"}}>{getLabel(k)}</span>
    ))}
    <button onClick={e=>{e.stopPropagation();onOpen();}} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}>
      <SapIcon name="value-help" size={14} color="#6a6d70"/>
    </button>
  </div>
);
