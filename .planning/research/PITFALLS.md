# Pitfalls Research - Spanish Autonomo Cross-Border Work

**Domain:** Tax calculator for Spanish autonomo with Belgium cross-border work
**Researched:** 2026-01-29
**Overall Confidence:** MEDIUM-HIGH (multiple official sources verified)

---

## Executive Summary

Spanish autonomos working cross-border with Belgium face a complex web of compliance requirements spanning two tax jurisdictions, two social security systems, and evolving digital reporting mandates. The most dangerous pitfalls are not the obvious ones (missing deadlines) but the subtle ones: misunderstanding how presence days are counted, failing to maintain an audit-defensible "residency file," and miscalculating quarterly payments that trigger regularization penalties. A tax calculator serving this audience must be proactive, not reactive - warning about problems BEFORE they become expensive.

---

## Critical Pitfalls

Mistakes that cause major financial damage, audits, or legal problems.

### Pitfall 1: Misunderstanding the 183-Day Presence Rule

**What goes wrong:** Autonomos believe the 183-day rule is straightforward - stay under 183 days in Belgium and pay taxes only in Spain. In reality, the Spanish Tax Agency (AEAT) uses a three-component system: **presencia certificada** (verified presence), **dias presuntos** (presumed days between verified dates), and **ausencias esporadicas** (sporadic absences that still count as presence).

**Impact:** If AEAT can prove you were in Spain on Monday and Friday, they PRESUME you were there Tuesday-Thursday unless you prove otherwise. This can push someone over 183 days unexpectedly, triggering worldwide taxation in Spain retroactively from January 1st.

**Warning Signs:**
- Day count approaching 160+ days in either country
- Gaps in travel documentation
- Credit card transactions in Spain on dates you claim to be elsewhere
- Days of arrival/departure not being counted (they count as full days in BOTH countries)

**Prevention:**
- Calendar must track BOTH entry days and exit days as separate counted days
- Calculator should warn when "presumed days" doctrine could apply
- Alert when travel records have gaps longer than 3-5 consecutive days

**Feature Needed:** Real-time day counter with:
- Entry/exit day flagging (counts in both jurisdictions)
- Gap detection ("No location recorded for 5 days - AEAT may presume Spain")
- Threshold warnings at 150, 160, 170, 180 days
- Year-end projection based on current trajectory

**Confidence:** HIGH - Based on TEAC rulings and official AEAT guidance

