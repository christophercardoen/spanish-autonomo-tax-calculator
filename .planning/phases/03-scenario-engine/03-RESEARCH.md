# Phase 3: Scenario Engine - Research

**Researched:** 2026-01-30
**Domain:** Multi-Scenario Comparison UI with Live Editing (Vanilla JavaScript Single-File HTML)
**Confidence:** HIGH

## Summary

Phase 3 builds a scenario comparison engine on top of the Phase 1 fiscal foundation and Phase 2 expense tracking. The research confirms this is primarily a UI/UX architecture challenge requiring: horizontal card layout with scrolling, modal dialogs for editing, comparison table with sticky headers, and real-time calculation integration. All implementation uses vanilla JavaScript per project constraints.

The key technical decisions from CONTEXT.md are locked: horizontal card layout (Bloomberg-style), edit via modal with split view (inputs left, results right), instant recalculation on keystroke, comparison table with sticky header row, scenarios auto-sort by leefgeld, and custom scenarios persisted to localStorage. The native HTML `<dialog>` element provides accessible modal functionality without custom focus trapping.

The existing Phase 1 `calculateFullIRPF()` function and Phase 2 expense data structures provide the calculation engine. Phase 3 wraps these in a scenario management system that handles multiple independent scenario configurations, comparison selection, and optimal highlighting.

**Primary recommendation:** Use the native `<dialog>` element with `showModal()` for accessible edit modals, CSS scroll-snap for touch-friendly horizontal cards, and extend the existing localStorage pattern from Phase 2 to persist custom scenarios with a separate storage key.

## Standard Stack

This phase continues the vanilla JavaScript approach from Phases 1-2.

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Vanilla JavaScript | ES6+ | Scenario logic, DOM, state management | Project constraint: no frameworks |
| HTML5 `<dialog>` | Native | Modal dialogs for scenario editing | Built-in accessibility, focus management |
| CSS3 Scroll Snap | Native | Horizontal card scrolling | Touch-friendly, performant |
| localStorage API | Native | Custom scenario persistence | Consistent with Phase 2 pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| structuredClone() | Native | Deep clone scenario data | Creating new scenarios from templates |
| crypto.randomUUID() | Native | Unique scenario IDs | Custom scenario creation |
| requestAnimationFrame | Native | Debounce rapid recalculation | Live typing performance |
| Intl.NumberFormat | Native | EUR currency formatting | Consistent with Phases 1-2 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<dialog>` | Custom modal div | More work, must handle focus trap manually |
| CSS scroll-snap | JavaScript carousel | More complex, worse touch performance |
| localStorage | IndexedDB | Overkill for ~10 scenarios |
| requestAnimationFrame | setTimeout debounce | Less smooth, not synced with render cycle |

**Installation:**
```bash
# No installation required - extends existing autonomo_dashboard.html
```

## Architecture Patterns

### Recommended Data Structure
```javascript
// Scenario data structure for state management
const SCENARIO_PRESETS = Object.freeze({
  'A': Object.freeze({
    id: 'A',
    name: 'Scenario A',
    isPreset: true,
    monthlyRevenue: 3000,
    monthlyExpenses: 750,
    belgiumPattern: 'low',  // 1000 EUR
    hasDescendant: true,
    // Fiscal overrides (defaults to FISCAL_2025)
    fiscalOverrides: null
  }),
  'B': Object.freeze({
    id: 'B',
    name: 'Scenario B',
    isPreset: true,
    monthlyRevenue: 6000,
    monthlyExpenses: 1500,
    belgiumPattern: 'low',
    hasDescendant: true,
    fiscalOverrides: null
  }),
  'C': Object.freeze({
    id: 'C',
    name: 'Scenario C',
    isPreset: true,
    monthlyRevenue: 9000,
    monthlyExpenses: 3000,
    belgiumPattern: 'high',  // 2500 EUR
    hasDescendant: true,
    fiscalOverrides: null
  }),
  'D': Object.freeze({
    id: 'D',
    name: 'Scenario D',
    isPreset: true,
    monthlyRevenue: 12000,
    monthlyExpenses: 5000,
    belgiumPattern: 'high',
    hasDescendant: true,
    fiscalOverrides: null
  }),
  'E': Object.freeze({
    id: 'E',
    name: 'Scenario E',
    isPreset: true,
    monthlyRevenue: 18000,
    monthlyExpenses: 8000,
    belgiumPattern: 'high',
    hasDescendant: true,
    fiscalOverrides: null
  })
});

