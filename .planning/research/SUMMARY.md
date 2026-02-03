# Project Research Summary - v2.0 Business Management System

**Project:** Spanish Autonomo Tax Calculator - Belgium Edition (v2.0 Transformation)
**Domain:** Business management system for Spanish autonomo with global clients
**Researched:** 2026-02-03
**Confidence:** HIGH

---

## Executive Summary

The v2.0 milestone transforms the validated v1.1 single-file tax calculator (8,980 lines, localStorage-based) into a production business management system with client CRM, invoice generation, receipt OCR, calendar-client integration, and tax automation. This is not an incremental feature addition but an architectural transformation: from simulation tool to financial record system.

**Recommended approach:** Progressive enhancement using **Supabase** (PostgreSQL + Auth + Storage) as the backend, **Dexie.js** for offline-first IndexedDB persistence, **pdfmake** for VeriFactu-compliant PDF invoices with QR codes, **Mindee API** for European receipt OCR, and **FullCalendar** with Google Calendar integration. The architecture maintains single-file HTML simplicity for UI while introducing proper data relationships (clients → projects → invoices → line items; expenses ↔ calendar days ↔ clients). Data migration from v1.1 localStorage must preserve the validated tax calculation engine and 183-day calendar tracking.

**Key risks:** VeriFactu invoice numbering gaps (50,000 EUR penalty), float precision errors for currency calculations, sync conflicts causing financial data loss, multi-jurisdiction IVA rules (EU inversion del sujeto pasivo vs UK/US third-country), and premature deletion of financial records (4-year retention law). The transformation introduces cross-border complexity: clients in Belgium, Netherlands, Spain, UK, US require different invoice treatment, VAT handling, and treaty compliance. OCR accuracy for European receipts (Dutch, French, Spanish) averages 90-95% but requires date format disambiguation (DD/MM vs MM/DD) and multi-language processing.

---

## Key Findings

### Recommended Stack

**Backend:** Supabase was selected over Firebase/PocketBase for its PostgreSQL relational database (perfect for clients → invoices → expenses relationships), native Row Level Security at the database level, EU data residency options (GDPR compliance), generous free tier (500MB DB + 1GB storage), and Edge Functions for proxying OCR API calls. The free tier covers years of autonomo usage; Pro plan ($25/month) only needed at high scale.

**Offline-first layer:** Dexie.js v4.0 wraps IndexedDB with built-in schema versioning, promise-based queries, and 100,000+ production sites proving stability. This preserves v1.1's offline-first UX while enabling cloud sync. The hybrid architecture: local IndexedDB (via Dexie.js) as source of truth, background sync to Supabase when online, conflict resolution with user confirmation.

**Core technologies:**
- **Supabase (PostgreSQL + Auth + Storage):** Backend infrastructure — relational model for financial data, built-in auth, file storage for receipts, EU data residency for GDPR
- **Dexie.js v4.0:** IndexedDB wrapper — offline-first persistence, schema migrations, clean async API, battle-tested at scale
- **pdfmake v0.3.2:** PDF generation — declarative JSON API, excellent table layouts for invoice line items, CDN-compatible (no build tools)
- **qrcode-generator v1.4.4:** VeriFactu QR codes — Spanish invoice compliance (mandatory July 2027)
- **Mindee API:** Receipt OCR — 90-95% accuracy on European receipts (50+ countries), automatic tax extraction, GDPR-compliant
- **FullCalendar v6:** Calendar UI — extends v1.1 calendar with client tagging, Google Calendar integration, work pattern templates

**Preserving v1.1 approach:** Vanilla JavaScript single-file HTML (no frameworks, no build tools), DM Sans + JetBrains Mono typography, dark financial dashboard theme. The tax calculation engine (`calculateFullIRPF`, `calculateCuotaIntegra`, `calculateGastosDificil`) remains unchanged — it's validated against official 2025/2026 AEAT rates.

**Cost analysis (single user):** Free tier sufficient for production (Supabase: $0, Mindee: ~$10/month for 100 receipts). Growth scenario: Supabase Pro ($25) + Mindee ($20) = $45/month. Self-hosted alternative (PocketBase + Tesseract.js local OCR): ~$5/month VPS.

### Expected Features

**Table stakes (users expect these):**

*Client Management:*
- Basic CRM: name, email, phone, address, NIF/CIF/VAT ID
- Client list with search/filter, detail view
- Quick add flow, edit/delete with soft delete
- Notes field for relationship context

