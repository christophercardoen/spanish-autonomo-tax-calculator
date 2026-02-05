# Roadmap: v2.0 Multi-Entity Business Management System

## Overview

This roadmap transforms the validated v1.1 single-file tax calculator into a production business management system with multi-entity support (Autonomo + Sociedad Limitada). The 18 phases deliver: data architecture foundation, multi-tenant entity management, client CRM, enhanced calendar, expense tracking with OCR, invoice generation with VeriFactu compliance, dual tax engines (IRPF + Impuesto de Sociedades), SL accounting with Cuentas Anuales, cross-entity optimization, multi-jurisdiction IVA, comprehensive reporting, data migration from v1.1, cloud sync, mobile PWA, and settings. Every feature is entity-scoped with Row Level Security for data isolation.

## Milestones

- [x] **v1.0 MVP** - Phases 1-7 (shipped 2026-02-02)
- [x] **v1.1 Complete Tax Calculator** - Phases 7.1-9 (shipped 2026-02-03)
- [ ] **v2.0 Multi-Entity Business Management** - Phases 12-29 (in progress)

## Phases

<details>
<summary>[x] v1.0 + v1.1 (Phases 1-9) - SHIPPED 2026-02-03</summary>

See: `.planning/milestones/v1.1-ROADMAP.md` for archived phase details.

**Summary:** 11 phases (including 7.1, 7.2), 29 plans, 79 requirements delivered.
- Fiscal calculation engine (IRPF/RETA)
- Expense tracking with categories
- Scenario comparison engine
- Belgium work calendar (183-day tracking)
- Professional dashboard UI
- Excel workbook generator
- Compliance documentation

</details>

### v2.0 Multi-Entity Business Management (In Progress)

