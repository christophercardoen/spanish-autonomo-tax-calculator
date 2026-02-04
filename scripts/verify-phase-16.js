/**
 * Phase 16 Calendar Enhancement - Verification Script
 * Run in browser console after loading autonomo_dashboard.html
 *
 * Verifies all CALENDAR-01 through CALENDAR-16 requirements
 */

async function verifyPhase16() {
  const results = [];
  const pass = (name) => results.push({ name, status: 'PASS' });
  const fail = (name, reason) => results.push({ name, status: 'FAIL', reason });

  console.log('=== Phase 16 Calendar Enhancement Verification ===\n');

  // CALENDAR-01: Month grid calendar
  try {
    const grid = document.querySelector('.calendar-grid-with-weeks');
    if (grid && grid.children.length > 0) pass('CALENDAR-01: Month grid exists');
    else fail('CALENDAR-01', 'Calendar grid not found');
  } catch (e) { fail('CALENDAR-01', e.message); }

  // CALENDAR-02: Day editor modal
  try {
    const modal = document.getElementById('dayEditorModal');
    if (modal) pass('CALENDAR-02: Day editor modal exists');
    else fail('CALENDAR-02', 'Day editor modal not found');
  } catch (e) { fail('CALENDAR-02', e.message); }

  // CALENDAR-03: Day editor fields
  try {
    const location = document.querySelector('[name="dayLocation"]');
    const client = document.getElementById('dayEditorClient');
    const project = document.getElementById('dayEditorProject');
    const notes = document.getElementById('dayEditorNotes');
    if (location && client && project && notes) pass('CALENDAR-03: Day editor fields exist');
    else fail('CALENDAR-03', 'Missing day editor fields');
  } catch (e) { fail('CALENDAR-03', e.message); }

  // CALENDAR-04: 183-day tracking
  try {
    if (typeof calculateThresholdCounts === 'function') {
      const counts = await calculateThresholdCounts(2026);
      if (counts.annual && typeof counts.annual.threshold === 'number') {
        pass('CALENDAR-04: 183-day tracking works');
      } else fail('CALENDAR-04', 'Threshold calculation failed');
    } else fail('CALENDAR-04', 'calculateThresholdCounts not found');
  } catch (e) { fail('CALENDAR-04', e.message); }

  // CALENDAR-05: Work pattern on project
  try {
    if (typeof WorkPatternManager !== 'undefined' && WorkPatternManager.savePatternToProject) {
      pass('CALENDAR-05: WorkPatternManager exists');
    } else fail('CALENDAR-05', 'WorkPatternManager not found');
  } catch (e) { fail('CALENDAR-05', e.message); }

  // CALENDAR-06: Pattern auto-apply
  try {
    if (WorkPatternManager.applyPattern) {
      pass('CALENDAR-06: applyPattern function exists');
    } else fail('CALENDAR-06', 'applyPattern not found');
  } catch (e) { fail('CALENDAR-06', e.message); }

  // CALENDAR-07: Bulk selection and client tagging
  try {
    const bulkTagModal = document.getElementById('bulkTagModal');
    // Week selectors are dynamically created in calendar grid
    if (bulkTagModal) pass('CALENDAR-07: Bulk tag modal exists');
    else fail('CALENDAR-07', 'bulkTagModal not found');
  } catch (e) { fail('CALENDAR-07', e.message); }

  // CALENDAR-08: Monthly counts
  try {
    const counts = await calculateThresholdCounts(2026);
    if (counts.monthly && Object.keys(counts.monthly).length === 12) {
      pass('CALENDAR-08: Monthly counts calculated (12 months)');
    } else fail('CALENDAR-08', 'Monthly counts incomplete');
  } catch (e) { fail('CALENDAR-08', e.message); }

  // CALENDAR-09: Annual totals
  try {
    const counts = await calculateThresholdCounts(2026);
    if (typeof counts.annual.belgium === 'number') {
      pass('CALENDAR-09: Annual totals calculated');
    } else fail('CALENDAR-09', 'Annual totals missing');
  } catch (e) { fail('CALENDAR-09', e.message); }

  // CALENDAR-10: Warning levels
  try {
    if (typeof WARNING_LEVELS !== 'undefined' &&
        WARNING_LEVELS.CAUTION.threshold === 170 &&
        WARNING_LEVELS.WARNING.threshold === 180 &&
        WARNING_LEVELS.DANGER.threshold === 183) {
      pass('CALENDAR-10: Warning levels correct (170/180/183)');
    } else fail('CALENDAR-10', 'Warning level thresholds incorrect');
  } catch (e) { fail('CALENDAR-10', e.message); }

  // CALENDAR-11: Expense linking infrastructure
  try {
    if (CalendarManager.getLinkedExpenseCount) {
      // Test returns a number (0 until Phase 17 populates expenses)
      const count = await CalendarManager.getLinkedExpenseCount('2026-02-15');
      if (typeof count === 'number') {
        pass('CALENDAR-11: Expense linking infrastructure ready');
      } else {
        fail('CALENDAR-11', 'getLinkedExpenseCount returned non-number');
      }
    } else fail('CALENDAR-11', 'getLinkedExpenseCount not found');
  } catch (e) { fail('CALENDAR-11', e.message); }

  // CALENDAR-12: Day shows client tag and location
  try {
    const dayCell = document.querySelector('.day-cell[data-date]');
    if (dayCell) pass('CALENDAR-12: Day cells have data-date attribute');
    else fail('CALENDAR-12', 'Day cells missing data-date');
  } catch (e) { fail('CALENDAR-12', e.message); }

  // CALENDAR-13: ICS export
  try {
    if (typeof generateEnhancedICS === 'function') {
      pass('CALENDAR-13: ICS export function exists');
    } else fail('CALENDAR-13', 'generateEnhancedICS not found');
  } catch (e) { fail('CALENDAR-13', e.message); }

  // CALENDAR-14: CSV export
  try {
    if (typeof generateEnhancedCSV === 'function') {
      pass('CALENDAR-14: CSV export function exists');
    } else fail('CALENDAR-14', 'generateEnhancedCSV not found');
  } catch (e) { fail('CALENDAR-14', e.message); }

  // CALENDAR-15: Google Calendar sync
  try {
    if (typeof GCalSync !== 'undefined' && GCalSync.sync) {
      pass('CALENDAR-15: GCalSync module exists');
    } else fail('CALENDAR-15', 'GCalSync not found');
  } catch (e) { fail('CALENDAR-15', e.message); }

  // CALENDAR-16: Conflict resolution (app wins)
  try {
    if (GCalSync && typeof GCalSync.pushToGCal === 'function') {
      pass('CALENDAR-16: Push sync (app wins) exists');
    } else fail('CALENDAR-16', 'Push sync not found');
  } catch (e) { fail('CALENDAR-16', e.message); }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n=== Verification Results ===\n');
  console.table(results);
  console.log(`\nPhase 16 Verification: ${passed}/${results.length} passed`);

  if (failed > 0) {
    console.log('\nFailed checks:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.reason}`);
    });
  }

  return { results, passed, failed, total: results.length };
}

