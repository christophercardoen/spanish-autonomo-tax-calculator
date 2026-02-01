---
phase: 06-excel-calculator
plan: 02
subsystem: excel
tags: [exceljs, scenario-sheets, irpf-brackets, minimo-method, conditional-formatting]

# Dependency graph
requires:
  - phase: 06-01
    provides: Constants sheet with named ranges (RETA_ANNUAL, MINIMO_PERSONAL, etc.)
provides:
  - createScenarioSheet function with 6-section template
  - 5 scenario sheets (A-E) with full IRPF calculation breakdown
  - Input cells with data validation and styling
  - Conditional formatting for key result cells
affects: [06-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [scenario-sheet-template, conditional-formatting-rules, data-validation-dropdowns]

key-files:
  created: []
  modified:
    - scripts/generate-excel.js
    - autonomo_calculator.xlsx

key-decisions:
  - "6-section sheet structure: INPUTS, ANNUAL, GASTOS DIFICIL, BRACKETS, MINIMO, RESULTS"
  - "Light blue fill (FFE0F0FF) for editable input cells"
  - "Data validation dropdown for Belgium pattern (1000,2500)"
  - "Step-by-step IRPF bracket rows with MAX/MIN formulas for taxable amounts"
  - "Simplified minimo tax calculation using first bracket rate (19%)"
  - "Conditional formatting thresholds: Leefgeld <0 red, 0-500 orange, >=500 green"
  - "Effective tax rate thresholds: >40% red, 30-40% orange, <30% green"

patterns-established:
  - "Scenario sheet template with standardized row positions for all sections"
  - "IFERROR wrapper for division operations to prevent #DIV/0!"
  - "Named range references throughout for single-point updates"

# Metrics
duration: 2min
completed: 2026-02-01
---

# Phase 6 Plan 2: Scenario Sheets Summary

**createScenarioSheet function generating 5 scenario sheets (A-E) with step-by-step IRPF bracket calculation, 4-phase minimo method, and conditional formatting on leefgeld/tax rate**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-01T16:20:01Z
- **Completed:** 2026-02-01T16:22:25Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- createScenarioSheet function with 6 sections (400+ lines)
- All 5 scenario sheets generated with correct default values
- Belgium patterns: A/B = 1000 (low), C/D/E = 2500 (high) per CLAUDE.md
- Step-by-step IRPF bracket rows with taxable amount formulas
- 4-phase minimo method visible: Cuota1 -> Minimos -> Cuota3 -> CuotaIntegra
- Input cells with light blue fill and data validation dropdown
- Conditional formatting on leefgeld (red/orange/green) and tax rate
- All formulas use named ranges from Constants sheet

## Task Commits

Each task was committed atomically:

1. **Task 1: Create scenario sheet template function** - `489fff8` (feat)
2. **Task 2: Generate all 5 scenario sheets** - `0f44a4d` (feat)

## Sheet Structure

Each scenario sheet follows this structure:

| Section | Rows | Content |
|---------|------|---------|
| INPUTS | 1-6 | Monthly Revenue, Expenses, Belgium Pattern, Spain Deductible |
| ANNUAL CALCULATIONS | 8-16 | Annual values, Total Deductible, Rendimiento Neto Previo |
| GASTOS DIFICIL | 18-22 | 5% deduction with 2000 EUR cap, Base Liquidable |
| IRPF BRACKETS | 24-32 | 6 bracket rows (Lower/Upper/Rate/Taxable/Tax), Total Tax |
| 4-PHASE MINIMO | 34-43 | Base, Cuota1, Minimo Personal+Descendientes, Cuota3, CuotaIntegra |
| FINAL RESULTS | 45-53 | IRPF, Net Income, Leefgeld (annual/monthly), Effective Rate |

## Scenario Preset Values

| Scenario | Revenue | Expenses | Belgium | Pattern |
|----------|---------|----------|---------|---------|
| A - 3K | 3,000 | 750 | 1,000 | Low |
| B - 6K | 6,000 | 1,500 | 1,000 | Low |
| C - 9K | 9,000 | 3,000 | 2,500 | High |
| D - 12K | 12,000 | 5,000 | 2,500 | High |
| E - 18K | 18,000 | 8,000 | 2,500 | High |

## Key Formulas

- **Taxable in bracket:** `MAX(0,MIN($B$22,UpperBound)-LowerBound)`
- **Gastos Dificil:** `MIN(MAX(0,B16)*GASTOS_DIFICIL_RATE,GASTOS_DIFICIL_MAX)`
- **Base Liquidable:** `MAX(0,B16-B21)`
- **Tax on Minimos:** `B40*0.19` (minimos fall within first bracket)
- **Cuota Integra:** `MAX(0,B37-B41)`
- **Leefgeld:** `B49-(PRIVATE_COSTS*12)`
- **Effective Rate:** `IFERROR(B47/B16,0)`

## Decisions Made

1. **6-section sheet structure** - Mirrors HTML dashboard breakdown for consistency and accountant verification
2. **Light blue input cells** - Clear visual distinction between editable (light blue) and calculated (white) cells
3. **Belgium dropdown validation** - Data validation ensures valid values (1000 or 2500 only)
4. **Simplified minimo tax calculation** - Total minimos (7,950 EUR) falls entirely within first bracket (0-12,450 at 19%), so single-rate calculation is accurate
5. **Conditional formatting thresholds** - Leefgeld <0 red (negative), 0-500 orange (tight), >=500 green (comfortable); Tax rate >40% red, 30-40% orange, <30% green

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully on first attempt.

## User Setup Required

None - workbook is self-contained with all formulas.

## Next Phase Readiness

- All 5 scenario sheets complete with working formulas
- Named ranges from Constants sheet used throughout
- Ready for Plan 06-03: Overview sheet with comparison table and hyperlinks

**Ready for Plan 06-03:** Overview sheet with summary section and comparison table

---
*Phase: 06-excel-calculator*
*Completed: 2026-02-01*
