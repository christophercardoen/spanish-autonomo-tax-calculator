# Phase 6: Excel Calculator - Research

**Researched:** 2026-02-01
**Domain:** Programmatic Excel Generation with Formulas (Node.js)
**Confidence:** HIGH

## Summary

Phase 6 implements a professional Excel workbook (.xlsx) that mirrors the HTML dashboard's IRPF/RETA calculations. The key challenge is generating an Excel file with working formulas (not just values) so users can experiment with inputs and see immediate recalculations. The CONTEXT.md confirms that the workbook needs: Overview + 5 scenario sheets, a Constants sheet with named ranges, step-by-step IRPF bracket calculations, 4-phase minimo method visibility, and professional styling with conditional formatting.

The research confirms ExcelJS as the standard library for this task. It supports formulas, named ranges (definedNames), conditional formatting, data validation dropdowns, cross-sheet references, and rich cell styling. The library is actively maintained with ~1,775 commits on GitHub. The key insight: Excel formulas must be written in English with comma separators (not semicolons) and ExcelJS cannot evaluate formulas - Excel does that when opened.

**Primary recommendation:** Use ExcelJS to generate a multi-sheet workbook with a Constants sheet containing named ranges for all fiscal data. Use cross-sheet formula references (`Constants!RETA_MONTHLY`) so that updating 2027 rates in one place propagates throughout. Implement IRPF brackets as visible step-by-step rows with formulas using the MAX/MIN pattern for clarity.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ExcelJS | ^4.4.0 | Excel workbook generation | Most comprehensive Node.js Excel library; supports formulas, styling, named ranges, conditional formatting |
| Node.js | 18+ | Runtime for generation script | Required to run ExcelJS; use LTS version |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs (built-in) | N/A | File system operations | Writing .xlsx file to disk |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ExcelJS | xlsx-js-style | SheetJS fork with styling, but less active maintenance, potential security issues in base SheetJS |
| ExcelJS | SheetJS Community | No styling support in free version; Pro version is commercial |
| ExcelJS | xlsx-populate | Good for simple use cases, less feature-rich for complex formulas |
| Node.js script | Python openpyxl | Better documentation for Excel, but requires Python runtime |

**Installation:**
```bash
# Create generator script directory
mkdir -p scripts
cd scripts

# Initialize Node.js project
npm init -y

# Install ExcelJS
npm install exceljs
```

## Architecture Patterns

### Recommended Workbook Structure
```
autonomo_calculator.xlsx
  |-- Constants          # Named ranges for all fiscal data
  |-- Overview           # Summary + editable comparison table
  |-- Scenario A - 3K    # Detailed breakdown, fully formula-based
  |-- Scenario B - 6K    # Same structure
  |-- Scenario C - 9K    # Same structure
  |-- Scenario D - 12K   # Same structure
  |-- Scenario E - 18K   # Same structure
```

### Pattern 1: Constants Sheet with Named Ranges
**What:** Central sheet containing all fiscal constants as named ranges
**When to use:** Always - enables single-point updates for 2027 rates
**Example:**
```javascript
// Source: ExcelJS definedNames API
// https://github.com/exceljs/exceljs

const constantsSheet = workbook.addWorksheet('Constants');

// Add fiscal data with labels
constantsSheet.getCell('A1').value = 'RETA Monthly';
constantsSheet.getCell('B1').value = 428.40;

// Create named range
workbook.definedNames.add("'Constants'!$B$1", 'RETA_MONTHLY');

// Usage in formulas: =RETA_MONTHLY * 12
```

### Pattern 2: Step-by-Step IRPF Bracket Rows
**What:** Each tax bracket gets its own row showing: range, taxable amount, rate, tax
**When to use:** For transparent IRPF calculation display (per CONTEXT.md requirement)
**Example:**
```javascript
// Source: Exceljet progressive tax formula
// https://exceljet.net/formulas/income-tax-bracket-calculation

// Row structure for each bracket:
// A: Lower bound | B: Upper bound | C: Rate | D: Taxable in bracket | E: Tax

// Taxable in bracket formula (MAX/MIN pattern):
// =MAX(0, MIN(BaseLiquidable, UpperBound) - LowerBound)
sheet.getCell('D10').value = {
  formula: 'MAX(0, MIN(B7, B10) - A10)',  // B7 = BaseLiquidable cell
  result: undefined  // Let Excel calculate
};

// Tax for this bracket:
// =D10 * C10
sheet.getCell('E10').value = {
  formula: 'D10 * C10',
  result: undefined
};
```

