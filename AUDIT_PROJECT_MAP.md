# AUDIT: Project Map

**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**File:** AUDIT_PROJECT_MAP.md

---

## 1. TECH STACK

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend** | Vanilla HTML/CSS/JS | ES2020+ | Single-file monolith (32,560 lines) |
| **Typography** | DM Sans + JetBrains Mono | Google Fonts CDN | Preconnect configured |
| **Database (client)** | Dexie.js (IndexedDB wrapper) | v4 | 18 tables, 4 schema versions |
| **Database (cloud)** | Supabase (PostgreSQL) | - | Configured but not connected (empty config) |
| **Auth** | Supabase Auth | - | Google OAuth + Magic Link + Password (UI built, not connected) |
| **Edge Functions** | Supabase Edge Functions (Deno) | - | 1 deployed: vies-validate (EU VAT check) |
| **PDF Generation** | jsPDF + jspdf-autotable | CDN (unpkg) | Invoice PDF with VeriFactu QR |
| **QR Code** | qrcode-generator | CDN | VeriFactu compliance QR |
| **OCR** | Tesseract.js | CDN (lazy-loaded) | Receipt text extraction (local fallback) |
| **Excel** | ExcelJS | ^4.4.0 (Node.js script) | Offline workbook generation |
| **Calendar Sync** | Google Calendar API | OAuth 2.0 implicit flow | Google Identity Services |
| **PWA** | Service Worker + Manifest | Custom | Offline-first caching |
| **Error Tracking** | Built-in ErrorTracker | Custom | Sentry-ready (DSN empty) |
| **Analytics** | Built-in Analytics | Custom | Plausible-ready (not connected) |
| **CSS** | Custom CSS Variables | Design tokens | Light/dark theme via `[data-theme]` |

### External CDN Dependencies
- `https://unpkg.com/dexie@4/dist/dexie.min.mjs` (IndexedDB)
- `https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js` (PDF)
- `https://unpkg.com/jspdf-autotable` (PDF tables)
- `https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js` (QR)
- `https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js` (OCR, lazy)
- `https://accounts.google.com/gsi/client` (Google Identity)
- `https://apis.google.com/js/api.js` (Google Calendar)

### Build Tools
- **None** - No bundler, transpiler, or build step
- Node.js script (`scripts/generate-excel.js`) for Excel generation only

---

## 2. ARCHITECTURE

### Overview
Single-file HTML monolith (`autonomo_dashboard.html`) containing all CSS, HTML, and JavaScript inline. No module system, no code splitting.

### Structural Layout (32,560 lines)
```
Lines 1-20        Meta tags, CSP, viewport, fonts
Lines 21-9260     CSS (~9,240 lines)
                  - Design system tokens (light + dark theme)
                  - Component styles (tabs, cards, forms, modals, tables)
                  - Responsive breakpoints
                  - Print stylesheet
Lines 9261-11602  HTML (~2,340 lines)
                  - Theme toggle script
                  - Dashboard header + entity switcher
                  - Tab navigation (8 tabs: radio inputs, CSS-only)
                  - Tab panels: Scenarios, Calendar, Expenses, Invoices, Details, Income, Clients, Compliance
                  - Profile section (user menu toggle)
                  - Auth screen (login/signup/reset)
                  - 6 dialogs: day picker, bulk picker, edit scenario, template, onboarding, MFA
                  - Entity creation modal
                  - Toast container
Lines 11603-32413 JavaScript (~20,810 lines)
                  - Debug flag, ErrorTracker, Analytics
                  - Hash routing for tabs
                  - Toast notification system
                  - Onboarding flow
                  - Fiscal constants (FISCAL_2025, FISCAL_YEARS)
                  - Calendar (legacy localStorage system)
                  - Compliance data (sources, treaty, dietas, tooltips)
                  - Expenses (legacy localStorage system)
                  - Income tracking (legacy localStorage)
                  - Scenario engine (presets, state, calculations)
                  - IRPF calculation (3 variants)
                  - Scenario UI (cards, comparison, detail/edit modals)
                  - Modelo 130 estimation
                  - Year-over-year comparison
                  - Accountant export
                  - Compliance rendering
                  - Dexie database (AppDatabase class, 18 tables)
                  - Auth system (AuthManager, MFAManager, AuthUI, UserMenuUI, ProfileUI)
                  - Invitation & sharing (InviteUI, SharingUI)
                  - Permission enforcement (PermissionUI, withPermission)
                  - MoneyUtils (integer cents arithmetic)
                  - SyncQueue & DataManager (CRUD + soft delete)
                  - InvoiceManager (18+ methods)
                  - Entity types & constants
                  - Expense categories (entity-type-aware)
                  - Spanish tax ID validation
                  - EU VAT patterns & VIES validation
                  - Client categorization (Spain/EU/UK/US/third)
                  - IVA treatment & IRPF retention rules
                  - ClientManager, ContactManager, ProjectManager
                  - ExpenseManager (CRUD + deduction calc)
                  - Dietas validation
                  - Receipt/image handling
                  - Expense form dialog
                  - Expense list + filters
                  - Client UI (list, form, detail, contacts, projects)
                  - EntityContext (observer pattern, entity switching)
                  - CalendarManager (IndexedDB version)
                  - WorkPatternManager
                  - Calendar UI (day editor, bulk tag, async rendering)
                  - EntityManager + EntityModal
                  - Entity switcher
                  - DualActivityDetector
                  - Database initialization sequence
                  - Invoice UI (form, list, detail, PDF, email)
                  - InvoicePDFGenerator
Lines 32415-32560 Entity creation modal HTML + toast container
```

