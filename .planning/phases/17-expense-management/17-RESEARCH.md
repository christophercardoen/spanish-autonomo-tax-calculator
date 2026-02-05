# Phase 17: Expense Management - Research

**Researched:** 2026-02-05
**Domain:** Expense tracking with entity-type-aware Spanish fiscal deduction rules, receipt OCR, calendar linking
**Confidence:** HIGH (fiscal rules from official AEAT sources, architecture from existing codebase patterns)

## Summary

Phase 17 replaces the existing localStorage-based expense system (v1) with a full IndexedDB-backed expense manager that integrates with the existing `db.expenses` and `db.receipts` tables already defined in the Dexie schema. The system must support two distinct deduction rule sets: Autonomo (IRPF - estimacion directa simplificada) and Sociedad Limitada (Impuesto de Sociedades), with entity-type polymorphism routing deduction logic based on `EntityContext.current.type`.

The core technical challenge is building an expense CRUD system that follows the established Manager pattern (see ClientManager, ProjectManager, CalendarManager), integrates with existing infrastructure (MoneyUtils, DataManager.softDelete, SyncQueue, auditFields, EntityContext), and enforces fiscal validation rules inline. Receipt OCR via Tesseract.js loaded from CDN provides optional auto-population of expense fields from uploaded images.

Calendar linking connects expenses to specific dates in `calendar_days` via the existing `[entity_id+date]` compound index on the expenses table, enabling the Phase 16 placeholder `getLinkedExpenseCount()` and `getLinkedExpenseCounts()` to return real data.

**Primary recommendation:** Build an `ExpenseManager` object following the ProjectManager pattern, with an `ExpenseCategoryRules` config object that branches on `EntityContext.current.type` to return the correct deduction percentages and validation rules per category.

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie.js | v4.x | IndexedDB ORM | Already loaded via CDN, `db.expenses` and `db.receipts` tables defined |
| currency.js | (loaded) | Cent conversion | Already used by MoneyUtils for eurosToCents/centsToEuros |

### New Addition
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tesseract.js | v5.x | Browser OCR for receipts | Pure JS, CDN-loadable, no server needed, runs entirely client-side |

**CDN for Tesseract.js:**
```html
<script src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'></script>
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tesseract.js (client-side OCR) | Cloud OCR API (Google Vision, AWS Textract) | Cloud is more accurate but requires API keys, server calls, costs money, and sends user receipts off-device. Tesseract.js keeps everything local (privacy win). |
| Tesseract.js | No OCR (manual entry only) | Could skip OCR entirely for v1 of Phase 17 and add it as an enhancement. Manual entry works fine without it. |

**Recommendation:** Load Tesseract.js lazily (only when user clicks "Scan Receipt") to avoid blocking initial page load. The WASM file is ~5MB and language data ~4MB. Use `Tesseract.createWorker('eng+spa')` for English and Spanish receipt support.

## Architecture Patterns

### Recommended Structure (within single-file HTML)

The expense system fits into the existing code organization:

```
// Already exists:
// - AppDatabase with db.expenses and db.receipts tables
// - MoneyUtils, DataManager, SyncQueue, auditFields
// - EntityContext, ENTITY_TYPE constants
// - CalendarManager with getLinkedExpenseCount/getCounts placeholders

