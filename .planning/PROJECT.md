# Spanish Autónomo Tax Calculator - Belgium Edition

## What This Is

An interactive tax calculator and planning tool for a Spanish autónomo (self-employed consultant) who works remotely for Belgian clients. The tool provides real-time visibility into net income, tax obligations, and deductible expenses while managing the complexities of cross-border work, the Spain-Belgium tax treaty, and the 183-day rule for tax residency.

## Core Value

**Accurate, real-time calculation of net monthly income after all taxes (RETA + IRPF), verified deductible expenses, and Belgium work costs — with confidence that fiscal residency is maintained in Spain.**

When financial decisions arise (taking on a new project, planning trips, adjusting expenses), this tool provides immediate clarity on the true impact to take-home pay.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Tax Calculations:**
- [ ] Calculate RETA contributions using actual registered cuota (€428.40/month fixed)
- [ ] Calculate IRPF using official 2025/2026 progressive tax brackets
- [ ] Apply mínimo personal (€5,550 or verified 2026 amount)
- [ ] Apply mínimo por descendientes for 1 daughter
- [ ] Apply 5% gastos de difícil justificación (max €2,000/year)
- [ ] Apply 7% reducción rendimientos (generic SS expenses)
- [ ] Calculate effective tax rate
- [ ] Show net income monthly and annually

**Expense Tracking:**
- [ ] Track deductible Spanish business expenses (huur 30%, GSM 50%, elektriciteit 9%)
- [ ] Track Belgium work costs (flights, accommodation, local transport, dietas)
- [ ] Track non-deductible private expenses for leefgeld calculation
- [ ] Categorize expenses clearly (deductible vs private)
- [ ] Support two Belgium cost patterns (€1,000 vs €2,500/month)

**Scenario Planning:**
- [ ] Pre-configured scenarios A-E (€3K to €18K monthly revenue)
- [ ] Custom scenario creation with user-defined values
- [ ] Live editing of any value with auto-recalculation
- [ ] Side-by-side scenario comparison
- [ ] Highlight optimal scenarios based on goals

**Belgium Work Calendar:**
- [ ] Interactive calendar Feb-Dec 2026 with exact dates
- [ ] Toggle days between Belgium (🇧🇪), Spain (🇪🇸), Travel (✈️)
- [ ] Auto-count days per month in each location
- [ ] Annual total with 183-day threshold warning
- [ ] Pre-fill with contracted pattern (Mon-Tue, first-week Wed-Fri)
- [ ] Visual indication of contractual obligations vs flexible days

**Interactive Dashboard:**
- [ ] Financial dashboard aesthetic (professional, Bloomberg-inspired)
- [ ] Scenario cards with hover effects and drill-down
- [ ] Expandable cost breakdowns showing formula details
- [ ] Comparison table with sticky headers
- [ ] Responsive design (desktop primary, mobile functional)
- [ ] Export to print, PDF, clipboard