### Pattern 3: Cross-Sheet Formula References
**What:** Formulas that reference cells on other sheets using `SheetName!CellRef` syntax
**When to use:** For Overview comparison table pulling from scenario sheets
**Example:**
```javascript
// Source: ExcelJS formula syntax
// https://github.com/exceljs/exceljs/issues/315

// Reference to named range (preferred)
overviewSheet.getCell('C5').value = {
  formula: "='Scenario A - 3K'!B15",  // Single quotes around sheet name with spaces
  result: undefined
};

// Reference using named range from Constants
scenarioSheet.getCell('B8').value = {
  formula: 'B5 - RETA_ANNUAL',  // Where RETA_ANNUAL is a named range
  result: undefined
};
```

### Pattern 4: Three-Column Expense Display
**What:** Show base amount, percentage, and calculated deduction for each expense
**When to use:** For expense breakdown tables (per CONTEXT.md "formula visibility" requirement)
**Example:**
```javascript
// Layout: Base | Percentage | Deductible Amount
// Huur: 1155 | 30% | =A5*B5

sheet.getCell('A5').value = 1155;
sheet.getCell('B5').value = 0.30;
sheet.getCell('B5').numFmt = '0%';
sheet.getCell('C5').value = { formula: 'A5*B5', result: undefined };
```

### Pattern 5: 4-Phase Minimo Calculation Visibility
**What:** Show all 4 phases of AEAT minimo method as separate rows
**When to use:** Always - per CONTEXT.md requirement for accountant verification
**Example:**
```
Row 20: Base Liquidable          | =SUM(...)        | 35016.24
Row 21: Tax on Base (Cuota 1)    | =SUM(BracketTax) | 8670.37
Row 22: Minimo Personal          | =MINIMO_PERSONAL | 5550.00
Row 23: Minimo Descendientes     | =MINIMO_DESC     | 2400.00
Row 24: Total Minimo             | =B22+B23         | 7950.00
Row 25: Tax on Minimo (Cuota 3)  | =formula         | 1510.50
Row 26: Cuota Integra            | =MAX(0,B21-B25)  | 7159.87
Row 27: Cuota Diferencial        | =B26             | 7159.87
```

### Anti-Patterns to Avoid
- **Hardcoded calculated values:** Excel cells should contain formulas, not pre-computed results
- **Semicolon separators in formulas:** ExcelJS requires commas (English syntax): `SUM(A1,A2)` not `SUM(A1;A2)`
- **Missing result property:** When setting formula, include `result: undefined` to let Excel calculate
- **Sheet name without quotes:** For sheet names with spaces, use single quotes: `'Scenario A - 3K'!B5`
- **Circular references:** Gastos dificil depends on rendimiento neto previo, not neto (would be circular)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel file format | Custom ZIP/XML manipulation | ExcelJS | OOXML format is complex; library handles edge cases |
| Cell styling | Manual style objects | ExcelJS style presets | Ensures Excel compatibility |
| Named ranges | String replacement in formulas | workbook.definedNames.add() | Proper XML structure, Excel recognizes them |
| Conditional formatting | Custom cell coloring logic | worksheet.addConditionalFormatting() | Excel-native conditional formatting preserved |
| Currency format | Custom number formatting | numFmt: '"EUR "#,##0.00' | Locale-aware, Excel-standard patterns |
| Data validation | No validation | dataValidation with type: 'list' | Prevents invalid Belgium pattern selection |

**Key insight:** ExcelJS abstracts the complex OOXML specification. Hand-rolling any Excel internals risks producing files that open with warnings or calculation errors.

## Common Pitfalls

### Pitfall 1: Formula Syntax - Semicolons vs Commas
**What goes wrong:** Formulas like `=SUM(A1;A2)` don't work in generated Excel
**Why it happens:** European Excel uses semicolons, but ExcelJS requires English/US syntax with commas
**How to avoid:** Always use commas: `=SUM(A1,A2)`, `=IF(A1>0,A1,0)`, `=MAX(0,MIN(B5,C5))`
**Warning signs:** #NAME? error when opening file; formulas appear as text

