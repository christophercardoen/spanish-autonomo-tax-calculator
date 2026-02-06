# AUDIT: Master Improvement Plan

**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**File:** AUDIT_IMPROVEMENT_PLAN.md

---

## 1. EXECUTIVE SUMMARY

### Current State
The Autonomo Tax Calculator is a **32,560-line single-file prototype** that solves a real, unserved problem: cross-border tax planning for Spanish autonomos. It has working IRPF calculations, 183-day tracking, expense management, invoicing, and client management. However, it is Belgium-specific, has no user accounts, no cloud sync, and significant technical debt.

### Audit Scores

| Phase | Document | Score | Status |
|-------|----------|-------|--------|
| 0 | AUDIT_PROJECT_MAP.md | N/A | Complete inventory |
| 1 | AUDIT_COMPETITIVE_ANALYSIS.md | 5.8/10 | Strong niche, weak breadth |
| 2 | AUDIT_VISUAL_UX.md | 6/10 | Functional, needs polish |
| 3 | AUDIT_FEATURE_GAPS.md | N/A | 10 critical, 12 important gaps |
| 4 | AUDIT_TECHNICAL.md | 4.9/10 | Prototype quality, not production |
| 5 | AUDIT_DESIGN_SYSTEM.md | 6/10 | 60% token adoption |

**Composite SaaS-readiness: 4.5/10**

### What Works
- IRPF calculation engine (verified against AEAT 2025/2026)
- 183-day residency tracking (unique -- no competitor has this)
- Cross-border treaty compliance documentation
- Dietas per diem calculation
- Client management with NIF/CIF validation
- Invoice generation with VeriFactu QR
- Multi-entity support (Autonomo + SL switching)
- Light/dark theme with design token foundation

### What Blocks Launch
1. **Belgium-only** -- Cannot serve the broader Spanish autonomo market
2. **No user accounts** -- Auth UI built but Supabase not connected
3. **No cloud sync** -- All data is local-only (IndexedDB + localStorage)
4. **Missing Modelo 303/390** -- Every autonomo must file quarterly IVA
5. **Input validation gaps** -- Tax calculations accept invalid inputs
6. **No data backup** -- Users can lose everything
7. **No GDPR deletion** -- EU legal requirement
8. **WCAG accessibility failures** -- Blocks public sector/enterprise users

---

## 2. PRIORITIZED IMPROVEMENT PHASES

### Phase A: Security & Data Integrity (Week 1)
**Goal:** Fix all bugs and security issues. No new features.

| # | Task | Effort | Source |
|---|------|--------|--------|
| A-1 | Fix innerHTML XSS at line 25330 (archived expenses) | S | AUDIT_TECHNICAL T-12 |
| A-2 | Validate QR code data URI at line 19354 | S | AUDIT_TECHNICAL T-12 |
| A-3 | Consolidate 3 escapeHtml functions into 1 | S | AUDIT_TECHNICAL T-7 |
| A-4 | Add SRI hashes to all CDN scripts | S | AUDIT_TECHNICAL T-10 |
| A-5 | Add input validation to tax calculations (NaN, negative, max) | M | AUDIT_FEATURE_GAPS C-1 |
| A-6 | Fix financial precision (use integer cents consistently) | M | AUDIT_TECHNICAL |
| A-7 | Log service worker registration failures | S | AUDIT_TECHNICAL T-11 |
| A-8 | Add error boundaries (show user-facing errors, not just console) | M | AUDIT_FEATURE_GAPS C-8 |
| A-9 | Add `prefers-reduced-motion` media query | S | AUDIT_VISUAL_UX |
| A-10 | Fix `--text-faint` WCAG AA contrast failure (3.7:1 -> 4.5:1) | S | AUDIT_DESIGN_SYSTEM |

**Acceptance criteria:** Zero known security issues, all tax calculations validate input, user-facing errors for all failure paths.

---

### Phase B: Generalization (Week 2-3)
**Goal:** Remove Belgium-specific code, support any EU country.

