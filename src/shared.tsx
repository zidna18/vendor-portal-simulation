import { useState, useEffect, useRef } from "react";

// â"€â"€ Mock Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export const USERS = [
  { id:"V001", role:"vendor", username:"vendor1", password:"demo123", name:"PT Maju Bersama", vendorId:"10000001" },
  { id:"V002", role:"vendor", username:"vendor2", password:"demo123", name:"CV Sukses Mandiri", vendorId:"10000002" },
  { id:"B001", role:"brm",    username:"brm.user", password:"demo123", name:"Ahmad Rizki",  title:"Procurement Manager" },
  { id:"B002", role:"brm",    username:"buyer1",   password:"demo123", name:"Siti Rahma",   title:"Senior Buyer" },
  { id:"A001", role:"approver", username:"approver1", password:"demo123", name:"Budi Santoso", title:"Finance Approver" },
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
  { id:"RFQ-2025-0041", title:"Conveyor Belt Replacement – Crushing Plant",      postedDate:"2025-08-15", closingDate:"2025-09-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Goods",            estVal:680000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Replacement of conveyor belts ST1200 grade for primary and secondary crushing plant.", status:"Created",
    items:[
      {no:1, desc:"Conveyor Belt ST1200 – 1200mm W (per meter)", type:"Material", acctAssign:"P – Project", materialNo:"CBT-ST1-001", materialGroup:"Conveyor Parts", plant:"PL02", qty:800,  uom:"Meter", estPrice:750000, requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:2, desc:"Belt Fastener & Splicing Kit",                 type:"Material", acctAssign:"P – Project", materialNo:"CBT-FST-002", materialGroup:"Conveyor Parts", plant:"PL02", qty:30,   uom:"Set",   estPrice:3500000,requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0042", title:"Cloud ERP Subscription – SAP S/4HANA Public Cloud", postedDate:"2025-08-16", closingDate:"2025-09-16", postedBy:"Siti Rahma",   targets:["10000001"],            cat:"IT Services",      estVal:1500000000, companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual subscription and implementation support for SAP S/4HANA Public Cloud for BRM Group.", status:"Created",
    items:[
      {no:1, desc:"SAP S/4HANA Public Cloud – Annual Subscription", type:"Service", acctAssign:"K – Cost Center", materialNo:"SAP-SUB-001", materialGroup:"Software License", plant:"PL01", qty:1, uom:"Annual", estPrice:1200000000, requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:2, desc:"SAP Basis & Support Services",                    type:"Service", acctAssign:"K – Cost Center", materialNo:"SAP-BSS-002", materialGroup:"IT Consulting",    plant:"PL01", qty:12,uom:"Month",  estPrice:25000000,  requirementDate:"", startDate:"2026-01-01", endDate:"2026-12-31"},
    ]},
  { id:"RFQ-2025-0043", title:"Bulk Bag (FIBC) Supply – Mineral Concentrate",     postedDate:"2025-08-17", closingDate:"2025-09-17", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Goods",            estVal:320000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Annual supply of 1-ton FIBC bulk bags for mineral concentrate export packaging.", status:"Created",
    items:[
      {no:1, desc:"FIBC Bulk Bag 1T – 4-loop (per unit)", type:"Material", acctAssign:"P – Project", materialNo:"PKG-FBC-001", materialGroup:"Packaging Materials", plant:"PL05", qty:20000, uom:"Pcs", estPrice:16000, requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0044", title:"Stationery & Office Consumables – Q4 2025",        postedDate:"2025-08-18", closingDate:"2025-09-18", postedBy:"Siti Rahma",   targets:["10000001"],            cat:"Office Supplies",  estVal:75000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Q4 procurement of stationery, toner cartridges, and general office consumables for all departments.", status:"Created",
    items:[
      {no:1, desc:"A4 Paper 80gsm (500 sheets/ream)",      type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-PPR-004", materialGroup:"Office Supplies", plant:"PL01", qty:2000, uom:"Ream", estPrice:55000,  requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Laser Toner Cartridge (HP LaserJet)",   type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-TNR-002", materialGroup:"Office Supplies", plant:"PL01", qty:150,  uom:"Pcs",  estPrice:350000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:3, desc:"Whiteboard Marker Set (12 colors)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-MRK-003", materialGroup:"Office Supplies", plant:"PL01", qty:100,  uom:"Set",  estPrice:85000,  requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0045", title:"Pump Overhaul – Slurry Pumps Batch 2025",          postedDate:"2025-08-19", closingDate:"2025-09-19", postedBy:"Ahmad Rizki",  targets:["10000002"],            cat:"Engineering",      estVal:560000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Overhaul and reconditioning of 8 units slurry pumps at SHS processing plant – annual maintenance program.", status:"Created",
    items:[
      {no:1, desc:"Slurry Pump Overhaul (per unit)",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"PMP-OVH-001", materialGroup:"Maintenance Svc", plant:"PL03", qty:8,  uom:"Unit",    estPrice:55000000, requirementDate:"", startDate:"2025-11-01", endDate:"2025-12-31"},
      {no:2, desc:"Wear Parts Kit (impeller, casing liner)", type:"Material", acctAssign:"K – Cost Center", materialNo:"PMP-WPK-002", materialGroup:"Spare Parts",     plant:"PL03", qty:8,  uom:"Set",     estPrice:15000000, requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0046", title:"Uniform & Workwear – Annual Supply 2026",          postedDate:"2025-08-20", closingDate:"2025-09-20", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Goods",            estVal:180000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual supply of company uniforms and field workwear for all BRM Group employees (estimated 600 persons).", status:"Created",
    items:[
      {no:1, desc:"Office Uniform Set (shirt + pants)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"UNF-OFC-001", materialGroup:"Uniforms", plant:"PL01", qty:600,  uom:"Set", estPrice:180000, requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:2, desc:"Field Coverall Wearpack",                type:"Material", acctAssign:"K – Cost Center", materialNo:"UNF-FLD-002", materialGroup:"Uniforms", plant:"PL01", qty:400,  uom:"Pcs", estPrice:120000, requirementDate:"2026-01-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0047", title:"CCTV & Access Control – Site Security Upgrade",    postedDate:"2025-08-21", closingDate:"2025-09-21", postedBy:"Ahmad Rizki",  targets:["10000001"],            cat:"IT Equipment",     estVal:420000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply and installation of IP CCTV cameras, NVR, and access control system for CPMS site perimeter.", status:"Created",
    items:[
      {no:1, desc:"IP Camera 4MP Outdoor (Hikvision)",      type:"Material", acctAssign:"P – Project", materialNo:"SEC-CAM-001", materialGroup:"Security Equip", plant:"PL02", qty:80,  uom:"Unit",    estPrice:2500000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"NVR 64-channel + Storage (30TB)",        type:"Material", acctAssign:"P – Project", materialNo:"SEC-NVR-002", materialGroup:"Security Equip", plant:"PL02", qty:4,   uom:"Unit",    estPrice:45000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:3, desc:"Access Control System – Gate",           type:"Service",  acctAssign:"P – Project", materialNo:"SEC-ACS-003", materialGroup:"Security Equip", plant:"PL02", qty:1,   uom:"Lump Sum",estPrice:80000000, requirementDate:"", startDate:"2025-11-15", endDate:"2025-12-31"},
    ]},
  { id:"RFQ-2025-0048", title:"Photovoltaic Solar Panel – Camp Power",            postedDate:"2025-08-22", closingDate:"2025-09-22", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Engineering",      estVal:1100000000, companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Design, supply, and installation of 500 kWp solar PV hybrid system to reduce diesel dependency at Linge camp.", status:"Created",
    items:[
      {no:1, desc:"Solar Panel 550Wp Monocrystalline",      type:"Material", acctAssign:"P – Project", materialNo:"SOL-PNL-001", materialGroup:"Energy Equip", plant:"PL05", qty:910,  uom:"Unit",    estPrice:850000,    requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:2, desc:"Inverter 100kW Grid-Tie",                type:"Material", acctAssign:"P – Project", materialNo:"SOL-INV-002", materialGroup:"Energy Equip", plant:"PL05", qty:5,    uom:"Unit",    estPrice:75000000,  requirementDate:"2026-01-01", startDate:"", endDate:""},
      {no:3, desc:"EPC & Commissioning Service",            type:"Service",  acctAssign:"P – Project", materialNo:"SOL-EPC-003", materialGroup:"Energy Equip", plant:"PL05", qty:1,    uom:"Lump Sum",estPrice:325000000, requirementDate:"", startDate:"2026-01-15", endDate:"2026-04-30"},
    ]},
  { id:"RFQ-2025-0049", title:"Drilling Consumables – Diamond Core Bits",         postedDate:"2025-08-23", closingDate:"2025-09-23", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Goods",            estVal:490000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Supply of diamond core drill bits (NQ, HQ, PQ) and drill rods for Gorontalo exploration program.", status:"Created",
    items:[
      {no:1, desc:"Diamond Core Bit NQ (per unit)",         type:"Material", acctAssign:"P – Project", materialNo:"DRL-BIT-001", materialGroup:"Drilling Supplies", plant:"PL04", qty:500,  uom:"Pcs", estPrice:550000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:2, desc:"Diamond Core Bit HQ (per unit)",         type:"Material", acctAssign:"P – Project", materialNo:"DRL-BIT-002", materialGroup:"Drilling Supplies", plant:"PL04", qty:300,  uom:"Pcs", estPrice:750000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:3, desc:"Drill Rod NQ 3m (per rod)",              type:"Material", acctAssign:"P – Project", materialNo:"DRL-ROD-003", materialGroup:"Drilling Supplies", plant:"PL04", qty:200,  uom:"Pcs", estPrice:1200000,  requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0050", title:"Air Compressor Rental – Plant Maintenance",        postedDate:"2025-08-24", closingDate:"2025-09-24", postedBy:"Siti Rahma",   targets:["10000002"],            cat:"Equipment Rental",  estVal:216000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Rental of portable diesel air compressors (375 CFM) for plant maintenance and pneumatic tool operations.", status:"Created",
    items:[
      {no:1, desc:"Air Compressor 375 CFM Diesel Rental",   type:"Service",  acctAssign:"K – Cost Center", materialNo:"EQP-ACP-001", materialGroup:"Equipment Rental", plant:"PL03", qty:12, uom:"Month", estPrice:18000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-10-31"},
    ]},
  { id:"RFQ-2025-0001", title:"Procurement of Laptops & Workstations", postedDate:"2025-06-01", closingDate:"2025-06-20", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"IT Equipment",    estVal:500000000, companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"BRM requires 50 laptops and 20 workstations for office expansion.", status:"Complete",
    items:[
      {no:1, desc:"Laptop 14\" Core i7",   type:"Material", acctAssign:"K – Cost Center", materialNo:"IT-LPT-001", materialGroup:"IT Hardware",  plant:"PL01", qty:50,  uom:"Unit",         estPrice:8000000,  requirementDate:"2025-07-15", startDate:"", endDate:""},
      {no:2, desc:"Workstation Dell XPS",  type:"Material", acctAssign:"K – Cost Center", materialNo:"IT-WKS-002", materialGroup:"IT Hardware",  plant:"PL01", qty:20,  uom:"Unit",         estPrice:12500000, requirementDate:"2025-07-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0002", title:"Office Supplies Annual Contract",         postedDate:"2025-06-10", closingDate:"2025-06-30", postedBy:"Siti Rahma",   targets:["10000001"],           cat:"Office Supplies", estVal:150000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Annual supply of office stationery and printing consumables.", status:"On Process",
    items:[
      {no:1, desc:"A4 Paper 80gsm",              type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-PPR-001", materialGroup:"Office Supplies", plant:"PL02", qty:1000, uom:"Ream", estPrice:50000,  requirementDate:"2025-07-01", startDate:"", endDate:""},
      {no:2, desc:"Ink Cartridge (Various)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"OFF-INK-002", materialGroup:"Office Supplies", plant:"PL02", qty:200,  uom:"Pcs",  estPrice:300000, requirementDate:"2025-07-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0003", title:"Security Services – HO Building",         postedDate:"2025-05-20", closingDate:"2025-06-10", postedBy:"Ahmad Rizki",  targets:["10000002"],           cat:"Services",        estVal:360000000, companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Security guard services for Head Office 24/7, 12 months.", status:"Pending Approval", submittedForApprovalAt:"2025-06-12", submittedForApprovalBy:"Ahmad Rizki",
    items:[
      {no:1, desc:"Security Guard Day Shift",   type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-SEC-001", materialGroup:"Security Services", plant:"PL03", qty:12, uom:"Person/Month", estPrice:8000000,  requirementDate:"", startDate:"2025-07-01", endDate:"2026-06-30"},
      {no:2, desc:"Security Guard Night Shift", type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-SEC-002", materialGroup:"Security Services", plant:"PL03", qty:12, uom:"Person/Month", estPrice:10000000, requirementDate:"", startDate:"2025-07-01", endDate:"2026-06-30"},
    ]},
  { id:"RFQ-2025-0004", title:"HVAC Maintenance Contract",                    postedDate:"2025-06-15", closingDate:"2025-07-15", postedBy:"Siti Rahma",  targets:["10000001","10000002"], cat:"Services",         estVal:240000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Annual preventive maintenance for HVAC systems across all floors.", status:"Closed",
    items:[
      {no:1, desc:"Preventive Maintenance Visit",      type:"Service",  acctAssign:"K – Cost Center", materialNo:"SVC-HVC-001", materialGroup:"Facility Services",   plant:"PL04", qty:12,   uom:"Visit",     estPrice:20000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-07-31"},
    ]},
  { id:"RFQ-2025-0005", title:"Explosive Materials – Blasting Supplies",      postedDate:"2025-06-20", closingDate:"2025-07-20", postedBy:"Ahmad Rizki", targets:["10000001","10000002"], cat:"Goods",            estVal:875000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply of ANFO, detonators, and blasting accessories for open-pit operations.", status:"Open",
    items:[
      {no:1, desc:"ANFO Bulk Explosive",               type:"Material", acctAssign:"P – Project",     materialNo:"MIN-EXP-001", materialGroup:"Mining Materials",    plant:"PL02", qty:50000,uom:"KG",      estPrice:8500,     requirementDate:"2025-08-15", startDate:"", endDate:""},
      {no:2, desc:"Electric Detonator",                type:"Material", acctAssign:"P – Project",     materialNo:"MIN-DET-002", materialGroup:"Mining Materials",    plant:"PL02", qty:2000, uom:"Pcs",     estPrice:35000,    requirementDate:"2025-08-15", startDate:"", endDate:""},
      {no:3, desc:"Safety Fuse (100m/roll)",           type:"Material", acctAssign:"P – Project",     materialNo:"MIN-FUS-003", materialGroup:"Mining Materials",    plant:"PL02", qty:500,  uom:"Roll",    estPrice:125000,   requirementDate:"2025-08-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0006", title:"Genset Rental – Remote Site Power",            postedDate:"2025-06-22", closingDate:"2025-07-22", postedBy:"Siti Rahma",  targets:["10000002"],            cat:"Services",         estVal:480000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Rental of diesel generators (500 kVA) for Linge Minerals remote field site for 12 months.", status:"On Process",
    items:[
      {no:1, desc:"Genset 500 kVA Rental",             type:"Service",  acctAssign:"P – Project",     materialNo:"SVC-GEN-001", materialGroup:"Equipment Rental",    plant:"PL05", qty:12,   uom:"Month",   estPrice:40000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-07-31"},
    ]},
  { id:"RFQ-2025-0007", title:"Personal Protective Equipment (PPE)",          postedDate:"2025-06-25", closingDate:"2025-07-25", postedBy:"Ahmad Rizki", targets:["10000001","10000002"], cat:"Goods",            estVal:120000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual PPE procurement for all subsidiaries: helmets, boots, vests, gloves, and goggles.", status:"Open",
    items:[
      {no:1, desc:"Safety Helmet (SNI certified)",     type:"Material", acctAssign:"K – Cost Center", materialNo:"PPE-HLM-001", materialGroup:"Safety Equipment",    plant:"PL01", qty:500,  uom:"Pcs",     estPrice:75000,    requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:2, desc:"Safety Boot (Steel Toe)",           type:"Material", acctAssign:"K – Cost Center", materialNo:"PPE-BOT-002", materialGroup:"Safety Equipment",    plant:"PL01", qty:300,  uom:"Pair",    estPrice:350000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:3, desc:"High-Visibility Safety Vest",       type:"Material", acctAssign:"K – Cost Center", materialNo:"PPE-VST-003", materialGroup:"Safety Equipment",    plant:"PL01", qty:600,  uom:"Pcs",     estPrice:85000,    requirementDate:"2025-08-20", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0008", title:"ERP Consulting Services – SAP Add-On",         postedDate:"2025-06-10", closingDate:"2025-07-10", postedBy:"Ahmad Rizki", targets:["10000001","10000002"], cat:"IT Services",      estVal:650000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Consulting & implementation services for SAP Public Cloud add-on modules (BTP, Analytics).", status:"Pending Approval", submittedForApprovalAt:"2025-06-25", submittedForApprovalBy:"Siti Rahma",
    items:[
      {no:1, desc:"SAP BTP Integration Consultant",   type:"Service",  acctAssign:"P – Project",     materialNo:"SVC-SAP-001", materialGroup:"IT Consulting",       plant:"PL01", qty:6,    uom:"Month",   estPrice:85000000, requirementDate:"", startDate:"2025-08-01", endDate:"2026-01-31"},
      {no:2, desc:"SAP Analytics Cloud Specialist",   type:"Service",  acctAssign:"P – Project",     materialNo:"SVC-SAP-002", materialGroup:"IT Consulting",       plant:"PL01", qty:4,    uom:"Month",   estPrice:75000000, requirementDate:"", startDate:"2025-09-01", endDate:"2025-12-31"},
    ]},
  { id:"RFQ-2025-0009", title:"Water Treatment Chemicals – Mining Site",       postedDate:"2025-06-28", closingDate:"2025-07-28", postedBy:"Siti Rahma",  targets:["10000001","10000002"], cat:"Goods",            estVal:195000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply of coagulants, flocculants, and pH adjustment chemicals for wastewater treatment at Palu site.", status:"Open",
    items:[
      {no:1, desc:"Coagulant PAC (25 kg/bag)",        type:"Material", acctAssign:"K – Cost Center", materialNo:"CHM-PAC-001", materialGroup:"Chemicals",           plant:"PL02", qty:500,  uom:"Bag",     estPrice:180000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:2, desc:"Anionic Flocculant (20 kg/bag)",   type:"Material", acctAssign:"K – Cost Center", materialNo:"CHM-FLC-002", materialGroup:"Chemicals",           plant:"PL02", qty:300,  uom:"Bag",     estPrice:250000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
      {no:3, desc:"Caustic Soda (NaOH) 50 kg/drum",  type:"Material", acctAssign:"K – Cost Center", materialNo:"CHM-NHO-003", materialGroup:"Chemicals",           plant:"PL02", qty:150,  uom:"Drum",    estPrice:420000,   requirementDate:"2025-08-20", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0010", title:"Medical & First Aid Supplies – All Sites",      postedDate:"2025-06-29", closingDate:"2025-07-29", postedBy:"Siti Rahma",  targets:["10000001","10000002"], cat:"Medical Supplies", estVal:88000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual procurement of first aid kits, medicines, and medical consumables for all 5 site clinics.", status:"Open",
    items:[
      {no:1, desc:"First Aid Kit (50-person)",        type:"Material", acctAssign:"K – Cost Center", materialNo:"MED-FAK-001", materialGroup:"Medical Supplies",    plant:"PL01", qty:25,   uom:"Set",     estPrice:1200000,  requirementDate:"2025-08-10", startDate:"", endDate:""},
      {no:2, desc:"AED Defibrillator",                type:"Material", acctAssign:"K – Cost Center", materialNo:"MED-AED-002", materialGroup:"Medical Equipment",   plant:"PL01", qty:5,    uom:"Unit",    estPrice:12000000, requirementDate:"2025-08-10", startDate:"", endDate:""},
      {no:3, desc:"Stretcher & Immobilization Board", type:"Material", acctAssign:"K – Cost Center", materialNo:"MED-STR-003", materialGroup:"Medical Equipment",   plant:"PL01", qty:10,   uom:"Pcs",     estPrice:850000,   requirementDate:"2025-08-10", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0011", title:"Drone Survey & Aerial Mapping Services",        postedDate:"2025-06-30", closingDate:"2025-07-30", postedBy:"Ahmad Rizki",  targets:["10000002"],            cat:"Survey Services",   estVal:320000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Topographic drone survey and 3D terrain modelling for Gorontalo open-pit expansion area (Â±2,500 ha).", status:"Open",
    items:[
      {no:1, desc:"Drone Aerial Survey (per hectare)", type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-DRN-001", materialGroup:"Survey Services",     plant:"PL04", qty:2500, uom:"Ha",      estPrice:120000,   requirementDate:"2025-08-25", startDate:"", endDate:""},
      {no:2, desc:"3D Point Cloud Processing & Report",type:"Service",  acctAssign:"P – Project",    materialNo:"SVC-DRN-002", materialGroup:"Survey Services",     plant:"PL04", qty:1,    uom:"Lump Sum",estPrice:45000000, requirementDate:"2025-09-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0012", title:"Heavy Equipment Rental – Excavator & Dozer",   postedDate:"2025-07-01", closingDate:"2025-08-01", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Equipment Rental",  estVal:960000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Rental of heavy earthmoving equipment for Palu open-pit stripping operations – 12 months.", status:"Open",
    items:[
      {no:1, desc:"Hydraulic Excavator 36T (Komatsu PC360)", type:"Service", acctAssign:"P – Project", materialNo:"EQP-EXC-001", materialGroup:"Heavy Equipment", plant:"PL02", qty:12, uom:"Month", estPrice:55000000, requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
      {no:2, desc:"Bulldozer D85 (Komatsu)",                  type:"Service", acctAssign:"P – Project", materialNo:"EQP-DZR-002", materialGroup:"Heavy Equipment", plant:"PL02", qty:12, uom:"Month", estPrice:25000000, requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
    ]},
  { id:"RFQ-2025-0013", title:"Laboratory Testing Services – Ore Samples",     postedDate:"2025-07-02", closingDate:"2025-08-02", postedBy:"Ahmad Rizki",  targets:["10000001"],            cat:"Lab Services",      estVal:144000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Third-party geochemical assay and fire assay services for Gorontalo gold ore samples.", status:"Open",
    items:[
      {no:1, desc:"Fire Assay – Au (per sample)",     type:"Service",  acctAssign:"P – Project",    materialNo:"LAB-FAS-001", materialGroup:"Lab Services",        plant:"PL04", qty:2000, uom:"Sample", estPrice:45000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
      {no:2, desc:"ICP-MS Multi-element Analysis",   type:"Service",  acctAssign:"P – Project",    materialNo:"LAB-ICP-002", materialGroup:"Lab Services",        plant:"PL04", qty:1500, uom:"Sample", estPrice:55000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0014", title:"Catering & Mess Hall Services – Aceh Camp",     postedDate:"2025-07-03", closingDate:"2025-08-03", postedBy:"Siti Rahma",   targets:["10000002"],            cat:"Services",          estVal:540000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Full catering services for 150-person mining camp at Linge Minerals, Aceh – 12 months.", status:"On Process",
    items:[
      {no:1, desc:"Catering per Person per Day",      type:"Service",  acctAssign:"K – Cost Center", materialNo:"CAT-MPD-001", materialGroup:"Catering Services",   plant:"PL05", qty:54750, uom:"Person/Day", estPrice:85000, requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
    ]},
  { id:"RFQ-2025-0015", title:"Telecommunication – VSAT & Radio System",       postedDate:"2025-07-05", closingDate:"2025-08-05", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"IT Services",       estVal:410000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"VSAT internet and VHF/UHF radio communication system for remote Aceh camp.", status:"Closed",
    items:[
      {no:1, desc:"VSAT Installation & Hardware",    type:"Material", acctAssign:"P – Project",    materialNo:"TEL-VST-001", materialGroup:"Telecom Equipment",   plant:"PL05", qty:1,    uom:"Set",     estPrice:180000000, requirementDate:"2025-09-15", startDate:"", endDate:""},
      {no:2, desc:"VSAT Monthly Bandwidth (100Mbps)",type:"Service",  acctAssign:"P – Project",    materialNo:"TEL-BND-002", materialGroup:"Telecom Services",    plant:"PL05", qty:12,   uom:"Month",   estPrice:15000000,  requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0016", title:"Waste Management & Environmental Services",      postedDate:"2025-07-07", closingDate:"2025-08-07", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Environmental",     estVal:280000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Hazardous and non-hazardous waste collection, treatment, and disposal services for all BRM sites.", status:"Open",
    items:[
      {no:1, desc:"B3 Hazardous Waste Handling (kg)", type:"Service", acctAssign:"K – Cost Center", materialNo:"ENV-B3W-001", materialGroup:"Waste Management",    plant:"PL01", qty:50000,uom:"KG",      estPrice:3500,      requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
      {no:2, desc:"Non-B3 Waste Disposal (month)",   type:"Service",  acctAssign:"K – Cost Center", materialNo:"ENV-NBW-002", materialGroup:"Waste Management",    plant:"PL01", qty:12,   uom:"Month",   estPrice:8000000,   requirementDate:"", startDate:"2025-09-01", endDate:"2026-08-31"},
    ]},
  { id:"RFQ-2025-0017", title:"Fuel Supply – Diesel & Avgas",                   postedDate:"2025-07-08", closingDate:"2025-08-08", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Goods",             estVal:1200000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Annual supply of HSD diesel fuel and aviation gasoline for plant and helicopter operations in Palu.", status:"Open",
    items:[
      {no:1, desc:"HSD Diesel Fuel (Liter)",         type:"Material", acctAssign:"P – Project",    materialNo:"FUL-HSD-001", materialGroup:"Fuel & Energy",       plant:"PL02", qty:3000000,uom:"Liter",  estPrice:330,       requirementDate:"2025-09-01", startDate:"", endDate:""},
      {no:2, desc:"Aviation Gasoline – Avgas 100LL", type:"Material", acctAssign:"P – Project",    materialNo:"FUL-AVG-002", materialGroup:"Fuel & Energy",       plant:"PL02", qty:50000,  uom:"Liter",  estPrice:18000,     requirementDate:"2025-09-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0018", title:"Tailings Dam Monitoring – Instrumentation",      postedDate:"2025-07-10", closingDate:"2025-08-10", postedBy:"Siti Rahma",   targets:["10000001"],            cat:"Engineering",       estVal:375000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Supply and installation of geotechnical instrumentation for tailings storage facility monitoring at SHS.", status:"Open",
    items:[
      {no:1, desc:"Piezometer (vibrating wire)",     type:"Material", acctAssign:"P – Project",    materialNo:"GEO-PIZ-001", materialGroup:"Geotechnical Equip",  plant:"PL03", qty:20,   uom:"Unit",    estPrice:8500000,   requirementDate:"2025-09-20", startDate:"", endDate:""},
      {no:2, desc:"Inclinometer Casing & Probe",     type:"Material", acctAssign:"P – Project",    materialNo:"GEO-INC-002", materialGroup:"Geotechnical Equip",  plant:"PL03", qty:5,    uom:"Set",     estPrice:25000000,  requirementDate:"2025-09-20", startDate:"", endDate:""},
      {no:3, desc:"Data Logger & Telemetry Unit",    type:"Material", acctAssign:"P – Project",    materialNo:"GEO-DLG-003", materialGroup:"Geotechnical Equip",  plant:"PL03", qty:3,    uom:"Unit",    estPrice:35000000,  requirementDate:"2025-09-20", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0019", title:"Office Renovation – Jakarta HQ 5th Floor",       postedDate:"2025-07-12", closingDate:"2025-08-12", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Construction",      estVal:850000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Interior renovation of BRM HQ 5th floor: open-plan workspace, meeting rooms, and executive lounge.", status:"Complete",
    items:[
      {no:1, desc:"Interior Design & Build Works",   type:"Service",  acctAssign:"K – Cost Center", materialNo:"CON-INT-001", materialGroup:"Construction Works",  plant:"PL01", qty:1,    uom:"Lump Sum",estPrice:700000000, requirementDate:"", startDate:"2025-10-01", endDate:"2026-01-31"},
      {no:2, desc:"Furniture & Fitout Supply",       type:"Material", acctAssign:"K – Cost Center", materialNo:"FRN-OFC-002", materialGroup:"Furniture",           plant:"PL01", qty:1,    uom:"Lump Sum",estPrice:150000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0020", title:"Training – Mine Safety & Emergency Response",    postedDate:"2025-07-14", closingDate:"2025-08-14", postedBy:"Siti Rahma",   targets:["10000002"],            cat:"Training",          estVal:96000000,   companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Mandatory mine safety, first aid, fire-fighting, and emergency response training for 200 employees.", status:"Open",
    items:[
      {no:1, desc:"Mine Safety (SIMTK) Training",    type:"Service",  acctAssign:"K – Cost Center", materialNo:"TRN-SFT-001", materialGroup:"Training Services",   plant:"PL01", qty:200,  uom:"Person",  estPrice:200000,    requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Emergency Response Drill",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"TRN-EMG-002", materialGroup:"Training Services",   plant:"PL01", qty:4,    uom:"Session", estPrice:12000000,  requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  // ── RFQ-2025-0021 to 0040 ────────────────────────────────────
  { id:"RFQ-2025-0021", title:"Road Infrastructure – Haul Road Upgrade",         postedDate:"2025-07-15", closingDate:"2025-08-15", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Construction",       estVal:2500000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Upgrade 15km haul road from pit to ROM pad: subgrade, base, asphalt surfacing, and drainage.", status:"Pending Approval", submittedForApprovalAt:"2025-08-10", submittedForApprovalBy:"Ahmad Rizki",
    items:[
      {no:1, desc:"Road Subgrade Preparation",        type:"Service",  acctAssign:"P – Project", materialNo:"CON-RDS-001", materialGroup:"Civil Works",          plant:"PL02", qty:15000, uom:"M2",      estPrice:45000,     requirementDate:"", startDate:"2025-09-15", endDate:"2025-12-31"},
      {no:2, desc:"Asphalt Wearing Course (AC-WC)",   type:"Material", acctAssign:"P – Project", materialNo:"CON-ASP-002", materialGroup:"Civil Works",          plant:"PL02", qty:15000, uom:"M2",      estPrice:120000,    requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0022", title:"Lubricants & Greases – Heavy Equipment Fleet",    postedDate:"2025-07-17", closingDate:"2025-08-17", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Goods",              estVal:420000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Annual supply of engine oils, hydraulic fluid, and greases for heavy equipment fleet at Gorontalo site.", status:"Pending Approval", submittedForApprovalAt:"2025-08-15", submittedForApprovalBy:"Siti Rahma",
    items:[
      {no:1, desc:"Shell Rimula R4 15W-40 (208L drum)", type:"Material", acctAssign:"K – Cost Center", materialNo:"LUB-OIL-001", materialGroup:"Lubricants", plant:"PL04", qty:300, uom:"Drum",   estPrice:950000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
      {no:2, desc:"Shell Gadus S3 Grease (18kg bucket)",type:"Material", acctAssign:"K – Cost Center", materialNo:"LUB-GRS-002", materialGroup:"Lubricants", plant:"PL04", qty:200, uom:"Bucket", estPrice:500000,    requirementDate:"2025-09-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0023", title:"Legal Advisory Services – Mining Permits",         postedDate:"2025-07-18", closingDate:"2025-08-18", postedBy:"Ahmad Rizki",  targets:["10000001"],            cat:"Professional Svc",  estVal:420000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Legal advisory retainer for mining permit renewals (IUP, PKP2B) and regulatory compliance at ESDM.", status:"Open",
    items:[
      {no:1, desc:"Legal Retainer – Mining Law",       type:"Service",  acctAssign:"K – Cost Center", materialNo:"LGL-RTN-001", materialGroup:"Legal Services", plant:"PL01", qty:12,   uom:"Month",   estPrice:35000000,  requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0024", title:"Insurance – Property All Risk & Public Liability", postedDate:"2025-07-20", closingDate:"2025-08-20", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Insurance",          estVal:600000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual insurance coverage for all assets and public liability for BRM Group subsidiaries.", status:"Complete",
    items:[
      {no:1, desc:"Property All Risk Premium",         type:"Service",  acctAssign:"K – Cost Center", materialNo:"INS-PAR-001", materialGroup:"Insurance",      plant:"PL01", qty:1,    uom:"Annual",  estPrice:360000000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Public Liability Premium",          type:"Service",  acctAssign:"K – Cost Center", materialNo:"INS-PLI-002", materialGroup:"Insurance",      plant:"PL01", qty:1,    uom:"Annual",  estPrice:200000000, requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0025", title:"Fire Protection System – Plant Building",          postedDate:"2025-07-22", closingDate:"2025-08-22", postedBy:"Ahmad Rizki",  targets:["10000001"],            cat:"Engineering",        estVal:780000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Design, supply, and installation of NFPA 13 automatic sprinkler and fire hydrant system.", status:"Complete",
    items:[
      {no:1, desc:"Sprinkler System Installation",     type:"Service",  acctAssign:"P – Project",     materialNo:"FPS-SPR-001", materialGroup:"Fire Safety",    plant:"PL03", qty:1,    uom:"Lump Sum",estPrice:540000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-01-31"},
      {no:2, desc:"Fire Hydrant & Hose Reel",          type:"Material", acctAssign:"P – Project",     materialNo:"FPS-HYD-002", materialGroup:"Fire Safety",    plant:"PL03", qty:20,   uom:"Unit",    estPrice:10000000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0026", title:"Chartered Flight – Helicopter Services",           postedDate:"2025-07-24", closingDate:"2025-08-24", postedBy:"Siti Rahma",   targets:["10000002"],            cat:"Services",           estVal:1620000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Monthly charter of Bell 412 helicopter for personnel rotation and cargo between Palu HQ and remote camps.", status:"Open",
    items:[
      {no:1, desc:"Helicopter Charter – Bell 412",    type:"Service",  acctAssign:"P – Project",     materialNo:"AIR-HLP-001", materialGroup:"Aviation",       plant:"PL02", qty:12,   uom:"Month",   estPrice:135000000, requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0027", title:"Scaffolding & Access Services – Plant Shutdown",   postedDate:"2025-07-26", closingDate:"2025-08-26", postedBy:"Ahmad Rizki",  targets:["10000001","10000002"], cat:"Services",           estVal:320000000,  companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Scaffolding erection, maintenance, and dismantling for annual plant shutdown turnaround.", status:"Complete",
    items:[
      {no:1, desc:"Scaffold Erection & Dismantling",  type:"Service",  acctAssign:"K – Cost Center", materialNo:"SCA-ERC-001", materialGroup:"Access Services", plant:"PL04", qty:5000, uom:"M2",      estPrice:45000,     requirementDate:"", startDate:"2025-10-01", endDate:"2025-11-30"},
      {no:2, desc:"Scaffold Monthly Rental",          type:"Service",  acctAssign:"K – Cost Center", materialNo:"SCA-RNT-002", materialGroup:"Access Services", plant:"PL04", qty:2,    uom:"Month",   estPrice:35000000,  requirementDate:"", startDate:"2025-10-01", endDate:"2025-11-30"},
    ]},
  { id:"RFQ-2025-0028", title:"IT Hardware Refresh – Server & Network",           postedDate:"2025-07-28", closingDate:"2025-08-28", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"IT Equipment",       estVal:2200000000, companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Refresh of data centre servers and core network switches across BRM Group HQ and all site offices.", status:"Pending Approval", submittedForApprovalAt:"2025-08-25", submittedForApprovalBy:"Ahmad Rizki",
    items:[
      {no:1, desc:"HPE ProLiant DL380 Gen11 Server",  type:"Material", acctAssign:"K – Cost Center", materialNo:"ITH-SVR-001", materialGroup:"IT Hardware",     plant:"PL01", qty:5,    uom:"Unit",    estPrice:320000000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"Cisco Catalyst 9300 Switch 48P",   type:"Material", acctAssign:"K – Cost Center", materialNo:"ITH-SWT-002", materialGroup:"IT Hardware",     plant:"PL01", qty:10,   uom:"Unit",    estPrice:55000000,  requirementDate:"2025-10-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0029", title:"Manpower Supply – Plant Operators",                postedDate:"2025-07-30", closingDate:"2025-08-30", postedBy:"Ahmad Rizki",  targets:["10000002"],            cat:"Manpower",           estVal:780000000,  companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Supply of certified plant operators for ore processing facility 3-shift rotation, 12 months.", status:"Open",
    items:[
      {no:1, desc:"Plant Operator (Shift)",           type:"Service",  acctAssign:"K – Cost Center", materialNo:"MNP-OPR-001", materialGroup:"Manpower Services",plant:"PL02", qty:10,   uom:"Person/Month",estPrice:6500000, requirementDate:"", startDate:"2025-10-01", endDate:"2026-09-30"},
    ]},
  { id:"RFQ-2025-0030", title:"Pipe & Valve Procurement – Process Plant",         postedDate:"2025-08-01", closingDate:"2025-09-01", postedBy:"Siti Rahma",   targets:["10000001"],            cat:"Goods",              estVal:1400000000, companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Procurement of carbon steel pipes, fittings, and valves for SHS process plant expansion.", status:"Open",
    items:[
      {no:1, desc:"Carbon Steel Pipe 6\" Sch40 (6m)", type:"Material", acctAssign:"P – Project",     materialNo:"PIP-CST-001", materialGroup:"Piping Materials", plant:"PL03", qty:500,  uom:"Pcs",     estPrice:1800000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
      {no:2, desc:"Gate Valve 6\" Class 150",         type:"Material", acctAssign:"P – Project",     materialNo:"VLV-GAT-002", materialGroup:"Valves & Fittings",plant:"PL03", qty:80,   uom:"Pcs",     estPrice:5500000,   requirementDate:"2025-10-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0031", title:"Environmental Impact Assessment (AMDAL)",           postedDate:"2025-08-03", closingDate:"2025-09-03", postedBy:"Ahmad Rizki",  targets:["10000002"],            cat:"Environmental",      estVal:1000000000, companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Full AMDAL study for Gorontalo mine expansion area including EIS, RKL-RPL, and public consultation.", status:"Open",
    items:[
      {no:1, desc:"AMDAL Study & Documentation",      type:"Service",  acctAssign:"P – Project",     materialNo:"ENV-AMD-001", materialGroup:"Environmental Svc",plant:"PL04", qty:1,    uom:"Lump Sum",estPrice:650000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"RKL-RPL Annual Reporting",         type:"Service",  acctAssign:"P – Project",     materialNo:"ENV-RKL-002", materialGroup:"Environmental Svc",plant:"PL04", qty:2,    uom:"Year",    estPrice:175000000, requirementDate:"", startDate:"2026-01-01", endDate:"2027-12-31"},
    ]},
  { id:"RFQ-2025-0032", title:"Welding & Fabrication – Steel Structure",           postedDate:"2025-08-05", closingDate:"2025-09-05", postedBy:"Siti Rahma",   targets:["10000001"],            cat:"Engineering",        estVal:650000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Fabrication and erection of structural steel for Linge Minerals ore stockpile shed (span 40m×80m).", status:"On Process",
    items:[
      {no:1, desc:"Structural Steel Fabrication",     type:"Service",  acctAssign:"P – Project",     materialNo:"FAB-STL-001", materialGroup:"Fabrication Works", plant:"PL05", qty:200,  uom:"Ton",     estPrice:2800000,   requirementDate:"", startDate:"2025-11-01", endDate:"2026-02-28"},
      {no:2, desc:"NDT / UT Inspection",              type:"Service",  acctAssign:"P – Project",     materialNo:"FAB-NDT-002", materialGroup:"Fabrication Works", plant:"PL05", qty:1,    uom:"Lump Sum",estPrice:65000000,  requirementDate:"2025-12-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0033", title:"Corporate Event – Annual Meeting & Gala",           postedDate:"2025-08-07", closingDate:"2025-09-07", postedBy:"Ahmad Rizki",  targets:["10000002"],            cat:"Services",           estVal:500000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual shareholders meeting and gala dinner for 400 participants including Board of Directors and guests.", status:"On Process",
    items:[
      {no:1, desc:"Venue, Catering & Decoration",    type:"Service",  acctAssign:"K – Cost Center", materialNo:"EVT-VEN-001", materialGroup:"Event Services",   plant:"PL01", qty:400,  uom:"Pax",     estPrice:850000,    requirementDate:"2025-11-15", startDate:"", endDate:""},
      {no:2, desc:"AV, Lighting & Entertainment",    type:"Service",  acctAssign:"K – Cost Center", materialNo:"EVT-AVL-002", materialGroup:"Event Services",   plant:"PL01", qty:1,    uom:"Lump Sum",estPrice:145000000, requirementDate:"2025-11-15", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0034", title:"Fuel Storage Tank – 1,000 KL Installation",        postedDate:"2025-08-08", closingDate:"2025-09-08", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Engineering",        estVal:3200000000, companyCode:"CPMS", plant:"PL02", purchOrg:"CPMS", desc:"Fabrication and installation of 1,000 KL above-ground diesel storage tank with secondary containment.", status:"Open",
    items:[
      {no:1, desc:"Tank Fabrication (1,000 KL)",     type:"Service",  acctAssign:"P – Project",     materialNo:"TNK-FAB-001", materialGroup:"Tank Works",        plant:"PL02", qty:1,    uom:"Lump Sum",estPrice:2200000000,requirementDate:"", startDate:"2025-11-01", endDate:"2026-04-30"},
      {no:2, desc:"Civil Foundation & Bund Wall",    type:"Service",  acctAssign:"P – Project",     materialNo:"TNK-CIV-002", materialGroup:"Civil Works",       plant:"PL02", qty:1,    uom:"Lump Sum",estPrice:800000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-03-31"},
    ]},
  { id:"RFQ-2025-0035", title:"Cybersecurity Assessment & Penetration Testing",    postedDate:"2025-08-09", closingDate:"2025-09-09", postedBy:"Ahmad Rizki",  targets:["10000001"],            cat:"IT Services",        estVal:380000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Comprehensive security assessment, vulnerability scan, and penetration testing for BRM IT infrastructure.", status:"Open",
    items:[
      {no:1, desc:"Network Pentest & Vulnerability Assessment", type:"Service", acctAssign:"K – Cost Center", materialNo:"SEC-PEN-001", materialGroup:"IT Security", plant:"PL01", qty:1, uom:"Engagement", estPrice:280000000, requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"Security Audit Report & Remediation Plan",   type:"Service", acctAssign:"K – Cost Center", materialNo:"SEC-AUD-002", materialGroup:"IT Security", plant:"PL01", qty:1, uom:"Engagement", estPrice:100000000, requirementDate:"2025-12-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0036", title:"Electrical Cable – MV & LV Supply",                postedDate:"2025-08-10", closingDate:"2025-09-10", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Goods",              estVal:760000000,  companyCode:"SHSI", plant:"PL03", purchOrg:"SHSI", desc:"Supply of medium voltage (20kV) and low voltage (380V) power cables for plant electrical installation.", status:"On Process",
    items:[
      {no:1, desc:"MV Cable 20kV 3x185mm² (per meter)", type:"Material", acctAssign:"P – Project", materialNo:"ELC-MVC-001", materialGroup:"Electrical Materials", plant:"PL03", qty:5000, uom:"Meter", estPrice:85000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
      {no:2, desc:"LV Cable 380V 4x70mm² (per meter)",  type:"Material", acctAssign:"P – Project", materialNo:"ELC-LVC-002", materialGroup:"Electrical Materials", plant:"PL03", qty:8000, uom:"Meter", estPrice:42000,  requirementDate:"2025-11-01", startDate:"", endDate:""},
    ]},
  { id:"RFQ-2025-0037", title:"Fleet Management System – GPS Tracking",            postedDate:"2025-08-11", closingDate:"2025-09-11", postedBy:"Ahmad Rizki",  targets:["10000002"],            cat:"IT Services",        estVal:240000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"GPS vehicle tracking and fleet management system for 120 units heavy equipment and light vehicles.", status:"Closed",
    items:[
      {no:1, desc:"GPS Hardware Unit & Installation", type:"Material", acctAssign:"K – Cost Center", materialNo:"FMS-GPS-001", materialGroup:"Fleet Management", plant:"PL01", qty:120, uom:"Unit",  estPrice:1500000, requirementDate:"2025-10-01", startDate:"", endDate:""},
      {no:2, desc:"FMS Platform Subscription",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"FMS-PLT-002", materialGroup:"Fleet Management", plant:"PL01", qty:24,  uom:"Month", estPrice:3750000, requirementDate:"", startDate:"2025-10-01", endDate:"2027-09-30"},
    ]},
  { id:"RFQ-2025-0038", title:"Pontoon & Barge Rental – River Transport",          postedDate:"2025-08-12", closingDate:"2025-09-12", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Services",           estVal:840000000,  companyCode:"LMRS", plant:"PL05", purchOrg:"LMRS", desc:"Rental of 250-ton pontoon barge for ore transport along Krueng Alas river, Aceh – 12 months.", status:"Open",
    items:[
      {no:1, desc:"Pontoon Barge 250T Rental",        type:"Service",  acctAssign:"P – Project",     materialNo:"MAR-BRG-001", materialGroup:"Marine Transport",  plant:"PL05", qty:12,  uom:"Month", estPrice:70000000, requirementDate:"", startDate:"2025-11-01", endDate:"2026-10-31"},
    ]},
  { id:"RFQ-2025-0039", title:"Accounting & Tax Advisory – Annual Retainer",       postedDate:"2025-08-13", closingDate:"2025-09-13", postedBy:"Ahmad Rizki",  targets:["10000001"],            cat:"Professional Svc",  estVal:360000000,  companyCode:"BRMS", plant:"PL01", purchOrg:"BRMS", desc:"Annual accounting, tax compliance, transfer pricing documentation, and advisory for BRM Group.", status:"Open",
    items:[
      {no:1, desc:"Accounting & Tax Retainer",        type:"Service",  acctAssign:"K – Cost Center", materialNo:"TAX-RTN-001", materialGroup:"Professional Svc",  plant:"PL01", qty:12,  uom:"Month", estPrice:30000000, requirementDate:"", startDate:"2026-01-01", endDate:"2026-12-31"},
    ]},
  { id:"RFQ-2025-0040", title:"Mine Reclamation – Revegetation & Soil Rehab",      postedDate:"2025-08-14", closingDate:"2025-09-14", postedBy:"Siti Rahma",   targets:["10000001","10000002"], cat:"Environmental",      estVal:1800000000, companyCode:"GMIN", plant:"PL04", purchOrg:"GMIN", desc:"Revegetation and soil rehabilitation of 500 ha post-mining land per ESDM reclamation plan approval.", status:"Open",
    items:[
      {no:1, desc:"Topsoil Spreading & Seeding",      type:"Service",  acctAssign:"P – Project",     materialNo:"REC-TOP-001", materialGroup:"Reclamation Works", plant:"PL04", qty:500, uom:"Ha",    estPrice:2400000,  requirementDate:"", startDate:"2026-01-01", endDate:"2026-12-31"},
      {no:2, desc:"Native Tree Planting (per stem)",  type:"Service",  acctAssign:"P – Project",     materialNo:"REC-TRE-002", materialGroup:"Reclamation Works", plant:"PL04", qty:50000,uom:"Stem", estPrice:15000,    requirementDate:"", startDate:"2026-02-01", endDate:"2026-12-31"},
    ]},
];
export const INIT_QT = [
  { id:"QT-2025-0001", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations",      vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-06-12", validUntil:"2025-07-12", totalAmt:490000000, notes:"Price includes 2-year warranty and free delivery.",                                   status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:7800000,total:390000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },
  { id:"QT-2025-0002", rfqId:"RFQ-2025-0002", rfqTitle:"Office Supplies Annual Contract",              vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"",           validUntil:"",           totalAmt:145000000, notes:"Free delivery for orders above IDR 5,000,000.",                                       status:"Draft",     files:[],                                         items:[{no:1,desc:"A4 Paper 80gsm",qty:1000,uom:"Ream",unitPrice:45000,total:45000000},{no:2,desc:"Ink Cartridge (Various)",qty:200,uom:"Pcs",unitPrice:250000,total:50000000}] },
  { id:"QT-2025-0003", rfqId:"RFQ-2025-0003", rfqTitle:"Security Services – HO Building",              vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-06-08", validUntil:"2025-07-08", totalAmt:350000000, notes:"Includes supervisor and CCTV monitoring.",                                           status:"Approved",  files:["quotation.pdf","company_profile.pdf"],    items:[{no:1,desc:"Security Guard Day Shift",qty:12,uom:"Person/Month",unitPrice:7500000,total:90000000},{no:2,desc:"Security Guard Night Shift",qty:12,uom:"Person/Month",unitPrice:9000000,total:108000000}] },
  { id:"QT-2025-0029", rfqId:"RFQ-2025-0001", rfqTitle:"Procurement of Laptops & Workstations",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-06-14", validUntil:"2025-07-14", totalAmt:510000000, notes:"Lenovo ThinkPad & ThinkStation. Includes 3-year on-site warranty.",                         status:"Submitted", files:["quotation.pdf","spec_sheet.pdf"],          items:[{no:1,desc:"Laptop 14\" Core i7",qty:50,uom:"Unit",unitPrice:8200000,total:410000000},{no:2,desc:"Workstation Dell XPS",qty:20,uom:"Unit",unitPrice:5000000,total:100000000}] },
  { id:"QT-2025-0030", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites",     vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-14", validUntil:"2025-08-14", totalAmt:90500000,  notes:"Distributor resmi alkes. Garansi keaslian produk & sertifikat BPOM.",                      status:"Submitted", files:["quotation.pdf"],                           items:[{no:1,desc:"First Aid Kit (50-person)",qty:25,uom:"Set",unitPrice:1250000,total:31250000},{no:2,desc:"AED Defibrillator",qty:5,uom:"Unit",unitPrice:12000000,total:60000000},{no:3,desc:"Stretcher & Immobilization Board",qty:10,uom:"Pcs",unitPrice:925000,total:9250000}] },
  { id:"QT-2025-0031", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System",       vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-09", validUntil:"2025-08-09", totalAmt:412000000, notes:"Hughes VSAT HT2000W. Remote support 24/7. SLA 99.5% uptime guaranteed.",                   status:"Win",  files:["quotation.pdf","technical_proposal.pdf"],  items:[{no:1,desc:"VSAT Installation & Hardware",qty:1,uom:"Set",unitPrice:182000000,total:182000000},{no:2,desc:"VSAT Monthly Bandwidth (100Mbps)",qty:12,uom:"Month",unitPrice:19166667,total:230000000}] },
  { id:"QT-2025-0032", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-21", validUntil:"2025-08-21", totalAmt:283500000, notes:"Izin TPS B3 dari DLH. Armada truk khusus B3. Manifest digital terintegrasi.",               status:"Submitted", files:["quotation.pdf","izin_dlh.pdf"],             items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",qty:50000,uom:"KG",unitPrice:3450,total:172500000},{no:2,desc:"Non-B3 Waste Disposal (month)",qty:12,uom:"Month",unitPrice:9250000,total:111000000}] },
  { id:"QT-2025-0004", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract",                    vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-01", validUntil:"2025-08-01", totalAmt:228000000, notes:"Price includes spare parts and refrigerant top-up.",                                  status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"Preventive Maintenance Visit",qty:12,uom:"Visit",unitPrice:19000000,total:228000000}] },
  { id:"QT-2025-0005", rfqId:"RFQ-2025-0004", rfqTitle:"HVAC Maintenance Contract",                    vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-02", validUntil:"2025-08-02", totalAmt:240000000, notes:"2-hour SLA for emergency call-outs. Covers all 4 floors.",                           status:"Submitted", files:["quotation.pdf","technical_spec.pdf"],     items:[{no:1,desc:"Preventive Maintenance Visit",qty:12,uom:"Visit",unitPrice:20000000,total:240000000}] },
  { id:"QT-2025-0006", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies",     vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-05", validUntil:"2025-08-05", totalAmt:862500000, notes:"Price includes licensed transport & handling. MSDS provided.",                       status:"Draft",     files:[],                                         items:[{no:1,desc:"ANFO Bulk Explosive",qty:50000,uom:"KG",unitPrice:8000,total:400000000},{no:2,desc:"Electric Detonator",qty:2000,uom:"Pcs",unitPrice:33000,total:66000000},{no:3,desc:"Safety Fuse (100m/roll)",qty:500,uom:"Roll",unitPrice:115000,total:57500000}] },
  { id:"QT-2025-0007", rfqId:"RFQ-2025-0005", rfqTitle:"Explosive Materials – Blasting Supplies",     vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-06", validUntil:"2025-08-06", totalAmt:891000000, notes:"Stock available immediately. Delivery within 5 business days.",                      status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"ANFO Bulk Explosive",qty:50000,uom:"KG",unitPrice:8800,total:440000000},{no:2,desc:"Electric Detonator",qty:2000,uom:"Pcs",unitPrice:34000,total:68000000},{no:3,desc:"Safety Fuse (100m/roll)",qty:500,uom:"Roll",unitPrice:118000,total:59000000}] },
  { id:"QT-2025-0008", rfqId:"RFQ-2025-0006", rfqTitle:"Genset Rental – Remote Site Power",            vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-08", validUntil:"2025-08-08", totalAmt:468000000, notes:"Includes fuel management and 24/7 on-site technician during operation.",              status:"Submitted", files:["quotation.pdf","genset_spec.pdf"],         items:[{no:1,desc:"Genset 500 kVA Rental",qty:12,uom:"Month",unitPrice:39000000,total:468000000}] },
  { id:"QT-2025-0009", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)",          vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:118500000, notes:"All items SNI-certified. Free delivery to all sites.",                               status:"Submitted", files:["quotation.pdf","catalogue.pdf"],           items:[{no:1,desc:"Safety Helmet (SNI certified)",qty:500,uom:"Pcs",unitPrice:72000,total:36000000},{no:2,desc:"Safety Boot (Steel Toe)",qty:300,uom:"Pair",unitPrice:330000,total:99000000},{no:3,desc:"High-Visibility Safety Vest",qty:600,uom:"Pcs",unitPrice:82000,total:49200000}] },
  { id:"QT-2025-0010", rfqId:"RFQ-2025-0007", rfqTitle:"Personal Protective Equipment (PPE)",          vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:126750000, notes:"Bulk discount applied. 1-year warranty on boots.",                                   status:"Completed", files:["quotation.pdf"],                          items:[{no:1,desc:"Safety Helmet (SNI certified)",qty:500,uom:"Pcs",unitPrice:78000,total:39000000},{no:2,desc:"Safety Boot (Steel Toe)",qty:300,uom:"Pair",unitPrice:360000,total:108000000},{no:3,desc:"High-Visibility Safety Vest",qty:600,uom:"Pcs",unitPrice:88000,total:52800000}] },
  { id:"QT-2025-0011", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On",         vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-06-25", validUntil:"2025-07-25", totalAmt:630000000, notes:"Team of 2 certified SAP consultants. Includes UAT support and go-live.",              status:"Accepted",  files:["quotation.pdf","cv_consultant.pdf"],       items:[{no:1,desc:"SAP BTP Integration Consultant",qty:6,uom:"Month",unitPrice:82000000,total:492000000},{no:2,desc:"SAP Analytics Cloud Specialist",qty:4,uom:"Month",unitPrice:70000000,total:280000000}] },
  { id:"QT-2025-0012", rfqId:"RFQ-2025-0008", rfqTitle:"ERP Consulting Services – SAP Add-On",         vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-06-26", validUntil:"2025-07-26", totalAmt:680000000, notes:"Senior consultants with 8+ years SAP Public Cloud experience.",                      status:"Submitted", files:["quotation.pdf"],                          items:[{no:1,desc:"SAP BTP Integration Consultant",qty:6,uom:"Month",unitPrice:88000000,total:528000000},{no:2,desc:"SAP Analytics Cloud Specialist",qty:4,uom:"Month",unitPrice:76000000,total:304000000}] },
  { id:"QT-2025-0013", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site",      vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:188500000, notes:"All chemicals have MSDS and BPOM certification. Delivery ex-Surabaya.",               status:"Submitted", files:["quotation.pdf","msds.pdf"],               items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",qty:500,uom:"Bag",unitPrice:175000,total:87500000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",qty:300,uom:"Bag",unitPrice:240000,total:72000000},{no:3,desc:"Caustic Soda (NaOH) 50 kg/drum",qty:150,uom:"Drum",unitPrice:193333,total:29000000}] },
  { id:"QT-2025-0014", rfqId:"RFQ-2025-0009", rfqTitle:"Water Treatment Chemicals – Mining Site",      vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:197250000, notes:"Stock guaranteed for 6 months. Complimentary dosing pump included.",                  status:"Draft",     files:[],                                         items:[{no:1,desc:"Coagulant PAC (25 kg/bag)",qty:500,uom:"Bag",unitPrice:185000,total:92500000},{no:2,desc:"Anionic Flocculant (20 kg/bag)",qty:300,uom:"Bag",unitPrice:260000,total:78000000},{no:3,desc:"Caustic Soda (NaOH) 50 kg/drum",qty:150,uom:"Drum",unitPrice:178333,total:26750000}] },
  { id:"QT-2025-0015", rfqId:"RFQ-2025-0010", rfqTitle:"Medical & First Aid Supplies – All Sites",     vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-12", validUntil:"2025-08-12", totalAmt:86750000,  notes:"Items sourced from certified medical distributors. Expiry min. 2 years.",              status:"Submitted", files:["quotation.pdf","product_catalogue.pdf"],  items:[{no:1,desc:"First Aid Kit (50-person)",qty:25,uom:"Set",unitPrice:1150000,total:28750000},{no:2,desc:"AED Defibrillator",qty:5,uom:"Unit",unitPrice:11500000,total:57500000},{no:3,desc:"Stretcher & Immobilization Board",qty:10,uom:"Pcs",unitPrice:50000,total:500000}] },
  { id:"QT-2025-0016", rfqId:"RFQ-2025-0011", rfqTitle:"Drone Survey & Aerial Mapping Services",        vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-13", validUntil:"2025-08-13", totalAmt:315000000,  notes:"Using DJI Matrice 350 RTK. Deliverables: orthophoto, DEM, shapefile.",                     status:"Submitted", files:["quotation.pdf","drone_spec.pdf","portfolio.pdf"],  items:[{no:1,desc:"Drone Aerial Survey (per hectare)",qty:2500,uom:"Ha",unitPrice:114000,total:285000000},{no:2,desc:"3D Point Cloud Processing & Report",qty:1,uom:"Lump Sum",unitPrice:30000000,total:30000000}] },
  { id:"QT-2025-0017", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer",   vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-15", validUntil:"2025-08-15", totalAmt:936000000,  notes:"Operators included. Mobilization cost covered within quote.",                              status:"Submitted", files:["quotation.pdf","equipment_spec.pdf"],               items:[{no:1,desc:"Hydraulic Excavator 36T",qty:12,uom:"Month",unitPrice:53000000,total:636000000},{no:2,desc:"Bulldozer D85",qty:12,uom:"Month",unitPrice:25000000,total:300000000}] },
  { id:"QT-2025-0018", rfqId:"RFQ-2025-0012", rfqTitle:"Heavy Equipment Rental – Excavator & Dozer",   vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-16", validUntil:"2025-08-16", totalAmt:984000000,  notes:"Komatsu PC360 & D85 in excellent condition. 24/7 breakdown support.",                       status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Hydraulic Excavator 36T",qty:12,uom:"Month",unitPrice:57000000,total:684000000},{no:2,desc:"Bulldozer D85",qty:12,uom:"Month",unitPrice:25000000,total:300000000}] },
  { id:"QT-2025-0019", rfqId:"RFQ-2025-0013", rfqTitle:"Laboratory Testing Services – Ore Samples",     vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-17", validUntil:"2025-08-17", totalAmt:142500000,  notes:"NATA-accredited lab. Turnaround 5 business days. Online result portal.",                    status:"Approved",  files:["quotation.pdf","accreditation.pdf"],                items:[{no:1,desc:"Fire Assay – Au (per sample)",qty:2000,uom:"Sample",unitPrice:43000,total:86000000},{no:2,desc:"ICP-MS Multi-element Analysis",qty:1500,uom:"Sample",unitPrice:38000,total:57000000}] },
  { id:"QT-2025-0020", rfqId:"RFQ-2025-0014", rfqTitle:"Catering & Mess Hall Services – Aceh Camp",     vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-18", validUntil:"2025-08-18", totalAmt:527812500,  notes:"Menu rotates weekly. Halal certified. 3 meals + 2 snacks daily.",                          status:"Submitted", files:["quotation.pdf","menu_sample.pdf"],                  items:[{no:1,desc:"Catering per Person per Day",qty:54750,uom:"Person/Day",unitPrice:82500,total:527812500}] },
  { id:"QT-2025-0021", rfqId:"RFQ-2025-0015", rfqTitle:"Telecommunication – VSAT & Radio System",       vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-08", validUntil:"2025-08-08", totalAmt:398000000,  notes:"Includes 1-year hardware warranty and remote NOC monitoring.",                             status:"Completed",  files:["quotation.pdf","technical_proposal.pdf"],           items:[{no:1,desc:"VSAT Installation & Hardware",qty:1,uom:"Set",unitPrice:175000000,total:175000000},{no:2,desc:"VSAT Monthly Bandwidth (100Mbps)",qty:12,uom:"Month",unitPrice:14250000,total:171000000}] },
  { id:"QT-2025-0022", rfqId:"RFQ-2025-0016", rfqTitle:"Waste Management & Environmental Services",      vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-20", validUntil:"2025-08-20", totalAmt:271000000,  notes:"Licensed by KLHK. Manifest provided for all B3 waste movements.",                          status:"Submitted", files:["quotation.pdf","klhk_license.pdf"],                 items:[{no:1,desc:"B3 Hazardous Waste Handling (kg)",qty:50000,uom:"KG",unitPrice:3300,total:165000000},{no:2,desc:"Non-B3 Waste Disposal (month)",qty:12,uom:"Month",unitPrice:8833333,total:106000000}] },
  { id:"QT-2025-0023", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Avgas",                   vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-22", validUntil:"2025-08-22", totalAmt:1189000000, notes:"Price locked for 6 months. Free delivery to site with min. 10,000L order.",                status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"HSD Diesel Fuel (Liter)",qty:3000000,uom:"Liter",unitPrice:325,total:975000000},{no:2,desc:"Aviation Gasoline – Avgas 100LL",qty:5000,uom:"Liter",unitPrice:17800,total:89000000}] },
  { id:"QT-2025-0024", rfqId:"RFQ-2025-0017", rfqTitle:"Fuel Supply – Diesel & Avgas",                   vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-23", validUntil:"2025-08-23", totalAmt:1205000000, notes:"Pertamina authorised distributor. Consistent supply guaranteed.",                           status:"Draft",     files:[],                                                   items:[{no:1,desc:"HSD Diesel Fuel (Liter)",qty:3000000,uom:"Liter",unitPrice:332,total:996000000},{no:2,desc:"Aviation Gasoline – Avgas 100LL",qty:5000,uom:"Liter",unitPrice:18200,total:91000000}] },
  { id:"QT-2025-0025", rfqId:"RFQ-2025-0018", rfqTitle:"Tailings Dam Monitoring – Instrumentation",      vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-24", validUntil:"2025-08-24", totalAmt:367500000,  notes:"Instruments sourced from Geo-Instruments USA. Includes installation and commissioning.",    status:"Submitted", files:["quotation.pdf","datasheet.pdf"],                    items:[{no:1,desc:"Piezometer (vibrating wire)",qty:20,uom:"Unit",unitPrice:8200000,total:164000000},{no:2,desc:"Inclinometer Casing & Probe",qty:5,uom:"Set",unitPrice:24500000,total:122500000},{no:3,desc:"Data Logger & Telemetry Unit",qty:3,uom:"Unit",unitPrice:27000000,total:81000000}] },
  { id:"QT-2025-0026", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor",       vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-10", validUntil:"2025-08-10", totalAmt:832000000,  notes:"Portfolio: Accenture Jakarta, Unilever HQ. ISO 9001 certified contractor.",                status:"Win",  files:["quotation.pdf","portfolio.pdf","company_profile.pdf"], items:[{no:1,desc:"Interior Design & Build Works",qty:1,uom:"Lump Sum",unitPrice:690000000,total:690000000},{no:2,desc:"Furniture & Fitout Supply",qty:1,uom:"Lump Sum",unitPrice:142000000,total:142000000}] },
  { id:"QT-2025-0027", rfqId:"RFQ-2025-0019", rfqTitle:"Office Renovation – Jakarta HQ 5th Floor",       vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-11", validUntil:"2025-08-11", totalAmt:856000000,  notes:"10% down payment. Balance upon milestone completion. 6-month defect liability.",           status:"Completed", files:["quotation.pdf"],                                    items:[{no:1,desc:"Interior Design & Build Works",qty:1,uom:"Lump Sum",unitPrice:710000000,total:710000000},{no:2,desc:"Furniture & Fitout Supply",qty:1,uom:"Lump Sum",unitPrice:146000000,total:146000000}] },
  { id:"QT-2025-0028", rfqId:"RFQ-2025-0020", rfqTitle:"Training – Mine Safety & Emergency Response",    vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-25", validUntil:"2025-08-25", totalAmt:93600000,   notes:"Trainers certified by BNSP & Kemnaker. Training held on-site. Certificate issued.",        status:"Submitted", files:["quotation.pdf","trainer_cv.pdf"],                   items:[{no:1,desc:"Mine Safety (SIMTK) Training",qty:200,uom:"Person",unitPrice:195000,total:39000000},{no:2,desc:"Emergency Response Drill",qty:4,uom:"Session",unitPrice:13650000,total:54600000}] },
  // ── New quotations for RFQ-2025-0021 to 0040 ────────────────
  { id:"QT-2025-0033", rfqId:"RFQ-2025-0021", rfqTitle:"Road Infrastructure – Haul Road Upgrade",         vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-07-28", validUntil:"2025-08-28", totalAmt:1850000000, notes:"Subbase, base, and asphalt pavement. Includes drainage works.",                           status:"Submitted", files:["quotation.pdf","method_statement.pdf"],             items:[{no:1,desc:"Road Subgrade Preparation",qty:15000,uom:"M2",unitPrice:45000,total:675000000},{no:2,desc:"Asphalt Wearing Course (AC-WC)",qty:15000,uom:"M2",unitPrice:115000,total:1725000000}] },
  { id:"QT-2025-0034", rfqId:"RFQ-2025-0021", rfqTitle:"Road Infrastructure – Haul Road Upgrade",         vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-07-29", validUntil:"2025-08-29", totalAmt:1920000000, notes:"Experienced road contractor. Mobilization within 2 weeks.",                               status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Road Subgrade Preparation",qty:15000,uom:"M2",unitPrice:48000,total:720000000},{no:2,desc:"Asphalt Wearing Course (AC-WC)",qty:15000,uom:"M2",unitPrice:120000,total:1800000000}] },
  { id:"QT-2025-0035", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet",    vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-02", validUntil:"2025-09-02", totalAmt:385000000,  notes:"Authorized Shell distributor. Available in 20L, 208L, and IBC.",                          status:"Submitted", files:["quotation.pdf","product_sheet.pdf"],                items:[{no:1,desc:"Shell Rimula R4 15W-40 (208L drum)",qty:300,uom:"Drum",unitPrice:950000,total:285000000},{no:2,desc:"Shell Gadus S3 V220C Grease (18kg)",qty:200,uom:"Bucket",unitPrice:500000,total:100000000}] },
  { id:"QT-2025-0036", rfqId:"RFQ-2025-0022", rfqTitle:"Lubricants & Greases – Heavy Equipment Fleet",    vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-03", validUntil:"2025-09-03", totalAmt:371500000,  notes:"Castrol authorized distributor. Volume pricing applied.",                                 status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Castrol Vecton 15W-40 (208L drum)",qty:300,uom:"Drum",unitPrice:920000,total:276000000},{no:2,desc:"Castrol Spheerol EPLX 220-2 (18kg)",qty:190,uom:"Bucket",unitPrice:503000,total:95570000}] },
  { id:"QT-2025-0037", rfqId:"RFQ-2025-0023", rfqTitle:"Legal Advisory Services – Mining Permits",         vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-05", validUntil:"2025-09-05", totalAmt:420000000,  notes:"Partner-level mining law expertise. Track record at ESDM.",                               status:"Submitted", files:["quotation.pdf","firm_profile.pdf"],                 items:[{no:1,desc:"Legal Retainer – Mining Law",qty:12,uom:"Month",unitPrice:35000000,total:420000000}] },
  { id:"QT-2025-0038", rfqId:"RFQ-2025-0024", rfqTitle:"Insurance – Property All Risk & Public Liability", vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-08", validUntil:"2025-09-08", totalAmt:560000000,  notes:"AM Best A-rated reinsurance backing. Claims settlement SLA 14 days.",                      status:"Submitted", files:["quotation.pdf","policy_wording.pdf"],               items:[{no:1,desc:"Property All Risk Premium",qty:1,uom:"Annual",unitPrice:360000000,total:360000000},{no:2,desc:"Public Liability Premium",qty:1,uom:"Annual",unitPrice:200000000,total:200000000}] },
  { id:"QT-2025-0039", rfqId:"RFQ-2025-0024", rfqTitle:"Insurance – Property All Risk & Public Liability", vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-09", validUntil:"2025-09-09", totalAmt:540000000,  notes:"Tugu / Asuransi Wahana Tata. Competitive premium. Full OJK registered.",                  status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Property All Risk Premium",qty:1,uom:"Annual",unitPrice:345000000,total:345000000},{no:2,desc:"Public Liability Premium",qty:1,uom:"Annual",unitPrice:195000000,total:195000000}] },
  { id:"QT-2025-0040", rfqId:"RFQ-2025-0025", rfqTitle:"Fire Protection System – Plant Building",          vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-10", validUntil:"2025-09-10", totalAmt:748000000,  notes:"NFPA and SNI compliant. 1-year maintenance included post-installation.",                  status:"Submitted", files:["quotation.pdf","design_drawing.pdf"],               items:[{no:1,desc:"Sprinkler System Installation",qty:1,uom:"Lump Sum",unitPrice:540000000,total:540000000},{no:2,desc:"Fire Hydrant & Hose Reel",qty:20,uom:"Unit",unitPrice:10400000,total:208000000}] },
  { id:"QT-2025-0041", rfqId:"RFQ-2025-0026", rfqTitle:"Chartered Flight – Helicopter Services",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-12", validUntil:"2025-09-12", totalAmt:1620000000, notes:"Bell 412 helicopter, 15-seat. Pilot & co-pilot included. Based in Palu.",                  status:"Submitted", files:["quotation.pdf","aoc_certificate.pdf"],              items:[{no:1,desc:"Helicopter Charter – Bell 412",qty:12,uom:"Month",unitPrice:135000000,total:1620000000}] },
  { id:"QT-2025-0042", rfqId:"RFQ-2025-0027", rfqTitle:"Scaffolding & Access Services – Plant Shutdown",   vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-14", validUntil:"2025-09-14", totalAmt:295000000,  notes:"Ringlock system. SCAFFOLD certified workers. Includes design drawing.",                    status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Scaffold Erection & Dismantling",qty:5000,uom:"M2",unitPrice:45000,total:225000000},{no:2,desc:"Scaffold Monthly Rental",qty:2,uom:"Month",unitPrice:35000000,total:70000000}] },
  { id:"QT-2025-0043", rfqId:"RFQ-2025-0027", rfqTitle:"Scaffolding & Access Services – Plant Shutdown",   vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-15", validUntil:"2025-09-15", totalAmt:311500000,  notes:"Cup lock system. Fast mobilization. Safety record zero LTI.",                             status:"Submitted", files:["quotation.pdf","safety_record.pdf"],                items:[{no:1,desc:"Scaffold Erection & Dismantling",qty:5000,uom:"M2",unitPrice:48000,total:240000000},{no:2,desc:"Scaffold Monthly Rental",qty:2,uom:"Month",unitPrice:35750000,total:71500000}] },
  { id:"QT-2025-0044", rfqId:"RFQ-2025-0028", rfqTitle:"IT Hardware Refresh – Server & Network",           vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-16", validUntil:"2025-09-16", totalAmt:2150000000, notes:"HPE ProLiant Gen11. 3-year next-business-day warranty. Rack & stack included.",            status:"Submitted", files:["quotation.pdf","spec_sheet.pdf"],                   items:[{no:1,desc:"HPE ProLiant DL380 Gen11 Server",qty:5,uom:"Unit",unitPrice:320000000,total:1600000000},{no:2,desc:"Cisco Catalyst 9300 Switch 48P",qty:10,uom:"Unit",unitPrice:55000000,total:550000000}] },
  { id:"QT-2025-0045", rfqId:"RFQ-2025-0028", rfqTitle:"IT Hardware Refresh – Server & Network",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-17", validUntil:"2025-09-17", totalAmt:2080000000, notes:"Dell PowerEdge R760. Includes migration support. Extended 5-year warranty available.",     status:"Submitted", files:["quotation.pdf"],                                    items:[{no:1,desc:"Dell PowerEdge R760 Server",qty:5,uom:"Unit",unitPrice:308000000,total:1540000000},{no:2,desc:"Cisco Catalyst 9300 Switch 48P",qty:10,uom:"Unit",unitPrice:54000000,total:540000000}] },
  { id:"QT-2025-0046", rfqId:"RFQ-2025-0029", rfqTitle:"Manpower Supply – Plant Operators",                vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-19", validUntil:"2025-09-19", totalAmt:780000000,  notes:"All operators K3 certified. BPJS Ketenagakerjaan enrolled. Overtime included.",            status:"Submitted", files:["quotation.pdf","worker_list.pdf"],                  items:[{no:1,desc:"Plant Operator (Shift)",qty:12,uom:"Person/Month",unitPrice:6500000,total:78000000}] },
  { id:"QT-2025-0047", rfqId:"RFQ-2025-0030", rfqTitle:"Pipe & Valve Procurement – Process Plant",         vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-21", validUntil:"2025-09-21", totalAmt:1340000000, notes:"API 5L and ASME B16.34 compliant. Mill certificates included.",                           status:"Submitted", files:["quotation.pdf","mill_cert.pdf"],                    items:[{no:1,desc:"Carbon Steel Pipe 6\" Sch40 (6m)",qty:500,uom:"Pcs",unitPrice:1800000,total:900000000},{no:2,desc:"Gate Valve 6\" Class 150",qty:80,uom:"Pcs",unitPrice:5500000,total:440000000}] },
  { id:"QT-2025-0048", rfqId:"RFQ-2025-0031", rfqTitle:"Environmental Impact Assessment (AMDAL)",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-22", validUntil:"2025-09-22", totalAmt:980000000,  notes:"KLHK-registered consultant. RKL/RPL tracking system included.",                           status:"Submitted", files:["quotation.pdf","lsv_license.pdf"],                  items:[{no:1,desc:"AMDAL Study & Documentation",qty:1,uom:"Lump Sum",unitPrice:650000000,total:650000000},{no:2,desc:"RKL-RPL Annual Reporting",qty:2,uom:"Year",unitPrice:165000000,total:330000000}] },
  { id:"QT-2025-0049", rfqId:"RFQ-2025-0032", rfqTitle:"Welding & Fabrication – Steel Structure",           vendorId:"10000001", vendorName:"PT Maju Bersama",   submittedDate:"2025-08-25", validUntil:"2025-09-25", totalAmt:620000000,  notes:"SMAW & GTAW certified welders. NDT testing included.",                                    status:"Submitted", files:["quotation.pdf","welder_certs.pdf"],                 items:[{no:1,desc:"Structural Steel Fabrication",qty:200,uom:"Ton",unitPrice:2800000,total:560000000},{no:2,desc:"NDT / UT Inspection",qty:1,uom:"Lump Sum",unitPrice:60000000,total:60000000}] },
  { id:"QT-2025-0050", rfqId:"RFQ-2025-0033", rfqTitle:"Corporate Event – Annual Meeting & Gala",           vendorId:"10000002", vendorName:"CV Sukses Mandiri", submittedDate:"2025-08-27", validUntil:"2025-09-27", totalAmt:480000000,  notes:"Venue: Grand Hyatt Jakarta. AV, catering, entertainment all-in package.",                 status:"Submitted", files:["quotation.pdf","venue_layout.pdf"],                 items:[{no:1,desc:"Event Venue & Catering",qty:400,uom:"Pax",unitPrice:850000,total:340000000},{no:2,desc:"AV & Entertainment Package",qty:1,uom:"Lump Sum",unitPrice:140000000,total:140000000}] },
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

export const Badge = ({s}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:700,color:x.c,background:x.bg,border:`1px solid ${x.c}40`,letterSpacing:0.2}}>{s}</span>;
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
              style={{background:"none",border:"none",cursor:"pointer",color:"#6a6d70",fontSize:16,padding:"0 0.375rem",lineHeight:1,display:"flex",alignItems:"center",flexShrink:0,height:"100%"}}>Ã—</button>
          </span>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        {onAdaptFilters&&<button onClick={onAdaptFilters} style={{background:"transparent",color:C.primary,border:`1px solid ${C.border}`,borderRadius:4,padding:"0 12px",height:"2rem",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:400}}>Adapt Filters{adaptFiltersCount!=null?` (${adaptFiltersCount})`:""}</button>}
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
          <button onClick={()=>setMonSel(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,width:24,height:24,cursor:"pointer",color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>â€¹</button>
          <span style={{flex:1,textAlign:"center" as const,fontSize:12,fontWeight:700,color:C.t1}}>{MNAMES[monSel.m]} {monSel.y}</span>
          <button onClick={()=>setMonSel(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,width:24,height:24,cursor:"pointer",color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>â€º</button>
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
        {(from||to)&&<button onClick={e=>{e.stopPropagation();clr();}} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:18,padding:"0",lineHeight:1,flexShrink:0}}>Ã—</button>}
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
              <button onClick={e=>remove(k,e)} style={{background:"none",border:"none",cursor:"pointer",color:"#6a6d70",fontSize:15,padding:"0 5px",lineHeight:1,display:"flex",alignItems:"center"}}>Ã—</button>
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
                          {c.label} <span style={{color:C.t2,fontSize:9}}>â–²</span>
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
                      <button onClick={()=>setConds(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>Ã—</button>
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
                <button onClick={()=>setLocalSel(p=>p.filter(k=>k!==key))} style={{background:"none",border:"none",cursor:"pointer",color:C.info,padding:"0 0 0 2px",fontSize:14,lineHeight:1}}>Ã—</button>
              </span>
            ))}
            {localSel.length>0&&<button onClick={()=>{setLocalSel([]);setConds([]);}} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:18,padding:"0 2px",lineHeight:1}} title="Clear all">Ã—</button>}
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
  <div onClick={onOpen} style={{position:"relative",display:"flex",alignItems:"center",minHeight:28,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,padding:"2px 28px 2px 4px",flexWrap:"wrap",gap:3,cursor:"pointer"}}>
    {selected.length===0&&<span style={{color:"#bfbfbf",fontSize:12,padding:"1px 2px"}}>{placeholder}</span>}
    {selected.map(k=>(
      <span key={k} style={{display:"inline-flex",alignItems:"center",background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 7px",fontSize:11,color:C.info,whiteSpace:"nowrap"}}>{getLabel(k)}</span>
    ))}
    <button onClick={e=>{e.stopPropagation();onOpen();}} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}>
      <SapIcon name="value-help" size={14} color="#6a6d70"/>
    </button>
  </div>
);

