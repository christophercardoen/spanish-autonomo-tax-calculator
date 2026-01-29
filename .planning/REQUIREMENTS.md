# Requirements: Spanish Autónomo Tax Calculator

**Defined:** 2026-01-29
**Core Value:** Accurate, real-time calculation of net monthly income after all taxes (RETA + IRPF), with Belgium work cost tracking and 183-day residency management

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Tax Calculations (CALC)

- [ ] **CALC-01**: Calculate annual IRPF using official 2025/2026 progressive brackets (19%, 24%, 30%, 37%, 45%, 47%)
- [ ] **CALC-02**: Apply mínimo personal (€5,550) in IRPF calculation
- [ ] **CALC-03**: Apply mínimo por descendientes (€2,400 for 1 daughter) in IRPF calculation
- [ ] **CALC-04**: Calculate 5% gastos de difícil justificación with €2,000 annual cap
- [ ] **CALC-05**: Apply 7% reducción rendimientos for generic SS expenses
- [ ] **CALC-06**: Use fixed RETA cuota of €428.40/month (€5,140.80/year) from registration
- [ ] **CALC-07**: Calculate effective tax rate (total tax / net income before tax)
- [ ] **CALC-08**: Calculate net monthly income after all taxes and deductions
- [ ] **CALC-09**: Calculate "leefgeld" (net income minus €1,727 private costs)
- [ ] **CALC-10**: Show annual and monthly breakdowns for all calculations

### Expense Tracking (EXP)

- [ ] **EXP-01**: Track Spain deductible business expenses (huur €346.50, GSM €27.50, elektriciteit €9.00/month)
- [ ] **EXP-02**: Track Belgium work costs (€1,000 or €2,500/month depending on pattern)
- [ ] **EXP-03**: Track non-deductible private expenses (€1,727/month total)
- [ ] **EXP-04**: Categorize expenses as deductible vs private in UI
- [ ] **EXP-05**: Display expense breakdown with calculation formulas visible (e.g., "€1,155 × 30%")

### Scenario Planning (SCEN)

- [ ] **SCEN-01**: Pre-configure 5 scenarios (A: €3K, B: €6K, C: €9K, D: €12K, E: €18K revenue)
- [ ] **SCEN-02**: Support two Belgium cost patterns (€1,000 for A/B, €2,500 for C/D/E)
- [ ] **SCEN-03**: Allow creation of custom scenarios with user-defined revenue/expenses
- [ ] **SCEN-04**: Allow live editing of any value in any scenario with auto-recalculation
- [ ] **SCEN-05**: Display all scenarios side-by-side in comparison table
- [ ] **SCEN-06**: Highlight/compare selected scenarios (dim others)
- [ ] **SCEN-07**: Show which scenario is "optimal" based on leefgeld after costs

### Belgium Calendar (CAL)

- [ ] **CAL-01**: Display interactive calendar for Feb-Dec 2026 (11 months)
- [ ] **CAL-02**: Allow toggling individual days between Belgium (🇧🇪), Spain (🇪🇸), Travel (✈️)
- [ ] **CAL-03**: Auto-count days per month in each location
- [ ] **CAL-04**: Calculate annual total days in Belgium vs Spain
- [ ] **CAL-05**: Show 183-day threshold warning when approaching or exceeding limit
- [ ] **CAL-06**: Pre-fill calendar with contracted pattern (Mon-Tue always, first week Wed-Fri)
- [ ] **CAL-07**: Visually distinguish contractual obligation days from flexible days
- [ ] **CAL-08**: Export calendar data (ICS, CSV, or copy to clipboard)
- [ ] **CAL-09**: Count entry/exit days correctly (warning that they count in BOTH countries)

### Dashboard UI (UI)

- [ ] **UI-01**: Professional financial dashboard aesthetic (Bloomberg-inspired, not generic AI)
- [ ] **UI-02**: Scenario cards with key metrics (revenue, expenses, taxes, net income)
- [ ] **UI-03**: Hover effects on scenario cards with subtle lift and border glow
- [ ] **UI-04**: Click to expand scenario cards for detailed breakdown
- [ ] **UI-05**: Comparison table with all metrics across scenarios
- [ ] **UI-06**: Sticky first column in comparison table for scrolling
- [ ] **UI-07**: Color-coding for positive (green), negative (red), warning (orange) values
- [ ] **UI-08**: Responsive design (desktop primary, mobile functional)
- [ ] **UI-09**: Tooltips on technical terms (hover for explanation)
- [ ] **UI-10**: Export functionality (print view, copy to clipboard)
- [ ] **UI-11**: Professional typography (DM Sans or similar, JetBrains Mono for numbers)
- [ ] **UI-12**: Dark theme with rich colors (not purple gradients on white)

