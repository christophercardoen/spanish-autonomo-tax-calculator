# Architecture Patterns: v2.0 Business Management System

**Domain:** Spanish autonomo CRM, invoicing, expense management, tax automation
**Researched:** 2026-02-03
**Focus:** Integration design for adding CRM, invoicing, expenses to existing tax calculator

---

## Executive Summary

Transforming the v1.1 single-file HTML tax calculator (8,980 lines, localStorage-based) into a unified business management system requires a carefully designed architecture that:

1. **Preserves the validated tax calculation engine** - Don't rewrite what works
2. **Introduces proper data relationships** - Clients, invoices, expenses, calendar days all interconnected
3. **Enables cross-device sync** - Desktop + mobile with offline capability
4. **Supports 4-year document retention** - Receipts, invoices per Spanish tax law
5. **Maintains the single-file simplicity for the UI** - While adding a proper data layer

**Recommended approach:** Progressive enhancement with IndexedDB (via Dexie.js) for local storage, with cloud backup/sync layer added afterward. Build the data architecture first, migrate features incrementally.

---

## Data Model

### Entity Design

The v2.0 system requires these core entities with relationships:

```
┌─────────────┐     1:N     ┌─────────────┐     1:N     ┌──────────────┐
│   CLIENT    │─────────────│   PROJECT   │─────────────│   INVOICE    │
│             │             │             │             │              │
│ id          │             │ id          │             │ id           │
│ name        │             │ clientId    │◄────────────│ projectId    │
│ email       │             │ name        │             │ invoiceNumber│
│ nif         │             │ rate        │             │ status       │
│ address     │             │ startDate   │             │ dateIssued   │
│ country     │             │ endDate     │             │ dateDue      │
│ isEU        │             │ status      │             │ datePaid     │
│ notes       │             │ description │             │ total        │
│ createdAt   │             │ createdAt   │             │ pdfUrl       │
│ updatedAt   │             │ updatedAt   │             │ verifactuQR  │
│ deletedAt   │             │ deletedAt   │             │ createdAt    │
└─────────────┘             └─────────────┘             │ deletedAt    │
       │                           │                    └──────────────┘
       │                           │                           │
       │ 1:N                       │ N:M                       │ 1:N
       │                           │                           │
       ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐             ┌──────────────┐
│  CONTACT    │             │CALENDAR_DAY │             │ INVOICE_LINE │
│             │             │             │             │              │
│ id          │             │ id          │             │ id           │
│ clientId    │             │ date        │             │ invoiceId    │
│ name        │             │ location    │◄──────────┐ │ description  │
│ email       │             │ clientId    │           │ │ quantity     │
│ phone       │             │ projectId   │           │ │ rate         │
│ role        │             │ notes       │           │ │ amount       │
│ isPrimary   │             │ source      │           │ │ calendarDayId│
└─────────────┘             │ isContracted│           │ └──────────────┘
                            │ createdAt   │           │
                            │ updatedAt   │           │
                            └─────────────┘           │
                                   │                  │
                                   │ N:M              │
                                   │                  │
                                   ▼                  │
                            ┌─────────────┐           │
                            │   EXPENSE   │───────────┘
                            │             │   N:M (expense can appear on invoice)
                            │ id          │
                            │ date        │
                            │ amount      │
                            │ vendor      │
                            │ category    │
                            │ clientId    │ (nullable - overhead vs client-specific)
                            │ projectId   │ (nullable)
                            │ isDeductible│
                            │ deductionPct│
                            │ description │
                            │ createdAt   │
                            │ updatedAt   │
                            │ deletedAt   │
                            └─────────────┘
                                   │
                                   │ 1:N
                                   ▼
                            ┌─────────────┐
                            │   RECEIPT   │
                            │             │
                            │ id          │
                            │ expenseId   │
                            │ filename    │
                            │ mimeType    │
                            │ fileSize    │
                            │ blobData    │ (or cloudUrl for sync)
                            │ ocrData     │ (extracted text/fields)
                            │ ocrStatus   │ (pending/completed/failed)
                            │ uploadedAt  │
                            └─────────────┘

Junction Tables for N:M relationships:

┌────────────────────┐     ┌────────────────────┐
│ CALENDAR_EXPENSE   │     │ INVOICE_EXPENSE    │
│                    │     │                    │
│ calendarDayId      │     │ invoiceId          │
│ expenseId          │     │ expenseId          │
└────────────────────┘     └────────────────────┘
```

### Entity Specifications

#### Client
```typescript
interface Client {
  id: string;                    // UUID
  name: string;                  // Company/individual name
  email: string;                 // Primary contact email
  nif: string | null;            // Tax ID (NIF/CIF for Spain, VAT for EU)
  address: Address;              // Structured address
  country: string;               // ISO country code
  isEU: boolean;                 // Computed from country (affects IVA)
  currency: string;              // Default invoice currency
  paymentTerms: number;          // Days until due (default 30)
  notes: string;                 // Free-form notes
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;        // Soft delete for retention
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  region: string | null;         // Province/state
  country: string;
}
```

