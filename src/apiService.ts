import { VENDORS } from './shared';

// VITE_USE_MOCK=false → BTP (real CAP backend)
// anything else     → mock mode (Vercel / local dev)
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = '/api';

export const isMockMode = USE_MOCK;

// ── Dynamic mock data loader (tree-shaken out when VITE_USE_MOCK=false) ──────
async function getMockData() {
  if (!USE_MOCK) return null;
  const m = await import('./data/mockData');
  // Populate the mutable VENDORS binding in shared.tsx so all components see it
  Object.assign(VENDORS, m.VENDORS);
  return m;
}

// ── HTTP helpers ──────────────────────────────────────────────────
async function odataGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return json.value ?? json;
}

async function odataPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    const msg = detail?.error?.message || detail?.message || JSON.stringify(detail);
    throw new Error(`API POST ${res.status}: ${path}\n${msg}`);
  }
  return res.json();
}

async function odataPatch(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    const msg = detail?.error?.message || detail?.message || JSON.stringify(detail);
    throw new Error(`API PATCH ${res.status}: ${path}\n${msg}`);
  }
  return res.status === 204 ? null : res.json();
}

// ── Vendor Master (BTP only — SAP API_BUSINESS_PARTNER via Destination 'S4HC') ──
export async function fetchVendorMaster(vendorId: string) {
  const raw = await odataGet(`/VendorPortal/vendorMaster(vendorId='${vendorId}')`);
  return {
    ...raw,
    addresses: parseJsonField(raw.addresses, []),
    banks:     parseJsonField(raw.banks, []),
    lfb1:      parseJsonField(raw.lfb1,  []),
    lfm1:      parseJsonField(raw.lfm1,  []),
  };
}

// ── JSON field helper ─────────────────────────────────────────────
function parseJsonField(s: any, fallback: any) {
  if (s == null) return fallback;
  try { return typeof s === 'string' ? JSON.parse(s) : s; } catch { return fallback; }
}

function parseInvoice(r: any) {
  return { ...r, poNumbers: parseJsonField(r.poNumbers, []), items: parseJsonField(r.items, []), files: parseJsonField(r.files, []) };
}
function parseQuotation(r: any) {
  return { ...r, items: parseJsonField(r.items, []), files: parseJsonField(r.files, []), priceConditions: parseJsonField(r.priceConditions, {}), scores: parseJsonField(r.scores, null), awardProposal: parseJsonField(r.awardProposal, null) };
}
function parseRfq(r: any) {
  return { ...r, targets: parseJsonField(r.targets, []), items: parseJsonField(r.items, []), discussions: parseJsonField(r.discussions, []), awardProposal: parseJsonField(r.awardProposal, null) };
}

// Schema-known fields only — CAP may reject unknown properties
const INV_FIELDS = new Set(['id','invoiceNo','invoiceType','vendorId','vendorName','companyCode',
  'amount','currency','vatBase','vatAmt','whtType','whtBase','whtAmt','additionalFee','feeCategory',
  'paymentTerms','invoiceDate','dueDate','desc','status','submittedAt','confirmedAt','postedAt',
  'sapDocNo','convertedDocNo','clearingDocNo','rejReason','taxDoc','poNumbers','items','files']);

function toDateTime(d: any) {
  if (!d) return null;
  // If already a full ISO string keep it; bare date → add midnight UTC
  return String(d).length === 10 ? `${d}T00:00:00Z` : d;
}

function serializeInvoice(inv: any) {
  const out: any = {};
  for (const k of INV_FIELDS) {
    if (k in inv) out[k] = inv[k];
  }
  out.poNumbers   = JSON.stringify(inv.poNumbers  || []);
  out.items       = JSON.stringify(inv.items       || []);
  out.files       = JSON.stringify(inv.files       || []);
  out.submittedAt = toDateTime(inv.submittedAt);
  out.confirmedAt = toDateTime(inv.confirmedAt);
  out.postedAt    = toDateTime(inv.postedAt);
  return out;
}
function serializeQuotation(qt: any) {
  return { ...qt, items: JSON.stringify(qt.items || []), files: JSON.stringify(qt.files || []), priceConditions: JSON.stringify(qt.priceConditions || {}), scores: qt.scores ? JSON.stringify(qt.scores) : null, awardProposal: qt.awardProposal ? JSON.stringify(qt.awardProposal) : null };
}
function serializeRfq(rfq: any) {
  return { ...rfq, targets: JSON.stringify(rfq.targets || []), items: JSON.stringify(rfq.items || []), discussions: JSON.stringify(rfq.discussions || []), awardProposal: rfq.awardProposal ? JSON.stringify(rfq.awardProposal) : null };
}

