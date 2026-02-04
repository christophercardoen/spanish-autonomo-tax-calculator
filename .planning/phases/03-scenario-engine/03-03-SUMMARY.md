---
phase: 03-scenario-engine
plan: 03
subsystem: ui
tags: [comparison-table, custom-scenarios, sticky-header, template-selection, vanilla-js]

# Dependency graph
requires:
  - phase: 03-02
    provides: Edit modal with live recalculation, scenario state management
  - phase: 03-01
    provides: Scenario presets, calculateScenarioResults, calculateFullIRPFWithFiscal
provides:
  - Side-by-side comparison table with full calculation breakdown
  - Sticky header row for comparison table
  - Optimal value highlighting (highest leefgeld, lowest tax rate)
  - Custom scenario creation from templates
  - "+ New Scenario" button in scenario cards area
affects: [04-belgium-calendar, 05-dashboard-ui, 06-excel-calculator]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Defensive property verification before rendering"
    - "Template selection dialog for cloning scenarios"
    - "CSS sticky positioning for table headers"

key-files:
  created: []
  modified:
    - autonomo_dashboard.html

key-decisions:
  - "renderComparisonTable with property verification - Defensive check for all 16 required properties with console.error logging"
  - "Metrics array pattern for table rows - Clean separation of row definitions from rendering logic"
  - "optimalMax/optimalMin flags on metrics - Flexible highlighting system for different optimal directions"
  - "Template dialog with radio options - Shows all existing scenarios as templates with preview info"
  - "structuredClone for scenario copying - Prevents accidental mutation of template scenario"

patterns-established:
  - "Property verification: Check results object has all required properties before rendering"
  - "Metrics array: Define table rows as array of {label, getValue, format, optimalMax?} objects"
  - "Template cloning: Create new scenarios via structuredClone + UUID + isPreset:false"

# Metrics
duration: 2min
completed: 2026-01-30
---

# Phase 03 Plan 03: Comparison Table Summary

**Side-by-side comparison table with sticky header, optimal value highlighting, and custom scenario creation from templates**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-30T13:05:22Z
- **Completed:** 2026-01-30T13:07:33Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Comparison table shows full calculation breakdown (25 metrics) for selected scenarios
- Sticky header row stays visible when scrolling vertically
- Optimal values highlighted in green (highest leefgeld, highest net monthly, lowest tax rate)
- "+ New Scenario" button creates custom scenarios from any existing scenario as template
- Custom scenarios persist to localStorage and can be edited/deleted

## Task Commits

Note: Directory is not a git repository - commits tracked conceptually:

1. **Task 1: Add comparison table CSS and HTML container** - (feat: add CSS for comparison table, sticky header, template dialog)
2. **Task 2: Implement renderComparisonTable function with property verification** - (feat: comparison table rendering with full breakdown)
3. **Task 3: Implement custom scenario creation with template selection** - (feat: template dialog and custom scenario creation)

## Files Created/Modified

- `autonomo_dashboard.html` - Added CSS for comparison table (sticky header, optimal highlighting, template dialog), renderComparisonTable function, template selection dialog HTML, showTemplateDialog/createCustomScenario functions

## Decisions Made

1. **Property verification in renderComparisonTable** - Defensive programming checks all 16 required properties exist in results object before rendering, with console.error for debugging if contract broken
2. **Metrics array pattern** - Clean separation between row definitions (label, getValue, format, optimalMax) and table rendering logic
3. **optimalMax/optimalMin flags** - Flexible system where some metrics are optimal when highest (leefgeld) and others when lowest (tax rate)
4. **Template dialog with radio selection** - Shows all existing scenarios as templates with revenue/expenses preview
5. **structuredClone for new scenarios** - Prevents accidental mutation of template; sets isPreset:false and fiscalOverrides:null on clone

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all implementations followed plan specifications.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 3 (Scenario Engine) is now complete with all requirements satisfied:
- SCEN-01: Pre-configured scenarios A-E with correct values
- SCEN-02: Scenario cards with horizontal scrolling, sorted by leefgeld
- SCEN-03: Side-by-side comparison table with full breakdown
- SCEN-04: Edit modal with live recalculation
- SCEN-05: Custom scenario creation with templates
- SCEN-06: Optimal value highlighting and badges
- SCEN-07: localStorage persistence for scenarios and selections

Ready for Phase 4 (Belgium Calendar) - the scenario engine provides the foundation for tracking Belgium work days and their impact on scenarios.

---
*Phase: 03-scenario-engine*
*Completed: 2026-01-30*
