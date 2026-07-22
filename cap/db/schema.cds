namespace vendor.portal;

entity Invoices {
  key id            : String(50);
  invoiceNo         : String(50);
  invoiceType       : String(30)    default 'Invoice';
  vendorId          : String(20);
  vendorName        : String(200);
  companyCode       : String(4);
  amount            : Decimal(15,2);
  currency          : String(5)     default 'IDR';
  vatBase           : Decimal(15,2);
  vatAmt            : Decimal(15,2);
  whtType           : String(20);
  whtBase           : Decimal(15,2);
  whtAmt            : Decimal(15,2);
  additionalFee     : Decimal(15,2);
  feeCategory       : String(100);
  paymentTerms      : String(100);
  invoiceDate       : Date;
  dueDate           : Date;
  desc              : String(2000);
  status            : String(30)    default 'Draft';
  submittedAt       : DateTime;
  confirmedAt       : DateTime;
  postedAt          : DateTime;
  sapDocNo          : String(50);
  convertedDocNo    : String(50);
  clearingDocNo     : String(50);
  rejReason         : String(500);
  taxDoc            : String(100);
  poNumbers         : LargeString;  // JSON: string[]
  items             : LargeString;  // JSON: item[]
  files             : LargeString;  // JSON: file[]
}

entity Quotations {
  key id            : String(50);
  rfqId             : String(20);
  rfqTitle          : String(200);
  vendorId          : String(20);
  vendorName        : String(200);
  salesPerson       : String(100);
  submittedDate     : Date;
  validUntil        : Date;
  totalAmt          : Decimal(15,2);
  currency          : String(5)     default 'IDR';
  notes             : String(2000);
  status            : String(30)    default 'Draft';
  termsOfPayment    : String(100);
  deliveryTerms     : String(100);
  leadTime          : String(50);
  warrantyPeriod    : String(50);
  rejectionNote     : String(500);
  poSapNo           : String(50);
  approvedBy        : String(100);
  approvedAt        : DateTime;
  items             : LargeString;  // JSON: item[]
  files             : LargeString;  // JSON: file[]
  priceConditions   : LargeString;  // JSON: object
  scores            : LargeString;  // JSON: object | null
  awardProposal     : LargeString;  // JSON: object | null
}

entity InvoiceAttachments {
  key id          : UUID;
  invoiceId       : String(36);      // FK → Invoices.id
  fileName        : String(255);
  mimeType        : String(100);
  fileSize        : Integer;
  content         : LargeBinary;     // actual file bytes stored in HANA
  uploadedAt      : DateTime;
  uploadedBy      : String(100);
}

entity RFQs {
  key id                     : String(50);
  title                      : String(200);
  postedDate                 : Date;
  closingDate                : Date;
  postedBy                   : String(100);
  cat                        : String(100);
  estVal                     : Decimal(15,2);
  companyCode                : String(4);
  plant                      : String(10);
  purchOrg                   : String(10);
  purchGroup                 : String(10);
  desc                       : String(2000);
  status                     : String(30)  default 'Open';
  rfqType                    : String(30);
  publishedAt                : DateTime;
  invitationNo               : String(50);
  scoredAt                   : DateTime;
  scoredBy                   : String(100);
  scoreNotes                 : String(500);
  submittedForApprovalAt     : DateTime;
  submittedForApprovalBy     : String(100);
  committeeGroup             : String(100);
  approvalPriority           : String(20);
  approvalTargetDate         : Date;
  targets                    : LargeString; // JSON: string[]
  items                      : LargeString; // JSON: item[]
  discussions                : LargeString; // JSON: message[]
  awardProposal              : LargeString; // JSON: object | null
}