#### Invoice
```typescript
interface Invoice {
  id: string;
  projectId: string | null;      // Optional project link
  clientId: string;              // Required - derived from project or direct
  invoiceNumber: string;         // Auto-generated: "2026-001", "2026-002"
  series: string;                // For VeriFactu: "F" for facturas
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dateIssued: Date;
  dateDue: Date;
  datePaid: Date | null;
  subtotal: number;
  taxRate: number;               // IVA rate (21%, 0% for exports)
  taxAmount: number;
  total: number;
  currency: string;
  notes: string;                 // Invoice footer notes
  pdfBlobId: string | null;      // Reference to generated PDF
  verifactuQR: string | null;    // QR code data for VeriFactu
  verifactuHash: string | null;  // Hash for compliance
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;        // Soft delete - NEVER hard delete invoices
}
```

#### Expense
```typescript
interface Expense {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  vendor: string;
  category: ExpenseCategory;
  subcategory: string | null;
  clientId: string | null;       // Link to client if client-specific
  projectId: string | null;      // Link to project if project-specific
  isDeductible: boolean;
  deductionPct: number;          // 0-100
  baseAmount: number | null;     // For partial deductions (rent 30%)
  description: string;
  paymentMethod: 'card' | 'transfer' | 'cash';
  hasValidReceipt: boolean;      // For compliance warnings
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;        // Soft delete for 4-year retention
}

type ExpenseCategory =
  | 'office'           // Rent, utilities, internet
  | 'travel'           // Flights, hotels, transport
  | 'equipment'        // Hardware, software
  | 'professional'     // Training, subscriptions
  | 'meals'            // Dietas-eligible
  | 'communication'    // Phone, internet
  | 'private';         // Non-deductible
```

#### CalendarDay
```typescript
interface CalendarDay {
  id: string;
  date: Date;                    // Date only (no time)
  location: 'spain' | 'belgium' | 'travel' | 'other';
  country: string | null;        // ISO code for 'other' locations
  clientId: string | null;       // Client worked for
  projectId: string | null;      // Project worked on
  notes: string;
  source: 'manual' | 'google' | 'ical';  // Where the entry came from
  externalId: string | null;     // Google Calendar event ID
  isContracted: boolean;         // Part of contracted pattern
  createdAt: Date;
  updatedAt: Date;
}
```

### Soft Deletes and Retention

**Critical for financial compliance:**

```typescript
// Soft delete pattern
interface SoftDeletable {
  deletedAt: Date | null;
}

// Entities that MUST use soft delete (4-year retention):
// - Client (invoices reference it)
// - Invoice (legal document)
// - Expense (tax deduction proof)
// - Receipt (document retention)

// Entities that CAN hard delete:
// - Contact (if client retained)
// - CalendarDay (not legally required)
// - Project (if no invoices linked)
```

**Audit trail (future consideration):**
```typescript
interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  changes: Record<string, { old: any; new: any }>;
  userId: string | null;         // For future multi-user
  timestamp: Date;
}
```

---

## Component Architecture

### Layered Architecture

The v2.0 system follows a clean layered architecture that separates concerns:

```
┌────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                │
│  autonomo_dashboard.html (single-file, maintains v1.1 approach) │
│  - Tab components (Clients, Invoices, Calendar, Expenses, Tax)  │
│  - Event handlers, DOM manipulation                             │
│  - Vanilla JS, no framework                                     │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Events / State Updates
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  - State management (reactive updates)                          │
│  - Workflow orchestration (invoice creation flow)               │
│  - Form validation                                              │
│  - UI state (modals, selections, filters)                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Service Calls
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  Services encapsulate business logic per domain:                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ClientService │  │InvoiceService│  │ExpenseService│          │
│  │              │  │              │  │              │          │
│  │ createClient │  │ createInvoice│  │ createExpense│          │
│  │ updateClient │  │ sendInvoice  │  │ linkToCalendar│         │
│  │ getClients   │  │ markPaid     │  │ uploadReceipt│          │
│  │ getActivity  │  │ generatePDF  │  │ categorize   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │CalendarService│ │  TaxService  │  │  SyncService │          │
│  │              │  │              │  │              │          │
│  │ setDayStatus │  │ calculateIRPF│  │ syncToCloud  │          │
│  │ tagClient    │  │ modelo130    │  │ syncFromCloud│          │
│  │ linkExpense  │  │ retaEstimate │  │ resolveConflict│        │
│  │ get183Count  │  │ projections  │  │ queueOffline │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Repository Calls
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                            │
│  Abstracts data access from business logic:                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    DataRepository                         │  │
│  │                                                           │  │
│  │  // Generic CRUD with soft delete support                 │  │
│  │  create(entity): Promise<T>                               │  │
│  │  update(id, changes): Promise<T>                          │  │
│  │  delete(id, soft=true): Promise<void>                     │  │
│  │  findById(id, includeDeleted=false): Promise<T|null>      │  │
│  │  findAll(filters, includeDeleted=false): Promise<T[]>     │  │
│  │                                                           │  │
│  │  // Relationship helpers                                  │  │
│  │  findByClient(clientId): Promise<T[]>                     │  │
│  │  findByDateRange(start, end): Promise<T[]>                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Database Operations
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  Dexie.js wrapping IndexedDB:                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      AppDatabase                          │  │
│  │                                                           │  │
│  │  // Tables with indexes                                   │  │
│  │  clients: 'id, name, email, country, deletedAt'           │  │
│  │  contacts: 'id, clientId, email'                          │  │
│  │  projects: 'id, clientId, status, deletedAt'              │  │
│  │  invoices: 'id, clientId, projectId, status, dateIssued'  │  │
│  │  invoiceLines: 'id, invoiceId'                            │  │
│  │  expenses: 'id, clientId, date, category, deletedAt'      │  │
│  │  receipts: 'id, expenseId'                                │  │
│  │  calendarDays: 'id, date, clientId, location'             │  │
│  │  syncQueue: 'id, entityType, entityId, action, timestamp' │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Service Specifications

#### ClientService
```typescript
class ClientService {
  // CRUD
  async createClient(data: ClientInput): Promise<Client>;
  async updateClient(id: string, changes: Partial<Client>): Promise<Client>;
  async deleteClient(id: string): Promise<void>; // Soft delete

