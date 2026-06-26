# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **single-file React + TypeScript prototype** of the "BRM Vendor Portal" — a UI simulation of a SAP BTP / S/4HANA vendor collaboration platform (Accenture demo). The entire app lives in `src/App.tsx` (~1553 lines). All data is in-memory mock data and all "SAP integration" is cosmetic copy (OData/API endpoint strings shown in the UI are illustrative, not real calls).

`BRM Vendor Portal_V.1.00.tsx` at the repo root is a **legacy standalone artifact-drop copy** intended for embedding in canvas/artifact runners. It is significantly lighter (~922 lines) and is no longer in sync with `src/App.tsx`. Default to editing `src/App.tsx` only; update the artifact copy only if the user explicitly requests it.

**TypeScript note:** TypeScript is present (strict mode off) but typing is intentionally loose — most components and handlers use implicit `any`. Do not add type annotations or refactor toward stricter types unless asked.

**Reference material:** The untracked `Reference/` folder contains local saved copies of SAP S/4HANA Cloud screens for design reference. Use them to match SAP Fiori UI patterns when implementing new features.

Runtime dependencies are `react` and `react-dom`. The app uses only `useState` and `useEffect` from React; `react-dom` mounts via `src/main.tsx` → `createRoot`. There is no router, state library, or UI component library.

## Running / iterating

```
npm run dev      # Vite dev server (hot reload)
npm run build    # production build
npm run preview  # preview the production build locally
```

There is no test suite. Entry point is `src/main.tsx` (standard Vite React bootstrap). `public/manifest.json` declares PWA metadata (standalone display, `BRM Vendor Portal` app name).

## File organization (top to bottom in `src/App.tsx`)

1. **Mock data** — `USERS`, `VENDORS` (static keyed map), `COMPANY_CODES`, `CURRENCIES`, `WHT_TYPES`, `INIT_INV`, `INIT_RFQS`, `INIT_QT`, helper `ccName()`
2. **Theme** — `LIGHT` (SAP Fiori Quartz Light) / `DARK` (SAP Fiori Horizon Dark) palette objects, mutable `C`/`STC` bindings, `applyTheme()`
3. **Helpers** — `SETTINGS` / `applySettings()`, `idr()`, `fmtAmt()`, `fmtDate()`, `parseToISO()`, `uid()`, `fmtPOs()`, responsive helpers (`VP`, `mob()`, `tab()`, `g2/g3/g4/pg()`)
4. **UI primitives** — `Badge`, `Card`, `Btn`, `Inp`, `AmtInp`, `DateInp`, `Sel`, `TA`, `Lbl`, `Val`, `Sep`, `Modal`, `FilterBar`, `FioriBar`, `FField`, `Th`/`Td`
5. **Shell** (sticky nav bar), **Login** (pre-auth, fixed dark-gradient)
6. **Vendor pages** — `VendorHome`, `VendorProfile`, `VendorInvoice` (+ `InvoiceFormModal`, `PoValueHelp`), `VendorQuotation` (+ `QtFormModal`)
7. **PDF preview** — `InvoiceDoc`, `FakturDoc`, `PdfViewer`
8. **Document flow** — `DocFlow` (SAP Fiori horizontal ProcessFlow: PR→SQ→PO→GR→PINV→SINV)
9. **BRM pages** — `BrmHome`, `BrmInvoice`, `BrmQuotation`, `BrmRfq` (RFQ creation form is inline here)
10. **`SettingsModal`** — number format (comma/dot) and date format options
11. **`App`** — default export, root state owner

## Architecture

State is held entirely in `App` (the root) and flows down as props — there is no router, context, or store. Navigation is a single `section` string in `App` state; `Shell` renders the nav bar and `App` switch-maps `section` → a page component. Login sets `user`; `user.role` (`"vendor"` | `"brm"`) selects which set of nav items and pages are reachable.

**Navigation section IDs:** vendor uses `"dashboard"`, `"profile"`, `"invoice"`, `"quotation"`; BRM uses `"dashboard"`, `"brm-invoice"`, `"brm-quotation"`, `"brm-rfq"`.

`App` also owns `settings` state (number/date format) and passes it to `SettingsModal`; format changes call `applySettings()` which mutates the module-level `SETTINGS` object so all helpers pick it up on next render.

