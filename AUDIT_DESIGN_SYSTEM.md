# AUDIT: Design System Assessment

**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**File:** AUDIT_DESIGN_SYSTEM.md

---

## 1. CURRENT STATE

### Design System Foundation
The app has a **partial design system** defined via CSS custom properties in `:root`. It's more advanced than most prototypes but falls short of a production design system.

**What exists:**
- Color tokens (light + dark theme)
- Typography scale (10 sizes defined)
- Spacing scale (7 steps)
- Border radius scale (5 steps)
- Shadow scale (5 levels)
- Transition presets (3 speeds)

**What's missing:**
- Component-level tokens (button sizes, input heights, etc.)
- Animation/motion tokens
- Z-index scale
- Grid/layout tokens
- Icon system tokens
- Elevation system (shadows are defined but not consistently used)

### Token Adoption Rate

| Token Category | Defined | Used via var() | Hardcoded | Adoption |
|---------------|---------|---------------|-----------|----------|
| Font sizes | 10 tokens | 319 usages | 122 hardcoded | 72% |
| Border radius | 5 tokens | 144 usages | 71 hardcoded | 67% |
| Colors | ~40 tokens | ~500 usages | ~245 hex codes | ~67% |
| Spacing | 7 tokens | ~200 usages | ~300+ px values | ~40% |

**Verdict:** About 60% token adoption. The remaining 40% of hardcoded values will cause inconsistencies and make theme changes painful.

---

## 2. COLOR PALETTE INVENTORY

### Light Theme (Default)
```
Surfaces:    #f8f9fa (bg), #ffffff (surface/elevated)
Text:        #111827 (primary), #6b7280 (muted), #78818d (faint)
Accent:      #047857 (emerald, 5.5:1 contrast on white)
Semantic:    #047857 (positive), #dc2626 (negative), #b45309 (warning)
Brand:       #2563eb (belgium blue)
Borders:     #e5e7eb (default), #f3f4f6 (subtle)
```

### Dark Theme
```
Surfaces:    #0f1117 (bg), #1a1b23 (surface), #24252e (elevated)
Text:        #f0f1f3 (primary), #9ca3af (muted), #7c8694 (faint)
Accent:      #34d399 (emerald light)
Semantic:    #34d399 (positive), #f87171 (negative), #fbbf24 (warning)
Brand:       #60a5fa (belgium blue light)
Borders:     rgba(255,255,255,0.08) (default)
```

### Issues Found

1. **Duplicate token definitions:** `--text-secondary` duplicates `--text-muted`, `--bg-primary` duplicates `--bg`, `--accent-color` duplicates `--belgium`. These were added as "compatibility" tokens but create confusion.

2. **245 hardcoded hex colors in CSS:** Many components bypass the design system entirely with raw hex values like `#333`, `#666`, `#f0f0f0`, etc.

3. **Inconsistent semantic colors:** Some components use `color: #f87171` instead of `var(--negative)`. Some use `color: #4ade80` instead of `var(--positive)`.

4. **WCAG contrast issues addressed:** The code comments show previous FAIL scores were fixed (e.g., `--text-faint` was 2.4:1, now 3.7:1). However, 3.7:1 still fails WCAG AA for small text (requires 4.5:1). Only passes for large text (3:1).

---

## 3. TYPOGRAPHY INVENTORY

### Defined Scale (Major Third, 1.25 ratio)
```
--size-display:       32px  (2rem)
--size-page-title:    24px  (1.5rem)
--size-header:        20px  (1.25rem)
--size-section-title: 18px  (1.125rem)
--size-numbers:       16px  (1rem)
--size-body:          15px  (0.9375rem)
--size-labels:        14px  (0.875rem)
--size-small:         13px  (0.8125rem)
--size-caption:       12px  (0.75rem)
--size-tiny:          11px  (0.6875rem)
```

### Actual Usage (122 hardcoded font-sizes found)
Hardcoded values found in CSS:
- `9px` (1x) - Too small for any screen
- `10px` (3x) - Below minimum readable
- `11px` (8x) - Below WCAG minimum for body text
- `13px` (2x) - Should use `--size-small`
- `14px` (2x) - Should use `--size-labels`
- `16px` (5x) - Should use `--size-numbers`
- `18px` (2x) - Should use `--size-section-title`
- `24px` (1x) - Should use `--size-page-title`
- `32px` (1x) - Should use `--size-display`
- `0.8em`, `0.85em` (2x) - Relative sizing, inconsistent
- `1.3rem`, `1.4rem` (2x) - Not in scale
- `2.2rem`, `3rem` (2x) - Not in scale (used in modals/hero elements)
- Print sizes: `8pt`-`16pt` (5x) - Acceptable for `@media print`

