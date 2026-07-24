# Journal Entry – Clearing (Asynchronous)

**Technical name:** `JournalEntryBulkClearingRequest_In`  
**Protocol:** SOAP (inbound)  
**Comm. arrangement:** SAP_COM_0002  
**AIF:** namespace `/FINAC` · interface `FINAC_RECT_JECLEARING_IN`

---

## Supported Clearing Types

| Type | How to trigger |
|---|---|
| Full clearing | Provide open item references; no extra fields needed |
| Partial clearing | Add `PartialPaymentAmtInDspCrcy` (sign ignored — offsetting D/C applied automatically) |
| Residual clearing | Add `OtherDeductionAmountInDspCrcy` (sign **must match** underlying item) + `PaymentDifferenceReason` |

---

## Mandatory Header Fields (`JournalEntry` node)

| Field | Notes |
|---|---|
| `CompanyCode` | |
| `AccountingDocumentType` | |
| `DocumentDate` | |
| `PostingDate` | |
| `CurrencyCode` | Display/payment currency |

---

## GL Items (`GLItems` node)

| Field | Mandatory | Notes |
|---|---|---|
| `GLAccount` | Yes | Clearing GL account |
| `FiscalYear` | Yes | Of the open item |
| `AccountingDocument` | Yes | Open item doc number |
| `AccountingDocumentItem` | Yes | Line item number |

---

## AP/AR Items (`APARItems` node)

| Field | Mandatory | Notes |
|---|---|---|
| `AccountType` | Yes | `K` = Vendor (AP), `D` = Customer (AR) |
| `APARAccount` | Yes | Vendor or customer account number |
| `FiscalYear` | Yes | |
| `AccountingDocument` | Yes | |
| `AccountingDocumentItem` | Yes | |

---

## Optional Partial/Residual Fields

| Field | Clearing type | Notes |
|---|---|---|
| `PartialPaymentAmtInDspCrcy` | Partial | Sign ignored; SAP applies correct D/C |
| `OtherDeductionAmountInDspCrcy` | Residual | Sign must match underlying item |
| `PaymentDifferenceReason` | Residual | Required when using deduction amount |

---

## Gotchas

- Cash discount is **not supported** in combination with partial payments.
- Partial clearing sign is auto-corrected; residual clearing sign is not — wrong sign causes error.
- G/L, customer (D), and vendor (K) accounts can all be cleared in one request.
- AIF monitoring same pattern as posting — check `/FINAC` namespace for error logs.
- Async only — no synchronous variant for clearing.