// State structure for scenario management
const scenarioState = {
  version: 1,
  scenarios: {}, // All scenarios (presets + custom)
  selected: [],  // IDs of selected scenarios for comparison
  customOrder: [] // Order of custom scenarios
};
```

### Pattern 1: Native HTML `<dialog>` for Edit Modal
**What:** Use browser-native dialog element with showModal() for accessible modal editing
**When to use:** Scenario edit modal (split view: inputs left, results right)
**Source:** [MDN Dialog Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
**Example:**
```html
<!-- Dialog element in HTML -->
<dialog id="editScenarioDialog">
  <form method="dialog">
    <header>
      <h2 id="dialogTitle">Edit Scenario</h2>
      <button type="button" class="close-btn" onclick="closeEditModal()">x</button>
    </header>
    <div class="dialog-content">
      <div class="input-pane">
        <!-- Input fields -->
      </div>
      <div class="results-pane">
        <!-- Live calculation results -->
      </div>
    </div>
    <footer>
      <button type="button" onclick="deleteScenario()">Delete</button>
      <button type="submit" value="save">Save Changes</button>
    </footer>
  </form>
</dialog>
```

```javascript
// Source: MDN Dialog Element
const dialog = document.getElementById('editScenarioDialog');

function openEditModal(scenarioId) {
  populateEditForm(scenarioId);
  dialog.showModal();  // Opens as modal, traps focus, enables Esc to close
}

function closeEditModal() {
  dialog.close();
}

// Handle close event
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'save') {
    saveScenarioChanges();
  }
});

// Handle Esc key (cancel event)
dialog.addEventListener('cancel', (e) => {
  // Optional: confirm unsaved changes
});
```

### Pattern 2: CSS Horizontal Scroll with Snap
**What:** Horizontal scrolling card container with snap points for touch-friendly navigation
**When to use:** Scenario card layout
**Source:** [CSS-Tricks Scroll Snapping](https://css-tricks.com/practical-css-scroll-snapping/)
**Example:**
```css
/* Horizontal scroll container */
.scenario-cards {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 1rem;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
}

/* Individual card */
.scenario-card {
  flex: 0 0 280px;  /* Fixed width, no shrink */
  scroll-snap-align: start;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 1rem;
}

/* Selected state */
.scenario-card.selected {
  border: 2px solid var(--accent);
}

/* Optimal indicator (highest leefgeld) */
.scenario-card.optimal {
  background: rgba(74, 222, 128, 0.1);
}

/* Custom scenario visual distinction */
.scenario-card.custom {
  border-left: 3px solid #60a5fa;
}

/* Hide scrollbar but keep functionality */
.scenario-cards::-webkit-scrollbar {
  height: 8px;
}

.scenario-cards::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
}

.scenario-cards::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}
```

### Pattern 3: Comparison Table with Sticky Header
**What:** Scrollable table with sticky header row for vertical scrolling
**When to use:** Side-by-side scenario comparison
**Source:** [DEV Community Sticky Table](https://dev.to/lalitkhu/creating-a-scrollable-table-with-a-sticky-header-and-frozen-column-using-html-and-css-1d2a)
**Example:**
```css
/* Comparison table container */
.comparison-container {
  max-height: 500px;
  overflow-y: auto;
  position: relative;
}

/* Table setup */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

/* Sticky header row */
.comparison-table thead th {
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  border-bottom: 2px solid var(--accent);
}

/* Cell styling */
.comparison-table th,
.comparison-table td {
  padding: 0.75rem 1rem;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
}

/* Row labels column */
.comparison-table td:first-child,
.comparison-table th:first-child {
  text-align: left;
  font-family: 'DM Sans', sans-serif;
}

