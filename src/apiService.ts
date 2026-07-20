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
  if (!res.ok) throw new Error(`API POST ${res.status}: ${path}`);
  return res.json();
}

async function odataPatch(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API PATCH ${res.status}: ${path}`);
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

function serializeInvoice(inv: any) {
  return { ...inv, poNumbers: JSON.stringify(inv.poNumbers || []), items: JSON.stringify(inv.items || []), files: JSON.stringify(inv.files || []) };
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
    await odataPatch(`/VendorPortal/Invoices(${invoice.id})`, payload);
    return invoice;
  }
  return parseInvoice(await odataPost('/VendorPortal/Invoices', payload));
}

export async function saveQuotation(qt: any) {
  if (USE_MOCK) return qt;
  const payload = serializeQuotation(qt);
  if (qt.id) {
    await odataPatch(`/VendorPortal/Quotations(${qt.id})`, payload);
    return qt;
  }
  return parseQuotation(await odataPost('/VendorPortal/Quotations', payload));
}

export async function saveRfq(rfq: any) {
  if (USE_MOCK) return rfq;
  const payload = serializeRfq(rfq);
  if (rfq.id) {
    await odataPatch(`/VendorPortal/RFQs(${rfq.id})`, payload);
    return rfq;
  }
  return parseRfq(await odataPost('/VendorPortal/RFQs', payload));
}
