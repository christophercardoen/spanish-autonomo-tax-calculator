# Phase 7: Compliance & Documentation - Research

**Researched:** 2026-02-02
**Domain:** Tax compliance information, treaty provisions, expense documentation, legal disclaimers
**Confidence:** HIGH

## Summary

Phase 7 delivers compliance warnings, treaty explanations, documentation requirements, and disclaimers to the existing autonomo_dashboard.html. The phase is primarily content-focused (legal/fiscal text) with UI integration into the existing dashboard framework. No new technical dependencies are required - the implementation uses the existing vanilla JavaScript/HTML structure with CSS styling already established in Phases 4-5.

The research confirms that all substantive fiscal content already exists in the project's research files (TREATY.md, DEDUCTIONS.md, PITFALLS.md, FISCAL_DATA.md). Phase 7 synthesizes this into user-facing content with appropriate UI patterns. Key implementation decisions from CONTEXT.md constrain the approach: dedicated Compliance tab, collapsible sections, action-based structure ("Before You Travel", "While Working in Belgium", "When Filing Taxes"), and dismissable warnings.

**Primary recommendation:** Create a new Compliance tab with collapsible sections presenting verified treaty text (Article 4, Article 9.1.b LIRPF) alongside plain-language explanations, plus documentation checklists with factura completa requirements, dietas limits, and electronic payment warnings. Add global footer disclaimer visible on all tabs.

## Standard Stack

This phase adds no new dependencies. It uses the existing project infrastructure.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JavaScript | ES6+ | UI interactions (collapsible sections, warning dismiss) | Already used in Phases 1-6 |
| Vanilla CSS | CSS3 | Styling for compliance content | Already established in Phase 5 |
| HTML5 | - | Semantic structure for accessibility | Project constraint per CLAUDE.md |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage API | - | Persist warning dismissal per session | For 183-day warning dismiss state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom accordion | details/summary HTML5 | details/summary has native accessibility but less styling control; custom matches Phase 5 patterns |

**Installation:**
```bash
# No installation required - all vanilla HTML/CSS/JS
```

## Architecture Patterns

### Recommended Content Structure
```
Compliance Tab
├── Warning Banner (conditional)           # Displayed when Belgium days >= 170
├── Section: Before You Travel            # A1 certificate, tax residence cert
│   ├── Collapsible: Documentation Checklist
│   └── Collapsible: Treaty Overview
├── Section: While Working in Belgium     # Dietas, factura completa, payment
│   ├── Collapsible: Expense Documentation
│   ├── Collapsible: Dietas Limits
│   └── Collapsible: Electronic Payment
├── Section: When Filing Taxes            # 183-day rule, residency defense
│   ├── Collapsible: 183-Day Threshold
│   ├── Collapsible: Treaty Tie-Breaker (Article 4)
│   └── Collapsible: Family Presumption (Art. 9.1.b)
└── Footer: Disclaimer                    # Visible on ALL tabs
```

### Pattern 1: Collapsible Section
**What:** Click-to-expand sections that reduce initial overwhelm per CONTEXT.md
**When to use:** All compliance content sections
**Example:**
```html
<!-- Source: Existing dashboard accordion pattern -->
<div class="compliance-section collapsible">
  <button class="section-header" aria-expanded="false" aria-controls="content-treaty">
    <span class="section-icon">+</span>
    <span class="section-title">Spain-Belgium Tax Treaty (Article 4)</span>
  </button>
  <div class="section-content" id="content-treaty" hidden>
    <blockquote class="legal-text">
      <!-- Official treaty text -->
    </blockquote>
    <div class="plain-summary">
      <!-- Accessible explanation -->
    </div>
  </div>
</div>
```

### Pattern 2: Warning Banner (Dismissable)
**What:** Horizontal banner at top of page when Belgium days >= threshold
**When to use:** Triggered by calendar data (already tracked in Phase 4)
**Example:**
```html
<!-- Source: Phase 4 warning banner pattern, enhanced per CONTEXT.md -->
<div id="complianceWarningBanner" class="compliance-warning-banner" role="alert">
  <span class="warning-text">
    You have 183 Belgium days. Treaty provisions may apply.
  </span>
  <button class="dismiss-btn" aria-label="Dismiss warning">
    &times;
  </button>
</div>
```