/* Optimal value highlighting */
.comparison-table td.optimal {
  color: var(--accent);
  font-weight: 600;
}
```

### Pattern 4: Live Recalculation with requestAnimationFrame
**What:** Debounced recalculation triggered by input changes, synced to render cycle
**When to use:** Instant results update in edit modal
**Source:** [Go Make Things Debouncing](https://gomakethings.com/debouncing-events-with-requestanimationframe-for-better-performance/)
**Example:**
```javascript
// Debounced live recalculation
let rafId = null;

function onScenarioInputChange() {
  // Cancel any pending recalculation
  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  // Schedule recalculation for next frame
  rafId = requestAnimationFrame(() => {
    const liveResults = calculateScenarioResults(getFormValues());
    renderResultsPane(liveResults);
    rafId = null;
  });
}

// Attach to all input elements in edit modal
const inputs = dialog.querySelectorAll('input');
inputs.forEach(input => {
  input.addEventListener('input', onScenarioInputChange);
});
```

### Pattern 5: Scenario State Management
**What:** Centralized state with localStorage persistence and sorted display
**When to use:** Managing all scenarios, selections, custom scenario persistence
**Source:** [LogRocket localStorage Guide](https://blog.logrocket.com/localstorage-javascript-complete-guide/)
**Example:**
```javascript
const SCENARIO_STORAGE_KEY = 'autonomo_scenarios_v1';

// Initialize state from localStorage or defaults
function initScenarioState() {
  try {
    const stored = localStorage.getItem(SCENARIO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === 1) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load scenarios:', e.message);
  }

  // Return default state with presets
  return {
    version: 1,
    scenarios: structuredClone(SCENARIO_PRESETS),
    selected: [],
    customOrder: []
  };
}

// Save state to localStorage
function saveScenarioState() {
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarioState));
    return true;
  } catch (e) {
    console.warn('Failed to save scenarios:', e.message);
    return false;
  }
}

// Get scenarios sorted by leefgeld (highest first)
function getSortedScenarios() {
  const scenarios = Object.values(scenarioState.scenarios);

  return scenarios
    .map(s => ({
      ...s,
      results: calculateScenarioResults(s)
    }))
    .sort((a, b) => b.results.leefgeld - a.results.leefgeld);
}

