// Seed data matching shared.tsx mock data structure.
// Array fields must be JSON.stringify()'d — HANA stores them as LargeString.
const J = (v) => JSON.stringify(v);

const ITEMS_INV = [
  { poNo:'4500000001', poItem:'10', qty:10, uom:'EA', materialId:'MAT-001', materialDesc:'Office Chair', unitPrice:15000000, vatCode:'V1' }
];
const ITEMS_RFQ = [
  { no:1, desc:'Laptop 14" Core i7', type:'Material', acctAssign:'K', materialNo:'MAT-LAP-001', materialGroup:'IT Hardware', plant:'1000', qty:50, uom:'EA', estPrice:18000000, requirementDate:'2025-08-01', startDate:'2025-08-01', endDate:'2025-09-30' }
];
const ITEMS_QT = [
  { no:1, desc:'Laptop 14" Core i7', materialGroup:'IT Hardware', qty:50, uom:'EA', unitPrice:9800000, total:490000000 }
];

const seedInvoices = [
  {
    id:'PI-2025-0001', invoiceNo:'INV/MJB/2025/001', invoiceType:'Invoice',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:150000000, currency:'IDR', vatBase:150000000, vatAmt:16500000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 30', invoiceDate:'2025-06-01', dueDate:'2025-07-01',
    desc:'Supply of office furniture', status:'Posted',
    submittedAt:'2025-06-01T08:00:00Z', confirmedAt:'2025-06-05T10:00:00Z',
    postedAt:'2025-06-10T14:00:00Z', sapDocNo:'5100000001/2025',
    convertedDocNo:null, clearingDocNo:null, rejReason:null, taxDoc:'TAX/MJB/2025/001',
    poNumbers:J(['4500000001']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0002', invoiceNo:'INV/MJB/2025/002', invoiceType:'Invoice',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:85000000, currency:'IDR', vatBase:85000000, vatAmt:9350000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 30', invoiceDate:'2025-06-15', dueDate:'2025-07-15',
    desc:'IT peripherals supply', status:'Under Review',
    submittedAt:'2025-06-15T09:00:00Z', confirmedAt:null,
    postedAt:null, sapDocNo:null, convertedDocNo:null, clearingDocNo:null,
    rejReason:null, taxDoc:null,
    poNumbers:J(['4500000002']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0003', invoiceNo:'INV/MJB/2025/003', invoiceType:'Invoice',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'CPMS',
    amount:200000000, currency:'IDR', vatBase:200000000, vatAmt:22000000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 45', invoiceDate:'2025-05-20', dueDate:'2025-07-04',
    desc:'Mechanical spare parts', status:'Confirmed',
    submittedAt:'2025-05-20T10:00:00Z', confirmedAt:'2025-05-25T14:00:00Z',
    postedAt:null, sapDocNo:null, convertedDocNo:null, clearingDocNo:null,
    rejReason:null, taxDoc:null,
    poNumbers:J(['4500000003']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0004', invoiceNo:'INV/MJB/2025/004', invoiceType:'Invoice',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:45000000, currency:'IDR', vatBase:45000000, vatAmt:4950000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 30', invoiceDate:'2025-06-20', dueDate:'2025-07-20',
    desc:'Office supplies Q2', status:'Submitted',
    submittedAt:'2025-06-20T11:00:00Z', confirmedAt:null,
    postedAt:null, sapDocNo:null, convertedDocNo:null, clearingDocNo:null,
    rejReason:null, taxDoc:null,
    poNumbers:J(['4500000004']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0005', invoiceNo:'INV/MJB/2025/005', invoiceType:'Invoice',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:120000000, currency:'IDR', vatBase:120000000, vatAmt:13200000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 30', invoiceDate:'2025-06-10', dueDate:'2025-07-10',
    desc:'Electrical maintenance contract', status:'Rejected',
    submittedAt:'2025-06-10T08:00:00Z', confirmedAt:null,
    postedAt:null, sapDocNo:null, convertedDocNo:null, clearingDocNo:null,
    rejReason:'Invoice amount does not match PO. Please resubmit with correct amount.',
    taxDoc:null,
    poNumbers:J(['4500000005']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0006', invoiceNo:'DPR/MJB/2025/001', invoiceType:'Supplier DPR',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:500000000, currency:'IDR', vatBase:500000000, vatAmt:55000000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Down Payment 30%', invoiceDate:'2025-06-05', dueDate:'2025-06-30',
    desc:'Down payment for construction project Phase 1', status:'Posted',
    submittedAt:'2025-06-05T08:00:00Z', confirmedAt:'2025-06-08T10:00:00Z',
    postedAt:'2025-06-12T14:00:00Z', sapDocNo:'BRMS/1000000001/2025',
    convertedDocNo:null, clearingDocNo:null, rejReason:null, taxDoc:null,
    poNumbers:J(['4500000006']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0007', invoiceNo:'DPR/MJB/2025/002', invoiceType:'Supplier DPR',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:300000000, currency:'IDR', vatBase:300000000, vatAmt:33000000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Down Payment 20%', invoiceDate:'2025-06-25', dueDate:'2025-07-25',
    desc:'Down payment for equipment procurement', status:'Confirmed',
    submittedAt:'2025-06-25T09:00:00Z', confirmedAt:'2025-06-28T11:00:00Z',
    postedAt:null, sapDocNo:null, convertedDocNo:null, clearingDocNo:null,
    rejReason:null, taxDoc:null,
    poNumbers:J(['4500000007']), items:J(ITEMS_INV), files:J([])
  },
  {
    id:'PI-2025-0008', invoiceNo:'INV/MJB/2025/008', invoiceType:'Invoice',
    vendorId:'10000001', vendorName:'PT Maju Bersama', companyCode:'BRMS',
    amount:75000000, currency:'IDR', vatBase:75000000, vatAmt:8250000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 30', invoiceDate:'2025-07-01', dueDate:'2025-07-31',
    desc:'Security services July 2025', status:'Draft',
    submittedAt:null, confirmedAt:null,
    postedAt:null, sapDocNo:null, convertedDocNo:null, clearingDocNo:null,
    rejReason:null, taxDoc:null,
    poNumbers:J(['4500000008']), items:J(ITEMS_INV), files:J([])
  },
  // vendor2 invoices
  {
    id:'PI-2025-0009', invoiceNo:'INV/CSM/2025/001', invoiceType:'Invoice',
    vendorId:'10000002', vendorName:'CV Sukses Mandiri', companyCode:'BRMS',
    amount:215000000, currency:'IDR', vatBase:215000000, vatAmt:23650000,
    whtType:'', whtBase:0, whtAmt:0, additionalFee:0, feeCategory:'',
    paymentTerms:'Net 30', invoiceDate:'2025-06-03', dueDate:'2025-07-03',
    desc:'HVAC maintenance services', status:'Posted',
    submittedAt:'2025-06-03T08:00:00Z', confirmedAt:'2025-06-07T10:00:00Z',
    postedAt:'2025-06-14T14:00:00Z', sapDocNo:'5100000009/2025',
    convertedDocNo:null, clearingDocNo:null, rejReason:null, taxDoc:'TAX/CSM/2025/001',
    poNumbers:J(['4500000009']), items:J(ITEMS_INV), files:J([])
  }
];

const seedQuotations = [
  {
    id:'QT-2025-0001', rfqId:'RFQ-2025-0001', rfqTitle:'Procurement of Laptops & Workstations',
    vendorId:'10000001', vendorName:'PT Maju Bersama', salesPerson:'Budi Hartono',
    submittedDate:'2025-06-12', validUntil:'2025-07-12',
    totalAmt:490000000, currency:'IDR',
    notes:'All units include 3-year warranty. Delivery within 14 days after PO.',
    status:'Submitted', termsOfPayment:'Net 30', deliveryTerms:'DAP Site',
    leadTime:'14 days', warrantyPeriod:'3 years',
    rejectionNote:null, poSapNo:null, approvedBy:null, approvedAt:null,
    items:J(ITEMS_QT), files:J([]),
    priceConditions:J({ discount:0, surcharge:0, freight:0, insurance:0 }),
    scores:null, awardProposal:null
  },
  {
    id:'QT-2025-0002', rfqId:'RFQ-2025-0001', rfqTitle:'Procurement of Laptops & Workstations',
    vendorId:'10000002', vendorName:'CV Sukses Mandiri', salesPerson:'Dewi Lestari',
    submittedDate:'2025-06-14', validUntil:'2025-07-14',
    totalAmt:510000000, currency:'IDR',
    notes:'Best price in market. Free installation included.',
    status:'Rejected', termsOfPayment:'Net 30', deliveryTerms:'DAP Site',
    leadTime:'21 days', warrantyPeriod:'2 years',
    rejectionNote:'Price above budget ceiling.', poSapNo:null, approvedBy:null, approvedAt:null,
    items:J(ITEMS_QT), files:J([]),
    priceConditions:J({ discount:2, surcharge:0, freight:500000, insurance:0 }),
    scores:null, awardProposal:null
  },
  {
    id:'QT-2025-0003', rfqId:'RFQ-2025-0002', rfqTitle:'Security Services – HO Building',
    vendorId:'10000002', vendorName:'CV Sukses Mandiri', salesPerson:'Ahmad Fauzi',
    submittedDate:'2025-06-10', validUntil:'2025-07-10',
    totalAmt:350000000, currency:'IDR',
    notes:'Experienced team of 10 security officers. 24/7 coverage.',
    status:'Accepted', termsOfPayment:'Net 30', deliveryTerms:'On-site',
    leadTime:'7 days', warrantyPeriod:'N/A',
    rejectionNote:null, poSapNo:'PO-2025-0018', approvedBy:'Ahmad Rizki', approvedAt:'2025-06-20T10:00:00Z',
    items:J([{ no:1, desc:'Security officer service 12 months', materialGroup:'Security Services', qty:12, uom:'Month', unitPrice:29166667, total:350000000 }]),
    files:J([]),
    priceConditions:J({ discount:0, surcharge:0, freight:0, insurance:0 }),
    scores:J({ technical:85, commercial:80, hse:90, weighted:84 }),
    awardProposal:J({ poNo:'PO-2025-0018', awardedAt:'2025-06-20T10:00:00Z' })
  },
  {
    id:'QT-2025-0004', rfqId:'RFQ-2025-0003', rfqTitle:'HVAC Maintenance Contract',
    vendorId:'10000001', vendorName:'PT Maju Bersama', salesPerson:'Rina Susanti',
    submittedDate:'2025-06-18', validUntil:'2025-07-18',
    totalAmt:228000000, currency:'IDR',
    notes:'Annual HVAC maintenance for all floors.',
    status:'Accepted', termsOfPayment:'Net 45', deliveryTerms:'On-site',
    leadTime:'14 days', warrantyPeriod:'1 year',
    rejectionNote:null, poSapNo:'PO-2025-0019', approvedBy:'Siti Rahma', approvedAt:'2025-06-25T14:00:00Z',
    items:J([{ no:1, desc:'HVAC full maintenance 12 months', materialGroup:'Maintenance', qty:12, uom:'Month', unitPrice:19000000, total:228000000 }]),
    files:J([]),
    priceConditions:J({ discount:5, surcharge:0, freight:0, insurance:0 }),
    scores:J({ technical:88, commercial:85, hse:92, weighted:87.5 }),
    awardProposal:J({ poNo:'PO-2025-0019', awardedAt:'2025-06-25T14:00:00Z' })
  }
];

const seedRfqs = [
  {
    id:'RFQ-2025-0001', title:'Procurement of Laptops & Workstations',
    postedDate:'2025-06-01', closingDate:'2025-06-15',
    postedBy:'Siti Rahma', cat:'IT Hardware', estVal:500000000,
    companyCode:'BRMS', plant:'1000', purchOrg:'1000', purchGroup:'P01',
    desc:'Procurement of 50 units laptop and 10 units workstation for operational needs.',
    status:'Closed', rfqType:'Open', publishedAt:'2025-06-01T08:00:00Z', invitationNo:'INV-RFQ-2025-0001',
    scoredAt:'2025-06-20T10:00:00Z', scoredBy:'Budi Santoso',
    scoreNotes:'PT Maju Bersama selected as best value.',
    submittedForApprovalAt:null, submittedForApprovalBy:null,
    committeeGroup:null, approvalPriority:null, approvalTargetDate:null,
    targets:J(['10000001','10000002']),
    items:J(ITEMS_RFQ), discussions:J([]), awardProposal:null
  },
  {
    id:'RFQ-2025-0002', title:'Security Services – HO Building',
    postedDate:'2025-06-05', closingDate:'2025-06-20',
    postedBy:'Ahmad Rizki', cat:'Security Services', estVal:400000000,
    companyCode:'BRMS', plant:'1000', purchOrg:'1000', purchGroup:'P02',
    desc:'Annual security services for Head Office building, 24/7 coverage required.',
    status:'Closed', rfqType:'Open', publishedAt:'2025-06-05T08:00:00Z', invitationNo:'INV-RFQ-2025-0002',
    scoredAt:'2025-06-22T14:00:00Z', scoredBy:'Budi Santoso',
    scoreNotes:'CV Sukses Mandiri selected with best HSE score.',
    submittedForApprovalAt:null, submittedForApprovalBy:null,
    committeeGroup:null, approvalPriority:null, approvalTargetDate:null,
    targets:J(['10000002']),
    items:J([{ no:1, desc:'Security officer service', type:'Service', acctAssign:'K', materialNo:'', materialGroup:'Security', plant:'1000', qty:12, uom:'Month', estPrice:35000000, requirementDate:'2025-08-01', startDate:'2025-08-01', endDate:'2026-07-31' }]),
    discussions:J([]), awardProposal:null
  },
  {
    id:'RFQ-2025-0003', title:'HVAC Maintenance Contract',
    postedDate:'2025-06-10', closingDate:'2025-06-25',
    postedBy:'Siti Rahma', cat:'Maintenance', estVal:250000000,
    companyCode:'CPMS', plant:'2000', purchOrg:'1000', purchGroup:'P03',
    desc:'Annual HVAC maintenance contract for all company floors including spare parts.',
    status:'Closed', rfqType:'Open', publishedAt:'2025-06-10T08:00:00Z', invitationNo:'INV-RFQ-2025-0003',
    scoredAt:null, scoredBy:null, scoreNotes:null,
    submittedForApprovalAt:null, submittedForApprovalBy:null,
    committeeGroup:null, approvalPriority:null, approvalTargetDate:null,
    targets:J(['10000001']),
    items:J([{ no:1, desc:'HVAC maintenance annual', type:'Service', acctAssign:'K', materialNo:'', materialGroup:'Maintenance', plant:'2000', qty:12, uom:'Month', estPrice:20000000, requirementDate:'2025-08-01', startDate:'2025-08-01', endDate:'2026-07-31' }]),
    discussions:J([]), awardProposal:null
  },
  {
    id:'RFQ-2025-0004', title:'Industrial Safety Equipment',
    postedDate:'2025-07-01', closingDate:'2025-07-20',
    postedBy:'Ahmad Rizki', cat:'Safety Equipment', estVal:180000000,
    companyCode:'BRMS', plant:'1000', purchOrg:'1000', purchGroup:'P01',
    desc:'Supply of industrial safety equipment including PPE, helmets, and fire extinguishers.',
    status:'Open', rfqType:'Open', publishedAt:'2025-07-01T08:00:00Z', invitationNo:'INV-RFQ-2025-0004',
    scoredAt:null, scoredBy:null, scoreNotes:null,
    submittedForApprovalAt:null, submittedForApprovalBy:null,
    committeeGroup:null, approvalPriority:null, approvalTargetDate:null,
    targets:J(['10000001','10000002']),
    items:J([{ no:1, desc:'Safety helmet type A', type:'Material', acctAssign:'K', materialNo:'MAT-SAF-001', materialGroup:'Safety', plant:'1000', qty:100, uom:'EA', estPrice:500000, requirementDate:'2025-08-15', startDate:'2025-08-15', endDate:'2025-08-15' }]),
    discussions:J([]), awardProposal:null
  },
  {
    id:'RFQ-2025-0005', title:'IT Infrastructure Services',
    postedDate:'2025-07-05', closingDate:'2025-07-25',
    postedBy:'Siti Rahma', cat:'IT Services', estVal:650000000,
    companyCode:'BRMS', plant:'1000', purchOrg:'1000', purchGroup:'P02',
    desc:'IT infrastructure setup and managed services for new data center expansion.',
    status:'Open', rfqType:'Open', publishedAt:'2025-07-05T08:00:00Z', invitationNo:'INV-RFQ-2025-0005',
    scoredAt:null, scoredBy:null, scoreNotes:null,
    submittedForApprovalAt:null, submittedForApprovalBy:null,
    committeeGroup:null, approvalPriority:null, approvalTargetDate:null,
    targets:J(['10000001','10000002']),
    items:J([{ no:1, desc:'Server rack installation', type:'Service', acctAssign:'K', materialNo:'', materialGroup:'IT Services', plant:'1000', qty:1, uom:'LS', estPrice:650000000, requirementDate:'2025-09-01', startDate:'2025-09-01', endDate:'2025-12-31' }]),
    discussions:J([]), awardProposal:null
  }
];

module.exports = { seedInvoices, seedQuotations, seedRfqs };
