# Spanish Autónomo Tax Calculator - Belgium Edition

## What This Is

An interactive tax calculator and planning tool for a Spanish autónomo (self-employed consultant) who works remotely for Belgian clients. The tool provides real-time visibility into net income, tax obligations, and deductible expenses while managing the complexities of cross-border work, the Spain-Belgium tax treaty, and the 183-day rule for tax residency.

## Core Value

**Accurate, real-time calculation of net monthly income after all taxes (RETA + IRPF), verified deductible expenses, and Belgium work costs — with confidence that fiscal residency is maintained in Spain.**

When financial decisions arise (taking on a new project, planning trips, adjusting expenses), this tool provides immediate clarity on the true impact to take-home pay.

## Requirements

### Validated

All requirements from v1.1 milestone (shipped 2026-02-03):

**Tax Calculations:**
- ✓ Calculate RETA contributions using actual registered cuota (€428.40/month fixed) — v1.1
- ✓ Calculate IRPF using official 2025/2026 progressive tax brackets (19%-47%) — v1.1
- ✓ Apply mínimo personal (€5,550) — v1.1
- ✓ Apply mínimo por descendientes (€2,400 for 1 daughter) — v1.1
- ✓ Apply 5% gastos de difícil justificación (max €2,000/year) — v1.1
- ✓ Apply 7% reducción rendimientos — v1.1
- ✓ Calculate effective tax rate — v1.1
- ✓ Show net income monthly and annually — v1.1

**Expense Tracking:**
- ✓ Track deductible Spanish business expenses (huur 30%, GSM 50%, elektriciteit 9%) — v1.1
- ✓ Track work travel costs with formula display — v1.1 (generalized from Belgium-specific)
- ✓ Track non-deductible private expenses for disposable income calculation — v1.1
- ✓ Categorize expenses clearly (deductible vs private) — v1.1
- ✓ Auto-detect 100% deductible expenses (IT/consulting keywords) — v1.1

**Scenario Planning:**
- ✓ Pre-configured scenarios A-E (€3K to €18K monthly revenue) — v1.1
- ✓ Custom scenario creation with user-defined values — v1.1
- ✓ Live editing of any value with auto-recalculation — v1.1
- ✓ Side-by-side scenario comparison — v1.1
- ✓ Highlight optimal scenarios based on disposable income — v1.1
- ✓ Reset to defaults functionality — v1.1

**Belgium Work Calendar:**
- ✓ Interactive calendar Feb-Dec 2026 with exact dates — v1.1
- ✓ Toggle days between Belgium, Spain, Travel — v1.1
- ✓ Auto-count days per month and annually — v1.1
- ✓ 183-day threshold warning system — v1.1
- ✓ Pre-fill with contracted pattern (Mon-Tue, first-week Wed-Fri) — v1.1
- ✓ Visual indication of contractual vs flexible days — v1.1
- ✓ Multi-select (week/month selection, checkbox interface) — v1.1
- ✓ Export (ICS, CSV, clipboard) — v1.1

**Interactive Dashboard:**
- ✓ Professional financial dashboard (Bloomberg-inspired dark theme) — v1.1
- ✓ Scenario cards with hover effects and drill-down — v1.1
- ✓ Expandable cost breakdowns with formula details — v1.1
- ✓ Comparison table with sticky headers — v1.1
- ✓ Responsive design (desktop + mobile) — v1.1
- ✓ Export to print, clipboard — v1.1
- ✓ DM Sans + JetBrains Mono typography — v1.1
- ✓ Interactive What-If Calculator tab — v1.1

**Excel Calculator:**
- ✓ Multi-sheet workbook (Overview + 5 scenarios + Constants) — v1.1
- ✓ Overview sheet with comparison table — v1.1
- ✓ Detailed sheets per scenario (A-E) — v1.1
- ✓ All formulas (NO hardcoded calculated values) — v1.1
- ✓ Professional styling with conditional formatting — v1.1
- ✓ Recalculates correctly (no errors) — v1.1
- ✓ Dutch localization — v1.1

**Fiscal Compliance:**
- ✓ Verified calculations with official Spanish sources (13 AEAT/BOE/SS links) — v1.1
- ✓ Spain-Belgium treaty Article 4 tie-breaker provisions — v1.1
- ✓ Centro de intereses vitales + Art. 9.1.b family presumption — v1.1
- ✓ Dietas extranjero limits (€91.35/€48.08) — v1.1
- ✓ 183-day threshold warning system — v1.1
- ✓ Documentation requirements (factura completa, electronic payment) — v1.1
- ✓ Disclaimer — v1.1

**Additional Features:**
- ✓ Income tracking tab with client/invoice management — v1.1
- ✓ Clickable official source citations throughout UI — v1.1

### Active

**Current Milestone:** v2.0 Multi-Entity Business Management System

**Goal:** Transform from simulation tool to production multi-tenant business management system supporting Spanish SMEs (autónomo + Sociedad Limitada) with multi-entity support, client CRM, invoice generation, receipt OCR, and dual tax automation engines.

