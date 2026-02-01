/**
 * Spanish Autonomo Tax Calculator - Excel Workbook Generator
 *
 * Generates a multi-sheet Excel workbook with:
 * - Constants sheet: Named ranges for fiscal data (RETA, minimos, IRPF brackets)
 * - Scenario sheets: A-E with step-by-step IRPF calculations (future plans)
 * - Overview sheet: Comparison table (future plans)
 *
 * Fiscal Data: 2025/2026 Spanish Tax System
 * Sources: AEAT, BOE, Seguridad Social
 */

const ExcelJS = require('exceljs');
const path = require('path');

// ============================================================================
// FISCAL CONSTANTS - 2025/2026
// ============================================================================

const FISCAL_DATA = {
  reta: {
    monthly: 428.40,  // Fixed cuota from registration
    // Annual calculated via formula: RETA_MONTHLY * 12 = 5140.80
  },
  minimos: {
    personal: 5550,       // Minimo personal
    descendientes: 2400,  // First descendant
  },
  gastosDificil: {
    rate: 0.05,   // 5%
    max: 2000,    // EUR cap
  },
  privateCosts: {
    monthly: 1727,  // Non-deductible private expenses
  },
  // IRPF 2025 brackets (unchanged from 2024)
  irpfBrackets: [
    { lower: 0,      upper: 12450,    rate: 0.19, baseTax: 0 },
    { lower: 12450,  upper: 20200,    rate: 0.24, baseTax: 2365.50 },
    { lower: 20200,  upper: 35200,    rate: 0.30, baseTax: 4225.50 },
    { lower: 35200,  upper: 60000,    rate: 0.37, baseTax: 8725.50 },
    { lower: 60000,  upper: 300000,   rate: 0.45, baseTax: 17901.50 },
    { lower: 300000, upper: Infinity, rate: 0.47, baseTax: 125901.50 },
  ],
};

// ============================================================================
// CONSTANTS SHEET
// ============================================================================

/**
 * Creates the Constants sheet with all fiscal data as named ranges.
 * Named ranges are workbook-scoped, accessible from all sheets.
 *
 * @param {ExcelJS.Workbook} workbook - The workbook to add the sheet to
 * @returns {ExcelJS.Worksheet} The created Constants worksheet
 */
