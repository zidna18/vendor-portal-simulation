# Temporary Solutions / Tech Debt

This file tracks known shortcuts and workarounds that need proper implementation before go-live.
Created: 2026-07-23

---

## 1. PO Total Amount — Still Returns 0

**File:** `cap/srv/vendor-service.js` — `/api/purchaseOrderItems` handler
**Issue:** `poAmount` is calculated from `NetPriceAmount / NetPriceQuantity * OrderQuantity` from `API_PURCHASEORDER_PROCESS_SRV`. In some cases this returns 0 because the PO line has no price or a different price unit.
**Temporary fix:** The frontend still shows 0 for PO Amount column. Post to SAP still works because the invoice amount is taken from `inv.amount`, not `poAmount`.
**Proper fix:** Fetch net amount directly from `A_PurchaseOrderItem` `NetAmount` field (OData V4: `api_purchaseorder_2`) or derive from `NetPriceAmount * OrderQuantity / NetPriceQuantity` with proper unit handling.

---

## 2. GR Amount — Hardcoded by Delivery Indicator, Not Real ACDOCA

**File:** `cap/srv/vendor-service.js` — `/api/purchaseOrderItems` handler
**Issue:** GR (Goods Receipt) amount is approximated by checking `IsCompletelyDelivered` flag from PO V4 API. If delivered → uses PO amount as GR amount. If not → 0.
**Temporary fix:** `grAmount = isDelivered ? poAmount : '0'`
**Proper fix:** Query `ACDOCA` (Universal Journal) or `I_PurchaseOrderHistoryAPI` to get the actual GR posted amounts from Material Documents (movement type 101/102). This requires either ACDOCA read access or `API_MATERIAL_DOCUMENT_SRV`.

---

## 3. PO Reuse Validation — Disabled

**File:** `src/InvoicePages.tsx` lines ~298-299
**Issue:** Validation preventing the same PO from being used in multiple active invoices was disabled for integration testing.
**Temporary fix:** Check commented out with `// TODO: re-enable PO reuse check after integration testing is complete`
**Proper fix:** Re-enable once testing is done. Consider whether the rule should be enforced at backend level (CAP service) rather than frontend-only, since it can be bypassed by direct API calls.

---

## 4. Attachments — Stored in HANA Cloud Schema (Not SAP DMS)

**File:** `cap/db/schema.cds` — `InvoiceAttachments` entity; `cap/srv/vendor-service.js` — `/api/attach` handler
**Issue:** Invoice attachments are stored as binary blobs in the HANA Cloud HDI schema (`vendor.portal.InvoiceAttachments`). This is not the proper SAP DMS (Document Management System) or SAP ArchiveLink.
**Temporary fix:** Upload to HANA first, then on "Post to SAP" the backend pushes attachments to SAP via `API_CV_ATTACHMENT_SRV` linked to the BKPF document.
**Proper fix:** Use SAP DMS / ArchiveLink directly from the frontend, or integrate with SAP Object Store. Consider cleanup of HANA blobs after successful SAP upload to avoid double storage.

---

## 5. Invoice Items — Not Persisted in Portal DB

**File:** `src/apiService.ts` — `serializeInvoice`, `parseInvoice`; `cap/srv/vendor-service.js` — Step 0 of postInvoice
**Issue:** Invoice line items (`items` array) are serialized as a JSON string in HANA but the portal invoice form does not populate them. At post time, the backend fetches live PO items from SAP `API_PURCHASEORDER_PROCESS_SRV`.
**Temporary fix:** Backend Step 0 fetches items from SAP at post time if `inv.items` is empty.
**Proper fix:** Invoice form should populate and persist `items` properly so they survive edits and BRM review. The vendor should be able to adjust invoice quantities/amounts per line item before submission.

---

## Notes

- All SAP calls use destination `S4HC` (SAP_COM_0057 communication arrangement)
- SAP client: `120` (DIQ tenant)
- `SupplierInvoiceStatus: "B"` (Save as Completed) is the correct production approach — triggers SAP Flexible Workflow, do NOT change to direct Post
- Debug logging (`[postInvoice] PaymentTerms:`, `[postInvoice] items count:`) should be removed once flow is stable
