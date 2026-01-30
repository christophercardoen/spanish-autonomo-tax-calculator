---
phase: 03-scenario-engine
plan: 01
subsystem: ui
tags: [scenarios, state-management, localStorage, horizontal-scroll, cards]

# Dependency graph
requires:
  - phase: 01-fiscal-foundation
    provides: FISCAL_2025 constant, calculateFullIRPF, IRPF brackets, 4-phase minimo method
  - phase: 02-expense-tracking
    provides: expense data structure, localStorage pattern
provides:
  - SCENARIO_PRESETS constant with frozen A-E scenario objects
  - Scenario state management with localStorage persistence
  - calculateFullIRPFWithFiscal function for fiscal overrides
  - calculateScenarioResults wrapper for scenarios
  - getSortedScenarios for leefgeld-sorted display
  - Horizontal scrolling scenario cards with optimal highlighting
affects: [03-02, 03-03, 05-dashboard-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [scenario presets with Object.freeze, structuredClone for state initialization, leefgeld-based sorting]

key-files:
  created: []
  modified:
    - autonomo_dashboard.html

key-decisions:
  - "SCENARIO_PRESETS frozen objects prevent accidental mutation"
  - "calculateFullIRPFWithFiscal derived from calculateFullIRPF with fiscal override support"
  - "Belgium patterns: A/B use 'low' (1K), C/D/E use 'high' (2.5K)"
  - "Cards sorted by leefgeld descending, first card is optimal"

patterns-established:
  - "Scenario state pattern: version 1 with scenarios map, selected array, customOrder array"
  - "Calculation wrapper: calculateScenarioResults calls calculateFullIRPFWithFiscal"
  - "Sorted scenarios: getSortedScenarios maps with results and sorts by leefgeld"

# Metrics
duration: 2min
completed: 2026-01-30
---

# Phase 03 Plan 01: Scenario Data and Card Layout Summary

**Pre-configured scenarios (A-E) with horizontal scrolling cards sorted by leefgeld, calculateFullIRPFWithFiscal for fiscal overrides, and localStorage state persistence**

## Performance

- **Duration:** 2 min 8s
- **Started:** 2026-01-30T12:58:15Z
- **Completed:** 2026-01-30T13:00:23Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments
- SCENARIO_PRESETS constant with 5 frozen scenario objects (A-E with correct values)
- Scenario state management with localStorage persistence (SCENARIO_STORAGE_KEY)
- calculateFullIRPFWithFiscal extends Phase 1 calculation with fiscal override support
- Horizontal scrolling scenario cards with scroll-snap
- Cards sorted by leefgeld (highest first) with optimal indicator badge
- Selection checkbox toggles for comparison (ready for Plan 03)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SCENARIO_PRESETS constant and state management** - `f5f6d48` (feat)
2. **Task 2: Add scenario card CSS and HTML structure** - `2e2c8b2` (feat)
3. **Task 3: Implement renderScenarioCards and integrate with page initialization** - `a0640e3` (feat)

## Files Created/Modified
- `autonomo_dashboard.html` - Added SCENARIO_PRESETS, state management, calculateFullIRPFWithFiscal, scenario card CSS, HTML structure, renderScenarioCards function

## Decisions Made
- **SCENARIO_PRESETS frozen objects:** Prevent accidental mutation of preset values
- **calculateFullIRPFWithFiscal:** Copy of Phase 1 function with fiscal parameter for what-if analysis
- **Belgium patterns match requirements:** A/B use 'low' (1K), C/D/E use 'high' (2.5K)
- **Leefgeld-based sorting:** Highest leefgeld appears first, shown as "Highest Leefgeld" badge

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Scenario cards render and display correctly
- Selection toggles work and persist to localStorage
- Edit button placeholder ready for Plan 02 (edit modal with live recalculation)
- Comparison table placeholder ready for Plan 03
- All SCEN-01, SCEN-02, SCEN-07 foundations in place

---
*Phase: 03-scenario-engine*
*Completed: 2026-01-30*
