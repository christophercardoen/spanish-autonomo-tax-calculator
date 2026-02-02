/**
 * Spaanse Autónomo Belasting Calculator - Excel Werkboek Generator
 *
 * Genereert een Excel werkboek met meerdere tabbladen:
 * - Constanten tabblad: Benoemde bereiken voor fiscale data (RETA, mínimos, IRPF schijven)
 * - Scenario tabbladen: A-E met stapsgewijze IRPF berekeningen
 * - Overzicht tabblad: Vergelijkingstabel
 *
 * Fiscale Data: 2025/2026 Spaans Belastingstelsel
 * Bronnen: AEAT, BOE, Seguridad Social
 */

const ExcelJS = require('exceljs');
const path = require('path');

// ============================================================================
// FISCALE CONSTANTEN - 2025/2026
// ============================================================================

const FISCAL_DATA = {
  reta: {
    monthly: 428.40,  // Vaste cuota vanaf registratie
    // Jaarlijks berekend via formule: RETA_MONTHLY * 12 = 5140.80
  },
  minimos: {
    personal: 5550,       // Mínimo personal
    descendientes: 2400,  // Eerste kind
  },
  gastosDificil: {
    rate: 0.05,   // 5%
    max: 2000,    // EUR maximum
  },
  privateCosts: {
    monthly: 1727,  // Niet-aftrekbare privé kosten
  },
  // IRPF 2025 schijven (ongewijzigd sinds 2024)
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
// CONSTANTEN TABBLAD
// ============================================================================

/**
 * Maakt het Constanten tabblad met alle fiscale data als benoemde bereiken.
 * Benoemde bereiken zijn werkboek-breed toegankelijk vanaf alle tabbladen.
 *
 * @param {ExcelJS.Workbook} workbook - Het werkboek om het tabblad aan toe te voegen
 * @returns {ExcelJS.Worksheet} Het aangemaakte Constanten tabblad
 */
function createConstantsSheet(workbook) {
  const sheet = workbook.addWorksheet('Constanten');

  // ========== KOPTEKST ==========
  sheet.getCell('A1').value = 'Fiscale Data 2025/2026';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.mergeCells('A1:D1');

  sheet.getCell('A2').value = 'Bronnen: AEAT, BOE, Seguridad Social';
  sheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  // ========== RETA SECTIE ==========
  sheet.getCell('A4').value = 'RETA (Sociale Zekerheid)';
  sheet.getCell('A4').font = { bold: true };

  sheet.getCell('A5').value = 'RETA Maandelijks';
  sheet.getCell('B5').value = FISCAL_DATA.reta.monthly;
  sheet.getCell('B5').numFmt = '"EUR "#,##0.00';
  workbook.definedNames.add("'Constanten'!$B$5", 'RETA_MONTHLY');

  sheet.getCell('A6').value = 'RETA Jaarlijks';
  sheet.getCell('B6').value = { formula: 'RETA_MONTHLY*12', result: undefined };
  sheet.getCell('B6').numFmt = '"EUR "#,##0.00';
  workbook.definedNames.add("'Constanten'!$B$6", 'RETA_ANNUAL');

  // ========== MÍNIMOS SECTIE ==========
  sheet.getCell('A8').value = 'Mínimos Personales y Familiares';
  sheet.getCell('A8').font = { bold: true };

  sheet.getCell('A9').value = 'Mínimo Personal';
  sheet.getCell('B9').value = FISCAL_DATA.minimos.personal;
  sheet.getCell('B9').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constanten'!$B$9", 'MINIMO_PERSONAL');

  sheet.getCell('A10').value = 'Mínimo Afstammelingen (1)';
  sheet.getCell('B10').value = FISCAL_DATA.minimos.descendientes;
  sheet.getCell('B10').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constanten'!$B$10", 'MINIMO_DESCENDIENTES');

  // ========== GASTOS DIFÍCIL SECTIE ==========
  sheet.getCell('A12').value = 'Gastos de Difícil Justificación';
  sheet.getCell('A12').font = { bold: true };

  sheet.getCell('A13').value = 'Gastos Difícil Percentage';
  sheet.getCell('B13').value = FISCAL_DATA.gastosDificil.rate;
  sheet.getCell('B13').numFmt = '0.0%';
  workbook.definedNames.add("'Constanten'!$B$13", 'GASTOS_DIFICIL_RATE');

  sheet.getCell('A14').value = 'Gastos Difícil Maximum';
  sheet.getCell('B14').value = FISCAL_DATA.gastosDificil.max;
  sheet.getCell('B14').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constanten'!$B$14", 'GASTOS_DIFICIL_MAX');

  // ========== PRIVÉ KOSTEN SECTIE ==========
  sheet.getCell('A16').value = 'Privé Kosten (Niet-Aftrekbaar)';
  sheet.getCell('A16').font = { bold: true };

  sheet.getCell('A17').value = 'Privé Kosten Maandelijks';
  sheet.getCell('B17').value = FISCAL_DATA.privateCosts.monthly;
  sheet.getCell('B17').numFmt = '"EUR "#,##0';
  workbook.definedNames.add("'Constanten'!$B$17", 'PRIVATE_COSTS');

  // ========== IRPF SCHIJVEN SECTIE ==========
  sheet.getCell('A19').value = 'IRPF 2025 Belastingschijven';
  sheet.getCell('A19').font = { bold: true };

  // Koptekst rij
  sheet.getCell('A20').value = 'Ondergrens';
  sheet.getCell('B20').value = 'Bovengrens';
  sheet.getCell('C20').value = 'Tarief';
  sheet.getCell('D20').value = 'Basis Belasting';

  // Koptekst rij stijl
  ['A20', 'B20', 'C20', 'D20'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true };
    sheet.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  // Schijf data rijen
  FISCAL_DATA.irpfBrackets.forEach((bracket, index) => {
    const row = 21 + index;

    sheet.getCell(`A${row}`).value = bracket.lower;
    sheet.getCell(`A${row}`).numFmt = '"EUR "#,##0';

    // Toon "+" voor onbeperkte bovengrens
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

  // ========== KOLOM BREEDTES ==========
  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 10;
  sheet.getColumn('D').width = 15;

  // ========== BRON NOTITIES ==========
  sheet.getCell('A28').value = 'Notities:';
  sheet.getCell('A28').font = { bold: true };
  sheet.getCell('A29').value = '- RETA cuota is vast vanaf registratie (niet theoretische tramo)';
  sheet.getCell('A30').value = '- Gastos difícil: 5% (niet 7% - dat was uitzonderlijk in 2023)';
  sheet.getCell('A31').value = '- Werk deze waarden bij voor 2027 tarieven wanneer beschikbaar';

  ['A29', 'A30', 'A31'].forEach(cell => {
    sheet.getCell(cell).font = { italic: true, color: { argb: 'FF666666' } };
  });

  // ========== AFDRUK INDELING ==========
  sheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: 'A1:D31',
    margins: {
      left: 0.75, right: 0.75,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    }
  };

  sheet.headerFooter = {
    oddHeader: '&C&"Arial,Bold"Fiscale Constanten 2025/2026',
    oddFooter: '&LPagina &P&R&D'
  };

  // ========== TABBLAD BEVEILIGING ==========
  // Beveilig Constanten tabblad tegen onbedoelde wijzigingen
  // Opmerking: Dit is een basis beveiliging zonder wachtwoord
  sheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false
  });

  return sheet;
}