### Pitfall 2: Missing Quote Escaping in Sheet References
**What goes wrong:** Formula referencing sheet "Scenario A - 3K" fails
**Why it happens:** Sheet names with spaces/special characters need single quotes
**How to avoid:** Use template string with proper escaping: `"'Scenario A - 3K'!B5"` or `"'${sheetName}'!B5"`
**Warning signs:** #REF! error in cells with cross-sheet formulas

### Pitfall 3: ExcelJS Cannot Evaluate Formulas
**What goes wrong:** Cells show 0 or undefined until file is opened in Excel
**Why it happens:** ExcelJS sets formulas but doesn't compute results
**How to avoid:** Accept this limitation. Set `result: undefined` and document that user must open in Excel (not just viewer). If preview needed, compute result in JS and pass as `result` property.
**Warning signs:** Empty cells in file preview tools

### Pitfall 4: Named Range Scope Issues
**What goes wrong:** Named ranges work on one sheet but #NAME? on another
**Why it happens:** Named ranges can be workbook-scoped or sheet-scoped
**How to avoid:** Use workbook.definedNames.add() for global named ranges. Include sheet reference in the range: `"'Constants'!$B$1"` with absolute references (`$`)
**Warning signs:** Formula works on Constants sheet but fails on Scenario sheets

### Pitfall 5: Division by Zero in Tax Rate Formulas
**What goes wrong:** #DIV/0! error when rendimiento neto is 0 or negative
**Why it happens:** Effective tax rate = cuotaIntegra / rendimientoNeto
**How to avoid:** Use IFERROR or IF: `=IFERROR(B26/B20,0)` or `=IF(B20>0,B26/B20,0)`
**Warning signs:** #DIV/0! errors in low-revenue scenarios

### Pitfall 6: Circular Reference in Gastos Dificil
**What goes wrong:** Excel shows circular reference warning
**Why it happens:** If gastos dificil formula references rendimiento neto which itself depends on gastos dificil
**How to avoid:** Gastos dificil = MIN(rendimientoNetoPREVIO * 5%, 2000). Use rendimiento neto PREVIO (before gastos dificil subtraction), not neto.
**Warning signs:** Circular reference warning on file open

### Pitfall 7: Number Format Conflicts with Formulas
**What goes wrong:** Currency-formatted cell shows formula result incorrectly
**Why it happens:** Setting value with formula after setting numFmt can have ordering issues
**How to avoid:** Set formula first, then numFmt: `cell.value = {formula: '...'}; cell.numFmt = '...';`
**Warning signs:** Numbers display as dates or vice versa

### Pitfall 8: Internal Hyperlinks Not Working
**What goes wrong:** Clickable links to other sheets don't navigate
**Why it happens:** ExcelJS has known issues with internal hyperlinks on Windows
**How to avoid:** Use format `#'SheetName'!A1` with hash prefix. Test in actual Excel (not Google Sheets). Consider using descriptive tab names as fallback navigation.
**Warning signs:** Links appear but clicking does nothing

## Code Examples