*Invoice Generation:*
- Spanish factura completa format (13 mandatory fields)
- PDF generation with line items, IVA calculation
- Sequential invoice numbering (no gaps allowed)
- Status workflow: draft → sent → paid → overdue
- Due dates and payment terms (30/60/90 days)

*Receipt Upload:*
- Photo upload from device (JPG, PNG, HEIC)
- PDF upload for received invoices
- Manual data entry fallback
- Basic categorization (travel, meals, office, supplies)
- Receipt preview/gallery

*Calendar:*
- Monthly view with day status indicators
- Belgium/Spain/Travel location tracking (preserve v1.1 183-day feature)
- Day detail notes
- Month navigation

*Expense Tracking:*
- Link expense to client/project
- Billable vs overhead categorization
- Deductibility tracking
- Date, amount, vendor, category

*Tax Automation:*
- Quarterly Modelo 130 calculation
- Year-to-date income/expense summaries
- Deadline reminders (Q1: Apr 20, Q2: Jul 20, Q3: Oct 20, Q4: Jan 30)

**Differentiators (competitive advantage):**

*Spanish autonomo deep integration:*
- **VeriFactu QR codes:** PDF invoices with AEAT verification QR (mandatory July 2027), "VERI*FACTU" label, hash chain between sequential invoices
- **NIF/CIF/VAT validation:** Spanish format rules, VIES database validation for EU clients
- **Intra-community IVA:** Auto-detect EU B2B clients, apply inversion del sujeto pasivo (0% IVA), generate Modelo 349 summary
- **IRPF retention handling:** 7%/15% withholding for Spanish B2B clients, automatic deduction from Modelo 130 calculation
- **Multi-currency invoicing:** EUR, USD, GBP, CAD, AUD with ECB exchange rates, dual-currency display on invoices
- **Gastos difícil justificación:** Automatic 5% deduction (max 2,000 EUR annual) in tax calculations
- **Dietas limits:** Belgium work meals capped at 91.35 EUR/day with overnight, 48.08 EUR without

*Calendar-invoice integration:*
- **Days-worked invoicing:** Filter calendar by client + date range, generate invoice line item "12 days @ 500 EUR/day"
- **Trip-expense linking:** Group expenses by Belgium trip, attach to invoiced days
- **183-day warnings:** Real-time threshold tracking (170 days orange, 180 days red alert)
- **Multi-client day support:** Split days (morning Client A, afternoon Client B) with fractional billing

*OCR intelligence:*
- **European receipt training:** Mindee recognizes Spanish, Belgian, Dutch formats with 90-95% accuracy
- **Automatic IVA extraction:** Spanish IVA rates (21%, 10%, 4%), Belgian VAT (21%, 12%, 6%)
- **Confidence scoring:** HIGH (>90%) = auto-accept, MEDIUM (70-90%) = suggest, LOW (<70%) = manual entry
- **Duplicate detection:** Hash comparison + amount/date/vendor fuzzy matching

*Tax automation:*
- **Modelo 130 cumulative calculation:** Full year-to-date (Q3 = Jan-Sep income/expenses minus retenciones minus Q1+Q2 payments)
- **RETA regularization projection:** Compare actual rendimientos to declared tramo, warn when divergence exceeds 1 tramo
- **Modelo 349 automation:** Quarterly EU intracomunitario summary with client NIF-IVA, amounts, operation keys

*Client profitability:*
- Revenue (paid invoices) - Direct expenses (client-linked) - Overhead allocation = Net profit per client
- Activity timeline: all invoices, expenses, calendar days in reverse-chronological feed

**Defer to v2+ (scope control):**
- Full e-invoicing (FacturaE XML) — not mandatory until late 2026
- Payment gateway integration — manual bank reconciliation sufficient
- Team collaboration/permissions — single-user tool
- Email marketing — external tool if needed
- Automatic bank reconciliation — complex API integration
- Inventory management — services-focused autonomo doesn't need it

### Architecture Approach

**Layered architecture** separates concerns: UI layer (single-file HTML with vanilla JS), Application layer (state management, workflow orchestration), Service layer (ClientService, InvoiceService, ExpenseService, CalendarService, TaxService), Repository layer (generic CRUD with soft delete), Data layer (Dexie.js wrapping IndexedDB with schema versioning).