// ============================================================================
// SCENARIO VOORINSTELLINGEN
// ============================================================================

const SCENARIOS = [
  { id: 'A', label: '3K', monthlyRevenue: 3000, monthlyExpenses: 750, belgiumCost: 1000 },
  { id: 'B', label: '6K', monthlyRevenue: 6000, monthlyExpenses: 1500, belgiumCost: 1000 },
  { id: 'C', label: '9K', monthlyRevenue: 9000, monthlyExpenses: 3000, belgiumCost: 2500 },
  { id: 'D', label: '12K', monthlyRevenue: 12000, monthlyExpenses: 5000, belgiumCost: 2500 },
  { id: 'E', label: '18K', monthlyRevenue: 18000, monthlyExpenses: 8000, belgiumCost: 2500 }
];

// Spanje aftrekbaar standaard: 383 EUR/maand (van CLAUDE.md vaste kosten)
const DEFAULT_SPAIN_DEDUCTIBLE = 383;

// ============================================================================
// SCENARIO TABBLAD
// ============================================================================

/**
 * Maakt een scenario tabblad met volledige IRPF berekening.
 *
 * Tabblad structuur:
 * - Sectie 1: INVOER (bewerkbare cellen)
 * - Sectie 2: JAARLIJKSE BEREKENINGEN
 * - Sectie 3: GASTOS DIFÍCIL
 * - Sectie 4: IRPF SCHIJF BEREKENING
 * - Sectie 5: 4-FASE MÍNIMO METHODE
 * - Sectie 6: EINDRESULTATEN
 *
 * @param {ExcelJS.Workbook} workbook - Het werkboek om het tabblad aan toe te voegen
 * @param {Object} scenario - Scenario configuratie {id, label, monthlyRevenue, monthlyExpenses, belgiumCost}
 * @returns {ExcelJS.Worksheet} Het aangemaakte scenario tabblad
 */
