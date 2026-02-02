# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Accurate, real-time calculation of net monthly income after all taxes (RETA + IRPF), with Belgium work cost tracking and 183-day residency management
**Current focus:** Phase 6 - Excel Calculator (COMPLETE)

## Current Position

Phase: 6 of 7 (Excel Calculator)
Plan: 3 of 3 in current phase (COMPLETE)
Status: Phase complete
Last activity: 2026-02-02 - Completed 06-03-PLAN.md (Overview Sheet & Finalization)

Progress: [██████████] 100% (Phase 6)
Overall: [█████████░] 95% (Project)

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 3.5 min
- Total execution time: 55 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-fiscal-foundation | 2 | 7 min | 3.5 min |
| 02-expense-tracking | 2 | 7 min | 3.5 min |
| 03-scenario-engine | 3 | 6 min | 2 min |
| 04-belgium-calendar | 3 | 11 min | 3.7 min |
| 05-dashboard-ui | 3 | 16 min | 5.3 min |
| 06-excel-calculator | 3 | 8 min | 2.7 min |

**Recent Trend:**
- Last 5 plans: 05-03 (5 min), 06-01 (2 min), 06-02 (2 min), 06-03 (4 min)
- Trend: Consistent fast execution for Excel plans

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
| Day picker uses native dialog | HTML5 dialog provides focus trap, backdrop, Esc handling natively | 04-02 |
| Shift-click for range selection | Familiar UX pattern from spreadsheets and file managers | 04-02 |
| Conservative threshold counting | Belgium + Travel both count toward 183 days for compliance safety | 04-02 |
| Deferred save workflow | Allows experimentation before committing; prevents accidental changes | 04-02 |
| Warning at 170/180/183 | Tiered warnings give time to adjust before exceeding threshold | 04-02 |
| ICS follows RFC 5545 | Standard format ensures compatibility with major calendar apps | 04-03 |
| CSV includes summary section | Users can quickly see threshold status without counting rows | 04-03 |
| Notification auto-hides after 3s | Long enough to read, short enough to not be intrusive | 04-03 |
| Entry/exit tooltip references treaty | Provides legal basis for conservative counting approach | 04-03 |
| Belgian holidays as reference only | User should make conscious decision about each holiday | 04-03 |
| DM Sans + JetBrains Mono typography | Bloomberg-inspired professional financial aesthetic per CONTEXT.md | 05-01 |
| CSS radio button tabs | No JS required, instant switching, keyboard accessible | 05-01 |
| Charcoal #1a1a1a background | Pure neutral, avoids purple tint per CONTEXT.md | 05-01 |
| Semantic color variables | Consistent usage: green=positive, red=negative, orange=warning, blue=belgium | 05-01 |
| 320px card width for full breakdown | Wider cards allow full breakdown display without scrolling within card | 05-02 |
| 4-section detail modal | Organized breakdown: Income -> Expenses -> Taxes -> Net Result | 05-02 |
| Z-index hierarchy 99/100/101 | First column (99), header (100), corner cell (101) prevents overlap issues | 05-02 |
| Optimal overrides color class | When a value is optimal, it uses accent green instead of positive/negative color | 05-02 |
| TOOLTIPS constant with 8 terms | Covers all key tax terminology used in calculator | 05-03 |
| role=tooltip ARIA pattern | Keyboard accessible tooltips per WCAG 1.4.13 | 05-03 |
| Escape key dismisses tooltips | Standard accessibility pattern for dismissable content | 05-03 |
| @media print with landscape | Comparison table fits better in landscape orientation | 05-03 |
| 600px mobile breakpoint | Standard mobile threshold for vertical layout | 05-03 |
| Vertical comparison blocks on mobile | Horizontal table unreadable on small screens | 05-03 |
| Workbook-scoped named ranges | Absolute references ($B$5) ensure names work from all sheets | 06-01 |
| English formula syntax | ExcelJS requires commas, not semicolons (RETA_MONTHLY*12) | 06-01 |
| RETA Annual uses formula | Demonstrates formula-based approach for scenario sheets | 06-01 |
| Source notes in Constants sheet | Embedded notes for 2027 update guidance | 06-01 |
| 6-section sheet structure | INPUTS, ANNUAL, GASTOS DIFICIL, BRACKETS, MINIMO, RESULTS | 06-02 |
| Light blue fill for input cells | FFE0F0FF distinguishes editable from calculated cells | 06-02 |
| Simplified minimo tax calculation | Minimos (7,950) fall in first bracket, so B40*0.19 is accurate | 06-02 |
| Conditional formatting thresholds | Leefgeld <0 red, 0-500 orange, >=500 green; Tax >40% red, 30-40% orange, <30% green | 06-02 |
| Dutch localization for Excel | User requirement for Dutch-speaking workflow | 06-03 |
| Flexible input cells (no dropdowns) | All costs are variable; user needs to model any scenario freely | 06-03 |
| Cross-sheet formula pattern | ='Scenario X - YK'!BNN format for consistent references | 06-03 |

### Pending Todos

- Phase 7: Compliance & Documentation (10 requirements)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-02T11:40:01Z
Stopped at: Completed 06-03-PLAN.md (Overview Sheet & Finalization)
Resume file: None

## Key Files Created