### Pattern 3: Legal Quote + Plain Summary
**What:** Official legal text in blockquote, followed by accessible explanation
**When to use:** Treaty Article 4, Article 9.1.b LIRPF
**Example:**
```html
<!-- Source: CONTEXT.md decision - legal + plain language -->
<div class="legal-explanation">
  <blockquote class="legal-text" cite="BOE-A-2003-13375">
    <p>Article 4(2)(a): "Esa persona sera considerada residente del Estado
    donde tenga una vivienda permanente a su disposicion..."</p>
  </blockquote>
  <div class="plain-summary">
    <strong>In plain language:</strong> If you have permanent homes in both
    Spain and Belgium, residency is determined by where you have stronger
    personal and economic ties (your "center of vital interests").
  </div>
</div>
```

### Anti-Patterns to Avoid
- **User-specific references:** Per CONTEXT.md, use generic examples ("A person with family in Spain...") not "Your partner and daughter..."
- **Alarming tone:** Use factual/neutral language per CONTEXT.md ("Treaty provisions may apply" not "WARNING: You are at risk!")
- **Hardcoded fiscal values in UI:** Keep fiscal constants (91.35 EUR, 48.08 EUR) in JavaScript constants, display via template strings

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sections | Custom show/hide logic | HTML5 details/summary OR existing dashboard accordion pattern | Accessibility already handled |
| Warning state persistence | Complex state management | sessionStorage (dismiss per session) | Simple, no external deps |
| Legal text formatting | Custom blockquote styling | Standard blockquote with cite attribute | Semantic HTML |
| Tooltip system | New tooltip implementation | Existing createTooltip() function from Phase 5 | Already implemented |

**Key insight:** The dashboard already has patterns for warnings (warningBanner), tooltips (TOOLTIPS constant + createTooltip()), and collapsible-like UI. Reuse these patterns rather than creating new ones.

## Common Pitfalls

### Pitfall 1: Mixing Legal Advice with Information
**What goes wrong:** Phrasing like "You should do X" implies advice, creating legal liability
**Why it happens:** Natural tendency to be helpful sounds like professional advice
**How to avoid:** Use informational framing: "Spanish law requires X" or "Documentation typically includes X"
**Warning signs:** Any sentence with "you should", "you must", "we recommend"

### Pitfall 2: Outdated Fiscal Values
**What goes wrong:** Hardcoding dietas limits (91.35 EUR) that change annually
**Why it happens:** Copy-paste from research without parameterization
**How to avoid:** Define all fiscal values as JavaScript constants at top of file, reference via template strings
**Warning signs:** Euro amounts written directly in HTML strings

### Pitfall 3: Inaccessible Collapsible Sections
**What goes wrong:** Keyboard users cannot navigate collapsed sections
**Why it happens:** Using div+click instead of proper button+aria attributes
**How to avoid:** Use button elements with aria-expanded, aria-controls, manage focus
**Warning signs:** collapsible section has no button element, no aria attributes

### Pitfall 4: Warning Banner Blocks Content
**What goes wrong:** Warning banner pushes down or overlays important content
**Why it happens:** CSS positioning issues with fixed/sticky banners
**How to avoid:** Use sticky positioning with proper z-index, add padding to content below
**Warning signs:** Content jumps when banner appears/disappears

### Pitfall 5: Disclaimer Not Actually Global
**What goes wrong:** Disclaimer only visible on Compliance tab, not others
**Why it happens:** Placing disclaimer inside tab panel instead of outside
**How to avoid:** Place disclaimer element OUTSIDE .tab-panels container, style as global footer
**Warning signs:** Disclaimer disappears when switching tabs

## Code Examples

Verified patterns from existing dashboard and research:

### Example 1: Dietas Limits Display (from FISCAL_DATA.md + DEDUCTIONS.md)
```javascript
// Source: .planning/research/FISCAL_DATA.md, DEDUCTIONS.md
const DIETAS_LIMITS = Object.freeze({
  spain: {
    withOvernight: 53.34,    // EUR/day
    withoutOvernight: 26.67  // EUR/day
  },
  abroad: {
    withOvernight: 91.35,    // EUR/day - applies to Belgium
    withoutOvernight: 48.08  // EUR/day
  },
  source: 'Art. 9 Reglamento IRPF (RD 439/2007)'
});

function renderDietasLimits() {
  return `
    <table class="fiscal-table">
      <thead>
        <tr>
          <th>Location</th>
          <th>With Overnight</th>
          <th>Without Overnight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Spain</td>
          <td>${formatEUR(DIETAS_LIMITS.spain.withOvernight)}/day</td>
          <td>${formatEUR(DIETAS_LIMITS.spain.withoutOvernight)}/day</td>
        </tr>
        <tr>
          <td>Belgium (Abroad)</td>
          <td class="highlight">${formatEUR(DIETAS_LIMITS.abroad.withOvernight)}/day</td>
          <td>${formatEUR(DIETAS_LIMITS.abroad.withoutOvernight)}/day</td>
        </tr>
      </tbody>
    </table>
    <cite class="source-citation">${DIETAS_LIMITS.source}</cite>
  `;
}
```

