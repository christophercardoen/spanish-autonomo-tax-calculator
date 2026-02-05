---
phase: 18-invoice-generation
plan: 04
subsystem: ui
tags: [invoice-list, invoice-detail, filters, payments, rectificativa, status-workflow, overdue]

# Dependency graph
requires:
  - phase: 18-01
    provides: InvoiceManager with CRUD, status workflow, payment recording, overdue detection
  - phase: 18-02
    provides: Invoice tab HTML structure, CSS styles, dialogs, empty state elements
  - phase: 17-04
    provides: Dual rendering pattern (table+cards), _loadClientNameCache, tab activation pattern
provides:
  - renderInvoiceList with entity-scoped query, 4 filters, dual layout
  - renderInvoiceSummary with total/outstanding/overdue/paid calculations
  - renderOverdueAlert banner for past-due invoices
  - showInvoiceDetail with entity/client info, line items, totals, legal text
  - Status workflow UI (draft -> sent -> paid) with confirmation dialogs
  - Payment recording with partial payment support and remaining balance
  - Archive and rectificativa flows
  - Tab activation and entity change listeners
affects: [18-05-pdf-generation, 18-06-verifactu, 18-07-client-invoice-totals]

# Tech tracking
tech-stack:
  added: []
  patterns: [invoice-client-cache, detail-view-pattern, status-action-buttons]

key-files:
  created: []
  modified: [autonomo_dashboard.html]

key-decisions:
  - "Rectificativa dialog submit calls handleSubmitRectificativa (separate from handleCreateRectificativa which opens dialog)"
  - "PDF buttons show info notification pointing to Plan 18-05 (graceful stub)"
  - "Payment form only shown for sent invoices (not draft or paid)"
  - "Overdue badge replaces sent badge when invoice is past due"
  - "Summary bar always shows unfiltered totals (filters only affect list)"
  - "Separate invoice client cache from expense client cache (independent invalidation)"

patterns-established:
  - "Invoice list follows Phase 17 dual rendering: table desktop, cards mobile"
  - "_invoiceClientNameCache with entity-scoped invalidation"
  - "_currentDetailInvoiceId for tracking active detail view"
  - "Tab activation listener pattern with populateFilters + renderList"

# Metrics
duration: 9min
completed: 2026-02-05
---

# Phase 18 Plan 04: Invoice List & Detail View Summary

**Invoice list with 4 filters, summary bar, overdue alerts, detail view with status workflow (draft -> sent -> paid), payment recording, and rectificativa creation**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-05T19:25:15Z
- **Completed:** 2026-02-05T19:35:05Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Full invoice list rendering with client/status/month/project filters and dual layout (table+cards)
- Summary bar showing total invoiced, outstanding, overdue count+amount, and paid totals
- Overdue alert banner with count and total amount for past-due invoices
- Invoice detail view showing entity info, client info, line items table, totals breakdown
- Complete status workflow: draft -> sent -> paid with confirmation dialogs
- Payment recording with partial payment support, remaining balance display, and auto-status transition
- Archive flow for draft invoices with consumed-number warning
- Rectificativa flow linking correcting invoice to original with reason codes

## Task Commits

Each task was committed atomically:

1. **Task 1: Invoice list rendering and filtering** - `ea6e55e` (feat)
2. **Task 2: Invoice detail view and status/payment actions** - `d75dc64` (feat)

## Files Created/Modified
- `autonomo_dashboard.html` - Added 15 functions: renderInvoiceList, renderInvoiceSummary, renderOverdueAlert, populateInvoiceFilters, showInvoiceList, _initInvoiceListListeners, _loadInvoiceClientNameCache, showInvoiceDetail, renderInvoiceDetailActions, scrollToPaymentForm, handleMarkAsSent, handleRecordPayment, renderPaymentHistory, handleArchiveInvoice, handleCreateRectificativa, handleSubmitRectificativa

## Decisions Made
- Rectificativa dialog button changed from `handleCreateRectificativa()` to `handleSubmitRectificativa()` - separates opening the dialog (handleCreateRectificativa) from submitting the form (handleSubmitRectificativa)
- PDF buttons show info notification pointing to Plan 18-05 rather than being hidden
- Payment form only visible for sent invoices (not draft, not already fully paid)
- Summary bar always shows unfiltered totals regardless of active filters
- Separate invoice client name cache from expense client cache for independent invalidation per entity change
- Overdue badge (red) replaces sent badge (blue) when invoice is past due date

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated rectificativa dialog submit button onclick**
- **Found during:** Task 2
- **Issue:** The rectificativa dialog's "Create Rectificativa" button called `handleCreateRectificativa()` (which opens the dialog) instead of `handleSubmitRectificativa()` (which submits the form). This would cause infinite dialog re-opening.
- **Fix:** Changed onclick from `handleCreateRectificativa()` to `handleSubmitRectificativa()`
- **Files modified:** autonomo_dashboard.html (line 10892)
- **Verification:** Button now correctly submits the form data
- **Committed in:** d75dc64 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix necessary for correct rectificativa workflow. No scope creep.

## Issues Encountered
- 18-03 was already executed before this plan (file was modified since last read), requiring re-reading to find updated stub locations at new line numbers. Resolved by re-scanning for stub function patterns.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Invoice list and detail view fully functional
- PDF generation (Plan 18-05) can now add generatePDF function called from detail action buttons
- VeriFactu QR (Plan 18-06) can add QR display to detail view
- Client invoice totals (Plan 18-07) can now query InvoiceManager for accurate totals
- All status transitions working: draft -> sent -> paid
- Payment recording with partial payment support ready for real-world use

---
*Phase: 18-invoice-generation*
*Completed: 2026-02-05*