// Phase 17 adds:
// 1. EXPENSE_CATEGORY constant (frozen object with rules per entity type)
// 2. ExpenseManager (CRUD, follows ProjectManager pattern)
// 3. ReceiptManager (OCR + file storage in receipts table)
// 4. ExpenseUI (rendering, form handling, filters)
// 5. Update CalendarManager integration (real expense counts)
```

### Pattern 1: Entity-Type-Aware Category Rules

**What:** A frozen configuration object that defines expense categories with different deduction rules per entity type (autonomo vs SL).

**When to use:** Any time deduction percentage, limit, or validation depends on whether the current entity is an autonomo or SL.

**Example:**
```javascript
const EXPENSE_CATEGORY = Object.freeze({
  HOME_OFFICE: {
    key: 'home_office',
    label: 'Home Office',
    subcategories: ['rent', 'electricity', 'water', 'gas', 'internet'],
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'proportional', // base * (business_m2 / total_m2) * 30%
        max_proportion: 0.30,  // 30% cap on proportion
        requires_modelo_036: true,
        iva_deductible: false
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full_if_justified', // 100% if properly justified
        max_proportion: 1.0,
        requires_modelo_036: false,
        iva_deductible: true
      }
    }
  },
  GSM: {
    key: 'gsm',
    label: 'Mobile / Telephone',
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'percentage',
        default_percentage: 50, // 50% typical, 100% if separate business line
        requires_separate_line: false, // recommended but not required
        iva_deductible_pct: 50
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'percentage',
        default_percentage: 100,
        requires_separate_line: false,
        iva_deductible_pct: 100
      }
    }
  },
  VEHICLE: {
    key: 'vehicle',
    label: 'Vehicle',
    subcategories: ['fuel', 'insurance', 'maintenance', 'parking', 'tolls', 'depreciation'],
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'percentage',
        default_percentage: 0, // Typically not deductible unless exclusive use proven
        iva_deductible_pct: 50, // 50% IVA is common accepted practice
        note: 'Must prove exclusive business use for IRPF deduction'
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full_if_justified',
        default_percentage: 100, // If vehicle is company asset
        iva_deductible_pct: 100,
        note: 'Must be in company name. Mixed use = retribucion en especie'
      }
    }
  },
  MEALS_DIETAS: {
    key: 'meals_dietas',
    label: 'Meals / Dietas',
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'dietas_limit',
        limits: {
          spain_no_overnight: 2667,      // 26.67 EUR in cents
          spain_with_overnight: 5334,    // 53.34 EUR
          abroad_no_overnight: 4808,     // 48.08 EUR
          abroad_with_overnight: 9135    // 91.35 EUR
        },
        requires_electronic_payment: true,
        requires_different_municipality: true,
        max_continuous_months: 9
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full_if_justified',
        default_percentage: 100,
        representation_limit_pct: 1, // 1% of net revenue for client entertainment
        requires_electronic_payment: false // recommended but not legally required
      }
    }
  },
  TRAVEL: {
    key: 'travel',
    label: 'Travel (Flights, Hotels, Transport)',
    subcategories: ['flights', 'hotels', 'local_transport', 'mileage'],
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'full_if_justified',
        default_percentage: 100,
        hotel_iva_recovery: 'modelo_360', // Belgian IVA not direct deductible
        flight_iva: 'exempt', // International flights = 0% IVA
        mileage_rate_cents: 26 // 0.26 EUR/km
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full_if_justified',
        default_percentage: 100,
        hotel_iva_recovery: 'modelo_360',
        flight_iva: 'exempt',
        mileage_rate_cents: 26
      }
    }
  },
  IT_SOFTWARE: {
    key: 'it_software',
    label: 'IT / Software / Equipment',
    subcategories: ['software_subscriptions', 'hardware', 'cloud_hosting', 'domains'],
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'full',
        default_percentage: 100,
        depreciation_group: 5, // 26% max, 10 years
        depreciation_rate: 26
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full',
        default_percentage: 100,
        depreciation_group: 5,
        depreciation_rate: 26
      }
    }
  },
  OFFICE_SUPPLIES: {
    key: 'office_supplies',
    label: 'Office Supplies',
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'full',
        default_percentage: 100
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full',
        default_percentage: 100
      }
    }
  },
  PROFESSIONAL_SERVICES: {
    key: 'professional_services',
    label: 'Professional Services (Gestor, Lawyer)',
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'full',
        default_percentage: 100
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full',
        default_percentage: 100
      }
    }
  },
  TRAINING: {
    key: 'training',
    label: 'Training / Education',
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        deduction_method: 'full',
        default_percentage: 100
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'full',
        default_percentage: 100
      }
    }
  },
  DEPRECIATION: {
    key: 'depreciation',
    label: 'Asset Depreciation',
    sl_only: true, // Only meaningful for SL (autonomo uses simplified table per-asset)
    rules: {
      [ENTITY_TYPE.AUTONOMO]: {
        note: 'Use simplified amortization table (Grupo 1-10). Applied per-asset, not as separate expense.'
      },
      [ENTITY_TYPE.SOCIEDAD_LIMITADA]: {
        deduction_method: 'amortization_table',
        tables: 'LIS Art. 12 tables',
        note: 'Use IS amortization tables. Accelerated amortization available for PYME.'
      }
    }
  }
});
```

### Pattern 2: ExpenseManager Following ProjectManager Pattern

**What:** A singleton object with async CRUD methods, entity-scoped via EntityContext, using DataManager.softDelete for deletion.

**Example:**
```javascript
const ExpenseManager = {
  async createExpense(expenseData) {
    const entityId = EntityContext.entityId;
    if (!entityId) throw new Error('No entity selected');

    const entity = EntityContext.current;
    const categoryRules = EXPENSE_CATEGORY[expenseData.category]?.rules[entity.type];

    // Calculate deductible amount based on category rules
    const deductibleCents = this.calculateDeductible(
      expenseData.amount_cents,
      expenseData.category,
      entity.type,
      expenseData.metadata
    );

    const normalized = {
      entity_id: entityId,
      category: expenseData.category,
      subcategory: expenseData.subcategory || null,
      vendor: expenseData.vendor?.trim() || null,
      date: expenseData.date, // YYYY-MM-DD for calendar linking
      amount_cents: expenseData.amount_cents,
      iva_cents: expenseData.iva_cents || 0,
      deductible_amount_cents: deductibleCents,
      description: expenseData.description?.trim() || null,
      is_billable: expenseData.is_billable || false,
      client_id: expenseData.client_id || null,
      project_id: expenseData.project_id || null,
      receipt_id: expenseData.receipt_id || null,
      // Extended fields (stored but not indexed)
      destination: expenseData.destination || null,
      trip_start_date: expenseData.trip_start_date || null,
      trip_end_date: expenseData.trip_end_date || null,
      has_overnight: expenseData.has_overnight || false,
      payment_method: expenseData.payment_method || null,
      deleted_at: null,
      ...auditFields(true)
    };

    const id = await db.expenses.add(normalized);
    await SyncQueue.queueChange('expenses', id, 'CREATE', normalized);
    return id;
  },

  calculateDeductible(amountCents, category, entityType, metadata = {}) {
    const rules = EXPENSE_CATEGORY[category]?.rules[entityType];
    if (!rules) return amountCents; // Default: fully deductible

    switch (rules.deduction_method) {
      case 'full':
        return amountCents;
      case 'percentage':
        return MoneyUtils.roundCents(amountCents * (rules.default_percentage / 100));
      case 'proportional':
        const proportion = metadata.business_proportion || rules.max_proportion;
        return MoneyUtils.roundCents(amountCents * proportion * rules.max_proportion);
      case 'dietas_limit':
        return this.calculateDietasDeductible(amountCents, rules, metadata);
      case 'full_if_justified':
        return amountCents;
      default:
        return amountCents;
    }
  },

  calculateDietasDeductible(amountCents, rules, metadata) {
    const isAbroad = metadata.destination && metadata.destination !== 'ES';
    const hasOvernight = metadata.has_overnight;

    let limitCents;
    if (isAbroad) {
      limitCents = hasOvernight ? rules.limits.abroad_with_overnight : rules.limits.abroad_no_overnight;
    } else {
      limitCents = hasOvernight ? rules.limits.spain_with_overnight : rules.limits.spain_no_overnight;
    }

    return Math.min(amountCents, limitCents);
  },

  // ... getExpenses, getExpense, updateExpense, archiveExpense
  // follow same pattern as ProjectManager
};
```

### Pattern 3: Receipt OCR with Lazy-Loaded Tesseract.js

**What:** Load Tesseract.js only when user initiates receipt scanning. Store receipt image as base64 in IndexedDB.

**Example:**
```javascript
const ReceiptManager = {
  _worker: null,

  async getWorker() {
    if (!this._worker) {
      // Lazy load Tesseract.js
      if (!window.Tesseract) {
        await this._loadScript(
          'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
        );
      }
      this._worker = await Tesseract.createWorker('eng+spa');
    }
    return this._worker;
  },

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  async scanReceipt(imageFile) {
    const worker = await this.getWorker();
    const result = await worker.recognize(imageFile);
    const text = result.data.text;
    return this.parseReceiptText(text);
  },

  parseReceiptText(text) {
    const lines = text.split('\n').filter(l => l.trim());
    // Vendor: typically first non-empty line
    const vendor = lines[0]?.trim() || '';
    // Date: look for common date patterns
    const dateMatch = text.match(/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);
    let date = null;
    if (dateMatch) {
      // Normalize to YYYY-MM-DD
      const [, d, m, y] = dateMatch;
      const year = y.length === 2 ? '20' + y : y;
      date = `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    // Total: look for TOTAL, IMPORTE, or last currency amount
    const totalMatch = text.match(/(?:total|importe|amount)[:\s]*[€$]?\s*([\d.,]+)/i);
    const amount = totalMatch ? parseFloat(totalMatch[1].replace(',', '.')) : null;

    return {
      vendor,
      date,
      amount_euros: amount,
      raw_text: text,
      confidence: result.data.confidence
    };
  },

  async storeReceipt(expenseId, file) {
    const reader = new FileReader();
    const fileData = await new Promise((resolve) => {
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    const receiptId = await db.receipts.add({
      expense_id: expenseId,
      file_name: file.name,
      file_type: file.type,
      file_data: fileData, // base64
      ocr_status: 'pending',
      ocr_confidence: null,
      ocr_extracted: null,
      created_at: new Date().toISOString()
    });

    return receiptId;
  }
};
```

### Pattern 4: Expense-Calendar Linking

**What:** Expenses link to calendar days via their `date` field matching `calendar_days.date`. The existing CalendarManager methods already query `db.expenses` by `[entity_id+date]`.

**Key insight:** No additional linking table is needed. The `date` field on expenses IS the link. CalendarManager.getLinkedExpenseCount() and getLinkedExpenseCounts() already contain the correct query logic -- they just need the expenses table to have data.

For travel expenses spanning multiple days (EXPENSE-10), store `trip_start_date` and `trip_end_date` as additional fields. When displaying, query expenses where `date` falls within the trip range OR where `trip_start_date <= dayDate <= trip_end_date`.

### Anti-Patterns to Avoid

- **Do NOT create a separate expense-calendar junction table:** The `date` field on expenses already provides the link. CalendarManager already queries this.
- **Do NOT hardcode deduction percentages in business logic:** Put ALL percentages in the `EXPENSE_CATEGORY` config. Business logic reads from config.
- **Do NOT use localStorage for new expense data:** Phase 12 established IndexedDB via Dexie as the data layer. The v1 localStorage expenses are a legacy system.
- **Do NOT skip SyncQueue:** Every create/update/delete must queue for eventual cloud sync.
- **Do NOT store amounts in euros:** All monetary values are integer cents (decision [12-01]).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Receipt OCR | Custom image processing | Tesseract.js v5 via CDN | Handles languages, image quality, WASM optimization |
| Currency math | Float arithmetic | MoneyUtils (already exists) | Banker's rounding, cent conversion, proper formatting |
| Soft delete | Custom deletion logic | DataManager.softDelete (already exists) | 30-day restore window, 4-year retention, sync queue |
| Entity scoping | Manual entity_id filtering | EntityContext.entityId (already exists) | Consistent with all other managers |
| Receipt text parsing | Complex NLP | Simple regex patterns | Receipts are structured enough for regex; NLP is overkill |
| Date formatting | Manual string manipulation | Existing `toISOString().split('T')[0]` pattern | Used throughout codebase |

**Key insight:** 90% of the infrastructure exists. ExpenseManager is essentially ProjectManager with different fields and added fiscal validation rules.

## Common Pitfalls

### Pitfall 1: Gastos Dificil Justificacion Double Application
**What goes wrong:** Adding gastos dificil as an expense category AND applying the 5% automatic deduction in IRPF calculation.
**Why it happens:** The 5% gastos dificil justificacion is already calculated in the IRPF engine (Phase 1). It is NOT a user-entered expense -- it is an automatic deduction on net profit.
**How to avoid:** Do NOT include gastos dificil as an expense category. It belongs in the tax calculation, not the expense tracker. The existing `calculateIRPF()` already handles this.
**Warning signs:** If total deductions seem higher than expected, check for double-counting.

### Pitfall 2: Dietas Validation Without Calendar Context
**What goes wrong:** Validating dietas limits per expense without knowing if the day has overnight stay or if it's abroad.
**Why it happens:** A meal expense on its own doesn't contain enough context. You need the linked calendar day to know location (Belgium vs Spain) and whether there's an overnight stay.
**How to avoid:** When creating a meal/dietas expense, require either explicit metadata (destination, has_overnight) OR link to a calendar day and derive context from the calendar day's location.
**Warning signs:** Dietas validation returning wrong limits.

### Pitfall 3: Receipt Storage Bloating IndexedDB
**What goes wrong:** Storing high-resolution receipt images as base64 in IndexedDB causes storage quota issues.
**Why it happens:** A 5MB photo becomes ~6.7MB as base64. Multiple receipts quickly consume the ~50MB-500MB IndexedDB quota.
**How to avoid:** Resize/compress receipt images before storage (target max 1024px width, JPEG quality 0.7). This typically reduces a 5MB photo to ~200KB.
**Warning signs:** QuotaExceededError when adding receipts.

### Pitfall 4: Breaking the v1 Expense Tab
**What goes wrong:** The new IndexedDB-based expense system conflicts with the existing localStorage-based v1 expense sections (spainDeductible, workTravel, private).
**Why it happens:** The v1 system renders expense sections from `expenseData` loaded from localStorage. Phase 17 needs to either migrate this or run alongside it.
**How to avoid:** Phase 17 should build the new expense system as a separate section/modal that coexists with the v1 expense sections. Full migration of v1 expenses to IndexedDB can be a follow-up task. The v1 system serves as "fixed cost templates" while Phase 17 handles individual expense tracking.
**Warning signs:** Blank expense tab, missing v1 sections.

### Pitfall 5: SL Entity Without Gastos Dificil
**What goes wrong:** Applying the 5% gastos dificil justificacion to an SL entity.
**Why it happens:** Gastos dificil is ONLY for autonomos in estimacion directa simplificada. SLs use Impuesto de Sociedades which has no equivalent provision.
**How to avoid:** Gate gastos dificil behind `EntityContext.current.type === ENTITY_TYPE.AUTONOMO`.
**Warning signs:** SL entities showing gastos dificil in their tax breakdown.

### Pitfall 6: Cash Payment for Dietas
**What goes wrong:** User enters a meal expense paid in cash, which is not deductible as dieta since 2018.
**Why it happens:** Users may not know about the electronic payment requirement.
**How to avoid:** Add a `payment_method` field. When category is `MEALS_DIETAS` and entity type is AUTONOMO, validate that payment method is not 'cash'. Show warning if it is.
**Warning signs:** User marks cash meals as deductible dietas.

### Pitfall 7: Forgetting Entity Scoping on Expense Queries
**What goes wrong:** Expense queries return data from all entities, not just the current one.
**Why it happens:** Forgetting to filter by `EntityContext.entityId`.
**How to avoid:** Every query in ExpenseManager MUST start with `const entityId = EntityContext.entityId; if (!entityId) return [];` -- same pattern as ClientManager and ProjectManager.
**Warning signs:** Expenses from one entity appearing in another entity's view.

## Code Examples

### 1. ExpenseManager.getExpenses (with filtering)
```javascript
// Source: follows ProjectManager.getProjects pattern from existing codebase
async getExpenses(options = {}) {
  const entityId = EntityContext.entityId;
  if (!entityId) return [];

  let expenses = await db.expenses
    .where('entity_id').equals(entityId)
    .filter(e => e.deleted_at === null)
    .toArray();

  // Apply filters
  if (options.category) {
    expenses = expenses.filter(e => e.category === options.category);
  }
  if (options.client_id) {
    expenses = expenses.filter(e => e.client_id === options.client_id);
  }
  if (options.date_from) {
    expenses = expenses.filter(e => e.date >= options.date_from);
  }
  if (options.date_to) {
    expenses = expenses.filter(e => e.date <= options.date_to);
  }
  if (options.is_billable !== undefined) {
    expenses = expenses.filter(e => e.is_billable === options.is_billable);
  }

  // Sort by date descending (most recent first)
  expenses.sort((a, b) => b.date.localeCompare(a.date));

  return expenses;
}
```

### 2. Dietas Validation
```javascript
// Source: AEAT Reglamento IRPF Art. 9 (RD 439/2007)
function validateDietas(expenseData, entityType) {
  if (entityType !== ENTITY_TYPE.AUTONOMO) return { valid: true };
  if (expenseData.category !== 'MEALS_DIETAS') return { valid: true };

  const warnings = [];

  // Check electronic payment
  if (expenseData.payment_method === 'cash') {
    warnings.push('Dietas paid in cash are NOT deductible since 2018. Use card, transfer, or Bizum.');
  }

  // Check municipality
  if (!expenseData.destination || expenseData.destination === 'home') {
    warnings.push('Dietas in your municipality of residence are NOT deductible.');
  }

  // Check daily limit
  const isAbroad = expenseData.destination && expenseData.destination !== 'ES';
  const hasOvernight = expenseData.has_overnight;
  const limitCents = isAbroad
    ? (hasOvernight ? 9135 : 4808)
    : (hasOvernight ? 5334 : 2667);

  if (expenseData.amount_cents > limitCents) {
    const limitEuros = MoneyUtils.centsToEuros(limitCents);
    warnings.push(`Amount exceeds dietas limit of ${MoneyUtils.formatEuros(limitCents)}/day ` +
      `(${isAbroad ? 'abroad' : 'Spain'}, ${hasOvernight ? 'with' : 'without'} overnight).`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
    deductible_limit_cents: limitCents
  };
}
```

### 3. Expense Form Dialog (HTML pattern following existing addExpenseDialog)
```javascript
// Source: matches existing dialog pattern at line 7536
function openExpenseFormDialog(editId = null) {
  const dialog = document.getElementById('expenseFormDialog');
  const form = dialog.querySelector('form');
  form.reset();

  const entity = EntityContext.current;
  const isAutonomo = entity?.type === ENTITY_TYPE.AUTONOMO;

  // Populate category select based on entity type
  const categorySelect = form.querySelector('#expCategorySelect');
  categorySelect.innerHTML = Object.entries(EXPENSE_CATEGORY)
    .filter(([key, cat]) => !cat.sl_only || !isAutonomo)
    .map(([key, cat]) => `<option value="${key}">${cat.label}</option>`)
    .join('');

  // Populate client/project selects
  populateClientSelect(form.querySelector('#expClientSelect'));

  if (editId) {
    // Load existing expense for editing
    loadExpenseIntoForm(editId, form);
  }

  dialog.showModal();
}
```

### 4. Image Compression Before Storage
```javascript
// Compress receipt image to reduce IndexedDB storage
function compressImage(file, maxWidth = 1024, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

## Fiscal Rules Reference

### Autonomo (IRPF - Estimacion Directa Simplificada)

| Category | Deductible % | IVA Treatment | Special Rules |
|----------|-------------|---------------|---------------|
| Home Office (suministros) | 30% of proportional use | N/A | Must register in Modelo 036/037. Formula: Total x (biz m2 / total m2) x 30% |
| Mobile / Telephone | 50-100% | 50-100% | Separate business line recommended. DGT V1233-25 |
| Vehicle | 0% IRPF (unless exclusive use) | 50% IVA | Very restrictive. Must prove 100% business use for IRPF |
| Meals (Dietas) Spain | 26.67/day (no overnight), 53.34/day (overnight) | N/A | Electronic payment mandatory. Different municipality required |
| Meals (Dietas) Abroad | 48.08/day (no overnight), 91.35/day (overnight) | N/A | Same rules. 9 month continuous limit |
| Flights (international) | 100% | Exempt (0%) | Factura completa required |
| Hotels Belgium | 100% IRPF | Via Modelo 360 | Belgian IVA not deductible in Modelo 303 |
| IT / Software | 100% | 21% deductible | Depreciation: Group 5, 26% max, 10 years |
| Office supplies | 100% | 21% deductible | Keep factura completa |
| Professional services | 100% | 21% deductible | Gestor, lawyer, notario |
| Training | 100% | 21% deductible | Must relate to professional activity |
| RETA cuota | 100% | N/A | Fixed at 428.40 EUR/month (user's rate) |
| Gastos dificil justificacion | 5% of net profit, max 2,000 EUR/year | N/A | AUTOMATIC in IRPF calc, NOT an expense entry |

**Source:** AEAT Estimacion Directa Simplificada, AEAT Manual IRPF, Ley 6/2017

### Sociedad Limitada (Impuesto de Sociedades)

| Category | Deductible % | IVA Treatment | Special Rules |
|----------|-------------|---------------|---------------|
| Home Office | 100% if justified | Deductible | Must be registered as business address |
| Mobile / Telephone | 100% | 100% | Company contract |
| Vehicle | 100% | 100% | Must be company asset. Mixed use = retribucion en especie |
| Meals / Entertainment | 100% (client) | 100% | 1% of net revenue limit for client entertainment |
| Flights | 100% | Exempt (0%) | Same as autonomo |
| Hotels Belgium | 100% IRPF | Via Modelo 360 | Same as autonomo |
| IT / Software | 100% | 100% | Can apply I+D+i deductions |
| Office supplies | 100% | 100% | Standard |
| Professional services | 100% | 100% | Standard |
| Training | 100% | 100% | Standard |
| Employee salaries | 100% | N/A | Including SS employer share |
| Asset depreciation | Per LIS tables | N/A | Accelerated for PYME. Freedom of amortization for certain vehicles |
| NO gastos dificil | N/A | N/A | SL has no equivalent of the 5% provision |

**Source:** LIS Art. 10-15, AEAT Manual Impuesto de Sociedades

### Depreciation Tables (Autonomo - Simplified)

| Group | Asset Type | Max Coefficient | Max Period |
|-------|-----------|-----------------|------------|
| 1 | Buildings | 3% | 68 years |
| 2 | Furniture, fittings | 10% | 20 years |
| 3 | Machinery | 12% | 18 years |
| 4 | Transport elements | 16% | 14 years |
| 5 | IT equipment & software | 26% | 10 years |
| 6 | Tools | 30% | 8 years |

**Source:** AEAT Tabla de amortizacion simplificada (Section 3.5.4)

## V1 to V2 Migration Strategy

The existing v1 expense system (localStorage-based, with `DEFAULT_EXPENSES`, `loadExpenses()`, `saveExpenses()`) serves as a "fixed cost template" system. Phase 17 builds a complementary "individual expense tracking" system.

**Recommended approach:**
1. Keep v1 expense sections (Spain Deductible, Work Travel, Private) as "Monthly Fixed Costs" -- these are templates that feed into IRPF scenarios
2. Build Phase 17 as "Expense Tracker" -- individual expenses with dates, receipts, client linking
3. The v1 sections remain on the Expenses tab as a summary header
4. Below them, add the new expense tracker list with add/filter/search
5. In a future phase, consider migrating v1 fixed costs to IndexedDB entries with `is_recurring: true`

This avoids breaking the existing scenario engine which relies on `getExpenseTotals()` from v1 data.

## Expense-Calendar Integration

### How It Works (Already Partially Built)

1. `db.expenses` has compound index `[entity_id+date]`
2. `CalendarManager.getLinkedExpenseCount(dateKey)` queries this index -- already implemented, returns 0 because expenses table is empty
3. `CalendarManager.getLinkedExpenseCounts(dateKeys)` does batch queries -- already implemented
4. Calendar day cells show expense badge count (line 21094 comment: "Expense count from batch lookup")
5. When Phase 17 populates the expenses table, calendar badges will automatically appear

### Travel Expense Linking (EXPENSE-10)

For multi-day travel expenses (e.g., hotel for 3 nights):
- Store `trip_start_date` and `trip_end_date` as additional fields
- The `date` field = receipt date (or first day of trip)
- Calendar view shows the expense badge on the receipt date
- A "Linked Expenses" panel in the day editor queries: `expenses where (date = dayDate) OR (trip_start_date <= dayDate AND trip_end_date >= dayDate)`

## Open Questions

1. **OCR Language Priority**
   - What we know: User deals with Spanish and Belgian (Dutch/French) receipts
   - What's unclear: Should we load `eng+spa+nld+fra` (4 languages) or just `eng+spa`?
   - Recommendation: Start with `eng+spa`. Add language selection dropdown if needed. Each language adds ~4MB download.

2. **V1 Fixed Costs Migration Timeline**
   - What we know: V1 localStorage expense system feeds into scenario calculations
   - What's unclear: When should fixed costs migrate to IndexedDB?
   - Recommendation: NOT in Phase 17. Keep v1 as "Monthly Fixed Costs" section. Migrate in a dedicated follow-up phase when scenario engine is refactored.

3. **Factura Completa Validation**
   - What we know: AEAT requires factura completa for deductions (with NIF, address, etc.)
   - What's unclear: Should the app validate invoice completeness or just warn?
   - Recommendation: Add a `document_type` field with options: 'factura_completa', 'factura_simplificada', 'ticket', 'bank_statement'. Show warning badge when document type is not 'factura_completa'.

4. **Belgian IVA Recovery Tracking (Modelo 360)**
   - What we know: Belgian hotel IVA must be recovered via Modelo 360 by Sept 30 of following year
   - What's unclear: Should Phase 17 track which expenses need Modelo 360 filing?
   - Recommendation: Add a computed property `needs_modelo_360` based on: category is travel/hotel + destination is EU non-Spain. Show summary in compliance tab.

## Sources

### Primary (HIGH confidence)
- AEAT Estimacion Directa Simplificada: https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad/estimacion-directa-simplificada.html
- AEAT Dietas Manutencion/Estancia: https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2023/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_1-rendimientos-integros/7_1_1_2-dietas-gastos-viaje/asignaciones-gastos-manutencion-estancia.html
- AEAT Tabla Amortizacion Simplificada: https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/3-impuesto-sobre-renta-personas-fisicas/3_5-estimacion-directa-simplificada/3_5_4-tabla-amortizacion-simplificada.html
- AEAT Ley 6/2017 (home office/dietas changes): https://sede.agenciatributaria.gob.es/Sede/irpf/novedades-impuesto/novedades-normativa/principales-novedades-tributarias-introducidas-ley-6_2017.html
- BOE Orden PJC/178/2025 (RETA 2025): https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-3780
- Existing codebase: `/Users/christophercardoen/Downloads/Tax related/autonomo_dashboard.html` (lines 13400-13530 schema, 16747-16806 MoneyUtils, 17028-17140 DataManager, 18447-18690 ProjectManager, 19680-19778 EntityContext, 19782-20060 CalendarManager)

### Secondary (MEDIUM confidence)
- Infoautonomos Gastos Deducibles 2026: https://www.infoautonomos.com/fiscalidad/gastos-deducibles-autonomos-irpf-estimacion-directa/
- Holded Impuesto Sociedades Deducibles: https://www.holded.com/es/blog/gastos-deducibles-impuesto-sociedades
- Sapientia Gastos Deducibles SL 2025: https://www.gestoriaonlinesapientia.com/blog/gastos-deducibles-impuesto-sociedades/
- Tesseract.js GitHub: https://github.com/naptha/tesseract.js
- Tesseract.js CDN (cdnjs): https://cdnjs.com/libraries/tesseract.js

### Tertiary (LOW confidence)
- Esteve Fuchs Autonomo vs SL divergencias: https://estevefuchs.com/fiscalidad/gastos-deducibles-autonomo-vs-sl-principales-divergencias/
- Receipt OCR community project: https://github.com/drake7707/ocr-receipt

## Metadata

**Confidence breakdown:**
- Fiscal rules (autonomo): HIGH - Official AEAT sources, verified in prior research phases
- Fiscal rules (SL): MEDIUM-HIGH - Official AEAT IS manual + multiple secondary sources agree
- Architecture patterns: HIGH - Directly derived from existing codebase patterns (ProjectManager, CalendarManager)
- OCR approach: MEDIUM - Tesseract.js is well-established but receipt parsing accuracy varies
- V1 migration strategy: MEDIUM - Conservative approach (coexist) is safe but may need revisiting

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (fiscal rules stable; check Tesseract.js version if delayed)
