import { useState, useEffect, useRef } from "react";
export { C, STC, applyTheme } from "./theme";

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


// ── Barrel re-exports — all imports from ./shared still resolve ──────────────
// Format & helpers
export { SETTINGS, applySettings, idr, fmtAmt, fmtDate, parseToISO, uid, fmtPOs } from "./lib/format";
// Responsive
export { VP, mob, tab, g2, g3, g4, pg } from "./lib/responsive";
// UI primitives
export { SapIcon } from "./components/ui/SapIcon";
export { AVT_ACCENTS, avtColor, avtIni, Badge, StatusTag } from "./components/ui/Badge";
export { Card, Btn, Inp, AmtInp, DateInp, Ui5DatePicker, DatePickerInp, Sel, TA } from "./components/ui/forms";
export { Lbl, Val, Sep, Modal, Th, Td } from "./components/ui/layout";
export { FilterBar, FioriBar, FField, DateRangePicker } from "./components/ui/FioriBar";
export { FilterMultiComboBox, InvTypeMultiComboBox, ValueHelpDialog, ValueHelpInp } from "./components/ui/filters";
export type { VHCol } from "./components/ui/filters";