  // Queries
  async getClients(filters?: ClientFilters): Promise<Client[]>;
  async getClientById(id: string): Promise<Client | null>;
  async searchClients(query: string): Promise<Client[]>;

  // Relationships
  async getClientActivity(id: string): Promise<ClientActivity>;
  async getClientProfitability(id: string): Promise<Profitability>;

  // Computed
  determineIsEU(country: string): boolean;
}

interface ClientActivity {
  invoices: Invoice[];
  expenses: Expense[];
  calendarDays: CalendarDay[];
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
}
```

#### InvoiceService
```typescript
class InvoiceService {
  // CRUD
  async createInvoice(data: InvoiceInput): Promise<Invoice>;
  async updateInvoice(id: string, changes: Partial<Invoice>): Promise<Invoice>;
  async deleteInvoice(id: string): Promise<void>; // Soft delete only

  // Workflow
  async sendInvoice(id: string): Promise<Invoice>; // draft -> sent
  async markPaid(id: string, datePaid: Date): Promise<Invoice>;
  async markOverdue(id: string): Promise<Invoice>;
  async cancelInvoice(id: string): Promise<Invoice>;

  // Generation
  async generatePDF(id: string): Promise<Blob>;
  async generateVerifactuQR(id: string): Promise<string>;
  async getNextInvoiceNumber(series: string): Promise<string>;

  // Queries
  async getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  async getOverdueInvoices(): Promise<Invoice[]>;
  async getInvoicesForQuarter(year: number, quarter: number): Promise<Invoice[]>;

  // Auto-populate
  async populateFromCalendarDays(
    clientId: string,
    dateRange: DateRange
  ): Promise<InvoiceLineInput[]>;
}
```

#### ExpenseService
```typescript
class ExpenseService {
  // CRUD
  async createExpense(data: ExpenseInput): Promise<Expense>;
  async updateExpense(id: string, changes: Partial<Expense>): Promise<Expense>;
  async deleteExpense(id: string): Promise<void>; // Soft delete

  // Receipt handling
  async uploadReceipt(expenseId: string, file: File): Promise<Receipt>;
  async processOCR(receiptId: string): Promise<OCRResult>;
  async createExpenseFromReceipt(file: File): Promise<Expense>; // OCR flow

  // Linking
  async linkToCalendarDay(expenseId: string, dayId: string): Promise<void>;
  async linkToClient(expenseId: string, clientId: string): Promise<void>;
  async linkToInvoice(expenseId: string, invoiceId: string): Promise<void>;

  // Categorization
  async suggestCategory(vendor: string, description: string): Promise<CategorySuggestion>;
  async suggestDeductibility(category: ExpenseCategory): Promise<DeductibilitySuggestion>;

  // Queries
  async getExpensesForPeriod(start: Date, end: Date): Promise<Expense[]>;
  async getExpensesByCategory(category: ExpenseCategory): Promise<Expense[]>;
  async getExpensesWithoutReceipt(): Promise<Expense[]>;
  async getDeductibleExpenses(year: number): Promise<Expense[]>;
}
```

#### CalendarService
```typescript
class CalendarService {
  // Day management
  async setDayStatus(date: Date, location: Location): Promise<CalendarDay>;
  async tagDayWithClient(date: Date, clientId: string): Promise<CalendarDay>;
  async setBulkDays(dates: Date[], status: Partial<CalendarDay>): Promise<void>;

  // 183-day tracking (CRITICAL - preserved from v1.1)
  async get183Count(country: string, year: number): Promise<Count183Result>;
  async getWarningStatus(): Promise<WarningLevel>;

  // Queries
  async getMonth(year: number, month: number): Promise<CalendarDay[]>;
  async getDaysForClient(clientId: string): Promise<CalendarDay[]>;
  async getWorkPatterns(): Promise<WorkPattern[]>;