**Sources:**
- [Garrigues: How to count 183 days](https://www.garrigues.com/es_ES/noticia/residencia-fiscal-en-espana-como-se-cuentan-los-183-dias-y-que-significa-centro-de-intereses)
- [ETL: Days of effective permanence](https://etl.es/blog/fiscal/como-se-computan-los-dias-de-permanencia-efectiva-del-obligado-tributario-en-espana/)
- [Garrido: TEAC determination of tax residence](https://garrido.es/presencia-certificada-dias-presuntos-y-ausencias-esporadicas-asi-se-determina-la-residencia-fiscal-segun-el-teac/)

---

### Pitfall 2: No "Residency Defence File"

**What goes wrong:** Autonomos have no documented evidence of their primary residence and economic ties. When audited, the burden of proof shifts to them, and they cannot demonstrate residency conclusively.

**Impact:** Without a proper defence file, AEAT can:
- Claim you were Spanish resident and tax worldwide income
- Presume residence based on spouse/children location in Spain
- Apply penalties of 50-150% on undeclared income

**Warning Signs:**
- No tax residency certificate from either country
- Utility bills not in your name
- No health insurance registration in country of claimed residence
- Inconsistent passport stamps vs claimed location

**Prevention:**
- Proactively gather: tax residency certificate, utility bills, health insurance docs, bank statements, passport stamps, flight records
- Spanish Supreme Court ruled that a tax residence certificate from a DTT country (like Belgium) is powerful evidence AEAT cannot ignore

**Feature Needed:** Document checklist with:
- Required items for residency defence
- Expiration tracking (certificates typically valid 1 year)
- Warning when approaching audit risk without complete file

**Confidence:** HIGH - Based on Spanish Supreme Court ruling and AEAT practice

**Sources:**
- [LexTax: Spanish Tax Residency Beyond 183 Days](https://lextax.es/spanish-tax-residency-the-guide-beyond-the-183-day-rule/)
- [AGM Abogados: Tax Resident in Spain](https://www.agmabogados.com/en/when-am-i-a-tax-resident-in-spain-how-do-i-calculate-the-183-days/)

---

### Pitfall 3: RETA Regularization Shock

**What goes wrong:** Autonomo selects a low RETA tramo based on conservative income estimates, then earns significantly more. At regularization (typically 18+ months later), they owe large lump-sum payments they have not budgeted for.

**Impact:**
- Lump-sum payment demands of hundreds to thousands of euros
- 10-20% recargo (surcharge) if not paid within deadline
- Affected prestaciones (benefits) calculated on old, lower base - cannot be corrected retroactively

**Warning Signs:**
- Selected tramo significantly below actual rendimientos netos
- No cash reserve for potential regularization
- Approaching mid-year with income trajectory above selected tramo

**Prevention:**
- Calculator should track actual rendimientos netos vs declared tramo
- Estimate regularization liability in real-time
- Recommend proactive tramo adjustment via Sistema RED

**Feature Needed:** RETA Regularization Estimator:
- Track actual ingresos - gastos = rendimiento neto
- Compare against 15 RETA tramos (200-590 EUR/month in 2026)
- Project regularization amount owed
- Alert: "Based on current income, expect to owe EUR X at regularization"

**Real-world scenario:** Maria declares tramo 3 (260 EUR/month, for 901-1,166.70 EUR/month rendimientos). By October she realizes she will net 2,500 EUR/month. She faces retroactive adjustment to tramo 10+ (360+ EUR/month) - difference of ~1,200 EUR for the year, plus MEI adjustment.

**Confidence:** HIGH - Official TGSS process documented

**Sources:**
- [Seguridad Social: Regularization Portal](https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/Consulta+de+pagos+y+deudas/PagosDevoluciones_/RegularizacionRETA)
- [La Moncloa: First Phase Regularization Complete](https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/inclusion/paginas/2025/120225-concluye-regularizacion-autonomos.aspx)
- [InfoAutonomos: Regularization Calendar](https://www.infoautonomos.com/blog/regularizacion-cuotas-autonomos/)

---

### Pitfall 4: Modelo 130 Quarterly Payment Errors

**What goes wrong:** Autonomo miscalculates the 20% pago fraccionado on Modelo 130, either by:
- Not properly deducting retenciones already applied by clients
- Not carrying forward negative results from previous quarters
- Forgetting to submit when result is negative (still required!)

**Impact:**
- Sanctions of 35-150% of unpaid amount
- Mismatch flagged at annual IRPF declaration
- Interest charges on late/missing payments

**Warning Signs:**
- Not tracking retenciones received from clients (15% typically)
- Assuming zero result = no filing required (FALSE)
- Using Excel/manual calculations prone to error

**Prevention:**
- Calculator must compute: (Ingresos - Gastos) x 20% - Retenciones - Pagos anteriores
- Alert when >70% of facturacion has retenciones applied (exemption from 130)
- Remind to file even with negative/zero result

**Feature Needed:** Modelo 130 Calculator:
- Cumulative annual tracking (not just quarterly)
- Retenciones tracker with warning if inconsistent
- Filing reminder with pre-filled amounts
- Validation: "Your calculation shows X, but typical errors include Y"

**Confidence:** HIGH - Official AEAT requirements

**Sources:**
- [Declarando: Modelo 130 Guide 2026](https://declarando.es/modelo-130)
- [Holded: Modelo 130](https://www.holded.com/es/blog/declaracion-trimestral-autonomos)
- [InfoAutonomos: Pagos Fraccionados](https://declarando.es/blog/pagos-fraccionados-irpf)

---

### Pitfall 5: A1 Certificate Failure for Belgium Work

**What goes wrong:** Spanish autonomo works in Belgium without obtaining A1 certificate from Spanish Social Security. Belgium discovers unregistered worker, demands Belgian social security registration and payments.

**Impact:**
- Potential double social security contributions
- Fines from Belgian authorities (no minimum threshold - first hour triggers requirement)
- Belgium can refuse to recognize Spanish social security coverage

**Warning Signs:**
- Working in Belgium without A1 certificate
- Not understanding that A1 is valid for only 24 months
- Assuming RETA registration automatically covers EU work

**Prevention:**
- Before any Belgium work: obtain A1 from TGSS
- Track A1 expiration (24-month limit)
- If extending beyond 24 months: apply for extension OR register with Belgian social security

**Feature Needed:** A1 Certificate Tracker:
- Prompt before first Belgium day: "Do you have valid A1?"
- Expiration countdown
- Extension reminder at 20 months

**Confidence:** HIGH - EU Regulation 883/2004 documented

**Sources:**
- [NISSE Belgium: A1 Certificate Request](https://www.inasti.be/en/request-a1-certificate-concerning-social-security-legislation-self-employed-workers)
- [Centuro Global: A1 Form Guide 2026](https://www.centuroglobal.com/article/a1-form-a1-certificate-explained/)

---

## Moderate Pitfalls

Mistakes that cause delays, fines, or extra work.

### Pitfall 6: IVA Intracomunitario Errors

**What goes wrong:** Autonomo invoices Belgian clients without IVA but fails to:
- Verify client's NIF-IVA via VIES before invoicing
- Register in ROI (Registro de Operadores Intracomunitarios)
- File Modelo 349 for intra-community operations

**Impact:**
- 300 EUR fine per incorrect/omitted data in Modelo 349
- 50-150% of unliquidated IVA if not properly declared
- Cannot benefit from inversion del sujeto pasivo without proper registration

**Prevention:**
- Before invoicing any EU client: verify VIES registration
- File Modelo 349 quarterly with all intra-EU operations
- Distinguish B2B (ROI, Modelo 349) from B2C (OSS system)

**Feature Needed:** EU Client Verification:
- VIES lookup before invoice creation
- Modelo 349 tracking and reminder
- Warning: "This client not found in VIES - must charge Spanish IVA"

**Confidence:** HIGH - AEAT documented requirements

**Sources:**
- [TuKonta: IVA Intracomunitario Guide 2026](https://tukonta.com/asesoramiento/iva-intracomunitario/)
- [Declarando: IVA Intracomunitario in 10 Keys](https://declarando.es/iva-autonomos/iva-intracomunitario)

---

### Pitfall 7: Expense Documentation Failures (Factura Completa vs Ticket)

**What goes wrong:** Autonomo keeps tickets/receipts instead of facturas completas. At audit, AEAT disallows deductions because:
- Ticket does not identify the purchaser
- Simplified invoice (factura simplificada) not valid for IVA deduction
- No proper justification of business purpose

**Impact:**
- Loss of IVA deduction
- IRPF gastos disallowed
- Sanctions of 50-150% of improperly deducted amounts

**Warning Signs:**
- Expenses entered with "ticket" instead of "factura"
- No NIF on expense documentation
- Description field blank or generic

**Prevention:**
- Always request factura completa with: NIF, full name/razón social, domicilio fiscal, descripción, base imponible, IVA, total
- For travel meals: must be paid electronically, in municipality different from residence

**Feature Needed:** Expense Validation:
- Checkbox: "Full invoice (factura completa) obtained?"
- Warning for expenses >50 EUR without invoice flag
- Meal deduction calculator (26.67 EUR Spain / 48 EUR extranjero daily limits)

**Confidence:** HIGH - DGT and AEAT guidance

**Sources:**
- [InfoAutonomos: Gastos Deducibles IRPF 2026](https://www.infoautonomos.com/fiscalidad/gastos-deducibles-autonomos-irpf-estimacion-directa/)
- [Holded: Dietas Autonomos](https://www.holded.com/es/blog/dietas-autonomos)

---

### Pitfall 8: Mixing Personal and Business Finances

**What goes wrong:** Autonomo uses same bank account, phone, car for personal and business purposes without proper allocation methodology. Hacienda disallows deductions due to inability to prove business use.

**Impact:**
- Disallowed deductions
- Audit flag (new 2026 reporting requires banks to report ALL autonomo transactions)
- Cannot prove business profitability

**Warning Signs:**
- Single bank account for everything
- Shared phone line (need separate personal/business)
- Car expenses deducted at 100% (IVA limited to 50% typically)

**Prevention:**
- Separate bank account for business (required for traceability)
- Two phone lines if claiming deduction
- Document business-use percentage for shared assets

**Feature Needed:** Account Separation Check:
- Warning on first expense entry: "Are you using a dedicated business account?"
- Vehicle expense limiter (50% IVA cap unless taxi/delivery)
- Monthly mixed-use review prompt

**Confidence:** HIGH - New 2026 Bizum/bank reporting rules

**Sources:**
- [COPE: New Hacienda Controls Feb 2026](https://www.cope.es/actualidad/economia/noticias/autonomo-bizum-asi-te-afecta-mes-nuevo-control-hacienda-partir-febrero-2026-20260128_3292193.html)
- [InfoAutonomos: Finanzas Personales del Autonomo](https://www.infoautonomos.com/blog/finanzas-personales-autonomo/)

---

### Pitfall 9: Weekend/Travel Day Miscategorization

**What goes wrong:** Autonomo treats weekend days during Belgium trips as "personal" to avoid counting toward 183-day threshold. AEAT treats them as Spanish presence (sporadic absence) or Belgian authorities count them as Belgium work days.

**Impact:**
- Day count discrepancies between claimed and calculated
- Cannot prove "personal" nature of weekend without specific evidence
- Risk of triggering 183-day threshold unexpectedly

**Warning Signs:**
- Pattern of "work" Mon-Fri, "personal" Sat-Sun during Belgium trips
- No documented personal purpose for weekend days
- Hotel bookings extend through weekend but marked as personal

**Prevention:**
- If staying in Belgium over weekend: document purpose clearly
- If flying home: count Friday departure as Spain day, Monday return as Belgium day
- Be consistent - sporadic absence doctrine applies to Spain residence

**Feature Needed:** Weekend Day Analyzer:
- Detect pattern: "You have 15 weekends marked personal during Belgium business trips"
- Prompt: "Can you document personal purpose? Otherwise consider as business presence"
- Warning threshold when weekend marking affects 183-day count

**Confidence:** MEDIUM - Interpretation of TEAC sporadic absence doctrine

---

### Pitfall 10: Forgetting Minimo Personal and Reductions

**What goes wrong:** Autonomo calculates IRPF liability without applying:
- Minimo personal (5,550 EUR base, more for >65 years or disability)
- Reduction for rendimientos del trabajo (up to 6,498 EUR for low-income)
- Gastos de dificil justificacion (5% of net, up to 2,000 EUR)

**Impact:**
- Overpaying quarterly payments
- Cash flow problems from excessive withholding
- Not planning for actual (lower) annual tax liability

**Prevention:**
- Calculator should apply all applicable reductions
- Track age, disability status, dependents for minimo adjustments
- Include 5% gastos dificil justificacion automatically

**Feature Needed:** Full IRPF Calculator with:
- Minimo personal with all modifiers
- Reduction por rendimientos (6,498 EUR formula)
- Automatic 5% gastos dificil justificacion
- Compare: "You're paying X quarterly but annual liability estimated at Y"

**Confidence:** HIGH - PWC tax summaries, official AEAT tables

**Sources:**
- [PWC: Spain Individual Deductions](https://taxsummaries.pwc.com/spain/individual/deductions)
- [Autonomo Info: Calculator](https://autonomoinfo.com/en/)

---

## Minor Pitfalls

Annoying but recoverable mistakes.

### Pitfall 11: Missing Quarterly Deadlines

**What goes wrong:** Autonomo misses 20th of April/July/October or 30th of January deadline for Modelo 130/303.

**Impact:**
- Recargo starting at 5%, escalating quickly
- Automatic penalty process

**Prevention:**
- Calendar reminders 10 days before, 5 days before, day of
- Note: If deadline falls on holiday/weekend, extends to next business day

**Feature Needed:** Deadline tracker with push notifications

**Confidence:** HIGH - Fixed calendar dates

**Sources:**
- [Holded: Calendario Fiscal 2026](https://www.holded.com/es/blog/calendario-fiscal)

---

### Pitfall 12: VeriFactu Non-Compliance (Starting July 2026)

**What goes wrong:** Autonomo continues using Excel, PDF invoices, or non-certified software after July 1, 2026 deadline for personas fisicas.

**Impact:**
- 50,000 EUR fine for using non-homologated software
- Invoices may not be legally valid
- Cannot correct errors by editing - must issue rectificativa

**Prevention:**
- Transition to VeriFactu-compliant software before July 2026
- Free AEAT tool available for basic needs
- Test period Jan-July 2026 without penalties

**Feature Needed:** VeriFactu compliance check:
- Warning: "Excel invoices will be invalid after July 1, 2026"
- Integration with VeriFactu-compliant invoicing

**Confidence:** HIGH - RD 254/2025

**Sources:**
- [The Local: Big Changes for Self-Employed 2026](https://www.thelocal.es/20251217/the-big-changes-for-self-employed-workers-in-spain-in-2026)
- [AEAT: VeriFactu Systems](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html)

---

### Pitfall 13: Kilometraje Documentation Gaps

**What goes wrong:** Autonomo claims 0.26 EUR/km for business travel without maintaining required log: date, origin, destination, purpose, exact kilometers.

**Impact:**
- Deduction disallowed at audit
- DGT Consulta V0540-24 specifically requires this documentation

**Prevention:**
- Maintain trip log for every claimed journey
- Use GPS tracking app or manual log
- Calculate exact route distance, not estimate

**Feature Needed:** Mileage tracker:
- Trip log with required fields
- Automatic distance calculation (optional)
- Running total at 0.26 EUR/km
- Export for audit defense

**Confidence:** HIGH - DGT Consulta V0540-24

**Sources:**
- [Grupo 2000: DGT Kilometraje Justification](https://www.grupo2000.es/hacienda-sube-un-37-la-compensacion-del-gasto-por-kilometraje/)

---

## Belgium-Specific Issues

### Pitfall 14: No Specific Cross-Border Provisions in Spain-Belgium DTT

**What goes wrong:** Autonomo assumes special cross-border rules apply (like Spain has with France/Portugal). The Spain-Belgium Double Taxation Treaty does NOT have specific cross-border worker provisions.

**Impact:**
- Standard OECD rules apply: income taxed where work performed
- If you have "permanent establishment" in Belgium, Belgium can tax that income
- More complex filing than France/Portugal border workers

**Prevention:**
- Understand you are NOT a "cross-border worker" in the treaty sense
- Apply general Article 7 (Business Profits) or Article 14 (Independent Personal Services) rules
- May need to file in both countries and claim double taxation relief

**Feature Needed:** DTT explainer:
- "Spain-Belgium treaty does not have special cross-border provisions"
- Guidance on which article applies to your situation
- Warning when income pattern suggests Belgian tax filing needed

**Confidence:** MEDIUM - Treaty text review needed for full confirmation

**Sources:**
- [BOE: Spain-Belgium Convention](https://www.boe.es/buscar/act.php?id=BOE-A-2003-13375)
- [Administracion.gob.es: Cross-border Workers](https://administracion.gob.es/pag_Home/en/Tu-espacio-europeo/derechos-obligaciones/ciudadanos/trabajo-jubilacion/fiscalidad/trabajadores-transfronterizos.html)

---

### Pitfall 15: Belgian Tax Filing Obligations Ignored

**What goes wrong:** Spanish autonomo working 204 days/year in Belgium assumes Spanish-only filing. Belgium may have taxing rights on income earned on Belgian territory.

**Impact:**
- Unreported income in Belgium
- Belgian tax authority audit
- Double taxation without proper relief

**Warning Signs:**
- Significant income from Belgian clients while physically in Belgium
- "Permanent establishment" indicators (fixed office, regular presence)
- More than 183 days in Belgium

**Prevention:**
- Consult Belgian tax advisor when approaching 100+ Belgium days
- File Form 276 Conv. in Belgium if claiming treaty benefits
- Keep records of where each invoice was earned (Spain vs Belgium)

**Feature Needed:** Belgian Filing Warning:
- Alert when Belgium days > 100: "Consider Belgian tax obligations"
- Income attribution tracker: "X% of income earned while in Belgium"

**Confidence:** LOW-MEDIUM - General principle, specific advice needed

---

## Cash Flow Problems

### Pitfall 16: Insufficient Quarterly Payment Reserve

**What goes wrong:** Autonomo spends all income without reserving for:
- 20% pago fraccionado (Modelo 130)
- IVA collected (21% typically)
- RETA cuota
- Annual regularization

**Impact:**
- Cash crisis at payment deadlines
- Recargos and interest
- Stress and potential business failure

**Prevention:**
- Reserve 35-45% of gross income for taxes/social security
- Separate "tax reserve" account
- Calculator should show: "Set aside EUR X from this invoice"

**Feature Needed:** Cash Flow Projector:
- Running tax liability estimate
- "Reserve required" per invoice
- Warning when bank balance < estimated liabilities

**Confidence:** HIGH - Common autonomo complaint

---

## Evidence & Audit Preparation

### Pitfall 17: Four-Year Retention Failure

**What goes wrong:** Autonomo discards documentation before 4-year statute of limitations expires. AEAT audit in year 4 finds gaps.

**Impact:**
- Cannot defend deductions
- Presumption against taxpayer
- Loss of claimed benefits

**Prevention:**
- Retain ALL documentation for 4 years after filing deadline
- Tax residency certificates: 4-year retention required per Article 66 LGT
- Digital backup with reliable storage

**Feature Needed:** Document Retention Tracker:
- Alert when approaching disposal date
- Integrate with document storage
- Checklist by year

**Confidence:** HIGH - Article 66 LGT

---

### Pitfall 18: Income/Payment Mismatch Detection

**What goes wrong:** From February 2026, banks must report all autonomo transactions monthly to AEAT. Reported business payments don't match declared income.

**Impact:**
- Automatic audit flag
- Explanation required for discrepancies
- Bizum and card payments now fully visible

**Prevention:**
- Record ALL income, even small Bizum payments
- Ensure bank activity matches declared revenue
- Personal transactions clearly separate

**Feature Needed:** Income Reconciliation:
- Track all payment sources
- Warning: "Bank shows X income but you declared Y"
- Bizum/card income reminder

**Confidence:** HIGH - New February 2026 reporting requirement

**Sources:**
- [COPE: Bizum/Bank Reporting Changes](https://www.cope.es/actualidad/economia/noticias/autonomo-bizum-asi-te-afecta-mes-nuevo-control-hacienda-partir-febrero-2026-20260128_3292193.html)

---

## Phase-Specific Warnings

| Calculator Feature | Likely Pitfall | Mitigation |
|-------------------|----------------|------------|
| Day Counter | Pitfall 1: 183-day miscounting | Entry/exit day tracking, gap detection, presumed days warning |
| Income Tracker | Pitfall 3: RETA regularization | Real-time tramo comparison, regularization estimate |
| Expense Entry | Pitfall 7: Missing facturas | Invoice validation checkbox, warning for large expenses |
| Quarterly Calculator | Pitfall 4: Modelo 130 errors | Cumulative tracking, retention subtraction, zero-result filing reminder |
| Belgium Work | Pitfall 5: A1 certificate | Validity tracking, expiration warning |
| EU Clients | Pitfall 6: IVA intracomunitario | VIES verification, Modelo 349 reminder |
| Cash Flow | Pitfall 16: Insufficient reserves | Reserve calculator, warning before spending |

---

## Feature-to-Pitfall Mapping

| Feature | Prevents Pitfalls |
|---------|-------------------|
| Calendar/Day Tracker | 1, 9, 14, 15 |
| RETA Calculator | 3, 16 |
| Modelo 130 Calculator | 4, 10, 16 |
| Expense Manager | 7, 8, 13, 17 |
| EU Client Manager | 6 |
| A1 Certificate Tracker | 5 |
| Cash Flow Projector | 16 |
| Document Checklist | 2, 17 |
| Deadline Reminders | 11 |
| Income Reconciliation | 18 |

---

## Confidence Assessment

| Pitfall Category | Confidence | Reason |
|-----------------|------------|--------|
| 183-Day Rule (1, 9) | HIGH | TEAC rulings, AEAT guidance, multiple official sources |
| RETA Regularization (3) | HIGH | TGSS official process, first regularization completed 2025 |
| Modelo 130 (4) | HIGH | Official AEAT forms, well-documented requirements |
| A1 Certificate (5) | HIGH | EU Regulation 883/2004, NISSE documentation |
| IVA Intracomunitario (6) | HIGH | AEAT guidance, multiple verified sources |
| Documentation (7, 8, 13) | HIGH | DGT consultas, official requirements |
| Minimos (10) | HIGH | PWC, official AEAT tables |
| Belgium-Specific (14, 15) | MEDIUM | Treaty text exists but specific provisions need verification |
| Weekend Days (9) | MEDIUM | Interpretation of sporadic absence doctrine |
| VeriFactu (12) | HIGH | RD 254/2025, AEAT official portal |
| Cash Flow (16) | HIGH | Common knowledge, well-documented issue |
| New 2026 Reporting (18) | HIGH | February 2026 implementation confirmed |

---

## Open Questions Requiring Phase-Specific Research

1. **Exact Spain-Belgium DTT provisions for professional services** - Need to read full treaty text to confirm Article 14 application
2. **Belgian filing thresholds** - At what point does Belgian filing become mandatory?
3. **A1 certificate renewal process** - What happens at 24 months exactly?
4. **VeriFactu integration options** - Which tools integrate with tax calculators?
5. **Tarifa plana eligibility with cross-border work** - Any special rules?

---

## Sources Summary

### Official/Authoritative (HIGH confidence)
- [AEAT Sede Electronica](https://sede.agenciatributaria.gob.es)
- [Seguridad Social Portal](https://portal.seg-social.gob.es)
- [BOE: Spain-Belgium DTT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-13375)
- [PWC Tax Summaries Spain](https://taxsummaries.pwc.com/spain)
- [NISSE Belgium](https://www.inasti.be/en)
- [Your Europe: Double Taxation](https://europa.eu/youreurope/citizens/work/taxes/double-taxation/)

### Verified Secondary (MEDIUM confidence)
- [InfoAutonomos](https://www.infoautonomos.com)
- [Declarando](https://declarando.es)
- [Holded Blog](https://www.holded.com/es/blog)
- [Garrigues](https://www.garrigues.com)
- [The Local ES](https://www.thelocal.es)

### Community/News (LOW confidence - use for patterns only)
- [AutonomosyEmprendedor](https://www.autonomosyemprendedor.es)
- [COPE](https://www.cope.es)
