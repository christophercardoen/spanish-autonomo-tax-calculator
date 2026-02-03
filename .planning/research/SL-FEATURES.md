# SL (Sociedad Limitada) Features Research for v2.0

**Researched:** 2026-02-03
**Research Focus:** SL-specific features that DIFFER from autonomo sole proprietors
**Overall Confidence:** HIGH for tax/accounting, MEDIUM-HIGH for social security edge cases

---

## Executive Summary: SL vs Autonomo Key Differences

The Sociedad Limitada (SL) operates under a fundamentally different fiscal and legal framework than the autonomo persona fisica. Understanding these differences is critical for v2.0 multi-business-type support.

### Core Structural Differences

| Aspect | Autonomo | Sociedad Limitada |
|--------|----------|-------------------|
| **Tax regime** | IRPF (19-47% progressive) | Impuesto de Sociedades (15-25% flat) |
| **Identifier** | NIF personal (DNI) | NIF empresa (B + 8 chars) |
| **Social security** | RETA autonomo | RETA autonomo societario (if admin with control) |
| **Minimum contribution base** | 653.59 EUR | 1,000 EUR (always higher) |
| **Gastos dificil justificacion** | 5% (max 2,000 EUR) | 3% (for SS calculation) / NONE for IS |
| **Accounting** | Libro de ingresos y gastos | Libro diario + Mayor + Cuentas anuales |
| **Personal liability** | Unlimited | Limited to capital |
| **Minimum capital** | None | 3,000 EUR |
| **Filing obligations** | Modelo 130 quarterly | Modelo 202 quarterly + Modelo 200 annual |
| **Annual accounts** | None required | Cuentas anuales at Registro Mercantil |

### When SL Becomes More Tax-Efficient

An SL typically becomes more tax-efficient when annual profits reach approximately **40,000-60,000 EUR**. At this level:
- Autonomo IRPF marginal rate: 37-45%
- SL Impuesto de Sociedades: 25% (or 21-22% for micro-empresas)