**Excel Calculator:**
- [ ] Professional multi-sheet workbook
- [ ] Overview sheet with all scenarios
- [ ] Detailed sheets per scenario (A-E)
- [ ] All formulas (NO hardcoded calculated values)
- [ ] Professional styling with color-coding
- [ ] Recalculates correctly (no #REF!, #DIV/0! errors)

**Fiscal Compliance:**
- [ ] Verify all calculations with official Spanish sources
- [ ] Document Spain-Belgium tax treaty tie-breaker provisions
- [ ] Calculate dietas extranjero with official 2025/2026 rates
- [ ] Warning system for 183-day threshold proximity
- [ ] Disclaimer that this is not official tax advice

### Out of Scope

- **Multi-country support** — This is Spain-Belgium specific, not a general EU calculator
- **Historical data** — 2026 planning only, not tracking previous years
- **Automatic bank integration** — Manual input of expenses
- **IVA/VAT calculations** — Focuses on income tax, not VAT compliance
- **Gestor API integration** — Standalone tool, not integrated with tax advisors' systems
- **Multi-user accounts** — Single-user tool for personal use
- **Mobile native apps** — Web-based responsive design only

## Context

### Personal Situation
- **Status:** Spanish autónomo (trabajador por cuenta propia)
- **Domicilio fiscal:** Spain
- **Family:** Partner + 1 daughter (school-age), both living in Spain
- **Clients:** Belgian companies (consultancy/IT services)
- **Work pattern:** Mix of remote (Spain) and on-site (Belgium)

### RETA Registration
- **Monthly cuota:** €428.40 (fixed, registered amount)
- **Breakdown:**
  - Contingencias comunes: €384.88
  - Contingencias profesionales: €17.68
  - Mecanismo de equidad intergeneracional: €12.24
  - Formación profesional: €1.36
  - Cese de actividad: €12.24

### Fixed Costs
**Deductible business expenses (Spain):**
- Huur: €1,155 × 30% = €346.50/month
- GSM: €55 × 50% = €27.50/month
- Elektriciteit: €100 × 9% = €9.00/month
- **Total:** €383/month

**Belgium work costs:**
- Pattern A&B: €1,000/month (3 days, 1 flight)
- Pattern C/D/E: €2,500/month (~17 days, 4 flights)
- Includes: flights (IVA-exempt), accommodation, local transport, dietas

**Private expenses:**
- Huur (70% private): €808.50/month
- GSM (50% private): €27.50/month
- Elektriciteit (91% private): €91.00/month
- Auto: €600/month
- Verzekeringen: €200/month
- **Total:** €1,727/month

### Work Requirements
**Contractual obligations:**
- Client 1: Monday-Tuesday every week (Belgium)
- Client 2: Wednesday-Friday first week of each month (Belgium)

**Typical monthly pattern (C/D/E scenarios):**
- Week 1: 7 days in Belgium (Mon-Sun full week)
- Week 2-3: Mon-Tue in Belgium, Wed-Fri in Spain, weekend flight
- Week 4: Mon-Tue in Belgium, rest in Spain
- **Total:** ~17 days/month in Belgium = ~204 days/year

### 183-Day Rule Risk
- **Days in Belgium:** ~204/year (exceeds 183 threshold)
- **Protection:** Spain-Belgium tax treaty Article 4 tie-breaker rules
- **Strongest argument:** Partner + daughter permanently in Spain (Art. 9.1.b LIRPF)
- **Centro de intereses vitales:** Family + home in Spain outweighs work days in Belgium

### Fiscal Year Reference
- **Target year:** 2026
- **Data sources:** 2025/2026 official rates (AEAT, Seguridad Social, BOE)
- **IRPF tramos:** To be verified from Agencia Tributaria
- **Dietas extranjero:** To be verified (estimated €91.35/day con pernocta, €48.08 sin pernocta)

## Constraints

- **Tech stack:** Single-file HTML (CSS + vanilla JS), Excel (.xlsx) — no external frameworks or build tools required
- **Data sources:** Must verify all fiscal data from official Spanish government sources (AEAT, BOE, Seguridad Social)
- **Timeline:** Methodical approach, quality over speed — no rush to ship
- **User:** Single user (you), desktop-primary experience
- **Design:** Professional financial dashboard aesthetic (Bloomberg-inspired, not generic AI design)
- **Accuracy:** Calculations must be verifiable and traceable to official sources
- **Context preservation:** Full project context in CLAUDE.md and GSD state files

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sequential phased approach | Four clear phases: calculations → design → interactivity → calendar. Ensures solid foundation before adding complexity. | — Pending |
| Fixed RETA cuota vs tramo calculation | Use actual registered €428.40/month regardless of theoretical tramo. Reflects real-world payment. | — Pending |
| Belgium costs 100% deductible | All Belgium work costs (flights, accommodation, dietas) treated as fully deductible based on contractual on-site requirements. | — Pending |
| Spain-Belgium treaty reliance | Use treaty tie-breaker provisions (Art. 4) as defense for Spanish residency despite >183 days in Belgium. Family situation is strongest argument. | — Pending |
| Interactive calendar essential | Calendar is core feature, not nice-to-have. Needed to actively manage 183-day compliance and plan trips. | — Pending |
| Single-file HTML design | No build tools or frameworks. Keeps tool portable, inspectable, and easy to maintain. | — Pending |
| Ralph Loop integration | Use for both auto-improvement cycles and context preservation across sessions. | — Pending |

---
*Last updated: 2026-01-29 after initialization*
