# Phase 12: Data Architecture Foundation - Research

**Researched:** 2026-02-03
**Domain:** Offline-first IndexedDB with Dexie.js, financial data handling, Spanish invoice compliance
**Confidence:** HIGH (Dexie.js/IndexedDB), MEDIUM-HIGH (Spanish invoice regulations)

## Summary

This phase establishes the offline-first data layer using Dexie.js v4.x as the IndexedDB wrapper. The research confirmed Dexie.js as the correct choice for this project - it handles the complexity of IndexedDB transactions, provides a clean Promise-based API, and supports schema versioning with migrations. The library works with integers internally for precision when configured properly.

The critical finding is the Spanish invoice compliance requirement: **invoices cannot be deleted, only archived**. Real Decreto 1619/2012 mandates sequential invoice numbering without gaps. When an invoice needs correction, a "factura rectificativa" (corrective invoice) must be issued in a separate series - the original invoice number is preserved. VeriFactu (effective July 2027 for autonomos) reinforces this with tamper-proof hash chains. The 4-year retention aligns with Spanish statute of limitations for tax audits.

For monetary precision, the consensus is clear: **store all amounts as integer cents**, convert at the UI boundary. This prevents floating-point errors like `0.1 + 0.2 !== 0.3`. The currency.js library provides a clean API with `intValue` for cents and `fromCents` option for initialization.

**Primary recommendation:** Build schema with all entity tables upfront, use integer cents for all monetary values, implement soft delete with deleted_at timestamp for 4-year retention, and create a sync queue table for offline changes.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie.js | 4.3.0 | IndexedDB wrapper | De facto standard for IndexedDB in JS. Promise-based API, schema versioning, migrations. 100k+ sites use it. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| currency.js | 2.0.4 | Money handling | Input conversion to cents, display formatting. Lightweight (~1kb), works with integers internally. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie.js | Raw IndexedDB | No abstraction, callback hell, manual transaction handling. Only for very simple cases. |
| Dexie.js | localForage | Simpler API but no schema versioning, no migrations, no indexes. Not suitable for relational data. |
| Dexie.js | RxDB | More powerful (reactive, sync built-in) but heavier, requires schema plugins. Overkill for single-file HTML. |
| currency.js | Dinero.js | More features (multi-currency, allocation) but heavier. currency.js is sufficient for EUR-only. |
| currency.js | Manual integer math | Possible but tedious. currency.js handles edge cases (rounding, formatting). |

**Installation (CDN for single-file HTML):**
```html
<!-- Dexie.js v4.x -->
<script src="https://unpkg.com/dexie@4/dist/dexie.min.js"></script>

<!-- currency.js -->
<script src="https://unpkg.com/currency.js@2.0.4/dist/currency.min.js"></script>
```

**Note:** Both libraries work in browsers without bundlers. Dexie is ~40kb minified, currency.js is ~1kb.

## Architecture Patterns

### Recommended Database Schema

```javascript
// Schema version 1 - Full v2.0 schema defined upfront
const db = new Dexie('AutonomoBusinessDB');

db.version(1).stores({
  // Core entities
  entities: '++id, type, nif_cif, name, created_at, deleted_at',
  clients: '++id, entity_id, nif_cif, name, country, created_at, deleted_at, [entity_id+deleted_at]',
  projects: '++id, client_id, entity_id, name, status, created_at, deleted_at',

  // Financial documents
  invoices: '++id, entity_id, client_id, invoice_number, status, date_issued, deleted_at, [entity_id+invoice_number], [entity_id+deleted_at]',
  invoice_lines: '++id, invoice_id, description, quantity_cents, unit_price_cents, iva_rate',

  expenses: '++id, entity_id, category, vendor, date, amount_cents, deleted_at, [entity_id+deleted_at]',
  receipts: '++id, expense_id, file_type, ocr_status, created_at',

  // Calendar
  calendar_days: '++id, entity_id, date, location, client_id, [entity_id+date]',

  // Tax calculations (cached)
  tax_calculations: '++id, entity_id, period, type, calculated_at',

  // Sync infrastructure
  sync_queue: '++id, table_name, record_id, operation, data, created_at, retry_count',

  // Invoice sequences (VeriFactu compliance)
  invoice_sequences: '++id, entity_id, series, last_number, [entity_id+series]',

  // Settings
  settings: 'key, value, updated_at'
});
```

