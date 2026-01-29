# Project Research Summary

**Project:** Spanish Autonomo Tax Calculator (Belgium Cross-Border Work)
**Domain:** Tax compliance and financial management tool
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

Spanish autonomos (self-employed individuals) working cross-border with Belgium face one of the most complex tax environments in the EU: dual-jurisdiction compliance, progressive IRPF calculations with 15 income-based tramos, monthly-varying RETA social security quotas, quarterly advance tax payments (Modelo 130), and evolving digital reporting requirements. The research reveals that success requires moving beyond simple income tracking to proactive compliance management - warning users about 183-day residency thresholds, RETA regularization exposure, documentation requirements, and cash flow pressures before they become expensive problems.

The recommended approach is a phased implementation prioritizing fiscal data accuracy (IRPF brackets, RETA quotas, deduction limits) in Phase 1, then building outward to expense validation, residency tracking, and quarterly reporting. The critical insight from pitfall research: most costly mistakes aren't missed deadlines but structural errors - selecting the wrong RETA tramo, failing to maintain audit-defensible documentation, or miscalculating the 183-day presence rule using the "sporadic absence" doctrine. A calculator serving this audience must be opinionated and preventative, not passive.

The biggest risk is scope creep. This domain has infinite complexity: 17 autonomous community tax variations, sectoral-specific deductions, wealth tax implications, Belgian filing obligations. Research indicates focusing on the 80/20 - core IRPF/RETA calculations for resident autonomos with standard cross-border patterns - and deferring edge cases to v2. Build for the user who works ~200 days/year in Belgium, invoices EU B2B clients, and wants to avoid Hacienda problems, not the user optimizing multi-jurisdictional wealth structures.

## Key Findings

### Recommended Stack

Based on fiscal data research, this is fundamentally a **calculation-intensive domain** requiring precision, auditability, and regulatory compliance. The complexity lies not in technology but in accurately modeling Spanish tax law.

**Core technologies:**
- **Python/TypeScript backend**: Tax calculation logic requires strong typing, extensive validation, and testability. Python offers mature tax/financial libraries (decimal precision handling). TypeScript provides type safety for complex data structures (15 RETA tramos, 6 IRPF brackets with estatal/autonomico splits).
- **PostgreSQL database**: Structured relational data for fiscal year parameters, user profiles, expense tracking, day-by-day location logs. ACID compliance critical for financial calculations.
- **Modern web framework (React/Next.js or Vue/Nuxt)**: Rich interactive UI needed for expense entry, day counters, quarterly calculators. Server-side rendering beneficial for SEO (users search "calculadora autonomos 2026").
- **PDF generation (wkhtmltopdf, Puppeteer, or reportlab)**: Users need printable tax reports for gestor submission.
- **Scheduled jobs (Celery/Bull)**: Quarterly deadline reminders, RETA regularization alerts, VeriFactu compliance warnings.

**Anti-patterns to avoid:**
- Excel/spreadsheet approach - lacks validation, audit trail, multi-user support
- Mobile-first design - tax filing is desktop activity requiring multiple windows/documents
- Blockchain/crypto - unnecessary complexity for regulated compliance domain
- AI/ML for tax calculations - dangerous liability exposure; use deterministic rules

### Expected Features

**Must have (table stakes):**
- **IRPF calculator** with 2025/2026 progressive brackets (19%-47%), minimo personal (5,550 EUR base), minimo por descendientes (2,400+ EUR per child), and gastos de dificil justificacion (5% up to 2,000 EUR)
- **RETA quota calculator** with 15 monthly tramos (200-590 EUR) based on rendimientos netos, including regularization projection
- **Expense tracker** validating factura completa vs ticket, electronic payment requirements for dietas, home office 30% rule enforcement
- **Quarterly Modelo 130 calculator** tracking cumulative income, deductions, retenciones, prior payments with zero/negative filing reminder
- **183-day presence tracker** with entry/exit day counting, gap detection for "presumed days" doctrine, threshold warnings
- **Deduction limits enforcement**: Belgium dietas (91.35 EUR/day with pernocta, 48.08 without), kilometraje (0.26 EUR/km with log requirement), home office formula (m2 proportion x 30%)