| # | Task | Effort | Source |
|---|------|--------|--------|
| B-1 | Refactor calendar locations from Belgium/Spain/Travel to dynamic country system | L | AUDIT_FEATURE_GAPS C-2 |
| B-2 | Add AEAT per diem table (country-specific dietas rates) | M | AUDIT_FEATURE_GAPS C-6 |
| B-3 | Generalize 183-day tracking to per-country day counting | M | AUDIT_FEATURE_GAPS C-2 |
| B-4 | Refactor compliance tab from Spain-Belgium to treaty library | L | AUDIT_FEATURE_GAPS C-2 |
| B-5 | Update landing page from "in Belgium" to "cross-border" | S | AUDIT_FEATURE_GAPS C-2 |
| B-6 | Update OG meta tags to generic description | S | AUDIT_FEATURE_GAPS C-2 |
| B-7 | Make scenario presets configurable (not hardcoded to user's amounts) | M | AUDIT_FEATURE_GAPS |
| B-8 | Make fixed costs configurable (not hardcoded huur/GSM/elektriciteit) | S | AUDIT_FEATURE_GAPS |

**Acceptance criteria:** App works for any Spanish autonomo working in any EU country. Belgium is one option, not the only option.

---

### Phase C: Core Tax Compliance (Week 3-4)
**Goal:** Add the tax models every autonomo needs.

| # | Task | Effort | Source |
|---|------|--------|--------|
| C-1 | Implement Modelo 303 (quarterly IVA declaration) | L | AUDIT_FEATURE_GAPS C-4 |
| C-2 | Implement Modelo 390 (annual IVA summary) | M | AUDIT_FEATURE_GAPS C-5 |
| C-3 | Add tarifa plana support (80 EUR new autonomo rate) | S | AUDIT_FEATURE_GAPS I-3 |
| C-4 | Add reduced IVA rates (10%, 4%) for eligible activities | S | AUDIT_FEATURE_GAPS I-6 |
| C-5 | Add tax calendar with Modelo deadlines and reminders | M | AUDIT_FEATURE_GAPS I-10 |
| C-6 | Deploy VIES Edge Function for EU VAT validation | S | AUDIT_FEATURE_GAPS C-7 |

**Acceptance criteria:** Autonomos can calculate all quarterly tax obligations (Modelo 130 + 303) and see upcoming deadlines.

---

### Phase D: Auth & Cloud (Week 5-6)
**Goal:** Users can create accounts, sync data across devices.

| # | Task | Effort | Source |
|---|------|--------|--------|
| D-1 | Connect Supabase authentication (Google OAuth + magic link) | M | AUDIT_FEATURE_GAPS C-3 |
| D-2 | Implement data backup/export (JSON) | M | AUDIT_FEATURE_GAPS C-9 |
| D-3 | Implement GDPR account deletion | M | AUDIT_FEATURE_GAPS C-10 |
| D-4 | Implement cloud sync (Supabase) - basic entity + client data | L | AUDIT_FEATURE_GAPS I-8 |
| D-5 | Migrate localStorage data to IndexedDB (remove dual-state) | M | AUDIT_TECHNICAL T-9 |
| D-6 | Add offline indicator and sync status | S | AUDIT_VISUAL_UX |

**Acceptance criteria:** Users can sign up, sign in, export their data, delete their account, and see their data on multiple devices.

---

### Phase E: Design System Completion (Week 7)
**Goal:** 95%+ design token adoption, consistent components.

| # | Task | Effort | Source |
|---|------|--------|--------|
| E-1 | Replace 122 hardcoded font-sizes with design tokens | M | AUDIT_DESIGN_SYSTEM |
| E-2 | Replace 71 hardcoded border-radius values with tokens | S | AUDIT_DESIGN_SYSTEM |
| E-3 | Replace 245 hardcoded hex colors with semantic tokens | L | AUDIT_DESIGN_SYSTEM |
| E-4 | Replace 300+ hardcoded spacing values with tokens | L | AUDIT_DESIGN_SYSTEM |
| E-5 | Remove 9px/10px font sizes (minimum: 12px) | S | AUDIT_DESIGN_SYSTEM |
| E-6 | Standardize modals to native `<dialog>` (remove 2 other patterns) | M | AUDIT_DESIGN_SYSTEM |
| E-7 | Standardize button sizing (S/M/L with token-based padding) | S | AUDIT_DESIGN_SYSTEM |
| E-8 | Standardize form input styling across all forms | M | AUDIT_DESIGN_SYSTEM |
| E-9 | Add loading states (skeleton screens for async content) | M | AUDIT_VISUAL_UX |
| E-10 | Add empty states for all lists (income, calendar) | S | AUDIT_VISUAL_UX |

**Acceptance criteria:** Token adoption > 95%. All components follow consistent patterns.

---

### Phase F: Accessibility (Week 8)
**Goal:** WCAG AA compliance.

| # | Task | Effort | Source |
|---|------|--------|--------|
| F-1 | Add ARIA labels to all interactive elements (from 20% to 90%+) | M | AUDIT_TECHNICAL |
| F-2 | Implement focus trapping in all modals/dialogs | M | AUDIT_VISUAL_UX |
| F-3 | Add skip navigation link | S | AUDIT_TECHNICAL |
| F-4 | Add `aria-live` regions for dynamic content updates | S | AUDIT_TECHNICAL |
| F-5 | Ensure all touch targets >= 44px | S | AUDIT_VISUAL_UX |
| F-6 | Add keyboard shortcuts for common actions | M | AUDIT_VISUAL_UX |
| F-7 | Add `forced-colors` media query for high contrast | S | AUDIT_TECHNICAL |

**Acceptance criteria:** Pass WCAG AA automated checks. All modals trap focus. All interactive elements have ARIA labels.

---

### Phase G: Competitive Features (Week 9-12)
**Goal:** Features that differentiate against competitors.

| # | Task | Effort | Source |
|---|------|--------|--------|
| G-1 | Invoice duplication | S | AUDIT_FEATURE_GAPS I-11 |
| G-2 | Expense list pagination/virtual scroll | M | AUDIT_FEATURE_GAPS I-12 |
| G-3 | RETA tramo system (not just fixed cuota) | M | AUDIT_FEATURE_GAPS I-4 |
| G-4 | Modelo 349 (EU intra-community operations) | M | AUDIT_FEATURE_GAPS I-5 |
| G-5 | Tax Timeline widget (inspired by FreeAgent) | M | AUDIT_COMPETITIVE_ANALYSIS |
| G-6 | "You saved X" tax optimization feedback | S | AUDIT_COMPETITIVE_ANALYSIS |
| G-7 | Tasks widget (what needs attention) | M | AUDIT_COMPETITIVE_ANALYSIS |
| G-8 | Settings page | M | AUDIT_DESIGN_SYSTEM |
| G-9 | Help/support integration | S | AUDIT_DESIGN_SYSTEM |
| G-10 | Feedback mechanism | S | AUDIT_DESIGN_SYSTEM |

**Acceptance criteria:** Core competitive features implemented. Dashboard shows tax timeline, action items, and savings feedback.

---

### Phase H: SL Support (Month 4+)
**Goal:** Serve the 50% of target market that uses Sociedad Limitada.

| # | Task | Effort | Source |
|---|------|--------|--------|
| H-1 | Impuesto de Sociedades calculation (25%/15%) | XL | AUDIT_FEATURE_GAPS I-1 |
| H-2 | Modelo 200 (annual IS) | L | AUDIT_FEATURE_GAPS I-2 |
| H-3 | Modelo 202 (advance IS payments) | M | AUDIT_FEATURE_GAPS I-2 |
| H-4 | Salary vs dividend optimizer | L | AUDIT_FEATURE_GAPS I-9 |
| H-5 | RETA obligatorio for SL administrators | M | AUDIT_FEATURE_GAPS |
| H-6 | Cuentas Anuales (P&L + Balance) | L | AUDIT_FEATURE_GAPS |

---

## 3. TECHNICAL DEBT PAYDOWN SCHEDULE

Integrated into the phases above, but called out explicitly:

| Debt | Phase | Task |
|------|-------|------|
| 3 duplicate escapeHtml functions | A | A-3 |
| Silent service worker failures | A | A-7 |
| WCAG contrast failure | A | A-10 |
| 85% XSS escape coverage | A | A-1, A-2 |
| No SRI hashes | A | A-4 |
| Belgium-specific hardcoding | B | B-1 through B-8 |
| Dual localStorage/IndexedDB | D | D-5 |
| 122 hardcoded font sizes | E | E-1 |
| 245 hardcoded hex colors | E | E-3 |
| 300+ hardcoded spacing values | E | E-4 |
| 87 console.log statements | E | Strip during token replacement |
| Event listener accumulation (79 add, 0 remove) | Future | Requires architecture refactor |
| 32K single-file monolith | Future | Accept as intentional constraint per CLAUDE.md |
| Zero automated tests | Future | Add when code stabilizes |

---

## 4. EFFORT ESTIMATES

### By Phase

| Phase | Effort | Duration | Dependencies |
|-------|--------|----------|--------------|
| **A: Security & Data Integrity** | M (12-20h) | Week 1 | None |
| **B: Generalization** | L (24-40h) | Week 2-3 | A complete |
| **C: Core Tax Compliance** | L (24-40h) | Week 3-4 | A complete |
| **D: Auth & Cloud** | L-XL (32-48h) | Week 5-6 | A complete |
| **E: Design System** | L (24-40h) | Week 7 | A complete |
| **F: Accessibility** | M (16-24h) | Week 8 | E complete |
| **G: Competitive Features** | L (24-40h) | Week 9-12 | B, C, D complete |
| **H: SL Support** | XL (60-100h) | Month 4+ | C complete |

### Parallelization Opportunities

These phases can run in parallel:
- **B + C** (generalization + tax compliance) -- independent feature work
- **D + E** (auth + design system) -- independent infrastructure work
- **F + G** (accessibility + competitive features) -- both depend on E

### Critical Path
```
A (Security) -> B (Generalize) + C (Tax) -> D (Auth) -> G (Competitive) -> Launch
                                             |
                                             E (Design) -> F (Accessibility)
```

---

## 5. SUCCESS METRICS

### Phase A Complete
- [ ] Zero XSS vulnerabilities
- [ ] All tax calculations reject invalid input
- [ ] User sees error messages (not just console)
- [ ] WCAG AA contrast passes

### Phase B Complete
- [ ] Calendar supports any EU country
- [ ] Per diem rates from AEAT table (not just Belgium)
- [ ] 183-day tracking works for any country
- [ ] Landing page says "cross-border" not "Belgium"

### Phase C Complete
- [ ] Modelo 303 calculation matches manual form
- [ ] Tax calendar shows all quarterly deadlines
- [ ] VIES validation works live

### Phase D Complete
- [ ] User can sign up, sign in, sign out
- [ ] Data exports as JSON
- [ ] Account can be deleted (GDPR)
- [ ] Data syncs to second device within 30 seconds

### Phase E Complete
- [ ] Token adoption > 95% (font sizes, colors, spacing, radius)
- [ ] Only `<dialog>` pattern used for modals
- [ ] All lists have empty states
- [ ] Loading skeletons on async content

### Phases F+G Complete (Launch-ready)
- [ ] WCAG AA automated checks pass
- [ ] Tax Timeline widget shows deadlines
- [ ] Invoice duplication works
- [ ] Settings page exists
- [ ] Help/feedback mechanisms exist

---

## 6. COMPETITIVE POSITIONING POST-IMPROVEMENT

After completing Phases A-G:

| Dimension | Current | Target | Competitor Benchmark |
|-----------|---------|--------|---------------------|
| Unique differentiation | 9/10 | 9/10 | No change needed |
| Feature completeness | 4/10 | 7/10 | Matches Contasimple, below Holded |
| Pricing competitiveness | 8/10 | 9/10 | Free tier + cross-border niche |
| UI/UX quality | 5/10 | 7/10 | Approaches Quipu |
| Market readiness | 3/10 | 7/10 | Launchable for cross-border autonomos |
| Addressable market | 6/10 | 8/10 | All cross-border autonomos + SL path |
| **Overall** | **5.8/10** | **7.8/10** | Competitive in niche |

---

## 7. RISKS AND MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Single-file monolith becomes unmaintainable | HIGH | HIGH | Accept per CLAUDE.md; add code markers for navigation |
| AEAT changes tax rates mid-year | LOW | MEDIUM | Abstract rates into FISCAL_YEARS constant (already done) |
| Supabase pricing changes | LOW | MEDIUM | Free tier sufficient for launch; IndexedDB as fallback |
| CDN dependency breaks | LOW | HIGH | Add SRI hashes (Phase A-4); consider self-hosting critical libs |
| Competitor launches cross-border features | LOW | HIGH | Speed advantage; first-mover in niche |
| EU GDPR enforcement action | MEDIUM | HIGH | Phase D-3 (GDPR deletion) is priority |

---

## 8. IMMEDIATE NEXT STEPS

**Start Phase A immediately.** Tasks A-1 through A-10 can be completed in a single focused session:

1. Fix the two XSS issues (lines 25330, 19354)
2. Consolidate escapeHtml to single function
3. Add SRI hashes to CDN scripts
4. Add input validation to all tax calculation entry points
5. Add user-facing error messages for all silent failures
6. Fix WCAG contrast ratio on `--text-faint`
7. Add `prefers-reduced-motion` media query
8. Log service worker registration failures

Then proceed to **Phase B** (generalization) to unlock the full addressable market.

---

*Generated: 2026-02-06 by AUDIT Phase 6*
*This plan synthesizes findings from all 6 audit phases across 7 audit documents.*