  // External sync
  async syncWithGoogle(calendarId: string): Promise<SyncResult>;
  async exportICS(): Promise<string>;
  async importICS(icsData: string): Promise<ImportResult>;
}
```

#### TaxService (preserves v1.1 calculation engine)
```typescript
class TaxService {
  // Core calculations (from v1.1 - UNCHANGED)
  calculateIRPF(params: IRPFParams): IRPFResult;
  calculateRETA(): RETAResult;
  calculateCuotaIntegra(baseLiquidable: number, minimoTotal: number): number;
  calculateGastosDificil(rendimientoNetoPrevio: number): number;

  // NEW: Real data integration
  async calculateFromRealData(year: number): Promise<TaxSummary>;
  async getQuarterlyModelo130(year: number, quarter: number): Promise<Modelo130>;
  async estimateRETARegularization(year: number): Promise<RETARegularization>;
  async getAnnualIRPFSummary(year: number): Promise<AnnualIRPF>;

  // Projections (replaces static scenarios)
  async projectNextQuarter(assumptions: ProjectionAssumptions): Promise<Projection>;
  async projectAnnual(assumptions: ProjectionAssumptions): Promise<Projection>;

  // Compliance
  get183Warning(year: number): WarningLevel;
  getDeductibilityCompliance(): ComplianceReport;
}
```

---

## Integration Points

### How Features Connect

```
                    ┌─────────────────────────────────────────────────────┐
                    │                USER ACTIONS                          │
                    └─────────────────────────────────────────────────────┘
                                            │
        ┌───────────────────────┬───────────┴───────────┬───────────────────┐
        ▼                       ▼                       ▼                   ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐   ┌───────────────┐
│ Add Client    │       │ Create Invoice│       │ Upload Receipt│   │ Mark Day      │
│               │       │               │       │               │   │ in Calendar   │
│ → Contacts    │       │ → Select      │       │ → OCR extract │   │               │
│ → Projects    │       │   client      │       │ → Create      │   │ → Tag client  │
│ → Payment     │       │ → Add days    │       │   expense     │   │ → Link expense│
│   terms       │       │   from cal    │       │ → Link to day │   │ → 183 count   │
└───────────────┘       │ → Add expenses│       │ → Categorize  │   └───────────────┘
        │               │ → Generate PDF│       │ → Link client │           │
        │               └───────────────┘       └───────────────┘           │
        │                       │                       │                   │
        └───────────────────────┼───────────────────────┼───────────────────┘
                                │                       │
                                ▼                       ▼
                    ┌─────────────────────────────────────────────────────┐
                    │               AUTOMATIC UPDATES                      │
                    │                                                      │
                    │  When invoice created:                               │
                    │    → Update client total revenue                     │
                    │    → Recalculate quarterly Modelo 130                │
                    │    → Update annual IRPF projection                   │
                    │                                                      │
                    │  When expense created:                               │
                    │    → Update client total expenses (if linked)        │
                    │    → Recalculate deductibles                         │
                    │    → Update tax projections                          │
                    │                                                      │
                    │  When calendar day tagged:                           │
                    │    → Update 183-day count                            │
                    │    → Suggest invoice days                            │
                    │    → Show trip expenses                              │
                    └─────────────────────────────────────────────────────┘
                                            │
                                            ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                 TAX DASHBOARD                        │
                    │                                                      │
                    │  Real-time visibility:                               │
                    │    → Current quarter Modelo 130 liability            │
                    │    → Year-to-date IRPF calculation                   │
                    │    → RETA regularization exposure                    │
                    │    → 183-day warning status                          │
                    │    → Client profitability breakdown                  │
                    └─────────────────────────────────────────────────────┘
```

### Key Integration Flows

#### 1. Invoice Creation Flow
```
User clicks "New Invoice" for Client X
    │
    ├─► InvoiceService.createInvoice()
    │       │
    │       ├─► Auto-generate invoice number (2026-001)
    │       ├─► Copy client details (address, NIF)
    │       └─► Set default payment terms from client
    │
    ├─► Prompt: "Populate from calendar days?"
    │       │
    │       └─► CalendarService.getDaysForClient(clientId)
    │               │
    │               └─► Show days tagged with this client
    │                       │
    │                       └─► User selects days to invoice
    │                               │
    │                               └─► Create invoice lines (days * rate)
    │
    ├─► Prompt: "Add expenses?"
    │       │
    │       └─► ExpenseService.getExpensesForClient(clientId)
    │               │
    │               └─► Show unbilled expenses
    │                       │
    │                       └─► User selects expenses to add
    │
    └─► Generate PDF with VeriFactu QR
            │
            └─► TaxService.recalculate()
                    │
                    ├─► Update Modelo 130 estimate
                    └─► Update annual IRPF projection
```

#### 2. Expense from Receipt Flow
```
User uploads receipt photo
    │
    ├─► ExpenseService.uploadReceipt()
    │       │
    │       ├─► Store blob in receipts table
    │       └─► Queue for OCR processing
    │
    ├─► ExpenseService.processOCR()
    │       │
    │       ├─► Extract: date, amount, vendor
    │       └─► Return for review
    │
    ├─► User reviews/edits extracted data
    │
    ├─► ExpenseService.suggestCategory(vendor)
    │       │
    │       └─► Return category + deductibility suggestion
    │
    ├─► Prompt: "Link to client/trip?"
    │       │
    │       ├─► Show recent clients
    │       └─► Show calendar days around expense date
    │
    └─► ExpenseService.createExpense()
            │
            └─► TaxService.recalculate()