**Should have (competitive differentiators):**
- **RETA regularization estimator** comparing actual vs declared tramo in real-time, projecting lump-sum liability
- **Residency defense file checklist** tracking tax residence certificates, utility bills, family documentation per centro de intereses vitales requirements
- **Modelo 349 tracker** for EU intracomunitario operations with VIES verification
- **Belgian IVA recovery** (Modelo 360) tracking with 50 EUR minimum and September 30 deadline
- **Cash flow projector** showing reserve requirements (20% IRPF + 21% IVA collected + RETA)
- **A1 certificate tracker** for social security coverage with 24-month expiration warning
- **VeriFactu compliance check** (July 2026 deadline for personas fisicas)

**Defer (v2+):**
- Multi-autonomous-community variations (focus on general estatal + standard autonomico rates first)
- Belgian tax filing integration (Form 276 Conv, PE determination)
- Vehicle expense allocation (50% IVA cap) beyond basic tracking
- Dependents/disability detailed calculations (start with standard minimo personal)
- Historical data import from previous years
- Gestor collaboration features
- Mobile native apps (web-first)

### Architecture Approach

The architecture must prioritize **calculation correctness** and **audit traceability** over performance or scale. A Spanish autonomo using this tool is effectively preparing evidence for potential AEAT inspection - every number must be defensible.

**Major components:**

1. **Fiscal Rules Engine** - Encapsulates all tax law logic (IRPF brackets, RETA tramos, deduction limits) as versioned, immutable, testable rules. Tax year 2025 vs 2026 rules coexist. Changes to regulations trigger new rule versions, not code edits. This component owns the "source of truth" - if AEAT publishes 2026 rates, this updates first.

2. **Compliance Validator** - Proactive warning system that analyzes user data against known pitfall patterns. Examples: approaching 183 days in Belgium (residency risk), RETA tramo significantly below actual income (regularization exposure), expenses lacking factura completa (deduction disallowed), weekend days during Belgium trips (presence counting ambiguity). This is the "opinionated" layer that makes the tool valuable beyond a spreadsheet.

3. **Document Manager** - Tracks expense invoices, tax residence certificates, A1 certificates with 4-year retention requirement (Article 66 LGT). Links expenses to specific regulations (e.g., "This hotel deduction relies on Articulo 9 RIRPF - abroad with pernocta limit 91.35 EUR"). Generates audit defense reports showing which documents support which deductions.

4. **Timeline/Event System** - Core data model is day-by-day: location (Spain/Belgium/other), income events (facturas issued), expense events (paid with method), tax events (Modelo 130 filed, RETA paid). This granular timeline enables presence day counting, income attribution, regularization projection, quarterly reconciliation.

5. **Reporting Engine** - Generates Modelo 130 pre-filled forms, annual IRPF summaries, RETA regularization estimates, cash flow projections. Output must be gestor-friendly (PDFs with supporting documentation links, not just JSON).

**Key architectural decisions:**
- **Temporal data modeling**: All fiscal parameters (brackets, quotas, limits) are date-effective. User sees "2025 rules" or "2026 rules" explicitly.
- **Immutable events**: Income/expense entries are append-only with corrections via complementary entries (matches accounting principles).
- **Regulation references**: Every calculation includes citation to source regulation (LIRPF Article X, BOE-A-YYYY-NNNN) for user confidence and audit defense.

### Critical Pitfalls

1. **Misunderstanding the 183-day presence rule** - Spanish tax residence isn't just "183 days in Spain" vs "182 days elsewhere." AEAT uses presencia certificada (verified entry/exit), dias presuntos (presumed presence between verified dates), and ausencias esporadicas doctrine. A user working Mon-Fri in Belgium but returning weekends may think they have 260 Belgium days and 105 Spain days, but AEAT could count 365 Spain days if they can't prove otherwise. **Prevention**: Day counter must flag entry/exit days explicitly, detect documentation gaps, warn about presumed days doctrine. Alert at 150, 160, 170, 180 day thresholds.

2. **RETA regularization shock** - User selects low RETA tramo (e.g., 260 EUR/month for 900-1,166 EUR rendimientos) but actually earns 2,500 EUR/month. At regularization 18+ months later, they owe a lump sum of ~1,500 EUR retroactively plus 10-20% recargo. Most autonomos don't budget for this. **Prevention**: Real-time comparison of actual income vs declared tramo. Monthly alert: "Your income suggests tramo 10, but you're paying tramo 3. Expect EUR X regularization." Recommend proactive tramo adjustment.

3. **Modelo 130 quarterly payment errors** - Failing to subtract retenciones already withheld by clients, or not filing when result is zero/negative (still required). Sanctions of 35-150% of unpaid amount. **Prevention**: Cumulative annual tracking (not just quarterly), retenciones ledger with validation against facturas, explicit reminder that zero-result filing is mandatory.

