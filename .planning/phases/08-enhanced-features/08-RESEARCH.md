# Phase 8: Enhanced Features - Research

**Researched:** 2026-02-02
**Domain:** UI enhancements, expense auto-detection, income tracking, official source linking
**Confidence:** HIGH

## Summary

Phase 8 enhances the existing tax calculator with four key features: (1) improved calendar multi-select visual feedback, (2) intelligent expense auto-detection for 100% deductible categories, (3) a new Income tracking tab for client earnings management, and (4) comprehensive official source linking throughout the application.

The existing codebase already has a solid foundation with localStorage persistence, native HTML5 dialog patterns, tab-based navigation, and well-structured expense/scenario management. Phase 8 builds on these patterns rather than introducing new paradigms.

Research confirms that official AEAT URLs are stable and well-structured, that 100% deductible expense categories for IT/consulting are well-defined in Spanish tax law, and that income tracking follows standard invoice field patterns. The existing SOURCES constant provides a good model for source citations that needs URL verification and expansion.

**Primary recommendation:** Extend existing patterns (localStorage, dialogs, tabs) for all new features. Use AEAT Sede Electronica URLs as primary sources. Implement expense auto-detection via keyword matching against predefined IT/consulting expense categories.

## Standard Stack

This phase uses NO new libraries - continuing the single-file vanilla JavaScript approach.

### Core
| Technology | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JavaScript | ES2020+ | All functionality | Per CLAUDE.md constraint - NO frameworks |
| HTML5 Native Dialog | N/A | Modals for add/edit forms | Already established pattern in codebase |
| CSS Variables | N/A | Theming consistency | Already established pattern |
| localStorage | N/A | Data persistence | Already used for expenses/scenarios/calendar |

### Supporting
| Feature | Implementation | Purpose | When to Use |
|---------|---------|---------|-------------|
| structuredClone | Polyfilled in 7.2-03 | Deep copy objects | Creating mutable copies of frozen defaults |
| Intl.NumberFormat | Native | Currency/percentage formatting | Already used for EUR display |
| Intl.DateTimeFormat | Native | Date formatting | Already used for calendar |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New tab for Income | Modal overlay | Tab is better for data management vs quick input |
| Keyword matching | ML classification | Keyword matching is simpler, sufficient for known categories |
| External link icons | Tooltip with URL | Direct clickable links more useful for verification |

**Installation:**
```bash
# No installation needed - vanilla JS only
```

## Architecture Patterns

### Recommended Extension Points

The current codebase structure allows extension without refactoring:

```
autonomo_dashboard.html
  CSS Variables (lines ~15-50)
    - Add new semantic colors if needed
  Tab Navigation (lines ~195-250)
    - Add 6th tab for Income (pattern already established)
  Constants Section (lines ~5344-5527)
    - Extend SOURCES with URLs
    - Add DEDUCTIBLE_100_CATEGORIES constant
    - Add INCOME_STORAGE_KEY constant
  Expense Functions (lines ~5618-6278)
    - Add auto-detection logic
  Calendar Functions (lines ~4200-5000)
    - Enhance selection visual feedback
```

### Pattern 1: Tab Addition (for Income Tab)
**What:** Add 6th tab following existing CSS radio button pattern
**When to use:** Adding Income tracking as new primary navigation
**Example:**
```html
<!-- Add radio input (hidden) -->
<input type="radio" name="tabs" id="tab-income" class="tab-input">

<!-- Add label in tab-nav -->
<label for="tab-income" class="tab-label">Income</label>

<!-- Add panel in tab-panels -->
<div class="tab-panel panel-income">
  <!-- Content here -->
</div>

<!-- Add CSS selector for active state -->
#tab-income:checked ~ .tab-nav .tab-label[for="tab-income"] {
  border-bottom-color: var(--accent);
  color: var(--accent);
}

#tab-income:checked ~ .tab-panels .panel-income {
  display: block;
}
```