### Example 2: Article 4 Tie-Breaker (from TREATY.md)
```javascript
// Source: .planning/research/TREATY.md, verified via BOE-A-2003-13375
const TREATY_ARTICLE_4 = Object.freeze({
  title: 'Article 4: Tax Residence Tie-Breaker',
  source: 'Spain-Belgium Tax Treaty (BOE-A-2003-13375)',
  steps: [
    {
      name: 'Permanent Home',
      legal: 'vivienda permanente a su disposicion',
      plain: 'The country where you have a permanent home available to you. If only in one country, that country is your tax residence.'
    },
    {
      name: 'Center of Vital Interests',
      legal: 'centro de intereses vitales - relaciones personales y economicas mas estrechas',
      plain: 'If permanent homes in both countries: where your personal ties (family, social life) and economic ties (work, assets) are strongest. Family location receives special weight.'
    },
    {
      name: 'Habitual Abode',
      legal: 'viva habitualmente',
      plain: 'If center cannot be determined: the country where you spend more time overall.'
    },
    {
      name: 'Nationality',
      legal: 'nacional',
      plain: 'If habitual abode is equal: the country of your citizenship.'
    },
    {
      name: 'Mutual Agreement',
      legal: 'autoridades competentes resolveran de comun acuerdo',
      plain: 'If dual national or none: tax authorities of both countries negotiate.'
    }
  ]
});
```

### Example 3: Article 9.1.b Family Presumption (from TREATY.md)
```javascript
// Source: BOE-A-2006-20764 (Ley 35/2006 LIRPF), verified via WebFetch
const ARTICLE_9_1_B = Object.freeze({
  title: 'Art. 9.1.b LIRPF: Family Presumption',
  source: 'Ley 35/2006, Art. 9.1.b (BOE-A-2006-20764)',
  legalText: `Se presumira, salvo prueba en contrario, que el contribuyente tiene
su residencia habitual en territorio espanol cuando, de acuerdo con los criterios
anteriores, resida habitualmente en Espana el conyuge no separado legalmente y los
hijos menores de edad que dependan de aquel.`,
  plainSummary: `If your non-legally-separated spouse AND/OR dependent minor children
habitually reside in Spain, Spanish law PRESUMES you are also a Spanish tax resident.
This presumption can be challenged (is "rebuttable"), but the burden of proof shifts
to you to demonstrate your tax residence is elsewhere.`,
  implication: `For a person with family in Spain: This presumption operates in your
FAVOR when Belgium might claim tax residency. Spain will start from the position that
you are Spanish resident based on family ties, making it easier to defend Spanish
tax residence under the treaty tie-breaker rules.`
});
```

### Example 4: Factura Completa Requirements (from DEDUCTIONS.md)
```javascript
// Source: .planning/research/DEDUCTIONS.md
const FACTURA_REQUIREMENTS = Object.freeze({
  title: 'Factura Completa Requirements',
  source: 'AEAT - Reglamento de Facturacion',
  required: [
    { field: 'Numero de factura', description: 'Sequential invoice number' },
    { field: 'Fecha de emision', description: 'Issue date' },
    { field: 'NIF del emisor', description: 'Supplier tax ID' },
    { field: 'Nombre/Razon social emisor', description: 'Supplier name or company' },
    { field: 'Domicilio fiscal emisor', description: 'Supplier address' },
    { field: 'NIF del destinatario', description: 'YOUR tax ID (autonomo NIF)' },
    { field: 'Nombre destinatario', description: 'YOUR name' },
    { field: 'Domicilio fiscal destinatario', description: 'YOUR fiscal address' },
    { field: 'Descripcion', description: 'Description of goods/services' },
    { field: 'Base imponible', description: 'Taxable amount before IVA' },
    { field: 'Tipo de IVA', description: 'IVA rate (if applicable)' },
    { field: 'Cuota de IVA', description: 'IVA amount' },
    { field: 'Total', description: 'Total amount' }
  ],
  notValid: [
    { type: 'Ticket/Receipt', reason: 'Missing recipient identification' },
    { type: 'Factura simplificada', reason: 'Lacks full recipient data required for IRPF deduction' },
    { type: 'Bank statement alone', reason: 'Not proof of business expense' },
    { type: 'Airbnb confirmation email', reason: 'Not a valid tax invoice' }
  ]
});
```

