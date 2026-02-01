# Phase 5: Dashboard UI - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Professional financial dashboard aesthetic that integrates all calculator features (fiscal calculations from Phase 1, expense tracking from Phase 2, scenario comparison from Phase 3, Belgium calendar from Phase 4). This phase focuses on visual presentation, layout, and interaction patterns — not new calculation logic.

</domain>

<decisions>
## Implementation Decisions

### Visual hierarchy and layout
- **First view:** Scenario overview grid — all scenarios (A-E) visible as cards immediately
- **Layout structure:** Tabbed sections (Scenarios | Calendar | Expenses | Details) — one active at a time, clean separation
- **Responsive design:** Fully responsive — different layouts for desktop/tablet/mobile with mobile getting simplified views
- **Comparison table placement:** Part of Scenarios tab — scenario cards at top, comparison table below, toggle which scenarios to compare

### Scenario card design
- **Card content:** Full breakdown preview — all major line items visible on card (tall cards but complete picture)
- **Optimal highlighting:** Badge or star icon in top corner (small ★ Optimal badge), otherwise same styling as other cards
- **Click interaction:** Opens edit modal — full-screen modal with all fields editable (Phase 3 pattern)
- **Hover effects:** Lift and glow — card lifts slightly (translateY), adds subtle shadow/glow (Bloomberg style)

### Comparison table behavior
- **Sticky columns:** First column + one scenario — metric names + selected reference scenario stay visible, others scroll
- **Scenario selection:** Checkboxes on cards — checked scenarios appear in comparison table
- **Mobile adaptation:** Transpose to vertical — each scenario becomes a section with vertical metrics list, scroll down instead of horizontal
- **Value highlighting:** Yes, same as Phase 3 — highest leefgeld green, lowest tax rate green, clear visual guidance

### Color system and typography
- **Dark theme palette:** Charcoal (#1a1a1a) background — very dark gray with slight warmth, Bloomberg/financial terminal style
- **Color rules:** Semantic meaning — green = positive/income, red = negative/expense, orange = warning thresholds
- **Number formatting:** Always 2 decimals — €1,234.56 for consistent precision on all EUR amounts
- **Font hierarchy:** Balanced — Headers: 20px, Numbers: 18px, Labels: 14px (moderate variation balancing readability with density)

### Claude's Discretion
- Exact spacing and padding values
- Animation timing and easing functions
- Card shadow and glow intensity
- Tab transition behavior
- Export button placement and styling

</decisions>

<specifics>
## Specific Ideas

- "Bloomberg-inspired" aesthetic — professional financial terminal look, not generic AI gradients
- DM Sans for UI text, JetBrains Mono for numbers (specified in CLAUDE.md)
- Lift and glow on hover matches Bloomberg card interactions
- Tabbed layout ensures clean focus on one feature at a time
- Full breakdown on cards means users can compare at a glance without clicking

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (visual presentation of existing features, not new capabilities)

</deferred>

---

*Phase: 05-dashboard-ui*
*Context gathered: 2026-02-01*