### Pattern 2: Expense Auto-Detection
**What:** Keyword-based category matching for 100% deductible suggestions
**When to use:** When user adds a new expense
**Example:**
```javascript
// Source: Based on AEAT guidelines for IT/consulting deductions
const DEDUCTIBLE_100_CATEGORIES = Object.freeze({
  keywords: [
    // Software & Tools
    { pattern: /software|programa|licencia|subscription|suscripcion/i, category: 'Software', confidence: 'HIGH' },
    { pattern: /adobe|microsoft|google workspace|slack|notion|github|figma/i, category: 'Software', confidence: 'HIGH' },
    { pattern: /hosting|domain|servidor|cloud|aws|azure/i, category: 'Cloud/Hosting', confidence: 'HIGH' },

    // Equipment
    { pattern: /ordenador|computer|laptop|monitor|teclado|keyboard|raton|mouse/i, category: 'Equipment', confidence: 'HIGH' },
    { pattern: /impresora|printer|scanner|webcam|microfono|auriculares/i, category: 'Equipment', confidence: 'HIGH' },

    // Professional Services
    { pattern: /gestor|asesor|accountant|lawyer|abogado|notario/i, category: 'Professional Services', confidence: 'HIGH' },
    { pattern: /consultoria|consulting|asesoria/i, category: 'Professional Services', confidence: 'MEDIUM' },

    // Office/Workspace (if exclusive)
    { pattern: /coworking|oficina|office|alquiler.*local/i, category: 'Workspace', confidence: 'MEDIUM' },

    // Training
    { pattern: /curso|course|formacion|training|certificacion|conference|conferencia/i, category: 'Training', confidence: 'HIGH' },

    // Marketing
    { pattern: /marketing|publicidad|advertising|google ads|facebook ads|linkedin/i, category: 'Marketing', confidence: 'HIGH' }
  ],

  detect(name) {
    for (const rule of this.keywords) {
      if (rule.pattern.test(name)) {
        return { suggested: true, category: rule.category, confidence: rule.confidence };
      }
    }
    return { suggested: false };
  }
});
```

### Pattern 3: Source Citation with External Links
**What:** Clickable citations with external link icon
**When to use:** All references to official sources
**Example:**
```javascript
// Extend SOURCES constant with verified URLs
const SOURCES = Object.freeze({
  IRPF_BRACKETS: {
    name: "IRPF Tramos 2025",
    source: "AEAT Sede Electronica",
    url: "https://sede.agenciatributaria.gob.es/Sede/irpf.html",
    note: "Unchanged from 2024. Combined estatal + autonomica rates.",
    confidence: "HIGH"
  },
  // ... add more sources
});

// Create clickable citation
function createSourceLink(sourceKey) {
  const s = SOURCES[sourceKey];
  if (!s || !s.url) return s ? s.name : '';

  return `<a href="${s.url}" target="_blank" rel="noopener" class="source-link">
    ${s.name} <span class="external-icon">&#8599;</span>
  </a>`;
}
```

### Pattern 4: Income Entry Storage
**What:** localStorage persistence for income entries following existing expense pattern
**When to use:** Income tracking data
**Example:**
```javascript
const INCOME_STORAGE_KEY = 'autonomo_income_v1';

const DEFAULT_INCOME = Object.freeze({
  version: 1,
  entries: []
});

// Entry structure
const incomeEntry = {
  id: 'income-1234567890',
  clientName: 'Client Company BV',
  invoiceNumber: 'INV-2026-001',
  amount: 5000,
  dateReceived: '2026-02-01',
  dateInvoiced: '2026-01-15',
  description: 'IT Consulting - January 2026',
  status: 'paid', // 'pending', 'paid', 'overdue'
  notes: ''
};
```

### Anti-Patterns to Avoid
- **Hardcoded source URLs in HTML:** Use the SOURCES constant for maintainability
- **Multiple localStorage keys for same data:** Keep income as single versioned key
- **Regex without /i flag for expense detection:** Names may be mixed-case
- **Blocking UI during auto-save:** Use async patterns already established

