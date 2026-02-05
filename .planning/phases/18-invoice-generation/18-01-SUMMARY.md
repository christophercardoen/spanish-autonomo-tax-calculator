---
phase: 18-invoice-generation
plan: 01
subsystem: invoicing
tags: [iva, irpf, dexie, invoice-crud, payment-tracking, verifactu, moneyutils]

# Dependency graph
requires:
  - phase: 12-data-architecture
    provides: Dexie schema v3, MoneyUtils, auditFields, SyncQueue, DataManager
  - phase: 15-client-management
    provides: CLIENT_CATEGORY, ClientManager, contacts table (Dexie v3)
  - phase: 12-data-architecture
    provides: InvoiceManager skeleton with getNextInvoiceNumber, archiveInvoice, createRectifyingInvoice
provides:
  - IVA_TREATMENT config mapping CLIENT_CATEGORY to rate/label/legalText
  - IRPF_RETENTION constants (STANDARD 15%, REDUCED 7%, NONE 0%)
  - INVOICE_CURRENCY constants (EUR, USD, GBP)
  - Dexie schema version 4 with invoice_payments table
  - InvoiceManager.createInvoice (draft creation with client validation, sequential numbering)
  - InvoiceManager.updateInvoice (draft-only edits with protected field guards)
  - InvoiceManager.getInvoice (invoice + line items joined)
  - InvoiceManager.addLineItem/updateLineItem/removeLineItem (line item CRUD)
  - InvoiceManager.calculateInvoiceTotals (subtotal -> discount -> IVA -> IRPF -> total)
  - InvoiceManager.markAsSent (draft->sent transition with validation)
  - InvoiceManager.recordPayment (partial payment with auto-transition to paid)
  - InvoiceManager.getPayments/isOverdue/getOverdueInvoices
  - InvoiceManager.generateVeriFactuQRUrl (AEAT QR URL per RD 1007/2023)
  - InvoiceManager.fetchExchangeRate (Frankfurter API)
  - InvoiceManager.getTotalIncome (paid invoice aggregation)
affects: [18-02, 18-03, 18-04, 18-05, 18-06, 18-07, 18-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IVA_TREATMENT lookup via CLIENT_CATEGORY computed property keys"
    - "Status workflow: draft -> sent -> paid with immutability enforcement"
    - "Partial payment tracking with auto-transition to paid when fully paid"
    - "Discount applied before IVA in calculation chain"

key-files:
  created: []
  modified:
    - autonomo_dashboard.html

key-decisions:
  - "IVA_TREATMENT uses computed property keys [CLIENT_CATEGORY.X] for direct category lookup"
  - "IRPF retention only applies when entity is autonomo AND client category is spain"
  - "Sent invoices are immutable - no edits to lines or amounts after markAsSent"
  - "markAsSent validates at least one line item exists before allowing transition"
  - "recordPayment allows additional payments on already-paid invoices for overpayment tracking"
  - "calculateInvoiceTotals applies discount before IVA/IRPF (correct per Spanish fiscal law)"
  - "VeriFactu QR URL uses DD-MM-YYYY date format per AEAT specification"
  - "fetchExchangeRate returns null on error for graceful fallback to manual entry"

patterns-established:
  - "IVA_TREATMENT[client.category] pattern for IVA rate lookup"
  - "Status guard pattern: check invoice.status === 'draft' before mutation"
  - "Auto-recalculate totals after any line item change"
  - "Protected fields (entity_id, invoice_number, series, status, paid_cents) deleted from update payloads"

# Metrics
duration: 10min
completed: 2026-02-05
---

# Phase 18 Plan 01: Invoice Data Layer Summary

**IVA_TREATMENT config, Dexie v4 with invoice_payments, and 18-method InvoiceManager extension covering CRUD, line items, totals calculation, status workflow, payments, VeriFactu QR, and income tracking**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-05T19:09:13Z
- **Completed:** 2026-02-05T19:18:50Z
- **Tasks:** 2/2
- **Files modified:** 1 (autonomo_dashboard.html)

## Accomplishments
- IVA_TREATMENT maps all 5 CLIENT_CATEGORY values to rate/label/legalText with legal citation references
- Dexie schema upgraded to version 4 adding invoice_payments table with invoice_id index
- IRPF_RETENTION and INVOICE_CURRENCY constants defined for invoice form/calculation use
- InvoiceManager extended with 18 new methods covering the complete invoice lifecycle
- All monetary arithmetic uses MoneyUtils.roundCents/calculateIVA for banker's rounding in cents
- Status workflow enforces immutability: draft invoices editable, sent/paid invoices locked
- Payment tracking supports partial payments with automatic paid status transition
- VeriFactu QR URL generation per AEAT Real Decreto 1007/2023

## Task Commits

Each task was committed atomically:

1. **Task 1: IVA_TREATMENT + IRPF constants and Dexie schema upgrade** - `dafc3d9` (feat)
2. **Task 2: Extend InvoiceManager with full CRUD, line items, status workflow, payments, and totals** - `34f8e6d` (feat)

## Files Created/Modified
- `autonomo_dashboard.html` - Added IVA_TREATMENT, IRPF_RETENTION, INVOICE_CURRENCY constants; Dexie v4 schema with invoice_payments table; 18 InvoiceManager methods

## Decisions Made
- IVA_TREATMENT uses Object.freeze() with computed property keys [CLIENT_CATEGORY.X] for O(1) lookup by category
- IRPF retention scoped to autonomo + spain client combinations (SL entities and foreign clients use NONE)
- markAsSent validates line item count > 0 to prevent sending empty invoices
- recordPayment allows payments on already-paid invoices for overpayment tracking scenarios
- Discount is applied before IVA and IRPF in the calculation chain (per Spanish fiscal law)
- VeriFactu QR uses DD-MM-YYYY date format and dot-decimal importe per AEAT specification
- fetchExchangeRate returns null on error for graceful degradation to manual rate entry
- Protected fields (entity_id, invoice_number, series, status, paid_cents) explicitly deleted from update payloads to prevent accidental corruption

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete InvoiceManager data layer ready for UI wiring (Plan 18-02+)
- All 18 methods follow established patterns (MoneyUtils, auditFields, SyncQueue, EntityContext)
- IVA_TREATMENT config ready for form dropdowns and PDF generation
- IRPF_RETENTION ready for invoice form conditional display
- Dexie v4 invoice_payments table ready for payment recording UI

---
*Phase: 18-invoice-generation*
*Plan: 01*
*Completed: 2026-02-05*