### Complete Named Range Setup for Constants
```javascript
// Source: ExcelJS GitHub documentation
// https://github.com/exceljs/exceljs

async function createConstantsSheet(workbook) {
  const sheet = workbook.addWorksheet('Constants');

  // Header
  sheet.getCell('A1').value = 'Fiscal Data 2025/2026';
  sheet.getCell('A1').font = { bold: true, size: 14 };

  // RETA
  sheet.getCell('A3').value = 'RETA Monthly';
  sheet.getCell('B3').value = 428.40;
  sheet.getCell('B3').numFmt = '"EUR "#,##0.00';
  workbook.definedNames.add("'Constants'!$B$3", 'RETA_MONTHLY');

  sheet.getCell('A4').value = 'RETA Annual';
  sheet.getCell('B4').value = { formula: 'RETA_MONTHLY*12', result: 5140.80 };
  sheet.getCell('B4').numFmt = '"EUR "#,##0.00';
  workbook.definedNames.add("'Constants'!$B$4", 'RETA_ANNUAL');

  // Minimos
  sheet.getCell('A6').value = 'Minimo Personal';
  sheet.getCell('B6').value = 5550;
  sheet.getCell('B6').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$6", 'MINIMO_PERSONAL');

  sheet.getCell('A7').value = 'Minimo Descendientes (1)';
  sheet.getCell('B7').value = 2400;
  sheet.getCell('B7').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$7", 'MINIMO_DESCENDIENTES');

  // Gastos Dificil
  sheet.getCell('A9').value = 'Gastos Dificil Rate';
  sheet.getCell('B9').value = 0.05;
  sheet.getCell('B9').numFmt = '0.0%';
  workbook.definedNames.add("'Constants'!$B$9", 'GASTOS_DIFICIL_RATE');

  sheet.getCell('A10').value = 'Gastos Dificil Max';
  sheet.getCell('B10').value = 2000;
  sheet.getCell('B10').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$10", 'GASTOS_DIFICIL_MAX');

  // Private Costs
  sheet.getCell('A12').value = 'Private Costs Monthly';
  sheet.getCell('B12').value = 1727;
  sheet.getCell('B12').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$12", 'PRIVATE_COSTS');

  // IRPF Brackets (for reference - actual calculation uses step-by-step rows)
  sheet.getCell('A14').value = 'IRPF Brackets';
  sheet.getCell('A15').value = 'Lower';
  sheet.getCell('B15').value = 'Upper';
  sheet.getCell('C15').value = 'Rate';
  sheet.getCell('D15').value = 'Base Tax';

  const brackets = [
    [0, 12450, 0.19, 0],
    [12450, 20200, 0.24, 2365.50],
    [20200, 35200, 0.30, 4225.50],
    [35200, 60000, 0.37, 8725.50],
    [60000, 300000, 0.45, 17901.50],
    [300000, Infinity, 0.47, 125901.50]
  ];

  brackets.forEach((b, i) => {
    const row = 16 + i;
    sheet.getCell(`A${row}`).value = b[0];
    sheet.getCell(`B${row}`).value = b[1] === Infinity ? 'Infinity' : b[1];
    sheet.getCell(`C${row}`).value = b[2];
    sheet.getCell(`C${row}`).numFmt = '0%';
    sheet.getCell(`D${row}`).value = b[3];
    sheet.getCell(`D${row}`).numFmt = '"EUR "#,##0.00';
  });

  // Column widths
  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 10;
  sheet.getColumn('D').width = 15;

  return sheet;
}
```

### IRPF Bracket Calculation with Step-by-Step Formulas
```javascript
// Source: Exceljet tax bracket formula + ExcelJS syntax
// https://exceljet.net/formulas/income-tax-bracket-calculation

function addIRPFBracketCalculation(sheet, baseLiquidableCell) {
  const startRow = 20;

  // Header
  sheet.getCell(`A${startRow}`).value = 'IRPF Bracket Calculation';
  sheet.getCell(`A${startRow}`).font = { bold: true };

  sheet.getCell(`A${startRow + 1}`).value = 'Lower';
  sheet.getCell(`B${startRow + 1}`).value = 'Upper';
  sheet.getCell(`C${startRow + 1}`).value = 'Rate';
  sheet.getCell(`D${startRow + 1}`).value = 'Taxable';
  sheet.getCell(`E${startRow + 1}`).value = 'Tax';

  const brackets = [
    { lower: 0, upper: 12450, rate: 0.19 },
    { lower: 12450, upper: 20200, rate: 0.24 },
    { lower: 20200, upper: 35200, rate: 0.30 },
    { lower: 35200, upper: 60000, rate: 0.37 },
    { lower: 60000, upper: 300000, rate: 0.45 },
    { lower: 300000, upper: 999999999, rate: 0.47 }
  ];

  brackets.forEach((b, i) => {
    const row = startRow + 2 + i;
    sheet.getCell(`A${row}`).value = b.lower;
    sheet.getCell(`B${row}`).value = b.upper;
    sheet.getCell(`C${row}`).value = b.rate;
    sheet.getCell(`C${row}`).numFmt = '0%';

    // Taxable in bracket: MAX(0, MIN(BaseLiquidable, Upper) - Lower)
    sheet.getCell(`D${row}`).value = {
      formula: `MAX(0,MIN(${baseLiquidableCell},B${row})-A${row})`,
      result: undefined
    };
    sheet.getCell(`D${row}`).numFmt = '"EUR "#,##0.00';

    // Tax for bracket: Taxable * Rate
    sheet.getCell(`E${row}`).value = {
      formula: `D${row}*C${row}`,
      result: undefined
    };
    sheet.getCell(`E${row}`).numFmt = '"EUR "#,##0.00';
  });

  // Total tax (Cuota 1)
  const totalRow = startRow + 2 + brackets.length;
  sheet.getCell(`A${totalRow}`).value = 'Total Tax (Cuota 1)';
  sheet.getCell(`A${totalRow}`).font = { bold: true };
  sheet.getCell(`E${totalRow}`).value = {
    formula: `SUM(E${startRow + 2}:E${totalRow - 1})`,
    result: undefined
  };
  sheet.getCell(`E${totalRow}`).numFmt = '"EUR "#,##0.00';
  sheet.getCell(`E${totalRow}`).font = { bold: true };

  return totalRow;  // Return row number for subsequent formulas
}
```

