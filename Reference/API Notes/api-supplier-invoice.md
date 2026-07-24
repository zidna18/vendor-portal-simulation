# Supplier Invoice API (OData V2)

**Service:** `/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/`
**Technical name:** `API_SUPPLIERINVOICE_PROCESS_SRV_0001`
**Comm. arrangement:** SAP_COM_0057
**Protocol:** OData V2

## Key Entities & Fields

### A_SupplierInvoiceType (Header) — Mandatory fields

| Field | SAP Field | Notes |
|---|---|---|
| CompanyCode | BUKRS | Mandatory |
| DocumentDate | BLDAT | Mandatory — invoice date from supplier |
| PostingDate | BUDAT | Mandatory |
| InvoicingParty | LIFRE | Mandatory — supplier BP number |
| DocumentCurrency | WAERS | Mandatory |
| InvoiceGrossAmount | RMWWR | Mandatory — gross amount (net + tax) |
| SupplierInvoiceIDByInvcgParty | XBLNR1 | Mandatory — supplier's own invoice number |
| TaxIsCalculatedAutomatically | — | Boolean; set `true` to auto-calc tax |
| PaymentTerms | DZTERM | Optional |
| DueCalculationBaseDate | DZFBDT | Optional — baseline date for payment |
| AccountingDocumentType | BLART | Optional — document type |
| SupplierInvoiceStatus | RBSTAT | Optional; see status values below |
| SupplierInvoiceIsCreditMemo | — | Boolean; `true` = credit memo |
| SupplierInvoiceOrigin | RBKP-IVTYP | Read; `B`=BAPI, `H`=SOA B2B, `I`=Business Network |
| PostingDate | BUDAT | Mandatory |
| TaxDeterminationDate | TXDAT | Optional; required if time-dependent taxes active |

**SupplierInvoiceStatus values:**
- `(empty)` = not yet posted
- `A` = parked
- `B` = saved as completed (posted)
- `Z` = reversed/cancelled

### A_SuplrInvcItemPurOrdRefType (Item with PO Reference)
| Field | SAP Field | Notes |
|---|---|---|
| SupplierInvoiceItem | RBLGP | Mandatory; e.g. `00001` |
| PurchaseOrder | EBELN | Mandatory |
| PurchaseOrderItem | EBELP | Optional (defaults to first item) |
| DocumentCurrency | WAERS | Mandatory; must match header |
| SupplierInvoiceItemAmount | WRBTR_CS | Mandatory — net item amount |
| TaxCode | MWSKZ | Mandatory |
| QuantityInPurchaseOrderUnit | MENGE | Optional; quantity being invoiced |
| PurchaseOrderQuantityUnit | MEINS | Optional; UoM |
| ReferenceDocument | — | GR doc number (for GR-based IV) |
| ReferenceDocumentFiscalYear | — | GR fiscal year |
| ReferenceDocumentItem | — | GR item (for GR-based IV) |

### A_SupplierInvoiceTaxType (Tax — Header Level)
| Field | Notes |
|---|---|
| TaxCode | Mandatory |
| DocumentCurrency | Mandatory |
| TaxAmount | Optional — tax amount |
| TaxBaseAmountInTransCrcy | Optional — taxable base |
| TaxCountry | Optional (mandatory if RITA active) |
| TaxDeterminationDate | Required only if time-dependent taxes active |

### A_SuplrInvcHeaderWhldgTaxType (Withholding Tax)
| Field | Notes |
|---|---|
| WithholdingTaxType | Mandatory |
| WithholdingTaxCode | Optional |
| WithholdingTaxBaseAmount | Optional; positive values only |

### A_SupplierInvoiceItemGLAcctType (G/L Account Item — no PO ref)
| Field | Notes |
|---|---|
| SupplierInvoiceItem | Mandatory |
| SupplierInvoiceItemAmount | Mandatory — net amount |
| TaxCode | Optional |
| GLAccount | Mapped internally |

### A_SuplrInvcSeldPurgDocumentType (Header PO Reference — parked/held only)
| Field | Notes |
|---|---|
| PurchaseOrder | Mandatory |
| PurchaseOrderItem | Optional |

