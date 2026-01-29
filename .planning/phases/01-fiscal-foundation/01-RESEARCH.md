# Phase 1: Fiscal Foundation - Research

**Researched:** 2026-01-29
**Domain:** Spanish IRPF Tax Calculation for Autonomos (Estimacion Directa Simplificada)
**Confidence:** HIGH

## Summary

Phase 1 implements the core tax calculation engine for a Spanish autonomo's IRPF liability. The research confirms that Spanish IRPF calculation follows a precise, legally-defined order of operations that differs from intuitive approaches. The critical insight: the minimo personal y familiar is NOT subtracted from the taxable base but rather applied by calculating the tax that WOULD be owed on it and subtracting that tax amount from the total tax liability. This distinction is essential for correct implementation.

The existing project research in FISCAL_DATA.md provides verified 2025/2026 rates with HIGH confidence from official AEAT/BOE sources. The IRPF brackets are unchanged from 2024. The user's fixed RETA cuota of 428.40 EUR/month simplifies implementation since we do not need to implement the full 15-tramo RETA calculation system for this phase.

**Primary recommendation:** Implement the IRPF calculation using the official 4-phase method where minimos reduce tax liability (not taxable base), and use the fixed RETA cuota as a direct deductible expense rather than calculating it dynamically.

## Standard Stack

This phase builds the calculation engine in vanilla JavaScript (per project constraints - single-file HTML, no frameworks).

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Vanilla JavaScript | ES6+ | All calculation logic | Project constraint: no frameworks |
| HTML5 | Current | Single-file container | Project constraint: single-file |
| CSS3 | Current | Styling (not this phase) | Project constraint: inline styles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (vanilla) | N/A | Calculations must be hand-coded | Always - no external dependencies allowed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla JS | decimal.js | Better floating-point precision, but adds dependency |
| Manual calculations | External tax API | Would require network, external dependency |
| Hardcoded rates | JSON config | JSON config is cleaner but adds complexity for single-file |

**Installation:**
```bash
# No installation required - single HTML file with inline JavaScript
```

## Architecture Patterns

### Recommended Project Structure
```
autonomo_dashboard.html   # Single file containing all code
  ├── <style>            # CSS (Phase 5)
  ├── <script>           # JavaScript calculation engine (this phase)
  │   ├── FISCAL_DATA    # Constant: all rates, brackets, limits
  │   ├── calculateIRPF  # Function: main IRPF calculation
  │   ├── applyMinimos   # Function: minimo personal/familiar logic
  │   └── formatters     # Functions: EUR formatting, percentages
  └── <body>             # HTML structure (Phase 5)
```

### Pattern 1: Immutable Fiscal Data Constants
**What:** Store all tax rates, brackets, and limits as frozen JavaScript constants with source citations
**When to use:** Always - fiscal data must be auditable and traceable
**Example:**
```javascript
// Source: FISCAL_DATA.md, verified from AEAT/BOE
const FISCAL_2025 = Object.freeze({
  // IRPF Brackets - Source: BOE, Wolters Kluwer IRPF 2025
  // https://www.wolterskluwer.com/es-es/expert-insights/tramos-retenciones-irpf-2025-novedades
  IRPF_BRACKETS: Object.freeze([
    { upTo: 12450, rate: 0.19, cumulative: 0 },
    { upTo: 20200, rate: 0.24, cumulative: 2365.50 },  // 12450 * 0.19
    { upTo: 35200, rate: 0.30, cumulative: 4225.50 },  // prev + 7750 * 0.24
    { upTo: 60000, rate: 0.37, cumulative: 8725.50 },  // prev + 15000 * 0.30
    { upTo: 300000, rate: 0.45, cumulative: 17901.50 }, // prev + 24800 * 0.37
    { upTo: Infinity, rate: 0.47, cumulative: 125901.50 } // prev + 240000 * 0.45
  ]),

  // Minimos - Source: AEAT Manual Practico IRPF 2024
  // https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c14-adecuacion-impuesto-circunstancias-personales/cuadro-resumen-minimo-personal-familiar.html
  MINIMO_PERSONAL: 5550,
  MINIMO_DESCENDIENTES_PRIMERO: 2400,

  // RETA - User's fixed cuota from registration
  RETA_MONTHLY: 428.40,
  RETA_ANNUAL: 5140.80,

  // Gastos dificil justificacion - Source: AEAT Estimacion Directa Simplificada
  // https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html
  GASTOS_DIFICIL_RATE: 0.05,
  GASTOS_DIFICIL_MAX: 2000,

  // 7% generic expense reduction for RETA base calculation (NOT for IRPF)
  // Source: Seguridad Social
  // https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/trabajo+autonomo/guia
  RETA_GENERIC_REDUCTION: 0.07
});
```

