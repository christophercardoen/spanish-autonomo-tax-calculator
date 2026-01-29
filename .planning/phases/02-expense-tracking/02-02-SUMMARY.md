---
phase: 02-expense-tracking
plan: 02
subsystem: ui
tags: [vanilla-js, expense-tracking, formula-display, add-delete, phase-integration]

# Dependency graph
requires:
  - phase: 02-expense-tracking/01
    provides: DEFAULT_EXPENSES, localStorage persistence, Belgium toggle, expense calculation helpers
  - phase: 01-fiscal-foundation
    provides: calculateFullIRPF, formatEUR, SOURCES constant, sourceHint function
provides:
  - Expense section rendering with formula display (BASE x PERCENT% = RESULT)
  - Add/delete expense functionality
  - Belgium toggle integrated with section re-render
  - Phase 1 IRPF integration via recalculateTotals()
affects: [03-scenario-engine, 05-dashboard-ui, 06-excel-calculator]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Expense formula pattern: BASE x PERCENT% = RESULT for transparent calculations"
    - "Section rendering pattern: renderExpenseSection() builds complete section HTML"
    - "Integration pattern: recalculateTotals() bridges expense data to IRPF calculation"

key-files:
  created: []
  modified:
    - autonomo_dashboard.html

key-decisions:
  - "Global add form instead of per-section forms for simpler UI"
  - "Category-specific expense creation: spainDeductible uses baseAmount+deductionPct, others use amount"
  - "Live IRPF recalculation on any expense change"

patterns-established:
  - "Formula display: formatFormula(expense, categoryKey) returns transparent calculation string"
  - "Section render cycle: modify data -> saveExpenses -> renderAllSections -> recalculateTotals"
  - "Dynamic private costs: pulled from expenseData instead of FISCAL_2025 constant"

# Metrics
duration: 4min
completed: 2026-01-29
---

# Phase 2 Plan 2: Expense Section UI Summary

**Three expense sections with formula display (BASE x PERCENT% = RESULT), add/delete functionality, and live IRPF recalculation on expense changes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-29T20:33:00Z
- **Completed:** 2026-01-29T20:37:51Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Three expense sections render with color-coded borders (green Spain, blue Belgium, red Private)
- All expenses display formulas showing transparent calculation: "1.155,00 EUR x 30% = 346,50 EUR"
- Belgium section includes inline toggle and breakdown formula with DIETAS source citation
- Add/delete expense functionality with form validation
- Phase 1 integration: expense changes trigger full IRPF recalculation via recalculateTotals()
- Private costs now dynamic (from expense data) instead of fixed constant

## Task Commits

Each task was committed atomically:

1. **Task 1: Add expense section CSS styles** - `d289b26` (style)
2. **Task 2: Create expense rendering functions and HTML structure** - `0012989` (feat)
3. **Task 3: Implement add/delete expense functionality and Phase 1 integration** - `d10c939` (feat)

## Files Created/Modified

- `autonomo_dashboard.html` - Added expense section CSS, rendering functions, add/delete functionality, IRPF integration

## Decisions Made

1. **Global add form** - Single form element for all categories, pre-selects category based on which "+" button was clicked
2. **Category-aware expense creation** - Spain Deductible uses baseAmount + deductionPct, Belgium/Private use flat amount
3. **Live recalculation** - Revenue input and checkbox have oninput/onchange handlers that call recalculateTotals()
4. **Dynamic private costs** - Results section now shows private costs from expense data, not FISCAL_2025 constant

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation of UI components and integration.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 2 Complete - Ready for Phase 3 (Scenario Engine):**
- Expense tracking fully functional with Spain/Belgium/Private categories
- Formula transparency achieved with visible calculations
- Belgium toggle works with breakdown formula and DIETAS citation
- Add/delete functionality with localStorage persistence
- IRPF calculation integrates with expense totals
- All EXP-01 through EXP-05 requirements satisfied

**Integration points for Phase 3:**
- getExpenseTotals() returns monthly/annual totals per category
- recalculateTotals() can be called after scenario changes
- expenseData structure ready for scenario-specific overrides

---
*Phase: 02-expense-tracking*
*Completed: 2026-01-29*
