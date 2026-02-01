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
// MAIN GENERATOR
// ============================================================================

async function main() {
  console.log('Creating Autonomo Tax Calculator workbook...');

  // Create new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Autonomo Tax Calculator';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create Constants sheet
  createConstantsSheet(workbook);
  console.log('  - Constants sheet created with named ranges');

  // Write to file (relative to scripts/ directory)
  const outputPath = path.join(__dirname, '..', 'autonomo_calculator.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`\nWorkbook saved to: ${outputPath}`);
  console.log('\nNamed ranges created:');
  console.log('  - RETA_MONTHLY (428.40)');
  console.log('  - RETA_ANNUAL (formula: RETA_MONTHLY*12)');
  console.log('  - MINIMO_PERSONAL (5,550)');
  console.log('  - MINIMO_DESCENDIENTES (2,400)');
  console.log('  - GASTOS_DIFICIL_RATE (5%)');
  console.log('  - GASTOS_DIFICIL_MAX (2,000)');
  console.log('  - PRIVATE_COSTS (1,727)');
  console.log('\nOpen the file in Excel to verify formulas calculate correctly.');
}

// Run main function
main().catch(err => {
  console.error('Error generating workbook:', err);
  process.exit(1);
});