### Pattern 1: Integer Cents Storage

**What:** Store all monetary values as integers (cents), convert at UI boundary

**When to use:** Every monetary field in every table

**Example:**
```javascript
// Source: currency.js documentation (https://currency.js.org/)

// === INPUT: User types "1234.56" ===
function eurosToCents(euroString) {
  // currency.js handles parsing and rounding
  return currency(euroString, { precision: 2 }).intValue;
}

// User input: "1234.56" -> stored as: 123456
const inputField = document.getElementById('amount');
const amount_cents = eurosToCents(inputField.value);
await db.expenses.add({ amount_cents, ... });

// === OUTPUT: Display from database ===
function centsToEuros(cents) {
  return currency(cents, {
    fromCents: true,
    symbol: '',  // We'll add our own EUR formatting
    precision: 2
  }).format();
}

// Database: 123456 -> display: "1,234.56"
const expense = await db.expenses.get(id);
displayAmount.textContent = `${centsToEuros(expense.amount_cents)}`;

// === CALCULATION: Always in cents ===
const subtotal_cents = lines.reduce((sum, l) => sum + l.total_cents, 0);
const iva_cents = Math.round(subtotal_cents * 0.21); // 21% IVA
const total_cents = subtotal_cents + iva_cents;
```

### Pattern 2: Soft Delete with Audit Trail

**What:** Never physically delete financial records, set `deleted_at` timestamp

**When to use:** Invoices, expenses, receipts, clients (anything with tax implications)

**Example:**
```javascript
// Source: CONTEXT.md decisions

// === SOFT DELETE ===
async function softDelete(table, id) {
  const now = new Date().toISOString();
  await db[table].update(id, {
    deleted_at: now,
    updated_at: now
  });

  // Queue for sync
  await db.sync_queue.add({
    table_name: table,
    record_id: id,
    operation: 'UPDATE',
    data: { deleted_at: now, updated_at: now },
    created_at: now,
    retry_count: 0
  });
}

// === QUERY ACTIVE RECORDS ONLY ===
async function getActiveExpenses(entity_id) {
  return db.expenses
    .where('[entity_id+deleted_at]')
    .equals([entity_id, null])  // Compound index: entity_id + no deleted_at
    .toArray();
}

// === QUERY DELETED RECORDS (for "Deleted Items" view) ===
async function getDeletedExpenses(entity_id) {
  return db.expenses
    .where('entity_id').equals(entity_id)
    .filter(e => e.deleted_at !== null)
    .toArray();
}

// === RESTORE (within 30 days) ===
async function restoreRecord(table, id) {
  const record = await db[table].get(id);
  if (!record || !record.deleted_at) return false;

  const deletedDate = new Date(record.deleted_at);
  const daysSinceDeleted = (Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceDeleted > 30) {
    throw new Error('Cannot restore: Record deleted more than 30 days ago');
  }

  await db[table].update(id, { deleted_at: null, updated_at: new Date().toISOString() });
  return true;
}

// === AUTO-PURGE ON APP LOAD (4-year retention) ===
async function autoPurgeOldRecords() {
  const fourYearsAgo = new Date();
  fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
  const cutoff = fourYearsAgo.toISOString();

  // Only purge soft-deleted records older than 4 years
  const tables = ['invoices', 'expenses', 'receipts', 'clients'];
  for (const table of tables) {
    const toDelete = await db[table]
      .filter(r => r.deleted_at && r.deleted_at < cutoff)
      .toArray();

    for (const record of toDelete) {
      await db[table].delete(record.id);
      console.log(`Purged ${table}/${record.id} (deleted ${record.deleted_at})`);
    }
  }
}
```

### Pattern 3: Invoice Sequence Management (VeriFactu Compliance)

**What:** Sequential invoice numbers per series, no gaps allowed