### Pattern 2: Four-Phase IRPF Calculation
**What:** Implement official AEAT calculation order where minimos reduce tax liability, not base
**When to use:** Always - this is the legally correct method
**Example:**
```javascript
// Source: AEAT Practical Example
// https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2022/c15-calculo-impuesto-determinacion-cuotas-integras/ejemplo-practico-calculo-cuotas-integras-autonomica.html

function calculateCuotaIntegra(baseLiquidable, minimoTotal) {
  // PHASE 1: Apply tax brackets to FULL base liquidable (including minimo portion)
  const cuota1 = applyBrackets(baseLiquidable);

  // PHASE 2: Apply SAME brackets to minimo amount
  const cuota3 = applyBrackets(Math.min(minimoTotal, baseLiquidable));

  // PHASE 3: Cuota integra = Cuota 1 - Cuota 3
  // The minimo reduces TAX, not BASE
  const cuotaIntegra = Math.max(0, cuota1 - cuota3);

  return cuotaIntegra;
}
```

### Pattern 3: Calculation Chain with Intermediate Values
**What:** Calculate each step separately and store intermediate values for display
**When to use:** Always - enables showing step-by-step breakdown to user
**Example:**
```javascript
function calculateFullIRPF(grossAnnual, expenses, hasDescendant = true) {
  // Step 1: Rendimiento Neto Previo
  const rendimientoNetoPrevio = grossAnnual - expenses.deductible - FISCAL_2025.RETA_ANNUAL;

  // Step 2: Gastos Dificil Justificacion
  const gastosDificil = Math.min(
    rendimientoNetoPrevio * FISCAL_2025.GASTOS_DIFICIL_RATE,
    FISCAL_2025.GASTOS_DIFICIL_MAX
  );

  // Step 3: Rendimiento Neto
  const rendimientoNeto = rendimientoNetoPrevio - gastosDificil;

  // Step 4: Base Imponible General = Rendimiento Neto (for autonomo)
  const baseImponible = rendimientoNeto;

  // Step 5: Base Liquidable (no additional reductions in basic case)
  const baseLiquidable = baseImponible;

  // Step 6: Calculate minimos
  const minimoPersonal = FISCAL_2025.MINIMO_PERSONAL;
  const minimoDescendientes = hasDescendant ? FISCAL_2025.MINIMO_DESCENDIENTES_PRIMERO : 0;
  const minimoTotal = minimoPersonal + minimoDescendientes;

  // Step 7: Cuota Integra (using 4-phase method)
  const cuotaIntegra = calculateCuotaIntegra(baseLiquidable, minimoTotal);

  // Return all intermediate values for display
  return {
    grossAnnual,
    retaAnnual: FISCAL_2025.RETA_ANNUAL,
    deductibleExpenses: expenses.deductible,
    rendimientoNetoPrevio,
    gastosDificil,
    rendimientoNeto,
    baseLiquidable,
    minimoPersonal,
    minimoDescendientes,
    minimoTotal,
    cuotaIntegra,
    netAfterTax: grossAnnual - expenses.total - cuotaIntegra
  };
}
```

### Anti-Patterns to Avoid
- **Subtracting minimos from base:** WRONG approach - minimos reduce TAX LIABILITY not TAXABLE BASE
- **Using floating-point for currency:** Use integers (cents) or round appropriately to avoid precision issues
- **Hardcoding calculated values:** All displayed numbers must derive from formulas for maintainability
- **Mixing annual/monthly without explicit conversion:** Always label values as `_annual` or `_monthly`

