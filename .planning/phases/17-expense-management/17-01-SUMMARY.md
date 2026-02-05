---
phase: 17-expense-management
plan: 01
subsystem: expenses
tags: [expense-tracking, deduction-rules, irpf, impuesto-sociedades, indexeddb, dexie, entity-type-polymorphism]

# Dependency graph
requires:
  - phase: 12-data-foundation
    provides: "Dexie schema (db.expenses), MoneyUtils, DataManager, SyncQueue, auditFields"
  - phase: 13-entity-management
    provides: "EntityContext, ENTITY_TYPE constants, entity scoping pattern"
  - phase: 15-client-project
    provides: "ProjectManager pattern (CRUD, entity scoping, soft delete)"
provides:
  - "EXPENSE_CATEGORY frozen config with 10 categories and entity-type-aware deduction rules"
  - "ExpenseManager singleton with full CRUD (create, read, update, archive)"
  - "Deduction calculation engine (full, percentage, proportional, dietas_limit, full_if_justified)"
  - "Calendar-linked expense queries via [entity_id+date] compound index"
  - "Expense summary reporting with category grouping"
affects:
  - "17-02 through 17-07 (expense UI, receipt linking, calendar integration)"
  - "Phase 18+ (any phase needing expense totals or deduction data)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Entity-type-aware category rules via frozen config object"
    - "Deduction method dispatch (switch on rules.deduction_method)"
    - "Dietas limit calculation with AEAT per-day caps"
    - "Manager pattern: entity scoping + soft delete + audit fields + sync queue"

key-files:
  created: []
  modified:
    - "autonomo_dashboard.html"

key-decisions:
  - "EXPENSE_CATEGORY uses Object.freeze() with ENTITY_TYPE constants as rule keys"
  - "No gastos_dificil category - already handled in IRPF tax calculation engine"
  - "ExpenseManager follows ProjectManager pattern for consistency"
  - "calculateDeductible auto-recalculates on updateExpense when amount/category/metadata change"
  - "DEPRECIATION category marked sl_only: true (autonomo uses per-asset simplified table)"

patterns-established:
  - "Entity-type-aware config: frozen object with [ENTITY_TYPE.X] rule keys"
  - "Deduction calculation dispatch: switch on deduction_method string"
  - "Dietas validation: isAbroad + hasOvernight selects from limits object"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 17 Plan 01: Expense Data Layer Summary

**EXPENSE_CATEGORY frozen config with 10 entity-type-aware categories and ExpenseManager singleton with CRUD, deduction calculation, and calendar-linked queries**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T14:53:37Z
- **Completed:** 2026-02-05T14:58:35Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- EXPENSE_CATEGORY frozen object with 10 categories, each having distinct autonomo vs SL deduction rules
- ExpenseManager with 9 methods: createExpense, getExpenses, getExpense, updateExpense, archiveExpense, calculateDeductible, calculateDietasDeductible, getExpensesByDate, getExpenseSummary
- Deduction calculation handles 5 methods: full (100%), percentage (e.g., GSM 50%), proportional (e.g., home office 30% cap), dietas_limit (AEAT per-day caps), full_if_justified
- Dietas limits verified against AEAT: Spain 26.67/53.34, Abroad 48.08/91.35 EUR (stored as 2667/5334/4808/9135 cents)
- Entity scoping on all operations via EntityContext
- SyncQueue integration on all mutations (create, update, archive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create EXPENSE_CATEGORY frozen configuration object** - `a01ffde` (feat)
2. **Task 2: Create ExpenseManager singleton with CRUD and deduction calculation** - `304264c` (feat)

## Files Created/Modified
- `autonomo_dashboard.html` - Added EXPENSE_CATEGORY config (after ENTITY_TYPE constant) and ExpenseManager singleton (after ProjectManager, before ReceiptManager)

## Decisions Made
- EXPENSE_CATEGORY uses `[ENTITY_TYPE.AUTONOMO]` and `[ENTITY_TYPE.SOCIEDAD_LIMITADA]` as rule keys for type safety
- No "gastos_dificil" category included - it is an automatic IRPF deduction (5%, max 2000 EUR) already in the tax engine, not a user-entered expense
- DEPRECIATION marked `sl_only: true` because autonomo uses simplified per-asset amortization table, not a separate expense entry
- ExpenseManager placed between ProjectManager and ReceiptManager for logical code organization
- calculateDeductible auto-recalculates on update when amount, category, or metadata (destination, has_overnight, business_proportion) changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- EXPENSE_CATEGORY and ExpenseManager ready for Plan 02 (Expense UI form and list)
- ReceiptManager already exists (from prior commit) for receipt linking
- CalendarManager's getLinkedExpenseCount/getCounts will return real data once expenses are populated
- All deduction methods implemented and ready for UI display

---
*Phase: 17-expense-management*
*Completed: 2026-02-05*
