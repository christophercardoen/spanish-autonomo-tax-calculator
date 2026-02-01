# Phase 6: Excel Calculator - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-sheet Excel workbook (.xlsx) with Overview + 5 scenario sheets (A-E) that recalculates Spanish autónomo taxes using formulas. Users can experiment with revenue/expense values and see immediate IRPF/RETA/net income updates. NOT a static report - a live calculation tool.

</domain>

<decisions>
## Implementation Decisions

### Sheet organization
- Overview sheet shows summary section at top + comparison table below
- Navigation: Both clickable hyperlinks on Overview AND descriptive tab names (e.g., "Scenario A - €3K")
- Each scenario sheet shows full step-by-step calculation breakdown (all phases visible)
- Scenario sheets fully editable - users can change revenue, expenses, Belgium costs and formulas recalculate

### Formula visibility
- Progressive IRPF brackets: Step-by-step rows (one row per bracket: range, taxable in bracket, rate, tax)
- 4-phase mínimo calculation: All phases shown (base → personal 5,550 → descendientes 2,400 → base after → cuota íntegra → cuota diferencial)
- Expense deductions: Three columns (base amount, percentage, result) so formula structure is visible
- Fiscal constants: Separate Constants sheet with named ranges (RETA_MONTHLY, MINIMO_PERSONAL, etc.)

### Input design
- Input cells: Color-coded background (light blue for inputs, white/gray for calculated)
- Input location: Top section of each scenario sheet (first 5-10 rows for revenue, expenses, Belgium pattern)
- Data validation on key inputs (Belgium pattern dropdown 1000/2500, revenue >0)
- Overview sheet: Editable inputs that sync to scenario sheets (change revenue in Overview comparison, it updates that scenario's sheet)

### Styling approach
- Professional presentation level (clean grid, good fonts, subtle colors - financial report quality)
- Color scheme matches HTML dashboard (green=positive, red=negative, orange=warning, blue=Belgium)
- Conditional formatting for dynamic warnings (high tax rate, low leefgeld thresholds)
- Print-ready optimization (page breaks, headers/footers, landscape for comparison, fits standard pages)

### Claude's Discretion
- Exact Excel formula syntax (SUM vs manual addition where appropriate)
- Column widths and row heights for optimal readability
- Header/footer content for print layout
- Specific conditional formatting thresholds
- Named range naming conventions

</decisions>

<specifics>
## Specific Ideas

- "I want to be able to tweak a scenario right in the Overview table and see it update"
- Constants sheet approach allows changing 2027 tax rates in one place when new year arrives
- Three-column expense formula makes the deduction math transparent (audit-friendly)
- All 4 mínimo phases visible so accountant can verify AEAT methodology

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 06-excel-calculator*
*Context gathered: 2026-02-01*
