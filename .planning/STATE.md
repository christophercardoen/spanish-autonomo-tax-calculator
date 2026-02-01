# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Accurate, real-time calculation of net monthly income after all taxes (RETA + IRPF), with Belgium work cost tracking and 183-day residency management
**Current focus:** Phase 4 - Belgium Calendar (In Progress)

## Current Position

Phase: 4 of 7 (Belgium Calendar)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-01 - Completed 04-01-PLAN.md (Calendar Foundation)

Progress: [██████▓░░░] 57%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 2.8 min
- Total execution time: 24 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-fiscal-foundation | 2 | 7 min | 3.5 min |
| 02-expense-tracking | 2 | 7 min | 3.5 min |
| 03-scenario-engine | 3 | 6 min | 2 min |
| 04-belgium-calendar | 1 | 4 min | 4 min |

**Recent Trend:**
- Last 5 plans: 03-01 (2 min), 03-02 (2 min), 03-03 (2 min), 04-01 (4 min)
- Trend: Stable execution times

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Rationale | Phase |
|----------|-----------|-------|
| RETA as fixed cuota (428.40 EUR/month) | User has documented cuota from registration; 7% reduccion is for SS, not IRPF | 01-01 |
| 4-phase minimo method | Official AEAT methodology: minimos reduce TAX, not taxable BASE | 01-01 |
| Gastos dificil at 5% (not 7%) | 7% was exceptional for 2023; reverted to 5% with 2000 EUR cap for 2024+ | 01-01 |
| Cumulative baseTax for brackets | Ensures accuracy at bracket boundaries | 01-01 |
| Tooltip pattern for citations | Hover tooltips keep UI clean while providing source info on demand | 01-02 |
| All HIGH confidence sources | Every source verified from official AEAT/BOE/SS publications | 01-02 |
| Object.freeze() on DEFAULT_EXPENSES | Prevents accidental mutation; structuredClone() creates mutable copies | 02-01 |
| Version field in expense data | Enables future data migration if schema changes | 02-01 |
| STORAGE_KEY includes version | Allows clean migration path (autonomo_expenses_v1) | 02-01 |
| Global add form for expenses | Single form element for all categories, pre-selects based on source button | 02-02 |
| Category-aware expense creation | Spain Deductible uses baseAmount+deductionPct, Belgium/Private use flat amount | 02-02 |
| Live IRPF recalculation | Revenue and expense changes trigger immediate recalculation | 02-02 |
| SCENARIO_PRESETS frozen objects | Prevent accidental mutation of preset values | 03-01 |
| calculateFullIRPFWithFiscal | Copy of Phase 1 function with fiscal parameter for what-if analysis | 03-01 |
| Belgium patterns: A/B low, C/D/E high | A/B use 'low' (1K), C/D/E use 'high' (2.5K) per CLAUDE.md requirements | 03-01 |
| Leefgeld-based sorting | Highest leefgeld appears first with "Highest Leefgeld" badge | 03-01 |
| Native dialog element over custom modal | HTML5 dialog provides focus trap, backdrop, Esc handling natively | 03-02 |
| requestAnimationFrame debouncing | Smoother than setTimeout, syncs with browser paint cycle | 03-02 |
| Split-view modal layout | Inputs left, results right allows instant feedback while editing | 03-02 |
| Fiscal overrides in details element | Keeps advanced what-if analysis accessible but not overwhelming | 03-02 |
| Property verification in updateLiveResults | Defensive programming catches API contract breaks early | 03-02 |
| renderComparisonTable with property verification | Defensive check for all 16 required properties with console.error logging | 03-03 |
| Metrics array pattern for table rows | Clean separation of row definitions from rendering logic | 03-03 |
| optimalMax/optimalMin flags on metrics | Flexible highlighting system for different optimal directions | 03-03 |
| Template dialog with radio options | Shows all existing scenarios as templates with preview info | 03-03 |
| structuredClone for scenario copying | Prevents accidental mutation of template scenario | 03-03 |
| Monday-start week alignment | European standard; (date.getDay() + 6) % 7 for column position | 04-01 |
| First week ends on first Sunday | After first Sunday that occurs after day 1, isFirstWeek becomes false | 04-01 |
| Status + contracted flags | Allows visual distinction while preserving day status for counting | 04-01 |
| Wizard shown via flag | contractedPatternApplied persists in localStorage to prevent re-showing | 04-01 |