### Font Families
- **DM Sans** (400, 500, 600, 700) - UI text, labels, headings
- **JetBrains Mono** (400, 700) - Financial numbers, monospace data
- Both loaded from Google Fonts with `preconnect`

### Issues
1. **122 hardcoded font-sizes** bypass the token system
2. **9px and 10px sizes** are illegible on most screens
3. **No responsive type scale** - font sizes don't adapt to viewport
4. **Mixed units** - px, em, rem, pt all used

---

## 4. SPACING INVENTORY

### Defined Scale (4px base)
```
--spacing-xs:  4px
--spacing-sm:  8px
--spacing-ms:  12px
--spacing-md:  16px
--spacing-lg:  24px
--spacing-xl:  32px
--spacing-2xl: 48px
```

### Issues
1. **~300+ hardcoded pixel values** for margins, padding, and gaps
2. Common offenders: `margin: 0.5rem`, `padding: 1rem 2rem`, `gap: 1rem` - all should use tokens
3. **Mixed units** for spacing: px, rem, em all used interchangeably
4. No `--spacing-3xl` (64px) or `--spacing-4xl` (96px) for section gaps

---

## 5. BORDER RADIUS INVENTORY

### Defined Scale
```
--radius-sm:   6px
--radius-md:   8px
--radius-lg:   12px
--radius-xl:   16px
--radius-full: 9999px
```

### Issues
- 71 hardcoded border-radius values: `4px`, `6px`, `8px`, `10px`, `14px`, `16px`, `50%`, etc.
- Many `border-radius: 8px` should be `var(--radius-md)`
- Calendar day cells use `4px` which isn't in the scale

---

## 6. SHADOW/ELEVATION INVENTORY

### Defined Scale
```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md: 0 4px 12px rgba(0,0,0,0.06)
--shadow-lg: 0 8px 24px rgba(0,0,0,0.08)
--shadow-xl: 0 20px 40px rgba(0,0,0,0.12)
```

### Usage
Shadows are reasonably well-adopted. Cards use `--shadow-xs`, modals use `--shadow-lg`. Some hardcoded `box-shadow` values exist but are fewer than other token categories.

---

## 7. COMPONENT INVENTORY

### Existing Components (CSS classes)
| Component | Variants | Consistency |
|-----------|----------|-------------|
| Buttons | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-small`, `.empty-cta` | Mixed - some use tokens, some hardcoded |
| Cards | `.scenario-card`, `.feature-card`, `.pricing-card` | 3 different card patterns |
| Forms | `.filter-select`, `.entity-form__input`, `input[type=text]` | 3+ different input styles |
| Tables | `.comparison-table`, `.expense-table` | Inconsistent styling |
| Modals | `dialog`, `.entity-modal-overlay`, `.day-editor-modal` | 3 different modal patterns |
| Tabs | `.tab-nav` + `.tab-label` | CSS-only, well-built |
| Badges | `.category-badge`, `.status-badge`, `.vies-badge` | Multiple badge types |
| Empty States | `.empty-state-illustrated` | Only 3 instances |
| Toast | `#toast-container` | Single pattern, good |
| Tooltips | `.tooltip-modal` | Custom implementation |

### Issues
1. **No component documentation** - developers must read CSS to understand available components
2. **3 different modal patterns** - native `<dialog>`, overlay div, and inline hidden divs
3. **Inconsistent button sizing** - some buttons have `padding: 6px 14px`, others `padding: 0.85rem 2rem`
4. **No icon system** - emojis used throughout (calculators, flags, etc.)
5. **No loading states** - no skeleton screens, spinners, or shimmer effects defined
6. **Tables not responsive** - tables overflow on mobile with no scrollable wrapper

---

## 8. RESPONSIVE BEHAVIOR

### Breakpoints Used
```
320px   - (tested but no specific @media)
400px   - max-width: 400px (1 rule)
600px   - max-width: 600px (6 rules)  -- mobile
700px   - max-width: 700px (1 rule)
768px   - min/max-width: 768px (8 rules) -- tablet
769px   - min-width: 769px (2 rules)
900px   - min/max-width: 900px (3 rules)
1024px  - min-width: 1024px (2 rules)
1280px  - min-width: 1280px (1 rule)
1440px  - min-width: 1440px (1 rule)
1920px  - min-width: 1920px (1 rule)
```