### State Management (Dual System)
1. **Legacy (localStorage):** Calendar state, expenses, income entries, scenario state, compliance warnings, theme preference
2. **Modern (IndexedDB/Dexie):** Entities, clients, contacts, projects, invoices, invoice_lines, invoice_payments, expenses (v2), receipts, calendar_days, settings, profiles, entity_shares, invitations, sessions, sync_queue, tax_calculations, invoice_sequences

### Data Flow
- Tab navigation: CSS-only radio inputs (no JS for show/hide)
- Entity scoping: `EntityContext` singleton with observer/subscriber pattern
- Rendering: Imperative DOM manipulation via `innerHTML` and `textContent`
- Calculations: Synchronous pure functions (IRPF, scenario, deductions)
- Async operations: IndexedDB reads via Dexie's Promise API
- Auth: Supabase client (when configured) with graceful offline fallback

---

## 3. FEATURES LIST

### Working Features (Verified)
| Feature | Status | Data Layer | Tab |
|---------|--------|------------|-----|
| IRPF calculation (6 brackets, 4-phase cuota integra) | Working | In-memory | Scenarios/Details |
| RETA fixed cuota (428.40 EUR/month) | Working | Constant | Scenarios/Details |
| Gastos dificil (5%, 2K cap) | Working | In-memory | Scenarios/Details |
| Minimo personal (5,550) + descendientes (2,400) | Working | In-memory | Scenarios/Details |
| 7% reduccion rendimientos | Working | In-memory | Scenarios/Details |
| 5 preset scenarios (A-E) + custom | Working | localStorage | Scenarios |
| Scenario comparison table | Working | localStorage | Scenarios |
| Scenario detail/edit modals | Working | localStorage | Scenarios |
| Reset to defaults | Working | localStorage | Scenarios |
| Belgium work calendar (Feb-Dec) | Working | localStorage + IndexedDB | Calendar |
| Day status toggle (Belgium/Spain/Travel) | Working | Dual | Calendar |
| 183-day threshold warnings (170/180/183) | Working | Computed | Calendar |
| Contracted pattern pre-fill | Working | In-memory | Calendar |
| Multi-select + bulk tag | Working | - | Calendar |
| ICS/CSV export | Working | - | Calendar |
| Multi-year navigation | Working | IndexedDB | Calendar |
| Client/project tagging on days | Working | IndexedDB | Calendar |
| Work pattern system | Working | IndexedDB | Calendar |
| Expense tracking (legacy, categories) | Working | localStorage | Details |
| Expense categories (entity-type-aware) | Working | IndexedDB | Expenses |
| Receipt upload + OCR (Tesseract.js) | Working | IndexedDB | Expenses |
| Expense form (create/edit) | Working | IndexedDB | Expenses |
| Expense list with filters | Working | IndexedDB | Expenses |
| Dietas validation (91.35/48.08) | Working | Computed | Expenses |
| Calendar-expense linking | Working | IndexedDB | Calendar/Expenses |
| Income tracking (manual entries) | Working | localStorage | Income |
| Client management (CRUD) | Working | IndexedDB | Clients |
| Client NIF/CIF validation | Working | Computed | Clients |
| EU VAT format validation | Working | Computed | Clients |
| Client categorization (Spain/EU/UK/US) | Working | Computed | Clients |
| Client detail (contacts, projects, invoices, expenses) | Working | IndexedDB | Clients |
| Contact management per client | Working | IndexedDB | Clients |
| Project management per client | Working | IndexedDB | Clients |
| Invoice creation (factura completa) | Working | IndexedDB | Invoices |
| Sequential invoice numbering (VeriFactu) | Working | IndexedDB | Invoices |
| Line items with IVA/IRPF | Working | IndexedDB | Invoices |
| Invoice status workflow (Draft/Sent/Paid/Overdue) | Working | IndexedDB | Invoices |
| Payment recording | Working | IndexedDB | Invoices |
| Factura rectificativa | Working | IndexedDB | Invoices |
| PDF generation (jsPDF + VeriFactu QR) | Working | In-memory | Invoices |
| Entity logo on invoices | Working | IndexedDB | Invoices |
| Invoice email (via Edge Function) | Partial | Supabase | Invoices |
| Invoice print/download | Working | In-memory | Invoices |
| Compliance documentation | Working | Static | Compliance |
| Treaty tie-breaker provisions | Working | Static | Compliance |
| Official source citations (13 links) | Working | Static | Compliance |
| Modelo 130 quarterly estimation | Working | Computed | Scenarios |
| Year-over-year comparison | Working | localStorage | Scenarios |
| Accountant export (IRPF breakdown) | Working | Computed | Scenarios |
| Multi-entity management (Autonomo + SL) | Working | IndexedDB | Entity switcher |
| Entity type-specific fields (NIF vs CIF) | Working | IndexedDB | Entity modal |
| Dual activity detection | Working | Computed | Auto-detect |
| Theme toggle (light/dark) | Working | localStorage | Header |
| Onboarding flow | Working | localStorage | First visit |
| Toast notifications | Working | DOM | Global |
| Hash routing (#tab-name) | Working | URL hash | Global |
| PWA (manifest + service worker) | Working | Cache API | Global |

### Partial / Not Connected
| Feature | Status | Issue |
|---------|--------|-------|
| Supabase authentication | UI built, not connected | SUPABASE_CONFIG empty |
| User profiles | UI exists | No backend |
| 2FA (TOTP) | UI built | No Supabase |
| Session management | UI built | No Supabase |
| Entity sharing/invitations | UI built | No Supabase |
| Permission enforcement | UI built | Offline = full access |
| VIES API validation | Edge Function exists | Not deployed |
| Google Calendar sync | UI + OAuth built | CLIENT_ID empty |
| Error tracking (Sentry) | ErrorTracker built | DSN empty |
| Analytics (Plausible) | Analytics module built | Not connected |
| Cloud sync | SyncQueue built | No Supabase |
| Invoice email delivery | UI built | Edge Function not deployed |

---

## 4. ROUTES MAP

The app uses hash-based routing for tabs:

| Route | Tab | Content |
|-------|-----|---------|
| `#scenarios` (default) | Scenarios | Preset/custom scenarios, comparison table, detail/edit modals |
| `#calendar` | Calendar | Interactive month grid, day editor, bulk tag, work patterns |
| `#expenses` | Expenses | Expense list with filters, create/edit form, receipt upload |
| `#invoices` | Invoices | Invoice list, create form, detail view, PDF generation |
| `#details` | What-If | Interactive IRPF calculator, expense editor, Modelo 130 |
| `#income` | Income | Manual income entry list (legacy) |
| `#clients` | Clients | Client list, detail view with contacts/projects/invoices |
| `#compliance` | Compliance | Treaty provisions, documentation requirements, sources |

**Additional screens (not tab-routed):**
- Auth screen (login/signup/reset) - shown before dashboard when Supabase configured
- Profile section - toggled via user menu dropdown
- Entity creation modal - overlay

**Supporting pages:**
| File | Purpose |
|------|---------|
| `index.html` | Marketing landing page |
| `terms.html` | Terms of Service |
| `privacy.html` | Privacy Policy |

---

## 5. DATA MODELS

### IndexedDB Schema (Dexie v4, 18 tables)

**Core Business:**
- `entities` - Business entities (type: autonomo/sociedad_limitada, NIF/CIF, address, etc.)
- `clients` - Clients per entity (name, country, category, NIF/CIF, email)
- `contacts` - Client contacts (name, role, email, phone, is_primary)
- `projects` - Projects per client (name, rate_cents, rate_type, status, dates)

**Financial:**
- `invoices` - Invoices per entity (series, number, status, dates, amounts in cents)
- `invoice_lines` - Line items (description, qty, unit_price_cents, iva_rate)
- `invoice_payments` - Payment records (amount_cents, date, method, reference)
- `invoice_sequences` - Sequential numbering per entity+series
- `expenses` - Expenses per entity (category, amount_cents, deductible_amount_cents, links)
- `receipts` - Receipt files (file_data blob, OCR status/confidence/extracted)

**Calendar:**
- `calendar_days` - Day entries (date, location, client_id, project_id, notes)

**Infrastructure:**
- `settings` - Key-value app settings
- `sync_queue` - Offline change queue for cloud sync
- `tax_calculations` - Cached tax calculation results

**Auth (local mirrors):**
- `profiles` - User profiles (extends Supabase auth.users)
- `entity_shares` - User-entity-role junction
- `entity_invitations` - Pending invitations with expiry
- `user_sessions` - Active session tracking

### localStorage Keys
- `autonomo_calendar_v1` - Legacy calendar day states
- `autonomo_expenses_v1` - Legacy expense categories + items
- `autonomo_scenarios_v1` - Scenario state + custom scenarios
- `autonomo_income_v1` - Income entries
- `theme` - Light/dark preference
- `onboarding_seen` - Onboarding dismissal flag
- `compliance_warning_dismissed_*` - Per-year dismissal
- `calendar_migrated_v2_entity_*` - Per-entity migration flag

### Key Constants
- `FISCAL_2025` - Tax brackets, minimos, RETA, gastos dificil
- `SCENARIO_PRESETS` - 5 scenarios (A-E) with revenue/expense/travel defaults
- `EXPENSE_CATEGORY` - Entity-type-aware categories with deduction rules
- `IVA_TREATMENT` - Per-client-category IVA rates and labels
- `IRPF_RETENTION` - 7%/15% rules for autonomo Spanish invoices
- `CLIENT_CATEGORY` - Spain/EU B2B/EU B2C/UK/US/third country
- `LOCATION_TYPE` - spain/belgium/travel/other/unset

---

## 6. CURRENT LIMITATIONS

### Belgium-Specific Hardcoding
- Landing page says "Built for Spanish autonomos in Belgium"
- Calendar defaults to Belgium/Spain/Travel locations (not generic countries)
- Dietas limits hardcoded to Belgium rates (91.35/48.08 EUR)
- 183-day rule only tracks Belgium days
- Treaty documentation references only Spain-Belgium treaty
- Compliance tab exclusively covers Spain-Belgium provisions
- OG meta description mentions Belgium

### Personal-Use Artifacts
- 5 preset scenarios match original user's specific revenue levels
- Fixed costs (huur 1155, GSM 55, elektriciteit 100) are user-specific
- Contracted pattern (Mon-Tue + first-week Wed-Fri) matches user's contract
- RETA cuota hardcoded to 428.40 EUR/month (user's registration amount)

### Architecture Limitations
- 32,560 lines in single file - unmaintainable at scale
- No module system - all code in global scope (IIFE-style within single `<script>`)
- Dual state management (localStorage + IndexedDB) creates confusion
- No test suite - zero automated tests
- No CI/CD pipeline
- No environment variables (Supabase config hardcoded as empty strings)

---

## 7. DEPENDENCIES

### Frontend (CDN)
| Package | Version | Purpose | Vulnerability Risk |
|---------|---------|---------|-------------------|
| Dexie.js | 4.x | IndexedDB wrapper | Low |
| jsPDF | latest | PDF generation | Medium (unversioned) |
| jspdf-autotable | latest | PDF tables | Medium (unversioned) |
| qrcode-generator | 1.4.4 | VeriFactu QR | Low |
| Tesseract.js | 5.x | OCR | Low (lazy-loaded) |
| Google Identity Services | - | OAuth | Low (Google-hosted) |
| Google API Client | - | Calendar API | Low (Google-hosted) |

### Backend (Node.js scripts)
| Package | Version | Purpose |
|---------|---------|---------|
| exceljs | ^4.4.0 | Excel workbook generation |

### Supabase Edge Functions (Deno)
| Import | Version | Purpose |
|--------|---------|---------|
| deno.land/std | 0.177.0 | HTTP server |

### Pinning Issues
- jsPDF and jspdf-autotable use `@latest` - could break without warning
- No lockfile for CDN dependencies
- No integrity hashes (SRI) on CDN `<script>` tags

---

## 8. TECHNICAL DEBT

| Category | Item | Count/Severity | Location |
|----------|------|----------------|----------|
| **File Size** | Single-file monolith | 32,560 lines | autonomo_dashboard.html |
| **XSS Risk** | innerHTML assignments with user data | 144 instances | Throughout JS |
| **XSS Mitigation** | escapeHtml() usage | 86+51=137 calls | Partial coverage |
| **Memory Leaks** | addEventListener without removeEventListener | 57 add / 0 remove | Throughout JS |
| **Inline Handlers** | onclick= in HTML | 178 instances | HTML + dynamic content |
| **Console Noise** | console.log/debug (guarded by DEBUG flag) | 87 instances | Throughout JS |
| **Error Handling** | try-catch blocks | 122 instances | ~50 are silent |
| **localStorage Usage** | Legacy state persistence | 58 references | Calendar, expenses, income, scenarios |
| **No Tests** | Zero automated tests | 0 | - |
| **No Types** | No TypeScript, no JSDoc types | - | Entire codebase |
| **Dual State** | localStorage + IndexedDB coexist | Confusing | Calendar, expenses |
| **Global Scope** | 20+ global variables/functions | - | Throughout |
| **CDN Unpinned** | jsPDF @latest without SRI | 2 scripts | `<head>` |
| **Auth Not Connected** | Full auth UI with empty Supabase config | - | Lines 17805-17811 |
| **Dead Code** | Legacy income tracking (superseded by invoices) | ~200 lines | Lines 14229-14360 |
| **Duplicate Functions** | 3 IRPF calculation variants | Intentional | Lines 14615, 15612, 15699 |
| **No Lint/Format** | No ESLint, Prettier, or any code quality tooling | - | - |

---

## 9. SETUP & RUNNING

### Prerequisites
- Any HTTP server (Python, Node, etc.)
- Port 3013 configured

### Running
```bash
# Start local server
python3 -m http.server 3013
# OR
npx serve -l 3013

# Visit
open http://localhost:3013/autonomo_dashboard.html
```

### Environment Variables (.env.local)
```
SUPABASE_URL=       # Empty - not configured
SUPABASE_ANON_KEY=  # Empty - not configured
```

### Excel Generation
```bash
cd scripts && npm install && node generate-excel.js
```

### Edge Function Deployment
```bash
supabase functions deploy vies-validate
```

---

## 10. FILE INVENTORY

| File | Lines | Purpose |
|------|-------|---------|
| `autonomo_dashboard.html` | 32,560 | Main application (all-in-one) |
| `autonomo_dashboard.html.bak` | ~8,980 | v1.1 backup |
| `index.html` | 301 | Marketing landing page |
| `terms.html` | ~300 | Terms of Service |
| `privacy.html` | ~300 | Privacy Policy |
| `favicon.svg` | ~20 | Calculator icon (SVG) |
| `manifest.json` | 22 | PWA manifest |
| `sw.js` | 64 | Service worker |
| `CLAUDE.md` | ~350 | Project instructions |
| `autonomo_calculator.xlsx` | Binary | Excel workbook |
| `scripts/generate-excel.js` | ~300 | Excel generator (Node.js) |
| `scripts/verify-phase-16.js` | ~200 | Phase 16 verification |
| `scripts/verify-phase-17.js` | ~200 | Phase 17 verification |
| `supabase/functions/vies-validate/index.ts` | 120 | VIES EU VAT validation proxy |
| `.planning/` | ~150 files | GSD project planning docs |

**Total application code:** ~33,000 lines (excluding planning docs and backups)

---

*Generated: 2026-02-06 by AUDIT Phase 0*