**Data model:** Relational entities with foreign keys. `Client` (1) → (N) `Contact`, `Client` (1) → (N) `Project` → (N) `Invoice` → (N) `InvoiceLine`. `Expense` links to `Client` (optional, for client-specific), `CalendarDay` (optional, for trip), `Receipt` (1:1). `CalendarDay` links to `Client` (who worked for) and has junction table to `Expense` (N:M for shared trip costs). All financial entities use **soft delete** (mark `deletedAt`, never hard delete) for Spanish 4-year retention law.

**Critical architectural decisions:**
1. **Currency as integers:** Store all monetary values in cents to avoid JavaScript float precision errors (0.1 + 0.2 !== 0.3). Use currency.js library for arithmetic.
2. **Immutable invoice numbers:** Once assigned, invoice numbers cannot be changed. Corrections require factura rectificativa (separate series). Prevents VeriFactu audit gaps.
3. **Conflict resolution:** Operation-based sync (log changes, not states). Server-wins with notification for financial data. User explicitly resolves conflicts; never silent overwrite.
4. **Offline-first:** All operations work locally (IndexedDB). Background sync queue when online. Service worker for PWA capability.

**Major components:**
1. **Client Management Service** — CRUD for clients, NIF/VIES validation, EU vs non-EU categorization, client profitability calculations
2. **Invoice Service** — Sequential numbering, PDF generation with VeriFactu QR, workflow (draft/sent/paid/overdue), factura completa validation, auto-populate from calendar days
3. **Expense Service** — Receipt upload to Supabase Storage, OCR via Edge Function (proxies Mindee API), category suggestions, client/calendar linking, deductibility rules
4. **Calendar Service** — Belgium/Spain/Travel tracking (preserve v1.1 183-day logic), client tagging, work pattern templates, Google Calendar sync (read/write), iCal export
5. **Tax Service** — Preserves v1.1 calculation engine (`calculateIRPF`, `calculateRETA`), NEW: real data integration (invoices → income, expenses → deductions), Modelo 130 cumulative quarterly, RETA regularization estimator, annual IRPF summary, projections replace static scenarios

### Critical Pitfalls

**1. VeriFactu invoice numbering gaps (CRITICAL — 50,000 EUR penalty)**
- **What:** Invoice management allows deleting invoices or creates gaps in sequence. AEAT cross-references and flags discontinuities.
- **Prevention:** Invoice numbers immutable once assigned. Draft invoices don't consume sequence until finalized. "Delete" workflow creates anulación record linking to original. Corrections require factura rectificativa (separate series). Maintain hash chain between sequential invoices.
- **Phase:** Invoice generation foundation (before any invoice can be created)

**2. Float precision currency errors (CRITICAL — calculation accuracy is core value)**
- **What:** JavaScript Number type causes `0.1 + 0.2 === 0.30000000000000004`. Small errors compound over time.
- **Prevention:** Store all monetary values as integers (cents). Use currency.js for arithmetic. Round only at display, not storage. Test suite for financial edge cases.
- **Phase:** Data architecture (before any financial data stored)

**3. Sync conflict data loss (CRITICAL — 4-year retention violation)**
- **What:** User edits expense on mobile while offline, then edits same on desktop. Last-write-wins destroys one version.
- **Prevention:** Operation-based sync (log operations, not states). Version each record with timestamp. Detect conflicts, prompt user to resolve. Server-wins with notification, not silent overwrite. Complete audit log of all changes.
- **Phase:** Data architecture (sync foundation)

**4. Global client IVA mistakes (CRITICAL — multi-jurisdiction tax compliance)**
- **What:** Different rules for EU B2B (inversion sujeto pasivo), UK (third country, no IVA), US (no IVA + W-8BEN).
- **Prevention:** Client creation requires country selection first. EU countries: mandatory VIES validation. Auto-determine invoice type. Block EU B2B invoice without valid VAT number. Quarterly Modelo 349 reminder when EU operations exist.
- **Phase:** Client management

**5. Factura completa missing mandatory fields (CRITICAL — invoice invalidity)**
- **What:** Generator omits one of 13 mandatory fields. AEAT rejects at audit, client cannot deduct.
- **Prevention:** Invoice creation requires ALL fields before save (supplier/client name, NIF, address, service description, dates, IVA breakdown, totals). Client record must have valid NIF stored. Auto-populate legal mentions (inversion del sujeto pasivo, exemptions).
- **Phase:** Client management + Invoice generation

