# Requirements: v2.0 Multi-Entity Business Management System

**Defined:** 2026-02-03
**Core Value:** Complete business management for Spanish SMEs (autónomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and tax automation

## v2.0 Requirements

### Multi-User & Authentication (AUTH)

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can enable two-factor authentication (2FA)
- [ ] **AUTH-06**: User can view active sessions and revoke access
- [ ] **AUTH-07**: User profile includes name, email, NIF/CIF, phone, address

### Multi-Entity Management (ENTITY)

- [ ] **ENTITY-01**: User can create multiple business entities
- [ ] **ENTITY-02**: User selects entity type: Autónomo or SL (Sociedad Limitada)
- [ ] **ENTITY-03**: Autónomo entity stores: NIF, nombre, domicilio fiscal, IAE, date of alta
- [ ] **ENTITY-04**: SL entity stores: CIF, razón social, domicilio social, Registro Mercantil data (Tomo/Folio/Hoja), constitution date, share capital
- [ ] **ENTITY-05**: User can switch between entities via entity switcher
- [ ] **ENTITY-06**: Each entity has independent data (clients, invoices, expenses, calendar)
- [ ] **ENTITY-07**: User can archive inactive entities
- [ ] **ENTITY-08**: System detects dual activity (user is both autónomo + SL administrador)

### Permissions & Sharing (PERM)

- [ ] **PERM-01**: Entity owner can invite users with email
- [ ] **PERM-02**: Owner assigns role: Gestor (read-only), Accountant (read-write), or Partner (full access)
- [ ] **PERM-03**: Invited user receives email with accept/decline link
- [ ] **PERM-04**: User sees only entities they own or have been granted access to
- [ ] **PERM-05**: Owner can revoke access at any time
- [ ] **PERM-06**: Accountant role cannot delete invoices/expenses (only edit)
- [ ] **PERM-07**: Gestor role can view and export reports but not modify data

### Client Management (CLIENT)

- [ ] **CLIENT-01**: User can create client with name, email, NIF/CIF, address, country, phone
- [ ] **CLIENT-02**: System validates Spanish NIF/CIF format (8 digits + letter)
- [ ] **CLIENT-03**: For EU clients with VAT number, system validates via VIES API
- [ ] **CLIENT-04**: System categorizes client: Spain, EU (intracomunitario), UK (third country, post-Brexit), US/CA/AU (third country)
- [ ] **CLIENT-05**: User can mark EU client as B2B (inversion sujeto pasivo) or B2C (IVA applies)
- [ ] **CLIENT-06**: For US clients, user can upload W-8BEN form (0% withholding treaty)
- [ ] **CLIENT-07**: User can add multiple contacts per client (billing contact, project manager)
- [ ] **CLIENT-08**: User can create projects per client with: name, rate, start/end dates, status
- [ ] **CLIENT-09**: User can assign work pattern to client-project: specific weekdays, recurring schedule
- [ ] **CLIENT-10**: Client list view shows: name, country flag, active projects, total invoiced, last invoice date
- [ ] **CLIENT-11**: User can search clients by name, NIF, country
- [ ] **CLIENT-12**: User can archive clients (soft delete, data retained)
- [ ] **CLIENT-13**: Client detail page shows: contact info, projects, invoices, expenses, calendar days, profitability
- [ ] **CLIENT-14**: System calculates client profitability: total invoiced - client-specific expenses

### Invoice Generation (INVOICE)

- [ ] **INVOICE-01**: User can create invoice for a client
- [ ] **INVOICE-02**: Invoice includes sequential number (no gaps allowed per VeriFactu)
- [ ] **INVOICE-03**: For Autónomo entity: Invoice shows NIF, nombre completo, domicilio fiscal
- [ ] **INVOICE-04**: For SL entity: Invoice shows CIF, razón social, domicilio social, Registro Mercantil (Tomo/Folio/Hoja)
- [ ] **INVOICE-05**: Invoice includes 13 factura completa fields: date, number, client NIF/name/address, description, base, IVA %, IVA amount, total
- [ ] **INVOICE-06**: User adds line items: description, quantity, unit price, IVA %, total
- [ ] **INVOICE-07**: For EU B2B clients, invoice shows "Inversión del sujeto pasivo" (no IVA charged)
- [ ] **INVOICE-08**: For Autónomo invoices to Spanish clients, system calculates IRPF retention (7% or 15% based on activity)
- [ ] **INVOICE-09**: System generates VeriFactu QR code with: NIF/CIF, invoice number, date, total, hash
- [ ] **INVOICE-10**: User can auto-populate invoice from calendar days tagged with client (days × rate)
- [ ] **INVOICE-11**: User can add expenses to invoice as line items (pass-through billable expenses)
- [ ] **INVOICE-12**: Invoice status: Draft → Sent → Paid → Overdue
- [ ] **INVOICE-13**: User can mark invoice as sent (date sent recorded)
- [ ] **INVOICE-14**: User can mark invoice as paid (payment date, method, bank reference)
- [ ] **INVOICE-15**: System shows overdue invoices (sent >30 days ago, not paid)
- [ ] **INVOICE-16**: User can generate PDF from invoice (professional template)
- [ ] **INVOICE-17**: PDF includes VeriFactu QR code rendered as image
- [ ] **INVOICE-18**: User can download, print, or email PDF
- [ ] **INVOICE-19**: For corrections, user creates factura rectificativa (links to original invoice)
- [ ] **INVOICE-20**: System prevents deleting invoices (soft delete only, 4-year retention)
- [ ] **INVOICE-21**: Invoice list view shows: number, client, date, total, status, overdue indicator
- [ ] **INVOICE-22**: User can filter invoices by: client, date range, status, project
- [ ] **INVOICE-23**: System tracks total income per entity from paid invoices

### Receipt Upload & OCR (RECEIPT)

- [ ] **RECEIPT-01**: User can upload receipt photo (JPG, PNG, HEIC) from mobile or desktop
- [ ] **RECEIPT-02**: User can upload receipt PDF (single or multi-page)
- [ ] **RECEIPT-03**: System sends receipt to Mindee API for OCR extraction
- [ ] **RECEIPT-04**: OCR extracts: date, total amount, vendor name, VAT/IVA amount, currency
- [ ] **RECEIPT-05**: OCR returns confidence score per field (0-100%)
- [ ] **RECEIPT-06**: High confidence (>85%): System auto-fills fields, shows green badge
- [ ] **RECEIPT-07**: Medium confidence (60-85%): System suggests values, shows orange badge, requires user confirmation
- [ ] **RECEIPT-08**: Low confidence (<60%): System shows "Manual Entry Required" warning
- [ ] **RECEIPT-09**: If Mindee API fails, system falls back to Tesseract.js local OCR
- [ ] **RECEIPT-10**: User can review and edit all OCR-extracted fields
- [ ] **RECEIPT-11**: System detects European date formats (DD/MM/YYYY) and disambiguates
- [ ] **RECEIPT-12**: System detects currency symbols (€, £, $) and converts if needed
- [ ] **RECEIPT-13**: System stores original receipt file (image or PDF) for 4-year retention
- [ ] **RECEIPT-14**: Receipt detail view shows: original file thumbnail, extracted data, linked expense
- [ ] **RECEIPT-15**: User can re-run OCR if initial extraction failed
- [ ] **RECEIPT-16**: System detects duplicate receipts (same vendor, date, amount within 24 hours)

### Expense Management (EXPENSE)

- [ ] **EXPENSE-01**: User can create expense manually (without receipt)
- [ ] **EXPENSE-02**: User can create expense from uploaded receipt (OCR-populated)
- [ ] **EXPENSE-03**: Expense includes: date, amount, vendor, description, category, receipt link
- [ ] **EXPENSE-04**: Expense categories for Autónomo: Home office (30% deductible), GSM (50%), Vehicle (proportion), Meals (limits), Travel (100%), IT/Software (100%), Office supplies (100%)
- [ ] **EXPENSE-05**: Expense categories for SL: Vehicle (100%), Meals (100%), Travel (100%), IT/Software (100%), Office supplies (100%), Depreciation (assets)
- [ ] **EXPENSE-06**: For Autónomo home office, user enters: total rent/mortgage, deductible percentage (max 30%)
- [ ] **EXPENSE-07**: For travel expenses (flights, hotels), user specifies: destination, trip dates
- [ ] **EXPENSE-08**: System validates Belgium dietas limit (€91.35/day with overnight, €48.08 without)
- [ ] **EXPENSE-09**: User can link expense to client/project (billable expense)
- [ ] **EXPENSE-10**: User can link expense to calendar days (e.g., hotel → Belgium trip dates)
- [ ] **EXPENSE-11**: System calculates total deductible amount based on category rules
- [ ] **EXPENSE-12**: Expense list view shows: date, vendor, amount, category, deductible amount, client (if linked)
- [ ] **EXPENSE-13**: User can filter expenses by: date range, category, client, calendar days
- [ ] **EXPENSE-14**: User can mark expense as "Billable" (passed to client invoice)
- [ ] **EXPENSE-15**: System prevents deleting expenses with linked receipts (soft delete only)

### Calendar Integration (CALENDAR)

- [ ] **CALENDAR-01**: User sees month grid calendar (Feb-Dec current year + future years)
- [ ] **CALENDAR-02**: User can click day to open day editor
- [ ] **CALENDAR-03**: Day editor allows tagging: Client/Project, Location (Spain/Belgium/Travel/Other), Notes
- [ ] **CALENDAR-04**: System preserves 183-day presence tracking (Belgium + Travel count toward threshold)
- [ ] **CALENDAR-05**: User can assign work pattern template to client (e.g., "Mon-Tue every week")
- [ ] **CALENDAR-06**: System auto-applies work pattern to calendar (user can override individual days)
- [ ] **CALENDAR-07**: User can select multiple days (week, month, range) and bulk-tag with client
- [ ] **CALENDAR-08**: Calendar shows day count per month: Spain days, Belgium days, Travel days, Other
- [ ] **CALENDAR-09**: System shows annual totals and 183-day threshold warning
- [ ] **CALENDAR-10**: Warning levels: 170 days (yellow), 180 days (orange), 183 days (red)
- [ ] **CALENDAR-11**: User can link expenses to calendar days (e.g., flight on Oct 5 → tag Oct 5-7 Belgium)
- [ ] **CALENDAR-12**: Calendar day shows: client tag, location, linked expenses count
- [ ] **CALENDAR-13**: User can export calendar to iCal format (.ics file)
- [ ] **CALENDAR-14**: User can export calendar to CSV (date, client, location, notes)
- [ ] **CALENDAR-15**: User can sync calendar with Google Calendar (OAuth, bidirectional sync)
- [ ] **CALENDAR-16**: For Google Calendar sync, system resolves conflicts: app calendar wins, external events shown as read-only suggestions

### Tax Automation - Autónomo (TAX-AUTO)

- [ ] **TAX-AUTO-01**: System calculates quarterly Modelo 130 from paid invoices and expenses
- [ ] **TAX-AUTO-02**: Modelo 130 calculation: Ingresos (paid invoices) - Gastos (deductible expenses) = Rendimientos netos
- [ ] **TAX-AUTO-03**: System applies gastos difícil justificación: 5% of ingresos, max €2,000/year
- [ ] **TAX-AUTO-04**: System applies 7% reducción on rendimientos netos (if applicable)
- [ ] **TAX-AUTO-05**: System calculates IRPF using 2025/2026 progressive brackets (19-47%)
- [ ] **TAX-AUTO-06**: System applies mínimo personal (€5,550) and mínimo por descendientes
- [ ] **TAX-AUTO-07**: Quarterly payment = Annual IRPF × 20% - Retenciones already withheld
- [ ] **TAX-AUTO-08**: System shows cumulative calculation (Q3 = Q1+Q2+Q3 annual, not just Q3)
- [ ] **TAX-AUTO-09**: System tracks retenciones from client invoices (IRPF retention deducted from payment due)
- [ ] **TAX-AUTO-10**: System shows Modelo 130 deadlines: April 20, July 20, October 20, January 30
- [ ] **TAX-AUTO-11**: System alerts if quarterly result is zero or negative (filing still required)
- [ ] **TAX-AUTO-12**: User can download pre-filled Modelo 130 PDF
- [ ] **TAX-AUTO-13**: System calculates annual IRPF summary (for Renta declaration)
- [ ] **TAX-AUTO-14**: System tracks RETA cuota (fixed or actual from registrations)
- [ ] **TAX-AUTO-15**: System calculates RETA regularization exposure (actual income vs declared tramo)
- [ ] **TAX-AUTO-16**: System shows real-time RETA regularization estimate
- [ ] **TAX-AUTO-17**: System replaces static scenarios with dynamic projections (real data + assumptions)
- [ ] **TAX-AUTO-18**: User can adjust projection assumptions: future income, expense rates
- [ ] **TAX-AUTO-19**: System calculates cash flow reserve needed: 20% IRPF + 21% IVA collected + RETA
- [ ] **TAX-AUTO-20**: System shows disposable income: Paid invoices - Expenses - Taxes - RETA - Private costs

### Tax Automation - SL (TAX-SL)

- [ ] **TAX-SL-01**: System calculates quarterly Modelo 202 (corporate tax advance payments)
- [ ] **TAX-SL-02**: Modelo 202 schedule: April 20, October 20, December 20 (3x/year, not 4x)
- [ ] **TAX-SL-03**: Modelo 202 payment = Prior year IS liability × 18% ÷ 3 (simplified method)
- [ ] **TAX-SL-04**: System calculates base imponible (ingresos - gastos deducibles)
- [ ] **TAX-SL-05**: System applies Impuesto de Sociedades rate: 15% (first 2 years for nueva empresa), 23% (micro-empresa 2025-2026), 25% (general)
- [ ] **TAX-SL-06**: System does NOT apply gastos difícil justificación for SL (only autónomos)
- [ ] **TAX-SL-07**: System tracks BINs (bases imponibles negativas) for carry-forward (losses offset future profits)
- [ ] **TAX-SL-08**: System shows Modelo 200 annual deadline: July 1-25
- [ ] **TAX-SL-09**: User can download pre-filled Modelo 200 PDF
- [ ] **TAX-SL-10**: System calculates annual corporate tax: Base imponible × IS rate - Modelo 202 payments
- [ ] **TAX-SL-11**: System tracks SL administrador social security (autónomo societario cuota)
- [ ] **TAX-SL-12**: For administrador with >25% shares, system shows fixed €1,000 minimum base (€315/month cuota)
- [ ] **TAX-SL-13**: System optimizes salary vs dividend: Shows tax impact of paying admin via salary (IRPF + SS) vs dividend (19-28% IRPF only)
- [ ] **TAX-SL-14**: System alerts if admin taking money without proper retribution (must use salary or dividend, not "préstamo")

### SL Accounting & Financial Statements (ACCOUNTING)

- [ ] **ACCOUNTING-01**: SL entity requires balance sheet (balance de situación)
- [ ] **ACCOUNTING-02**: Balance sheet includes: Activo (assets), Pasivo (liabilities), Patrimonio neto (equity)
- [ ] **ACCOUNTING-03**: System auto-generates balance from expenses (categorized by chart of accounts)
- [ ] **ACCOUNTING-04**: SL entity requires P&L statement (cuenta de pérdidas y ganancias)
- [ ] **ACCOUNTING-05**: P&L includes: Ingresos (from invoices), Gastos (from expenses), Resultado (profit/loss)
- [ ] **ACCOUNTING-06**: System auto-generates P&L from invoices and expenses for fiscal year
- [ ] **ACCOUNTING-07**: User can view libro diario (journal entries) - all transactions chronologically
- [ ] **ACCOUNTING-08**: System tracks fiscal year: Calendar year (Jan 1 - Dec 31) or custom fiscal year
- [ ] **ACCOUNTING-09**: System shows Cuentas Anuales deadline: 6 months after fiscal year end (typically July 30 for calendar year)
- [ ] **ACCOUNTING-10**: User can export Cuentas Anuales (Balance + P&L + Memoria) as PDF
- [ ] **ACCOUNTING-11**: System alerts 30 days before Cuentas Anuales deadline
- [ ] **ACCOUNTING-12**: System prevents fiscal year close if invoices/expenses pending categorization

### Cross-Entity Integration (CROSS)

- [ ] **CROSS-01**: System detects if user is both autónomo + SL administrador (dual activity)
- [ ] **CROSS-02**: For dual activity, system shows combined RETA calculation (both bases)
- [ ] **CROSS-03**: User can create invoice from autónomo entity to own SL entity (operación vinculada)
- [ ] **CROSS-04**: System flags related-party transactions (user owns >25% of client entity)
- [ ] **CROSS-05**: System validates arm's-length pricing for related-party invoices (market rate comparison)
- [ ] **CROSS-06**: System warns if SL paying autónomo for services without proper contract (audit risk)
- [ ] **CROSS-07**: User can allocate shared expenses across entities (e.g., home office used by both autónomo + SL)
- [ ] **CROSS-08**: System shows consolidated view: Total income, expenses, taxes across all entities
- [ ] **CROSS-09**: User can run optimization simulator: "Should I take this project as autónomo or SL?" (tax comparison)

### Multi-Jurisdiction & IVA (IVA)

- [ ] **IVA-01**: For Spanish clients, invoice includes 21% IVA (or 10%, 4% for reduced rates)
- [ ] **IVA-02**: For EU B2B clients, invoice shows "Inversión del sujeto pasivo - Art. 196 Directiva 2006/112/CE" (no IVA charged)
- [ ] **IVA-03**: For EU B2B, system validates client VIES number before allowing inversion sujeto pasivo
- [ ] **IVA-04**: For UK/US/CA/AU (third country) clients, invoice shows no IVA (export of services)
- [ ] **IVA-05**: System calculates quarterly Modelo 303 (IVA): IVA repercutido (collected) - IVA soportado (paid on expenses)
- [ ] **IVA-06**: Modelo 303 deadlines: April 20, July 20, October 20, January 30
- [ ] **IVA-07**: System generates annual Modelo 390 (IVA summary)
- [ ] **IVA-08**: For EU intracomunitario operations, system generates quarterly Modelo 349
- [ ] **IVA-09**: Modelo 349 lists all EU client invoices with: NIF-IVA, invoice total, operation code
- [ ] **IVA-10**: System tracks Belgian IVA paid on expenses (hotels, meals) for potential Modelo 360 refund
- [ ] **IVA-11**: For US clients with W-8BEN, system applies 0% withholding (vs 24% default for non-residents)

### Reports & Analytics (REPORTS)

- [ ] **REPORTS-01**: User can view dashboard: Total income, expenses, profit, tax liability (current month, quarter, year)
- [ ] **REPORTS-02**: Dashboard shows: Unpaid invoices total, overdue invoices count, upcoming tax deadlines
- [ ] **REPORTS-03**: User can view client profitability report: Revenue vs expenses per client, sorted by profit margin
- [ ] **REPORTS-04**: User can view expense breakdown: By category, by month, by client
- [ ] **REPORTS-05**: User can view income timeline: Monthly income chart, year-over-year comparison
- [ ] **REPORTS-06**: User can view tax obligation timeline: Upcoming Modelo 130/202, estimated amounts
- [ ] **REPORTS-07**: User can export all reports to PDF, CSV, Excel
- [ ] **REPORTS-08**: User can generate annual summary report for gestor submission
- [ ] **REPORTS-09**: Report includes: All invoices, expenses, receipts, tax calculations, calendar data
- [ ] **REPORTS-10**: User can filter reports by date range, entity, client, project

### Data Migration & Export (MIGRATION)

- [ ] **MIGRATION-01**: User can import v1.1 data from localStorage (expenses, calendar, income, scenarios)
- [ ] **MIGRATION-02**: System transforms v1.1 expenses to v2.0 expense+receipt model
- [ ] **MIGRATION-03**: System transforms v1.1 income entries to v2.0 invoices (creates invoices from income log)
- [ ] **MIGRATION-04**: System transforms v1.1 calendar to v2.0 calendar (preserves 183-day data)
- [ ] **MIGRATION-05**: System transforms v1.1 scenarios to v2.0 dynamic projections
- [ ] **MIGRATION-06**: Migration wizard shows preview: "X expenses, Y income entries, Z calendar days will be imported"
- [ ] **MIGRATION-07**: User can export all business data (backup): Clients, invoices, expenses, receipts, calendar to JSON
- [ ] **MIGRATION-08**: User can import data from backup JSON (restore from export)
- [ ] **MIGRATION-09**: System enforces 4-year retention: Invoices/expenses cannot be permanently deleted within 4 years
- [ ] **MIGRATION-10**: After 4 years, user can permanently delete (GDPR compliance)

### Cloud Sync & Offline (SYNC)

- [ ] **SYNC-01**: System stores data in IndexedDB (offline-first, Dexie.js)
- [ ] **SYNC-02**: System syncs data to Supabase cloud when online
- [ ] **SYNC-03**: User can work offline: Create clients, invoices, expenses, tag calendar
- [ ] **SYNC-04**: Offline changes queued in sync queue
- [ ] **SYNC-05**: When online, system syncs queued changes to cloud
- [ ] **SYNC-06**: System detects sync conflicts (same record edited on 2 devices offline)
- [ ] **SYNC-07**: For conflicts, system shows both versions and asks user to resolve
- [ ] **SYNC-08**: System encrypts sensitive data at rest (NIF, CIF, client tax IDs)
- [ ] **SYNC-09**: System backs up receipts to Supabase Storage (separate from database)
- [ ] **SYNC-10**: User can see sync status: "Synced", "Syncing...", "Offline", "Conflict"
- [ ] **SYNC-11**: User can view sync log: Recent changes, conflicts resolved, errors

### Mobile & PWA (MOBILE)

- [ ] **MOBILE-01**: App is Progressive Web App (PWA) - installable on home screen
- [ ] **MOBILE-02**: Mobile layout: Vertical navigation, bottom tab bar, full-screen views
- [ ] **MOBILE-03**: Touch targets minimum 44px for accessibility
- [ ] **MOBILE-04**: User can upload receipt photo from phone camera (direct capture)
- [ ] **MOBILE-05**: Receipt upload shows live preview before submitting
- [ ] **MOBILE-06**: Mobile calendar uses swipe gestures for month navigation
- [ ] **MOBILE-07**: Mobile invoice view uses collapsible sections (line items, client info)
- [ ] **MOBILE-08**: Mobile expense list uses card layout with swipe-to-delete
- [ ] **MOBILE-09**: System works offline on mobile (queues changes for sync)
- [ ] **MOBILE-10**: Mobile notifications: Invoice overdue, tax deadline approaching, sync conflict

### Settings & Preferences (SETTINGS)

- [ ] **SETTINGS-01**: User can set language: English, Spanish, Dutch
- [ ] **SETTINGS-02**: User can set currency display: €X,XXX.XX (Spanish) vs X.XXX,XX € (European)
- [ ] **SETTINGS-03**: User can set fiscal year start: Calendar (Jan 1) or custom month
- [ ] **SETTINGS-04**: User can configure invoice template: Logo, bank details, legal terms, signature
- [ ] **SETTINGS-05**: User can set default IVA rate: 21% (general), 10% (reduced), 4% (super-reduced)
- [ ] **SETTINGS-06**: User can configure expense categories (add custom categories)
- [ ] **SETTINGS-07**: User can set tax residence: Spain (default), other (affects 183-day warnings)
- [ ] **SETTINGS-08**: User can configure notification preferences: Email, push, in-app
- [ ] **SETTINGS-09**: User can export settings (backup preferences)
- [ ] **SETTINGS-10**: User can delete account (GDPR right to erasure)

## Future Requirements (Defer to v2.1+)

### Payroll & Employees
- **PAY-01**: SL can add employees with payroll tracking
- **PAY-02**: Calculate employee IRPF retention and SS contributions
- **PAY-03**: Generate payroll receipts (nominas)
- **PAY-04**: Track Modelo 111 (employee IRPF retention quarterly)

### Advanced Accounting
- **ACC-01**: Full chart of accounts (Plan General Contable PYMES)
- **ACC-02**: Double-entry bookkeeping with debits/credits
- **ACC-03**: Asset depreciation tracking (amortizacion)
- **ACC-04**: Inventory management for product businesses

### Bank Integration
- **BANK-01**: Connect bank account via API (Plaid, OpenBanking)
- **BANK-02**: Auto-import transactions
- **BANK-03**: Auto-match transactions to invoices/expenses

### Advanced Multi-Jurisdiction
- **MULTI-01**: Support additional countries (Portugal, France, Germany)
- **MULTI-02**: Multi-currency accounting with exchange rate tracking
- **MULTI-03**: Consolidated financial statements across countries

## Out of Scope for All Versions

| Feature | Reason |
|---------|--------|
| Cryptocurrency accounting | High complexity, regulatory uncertainty |
| Real estate rental income | Different tax regime (rendimientos capital inmobiliario) |
| Investment portfolio tracking | Not business management, personal finance |
| Loan/financing management | Focus on operational business, not capital structure |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 14 | Pending |
| AUTH-02 | Phase 14 | Pending |
| AUTH-03 | Phase 14 | Pending |
| AUTH-04 | Phase 14 | Pending |
| AUTH-05 | Phase 14 | Pending |
| AUTH-06 | Phase 14 | Pending |
| AUTH-07 | Phase 14 | Pending |
| ENTITY-01 | Phase 13 | Pending |
| ENTITY-02 | Phase 13 | Pending |
| ENTITY-03 | Phase 13 | Pending |
| ENTITY-04 | Phase 13 | Pending |
| ENTITY-05 | Phase 13 | Pending |
| ENTITY-06 | Phase 13 | Pending |
| ENTITY-07 | Phase 13 | Pending |
| ENTITY-08 | Phase 13 | Pending |
| PERM-01 | Phase 14 | Pending |
| PERM-02 | Phase 14 | Pending |
| PERM-03 | Phase 14 | Pending |
| PERM-04 | Phase 14 | Pending |
| PERM-05 | Phase 14 | Pending |
| PERM-06 | Phase 14 | Pending |
| PERM-07 | Phase 14 | Pending |
| CLIENT-01 | Phase 15 | Pending |
| CLIENT-02 | Phase 15 | Pending |
| CLIENT-03 | Phase 15 | Pending |
| CLIENT-04 | Phase 15 | Pending |
| CLIENT-05 | Phase 15 | Pending |
| CLIENT-06 | Phase 15 | Pending |
| CLIENT-07 | Phase 15 | Pending |
| CLIENT-08 | Phase 15 | Pending |
| CLIENT-09 | Phase 15 | Pending |
| CLIENT-10 | Phase 15 | Pending |
| CLIENT-11 | Phase 15 | Pending |
| CLIENT-12 | Phase 15 | Pending |
| CLIENT-13 | Phase 15 | Pending |
| CLIENT-14 | Phase 15 | Pending |
| CALENDAR-01 | Phase 16 | Pending |
| CALENDAR-02 | Phase 16 | Pending |
| CALENDAR-03 | Phase 16 | Pending |
| CALENDAR-04 | Phase 16 | Pending |
| CALENDAR-05 | Phase 16 | Pending |
| CALENDAR-06 | Phase 16 | Pending |
| CALENDAR-07 | Phase 16 | Pending |
| CALENDAR-08 | Phase 16 | Pending |
| CALENDAR-09 | Phase 16 | Pending |
| CALENDAR-10 | Phase 16 | Pending |
| CALENDAR-11 | Phase 16 | Pending |
| CALENDAR-12 | Phase 16 | Pending |
| CALENDAR-13 | Phase 16 | Pending |
| CALENDAR-14 | Phase 16 | Pending |
| CALENDAR-15 | Phase 16 | Pending |
| CALENDAR-16 | Phase 16 | Pending |
| EXPENSE-01 | Phase 17 | Pending |
| EXPENSE-02 | Phase 17 | Pending |
| EXPENSE-03 | Phase 17 | Pending |
| EXPENSE-04 | Phase 17 | Pending |
| EXPENSE-05 | Phase 17 | Pending |
| EXPENSE-06 | Phase 17 | Pending |
| EXPENSE-07 | Phase 17 | Pending |
| EXPENSE-08 | Phase 17 | Pending |
| EXPENSE-09 | Phase 17 | Pending |
| EXPENSE-10 | Phase 17 | Pending |
| EXPENSE-11 | Phase 17 | Pending |
| EXPENSE-12 | Phase 17 | Pending |
| EXPENSE-13 | Phase 17 | Pending |
| EXPENSE-14 | Phase 17 | Pending |
| EXPENSE-15 | Phase 17 | Pending |
| INVOICE-01 | Phase 18 | Pending |
| INVOICE-02 | Phase 18 | Pending |
| INVOICE-03 | Phase 18 | Pending |
| INVOICE-04 | Phase 18 | Pending |
| INVOICE-05 | Phase 18 | Pending |
| INVOICE-06 | Phase 18 | Pending |
| INVOICE-07 | Phase 18 | Pending |
| INVOICE-08 | Phase 18 | Pending |
| INVOICE-09 | Phase 18 | Pending |
| INVOICE-10 | Phase 18 | Pending |
| INVOICE-11 | Phase 18 | Pending |
| INVOICE-12 | Phase 18 | Pending |
| INVOICE-13 | Phase 18 | Pending |
| INVOICE-14 | Phase 18 | Pending |
| INVOICE-15 | Phase 18 | Pending |
| INVOICE-16 | Phase 18 | Pending |
| INVOICE-17 | Phase 18 | Pending |
| INVOICE-18 | Phase 18 | Pending |
| INVOICE-19 | Phase 18 | Pending |
| INVOICE-20 | Phase 18 | Pending |
| INVOICE-21 | Phase 18 | Pending |
| INVOICE-22 | Phase 18 | Pending |
| INVOICE-23 | Phase 18 | Pending |
| RECEIPT-01 | Phase 19 | Pending |
| RECEIPT-02 | Phase 19 | Pending |
| RECEIPT-03 | Phase 19 | Pending |
| RECEIPT-04 | Phase 19 | Pending |
| RECEIPT-05 | Phase 19 | Pending |
| RECEIPT-06 | Phase 19 | Pending |
| RECEIPT-07 | Phase 19 | Pending |
| RECEIPT-08 | Phase 19 | Pending |
| RECEIPT-09 | Phase 19 | Pending |
| RECEIPT-10 | Phase 19 | Pending |
| RECEIPT-11 | Phase 19 | Pending |
| RECEIPT-12 | Phase 19 | Pending |
| RECEIPT-13 | Phase 19 | Pending |
| RECEIPT-14 | Phase 19 | Pending |
| RECEIPT-15 | Phase 19 | Pending |
| RECEIPT-16 | Phase 19 | Pending |
| TAX-AUTO-01 | Phase 20 | Pending |
| TAX-AUTO-02 | Phase 20 | Pending |
| TAX-AUTO-03 | Phase 20 | Pending |
| TAX-AUTO-04 | Phase 20 | Pending |
| TAX-AUTO-05 | Phase 20 | Pending |
| TAX-AUTO-06 | Phase 20 | Pending |
| TAX-AUTO-07 | Phase 20 | Pending |
| TAX-AUTO-08 | Phase 20 | Pending |
| TAX-AUTO-09 | Phase 20 | Pending |
| TAX-AUTO-10 | Phase 20 | Pending |
| TAX-AUTO-11 | Phase 20 | Pending |
| TAX-AUTO-12 | Phase 20 | Pending |
| TAX-AUTO-13 | Phase 20 | Pending |
| TAX-AUTO-14 | Phase 20 | Pending |
| TAX-AUTO-15 | Phase 20 | Pending |
| TAX-AUTO-16 | Phase 20 | Pending |
| TAX-AUTO-17 | Phase 20 | Pending |
| TAX-AUTO-18 | Phase 20 | Pending |
| TAX-AUTO-19 | Phase 20 | Pending |
| TAX-AUTO-20 | Phase 20 | Pending |
| TAX-SL-01 | Phase 21 | Pending |
| TAX-SL-02 | Phase 21 | Pending |
| TAX-SL-03 | Phase 21 | Pending |
| TAX-SL-04 | Phase 21 | Pending |
| TAX-SL-05 | Phase 21 | Pending |
| TAX-SL-06 | Phase 21 | Pending |
| TAX-SL-07 | Phase 21 | Pending |
| TAX-SL-08 | Phase 21 | Pending |
| TAX-SL-09 | Phase 21 | Pending |
| TAX-SL-10 | Phase 21 | Pending |
| TAX-SL-11 | Phase 21 | Pending |
| TAX-SL-12 | Phase 21 | Pending |
| TAX-SL-13 | Phase 21 | Pending |
| TAX-SL-14 | Phase 21 | Pending |
| ACCOUNTING-01 | Phase 22 | Pending |
| ACCOUNTING-02 | Phase 22 | Pending |
| ACCOUNTING-03 | Phase 22 | Pending |
| ACCOUNTING-04 | Phase 22 | Pending |
| ACCOUNTING-05 | Phase 22 | Pending |
| ACCOUNTING-06 | Phase 22 | Pending |
| ACCOUNTING-07 | Phase 22 | Pending |
| ACCOUNTING-08 | Phase 22 | Pending |
| ACCOUNTING-09 | Phase 22 | Pending |
| ACCOUNTING-10 | Phase 22 | Pending |
| ACCOUNTING-11 | Phase 22 | Pending |
| ACCOUNTING-12 | Phase 22 | Pending |
| CROSS-01 | Phase 23 | Pending |
| CROSS-02 | Phase 23 | Pending |
| CROSS-03 | Phase 23 | Pending |
| CROSS-04 | Phase 23 | Pending |
| CROSS-05 | Phase 23 | Pending |
| CROSS-06 | Phase 23 | Pending |
| CROSS-07 | Phase 23 | Pending |
| CROSS-08 | Phase 23 | Pending |
| CROSS-09 | Phase 23 | Pending |
| IVA-01 | Phase 24 | Pending |
| IVA-02 | Phase 24 | Pending |
| IVA-03 | Phase 24 | Pending |
| IVA-04 | Phase 24 | Pending |
| IVA-05 | Phase 24 | Pending |
| IVA-06 | Phase 24 | Pending |
| IVA-07 | Phase 24 | Pending |
| IVA-08 | Phase 24 | Pending |
| IVA-09 | Phase 24 | Pending |
| IVA-10 | Phase 24 | Pending |
| IVA-11 | Phase 24 | Pending |
| REPORTS-01 | Phase 25 | Pending |
| REPORTS-02 | Phase 25 | Pending |
| REPORTS-03 | Phase 25 | Pending |
| REPORTS-04 | Phase 25 | Pending |
| REPORTS-05 | Phase 25 | Pending |
| REPORTS-06 | Phase 25 | Pending |
| REPORTS-07 | Phase 25 | Pending |
| REPORTS-08 | Phase 25 | Pending |
| REPORTS-09 | Phase 25 | Pending |
| REPORTS-10 | Phase 25 | Pending |
| MIGRATION-01 | Phase 26 | Pending |
| MIGRATION-02 | Phase 26 | Pending |
| MIGRATION-03 | Phase 26 | Pending |
| MIGRATION-04 | Phase 26 | Pending |
| MIGRATION-05 | Phase 26 | Pending |
| MIGRATION-06 | Phase 26 | Pending |
| MIGRATION-07 | Phase 26 | Pending |
| MIGRATION-08 | Phase 26 | Pending |
| MIGRATION-09 | Phase 26 | Pending |
| MIGRATION-10 | Phase 26 | Pending |
| SYNC-01 | Phase 12 | Complete |
| SYNC-02 | Phase 27 | Pending |
| SYNC-03 | Phase 27 | Pending |
| SYNC-04 | Phase 27 | Pending |
| SYNC-05 | Phase 27 | Pending |
| SYNC-06 | Phase 27 | Pending |
| SYNC-07 | Phase 27 | Pending |
| SYNC-08 | Phase 27 | Pending |
| SYNC-09 | Phase 27 | Pending |
| SYNC-10 | Phase 27 | Pending |
| SYNC-11 | Phase 27 | Pending |
| MOBILE-01 | Phase 28 | Pending |
| MOBILE-02 | Phase 28 | Pending |
| MOBILE-03 | Phase 28 | Pending |
| MOBILE-04 | Phase 28 | Pending |
| MOBILE-05 | Phase 28 | Pending |
| MOBILE-06 | Phase 28 | Pending |
| MOBILE-07 | Phase 28 | Pending |
| MOBILE-08 | Phase 28 | Pending |
| MOBILE-09 | Phase 28 | Pending |
| MOBILE-10 | Phase 28 | Pending |
| SETTINGS-01 | Phase 29 | Pending |
| SETTINGS-02 | Phase 29 | Pending |
| SETTINGS-03 | Phase 29 | Pending |
| SETTINGS-04 | Phase 29 | Pending |
| SETTINGS-05 | Phase 29 | Pending |
| SETTINGS-06 | Phase 29 | Pending |
| SETTINGS-07 | Phase 29 | Pending |
| SETTINGS-08 | Phase 29 | Pending |
| SETTINGS-09 | Phase 29 | Pending |
| SETTINGS-10 | Phase 29 | Pending |

## Coverage

**v2.0 requirements:** 223
**Mapped to phases:** 223/223 (100%)
**Unmapped:** 0

### Coverage by Phase

| Phase | Requirements | Count |
|-------|--------------|-------|
| Phase 12: Data Architecture | SYNC-01 | 1 |
| Phase 13: Multi-Entity Architecture | ENTITY-01 to ENTITY-08 | 8 |
| Phase 14: Authentication & Permissions | AUTH-01 to AUTH-07, PERM-01 to PERM-07 | 14 |
| Phase 15: Client Management | CLIENT-01 to CLIENT-14 | 14 |
| Phase 16: Calendar Enhancement | CALENDAR-01 to CALENDAR-16 | 16 |
| Phase 17: Expense Management | EXPENSE-01 to EXPENSE-15 | 15 |
| Phase 18: Invoice Generation | INVOICE-01 to INVOICE-23 | 23 |
| Phase 19: Receipt Upload & OCR | RECEIPT-01 to RECEIPT-16 | 16 |
| Phase 20: Tax Automation - Autonomo | TAX-AUTO-01 to TAX-AUTO-20 | 20 |
| Phase 21: Tax Automation - SL | TAX-SL-01 to TAX-SL-14 | 14 |
| Phase 22: SL Accounting | ACCOUNTING-01 to ACCOUNTING-12 | 12 |
| Phase 23: Cross-Entity Integration | CROSS-01 to CROSS-09 | 9 |
| Phase 24: IVA & Multi-Jurisdiction | IVA-01 to IVA-11 | 11 |
| Phase 25: Reports & Analytics | REPORTS-01 to REPORTS-10 | 10 |
| Phase 26: Data Migration | MIGRATION-01 to MIGRATION-10 | 10 |
| Phase 27: Cloud Sync | SYNC-02 to SYNC-11 | 10 |
| Phase 28: Mobile & PWA | MOBILE-01 to MOBILE-10 | 10 |
| Phase 29: Settings & Preferences | SETTINGS-01 to SETTINGS-10 | 10 |
| **Total** | | **223** |

---
*Requirements defined: 2026-02-03*
*Traceability updated: 2026-02-03 after roadmap creation*
*Last updated: 2026-02-03*
