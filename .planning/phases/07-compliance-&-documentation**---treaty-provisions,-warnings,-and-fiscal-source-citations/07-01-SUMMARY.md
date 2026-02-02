---
phase: 07-compliance-documentation
plan: 01
subsystem: compliance-ui
tags: [compliance, treaty, tax-residency, dietas, factura, collapsible-ui]

dependency-graph:
  requires:
    - 05-dashboard-ui (tab navigation system, CSS variables, formatEUR function)
  provides:
    - Compliance tab with 7 collapsible sections
    - Fiscal constants (DIETAS_LIMITS, TREATY_ARTICLE_4, ARTICLE_9_1_B, FACTURA_REQUIREMENTS)
    - Treaty tie-breaker explanation
    - Documentation requirements guidance
  affects:
    - 07-02 (warning banner, disclaimer)

tech-stack:
  added: []
  patterns:
    - CSS radio button tab (extended for 5th tab)
    - Collapsible sections with aria-expanded/aria-controls
    - Frozen fiscal constants pattern

key-files:
  created: []
  modified:
    - autonomo_dashboard.html

decisions:
  - id: compliance-section-structure
    choice: Button + aria-expanded pattern for collapsible sections
    rationale: Accessible, keyboard navigable, consistent with WCAG guidelines
  - id: action-phase-organization
    choice: Organize content by action (Before Travel, While Working, When Filing)
    rationale: Per CONTEXT.md decision - helps users understand "what to do when"
  - id: legal-plus-plain-language
    choice: Spanish legal text in blockquote + plain English summary
    rationale: Per CONTEXT.md - legal accuracy with accessibility

metrics:
  duration: 4 min
  completed: 2026-02-02
---

# Phase 07 Plan 01: Compliance Tab with Treaty Provisions Summary

Compliance tab with fiscal constants, treaty provisions, and documentation requirements - collapsible sections organized by action phase.

## What Was Built

### CSS Additions (Lines 116-297)
- Extended tab selectors for 5th tab (#tab-compliance)
- Added `.compliance-section` with collapsible behavior
- Added `.legal-text` blockquote styling with accent border
- Added `.fiscal-table` for dietas limits display
- Added `.tie-breaker-steps` with numbered counter CSS
- Added `.payment-warning` with negative color highlighting
- Added `.requirements-list` for factura field display

### HTML Structure (Lines 2091-2266)
- Added radio input `#tab-compliance`
- Added tab label "Compliance"
- Added panel section `#compliancePanel`

### JavaScript Constants (Lines 3529-3612)
```javascript
const DIETAS_LIMITS = Object.freeze({
  spain: { withOvernight: 53.34, withoutOvernight: 26.67 },
  abroad: { withOvernight: 91.35, withoutOvernight: 48.08 },
  source: 'Art. 9 Reglamento IRPF (RD 439/2007)'
});

const TREATY_ARTICLE_4 = Object.freeze({
  title: 'Article 4: Tax Residence Tie-Breaker',
  source: 'Spain-Belgium Tax Treaty (BOE-A-2003-13375)',
  steps: [/* 5 steps: Permanent Home, Center of Vital Interests, Habitual Abode, Nationality, Mutual Agreement */]
});

const ARTICLE_9_1_B = Object.freeze({
  title: 'Art. 9.1.b LIRPF: Family Presumption',
  source: 'Ley 35/2006, Art. 9.1.b (BOE-A-2006-20764)',
  legalText: '...',
  plainSummary: '...',
  implication: '...'
});

const FACTURA_REQUIREMENTS = Object.freeze({
  required: [/* 13 fields */],
  notValid: [/* 4 invalid types */]
});
```

### renderComplianceContent() Function (Lines 5551-5758)
- Renders 3 action-phase sections with h3 headers
- 7 collapsible sections with button+aria pattern
- Dynamic content from fiscal constants
- Event listeners for expand/collapse behavior

## Compliance Tab Content

### Before You Travel (1 section)
1. **Spain-Belgium Tax Treaty Overview** - Introduction to treaty purpose

### While Working in Belgium (3 sections)
2. **Dietas Limits** - Table showing Spain/Abroad rates with/without overnight
3. **Factura Completa Requirements** - 13 required fields + 4 invalid document types
4. **Electronic Payment Requirement** - Cash payment warning

### When Filing Taxes (3 sections)
5. **Treaty Tie-Breaker Rules** - 5-step hierarchy with numbered list
6. **Centro de Intereses Vitales** - Personal vs economic ties explanation
7. **Family Presumption (Art. 9.1.b)** - Spanish legal text + plain summary

## Verification Results

| Check | Result |
|-------|--------|
| Compliance tab visible in navigation | PASS |
| Tab clickable and shows content | PASS |
| 3 action-phase sections | PASS |
| 7 collapsible sections | PASS |
| Dietas table with 91.35/48.08 values | PASS |
| 13 factura required fields | PASS |
| 4 invalid document types | PASS |
| 5 treaty tie-breaker steps | PASS |
| Family presumption legal text | PASS |
| All source citations present | PASS |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 5f0789f | feat | Add Compliance tab with treaty provisions and documentation requirements |

## Files Modified

| File | Changes |
|------|---------|
| autonomo_dashboard.html | +532 lines (CSS, HTML, JavaScript) |

## Next Phase Readiness

**Ready for 07-02:**
- Compliance tab infrastructure complete
- Fiscal constants available for warning banner
- Source citation pattern established

**07-02 will add:**
- Warning banner triggered by calendar day count
- Global footer disclaimer
- Session-based warning dismissal