**When to use:** Creating new invoices

**Example:**
```javascript
// Source: Real Decreto 1619/2012, VeriFactu regulations

// === INVOICE SERIES ===
// - 'F': Regular invoices (facturas ordinarias)
// - 'R': Rectifying invoices (facturas rectificativas)
// - 'S': Simplified invoices (facturas simplificadas)

async function getNextInvoiceNumber(entity_id, series = 'F') {
  return db.transaction('rw', db.invoice_sequences, async () => {
    let seq = await db.invoice_sequences
      .where('[entity_id+series]')
      .equals([entity_id, series])
      .first();

    if (!seq) {
      // First invoice in this series
      seq = { entity_id, series, last_number: 0 };
      seq.id = await db.invoice_sequences.add(seq);
    }

    // Increment and save
    seq.last_number++;
    await db.invoice_sequences.update(seq.id, { last_number: seq.last_number });

    // Format: F-2026-0001 (series-year-sequence)
    const year = new Date().getFullYear();
    const paddedNum = String(seq.last_number).padStart(4, '0');
    return `${series}-${year}-${paddedNum}`;
  });
}

// === CORRECTING AN INVOICE (factura rectificativa) ===
async function createRectifyingInvoice(original_invoice_id, corrections) {
  const original = await db.invoices.get(original_invoice_id);
  if (!original) throw new Error('Original invoice not found');

  // Rectifying invoices use series 'R'
  const rectifying_number = await getNextInvoiceNumber(original.entity_id, 'R');

  const rectifying = {
    entity_id: original.entity_id,
    client_id: original.client_id,
    invoice_number: rectifying_number,
    series: 'R',
    original_invoice_id: original.id,  // Link to original
    original_invoice_number: original.invoice_number,
    reason: corrections.reason,  // "Error en datos fiscales", "Modificacion base imponible", etc.
    ...corrections,
    status: 'draft',
    date_issued: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  return db.invoices.add(rectifying);
}

// === DELETING AN INVOICE (archive, don't delete) ===
async function archiveInvoice(invoice_id) {
  // CRITICAL: Invoice number is PRESERVED in sequence
  // User "deletes" -> we soft delete with deleted_at
  // Invoice number stays in sequence (no gaps)

  const invoice = await db.invoices.get(invoice_id);
  if (!invoice) throw new Error('Invoice not found');

  // Check if already archived
  if (invoice.deleted_at) {
    throw new Error('Invoice already archived');
  }

  // Check if invoice was sent/paid (may need rectificativa instead)
  if (invoice.status === 'sent' || invoice.status === 'paid') {
    throw new Error(
      'Cannot archive sent/paid invoice. ' +
      'Create a factura rectificativa instead to correct errors, ' +
      'or a credit note to cancel the operation.'
    );
  }

  // Only draft invoices can be archived (soft deleted)
  await db.invoices.update(invoice_id, {
    deleted_at: new Date().toISOString(),
    status: 'archived'  // New status for compliance
  });
}
```

### Pattern 4: Sync Queue

**What:** Queue all data changes for eventual cloud sync

**When to use:** Every CRUD operation

**Example:**
```javascript
// Source: CONTEXT.md decisions, offline-first patterns

// === QUEUE STRUCTURE ===
// sync_queue: { id, table_name, record_id, operation, data, created_at, retry_count }

async function queueChange(table_name, record_id, operation, data) {
  await db.sync_queue.add({
    table_name,
    record_id,
    operation,  // 'CREATE', 'UPDATE', 'DELETE'
    data: JSON.stringify(data),
    created_at: new Date().toISOString(),
    retry_count: 0
  });

  updateSyncIndicator();
}

// === SYNC INDICATOR ===
async function updateSyncIndicator() {
  const pendingCount = await db.sync_queue.count();
  const indicator = document.getElementById('sync-indicator');

  if (pendingCount === 0) {
    indicator.textContent = 'Synced';
    indicator.className = 'sync-status synced';
  } else {
    indicator.textContent = `${pendingCount} pending`;
    indicator.className = 'sync-status pending';

    // Warning thresholds
    if (pendingCount >= 100) {
      showSyncWarning(pendingCount);
    }
  }
}

function showSyncWarning(count) {
  const level = count >= 1000 ? 'critical' : count >= 500 ? 'warning' : 'info';
  showNotification({
    level,
    message: `You have ${count} unsynced changes. Connect to sync.`,
    action: { label: 'View Queue', onClick: showSyncQueue }
  });
}

// === WRAPPED CRUD OPERATIONS ===
async function addExpense(expense) {
  const id = await db.expenses.add({
    ...expense,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  await queueChange('expenses', id, 'CREATE', expense);
  return id;
}

async function updateExpense(id, changes) {
  changes.updated_at = new Date().toISOString();
  await db.expenses.update(id, changes);
  await queueChange('expenses', id, 'UPDATE', changes);
}
```