## Don't Hand-Roll

Problems that have established solutions in the existing codebase:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialogs | Custom div overlay | HTML5 `<dialog>` element | Already used, provides focus trap, Esc handling |
| Date formatting | Manual string concat | Intl.DateTimeFormat | Already used, handles localization |
| Deep object copy | JSON parse/stringify | structuredClone (polyfilled) | Already established, handles edge cases |
| Tab switching | JavaScript state | CSS :checked selectors | Already implemented, no JS needed |
| Form validation | Custom checks | HTML5 required, pattern attrs | Browser-native, accessible |

**Key insight:** The codebase already has working patterns for all UI components needed. Phase 8 should extend these patterns, not create new ones.

## Common Pitfalls

### Pitfall 1: Breaking Existing localStorage Data
**What goes wrong:** New income data structure conflicts with existing expense/scenario keys
**Why it happens:** Using same storage key or incompatible data structures
**How to avoid:**
- Use versioned key: `autonomo_income_v1`
- Add migration function if extending existing structures
- Test with existing localStorage data present
**Warning signs:** Data not loading after update, JSON parse errors

### Pitfall 2: External Links Without rel="noopener"
**What goes wrong:** Security vulnerability when opening external links
**Why it happens:** Forgetting security attributes on target="_blank" links
**How to avoid:** Always use `target="_blank" rel="noopener noreferrer"`
**Warning signs:** Linter warnings, security audit flags

### Pitfall 3: Overly Aggressive Expense Auto-Detection
**What goes wrong:** User frustration from incorrect suggestions
**Why it happens:** Too broad regex patterns matching unintended terms
**How to avoid:**
- Use specific keyword patterns with confidence levels
- Show as "suggestion" not auto-applied
- Allow easy dismiss/override
**Warning signs:** User complaints, many false positives

### Pitfall 4: Stale Official Source URLs
**What goes wrong:** Broken links to AEAT documentation
**Why it happens:** Government websites restructure periodically
**How to avoid:**
- Use stable URLs from sede.agenciatributaria.gob.es
- Prefer /Sede/ paths over marketing pages
- Test links before deployment
**Warning signs:** 404 errors, redirects to wrong pages

### Pitfall 5: Tab Navigation CSS Selector Order
**What goes wrong:** New Income tab doesn't show when selected
**Why it happens:** CSS selectors must be in correct order, all tabs need selectors
**How to avoid:**
- Add all three selectors: radio:checked, tab-nav label, tab-panels panel
- Match exact for= and id= values
- Test all tabs after adding new one
**Warning signs:** Click on tab does nothing, other tabs stop working

### Pitfall 6: Missing Calendar Selection Visual Feedback
**What goes wrong:** Users unsure if days are selected before applying status
**Why it happens:** Relying only on checkbox state without additional visual cues
**How to avoid:**
- Add distinct background color for selected state
- Show selection count prominently
- Add checkmark overlay or highlight border
**Warning signs:** Users clicking Apply repeatedly, confusion about selection state

## Code Examples

Verified patterns from existing codebase and research:

### Calendar Selection Visual Feedback
```css
/* Source: Existing calendar CSS + UX best practices */

/* Selected day visual feedback - prominent */
.day-cell.selected {
  background: rgba(74, 222, 128, 0.2) !important; /* Green overlay */
  border: 2px solid var(--accent);
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

/* Checkbox checked state */
.day-cell.selected .day-checkbox {
  accent-color: var(--accent);
}

/* Selection count badge */
.selection-count-badge {
  background: var(--accent);
  color: var(--bg);
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: var(--size-small);
}
```