// ── Loaders ───────────────────────────────────────────────────────
export async function loadInvoices() {
  if (USE_MOCK) {
    const m = await getMockData();
    return [...m!.INIT_INV];
  }
  const rows = await odataGet('/VendorPortal/Invoices?$orderby=submittedAt desc');
  return rows.map(parseInvoice);
}

export async function loadQuotations() {
  if (USE_MOCK) {
    const m = await getMockData();
    return [...m!.INIT_QT];
  }
  const rows = await odataGet('/VendorPortal/Quotations?$orderby=submittedDate desc');
  return rows.map(parseQuotation);
}

export async function loadRfqs() {
  if (USE_MOCK) {
    const m = await getMockData();
    return [...m!.INIT_RFQS];
  }
  const rows = await odataGet('/VendorPortal/RFQs?$orderby=postedDate desc');
  return rows.map(parseRfq);
}

// ── Savers (BTP only — mock mode returns input unchanged) ─────────
export async function saveInvoice(invoice: any) {
  if (USE_MOCK) return invoice;
  const payload = serializeInvoice(invoice);
  if (invoice.id) {
    try {
      await odataPatch(`/VendorPortal/Invoices('${invoice.id}')`, payload);
      return invoice;
    } catch (e: any) {
      if (e.message?.includes('404')) {
        // Record not in DB yet (ID was assigned client-side for attachment upload)
        return parseInvoice(await odataPost('/VendorPortal/Invoices', payload));
      }
      throw e;
    }
  }
  return parseInvoice(await odataPost('/VendorPortal/Invoices', payload));
}

export async function saveQuotation(qt: any) {
  if (USE_MOCK) return qt;
  const payload = serializeQuotation(qt);
  if (qt.id) {
    await odataPatch(`/VendorPortal/Quotations('${qt.id}')`, payload);
    return qt;
  }
  return parseQuotation(await odataPost('/VendorPortal/Quotations', payload));
}

export async function saveRfq(rfq: any) {
  if (USE_MOCK) return rfq;
  const payload = serializeRfq(rfq);
  if (rfq.id) {
    await odataPatch(`/VendorPortal/RFQs('${rfq.id}')`, payload);
    return rfq;
  }
  return parseRfq(await odataPost('/VendorPortal/RFQs', payload));
}

// ── Purchase Orders (BTP: live from SAP; mock: returns null → caller uses MOCK_POS) ──
export async function fetchPurchaseOrders(vendorId: string): Promise<any[] | null> {
  if (USE_MOCK) return null;
  try {
    const rows = await odataGet(`/VendorPortal/purchaseOrders(vendorId='${vendorId}')`);
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.warn('[fetchPurchaseOrders] failed:', e);
    return null;
  }
}

// ── PO Line Items (BTP: live from SAP; mock: returns null → caller uses getMockPoItem) ──
export async function fetchPurchaseOrderItems(poNumbers: string[]): Promise<any[] | null> {
  if (USE_MOCK) return null;
  if (!poNumbers.length) return [];
  try {
    const param = poNumbers.join(','); // plain comma — OData string literals don't URL-decode %2C
    const rows = await odataGet(`/VendorPortal/purchaseOrderItems(poNumbers='${param}')`);
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.warn('[fetchPurchaseOrderItems] failed:', e);
    return null;
  }
}

// ── Post Supplier Invoice to SAP S/4HANA ─────────────────────────
export async function postInvoiceToSAP(invoice: any): Promise<{ sapDocNo: string; sapDoc: any }> {
  if (USE_MOCK) {
    // Mock mode: simulate SAP response
    const num = Math.floor(1000000000 + Math.random() * 899999999).toString().slice(0, 10);
    const year = new Date().getFullYear();
    return { sapDocNo: `${num}/${year}`, sapDoc: {} };
  }
  const res = await fetch(`${API_BASE}/postInvoice`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Post to SAP failed: ${res.status}`);
  }
  return res.json();
}

// ── Delete Invoice ────────────────────────────────────────────────
export async function deleteInvoice(id: string) {
  if (USE_MOCK) return;
  const res = await fetch(`${API_BASE}/VendorPortal/Invoices('${id}')`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 404) throw new Error(`Delete failed: ${res.status}`);
}

// ── Attachment helpers (BTP only) ─────────────────────────────────
export async function uploadAttachment(invoiceId: string, file: File): Promise<{ id: string; fileName: string; fileSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch(`${API_BASE}/attach`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId, fileName: file.name, mimeType: file.type, content: base64 }),
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        resolve(await res.json());
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function attachmentDownloadUrl(id: string) {
  return `${API_BASE}/attach/${id}`;
}

export async function listAttachments(invoiceId: string): Promise<any[]> {
  if (USE_MOCK) return [];
  const rows = await odataGet(`/VendorPortal/InvoiceAttachments?$filter=invoiceId eq '${invoiceId}'`);
  return Array.isArray(rows) ? rows : [];
}
