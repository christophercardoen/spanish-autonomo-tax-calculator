# Phase 9: Fix Reset to Defaults Button - Research

**Researched:** 2026-02-02
**Domain:** JavaScript bug fix / codebase pattern alignment
**Confidence:** HIGH

## Summary

This phase addresses a critical integration bug discovered in the v1.1 milestone audit: the `resetScenarios()` function at line 6656 calls a non-existent function `recalculateAllScenarios()`, causing a JavaScript error when users click the "Reset to Defaults" button in the Scenarios section.

Investigation of the codebase reveals that scenario results are computed **on-the-fly** during rendering via `getSortedScenarios()`, which calls `calculateScenarioResults()` for each scenario. This means explicit recalculation before render is unnecessary and the fix is simply removing the invalid function call.

**Primary recommendation:** Remove the `recalculateAllScenarios()` call from `resetScenarios()` - the subsequent render functions already trigger recalculation automatically.

## Standard Stack

This is a pure bug fix within an existing vanilla JavaScript codebase. No new libraries or tools required.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JavaScript | ES2020+ | Application logic | Project constraint: NO frameworks |
| structuredClone() | Native | Deep clone objects | Built-in, used throughout codebase |
| localStorage | Native | State persistence | Used for scenarios, expenses, calendar |

### Supporting
No additional libraries needed for this fix.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Remove the call | Implement function | Adding code for no benefit - render already recalculates |
| Remove the call | Inline recalculation | Redundant - `getSortedScenarios()` already computes results |

**Installation:**
No installation required - pure code modification.

## Architecture Patterns

### Existing Scenario Calculation Pattern

The codebase uses a **lazy recalculation** pattern where results are computed on-demand during rendering rather than stored in state:

```
scenarioState.scenarios  →  getSortedScenarios()  →  renderScenarioCards()
     (raw data)            (computes results)        (uses computed results)
```

**Key functions:**

1. `scenarioState.scenarios` - Raw scenario data (revenue, expenses, etc.)
2. `calculateScenarioResults(scenario)` - Computes IRPF/RETA/net for one scenario
3. `getSortedScenarios()` - Maps all scenarios through `calculateScenarioResults()`, sorts by leefgeld
4. `renderScenarioCards()` - Calls `getSortedScenarios()` to get computed results for display
5. `renderComparisonTable()` - Also calls `getSortedScenarios()` internally

### Pattern Evidence (from codebase)

```javascript
// Line 6808-6816: getSortedScenarios computes results on-the-fly
function getSortedScenarios() {
  const scenarios = Object.values(scenarioState.scenarios);
  return scenarios
    .map(s => ({
      ...s,
      results: calculateScenarioResults(s)  // ← Recalculation happens HERE
    }))
    .sort((a, b) => b.results.leefgeld - a.results.leefgeld);
}

// Line 7765-7769: renderScenarioCards uses getSortedScenarios
function renderScenarioCards() {
  const container = document.getElementById('scenarioCards');
  if (!container) return;
  const sorted = getSortedScenarios();  // ← Results computed here
  // ... render using sorted.results
}
```

### Similar Reset Patterns in Codebase

The `resetToDefaults()` function for expenses (line 6834) follows a similar pattern:

```javascript
function resetToDefaults() {
  if (confirm('Reset all expenses to default values? This cannot be undone.')) {
    expenseData = structuredClone(DEFAULT_EXPENSES);
    saveExpenses();
    renderAllSections();
    recalculateTotals();  // ← This exists and is needed (updates IRPF display)
    return true;
  }
  return false;
}
```

The key difference: `recalculateTotals()` EXISTS and serves a specific purpose (updating the IRPF calculation display panel). The analogous function `recalculateAllScenarios()` does NOT exist and is NOT needed because scenario results are computed during render.

### Anti-Patterns to Avoid
- **Implementing the missing function:** Would add code that duplicates work done by `getSortedScenarios()`
- **Caching results in scenarioState:** Would require manual invalidation, introducing complexity

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scenario recalculation | Custom `recalculateAllScenarios()` | Existing `getSortedScenarios()` | Already computes results during render |
| Deep clone scenarios | Manual property copy | `structuredClone()` | Native, handles nested objects |

**Key insight:** The missing function is not a missing feature - it's a dead code reference. The architecture already handles recalculation elegantly via lazy computation.

## Common Pitfalls

### Pitfall 1: Over-Engineering the Fix
**What goes wrong:** Implementing a new `recalculateAllScenarios()` function when it's not needed
**Why it happens:** Desire to make the code match the comment/call rather than understanding the architecture
**How to avoid:** Verify that render functions already trigger calculation (they do via `getSortedScenarios()`)
**Warning signs:** Adding code that stores results in state when they're computed on-the-fly