## Don't Hand-Roll

Problems that look simple but have verified solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tax bracket application | Naive loop through brackets | Cumulative bracket approach | Edge cases at bracket boundaries |
| Currency formatting | String concatenation | Intl.NumberFormat | Locale-specific formatting (EUR, thousands separator) |
| Minimo application | Base subtraction | 4-phase AEAT method | Legally required calculation order |
| Percentage display | `* 100 + '%'` | Intl.NumberFormat with percent style | Proper decimal handling |

**Key insight:** Spanish IRPF calculation has a specific legal methodology. Implementing "intuitively" (subtract minimo from base) produces incorrect results that could expose users to audit risk.

## Common Pitfalls

### Pitfall 1: Minimo Applied to Base Instead of Tax
**What goes wrong:** Developer subtracts minimo personal/familiar from base liquidable before applying brackets
**Why it happens:** Intuitive approach - "reduce taxable income by exemption amount"
**How to avoid:** Implement official AEAT 4-phase calculation: (1) tax on full base, (2) tax on minimo, (3) subtract #2 from #1
**Warning signs:** Tax liability exactly matches independent calculators until minimo threshold is crossed

### Pitfall 2: Confusing 7% RETA Reduction with IRPF Deduction
**What goes wrong:** Developer applies 7% reduction in IRPF calculation
**Why it happens:** CALC-05 mentions "7% reduccion rendimientos for generic SS expenses"
**How to avoid:** Understand the 7% is for calculating RETA base (Social Security), NOT for IRPF. For IRPF, the actual RETA cuota paid (428.40 EUR/month) is deducted as an expense.
**Warning signs:** Rendimiento neto is 7% lower than expected

### Pitfall 3: Gastos Dificil Justificacion Calculation Order
**What goes wrong:** Applying 5% to rendimiento neto AFTER gastos dificil
**Why it happens:** Circular reference confusion
**How to avoid:** Apply 5% to rendimiento neto PREVIO (before gastos dificil), then subtract result
**Warning signs:** Slightly different tax result, usually lower

### Pitfall 4: Annual vs Monthly Confusion
**What goes wrong:** Mixing annual IRPF with monthly RETA, or forgetting to annualize monthly revenue
**Why it happens:** User inputs monthly revenue but IRPF brackets are annual
**How to avoid:** Convert ALL inputs to annual at start of calculation, then convert outputs back to monthly for display
**Warning signs:** Tax rates appear much higher or lower than expected

### Pitfall 5: Bracket Boundary Errors
**What goes wrong:** Off-by-one errors at bracket boundaries (e.g., exactly 12,450 EUR)
**Why it happens:** Ambiguity about whether boundary belongs to lower or upper bracket
**How to avoid:** Use exclusive upper bound (upTo: 12450 means 12449.99 and below), verify against AEAT examples
**Warning signs:** 1 cent differences at bracket boundaries

### Pitfall 6: Floating Point Precision
**What goes wrong:** Results like 2365.4999999999998 instead of 2365.50
**Why it happens:** JavaScript floating-point representation
**How to avoid:** Round all currency calculations to 2 decimal places; consider calculating in cents
**Warning signs:** Display shows unexpected decimal places

## Code Examples

Verified patterns for implementation:

