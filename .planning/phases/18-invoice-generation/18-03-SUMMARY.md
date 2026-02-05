---
phase: 18-invoice-generation
plan: 03
subsystem: ui
tags: [javascript, invoice-form, IVA, IRPF, line-items, IndexedDB, MoneyUtils, dialog]

# Dependency graph
requires:
  - phase: 18-invoice-generation (18-01)
    provides: "InvoiceManager CRUD, IVA_TREATMENT, IRPF_RETENTION, MoneyUtils, Dexie v4"
  - phase: 18-invoice-generation (18-02)
    provides: "Invoice dialog HTML, line items table, totals section, calendar populate dialog"
  - phase: 15-client-management
    provides: "ClientManager.getClients(), CLIENT_CATEGORY constants"
  - phase: 16-calendar-enhancement
    provides: "CalendarManager, calendar_days table with client_id"
provides:
  - "openInvoiceForm: create/edit mode dialog with client dropdown and date defaults"
  - "handleInvoiceClientChange: IVA treatment auto-detect, IRPF toggle, project/calendar/expense buttons"
  - "addInvoiceLineItem: dynamic row creation with IVA rate from client category"
  - "recalculateInvoiceFormTotals: live subtotal, discount, IVA, IRPF, total calculation"
  - "handleSaveInvoice: create/update draft with line items to IndexedDB"
  - "populateInvoiceFormForEdit: loads invoice + lines for editing"
  - "addLineFromProject: project rate as line item"
  - "openCalendarPopulate + handleCalendarPopulate: calendar days as line item"
  - "openExpenseSelector: billable expenses as line items"
  - "handleDiscountTypeChange: discount type UI toggle"
  - "handleInvoiceCurrencyChange + fetchExchangeRateForInvoice: multi-currency support"
affects: [18-04, 18-05, 18-06, 18-07, 18-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Invoice form uses async client/project/calendar DB lookups on user interaction"
    - "Line items created as DOM rows with oninput recalculation (no virtual DOM)"
    - "Discount value input show/hide driven by discount type selection"
    - "IVA rate readonly per-row, auto-set from client category on client change"

key-files:
  created: []
  modified:
    - "autonomo_dashboard.html"

key-decisions:
  - "IVA rate displayed as readonly input per line item row (not editable by user) - rate controlled by client category"
  - "Edit mode deletes all existing line items and recreates from form (simpler than diff-based update)"
  - "Discount value stored as percentage or cents depending on type (percentage=raw, fixed=cents)"
  - "Calendar populate description format: '{project} - {start} to {end} ({N} days)'"
  - "Expense selector uses prompt() for multi-select (lightweight, no extra UI)"
  - "Project selector uses prompt() for multiple projects (auto-selects if only one)"
  - "handleDiscountTypeChange wired to discount select onchange (replacing direct recalculateInvoiceFormTotals call)"

patterns-established:
  - "Invoice form handler pattern: async function with try/catch, user-friendly alert on error"
  - "Line item row class 'line-item-row' with data-project-id attribute for project linking"
  - "Form total recalculation: cents-based arithmetic via MoneyUtils throughout"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 18 Plan 03: Invoice Form Interactivity Summary

**Full invoice form wiring: client-driven IVA/IRPF auto-detection, dynamic line items with live totals, discount/currency handling, and save/update to IndexedDB with calendar/project/expense populate**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T19:24:09Z
- **Completed:** 2026-02-05T19:29:36Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Invoice form opens in create mode with today's date and 30-day due date, populates client dropdown from current entity
- Client selection auto-detects IVA treatment (21% Spain, 0% EU B2B reverse charge, 0% export) with legal text display
- IRPF retention toggle only visible for autonomo entities invoicing Spanish clients
- Dynamic line items: add/remove rows with description, quantity, unit price, auto-set IVA%, line total, remove button
- Live totals recalculation on every input change: subtotal, discount (percentage or fixed), IVA, IRPF, total
- Save creates invoice via InvoiceManager.createInvoice + addLineItem for each row; edit mode replaces all line items
- Calendar populate counts client work days in date range and creates single line item
- Project populate adds project name and rate as line item; expense selector adds billable expenses

## Task Commits

Each task was committed atomically:

1. **Task 1: Invoice form JS handlers** - `51d0f9e` (feat)
2. **Task 2: Save/update invoice logic and edit mode** - `a16845a` (feat)

## Files Created/Modified
- `autonomo_dashboard.html` - Replaced 13 stub functions with 15 full implementations for invoice form interactivity

## Decisions Made
- IVA rate is readonly per line item, auto-set from client category (users cannot manually override IVA rate)
- Edit mode uses delete-all-and-recreate strategy for line items (simpler and more reliable than diff-based updates)
- Discount value storage: percentage type stores raw number, fixed type stores euro cents
- Calendar populate and project populate use prompt() for selection when multiple options exist (no additional dialog needed)
- handleDiscountTypeChange added as separate function wired to onchange (cleaner separation from recalculateInvoiceFormTotals)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added handleDiscountTypeChange to HTML onchange**
- **Found during:** Task 1
- **Issue:** HTML discount select had `onchange="recalculateInvoiceFormTotals()"` but plan specified separate `handleDiscountTypeChange()` function
- **Fix:** Updated HTML onchange to call `handleDiscountTypeChange()` which manages discount value input visibility then calls recalculateInvoiceFormTotals()
- **Files modified:** autonomo_dashboard.html
- **Verification:** Discount type change shows/hides value input correctly
- **Committed in:** `51d0f9e`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor wiring fix to match plan's function architecture. No scope creep.

## Issues Encountered
None - both tasks completed as specified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Invoice form fully interactive: create, edit, save drafts with line items
- Ready for 18-04 (Invoice List Rendering) to display saved invoices
- Ready for 18-05+ (Status Workflow, Payments, PDF generation)
- renderInvoiceList() remains a stub - will be implemented in 18-04

---
*Phase: 18-invoice-generation*
*Completed: 2026-02-05*