function createConstantsSheet(workbook) {
  const sheet = workbook.addWorksheet('Constants');

  // ========== HEADER ==========
  sheet.getCell('A1').value = 'Fiscal Data 2025/2026';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.mergeCells('A1:D1');

  sheet.getCell('A2').value = 'Sources: AEAT, BOE, Seguridad Social';
  sheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  // ========== RETA SECTION ==========
  sheet.getCell('A4').value = 'RETA (Seguridad Social)';
  sheet.getCell('A4').font = { bold: true };

  sheet.getCell('A5').value = 'RETA Monthly';
  sheet.getCell('B5').value = FISCAL_DATA.reta.monthly;
  sheet.getCell('B5').numFmt = '"EUR "#,##0.00';
  workbook.definedNames.add("'Constants'!$B$5", 'RETA_MONTHLY');

  sheet.getCell('A6').value = 'RETA Annual';
  sheet.getCell('B6').value = { formula: 'RETA_MONTHLY*12', result: undefined };
  sheet.getCell('B6').numFmt = '"EUR "#,##0.00';
  workbook.definedNames.add("'Constants'!$B$6", 'RETA_ANNUAL');

  // ========== MINIMOS SECTION ==========
  sheet.getCell('A8').value = 'Minimos Personales y Familiares';
  sheet.getCell('A8').font = { bold: true };

  sheet.getCell('A9').value = 'Minimo Personal';
  sheet.getCell('B9').value = FISCAL_DATA.minimos.personal;
  sheet.getCell('B9').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$9", 'MINIMO_PERSONAL');

  sheet.getCell('A10').value = 'Minimo Descendientes (1)';
  sheet.getCell('B10').value = FISCAL_DATA.minimos.descendientes;
  sheet.getCell('B10').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$10", 'MINIMO_DESCENDIENTES');

  // ========== GASTOS DIFICIL SECTION ==========
  sheet.getCell('A12').value = 'Gastos de Dificil Justificacion';
  sheet.getCell('A12').font = { bold: true };

  sheet.getCell('A13').value = 'Gastos Dificil Rate';
  sheet.getCell('B13').value = FISCAL_DATA.gastosDificil.rate;
  sheet.getCell('B13').numFmt = '0.0%';
  workbook.definedNames.add("'Constants'!$B$13", 'GASTOS_DIFICIL_RATE');

  sheet.getCell('A14').value = 'Gastos Dificil Max';
  sheet.getCell('B14').value = FISCAL_DATA.gastosDificil.max;
  sheet.getCell('B14').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$14", 'GASTOS_DIFICIL_MAX');

  // ========== PRIVATE COSTS SECTION ==========
  sheet.getCell('A16').value = 'Private Costs (Non-Deductible)';
  sheet.getCell('A16').font = { bold: true };

  sheet.getCell('A17').value = 'Private Costs Monthly';
  sheet.getCell('B17').value = FISCAL_DATA.privateCosts.monthly;
  sheet.getCell('B17').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constants'!$B$17", 'PRIVATE_COSTS');

  // ========== IRPF BRACKETS SECTION ==========
  sheet.getCell('A19').value = 'IRPF 2025 Brackets';
  sheet.getCell('A19').font = { bold: true };

  // Header row
  sheet.getCell('A20').value = 'Lower';
  sheet.getCell('B20').value = 'Upper';
  sheet.getCell('C20').value = 'Rate';
  sheet.getCell('D20').value = 'Base Tax';

  // Style header row
  ['A20', 'B20', 'C20', 'D20'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true };
    sheet.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  // Bracket data rows
  FISCAL_DATA.irpfBrackets.forEach((bracket, index) => {
    const row = 21 + index;

    sheet.getCell(`A${row}`).value = bracket.lower;
    sheet.getCell(`A${row}`).numFmt = '"EUR "#,##0';

    // Display "Infinity" as text for last bracket upper bound
    if (bracket.upper === Infinity) {
      sheet.getCell(`B${row}`).value = '+';
    } else {
      sheet.getCell(`B${row}`).value = bracket.upper;
      sheet.getCell(`B${row}`).numFmt = '"EUR "#,##0';
    }

    sheet.getCell(`C${row}`).value = bracket.rate;
    sheet.getCell(`C${row}`).numFmt = '0%';

    sheet.getCell(`D${row}`).value = bracket.baseTax;
    sheet.getCell(`D${row}`).numFmt = '"EUR "#,##0.00';
  });

  // ========== COLUMN WIDTHS ==========
  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 10;
  sheet.getColumn('D').width = 15;

  // ========== SOURCE NOTES ==========
  sheet.getCell('A28').value = 'Notes:';
  sheet.getCell('A28').font = { bold: true };
  sheet.getCell('A29').value = '- RETA cuota is fixed from registration (not theoretical tramo)';
  sheet.getCell('A30').value = '- Gastos dificil: 5% (not 7% - that was exceptional 2023)';
  sheet.getCell('A31').value = '- Update these values for 2027 rates when available';

  ['A29', 'A30', 'A31'].forEach(cell => {
    sheet.getCell(cell).font = { italic: true, color: { argb: 'FF666666' } };
  });

  return sheet;
}

// ============================================================================
// SCENARIO PRESETS
// ============================================================================

const SCENARIOS = [
  { id: 'A', label: '3K', monthlyRevenue: 3000, monthlyExpenses: 750, belgiumCost: 1000 },
  { id: 'B', label: '6K', monthlyRevenue: 6000, monthlyExpenses: 1500, belgiumCost: 1000 },
  { id: 'C', label: '9K', monthlyRevenue: 9000, monthlyExpenses: 3000, belgiumCost: 2500 },
  { id: 'D', label: '12K', monthlyRevenue: 12000, monthlyExpenses: 5000, belgiumCost: 2500 },
  { id: 'E', label: '18K', monthlyRevenue: 18000, monthlyExpenses: 8000, belgiumCost: 2500 }
];

// Spain deductible default: 383 EUR/month (from CLAUDE.md fixed costs)
const DEFAULT_SPAIN_DEDUCTIBLE = 383;

// ============================================================================
// SCENARIO SHEET
// ============================================================================

/**
 * Creates a scenario sheet with full IRPF calculation breakdown.
 *
 * Sheet structure:
 * - Section 1: INPUTS (editable cells)
 * - Section 2: ANNUAL CALCULATIONS
 * - Section 3: GASTOS DIFICIL
 * - Section 4: IRPF BRACKET CALCULATION
 * - Section 5: 4-PHASE MINIMO METHOD
 * - Section 6: FINAL RESULTS
 *
 * @param {ExcelJS.Workbook} workbook - The workbook to add the sheet to
 * @param {Object} scenario - Scenario configuration {id, label, monthlyRevenue, monthlyExpenses, belgiumCost}
 * @returns {ExcelJS.Worksheet} The created scenario worksheet
 */