### Data Validation for Belgium Pattern Dropdown
```javascript
// Source: ExcelJS data validation documentation
// https://www.npmjs.com/package/exceljs

function addBelgiumPatternDropdown(sheet, cell) {
  sheet.getCell(cell).dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"1000,2500"'],  // Double quotes around comma-separated values
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Invalid Pattern',
    error: 'Please select 1000 (Pattern A/B) or 2500 (Pattern C/D/E)'
  };

  // Default value
  sheet.getCell(cell).value = 1000;
  sheet.getCell(cell).numFmt = '"EUR "#,##0';
}
```

### Conditional Formatting for Warning Colors
```javascript
// Source: ExcelJS conditional formatting
// https://github.com/exceljs/exceljs

function addLeefgeldConditionalFormatting(sheet, leefgeldCell) {
  // Red if negative, orange if < 500, green if >= 500
  sheet.addConditionalFormatting({
    ref: leefgeldCell,
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0],
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF87171' } },
          font: { color: { argb: 'FF000000' } }
        },
        priority: 1
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: [0, 500],
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFB923C' } },
          font: { color: { argb: 'FF000000' } }
        },
        priority: 2
      },
      {
        type: 'cellIs',
        operator: 'greaterThanOrEqual',
        formulae: [500],
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4ADE80' } },
          font: { color: { argb: 'FF000000' } }
        },
        priority: 3
      }
    ]
  });
}
```

### Internal Sheet Hyperlink Navigation
```javascript
// Source: ExcelJS hyperlink syntax
// https://github.com/exceljs/exceljs/pull/1137

function addSheetNavigation(overviewSheet, scenarios) {
  let row = 5;
  scenarios.forEach(scenario => {
    const sheetName = `Scenario ${scenario.id} - ${scenario.label}`;

    overviewSheet.getCell(`A${row}`).value = {
      text: sheetName,
      hyperlink: `#'${sheetName}'!A1`  // Hash prefix + quoted sheet name
    };
    overviewSheet.getCell(`A${row}`).font = {
      color: { argb: 'FF60A5FA' },  // Blue color for link
      underline: true
    };
    row++;
  });
}
```

### Complete Scenario Sheet Structure
```javascript
// Source: CONTEXT.md requirements + Phase 1 RESEARCH.md formulas