### Pattern 5: Schema Migration

**What:** Auto-migrate schema on version change

**When to use:** Database initialization on app load

**Example:**
```javascript
// Source: Dexie.js documentation (https://dexie.org/docs/Version/Version.upgrade())

// === SCHEMA VERSIONING ===
// - Version 1: Initial schema (current phase)
// - Version 2+: Future migrations

const db = new Dexie('AutonomoBusinessDB');

// Version 1 - Base schema
db.version(1).stores({
  entities: '++id, type, nif_cif, name, created_at, deleted_at',
  clients: '++id, entity_id, nif_cif, name, country, created_at, deleted_at, [entity_id+deleted_at]',
  invoices: '++id, entity_id, client_id, invoice_number, status, date_issued, deleted_at, [entity_id+invoice_number]',
  expenses: '++id, entity_id, category, vendor, date, amount_cents, deleted_at',
  sync_queue: '++id, table_name, record_id, operation, created_at, retry_count',
  settings: 'key'
});

// Version 2 - Example future migration (adding a field)
db.version(2).stores({
  // Same stores, but with new index
  invoices: '++id, entity_id, client_id, invoice_number, status, date_issued, deleted_at, due_date, [entity_id+invoice_number]'
}).upgrade(async tx => {
  // Migrate existing data
  await tx.table('invoices').toCollection().modify(invoice => {
    // Add due_date field (30 days after issue date)
    if (!invoice.due_date && invoice.date_issued) {
      const issued = new Date(invoice.date_issued);
      issued.setDate(issued.getDate() + 30);
      invoice.due_date = issued.toISOString().split('T')[0];
    }
  });
});

// === INITIALIZATION WITH LOADING SCREEN ===
async function initDatabase() {
  const loadingEl = document.getElementById('loading-screen');
  const statusEl = document.getElementById('loading-status');

  try {
    loadingEl.style.display = 'flex';
    statusEl.textContent = 'Initializing database...';

    await db.open();

    statusEl.textContent = 'Running maintenance...';
    await autoPurgeOldRecords();  // 4-year cleanup

    statusEl.textContent = 'Checking sync status...';
    await updateSyncIndicator();

    loadingEl.style.display = 'none';
    return true;

  } catch (error) {
    console.error('Database initialization failed:', error);
    statusEl.textContent = `Error: ${error.message}. Please refresh.`;

    // If migration failed, show recovery option
    if (error.name === 'UpgradeError') {
      showRecoveryOption();
    }
    return false;
  }
}
```

### Anti-Patterns to Avoid

- **Storing floats for money:** Never use `123.45` - always use `12345` (cents). JavaScript floats have precision issues.
- **Hard-deleting financial records:** Never use `db.table.delete()` for invoices/expenses. Always soft delete with `deleted_at`.
- **Reusing invoice numbers:** Invoice numbers are permanent. Even archived invoices keep their number in the sequence.
- **Skipping sync queue:** Every change must be queued, even if online. This ensures audit trail and eventual consistency.
- **Blocking UI during migrations:** Show loading screen during migrations. Don't let user interact with partial data.
- **Indexing everything:** Only index fields used in `.where()` queries. Over-indexing hurts write performance.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB transactions | Manual IDBTransaction handling | Dexie.js | Transaction scoping, error handling, Promise API |
| Money arithmetic | Manual float math | currency.js or integer cents | `0.1 + 0.2 !== 0.3` is a real bug |
| Banker's rounding | Custom Math.round | currency.js or custom function | Default JS rounding is not banker's rounding |
| Schema migrations | Manual version checks | Dexie's version().upgrade() | Handles upgrade paths, rollback scenarios |
| Euro formatting | Manual string concat | Intl.NumberFormat | Locale-aware separators, symbols |
| Date handling | Manual string parsing | Date or Temporal | Edge cases with timezones, ISO formats |