### Example 5: Disclaimer Text
```javascript
// Source: Standard legal practice, adapted from tax software disclaimers
const DISCLAIMER = Object.freeze({
  title: 'Disclaimer',
  text: `This calculator provides estimates for informational and educational purposes
only. It does not constitute tax, legal, or financial advice. Tax laws are complex,
subject to change, and vary by individual circumstances. Your actual tax liability may
differ from these estimates. Always consult with a qualified tax professional
(asesor fiscal, gestor) for guidance specific to your situation before making any
financial decisions or filing tax returns.`,
  shortVersion: `For informational purposes only. Consult a qualified tax professional
for advice specific to your situation.`
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PDF disclaimers | In-app disclaimers | 2020s | Users must see disclaimer where they use tool |
| Static legal text | Legal text + plain summary | Best practice | Accessibility, comprehension |
| Hidden T&C links | Visible footer disclaimer | Best practice | Reduces liability, increases trust |
| Generic "consult a professional" | Specific professional types | Best practice | Users know WHO to consult (asesor fiscal, gestor) |

**Deprecated/outdated:**
- Hiding disclaimers in terms of service: Should be visible where tool is used
- Spanish-only legal text: Plain language summaries improve comprehension

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Article 4 paragraph formatting**
   - What we know: Official text retrieved via WebFetch from BOE
   - What's unclear: Best way to display Spanish legal text vs English translation for this user
   - Recommendation: Show Spanish original in blockquote, English summary below (per CONTEXT.md "legal + plain language")

2. **2026 VeriFactu impact on documentation**
   - What we know: July 2026 deadline for electronic invoicing
   - What's unclear: How this affects expense RECEIPT requirements (vs invoice ISSUANCE)
   - Recommendation: Note VeriFactu as future consideration, focus on current factura completa rules

3. **Session vs localStorage for warning dismiss**
   - What we know: CONTEXT.md says "dismissable per session"
   - What's unclear: Should warning return on tab change or only page reload?
   - Recommendation: Use sessionStorage - warning dismissed until browser tab closed

## Sources

### Primary (HIGH confidence)
- **BOE-A-2003-13375** - Spain-Belgium Tax Treaty Article 4, verified via WebFetch
- **BOE-A-2006-20764** - Ley 35/2006 LIRPF Article 9.1.b, verified via WebFetch
- **.planning/research/TREATY.md** - Existing project research with verified treaty analysis
- **.planning/research/DEDUCTIONS.md** - Existing project research with factura requirements
- **.planning/research/FISCAL_DATA.md** - Dietas limits (91.35/48.08 EUR)
- **.planning/research/PITFALLS.md** - Documentation pitfalls (factura vs ticket)

### Secondary (MEDIUM confidence)
- [LexTax: Spanish Tax Residency Beyond 183 Days](https://lextax.es/spanish-tax-residency-the-guide-beyond-the-183-day-rule/) - Family presumption explanation
- [JURO Spain: Registering as Autonomo 2026](https://jurospain.com/guides/register-as-autonomo-spain-2026/) - VeriFactu and payment requirements
- [Renn: Deductible Expenses for Autonomos](https://getrenn.com/blog/deductible-expenses-for-autonomos) - Factura requirements
- [fynk: Tax Disclaimer Clauses](https://fynk.com/en/clauses/tax-disclaimer/) - Disclaimer best practices

### Tertiary (LOW confidence)
- Generic disclaimer templates from JP Morgan, PWC (adapted for context)

## Metadata

**Confidence breakdown:**
- Treaty provisions (Article 4): HIGH - Official BOE source verified
- Family presumption (Art. 9.1.b): HIGH - Official BOE source verified
- Dietas limits: HIGH - From project research with official AEAT citations
- Factura requirements: HIGH - Multiple verified sources agree
- Electronic payment requirement: HIGH - AEAT source in DEDUCTIONS.md
- Disclaimer language: MEDIUM - Based on industry patterns, not legal review
- Warning UI patterns: HIGH - Consistent with Phase 4 existing implementation

**Research date:** 2026-02-02
**Valid until:** 2027-01-01 (stable legal provisions, annual review recommended for fiscal values)