// Calculate results for a scenario
function calculateScenarioResults(scenario) {
  const belgiumCost = scenario.belgiumPattern === 'high' ? 2500 : 1000;
  const totalDeductible = scenario.monthlyExpenses + belgiumCost;

  // Use Phase 1 calculation with optional fiscal overrides
  const fiscal = scenario.fiscalOverrides
    ? { ...FISCAL_2025, ...scenario.fiscalOverrides }
    : FISCAL_2025;

  return calculateFullIRPFWithFiscal(
    scenario.monthlyRevenue,
    totalDeductible,
    scenario.hasDescendant,
    fiscal
  );
}
```

### Anti-Patterns to Avoid
- **Hardcoded fiscal values in scenarios:** Use FISCAL_2025 constants, allow overrides for what-if analysis
- **Storing calculated results:** Calculate on demand, store only inputs
- **Blocking recalculation:** Use requestAnimationFrame, not synchronous loops
- **Manual focus management in dialog:** Let `showModal()` handle it
- **Mutating preset scenarios:** Always clone before modification

## Don't Hand-Roll

Problems that look simple but have verified solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog | Custom div with focus trap | Native `<dialog>` + `showModal()` | Focus trap, Esc handling, backdrop built-in |
| Unique IDs | Counter or random | crypto.randomUUID() | Collision-free, browser-native |
| Deep clone | Manual recursion | structuredClone() | Handles all types, native since 2022 |
| Input debounce | setTimeout | requestAnimationFrame | Synced to render cycle, smoother |
| Currency format | String concatenation | Intl.NumberFormat (Phase 1) | Locale-specific, consistent |
| Horizontal scroll | JavaScript carousel | CSS scroll-snap | Touch-friendly, performant |

**Key insight:** Native browser APIs (dialog, scroll-snap, structuredClone, crypto) provide robust implementations. Phase 3 combines these with the existing Phase 1 calculation engine rather than building new calculation logic.

## Common Pitfalls

### Pitfall 1: Dialog Opened Without showModal()
**What goes wrong:** Dialog opens but doesn't block background, Esc doesn't close, no backdrop
**Why it happens:** Using `dialog.open = true` or `dialog.show()` instead of `dialog.showModal()`
**How to avoid:** Always use `showModal()` for edit dialogs; save `show()` for non-modal tooltips
**Warning signs:** Can click elements behind dialog, no backdrop visible

### Pitfall 2: Focus Jumps to Bottom of Long Modal
**What goes wrong:** Modal opens scrolled to bottom, user sees footer first
**Why it happens:** First focusable element is at end of dialog (e.g., save button)
**How to avoid:** Place first focusable element (with `autofocus`) at top of dialog content
**Source:** [Jared Cunha HTML Dialog](https://jaredcunha.com/blog/html-dialog-getting-accessibility-and-ux-right)
**Warning signs:** Modal opens with content scrolled down

### Pitfall 3: Scenarios Not Sorted After Edit
**What goes wrong:** User edits scenario, results change, but card order doesn't update
**Why it happens:** Missing re-sort after save
**How to avoid:** Always `getSortedScenarios()` after any scenario modification
**Warning signs:** Optimal scenario is not first card

### Pitfall 4: Custom Scenarios Lost on Page Refresh
**What goes wrong:** User creates custom scenario, refreshes, scenario gone
**Why it happens:** Not persisting to localStorage after creation
**How to avoid:** Call `saveScenarioState()` after every mutation (add, edit, delete)
**Warning signs:** Works until refresh, then state resets

### Pitfall 5: Preset Scenarios Modified Unexpectedly
**What goes wrong:** Editing scenario A modifies the SCENARIO_PRESETS constant
**Why it happens:** Reference mutation without cloning
**How to avoid:** Use `structuredClone()` when copying preset to working state
**Warning signs:** Preset values change after editing

### Pitfall 6: Comparison Table Doesn't Update Selection
**What goes wrong:** Check/uncheck scenario, table doesn't show/hide column
**Why it happens:** Missing connection between checkbox state and table render
**How to avoid:** Checkbox change triggers state update AND table re-render
**Warning signs:** Checkboxes toggle but table is static

### Pitfall 7: Rapid Typing Causes Lag
**What goes wrong:** UI freezes while typing quickly in edit modal
**Why it happens:** Recalculating IRPF on every keystroke without debounce
**How to avoid:** Use requestAnimationFrame debounce pattern
**Warning signs:** Input feels sluggish, browser DevTools shows long tasks

### Pitfall 8: Dialog Close Event Fires on Esc
**What goes wrong:** Esc key closes dialog AND triggers save logic
**Why it happens:** Confusing `close` event (form submit) with `cancel` event (Esc key)
**How to avoid:** Check `dialog.returnValue` in close handler; handle `cancel` event separately
**Warning signs:** Pressing Esc saves changes instead of discarding

## Code Examples

### Complete Edit Modal HTML Structure
```html
<!-- Source: MDN Dialog Element, adapted for split-view layout -->
<dialog id="editScenarioDialog" aria-labelledby="dialogTitle">
  <form method="dialog" class="edit-form">
    <header class="dialog-header">
      <h2 id="dialogTitle">Edit Scenario</h2>
      <button type="button" class="close-btn" aria-label="Close" onclick="closeEditModal()">x</button>
    </header>

    <div class="dialog-body">
      <!-- Input pane (left) -->
      <div class="input-pane">
        <div class="form-group">
          <label for="scenarioName">Scenario Name</label>
          <input type="text" id="scenarioName" required autofocus>
        </div>

        <h3>Income & Expenses</h3>
        <div class="form-group">
          <label for="monthlyRevenue">Monthly Revenue (EUR)</label>
          <input type="number" id="monthlyRevenue" min="0" step="100">
        </div>
        <div class="form-group">
          <label for="monthlyExpenses">Monthly Expenses (EUR)</label>
          <input type="number" id="monthlyExpenses" min="0" step="100">
        </div>
        <div class="form-group">
          <label>Belgium Work Pattern</label>
          <select id="belgiumPattern">
            <option value="low">Low (1,000 EUR/month)</option>
            <option value="high">High (2,500 EUR/month)</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="hasDescendant" checked>
            1 Dependent Child
          </label>
        </div>

        <h3>Fiscal Overrides (What-If)</h3>
        <div class="form-group">
          <label for="retaOverride">RETA Monthly (EUR)</label>
          <input type="number" id="retaOverride" placeholder="428.40">
        </div>
        <div class="form-group">
          <label for="minimoPersonalOverride">Minimo Personal (EUR)</label>
          <input type="number" id="minimoPersonalOverride" placeholder="5550">
        </div>
      </div>

      <!-- Results pane (right) - live updating -->
      <div class="results-pane">
        <h3>Calculated Results</h3>
        <div id="liveResults">
          <!-- Populated by JavaScript -->
        </div>
      </div>
    </div>

    <footer class="dialog-footer">
      <button type="button" id="deleteBtn" class="danger-btn" onclick="confirmDeleteScenario()">Delete</button>
      <div class="spacer"></div>
      <button type="button" onclick="closeEditModal()">Cancel</button>
      <button type="submit" value="save" class="primary-btn">Save Changes</button>
    </footer>
  </form>