**6. 4-year document retention violation (CRITICAL — AEAT audit + inability to defend deductions)**
- **What:** System auto-deletes old receipts/invoices before retention period expires.
- **Prevention:** Soft delete only (mark `deletedAt`, never remove). Retention period: issue date + 4 years + filing deadline. Block deletion with explanation. Regular backup verification of receipt images.
- **Phase:** Data architecture (before any delete functionality)

**High-severity pitfalls:**
- **Modelo 130 cumulative errors:** Calculate Q3 as (Jan-Sep income - Jan-Sep expenses) × 20% - retenciones - Q1 payment - Q2 payment. Not just Q3 data. Missing retenciones or prior payments causes underpayment penalties.
- **OCR date format confusion:** Belgian receipts use DD/MM/YYYY, US receipts MM/DD/YYYY. "03/04/2026" = March 4 or April 3? Wrong quarter attribution. Detect merchant location, flag ambiguous dates for user confirmation.
- **183-day counting with multiple clients:** Calendar shows 80 days Client A + 100 days Client B = user thinks 180 (safe). But many days overlap. Master presence calendar is source of truth. Client work links to days but doesn't change presence count.
- **Missing W-8BEN for US clients:** Without form, US client withholds 30% instead of 0% treaty rate. Track W-8BEN submission date (3-year validity), reminder 60 days before expiration.
- **Modelo 349 missing for EU operations:** Quarterly EU intracomunitario summary required. Penalty 150-10,000 EUR. Automatic calculation, pre-filled report with client NIF-IVA and amounts.

---

## Implications for Roadmap

Based on research, suggested **10-phase structure** (vs 7 phases in original project initialization):

### Phase 1: Data Architecture Foundation (REQUIRED FIRST)
**Rationale:** Everything depends on proper data storage. Cannot build features without persistence layer. Critical pitfalls (float precision, soft delete, sync conflicts) must be addressed before any financial data created.

**Delivers:**
- Dexie.js database schema with versioning
- Repository layer with generic CRUD
- Soft delete pattern for all financial entities
- Integer storage for currency (cents)
- localStorage → IndexedDB migration script
- Sync queue infrastructure

**Addresses:** STACK.md recommendation (Supabase + Dexie.js), PITFALLS #2 (float precision), #3 (sync conflicts), #6 (retention)

**Avoids:** Data corruption from float errors, financial record loss from sync conflicts, retention law violations

**Research flag:** Standard patterns well-documented. Skip `/gsd:research-phase`.

---

### Phase 2: Client Management & Validation
**Rationale:** Clients are core entity referenced by invoices, expenses, calendar. Must exist before other features. EU/non-EU categorization critical for invoice compliance.

**Delivers:**
- Client CRUD (create, read, update, soft delete)
- Contact management (1:N relationship)
- NIF/CIF format validation (Spanish rules)
- VIES VAT validation for EU clients
- Country-based categorization (Spain B2B/B2C, EU B2B, UK, US third-country)
- Client list with search/filter, detail view
- Default payment terms and rates storage

**Addresses:** FEATURES.md table stakes (CRM basics), differentiators (NIF validation, EU detection), PITFALLS #2 (factura fields), #5 (IVA rules)

**Avoids:** Missing mandatory invoice fields (NIF required), incorrect IVA treatment

**Research flag:** Moderate complexity for VIES API integration. May need `/gsd:research-phase` for tax number validation logic.

---

### Phase 3: Calendar Enhancement with Client Tagging
**Rationale:** Preserve v1.1's validated 183-day Belgium calendar. Extend with client tagging early because it informs invoicing (days worked) and expense linking (trip attribution).

**Delivers:**
- Migrate calendar to IndexedDB from localStorage
- Client tagging on calendar days
- Project tagging on calendar days
- Preserve 183-day calculation (CRITICAL — cannot break this)
- Multi-client day support (fractional split)
- Work pattern templates (Mon-Tue every week)
- Warning system: 170 days (orange), 180 days (red), 183 threshold alerts

**Addresses:** FEATURES.md differentiator (calendar-client integration), preserve v1.1 critical feature

**Avoids:** PITFALLS #10 (183-day counting with multiple clients) — master presence counter vs per-client work attribution

**Research flag:** Skip research. Pattern extensions to existing validated code.

---

### Phase 4: Expense Management & Receipt Foundation
**Rationale:** Expenses can be standalone (overhead) or linked to clients/calendar. Build foundation before OCR complexity. Enables deduction tracking and client profitability.

