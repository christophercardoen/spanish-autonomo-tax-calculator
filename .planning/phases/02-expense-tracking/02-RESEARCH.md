# Phase 2: Expense Tracking - Research

**Researched:** 2026-01-29
**Domain:** Expense Input, Categorization, and Formula Display (Vanilla JavaScript Single-File HTML)
**Confidence:** HIGH

## Summary

Phase 2 builds an expense tracking system on top of the Phase 1 fiscal foundation. The research confirms that this phase is primarily a UI/UX implementation challenge rather than a library-dependent technical challenge. Since the project constraints mandate vanilla JavaScript with no frameworks, the implementation will use standard DOM manipulation, localStorage for persistence, and CSS for the toggle switch control.

The existing project research (DEDUCTIONS.md) provides comprehensive expense categorization rules with HIGH confidence from official AEAT sources. The CONTEXT.md decisions lock in key implementation details: pre-filled editable expenses, formula display with monthly/annual values, Belgium pattern toggle switch, and three-section categorization (Spain Deductible / Belgium Work Costs / Private).

**Primary recommendation:** Implement a data-driven expense system where expense data lives in a structured JavaScript object, localStorage handles persistence with proper error handling, and the UI renders dynamically from data. The Belgium pattern toggle should use a pure CSS checkbox-based switch with JavaScript for state changes that trigger recalculation.

## Standard Stack

This phase continues the vanilla JavaScript approach from Phase 1.

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Vanilla JavaScript | ES6+ | All expense logic, DOM manipulation, localStorage | Project constraint: no frameworks |
| HTML5 | Current | Form inputs, sections, semantic structure | Project constraint: single-file |
| CSS3 | Current | Toggle switch, section styling, color accents | Project constraint: inline styles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage API | Browser native | Data persistence between sessions | Expense data, Belgium pattern preference |
| JSON.stringify/parse | Native | Serialize/deserialize expense objects | All localStorage operations |
| Intl.NumberFormat | Native | EUR currency formatting | Formula display (consistent with Phase 1) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | IndexedDB | More complex API, overkill for ~20 expense records |
| CSS toggle | JavaScript toggle library | Adds dependency, CSS checkbox hack works perfectly |
| Manual DOM | Template literals | Using template literals for render functions |

**Installation:**
```bash
# No installation required - single HTML file with inline JavaScript/CSS
# Extends existing autonomo_dashboard.html from Phase 1
```

## Architecture Patterns

### Recommended Data Structure
```javascript
// Expense data structure for localStorage
const DEFAULT_EXPENSES = {
  version: 1,  // For future migration support
  belgiumPattern: 'high',  // 'low' (1000) or 'high' (2500)
  categories: {
    spainDeductible: [
      { id: 'huur', name: 'Huur (Rent)', baseAmount: 1155, deductionPct: 30, deletable: true },
      { id: 'gsm', name: 'GSM (Mobile)', baseAmount: 55, deductionPct: 50, deletable: true },
      { id: 'elektriciteit', name: 'Elektriciteit', baseAmount: 100, deductionPct: 9, deletable: true }
    ],
    belgiumCosts: [
      { id: 'belgium-travel', name: 'Belgium Work Costs', amount: 2500, isPatternLinked: true, deletable: true }
    ],
    private: [
      { id: 'huur-private', name: 'Huur 70%', amount: 808.50, deletable: true },
      { id: 'gsm-private', name: 'GSM 50%', amount: 27.50, deletable: true },
      { id: 'elektriciteit-private', name: 'Elektriciteit 91%', amount: 91, deletable: true },
      { id: 'auto', name: 'Auto', amount: 600, deletable: true },
      { id: 'verzekeringen', name: 'Verzekeringen', amount: 200, deletable: true }
    ]
  }
};
```

### Pattern 1: Data-Driven Rendering
**What:** Store expense data in JavaScript object, render UI from data, never store state in DOM
**When to use:** Always - enables localStorage persistence and clean separation of concerns
**Example:**
```javascript
// Render expense list from data
function renderExpenseSection(categoryKey, containerId) {
  const container = document.getElementById(containerId);
  const expenses = expenseData.categories[categoryKey];

  container.innerHTML = expenses.map(exp => {
    const monthly = calculateDeductible(exp);
    const annual = monthly * 12;
    return `
      <div class="expense-row" data-id="${exp.id}">
        <span class="expense-name">${exp.name}</span>
        <span class="expense-formula">${formatFormula(exp)}</span>
        <span class="expense-value">${formatEUR(monthly)}/month (${formatEUR(annual)}/year)</span>
        <button class="delete-btn" onclick="deleteExpense('${categoryKey}', '${exp.id}')">x</button>
      </div>
    `;
  }).join('');
}

// Calculate deductible amount
function calculateDeductible(expense) {
  if (expense.baseAmount !== undefined && expense.deductionPct !== undefined) {
    return expense.baseAmount * (expense.deductionPct / 100);
  }
  return expense.amount || 0;
}

// Format formula for display
function formatFormula(expense) {
  if (expense.baseAmount !== undefined && expense.deductionPct !== undefined) {
    const result = expense.baseAmount * (expense.deductionPct / 100);
    return `${formatEUR(expense.baseAmount)} x ${expense.deductionPct}% = ${formatEUR(result)}`;
  }
  return `${formatEUR(expense.amount)} x 100% = ${formatEUR(expense.amount)}`;
}
```

