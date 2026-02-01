# Phase 5: Dashboard UI - Research

**Researched:** 2026-02-01
**Domain:** CSS Dashboard Design, Responsive Tables, Tooltips, Export Functionality
**Confidence:** HIGH

## Summary

Phase 5 focuses on transforming the existing functional calculator into a professional financial dashboard with Bloomberg-inspired aesthetics. The research covers: (1) tabbed layout architecture for organizing Scenarios/Calendar/Expenses/Details sections, (2) sticky column implementation for horizontal-scrolling comparison tables, (3) accessible tooltip patterns for technical term explanations, (4) export functionality via Clipboard API and print stylesheets, and (5) responsive design patterns for mobile transposition.

The existing codebase already has substantial CSS infrastructure including dark theme variables (`--bg: #1a1a2e`, `--accent: #4ade80`), JetBrains Mono usage for numbers, scenario cards with hover effects, dialog modals, and a comparison table. Phase 5 extends and professionalizes this foundation rather than rebuilding from scratch.

**Primary recommendation:** Implement tabbed sections using CSS radio-button pattern for zero-JS tab switching, enhance existing scenario cards with full metric breakdown as decided, add proper sticky column z-index layering to comparison table, and introduce DM Sans font for UI text alongside existing JetBrains Mono usage.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| DM Sans | Variable font | UI typography | Google Fonts, geometric sans-serif, 9 weights (100-900), designed for small text readability |
| JetBrains Mono | Latest | Number/code typography | Already in use, designed for developer/financial data clarity |
| CSS Custom Properties | Native | Theme management | Already established, zero dependencies |
| HTML5 Dialog | Native | Modal patterns | Already implemented in Phases 3-4 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Clipboard API | Native | Copy to clipboard export | User-triggered copy actions |
| @media print | Native | Print stylesheet | PDF/print export |
| CSS position: sticky | Native | Sticky headers/columns | Comparison table scrolling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure CSS tabs | JavaScript tabs | JS tabs offer better accessibility for screen readers, but CSS tabs work with decided requirements |
| Native tooltips (title attr) | Custom ARIA tooltips | Custom tooltips needed for WCAG 1.4.13 compliance (hoverable, dismissable) |
| Clipboard API | document.execCommand | execCommand deprecated, Clipboard API is modern standard |

**Installation:**
No npm packages needed - all vanilla CSS/JS. Add fonts via Google Fonts CDN:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

## Architecture Patterns

### Recommended Project Structure

Since this is a single-file HTML application, structure is about CSS organization:

```css
/* ===========================================
   PHASE 5: DASHBOARD UI STYLES
   =========================================== */

/* 1. Font imports and base typography */
/* 2. Color system and CSS variables */
/* 3. Tab navigation layout */
/* 4. Scenario card enhancements */
/* 5. Comparison table sticky columns */
/* 6. Tooltip system */
/* 7. Export/print styles */
/* 8. Responsive breakpoints */
```

### Pattern 1: Tabbed Layout with CSS Radio Buttons

**What:** Tab switching without JavaScript using hidden radio buttons
**When to use:** Simple tab interfaces with static content switching
**Example:**
```css
/* Source: https://w3collective.com/pure-css-tabs-no-javascript/ */

/* Hide radio buttons but keep accessible */
.tab-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Tab labels as clickable buttons */
.tab-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s, color 0.2s;
}

/* Active tab styling */
.tab-input:checked + .tab-label {
  border-bottom-color: var(--accent);
  color: var(--accent);
}

/* Hide all tab content by default */
.tab-content {
  display: none;
}

/* Show content for checked tab */
#tab-scenarios:checked ~ .tab-panels .panel-scenarios,
#tab-calendar:checked ~ .tab-panels .panel-calendar,
#tab-expenses:checked ~ .tab-panels .panel-expenses,
#tab-details:checked ~ .tab-panels .panel-details {
  display: block;
}
```

### Pattern 2: Sticky Column with Z-Index Layering