4. **Expense documentation failures** - Keeping tickets instead of facturas completas. At audit, AEAT systematically disallows deductions lacking recipient NIF/domicilio fiscal. Dietas paid in cash (not electronic) are non-deductible since 2018. **Prevention**: Expense entry validates factura completa checkbox, flags cash payments for dietas, warns on large expenses without proper documentation. Educational prompts: "This hotel deduction requires factura completa - confirmation email is not sufficient."

5. **No residency defense file** - When audited, burden of proof shifts to taxpayer. Without documented evidence of Spanish residence (family ties, utility bills, tax residence certificate), AEAT can claim worldwide taxation. Spanish Supreme Court ruled that a tax residence certificate from a treaty country (Belgium) is powerful evidence, but only if you have it. **Prevention**: Document checklist integrated into tool, expiration tracking (certificates typically 1-year validity), warning when audit risk exists without complete file.

## Implications for Roadmap

Based on research, this project has clear phase dependencies driven by the **fiscal year cycle** and **compliance hierarchy**: IRPF calculations depend on RETA quotas being deducted; quarterly Modelo 130 depends on income/expense tracking; residency analysis depends on presence day counting. Suggested phase structure:

### Phase 1: Fiscal Foundation (Core Calculations)
**Rationale:** Cannot build anything else until the fiscal rules engine is correct. IRPF brackets, RETA tramos, deduction limits are the foundational truth. Users won't trust the tool if basic tax calculations are wrong.

**Delivers:**
- 2025/2026 IRPF progressive tax calculator (6 brackets, 19%-47%)
- RETA 15-tramo monthly quota system (200-590 EUR)
- Personal allowances (minimo personal 5,550 EUR, minimo por descendientes 2,400-5,200 EUR)
- Gastos de dificil justificacion (5% up to 2,000 EUR)

**Addresses features:**
- IRPF calculator (must-have)
- RETA quota calculator (must-have)

**Avoids pitfalls:**
- Critical Pitfall 2 (RETA regularization) - foundation for tramo comparison
- Critical Pitfall 3 (Modelo 130 errors) - foundation for quarterly calculations

**Research flag:** LOW - All data is from official BOE/AEAT sources with HIGH confidence. Standard implementation, no deep research needed.

### Phase 2: Income & Expense Tracking
**Rationale:** With fiscal rules established, enable users to track actual business activity. This phase builds the timeline/event system that all other features depend on.

**Delivers:**
- Income (factura) entry with date, amount, client, retenciones withheld
- Expense entry with validation (factura completa vs ticket, electronic payment check)
- Deduction limits enforcement (dietas 91.35/48.08 EUR abroad, home office 30% formula, kilometraje 0.26 EUR/km)
- Running rendimientos netos calculation (ingresos - gastos)

**Uses:**
- Timeline/event architecture from ARCHITECTURE research
- Document manager for expense invoices with 4-year retention

**Implements:**
- Expense tracker (must-have)
- Deduction limits enforcement (must-have)
- Cash flow projector foundation (should-have)

**Avoids pitfalls:**
- Critical Pitfall 4 (expense documentation failures) - validates factura completa, flags cash dietas
- Moderate Pitfall 7 (expense documentation) - educates users on requirements

**Research flag:** LOW-MEDIUM - General expense tracking patterns well-known, but Belgium-specific deduction rules (Modelo 360 IVA recovery, dietas abroad limits) need validation during implementation.

### Phase 3: Quarterly Compliance (Modelo 130)
**Rationale:** With income/expense data captured, enable the most frequent compliance obligation - quarterly advance tax payments. This is where users feel immediate value (avoiding penalties, cash flow planning).

**Delivers:**
- Modelo 130 calculator with cumulative annual tracking
- Retenciones ledger (track what clients withheld, subtract from pago fraccionado)
- Quarterly deadlines (April 20, July 20, October 20, January 30) with reminders
- Zero/negative result filing reminder
- Cash flow reserve calculator (20% IRPF + 21% IVA + RETA)

**Addresses features:**
- Modelo 130 calculator (must-have)
- Cash flow projector (should-have)
- Deadline reminders (competitive)