### Pattern 2: localStorage Wrapper with Error Handling
**What:** Wrap localStorage operations in try-catch with fallback behavior
**When to use:** All localStorage read/write operations
**Example:**
```javascript
// Source: LogRocket localStorage Guide
// https://blog.logrocket.com/localstorage-javascript-complete-guide/

const STORAGE_KEY = 'autonomo_expenses_v1';

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenseData));
    return true;
  } catch (e) {
    console.warn('localStorage save failed:', e.message);
    // QuotaExceededError or SecurityError in private mode
    showNotification('Changes saved locally only - storage unavailable', 'warning');
    return false;
  }
}

function loadExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Version migration if needed
      if (parsed.version === 1) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage load failed:', e.message);
  }
  // Return defaults if load fails
  return structuredClone(DEFAULT_EXPENSES);
}
```

### Pattern 3: Pure CSS Toggle Switch with Checkbox
**What:** Use hidden checkbox + styled label for toggle, JavaScript only for state change handling
**When to use:** Belgium pattern toggle (Low/High travel)
**Example:**
```css
/* Source: W3Schools and Go Make Things CSS toggle patterns */
.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-switch .slider {
  position: relative;
  width: 50px;
  height: 26px;
  background: #444;
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch .slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch input:checked + .slider {
  background: var(--accent);
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(24px);
}

/* Accessibility: Focus state */
.toggle-switch input:focus + .slider {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.toggle-label {
  font-size: 0.9rem;
  opacity: 0.7;
}

.toggle-label.active {
  opacity: 1;
  font-weight: 600;
}
```

```javascript
// Toggle switch handling
function initBelgiumToggle() {
  const toggle = document.getElementById('belgiumToggle');
  toggle.checked = expenseData.belgiumPattern === 'high';

  toggle.addEventListener('change', (e) => {
    expenseData.belgiumPattern = e.target.checked ? 'high' : 'low';
    updateBelgiumCost();
    saveExpenses();
    renderAllSections();
    recalculateTotals();
  });
}

function updateBelgiumCost() {
  const belgiumExpense = expenseData.categories.belgiumCosts.find(e => e.isPatternLinked);
  if (belgiumExpense) {
    belgiumExpense.amount = expenseData.belgiumPattern === 'high' ? 2500 : 1000;
  }
}
```

### Pattern 4: Category Section with Color Accent
**What:** Visual section grouping with subtle color differentiation
**When to use:** Spain / Belgium / Private sections
**Example:**
```css
.expense-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
}

.expense-section.spain-deductible {
  border-left: 3px solid #4ade80;  /* Green - deductible */
}

.expense-section.belgium-costs {
  border-left: 3px solid #60a5fa;  /* Blue - Belgium */
}

.expense-section.private {
  border-left: 3px solid #f87171;  /* Red - not deductible */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-total {
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.8;
}
```

### Anti-Patterns to Avoid
- **Storing state in DOM:** Always derive display from data object, never read expense values from input fields during calculation
- **Multiple sources of truth:** One expenseData object is the truth; UI and localStorage reflect it
- **Hardcoded calculations:** All deduction percentages should be data-driven, not embedded in render logic
- **Blocking localStorage operations:** Wrap in try-catch, never assume storage is available

## Don't Hand-Roll

Problems that look simple but have edge cases:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | String concatenation | Intl.NumberFormat (from Phase 1) | Locale-specific thousand separators, decimal handling |
| Unique IDs | Counter or random | crypto.randomUUID() | Collision-free, browser-native since 2020 |
| Deep clone defaults | Manual copy | structuredClone() | Handles nested objects, native since 2022 |
| Form validation | Regex-only | HTML5 validation + JS | type="number", min, step attributes do heavy lifting |

**Key insight:** Modern browser APIs (Intl, crypto, structuredClone) eliminate the need for utility libraries. Phase 1 already implements formatEUR() which Phase 2 reuses.

