# BRM Vendor Portal — Project Context & Stories (V.1.00)

## Background

SAP Public Cloud has been implemented for **PT Bumi Resource Minerals (BRM)** and its 5 subsidiaries:

| Entity | Description |
|--------|-------------|
| **BRM** | PT Bumi Resource Minerals (Holding Company) |
| **CPM** | PT Citra Palu Minerals — Gold mining in Palu, Sulawesi (operating) |
| **GM** | PT Gorontalo Minerals — Gold mining in Gorontalo, Sulawesi (exploration) |
| **SHS** | PT Suma Heksa Sinergi — Gold mining in Banten, Jawa |
| **LMR** | PT Linge Minerals — Gold mining in Aceh, Sumatera |

**SAP Public Cloud Lines of Business implemented:**
- Finance
- Sourcing and Procurement
- Supply Chain Management
- Project Control

> Note: Sales organization exists in the org structure but is not used operationally — created only as a prerequisite for several SCM processes.

---

## Pain Points

### Sourcing Management
- **Multiple systems**: Procurement uses both SAP (PR, RFQ, Quotation, PO administration) and FARMS (tender process, committee assignment, quotation evaluation). No integration = fraud risk.
- **Miscommunication**: Tender Committee lacks a centralized tool for evaluation and decision-making.
- **Manual communication**: Vendors rely on manual notifications for invitation/tender status updates.

### Supplier Invoice
- **Volume**: 200–300 invoices/week, only 2 AP admins.
- **Guest Invoice Book**: Excel-based manual intake log, junior staff checks document completeness.
- **Lag time**: Data from guest book is entered into SAP 2–3 days later. Vendors request payment before SAP entry, causing off-system payments.
- **Manual input**: AP admins manually scan PDF documents to enter into SAP "Create Supplier Invoice."

---

## Application Goal

Build a **Vendor Portal web application** following SAP Public Cloud standard visual design using **UI5 Web Components** (https://ui5.github.io/webcomponents/components/).

---

## Module 1: Sourcing Management Dashboard

### Role-Based Views

| View | Role / Persona | Description |
|------|---------------|-------------|
| Client View | BRM, CPM, GM, LMR, SHS | Internal stakeholders. Monitor sourcing activities, submit procurement requests, track tender status per business unit. |
| Tender Committee View | Tender Committee | Evaluation committee. Review vendor proposals, conduct evaluations, issue final decisions on active tenders. |
| Vendor View | Vendor / Supplier | External parties. Receive tender invitations, download RFQ/RFP documents, submit bids. |

---

## Module 2: Invoice Management Dashboard

### Role-Based Views
- **Vendor View**
- **Client View** (BRM, CPM, GM, LMR, SHS) — authorization is per company code

### Business Rules / Validations
- A PO already referenced in an invoice (even at Draft status) **cannot** be selected again for a new invoice.
- Actual supplier invoice number **cannot be entered twice**.
- Vendors can only manage their own invoices; clients can view all invoices from all vendors for their specified company code.

### Process Flow

| # | Activity | Agent | Detail |
|---|----------|-------|--------|
| 1 | **Submit Invoice** | Vendor | Submit invoice with: Company Code, Currency, Vendor Invoice No, Invoice Amount, VAT Base Amount, VAT Amount, WHT Type/Code/Base/Amount, PO Reference (multi-select — only POs with completed GR and open invoice), Faktur Pajak No, Invoice Attachment, Faktur Pajak Attachment, Notes (free text). Creates a **custom "pre-invoice"** object, not yet an SAP invoice. **Exception**: For non-ID country suppliers, PO GR check is skipped — invoice becomes a **Supplier Down Payment Request (DPR)** in SAP. After DPR is approved by client, it routes through portal workflow. |
| 2 | **Review Invoice** | Client | View submitted invoice list. Pop-up preview of PDF attachments. Verify attachment amounts match system input. Can **Reject** (with comment — vendor notified, can edit & resubmit) or **Approve**. On approval of an invoice: hits SAP API → creates Supplier Invoice as parked-complete → continues SAP flexible invoice workflow. On approval of DPR: sent to SAP Build Process Automation (BPA) on BTP for Supplier Down Payment Request workflow until posted. |
| 3 | **Edit / Cancel Invoice** | Vendor | While invoice status is "Submitted" (not yet reviewed by client), vendor can withdraw (cancel) or edit. |
| 4 | **Manage Vendor Invoice** | Client | Lists all vendor invoices across all vendors. Links "pre-invoice" documents to SAP documents: Invoice → SAP MIRO document (51xxxx/20xx); Supplier DPR → SAP FI document (BRMS/100xxxx/20xx). On app open, fetches SAP document number via API to determine current status. **Statuses**: Open (not yet reviewed), On Progress (reviewed, pending workflow), Posted (document posted), Converted to Invoice (DPR only), Cleared to Invoice (DPR only). **Date fields**: Invoice Date, Vendor Submission Date, Invoice Fully Approved Date. |
| 5 | **Convert DP to Invoice** | Client | Lists all posted Supplier DPRs. Also displays SAP supplier invoice number for matching. **Convert button**: creates Supplier Invoice as a post (not parked) via SAP API → returned document number listed in portal. **Clear button**: clears DPR to Invoice via SAP API journal entry clearing → clearing document number (BRMS/12xxxx/20xx) shown in list. |

---

## Design Guidance

- Follow **SAP Fiori / UI5 Web Components** design language: https://ui5.github.io/webcomponents/components/
- All API integrations target **SAP Public Cloud** (not on-prem)
- BTP (SAP Build Process Automation) is used for DPR approval workflow