function createScenarioSheet(workbook, scenario) {
  const sheetName = `Scenario ${scenario.id} - ${scenario.label}`;
  const sheet = workbook.addWorksheet(sheetName);

  // Light blue fill for input cells
  const inputFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0F0FF' }
  };

  // Gray fill for header rows
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Currency format
  const currencyFmt = '"EUR "#,##0.00';
  const currencyIntFmt = '"EUR "#,##0';
  const percentFmt = '0.0%';

  // ========================================================================
  // SECTION 1: INPUTS (rows 1-6)
  // ========================================================================

  sheet.getCell('A1').value = 'INPUTS (Edit these values)';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.mergeCells('A1:C1');

  // Row 3: Monthly Revenue
  sheet.getCell('A3').value = 'Monthly Revenue';
  sheet.getCell('B3').value = scenario.monthlyRevenue;
  sheet.getCell('B3').numFmt = currencyFmt;
  sheet.getCell('B3').fill = inputFill;

  // Row 4: Monthly Expenses
  sheet.getCell('A4').value = 'Monthly Expenses';
  sheet.getCell('B4').value = scenario.monthlyExpenses;
  sheet.getCell('B4').numFmt = currencyFmt;
  sheet.getCell('B4').fill = inputFill;

  // Row 5: Belgium Pattern (with data validation dropdown)
  sheet.getCell('A5').value = 'Belgium Pattern';
  sheet.getCell('B5').value = scenario.belgiumCost;
  sheet.getCell('B5').numFmt = currencyFmt;
  sheet.getCell('B5').fill = inputFill;
  sheet.getCell('B5').dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"1000,2500"'],
    showDropDown: false
  };

  // Row 6: Spain Deductible
  sheet.getCell('A6').value = 'Spain Deductible';
  sheet.getCell('B6').value = DEFAULT_SPAIN_DEDUCTIBLE;
  sheet.getCell('B6').numFmt = currencyFmt;
  sheet.getCell('B6').fill = inputFill;

  // ========================================================================
  // SECTION 2: ANNUAL CALCULATIONS (rows 8-14)
  // ========================================================================

  sheet.getCell('A8').value = 'ANNUAL CALCULATIONS';
  sheet.getCell('A8').font = { bold: true, size: 14 };
  sheet.mergeCells('A8:C8');

  // Row 10: Annual Revenue
  sheet.getCell('A10').value = 'Annual Revenue';
  sheet.getCell('B10').value = { formula: 'B3*12', result: undefined };
  sheet.getCell('B10').numFmt = currencyFmt;

  // Row 11: Annual Expenses
  sheet.getCell('A11').value = 'Annual Expenses';
  sheet.getCell('B11').value = { formula: 'B4*12', result: undefined };
  sheet.getCell('B11').numFmt = currencyFmt;

  // Row 12: Annual Belgium Costs
  sheet.getCell('A12').value = 'Annual Belgium Costs';
  sheet.getCell('B12').value = { formula: 'B5*12', result: undefined };
  sheet.getCell('B12').numFmt = currencyFmt;

  // Row 13: Annual Spain Deductible
  sheet.getCell('A13').value = 'Annual Spain Deductible';
  sheet.getCell('B13').value = { formula: 'B6*12', result: undefined };
  sheet.getCell('B13').numFmt = currencyFmt;

  // Row 14: RETA Annual
  sheet.getCell('A14').value = 'RETA Annual';
  sheet.getCell('B14').value = { formula: 'RETA_ANNUAL', result: undefined };
  sheet.getCell('B14').numFmt = currencyFmt;

  // Row 15: Total Deductible
  sheet.getCell('A15').value = 'Total Deductible';
  sheet.getCell('B15').value = { formula: 'SUM(B11:B14)', result: undefined };
  sheet.getCell('B15').numFmt = currencyFmt;
  sheet.getCell('B15').font = { bold: true };

  // Row 16: Rendimiento Neto Previo
  sheet.getCell('A16').value = 'Rendimiento Neto Previo';
  sheet.getCell('B16').value = { formula: 'B10-B15', result: undefined };
  sheet.getCell('B16').numFmt = currencyFmt;
  sheet.getCell('B16').font = { bold: true };

  // ========================================================================
  // SECTION 3: GASTOS DIFICIL (rows 18-21)
  // ========================================================================

  sheet.getCell('A18').value = 'GASTOS DE DIFICIL JUSTIFICACION';
  sheet.getCell('A18').font = { bold: true, size: 14 };
  sheet.mergeCells('A18:C18');

  // Row 20: Rendimiento Neto Previo (reference)
  sheet.getCell('A20').value = 'Rendimiento Neto Previo';
  sheet.getCell('B20').value = { formula: 'B16', result: undefined };
  sheet.getCell('B20').numFmt = currencyFmt;

  // Row 21: Gastos Dificil (5%)
  sheet.getCell('A21').value = 'Gastos Dificil (5%)';
  sheet.getCell('B21').value = { formula: 'MIN(MAX(0,B16)*GASTOS_DIFICIL_RATE,GASTOS_DIFICIL_MAX)', result: undefined };
  sheet.getCell('B21').numFmt = currencyFmt;

  // Row 22: Base Liquidable
  sheet.getCell('A22').value = 'Base Liquidable';
  sheet.getCell('B22').value = { formula: 'MAX(0,B16-B21)', result: undefined };
  sheet.getCell('B22').numFmt = currencyFmt;
  sheet.getCell('B22').font = { bold: true };

  // ========================================================================
  // SECTION 4: IRPF BRACKET CALCULATION (rows 24-33)
  // ========================================================================

  sheet.getCell('A24').value = 'IRPF BRACKET CALCULATION';
  sheet.getCell('A24').font = { bold: true, size: 14 };
  sheet.mergeCells('A24:E24');

  // Header row
  sheet.getCell('A25').value = 'Lower';
  sheet.getCell('B25').value = 'Upper';
  sheet.getCell('C25').value = 'Rate';
  sheet.getCell('D25').value = 'Taxable';
  sheet.getCell('E25').value = 'Tax';

  ['A25', 'B25', 'C25', 'D25', 'E25'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true };
    sheet.getCell(cell).fill = headerFill;
  });

  // IRPF bracket rows (rows 26-31)
  const brackets = FISCAL_DATA.irpfBrackets;
  brackets.forEach((bracket, index) => {
    const row = 26 + index;

    // Lower bound
    sheet.getCell(`A${row}`).value = bracket.lower;
    sheet.getCell(`A${row}`).numFmt = currencyIntFmt;

    // Upper bound
    if (bracket.upper === Infinity) {
      sheet.getCell(`B${row}`).value = '+';
    } else {
      sheet.getCell(`B${row}`).value = bracket.upper;
      sheet.getCell(`B${row}`).numFmt = currencyIntFmt;
    }

    // Rate
    sheet.getCell(`C${row}`).value = bracket.rate;
    sheet.getCell(`C${row}`).numFmt = '0%';

    // Taxable in bracket: MAX(0, MIN($B$22, Upper) - Lower)
    // For the last bracket (Infinity), use a very large number
    const upperRef = bracket.upper === Infinity ? 999999999 : bracket.upper;
    sheet.getCell(`D${row}`).value = {
      formula: `MAX(0,MIN($B$22,${upperRef})-${bracket.lower})`,
      result: undefined
    };
    sheet.getCell(`D${row}`).numFmt = currencyFmt;

    // Tax for bracket: Taxable * Rate
    sheet.getCell(`E${row}`).value = {
      formula: `D${row}*C${row}`,
      result: undefined
    };
    sheet.getCell(`E${row}`).numFmt = currencyFmt;
  });

  // Row 32: Total Tax (Cuota 1)
  sheet.getCell('A32').value = 'Total Tax (Cuota 1)';
  sheet.getCell('A32').font = { bold: true };
  sheet.getCell('E32').value = { formula: 'SUM(E26:E31)', result: undefined };
  sheet.getCell('E32').numFmt = currencyFmt;
  sheet.getCell('E32').font = { bold: true };

  // ========================================================================
  // SECTION 5: 4-PHASE MINIMO METHOD (rows 34-44)
  // ========================================================================

  sheet.getCell('A34').value = '4-PHASE MINIMO METHOD';
  sheet.getCell('A34').font = { bold: true, size: 14 };
  sheet.mergeCells('A34:C34');

  // Row 36: Base Liquidable (reference)
  sheet.getCell('A36').value = 'Base Liquidable';
  sheet.getCell('B36').value = { formula: 'B22', result: undefined };
  sheet.getCell('B36').numFmt = currencyFmt;

  // Row 37: Tax on Base (Cuota 1)
  sheet.getCell('A37').value = 'Tax on Base (Cuota 1)';
  sheet.getCell('B37').value = { formula: 'E32', result: undefined };
  sheet.getCell('B37').numFmt = currencyFmt;

  // Row 38: Minimo Personal
  sheet.getCell('A38').value = 'Minimo Personal';
  sheet.getCell('B38').value = { formula: 'MINIMO_PERSONAL', result: undefined };
  sheet.getCell('B38').numFmt = currencyIntFmt;

  // Row 39: Minimo Descendientes
  sheet.getCell('A39').value = 'Minimo Descendientes';
  sheet.getCell('B39').value = { formula: 'MINIMO_DESCENDIENTES', result: undefined };
  sheet.getCell('B39').numFmt = currencyIntFmt;

  // Row 40: Total Minimos
  sheet.getCell('A40').value = 'Total Minimos';
  sheet.getCell('B40').value = { formula: 'B38+B39', result: undefined };
  sheet.getCell('B40').numFmt = currencyIntFmt;
  sheet.getCell('B40').font = { bold: true };

  // Row 41: Tax on Minimos (Cuota 3) - calculate using first bracket rate for minimos
  // Total minimos (7,950) falls in first bracket (0-12,450) at 19%
  // Formula: B40 * 0.19 (simplified since minimos < first bracket upper bound)
  sheet.getCell('A41').value = 'Tax on Minimos (Cuota 3)';
  sheet.getCell('B41').value = { formula: 'B40*0.19', result: undefined };
  sheet.getCell('B41').numFmt = currencyFmt;

  // Row 42: Cuota Integra = MAX(0, Cuota1 - Cuota3)
  sheet.getCell('A42').value = 'Cuota Integra';
  sheet.getCell('B42').value = { formula: 'MAX(0,B37-B41)', result: undefined };
  sheet.getCell('B42').numFmt = currencyFmt;
  sheet.getCell('B42').font = { bold: true };

  // Row 43: Cuota Diferencial (same as Cuota Integra for autonomos)
  sheet.getCell('A43').value = 'Cuota Diferencial';
  sheet.getCell('B43').value = { formula: 'B42', result: undefined };
  sheet.getCell('B43').numFmt = currencyFmt;
  sheet.getCell('B43').font = { bold: true };

  // ========================================================================
  // SECTION 6: FINAL RESULTS (rows 45-53)
  // ========================================================================

  sheet.getCell('A45').value = 'FINAL RESULTS';
  sheet.getCell('A45').font = { bold: true, size: 14 };
  sheet.mergeCells('A45:C45');

  // Row 47: Annual IRPF
  sheet.getCell('A47').value = 'Annual IRPF';
  sheet.getCell('B47').value = { formula: 'B43', result: undefined };
  sheet.getCell('B47').numFmt = currencyFmt;

  // Row 48: Monthly IRPF
  sheet.getCell('A48').value = 'Monthly IRPF';
  sheet.getCell('B48').value = { formula: 'B47/12', result: undefined };
  sheet.getCell('B48').numFmt = currencyFmt;

  // Row 49: Annual Net Income (Revenue - Deductions - IRPF)
  sheet.getCell('A49').value = 'Annual Net Income';
  sheet.getCell('B49').value = { formula: 'B10-B15-B47', result: undefined };
  sheet.getCell('B49').numFmt = currencyFmt;
  sheet.getCell('B49').font = { bold: true };

  // Row 50: Monthly Net Income
  sheet.getCell('A50').value = 'Monthly Net Income';
  sheet.getCell('B50').value = { formula: 'B49/12', result: undefined };
  sheet.getCell('B50').numFmt = currencyFmt;
  sheet.getCell('B50').font = { bold: true };

  // Row 51: Annual Leefgeld (Net Income - Private Costs)
  sheet.getCell('A51').value = 'Annual Leefgeld';
  sheet.getCell('B51').value = { formula: 'B49-(PRIVATE_COSTS*12)', result: undefined };
  sheet.getCell('B51').numFmt = currencyFmt;
  sheet.getCell('B51').font = { bold: true };

  // Row 52: Monthly Leefgeld
  sheet.getCell('A52').value = 'Monthly Leefgeld';
  sheet.getCell('B52').value = { formula: 'B51/12', result: undefined };
  sheet.getCell('B52').numFmt = currencyFmt;
  sheet.getCell('B52').font = { bold: true };

  // Row 53: Effective Tax Rate
  sheet.getCell('A53').value = 'Effective Tax Rate';
  sheet.getCell('B53').value = { formula: 'IFERROR(B47/B16,0)', result: undefined };
  sheet.getCell('B53').numFmt = percentFmt;

  // ========================================================================
  // CONDITIONAL FORMATTING
  // ========================================================================

  // Leefgeld cells (B51, B52): Red if <0, Orange if 0-500, Green if >=500
  // Note: ExcelJS conditional formatting applies via addConditionalFormatting

  // Annual Leefgeld (B51)
  sheet.addConditionalFormatting({
    ref: 'B51',
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF6B6B' } } }
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: [0, 500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFA500' } } }
      },
      {
        type: 'cellIs',
        operator: 'greaterThanOrEqual',
        formulae: [500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF4ECDC4' } } }
      }
    ]
  });

  // Monthly Leefgeld (B52)
  sheet.addConditionalFormatting({
    ref: 'B52',
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF6B6B' } } }
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: [0, 500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFA500' } } }
      },
      {
        type: 'cellIs',
        operator: 'greaterThanOrEqual',
        formulae: [500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF4ECDC4' } } }
      }
    ]
  });

  // Effective Tax Rate (B53): Red if >40%, Orange if 30-40%, Green if <30%
  sheet.addConditionalFormatting({
    ref: 'B53',
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: [0.40],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF6B6B' } } }
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: [0.30, 0.40],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFA500' } } }
      },
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0.30],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF4ECDC4' } } }
      }
    ]
  });

  // ========================================================================
  // COLUMN WIDTHS
  // ========================================================================

  sheet.getColumn('A').width = 30;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 10;
  sheet.getColumn('D').width = 15;
  sheet.getColumn('E').width = 15;

  return sheet;
}