| File | Purpose |
|------|---------|
| autonomo_dashboard.html | Core IRPF/RETA calculation + expense tracking + scenario cards + edit modal + comparison table + calendar grid with exports + tooltips + responsive layout |
| scripts/package.json | Node.js project configuration with ExcelJS dependency |
| scripts/generate-excel.js | Excel workbook generator with Constanten + Overzicht + 5 scenario sheets (Dutch localized) |
| autonomo_calculator.xlsx | Generated workbook with Overzicht + Scenarios A-E + Constanten (Dutch labels) |
| .planning/phases/01-fiscal-foundation/01-01-SUMMARY.md | Plan 01-01 execution summary |
| .planning/phases/01-fiscal-foundation/01-02-SUMMARY.md | Plan 01-02 execution summary |
| .planning/phases/02-expense-tracking/02-01-SUMMARY.md | Plan 02-01 execution summary |
| .planning/phases/02-expense-tracking/02-02-SUMMARY.md | Plan 02-02 execution summary |
| .planning/phases/03-scenario-engine/03-01-SUMMARY.md | Plan 03-01 execution summary |
| .planning/phases/03-scenario-engine/03-02-SUMMARY.md | Plan 03-02 execution summary |
| .planning/phases/03-scenario-engine/03-03-SUMMARY.md | Plan 03-03 execution summary |
| .planning/phases/04-belgium-calendar/04-01-SUMMARY.md | Plan 04-01 execution summary |
| .planning/phases/04-belgium-calendar/04-02-SUMMARY.md | Plan 04-02 execution summary |
| .planning/phases/04-belgium-calendar/04-03-SUMMARY.md | Plan 04-03 execution summary |
| .planning/phases/05-dashboard-ui/05-01-SUMMARY.md | Plan 05-01 execution summary |
| .planning/phases/05-dashboard-ui/05-02-SUMMARY.md | Plan 05-02 execution summary |
| .planning/phases/05-dashboard-ui/05-03-SUMMARY.md | Plan 05-03 execution summary |
| .planning/phases/06-excel-calculator/06-01-SUMMARY.md | Plan 06-01 execution summary |
| .planning/phases/06-excel-calculator/06-02-SUMMARY.md | Plan 06-02 execution summary |
| .planning/phases/06-excel-calculator/06-03-SUMMARY.md | Plan 06-03 execution summary |

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

## Phase 4 Complete

Phase 4 (Belgium Calendar) delivered:
- Calendar data system with localStorage persistence (CAL-01)
- Month grid rendering with Monday-start week alignment (CAL-02)
- Navigation between Feb-Dec 2026 (CAL-02)
- Contracted pattern wizard for first-time setup (CAL-04)
- C badge display for contracted days (CAL-04)
- Status colors: Belgium (blue), Spain (green), Travel (orange) (CAL-03)
- Day picker dialog opens on day click (CAL-05)
- Status options: Belgium, Spain, Travel, Unset (CAL-05)
- Monthly and annual count displays (CAL-06)
- Warning thresholds at 170/180/183 days (CAL-06)
- Shift-click bulk selection for range operations (CAL-07)
- Save workflow with unsaved changes indicator (CAL-07)
- ICS export for Google Calendar/Outlook (CAL-08)
- CSV export with summary statistics (CAL-08)
- Clipboard copy with notification (CAL-08)
- Entry/exit day documentation via tooltip (CAL-09)
- Belgian Public Holidays 2026 reference (CAL-09)
- All CAL-01 through CAL-09 requirements satisfied

## Phase 5 Complete

Phase 5 (Dashboard UI) delivered:
- Google Fonts loaded (DM Sans + JetBrains Mono) (UI-11)
- CSS variables for theme colors and typography
- Charcoal #1a1a1a background (not purple-tinted)
- Tabbed layout with 4 tabs: Scenarios, Calendar, Expenses, Details (UI-12)
- CSS radio button tabs (no JS, instant switching)
- Dashboard header with title and subtitle
- All sections reorganized into tab panels
- Scenario cards enhanced to 320px with full breakdown (UI-02)
- Stronger hover effects: -4px lift with green glow (UI-03)
- Click-to-expand detail modal with 4 sections (UI-04)
- Sticky first column in comparison table with z-index hierarchy (UI-06)
- Semantic color-coding: positive (green), negative (red), warning (orange) (UI-07)
- Accessible ARIA tooltips for 8 technical terms (UI-09)
- Print stylesheet with light theme for PDF export (UI-10)
- Clipboard copy for comparison table (UI-10)
- Responsive mobile layout with vertical comparison blocks (UI-08)
- All UI-01 through UI-12 requirements satisfied

## Phase 6 Complete

Phase 6 (Excel Calculator) delivered:
- Node.js project with ExcelJS dependency (06-01)
- Constanten sheet with named ranges: RETA_MONTHLY, RETA_ANNUAL, MINIMO_PERSONAL, MINIMO_DESCENDIENTES, GASTOS_DIFICIL_RATE, GASTOS_DIFICIL_MAX, PRIVATE_COSTS (06-01)
- IRPF brackets reference table (6 brackets) (06-01)
- createScenarioSheet function with 6-section template (06-02)
- All 5 scenarios (A-E) with correct preset values and Belgium patterns (06-02)
- Step-by-step IRPF bracket rows and 4-phase minimo visible (06-02)
- Conditional formatting on leefgeld and effective tax rate (06-02)
- Overzicht sheet with comparison table and hyperlink navigation (06-03)
- Cross-sheet formulas pulling values from all scenarios (06-03)
- Complete Dutch localization of all labels and text (06-03)
- Flexible input cells (no restrictive dropdowns) (06-03)
- Print layouts and sheet protection (06-03)
- All XLS-01 through XLS-10 requirements satisfied

## Next Phase

**Phase 7: Compliance & Documentation**
- 183-day warnings
- Spain-Belgium treaty tie-breaker provisions
- Centro de intereses vitales explanation
- Art. 9.1.b LIRPF family presumption
- Documentation requirements (factura completa, electronic payment)
- Dietas limits
- Disclaimer

Ready to start Phase 7.