</dialog>
```

### Complete Scenario Card Rendering
```javascript
// Render all scenario cards sorted by leefgeld
function renderScenarioCards() {
  const container = document.getElementById('scenarioCards');
  const sorted = getSortedScenarios();

  container.innerHTML = sorted.map((scenario, index) => {
    const isOptimal = index === 0;
    const isSelected = scenarioState.selected.includes(scenario.id);
    const isCustom = !scenario.isPreset;

    return `
      <div class="scenario-card ${isOptimal ? 'optimal' : ''} ${isSelected ? 'selected' : ''} ${isCustom ? 'custom' : ''}"
           data-id="${scenario.id}">
        <div class="card-header">
          <input type="checkbox"
                 ${isSelected ? 'checked' : ''}
                 onchange="toggleScenarioSelection('${scenario.id}')"
                 aria-label="Select ${scenario.name} for comparison">
          <h3>${scenario.name}</h3>
          ${isOptimal ? '<span class="optimal-badge">Highest Leefgeld</span>' : ''}
        </div>

        <div class="card-metrics">
          <div class="metric">
            <span class="label">Revenue</span>
            <span class="value">${formatEUR(scenario.monthlyRevenue)}/mo</span>
          </div>
          <div class="metric">
            <span class="label">Expenses</span>
            <span class="value">${formatEUR(scenario.monthlyExpenses + (scenario.belgiumPattern === 'high' ? 2500 : 1000))}/mo</span>
          </div>
          <div class="metric">
            <span class="label">IRPF</span>
            <span class="value">${formatEUR(scenario.results.cuotaIntegra / 12)}/mo</span>
          </div>
          <div class="metric">
            <span class="label">RETA</span>
            <span class="value">${formatEUR(scenario.results.retaMonthly)}/mo</span>
          </div>
          <div class="metric highlight">
            <span class="label">Leefgeld</span>
            <span class="value">${formatEUR(scenario.results.leefgeld)}/mo</span>
          </div>
        </div>

        <button class="edit-btn" onclick="openEditModal('${scenario.id}')">
          Edit
        </button>
      </div>
    `;
  }).join('');
}
```

### Comparison Table Generation
```javascript
// Generate comparison table for selected scenarios
function renderComparisonTable() {
  const container = document.getElementById('comparisonTable');
  const selectedIds = scenarioState.selected;

  if (selectedIds.length === 0) {
    container.innerHTML = '<p class="empty-state">Select scenarios to compare</p>';
    return;
  }

  const scenarios = selectedIds.map(id => ({
    ...scenarioState.scenarios[id],
    results: calculateScenarioResults(scenarioState.scenarios[id])
  }));

  // Find optimal values for each metric
  const optimalLeefgeld = Math.max(...scenarios.map(s => s.results.leefgeld));
  const optimalEffRate = Math.min(...scenarios.map(s => s.results.effectiveRate));

  // Metric rows (full breakdown per CONTEXT.md)
  const metrics = [
    { label: 'Monthly Revenue', key: 'monthlyRevenue', format: formatEUR },
    { label: 'Monthly Expenses', key: (s) => s.monthlyExpenses + (s.belgiumPattern === 'high' ? 2500 : 1000), format: formatEUR },
    { label: '---', key: null },  // Divider
    { label: 'Annual Revenue', key: (s) => s.results.annualRevenue, format: formatEUR },
    { label: 'Total Deductible', key: (s) => s.results.totalDeductible, format: formatEUR },
    { label: 'Rendimiento Neto Previo', key: (s) => s.results.rendimientoNetoPrevio, format: formatEUR },
    { label: 'Gastos Dificil (5%)', key: (s) => s.results.gastosDificil, format: formatEUR },
    { label: 'Base Liquidable', key: (s) => s.results.baseLiquidable, format: formatEUR },
    { label: '---', key: null },
    { label: 'Minimo Personal', key: (s) => s.results.minimoPersonal, format: formatEUR },
    { label: 'Minimo Descendientes', key: (s) => s.results.minimoDescendientes, format: formatEUR },
    { label: 'Total Minimos', key: (s) => s.results.minimoTotal, format: formatEUR },
    { label: '---', key: null },
    { label: 'Cuota Integra (Annual IRPF)', key: (s) => s.results.cuotaIntegra, format: formatEUR },
    { label: 'RETA Annual', key: (s) => s.results.retaAnnual, format: formatEUR },
    { label: 'Effective Tax Rate', key: (s) => s.results.effectiveRate, format: formatPercent, isOptimalMin: true },
    { label: '---', key: null },
    { label: 'Net Annual', key: (s) => s.results.netAnnual, format: formatEUR },
    { label: 'Net Monthly', key: (s) => s.results.netMonthly, format: formatEUR },
    { label: 'Private Costs', key: (s) => s.results.privateCostsMonthly, format: formatEUR },
    { label: 'Leefgeld', key: (s) => s.results.leefgeld, format: formatEUR, isOptimalMax: true, highlight: true }
  ];

  let tableHtml = `
    <div class="comparison-container">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            ${scenarios.map(s => `<th>${s.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  metrics.forEach(metric => {
    if (metric.key === null) {
      // Divider row
      tableHtml += `<tr class="divider"><td colspan="${scenarios.length + 1}"></td></tr>`;
    } else {
      tableHtml += `<tr${metric.highlight ? ' class="highlight-row"' : ''}>`;
      tableHtml += `<td>${metric.label}</td>`;

      scenarios.forEach(s => {
        const value = typeof metric.key === 'function' ? metric.key(s) : s[metric.key];
        let cellClass = '';

        // Determine if this value is optimal
        if (metric.isOptimalMax && value === optimalLeefgeld) cellClass = 'optimal';
        if (metric.isOptimalMin && value === optimalEffRate) cellClass = 'optimal';

        tableHtml += `<td class="${cellClass}">${metric.format(value)}</td>`;
      });

      tableHtml += '</tr>';
    }
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHtml;
}
```

### Custom Scenario Creation
```javascript
// Create new custom scenario from template
function createCustomScenario(templateId) {
  const template = scenarioState.scenarios[templateId];
  if (!template) return null;

  const newScenario = {
    ...structuredClone(template),
    id: crypto.randomUUID(),
    name: '', // User must provide
    isPreset: false,
    fiscalOverrides: null
  };

  return newScenario;
}

// Add custom scenario to state
function addCustomScenario(scenario) {
  if (!scenario.name || !scenario.name.trim()) {
    alert('Please provide a name for the scenario');
    return false;
  }

  scenarioState.scenarios[scenario.id] = scenario;
  scenarioState.customOrder.push(scenario.id);
  saveScenarioState();
  renderScenarioCards();
  return true;
}

// Delete scenario with confirmation
function deleteScenario(scenarioId) {
  const scenario = scenarioState.scenarios[scenarioId];
  if (!scenario) return;

  if (scenario.isPreset) {
    alert('Cannot delete preset scenarios (A-E). You can only delete custom scenarios.');
    return;
  }

  if (confirm(`Delete "${scenario.name}"? This cannot be undone.`)) {
    delete scenarioState.scenarios[scenarioId];
    scenarioState.customOrder = scenarioState.customOrder.filter(id => id !== scenarioId);
    scenarioState.selected = scenarioState.selected.filter(id => id !== scenarioId);
    saveScenarioState();
    closeEditModal();
    renderScenarioCards();
    renderComparisonTable();
  }
}
```

### Dialog CSS Styling
```css
/* Dialog styling - Bloomberg-inspired dark theme */
dialog {
  background: #1a1a2e;
  color: #eaeaea;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 0;
  max-width: 900px;
  width: 90vw;
  max-height: 90vh;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.input-pane, .results-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results-pane {
  background: rgba(255,255,255,0.03);
  padding: 1rem;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.spacer {
  flex: 1;
}

.primary-btn {
  background: var(--accent);
  color: var(--bg);
  border: none;
}

.danger-btn {
  background: transparent;
  border: 1px solid #f87171;
  color: #f87171;
}
```

## Integration with Phases 1-2

Phase 3 reuses existing functionality:

```javascript
// From Phase 1: IRPF calculation with optional fiscal overrides
function calculateFullIRPFWithFiscal(monthlyRevenue, monthlyDeductible, hasDescendant, fiscal) {
  // Same logic as calculateFullIRPF but accepts fiscal parameter
  // Allows scenarios to override RETA, minimos, brackets for what-if analysis
  const config = fiscal || FISCAL_2025;

  const annualRevenue = monthlyRevenue * 12;
  const annualExpenses = monthlyDeductible * 12;
  const totalDeductible = annualExpenses + config.RETA_ANNUAL;
  // ... rest of calculation using config instead of FISCAL_2025 ...
}

// From Phase 2: Expense totals structure
// Phase 3 scenarios can EITHER use Phase 2's expense tracking
// OR use simplified monthlyExpenses + belgiumPattern

// Integration approach:
// - Preset scenarios use fixed expense values (SCEN-01, SCEN-02)
// - Custom scenarios can optionally link to Phase 2 expense data
// - Edit modal shows both approaches as options
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom modal divs with focus trap | Native `<dialog>` + `showModal()` | Baseline since March 2022 | Simpler, accessible by default |
| JavaScript carousel libraries | CSS scroll-snap | Widely supported | Better performance, touch-native |
| Manual deep cloning | structuredClone() | Native since 2022 | Handles all types correctly |
| setTimeout debounce | requestAnimationFrame | Long established | Synced with render cycle |

**Deprecated/outdated:**
- Custom focus trap implementations: Native dialog handles this
- Using `dialog.open = true`: Use `showModal()` method instead
- Using `-webkit-overflow-scrolling: touch`: Only for iOS Safari legacy

## Open Questions

Things that couldn't be fully resolved:

1. **Maximum number of custom scenarios**
   - What we know: localStorage has ~5MB limit; each scenario is ~500 bytes
   - What's unclear: At what point does rendering become slow?
   - Recommendation: Start without limit; add limit (~20) if performance degrades

2. **Fiscal override validation**
   - What we know: Users can override any fiscal constant for what-if
   - What's unclear: Should there be bounds (e.g., IRPF rate can't be 200%)?
   - Recommendation: Basic validation (non-negative), warn on unusual values, don't block

3. **Scenario card width on mobile**
   - What we know: Fixed 280px width works on desktop
   - What's unclear: Optimal width on small screens
   - Recommendation: Use min-width with percentage fallback; test on real devices

## Sources

### Primary (HIGH confidence)
- [MDN Dialog Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) - Native dialog API, accessibility, showModal()
- [CSS-Tricks Scroll Snapping](https://css-tricks.com/practical-css-scroll-snapping/) - Horizontal scroll patterns
- [Go Make Things Debouncing with rAF](https://gomakethings.com/debouncing-events-with-requestanimationframe-for-better-performance/) - requestAnimationFrame debounce
- [LogRocket localStorage Guide](https://blog.logrocket.com/localstorage-javascript-complete-guide/) - localStorage patterns, error handling
- Phase 1 RESEARCH.md - IRPF calculation methodology
- Phase 2 RESEARCH.md - Expense data structure, localStorage patterns

### Secondary (MEDIUM confidence)
- [CSS-Tricks No Focus Trap Needed](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/) - Updated focus trap guidance
- [Jared Cunha HTML Dialog UX](https://jaredcunha.com/blog/html-dialog-getting-accessibility-and-ux-right) - Dialog accessibility patterns
- [DEV Community Sticky Table](https://dev.to/lalitkhu/creating-a-scrollable-table-with-a-sticky-header-and-frozen-column-using-html-and-css-1d2a) - Sticky header CSS
- [Go Make Things Reactive Proxies](https://gomakethings.com/how-to-create-a-reactive-state-based-ui-component-with-vanilla-js-proxies/) - Reactive state patterns
- [Medium Vanilla JS State 2026](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de) - Modern state management trends

### Tertiary (LOW confidence)
- [Envato Tuts+ Scrolling Cards](https://webdesign.tutsplus.com/tutorials/horizontal-scrolling-card-ui-flexbox-and-css-grid--cms-41922) - Alternative card layouts

## Metadata

**Confidence breakdown:**
- Dialog pattern: HIGH - MDN documentation, native browser API
- Scroll snap: HIGH - Wide browser support, CSS-Tricks verified
- State management: HIGH - Consistent with Phase 2 patterns
- Comparison table: HIGH - Standard CSS sticky positioning
- Live recalculation: HIGH - requestAnimationFrame well-documented
- Integration with Phase 1: HIGH - Extends existing function

**Research date:** 2026-01-30
**Valid until:** 2026-07-01 (stable patterns, no external dependencies)

---

## Implementation Checklist for Planner

### SCEN-01: Pre-configure 5 Scenarios
- SCENARIO_PRESETS constant with A-E frozen objects
- Values from CLAUDE.md: A(3K), B(6K), C(9K), D(12K), E(18K)
- Each includes: monthlyRevenue, monthlyExpenses, belgiumPattern, hasDescendant
- isPreset: true flag for visual distinction and delete protection

### SCEN-02: Two Belgium Cost Patterns
- belgiumPattern: 'low' (1000) or 'high' (2500)
- A/B use 'low', C/D/E use 'high'
- Toggle in edit modal maps to amount
- Display pattern in card metrics

### SCEN-03: Custom Scenario Creation
- "+ New" button in scenario cards section
- Modal to select template (A-E or existing custom)
- Required: scenario name input
- Clone template with structuredClone(), assign new UUID
- Add to scenarioState.scenarios and customOrder
- Persist to localStorage

### SCEN-04: Live Editing with Auto-Recalculation
- Edit button on each card opens `<dialog>` with showModal()
- Split view: inputs (left), live results (right)
- requestAnimationFrame debounce on input events
- Results pane updates in real-time
- Save/Cancel/Delete buttons
- form method="dialog" for proper close handling

### SCEN-05: Side-by-Side Comparison Table
- Checkbox on each card for selection
- Table renders when selection.length > 0
- Full breakdown rows per CONTEXT.md (every calculation step)
- Sticky header row for vertical scrolling
- Auto-update when selection changes

### SCEN-06: Highlight Selected Scenarios
- .selected class on cards with border highlight
- Unchecked scenarios remain visible (not dimmed per CONTEXT.md - sort only)
- Comparison table shows only selected

### SCEN-07: Optimal Scenario Indication
- Sort scenarios by leefgeld (highest first) after every change
- First card in sorted order is optimal
- .optimal class for subtle background tint
- Badge "Highest Leefgeld" on optimal card
- In comparison table: .optimal class on best values

### From CONTEXT.md Decisions
- Horizontal card layout with CSS scroll-snap
- Bloomberg-inspired dark theme (consistent with Phases 1-2)
- Edit via modal (not inline)
- ALL values editable including fiscal data (fiscalOverrides object)
- Delete from both card (X icon) and edit modal
- Sticky header row in table (not sticky first column)
- Custom scenarios persist to localStorage (SCENARIO_STORAGE_KEY)