### Income Entry Form Structure
```html
<!-- Source: Established dialog pattern from expense/scenario forms -->
<dialog id="incomeDialog" class="modal-dialog">
  <form id="incomeForm" onsubmit="saveIncomeEntry(event)">
    <h3>Add Income Entry</h3>

    <div class="form-group">
      <label for="incomeClient">Client Name *</label>
      <input type="text" id="incomeClient" name="clientName" required>
    </div>

    <div class="form-group">
      <label for="incomeInvoice">Invoice Number</label>
      <input type="text" id="incomeInvoice" name="invoiceNumber"
             placeholder="INV-2026-001">
    </div>

    <div class="form-group">
      <label for="incomeAmount">Amount (EUR) *</label>
      <input type="number" id="incomeAmount" name="amount"
             step="0.01" min="0" required>
    </div>

    <div class="form-group">
      <label for="incomeDate">Date Received *</label>
      <input type="date" id="incomeDate" name="dateReceived" required>
    </div>

    <div class="form-group">
      <label for="incomeDescription">Description</label>
      <textarea id="incomeDescription" name="description" rows="2"></textarea>
    </div>

    <div class="dialog-footer">
      <button type="button" onclick="closeIncomeDialog()">Cancel</button>
      <button type="submit" class="primary">Save</button>
    </div>
  </form>
</dialog>
```

### Expense Auto-Detection Implementation
```javascript
// Source: Based on AEAT IT/consulting deduction guidelines

/**
 * Detect if expense name suggests 100% deductible category
 * @param {string} name - Expense name to check
 * @returns {object} - { suggested: boolean, category: string, confidence: string }
 */
function detectDeductibleCategory(name) {
  const normalized = name.toLowerCase().trim();

  const patterns = [
    // Software (HIGH confidence)
    { regex: /\b(software|licencia|subscription|suscripcion)\b/i,
      category: 'Software', confidence: 'HIGH' },
    { regex: /\b(adobe|microsoft 365|google workspace|slack|notion|github|jira|confluence)\b/i,
      category: 'Software', confidence: 'HIGH' },
    { regex: /\b(jetbrains|vscode|figma|sketch|invision)\b/i,
      category: 'Software', confidence: 'HIGH' },

    // Cloud/Hosting (HIGH confidence)
    { regex: /\b(hosting|domain|dominio|servidor|server|cloud|aws|azure|gcp|heroku|vercel|netlify)\b/i,
      category: 'Cloud/Hosting', confidence: 'HIGH' },

    // Equipment (HIGH confidence)
    { regex: /\b(ordenador|computer|laptop|macbook|monitor|pantalla)\b/i,
      category: 'Equipment', confidence: 'HIGH' },
    { regex: /\b(teclado|keyboard|raton|mouse|webcam|camara|microfono|auriculares|headphones)\b/i,
      category: 'Equipment', confidence: 'HIGH' },

    // Professional Services (HIGH confidence)
    { regex: /\b(gestor|gestoria|asesor|asesoria|accountant|contable)\b/i,
      category: 'Professional Services', confidence: 'HIGH' },
    { regex: /\b(abogado|lawyer|notario|notary)\b/i,
      category: 'Professional Services', confidence: 'HIGH' },

    // Training (HIGH confidence)
    { regex: /\b(curso|course|formacion|training|certificacion|certification|udemy|coursera|pluralsight)\b/i,
      category: 'Training', confidence: 'HIGH' },

    // Workspace (MEDIUM confidence - depends on exclusivity)
    { regex: /\b(coworking|oficina|office)\b/i,
      category: 'Workspace', confidence: 'MEDIUM' },

    // Marketing (HIGH confidence)
    { regex: /\b(marketing|publicidad|advertising|google ads|facebook ads|linkedin ads)\b/i,
      category: 'Marketing', confidence: 'HIGH' },

    // Books/Publications (HIGH confidence)
    { regex: /\b(libro tecnico|technical book|manual|ebook|safari books|o'reilly)\b/i,
      category: 'Publications', confidence: 'HIGH' }
  ];

  for (const p of patterns) {
    if (p.regex.test(normalized)) {
      return { suggested: true, category: p.category, confidence: p.confidence };
    }
  }

  return { suggested: false, category: null, confidence: null };
}
```