function createScenarioSheet(workbook, scenario) {
  const sheetName = `Scenario ${scenario.id} - ${scenario.label}`;
  const sheet = workbook.addWorksheet(sheetName);

  // Lichtblauwe vulling voor invoercellen
  const inputFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0F0FF' }
  };

  // Grijze vulling voor koptekst rijen
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Valuta opmaak
  const currencyFmt = '"EUR "#,##0.00';
  const currencyIntFmt = '"EUR "#,##0';
  const percentFmt = '0.0%';

  // ========================================================================
  // SECTIE 1: INVOER (rijen 1-6)
  // ========================================================================

  sheet.getCell('A1').value = 'INVOER (Wijzig deze waarden)';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.mergeCells('A1:C1');

  // Rij 3: Maandelijkse Omzet
  sheet.getCell('A3').value = 'Maandelijkse Omzet';
  sheet.getCell('B3').value = scenario.monthlyRevenue;
  sheet.getCell('B3').numFmt = currencyFmt;
  sheet.getCell('B3').fill = inputFill;

  // Rij 4: Maandelijkse Kosten
  sheet.getCell('A4').value = 'Maandelijkse Kosten';
  sheet.getCell('B4').value = scenario.monthlyExpenses;
  sheet.getCell('B4').numFmt = currencyFmt;
  sheet.getCell('B4').fill = inputFill;

  // Rij 5: België Kosten (vrij invoerveld - geen dropdown)
  sheet.getCell('A5').value = 'België Kosten';
  sheet.getCell('B5').value = scenario.belgiumCost;
  sheet.getCell('B5').numFmt = currencyFmt;
  sheet.getCell('B5').fill = inputFill;
  // GEEN dataValidation - alle kosten zijn variabel en flexibel

  // Rij 6: Spanje Aftrekbaar
  sheet.getCell('A6').value = 'Spanje Aftrekbaar';
  sheet.getCell('B6').value = DEFAULT_SPAIN_DEDUCTIBLE;
  sheet.getCell('B6').numFmt = currencyFmt;
  sheet.getCell('B6').fill = inputFill;

  // ========================================================================
  // SECTIE 2: JAARLIJKSE BEREKENINGEN (rijen 8-14)
  // ========================================================================

  sheet.getCell('A8').value = 'JAARLIJKSE BEREKENINGEN';
  sheet.getCell('A8').font = { bold: true, size: 14 };
  sheet.mergeCells('A8:C8');

  // Rij 10: Jaarlijkse Omzet
  sheet.getCell('A10').value = 'Jaarlijkse Omzet';
  sheet.getCell('B10').value = { formula: 'B3*12', result: undefined };
  sheet.getCell('B10').numFmt = currencyFmt;

  // Rij 11: Jaarlijkse Kosten
  sheet.getCell('A11').value = 'Jaarlijkse Kosten';
  sheet.getCell('B11').value = { formula: 'B4*12', result: undefined };
  sheet.getCell('B11').numFmt = currencyFmt;

  // Rij 12: Jaarlijkse België Kosten
  sheet.getCell('A12').value = 'Jaarlijkse België Kosten';
  sheet.getCell('B12').value = { formula: 'B5*12', result: undefined };
  sheet.getCell('B12').numFmt = currencyFmt;

  // Rij 13: Jaarlijkse Spanje Aftrekbaar
  sheet.getCell('A13').value = 'Jaarlijkse Spanje Aftrekbaar';
  sheet.getCell('B13').value = { formula: 'B6*12', result: undefined };
  sheet.getCell('B13').numFmt = currencyFmt;

  // Rij 14: RETA Jaarlijks
  sheet.getCell('A14').value = 'RETA Jaarlijks';
  sheet.getCell('B14').value = { formula: 'RETA_ANNUAL', result: undefined };
  sheet.getCell('B14').numFmt = currencyFmt;

  // Rij 15: Totaal Aftrekbaar
  sheet.getCell('A15').value = 'Totaal Aftrekbaar';
  sheet.getCell('B15').value = { formula: 'SUM(B11:B14)', result: undefined };
  sheet.getCell('B15').numFmt = currencyFmt;
  sheet.getCell('B15').font = { bold: true };

  // Rij 16: Rendimiento Neto Previo (Netto Rendement Vooraf)
  sheet.getCell('A16').value = 'Rendimiento Neto Previo';
  sheet.getCell('B16').value = { formula: 'B10-B15', result: undefined };
  sheet.getCell('B16').numFmt = currencyFmt;
  sheet.getCell('B16').font = { bold: true };

  // ========================================================================
  // SECTIE 3: GASTOS DIFÍCIL (rijen 18-21)
  // ========================================================================

  sheet.getCell('A18').value = 'GASTOS DE DIFÍCIL JUSTIFICACIÓN';
  sheet.getCell('A18').font = { bold: true, size: 14 };
  sheet.mergeCells('A18:C18');

  // Rij 20: Rendimiento Neto Previo (referentie)
  sheet.getCell('A20').value = 'Rendimiento Neto Previo';
  sheet.getCell('B20').value = { formula: 'B16', result: undefined };
  sheet.getCell('B20').numFmt = currencyFmt;

  // Rij 21: Gastos Difícil (5%)
  sheet.getCell('A21').value = 'Gastos Difícil (5%)';
  sheet.getCell('B21').value = { formula: 'MIN(MAX(0,B16)*GASTOS_DIFICIL_RATE,GASTOS_DIFICIL_MAX)', result: undefined };
  sheet.getCell('B21').numFmt = currencyFmt;

  // Rij 22: Base Liquidable (Belastbare Basis)
  sheet.getCell('A22').value = 'Base Liquidable';
  sheet.getCell('B22').value = { formula: 'MAX(0,B16-B21)', result: undefined };
  sheet.getCell('B22').numFmt = currencyFmt;
  sheet.getCell('B22').font = { bold: true };

  // ========================================================================
  // SECTIE 4: IRPF SCHIJF BEREKENING (rijen 24-33)
  // ========================================================================

  sheet.getCell('A24').value = 'IRPF SCHIJF BEREKENING';
  sheet.getCell('A24').font = { bold: true, size: 14 };
  sheet.mergeCells('A24:E24');

  // Koptekst rij
  sheet.getCell('A25').value = 'Ondergrens';
  sheet.getCell('B25').value = 'Bovengrens';
  sheet.getCell('C25').value = 'Tarief';
  sheet.getCell('D25').value = 'Belastbaar';
  sheet.getCell('E25').value = 'Belasting';

  ['A25', 'B25', 'C25', 'D25', 'E25'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true };
    sheet.getCell(cell).fill = headerFill;
  });

  // IRPF schijf rijen (rijen 26-31)
  const brackets = FISCAL_DATA.irpfBrackets;
  brackets.forEach((bracket, index) => {
    const row = 26 + index;

    // Ondergrens
    sheet.getCell(`A${row}`).value = bracket.lower;
    sheet.getCell(`A${row}`).numFmt = currencyIntFmt;

    // Bovengrens
    if (bracket.upper === Infinity) {
      sheet.getCell(`B${row}`).value = '+';
    } else {
      sheet.getCell(`B${row}`).value = bracket.upper;
      sheet.getCell(`B${row}`).numFmt = currencyIntFmt;
    }

    // Tarief
    sheet.getCell(`C${row}`).value = bracket.rate;
    sheet.getCell(`C${row}`).numFmt = '0%';

    // Belastbaar in schijf: MAX(0, MIN($B$22, Bovengrens) - Ondergrens)
    // Voor de laatste schijf (onbeperkt), gebruik een zeer groot getal
    const upperRef = bracket.upper === Infinity ? 999999999 : bracket.upper;
    sheet.getCell(`D${row}`).value = {
      formula: `MAX(0,MIN($B$22,${upperRef})-${bracket.lower})`,
      result: undefined
    };
    sheet.getCell(`D${row}`).numFmt = currencyFmt;

    // Belasting voor schijf: Belastbaar * Tarief
    sheet.getCell(`E${row}`).value = {
      formula: `D${row}*C${row}`,
      result: undefined
    };
    sheet.getCell(`E${row}`).numFmt = currencyFmt;
  });

  // Rij 32: Totale Belasting (Cuota 1)
  sheet.getCell('A32').value = 'Totale Belasting (Cuota 1)';
  sheet.getCell('A32').font = { bold: true };
  sheet.getCell('E32').value = { formula: 'SUM(E26:E31)', result: undefined };
  sheet.getCell('E32').numFmt = currencyFmt;
  sheet.getCell('E32').font = { bold: true };

  // ========================================================================
  // SECTIE 5: 4-FASE MÍNIMO METHODE (rijen 34-44)
  // ========================================================================

  sheet.getCell('A34').value = '4-FASE MÍNIMO METHODE';
  sheet.getCell('A34').font = { bold: true, size: 14 };
  sheet.mergeCells('A34:C34');

  // Rij 36: Base Liquidable (referentie)
  sheet.getCell('A36').value = 'Base Liquidable';
  sheet.getCell('B36').value = { formula: 'B22', result: undefined };
  sheet.getCell('B36').numFmt = currencyFmt;

  // Rij 37: Belasting op Basis (Cuota 1)
  sheet.getCell('A37').value = 'Belasting op Basis (Cuota 1)';
  sheet.getCell('B37').value = { formula: 'E32', result: undefined };
  sheet.getCell('B37').numFmt = currencyFmt;

  // Rij 38: Mínimo Personal
  sheet.getCell('A38').value = 'Mínimo Personal';
  sheet.getCell('B38').value = { formula: 'MINIMO_PERSONAL', result: undefined };
  sheet.getCell('B38').numFmt = currencyIntFmt;

  // Rij 39: Mínimo Afstammelingen
  sheet.getCell('A39').value = 'Mínimo Afstammelingen';
  sheet.getCell('B39').value = { formula: 'MINIMO_DESCENDIENTES', result: undefined };
  sheet.getCell('B39').numFmt = currencyIntFmt;

  // Rij 40: Totaal Mínimos
  sheet.getCell('A40').value = 'Totaal Mínimos';
  sheet.getCell('B40').value = { formula: 'B38+B39', result: undefined };
  sheet.getCell('B40').numFmt = currencyIntFmt;
  sheet.getCell('B40').font = { bold: true };

  // Rij 41: Belasting op Mínimos (Cuota 3) - berekend met eerste schijf tarief
  // Totaal mínimos (7.950) valt in eerste schijf (0-12.450) aan 19%
  // Formule: B40 * 0.19 (vereenvoudigd aangezien mínimos < eerste schijf bovengrens)
  sheet.getCell('A41').value = 'Belasting op Mínimos (Cuota 3)';
  sheet.getCell('B41').value = { formula: 'B40*0.19', result: undefined };
  sheet.getCell('B41').numFmt = currencyFmt;

  // Rij 42: Cuota Íntegra = MAX(0, Cuota1 - Cuota3)
  sheet.getCell('A42').value = 'Cuota Íntegra';
  sheet.getCell('B42').value = { formula: 'MAX(0,B37-B41)', result: undefined };
  sheet.getCell('B42').numFmt = currencyFmt;
  sheet.getCell('B42').font = { bold: true };

  // Rij 43: Cuota Diferencial (zelfde als Cuota Íntegra voor autónomos)
  sheet.getCell('A43').value = 'Cuota Diferencial';
  sheet.getCell('B43').value = { formula: 'B42', result: undefined };
  sheet.getCell('B43').numFmt = currencyFmt;
  sheet.getCell('B43').font = { bold: true };

  // ========================================================================
  // SECTIE 6: EINDRESULTATEN (rijen 45-53)
  // ========================================================================

  sheet.getCell('A45').value = 'EINDRESULTATEN';
  sheet.getCell('A45').font = { bold: true, size: 14 };
  sheet.mergeCells('A45:C45');

  // Rij 47: Jaarlijkse IRPF
  sheet.getCell('A47').value = 'Jaarlijkse IRPF';
  sheet.getCell('B47').value = { formula: 'B43', result: undefined };
  sheet.getCell('B47').numFmt = currencyFmt;

  // Rij 48: Maandelijkse IRPF
  sheet.getCell('A48').value = 'Maandelijkse IRPF';
  sheet.getCell('B48').value = { formula: 'B47/12', result: undefined };
  sheet.getCell('B48').numFmt = currencyFmt;

  // Rij 49: Jaarlijks Netto Inkomen (Omzet - Aftrekbaar - IRPF)
  sheet.getCell('A49').value = 'Jaarlijks Netto Inkomen';
  sheet.getCell('B49').value = { formula: 'B10-B15-B47', result: undefined };
  sheet.getCell('B49').numFmt = currencyFmt;
  sheet.getCell('B49').font = { bold: true };

  // Rij 50: Maandelijks Netto Inkomen
  sheet.getCell('A50').value = 'Maandelijks Netto Inkomen';
  sheet.getCell('B50').value = { formula: 'B49/12', result: undefined };
  sheet.getCell('B50').numFmt = currencyFmt;
  sheet.getCell('B50').font = { bold: true };

  // Rij 51: Jaarlijks Leefgeld (Netto Inkomen - Privé Kosten)
  sheet.getCell('A51').value = 'Jaarlijks Leefgeld';
  sheet.getCell('B51').value = { formula: 'B49-(PRIVATE_COSTS*12)', result: undefined };
  sheet.getCell('B51').numFmt = currencyFmt;
  sheet.getCell('B51').font = { bold: true };

  // Rij 52: Maandelijks Leefgeld
  sheet.getCell('A52').value = 'Maandelijks Leefgeld';
  sheet.getCell('B52').value = { formula: 'B51/12', result: undefined };
  sheet.getCell('B52').numFmt = currencyFmt;
  sheet.getCell('B52').font = { bold: true };

  // Rij 53: Effectief Belastingtarief
  sheet.getCell('A53').value = 'Effectief Belastingtarief';
  sheet.getCell('B53').value = { formula: 'IFERROR(B47/B16,0)', result: undefined };
  sheet.getCell('B53').numFmt = percentFmt;

  // ========================================================================
  // VOORWAARDELIJKE OPMAAK
  // ========================================================================

  // Leefgeld cellen (B51, B52): Rood indien <0, Oranje indien 0-500, Groen indien >=500
  // Opmerking: ExcelJS voorwaardelijke opmaak via addConditionalFormatting

  // Jaarlijks Leefgeld (B51)
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

  // Maandelijks Leefgeld (B52)
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

  // Effectief Belastingtarief (B53): Rood indien >40%, Oranje indien 30-40%, Groen indien <30%
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
  // KOLOM BREEDTES
  // ========================================================================

  sheet.getColumn('A').width = 30;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 10;
  sheet.getColumn('D').width = 15;
  sheet.getColumn('E').width = 15;

  // ========================================================================
  // AFDRUK INDELING
  // ========================================================================

  sheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: 'A1:E55',
    margins: {
      left: 0.75, right: 0.75,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    }
  };

  sheet.headerFooter = {
    oddHeader: `&C&"Arial,Bold"Scenario ${scenario.id} - ${scenario.label} | Spaanse Autónomo Belasting Calculator`,
    oddFooter: '&LPagina &P&R&D'
  };

  return sheet;
}

