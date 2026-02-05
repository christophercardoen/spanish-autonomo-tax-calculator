# Spanish Autónomo Tax Calculator - Belgium Edition

## Project Overview

Interactive tax calculator and planning tool for a Spanish autónomo (self-employed consultant) working remotely for Belgian clients. Provides real-time visibility into net income, tax obligations, and deductible expenses while managing cross-border work complexities, the Spain-Belgium tax treaty, and the 183-day rule for tax residency.

**Status:** Project initialized, ready to start Phase 1
**Current Phase:** None (planning complete)
**Port:** 3013

## Core Value

Accurate, real-time calculation of net monthly income after all taxes (RETA + IRPF), with Belgium work cost tracking and 183-day residency management.

## Key Context

### Personal Situation
- **Tax residence:** Spain (domicilio fiscal)
- **Family:** Partner + 1 daughter (school-age), both living in Spain
- **Work:** IT/consulting services for Belgian companies
- **Work pattern:** ~204 days/year in Belgium (exceeds 183 threshold)
- **Protection:** Spain-Belgium treaty Article 4 + Art. 9.1.b LIRPF family presumption

### Fiscal Data (2025/2026)
- **RETA cuota:** €428.40/month (€5,140.80/year) - FIXED from registration
- **IRPF tramos:** 19%, 24%, 30%, 37%, 45%, 47%
- **Mínimo personal:** €5,550
- **Mínimo descendientes:** €2,400 (1 daughter)
- **Gastos difícil:** 5% with €2,000 annual cap
- **Dietas Belgium:** €91.35/day with overnight, €48.08 without

### Fixed Costs
**Deductible (Spain business):**
- Huur: €1,155 × 30% = €346.50/month
- GSM: €55 × 50% = €27.50/month
- Elektriciteit: €100 × 9% = €9.00/month
- **Total:** €383/month

**Deductible (Belgium work):**
- Pattern A&B: €1,000/month (3 days, 1 flight)
- Pattern C/D/E: €2,500/month (~17 days, 4 flights)

**Private (not deductible):**
- Huur 70%: €808.50/month
- GSM 50%: €27.50/month
- Elektriciteit 91%: €91.00/month
- Auto: €600/month
- Verzekeringen: €200/month
- **Total:** €1,727/month

### Scenarios
- **A:** €3,000 revenue, €750 expenses, €1,000 Belgium
- **B:** €6,000 revenue, €1,500 expenses, €1,000 Belgium
- **C:** €9,000 revenue, €3,000 expenses, €2,500 Belgium
- **D:** €12,000 revenue, €5,000 expenses, €2,500 Belgium
- **E:** €18,000 revenue, €8,000 expenses, €2,500 Belgium

## Technical Stack

**Frontend:**
- Single-file HTML with inline CSS and vanilla JavaScript
- Dark theme, financial dashboard aesthetic (Bloomberg-inspired)
- Fonts: DM Sans (UI), JetBrains Mono (numbers)
- NO frameworks, NO build tools
- Responsive design (desktop primary, mobile functional)

**Excel:**
- Multi-sheet workbook (.xlsx)
- Overview + 5 scenario sheets (A-E)
- ALL calculations use Excel formulas (no hardcoded values)
- Professional styling with color-coding

**Data sources:**
- Official 2025/2026 AEAT, BOE, Seguridad Social
- Spain-Belgium tax treaty (BOE-A-2003-13375)
- All fiscal data must have source citations

## Project Structure

```
.
├── CLAUDE.md                          # This file - project context
├── .planning/
│   ├── PROJECT.md                     # Core project definition
│   ├── REQUIREMENTS.md                # 59 v1 requirements + 10 v2
│   ├── ROADMAP.md                     # 7-phase execution plan
│   ├── STATE.md                       # Current project state
│   ├── config.json                    # GSD workflow config
│   └── research/
│       ├── FISCAL_DATA.md             # IRPF/RETA/mínimos/dietas
│       ├── TREATY.md                  # Spain-Belgium treaty analysis
│       ├── DEDUCTIONS.md              # Expense deduction rules
│       ├── PITFALLS.md                # 18 common autónomo mistakes
│       └── SUMMARY.md                 # Research synthesis
├── autonomo_dashboard.html            # Main HTML calculator (to build)
├── autonomo_calculator.xlsx           # Excel workbook (to build)
└── README.md                          # User documentation (to build)
```

## Roadmap (7 Phases)

**Phase 1: Fiscal Foundation** (15 reqs)
- Core IRPF/RETA calculations with verified 2025/2026 rates
- Mínimos, gastos difícil, source citations
- Foundation for all downstream features

**Phase 2: Expense Tracking** (5 reqs)
- Categorize Spain deductible vs Belgium costs vs private
- Formula display (e.g., "€1,155 × 30% = €346.50")
- Two Belgium cost patterns (€1K vs €2.5K)

**Phase 3: Scenario Engine** (7 reqs)
- Pre-configured scenarios A-E with correct defaults
- Custom scenario creation
- Live editing with instant recalculation
- Side-by-side comparison with optimal highlighting

**Phase 4: Belgium Calendar** (9 reqs)
- Interactive Feb-Dec 2026 calendar
- Toggle days: Belgium (🇧🇪), Spain (🇪🇸), Travel (✈️)
- Auto-count per month and annually
- 183-day threshold warnings
- Pre-fill contracted pattern (Mon-Tue + first-week Wed-Fri)

**Phase 5: Dashboard UI** (12 reqs)
- Professional financial dashboard (NOT generic AI design)
- Dark theme with DM Sans/JetBrains Mono typography
- Scenario cards with hover/expand
- Comparison table with sticky columns
- Color-coding: green/red/orange
- Export: print, copy to clipboard