async function createScenarioSheet(workbook, scenario) {
  const sheetName = `Scenario ${scenario.id} - ${scenario.label}`;
  const sheet = workbook.addWorksheet(sheetName);

  // ========== INPUTS SECTION (Editable - light blue background) ==========
  const inputStyle = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F0FF' } }
  };

  sheet.getCell('A1').value = 'INPUTS (Edit these values)';
  sheet.getCell('A1').font = { bold: true, size: 14 };

  sheet.getCell('A3').value = 'Monthly Revenue';
  sheet.getCell('B3').value = scenario.monthlyRevenue;
  sheet.getCell('B3').numFmt = '"EUR "#,##0';
  Object.assign(sheet.getCell('B3'), inputStyle);

  sheet.getCell('A4').value = 'Monthly Expenses';
  sheet.getCell('B4').value = scenario.monthlyExpenses;
  sheet.getCell('B4').numFmt = '"EUR "#,##0';
  Object.assign(sheet.getCell('B4'), inputStyle);

  sheet.getCell('A5').value = 'Belgium Pattern';
  addBelgiumPatternDropdown(sheet, 'B5');
  sheet.getCell('B5').value = scenario.belgiumCost;
  Object.assign(sheet.getCell('B5'), inputStyle);

  // ========== ANNUAL CALCULATIONS ==========
  sheet.getCell('A7').value = 'Annual Revenue';
  sheet.getCell('B7').value = { formula: 'B3*12', result: undefined };
  sheet.getCell('B7').numFmt = '"EUR "#,##0.00';

  sheet.getCell('A8').value = 'Annual Expenses';
  sheet.getCell('B8').value = { formula: 'B4*12', result: undefined };
  sheet.getCell('B8').numFmt = '"EUR "#,##0.00';

  sheet.getCell('A9').value = 'Annual Belgium Costs';
  sheet.getCell('B9').value = { formula: 'B5*12', result: undefined };
  sheet.getCell('B9').numFmt = '"EUR "#,##0.00';

  sheet.getCell('A10').value = 'RETA Annual';
  sheet.getCell('B10').value = { formula: 'RETA_ANNUAL', result: undefined };
  sheet.getCell('B10').numFmt = '"EUR "#,##0.00';

  sheet.getCell('A11').value = 'Total Deductible';
  sheet.getCell('B11').value = { formula: 'SUM(B8:B10)', result: undefined };
  sheet.getCell('B11').numFmt = '"EUR "#,##0.00';
  sheet.getCell('B11').font = { bold: true };

  // ========== IRPF CALCULATION ==========
  sheet.getCell('A13').value = 'Rendimiento Neto Previo';
  sheet.getCell('B13').value = { formula: 'B7-B11', result: undefined };
  sheet.getCell('B13').numFmt = '"EUR "#,##0.00';

  sheet.getCell('A14').value = 'Gastos Dificil (5%, max 2000)';
  sheet.getCell('B14').value = {
    formula: 'MIN(MAX(0,B13)*GASTOS_DIFICIL_RATE,GASTOS_DIFICIL_MAX)',
    result: undefined
  };
  sheet.getCell('B14').numFmt = '"EUR "#,##0.00';

  sheet.getCell('A15').value = 'Base Liquidable';
  sheet.getCell('B15').value = { formula: 'MAX(0,B13-B14)', result: undefined };
  sheet.getCell('B15').numFmt = '"EUR "#,##0.00';
  sheet.getCell('B15').font = { bold: true };

  // ... Continue with bracket calculations, minimo method, etc.

  return sheet;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SheetJS (xlsx) for generation | ExcelJS | 2020+ | SheetJS free version lacks styling; security vulnerabilities in old versions |
| Hardcoded values | Formula-based cells | Always was correct | Formulas enable user experimentation |
| Single-sheet calculators | Multi-sheet with Constants | Best practice | Centralizes fiscal data updates |
| Manual number formatting | numFmt patterns | Excel standard | Professional appearance, locale-aware |

**Deprecated/outdated:**
- SheetJS npm package (name `xlsx`): Outdated, unmaintained, security vulnerabilities. Use ExcelJS instead.
- xlsx-style: Unmaintained fork. Use xlsx-js-style if SheetJS compatibility needed.

## Open Questions

Things that couldn't be fully resolved:

1. **Formula Result Caching**
   - What we know: ExcelJS cannot evaluate formulas; Excel does when opened
   - What's unclear: Whether to pre-compute `result` values for preview compatibility
   - Recommendation: Omit results (`result: undefined`) for most cells; document that file must be opened in Excel, not just previewed

2. **Named Range Persistence**
   - What we know: workbook.definedNames.add() creates named ranges
   - What's unclear: Whether named ranges work correctly in Excel Online and Google Sheets
   - Recommendation: Test generated file in Excel Desktop first; provide fallback absolute references if needed

3. **Conditional Formatting Color Codes**
   - What we know: ARGB format with 8 hex digits (e.g., 'FF4ADE80')
   - What's unclear: Exact color values to match HTML dashboard theme
   - Recommendation: Use verified ARGB values: green=FF4ADE80, red=FFF87171, orange=FFFB923C, blue=FF60A5FA