**Avoids pitfalls:**
- Critical Pitfall 3 (Modelo 130 errors) - handles cumulative tracking, retenciones subtraction
- Critical Pitfall 2 (RETA regularization) - shows actual rendimientos vs tramo
- Moderate Pitfall 11 (missing deadlines) - proactive reminders
- Cash Flow Pitfall 16 (insufficient reserves) - shows required set-aside amounts

**Research flag:** LOW - Modelo 130 is well-documented, standard autonomo requirement. Implementation patterns available.

### Phase 4: Cross-Border Residency Management
**Rationale:** Unique value proposition for Belgium cross-border workers. Most tax calculators ignore this complexity. This phase delivers competitive differentiation.

**Delivers:**
- 183-day presence tracker with entry/exit day counting
- Gap detection for "presumed days" doctrine
- Threshold warnings at 150, 160, 170, 180 days
- Centro de intereses vitales assessment (family in Spain, work in Belgium)
- Residency defense file checklist (tax residence certificate, utility bills, family docs)
- A1 certificate expiration tracking (24-month EU social security coverage)

**Uses:**
- Timeline/event system for day-by-day location tracking
- Document manager for residency evidence

**Implements:**
- 183-day tracker (must-have)
- Residency defense file (should-have)
- A1 certificate tracker (should-have)

**Avoids pitfalls:**
- Critical Pitfall 1 (183-day misunderstanding) - proactive presence counting with doctrine education
- Critical Pitfall 5 (no residency defense file) - guides evidence collection
- Moderate Pitfall 5 (A1 certificate failure) - tracks validity and expiration

**Research flag:** MEDIUM-HIGH - Spain-Belgium treaty tie-breaker rules, centro de intereses vitales jurisprudence, and Belgian PE/fixed base implications need deeper research during implementation. Treaty research is HIGH confidence but application to specific user patterns (autonomo services vs employment) requires validation.

### Phase 5: EU Client Management (IVA Intracomunitario)
**Rationale:** Cross-border work often means EU clients. This phase handles the unique compliance requirements for intra-community operations.

**Delivers:**
- VIES NIF-IVA verification before invoicing
- ROI (Registro Operadores Intracomunitarios) registration check
- Modelo 349 quarterly tracker for intra-EU operations
- Inversion del sujeto pasivo invoicing guidance
- Belgian IVA recovery (Modelo 360) with 50 EUR minimum and deadline tracking

**Addresses features:**
- Modelo 349 tracker (should-have)
- Belgian IVA recovery (should-have)

**Avoids pitfalls:**
- Moderate Pitfall 6 (IVA intracomunitario errors) - VIES validation, Modelo 349 reminders
- Moderate Pitfall 7 (hotel IVA recovery) - tracks Belgian IVA for Modelo 360 refund

**Research flag:** MEDIUM - IVA intracomunitario rules are standard EU framework, but Modelo 360 Belgian IVA recovery process and VIES integration need technical validation.

### Phase 6: Annual Reporting & VeriFactu Compliance
**Rationale:** Final phase handles annual IRPF declaration support and upcoming digital invoice requirements (July 2026 deadline for personas fisicas).

**Delivers:**
- Annual IRPF summary report (rendimientos, deducciones, base liquidable)
- Modelo 130 reconciliation (quarterly payments vs annual liability)
- RETA regularization final calculation
- VeriFactu compliance checker (QR code invoice requirements)
- 4-year document retention audit

**Addresses features:**
- VeriFactu compliance (should-have)
- Annual reporting (must-have)

**Avoids pitfalls:**
- Moderate Pitfall 12 (VeriFactu non-compliance) - warns before July 2026 deadline
- Moderate Pitfall 17 (4-year retention failure) - tracks document disposal dates

**Research flag:** MEDIUM - VeriFactu implementation is recent (RD 254/2025), software integration options and QR code generation need technical research. Annual IRPF reporting is standard.

### Phase Ordering Rationale

1. **Foundation-first**: Cannot calculate quarterly payments without knowing IRPF rates and RETA quotas. Cannot track expenses without deduction limit rules.

2. **Frequency of use**: Users interact with income/expense tracking weekly, Modelo 130 quarterly, annual reporting once/year. Build high-frequency features first for engagement.

3. **Compliance risk prioritization**: Missing quarterly Modelo 130 triggers immediate penalties. Residency errors surface only at audit (lower immediate risk but higher damage). Build preventative features before detective ones.

4. **Competitive differentiation sequencing**: Phases 1-3 are table-stakes (any tax calculator has these). Phases 4-5 are differentiators (cross-border residency, EU client management). Build must-haves first, then unique value.