**Phase 6: Excel Calculator** (10 reqs)
- Multi-sheet workbook (Overview + A/B/C/D/E)
- ALL formulas (no hardcoded calculated values)
- Professional styling
- Step-by-step IRPF/RETA breakdowns
- Error-free recalculation

**Phase 7: Compliance & Documentation** (10 reqs)
- 183-day warnings
- Spain-Belgium treaty tie-breaker provisions
- Centro de intereses vitales explanation
- Art. 9.1.b LIRPF family presumption
- Documentation requirements (factura completa, electronic payment)
- Dietas limits
- Disclaimer

## Next Steps

**To start Phase 1:**
```bash
/gsd:discuss-phase 1
# OR
/gsd:plan-phase 1
```

**To check progress:**
```bash
/gsd:progress
```

**To update GSD settings:**
```bash
/gsd:settings
```

## GSD Configuration

- **Mode:** YOLO (auto-approve)
- **Depth:** Comprehensive (8-12 phases, 5-10 plans each)
- **Parallelization:** Enabled
- **Research:** Enabled (before each phase)
- **Plan Check:** Enabled (verify plans achieve goals)
- **Verifier:** Enabled (confirm deliverables match goals)
- **Model Profile:** Quality (Opus for research/roadmap)
- **Commit Docs:** Yes (tracked in git)

## Ralph Loop Integration

**Purpose:** Auto-improvement cycles + context preservation

Ralph Loop will:
1. Monitor code quality and design patterns
2. Suggest improvements proactively
3. Maintain context across sessions
4. Ensure no loss of project state

**Status:** Ready for integration (use when starting Phase 1)

## Research Highlights

### Key Findings

1. **IRPF 2025 unchanged from 2024** - 6 brackets (19-47%)
2. **RETA fixed cuota preferred** - Use actual €428.40 from registration, not theoretical tramo
3. **183-day counting is complex** - Entry/exit days count in BOTH countries; AEAT uses "presumed days" doctrine
4. **Family situation is strongest defense** - Art. 9.1.b LIRPF creates legal presumption for Spanish residency
5. **Documentation is critical** - Factura completa + electronic payment mandatory for deductions
6. **Airbnb problematic** - Lacks factura completa, high audit risk
7. **Weekend travel gray area** - Conservative approach: first flight to BE = 100% business, last flight home = 100% business, weekend trips between = risky
8. **RETA regularization shock** - 23.8% of autónomos caught cotizing below actual tramo in 2025

### Confidence Levels

- **Fiscal data (IRPF/RETA):** HIGH - Multiple official sources verified
- **Treaty/Residency:** MEDIUM-HIGH - Treaty text confirmed, gray areas in autonomo services
- **Expense deductions:** MEDIUM-HIGH - Core rules verified, Belgian IVA recovery needs validation
- **Pitfalls:** HIGH - 18 pitfalls documented from TEAC rulings, DGT consultas

## Important Reminders

### For AI Agents Working on This Project

1. **Always read CLAUDE.md first** - Contains critical context that shouldn't be re-derived
2. **Use verified fiscal data** - All numbers in research files have official sources
3. **RETA cuota is FIXED** - €428.40/month regardless of tramo calculation
4. **Family situation matters** - Partner + daughter in Spain is key defense for residency
5. **NO frameworks** - Vanilla JS only, single-file HTML, no build tools
6. **Formulas not values** - Excel must use formulas, not hardcoded calculated values
7. **Design matters** - Financial dashboard aesthetic, NOT generic AI cards/gradients
8. **Source everything** - Every fiscal number needs AEAT/BOE/SS citation
9. **Sequential phases** - Build foundation first (calculations) before UI/features
10. **Ralph Loop approved** - Use for both improvement and context preservation

## Mandatory Browser Testing Rule

**CRITICAL: All code changes MUST be browser-tested before presenting to the user.**

This is non-negotiable. The user must never be the first person to discover broken code.

### When to Test

1. **After each wave completes** during `/gsd:execute-phase` — the orchestrator must open the page in Chrome, check for console errors, and verify key features render
2. **Before any human checkpoint** — load the page, run through the verification checklist, fix all errors found
3. **After any bug fix** — confirm the fix actually works in the browser

### How to Test

The orchestrator (not the executor subagents) performs browser testing using Claude in Chrome tools:

1. Navigate to `http://localhost:3013/autonomo_dashboard.html`
2. Check browser console for JavaScript errors (`read_console_messages` with pattern for errors)
3. Verify the relevant tab/feature renders (take screenshot, check key elements)
4. If errors found: fix them directly, commit the fix, and re-test
5. Only present checkpoint to user after zero console errors and visual confirmation

### What to Check

- **Console errors**: Any uncaught exceptions, reference errors, syntax errors
- **Page renders**: The page loads without blank screens or missing sections
- **Feature-specific**: New UI elements exist and are visible (modals, buttons, forms)
- **No regressions**: Previously working tabs/features still render

### Fix-Before-Present Rule

If browser testing reveals errors:
1. Fix the code directly (don't spawn a subagent)
2. Commit with format: `fix({phase}): {description of what was broken}`
3. Re-test to confirm the fix works
4. Only then continue to the next wave or present the checkpoint

### For User

- Project initialized and ready to build
- All planning files committed to git
- Port 3013 reserved for this project
- Run `/gsd:progress` anytime to see current state
- Run `/gsd:plan-phase 1` when ready to start building

---

*Last updated: 2026-01-29 after project initialization*
*Model: Claude Sonnet 4.5*
*GSD Version: Latest*