**Milestone Goal:** Complete business management for Spanish SMEs (autonomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and dual tax automation engines.

---

- [x] **Phase 12: Data Architecture Foundation** - IndexedDB/Dexie.js setup, float precision, soft delete, sync queue
- [x] **Phase 13: Multi-Entity Architecture** - Entity type selection, RLS policies, entity switcher
- [x] **Phase 14: Authentication & Permissions** - User accounts, roles, entity-level access control
- [x] **Phase 15: Client Management** - CRM with NIF/VIES validation, country categorization
- [x] **Phase 16: Calendar Enhancement** - Client tagging, 183-day preservation, work patterns
- [ ] **Phase 17: Expense Management** - Entity-type deduction rules, categories, linking
- [ ] **Phase 18: Invoice Generation** - Factura completa, VeriFactu QR, entity-type templates
- [ ] **Phase 19: Receipt Upload & OCR** - Mindee API, confidence scoring, duplicate detection
- [ ] **Phase 20: Tax Automation - Autonomo** - Modelo 130, IRPF, RETA regularization
- [ ] **Phase 21: Tax Automation - SL** - Modelo 202/200, IS rates, BINs carry-forward
- [ ] **Phase 22: SL Accounting** - P&L, balance sheet, Cuentas Anuales workflow
- [ ] **Phase 23: Cross-Entity Integration** - Related party detection, dual RETA, salary vs dividend
- [ ] **Phase 24: IVA & Multi-Jurisdiction** - Modelo 303/390/349, VIES, W-8BEN
- [ ] **Phase 25: Reports & Analytics** - Dashboard, profitability, tax timeline, exports
- [ ] **Phase 26: Data Migration** - v1.1 localStorage import, backup/restore
- [ ] **Phase 27: Cloud Sync** - Supabase sync, conflict resolution, encryption
- [ ] **Phase 28: Mobile & PWA** - Service worker, camera upload, offline queue
- [ ] **Phase 29: Settings & Preferences** - Language, currency, invoice templates, notifications

## Phase Details

### Phase 12: Data Architecture Foundation
**Goal**: Establish offline-first data layer with proper financial data handling
**Depends on**: Nothing (first v2.0 phase)
**Requirements**: SYNC-01
**Success Criteria** (what must be TRUE):
  1. User data persists in IndexedDB across browser sessions
  2. All currency amounts stored as integers (cents) to prevent float precision errors
  3. Deleted records retained with deleted_at timestamp (soft delete for 4-year retention)
  4. Offline changes queued for future sync
  5. Schema migrations handle version upgrades gracefully
**Plans**: 3 plans
Plans:
- [x] 12-01-PLAN.md - Database schema and MoneyUtils initialization
- [x] 12-02-PLAN.md - Soft delete system and sync queue infrastructure
- [x] 12-03-PLAN.md - Invoice sequence manager and verification checkpoint

### Phase 13: Multi-Entity Architecture
**Goal**: Users can manage multiple business entities (Autonomo and/or SL) from single account
**Depends on**: Phase 12
**Requirements**: ENTITY-01, ENTITY-02, ENTITY-03, ENTITY-04, ENTITY-05, ENTITY-06, ENTITY-07, ENTITY-08
**Success Criteria** (what must be TRUE):
  1. User can create a new entity choosing type: Autonomo or Sociedad Limitada
  2. User can switch between entities via entity switcher and sees only that entity's data
  3. Autonomo entity stores NIF, nombre, domicilio fiscal, IAE, alta date
  4. SL entity stores CIF, razon social, Registro Mercantil (Tomo/Folio/Hoja), constitution date, share capital
  5. System detects dual activity (user has both autonomo + SL admin role)
**Plans**: 5 plans
Plans:
- [x] 13-01-PLAN.md - SpanishTaxIdValidator and ENTITY_TYPE constants
- [x] 13-02-PLAN.md - EntityContext singleton with observer pattern
- [x] 13-03-PLAN.md - EntityManager CRUD and create entity modal
- [x] 13-04-PLAN.md - Entity switcher dropdown component
- [x] 13-05-PLAN.md - Dual activity detection and verification

### Phase 14: Authentication & Permissions
**Goal**: Secure multi-user access with role-based permissions per entity
**Depends on**: Phase 13
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, PERM-01, PERM-02, PERM-03, PERM-04, PERM-05, PERM-06, PERM-07
**Success Criteria** (what must be TRUE):
  1. User can sign up, verify email, and log in with session persistence
  2. User can enable 2FA and manage active sessions
  3. Entity owner can invite users with role: Gestor (read-only), Accountant (read-write), Partner (full)
  4. Invited user sees only entities they have been granted access to
  5. Gestor can view and export but not modify; Accountant can edit but not delete invoices
**Plans**: 6 plans
Plans:
- [x] 14-01-PLAN.md - Database schema extension with auth tables (profiles, entity_shares, invitations, sessions)
- [x] 14-02-PLAN.md - Supabase Auth client with magic link and Google OAuth
- [x] 14-03-PLAN.md - Login/auth UI, profile page, user menu
- [x] 14-04-PLAN.md - 2FA (TOTP) enrollment and session management
- [x] 14-05-PLAN.md - Invitation system for entity sharing with roles
- [x] 14-06-PLAN.md - Permission enforcement in UI and verification checkpoint

### Phase 15: Client Management
**Goal**: Users can manage clients with proper tax ID validation and categorization
**Depends on**: Phase 13
**Requirements**: CLIENT-01 through CLIENT-08, CLIENT-10 through CLIENT-14 (CLIENT-09 work patterns deferred to Phase 16)
**Success Criteria** (what must be TRUE):
  1. User can create client with validated NIF/CIF (Spanish format) or VIES-validated EU VAT number
  2. System automatically categorizes client by country: Spain, EU B2B, EU B2C, UK, US/third country
  3. User can create projects per client with rate type (daily/hourly/fixed/retainer) and start/end dates
  4. Client list shows name, country flag, active projects count, total invoiced, last invoice date
  5. Client detail page shows contact info, projects, and profitability structure (populated when invoices/expenses exist in Phase 17/18)
**Plans**: 5 plans
Plans:
- [x] 15-01-PLAN.md - EU VAT format patterns, country flag emoji, CLIENT_CATEGORY constants
- [x] 15-02-PLAN.md - VIES Edge Function proxy, VIESValidator module, ClientManager CRUD
- [x] 15-03-PLAN.md - ContactManager and ProjectManager modules
- [x] 15-04-PLAN.md - Client list UI with search/filter, create/edit client modal
- [x] 15-05-PLAN.md - Client detail page with tabs, contact/project management, profitability

### Phase 16: Calendar Enhancement
**Goal**: Calendar tracks work days by client while preserving 183-day residency management
**Depends on**: Phase 15
**Requirements**: CALENDAR-01, CALENDAR-02, CALENDAR-03, CALENDAR-04, CALENDAR-05, CALENDAR-06, CALENDAR-07, CALENDAR-08, CALENDAR-09, CALENDAR-10, CALENDAR-11, CALENDAR-12, CALENDAR-13, CALENDAR-14, CALENDAR-15, CALENDAR-16
**Success Criteria** (what must be TRUE):
  1. User can tag calendar days with client/project and location (Spain/Belgium/Travel/Other)
  2. 183-day threshold warnings preserved (170/180/183 levels) counting Belgium + Travel
  3. User can assign work pattern template to client and auto-apply to calendar
  4. Calendar day shows: client tag, location icon, linked expenses count
  5. User can export to ICS/CSV and optionally sync with Google Calendar
**Plans**: 7 plans
Plans:
- [x] 16-01-PLAN.md - CalendarManager module and localStorage migration
- [x] 16-02-PLAN.md - Day editor modal with client/project/location tagging
- [x] 16-03-PLAN.md - Work pattern system for recurring schedules
- [x] 16-04-PLAN.md - 183-day threshold tracking and multi-year navigation
- [x] 16-05-PLAN.md - Enhanced ICS/CSV export and expense linking infrastructure
- [x] 16-06-PLAN.md - Google Calendar OAuth sync
- [x] 16-07-PLAN.md - Verification checkpoint

### Phase 17: Expense Management
**Goal**: Users can track expenses with entity-type-aware deduction rules
**Depends on**: Phase 16
**Requirements**: EXPENSE-01, EXPENSE-02, EXPENSE-03, EXPENSE-04, EXPENSE-05, EXPENSE-06, EXPENSE-07, EXPENSE-08, EXPENSE-09, EXPENSE-10, EXPENSE-11, EXPENSE-12, EXPENSE-13, EXPENSE-14, EXPENSE-15
**Success Criteria** (what must be TRUE):
  1. User can create expense manually or from OCR-populated receipt
  2. Expense categories apply entity-type rules: Autonomo gets gastos dificil 5%, SL does not
  3. User can link expense to client/project (billable) or calendar days (trip)
  4. System validates dietas limits (91.35 EUR/day Belgium with overnight)
  5. Expense list shows date, vendor, amount, category, deductible amount, and client if linked
**Plans**: 7 plans
Plans:
- [ ] 17-01-PLAN.md — EXPENSE_CATEGORY config and ExpenseManager CRUD
- [ ] 17-02-PLAN.md — ReceiptManager with OCR and image compression
- [ ] 17-03-PLAN.md — Expense form dialog with entity-type-aware categories
- [ ] 17-04-PLAN.md — Expense list view with filters and summary
- [ ] 17-05-PLAN.md — Calendar-expense linking and deduction integration
- [ ] 17-06-PLAN.md — Dietas validation and billable/receipt protection
- [ ] 17-07-PLAN.md — Verification checkpoint and browser testing

### Phase 18: Invoice Generation
**Goal**: Users can generate compliant invoices with entity-type-specific templates and VeriFactu QR
**Depends on**: Phase 15, Phase 17
**Requirements**: INVOICE-01, INVOICE-02, INVOICE-03, INVOICE-04, INVOICE-05, INVOICE-06, INVOICE-07, INVOICE-08, INVOICE-09, INVOICE-10, INVOICE-11, INVOICE-12, INVOICE-13, INVOICE-14, INVOICE-15, INVOICE-16, INVOICE-17, INVOICE-18, INVOICE-19, INVOICE-20, INVOICE-21, INVOICE-22, INVOICE-23
**Success Criteria** (what must be TRUE):
  1. User can create invoice with sequential numbering (no gaps per VeriFactu requirement)
  2. Invoice includes all 13 factura completa fields with entity-type header (Autonomo: NIF, SL: Razon social + Registro Mercantil)
  3. System applies correct IVA treatment: Spain 21%, EU B2B inversion sujeto pasivo, third country no IVA
  4. User can generate PDF with VeriFactu QR code and download/print/email
  5. Invoice status workflow: Draft -> Sent -> Paid/Overdue with payment tracking
**Plans**: TBD

### Phase 19: Receipt Upload & OCR
**Goal**: Users can upload receipts and have data extracted automatically via OCR
**Depends on**: Phase 17
**Requirements**: RECEIPT-01, RECEIPT-02, RECEIPT-03, RECEIPT-04, RECEIPT-05, RECEIPT-06, RECEIPT-07, RECEIPT-08, RECEIPT-09, RECEIPT-10, RECEIPT-11, RECEIPT-12, RECEIPT-13, RECEIPT-14, RECEIPT-15, RECEIPT-16
**Success Criteria** (what must be TRUE):
  1. User can upload receipt photo (JPG/PNG/HEIC) or PDF from mobile or desktop
  2. OCR extracts date, amount, vendor, IVA with confidence score per field
  3. High confidence (>85%) auto-fills fields with green badge; low confidence (<60%) shows manual entry warning
  4. System detects European date formats (DD/MM/YYYY) and currency symbols
  5. System detects duplicate receipts (same vendor, date, amount within 24 hours)
**Plans**: TBD

### Phase 20: Tax Automation - Autonomo
**Goal**: Autonomo entities see calculated Modelo 130 and IRPF with real invoice/expense data
**Depends on**: Phase 17, Phase 18
**Requirements**: TAX-AUTO-01, TAX-AUTO-02, TAX-AUTO-03, TAX-AUTO-04, TAX-AUTO-05, TAX-AUTO-06, TAX-AUTO-07, TAX-AUTO-08, TAX-AUTO-09, TAX-AUTO-10, TAX-AUTO-11, TAX-AUTO-12, TAX-AUTO-13, TAX-AUTO-14, TAX-AUTO-15, TAX-AUTO-16, TAX-AUTO-17, TAX-AUTO-18, TAX-AUTO-19, TAX-AUTO-20
**Success Criteria** (what must be TRUE):
  1. System calculates quarterly Modelo 130 from paid invoices and deductible expenses (cumulative method)
  2. System applies gastos dificil (5%, max 2K), reduccion 7%, and IRPF brackets (19-47%)
  3. System tracks retenciones from client invoices and deducts from quarterly payment
  4. System shows RETA regularization exposure comparing actual income to declared tramo
  5. User can download pre-filled Modelo 130 PDF and see disposable income projection
**Plans**: TBD

### Phase 21: Tax Automation - SL
**Goal**: SL entities see calculated Modelo 202/200 and Impuesto de Sociedades
**Depends on**: Phase 17, Phase 18
**Requirements**: TAX-SL-01, TAX-SL-02, TAX-SL-03, TAX-SL-04, TAX-SL-05, TAX-SL-06, TAX-SL-07, TAX-SL-08, TAX-SL-09, TAX-SL-10, TAX-SL-11, TAX-SL-12, TAX-SL-13, TAX-SL-14
**Success Criteria** (what must be TRUE):
  1. System calculates quarterly Modelo 202 (18% of prior year IS, Q1/Q3/Q4 only)
  2. System calculates IS with correct rate: 15% startup, 21-22% micro-empresa, 25% general
  3. System tracks BINs (loss carry-forward) and auto-applies up to 70% offset to profitable years
  4. System shows salary vs dividend optimizer comparing IS + IRPF effective rates
  5. System alerts if admin taking money without documented retribution (estatutos/junta)
**Plans**: TBD

### Phase 22: SL Accounting
**Goal**: SL entities can generate required financial statements and track Cuentas Anuales deadlines
**Depends on**: Phase 21
**Requirements**: ACCOUNTING-01, ACCOUNTING-02, ACCOUNTING-03, ACCOUNTING-04, ACCOUNTING-05, ACCOUNTING-06, ACCOUNTING-07, ACCOUNTING-08, ACCOUNTING-09, ACCOUNTING-10, ACCOUNTING-11, ACCOUNTING-12
**Success Criteria** (what must be TRUE):
  1. System generates P&L (cuenta de perdidas y ganancias) from invoices and expenses
  2. System generates balance sheet (balance de situacion) with Activo/Pasivo/Patrimonio neto
  3. System shows Cuentas Anuales workflow: Formulated (Mar 31) -> Approved (Jun 30) -> Filed (Jul 30)
  4. System sends deadline reminders at 60/30/15/7 days before each deadline
  5. System prevents fiscal year close if invoices/expenses pending categorization
**Plans**: TBD

### Phase 23: Cross-Entity Integration
**Goal**: Users with multiple entities see cross-entity awareness and optimization opportunities
**Depends on**: Phase 20, Phase 21
**Requirements**: CROSS-01, CROSS-02, CROSS-03, CROSS-04, CROSS-05, CROSS-06, CROSS-07, CROSS-08, CROSS-09
**Success Criteria** (what must be TRUE):
  1. System detects dual activity (autonomo + SL admin) and shows combined RETA as autonomo societario
  2. System flags related-party transactions when autonomo invoices own SL
  3. System warns about transfer pricing: "Ensure market price, document contract"
  4. User can allocate shared expenses (home office) across entities proportionally
  5. User can view consolidated report: total income, expenses, taxes across all entities
**Plans**: TBD

### Phase 24: IVA & Multi-Jurisdiction
**Goal**: System handles IVA correctly for Spain, EU, and third-country clients
**Depends on**: Phase 18
**Requirements**: IVA-01, IVA-02, IVA-03, IVA-04, IVA-05, IVA-06, IVA-07, IVA-08, IVA-09, IVA-10, IVA-11
**Success Criteria** (what must be TRUE):
  1. Spanish invoices include correct IVA (21%/10%/4%); EU B2B shows inversion sujeto pasivo
  2. System validates EU client VIES number before allowing inversion sujeto pasivo
  3. System calculates quarterly Modelo 303 (IVA repercutido - IVA soportado) and annual 390
  4. System generates quarterly Modelo 349 for EU intracomunitario operations
  5. For US clients with W-8BEN, system applies 0% withholding (vs 24% default)
**Plans**: TBD

### Phase 25: Reports & Analytics
**Goal**: Users can view dashboards and export comprehensive reports
**Depends on**: Phase 20, Phase 21
**Requirements**: REPORTS-01, REPORTS-02, REPORTS-03, REPORTS-04, REPORTS-05, REPORTS-06, REPORTS-07, REPORTS-08, REPORTS-09, REPORTS-10
**Success Criteria** (what must be TRUE):
  1. Dashboard shows: total income, expenses, profit, tax liability (month/quarter/year)
  2. User can view client profitability report sorted by profit margin
  3. User can view expense breakdown by category, month, or client
  4. User can view tax obligation timeline with upcoming Modelo deadlines and amounts
  5. User can export all reports to PDF, CSV, or Excel
**Plans**: TBD

### Phase 26: Data Migration
**Goal**: Users can import v1.1 data and backup/restore their business data
**Depends on**: Phase 17, Phase 18
**Requirements**: MIGRATION-01, MIGRATION-02, MIGRATION-03, MIGRATION-04, MIGRATION-05, MIGRATION-06, MIGRATION-07, MIGRATION-08, MIGRATION-09, MIGRATION-10
**Success Criteria** (what must be TRUE):
  1. User can import v1.1 localStorage data (expenses, calendar, income, scenarios)
  2. Migration wizard shows preview: "X expenses, Y income entries, Z calendar days will be imported"
  3. User can export all business data to JSON backup file
  4. User can restore from backup JSON (all clients, invoices, expenses, receipts, calendar)
  5. System enforces 4-year retention: cannot permanently delete within 4 years
**Plans**: TBD

### Phase 27: Cloud Sync
**Goal**: User data syncs to cloud for cross-device access with conflict handling
**Depends on**: Phase 12, Phase 14
**Requirements**: SYNC-02, SYNC-03, SYNC-04, SYNC-05, SYNC-06, SYNC-07, SYNC-08, SYNC-09, SYNC-10, SYNC-11
**Success Criteria** (what must be TRUE):
  1. User can work offline and changes sync to Supabase when online
  2. System detects sync conflicts and shows both versions for user resolution
  3. Sensitive data (NIF, CIF, client tax IDs) encrypted at rest
  4. Receipt files backed up to Supabase Storage
  5. User can see sync status: "Synced", "Syncing...", "Offline", "Conflict"
**Plans**: TBD

### Phase 28: Mobile & PWA
**Goal**: App works as installable PWA with mobile-optimized UX
**Depends on**: Phase 19
**Requirements**: MOBILE-01, MOBILE-02, MOBILE-03, MOBILE-04, MOBILE-05, MOBILE-06, MOBILE-07, MOBILE-08, MOBILE-09, MOBILE-10
**Success Criteria** (what must be TRUE):
  1. App is installable on home screen (PWA manifest, service worker)
  2. Mobile layout has bottom tab bar, 44px touch targets, swipe gestures
  3. User can capture receipt photo directly from camera with live preview
  4. Mobile expense list uses swipe-to-delete with card layout
  5. Mobile notifications for: invoice overdue, tax deadline approaching, sync conflict
**Plans**: TBD

### Phase 29: Settings & Preferences
**Goal**: Users can configure language, currency, invoice templates, and notifications
**Depends on**: Phase 14
**Requirements**: SETTINGS-01, SETTINGS-02, SETTINGS-03, SETTINGS-04, SETTINGS-05, SETTINGS-06, SETTINGS-07, SETTINGS-08, SETTINGS-09, SETTINGS-10
**Success Criteria** (what must be TRUE):
  1. User can set language (English, Spanish, Dutch) and currency display format
  2. User can configure invoice template: logo, bank details, legal terms, signature
  3. User can set default IVA rate and add custom expense categories
  4. User can configure notification preferences (email, push, in-app)
  5. User can delete account (GDPR right to erasure)
**Plans**: TBD

## Progress

**Execution Order:**
Phases 12-29 execute sequentially with dependencies as noted.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 12. Data Architecture | v2.0 | 3/3 | ✓ Complete | 2026-02-03 |
| 13. Multi-Entity Architecture | v2.0 | 5/5 | ✓ Complete | 2026-02-03 |
| 14. Authentication & Permissions | v2.0 | 6/6 | ✓ Complete | 2026-02-04 |
| 15. Client Management | v2.0 | 5/5 | ✓ Complete | 2026-02-04 |
| 16. Calendar Enhancement | v2.0 | 0/7 | Ready | - |
| 17. Expense Management | v2.0 | 0/7 | Ready | - |
| 18. Invoice Generation | v2.0 | 0/TBD | Not started | - |
| 19. Receipt Upload & OCR | v2.0 | 0/TBD | Not started | - |
| 20. Tax Automation - Autonomo | v2.0 | 0/TBD | Not started | - |
| 21. Tax Automation - SL | v2.0 | 0/TBD | Not started | - |
| 22. SL Accounting | v2.0 | 0/TBD | Not started | - |
| 23. Cross-Entity Integration | v2.0 | 0/TBD | Not started | - |
| 24. IVA & Multi-Jurisdiction | v2.0 | 0/TBD | Not started | - |
| 25. Reports & Analytics | v2.0 | 0/TBD | Not started | - |
| 26. Data Migration | v2.0 | 0/TBD | Not started | - |
| 27. Cloud Sync | v2.0 | 0/TBD | Not started | - |
| 28. Mobile & PWA | v2.0 | 0/TBD | Not started | - |
| 29. Settings & Preferences | v2.0 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-03*
*v2.0 scope: 223 requirements across 18 phases*