**Delivers:**
- Expense CRUD in IndexedDB
- Category/subcategory system (office, travel, equipment, professional, meals, private)
- Deductibility percentage tracking (100%, 50%, 30%, 0%)
- Client linking (optional — overhead vs client-specific)
- Calendar day linking (trip expenses)
- Receipt entity (1:1 with expense, stores image metadata)
- Receipt image storage in IndexedDB (offline support)
- Expense list with filters (by client, by category, by date range)

**Addresses:** FEATURES.md table stakes (expense tracking), PITFALLS #11 (expense-client linking ambiguity)

**Avoids:** Forced single-client attribution (allows shared/overhead), missing deduction tracking

**Research flag:** Skip research. Standard CRUD patterns.

---

### Phase 5: Invoice Generation & PDF
**Rationale:** Invoices depend on clients (for details) and can optionally pull from calendar (days worked). PDF generation with factura completa format is table stakes. VeriFactu QR preparation for July 2027 deadline.

**Delivers:**
- Invoice CRUD with immutable numbering
- Sequential number generation (2026-001, 2026-002, no gaps)
- Spanish factura completa format (all 13 mandatory fields)
- Invoice line items (description, quantity, price, total)
- IVA calculation (21%, 10%, 4%, 0% for EU/export)
- IRPF retention support (7%/15% withholding)
- Status workflow (draft → sent → paid → overdue → cancelled)
- PDF generation with pdfmake (table layouts, consistent styling)
- VeriFactu QR code with qrcode-generator (prepare for 2027, initially placeholder URL)
- Auto-populate from calendar days: select date range → generate line item "X days @ Y EUR/day"
- Billable expense pass-through (add client expenses to invoice)
- Invoice list with filters (status, client, date range)

**Addresses:** FEATURES.md table stakes (invoicing core), differentiators (VeriFactu QR, factura completa, calendar integration), PITFALLS #1 (numbering gaps), #2 (mandatory fields)

**Avoids:** Invoice deletion allowing gaps (soft delete with anulación workflow), missing factura completa fields (validation blocks finalization)

**Research flag:** MEDIUM complexity for VeriFactu QR URL format (may need `/gsd:research-phase` when AEAT publishes spec closer to July 2027). PDF generation well-documented.

---

### Phase 6: Receipt Upload & OCR
**Rationale:** Receipt upload enhances expense workflow but isn't blocking. OCR adds convenience (time-saving) but manual entry always available as fallback.

**Delivers:**
- Photo upload from device (camera integration on mobile)
- PDF upload for multi-page receipts
- Upload to Supabase Storage (cloud backup)
- Supabase Edge Function to proxy Mindee API (hide API key)
- OCR extraction: date, amount, vendor, IVA amount, category suggestion
- Confidence scoring: HIGH (>90%) green, MEDIUM (70-90%) yellow, LOW (<70%) red
- Review UI: show extracted data with confidence indicators, allow edit before accept
- Date format disambiguation (DD/MM vs MM/DD) with merchant location detection
- Duplicate detection: hash + fuzzy match (amount + date range + vendor)
- Fallback: Tesseract.js for local OCR (privacy mode, lower accuracy)
- Create expense from receipt flow

**Addresses:** FEATURES.md differentiator (European receipt OCR), PITFALLS #8 (date format confusion), #15 (OCR confidence)

**Avoids:** Auto-accepting low-confidence extractions, date attribution errors

**Research flag:** HIGH complexity for Mindee API integration and date format heuristics. Likely needs `/gsd:research-phase` for OCR provider comparison and confidence threshold tuning.

---

### Phase 7: Expense-Calendar-Client Integration
**Rationale:** Now that clients, calendar, expenses, and receipts exist, connect them intelligently. Trip detection, automatic client suggestions based on calendar patterns.

**Delivers:**
- Trip entity: group of consecutive calendar days (e.g., "Belgium Trip Mar 2-6")
- Link multiple expenses to single trip
- Automatic client suggestion: "Expense date Mar 3 = day worked for Client A. Link?"
- Billable vs non-billable marking per expense
- Client profitability calculation: sum(paid invoices) - sum(client expenses) = profit, margin %
- Overhead expense allocation (optional): split by client revenue percentage
- Deductibility compliance warnings: dietas limit (91.35 EUR/day Belgium), Modelo 360 Belgian IVA flag

**Addresses:** FEATURES.md differentiator (trip-expense linking, client profitability), PITFALLS #11 (expense attribution), #14 (dietas limit)

**Avoids:** Missing deduction opportunities, over-deduction beyond dietas limits

