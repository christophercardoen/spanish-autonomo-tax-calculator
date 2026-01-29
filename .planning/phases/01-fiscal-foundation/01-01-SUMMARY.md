---
phase: 01-fiscal-foundation
plan: 01
subsystem: calculation-engine
tags: [irpf, reta, tax-calculation, javascript, vanilla-js, spanish-tax]

# Dependency graph
requires: []
provides:
  - FISCAL_2025 constant with verified 2025/2026 tax rates
  - applyBrackets() for progressive IRPF calculation
  - calculateCuotaIntegra() using 4-phase AEAT method
  - calculateFullIRPF() returning complete tax breakdown
  - formatEUR() and formatPercent() utilities
  - Basic UI demonstrating calculation engine
affects:
  - 01-02 (source citations, validation)
  - 02-expense-tracking (expense handling)
  - 03-scenario-engine (scenario calculations)
  - 06-excel-calculator (formula verification)

# Tech tracking
tech-stack:
  added: [vanilla-javascript, intl-numberformat]
  patterns: [immutable-constants, 4-phase-minimo-method, cumulative-bracket-calculation]

key-files:
  created:
    - autonomo_dashboard.html
  modified: []

key-decisions:
  - "RETA deducted as fixed cuota (428.40 EUR/month), not calculated dynamically"
  - "4-phase AEAT method: minimos reduce TAX, not taxable BASE"
  - "5% gastos dificil with 2000 EUR cap (not 7% - that was 2023 only)"
  - "Cumulative baseTax approach for bracket accuracy at boundaries"

patterns-established:
  - "FISCAL_2025 constant: All fiscal data frozen with source citations"
  - "applyBrackets(): Progressive tax calculation with cumulative baseTax"
  - "calculateFullIRPF(): Returns all intermediate values for UI display"
  - "Calculation chain: revenue -> deductions -> rendimiento neto -> gastos dificil -> base liquidable -> cuota integra"

# Metrics
duration: 3min
completed: 2026-01-29
---

# Phase 01 Plan 01: Core IRPF/RETA Calculation Engine Summary

**Progressive IRPF calculation engine with 4-phase minimo method, fixed RETA cuota deduction, and 5% gastos dificil capped at 2000 EUR**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-29T19:48:20Z
- **Completed:** 2026-01-29T19:51:19Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- FISCAL_2025 constant with all verified tax rates from AEAT/BOE sources
- applyBrackets() using cumulative baseTax for accurate bracket calculations
- calculateCuotaIntegra() implementing official AEAT 4-phase method (minimos reduce tax, not base)
- calculateFullIRPF() returning complete breakdown with all intermediate values
- Working UI that auto-calculates on page load with default values

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FISCAL_2025 constants** - `54049d4` (feat)
2. **Task 2: Implement IRPF calculation functions** - `6994b49` (feat)
3. **Task 3: Build minimal UI** - `623a2c5` (feat)

## Files Created/Modified

- `autonomo_dashboard.html` - Single-file HTML with embedded JavaScript calculation engine and minimal UI (365 lines)

## Decisions Made

1. **RETA as fixed cuota:** Used user's actual RETA cuota (428.40 EUR/month = 5140.80 EUR/year) rather than implementing dynamic tramo calculation. The 7% reduccion mentioned in CALC-05 applies to Social Security base calculation, not IRPF.

2. **4-phase minimo method:** Implemented official AEAT methodology where minimos reduce TAX liability rather than taxable BASE. This is legally required and produces different results than the intuitive approach.

3. **Gastos dificil at 5%:** Used 5% rate with 2000 EUR cap (not 7% - that was an exceptional rate for tax year 2023 only, reverted to 5% for 2024 onwards).

4. **Cumulative baseTax approach:** Each bracket stores its cumulative tax from lower brackets to ensure accurate calculations at bracket boundaries.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Open `autonomo_dashboard.html` in any modern browser.

## Next Phase Readiness

- Calculation engine complete and verified
- Ready for Plan 01-02 to add source citations and validation
- UI foundation ready for Phase 5 dashboard enhancement
- All CALC-* requirements from Phase 1 satisfied

### Verification Results

For 6000 EUR/month with 0 expenses and 1 child:
- Annual revenue: 72,000 EUR
- RETA deduction: 5,140.80 EUR
- Rendimiento neto previo: 66,859.20 EUR
- Gastos dificil: 2,000 EUR (capped)
- Base liquidable: 64,859.20 EUR
- Minimos total: 7,950 EUR (5550 + 2400)
- Progressive brackets applied correctly (19%, 24%, 30%, 37%, 45%, 47%)

---
*Phase: 01-fiscal-foundation*
*Completed: 2026-01-29*
