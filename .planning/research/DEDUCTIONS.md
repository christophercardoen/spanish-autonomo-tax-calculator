# Expense Deduction Research - Spanish Autonomo

**Research Date:** 2026-01-29
**Focus:** Expense deductibility rules for Spanish autonomo with Belgium cross-border work costs
**Overall Confidence:** MEDIUM-HIGH (based on official AEAT sources and verified tax guidance)

---

## General Deductibility Rules

For an expense to be deductible in IRPF and IVA, it must meet THREE essential requirements:

### 1. Vinculado a la actividad economica (Linked to economic activity)
- The expense must be **directly related** to generating income
- Not merely "useful" or "convenient" - must be **necessary** for professional activity
- Must be proportionate and reasonable in relation to the activity

### 2. Debidamente justificado (Properly justified)
- **Factura completa (complete invoice)** required with all fiscal data
- Tickets and facturas simplificadas are generally NOT valid for deduction
- Invoice must be in the autonomo's name with correct NIF

### 3. Correctamente contabilizado (Correctly recorded)
- Must be registered in accounting in the corresponding fiscal year
- Must follow the accrual principle (devengo) or cash basis if opted in
- Must maintain records for **minimum 4 years** (prescription period)

**Source:** [Infoautonomos - Gastos Deducibles 2026](https://www.infoautonomos.com/fiscalidad/gastos-deducibles-autonomos-irpf-estimacion-directa/)
**Confidence:** HIGH - Multiple sources confirm these core requirements

---

## Documentation Requirements

### Factura Completa Requirements

A valid "factura completa" for deduction purposes must include:

| Field | Required |
|-------|----------|
| Invoice number and date | YES |
| Supplier name and NIF | YES |
| Supplier address | YES |
| **Recipient (autonomo) name** | YES |
| **Recipient NIF** | YES |
| **Recipient fiscal address** | YES |
| Description of goods/services | YES |
| Base imponible (taxable amount) | YES |
| IVA rate and amount (if applicable) | YES |
| Total amount | YES |

### What is NOT Valid

| Document Type | Valid for Deduction? | Notes |
|---------------|---------------------|-------|
| Factura completa | YES | Full deduction if requirements met |
| Factura simplificada | NO | Lacks recipient data - no deduction |
| Ticket/receipt | NO | Systematically rejected by AEAT |
| Bank statement alone | NO | Insufficient proof |

### Electronic Payment Requirement

**CRITICAL for dietas:** Since 2018, meal/maintenance expenses MUST be paid via electronic means:
- Tarjeta bancaria (bank card)
- Transferencia (transfer)
- Bizum
- **Cash payments are NOT deductible for dietas**

This provides traceability for AEAT verification.

**Source:** [AEAT Sede Electronica - Novedades Ley 6/2017](https://sede.agenciatributaria.gob.es/Sede/irpf/novedades-impuesto/novedades-normativa/principales-novedades-tributarias-introducidas-ley-6_2017.html)
**Confidence:** HIGH - Official AEAT source

---

## Home Office Expenses

### The 30% Rule for Utilities (Suministros)

**Applicable when:** Autonomo works from home AND has notified Hacienda via Modelo 036/037 that the residence is used for business activity.

**Deductible supplies:**
- Electricity
- Water
- Gas
- Telephone
- Internet

### Calculation Formula

```
Deductible Amount = Total Utility Cost x (Business m2 / Total m2) x 30%
```

**Example from your scenario:**
- Home: 100 m2
- Workspace: 30 m2 (30% of home)
- Annual utilities: 5,000 EUR
- Calculation: 5,000 x 30% x 30% = **450 EUR deductible (9% effective)**

### Requirements

1. Must register home as business location in declaracion censal (Modelo 036/037)
2. Utility contracts should be in autonomo's name
3. Keep all invoices for minimum 4 years
4. Apply deduction to base imponible (without IVA)

### Common Mistakes to Avoid

- **DO NOT** deduct 100% of any utility even with home office
- **DO NOT** deduct 30% flat of total bill - it's 30% of the proportional business use
- The effective maximum is typically 9-12% of total utility costs

**Source:** [AEAT - Ley 6/2017 Novedades](https://sede.agenciatributaria.gob.es/Sede/irpf/novedades-impuesto/novedades-normativa/principales-novedades-tributarias-introducidas-ley-6_2017.html)
**Confidence:** HIGH - Official AEAT documentation

---

## Belgium Work Costs

### Flights (Vuelos)

#### IVA Treatment
| Route | IVA Rate | Notes |
|-------|----------|-------|
| Spain to Belgium | **EXEMPT (0%)** | International flight per Art. 22.13 Ley IVA |
| Belgium to Spain | **EXEMPT (0%)** | International flight |
| Domestic Spain flight | 10% | Often included in price |
| Multi-leg international | **EXEMPT (0%)** | Both legs exempt if single ticket |

**Key point:** International flights from Spain have NO IVA - this is correct, not an error.

#### IRPF Deduction Requirements
- Must be directly related to business activity
- Factura completa required (not simplified)
- Must be recorded in accounting (cuenta 629)
- Must demonstrate professional purpose

#### Documentation for Flights
- Boarding passes (keep!)
- Invoice from airline/agency
- Calendar/email evidence of business purpose
- Meeting notes or client communications

**Warning:** Travel agency invoices under REAV (Regimen Especial Agencias de Viajes) do NOT show deductible IVA - the agency calculates IVA on margin only. Direct airline bookings are cleaner.

**Source:** [AEAT - Regimen Especial Agencias de Viajes](https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-especial-agencias-viajes/que-operaciones-se-encuentran-exentas.html)
**Confidence:** HIGH - Official AEAT source

---

### Accommodation

#### Hotels in Belgium (Intracomunitario)

**CRITICAL:** Belgian hotel invoices include Belgian IVA (typically 9% for accommodation) - this IVA is **NOT directly deductible** in Spanish IVA declarations.

| Aspect | Treatment |
|--------|-----------|
| Base cost | Deductible in IRPF as business expense |
| Belgian IVA | NOT deductible via Modelo 303 |
| Recovery method | Modelo 360 (IVA refund request) |
| Minimum for refund | 50 EUR |
| Deadline | 30 September of following year |

#### Modelo 360 Process

1. Compile Belgian hotel invoices with IVA
2. Submit Modelo 360 electronically via AEAT Sede
3. Request refund of Belgian IVA from Belgian tax authority (via Spanish AEAT)
4. Can submit quarterly if >400 EUR, or annually if >50 EUR

#### Airbnb Problem

**WARNING:** Airbnb accommodations are problematic for autonomo deductions:

| Issue | Problem |
|-------|---------|
| Missing NIF/DNI | Airbnb receipts often lack recipient fiscal data |
| No factura completa | Typically only confirmation emails, not valid invoices |
| IVA treatment | Complex - often no Spanish IVA to deduct |
| AEAT acceptance | High risk of rejection in inspection |

**Recommendation:** Use hotels with proper invoicing (factura completa). If Airbnb is necessary:
- Request factura completa from host (many cannot provide)
- Document business purpose extensively
- Accept that IVA recovery may not be possible
- Keep all communications showing business necessity

**Source:** [Captio - IVA Operaciones Intracomunitarias](https://www.captio.net/blog/iva-operaciones-intracomunitarias-y-gastos-de-viajes-de-empresa)
**Confidence:** MEDIUM-HIGH - Multiple sources agree

---

### Dietas (Meal Allowances)

#### Official AEAT Limits (2026)

| Scenario | Spain | Abroad (Belgium) |
|----------|-------|------------------|
| **Without overnight stay** | 26.67 EUR/day | **48.08 EUR/day** |
| **With overnight stay** | 53.34 EUR/day | **91.35 EUR/day** |

**For Belgium work:** The "abroad with overnight" limit of **91.35 EUR/day** applies.

#### Requirements for Dietas Deduction

ALL of these must be met:

1. **Municipio distinto** - Must be in a different municipality from residence
2. **Establecimientos de hosteleria/restauracion** - Restaurants/hospitality only
3. **Pago electronico** - Must pay by card/transfer/Bizum (NO cash)
4. **Factura or justificante** - Keep the receipt/invoice
5. **Vinculado a actividad** - Related to business activity

#### What Counts as "Pernocta" (Overnight)

The higher limits (53.34/91.35 EUR) apply when:
- You sleep in a different municipality from your residence
- AND different from your habitual workplace
- Hotel stay is documented

#### Continuous Stay Limitation

**IMPORTANT:** If you stay in the same location continuously for MORE than 9 months, dietas become taxable income. Vacation and sick leave periods are excluded from this count.

**Source:** [AEAT - Asignaciones Gastos Manutencion](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2023/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_1-rendimientos-integros/7_1_1_2-dietas-gastos-viaje/asignaciones-gastos-manutencion-estancia.html)
**Confidence:** HIGH - Official AEAT source

---

### Local Transport (Belgium)

#### Deductible Transport in Belgium

| Type | IRPF Deductible | IVA Deductible | Notes |
|------|-----------------|----------------|-------|
| Train (SNCB) | YES | Via Modelo 360 | Belgian IVA not direct deductible |
| Metro/Bus | YES | Via Modelo 360 | Keep tickets/invoices |
| Taxi | YES | NO | IRPF only, no IVA deduction |
| Uber/Bolt | YES | Varies | Check invoice format |

#### Documentation Requirements

- Keep all tickets and receipts
- Request factura/invoice where possible
- Note business purpose (which client, which meeting)
- Belgian transport tickets may not show recipient data - still deductible in IRPF if business purpose demonstrated

**Confidence:** MEDIUM - Rules are clear but enforcement varies

---

## Mobile Phone Deduction

### The Reality (Not 50% Automatic)

**IMPORTANT CORRECTION:** Unlike vehicles, there is NO automatic 50% deduction for mobile phones.

#### Official Position (DGT V1233-25, July 2025)

The phone/device must be used **"directa y exclusivamente"** (directly and exclusively) for professional activity:
- Mixed personal/professional use = NO deduction allowed
- This applies to both IRPF AND IVA

#### Practical Reality

| Scenario | IRPF | IVA |
|----------|------|-----|
| Single phone, mixed use | Problematic | Problematic |
| Two phones (personal + business) | 100% business line | 100% business line |
| Single phone, documented 50% use | Often accepted (50-80%) | Often challenged |

#### Recommended Approach

1. **Best:** Maintain separate personal and business phone lines
2. **Second best:** Single phone with documented professional use percentage
3. **Document everything:** Business calls, WhatsApp client communications, etc.

**Source:** [Infoautonomos - Deducir Telefono](https://www.infoautonomos.com/blog/deducir-telefono/)
**Confidence:** HIGH - Multiple sources + DGT consultation V1233-25

---

## Gray Areas & Risks

### Weekend Travel

**HIGH RISK AREA**

| Scenario | Risk Level | Notes |
|----------|------------|-------|
| Friday departure, Monday return | MEDIUM | Weekend hotel may be questioned |
| Weekend work documented | LOW | Keep meeting notes, emails |
| Pure weekend leisure | HIGH | Not deductible |
| Extended personal stay added | HIGH | Only business portion deductible |

**Hacienda's position:** Weekend expenses are "difficult to accept" without clear professional justification.

**Mitigation strategies:**
- Document meetings/work during weekend
- Keep client communications with dates
- Separate invoices for business vs personal days if staying longer
- Note in calendar: "Client X meeting" not just "Belgium trip"

### Mixed Business/Personal Trips

**Example scenario:** Fly to Belgium Friday, work Monday-Thursday, fly back Friday

| Day | Deductible? | Notes |
|-----|-------------|-------|
| Friday flight | Partial | May need to prorate if weekend personal |
| Weekend hotel | NO | Unless documented work |
| Mon-Thu hotel | YES | Core business days |
| Mon-Thu dietas | YES | Within limits |
| Friday return flight | YES | Return from business |

**Conservative approach:** Only deduct clear business days. Weekend is gray area.

### Same Municipality Work

**NOT deductible:** Meals/dietas in your municipality of residence, even if at a restaurant for "work."

This means:
- Working lunch in your home city = NOT deductible as dieta
- Coffee meeting with local client = NOT deductible as dieta
- Snack while working from cafe = NOT deductible as dieta

---

## Common Mistakes

### 1. Using Tickets Instead of Facturas

**Mistake:** Keeping restaurant tickets/receipts without requesting factura completa
**Consequence:** AEAT systematically rejects these deductions
**Fix:** ALWAYS request "factura con mis datos fiscales" - provide NIF and address

### 2. Cash Payment for Dietas

**Mistake:** Paying restaurant bills in cash
**Consequence:** Dietas become non-deductible (since 2018)
**Fix:** Always pay by card, transfer, or Bizum - keep bank records

### 3. Deducting 30% of Full Utility Bill

**Mistake:** Calculating 30% of total electricity bill as deductible
**Consequence:** Over-deduction, potential penalty in inspection
**Fix:** Apply correct formula: Total x (Business m2 / Total m2) x 30%

### 4. Not Registering Home Office

**Mistake:** Deducting home office costs without Modelo 036/037 notification
**Consequence:** AEAT can reject all home office deductions
**Fix:** Update censal declaration to reflect partial business use of home

### 5. Airbnb Without Proper Documentation

**Mistake:** Deducting Airbnb stays with only email confirmations
**Consequence:** Likely rejection in inspection - no factura completa
**Fix:** Use hotels with proper invoicing, or get formal invoice from Airbnb host

### 6. Weekend/Personal Days in Business Trips

**Mistake:** Deducting full trip including personal weekend days
**Consequence:** Hacienda flags these patterns; penalties if challenged
**Fix:** Prorate or exclude personal days; document business purpose

### 7. Forgetting Modelo 360 for Belgian IVA

**Mistake:** Losing the Belgian IVA on hotels by not requesting refund
**Consequence:** Lost money (Belgian IVA not recovered)
**Fix:** File Modelo 360 by September 30 of following year

### 8. Not Maintaining 4-Year Records

**Mistake:** Discarding invoices after 1-2 years
**Consequence:** Unable to justify deductions if inspected
**Fix:** Digital archive all invoices for minimum 4 years (prescription period)

---

## Gastos de Dificil Justificacion (Hard-to-Justify Expenses)

### What It Is

An automatic deduction for small business costs that are difficult to document formally (office supplies, minor repairs, small subscriptions, etc.).

### 2026 Rate

| Metric | Value |
|--------|-------|
| Percentage | **5%** of net profit |
| Maximum | **2,000 EUR/year** |
| Note | 7% rate was exceptional for 2023 only |

### Who Can Use It

- Autonomos in **estimacion directa simplificada** regime
- Business turnover < 600,000 EUR previous year
- NOT available for: estimacion directa normal or modulos

### How to Declare

- Include in Modelo 130 quarterly declaration
- Enter in casilla 12 as additional expense
- Calculate: (Income - Justified expenses) x 5% (max 2,000 EUR)

**Source:** [AEAT - Estimacion Directa Simplificada](https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html)
**Confidence:** HIGH - Official AEAT source

---

## VeriFactu 2026 (Invoice System Change)

### Timeline

| Date | Requirement |
|------|-------------|
| 1 July 2025 | Software developers must comply |
| 1 January 2026 | Companies (SL, SA) with <6M turnover must comply |
| **1 July 2026** | **Autonomos (personas fisicas) must comply** |

### What Changes

- **No more** Word/Excel/uncertified PDF invoices
- Must use AEAT-certified billing software
- Invoices must include QR code for verification
- Two compliance modes: automatic AEAT submission OR verifiable QR

### Implications for Your Calculator

- **Receiving invoices:** Suppliers should provide VeriFactu-compliant invoices
- **Your invoices:** If issuing invoices, need compliant software by July 2026
- **Inspection:** AEAT will have more real-time visibility into invoices

**Note:** Some sources indicate possible extension to 2027 due to implementation challenges - verify current status closer to deadline.

**Confidence:** MEDIUM - Dates may shift; verify closer to implementation

---

## Penalties for Incorrect Deductions

### Sanction Levels

| Type | When Applied | Penalty |
|------|--------------|---------|
| **Leve (Minor)** | <3,000 EUR, no concealment | 50% of incorrectly deducted amount |
| **Grave (Serious)** | >3,000 EUR OR concealment | 50-100% of amount |
| **Muy Grave (Very Serious)** | False invoices, parallel accounting, obstruction | 100-150% of amount |

### Tribunal Supremo 2025 Ruling

**Important protection:** As of May 2025, AEAT cannot automatically sanction for lack of documentation alone. They must prove:
- Bad intent (mala intencion)
- Negligence (negligencia)

This means: missing a receipt doesn't automatically mean a fine, but you still lose the deduction.

### Voluntary Correction (Declaracion Complementaria)

If you discover an error:
1. File complementaria before AEAT notices
2. Pay owed tax + late payment surcharge (5-20% depending on delay)
3. Avoid sanction entirely

**Source:** [Infoautonomos - Sanciones Hacienda](https://www.infoautonomos.com/fiscalidad/sanciones-hacienda/)
**Confidence:** HIGH - Multiple legal sources confirm

---

## Summary: Your Specific Expense Categories

### Deductible (Green Light)

| Expense | IRPF | IVA | Requirements |
|---------|------|-----|--------------|
| Home office (30% x proportion) | YES | N/A | Modelo 036/037 notification |
| Belgium flights | YES | Exempt (0%) | Factura + business purpose |
| Belgium hotels | YES | Via Modelo 360 | Factura completa |
| Belgium dietas | YES (up to 91.35/day) | N/A | Electronic payment + factura |
| Belgium local transport | YES | Via Modelo 360 | Tickets + purpose |
| Cuota autonomos | YES | N/A | Bank proof sufficient |

### Partially Deductible (Yellow Light)

| Expense | IRPF | IVA | Notes |
|---------|------|-----|-------|
| Mobile phone | 50-100% if justified | 50-100% if justified | Separate lines recommended |
| Electricity | 9% effective (30% x 30%) | N/A | Per your calculation |

### Not Deductible (Red Light)

| Expense | Why |
|---------|-----|
| Car (not used for work) | No business use = no deduction |
| Personal insurance | Not business-related |
| 70% of rent | Only 30% of proportional business use |
| 50% of personal phone | Unless business line separated |
| 91% of electricity | Only 9% deductible per formula |
| Weekend leisure in Belgium | Personal, not business |
| Meals in home municipality | Dietas rules exclude local dining |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| General deductibility rules | HIGH | Official AEAT sources |
| Documentation requirements | HIGH | Official AEAT sources |
| Home office 30% rule | HIGH | Official AEAT Ley 6/2017 |
| Dietas limits (abroad) | HIGH | Official AEAT manual |
| Flight IVA exemption | HIGH | Official AEAT IVA rules |
| Hotel IVA recovery (Modelo 360) | HIGH | Multiple official sources |
| Mobile phone deduction | HIGH | DGT consultation V1233-25 |
| Airbnb issues | MEDIUM | Community consensus, no official ruling |
| Weekend travel gray areas | MEDIUM | Guidance exists but enforcement varies |
| VeriFactu dates | MEDIUM | May be subject to extension |
| Penalties and sanctions | HIGH | Legal framework well-documented |

---

## Recommendations for Calculator Implementation

1. **Flag expenses lacking factura completa** - High priority warning
2. **Validate dietas against limits** - 91.35 EUR/day max abroad with pernocta
3. **Check electronic payment method** - Cash dietas should trigger warning
4. **Enforce home office formula** - Don't allow 30% flat deduction
5. **Track Modelo 360 deadline** - September 30 following year for Belgian IVA
6. **Separate business/personal phone** - Warning if single mixed-use line
7. **Weekend expense warnings** - Flag potential gray areas for gestor review
8. **4-year record reminder** - Notify about document retention

---

## Sources Summary

### Official AEAT Sources
- [AEAT - Gastos Manutencion y Estancia](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2023/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_1-rendimientos-integros/7_1_1_2-dietas-gastos-viaje/asignaciones-gastos-manutencion-estancia.html)
- [AEAT - Ley 6/2017 Novedades](https://sede.agenciatributaria.gob.es/Sede/irpf/novedades-impuesto/novedades-normativa/principales-novedades-tributarias-introducidas-ley-6_2017.html)
- [AEAT - Estimacion Directa Simplificada](https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html)
- [AEAT - Regimen Especial Agencias Viajes](https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-especial-agencias-viajes/que-operaciones-se-encuentran-exentas.html)

### Verified Secondary Sources
- [Infoautonomos - Gastos Deducibles 2026](https://www.infoautonomos.com/fiscalidad/gastos-deducibles-autonomos-irpf-estimacion-directa/)
- [Holded - Dietas Autonomos](https://www.holded.com/es/blog/dietas-autonomos)
- [Captio - IVA Operaciones Intracomunitarias](https://www.captio.net/blog/iva-operaciones-intracomunitarias-y-gastos-de-viajes-de-empresa)
- [Declarando - Gastos de Viaje](https://declarando.es/gastos-deducibles-autonomos/viajes)
- [PWC Tax Summaries - Spain Individual Deductions](https://taxsummaries.pwc.com/spain/individual/deductions)