**What:** First column sticks during horizontal scroll with proper layer management
**When to use:** Wide comparison tables that exceed viewport
**Example:**
```css
/* Source: https://css-tricks.com/a-table-with-both-a-sticky-header-and-a-sticky-first-column/ */

.comparison-container {
  overflow-x: auto;
  max-width: 100%;
}

/* Sticky header row */
.comparison-table thead th {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
}

/* Sticky first column */
.comparison-table tbody td:first-child,
.comparison-table thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 99;
  background: var(--bg);
}

/* Corner cell - highest z-index (sticky in both directions) */
.comparison-table thead th:first-child {
  z-index: 101;
}

/* Optional: second sticky column (reference scenario per CONTEXT.md) */
.comparison-table thead th:nth-child(2),
.comparison-table tbody td:nth-child(2) {
  position: sticky;
  left: 150px; /* Width of first column */
  z-index: 98;
  background: var(--bg);
}
```

### Pattern 3: Accessible Tooltips with ARIA

**What:** Keyboard and mouse accessible tooltips that meet WCAG 1.4.13
**When to use:** Technical term explanations (IRPF, RETA, minimos, etc.)
**Example:**
```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tooltip_role */

/* Tooltip container */
[role="tooltip"] {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  z-index: 1000;
  background: #2d2d44;
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  max-width: 300px;
  font-size: 0.85rem;
  transition: opacity 0.2s, visibility 0.2s;
}

/* Show on hover/focus of trigger AND when hovering tooltip itself */
[aria-describedby]:hover + [role="tooltip"],
[aria-describedby]:focus + [role="tooltip"],
[role="tooltip"]:hover {
  visibility: visible;
  opacity: 1;
}
```

```javascript
// JavaScript for Escape key dismissal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('[role="tooltip"]').forEach(t => {
      t.style.visibility = 'hidden';
      t.style.opacity = '0';
    });
  }
});
```

### Pattern 4: Clipboard API Export

**What:** Modern async clipboard write with user feedback
**When to use:** Copy comparison table data to clipboard
**Example:**
```javascript
/* Source: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API */

async function copyTableToClipboard() {
  // Build tab-separated data from comparison table
  const table = document.querySelector('.comparison-table');
  const rows = Array.from(table.querySelectorAll('tr'));

  const text = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    return cells.map(cell => cell.textContent.trim()).join('\t');
  }).join('\n');

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Copy failed - please try again', 'error');
  }
}
```

### Anti-Patterns to Avoid

- **Sticky without background:** Always set solid `background-color` on sticky cells; transparent backgrounds show overlapping content during scroll
- **Z-index wars:** Use systematic z-index (99, 100, 101) not arbitrary values like 9999
- **Title attribute for tooltips:** Native title tooltips can't be styled, can't stay open on hover, and are inaccessible on touch devices
- **document.execCommand for clipboard:** Deprecated; use Clipboard API
- **Tab panels with display:none on container:** Hide individual panels, not the container, or CSS selectors won't reach nested content
- **Dark backgrounds in print:** Always swap to light backgrounds in @media print to save ink

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading | Self-hosting, multiple formats | Google Fonts CDN | Handles caching, WOFF2, subsetting automatically |
| Clipboard access | execCommand or manual selection | navigator.clipboard.writeText() | Async, secure, modern standard |
| Modal focus trap | Manual tabindex management | Native `<dialog>` element | Already in use, handles focus trap automatically |
| Print styling | JavaScript-based PDF generation | @media print CSS | Native, no dependencies, works offline |
| Responsive tables | JavaScript table manipulation | CSS @media queries + flexbox | Pure CSS, no JS needed for simple transformations |

**Key insight:** The existing codebase already uses `<dialog>` for modals. Continue this pattern rather than introducing new modal libraries. Similarly, leverage existing CSS variables for consistency.

## Common Pitfalls

### Pitfall 1: Sticky Column Background Transparency
**What goes wrong:** When scrolling horizontally, content from other columns shows through the sticky first column
**Why it happens:** Sticky elements inherit transparent backgrounds by default
**How to avoid:** Always set explicit `background-color` on sticky cells matching the container background
**Warning signs:** Visual overlap when testing horizontal scroll

### Pitfall 2: Z-Index Context Isolation
**What goes wrong:** Sticky elements appear behind other elements despite high z-index
**Why it happens:** Z-index only works within the same stacking context; `overflow: hidden/auto` can create new contexts
**How to avoid:** Keep sticky elements in the same stacking context; avoid unnecessary `position: relative` on parent elements
**Warning signs:** Sticky element "pops behind" fixed headers or modals

### Pitfall 3: Tooltip Keyboard Accessibility
**What goes wrong:** Tooltips only appear on mouse hover, not keyboard focus
**Why it happens:** CSS `:hover` doesn't trigger on keyboard navigation
**How to avoid:** Always pair `:hover` with `:focus` selectors; use `aria-describedby` for screen readers
**Warning signs:** Tooltip content inaccessible when tabbing through form elements