**Research flag:** Skip research. Business logic connecting existing entities.

---

### Phase 8: Tax Automation (Modelo 130 + Projections)
**Rationale:** Tax calculations need complete data (invoices = income, expenses = deductions, retenciones from invoices). Replace v1.1 static scenarios with dynamic projections based on actual data.

**Delivers:**
- Quarterly Modelo 130 calculation (cumulative: Q3 = Jan-Sep income - Jan-Sep expenses)
- Retenciones tracking from invoices (sum IRPF retention amounts)
- Prior quarter payment tracking (subtract from current quarter liability)
- Zero/negative result filing reminder (still required)
- Gastos difícil justificación automatic (5% of net, max 2,000 EUR/year)
- RETA regularization estimator: compare actual rendimientos to declared tramo, project year-end lump sum
- Annual IRPF summary: full-year income, deductions, estimated tax bracket
- Dynamic projections: YTD actual + assumptions for remaining months → projected annual tax
- Replace v1.1 static scenarios (A/B/C/D/E) with "What if?" projections based on real data
- Tax calendar with deadline reminders (Q1: Apr 20, Q2: Jul 20, Q3: Oct 20, Q4: Jan 30)

**Addresses:** FEATURES.md differentiator (tax automation), PITFALLS #7 (Modelo 130 cumulative), #13 (RETA projection)

**Avoids:** Quarterly calculation errors (missing retenciones, forgetting prior payments), RETA regularization shock

**Research flag:** Skip research. Tax formulas validated in v1.1, now integrating with real data.

---

### Phase 9: Modelo 349 & Multi-Jurisdiction Awareness
**Rationale:** EU client operations require quarterly Modelo 349 summary. UK/US clients need treaty compliance awareness (W-8BEN). Separate phase to avoid overloading invoice generation.

**Delivers:**
- Modelo 349 automatic calculation: sum EU B2B invoices per client per quarter
- Pre-filled report: client NIF-IVA, amounts, operation key ("S" for services)
- Filing threshold detection: monthly (>50,000 EUR/quarter) vs quarterly
- Reminder when EU operations exist: "File Modelo 349 by [date]"
- W-8BEN tracking for US clients: submission date, expiration (3 years), renewal reminder
- Multi-currency exchange rate tracking: store invoice currency + EUR equivalent for tax reporting
- Modelo 360 awareness: flag Belgian IVA amounts for annual foreign VAT refund (due by Sep 30)

**Addresses:** FEATURES.md differentiator (intra-community IVA), PITFALLS #5 (IVA rules), #9 (W-8BEN), #12 (Modelo 349)

**Avoids:** Missing Modelo 349 filings (10,000 EUR penalty), 30% US withholding from missing W-8BEN

**Research flag:** MEDIUM complexity for multi-jurisdiction rules. May need `/gsd:research-phase` for Modelo 349 operation codes and W-8BEN workflow.

---

### Phase 10: Cloud Sync & Mobile Optimization
**Rationale:** System works offline-first. Cloud sync adds cross-device value (desktop + mobile). PWA optimization for receipt capture on-the-go.

**Delivers:**
- Supabase authentication (email/password)
- Background sync: IndexedDB → Supabase PostgreSQL when online
- Sync queue processing with retry logic
- Conflict detection and user resolution UI
- Row Level Security policies (users only access own data)
- Receipt image backup to Supabase Storage
- Service worker for offline PWA capability
- Mobile-optimized receipt upload (camera integration, compression)
- Offline upload queue: "3 receipts pending upload" indicator
- Push notifications for sync completion
- Data export (JSON + receipt images ZIP) for backup/portability

**Addresses:** STACK.md recommendation (Supabase backend), PITFALLS #4 (sync conflicts), #18 (mobile offline upload)

**Avoids:** Data loss from sync conflicts (user confirms resolution), receipt loss from offline mode (queued uploads)

**Research flag:** HIGH complexity for conflict resolution strategy and service worker setup. Likely needs `/gsd:research-phase` for PWA best practices and sync patterns.

---

### Phase Ordering Rationale

**Dependencies drive order:**
1. **Data architecture** is foundation (no features without storage)
2. **Clients** are core entity (invoices/expenses reference them)
3. **Calendar** extends existing v1.1 feature (preserve 183-day logic, add client tagging)
4. **Expenses** can exist standalone or linked to clients/calendar
5. **Invoices** depend on clients, optionally pull from calendar
6. **Receipt OCR** enhances expenses (but manual entry always works)
7. **Integration** connects existing entities (expenses ↔ calendar ↔ clients)
8. **Tax automation** reads all data (invoices, expenses, calendar)
9. **Multi-jurisdiction** extends invoicing/tax (separate to avoid overload)
10. **Sync** adds cross-device value (system works offline-first)