### Pending Todos

- Phase 4: Belgium Calendar (2 plans remaining: 04-02, 04-03)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-01T10:50:00Z
Stopped at: Completed 04-01-PLAN.md (Calendar Foundation)
Resume file: None

## Key Files Created

| File | Purpose |
|------|---------|
| autonomo_dashboard.html | Core IRPF/RETA calculation + expense tracking + scenario cards + edit modal + comparison table + calendar grid with localStorage |
| .planning/phases/01-fiscal-foundation/01-01-SUMMARY.md | Plan 01-01 execution summary |
| .planning/phases/01-fiscal-foundation/01-02-SUMMARY.md | Plan 01-02 execution summary |
| .planning/phases/02-expense-tracking/02-01-SUMMARY.md | Plan 02-01 execution summary |
| .planning/phases/02-expense-tracking/02-02-SUMMARY.md | Plan 02-02 execution summary |
| .planning/phases/03-scenario-engine/03-01-SUMMARY.md | Plan 03-01 execution summary |
| .planning/phases/03-scenario-engine/03-02-SUMMARY.md | Plan 03-02 execution summary |
| .planning/phases/03-scenario-engine/03-03-SUMMARY.md | Plan 03-03 execution summary |
| .planning/phases/04-belgium-calendar/04-01-SUMMARY.md | Plan 04-01 execution summary |

## Phase 1 Complete

Phase 1 (Fiscal Foundation) delivered:
- FISCAL_2025 constant with verified 2025/2026 tax rates
- Progressive IRPF calculation with 4-phase minimo method
- RETA deduction as fixed cuota (428.40 EUR/month)
- Gastos dificil at 5% with 2000 EUR cap
- SOURCES constant with 6 official government references
- Source citations visible via hover tooltips and footnotes
- All DATA-01 through DATA-04 requirements satisfied

## Phase 2 Complete

Phase 2 (Expense Tracking) delivered:
- Three expense sections with color-coded borders (green/blue/red)
- Formula display: "BASE x PERCENT% = RESULT" for all expenses
- Belgium toggle between low (1K) and high (2.5K) patterns
- Belgium breakdown formula with DIETAS source citation
- Add expense form with category-specific fields
- Delete expense with immediate recalculation
- localStorage persistence across browser sessions
- Phase 1 integration: expense changes trigger IRPF recalculation
- Dynamic private costs from expense data
- All EXP-01 through EXP-05 and DATA-05 requirements satisfied

## Phase 3 Complete

Phase 3 (Scenario Engine) delivered:
- SCENARIO_PRESETS with A-E frozen objects (SCEN-01)
- Horizontal scrolling scenario cards sorted by leefgeld (SCEN-02)
- Side-by-side comparison table with full calculation breakdown (SCEN-03)
- Edit modal with live recalculation and fiscal overrides (SCEN-04)
- Custom scenario creation from templates (SCEN-05)
- Optimal value highlighting (highest leefgeld, lowest tax rate) (SCEN-06)
- localStorage persistence for scenarios and selections (SCEN-07)
- All SCEN-01 through SCEN-07 requirements satisfied

## Phase 4 In Progress

Phase 4 (Belgium Calendar) - Plan 01 complete:
- Calendar data system with localStorage persistence
- Month grid rendering with Monday-start week alignment
- Navigation between Feb-Dec 2026
- Contracted pattern wizard for first-time setup
- C badge display for contracted days
- Status colors: Belgium (blue), Spain (green), Travel (orange)

Next: Plan 04-02 (Day Status Toggle) and 04-03 (Day Counting)