// ============================================================================
// OVERVIEW SHEET
// ============================================================================

/**
 * Creates the Overview sheet with navigation and comparison table.
 *
 * Sheet structure:
 * - Section 1: HEADER (rows 1-3)
 * - Section 2: NAVIGATION (rows 4-10) - Hyperlinks to scenario sheets
 * - Section 3: COMPARISON TABLE (rows 12-30) - Cross-sheet formulas
 *
 * @param {ExcelJS.Workbook} workbook - The workbook to add the sheet to
 * @param {Array} scenarios - Array of scenario objects
 * @returns {ExcelJS.Worksheet} The created Overview worksheet
 */
function createOverviewSheet(workbook, scenarios) {
  const sheet = workbook.addWorksheet('Overview');

  // Currency and percentage formats
  const currencyFmt = '"EUR "#,##0.00';
  const currencyIntFmt = '"EUR "#,##0';
  const percentFmt = '0.0%';

  // Header fill (light gray)
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD0D0D0' }
  };

  // Alternating row fill (very light gray)
  const altRowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F5F5' }
  };

  // ========================================================================
  // SECTION 1: HEADER (rows 1-3)
  // ========================================================================

  sheet.getCell('A1').value = 'Spanish Autonomo Tax Calculator';
  sheet.getCell('A1').font = { bold: true, size: 18 };
  sheet.mergeCells('A1:F1');

  sheet.getCell('A2').value = 'Fiscal Year 2025/2026';
  sheet.getCell('A2').font = { size: 12, color: { argb: 'FF666666' } };
  sheet.mergeCells('A2:F2');

  // Row 3: Empty

  // ========================================================================
  // SECTION 2: NAVIGATION (rows 4-10)
  // ========================================================================

  sheet.getCell('A4').value = 'Quick Navigation';
  sheet.getCell('A4').font = { bold: true, size: 14 };

  // Create hyperlinks to each scenario sheet
  scenarios.forEach((scenario, index) => {
    const row = 5 + index;
    const sheetName = `Scenario ${scenario.id} - ${scenario.label}`;
    const cellText = sheetName;

    sheet.getCell(`A${row}`).value = {
      text: cellText,
      hyperlink: `#'${sheetName}'!A1`
    };
    sheet.getCell(`A${row}`).font = { color: { argb: 'FF0066CC' }, underline: true };
  });

  // Hyperlink to Constants sheet
  sheet.getCell('A10').value = {
    text: 'Constants (Fiscal Data)',
    hyperlink: "#'Constants'!A1"
  };
  sheet.getCell('A10').font = { color: { argb: 'FF0066CC' }, underline: true };

  // ========================================================================
  // SECTION 3: COMPARISON TABLE (rows 12-30)
  // ========================================================================

  sheet.getCell('A12').value = 'Scenario Comparison';
  sheet.getCell('A12').font = { bold: true, size: 14 };
  sheet.mergeCells('A12:F12');

  // Column headers (row 13)
  sheet.getCell('A13').value = 'Metric';
  sheet.getCell('B13').value = 'A';
  sheet.getCell('C13').value = 'B';
  sheet.getCell('D13').value = 'C';
  sheet.getCell('E13').value = 'D';
  sheet.getCell('F13').value = 'E';

  ['A13', 'B13', 'C13', 'D13', 'E13', 'F13'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true };
    sheet.getCell(cell).fill = headerFill;
    sheet.getCell(cell).alignment = { horizontal: cell === 'A13' ? 'left' : 'center' };
  });

  // Helper function to get sheet name for scenario
  const getSheetName = (scenario) => `Scenario ${scenario.id} - ${scenario.label}`;

  // Helper function to create cross-sheet formula for a row
  const createCrossSheetRow = (rowNum, metricName, cellRef, format, isAltRow = false) => {
    sheet.getCell(`A${rowNum}`).value = metricName;
    sheet.getCell(`A${rowNum}`).alignment = { horizontal: 'left' };

    // Apply alternating row color
    if (isAltRow) {
      sheet.getCell(`A${rowNum}`).fill = altRowFill;
    }

    scenarios.forEach((scenario, index) => {
      const col = String.fromCharCode(66 + index); // B, C, D, E, F
      const sheetName = getSheetName(scenario);
      sheet.getCell(`${col}${rowNum}`).value = {
        formula: `'${sheetName}'!${cellRef}`,
        result: undefined
      };
      sheet.getCell(`${col}${rowNum}`).numFmt = format;
      sheet.getCell(`${col}${rowNum}`).alignment = { horizontal: 'right' };
      if (isAltRow) {
        sheet.getCell(`${col}${rowNum}`).fill = altRowFill;
      }
    });
  };

  // Comparison rows with cross-sheet formulas
  // Input Section
  createCrossSheetRow(14, 'Monthly Revenue', 'B3', currencyFmt, false);
  createCrossSheetRow(15, 'Monthly Expenses', 'B4', currencyFmt, true);
  createCrossSheetRow(16, 'Belgium Pattern', 'B5', currencyIntFmt, false);

  // Row 17: Empty for visual separation
  sheet.getCell('A17').value = '';

  // Annual Section
  createCrossSheetRow(18, 'Annual Revenue', 'B10', currencyFmt, false);
  createCrossSheetRow(19, 'Total Deductible', 'B15', currencyFmt, true);
  createCrossSheetRow(20, 'Base Liquidable', 'B22', currencyFmt, false);

  // Row 21: Empty for visual separation
  sheet.getCell('A21').value = '';

  // Tax Section
  createCrossSheetRow(22, 'Annual IRPF', 'B47', currencyFmt, false);
  createCrossSheetRow(23, 'Monthly IRPF', 'B48', currencyFmt, true);
  createCrossSheetRow(24, 'Effective Tax Rate', 'B53', percentFmt, false);

  // Row 25: Empty for visual separation
  sheet.getCell('A25').value = '';

  // Results Section
  createCrossSheetRow(26, 'Annual Net Income', 'B49', currencyFmt, false);
  createCrossSheetRow(27, 'Monthly Net Income', 'B50', currencyFmt, true);
  createCrossSheetRow(28, 'Annual Leefgeld', 'B51', currencyFmt, false);
  createCrossSheetRow(29, 'Monthly Leefgeld', 'B52', currencyFmt, true);

  // ========================================================================
  // CONDITIONAL FORMATTING FOR LEEFGELD ROWS
  // ========================================================================

  // Annual Leefgeld (row 28): Red if <0, Orange if 0-500, Green if >=500
  sheet.addConditionalFormatting({
    ref: 'B28:F28',
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF6B6B' } } }
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: [0, 500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFA500' } } }
      },
      {
        type: 'cellIs',
        operator: 'greaterThanOrEqual',
        formulae: [500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF4ECDC4' } } }
      }
    ]
  });

  // Monthly Leefgeld (row 29): Same formatting
  sheet.addConditionalFormatting({
    ref: 'B29:F29',
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF6B6B' } } }
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: [0, 500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFA500' } } }
      },
      {
        type: 'cellIs',
        operator: 'greaterThanOrEqual',
        formulae: [500],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF4ECDC4' } } }
      }
    ]
  });

  // ========================================================================
  // COLUMN WIDTHS
  // ========================================================================

  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 15;
  sheet.getColumn('D').width = 15;
  sheet.getColumn('E').width = 15;
  sheet.getColumn('F').width = 15;

  // ========================================================================
  // FREEZE PANES
  // ========================================================================

  // Freeze row 13 (header row) so it stays visible when scrolling
  sheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: 13, topLeftCell: 'B14', activeCell: 'A1' }
  ];

  return sheet;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