**Confidence:** HIGH
**Sources:** [Facturaz SL vs Autonomo](https://www.facturaz.es/resources/guides/autonomo-vs-sl), [NIM Extranjeria SL vs Autonomo](https://nimextranjeria.com/autonomo-vs-sl-spain/)

---

## 1. Company Registration & Identity

### CIF/NIF Structure

The NIF (previously CIF) for a Sociedad Limitada:
- **Format:** Letter + 7 digits + control character (e.g., B12345678)
- **Letter B** = Sociedad Limitada
- First 2 digits = province code
- Next 5 digits = Registro Mercantil inscription number
- Final character = control digit/letter

**Invoicing requirement:** NIF must appear on ALL invoices. Missing NIF = invalid invoice = audit risk.

### Formation Requirements

| Requirement | Details |
|-------------|---------|
| Minimum capital | 3,000 EUR (can start with 1 EUR but liable up to 3,000 EUR) |
| Constitution | Escritura publica (public deed) at notary |
| Registration | Registro Mercantil (mandatory) |
| Documents | Estatutos sociales, Modelo 036, Escritura inscrita |
| NIF provisional | Via Modelo 036 before RM inscription |
| NIF definitivo | Within 6 months of inscription |

**Table stakes for v2.0:**
- [ ] CIF/NIF field (B-prefix validation)
- [ ] Company legal name (razon social)
- [ ] Trade name (nombre comercial) if different
- [ ] Registro Mercantil data: Tomo, Folio, Hoja, Inscripcion
- [ ] Constitution date
- [ ] Share capital amount

**Confidence:** HIGH
**Sources:** [AEAT NIF Juridica](https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/solicitar-nif/nif-juridica.html), [Shopify NIF SL Guide](https://www.shopify.com/es/blog/nif-sociedad-limitada)

---

## 2. Tax Regime: Impuesto de Sociedades (IS)

### Corporate Tax Rates 2025-2026

| Entity Type | 2025 Rate | 2026 Rate | Notes |
|-------------|-----------|-----------|-------|
| **General** | 25% | 25% | Standard rate |
| **Micro-empresas** (<1M EUR turnover) | 21%/22%* | 19%/21%* | *21% up to 50k, 22% rest |
| **SMEs** (1-10M EUR turnover) | 24% | Transitional to 20% by 2028 |
| **Startups** (Ley 28/2022) | 15% | 15% | First 4 profitable years |
| **Newly created** | 15% | 15% | First 2 profitable years |
| **Credit institutions** | 30% | 30% | Banks |
| **SOCIMIs** | 0% | 0% | Real estate investment |

**Key difference from autonomo:** IS is FLAT rate on profits, not progressive brackets. This benefits high earners significantly.

**Confidence:** HIGH
**Sources:** [AEAT Tipo Impositivo IS](https://sede.agenciatributaria.gob.es/Sede/en_gb/impuesto-sobre-sociedades/que-base-imponible-se-determina-sociedades/tipo-impositivo.html), [PWC Spain Corporate Tax](https://taxsummaries.pwc.com/spain/corporate/taxes-on-corporate-income)

### Modelo 200 - Annual Corporate Tax Return

**What:** Annual declaration and liquidation of Impuesto de Sociedades
**Who:** ALL entities with Spanish tax residence and legal personality (including dormant SLs with zero activity)
**Deadline:** July 1-25 of following year (for calendar year companies)

**Form structure:**
- Income and expenses
- Base imponible calculation
- Tax rate application
- Deductions and credits
- Quarterly payments offset (from Modelo 202)
- Final liquidation

**Table stakes for v2.0:**
- [ ] Annual P&L summary for IS calculation
- [ ] Base imponible calculator
- [ ] Modelo 200 data export/preview
- [ ] Deadline reminder (July 1-25)

**Confidence:** HIGH
**Sources:** [AEAT Modelo 200](https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GE04.shtml), [Lloret Asesores Modelo 200 Guide](https://www.gestoresyasesoreslloret.com/modelo-200-guia-completa-impuesto-de-sociedades/)

### Modelo 202 - Quarterly Advance Payments

**What:** Fractional payments toward current year's corporate tax
**Who:** Mandatory if:
- Previous year's Modelo 200 had positive amount payable, OR
- Net turnover >6,000,000 EUR in prior 12 months
**When:** First 20 calendar days of April, October, December

**Calculation methods:**
1. **Standard (18%):** 18% of previous year's full tax amount (minus deductions, retentions)
2. **Alternative (24%):** For companies >10M EUR turnover

**Table stakes for v2.0:**
- [ ] Modelo 202 calculator (18% of prior year cuota integra)
- [ ] Track if filing required (positive 200, or >6M turnover)
- [ ] Quarterly deadline reminders (Apr 1-20, Oct 1-20, Dec 1-20)
- [ ] Running total of 202 payments for 200 offset

**Confidence:** HIGH
**Sources:** [AEAT Modelo 202 Instructions 2025](https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-sociedades/modelo-202-is-i_____resencia-territorio-fraccionado_/instrucciones/Instrucciones-para-2025.html), [Legalitas Modelo 202](https://www.legalitas.com/actualidad/modelo-202)

### Base Imponible Calculation

SL base imponible differs from autonomo rendimientos netos:

| Component | Autonomo (IRPF) | SL (IS) |
|-----------|-----------------|---------|
| Starting point | Ingresos - Gastos | Resultado contable (P&L) |
| Adjustments | Gastos dificil (5%, max 2k) | Ajustes extracontables |
| Depreciation | Simplified tables | Amortization per PGC |
| Carry-forward losses | Limited | BINs (unlimited timeframe, 70% limit) |

**BINs (Bases Imponibles Negativas):** Losses can be carried forward indefinitely but limited to offsetting 70% of positive base imponible (100% if <1M EUR).

**Differentiator for v2.0:**
- [ ] Loss carry-forward tracker (BINs)
- [ ] 70% limitation calculator
- [ ] Multi-year loss utilization planning

**Confidence:** HIGH
**Sources:** [Taxadora Corporate Tax Guide 2025](https://taxadora.com/blog/the-ultimate-guide-to-corporate-tax-in-spain-2025-edition/)

---

## 3. Social Security for SL Administradores

### Encuadramiento Rules: When is RETA Required?

An SL administrador MUST register in RETA (autonomo societario) when they have **control efectivo** of the company:

| Situation | RETA Required? | Regime |
|-----------|----------------|--------|
| **>50% shares** | YES | RETA obligatorio |
| **50% with spouse/family up to 2nd degree** | YES | RETA obligatorio |
| **>=33% shares + working in company** | YES | RETA obligatorio |
| **>=25% shares + functions of direction/management** | YES | RETA obligatorio |
| **<25% + admin retribuido** | NO | Regimen General Asimilado |
| **No control + no functions** | NO | May not need to contribute |

**Key insight:** Most single-owner SLs will have the owner in RETA as autonomo societario.

**Confidence:** HIGH
**Sources:** [Legalitas Alta RETA Socios Administradores](https://www.legalitas.com/actualidad/alta-en-reta-obligaciones-para-socios-y-administradores), [Supralegit Encuadramiento SS](https://www.supralegit.com/blog/encuadramiento-socios-administradores-seguridad-social/)

### Autonomo Societario vs Autonomo Persona Fisica

| Aspect | Autonomo Persona Fisica | Autonomo Societario |
|--------|-------------------------|---------------------|
| **Minimum contribution base** | 653.59 EUR | **1,000 EUR** (always) |
| **Minimum cuota 2026** | ~200 EUR/month (tramo 1) | **315 EUR/month** |
| **Gastos dificil justificacion** | 7% (for SS calc) | **3%** (for SS calc) |
| **Tarifa plana eligible** | Yes (80 EUR first year) | **No** |
| **MEI 2026** | 0.9% | 0.9% |
| **Total contribution rate** | 31.5% | 31.5% |

**Critical difference:** Autonomo societario ALWAYS pays minimum 315 EUR/month in 2026, even if business has no income. The 1,000 EUR minimum base is fixed.

**Table stakes for v2.0:**
- [ ] Detect SL administrador with control = autonomo societario
- [ ] Use 1,000 EUR minimum base (not tramo tables)
- [ ] Calculate 3% (not 7%) for gastos dificil in SS calculations
- [ ] Show higher minimum cuota warning

**Confidence:** HIGH
**Sources:** [InfoAutonomos Cuota Autonomos Societarios 2026](https://www.infoautonomos.com/seguridad-social/cuota-autonomos-societarios/), [Quipu Cuotas Autonomos Societarios](https://getquipu.com/blog/cuotas-de-autonomos-societarios/)

### Dual Autonomo Situation

If a person has BOTH an autonomo activity AND is admin of an SL with control:
- They do NOT pay double RETA
- They are categorized as autonomo societario
- Higher minimum base (1,000 EUR) applies to combined activities

**Differentiator for v2.0:**
- [ ] Multi-entity detection: "You have autonomo + SL admin = single RETA as societario"
- [ ] Correct contribution calculation when multiple businesses

**Confidence:** MEDIUM-HIGH (edge case, verify with specific consultas)

---

## 4. Expense Deduction Rules: SL vs Autonomo

### Critical Differences

| Expense Type | Autonomo | SL |
|--------------|----------|-----|
| **Gastos dificil justificacion** | 5% (max 2,000 EUR) | **DOES NOT EXIST for IS** |
| **Vehicle (IVA)** | 50% typical | **100% if company car** |
| **Vehicle (IRPF/IS)** | Must prove 100% business use | Retribucion en especie if personal use |
| **Meals (dietas)** | 26.67/53.34 EUR limits Spain | **No limit** (must be justified) |
| **Meals abroad** | 48.08/91.35 EUR limits | **No limit** (must be justified) |
| **Client entertainment** | Hard to justify | **Up to 1% of net revenue** |
| **Home office** | 30% of proportional supplies | Can rent from admin (at market price) |
| **Salary to admin** | N/A | **Deductible** (if in estatutos) |
| **Dividends** | N/A | **NOT deductible** |

### Vehicle Expenses in Detail

**Autonomo:**
- Must prove car is used ONLY for business (nearly impossible for most)
- IVA deduction: typically 50%
- IRPF deduction: proportional to proven business use
- Hacienda is VERY strict

**SL:**
- Company car in SL name: 100% deductible if business use
- Personal use = retribucion en especie (benefit in kind) taxed to admin
- Simpler to justify "company fleet vehicle"

**Table stakes for v2.0:**
- [ ] NO gastos dificil field for SL
- [ ] Vehicle expense: 100% option for SL company cars
- [ ] Client entertainment: 1% of revenue cap calculator
- [ ] Meal expenses: no daily cap for SL (but require justification)

**Confidence:** HIGH
**Sources:** [Esteve Fuchs Gastos Deducibles Autonomo vs SL](https://estevefuchs.com/fiscalidad/gastos-deducibles-autonomo-vs-sl-principales-divergencias/)

### Documentation Requirements

SL has STRICTER documentation requirements than autonomo:

| Requirement | Autonomo | SL |
|-------------|----------|-----|
| **Accounting books** | Libro ingresos/gastos | Libro diario + Mayor + Inventarios |
| **Financial statements** | None | Balance + P&L + Memoria |
| **Filing** | None | Cuentas anuales at Registro Mercantil |
| **Audit** | No | Required above certain thresholds |
| **Statutory requirements** | Minimal | Estatutos must document admin retribution |

**Confidence:** HIGH
**Sources:** [Abad Abogados SL vs Autonomo](https://abadabogados.com/en/s-l-or-autonomo-which-is-better/)

---

## 5. Accounting Requirements

### Mandatory Books for SL

| Book | Description | Required |
|------|-------------|----------|
| **Libro Diario** | Daily transaction journal | MANDATORY |
| **Libro de Inventarios y Cuentas Anuales** | Quarterly trial balances, annual accounts | MANDATORY |
| **Libro Mayor** | General ledger | Recommended (not strictly mandatory) |
| **Actas de Juntas** | Minutes of shareholder meetings | MANDATORY |
| **Registro de Socios** | Shareholder register | MANDATORY |

**Legalization:** Books must be legalized at Registro Mercantil annually (within 4 months of fiscal year end).

**Confidence:** HIGH
**Sources:** [AEAT Libros Obligatorios IS](https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/gestion-impuesto-sobre-sociedades/obligaciones-contables-registrales/libros-obligatorios.html)

### Cuentas Anuales (Annual Accounts)

Every Spanish SL must prepare, approve, and file:

1. **Balance de Situacion** (Balance Sheet)
   - Assets (Activo): current and non-current
   - Liabilities (Pasivo): current and non-current
   - Equity (Patrimonio Neto)

2. **Cuenta de Perdidas y Ganancias** (Profit & Loss Statement)
   - Income (Ingresos)
   - Expenses (Gastos)
   - Result before and after tax

3. **Memoria** (Notes)
   - Accounting policies
   - Detailed breakdowns
   - Related party transactions

4. **Estado de Cambios en el Patrimonio Neto** (Statement of Changes in Equity)
   - Required for normal model
   - Not required for PYME/abbreviated

### Deadlines

| Action | Deadline | For Calendar Year Companies |
|--------|----------|----------------------------|
| Formulation | 3 months after FY end | March 31 |
| Approval by shareholders | 6 months after FY end | June 30 |
| Filing at Registro Mercantil | 1 month after approval | July 30 |

**Penalties for non-filing:**
- Fines: 1,200-60,000 EUR (more if turnover >6M EUR)
- Registro Mercantil can close the company's registration sheet
- No corporate acts can be registered until filed

### Simplified Accounting for PYMES/Micro-empresas

| Entity Type | Total Assets | Net Turnover | Employees | Model |
|-------------|--------------|--------------|-----------|-------|
| Micro-empresa | <1,000,000 EUR | <2,000,000 EUR | <10 | PGC Micro |
| PYME | <2,850,000 EUR | <5,700,000 EUR | <50 | PGC PYME |
| General | Above limits | Above limits | >50 | PGC General |

**PGC PYME benefits:**
- Simplified balance and P&L formats
- Fewer disclosure requirements in Memoria
- No Estado de Cambios required

**Table stakes for v2.0:**
- [ ] Balance sheet generator (simplified PYME model)
- [ ] P&L statement generator
- [ ] Cuentas anuales deadline reminders
- [ ] Filing status tracker (formulated, approved, filed)

**Differentiator for v2.0:**
- [ ] Detect PYME eligibility based on metrics
- [ ] Auto-generate annual accounts from transaction data
- [ ] Registro Mercantil filing checklist

**Confidence:** HIGH
**Sources:** [BOE PGC PYMES](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966), [ICAC PGC PYMES PDF](https://www.icac.gob.es/sites/default/files/2023-04/PLAN_GENERAL_DE_CONTABILIDAD_Pymes%20(1).pdf)

---

## 6. Invoicing Differences

### Required Invoice Elements: SL vs Autonomo

| Element | Autonomo | SL |
|---------|----------|-----|
| **Identifier** | NIF personal (DNI format) | NIF empresa (B + 8 chars) |
| **Name** | Nombre completo | Razon social (legal name) |
| **Activity** | IAE activity | Corporate purpose |
| **Registro Mercantil** | Not required | **Tomo, Folio, Hoja, Inscripcion** |
| **Share capital** | Not required | Optional but common |

### VeriFactu Compliance

Both autonomo and SL must comply with VeriFactu, but with different timelines:

| Entity Type | Deadline |
|-------------|----------|
| Societies (IS taxpayers) | **January 1, 2027** |
| Autonomos and others | July 1, 2027 |

**SL-specific VeriFactu requirements:**
- Software must generate hash-chained invoice records
- QR code on invoices
- "FACTURA VERIFICABLE" or "VERIFACTU" legend
- Cannot modify/delete issued invoices (only rectificativas)

**Table stakes for v2.0:**
- [ ] Invoice template with Registro Mercantil data
- [ ] NIF format validation (B-prefix for SL)
- [ ] VeriFactu compliance tracking by entity type
- [ ] Different deadline reminders (Jan 2027 for SL)

**Confidence:** HIGH
**Sources:** [Reixmor VeriFactu SL Guide 2025](https://www.reixmor.com/verifactu-para-sl-guia-definitiva-2025/), [Quipu VeriFactu](https://getquipu.com/es/sistema-verifactu)

---

## 7. Quarterly & Annual Filing Calendar

### SL Filing Calendar (Calendar Year)

| Form | Frequency | Deadline | Purpose |
|------|-----------|----------|---------|
| **Modelo 303** | Quarterly | Apr 1-20, Jul 1-20, Oct 1-20, Jan 1-30 | IVA self-assessment |
| **Modelo 202** | 3x/year | Apr 1-20, Oct 1-20, Dec 1-20 | Corporate tax advance |
| **Modelo 349** | Quarterly/Monthly | Per period | Intra-EU operations |
| **Modelo 347** | Annual | February | Operations >3,005.06 EUR |
| **Modelo 390** | Annual | Jan 1-30 | IVA annual summary |
| **Modelo 200** | Annual | Jul 1-25 | Corporate tax return |
| **Cuentas Anuales** | Annual | Jul 30 | Annual accounts filing |

### Comparison: SL vs Autonomo Filing

| Form | Autonomo | SL |
|------|----------|-----|
| **IVA (303)** | Same | Same |
| **IVA annual (390)** | Same | Same |
| **Intra-EU (349)** | Same | Same |
| **Income tax** | Modelo 130 quarterly | **Modelo 202** (3x/year) |
| **Annual tax** | IRPF (Renta) | **Modelo 200** |
| **Annual accounts** | None | **Cuentas Anuales** at RM |

**Key difference:** SL has Modelo 202 only 3 times/year (not quarterly), but adds Modelo 200 and Cuentas Anuales obligations.

**Table stakes for v2.0:**
- [ ] Separate filing calendars per entity type
- [ ] 202 vs 130 logic based on business type
- [ ] Cuentas Anuales reminders (formulation, approval, filing)
- [ ] Modelo 200 July deadline tracker

**Confidence:** HIGH
**Sources:** [Cuentica Calendario Fiscal 2026](https://cuentica.com/asesoria/calendario-fiscal-2026-autonomos-empresas/)

---

## 8. Multi-Entity Management Patterns

### User Interface Patterns

For a user with multiple businesses (e.g., autonomo + SL):

**Recommended approach:**
1. **Entity selector** - Dashboard shows "Switch between: My Autonomo | My SL Company"
2. **Separate data silos** - Each entity has own clients, invoices, expenses
3. **Shared user profile** - Single login, but entity-specific fiscal data
4. **Cross-entity visibility** - Optional consolidated view for planning

### Data Separation

| Data Type | Shared | Per-Entity |
|-----------|--------|------------|
| User login/profile | X | |
| Clients | | X |
| Invoices | | X |
| Expenses | | X |
| Fiscal settings (NIF, regime) | | X |
| Tax calculations | | X |
| Filing deadlines | | X (different calendars) |
| Reports | | X (can have consolidated option) |

### Permissions Model

| Role | Access Level | Use Case |
|------|--------------|----------|
| **Owner** | Full read/write, admin | Business owner |
| **Gestor** | Read-only, some reports | External tax advisor |
| **Accountant** | Read-write, no settings | Bookkeeper |
| **Partner** | Entity-specific access | SL co-owner |

**Table stakes for v2.0:**
- [ ] Entity creation (autonomo or SL type)
- [ ] Entity switcher in UI
- [ ] Data isolation per entity
- [ ] Basic role: Owner + Gestor (read-only)

**Differentiator for v2.0:**
- [ ] Multi-user per entity
- [ ] Accountant role with limited write
- [ ] Cross-entity consolidated reports

**Confidence:** HIGH (standard SaaS patterns)

---

## 9. Cross-Entity Scenarios

### Autonomo Invoicing Own SL

This is a common scenario but involves **operaciones vinculadas** (related party transactions).

**Requirements:**
1. **Market price:** Transaction must be at arm's length (precio de mercado)
2. **Documentation:** Written contract recommended (Art. 16 LSC)
3. **Independence:** Autonomo must have own means (not integrated in SL structure)
4. **Invoice type:**
   - Professional services: Invoice WITH IVA if no labor relationship
   - Labor relationship exists: Invoice WITHOUT IVA

**Retenciones on autonomo invoices to own SL:**
- Professional services: 15% retention (7% first years)
- Admin functions via invoice: 15% or statutory rate

**Warning signs (Hacienda scrutiny):**
- Admin receiving ONLY dividends, no salary = suspect
- All autonomo income from own SL = possible false autonomo
- Prices significantly below market = transfer pricing risk

**Table stakes for v2.0:**
- [ ] Detect invoice from autonomo to related SL
- [ ] Warning: "Related party transaction - ensure market price"
- [ ] Track autonomo income sources (% from own SL)

**Confidence:** HIGH
**Sources:** [Billin Facturar Propia Empresa](https://www.billin.net/blog/facturar-propia-empresa/), [OpenGes Autonomo Societario Facturar](https://www.openges.es/blog/autonomo-societario-facturar-a-otra-empresa/)

### SL Paying Admin Salary vs Dividends

**Salary (Nomina):**
- Deductible expense for IS
- Taxed at IRPF progressive rates (19-47%) for recipient
- Requires payroll processing
- Must be documented in estatutos/junta agreement
- Retention: 35% fixed for admin functions (or tables for general work)

**Dividends:**
- NOT deductible for IS
- Taxed at capital gains rates (19-28%) for recipient
- 19% retention at payment
- Requires sufficient reserves (beneficios no distribuidos)

**Optimal strategy:** Mix of salary (to reduce IS base) + dividends (lower personal rate). Exact mix depends on marginal IRPF rate and IS rate.

**Rule of thumb:**
- If personal IRPF marginal rate < 35%: More salary
- If personal IRPF marginal rate > 45%: More dividends
- Micro-empresa (21-22% IS): Dividend strategy gains ground

**Differentiator for v2.0:**
- [ ] Salary vs dividend optimizer
- [ ] Simulate scenarios: "If 100% salary... If 100% dividend... If 50/50..."
- [ ] Track dividend distribution capacity (retained earnings)

**Confidence:** HIGH
**Sources:** [Consultax Sueldo o Dividendos 2025](https://consult.tax/sueldo-o-dividendos-en-2025-o-la-decision-inteligente-del-administrador-socio-de-una-pyme-en-espana/)

---

## 10. Common SL Pitfalls

### Critical Pitfalls

#### Pitfall 1: Missing Cuentas Anuales Filing

**What goes wrong:** SL fails to file annual accounts by July 30 deadline.

**Consequences:**
- Fines: 1,200-60,000 EUR (higher if turnover >6M EUR)
- Registro Mercantil closes registration sheet
- Cannot register any corporate acts (capital increase, admin changes, etc.)
- Reputational damage (accounts are public)

**Prevention:**
- Deadline reminders at 60, 30, 15, 7 days before
- Checklist: Formulated -> Approved by Junta -> Filed at RM

#### Pitfall 2: Forgetting Modelo 202

**What goes wrong:** SL forgets quarterly corporate tax advance payments.

**Consequences:**
- Automatic penalties and interest
- Cash flow problem at annual settlement (large lump sum)

**Prevention:**
- Calendar with Apr/Oct/Dec deadlines
- Reminder: "Previous year positive = 202 required"

#### Pitfall 3: Admin Without RETA Registration

**What goes wrong:** Admin with >25% + functions of direction not registered in RETA.

**Consequences:**
- SS inspection finds unregistered admin
- Retroactive contributions + surcharges + penalties
- Loss of prestaciones coverage

**Prevention:**
- Entity setup wizard asks: "Do you have control efectivo?"
- Warning: "Admin with control must register as autonomo societario"

#### Pitfall 4: Mixing Personal and Company Money

**What goes wrong:** Admin uses company card/account for personal expenses, or company pays personal bills.

**Consequences:**
- Audit flag: "levantar el velo" (pierce corporate veil)
- Personal liability for company debts
- Reclassification as retribucion en especie
- IS deduction disallowed

**Prevention:**
- Expense categories: "Business" vs "Personal (reembolsable)"
- Warning when expense looks personal
- Track admin cuenta corriente (loan account)

#### Pitfall 5: Not Documenting Admin Retribution

**What goes wrong:** Admin receives salary/payments not documented in estatutos or junta agreement.

**Consequences:**
- IS deduction disallowed
- Potential reclassification as dividend (different tax treatment)
- Art. 217 LSC non-compliance

**Prevention:**
- Setup wizard: "Is admin retribution documented in estatutos?"
- Reminder to hold annual junta and approve remuneration

#### Pitfall 6: Hacienda Notifications Missed

**What goes wrong:** SL doesn't check electronic notifications. Hacienda does NOT send postal mail.

**Consequences:**
- Missed response deadlines
- Default penalties
- No opportunity to appeal

**Prevention:**
- Certificado digital required reminder
- "Check notifications every 10 days" prompt
- Integration with AEAT notification system (future)

### Moderate Pitfalls

#### Pitfall 7: Incorrect Corporate Tax Rate

**What goes wrong:** SL uses 25% when eligible for 21-22% (micro-empresa) or 15% (startup).

**Consequences:**
- Overpaying corporate tax
- Suboptimal tax planning

**Prevention:**
- Detect eligibility: "<1M turnover = micro-empresa rates"
- Startup law eligibility checker

#### Pitfall 8: BINs Not Utilized

**What goes wrong:** SL had losses in prior years but doesn't offset against current profits.

**Consequences:**
- Paying tax that could be reduced/eliminated
- BINs don't expire but may be forgotten

**Prevention:**
- Track historical losses
- Auto-apply to new profitable years (up to 70%)

#### Pitfall 9: Related Party Transactions Without Documentation

**What goes wrong:** Transactions between admin and company not at market price or undocumented.

**Consequences:**
- Transfer pricing adjustments
- IS base increased by Hacienda
- Penalties for improper documentation

**Prevention:**
- Flag all transactions with admin/shareholders
- Market price verification prompts
- Contract template suggestions

### Table Stakes: Pitfall Prevention for v2.0

- [ ] Cuentas anuales deadline tracker with escalating reminders
- [ ] Modelo 202 filing requirement detector
- [ ] Admin RETA registration checker
- [ ] Expense personal/business segregation
- [ ] Admin retribution documentation reminder
- [ ] Certificate digital reminder for notifications

**Confidence:** HIGH
**Sources:** [GM Tax 5 Mistakes SL Founding](https://gmtaxconsultancy.com/en/law/5-mistakes-to-avoid-in-the-founding-of-a-spanish-s-l/), [GPA Common Tax Mistakes Startups](https://gpasoc.com/en/common-tax-mistakes-of-startups-in-spain-and-how-to-avoid-them/)

---

## Feature Categorization Summary

### Table Stakes for v2.0 (Must Have)

| Category | Feature |
|----------|---------|
| **Identity** | CIF/NIF field with B-prefix validation |
| **Identity** | Registro Mercantil data storage |
| **Tax** | Impuesto de Sociedades calculator (25%, 21-22%, 15% rates) |
| **Tax** | Modelo 202 quarterly calculator |
| **Tax** | Modelo 200 annual data aggregation |
| **Social Security** | Autonomo societario detection |
| **Social Security** | 1,000 EUR minimum base calculation |
| **Expenses** | NO gastos dificil for SL |
| **Expenses** | Different meal deduction rules |
| **Accounting** | P&L generation |
| **Accounting** | Balance sheet generation (simplified PYME) |
| **Invoicing** | SL invoice template with RM data |
| **Filings** | SL-specific deadline calendar |
| **Multi-entity** | Entity type selector (autonomo/SL) |
| **Multi-entity** | Data separation per entity |
| **Pitfalls** | Cuentas anuales deadline reminders |

### Differentiators for v2.0 (High Value)

| Category | Feature |
|----------|---------|
| **Tax** | BINs (loss carry-forward) tracker |
| **Tax** | Micro-empresa/startup rate eligibility detector |
| **Optimization** | Salary vs dividend simulator |
| **Accounting** | Auto-generate cuentas anuales from transactions |
| **Cross-entity** | Related party transaction detection |
| **Permissions** | Gestor read-only access |

### Defer to v2.1+ (Complex/Low Priority)

| Category | Feature |
|----------|---------|
| **Payroll** | Full nomina processing for admin |
| **Audit** | Audit requirement detection (large companies) |
| **Consolidated** | Multi-entity consolidated reports |
| **Permissions** | Full accountant role with write access |
| **Integration** | AEAT notification system integration |
| **Advanced** | Transfer pricing documentation generator |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Corporate tax rates | HIGH | Official AEAT source verified |
| Modelo 200/202 requirements | HIGH | AEAT official documentation |
| Autonomo societario SS | HIGH | Multiple official sources agree |
| Expense deduction differences | HIGH | Consistent across multiple advisory sources |
| Accounting requirements | HIGH | BOE/ICAC official regulations |
| Cuentas anuales deadlines | HIGH | Codified in law |
| Cross-entity transactions | HIGH | Art. 16 LSC, Art. 18 LIS documented |
| Salary vs dividend optimization | MEDIUM-HIGH | Tax advisory consensus, specifics vary |
| PYME thresholds | HIGH | PGC PYME official |

---

## Sources

### Official Government Sources (HIGH confidence)
- [AEAT Impuesto de Sociedades](https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades.html)
- [AEAT Modelo 200](https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GE04.shtml)
- [AEAT Modelo 202](https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-sociedades/modelo-202-is-i_____resencia-territorio-fraccionado_/instrucciones/Instrucciones-para-2025.html)
- [AEAT Libros Obligatorios](https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/gestion-impuesto-sobre-sociedades/obligaciones-contables-registrales/libros-obligatorios.html)
- [BOE PGC PYMES RD 1515/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966)
- [PWC Spain Corporate Tax Summary](https://taxsummaries.pwc.com/spain/corporate/taxes-on-corporate-income)

### Professional Advisory Sources (MEDIUM-HIGH confidence)
- [InfoAutonomos Cuota Autonomos Societarios](https://www.infoautonomos.com/seguridad-social/cuota-autonomos-societarios/)
- [Legalitas Alta RETA Obligaciones](https://www.legalitas.com/actualidad/alta-en-reta-obligaciones-para-socios-y-administradores)
- [Consultax Sueldo o Dividendos 2025](https://consult.tax/sueldo-o-dividendos-en-2025-o-la-decision-inteligente-del-administrador-socio-de-una-pyme-en-espana/)
- [Esteve Fuchs Gastos Deducibles SL vs Autonomo](https://estevefuchs.com/fiscalidad/gastos-deducibles-autonomo-vs-sl-principales-divergencias/)
- [GM Tax SL Formation Mistakes](https://gmtaxconsultancy.com/en/law/5-mistakes-to-avoid-in-the-founding-of-a-spanish-s-l/)

### Community/Industry Sources (MEDIUM confidence)
- [Facturaz Autonomo vs SL](https://www.facturaz.es/resources/guides/autonomo-vs-sl)
- [Quipu VeriFactu](https://getquipu.com/es/sistema-verifactu)
- [Reixmor VeriFactu SL Guide](https://www.reixmor.com/verifactu-para-sl-guia-definitiva-2025/)

---

## Open Questions for Phase-Specific Research

1. **Micro-empresa rate transition:** Exact rates for 2027+ (currently transitioning)
2. **SL formation via PAE:** One-day formation process via Punto de Atencion al Emprendedor - details for onboarding flow
3. **Audit thresholds:** Exact limits that trigger mandatory audit (for future v2.1+ planning)
4. **Convenio colectivo:** If SL has employees, which applies - relevant for future payroll features
5. **Belgian SL work:** Does A1 certificate cover SL admin the same as autonomo? Verify EU Regulation 883/2004 application