5. **Technical dependency**: Phase 4 (residency tracking) requires Phase 2 (timeline/event system for day counting). Phase 3 (Modelo 130) requires Phase 2 (income/expense data). Phase 6 (annual reporting) requires all prior phases' data.

6. **User onboarding**: New users care about "Will I get fined?" before "Can I optimize deductions?" Phase 3 (quarterly compliance) delivers immediate relief. Phase 4 (residency) is important but not urgent until approaching 183 days.

### Research Flags

**Phases needing deeper research during implementation:**

- **Phase 4 (Residency Management)**: Spain-Belgium treaty Article 4 tie-breaker application to autonomo services (not just employment). Centro de intereses vitales case law. Belgian PE/fixed base determination for services rendered on Belgian territory. **Reason**: Treaty text is clear but application to specific work patterns (autonomo providing professional services vs employed worker) has gray areas. Belgian tax filing obligations for 204 days/year presence need Belgian tax advisor input.

- **Phase 5 (EU Client Management)**: Modelo 360 Belgian IVA refund filing process - technical integration with AEAT portal, response timelines, rejection patterns. VIES API integration for real-time NIF-IVA validation. **Reason**: IVA intracomunitario framework is well-documented, but practical implementation (API reliability, error handling, deadlines) needs technical validation.

- **Phase 6 (VeriFactu)**: VeriFactu-compliant invoicing software options, QR code generation libraries, AEAT certification process for billing systems. **Reason**: New requirement (July 2026 deadline), implementation standards still evolving, integration options unclear.

**Phases with standard patterns (skip deep research):**

- **Phase 1 (Fiscal Foundation)**: IRPF brackets and RETA tramos are published in BOE with complete tables. No ambiguity. Standard calculation implementation.

- **Phase 2 (Income/Expense Tracking)**: Core CRUD with validation rules. Standard web application patterns.

- **Phase 3 (Modelo 130)**: Well-documented quarterly tax form, abundant tutorials and examples exist. Calculation logic straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Fiscal Data (IRPF, RETA) | **HIGH** | Multiple official AEAT/BOE sources verified. 2025/2026 rates confirmed. Minimos personales, tramos RETA, dietas limits all from authoritative sources. |
| Treaty/Residency Rules | **MEDIUM-HIGH** | Spain-Belgium treaty text confirmed (BOE-A-2003-13375). Tie-breaker hierarchy well-documented. Centro de intereses vitales jurisprudence strong. Gray area: Application to autonomo services (vs employment) and Belgian filing thresholds. |
| Expense Deductions | **MEDIUM-HIGH** | Core rules (factura completa, electronic payment, home office 30%) verified via AEAT sources. Belgian IVA recovery (Modelo 360) documented but practical implementation needs validation. |
| Pitfalls/Risks | **HIGH** | RETA regularization, Modelo 130 errors, 183-day counting, A1 certificate all well-documented in official sources and community knowledge. Confidence based on TEAC rulings, DGT consultas, recent 2025/2026 regulatory changes. |

**Overall confidence: HIGH** - This project has strong factual foundations. The fiscal data is unambiguous (published rates, official tables), the treaty framework is documented, and the pitfalls are well-known in the autonomo community. Gray areas exist (Belgian tax filing thresholds, PE determination for autonomo services, VeriFactu integration) but these are Phase 4-6 concerns, not blockers for MVP.

### Gaps to Address

**During Phase 4 implementation:**
- **Belgian tax filing obligations**: At what income/presence threshold does Belgium require filing? Form 276 Conv process? Needs Belgian tax advisor consultation or official Belgian tax authority documentation review.
- **PE/Fixed base determination**: Article 14 Spain-Belgium treaty covers "independent personal services" - when does 204 days/year in Belgium create a "base fija" triggering Belgian taxation rights? Case law or official guidance needed.
- **Centro de intereses vitales edge cases**: What if family is in Spain but 100% of income from Belgium? How do Spanish courts weigh economic vs personal ties? Existing STS rulings cover general principles but fact-specific application may need gestor input.

**During Phase 5 implementation:**
- **VIES API integration**: Real-time NIF-IVA validation - API rate limits, error handling, fallback when VIES is down. Technical documentation needed.
- **Modelo 360 timing**: Belgian IVA refund process - how long does refund take? Common rejection reasons? Practical user guidance beyond regulatory text.