### Pitfall 4: Clipboard API Permission Denied
**What goes wrong:** `navigator.clipboard.writeText()` throws SecurityError
**Why it happens:** Clipboard API requires secure context (HTTPS) and user activation
**How to avoid:** Only call clipboard methods in response to user interaction (click handler); ensure HTTPS in production
**Warning signs:** Works on localhost but fails in production; works sometimes but not others

### Pitfall 5: Print Stylesheet Color Inversion
**What goes wrong:** Dark theme prints with dark backgrounds, wasting ink and being unreadable
**Why it happens:** @media print doesn't automatically invert colors
**How to avoid:** Explicitly set `background: white; color: black;` in @media print; hide decorative elements
**Warning signs:** Print preview shows dark background

### Pitfall 6: CSS Tab Radio Button Hidden Wrong Way
**What goes wrong:** Tab navigation works with mouse but not keyboard
**Why it happens:** Using `display: none` or `visibility: hidden` on radio buttons removes them from accessibility tree
**How to avoid:** Use `opacity: 0; position: absolute;` instead to keep keyboard accessible
**Warning signs:** Cannot tab to or arrow between tabs

### Pitfall 7: Mobile Table Responsiveness
**What goes wrong:** Comparison table unusable on mobile due to horizontal scroll or tiny text
**Why it happens:** Desktop-first table design doesn't adapt
**How to avoid:** Per CONTEXT.md decision: transpose to vertical layout on mobile where each scenario becomes a section
**Warning signs:** Horizontal scroll on mobile, text too small to read

## Code Examples

Verified patterns from official sources:

### Google Fonts Import (DM Sans + JetBrains Mono)
```html
<!-- Source: https://fonts.google.com -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Typography CSS Variables
```css
/* Extend existing :root */
:root {
  /* Existing */
  --bg: #1a1a1a;  /* Updated per CONTEXT.md: charcoal */
  --text: #eaeaea;
  --accent: #4ade80;

  /* New typography */
  --font-ui: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font sizes per CONTEXT.md */
  --size-header: 20px;
  --size-numbers: 18px;
  --size-labels: 14px;

  /* Semantic colors */
  --positive: #4ade80;  /* green - income */
  --negative: #f87171;  /* red - expense */
  --warning: #fb923c;   /* orange - threshold warnings */
}

body {
  font-family: var(--font-ui);
}
```

### Scenario Card Full Breakdown (per CONTEXT.md decision)
```css
.scenario-card {
  flex: 0 0 320px;  /* Wider for full breakdown */
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.scenario-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 24px rgba(0,0,0,0.4),
    0 0 0 1px rgba(74, 222, 128, 0.2);  /* Subtle glow */
}

.scenario-card.optimal {
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.3);
}

.optimal-badge {
  background: var(--accent);
  color: var(--bg);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-weight: 600;
}
```

### Color-Coded Values (per UI-07)
```css
.value-positive { color: var(--positive); }
.value-negative { color: var(--negative); }
.value-warning { color: var(--warning); }

