# Roadmap: Spanish Autonomo Tax Calculator

## Overview

This roadmap delivers a single-file HTML tax calculator with Excel export for a Spanish autonomo working cross-border with Belgium. The journey progresses from accurate fiscal calculations (IRPF, RETA, deductions) through expense tracking and scenario comparison, to an interactive Belgium work calendar with 183-day residency management. Each phase builds on the previous, culminating in a professional financial dashboard with compliance warnings and treaty documentation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3...): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Fiscal Foundation** - Core IRPF/RETA calculations with verified 2025/2026 rates
- [ ] **Phase 2: Expense Tracking** - Spain deductible and Belgium work cost categorization
- [ ] **Phase 3: Scenario Engine** - Pre-configured scenarios (A-E) with live editing and comparison
- [ ] **Phase 4: Belgium Calendar** - Interactive Feb-Dec 2026 calendar with 183-day tracking
- [ ] **Phase 5: Dashboard UI** - Professional financial dashboard with Bloomberg-inspired aesthetics
- [ ] **Phase 6: Excel Calculator** - Multi-sheet workbook with formulas, not hardcoded values
- [ ] **Phase 7: Compliance & Documentation** - Treaty provisions, warnings, and fiscal source citations

## Phase Details

### Phase 1: Fiscal Foundation
**Goal**: Accurate IRPF and RETA calculations using official 2025/2026 Spanish fiscal data
**Depends on**: Nothing (first phase)
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07, CALC-08, CALC-09, CALC-10, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. User enters gross monthly revenue and sees correct annual IRPF using progressive brackets (19%-47%)
  2. RETA deduction of 428.40 EUR/month appears correctly in calculations
  3. Minimo personal (5,550 EUR) and minimo por descendientes (2,400 EUR) reduce taxable base correctly
  4. 5% gastos de dificil justificacion applies with 2,000 EUR annual cap visible
  5. All fiscal data shows source citations (AEAT/BOE references) in the UI
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md - Core IRPF/RETA calculation engine with 4-phase minimo method
- [x] 01-02-PLAN.md - Source citations and official references in UI

### Phase 2: Expense Tracking
**Goal**: User can input and categorize business expenses vs private costs
**Depends on**: Phase 1
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04, EXP-05, DATA-05
**Success Criteria** (what must be TRUE):
  1. Spain deductible expenses display with formulas visible (e.g., "huur 1,155 EUR x 30% = 346.50 EUR")
  2. Belgium work costs switchable between 1,000 EUR and 2,500 EUR monthly patterns
  3. Private expenses (1,727 EUR/month) tracked separately and excluded from deductions
  4. Each expense shows clear "deductible" or "private" categorization
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md - Expense data system with localStorage and Belgium toggle
- [ ] 02-02-PLAN.md - Expense UI sections and Phase 1 integration

### Phase 3: Scenario Engine
**Goal**: User can compare multiple income scenarios side-by-side with live editing
**Depends on**: Phase 1, Phase 2
**Requirements**: SCEN-01, SCEN-02, SCEN-03, SCEN-04, SCEN-05, SCEN-06, SCEN-07
**Success Criteria** (what must be TRUE):
  1. Five pre-configured scenarios (A: 3K, B: 6K, C: 9K, D: 12K, E: 18K) load with correct defaults
  2. User can edit any value in any scenario and all derived values recalculate instantly
  3. User can create custom scenarios with arbitrary revenue/expense values
  4. Comparison table shows all scenarios side-by-side with highlighting for selected scenarios
  5. Optimal scenario (highest leefgeld) is visually indicated
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Belgium Calendar
**Goal**: User can track and manage Belgium presence days with 183-day threshold awareness
**Depends on**: Nothing (independent feature)
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, CAL-07, CAL-08, CAL-09
**Success Criteria** (what must be TRUE):
  1. Calendar displays Feb-Dec 2026 with clickable days
  2. User can toggle any day between Belgium (flag), Spain (flag), or Travel (plane icon)
  3. Monthly and annual day counts update automatically when days are toggled
  4. Warning appears when Belgium days reach or exceed 183-day threshold
  5. Contracted work pattern (Mon-Tue weekly, first-week Wed-Fri) pre-fills and shows as distinct from flexible days
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Dashboard UI
**Goal**: Professional financial dashboard aesthetic that integrates all calculator features
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08, UI-09, UI-10, UI-11, UI-12
**Success Criteria** (what must be TRUE):
  1. Dashboard uses dark theme with professional typography (DM Sans/JetBrains Mono) and no generic AI design
  2. Scenario cards show key metrics with hover effects (lift/glow) and expand on click for details
  3. Comparison table has sticky first column for horizontal scrolling
  4. Color-coding: green for positive values, red for negative, orange for warnings
  5. User can export data (print view, copy to clipboard)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Excel Calculator
**Goal**: Professional Excel workbook that recalculates correctly with no hardcoded values
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: XLS-01, XLS-02, XLS-03, XLS-04, XLS-05, XLS-06, XLS-07, XLS-08, XLS-09, XLS-10
**Success Criteria** (what must be TRUE):
  1. Workbook contains Overview sheet plus 5 individual scenario sheets (A-E)
  2. All calculated values use Excel formulas (changing an input recalculates dependent cells)
  3. Workbook opens without errors (#REF!, #DIV/0!, #VALUE!, #NAME?)
  4. Currency formatting (EUR #,##0.00) and percentage formatting (0.0%) applied consistently
  5. Step-by-step RETA and IRPF calculations visible on each scenario sheet
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Compliance & Documentation
**Goal**: User understands fiscal compliance obligations and residency defense provisions
**Depends on**: Phase 4 (calendar for 183-day context)
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10
**Success Criteria** (what must be TRUE):
  1. 183-day warning displays prominently when calendar shows Belgium days >= 183
  2. Spain-Belgium treaty Article 4 tie-breaker provisions explained in accessible language
  3. Centro de intereses vitales concept explained with how family situation helps residency defense
  4. Expense documentation requirements listed (factura completa, electronic payment for dietas)
  5. Clear disclaimer that tool provides calculations, not official tax advice
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fiscal Foundation | 2/2 | Complete | 2026-01-29 |
| 2. Expense Tracking | 2/2 | Complete | 2026-01-29 |
| 3. Scenario Engine | 0/2 | Ready | - |
| 4. Belgium Calendar | 0/2 | Not started | - |
| 5. Dashboard UI | 0/3 | Not started | - |
| 6. Excel Calculator | 0/2 | Not started | - |
| 7. Compliance & Documentation | 0/2 | Not started | - |