## Sources

### Primary (HIGH confidence)
- [ExcelJS GitHub Repository](https://github.com/exceljs/exceljs) - API documentation, formula syntax
- [ExcelJS npm Package](https://www.npmjs.com/package/exceljs) - Installation, version info
- [Exceljet Progressive Tax Formula](https://exceljet.net/formulas/income-tax-bracket-calculation) - MAX/MIN bracket pattern
- Phase 1 RESEARCH.md (project file) - IRPF calculation methodology, fiscal constants

### Secondary (MEDIUM confidence)
- [npm-compare ExcelJS vs alternatives](https://npm-compare.com/exceljs,xlsx,xlsx-populate,xlsx-js-style) - Library comparison
- [Medium: ExcelJS Dropdown Validation](https://medium.com/@lopesraina1/dynamically-populating-dropdown-validator-list-in-excel-file-using-exceljs-in-angular-1be582f43fba) - Data validation examples
- [ExcelJS GitHub Issues](https://github.com/exceljs/exceljs/issues) - Cross-sheet references, named ranges, hyperlinks

### Tertiary (LOW confidence)
- [xlsx-js-style documentation](https://gitbrent.github.io/xlsx-js-style/) - Alternative library (not recommended for this project)
- [SheetJS security advisories](https://www.npmjs.com/package/xlsx) - Warning about outdated versions

## Metadata

**Confidence breakdown:**
- Standard stack (ExcelJS): HIGH - Well-documented, widely used, actively maintained
- Formula syntax: HIGH - Verified against ExcelJS documentation and issues
- Named ranges: MEDIUM - Core feature works, but some edge cases reported in issues
- Conditional formatting: HIGH - Well-supported feature with clear API
- Pitfalls: HIGH - Derived from GitHub issues and real-world usage reports

**Research date:** 2026-02-01
**Valid until:** 2026-08-01 (ExcelJS updates ~quarterly; fiscal data valid until 2027)

---

## Implementation Checklist for Planner

### XLS-01: Multi-Sheet Workbook
- Create workbook with ExcelJS: `new ExcelJS.Workbook()`
- Add sheets: Constants, Overview, Scenario A-E
- Descriptive tab names: "Scenario A - 3K", "Scenario B - 6K", etc.

### XLS-02: Overview Sheet Comparison Table
- Summary section at top
- Comparison table with columns: Metric, Scenario A, B, C, D, E
- Cross-sheet formulas: `='Scenario A - 3K'!B15`
- Hyperlink navigation to each scenario sheet

### XLS-03: Individual Scenario Sheets
- Input section (editable cells with light blue background)
- Annual calculation section
- Step-by-step IRPF bracket rows
- 4-phase minimo calculation display
- Final results (net income, leefgeld)

### XLS-04: All Formulas (No Hardcoded Values)
- Every calculated cell uses `{ formula: '...', result: undefined }`
- Reference named ranges for fiscal constants
- Use cross-sheet references for Overview comparisons

### XLS-05: Professional Styling
- Header fonts: bold, larger size (14px)
- Input cells: light blue fill (E0F0FF)
- Calculated cells: white/gray background
- Borders around sections
- Print-ready: page breaks, headers/footers

### XLS-06: Expense Breakdown Tables
- Three-column layout: Base | Percentage | Result
- Formulas for deductible calculation: `=A5*B5`
- Belgium pattern with dropdown validation

### XLS-07: RETA and IRPF Step-by-Step
- RETA: Show monthly * 12 = annual
- IRPF: One row per bracket with MAX/MIN formula
- 4-phase minimo: Cuota1, Minimos, Cuota3, Cuota Integra

### XLS-08: Error-Free Recalculation
- Test all formulas in Excel
- Check for #REF!, #DIV/0!, #VALUE!, #NAME?
- Use IFERROR where division could fail
- Verify no circular references

### XLS-09: Currency Formatting
- EUR #,##0.00 for monetary values: `'"EUR "#,##0.00'`
- Whole numbers: `'"EUR "#,##0'`
- Apply consistently to all monetary cells

### XLS-10: Percentage Formatting
- Tax rates: `'0.0%'` or `'0%'`
- Effective rate: `'0.0%'`
- Apply to rate columns in bracket tables