`App` has a `resize` listener that updates the module-level `VP.w` binding so the responsive helpers (`mob()`, `tab()`, etc.) return correct values on re-render.

### Data: state arrays vs. static lookup

Three domain data arrays are the app's source of truth, seeded from `INIT_INV` / `INIT_QT` / `INIT_RFQS` and owned by `App` as `invoices` / `quotations` / `rfqs`. Each page receives both the array and its setter and mutates immutably. There is **no persistence** — a reload resets everything.

`VENDORS`, `COMPANY_CODES`, `CURRENCIES`, `WHT_TYPES` are separate **static `const`s** — they hold reference/master data and are never put in state. Pages read them directly.

Two parallel role experiences operate on the same shared arrays:
- **Vendor** pages filter every list by `user.vendorId` so a vendor only sees its own records.
- **BRM** pages see all vendors' records and drive status transitions.

### Status lifecycles (the heart of the domain)

Status strings are the central mechanism; the `STC` map drives `Badge` colors and `FilterBar`/`FioriBar` options reference these exact strings — keep them in sync.
- **Invoice**: `Draft` → `Submitted` → `Under Review` → `Confirmed` | `Rejected` (rejection requires `rejReason`; vendor can `Withdraw` a `Submitted` invoice back to `Draft`).
- **Quotation**: `Draft` → `Submitted` → `Accepted` | `Rejected` | `Withdrawn`.
- **RFQ**: `Open` → `Closed`; vendors quote only `Open` RFQs they are `targets` of.

### Conventions

- **Reusable primitives** are defined once near the top and used everywhere: `Card`, `Btn` (variants `primary`/`ghost`/`danger`/`success`/`neutral`), `Inp`, `AmtInp` (positive-only, rejects negatives), `DateInp` (respects `SETTINGS.dateFmt`), `Sel`, `TA`, `Lbl`, `Val`, `Sep`, `Modal`, `FilterBar` (pill tabs), `FioriBar` + `FField` (SAP Fiori compact filter bar with active token display), `Badge`, `Th`/`Td`. Build new UI from these rather than raw elements.
- **Styling is 100% inline style objects** keyed off the `C` color palette and `STC` status-color map. There is no CSS file, Tailwind, or className styling. Use palette keys (`C.card`, `C.field`, `C.subtle`, `C.bg`, `C.border`, `C.t1`/`C.t2`, the `*Bg` status tints) rather than hardcoded hex.
- **Light/dark theme**: `C` and `STC` are mutable module-level bindings (`let`), not consts. `applyTheme("light"|"dark")` swaps `C` and rebuilds `STC`; `App` re-renders so every component picks up the new palette. The `Login` screen keeps its own fixed dark-gradient.
- **Responsive helpers**: `mob()` (< 768 px), `tab()` (< 1024 px), `g2/g3/g4()` produce CSS `gridTemplateColumns` strings that collapse to 1fr on mobile, `pg()` returns padding value. Always use these for layout grids rather than hardcoding breakpoints.
- **Amount formatting**: use `fmtAmt(n, currency)` for multi-currency display; `idr(n)` is the IDR-only shorthand. Both respect `SETTINGS.numFmt`.
- **Date formatting**: store dates as ISO `YYYY-MM-DD` strings internally; use `fmtDate(d)` for display and `parseToISO(raw)` to convert user input back to ISO. `DateInp` handles this automatically.
- **Naming is terse by design**: single/short identifiers (`C`, `f`, `s`, `v`, `mi`, `mq`, `mr`, `flt`), `s(k,v)` form-field setters, `idr()` / `uid()`. Follow the surrounding density.
- IDs for new records: `` `PI-${uid()}` ``, `` `QT-${uid()}` ``, `` `RFQ-${uid()}` `` inside save/publish handlers.
- Validation is inline via `alert()` / `window.confirm()`. This is intentional prototype-grade UX.
- The `useEffect` pattern for simulated async loads: local `loading` state + `setTimeout` in `useEffect` (see `VendorProfile`). Use the same pattern for new pages that simulate data fetching.

### Demo credentials

All users share password `demo123`. Vendors: `vendor1` (PT Maju Bersama / `10000001`), `vendor2` (CV Sukses Mandiri / `10000002`). BRM: `brm.user` (Ahmad Rizki), `buyer1` (Siti Rahma). The login screen also has one-click quick-access buttons.