**Grouping by architecture layers:**
- Phases 1-4: Data layer + core entities (foundation)
- Phases 5-7: Feature layer (invoicing, OCR, integration)
- Phases 8-9: Business logic layer (tax automation, compliance)
- Phase 10: Infrastructure layer (sync, mobile)

**Pitfall mitigation:**
- Critical pitfalls (float precision, numbering gaps, retention, IVA rules) addressed early (Phases 1-2, 5)
- High-severity pitfalls (Modelo 130, OCR dates, 183-day) addressed in relevant features (Phases 3, 6, 8)
- Medium-severity pitfalls (RETA projection, dietas, OCR confidence) addressed as enhancements (Phases 6-8)

**Build order preserves v1.1 value:**
- Phase 3 migrates calendar without breaking 183-day tracking
- Phase 8 preserves tax calculation engine (`calculateIRPF` unchanged)
- Throughout: single-file HTML, no frameworks, dark theme maintained

### Research Flags

**Phases needing deeper research:**
- **Phase 2 (Client Management):** VIES API integration patterns, tax number validation algorithms — MODERATE complexity, may need `/gsd:research-phase`
- **Phase 5 (Invoice Generation):** VeriFactu QR URL format when AEAT publishes spec — LOW urgency (July 2027 deadline), defer research until 2026 H2
- **Phase 6 (Receipt OCR):** Mindee API vs alternatives, confidence threshold tuning, multi-language accuracy — HIGH complexity, RECOMMEND `/gsd:research-phase`
- **Phase 9 (Multi-Jurisdiction):** Modelo 349 operation codes, W-8BEN workflow specifics — MODERATE complexity, may need `/gsd:research-phase`
- **Phase 10 (Cloud Sync):** Conflict resolution strategies, service worker architecture, PWA manifest — HIGH complexity, RECOMMEND `/gsd:research-phase`

**Phases with standard patterns (skip research):**
- **Phase 1 (Data Architecture):** Dexie.js schema design, CRUD patterns — well-documented
- **Phase 3 (Calendar Enhancement):** Extend existing v1.1 code — internal patterns known
- **Phase 4 (Expense Management):** Standard CRUD + relationships — well-documented
- **Phase 7 (Integration):** Business logic connecting entities — domain-specific, no external research needed
- **Phase 8 (Tax Automation):** Tax formulas validated in v1.1 — integration only

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Supabase vs Firebase vs PocketBase comparison verified with official docs. Dexie.js usage at 100,000+ sites (WhatsApp Web, Microsoft To Do). pdfmake actively maintained (v0.3.2 Jan 2026). Mindee receipts trained on 50+ countries. Free tier limits confirmed. |
| **Features** | HIGH | Table stakes from CRM/invoicing industry norms (multiple sources). Spanish autonomo differentiators from official AEAT requirements (VeriFactu RD 254/2025, factura completa BOE). OCR accuracy benchmarks from 2025-2026 studies. |
| **Architecture** | HIGH | Layered architecture is industry standard. Offline-first patterns documented. Soft delete for financial data is regulatory requirement (Article 66 LGT). Data model follows standard CRM/invoicing relationships. |
| **Pitfalls** | MEDIUM-HIGH | VeriFactu penalties verified (RD 254/2025). Float precision is known JavaScript issue. Sync conflicts from PWA patterns. IVA rules from AEAT official guidance. 4-year retention from Spanish tax law. OCR date format from European standards. Some pitfalls (e.g., Modelo 349 thresholds) need validation during implementation. |

**Overall confidence:** HIGH for architecture and technology choices. MEDIUM-HIGH for implementation details and edge cases.

### Gaps to Address

**VeriFactu QR URL format:** AEAT has not yet published exact URL structure for verification portal. Placeholder QR generated in Phase 5, updated when spec available (expected 2026 H2). Deadline: July 2027.

**OCR accuracy on real data:** Mindee reports 90-95% on European receipts, but actual performance depends on photo quality, receipt types (handwritten vs printed), languages (Dutch/French/Spanish mix). Needs testing with representative sample during Phase 6.

