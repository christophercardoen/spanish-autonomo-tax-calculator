---
phase: 17-expense-management
plan: 03
subsystem: expenses
tags: [expense-form, dialog, ocr, receipt-upload, entity-type-filtering, conditional-fields, indexeddb]

# Dependency graph
requires:
  - phase: 17-01
    provides: "EXPENSE_CATEGORY config, ExpenseManager CRUD, MoneyUtils cents conversion"
  - phase: 17-02
    provides: "ReceiptManager.scanReceipt OCR, ReceiptManager.storeReceipt storage"
  - phase: 15-client-project
    provides: "ClientManager.getClients, ProjectManager.getProjectsByClient"
  - phase: 13-entity-management
    provides: "EntityContext.current, ENTITY_TYPE constants"
provides:
  - "Expense form dialog (expenseFormDialog) with 18 fields and conditional visibility"
  - "openExpenseFormDialog function with create/edit mode support"
  - "submitExpenseForm function with cents conversion and receipt storage"
  - "handleReceiptUpload with OCR auto-fill and confidence display"
  - "onExpenseCategoryChange for conditional field visibility (travel, meals, home office)"
  - "onExpenseClientChange for project loading and billable checkbox"
  - "renderExpenseList basic list rendering (placeholder for Plan 04 enhancement)"
  - "Expense tracker section with Add Expense button below v1 Monthly Fixed Costs"
affects:
  - "17-04 (expense list rendering enhancement)"
  - "17-05 (expense detail view, receipt viewing)"
  - "17-06 (calendar-expense linking)"
  - "17-07 (expense reporting and totals)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Entity-type-aware category filtering in form population (sl_only check)"
    - "Conditional field visibility via CSS class toggle (conditional-fields/visible)"
    - "OCR auto-fill with confidence badge (high/medium/low thresholds)"
    - "Dialog create/edit dual mode via data-edit-id attribute"
    - "Cents conversion at form boundary (eurosToCents on submit, centsToEuros on edit load)"

key-files:
  created: []
  modified:
    - "autonomo_dashboard.html"

key-decisions:
  - "Separate conditional field groups for Travel vs Meals (not shared) for cleaner UX"
  - "Home office deductible % field only shown for autonomo entities (max 30%)"
  - "OCR auto-fill only overwrites empty fields (preserves manual edits)"
  - "Receipt file stored after expense creation to get expense ID for linking"
  - "Basic renderExpenseList included as placeholder for Plan 04 full implementation"
  - "XSS prevention via _escapeHtml helper for all user-generated content display"

patterns-established:
  - "Form dialog dual mode: data-edit-id empty = create, populated = edit"
  - "Category-driven conditional fields: onExpenseCategoryChange toggles visibility"
  - "OCR confidence display: high (>=85%), medium (>=60%), low (<60%)"
  - "Double-submit prevention via _expenseFormSubmitting flag"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 17 Plan 03: Expense Form Dialog Summary

**Expense creation/edit form dialog with entity-type-aware category filtering, receipt OCR auto-fill, and conditional fields for travel/meals/home office expenses**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T15:01:44Z
- **Completed:** 2026-02-05T15:06:47Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- 18-field expense form dialog with HTML `<dialog>` element matching existing dialog patterns
- Entity-type-aware category population (filters out sl_only categories for autonomo entities)
- Conditional field groups for Travel (destination, trip dates, overnight), Meals/Dietas (destination, overnight, payment method), and Home Office (deductible % with 30% cap for autonomo)
- Receipt upload with OCR auto-fill via ReceiptManager.scanReceipt, confidence badge display, and raw text viewer
- Form submission converts EUR to cents via MoneyUtils, creates/updates via ExpenseManager, and stores receipt if uploaded
- Edit mode pre-fills all fields from existing expense data with cents-to-euros conversion
- Client/project selection with dynamic project loading and billable checkbox
- V1 expense sections (Monthly Fixed Costs) fully preserved and untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Add expense form dialog HTML and Add Expense button** - `be26446` (feat)
2. **Task 2: Implement form JavaScript handlers (open, submit, OCR, conditional fields)** - `e743df1` (feat)

## Files Created/Modified
- `autonomo_dashboard.html` - Added CSS styles for expense form dialog (~200 lines), HTML dialog with 18 fields (~160 lines), and 8 JavaScript functions (~330 lines)

## Decisions Made
- Separate conditional field groups for Travel vs Meals rather than sharing destination/overnight fields, keeping each category's UX self-contained
- Home office deductible percentage field only shown when entity type is autonomo (SL has different deduction rules)
- OCR auto-fill respects existing field values (only fills empty vendor, always updates date, only fills amount if empty or zero)
- Receipt file reference stored in `_pendingReceiptFile` module variable, uploaded after expense creation to get valid expense ID for the receipt-expense link
- Basic `renderExpenseList` function included as a minimal implementation showing recent 50 expenses sorted by date, to be enhanced in Plan 04
- All user content displayed via `_escapeHtml` helper to prevent XSS (consistent with Phase 14-04 pattern)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Expense form dialog ready for user interaction on the Expenses tab
- renderExpenseList provides basic list that Plan 04 will enhance with filtering, sorting, and pagination
- Receipt upload and OCR pipeline fully integrated end-to-end
- All ExpenseManager and ReceiptManager APIs properly called from form handlers

---
*Phase: 17-expense-management*
*Completed: 2026-02-05*