```

#### 3. Calendar Day with Client Tag
```
User marks Monday 2026-03-02 as Belgium with Client X
    │
    ├─► CalendarService.setDayStatus()
    │       │
    │       ├─► Create/update CalendarDay
    │       ├─► Set location: 'belgium'
    │       └─► Set clientId: X
    │
    ├─► CalendarService.get183Count('belgium', 2026)
    │       │
    │       ├─► Count all Belgium days
    │       └─► Check against thresholds (170, 180, 183)
    │
    ├─► If threshold crossed:
    │       │
    │       └─► Show warning banner
    │
    └─► Suggest: "Link hotel expense from 2026-03-01?"
            │
            └─► Show expenses near this date without calendar link
```

---

## Data Flow Patterns

### State Management

The application uses a centralized state with reactive updates:

```javascript
// Central state store
const AppState = {
  // UI state
  ui: {
    activeTab: 'clients',
    selectedClient: null,
    modalOpen: null,
    filters: {}
  },

  // Data cache (mirrors IndexedDB)
  cache: {
    clients: Map<string, Client>,
    invoices: Map<string, Invoice>,
    expenses: Map<string, Expense>,
    calendarDays: Map<string, CalendarDay>
  },

  // Computed values (recalculated on change)
  computed: {
    taxSummary: TaxSummary,
    clientProfitability: Map<string, Profitability>,
    count183: number,
    overdueInvoices: Invoice[]
  }
};

// Subscription pattern for reactive updates
const subscribers = new Set<(state: AppState) => void>();

function updateState(path: string, value: any) {
  // Update state
  set(AppState, path, value);

  // Recalculate computed values if data changed
  if (path.startsWith('cache.')) {
    recalculateComputed();
  }

  // Notify subscribers
  subscribers.forEach(fn => fn(AppState));

  // Queue for sync if needed
  if (path.startsWith('cache.')) {
    SyncService.queueChange(path, value);
  }
}
```

### Offline Sync Queue

```javascript
// Sync queue entry
interface QueueEntry {
  id: string;
  entityType: 'client' | 'invoice' | 'expense' | 'calendarDay' | 'receipt';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retryCount: number;
}

// Queue operations when offline
async function queueOfflineChange(entry: QueueEntry) {
  await db.syncQueue.add(entry);
}

// Process queue when online
async function processSyncQueue() {
  const entries = await db.syncQueue.orderBy('timestamp').toArray();

  for (const entry of entries) {
    try {
      await syncToCloud(entry);
      await db.syncQueue.delete(entry.id);
    } catch (error) {
      if (isConflict(error)) {
        await resolveConflict(entry, error.serverVersion);
      } else {
        entry.retryCount++;
        await db.syncQueue.put(entry);
      }
    }
  }
}
```

---

## Integration with v1.1 Components

### What to KEEP Unchanged

The following v1.1 code works correctly and should be preserved as-is:

```javascript
// IRPF calculation functions (validated against official sources)
function calculateFullIRPF(monthlyRevenue, monthlyDeductibleExpenses, hasDescendant)
function calculateFullIRPFWithFiscal(...)
function calculateFullIRPFWithConfig(...)
function calculateCuotaIntegra(baseLiquidable, minimoTotal)
function calculateGastosDificil(rendimientoNetoPrevio)

// RETA calculation
const FISCAL_2025 = { ... }  // Official rates

// Format utilities
function formatEUR(amount)
function formatPercent(rate)
```

### What to TRANSFORM

#### Scenarios → Dynamic Projections

**v1.1 (static scenarios):**
```javascript
const SCENARIO_PRESETS = {
  'A': { monthlyRevenue: 3000, monthlyExpenses: 750, workTravelCost: 1000 },
  'B': { monthlyRevenue: 6000, monthlyExpenses: 1500, workTravelCost: 1000 },
  // ...
};
```

**v2.0 (dynamic projections):**
```javascript
async function createProjection(assumptions) {
  // Get real data
  const ytdInvoices = await InvoiceService.getInvoicesForYear(2026);
  const ytdExpenses = await ExpenseService.getExpensesForYear(2026);

  // Calculate actual YTD
  const actualRevenue = ytdInvoices.reduce((sum, i) => sum + i.total, 0);
  const actualExpenses = ytdExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Project remaining months with assumptions
  const remainingMonths = 12 - currentMonth;
  const projectedRevenue = actualRevenue + (assumptions.monthlyRevenue * remainingMonths);
  const projectedExpenses = actualExpenses + (assumptions.monthlyExpenses * remainingMonths);

  // Calculate full-year tax
  return TaxService.calculateIRPF({
    annualRevenue: projectedRevenue,
    annualExpenses: projectedExpenses,
    hasDescendant: assumptions.hasDescendant
  });
}
```

#### Manual Income Entry → Invoice-Driven Income

**v1.1 (manual entry):**
```javascript
const incomeEntry = {
  id: 'income-1234567890',
  clientName: 'Acme Corp',      // Free text
  invoiceNumber: 'INV-001',     // Free text
  amount: 5000,
  dateReceived: '2026-03-15',
  status: 'paid'
};
```

**v2.0 (invoice-driven):**
```javascript
const invoice = {
  id: 'inv_abc123',
  clientId: 'client_xyz',       // Foreign key
  projectId: 'proj_456',        // Foreign key
  invoiceNumber: '2026-001',    // Auto-generated
  total: 5000,
  status: 'paid',
  datePaid: '2026-03-15'
};