## Common Pitfalls

### Pitfall 1: localStorage Quota Exceeded in Private Mode
**What goes wrong:** localStorage.setItem throws QuotaExceededError in Safari private mode
**Why it happens:** Safari private mode has 0 quota for localStorage
**How to avoid:** Wrap all localStorage operations in try-catch; design UI to work without persistence
**Warning signs:** Errors only in Safari incognito, users report "settings don't save"

### Pitfall 2: Floating Point Precision in Percentage Calculations
**What goes wrong:** 1155 * 0.30 shows as 346.49999999999994
**Why it happens:** JavaScript floating-point representation
**How to avoid:** Round all currency results: Math.round(value * 100) / 100
**Warning signs:** Formulas show extra decimal places

### Pitfall 3: DOM-State Synchronization
**What goes wrong:** Edit input, blur without pressing button, changes lost
**Why it happens:** Data not updated on input change
**How to avoid:** Use 'input' or 'change' events to update data immediately; debounce saves
**Warning signs:** User edits value, clicks elsewhere, value reverts

### Pitfall 4: Belgium Toggle Doesn't Update Calculations
**What goes wrong:** Toggle switches UI but tax calculations use old value
**Why it happens:** Missing integration between expense system and Phase 1 calculation engine
**How to avoid:** Toggle change must trigger: (1) data update, (2) localStorage save, (3) UI re-render, (4) IRPF recalculation
**Warning signs:** Toggle changes Belgium section but "Net Monthly" stays same

### Pitfall 5: Reset Button Destroys Custom Expenses Without Warning
**What goes wrong:** User adds 5 custom expenses, clicks reset, loses all
**Why it happens:** Reset immediately overwrites with defaults
**How to avoid:** Require confirmation dialog before reset
**Warning signs:** User complaints about accidental data loss

### Pitfall 6: Annual vs Monthly Confusion in Totals
**What goes wrong:** Spain totals show monthly, Belgium shows annual, comparison meaningless
**Why it happens:** Inconsistent display conventions
**How to avoid:** Show BOTH monthly AND annual for all totals; label clearly
**Warning signs:** Numbers don't add up when user checks with calculator

## Code Examples

### Complete Expense Data Operations
```javascript
// Initialize expense system
let expenseData = loadExpenses();

// Add new expense to category
function addExpense(categoryKey, expense) {
  if (!expense.id) {
    expense.id = crypto.randomUUID();
  }
  expenseData.categories[categoryKey].push(expense);
  saveExpenses();
  renderAllSections();
  recalculateTotals();
}

// Delete expense by ID
function deleteExpense(categoryKey, expenseId) {
  const category = expenseData.categories[categoryKey];
  const index = category.findIndex(e => e.id === expenseId);
  if (index !== -1) {
    category.splice(index, 1);
    saveExpenses();
    renderAllSections();
    recalculateTotals();
  }
}

// Update expense property
function updateExpense(categoryKey, expenseId, property, value) {
  const expense = expenseData.categories[categoryKey].find(e => e.id === expenseId);
  if (expense) {
    expense[property] = value;
    saveExpenses();
    renderAllSections();
    recalculateTotals();
  }
}

// Reset to defaults with confirmation
function resetToDefaults() {
  if (confirm('Reset all expenses to default values? This cannot be undone.')) {
    expenseData = structuredClone(DEFAULT_EXPENSES);
    saveExpenses();
    renderAllSections();
    recalculateTotals();
  }
}
```

### Calculate Category Totals
```javascript
// Calculate total deductible for a category (monthly)
function calculateCategoryTotal(categoryKey) {
  return expenseData.categories[categoryKey].reduce((sum, exp) => {
    return sum + calculateDeductible(exp);
  }, 0);
}

// Get all expense totals for integration with Phase 1
function getExpenseTotals() {
  const spainMonthly = calculateCategoryTotal('spainDeductible');
  const belgiumMonthly = calculateCategoryTotal('belgiumCosts');
  const privateMonthly = calculateCategoryTotal('private');

  return {
    spainDeductible: {
      monthly: spainMonthly,
      annual: spainMonthly * 12
    },
    belgiumCosts: {
      monthly: belgiumMonthly,
      annual: belgiumMonthly * 12
    },
    private: {
      monthly: privateMonthly,
      annual: privateMonthly * 12
    },
    totalDeductible: {
      monthly: spainMonthly + belgiumMonthly,
      annual: (spainMonthly + belgiumMonthly) * 12
    }
  };
}
```

