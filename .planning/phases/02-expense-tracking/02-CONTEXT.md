# Phase 2: Expense Tracking - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Input and categorization of business expenses (Spain deductible, Belgium work costs) vs private expenses, with formula visibility for transparency. Users can see exactly how deductions are calculated and adjust values to match their situation.

</domain>

<decisions>
## Implementation Decisions

### Input mechanism
- Pre-filled with default expenses (huur €1,155, GSM €55, elektriciteit €100, auto €600, verzekeringen €200, Belgium costs)
- Users can add NEW expense categories beyond the pre-filled ones
- All deduction percentages are editable (not just amounts)
- When adding new expense, user provides: name, amount, category, deduction %
- Basic validation only (prevent negative, non-numeric; no strict range enforcement)
- Users can delete any expense (including pre-filled ones)
- Expense data persists between sessions (localStorage)
- Include 'Reset to defaults' button to restore original values

### Formula display
- Formulas display inline with each expense line
- Show formulas for ALL expenses, including 0% deduction (e.g., "Auto: €600 × 0% = €0")
- Display both monthly AND annual values: "€1,155 × 30% = €346.50/month (€4,158/year)"
- Show summary totals: total Spain deductible, total Belgium costs, total private

### Belgium pattern switching
- Toggle switch control: 'Low travel (€1K) / High travel (€2.5K)'
- Toggle updates Belgium breakdown (e.g., '€2,500: ~17 days dietas + 4 flights')
- Belgium cost value is editable after switching patterns (not locked to €1K/€2.5K)
- Toggle positioned inline next to Belgium expense line (not at top of section)

### Categorization display
- Organize expenses into three separate sections: 'Spain Deductible', 'Belgium Work Costs', 'Private Expenses'
- Add color accent to section headers (subtle border/icon/background color for quick scanning)
- Category dropdown options: Spain Deductible / Belgium Travel / Belgium Dietas / Private (granular)
- Each section shows subtotal line at bottom (per-category totals)

### Claude's Discretion
- Exact color scheme for category accents (should align with financial dashboard aesthetic)
- localStorage key naming and data structure
- Error messaging for validation failures
- Animation/transition effects when switching Belgium patterns
- Section ordering (Spain → Belgium → Private, or different sequence)

</decisions>

<specifics>
## Specific Ideas

- Belgium breakdown formula should be transparent: "~17 days × €91.35 dietas + 4 flights × €250 ≈ €2,500"
- Reset button should require confirmation to prevent accidental data loss
- Persist user preference for Belgium pattern (Low/High) between sessions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-expense-tracking*
*Context gathered: 2026-01-29*
