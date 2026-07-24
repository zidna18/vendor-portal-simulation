# Journal Entry – Change (Asynchronous)

**Technical name:** `JournalEntryBulkChangeRequest_In`  
**Protocol:** SOAP (inbound)  
**Comm. arrangement:** SAP_COM_0002  
**AIF:** namespace `/FINAC` · interface `JECHANGEIN` / `FINAC_RECT_JECHANGE_IN`

---

## Scope

Only documents **with entry views** can be changed. Posted documents without entry views (e.g., GR/IR) are not supported.

---

## Service Nodes

```
JournalEntryHeader
JournalEntryGLItem
JournalEntryDebtorCreditorItem   (AP/AR items)
```

**Ordering rule:** Lines must be grouped and sequential — all headers first, then GL items, then APAR items.

---

## Change Pattern (XML)

Each changeable field uses `FieldValueChangeIsRequested=true`:

```xml
<DocumentHeaderTextChange>
  <DocumentHeaderText>New text here</DocumentHeaderText>
  <FieldValueChangeIsRequested>true</FieldValueChangeIsRequested>
</DocumentHeaderTextChange>
```

Omitting `FieldValueChangeIsRequested` (or setting it `false`) leaves the field unchanged.

---

## Changeable Fields

### Header (`JournalEntryHeader`)

| Field |
|---|
| `DocumentHeaderText` |
| `DocumentReferenceID` |
| Country-specific reference/date fields 1–5 |
| Business partner fields 1–2 |

### GL Item (`JournalEntryGLItem`)

| Field |
|---|
| `DocumentItemText` |
| `AssignmentReference` |
| `StateCentralBankPaymentReason` |
| `SupplyingCountry` |
| `Reference1/2/3IDByBusinessPartner` |
| `PaymentDifferenceReason` |

### AP/AR Item (`JournalEntryDebtorCreditorItem`)

All GL item fields above, plus:

| Field |
|---|
| `PaymentTerms` |
| `DueCalculationBaseDate` |
| `CashDiscount1Days` / `CashDiscount2Days` |
| `CashDiscount1Percent` / `CashDiscount2Percent` |
| `NetPaymentDays` |
| `PaymentMethod` |
| `PaymentBlockingReasonCode` (`A` or `B`) |
| `FixedCashDiscount` |
| `BPBankAccountInternalID` |
| `HouseBank` / `HouseBankAccount` |
| `InvoiceReference` / `InvoiceReferenceFiscalYear` / `InvoiceItemReference` |
| `AmountInPaymentCurrency` |
| `LastDunningDate` |
| `DunningBlockingReasonCode` |
| `DunningLevel` / `DunningKey` |
| `SpecialGLAccountAssignment` |

---

## Gotchas

- Line ordering is strict — headers before GL items before APAR items. Mixed order causes errors.
- Only entry-view documents are changeable; check document type before calling.
- `PaymentBlockingReasonCode` accepts only `A` (payment block) or `B` (dunning block).
- To clear a field, set it to blank with `FieldValueChangeIsRequested=true`.
- Async only — errors appear in AIF monitor under `/FINAC` namespace.