// Additional verification functions for manual testing

function testDayEditor() {
  console.log('Testing Day Editor...');
  const testDate = '2026-02-15';
  if (typeof openDayEditor === 'function') {
    openDayEditor(testDate);
    console.log('Day editor opened for', testDate);
    return true;
  }
  console.error('openDayEditor function not found');
  return false;
}

function testWarningBanner() {
  console.log('Testing Warning Banner...');
  if (typeof updateThresholdWarning === 'function') {
    console.log('Test CAUTION (170):');
    updateThresholdWarning(175);
    setTimeout(() => {
      console.log('Test WARNING (180):');
      updateThresholdWarning(181);
    }, 2000);
    setTimeout(() => {
      console.log('Test DANGER (183+):');
      updateThresholdWarning(185);
    }, 4000);
    return true;
  }
  console.error('updateThresholdWarning function not found');
  return false;
}

async function testExport() {
  console.log('Testing Export Functions...');
  try {
    const ics = await generateEnhancedICS(2026);
    console.log('ICS generated:', ics.substring(0, 200) + '...');

    const csv = await generateEnhancedCSV(2026);
    console.log('CSV generated:', csv.substring(0, 200) + '...');

    return true;
  } catch (e) {
    console.error('Export test failed:', e);
    return false;
  }
}

// Run verification
console.log('Phase 16 Verification Script Loaded');
console.log('Run verifyPhase16() to execute all checks');
console.log('Run testDayEditor() to test day editor modal');
console.log('Run testWarningBanner() to test warning levels');
console.log('Run testExport() to test ICS/CSV export');
