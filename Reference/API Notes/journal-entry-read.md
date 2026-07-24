# Journal Entry Item – Read (A2X)

**Service:** `API_JOURNALENTRYITEMBASIC_SRV`  
**Protocol:** OData V2  
**Comm. arrangement:** SAP_COM_0002 (same as posting services)

---

## Intended Use

Designed **exclusively for SAP Analytics Cloud (SAC) integration** — financial planning and reporting data extraction. Not a general-purpose FI query API.

---

## Key Entity

`A_JournalEntryItemBasic`

| Field | Notes |
|---|---|
| `CompanyCode` | |
| `GLAccount` | |
| `Ledger` | |
| `LedgerFiscalYear` | |
| `FiscalPeriod` | |
| `AmountInTransactionCurrency` | |
| `AmountInGlobalCurrency` | |
| `AmountInCompanyCodeCurrency` | |
| `CostCenter` | |
| `ProfitCenter` | |
| `Segment` | |
| `DebitCreditCode` | `S` = Debit, `H` = Credit |

---

## Useful Filter Patterns

```
$filter=CompanyCode eq 'BRMS' and LedgerFiscalYear eq '2025'
$filter=Ledger eq '0L' and FiscalPeriod eq '001'
```

---

## What This API Does NOT Have

| Missing field | Consequence |
|---|---|
| `PurchaseOrder` | Cannot filter GR/IR items by PO — use `API_OPLACCTGDOCITEMCUBE_SRV` instead |
| `AccountingDocumentType` | Cannot filter by document type (e.g., 'WE' for Goods Receipts) |
| `AccountingDocument` | No direct document number lookup |

OData V2 limitation: cannot filter on navigation properties / sub-entities.

---

## Gotchas

- **Not for operational queries** — if you need to look up a specific document, GR amount, or PO-linked items, use `API_OPLACCTGDOCITEMCUBE_SRV` (see `fi-other.md`).
- Read-only; no write operations.
- Large result sets may be throttled — use `$top` / `$skip` pagination.
- No `AccountingDocumentType` filter means you cannot isolate Goods Receipt documents from this service.