### Pitfall 2: Incomplete Reset
**What goes wrong:** Forgetting to clear localStorage or reset all state properties
**Why it happens:** Missing one of the state management steps
**How to avoid:** Verify the existing `resetScenarios()` handles:
1. User confirmation
2. localStorage clearing
3. State reinitialization (scenarios, selected, customOrder)
4. Re-rendering (cards and table)
**Warning signs:** Data persists after clicking "Reset to Defaults" button

### Pitfall 3: Breaking the Confirmation Dialog
**What goes wrong:** Removing the confirmation prompt or breaking its flow
**Why it happens:** Accidentally modifying surrounding code
**How to avoid:** Only remove the single invalid function call
**Warning signs:** Reset happens without user confirmation

### Pitfall 4: Not Testing All Scenarios
**What goes wrong:** Fix works for preset scenarios but breaks custom scenarios
**Why it happens:** Not testing the full reset flow
**How to avoid:** Test sequence:
1. Add custom scenario
2. Edit existing scenario
3. Click "Reset to Defaults"
4. Verify all return to A-E presets
**Warning signs:** Custom scenarios persist, edits not reverted

## Code Examples

### Current Buggy Code (line 6639-6661)

```javascript
function resetScenarios() {
  if (!confirm('Reset all scenarios to defaults? This will remove any custom scenarios and reset edits.')) {
    return;
  }

  // Clear from localStorage
  localStorage.removeItem(SCENARIO_STORAGE_KEY);

  // Reinitialize state from defaults
  scenarioState = {
    version: 1,
    scenarios: structuredClone(SCENARIO_PRESETS),
    selected: [],
    customOrder: []
  };

  // Recalculate all scenarios
  recalculateAllScenarios();  // ← BUG: Function does not exist

  // Re-render
  renderScenarioCards();
  renderComparisonTable();
}
```

### Fixed Code (Option 1 - RECOMMENDED)

```javascript
function resetScenarios() {
  if (!confirm('Reset all scenarios to defaults? This will remove any custom scenarios and reset edits.')) {
    return;
  }

  // Clear from localStorage
  localStorage.removeItem(SCENARIO_STORAGE_KEY);

  // Reinitialize state from defaults
  scenarioState = {
    version: 1,
    scenarios: structuredClone(SCENARIO_PRESETS),
    selected: [],
    customOrder: []
  };

  // Re-render (recalculation happens automatically via getSortedScenarios())
  renderScenarioCards();
  renderComparisonTable();
}
```

**Why this works:** `renderScenarioCards()` calls `getSortedScenarios()` which calls `calculateScenarioResults()` for each scenario. Recalculation is automatic.

### Verification Test (browser console)

```javascript
// Test: Click "Reset to Defaults" in Scenarios section
// Expected: No console errors, scenarios reset to A-E presets

// Before fix - produces error:
// Uncaught ReferenceError: recalculateAllScenarios is not defined
//     at resetScenarios (autonomo_dashboard.html:6656)

// After fix - no errors, clean execution
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store computed results | Compute on render | Already in codebase | Simpler state, no invalidation needed |
| Manual recalculation calls | Lazy computation | N/A | `getSortedScenarios()` handles it |

**Deprecated/outdated:**
- The `recalculateAllScenarios()` call was likely a remnant from an earlier iteration that stored results in state

## Open Questions

None. The fix is straightforward and the codebase patterns are clear.

## Sources

### Primary (HIGH confidence)
- Direct code analysis of `autonomo_dashboard.html`:
  - Line 6639-6661: `resetScenarios()` function
  - Line 6656: Invalid `recalculateAllScenarios()` call
  - Line 6770-6786: `calculateScenarioResults()` function
  - Line 6808-6816: `getSortedScenarios()` function
  - Line 7765-7839: `renderScenarioCards()` function
  - Line 6834-6843: `resetToDefaults()` pattern for expenses

### Secondary (HIGH confidence)
- `/Users/christophercardoen/Downloads/Tax related/.planning/v1.1-MILESTONE-AUDIT.md` - Bug identification and fix options

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH - Direct code analysis confirms function does not exist
- Fix approach: HIGH - Codebase patterns clearly show lazy recalculation
- Testing strategy: HIGH - Clear test sequence identified

**Research date:** 2026-02-02
**Valid until:** N/A (bug fix, not library-dependent)

## Implementation Checklist

For the planner:

1. [ ] Locate `resetScenarios()` function (line 6639)
2. [ ] Remove line 6656: `recalculateAllScenarios();`
3. [ ] Optionally update comment on line 6655 to explain why recalculation is automatic
4. [ ] Test: Click "Reset to Defaults" with no console errors
5. [ ] Test: Verify scenarios reset to A-E presets
6. [ ] Test: Verify localStorage cleared (no custom scenarios persist)
7. [ ] Test: Verify scenario cards and comparison table render correctly

**Estimated effort:** 5-10 minutes