// Income derived from paid invoices
async function getIncomeForPeriod(start, end) {
  return await db.invoices
    .where('datePaid').between(start, end)
    .and(i => i.status === 'paid')
    .toArray();
}
```

#### Expense Categories → Richer Model

**v1.1 (simple categories):**
```javascript
const expenseData = {
  categories: {
    spainDeductible: [
      { id: 'huur', name: 'Rent (30%)', baseAmount: 1155, deductionPct: 30 }
    ],
    workTravel: [...],
    private: [...]
  }
};
```

**v2.0 (entity-based):**
```javascript
const expense = {
  id: 'exp_123',
  date: new Date('2026-03-01'),
  amount: 1155,
  vendor: 'Landlord',
  category: 'office',
  subcategory: 'rent',
  isDeductible: true,
  deductionPct: 30,
  baseAmount: 1155,
  clientId: null,           // Overhead expense
  receiptId: 'rcpt_456',    // Linked receipt
  calendarDayIds: []        // Not trip-related
};
```

#### Belgium Calendar → Multi-Client Calendar

**v1.1 (location-only):**
```javascript
const calendarState = {
  days: {
    '2026-03-02': 'belgium',    // Just location
    '2026-03-03': 'spain',
    '2026-03-04': 'travel'
  }
};
```

**v2.0 (rich entity):**
```javascript
const calendarDay = {
  id: 'day_20260302',
  date: new Date('2026-03-02'),
  location: 'belgium',
  clientId: 'client_acme',      // Who I worked for
  projectId: 'proj_consulting', // Which project
  notes: 'On-site meetings',
  isContracted: true,           // Part of contractual pattern
  expenseIds: ['exp_hotel', 'exp_dinner']  // Linked expenses
};
```

---

## Build Order Recommendation

### Suggested Phase Structure

Based on dependencies, the build order should be:

```
Phase 1: Data Architecture Foundation (REQUIRED FIRST)
    │
    ├─► Set up Dexie.js database schema
    ├─► Create repository layer
    ├─► Implement soft delete pattern
    ├─► Build localStorage → IndexedDB migration
    └─► Create basic CRUD for all entities

Phase 2: Client Management
    │
    ├─► Client CRUD (create, read, update, soft delete)
    ├─► Contact management (1:N relationship)
    ├─► Client list with search/filter
    ├─► Client detail view
    └─► EU vs non-EU categorization

Phase 3: Project Tracking
    │
    ├─► Project CRUD linked to clients
    ├─► Project status workflow
    └─► Rate tracking per project

Phase 4: Calendar Enhancement
    │
    ├─► Migrate calendar to IndexedDB
    ├─► Add client tagging to days
    ├─► Add project tagging to days
    ├─► Preserve 183-day calculation (CRITICAL)
    └─► Work pattern templates

Phase 5: Expense Enhancement
    │
    ├─► Migrate expenses to IndexedDB
    ├─► Add client/project linking
    ├─► Add calendar day linking
    ├─► Category auto-suggestion
    └─► Receipt entity (without OCR yet)

Phase 6: Invoice Generation
    │
    ├─► Invoice CRUD
    ├─► Invoice line items
    ├─► Auto-populate from calendar/expenses
    ├─► Status workflow (draft → sent → paid)
    ├─► PDF generation (jsPDF)
    └─► VeriFactu QR codes

Phase 7: Receipt Upload & OCR
    │
    ├─► File upload to IndexedDB
    ├─► Display receipt images
    ├─► OCR integration (cloud service)
    └─► Extract → review → create expense flow

Phase 8: Tax Automation
    │
    ├─► Modelo 130 from real data
    ├─► RETA regularization estimator
    ├─► Annual IRPF summary
    ├─► Replace scenarios with projections
    └─► Tax calendar with deadlines

Phase 9: Sync & Multi-Device
    │
    ├─► Online/offline detection
    ├─► Sync queue implementation
    ├─► Cloud backup (Supabase/Firebase)
    ├─► Conflict resolution
    └─► Mobile responsive polish

Phase 10: Calendar Sync (Optional)
    │
    ├─► Google Calendar API integration
    ├─► Bidirectional sync
    └─► Event → CalendarDay mapping