**Key insight:** Financial software has regulatory requirements (4-year retention, sequential numbering, audit trails). These aren't optional features - they're legal obligations. Using established patterns prevents compliance failures.

## Common Pitfalls

### Pitfall 1: Float Precision in Totals

**What goes wrong:** Invoice total shows 999.99 when items sum to 1000.00

**Why it happens:** JavaScript binary floats can't represent some decimals exactly

**How to avoid:** Store and calculate everything in cents (integers)

**Warning signs:** Any calculated total that "looks off" by a cent

### Pitfall 2: Invoice Number Gaps

**What goes wrong:** Audit finds gaps in invoice sequence (F-2026-0001, F-2026-0003 - missing 0002)

**Why it happens:** Developer deleted invoice or let failed creation consume a number

**How to avoid:**
1. Assign number only after successful save
2. Never delete invoices, only archive (soft delete)
3. Use database transaction for number assignment

**Warning signs:** Invoice creation that fails mid-process, any code that deletes invoice records

### Pitfall 3: Safari 7-Day Eviction

**What goes wrong:** User loses all data after not using app for 7 days

**Why it happens:** Safari (iOS/macOS) evicts IndexedDB data after 7 days of no interaction unless app is installed as PWA

**How to avoid:**
1. Inform users to add app to home screen (PWA)
2. Implement cloud sync as primary storage (Phase 27)
3. Show warning to Safari users about limitation

**Warning signs:** User complaints about data loss, Safari-only issues

### Pitfall 4: Sync Queue Overflow

**What goes wrong:** App becomes sluggish, sync never completes

**Why it happens:** User works offline for weeks, queue grows to thousands of items

**How to avoid:**
1. Show warnings at 100/500/1000 items
2. Encourage periodic sync
3. Consider queue compaction for rapid edits (future optimization)

**Warning signs:** Sync queue count growing without decreasing

### Pitfall 5: Migration Failure Data Loss

**What goes wrong:** Schema migration fails mid-way, database is corrupted

**Why it happens:** Browser crash, quota exceeded, invalid data during transform

**How to avoid:**
1. Run migrations in transaction (Dexie handles this)
2. Check quota before migration
3. Have recovery path (show "Contact support" message)

**Warning signs:** App fails to load after update, users report blank screens

### Pitfall 6: Soft Delete Query Leaks

**What goes wrong:** Deleted invoices appear in tax calculations

**Why it happens:** Developer forgot to filter by `deleted_at IS NULL`

**How to avoid:**
1. Create helper functions like `getActiveRecords(table, entity_id)`
2. Use compound indexes like `[entity_id+deleted_at]`
3. Never query tables directly without deleted_at filter

**Warning signs:** Totals don't match, "ghost" records appearing

## Code Examples

### Complete Database Initialization