async function main() {
  console.log('Creating Autonomo Tax Calculator workbook...');

  // Create new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Autonomo Tax Calculator';
  workbook.created = new Date();
  workbook.modified = new Date();

  // IMPORTANT: Create Constants sheet FIRST to define named ranges
  // (Named ranges must exist before formulas reference them)
  createConstantsSheet(workbook);
  console.log('  - Constants sheet created with named ranges');

  // Create all 5 scenario sheets (need these before Overview for cross-sheet refs)
  SCENARIOS.forEach(scenario => {
    createScenarioSheet(workbook, scenario);
    console.log(`  - Scenario ${scenario.id} - ${scenario.label} created (Revenue: ${scenario.monthlyRevenue}, Belgium: ${scenario.belgiumCost})`);
  });

  // Create Overview sheet with comparison table
  createOverviewSheet(workbook, SCENARIOS);
  console.log('  - Overview sheet created with comparison table');

  // Reorder sheets: Overview first, then Scenarios A-E, Constants last
  // ExcelJS: move sheet by changing worksheet order
  const overviewSheet = workbook.getWorksheet('Overview');
  const constantsSheet = workbook.getWorksheet('Constants');

  // Move Overview to position 1 (index 0)
  workbook.removeWorksheet(overviewSheet.id);
  const newOverview = workbook.addWorksheet('Overview', { properties: overviewSheet.properties });

  // Copy Overview content by recreating it at position 1
  // Actually, ExcelJS doesn't have a direct "move" - we need to recreate
  // Let's use a different approach: recreate workbook with correct order

  // Simplest approach: just remove and re-add in correct order
  // But that loses content. Better: accept current order and note it's close enough
  // OR: create sheets in the right order from the start

  // Let me re-approach: We'll rebuild workbook with correct sheet order
  console.log('\n  Reorganizing sheet order...');

  // Create a new workbook with correct sheet order
  const finalWorkbook = new ExcelJS.Workbook();
  finalWorkbook.creator = 'Autonomo Tax Calculator';
  finalWorkbook.created = new Date();
  finalWorkbook.modified = new Date();

  // 1. First create Constants (for named ranges)
  createConstantsSheet(finalWorkbook);

  // 2. Create scenario sheets
  SCENARIOS.forEach(scenario => {
    createScenarioSheet(finalWorkbook, scenario);
  });

  // 3. Create Overview sheet
  createOverviewSheet(finalWorkbook, SCENARIOS);

  // Now reorder: Overview should be first visible
  // ExcelJS allows setting active tab and can order via worksheet.orderNo
  // The sheets are created in order, so we'll manipulate the order

  // Get all worksheets
  const sheets = finalWorkbook.worksheets;

  // Set orderNo to control tab order
  // Overview = 0, Scenario A = 1, B = 2, C = 3, D = 4, E = 5, Constants = 6
  sheets.forEach(ws => {
    if (ws.name === 'Overview') {
      ws.orderNo = 0;
    } else if (ws.name.startsWith('Scenario A')) {
      ws.orderNo = 1;
    } else if (ws.name.startsWith('Scenario B')) {
      ws.orderNo = 2;
    } else if (ws.name.startsWith('Scenario C')) {
      ws.orderNo = 3;
    } else if (ws.name.startsWith('Scenario D')) {
      ws.orderNo = 4;
    } else if (ws.name.startsWith('Scenario E')) {
      ws.orderNo = 5;
    } else if (ws.name === 'Constants') {
      ws.orderNo = 6;
    }
  });

  // Write to file (relative to scripts/ directory)
  const outputPath = path.join(__dirname, '..', 'autonomo_calculator.xlsx');
  await finalWorkbook.xlsx.writeFile(outputPath);

  console.log(`\nWorkbook saved to: ${outputPath}`);
  console.log('\nSheets created (in tab order):');
  console.log('  1. Overview (comparison table + navigation)');
  console.log('  2. Scenario A - 3K (Revenue: 3000, Belgium: 1000)');
  console.log('  3. Scenario B - 6K (Revenue: 6000, Belgium: 1000)');
  console.log('  4. Scenario C - 9K (Revenue: 9000, Belgium: 2500)');
  console.log('  5. Scenario D - 12K (Revenue: 12000, Belgium: 2500)');
  console.log('  6. Scenario E - 18K (Revenue: 18000, Belgium: 2500)');
  console.log('  7. Constants (named ranges for fiscal data)');
  console.log('\nOpen the file in Excel to verify formulas calculate correctly.');
}

// Run main function
main().catch(err => {
  console.error('Error generating workbook:', err);
  process.exit(1);
});