### Excel Calculator (XLS)

- [ ] **XLS-01**: Create multi-sheet workbook (Overview + 5 scenario sheets)
- [ ] **XLS-02**: Overview sheet with all scenarios comparison table
- [ ] **XLS-03**: Individual sheets per scenario (A, B, C, D, E) with detailed breakdowns
- [ ] **XLS-04**: All calculations use Excel formulas (NO hardcoded calculated values)
- [ ] **XLS-05**: Professional styling with color-coded headers and borders
- [ ] **XLS-06**: Include expense breakdown tables on each sheet
- [ ] **XLS-07**: Include RETA and IRPF step-by-step calculations
- [ ] **XLS-08**: Workbook recalculates without errors (#REF!, #DIV/0!, #VALUE!, #NAME?)
- [ ] **XLS-09**: Currency formatting (€ #,##0.00 for decimals, € #,##0 for whole numbers)
- [ ] **XLS-10**: Percentage formatting (0.0%) for tax rates

### Compliance & Warnings (COMP)

- [ ] **COMP-01**: Display 183-day threshold warning when days in Belgium ≥ 183
- [ ] **COMP-02**: Show Spain-Belgium treaty tie-breaker provisions (Article 4)
- [ ] **COMP-03**: Explain "centro de intereses vitales" concept and how family situation helps
- [ ] **COMP-04**: Display Art. 9.1.b LIRPF family presumption text and implications
- [ ] **COMP-05**: List documentation requirements for expense deductibility
- [ ] **COMP-06**: Warning about factura completa requirement (not just tickets)
- [ ] **COMP-07**: Warning about electronic payment requirement (no cash for dietas)
- [ ] **COMP-08**: Disclaimer that tool provides calculations, not official tax advice
- [ ] **COMP-09**: Show dietas limits (€91.35/day with overnight, €48.08 without)
- [ ] **COMP-10**: Warning about entry/exit days counting in BOTH countries

### Data Verification (DATA)

- [ ] **DATA-01**: All fiscal data sourced from official 2025/2026 AEAT/BOE/Seguridad Social sources
- [ ] **DATA-02**: Source citations visible in UI (footnotes or info boxes)
- [ ] **DATA-03**: IRPF tramos match official 2025 brackets exactly
- [ ] **DATA-04**: Mínimos match official 2025/2026 amounts
- [ ] **DATA-05**: Dietas match official Reglamento IRPF rates

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Quarterly Modelo 130 calculation and payment tracking
- **ADV-02**: RETA regularization estimator (compare actual vs declared tramo)
- **ADV-03**: Monthly bank transaction import for expense tracking
- **ADV-04**: A1 certificate expiration tracking
- **ADV-05**: VeriFactu compliance checker (July 2026 requirement)
- **ADV-06**: Belgian IVA recovery (Modelo 360) tracker
- **ADV-07**: Historical data tracking (compare 2026 vs 2027)
- **ADV-08**: Multi-year projection (plan 2027-2028)
- **ADV-09**: PDF export of full tax analysis report
- **ADV-10**: Integration with gestor systems (API)

### Enhanced Calendar

- **CAL-11**: Calendar sync with Google Calendar / iCal
- **CAL-12**: Automatic travel expense calculation based on calendar days
- **CAL-13**: Dietas calculation per day based on overnight status
- **CAL-14**: Multi-year calendar (2026-2027)
- **CAL-15**: Calendar templates for different work patterns

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-country support | Spain-Belgium specific, not building general EU calculator |
| Automatic bank integration | Security/privacy concerns, manual input sufficient for v1 |
| IVA/VAT tracking | Focus on income tax (IRPF/RETA), not VAT compliance |
| Mobile native apps | Web-based responsive design sufficient |
| Multi-user accounts | Single-user tool for personal use |
| Gestor API integration | Standalone tool, not integrated with third-party systems |
| Real-time AEAT API | Official APIs not available for autonomos |
| AI-powered optimization | Rule-based calculations sufficient, no ML needed |
| Cryptocurrency income | Standard employment/consulting income only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 59 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 59 ⚠️

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after initial definition*
