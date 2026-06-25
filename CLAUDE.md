# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **single-file, self-contained React prototype** of the "BRM Vendor Portal" — a UI simulation of a SAP BTP / S/4HANA vendor collaboration platform (Accenture demo). The entire app lives in `BRM Vendor Portal_V.1.00.tsx` (~923 lines). There is no build config, `package.json`, lockfile, test suite, or backend; all data is in-memory mock data and all "SAP integration" is cosmetic copy (OData/API endpoint strings shown in the UI are illustrative, not real calls).

The default export `App` is meant to be dropped into a React host (e.g. a Vite/CRA app, or an artifact/canvas runner). The only runtime dependency is `react` (`useState`, `useEffect`).

## Running / iterating

There is no project-local build or test command. To preview changes, paste/import the default `App` export into any React 18+ host that provides JSX and the `react` package. When editing, preserve the single-file structure unless explicitly asked to split it.

## File organization (top to bottom)

1. **Mock data** — `USERS`, `VENDORS` (static keyed map), `INIT_INV`, `INIT_RFQS`, `INIT_QT`
2. **Theme** — `LIGHT`/`DARK` palette objects, mutable `C`/`STC` bindings, `applyTheme()`
3. **Helpers** — `idr()`, `uid()`
4. **UI primitives** — `Badge`, `Card`, `Btn`, `Inp`, `Sel`, `TA`, `Lbl`, `Val`, `Sep`, `Modal`, `FilterBar`, `Th`/`Td`
5. **Shell** (sticky nav bar), **Login** (pre-auth, fixed dark-gradient)
6. **Vendor pages** — `VendorHome`, `VendorProfile`, `VendorInvoice` (+ `InvoiceFormModal`), `VendorQuotation` (+ `QtFormModal`)
7. **BRM pages** — `BrmHome`, `BrmInvoice`, `BrmQuotation`, `BrmRfq` (RFQ creation form is inline here, not a separate component)
8. **`App`** — default export, root state owner

## Architecture

State is held entirely in `App` (the root) and flows down as props — there is no router, context, or store. Navigation is a single `section` string in `App` state; `Shell` renders the nav bar and `App` switch-maps `section` → a page component. Login sets `user`; `user.role` (`"vendor"` | `"brm"`) selects which set of nav items and pages are reachable.

**Navigation section IDs:** vendor uses `"dashboard"`, `"profile"`, `"invoice"`, `"quotation"`; BRM uses `"dashboard"`, `"brm-invoice"`, `"brm-quotation"`, `"brm-rfq"`.

### Data: state arrays vs. static lookup

Three domain data arrays are the app's source of truth, seeded from `INIT_INV` / `INIT_QT` / `INIT_RFQS` and owned by `App` as `invoices` / `quotations` / `rfqs`. Each page receives both the array and its setter (e.g. `invoices` + `setInvoices`) and mutates immutably. There is **no persistence** — a reload resets everything to the `INIT_*` seeds.

`VENDORS` is a separate **static `const`** keyed by vendorId — it holds vendor master data (name, address, bank, tax ID, etc.) and is never put in state. Pages read it directly via `VENDORS[user.vendorId]` or `VENDORS[id]`.

Two parallel role experiences operate on the same shared arrays:
- **Vendor** pages (`VendorHome`, `VendorProfile`, `VendorInvoice`, `VendorQuotation`) filter every list by `user.vendorId` so a vendor only sees its own records.
- **BRM** pages (`BrmHome`, `BrmInvoice`, `BrmQuotation`, `BrmRfq`) see all vendors' records and drive status transitions (accept/reject/award/publish).

The interplay between the two roles via status fields is the core of the simulation — e.g. a vendor submits an invoice (`Draft`→`Submitted`), BRM moves it (`Under Review`→`Confirmed`/`Rejected`), and both sides re-render from the same shared array.

### Status lifecycles (the heart of the domain)

Status strings are the central mechanism; the `STC` map drives `Badge` colors and `FilterBar` options reference these exact strings, so keep them in sync.
- **Invoice**: `Draft` → `Submitted` → `Under Review` → `Confirmed` | `Rejected` (rejection requires `rejReason`; vendor can `Withdraw` a `Submitted` invoice back to `Draft`).
- **Quotation**: `Draft` → `Submitted` → `Accepted` | `Rejected` | `Withdrawn`.
- **RFQ**: `Open` → `Closed`; vendors quote only `Open` RFQs they are `targets` of.

### Conventions

- **Reusable primitives** are defined once near the top and used everywhere: `Card`, `Btn` (variants `primary`/`ghost`/`danger`/`success`/`neutral`), `Inp`, `Sel`, `TA`, `Lbl`, `Val`, `Sep`, `Modal`, `FilterBar`, `Badge`, `Th`/`Td`. Build new UI from these rather than raw elements.
- **Styling is 100% inline style objects** keyed off the `C` color palette and `STC` status-color map. There is no CSS file, Tailwind, or className styling — match this approach. When adding surfaces, use palette keys (`C.card`, `C.field`, `C.subtle`, `C.bg`, `C.border`, `C.t1`/`C.t2`, the `*Bg` status tints) rather than hardcoded hex, so they adapt to the theme.
- **Light/dark theme**: `C` and `STC` are mutable module-level bindings (`let`), not consts. `applyTheme("light"|"dark")` swaps `C` to the `LIGHT`/`DARK` palette and rebuilds `STC`; `App` holds the `theme` state and re-renders so every component (which reads `C`/`STC` from module scope at render time) picks up the new palette. The toggle button lives in the `Shell` header's top-right cluster. The `Login` screen is pre-auth and intentionally keeps its own fixed dark-gradient styling.
- **Naming is terse by design**: single/short identifiers (`C`, `f`, `s`, `v`, `mi`, `mq`, `mr`, `flt`), `s(k,v)` form-field setters, `idr()` for currency formatting, `uid()` for ID generation. Follow the surrounding density.
- IDs for new records are generated as `` `PI-${uid()}` ``, `` `QT-${uid()}` ``, `` `RFQ-${uid()}` `` inside save/publish handlers.
- Validation is inline in save handlers via `alert()` / `window.confirm()` (e.g. invoice submission requires `taxDoc` and ≥2 files). This is intentional prototype-grade UX.
- The only `useEffect` in the app is in `VendorProfile`: it simulates a 700 ms API fetch delay before rendering the profile content. Use the same pattern (local `loading` state + `setTimeout` in `useEffect`) when simulating async data loads in new pages.
- Root font family: `'72','72full',Arial,Helvetica,sans-serif` (SAP 72), applied at the `App` root div.

### Demo credentials

All users share password `demo123`. Vendors: `vendor1` (PT Maju Bersama / `10000001`), `vendor2` (CV Sukses Mandiri / `10000002`). BRM: `brm.user` (Ahmad Rizki), `buyer1` (Siti Rahma). The login screen also has one-click quick-access buttons.