```

### Phase Rationale

| Phase | Why This Order |
|-------|----------------|
| 1. Data Architecture | **Foundation** - Everything depends on proper data storage. Can't build features without persistence layer. |
| 2. Client Management | **Core entity** - Invoices and expenses need clients. Build the entity other things reference. |
| 3. Project Tracking | **Client extension** - Projects are optional but enable better organization before invoicing. |
| 4. Calendar Enhancement | **Core feature preservation** - 183-day tracking is critical. Add client tagging early. |
| 5. Expense Enhancement | **Links to calendar** - Expenses link to calendar days. Needs calendar first. |
| 6. Invoice Generation | **Depends on clients + calendar** - Invoices auto-populate from days, need clients for details. |
| 7. Receipt/OCR | **Enhancement to expenses** - OCR creates expenses, so expense system must exist. |
| 8. Tax Automation | **Reads all data** - Tax calculations need invoices + expenses + calendar. Must be later. |
| 9. Sync | **Nice-to-have** - System works offline-first. Sync adds value but not critical path. |
| 10. Calendar Sync | **Lowest priority** - Complex integration, high effort, can defer. |

### Migration Strategy

The migration from v1.1 localStorage to v2.0 IndexedDB should be transparent to the user:

```javascript
// Migration approach: check on load, migrate once

async function initializeDatabase() {
  // 1. Initialize Dexie database
  await db.open();

  // 2. Check for v1.1 localStorage data
  const hasLegacyExpenses = localStorage.getItem('autonomo_expenses_v1');
  const hasLegacyIncome = localStorage.getItem('autonomo_income_v1');
  const hasLegacyScenarios = localStorage.getItem('autonomo_scenarios_v1');
  const hasLegacyCalendar = localStorage.getItem('autonomoCalendarState');

  // 3. Check if already migrated
  const migrationDone = await db.meta.get('migration_v1_complete');

  if (!migrationDone && (hasLegacyExpenses || hasLegacyIncome || hasLegacyCalendar)) {
    await migrateFromLocalStorage();
  }
}