/* Apply based on data attribute for dynamic values */
[data-value-type="income"] { color: var(--positive); }
[data-value-type="expense"] { color: var(--negative); }
[data-value-type="warning"] { color: var(--warning); }
```

### Print Stylesheet
```css
@media print {
  /* Reset to light theme for printing */
  body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
  }

  /* Hide interactive elements */
  .tab-nav,
  .edit-btn,
  .delete-btn,
  .add-expense-btn,
  button,
  dialog,
  .calendar-section {
    display: none !important;
  }

  /* Ensure tables don't break across pages */
  .comparison-table {
    page-break-inside: avoid;
  }

  /* Make sticky columns normal for print */
  .comparison-table th,
  .comparison-table td {
    position: static !important;
    background: white !important;
  }

  /* Show scenario cards in print-friendly grid */
  .scenario-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    overflow: visible;
  }

  .scenario-card {
    background: white !important;
    border: 1px solid #ccc !important;
    color: black !important;
    page-break-inside: avoid;
  }
}
```

### Responsive Mobile Transposition (per CONTEXT.md)
```css
@media (max-width: 768px) {
  /* Hide horizontal table on mobile */
  .comparison-container {
    display: none;
  }

  /* Show transposed vertical version */
  .comparison-vertical {
    display: block;
  }

  .comparison-vertical .scenario-block {
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
  }

  .comparison-vertical .metric-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| document.execCommand('copy') | navigator.clipboard.writeText() | 2021+ | Async, secure, requires HTTPS |
| position: fixed for sticky | position: sticky | 2020+ | Simpler, respects scroll container |
| JavaScript tab switching | CSS-only with radio buttons | 2019+ | Zero JS, faster initial render |
| title attribute tooltips | ARIA role="tooltip" | WCAG 2.1 (2018) | Hoverable, keyboard accessible |
| Table layout: fixed | CSS Grid/Flexbox for responsive | 2020+ | Better mobile adaptation |

**Deprecated/outdated:**
- `document.execCommand()`: Deprecated, use Clipboard API instead
- `-webkit-sticky`: Unprefixed `sticky` has full support since 2020
- Flash of Invisible Text (FOIT): Use `font-display: swap` in font imports

## Open Questions

Things that couldn't be fully resolved:

1. **Two sticky columns complexity**
   - What we know: CSS supports multiple sticky columns with different `left` offsets
   - What's unclear: Whether two sticky columns work smoothly on all browsers when combined with sticky header
   - Recommendation: Implement single sticky first column first; test two-column version in browser matrix before committing

2. **Tab panel accessibility without JS**
   - What we know: Pure CSS tabs work for mouse/touch; keyboard navigation is limited
   - What's unclear: Whether screen reader users can navigate tab panels without ARIA attributes that require JS
   - Recommendation: Implement CSS tabs, add minimal JS for ARIA updates (`aria-selected`, `tabindex` management)

3. **Variable font vs static font performance**
   - What we know: Variable fonts reduce HTTP requests; static fonts can be smaller for limited weight usage
   - What's unclear: Which is faster for the specific 4-weight usage (400, 500, 600, 700)
   - Recommendation: Use static fonts via Google Fonts CDN; they handle optimization automatically

## Sources

### Primary (HIGH confidence)
- [MDN: Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) - writeText method, permissions, browser support
- [MDN: ARIA tooltip role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tooltip_role) - Accessibility requirements
- [MDN: CSS Printing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Printing) - @media print, @page, page breaks
- [Google Fonts: DM Sans](https://fonts.google.com/specimen/DM+Sans) - Font weights, import code
- [Google Fonts: JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) - Monospace font for numbers

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Sticky Header + Column](https://css-tricks.com/a-table-with-both-a-sticky-header-and-a-sticky-first-column/) - Z-index layering strategy verified with MDN position:sticky docs
- [Bloomberg UX Stories](https://www.bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/) - Design philosophy, not specific CSS patterns
- [w3collective: Pure CSS Tabs](https://w3collective.com/pure-css-tabs-no-javascript/) - Radio button pattern verified with multiple implementations

### Tertiary (LOW confidence)
- [Phoenix Strategy Group: Dashboard Color Palettes](https://www.phoenixstrategy.group/blog/best-color-palettes-for-financial-dashboards) - Color recommendations, design opinion
- [Dribbble Bloomberg Terminal](https://dribbble.com/search/bloomberg-terminal) - Design inspiration only, not implementation guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All native web APIs, well-documented
- Architecture: HIGH - Patterns verified with MDN, existing codebase uses same approaches
- Pitfalls: HIGH - Based on documented browser behavior and MDN specifications
- Typography: HIGH - Google Fonts official documentation
- Color system: MEDIUM - Combining existing codebase colors with CONTEXT.md decisions

**Research date:** 2026-02-01
**Valid until:** 90 days (stable native APIs, no framework churn)

---

## Integration Notes

Phase 5 builds on existing infrastructure from Phases 1-4:

| Existing | Phase 5 Enhancement |
|----------|---------------------|
| `--bg: #1a1a2e` | Update to `#1a1a1a` (charcoal per CONTEXT.md) |
| `system-ui` font | Add DM Sans via Google Fonts import |
| JetBrains Mono for numbers | Keep, ensure consistent usage |
| `.scenario-card` with hover | Enhance with full breakdown, stronger glow |
| `.comparison-table` with sticky header | Add sticky first column with z-index |
| `<dialog>` modals | Reuse pattern, no changes needed |
| Existing sections inline | Wrap in tabbed container |

The existing HTML structure at lines 1193-1213 shows separate sections for scenarios, calendar, and expenses that will be wrapped in the tab system.
