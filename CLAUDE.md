# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **multi-file React + TypeScript prototype** of the "BRM Vendor Portal" — a UI simulation of a SAP BTP / S/4HANA vendor collaboration platform (Accenture demo). All data is in-memory mock data. All "SAP integration" is cosmetic — OData/API endpoint strings shown in the UI are illustrative, not real calls.

`BRM Vendor Portal_V.1.00.tsx` at the repo root is a **legacy standalone artifact-drop copy** for canvas/artifact runners. It is significantly out of sync with `src/`. Default to editing `src/` only; update the artifact copy only if explicitly requested.

**TypeScript:** Strict mode is off. Typing is intentionally loose — most components and handlers use implicit `any`. Do not add type annotations or refactor toward stricter types unless asked.

**Reference material:** The untracked `Reference/` folder contains local saved copies of SAP S/4HANA Cloud screens. Use them to match SAP Fiori UI patterns when implementing new features.

Runtime dependencies are `react` and `react-dom` only. No router, state library, or UI component library.

## Commands

```
npm run dev      # Vite dev server (hot reload) — primary development command
npm run build    # TypeScript compile + production bundle
npm run preview  # serve the production build locally
```

There is no test suite. Entry point is `src/main.tsx`. Deployed to Vercel from `main` branch automatically.

## Source file ownership

The app was split into modules for parallel team collaboration. Treat ownership boundaries carefully when merging:

| File | Owner | Contents |
|---|---|---|
| `src/shared.tsx` | Shared | Mock data, theme, helpers, ALL UI primitives |
| `src/InvoicePages.tsx` | Zidna | Invoice form, PDF viewer, DocFlow, VendorInvoice, BrmInvoice |
| `src/QuotationRfqPages.tsx` | Colleague | VendorQuotation, BrmQuotation, BrmRfq |
| `src/HomePages.tsx` | Shared | VendorHome, BrmHome |
| `src/VendorProfile.tsx` | Shared | VendorProfile |
| `src/App.tsx` | Shared | Shell, Login, SettingsModal, App root |

**Critical ESM live-binding note:** `shared.tsx` uses `export let C`, `export let STC`, and module-level `SETTINGS`/`VP` objects. These are mutable bindings intentionally — `applyTheme()` swaps `C`/`STC` in place and all importing modules pick up the new values on re-render because ESM live exports. Do not convert them to `const` or copy them into local variables.

## Architecture

State lives entirely in `App` (root component) and flows down as props. No context, no store, no router. Navigation is a single `section` string; `Shell` renders the nav bar and `App` switch-maps `section` → page component.

**Navigation section IDs:** vendor: `"dashboard"`, `"profile"`, `"invoice"`, `"quotation"`; BRM: `"dashboard"`, `"brm-invoice"`, `"brm-quotation"`, `"brm-rfq"`.

### Data: state arrays vs. static lookup

Three mutable domain arrays seeded at startup, owned by `App`:

| State var | Init seed | Domain |
|---|---|---|
| `invoices` | `INIT_INV` | Vendor pre-invoices |
| `quotations` | `INIT_QT` | Vendor quotations |
| `rfqs` | `INIT_RFQS` | BRM RFQs |

Static master data (`VENDORS`, `COMPANY_CODES`, `CURRENCIES`, `WHT_TYPES`) are plain `const` objects — never put in state, read directly.

- **Vendor pages** filter every list by `user.vendorId`.
- **BRM pages** see all records and drive status transitions.

**Single source of truth rule:** `INIT_QT`, `INIT_RFQS`, and `INIT_INV` in `src/shared.tsx` are the only place mock data lives. Updating them once automatically covers all roles — vendor and BRM views both derive from the same seeded arrays. Never duplicate mock data per-role.

### Invoice status lifecycle

`Draft` → `Submitted` → `Under Review` → `Confirmed` → **`Posted`**

Supplier DPR only: `Posted` → `Converted to Invoice` → `Cleared`

Rejection: any active status → `Rejected` (requires `rejReason`). Vendor can `Withdraw` a `Submitted` invoice back to `Draft`.

**Invoice fields introduced recently:** `invoiceType` ("Invoice" | "Supplier DPR"), `sapDocNo`, `postedAt`, `convertedDocNo`, `clearingDocNo`. Supplier DPR type routes to SAP BPA Down Payment workflow; Invoice type routes to SAP Flexible Workflow via `API_SUPPLIERINVOICE_PROCESS_SRV`.