async function migrateFromLocalStorage() {
  // Show migration UI
  showMigrationProgress('Migrating your data...');

  try {
    // Migrate expenses
    const expenseData = JSON.parse(localStorage.getItem('autonomo_expenses_v1'));
    if (expenseData) {
      for (const category of Object.keys(expenseData.categories)) {
        for (const expense of expenseData.categories[category]) {
          await db.expenses.add(transformLegacyExpense(expense, category));
        }
      }
    }

    // Migrate income → invoices
    const incomeData = JSON.parse(localStorage.getItem('autonomo_income_v1'));
    if (incomeData?.entries) {
      for (const entry of incomeData.entries) {
        // Create client from income entry
        const client = await findOrCreateClient(entry.clientName);

        // Create invoice from income entry
        await db.invoices.add(transformLegacyIncome(entry, client.id));
      }
    }

    // Migrate calendar
    const calendarData = JSON.parse(localStorage.getItem('autonomoCalendarState'));
    if (calendarData?.days) {
      for (const [dateStr, location] of Object.entries(calendarData.days)) {
        await db.calendarDays.add({
          id: `day_${dateStr.replace(/-/g, '')}`,
          date: new Date(dateStr),
          location: location,
          clientId: null,
          projectId: null,
          source: 'migration'
        });
      }
    }

    // Mark migration complete
    await db.meta.put({ key: 'migration_v1_complete', value: true });

    // DO NOT delete localStorage yet - keep as backup
    // localStorage can be cleared after user confirms data looks correct

    hideMigrationProgress();
    showSuccess('Migration complete! Your data is now stored securely.');

  } catch (error) {
    hideMigrationProgress();
    showError('Migration failed. Your original data is safe in localStorage.');
    console.error('Migration error:', error);
  }
}
```

---

## Cross-Cutting Concerns

### Offline Capability

The system should work fully offline with sync when online:

```javascript
// Service worker for offline capability
// register in main HTML
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
self.addEventListener('fetch', (event) => {
  // Cache-first for static assets
  if (event.request.destination === 'document' ||
      event.request.destination === 'script' ||
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }

  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open('api-cache').then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### Data Validation

```javascript
// Validation schemas (using simple runtime validation)
const validators = {
  client: {
    name: (v) => v && v.trim().length > 0 || 'Name is required',
    email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email',
    nif: (v) => !v || validateNIF(v) || 'Invalid NIF format',
    country: (v) => v && COUNTRIES.includes(v) || 'Invalid country'
  },

  invoice: {
    clientId: (v) => v || 'Client is required',
    dateIssued: (v) => v instanceof Date || 'Date is required',
    total: (v) => typeof v === 'number' && v > 0 || 'Total must be positive'
  },

  expense: {
    date: (v) => v instanceof Date || 'Date is required',
    amount: (v) => typeof v === 'number' && v > 0 || 'Amount must be positive',
    category: (v) => EXPENSE_CATEGORIES.includes(v) || 'Invalid category'
  }
};

function validate(entity, type) {
  const errors = {};
  const schema = validators[type];

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(entity[field]);
    if (result !== true) {
      errors[field] = result;
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
}
```

### Error Handling

```javascript
// Centralized error handling
class AppError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  OCR_ERROR: 'OCR_ERROR'
};

// UI error display
function handleError(error) {
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCodes.VALIDATION_ERROR:
        showValidationErrors(error.details);
        break;
      case ErrorCodes.NETWORK_ERROR:
        showOfflineWarning();
        break;
      case ErrorCodes.STORAGE_ERROR:
        showStorageWarning();
        break;
      default:
        showGenericError(error.message);
    }
  } else {
    console.error('Unexpected error:', error);
    showGenericError('An unexpected error occurred');
  }
}
```

### Security Considerations

```javascript
// Financial data security measures

// 1. No sensitive data in URLs
// BAD: /client/123?nif=B12345678
// GOOD: /client/123 (NIF fetched via POST)

// 2. Clear sensitive data from memory when not needed
function clearSensitiveData() {
  // Clear any cached passwords, tokens, NIFs from memory
  AppState.cache.sensitiveData = null;
}

// 3. Export data with encryption option
async function exportData(includeReceipts = false, password = null) {
  const data = await gatherExportData(includeReceipts);

  if (password) {
    // Encrypt with user password
    const encrypted = await encryptData(data, password);
    return new Blob([encrypted], { type: 'application/octet-stream' });
  }

  return new Blob([JSON.stringify(data)], { type: 'application/json' });
}

// 4. 4-year retention with secure deletion after
async function purgeOldData() {
  const fourYearsAgo = new Date();
  fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

  // Only purge soft-deleted items older than 4 years
  await db.transaction('rw', [db.invoices, db.expenses, db.receipts], async () => {
    await db.invoices
      .where('deletedAt').below(fourYearsAgo)
      .delete();

    await db.expenses
      .where('deletedAt').below(fourYearsAgo)
      .delete();

    // Also delete associated receipts
    // ...
  });
}
```

---

## Technology Recommendations

### Recommended Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| UI | Vanilla JS (single-file HTML) | Preserves v1.1 approach, no build tools |
| State | Custom reactive store | Simple, no dependencies |
| Database | Dexie.js (IndexedDB wrapper) | Best DX, used by WhatsApp Web, Microsoft To Do |
| PDF | jsPDF + html2canvas | Client-side, no server needed |
| OCR | Mindee API or Google Cloud Vision | Accurate receipt extraction |
| Cloud Sync | Supabase | Simple, generous free tier, PostgreSQL |
| File Storage | Supabase Storage | Integrated with sync, 4-year retention |

### Why Dexie.js over Alternatives

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Raw IndexedDB | No dependencies | Complex API, verbose | Avoid |
| Dexie.js | Clean API, great docs, widely used | Extra ~40KB | **Recommended** |
| PouchDB | CouchDB sync built-in | Heavier, sync requires CouchDB | Overkill |
| RxDB | Reactive, powerful | Complex, React-focused | Overkill |
| localForage | Simple API | No relationships, no queries | Insufficient |

---

## Sources

### Architecture Patterns
- [LogRocket: Offline-first frontend apps in 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Medium: Offline-First Architecture](https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79)
- [Dexie.js Official Documentation](https://dexie.org/)
- [DEV.to: Frontend Architecture Patterns 2026](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo)

### Data Model Design
- [Redgate: ER Diagram for Invoice Management](https://www.red-gate.com/blog/erd-for-invoice-management)
- [GeeksforGeeks: CRM Database Design](https://www.geeksforgeeks.org/dbms/how-to-design-a-relational-database-for-customer-relationship-management-crm/)
- [Chargebee: Object Relationship Model](https://www.chargebee.com/docs/2.0/object-relationship.html)

### Migration & Soft Delete
- [Medium: Replacing LocalStorage with IndexedDB](https://xon5.medium.com/replacing-localstorage-with-indexeddb-2e11a759ff0c)
- [RxDB: Migration Storage](https://rxdb.info/migration-storage.html)
- [Marty Friedel: Deleting data - soft, hard or audit](https://www.martyfriedel.com/blog/deleting-data-soft-hard-or-audit)
- [Medium: Soft Deletes Without Breaking Database](https://medium.com/@sohail_saifii/how-to-implement-soft-deletes-without-breaking-your-database-48bc9872843f)

### Calendar Integration
- [Google Developers: Synchronize resources efficiently](https://developers.google.com/workspace/calendar/api/guides/sync)
- [CalendHub: Bidirectional Calendar Sync 2025](https://calendhub.com/blog/implement-bidirectional-calendar-sync-2025/)

### Receipt/OCR
- [DZone: Building a Receipt Scanner App](https://dzone.com/articles/building-a-receipt-scanner-app-with-ocr-openai-postgresql)
- [Google Cloud: Use Cloud AI to read receipts](https://cloud.google.com/blog/products/application-modernization/use-cloud-ai-tools-to-read-and-classify-your-receipts/)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Data Model | HIGH | Standard CRM/invoicing patterns well-documented |
| Component Architecture | HIGH | Layered architecture is proven, v1.1 structure understood |
| Integration Points | HIGH | Clear dependencies from domain analysis |
| Build Order | HIGH | Dependencies determine order logically |
| Migration Strategy | MEDIUM | General pattern clear, edge cases may arise |
| Sync Architecture | MEDIUM | Patterns known, implementation details TBD |
| Calendar API | MEDIUM | Google API documented, bidirectional sync complex |

---

*Researched: 2026-02-03*
*Confidence: HIGH for architecture patterns, MEDIUM for implementation details*
