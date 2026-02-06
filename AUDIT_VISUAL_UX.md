# AUDIT: Visual & UX Assessment

**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**File:** AUDIT_VISUAL_UX.md

**Note:** Browser extension was not connected during this audit. Visual testing is based on CSS code analysis. Screenshot-based testing at each breakpoint should be performed when the browser extension becomes available.

---

## 1. LAYOUT & SPACING

### Container System
- Max-width: 1200px (default), 1400px (1440px+), 1600px (1920px+)
- Padding: 16px (mobile), 24px (768px+), 32px (1280px+)
- Grid: Flexbox and CSS Grid used throughout, no unified grid system

### Issues Found
- [x] Consistent spacing system exists (4px base with 7 tokens) - **but only 40% adopted**
- [ ] ~300+ hardcoded pixel values for padding/margins bypass the spacing scale
- [x] No horizontal scroll on body (`overflow-x: hidden` on html/body)
- [x] Content hierarchy via heading size scale
- [ ] Inconsistent whitespace between sections - some use `1rem`, others `var(--spacing-lg)`
- [ ] Card containers use mix of `--shadow-xs` and hardcoded shadows

---

## 2. TYPOGRAPHY

### Assessment
- [x] Consistent font family: DM Sans (UI) + JetBrains Mono (numbers)
- [ ] Heading hierarchy not enforced - `h3` used in cards, `h2` in modals, no `h1` on main page
- [x] Body text 15px (readable)
- [x] Line height 1.5 (good for readability)
- [ ] **9px and 10px font sizes used** in some calendar and badge elements (illegible)
- [ ] Text truncation: `.expense-name` etc. have `text-overflow: ellipsis` (good)
- [ ] Mixed units (px, em, rem, pt) across the stylesheet

---

## 3. COLORS & CONTRAST

### WCAG Compliance Assessment