**BRM actions by status:**
- `Submitted` → Review | Accept (→ Confirmed) | Reject
- `Confirmed` → Post to SAP (→ Posted, generates `sapDocNo`)
- `Posted` + DPR → Convert to Invoice (→ `Converted to Invoice`)
- `Converted to Invoice` → Clear (→ `Cleared`, generates `clearingDocNo`)

### Other status lifecycles

- **Quotation**: `Draft` → `Submitted` → `Accepted` | `Rejected` | `Withdrawn`
- **RFQ**: `Open` → `Closed`; vendors quote only `Open` RFQs they are `targets` of

`STC` drives `Badge` colors for all statuses — keep `STC` and status strings in sync when adding new ones.

## Conventions

### UI primitives (all in `src/shared.tsx`)
Always build from these rather than raw elements:
- `Btn` — variants: `primary`, `ghost`, `danger`, `success`, `neutral`. Prop `sm` for small.
- `Inp`, `AmtInp` (positive-only), `DateInp` (respects `SETTINGS.dateFmt`), `Sel`, `TA`
- `Modal` — standard dialog wrapper
- `FioriBar` + `FField` — SAP Fiori compact filter bar with active token chips
- `ValueHelpInp` + `ValueHelpDialog` — SAP-style F4 value help with Search & Select + Define Conditions tabs
- `MultiValueInp` — token chip input with condition builder (used for Invoice No. filter)
- `FilterBar` — pill tabs
- `Badge` — status badge driven by `STC`
- `SapIcon` — renders UI5 web component icons; falls back to text if CDN unavailable

### SAP Fiori table pattern (used in VendorInvoice and BrmInvoice)
Both invoice tables use identical structure — copy this pattern for new tables:
- `TK` token object for colors, `FS` for font sizes
- `<colgroup>` with `COL_DEFS` pixel widths, `tableLayout:"fixed"`
- Clickable column headers open `ColumnSettingsPopup` (Sort By segmented button, Group By toggle, Resize width step input)
- Group By is functional — `buildGroups()` helper in `InvoicePages.tsx` groups rows with `GroupHeaderRow` separators
- Checkbox multi-select via `Set<string>` state
- CSV export via `Blob` + `URL.createObjectURL`

### Styling
100% inline style objects keyed off `C` (palette) and `STC` (status colors). No CSS files, no Tailwind, no classNames. Use `C.card`, `C.field`, `C.subtle`, `C.bg`, `C.border`, `C.t1`/`C.t2`, `C.primary`, `C.*Bg` tints — never hardcoded hex unless it must not change with theme.

### Responsive helpers
`mob()` (< 768 px), `tab()` (< 1024 px), `g2/g3/g4()` → CSS `gridTemplateColumns` that collapse to `1fr` on mobile, `pg()` → page padding value. Use these for all layout grids.

### Formatting
- Amounts: `fmtAmt(n, currency)` for multi-currency; `idr(n)` for IDR-only shorthand. Both respect `SETTINGS.numFmt`.
- Dates: store as ISO `YYYY-MM-DD`; display with `fmtDate(d)`; parse user input with `parseToISO(raw)`. `DateInp` handles this automatically.
- New record IDs: `` `PI-${uid()}` ``, `` `QT-${uid()}` ``, `` `RFQ-${uid()}` ``

### Validation
Inline `alert()` / `window.confirm()` — intentional prototype-grade UX. Invoice-specific validations:
- Duplicate invoice number check against `allInvoices` prop (passed to `InvoiceFormModal`)
- PO reuse check — a PO used in any non-Rejected invoice cannot be reused

## Login / demo credentials

Password for all: `demo123`

| Username | Role | Entity |
|---|---|---|
| `vendor1` | Vendor | PT Maju Bersama (`10000001`) |
| `vendor2` | Vendor | CV Sukses Mandiri (`10000002`) |
| `brm.user` | BRM | Ahmad Rizki — Procurement Manager |
| `buyer1` | BRM | Siti Rahma — Senior Buyer |

Login page matches SAP ID sign-in theme (light gray bg, white card, dotted username field, SAP® ID label). One-click quick-access buttons are in the card.

## Mock data highlights

`INIT_INV` has 8 invoices covering all statuses and both document types:
- `PI-2025-0001` — Invoice, **Posted** (SAP doc `5100000001/2025`)
- `PI-2025-0006` — Supplier DPR, **Posted** (SAP doc `BRMS/1000000001/2025`) — ready for Convert to Invoice demo
- `PI-2025-0007` — Supplier DPR, **Confirmed** — ready for Post to SAP demo

Five company codes: `BRMS`, `CPMS`, `GMIN`, `SHSI`, `LMRS` — all PT Bumi Resource Minerals group entities.