```javascript
// Source: Dexie.js docs, CONTEXT.md decisions

// =====================================================
// Database Schema Definition
// =====================================================

const DB_NAME = 'AutonomoBusinessDB';
const DB_VERSION = 1;

class AppDatabase extends Dexie {
  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      // Business entities (autonomo, SL)
      entities: '++id, type, nif_cif, name, is_active, created_at, deleted_at',

      // Clients
      clients: '++id, entity_id, nif_cif, name, country, category, created_at, deleted_at, [entity_id+deleted_at]',

      // Projects (per client)
      projects: '++id, client_id, entity_id, name, status, rate_cents, created_at, deleted_at',

      // Invoices (VeriFactu compliant)
      invoices: '++id, entity_id, client_id, series, invoice_number, status, date_issued, date_due, subtotal_cents, iva_cents, irpf_cents, total_cents, deleted_at, [entity_id+series+invoice_number], [entity_id+deleted_at], [entity_id+status]',

      // Invoice line items
      invoice_lines: '++id, invoice_id, description, quantity, unit_price_cents, iva_rate, line_total_cents',

      // Invoice sequences (per entity, per series)
      invoice_sequences: '++id, entity_id, series, last_number, [entity_id+series]',

      // Expenses
      expenses: '++id, entity_id, category, subcategory, vendor, date, amount_cents, iva_cents, deductible_amount_cents, description, is_billable, client_id, project_id, receipt_id, created_at, deleted_at, [entity_id+deleted_at], [entity_id+category], [entity_id+date]',

      // Receipts (linked to expenses)
      receipts: '++id, expense_id, file_name, file_type, file_data, ocr_status, ocr_confidence, ocr_extracted, created_at',

      // Calendar days
      calendar_days: '++id, entity_id, date, location, client_id, project_id, notes, created_at, updated_at, [entity_id+date]',

      // Tax calculations (cached results)
      tax_calculations: '++id, entity_id, tax_type, period_start, period_end, calculated_at, input_data, result_data',

      // Sync queue
      sync_queue: '++id, table_name, record_id, operation, data, created_at, retry_count, last_error',

      // App settings
      settings: 'key, value, updated_at'
    });

    // Define table types for TypeScript-like safety
    this.entities = this.table('entities');
    this.clients = this.table('clients');
    this.projects = this.table('projects');
    this.invoices = this.table('invoices');
    this.invoice_lines = this.table('invoice_lines');
    this.invoice_sequences = this.table('invoice_sequences');
    this.expenses = this.table('expenses');
    this.receipts = this.table('receipts');
    this.calendar_days = this.table('calendar_days');
    this.tax_calculations = this.table('tax_calculations');
    this.sync_queue = this.table('sync_queue');
    this.settings = this.table('settings');
  }
}

const db = new AppDatabase();

// =====================================================
// Money Utilities
// =====================================================

const MoneyUtils = {
  // Convert user input (euros) to storage (cents)
  eurosToCents(euroValue) {
    if (typeof euroValue === 'string') {
      // Handle comma as decimal separator (European format)
      euroValue = euroValue.replace(/\s/g, '').replace(',', '.');
    }
    return currency(euroValue, { precision: 2 }).intValue;
  },

  // Convert storage (cents) to display (euros)
  centsToEuros(cents) {
    return currency(cents, { fromCents: true, precision: 2 }).value;
  },

  // Format for display with currency symbol
  formatEuros(cents, locale = 'es-ES') {
    const euros = this.centsToEuros(cents);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(euros);
  },

  // Banker's rounding for tax calculations
  roundCents(cents) {
    // Round to nearest even for .5 cases
    if (cents % 1 === 0.5 || cents % 1 === -0.5) {
      const floor = Math.floor(cents);
      return floor % 2 === 0 ? floor : Math.ceil(cents);
    }
    return Math.round(cents);
  },

  // Calculate IVA
  calculateIVA(baseCents, rate) {
    return this.roundCents(baseCents * rate);
  }
};

// =====================================================
// Audit Fields Helper
// =====================================================

function auditFields(isCreate = true) {
  const now = new Date().toISOString();
  if (isCreate) {
    return {
      created_at: now,
      updated_at: now,
      created_by: getCurrentUserId(),
      updated_by: getCurrentUserId()
    };
  }
  return {
    updated_at: now,
    updated_by: getCurrentUserId()
  };
}

function getCurrentUserId() {
  // Will be implemented in Phase 14 (Auth)
  // For now, return placeholder
  return 'local-user';
}

// =====================================================
// Database Initialization
// =====================================================

async function initializeApp() {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingStatus = document.getElementById('loading-status');

  try {
    loadingScreen.classList.add('visible');

    // Step 1: Open database (triggers migrations if needed)
    loadingStatus.textContent = 'Opening database...';
    await db.open();
    console.log('Database opened:', db.name, 'version:', db.verno);

    // Step 2: Run maintenance tasks
    loadingStatus.textContent = 'Running maintenance...';
    await runMaintenanceTasks();

    // Step 3: Check sync status
    loadingStatus.textContent = 'Checking sync status...';
    await updateSyncStatus();

    // Step 4: Load initial data
    loadingStatus.textContent = 'Loading...';
    await loadInitialData();

    // Done
    loadingScreen.classList.remove('visible');
    console.log('App initialized successfully');

  } catch (error) {
    console.error('Initialization failed:', error);
    loadingStatus.textContent = `Error: ${error.message}`;
    loadingStatus.classList.add('error');

    // Show recovery options
    showRecoveryOptions(error);
  }
}

async function runMaintenanceTasks() {
  // Auto-purge records deleted more than 4 years ago
  const fourYearsAgo = new Date();
  fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
  const cutoff = fourYearsAgo.toISOString();

  const tablesToPurge = ['invoices', 'expenses', 'receipts', 'clients'];

  for (const tableName of tablesToPurge) {
    const oldRecords = await db.table(tableName)
      .filter(r => r.deleted_at && r.deleted_at < cutoff)
      .toArray();

    if (oldRecords.length > 0) {
      console.log(`Purging ${oldRecords.length} old records from ${tableName}`);
      const ids = oldRecords.map(r => r.id);
      await db.table(tableName).bulkDelete(ids);
    }
  }
}
```