| Token | Light Mode | Ratio on bg | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|-------|-----------|-------------|------------------|-----------------|
| `--text` (#111827) | On #f8f9fa | ~15:1 | PASS | PASS |
| `--text-muted` (#6b7280) | On #ffffff | ~5.5:1 | PASS | FAIL |
| `--text-faint` (#78818d) | On #f8f9fa | ~3.7:1 | **FAIL** | FAIL |
| `--accent` (#047857) | On #ffffff | ~5.5:1 | PASS | FAIL |
| `--negative` (#dc2626) | On #ffffff | ~4.6:1 | PASS (barely) | FAIL |
| `--warning` (#b45309) | On #ffffff | ~5.0:1 | PASS | FAIL |

| Token | Dark Mode | Ratio on bg | WCAG AA | WCAG AAA |
|-------|-----------|-------------|---------|----------|
| `--text` (#f0f1f3) | On #1a1b23 | ~13:1 | PASS | PASS |
| `--text-muted` (#9ca3af) | On #1a1b23 | ~6.3:1 | PASS | FAIL |
| `--text-faint` (#7c8694) | On #1a1b23 | ~4.7:1 | PASS (barely) | FAIL |
| `--accent` (#34d399) | On #1a1b23 | ~9.5:1 | PASS | PASS |

### Issues
1. `--text-faint` in light mode **fails WCAG AA** for normal text (3.7:1 < 4.5:1)
2. Color alone indicates state in some components (e.g., positive=green, negative=red without icon/text indicator)
3. Dark/light mode both have consistent token mapping (good)

---

## 4. COMPONENTS

### Buttons
- [x] Multiple variants: primary, secondary, danger, small
- [x] Hover state: `transform: scale(1.02)`
- [x] Active state: `transform: scale(0.98)`
- [x] Disabled state referenced in `:not(:disabled)`
- [ ] **Inconsistent sizing** - some have `padding: 6px 14px`, others `0.85rem 2rem`
- [ ] No button group component

### Forms
- [x] Inputs have consistent border and focus styles
- [x] iOS zoom prevention (`font-size: 16px` on inputs at mobile)
- [ ] No consistent form layout system
- [ ] 3+ different input styling patterns across entity form, expense form, invoice form
- [ ] No inline validation animations
- [ ] No disabled state styling for inputs

### Tables
- [x] Comparison table has sticky first column
- [x] Tabular numbers enabled (`font-variant-numeric: tabular-nums`)
- [ ] No responsive table pattern - tables overflow on mobile
- [ ] No sortable column headers (visual indicator only)
- [ ] No zebra striping on table rows

### Cards
- [x] Scenario cards with hover effects
- [ ] 3 different card patterns (scenario, feature, pricing)
- [ ] No consistent card padding

### Navigation
- [x] CSS-only tab navigation (radio inputs)
- [x] Horizontal scroll on mobile with mask-image fade
- [x] Active tab styling (bottom border accent color)
- [ ] Tab truncation at 768px ("COMPLIANCE" becomes "COMP")
- [ ] No mobile hamburger or bottom navigation

### Modals/Dialogs
- [x] Native `<dialog>` elements used (good for accessibility)
- [ ] 3 different modal patterns: `<dialog>`, overlay div, inline hidden div
- [ ] No focus trap implementation
- [ ] No close-on-escape for overlay-style modals (only `<dialog>` has this)
- [ ] Modals don't have max-height with scroll for small viewports

### Loading States
- [ ] No skeleton screens
- [ ] No spinner components
- [ ] No shimmer/placeholder effects
- [ ] Only `.loading` text in auth section

### Empty States
- [x] 3 empty states exist (clients, expenses, invoices) with emoji icon + CTA
- [ ] Not all lists have empty states
- [ ] No illustration/imagery - just emoji + text
- [ ] Income tab has no empty state
- [ ] Calendar has no empty state guidance

### Error States
- [x] Form validation errors show inline (`.entity-form__error`)
- [x] Toast notifications for user feedback
- [ ] No global error boundary page
- [ ] Most async errors only logged to console
- [ ] No retry UI for failed operations

---

## 5. ANIMATIONS & INTERACTIONS

- [x] CSS transitions defined: 150ms ease-out (default), 100ms (fast), 200ms (layout)
- [x] Button hover scale effect
- [x] Tab underline transition
- [ ] No page/tab transitions
- [ ] No micro-interactions on data entry
- [ ] No success animations (e.g., checkmark on save)
- [ ] No loading animations
- [ ] **Missing `prefers-reduced-motion`** - all animations play regardless

---

## 6. RESPONSIVE BEHAVIOR

### Breakpoint Map
```
0-599px     Mobile (6 @media rules)
600-767px   Large mobile (transition zone)
768-899px   Tablet (8 @media rules)
900-1023px  Large tablet (3 @media rules)
1024-1279px Small desktop (2 @media rules)
1280-1439px Desktop (1 rule)
1440-1919px Large desktop (1 rule)
1920px+     Ultra-wide (1 rule)
```

### Mobile (< 600px)
- [x] Container padding: 16px
- [x] Scenario cards: horizontal scroll
- [ ] Tab navigation: wraps to 2-3 rows (should scroll)
- [x] Touch targets: `touch-action: manipulation` set
- [ ] Some buttons < 44px height
- [x] iOS zoom prevention on inputs

### Tablet (768px)
- [x] Container padding: 24px
- [ ] Tab label "COMPLIANCE" truncated
- [x] Comparison table: horizontal scroll
- [ ] Client detail: could use 2-column layout

### Desktop (1024px+)
- [x] Full tab labels visible
- [x] Comparison table visible
- [x] Max-width container prevents ultra-wide stretching
- [x] Comfortable information density

### Issues
1. **Inconsistent mobile-first vs desktop-first** - mix of `min-width` and `max-width` queries
2. **Tab navigation breaks** at 768px with truncation
3. **No off-canvas menu** for mobile - relies on tab scroll
4. **Expense table not responsive** - would overflow on mobile
5. **Calendar grid** may be too cramped on 320px screens
6. **Invoice detail** not optimized for mobile reading

---

## 7. UX FLOW ANALYSIS

### Onboarding
- [x] First-visit onboarding overlay exists (4 steps)
- [x] "Skip" and "Don't show again" options
- [ ] No progressive disclosure after onboarding
- [ ] No feature tooltips on first use of each tab
- [ ] No sample data option (must enter everything manually)

### Core Workflow: Create Invoice
1. Switch to Invoices tab
2. Click "+ Invoice" (or create from client detail)
3. Select client (loads IVA/IRPF rules)
4. Add line items
5. Review totals
6. Save as draft
7. Mark as sent
8. Record payment when received

**Issues:**
- No inline save feedback (must wait for toast)
- No draft auto-save
- No "duplicate previous invoice" shortcut
- Creating from client detail requires 100ms timeout delay (hack)

### Core Workflow: Track Expenses
1. Switch to Expenses tab
2. Click "+ Expense"
3. Fill form (category, amount, vendor, date)
4. Optionally attach receipt (OCR fills fields)
5. Save

**Issues:**
- OCR only fills empty fields (good for not overwriting, but no diff view)
- No batch expense entry
- No recurring expense setup

### Core Workflow: Calendar Management
1. Switch to Calendar tab
2. Navigate to month
3. Click day to open editor
4. Set location, client, project
5. Save

**Issues:**
- Each day requires individual editing (slow for 17 days/month)
- Bulk tag helps but requires multi-select first
- Work pattern apply is efficient but buried in UI

### Browser Navigation
- [x] Hash routing preserves tab on refresh
- [x] Browser back/forward navigates between tabs
- [ ] No deep linking to specific entities (e.g., `#invoices/123`)
- [ ] No breadcrumbs
- [ ] Browser refresh loses modal state (unsaved form data lost)

### Error Handling UX
- [x] Toast notifications exist
- [ ] Most errors only reach console
- [ ] No "Oops" page for unrecoverable errors
- [ ] No offline indicator (despite PWA support)
- [ ] No sync status indicator

---

## 8. PRINT STYLESHEET

- [x] `@media print` block exists (200+ lines)
- [x] Light background forced
- [x] Non-printable elements hidden (buttons, dialogs, nav)
- [x] Page break control (`page-break-inside: avoid`)
- [x] Landscape orientation set
- [x] Scenario cards grid layout for print
- [x] Table borders visible for print
- [x] Monospace font preserved for numbers
- [x] Calendar grid printable
- [ ] Only active tab prints (could be confusing)
- [ ] No print button with tab selection

---

## 9. PROFESSIONAL POLISH CHECKLIST

- [x] Favicon set (SVG calculator icon)
- [x] Page title set ("Autonomo Tax Calculator - 2025/2026")
- [x] Meta description set
- [x] Open Graph tags set
- [x] Print stylesheet exists
- [ ] 404 page missing
- [ ] Error boundary page missing
- [x] Theme toggle (light/dark)
- [ ] No keyboard shortcuts
- [ ] No undo/redo
- [ ] No context menus
- [x] Selection styling matches accent color
- [x] Custom scrollbar styling

---

## 10. SCORE SUMMARY

| Category | Score | Key Issue |
|----------|-------|-----------|
| Layout & Spacing | 6/10 | Token system exists but 60% underused |
| Typography | 7/10 | Good scale, some illegible sizes |
| Colors & Contrast | 7/10 | Good tokens, 1 WCAG AA failure |
| Components | 5/10 | Inconsistent patterns across components |
| Animations | 4/10 | Basic transitions, no micro-interactions |
| Responsive | 5/10 | Works but tab nav breaks, inconsistent approach |
| UX Flows | 6/10 | Core flows work, missing shortcuts/efficiency |
| Print | 8/10 | Comprehensive print stylesheet |
| Polish | 6/10 | Good basics, missing error pages/shortcuts |
| **Overall** | **6/10** | Solid for a prototype, needs consistency for SaaS |

---

*Generated: 2026-02-06 by AUDIT Phase 2*
*Note: Screenshot-based breakpoint testing pending browser extension connection*