**Modelo 349 operation codes:** Research identifies key codes ("S" for services), but full list and edge cases (intra-community acquisitions, triangular operations) need validation from AEAT documentation during Phase 9.

**Google Calendar API quotas:** Free tier quotas for Google Calendar API need verification. If user has high sync frequency (daily), may hit limits. Fallback: longer sync intervals or iCal export-only mode.

**Conflict resolution strategy:** Research identifies patterns (operation-based sync, vector clocks), but specific implementation for financial data (where accuracy is critical) needs design during Phase 10. User testing required to validate resolution UI.

**Mobile PWA manifest requirements:** Service worker patterns documented, but specific manifest.json config for iOS home screen install (scope, icons, display mode) needs validation during Phase 10.

---

## Sources

### Primary (HIGH confidence)

**Official Spanish Government:**
- AEAT - VeriFactu Systems: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html
- AEAT - Modelo 130 Instructions: https://sede.agenciatributaria.gob.es/Sede/en_gb/impuestos-tasas/impuesto-sobre-renta-personas-fisicas/modelo-130-irpf______esionales-estimacion-directa-fraccionado_/instrucciones.html
- BOE - Article 66 LGT (4-year retention): https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186
- BOE - Real Decreto 254/2025 (VeriFactu QR): https://www.boe.es/boe/dias/2025/

**Official EU/International:**
- VIES VAT Number Validation: https://ec.europa.eu/taxation_customs/vies
- IRS Form W-8BEN: https://www.irs.gov/forms-pubs/about-form-w-8-ben
- GDPR Hub - AEPD Spain Rulings: https://gdprhub.eu

**Technology Official Docs:**
- Supabase Docs: https://supabase.com/docs
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Dexie.js: https://dexie.org/
- pdfmake GitHub: https://github.com/bpampuch/pdfmake
- Mindee Receipt OCR: https://www.mindee.com/product/receipt-ocr-api
- FullCalendar Docs: https://fullcalendar.io/docs

### Secondary (MEDIUM confidence)

**Architecture & Patterns:**
- LogRocket: Offline-first frontend apps 2025 (IndexedDB/SQLite): https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/
- Medium: Offline-First Architecture: https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79
- DEV.to: Frontend Architecture Patterns 2026: https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo

**Spanish Autonomo Guidance:**
- Getrenn: VeriFactu Dates, QR, Penalties: https://getrenn.com/blog/verifactu
- Getrenn: Mandatory Invoice Details: https://getrenn.com/blog/mandatory-invoice-details
- Getrenn: Self-Employed Invoicing Guide: https://getrenn.com/blog/self-employed-invoicing
- Declarando: Modelo 130 Guide: https://declarando.es/modelo-130
- Declarando: Modelo 349 Guide: https://declarando.es/modelo-349
- TuKonta: IVA Intracomunitario: https://tukonta.com/asesoramiento/iva-intracomunitario/
- Marosa VAT: Reverse Charge Spain: https://marosavat.com/manual/vat/spain/reverse-charge/

**Technology Comparisons:**
- Supabase vs Firebase vs PocketBase: https://www.supadex.app/blog/supabase-vs-firebase-vs-pocketbase-which-one-should-you-choose-in-2025
- Supabase Pricing 2026: https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance
- pdfmake vs jsPDF: https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p
- OCR Accuracy Benchmarks: https://research.aimultiple.com/ocr-accuracy/
- Currency.js: https://currency.js.org/

**Financial Precision:**
- DEV.to: Handle Money in JavaScript (Financial Precision): https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc
- Robin Wieruch: JavaScript Rounding Errors: https://www.robinwieruch.de/javascript-rounding-errors/

### Tertiary (needs validation)

**Migration & Soft Delete:**
- Medium: Replacing LocalStorage with IndexedDB: https://xon5.medium.com/replacing-localstorage-with-indexeddb-2e11a759ff0c
- Marty Friedel: Deleting data - soft, hard or audit: https://www.martyfriedel.com/blog/deleting-data-soft-hard-or-audit

**PWA Patterns:**
- GTCSys: Data Synchronization in PWAs: https://gtcsys.com/comprehensive-faqs-guide-data-synchronization-in-pwas-offline-first-strategies-and-conflict-resolution/
- Monterail: Make Your PWA Work Offline Part 2: https://www.monterail.com/blog/pwa-offline-dynamic-data

---

*Research completed: 2026-02-03*
*Ready for roadmap: YES*
*Next step: Use for v2.0 requirements definition and 10-phase roadmap creation*