### Official Source Links Component
```javascript
// Source: Extension of existing SOURCES pattern

const OFFICIAL_SOURCES = Object.freeze({
  // IRPF General
  AEAT_IRPF: {
    name: 'IRPF - Agencia Tributaria',
    url: 'https://sede.agenciatributaria.gob.es/Sede/irpf.html',
    description: 'Main IRPF information page'
  },

  // Autonomo Specific
  AEAT_AUTONOMOS: {
    name: 'Empresarios y Profesionales',
    url: 'https://sede.agenciatributaria.gob.es/Sede/empresarios-individuales-profesionales.html',
    description: 'Self-employed taxpayer information'
  },

  // Estimation Methods
  AEAT_ESTIMACION_DIRECTA: {
    name: 'Estimacion Directa Simplificada',
    url: 'https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html',
    description: '5% gastos de dificil justificacion, 2000 EUR limit'
  },

  // Minimos
  AEAT_MINIMO_PERSONAL: {
    name: 'Minimo del Contribuyente',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c14-adecuacion-impuesto-circunstancias-personales/cuadro-resumen-minimo-personal-familiar.html',
    description: '5,550 EUR personal allowance'
  },

  AEAT_MINIMO_DESCENDIENTES: {
    name: 'Minimo por Descendientes',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ciudadanos-familias-personas-discapacidad/minimo-personal-familiar/minimo-descendientes.html',
    description: '2,400 EUR for first child'
  },

  // RETA
  RETA_COTIZACION: {
    name: 'Sistema de Cotizacion Autonomos',
    url: 'https://sede.agenciatributaria.gob.es/Sede/empresarios-individuales-profesionales/nuevo-sistema-cotizacion-autonomos.html',
    description: 'RETA contribution system since 2023'
  },

  // Dietas
  AEAT_DIETAS: {
    name: 'Dietas y Gastos de Viaje',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2023/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_1-rendimientos-integros/7_1_1_2-dietas-gastos-viaje/asignaciones-gastos-manutencion-estancia.html',
    description: '91.35 EUR/day abroad with overnight'
  },

  // Treaty
  BOE_TREATY: {
    name: 'Convenio Espana-Belgica',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-13375',
    description: 'Double taxation treaty (BOE-A-2003-13375)'
  },

  AEAT_TREATY_BELGIUM: {
    name: 'CDI Belgica - AEAT',
    url: 'https://sede.agenciatributaria.gob.es/Sede/normativa-criterios-interpretativos/fiscalidad-internacional/convenios-doble-imposicion-firmados-espana/belgica.html',
    description: 'AEAT treaty information page'
  },

  // Reglamento IRPF (for dietas limits)
  BOE_REGLAMENTO_IRPF: {
    name: 'Reglamento IRPF Art. 9',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820&tn=1&p=20231228#a9',
    description: 'Official dietas limits regulation'
  }
});

/**
 * Render external link with icon
 * @param {string} sourceKey - Key from OFFICIAL_SOURCES
 * @returns {string} - HTML anchor element
 */
function renderSourceLink(sourceKey) {
  const s = OFFICIAL_SOURCES[sourceKey];
  if (!s) return '';

  return `<a href="${s.url}" target="_blank" rel="noopener noreferrer"
             class="official-source-link" title="${s.description}">
    ${s.name} <span class="external-link-icon">&#8599;</span>
  </a>`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Basic checkbox selection | Visual overlay + count badge | UX standard 2024+ | Users need redundant feedback |
| Manual expense categorization | Smart detection with suggestions | AI/ML influence | Reduces user effort |
| Static source references | Clickable external links | Web standards | Better verifiability |
| Hidden form validation | Inline suggestions + confirmation | Form UX evolution | Prevents errors |

**Deprecated/outdated:**
- Using `onclick` in HTML attributes: Still works but considered old pattern. The existing codebase uses it; maintain consistency.
- Alert/confirm dialogs: Use HTML5 `<dialog>` instead (already established in codebase)

## Open Questions

Things that require clarification during implementation:

1. **Income Tab Position**
   - What we know: Need 6th tab for Income tracking
   - What's unclear: Should it be after Expenses or after Compliance?
   - Recommendation: After Expenses (logical flow: Scenarios -> Calendar -> Expenses -> Income -> Compliance)

2. **Auto-Detection Threshold**
   - What we know: Keyword matching works for expense names
   - What's unclear: How aggressive should suggestions be? Every match or only HIGH confidence?
   - Recommendation: Show suggestion badge for all matches, auto-select 100% only for HIGH confidence

3. **Income-Scenario Integration**
   - What we know: CONTEXT.md specifies "hybrid approach" - manual OR import
   - What's unclear: UI for importing income totals into scenario revenue
   - Recommendation: Add "Import from Income" button in scenario edit modal

4. **Source Link Styling**
   - What we know: Need external link icon (specified as arrow in CONTEXT.md)
   - What's unclear: Inline vs separate section
   - Recommendation: Both - inline citations AND dedicated Sources section in Compliance tab

## Sources

### Primary (HIGH confidence)
- AEAT Sede Electronica - https://sede.agenciatributaria.gob.es
  - IRPF section verified
  - Empresarios y profesionales section verified
  - Estimacion directa simplificada verified
  - Minimos pages verified
- BOE - https://www.boe.es
  - Spain-Belgium treaty (BOE-A-2003-13375) verified
  - Reglamento IRPF Art. 9 verified

### Secondary (MEDIUM confidence)
- WebSearch results for gastos deducibles IT/consulting 2025
  - Multiple sources agree on 100% deductible categories
  - Software, equipment, professional services confirmed
- Calendar UX design patterns
  - Smashing Magazine, UX Planet best practices

### Tertiary (LOW confidence)
- Invoice tracking form patterns
  - Various tutorials and GitHub repos
  - Patterns are standard but implementations vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, all patterns established
- Architecture: HIGH - Extension of existing patterns only
- Source URLs: HIGH - Verified against official government sites
- Expense categories: MEDIUM - Based on tax guidance, may need gestor validation
- Pitfalls: HIGH - Based on existing codebase analysis

**Research date:** 2026-02-02
**Valid until:** 30 days (stable patterns, official URLs may change with government site updates)

## Appendix: 100% Deductible Categories for IT/Consulting

Based on AEAT guidelines and verified tax guidance:

### Always 100% Deductible (with proper documentation)
| Category | Examples | Documentation Required |
|----------|----------|----------------------|
| RETA Cuota | Social Security contribution | Bank statement |
| Software Subscriptions | Adobe, Microsoft 365, JetBrains, GitHub | Factura completa |
| Cloud/Hosting | AWS, Azure, Heroku, domain registration | Factura completa |
| Professional Equipment | Computer, monitor, keyboard, webcam | Factura completa, <300 EUR immediate, >300 EUR amortized |
| Professional Services | Gestoria, accountant, lawyer | Factura completa |
| Training | Courses, certifications, conferences | Factura completa |
| Marketing | Google Ads, LinkedIn Ads, promotional materials | Factura completa |
| Exclusive Office | Coworking, rented office space | Factura completa |

### Partially Deductible (requires calculation)
| Category | Deduction Rate | Notes |
|----------|---------------|-------|
| Home office utilities | 30% of proportional use | Must register home as business location |
| Mobile phone | 50-100% if justified | Recommend separate business line |
| Vehicle | Very limited | Only transport/commercial professionals |

### Not Deductible for IT Consulting
| Category | Reason |
|----------|--------|
| Personal expenses | Not business-related |
| Local meals (same municipality) | Dietas rules exclude |
| Weekend leisure during trips | Personal, not business |
| Cash-paid meals | Electronic payment required since 2018 |