## Useful Filter Patterns

```
# Get a single invoice header
GET .../A_SupplierInvoice(SupplierInvoice='5105623133',FiscalYear='2022')

# List invoices by supplier + date range
GET .../A_SupplierInvoice?$filter=InvoicingParty eq '10300003' and PostingDate ge datetime'2022-01-01T00:00:00'

# Deep read with PO items and tax
GET .../A_SupplierInvoice(SupplierInvoice='5105623133',FiscalYear='2022')
  ?$expand=to_SuplrInvcItemPurOrdRef,to_SupplierInvoiceTax,to_SupplierInvoiceWhldgTax

# Deep read with G/L items and tax
GET .../A_SupplierInvoice(SupplierInvoice='5105623133',FiscalYear='2022')
  ?$expand=to_SupplierInvoiceItemGLAcct,to_SupplierInvoiceTax,to_SupplierInvoiceWhldgTax

# Reverse (cancel) an invoice
POST .../Cancel?SupplierInvoice='5105623133'&FiscalYear='2022'&ReversalReason='02'&PostingDate=datetime'2022-04-08T00:00:00'

# Release a blocked invoice
POST .../Release?SupplierInvoice='5105620602'&FiscalYear='2019'&DiscountDaysHaveToBeShifted=false

# Batch post multiple invoices
POST .../A_SupplierInvoice/$batch
```

## Create Invoice — Minimal Payload (PO Reference)

```json
POST /sap/opu/odata/SAP/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice
{
  "d": {
    "CompanyCode": "1010",
    "DocumentDate": "2022-04-08T00:00",
    "PostingDate": "2022-04-08T00:00",
    "SupplierInvoiceIDByInvcgParty": "INV-12345",
    "InvoicingParty": "10300003",
    "DocumentCurrency": "EUR",
    "InvoiceGrossAmount": "40.00",
    "TaxIsCalculatedAutomatically": true,
    "to_SuplrInvcItemPurOrdRef": {
      "results": [{
        "SupplierInvoiceItem": "00001",
        "PurchaseOrder": "4500020561",
        "PurchaseOrderItem": "00010",
        "DocumentCurrency": "EUR",
        "SupplierInvoiceItemAmount": "40.00",
        "TaxCode": "V0"
      }]
    }
  }
}
```

## Gotchas / Important Notes

- **Deep create only** — all child nodes (items, tax, WHT) must be created in a single POST. No separate child creates supported.
- **Only one deep create per changeset** — batch with multiple invoices requires one changeset per invoice.
- **All amounts must be positive** — only `UnplannedDeliveryCost` may be negative.
- **`SupplierInvoiceStatus = 'B'`** saves as completed (triggers posting). Empty status = parked/held only.
- **GR-based IV:** Provide `ReferenceDocument`, `ReferenceDocumentFiscalYear`, `ReferenceDocumentItem` on the item to reference the GR document.
- **Tax fields must be consistent:** `TaxCode`, `TaxCountry`, `TaxDeterminationDate` must match between header (`A_SupplierInvoiceTaxType`) and item (`A_SuplrInvcItemPurOrdRefType`).
- **`IsReversal` / `IsReversed` cannot be filtered** — these are calculated fields, `$filter` on them will fail. Use `SupplierInvoiceOrigin`, `ReverseDocument`, `ReverseDocumentFiscalYear` instead.
- **Workflow routing:** Invoice type determines routing. Standard invoices → SAP Flexible Workflow (`API_SUPPLIERINVOICE_PROCESS_SRV`). Down payment requests → SAP BPA Down Payment workflow. No direct field controls routing — it depends on company code config and document type (`AccountingDocumentType`).
- **Withholding tax:** Populate `to_SupplierInvoiceWhldgTax` node; `WithholdingTaxType` is mandatory per WHT line.
- **Custom extensions:** Supported at header (`MM_SI_HEADER`) and item with PO ref (`MM_SI_ITEM`) via Custom Fields app. G/L account items use `FINS_CODING_BLOCK`.
- **Parked/held state:** `A_SuplrInvcSeldPurgDocumentType` and delivery note reference nodes can only be filled when invoice is parked or held, not for posted invoices.