// ============================================================================
// OVERZICHT TABBLAD
// ============================================================================

/**
 * Maakt het Overzicht tabblad met navigatie en vergelijkingstabel.
 *
 * Tabblad structuur:
 * - Sectie 1: KOPTEKST (rijen 1-3)
 * - Sectie 2: NAVIGATIE (rijen 4-10) - Hyperlinks naar scenario tabbladen
 * - Sectie 3: VERGELIJKINGSTABEL (rijen 12-30) - Cross-sheet formules
 *
 * @param {ExcelJS.Workbook} workbook - Het werkboek om het tabblad aan toe te voegen
 * @param {Array} scenarios - Array van scenario objecten
 * @returns {ExcelJS.Worksheet} Het aangemaakte Overzicht tabblad
 */
function createOverviewSheet(workbook, scenarios) {
  const sheet = workbook.addWorksheet('Overzicht');

  // Valuta en percentage opmaak
  const currencyFmt = '"EUR "#,##0.00';
  const currencyIntFmt = '"EUR "#,##0';
  const percentFmt = '0.0%';

  // Koptekst vulling (lichtgrijs)
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD0D0D0' }
  };

  // Afwisselende rij vulling (zeer lichtgrijs)
  const altRowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F5F5' }
  };

  // ========================================================================
  // SECTIE 1: KOPTEKST (rijen 1-3)
  // ========================================================================

  sheet.getCell('A1').value = 'Spaanse Autónomo Belasting Calculator';
  sheet.getCell('A1').font = { bold: true, size: 18 };
  sheet.mergeCells('A1:F1');

  // Generator notitie als cel opmerking
  sheet.getCell('A1').note = {
    texts: [
      { text: 'Gegenereerd door autonomo_calculator\n', font: { bold: true } },
      { text: 'Node.js + ExcelJS', font: { italic: true } }
    ]
  };

  sheet.getCell('A2').value = 'Fiscaal Jaar 2025/2026';
  sheet.getCell('A2').font = { size: 12, color: { argb: 'FF666666' } };
  sheet.mergeCells('A2:F2');

  // Rij 3: Leeg

  // ========================================================================
  // SECTIE 2: NAVIGATIE (rijen 4-10)
  // ========================================================================

  sheet.getCell('A4').value = 'Snelle Navigatie';
  sheet.getCell('A4').font = { bold: true, size: 14 };

  // Maak hyperlinks naar elk scenario tabblad
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

  // Hyperlink naar Constanten tabblad
  sheet.getCell('A10').value = {
    text: 'Constanten (Fiscale Data)',
    hyperlink: "#'Constanten'!A1"
  };
  sheet.getCell('A10').font = { color: { argb: 'FF0066CC' }, underline: true };

  // ========================================================================
  // SECTIE 3: VERGELIJKINGSTABEL (rijen 12-30)
  // ========================================================================

  sheet.getCell('A12').value = 'Scenario Vergelijking';
  sheet.getCell('A12').font = { bold: true, size: 14 };
  sheet.mergeCells('A12:F12');

  // Kolom kopteksten (rij 13)
  sheet.getCell('A13').value = 'Metriek';
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

  // Hulpfunctie om tabblad naam te krijgen voor scenario
  const getSheetName = (scenario) => `Scenario ${scenario.id} - ${scenario.label}`;

  // Hulpfunctie om cross-sheet formule rij te maken
  const createCrossSheetRow = (rowNum, metricName, cellRef, format, isAltRow = false) => {
    sheet.getCell(`A${rowNum}`).value = metricName;
    sheet.getCell(`A${rowNum}`).alignment = { horizontal: 'left' };

    // Pas afwisselende rij kleur toe
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

  // Vergelijkingsrijen met cross-sheet formules
  // Invoer Sectie
  createCrossSheetRow(14, 'Maandelijkse Omzet', 'B3', currencyFmt, false);
  createCrossSheetRow(15, 'Maandelijkse Kosten', 'B4', currencyFmt, true);
  createCrossSheetRow(16, 'België Kosten', 'B5', currencyIntFmt, false);

  // Rij 17: Leeg voor visuele scheiding
  sheet.getCell('A17').value = '';

  // Jaarlijkse Sectie
  createCrossSheetRow(18, 'Jaarlijkse Omzet', 'B10', currencyFmt, false);
  createCrossSheetRow(19, 'Totaal Aftrekbaar', 'B15', currencyFmt, true);
  createCrossSheetRow(20, 'Base Liquidable', 'B22', currencyFmt, false);

  // Rij 21: Leeg voor visuele scheiding
  sheet.getCell('A21').value = '';

  // Belasting Sectie
  createCrossSheetRow(22, 'Jaarlijkse IRPF', 'B47', currencyFmt, false);
  createCrossSheetRow(23, 'Maandelijkse IRPF', 'B48', currencyFmt, true);
  createCrossSheetRow(24, 'Effectief Belastingtarief', 'B53', percentFmt, false);

  // Rij 25: Leeg voor visuele scheiding
  sheet.getCell('A25').value = '';

  // Resultaten Sectie
  createCrossSheetRow(26, 'Jaarlijks Netto Inkomen', 'B49', currencyFmt, false);
  createCrossSheetRow(27, 'Maandelijks Netto Inkomen', 'B50', currencyFmt, true);
  createCrossSheetRow(28, 'Jaarlijks Leefgeld', 'B51', currencyFmt, false);
  createCrossSheetRow(29, 'Maandelijks Leefgeld', 'B52', currencyFmt, true);

  // ========================================================================
  // VOORWAARDELIJKE OPMAAK VOOR LEEFGELD RIJEN
  // ========================================================================

  // Jaarlijks Leefgeld (rij 28): Rood indien <0, Oranje indien 0-500, Groen indien >=500
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

  // Maandelijks Leefgeld (rij 29): Zelfde opmaak
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
  // KOLOM BREEDTES
  // ========================================================================

  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 15;
  sheet.getColumn('D').width = 15;
  sheet.getColumn('E').width = 15;
  sheet.getColumn('F').width = 15;

  // ========================================================================
  // BEVROREN VENSTERS
  // ========================================================================

  // Bevries rij 13 (koptekst rij) zodat deze zichtbaar blijft bij scrollen
  sheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: 13, topLeftCell: 'B14', activeCell: 'A1' }
  ];

  // ========================================================================
  // AFDRUK INDELING
  // ========================================================================

  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: 'A1:F30',
    margins: {
      left: 0.75, right: 0.75,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    }
  };

  sheet.headerFooter = {
    oddHeader: '&C&"Arial,Bold"Spaanse Autónomo Belasting Calculator - Overzicht',
    oddFooter: '&LPagina &P van &N&R&D'
  };

  return sheet;
}