### Complete IRPF Bracket Application
```javascript
// Source: Derived from AEAT official bracket table
// https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general.html

const IRPF_BRACKETS_2025 = [
  { upTo: 12450, rate: 0.19, baseTax: 0, prevLimit: 0 },
  { upTo: 20200, rate: 0.24, baseTax: 2365.50, prevLimit: 12450 },
  { upTo: 35200, rate: 0.30, baseTax: 4225.50, prevLimit: 20200 },
  { upTo: 60000, rate: 0.37, baseTax: 8725.50, prevLimit: 35200 },
  { upTo: 300000, rate: 0.45, baseTax: 17901.50, prevLimit: 60000 },
  { upTo: Infinity, rate: 0.47, baseTax: 125901.50, prevLimit: 300000 }
];

function applyBrackets(amount) {
  if (amount <= 0) return 0;

  for (const bracket of IRPF_BRACKETS_2025) {
    if (amount <= bracket.upTo) {
      return bracket.baseTax + (amount - bracket.prevLimit) * bracket.rate;
    }
  }
  // Should never reach here with Infinity upper bound
  const last = IRPF_BRACKETS_2025[IRPF_BRACKETS_2025.length - 1];
  return last.baseTax + (amount - last.prevLimit) * last.rate;
}

// Verification: 23900 EUR should produce 2667.75 EUR tax (before minimo)
// 12450 * 0.19 = 2365.50
// (20200 - 12450) * 0.24 = 1860.00
// (23900 - 20200) * 0.30 = 1110.00
// Total: 2365.50 + 1860.00 + 1110.00 = 5335.50... Wait, let me recalculate.

// Actually using baseTax approach:
// 23900 falls in bracket 3 (20200-35200)
// baseTax for this bracket: 4225.50
// Wait, baseTax already includes lower brackets. Let me verify.

// Bracket calculation verification:
// For 23900 EUR:
// - First 12450 at 19% = 2365.50
// - Next 7750 (12450 to 20200) at 24% = 1860.00
// - Remaining 3700 (20200 to 23900) at 30% = 1110.00
// Total = 2365.50 + 1860.00 + 1110.00 = 5335.50

// So baseTax values in table above are WRONG. Let me correct:
const IRPF_BRACKETS_2025_CORRECTED = [
  { upTo: 12450, rate: 0.19, baseTax: 0, prevLimit: 0 },
  { upTo: 20200, rate: 0.24, baseTax: 2365.50, prevLimit: 12450 },  // 12450*0.19
  { upTo: 35200, rate: 0.30, baseTax: 4225.50, prevLimit: 20200 },  // 2365.50 + 7750*0.24
  { upTo: 60000, rate: 0.37, baseTax: 8725.50, prevLimit: 35200 },  // 4225.50 + 15000*0.30
  { upTo: 300000, rate: 0.45, baseTax: 17901.50, prevLimit: 60000 }, // 8725.50 + 24800*0.37
  { upTo: Infinity, rate: 0.47, baseTax: 125901.50, prevLimit: 300000 }
];

// Test: applyBrackets(23900) should return 4225.50 + (23900-20200)*0.30 = 4225.50 + 1110 = 5335.50
```

### Minimo Application (4-Phase Method)
```javascript
// Source: AEAT practical example
// https://www.ineaf.es/tribuna/calculo-de-irpf-cuotas-integras-y-aplicacion-del-minimo-personal-y-familiar-exento/

function calculateCuotaIntegra(baseLiquidable, minimoTotal) {
  // Step 1: Calculate tax on full base liquidable
  const cuota1 = applyBrackets(baseLiquidable);

  // Step 2: Calculate tax on minimo (capped at base liquidable)
  const minimoApplicable = Math.min(minimoTotal, baseLiquidable);
  const cuota3 = applyBrackets(minimoApplicable);

  // Step 3: Cuota integra = difference (cannot be negative)
  return Math.max(0, cuota1 - cuota3);
}

// Verification with AEAT example:
// Base liquidable: 23900 EUR
// Minimo: 5550 EUR
// Cuota1 = applyBrackets(23900) = 5335.50 (calculated above... wait, AEAT says 2667.75)

// Let me re-read the AEAT example. It shows:
// "Hasta 20.200 = 2.112,75; Resto: 3.700 al 15% = 555"
// That's using ESTATAL only (half the combined rate)!

// The IRPF has TWO scales: estatal and autonomica
// Combined rate 19% = 9.5% estatal + 9.5% autonomica
// Combined rate 24% = 12% estatal + 12% autonomica

// For the calculator, we use COMBINED rates (total IRPF)
// But the AEAT example shows estatal-only calculation
// Our approach is CORRECT for total tax, just need to understand AEAT example context
```

### EUR Currency Formatting
```javascript
// Source: MDN Intl.NumberFormat
const formatEUR = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Usage: formatEUR(5335.50) => "5.335,50 €"
```

