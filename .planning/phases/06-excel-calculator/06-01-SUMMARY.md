---
phase: 06-excel-calculator
plan: 01
subsystem: excel
tags: [exceljs, nodejs, named-ranges, xlsx, fiscal-data]

# Dependency graph
requires:
  - phase: 01-fiscal-foundation
    provides: IRPF brackets, RETA cuota, minimos values
provides:
  - Node.js project with ExcelJS dependency
  - Constants sheet with 7 workbook-scoped named ranges
  - IRPF brackets reference table
  - EUR currency and percentage formatting
affects: [06-02, 06-03]

# Tech tracking
tech-stack:
  added: [exceljs@4.4.0, nodejs]
  patterns: [named-ranges-for-constants, workbook-scoped-references]

key-files:
  created:
    - scripts/package.json
    - scripts/generate-excel.js
    - autonomo_calculator.xlsx
  modified: []

key-decisions:
  - "Workbook-scoped named ranges with absolute references ($B$5)"
  - "English formula syntax with commas (not semicolons)"
  - "RETA Annual uses formula (RETA_MONTHLY*12) not hardcoded value"
  - "Source notes embedded in Constants sheet for future maintenance"

patterns-established:
  - "Constants sheet pattern: fiscal data centralized for single-point updates"
  - "Named range format: UPPERCASE_UNDERSCORE for workbook-scoped ranges"
  - "Currency format: '\"EUR \"#,##0.00' for monetary values"

# Metrics
duration: 2min
completed: 2026-02-01
---

# Phase 6 Plan 1: Excel Generator & Constants Sheet Summary

**ExcelJS Node.js generator with Constants sheet containing 7 named ranges (RETA, minimos, gastos dificil) and IRPF brackets table**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-01T16:15:03Z
- **Completed:** 2026-02-01T16:17:00Z
- **Tasks:** 2
- **Files created:** 4

## Accomplishments

- Node.js project initialized with ExcelJS 4.4.0 dependency
- Constants sheet created with all fiscal data as named ranges
- IRPF brackets reference table (6 brackets: 19%-47%) visible on sheet
- RETA Annual formula demonstrates formula-based approach (not hardcoded)
- Currency and percentage formatting applied correctly
- Source notes included for 2027 update guidance

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Node.js project with ExcelJS** - `52d60e2` (chore)
2. **Task 2: Create generator script with Constants sheet** - `0c9ecb2` (feat)

## Files Created

- `scripts/package.json` - Node.js project configuration with exceljs dependency
- `scripts/package-lock.json` - Dependency lock file (97 packages)
- `scripts/generate-excel.js` - Excel workbook generator with createConstantsSheet function
- `autonomo_calculator.xlsx` - Generated workbook with Constants sheet

## Named Ranges Created

| Range Name | Value | Format | Row |
|------------|-------|--------|-----|
| RETA_MONTHLY | 428.40 | EUR #,##0.00 | B5 |
| RETA_ANNUAL | formula | EUR #,##0.00 | B6 |
| MINIMO_PERSONAL | 5,550 | EUR #,##0 | B9 |
| MINIMO_DESCENDIENTES | 2,400 | EUR #,##0 | B10 |
| GASTOS_DIFICIL_RATE | 5% | 0.0% | B13 |
| GASTOS_DIFICIL_MAX | 2,000 | EUR #,##0 | B14 |
| PRIVATE_COSTS | 1,727 | EUR #,##0 | B17 |

## Decisions Made

1. **Workbook-scoped named ranges** - Used absolute references (`$B$5`) to ensure names work from all sheets
2. **English formula syntax** - ExcelJS requires commas, not semicolons (`RETA_MONTHLY*12`)
3. **Formula for RETA Annual** - Demonstrates formula-based approach that scenario sheets will use
4. **Source notes in sheet** - Added notes explaining RETA as fixed cuota, gastos dificil at 5%, and 2027 update reminder
5. **Infinity display as "+"** - Last IRPF bracket upper bound displayed as "+" for readability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

1. **npm cache permission error** - Initial `npm install` failed due to root-owned files in ~/.npm cache
   - **Resolution:** Used `--cache /tmp/npm-cache` flag to bypass permission issue
   - **Impact:** None - dependency installed successfully

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Constants sheet complete with all 7 named ranges
- Generator script ready for extension with scenario sheets (Plan 06-02)
- Formula pattern established (formula property with result: undefined)
- All named ranges are workbook-scoped and accessible from any sheet

**Ready for Plan 06-02:** Scenario sheet implementation with step-by-step IRPF calculations

---
*Phase: 06-excel-calculator*
*Completed: 2026-02-01*