**Target features (223 requirements across 18 phases):**

**Core Infrastructure:**
- Multi-entity management (autónomo + SL with entity type selection)
- Authentication & permissions (multi-user with roles: Owner, Gestor, Accountant, Partner)
- Offline-first data architecture (IndexedDB/Dexie.js with cloud sync)

**CRM & Operations:**
- Client management with NIF/VIES validation and global categorization (EU/UK/US/CA/AU)
- Project tracking per client with rates and work patterns
- Invoice generation (factura completa + VeriFactu QR codes)
- Receipt upload with OCR (Mindee API, 90-95% accuracy on European receipts)
- Enhanced calendar with client tagging (preserves 183-day tracking)

**Tax Automation:**
- Autónomo: Modelo 130 quarterly, IRPF progressive (19-47%), RETA regularization, gastos difícil 5%
- SL: Modelo 202/200, Impuesto de Sociedades (15-25%), BINs carry-forward, NO gastos difícil
- SL Accounting: P&L, balance sheet, Cuentas Anuales (Registro Mercantil filing)
- Cross-entity integration: Dual activity detection, related-party transactions, salary vs dividend optimizer
- IVA multi-jurisdiction: Modelo 303/390/349, inversión sujeto pasivo, VIES, W-8BEN tracking

**Platform:**
- Progressive Web App (PWA) with service worker
- Mobile-optimized UX (camera upload, offline queue, 44px touch targets)
- Cloud sync (Supabase) with conflict resolution
- Data migration from v1.1 localStorage
- Comprehensive reports & analytics

### Out of Scope

- **Multi-country support** — This is Spain-Belgium specific, not a general EU calculator
- **Historical data** — 2026 planning only, not tracking previous years
- **Automatic bank integration** — Manual input of expenses
- **IVA/VAT calculations** — Focuses on income tax, not VAT compliance
- **Gestor API integration** — Standalone tool, not integrated with tax advisors' systems
- **Multi-user accounts** — Single-user tool for personal use
- **Mobile native apps** — Web-based responsive design only

## Current State

**Version Shipped:** v1.1 (2026-02-03)

**Deliverables:**
- `autonomo_dashboard.html` - Single-file tax calculator (8,980 lines)
- `autonomo_calculator.xlsx` - Excel workbook with formulas
- Complete compliance documentation with official source links

**Codebase:**
- ~10,000 lines of code (HTML/JS + Excel generator)
- 79 requirements satisfied
- 11 phases complete (29 plans executed)
- Production-ready

**Tech Stack:**
- Vanilla JavaScript (no frameworks)
- DM Sans + JetBrains Mono typography
- Dark theme (#1a1a1a charcoal background)
- Responsive design (44px touch targets)
- localStorage for data persistence
- ExcelJS for workbook generation

**Known Tech Debt (LOW severity):**
- Excel generation requires manual Node.js execution
- Three similar IRPF functions (intentional for flexibility)

**User Feedback Themes:**
- Initial testing revealed need for English localization (completed)
- Calendar UX improved with checkbox multi-select (completed)
- Expense auto-detection highly valued (completed)

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
| Sequential phased approach | 11 phases: calculations → expenses → scenarios → calendar → UI → Excel → compliance → bug fixes → polish → enhancements. Solid foundation before complexity. | ✓ Good - Clear progression enabled quality |
| Fixed RETA cuota (€428.40/month) | Use actual registered amount regardless of theoretical tramo. Reflects real-world payment. | ✓ Good - Matches user's tax obligations |
| Work travel costs deductible | All work travel costs (flights, accommodation, dietas) treated as deductible based on contractual on-site requirements. | ✓ Good - Generalized from Belgium-specific |
| Spain-Belgium treaty reliance | Treaty Article 4 + Art. 9.1.b family presumption as defense for Spanish residency despite >183 days abroad. | ✓ Good - Comprehensive compliance documentation |
| Interactive calendar essential | Calendar is core feature with 183-day management, multi-select, export. | ✓ Good - Highly valued by user |
| Single-file HTML design | No build tools or frameworks. Portable, inspectable, easy to maintain. | ✓ Good - 8,980 lines, production-ready |
| 4-phase AEAT mínimo method | Minimos reduce TAX liability, not taxable BASE. Official methodology. | ✓ Good - Legally correct calculations |
| Native dialog elements | HTML5 dialog for all modals (tooltips, edit forms, day picker). | ✓ Good - Accessibility built-in |
| DM Sans + JetBrains Mono | Professional financial typography (Bloomberg-inspired). | ✓ Good - Distinctive aesthetic |
| "Disposable Income" over "Leefgeld" | English terminology for international clarity. | ✓ Good - User testing confirmed improvement |
| Checkbox multi-select calendar | Gmail-style pattern more intuitive than shift-click ranges. | ✓ Good - User testing confirmed improvement |

---
*Last updated: 2026-02-03 after v2.0 milestone initialization*
