# Purchase Order API (OData V4)

**Service:** `/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001/`
**Service Group:** `API_PURCHASEORDER_2` | Repo: `srvd_a2x` | Service: `PurchaseOrder` v`0001`
**Comm. arrangement:** SAP_COM_0238 (also used by SOAP replication service)
**Protocol:** OData V4

## Key Entities & Fields

### PurchaseOrder (Header)
| Field | Type | Notes |
|---|---|---|
| PurchaseOrder | String | PO number (e.g. `4500033053`); key field |
| PurchaseOrderType | String | Mandatory; use `NB` (Standard) or custom `ZNB*` |
| Supplier | String | Business partner number; Mandatory |
| CompanyCode | String | Mandatory |
| PurchasingOrganization | String | Mandatory |
| PurchasingGroup | String | Mandatory |
| DocumentCurrency | String | Recommended (derived from supplier master if omitted) |
| PurchaseOrderDate | Date | Optional |
| PaymentTerms | String | Optional |
| IncotermsClassification | String | Optional |
| CreationDate | Date | Read-only |
| LastChangeDateTime | DateTime | Read-only |

> **No total amount at header level.** `InvoiceGrossAmount` does not exist here. To get PO value, expand `_PurchaseOrderItem` and sum `GrossAmount` or `NetPriceAmount * OrderQuantity / NetPriceQuantity`.

### PurchaseOrderItem (Item)
| Field | Type | Notes |
|---|---|---|
| PurchaseOrder | String | Key |
| PurchaseOrderItem | String | Key (e.g. `00010`) |
| Material | String | Optional (use with Product fields) |
| PurchaseOrderItemText | String | Short text; max 40 chars |
| Plant | String | Mandatory on POST |
| OrderQuantity | Decimal | Quantity ordered |
| PurchaseOrderQuantityUnit | String | UoM |
| NetPriceAmount | Decimal | Net price in document currency |
| NetPriceQuantity | Decimal | Price unit (denominator for price) |
| GrossAmount | Decimal | Gross order value in PO currency |
| DocumentCurrency | String | Read-only at item level |
| AccountAssignmentCategory | String | Optional |
| GoodsReceiptIsExpected | Boolean | Optional |
| InvoiceIsExpected | Boolean | Optional |
| InvoiceIsGoodsReceiptBased | Boolean | GR-based IV flag |
| PurchaseOrderItemCategory | String | `0`=Standard, `3`=Subcontracting, `5`=Third-party, `A`=Enhanced Limit, `2`=Consignment |
| PurchaseContract | String | Referenced contract number |
| IsCompletelyDelivered | Boolean | Closed indicator |
| IsFinallyInvoiced | Boolean | Final invoice flag |

### Other Entities
| Entity | Technical Name | Use |
|---|---|---|
| Header Notes | PurchaseOrderNote | Long text; TextObjectType = text category |
| Item Notes | PurchaseOrderItemNote | Item long text |
| Schedule Lines | PurchaseOrderScheduleLine | Delivery schedule; `ScheduleLineDeliveryDate`, `ScheduleLineOrderQuantity` |
| Account Assignment | PurchaseOrderAccountAssignment | Cost center, G/L, WBS, order |
| Pricing Element | PurOrderItemPricingElement | Conditions; `ConditionType`, `ConditionRateValue` |
| Delivery Address | PurOrderItemDeliveryAddress | Per-item delivery address |

## Useful Filter Patterns

```
# Get POs by supplier
GET .../PurchaseOrder?$filter=Supplier eq '10300001'

# Get POs with items expanded (needed for amounts)
GET .../PurchaseOrder?$expand=_PurchaseOrderItem&$filter=CompanyCode eq '1010'

# Get POs created after a date
GET .../PurchaseOrder?$filter=CreationDate gt 2024-01-01T00:00:00Z

# Get a specific PO with all items and schedule lines
GET .../PurchaseOrder('4500033053')?$expand=_PurchaseOrderItem(_expand=_ScheduleLine)

# Get items by PO number
GET .../PurchaseOrderItem?$filter=PurchaseOrder eq '4500033053'

# Paging (default 1000, max 5000)
GET .../PurchaseOrder?$top=5000&$skiptoken=...
```

## Gotchas / Important Notes

- **No header-level total amount** — must `$expand=_PurchaseOrderItem` and sum `GrossAmount` yourself.
- **Paging hard limits:** Default page = 1000 records. Max with `$top` = 5000. Use `$skiptoken` in the `next` link to iterate all pages.
- **Item category symbols differ:** External (UI) shows `' '`, `L`, `S`, `E`, `K`; API payload requires internal symbols `0`, `3`, `5`, `A`, `2`.
- **Only one PO per batch change set** — updating multiple POs requires one change set per PO.
- **Cannot use PUT** — only POST, PATCH/MERGE, DELETE allowed in batch URL.
- **Stock Transfer Orders (STO) not supported** by this API.
- **Block/Unblock not supported** by this API.
- **Authorization object required for create/update:** `M_BEST_BSA`.
- **V4 vs V2:** This is V4 (`srvd_a2x`). An older V2 service (`API_PURCHASEORDER_2/R_PurchaseOrder`) also exists for backward compatibility but is limited to 5000 records with `$top`.
- **Key fields in URL only:** Do not include key fields in the PATCH payload body — URL only.
- **Custom extensions:** Supported on `PurchaseOrder` (header) and `PurchaseOrderItem` (item) via Custom Fields app.
