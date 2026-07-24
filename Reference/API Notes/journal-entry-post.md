# Journal Entry – Post (Sync / Async / By-Ledger)

**Protocol:** SOAP (inbound service)  
**Comm. arrangement:** SAP_COM_0002 (activate/reactivate when first enabling)  
**Monitoring:** AIF monitor — Application Interface Framework

---

## Variants at a Glance

| Variant | Technical Name | AIF Interface | Async? | Reversal | AR/AP/Tax nodes |
|---|---|---|---|---|---|
| Synchronous | `JournalEntryCreateRequestConfirmation_In` | — | No | Yes | Yes |
| Asynchronous | `JournalEntryBulkCreationRequest_In` | `/FINAC` · `JRNLENTRIN` | Yes | Yes | Yes |
| By-Ledger (async) | `JournalEntryBulkLedgerCreationRequest_In` | `/FINAC` · `JELDGR_IN` | Yes | **No** | **No** |

AIF error logs retained 60 days. Async outbound confirmation: `JournalEntryBulkCreationRequest_Out`.

---

## Mandatory Header Fields (all variants)

| Field | Notes |
|---|---|
| `OriginalReferenceDocumentType` | Always `BKPFF` |
| `BusinessTransactionType` | `RFBU` (standard) or `AZAF` (down-payment) |
| `AccountingDocumentType` | e.g. `KR`, `RE`, `SA` |
| `CreatedByUser` | |
| `CompanyCode` | |
| `DocumentDate` | |
| `PostingDate` | |

**By-Ledger only — additional mandatory field:**  
`LedgerGroup` — standard ledger group; extension ledgers not supported.

**Async only — additional mandatory field:**  
`MessageHeader.ID` — unique per message, max 35 characters.

---

## Document Structure (nodes)

```
JournalEntry (header)
├── Item              GL account line (debit/credit)
├── DebtorItem        Customer (AR) line       ← NOT in By-Ledger variant
├── CreditorItem      Vendor (AP) line          ← NOT in By-Ledger variant
├── ProductTaxItem    Tax line                  ← NOT in By-Ledger variant
└── WithholdingTaxItem WHT line                 ← NOT in By-Ledger variant
```

By-Ledger variant: only `Item` (GL) node is accepted.

---

## Key Item Fields

| Field | Notes |
|---|---|
| `GLAccount` | |
| `DebitCreditCode` | `S` = Debit, `H` = Credit |
| `AmountInTransactionCurrency` | |
| `TransactionCurrency` | |
| `CostCenter` / `ProfitCenter` / `Segment` | CO assignments |
| `DocumentItemText` | Line-level text |
| `AssignmentReference` | |

---

## Reversal Posting

- **Sync & Async:** Supported — provide `ReversalReason` + `ReversalReferenceDocument` in header.  
- **By-Ledger:** NOT supported — do not include `ReversalReferenceDocument`.

Negative posting supported at item level (all variants).

---

## Sync Response

`JournalEntryCreateConfirmation` returns:
- `AccountingDocument`
- `CompanyCode`
- `FiscalYear`

---

## Gotchas

- By-Ledger only posts to the standard ledger; extension ledger postings require the standard variant.
- Async requires unique `MessageHeader.ID` — reusing an ID causes duplicate-detection rejection.
- SAP_COM_0002 must be activated (and re-activated after system refresh) before async services work.
- Do not mix reversal fields into By-Ledger payloads — ignored at best, error at worst.
- BusinessTransactionType `AZAF` routes to SAP BPA Down Payment workflow; `RFBU` routes to Flexible Workflow.
