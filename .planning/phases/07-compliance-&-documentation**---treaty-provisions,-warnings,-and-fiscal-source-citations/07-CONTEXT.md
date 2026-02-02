# Phase 7: Compliance & Documentation - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 delivers compliance warnings (183-day threshold), Spain-Belgium treaty tie-breaker provisions, family residency defense explanation (Art. 9.1.b LIRPF), expense documentation requirements, dietas limits, and disclaimer. This clarifies tax obligations and protection strategies, not calculations (Phase 1) or data entry (Phases 2-4).

</domain>

<decisions>
## Implementation Decisions

### Warning Presentation
- Trigger at thresholds: 170, 180, 183 Belgium days (consistent with Phase 4 calendar logic)
- Dismissable per session: user can close warning, returns on page reload
- Factual/neutral tone: "You have 183 Belgium days. Treaty provisions may apply." - informational, not alarming
- Banner at top of page: horizontal bar visible across all tabs when threshold met

### Treaty Explanation Depth
- Legal + plain language: show official article text with accessible summary
- Inline citations: "Article 4(2)(a) states..." - citations visible in text flow
- Focus on relevant provisions: emphasize center of vital interests (family defense) since that's strongest for this case
- Generic examples: "A person with family in Spain..." rather than user-specific "Your partner and daughter..."

### Documentation Guidance Format
- All three integrated: narrative intro → checklist for quick reference → detailed examples
- Detailed examples: show actual invoice field requirements with annotations
- Dietas: limits + categories - state €91.35/€48.08 amounts and list what counts (meals, transport, accommodation)
- Common pitfalls highlighted: e.g., "Airbnb confirmation is NOT a factura completa"

### Content Organization
- Dedicated Compliance tab: new tab in existing system (Scenarios/Calendar/Expenses/Details/Compliance)
- By action structure: "Before You Travel", "While Working in Belgium", "When Filing Taxes"
- Collapsible sections: click section header to expand/collapse - reduces initial overwhelming
- Disclaimer in footer: appears on every tab, not just Compliance tab

### Claude's Discretion
- Exact visual styling of warning banner (color, icon, dismiss button placement)
- Article numbering format (Article 4(2)(a) vs Art. 4.2.a)
- Specific invoice field examples to highlight
- Section icon choices and typography hierarchy

</decisions>

<specifics>
## Specific Ideas

- Warning tone example: "You have 183 Belgium days. Treaty provisions may apply." (not "⚠️ Warning: Exceeding 183 days...")
- Treaty structure: Official article text in blockquote + plain summary below
- Documentation progression: Short narrative → bulleted checklist → detailed invoice example with field annotations
- Action-based sections help user understand "what to do when" rather than abstract legal concepts

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 07-compliance-&-documentation*
*Context gathered: 2026-02-02*