**During Phase 6 implementation:**
- **VeriFactu software options**: Which invoicing tools are VeriFactu-certified as of mid-2026? Integration APIs available? Free AEAT tool sufficient for autonomo needs? Market research needed closer to July 2026 deadline.

**Not blocking MVP but needs ongoing monitoring:**
- **Autonomous community variations**: Research focused on general estatal + standard autonomico rates. Madrid, Cataluna, Basque Country have variations. Defer to v2 but document assumption.
- **Sectoral-specific rules**: Some autonomo sectors (artists, writers, agriculture) have special regimes. Out of scope for MVP focused on professional services.
- **2027 regulatory changes**: Tax law evolves annually. Build temporal versioning into fiscal rules engine to accommodate future changes.

## Sources

### Primary (HIGH confidence)

**Official Spanish Government:**
- [BOE Orden PJC/178/2025](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-3780) - RETA cotization 2025 official tables
- [AEAT Manual Practico IRPF 2024](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/) - Personal allowances, tax brackets
- [AEAT Estimacion Directa Simplificada](https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html) - Gastos dificil justificacion 5%
- [BOE Ley 35/2006 (LIRPF)](https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764) - Article 9.1.b family presumption
- [BOE Spain-Belgium Tax Treaty](https://www.boe.es/buscar/act.php?id=BOE-A-2003-13375) - Double taxation convention
- [TGSS RETA Portal](https://portal.seg-social.gob.es/wps/portal/importass/importass/tramites/simuladorRETAPublico) - Social security simulator and regularization

**EU Framework:**
- [EU Regulation 883/2004](https://europa.eu/youreurope/citizens/work/taxes/double-taxation/index_en.htm) - A1 certificate social security coordination
- [NISSE Belgium A1 Certificate](https://www.inasti.be/en/request-a1-certificate-concerning-social-security-legislation-self-employed-workers) - Belgian social security for self-employed

**Spanish Jurisprudence:**
- STS 12-06-2023 (R. 915/2022) - Tax residence certificates and centro de intereses vitales
- STS 08-07-2024 (R. 1909/2023) - Nucleo de intereses economicos interpretation
- TEAC rulings on presencia certificada, dias presuntos, ausencias esporadicas - 183-day counting methodology

### Secondary (MEDIUM confidence)

**Professional Tax Guidance:**
- [Wolters Kluwer IRPF 2025](https://www.wolterskluwer.com/es-es/expert-insights/tramos-retenciones-irpf-2025-novedades) - Tax brackets verification
- [LexTax Spanish Tax Residency Guide](https://lextax.es/spanish-tax-residency-the-guide-beyond-the-183-day-rule/) - Residency rules beyond 183 days
- [PWC Tax Summaries Spain](https://taxsummaries.pwc.com/spain/individual/deductions) - Individual deductions reference
- [Garrigues: 183 Days Counting](https://www.garrigues.com/es_ES/noticia/residencia-fiscal-en-espana-como-se-cuentan-los-183-dias-y-que-significa-centro-de-intereses) - How to count presence days

**Autonomo Community Resources:**
- [InfoAutonomos - Gastos Deducibles 2026](https://www.infoautonomos.com/fiscalidad/gastos-deducibles-autonomos-irpf-estimacion-directa/) - Expense deduction rules
- [Declarando - Modelo 130 Guide](https://declarando.es/modelo-130) - Quarterly payment calculator
- [Holded - Dietas Autonomos](https://www.holded.com/es/blog/dietas-autonomos) - Meal allowances abroad
- [TuKonta - IVA Intracomunitario 2026](https://tukonta.com/asesoramiento/iva-intracomunitario/) - EU client invoicing

### Tertiary (LOW confidence - for awareness only)

**News/Community:**
- [The Local ES: Self-Employed Changes 2026](https://www.thelocal.es/20251217/the-big-changes-for-self-employed-workers-in-spain-in-2026) - VeriFactu deadline, regulatory changes
- [COPE: Bank Reporting February 2026](https://www.cope.es/actualidad/economia/noticias/autonomo-bizum-asi-te-afecta-mes-nuevo-control-hacienda-partir-febrero-2026-20260128_3292193.html) - New Bizum/transaction reporting requirements
- [La Moncloa: RETA Regularization Complete](https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/inclusion/paginas/2025/120225-concluye-regularizacion-autonomos.aspx) - First phase RETA regularization announcement

---
*Research completed: 2026-01-29*
*Ready for roadmap: yes*