### Gastos Dificil Justificacion
```javascript
// Source: AEAT Estimacion Directa Simplificada
function calculateGastosDificil(rendimientoNetoPrevio) {
  if (rendimientoNetoPrevio <= 0) return 0;

  const calculated = rendimientoNetoPrevio * 0.05;  // 5% rate
  const capped = Math.min(calculated, 2000);        // 2000 EUR max

  return Math.round(capped * 100) / 100;  // Round to cents
}
```

### Complete Calculation Example
```javascript
// Full calculation for Scenario B: 6000 EUR/month revenue, 1500 EUR expenses
function calculateScenarioB() {
  const monthlyRevenue = 6000;
  const monthlyExpenses = 1500;
  const monthlyBelgiumCosts = 1000;  // Pattern A/B

  // Annualize
  const annualRevenue = monthlyRevenue * 12;        // 72000
  const annualExpenses = monthlyExpenses * 12;      // 18000
  const annualBelgium = monthlyBelgiumCosts * 12;   // 12000

  // Total deductible expenses
  const totalDeductible = annualExpenses + annualBelgium + FISCAL_2025.RETA_ANNUAL;
  // = 18000 + 12000 + 5140.80 = 35140.80

  // Rendimiento Neto Previo
  const rendimientoNetoPrevio = annualRevenue - totalDeductible;
  // = 72000 - 35140.80 = 36859.20

  // Gastos Dificil Justificacion
  const gastosDificil = Math.min(rendimientoNetoPrevio * 0.05, 2000);
  // = min(1842.96, 2000) = 1842.96

  // Rendimiento Neto / Base Liquidable
  const baseLiquidable = rendimientoNetoPrevio - gastosDificil;
  // = 36859.20 - 1842.96 = 35016.24

  // Minimos
  const minimoTotal = 5550 + 2400;  // = 7950

  // Cuota Integra
  const cuota1 = applyBrackets(35016.24);
  // Bracket 3: 4225.50 + (35016.24 - 20200) * 0.30 = 4225.50 + 4444.87 = 8670.37

  const cuota3 = applyBrackets(7950);
  // Bracket 1: 0 + 7950 * 0.19 = 1510.50

  const cuotaIntegra = cuota1 - cuota3;
  // = 8670.37 - 1510.50 = 7159.87

  // Effective tax rate
  const effectiveRate = cuotaIntegra / rendimientoNetoPrevio;
  // = 7159.87 / 36859.20 = 19.42%

  // Net after tax
  const netAfterTax = annualRevenue - totalDeductible - gastosDificil - cuotaIntegra;

  return {
    monthlyNet: netAfterTax / 12,
    annualTax: cuotaIntegra,
    effectiveRate: effectiveRate
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual RETA tramo selection | Income-based RETA (cotizacion por ingresos reales) | 2023 | User has fixed cuota, no impact |
| 7% gastos dificil | 5% gastos dificil | 2024 (7% was exceptional for 2023) | Use 5%, max 2000 EUR |
| Paper-based filing | Renta Web online | Long established | No impact on calculation logic |

**Deprecated/outdated:**
- 7% gastos dificil justificacion: Only applied to tax year 2023, use 5% for 2025/2026
- Cuota fija RETA: Old system allowed choosing any base; new system is income-based but user has documented fixed cuota

## Open Questions

Things that couldn't be fully resolved:

1. **Estatal vs Autonomica Split**
   - What we know: Combined IRPF rates (19-47%) are sum of estatal + autonomica portions
   - What's unclear: Whether calculator needs to show split or just combined total
   - Recommendation: Show combined total only for simplicity; add split in v2 if needed

2. **CALC-05 Interpretation (7% reduction)**
   - What we know: 7% reduction is for RETA base calculation, not IRPF
   - What's unclear: Whether requirement expects RETA base display or just IRPF
   - Recommendation: Document that RETA cuota (428.40 EUR) is the deductible expense; the 7% is internal SS calculation

3. **Daughter's Age**
   - What we know: Under 3 years old adds 2800 EUR to minimo descendientes
   - What's unclear: Daughter's actual age
   - Recommendation: Use base 2400 EUR; add age input if needed

## Sources

### Primary (HIGH confidence)
- **FISCAL_DATA.md** (project research) - IRPF brackets, RETA cuotas, minimos - verified from AEAT/BOE
- **[AEAT Manual Practico IRPF 2024](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/)** - Minimo personal y familiar, calculation methodology
- **[AEAT Estimacion Directa Simplificada](https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html)** - Gastos dificil justificacion 5%/2000 EUR
- **[BOE Orden PJC/178/2025](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-3780)** - RETA cotization 2025
- **[AEAT Cuota Integra Example](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2022/c15-calculo-impuesto-determinacion-cuotas-integras/ejemplo-practico-calculo-cuotas-integras-autonomica.html)** - 4-phase calculation methodology

### Secondary (MEDIUM confidence)
- **[INEAF: Cuotas Integras y Minimo Exento](https://www.ineaf.es/tribuna/calculo-de-irpf-cuotas-integras-y-aplicacion-del-minimo-personal-y-familiar-exento/)** - Explanation of minimo application
- **[Wolters Kluwer IRPF 2025](https://www.wolterskluwer.com/es-es/expert-insights/tramos-retenciones-irpf-2025-novedades)** - Bracket confirmation
- **[Seguridad Social RETA Guide](https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/trabajo+autonomo/guia)** - 7% generic reduction explanation

### Tertiary (LOW confidence)
- **[InfoAutonomos](https://www.infoautonomos.com/)** - Community patterns, used for awareness only

## Metadata

**Confidence breakdown:**
- IRPF brackets: HIGH - Multiple official sources, unchanged from 2024
- Minimo application: HIGH - Official AEAT methodology documented with examples
- Gastos dificil: HIGH - Official AEAT source, 5% rate with 2000 EUR cap confirmed
- 7% reduction scope: MEDIUM - Confirmed as RETA-only, but CALC-05 wording ambiguous
- Overall calculation flow: HIGH - Derived from official AEAT documentation

**Research date:** 2026-01-29
**Valid until:** 2027-01-01 (fiscal rules typically updated annually in BOE)

---

## Implementation Checklist for Planner

### CALC-01: IRPF Progressive Brackets
- Use combined rates: 19%, 24%, 30%, 37%, 45%, 47%
- Implement cumulative bracket approach (baseTax + marginal calculation)
- Bracket boundaries: 12450, 20200, 35200, 60000, 300000

### CALC-02: Minimo Personal
- Amount: 5550 EUR
- Apply via 4-phase method (reduce tax, not base)
- Display as "Minimo personal: 5.550 EUR"

### CALC-03: Minimo Descendientes
- Amount: 2400 EUR (1 daughter)
- Combine with minimo personal for total: 7950 EUR
- Apply same 4-phase method

### CALC-04: Gastos Dificil Justificacion
- Rate: 5% of rendimiento neto previo
- Cap: 2000 EUR annual maximum
- Formula: min(rendimientoNetoPrevio * 0.05, 2000)

### CALC-05: 7% Reduccion Rendimientos
- CLARIFICATION: This is for RETA base calculation, NOT IRPF
- For IRPF purposes: deduct actual RETA cuota (428.40 * 12 = 5140.80 EUR) as expense
- If display of RETA calculation needed, show: (ingresos - gastos) * 0.93

### CALC-06: Fixed RETA Cuota
- Use: 428.40 EUR/month (5140.80 EUR/year)
- Deduct as business expense before calculating IRPF

### CALC-07: Effective Tax Rate
- Formula: cuotaIntegra / rendimientoNeto (or rendimientoNetoPrevio)
- Display as percentage with 2 decimal places

### CALC-08: Net Monthly Income
- Formula: (annualRevenue - totalExpenses - cuotaIntegra) / 12

### CALC-09: Leefgeld
- Formula: netMonthlyIncome - 1727 (private costs)

### CALC-10: Annual/Monthly Breakdowns
- Show both annual and monthly for: revenue, expenses, RETA, IRPF, net income
- Label clearly: "Annual" vs "Monthly"

### DATA-01 to DATA-05: Source Citations
- Display source references in UI (footnotes or info icons)
- Include: AEAT, BOE reference numbers, URLs
- Example: "IRPF 2025 brackets (AEAT, unchanged from 2024)"
