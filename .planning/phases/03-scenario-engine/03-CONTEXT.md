# Phase 3: Scenario Engine - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Side-by-side comparison of multiple income scenarios with live editing and instant recalculation. Users can examine pre-configured scenarios (A-E) and create custom scenarios to find optimal income strategies. Scenarios show revenue, expenses, taxes (IRPF, RETA), and final leefgeld (net income).

</domain>

<decisions>
## Implementation Decisions

### Scenario presentation & layout
- Horizontal card layout (side-by-side), scroll horizontally if needed
- Bloomberg/trading dashboard style
- Each card shows: scenario name, monthly revenue, total expenses, IRPF, RETA, leefgeld
- Summary with breakdown visible on card (not just key metrics, not full calculation)
- Selected scenarios show comparison deltas in comparison table (not on hover, not automatic)

### Editing & interaction model
- Edit button on card opens modal/dialog for editing
- Modal shows split view: inputs on left, live calculated results on right
- Instant recalculation as user types (not on blur, not on save)
- ALL values editable including fiscal data (IRPF brackets, RETA, mínimos) for what-if analysis
- User can override any fiscal constant, not just revenue/expenses

### Comparison & selection
- Checkbox on each card for selection
- Comparison table appears when scenarios selected
- Full calculation breakdown in table: gross, deductions, base imponible, minimos, cuota, leefgeld (every step)
- Optimal scenario (highest leefgeld) indicated by sort order only
- Scenarios auto-sort by leefgeld, highest first
- Sticky header row (scenario names) for vertical scrolling, not sticky first column

### Custom scenario creation
- "+ New" button → choose scenario to copy from (A-E or other custom), then modify
- User must provide scenario name (required field, e.g., "Aggressive Growth", "Safe Path")
- Custom scenarios save to localStorage automatically (persist across sessions)
- Delete available from both card (X/trash icon with confirmation) and edit modal (Delete button)

### Claude's Discretion
- Visual distinction between pre-configured (A-E) and custom scenarios
- Exact spacing, typography, card shadows
- Confirmation dialog text for deletions
- Loading states during recalculation
- Error handling for invalid inputs
- Maximum number of custom scenarios (if any limit needed)

</decisions>

<specifics>
## Specific Ideas

- Bloomberg-inspired financial dashboard aesthetic (from CLAUDE.md)
- Dark theme with DM Sans (UI) and JetBrains Mono (numbers) fonts
- Phase 1 (IRPF/RETA engine) and Phase 2 (expense tracking) already built
- Split view modal: user sees impact immediately while editing

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-scenario-engine*
*Context gathered: 2026-01-30*
