# BRM Vendor Portal — Business Context & Process Flow

## Overview

This portal supports the **end-to-end procurement process** for PT Bumi Resource Minerals Group, from Purchase Requisition (PR) to vendor award. It runs on SAP BTP and integrates with SAP S/4HANA Public Cloud.

---

## Roles

| Role | Username | Description |
|---|---|---|
| **Vendor / Supplier** | `vendor1`, `vendor2` | External vendors invited to submit quotations |
| **Buyer (BRM Employee)** | `brm.user`, `buyer1` | Internal procurement staff who manage RFQs and evaluate quotations |
| **Approver (Tender Committee)** | `approver1` | Senior internal stakeholder (Finance / Management) who reviews and decides the winning vendor |

---

## End-to-End Process Flow

### Step 1 — Buyer Creates RFQ
- Buyer receives a **Purchase Requisition (PR)** from an end user / department.
- Buyer creates an **RFQ (Request for Quotation)** in the portal based on the PR details.
- RFQ status: `Open`

### Step 2 — Buyer Publishes RFQ to Vendors
- Buyer selects which vendors to invite based on their knowledge of suppliers for the required goods/services.
- Invited vendors receive a notification and can see the RFQ in their portal.
- RFQ status: `Open`

### Step 3 — Vendors Submit Quotations
- Vendors log into the Vendor Portal and submit quotations for the RFQs they are invited to.
- Each quotation includes pricing, delivery terms, and supporting documents.
- Quotation status: `Submitted`

### Step 4 — Buyer Reviews & Approves Quotations
- Buyer reviews all submitted quotations for completeness and compliance.
- Buyer can **Accept** or **Reject** individual vendor quotations.
- Once all participating vendors have submitted, the buyer marks the RFQ as `Complete`.
- RFQ status: `Complete` (all vendors have submitted — ready for tender committee)

> ⚠️ **Rule:** An RFQ cannot be sent for tender committee approval if its status is still `Open` (i.e., no quotation submissions yet or not all vendors have submitted).

### Step 5 — Buyer Sends for Approval (Tender Committee)
- Buyer uses the **"Send for Approval"** action in RFQ Management to submit the RFQ + quotation comparison to the **Tender Committee (Approver role)**.
- The Approver receives a notification with the list of quotations to review.
- RFQ status: `Pending Approval`

### Step 6 — Tender Committee Reviews & Decides Winner
- The Approver (Tender Committee) reviews all submitted quotations side-by-side.
- They discuss and determine the **winning vendor** based on price, quality, delivery, and compliance.
- Approver can **Approve** (select winner) or **Reject** (send back to buyer with notes).
- On approval, the winning quotation is marked and the RFQ is **Closed**.
- RFQ status: `Closed`

### Step 7 — RFQ Closed
- Once the winning vendor is determined and the RFQ is closed, the procurement process moves to PO issuance (outside this portal scope).
- All non-winning vendor quotations are marked accordingly.

---

## RFQ Status Lifecycle

```
Open → Complete → Pending Approval → Closed
         ↑                ↓
     (all vendors    (Rejected by
      submitted)      Approver → back to Buyer)
```

| Status | Meaning |
|---|---|
| `Open` | RFQ published, vendors can submit quotations |
| `Complete` | All invited vendors have submitted; ready for approval submission |
| `Pending Approval` | Submitted by buyer to Tender Committee for winner determination |
| `Closed` | Winner determined, RFQ concluded |

> RFQ cannot be sent for approval if status is `Open` (insufficient submissions).

---

## Quotation Status Lifecycle

```
Draft → Submitted → Accepted | Rejected | Withdrawn
```

| Status | Meaning | Actor |
|---|---|---|
| `Draft` | Vendor saved but not yet submitted | Vendor |
| `Submitted` | Submitted by vendor, awaiting buyer review | Vendor |
| `Accepted` | Buyer accepted the quotation | Buyer |
| `Rejected` | Buyer rejected the quotation | Buyer |
| `Withdrawn` | Vendor withdrew their quotation | Vendor |
| `Win` | Quotation selected as winner by Tender Committee | Approver |
| `Approved` | Approved by Tender Committee (used in approval flow) | Approver |

---

## Approver (Tender Committee) — What They See

- **Home page:** List of RFQs with status `Pending Approval` sent by buyers, displayed as To-Do cards. Insight tiles showing pending value, approval rate, and vendor breakdown.
- **RFQ Management:** Read-only view of all RFQs. Can only act (Approve/Reject) on `Pending Approval` RFQs.
- **Quotation view (within RFQ):** Read-only side-by-side comparison of all submitted quotations to support decision-making.
- **Actions:** Approve (select winner) or Reject with mandatory notes.

## Buyer (BRM Employee) — What They See

- **RFQ Management:** Full CRUD on RFQs. Can publish, close, and send for approval.
- **Quotation Management:** Review and Accept/Reject individual vendor quotations.
- **"Send for Approval" button:** Only enabled when RFQ status is `Complete` (all vendors submitted). Disabled when status is `Open`.

---

## Key Business Rules

1. RFQ must be `Complete` before it can be sent to Tender Committee.
2. Only `Pending Approval` RFQs appear in the Approver's To-Do list.
3. Approver cannot edit any RFQ or quotation data — view only + approve/reject.
4. Buyer is responsible for quotation evaluation (Accept/Reject per quotation).
5. Tender Committee is responsible for winner determination across all quotations.
6. Once an RFQ is `Closed`, no further changes are allowed.