// ============================================================================
// HOOFD GENERATOR
// ============================================================================

async function main() {
  console.log('Autónomo Belasting Calculator werkboek aanmaken...');

  // Maak nieuw werkboek
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Autónomo Belasting Calculator';
  workbook.created = new Date();
  workbook.modified = new Date();

  // BELANGRIJK: Maak Constanten tabblad EERST om benoemde bereiken te definiëren
  // (Benoemde bereiken moeten bestaan voordat formules ernaar verwijzen)
  createConstantsSheet(workbook);
  console.log('  - Constanten tabblad aangemaakt met benoemde bereiken');

  // Maak alle 5 scenario tabbladen (nodig voor Overzicht cross-sheet refs)
  SCENARIOS.forEach(scenario => {
    createScenarioSheet(workbook, scenario);
    console.log(`  - Scenario ${scenario.id} - ${scenario.label} aangemaakt (Omzet: ${scenario.monthlyRevenue}, België: ${scenario.belgiumCost})`);
  });

  // Maak Overzicht tabblad met vergelijkingstabel
  createOverviewSheet(workbook, SCENARIOS);
  console.log('  - Overzicht tabblad aangemaakt met vergelijkingstabel');

  // Herorder tabbladen: Overzicht eerst, dan Scenarios A-E, Constanten laatst
  // ExcelJS: verplaats tabblad door worksheet volgorde te wijzigen
  const overviewSheet = workbook.getWorksheet('Overzicht');
  const constantsSheet = workbook.getWorksheet('Constanten');

  // Verplaats Overzicht naar positie 1 (index 0)
  workbook.removeWorksheet(overviewSheet.id);
  const newOverview = workbook.addWorksheet('Overzicht', { properties: overviewSheet.properties });

  // Kopieer Overzicht inhoud door het opnieuw aan te maken op positie 1
  // ExcelJS heeft geen directe "verplaats" - we moeten opnieuw aanmaken
  // Andere aanpak: herbouw werkboek met correcte volgorde

  // Eenvoudigste aanpak: verwijder en voeg opnieuw toe in correcte volgorde
  // Maar dat verliest inhoud. Beter: maak tabbladen in de juiste volgorde vanaf het begin

  // Herbouw werkboek met correcte tabblad volgorde
  console.log('\n  Tabblad volgorde reorganiseren...');

  // Maak nieuw werkboek met correcte tabblad volgorde
  const finalWorkbook = new ExcelJS.Workbook();
  finalWorkbook.creator = 'Autónomo Belasting Calculator';
  finalWorkbook.created = new Date();
  finalWorkbook.modified = new Date();

  // 1. Eerst Constanten maken (voor benoemde bereiken)
  createConstantsSheet(finalWorkbook);

  // 2. Maak scenario tabbladen
  SCENARIOS.forEach(scenario => {
    createScenarioSheet(finalWorkbook, scenario);
  });

  // 3. Maak Overzicht tabblad
  createOverviewSheet(finalWorkbook, SCENARIOS);

  // Nu herordenen: Overzicht moet eerste zichtbare zijn
  // ExcelJS staat toe actieve tab in te stellen en volgorde via worksheet.orderNo

  // Haal alle worksheets op
  const sheets = finalWorkbook.worksheets;

  // Stel orderNo in om tab volgorde te controleren
  // Overzicht = 0, Scenario A = 1, B = 2, C = 3, D = 4, E = 5, Constanten = 6
  sheets.forEach(ws => {
    if (ws.name === 'Overzicht') {
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
    } else if (ws.name === 'Constanten') {
      ws.orderNo = 6;
    }
  });

  // Schrijf naar bestand (relatief aan scripts/ directory)
  const outputPath = path.join(__dirname, '..', 'autonomo_calculator.xlsx');
  await finalWorkbook.xlsx.writeFile(outputPath);

  console.log(`\nWerkboek opgeslagen naar: ${outputPath}`);
  console.log('\nTabbladen aangemaakt (in tab volgorde):');
  console.log('  1. Overzicht (vergelijkingstabel + navigatie)');
  console.log('  2. Scenario A - 3K (Omzet: 3000, België: 1000)');
  console.log('  3. Scenario B - 6K (Omzet: 6000, België: 1000)');
  console.log('  4. Scenario C - 9K (Omzet: 9000, België: 2500)');
  console.log('  5. Scenario D - 12K (Omzet: 12000, België: 2500)');
  console.log('  6. Scenario E - 18K (Omzet: 18000, België: 2500)');
  console.log('  7. Constanten (benoemde bereiken voor fiscale data)');
  console.log('\nOpen het bestand in Excel om te verifiëren dat formules correct berekenen.');
}

// Voer hoofd functie uit
main().catch(err => {
  console.error('Fout bij genereren werkboek:', err);
  process.exit(1);
});
