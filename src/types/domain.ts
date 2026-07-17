// domain.ts — shared TypeScript interfaces for the BRM Vendor Portal.
// These cover the three core domain arrays (invoices, quotations, rfqs) plus
// the master-data shapes for Vendor and User. All fields match the mock data
// shapes in src/data/mockData.ts and the SAP field names in apiService.ts.

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  username: string;
  name: string;
  role: "vendor" | "brm";
  vendorId?: string;
  email?: string;
  title?: string;
  avatar?: string;
}

// ── Vendor ───────────────────────────────────────────────────────────────────
export interface VendorLfb1 {
  bukrs: string;
  paymentTerms: string;
  reconcAcct: string;
  iban?: string;
}

export interface Vendor {
  id: string;
  name: string;
  cat: string;
  status: string;
  npwp?: string;
  tax?: string;
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  rep?: string;
  lfb1?: VendorLfb1[];
}

// ── Line Item ────────────────────────────────────────────────────────────────
export interface LineItem {
  id: string;
  desc: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  currency?: string;
  poItem?: string;
  taxCode?: string;
}

// ── Invoice ──────────────────────────────────────────────────────────────────
export type InvoiceStatus =
  | "Draft" | "Submitted" | "Under Review" | "Confirmed" | "Posted"
  | "Converted to Invoice" | "Cleared" | "Rejected" | "Withdrawn";

export type InvoiceType = "Invoice" | "Supplier DPR";

export interface Invoice {
  id: string;
  vendorId: string;
  invoiceNo: string;
  invoiceType: InvoiceType;
  company: string;
  purchOrg?: string;
  purchGroup?: string;
  poNo?: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  total: number;
  whtType?: string;
  whtAmt?: number;
  paymentTerms?: string;
  status: InvoiceStatus;
  submittedAt?: string;
  reviewedAt?: string;
  confirmedAt?: string;
  postedAt?: string;
  rejReason?: string;
  sapDocNo?: string;
  convertedDocNo?: string;
  clearingDocNo?: string;
  items?: LineItem[];
  attachments?: string[];
  notes?: string;
}

// ── Quotation ────────────────────────────────────────────────────────────────
export type QuotationStatus = "Draft" | "Submitted" | "Accepted" | "Rejected" | "Withdrawn";

export interface Quotation {
  id: string;
  vendorId: string;
  rfqId?: string;
  title: string;
  company: string;
  currency: string;
  total: number;
  status: QuotationStatus;
  submittedAt?: string;
  validUntil?: string;
  items?: LineItem[];
  notes?: string;
}

// ── RFQ ──────────────────────────────────────────────────────────────────────
export type RfqStatus = "Open" | "Closed";

export interface Rfq {
  id: string;
  title: string;
  company: string;
  purchOrg?: string;
  purchGroup?: string;
  currency: string;
  deadline?: string;
  status: RfqStatus;
  targets: string[];       // vendorId list
  createdAt?: string;
  items?: LineItem[];
  description?: string;
}

// ── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  text: string;
  sub?: string;
  time: string;
  read?: boolean;
  type?: "info" | "warn" | "ok" | "err";
}

export interface MockNotifs {
  brm: Notification[];
  approver: Notification[];
  director: Notification[];
  vendor: Notification[];
}