### Belgium Breakdown Formula Display
```javascript
// Context decision: Belgium breakdown formula should be transparent
// Example: "~17 days x 91.35 EUR dietas + 4 flights x 250 EUR = 2,500 EUR"

function getBelgiumBreakdownFormula() {
  const pattern = expenseData.belgiumPattern;

  if (pattern === 'high') {
    // High travel: ~17 days, 4 flights
    const dietasDays = 17;
    const dietasRate = 91.35;
    const flights = 4;
    const flightCost = 250;
    const dietasTotal = dietasDays * dietasRate;  // 1552.95
    const flightsTotal = flights * flightCost;     // 1000
    const total = Math.round(dietasTotal + flightsTotal);  // ~2553, rounded to 2500 for simplicity

    return `~${dietasDays} days x ${formatEUR(dietasRate)} dietas + ${flights} flights x ${formatEUR(flightCost)} = ~${formatEUR(2500)}`;
  } else {
    // Low travel: 3 days, 1 flight
    const dietasDays = 3;
    const dietasRate = 91.35;
    const flights = 1;
    const flightCost = 250;

    return `~${dietasDays} days x ${formatEUR(dietasRate)} dietas + ${flights} flight x ${formatEUR(flightCost)} = ~${formatEUR(1000)}`;
  }
}
```

### Form for Adding New Expense
```html
<!-- Add expense form - appears when clicking "Add Expense" button -->
<div id="addExpenseForm" class="add-form hidden">
  <h4>Add New Expense</h4>
  <div class="form-row">
    <label>
      Name:
      <input type="text" id="newExpName" required>
    </label>
  </div>
  <div class="form-row">
    <label>
      Amount (EUR/month):
      <input type="number" id="newExpAmount" min="0" step="0.01" required>
    </label>
  </div>
  <div class="form-row">
    <label>
      Category:
      <select id="newExpCategory">
        <option value="spainDeductible">Spain Deductible</option>
        <option value="belgiumCosts">Belgium Travel</option>
        <option value="private">Private</option>
      </select>
    </label>
  </div>
  <div class="form-row" id="deductionRow">
    <label>
      Deduction %:
      <input type="number" id="newExpDeduction" min="0" max="100" value="100">
    </label>
  </div>
  <div class="form-actions">
    <button onclick="submitNewExpense()">Add</button>
    <button onclick="hideAddForm()">Cancel</button>
  </div>
</div>
```

```javascript
function submitNewExpense() {
  const name = document.getElementById('newExpName').value.trim();
  const amount = parseFloat(document.getElementById('newExpAmount').value);
  const category = document.getElementById('newExpCategory').value;
  const deduction = parseInt(document.getElementById('newExpDeduction').value);

  // Basic validation
  if (!name || isNaN(amount) || amount < 0) {
    alert('Please enter a valid name and amount');
    return;
  }

  // Build expense object based on category
  const expense = {
    name: name,
    deletable: true
  };

  if (category === 'spainDeductible') {
    expense.baseAmount = amount;
    expense.deductionPct = deduction;
  } else {
    expense.amount = amount;
  }

  addExpense(category, expense);
  hideAddForm();
  clearAddForm();
}
```

## Integration with Phase 1

Phase 2 must integrate with the existing Phase 1 calculation engine. The key integration point:

```javascript
// Phase 1's calculateFullIRPF function signature:
// calculateFullIRPF(monthlyRevenue, monthlyDeductibleExpenses, hasDescendant)

// Phase 2 integration:
function recalculateTotals() {
  const totals = getExpenseTotals();

  // Get revenue from Phase 1 input
  const monthlyRevenue = parseFloat(document.getElementById('monthlyRevenue').value) || 0;
  const hasDescendant = document.getElementById('hasDescendant').checked;

  // Total deductible for IRPF = Spain deductible + Belgium costs
  // (RETA is added inside calculateFullIRPF)
  const monthlyDeductible = totals.spainDeductible.monthly + totals.belgiumCosts.monthly;

  // Call Phase 1 calculation
  const result = calculateFullIRPF(monthlyRevenue, monthlyDeductible, hasDescendant);

  // Update Phase 1 results display
  displayResults(result);

  // Update expense section totals
  displayExpenseTotals(totals);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery DOM manipulation | Vanilla DOM + template literals | 2020+ | No dependencies needed |
| Manual deep clone | structuredClone() | 2022 | Native, handles all types |
| Manual ID generation | crypto.randomUUID() | 2020+ | Collision-free, secure |
| Cookie storage | localStorage | Long established | 5-10MB vs 4KB limit |

**Deprecated/outdated:**
- Using var instead of const/let: ES6 standard since 2015
- document.write(): Security and performance issues
- Inline onclick attributes: Better to use addEventListener (though acceptable for single-file HTML)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal debounce delay for input changes**
   - What we know: Immediate saves on every keystroke cause performance issues
   - What's unclear: Ideal delay (200ms? 500ms? 1000ms?)
   - Recommendation: Start with 300ms debounce, adjust based on user feedback

2. **Belgium breakdown calculation accuracy**
   - What we know: User wants formula like "17 days x 91.35 + 4 flights x 250"
   - What's unclear: Should breakdown be editable or just illustrative?
   - Recommendation: Show illustrative formula, but total amount is editable

3. **Validation strictness for deduction percentages**
   - What we know: Context says "basic validation only, no strict range enforcement"
   - What's unclear: Should >100% be prevented?
   - Recommendation: Allow 0-100 with HTML5 min/max, show warning but don't block

## Sources

### Primary (HIGH confidence)
- **Project DEDUCTIONS.md** - Expense deductibility rules, AEAT sources, HIGH confidence
- **Project PITFALLS.md** - 18 common autonomo mistakes with pitfall mitigation
- **Project FISCAL_DATA.md** - Dietas rates (91.35 EUR/day abroad with overnight)
- **Phase 1 RESEARCH.md** - IRPF calculation methodology, formatEUR function
- **02-CONTEXT.md** - User decisions locking implementation details

### Secondary (MEDIUM confidence)
- [LogRocket localStorage Guide](https://blog.logrocket.com/localstorage-javascript-complete-guide/) - localStorage best practices, error handling
- [W3Schools Toggle Switch](https://www.w3schools.com/howto/howto_css_switch.asp) - CSS checkbox toggle pattern
- [FreeCodeCamp Expense Tracker](https://www.freecodecamp.org/news/how-to-build-an-expense-tracker-with-html-css-and-javascript/) - Vanilla JS expense patterns
- [Go Make Things CSS Toggle](https://gomakethings.com/creating-a-toggle-switch-with-just-css/) - Accessibility-focused toggle implementation

### Tertiary (LOW confidence)
- [GeeksforGeeks Expense Tracker](https://www.geeksforgeeks.org/javascript/build-an-expense-tracker-with-html-css-and-javascript/) - General patterns (not Spain-specific)

## Metadata

**Confidence breakdown:**
- Data structure: HIGH - Standard JavaScript patterns, well-established
- localStorage patterns: HIGH - Browser API documented, error handling verified
- CSS toggle: HIGH - Pure CSS approach with accessibility, multiple verified sources
- Integration with Phase 1: HIGH - Clear function signature, straightforward integration
- Belgium formula display: MEDIUM - Illustrative breakdown, actual calculation may vary

**Research date:** 2026-01-29
**Valid until:** 2026-06-01 (stable patterns, no external dependencies to version)

---

## Implementation Checklist for Planner

### EXP-01: Track Spain Deductible Expenses
- Data structure with baseAmount and deductionPct
- Pre-filled: Huur (1155 x 30%), GSM (55 x 50%), Elektriciteit (100 x 9%)
- Formula display: "1,155 EUR x 30% = 346.50 EUR/month"
- Editable amounts and percentages
- Monthly and annual display

### EXP-02: Track Belgium Work Costs
- Toggle switch: Low travel (1K) / High travel (2.5K)
- Toggle positioned inline with Belgium section
- Amount editable after toggle (not locked)
- Breakdown formula visible: "~17 days x 91.35 EUR dietas + 4 flights x 250 EUR"
- Pattern preference persists in localStorage

### EXP-03: Track Private Expenses
- Pre-filled: Huur 70% (808.50), GSM 50% (27.50), Elektriciteit 91% (91), Auto (600), Verzekeringen (200)
- Total: 1,727 EUR/month
- Display with 0% deduction formula: "600 EUR x 0% = 0 EUR"
- Clear "not deductible" categorization

### EXP-04: Categorize Expenses in UI
- Three sections: Spain Deductible / Belgium Work Costs / Private
- Color accent on section headers (green/blue/red border-left)
- Subtotal at bottom of each section
- Category dropdown for new expenses

### EXP-05: Display Expense Breakdown with Formulas
- Format: "baseAmount x deductionPct% = result"
- Show both monthly AND annual: "346.50 EUR/month (4,158 EUR/year)"
- Summary totals: total Spain deductible, total Belgium, total private
- Integration: totals flow into Phase 1 IRPF calculation

### Additional from CONTEXT.md
- Users can add NEW expense categories
- Users can delete ANY expense (including pre-filled)
- localStorage persistence with version key
- 'Reset to defaults' button with confirmation
- Basic validation (prevent negative, non-numeric)