### Invoice Creation with VeriFactu Compliance

```javascript
// Source: Real Decreto 1619/2012, VeriFactu regulations

async function createInvoice(invoiceData) {
  const { entity_id, client_id, lines, series = 'F' } = invoiceData;

  // Validate
  if (!entity_id || !client_id || !lines?.length) {
    throw new Error('Missing required invoice data');
  }

  // Calculate totals (all in cents)
  let subtotal_cents = 0;
  let iva_cents = 0;

  const processedLines = lines.map(line => {
    const quantity = line.quantity || 1;
    const unit_price_cents = MoneyUtils.eurosToCents(line.unit_price);
    const line_subtotal = Math.round(quantity * unit_price_cents);
    const line_iva = MoneyUtils.calculateIVA(line_subtotal, line.iva_rate || 0.21);

    subtotal_cents += line_subtotal;
    iva_cents += line_iva;

    return {
      description: line.description,
      quantity,
      unit_price_cents,
      iva_rate: line.iva_rate || 0.21,
      line_total_cents: line_subtotal + line_iva
    };
  });

  const total_cents = subtotal_cents + iva_cents;

  // Create invoice in transaction (atomic number assignment)
  return db.transaction('rw', [db.invoices, db.invoice_lines, db.invoice_sequences, db.sync_queue], async () => {

    // Get next invoice number
    let seq = await db.invoice_sequences
      .where('[entity_id+series]')
      .equals([entity_id, series])
      .first();

    if (!seq) {
      const seqId = await db.invoice_sequences.add({
        entity_id,
        series,
        last_number: 0
      });
      seq = await db.invoice_sequences.get(seqId);
    }

    seq.last_number++;
    await db.invoice_sequences.update(seq.id, { last_number: seq.last_number });

    // Format invoice number
    const year = new Date().getFullYear();
    const invoice_number = `${series}-${year}-${String(seq.last_number).padStart(4, '0')}`;

    // Create invoice record
    const invoice = {
      entity_id,
      client_id,
      series,
      invoice_number,
      status: 'draft',
      date_issued: new Date().toISOString().split('T')[0],
      date_due: null,
      subtotal_cents,
      iva_cents,
      irpf_cents: 0,  // Calculated based on entity type and client
      total_cents,
      deleted_at: null,
      ...auditFields(true)
    };

    const invoiceId = await db.invoices.add(invoice);

    // Create line items
    for (const line of processedLines) {
      await db.invoice_lines.add({
        invoice_id: invoiceId,
        ...line
      });
    }

    // Queue for sync
    await db.sync_queue.add({
      table_name: 'invoices',
      record_id: invoiceId,
      operation: 'CREATE',
      data: JSON.stringify({ ...invoice, lines: processedLines }),
      created_at: new Date().toISOString(),
      retry_count: 0
    });

    return { id: invoiceId, invoice_number };
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage | IndexedDB | ~2015 | 5-10MB limit removed, structured data, indexes |
| Raw IndexedDB | Dexie.js wrapper | ~2018 | Clean API, migrations, Promise-based |
| Float money | Integer cents | Always best practice | Eliminates precision errors |
| Hard delete | Soft delete + retention | Regulatory compliance | Audit trail, legal compliance |
| Manual sync | Offline-first with queue | ~2020 | Better UX, eventual consistency |

**Deprecated/outdated:**
- Web SQL: Deprecated, never standardized. Use IndexedDB.
- localStorage for app data: Too small (5-10MB), no structure, sync blocking. Use IndexedDB.
- Dexie v3.x: Upgrade to v4.x for latest features (object-wise upgrades, better TypeScript).

## Open Questions

### 1. Safari PWA Requirement
**What we know:** Safari evicts IndexedDB after 7 days of no interaction unless installed as PWA
**What's unclear:** Will users actually install as PWA? Should we show mandatory prompt?
**Recommendation:** Show warning to Safari users in Phase 28 (PWA phase). For now, document the limitation.

### 2. Encryption at Rest
**What we know:** SYNC-08 requires encrypting sensitive data (NIF, CIF, tax IDs)
**What's unclear:** Encrypt in IndexedDB or only for cloud sync?
**Recommendation:** Defer encryption to Phase 27 (Cloud Sync). IndexedDB is browser-sandboxed anyway.

### 3. VeriFactu Hash Chain
**What we know:** VeriFactu requires hash chaining for invoice records
**What's unclear:** How to implement hash chain in JavaScript, what algorithm
**Recommendation:** Defer to Phase 18 (Invoice Generation). Focus on basic storage now.

### 4. Factura Anulada vs Rectificativa Edge Cases
**What we know:** Anulada for non-existent operations, rectificativa for errors in real operations
**What's unclear:** What if draft invoice was sent by mistake but no service provided?
**Recommendation:** Treat sent invoices as real operations. User must create rectificativa or credit note.

## Sources

### Primary (HIGH confidence)

- [Dexie.js Official Documentation](https://dexie.org/docs) - Schema versioning, upgrade patterns, API reference
- [Dexie.js GitHub Releases](https://github.com/dexie/Dexie.js/releases) - v4.3.0 is current stable (Jan 2025)
- [currency.js Documentation](https://currency.js.org/) - intValue, fromCents, formatting API
- [MDN Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) - Browser storage limits, eviction

### Secondary (MEDIUM confidence)

- [BOE Real Decreto 1619/2012](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696) - Spanish invoicing regulations (factura completa, numeracion secuencial)
- [AEAT VeriFactu FAQ](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/registros-facturacion-anulacion.html) - Invoice cancellation records
- [Marosa VAT VeriFactu Guide](https://marosavat.com/vat-news/verifactu-spain-2026-guide) - VeriFactu implementation timeline
- [Autonomos y Emprendedor](https://www.autonomosyemprendedor.es/articulo/tu-negocio/que-deben-hacer-autonomos-han-cometido-errores-emitir-factura/20220801142501027430.html) - Factura rectificativa vs anulada

### Tertiary (LOW confidence)

- [Medium: Offline-First PWA with Supabase](https://medium.com/@oluwadaprof/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9) - Sync queue patterns
- [LogRocket: Offline-First Apps 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) - General patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Dexie.js is well-documented, widely used, verified via official docs
- Architecture: HIGH - Patterns verified against official Dexie docs and IndexedDB best practices
- Spanish compliance: MEDIUM-HIGH - Based on official BOE/AEAT sources, some edge cases unclear
- Pitfalls: HIGH - Based on documented browser behaviors and community reports

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - Dexie.js stable, Spanish regulations not changing soon)