### Issues
1. **No defined breakpoint tokens** - each `@media` query uses a magic number
2. **Inconsistent mobile-first vs desktop-first** - mix of `min-width` and `max-width`
3. **29 total @media queries** scattered across 9,000+ lines of CSS
4. **No container queries** (newer CSS feature that would help component responsiveness)
5. **Tab navigation breaks at 768px** - tabs wrap or truncate

---

## 9. ACCESSIBILITY STATUS

| Aspect | Status | Evidence |
|--------|--------|----------|
| **Focus styles** | Partial | `:focus-visible` defined globally with `outline: 2px solid var(--accent)` |
| **ARIA labels** | Minimal | 40 `aria-label` attributes (for ~200+ interactive elements) |
| **ARIA roles** | Minimal | 15 `role=` attributes |
| **Focus trapping** | Missing | No focus trap in any modal/dialog |
| **Skip navigation** | Missing | No skip link |
| **Screen reader** | Untested | No `aria-live` regions except toast container |
| **Keyboard nav** | Partial | Tab key works, no custom shortcuts |
| **Color contrast** | Mostly passing | `--text-faint` at 3.7:1 fails AA for small text |
| **Touch targets** | Partial | Some buttons < 44px |
| **Reduced motion** | Missing | No `prefers-reduced-motion` media query |
| **High contrast** | Missing | No `forced-colors` support |

---

## 10. SAAS-READINESS DESIGN PATTERNS

| Pattern | Status | Notes |
|---------|--------|-------|
| Professional landing page | Exists | `index.html` - dark theme, basic but clean |
| Pricing page | Exists | Single "Free Forever" tier |
| Login/signup screens | Built (not connected) | Auth UI exists in dashboard |
| Onboarding wizard | Built | 4-step walkthrough, first-visit |
| Main dashboard with metrics | Partial | Scenarios tab acts as dashboard |
| Settings page | Missing | No settings UI |
| Notification system | Built | Toast notifications |
| Help/support integration | Missing | No help widget or docs |
| Feedback mechanism | Missing | No feedback form |
| Changelog | Missing | No what's new feature |
| Legal pages | Exist | terms.html, privacy.html |
| Data export | Partial | Print/clipboard, CSV/ICS for calendar |
| Account deletion | Missing | No GDPR deletion |
| Subscription/billing | Missing | No payment integration |
| Usage analytics dashboard | Missing | No admin dashboard |

**Score: 6/15 patterns present (40%)**

---

## 11. RECOMMENDATIONS

### Immediate (Fix inconsistencies)
1. **Replace all 122 hardcoded font-sizes** with design tokens
2. **Replace all 71 hardcoded border-radius** with tokens
3. **Replace all 245 hardcoded hex colors** with semantic tokens
4. **Replace all 300+ hardcoded spacing** with tokens
5. **Define breakpoint tokens** and use consistently
6. **Remove 9px/10px font sizes** - minimum body text should be 12px, preferably 13px

### Short-term (Component system)
1. **Standardize modals** - pick ONE pattern (recommend native `<dialog>` with consistent styling)
2. **Standardize buttons** - define S/M/L sizes with token-based padding
3. **Standardize forms** - unified input styling across all forms
4. **Add icon system** - replace emoji with SVG icons (Lucide or Heroicons)
5. **Add loading states** - skeleton screens for async content
6. **Add empty state pattern** - consistent illustration + CTA for all empty lists

### Medium-term (Production design system)
1. **Create design tokens file** - extract all tokens into a standalone JSON/CSS file
2. **Document components** - create a living style guide page
3. **Add responsive type scale** using `clamp()` for fluid typography
4. **Implement container queries** for component-level responsiveness
5. **Add `prefers-reduced-motion`** media query
6. **Add `forced-colors`** support for high contrast mode
7. **Implement z-index scale** for consistent layering

### Brand & Personality Recommendations
The current aesthetic is **Bloomberg-inspired financial dashboard** — this is a strong, differentiated choice. To evolve for SaaS:

- **Keep:** Dark theme as default, emerald green accent, JetBrains Mono for numbers
- **Improve:** Add more whitespace, reduce information density, softer shadows
- **Add:** Micro-animations (hover states, transitions, progress indicators)
- **Aspire to:** Linear/Stripe level of polish — clean, spacious, confident

---

*Generated: 2026-02-06 by AUDIT Phase 5*
