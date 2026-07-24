# FI Other APIs

---

## Operational Journal Entry Item – Read (A2X)  ← PRIMARY USE CASE

**Service:** `API_OPLACCTGDOCITEMCUBE_SRV`  
**Protocol:** OData V2  
**Comm. arrangement:** Check SAP Business Accelerator Hub (not explicitly named in doc)

### Key Entity

`A_OperationalAcctgDocItemCube`

**Keys:** `CompanyCode`, `FiscalYear`, `AccountingDocument`, `AccountingDocumentItem`

### Key Fields

| Field | Notes |
|---|---|
| `AccountingDocumentType` | `WE` = Goods Receipt, `RE` = Vendor Invoice, `KR` = Vendor Credit, etc. |
| `DebitCreditCode` | `S` = Debit (cost/inventory side), `H` = Credit (GR/IR payable side) |
| `PurchasingDocument` | PO number — filterable |
| `PurchasingDocumentItem` | PO line item |
| `AmountInTransactionCurrency` | Amount in document currency |
| `TransactionCurrency` | Document currency |
| `AmountInCompanyCodeCurrency` | Amount in local currency |
| `CompanyCodeCurrency` | Local currency |
| `GLAccount` | |
| `CompanyCode` | |
| `FiscalYear` | |
| `PostingDate` | |
| `Vendor` | Vendor account (for AP items) |

### GR Amount Lookup — Filter Pattern

```
$filter=AccountingDocumentType eq 'WE'
  and PurchasingDocument eq '4500000123'
  and DebitCreditCode eq 'H'
```

- `DebitCreditCode eq 'H'` isolates the **GR/IR credit** line (what is owed to vendor).
- `DebitCreditCode eq 'S'` isolates the **inventory/cost debit** line.
- Combine with `CompanyCode` and `FiscalYear` to scope results.

### Useful Filter Patterns

```
# All GR documents for a PO
$filter=AccountingDocumentType eq 'WE' and PurchasingDocument eq '4500000123'

# GR/IR payable amount for a PO
$filter=AccountingDocumentType eq 'WE' and PurchasingDocument eq '4500000123' and DebitCreditCode eq 'H'

# Specific document lookup
$filter=CompanyCode eq 'BRMS' and FiscalYear eq '2025' and AccountingDocument eq '5000001234'
```

### Gotchas

- **Entry-view documents only** — does not expose all accounting views.
- **Not for large data volumes** — paginate with `$top`/`$skip`; avoid broad date-range queries.
- Unlike `API_JOURNALENTRYITEMBASIC_SRV`, this service has `AccountingDocumentType` and `PurchasingDocument` — use this one for GR/PO lookups.
- `DebitCreditCode` sign convention: `S` = Debit (always positive in the field), `H` = Credit (always positive in the field) — amounts are not signed.

---

## Other APIs in the FI Other Collection

| API / Service | Purpose |
|---|---|
| G/L Account Read | Master data for GL accounts |
| G/L Account Line Items Read | Line-item reporting per GL account |
| Trial Balance Read | Period totals / trial balance |
| Chart of Accounts Read | Chart of accounts master |
| Ledger Read | Ledger configuration |
| Company Code Read | Company code master data |
| Profit Center APIs | Profit center master and hierarchy |

These are standard read APIs for master/configuration data — primarily useful for populating dropdowns or validating codes before posting. Check SAP Business Accelerator Hub for comm. arrangement details per API.
