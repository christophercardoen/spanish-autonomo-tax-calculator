# Project Research Summary - v2.0 Business Management System (Multi-Entity Expansion)

**Project:** Spanish Autonomo Tax Calculator - Belgium Edition (v2.0 Transformation + SL Support)
**Domain:** Multi-entity business management system for Spanish autonomo + Sociedad Limitada with global clients
**Researched:** 2026-02-03 (SL expansion added)
**Confidence:** HIGH

---

## Executive Summary

The v2.0 milestone transforms the validated v1.1 single-file tax calculator (8,980 lines, localStorage-based) into a production business management system with **multi-entity support** — enabling users to manage both autonomo sole proprietorships AND Sociedad Limitada (SL) companies from a single platform. This is not an incremental feature addition but an architectural transformation: from simulation tool to financial record system with entity-type awareness.

**Expanded scope:** The system now supports **three user scenarios**: (1) autonomo only, (2) SL only, (3) dual activity (autonomo + SL admin). Each entity type has different tax regimes (IRPF 19-47% progressive vs Impuesto de Sociedades 15-25% flat), different social security rules (RETA autonomo vs autonomo societario with 1,000 EUR minimum base), different accounting obligations (libro ingresos/gastos vs libro diario + cuentas anuales), and different filing calendars (Modelo 130 quarterly vs Modelo 202 + 200). The multi-tenant architecture requires entity-type selection, data isolation per business, separate tax engines, and permissions for shared access (gestor, accountant).

**Recommended approach:** Progressive enhancement using **Supabase** (PostgreSQL + Auth + Storage) with Row Level Security for multi-tenant isolation, **Dexie.js** for offline-first IndexedDB persistence, **pdfmake** for VeriFactu-compliant PDF invoices (different requirements for SL: razon social, Registro Mercantil data), **Mindee API** for European receipt OCR, and **FullCalendar** with Google Calendar integration. The architecture maintains single-file HTML simplicity for UI while introducing proper data relationships (users → entities → clients → invoices) with entity-type polymorphism. Data migration from v1.1 localStorage must preserve the validated tax calculation engine and 183-day calendar tracking, then extend with SL-specific calculations (BINs carry-forward, salary vs dividend optimization).

**Key risks:** All existing v2.0 risks (VeriFactu numbering gaps, float precision, sync conflicts, multi-jurisdiction IVA) PLUS SL-specific pitfalls: missing Cuentas Anuales filing (1,200-60,000 EUR fine), admin without RETA registration (retroactive contributions), mixing personal/company money (pierce corporate veil), forgetting Modelo 202 (quarterly corporate tax advances), and undocumented admin retribution (IS deduction disallowed). The SL complexity introduces cross-entity scenarios: autonomo invoicing own SL (operaciones vinculadas risk), dual RETA calculation (societario base overrides autonomo), and optimal salary vs dividend extraction (tax arbitrage between IRPF and IS rates).

---

## Key Findings

### Recommended Stack (Updated for Multi-Tenant Architecture)

**Backend:** Supabase selected for its **Row Level Security (RLS)** at database level — critical for multi-tenant architecture where users can have multiple entities. PostgreSQL's native RLS policies isolate data: `WHERE entity_id IN (SELECT entity_id FROM user_entity_access WHERE user_id = auth.uid())`. This handles both single-user entities and shared access (gestor sees entity but can't edit). Alternative approaches (Firebase rules, PocketBase auth) would require application-layer isolation, increasing complexity and security risk.

**Entity-type polymorphism:** Database schema uses `entity_type` enum ('autonomo', 'sl') to drive different behavior:
- Tax calculations: autonomo → IRPF engine, SL → IS engine
- Social security: autonomo → RETA tramo tables, SL admin → autonomo societario (1,000 EUR base fixed)
- Expense deductions: autonomo → gastos dificil 5%, SL → NO gastos dificil
- Filing deadlines: autonomo → Modelo 130 (Q1-Q4), SL → Modelo 202 (Q1, Q3, Q4) + Modelo 200 (annual)

**Offline-first layer:** Dexie.js v4.0 with **entity-scoped stores**. Each IndexedDB store filtered by active entity: `db.clients.where('entity_id').equals(currentEntityId)`. Sync to Supabase maintains entity separation at cloud layer. This preserves v1.1's offline-first UX while enabling cross-device sync AND multi-entity management.

**Core technologies (unchanged from v2.0):**
- **Supabase (PostgreSQL + Auth + Storage):** Multi-tenant backend with RLS — entity-level data isolation, gestor/accountant permissions, EU data residency for GDPR
- **Dexie.js v4.0:** IndexedDB wrapper — offline-first with entity filtering, schema migrations for SL fields, battle-tested at scale
- **pdfmake v0.3.2:** PDF generation — handles both autonomo (NIF personal) and SL (razon social, Registro Mercantil data) invoice templates
- **qrcode-generator v1.4.4:** VeriFactu QR codes — earlier deadline for SL (Jan 2027 vs Jul 2027)
- **Mindee API:** Receipt OCR — 90-95% accuracy on European receipts, works same for autonomo/SL expenses
- **FullCalendar v6:** Calendar UI — extends v1.1 calendar with entity-specific work tracking

**NEW requirement: Dual tax engines**
- Preserve v1.1 autonomo engine: `calculateFullIRPF`, `calculateCuotaIntegra`, `calculateGastosDificil`
- Add SL engine: `calculateIS` (base imponible → tipo aplicable → cuota integra), `calculateBINOffset` (loss carry-forward), `salaryVsDividendOptimizer`

**Preserving v1.1 approach:** Vanilla JavaScript single-file HTML (no frameworks), but with entity-type routing logic. User sees entity switcher: "My Autonomo | My SL Company". Switching changes data context (clients, invoices filtered by entity_id) and tax calculations (IRPF vs IS). DM Sans + JetBrains Mono typography, dark financial dashboard theme maintained.

**Cost analysis (single user with dual activity):** Free tier sufficient for production (Supabase: $0 for <500MB, Mindee: ~$10/month for 100 receipts across both entities). Growth scenario: Supabase Pro ($25) + Mindee ($20) = $45/month. Multi-user (gestor access): same cost (RLS handles permissions without extra infrastructure).

### Expected Features (Expanded for SL Support)

**Table stakes for autonomo (unchanged from v2.0):**
- Client CRM, invoice generation (factura completa), receipt OCR, Belgium calendar (183-day tracking), expense deduction tracking, Modelo 130 quarterly automation

**NEW table stakes for SL:**

*Entity Identity:*
- CIF/NIF field with B-prefix validation (SL format)
- Razon social (legal company name) vs nombre comercial
- Registro Mercantil data: Tomo, Folio, Hoja, Inscripcion (required on invoices)
- Constitution date, share capital amount
- Entity type selector: autonomo, SL, or both

*Tax Regime (Impuesto de Sociedades):*
- IS calculator with rate detection: 25% general, 21-22% micro-empresas (<1M turnover), 15% startups (first 4 years)
- Modelo 202 quarterly advances (18% of prior year cuota integra, only Q1/Q3/Q4)
- Modelo 200 annual corporate tax return (July 1-25 deadline)
- BINs (Bases Imponibles Negativas) loss carry-forward tracker (unlimited years, 70% offset limit)

*Social Security (Autonomo Societario):*
- Detection: admin with >25% shares + functions = RETA required
- 1,000 EUR minimum contribution base (vs 653.59 EUR for autonomo persona fisica)
- Fixed cuota ~315 EUR/month (no tarifa plana eligibility)
- 3% gastos dificil for SS calculation (vs 7% for autonomo)
- Dual activity handling: autonomo + SL admin = single RETA as societario

*Expense Deductions (Different Rules):*
- NO gastos dificil justificacion for IS (only for autonomo)
- Company car: 100% deductible if business use (vs 50% for autonomo)
- Meals: no daily dietas limits (vs 91.35 EUR Belgium for autonomo)
- Client entertainment: up to 1% of net revenue cap
- Admin salary: deductible for IS (must be in estatutos)
- Dividends: NOT deductible for IS

*Accounting Books:*
- Libro Diario (daily transaction journal) — mandatory
- Libro de Inventarios y Cuentas Anuales (quarterly trial balances) — mandatory
- Libro Mayor (general ledger) — recommended
- P&L generator (cuenta de perdidas y ganancias)
- Balance sheet generator (balance de situacion, simplified PYME model)

*Annual Accounts (Cuentas Anuales):*
- Formulation deadline: 3 months after FY end (March 31 for calendar year)
- Shareholder approval: 6 months after FY end (June 30)
- Registro Mercantil filing: 1 month after approval (July 30)
- Penalty for non-filing: 1,200-60,000 EUR + registration sheet closed
- PYME model eligibility: <2.85M assets, <5.7M turnover, <50 employees

*Invoicing Differences:*
- Invoice template includes: razon social, CIF (B-prefix), Registro Mercantil data
- VeriFactu earlier deadline: Jan 1, 2027 for SL (vs Jul 1, 2027 for autonomo)
- Same factura completa 13 fields, same IVA rules

*Filing Calendar Differences:*
- IVA (Modelo 303): same as autonomo
- Corporate tax advances (Modelo 202): Apr 1-20, Oct 1-20, Dec 1-20 (only 3x/year, not Q2)
- Annual corporate tax (Modelo 200): Jul 1-25
- Annual accounts (Cuentas Anuales): Jul 30 at Registro Mercantil
- NO Modelo 130 (autonomo only)

**Differentiators (competitive advantage with SL):**

*Multi-Entity Management:*
- Entity switcher in dashboard: "Switch between: My Autonomo | My SL Company"
- Separate data silos: each entity has own clients, invoices, expenses, tax calculations
- Shared user profile: single login, entity-specific fiscal settings
- Cross-entity awareness: "Your autonomo is invoicing your SL — ensure market price"
- Consolidated reports: optional combined view for total portfolio planning

*Tax Optimization:*
- **Salary vs dividend simulator:** Compare scenarios (100% salary, 100% dividend, 50/50 split), show effective tax rate considering both IS (25%) and personal IRPF (19-47%), recommend optimal extraction strategy based on marginal rates
- **BINs utilization planner:** Track historical SL losses, auto-apply to profitable years (up to 70% offset), show remaining BIN balance
- **Micro-empresa rate eligibility:** Detect when SL qualifies for 21-22% rate (<1M turnover), show savings vs 25%
- **Startup rate eligibility:** Track first 4 profitable years at 15% rate (Ley 28/2022)
- **RETA optimization for dual activity:** Show how autonomo societario base affects both entities

*Cross-Entity Scenarios:*
- **Related party transaction detection:** Flag when autonomo invoices own SL, warn about transfer pricing, suggest market price validation
- **Admin retribution tracking:** Document salary via estatutos/junta, ensure IS deductibility
- **Dividend distribution capacity:** Track retained earnings (beneficios no distribuidos), show maximum distributable
- **Overhead allocation:** Split shared expenses (home office, phone) between entities proportionally

*Permissions Model:*
- **Owner:** Full access to entity (create/edit/delete all data, change settings)
- **Gestor (read-only):** View all financial data, generate reports, no edits (external tax advisor)
- **Accountant:** Read-write for transactions (invoices, expenses), no settings (bookkeeper)
- **Partner:** Entity-specific access for SL co-owners (separate permission per entity)

**Defer to v2.1+ (scope control):**
- Full nomina (payroll) processing for SL admin salary (use external payroll service)
- Audit requirement detection (large companies >certain thresholds)
- Consolidated financial reports across multiple entities (advanced)
- Transfer pricing documentation generator (operaciones vinculadas)
- AEAT notification system integration (certificado digital required)
- Advanced permissions (multi-level roles, custom permissions)

### Architecture Approach (Multi-Tenant Extensions)

**Layered architecture with entity-type routing:** Same layers as v2.0 (UI → Application → Service → Repository → Data), but Services now accept `entity_id` parameter and route to entity-specific logic:

```javascript
// Example: InvoiceService routes to different PDF templates
async generatePDF(invoiceId, entityId) {
  const entity = await EntityService.getById(entityId);
  if (entity.type === 'autonomo') {
    return generateAutonomoPDF(invoice, entity); // NIF personal, simple format
  } else if (entity.type === 'sl') {
    return generateSLPDF(invoice, entity); // Razon social, RM data
  }
}
```

**Data model extensions:** Add `entities` table as top-level parent:

```
User (1) → (N) UserEntityAccess → (N) Entity
                                      ↓
                          Entity (1) → (N) Client → Invoice, Expense, CalendarDay
```

- `entities` table: `id`, `user_id` (owner), `entity_type` ('autonomo' | 'sl'), `name`, `nif`, `address`, fiscal settings
- `user_entity_access` junction: `user_id`, `entity_id`, `role` ('owner' | 'gestor' | 'accountant')
- All existing tables add `entity_id` foreign key: clients, invoices, expenses, calendar_days
- RLS policies: `WHERE entity_id IN (SELECT entity_id FROM user_entity_access WHERE user_id = auth.uid())`

**Entity-specific fields:**
- Autonomo: `tramo_reta`, `has_descendant`, `minimo_personal`, `declared_tramo` (for regularization)
- SL: `razon_social`, `registro_mercantil` (tomo/folio/hoja/inscripcion), `share_capital`, `constitution_date`, `is_admin_retribution_documented`, `bins_accumulated` (loss carry-forward)

**Critical architectural decisions (updated for SL):**
1. **Entity-type polymorphism:** Single codebase with type-based routing (not separate apps per entity type)
2. **Dual tax engines:** Preserve v1.1 IRPF engine untouched, add parallel IS engine, switch based on entity_type
3. **RETA calculation priority:** If user has both autonomo + SL admin, autonomo societario base overrides (higher minimum)
4. **Cross-entity transaction flagging:** Detect related parties (autonomo owned by same user as SL), warn about transfer pricing
5. **Permissions at entity level:** User can be owner of Entity A, gestor of Entity B (read-only)

**Major components (updated):**
1. **Entity Management Service (NEW)** — CRUD for entities, type-specific validation (CIF format for SL, NIF for autonomo), detect dual activity (autonomo + SL admin = societario), owner/access permissions
2. **Client Management Service** — Same as v2.0, but scoped to entity_id
3. **Invoice Service** — Route to entity-specific PDF templates, VeriFactu deadline warnings (Jan 2027 for SL, Jul 2027 for autonomo)
4. **Expense Service** — Entity-specific deduction rules (gastos dificil for autonomo, not for SL; dietas limits for autonomo, none for SL)
5. **Calendar Service** — Entity-specific (autonomo tracks Belgium 183-day, SL tracks admin work days), both can use same calendar with entity tagging
6. **Tax Service (Dual Engines)** — Route to IRPF engine for autonomo, IS engine for SL, handle dual activity RETA calculation
7. **Accounting Service (NEW for SL)** — Generate P&L, balance sheet, cuentas anuales, track BINs, deadline reminders

### Critical Pitfalls (Expanded for SL)

**Existing v2.0 pitfalls (still apply):**
1. VeriFactu invoice numbering gaps (50,000 EUR penalty)
2. Float precision currency errors (calculation drift)
3. Sync conflict data loss (4-year retention violation)
4. Global client IVA mistakes (multi-jurisdiction tax)
5. Factura completa missing fields (invoice invalidity)
6. 4-year document retention violation (audit defense)

**NEW SL-specific critical pitfalls:**

**7. Missing Cuentas Anuales filing (CRITICAL — 1,200-60,000 EUR fine)**
- **What:** SL fails to file annual accounts at Registro Mercantil by July 30 deadline. Formulation (March 31) or approval (June 30) missed.
- **Consequences:** Fines 1,200-60,000 EUR (higher if >6M turnover), RM closes registration sheet (cannot register corporate acts), reputational damage (accounts are public)
- **Prevention:** Deadline reminders at 60/30/15/7 days before. Checklist workflow: Formulated (March 31) → Approved by Junta (June 30) → Filed at RM (July 30). Status tracker per entity.
- **Phase:** SL accounting phase (cuentas anuales generation)

**8. Admin without RETA registration (CRITICAL — retroactive contributions)**
- **What:** SL admin has >25% shares + functions of direction but not registered in RETA as autonomo societario.
- **Consequences:** SS inspection retroactive contributions + surcharges + penalties, loss of prestaciones coverage
- **Prevention:** Entity setup wizard asks: "Are you admin with >25% shares + functions?" Warning: "You must register as autonomo societario within 30 days." Track registration status per admin.
- **Phase:** Entity creation (SL setup)

**9. Mixing personal and company money (CRITICAL — pierce corporate veil)**
- **What:** Admin uses company card for personal expenses, company pays personal bills, no cuenta corriente tracking.
- **Consequences:** AEAT "levanta el velo" (pierce corporate veil) → personal liability for company debts, reclassified as retribucion en especie (benefit in kind taxed to admin), IS deduction disallowed
- **Prevention:** Expense categories: "Business" vs "Personal (admin loan)". Warning when expense looks personal. Track admin cuenta corriente (loan account). Reconciliation required.
- **Phase:** SL expense management

**10. Forgetting Modelo 202 (HIGH — penalties + cash flow shock)**
- **What:** SL forgets quarterly corporate tax advance payments (Apr/Oct/Dec).
- **Consequences:** Automatic penalties + interest, large lump sum at annual settlement (cash flow problem)
- **Prevention:** Calendar with Apr 1-20, Oct 1-20, Dec 1-20 deadlines. Reminder: "Previous year positive Modelo 200 = 202 required." Auto-calculate: 18% of prior year cuota integra minus deducciones.
- **Phase:** SL tax automation

**11. Admin retribution not documented (HIGH — IS deduction disallowed)**
- **What:** Admin receives salary/payments not documented in estatutos or junta agreement (Art. 217 LSC).
- **Consequences:** IS deduction disallowed (added back to base imponible), potential reclassification as dividend (different tax treatment)
- **Prevention:** Setup wizard: "Is admin retribution documented in estatutos?" Reminder to hold annual junta and approve remuneration. Flag undocumented payments.
- **Phase:** SL entity creation + expense management

**12. Related party transactions undocumented (HIGH — transfer pricing adjustment)**
- **What:** Autonomo invoices own SL, but price significantly below/above market, no written contract.
- **Consequences:** Transfer pricing adjustments by Hacienda, IS base increased, penalties for improper documentation, possible false autonomo classification
- **Prevention:** Detect when invoice from autonomo to SL owned by same user. Warning: "Related party transaction — ensure market price and document contract." Track % of autonomo income from own SL (high % = audit risk).
- **Phase:** Cross-entity integration

**13. BINs (losses) not utilized (MEDIUM — tax overpayment)**
- **What:** SL had losses in prior years but forgets to offset against current year profits (up to 70% limit).
- **Consequences:** Paying IS that could be reduced/eliminated, BINs don't expire but may be forgotten
- **Prevention:** Track historical losses in SL entity. Auto-apply to profitable years. Show: "Available BIN: 10,000 EUR. Can offset 7,000 EUR (70%) this year. Tax saving: 1,750 EUR."
- **Phase:** SL tax automation (IS calculation)

**14. Incorrect corporate tax rate (MEDIUM — tax overpayment)**
- **What:** SL uses 25% general rate when eligible for 21-22% (micro-empresa) or 15% (startup).
- **Consequences:** Overpaying corporate tax, suboptimal planning
- **Prevention:** Detect eligibility: <1M turnover = micro-empresa rates (21% up to 50K, 22% rest). Track first 4 profitable years for startup 15% rate. Show savings: "You qualify for 21% rate. Savings: 2,000 EUR vs 25%."
- **Phase:** SL tax calculation

**15. Hacienda notifications missed (MEDIUM — missed response deadlines)**
- **What:** SL doesn't check electronic notifications (Hacienda does NOT send postal mail). Certificado digital required but user doesn't check regularly.
- **Consequences:** Missed response deadlines, default penalties, no opportunity to appeal
- **Prevention:** Certificado digital reminder during SL setup. "Check AEAT notifications every 10 days" prompt. Future: integrate with AEAT notification API.
- **Phase:** SL entity setup

---

## Implications for Roadmap (Updated for Multi-Entity Scope)

Based on research, suggested **12-phase structure** (vs 10 phases in original v2.0 planning):

### Phase 1: Data Architecture Foundation (UNCHANGED)
**Rationale:** Everything depends on proper data storage. Critical pitfalls (float precision, soft delete, sync conflicts) must be addressed before any financial data created.

**Delivers:** Dexie.js schema, repository layer, soft delete, integer currency storage, localStorage migration, sync queue

**Addresses:** STACK.md (Supabase + Dexie.js), PITFALLS #2 (float), #3 (sync), #6 (retention)

**Research flag:** Standard patterns. Skip `/gsd:research-phase`.

---

### Phase 2: Multi-Entity Architecture (NEW PHASE)
**Rationale:** Multi-tenant architecture is foundational. Must exist before creating clients/invoices (they need entity_id FK). Entity-type routing drives tax calculations, UI, validation.

**Delivers:**
- `entities` table with type enum ('autonomo', 'sl')
- `user_entity_access` junction (permissions model)
- Entity CRUD: create, list, switch active entity
- Entity-type specific fields (autonomo: tramo_reta; SL: razon_social, RM data)
- RLS policies for multi-tenant isolation
- Entity switcher UI component
- Dual activity detection (autonomo + SL admin = societario)

**Addresses:** SL-FEATURES multi-entity patterns, PITFALLS #8 (admin RETA registration)

**Avoids:** Entity isolation violations, permission leakage

**Research flag:** MEDIUM complexity for RLS policy design. May need `/gsd:research-phase` for Supabase multi-tenant patterns.

---

### Phase 3: Client Management & Validation (UPDATED)
**Rationale:** Clients scoped to entity. Build after entity architecture exists. NIF validation differs: autonomo uses personal NIF, SL uses CIF (B-prefix).

**Delivers:**
- Client CRUD scoped to entity_id
- NIF/CIF format validation (entity-type aware)
- VIES VAT validation for EU clients
- Country-based categorization (same for both entity types)
- Client list filtered by active entity
- Client detail view

**Addresses:** FEATURES table stakes (CRM), PITFALLS #4 (IVA rules), #5 (factura fields)

**Avoids:** Missing mandatory invoice fields, incorrect IVA treatment

**Research flag:** Same as v2.0. MODERATE for VIES API.

---

### Phase 4: Calendar Enhancement with Entity Tagging (UPDATED)
**Rationale:** Preserve v1.1's 183-day calendar. Extend with entity tagging (autonomo work vs SL admin work). Autonomo needs Belgium tracking, SL needs admin work days for salary calculation.

**Delivers:**
- Calendar scoped to entity (or shared across entities with entity_id per day)
- Client tagging (autonomo: which client; SL: which company work)
- 183-day preservation for autonomo entities
- Multi-client day support
- Work pattern templates

**Addresses:** FEATURES differentiator (calendar integration), preserve v1.1 feature

**Avoids:** PITFALLS #10 (183-day counting)

**Research flag:** Skip research. Extension to existing code.

---

### Phase 5: Expense Management Foundation (UPDATED)
**Rationale:** Expenses have different deduction rules per entity type. Build foundation before OCR complexity. Autonomo: gastos dificil 5%, dietas limits; SL: no gastos dificil, no dietas limits, 1% client entertainment cap.

**Delivers:**
- Expense CRUD scoped to entity_id
- Entity-type aware deductibility rules (autonomo: gastos dificil 5%, SL: NO gastos dificil)
- Category system (same categories, different rules)
- Deductibility percentage (autonomo: varies, SL: typically 100%)
- Client/calendar linking
- Receipt entity (1:1, stores image metadata)
- SL-specific: client entertainment 1% cap, no dietas limits

**Addresses:** FEATURES table stakes (expense tracking), SL-FEATURES different deduction rules

**Avoids:** PITFALLS #11 (expense attribution), SL-specific #9 (personal/business mixing)

**Research flag:** Skip research. Rule-based logic per entity type.

---

### Phase 6: Invoice Generation & PDF (UPDATED)
**Rationale:** Invoice templates differ by entity type. Autonomo: NIF personal, simple format; SL: razon social, Registro Mercantil data (Tomo/Folio/Hoja). VeriFactu deadlines differ (SL: Jan 2027, autonomo: Jul 2027).

**Delivers:**
- Invoice CRUD with entity-scoped numbering (separate sequences per entity)
- Entity-type aware PDF templates (autonomo vs SL format)
- Factura completa validation (13 fields, entity-specific)
- IVA calculation (same rules both types)
- IRPF retention (autonomo B2B Spain only)
- Status workflow
- VeriFactu QR with entity-type deadline warnings
- Auto-populate from calendar days
- Billable expense pass-through

**Addresses:** FEATURES table stakes (invoicing), differentiators (VeriFactu), SL-FEATURES invoice differences

**Avoids:** PITFALLS #1 (numbering gaps), #2 (mandatory fields), SL-FEATURES compliance

**Research flag:** Same as v2.0. MEDIUM for VeriFactu QR spec (when published).

---

### Phase 7: Receipt Upload & OCR (UNCHANGED)
**Rationale:** OCR works same for both entity types. Expense creation flows to entity-scoped expense management.

**Delivers:** Photo/PDF upload, Mindee API OCR, confidence scoring, date format disambiguation, duplicate detection, Tesseract.js fallback

**Addresses:** FEATURES differentiator (European receipt OCR), PITFALLS #8 (date format), #15 (OCR confidence)

**Avoids:** Auto-accepting low-confidence, date attribution errors

**Research flag:** HIGH complexity. Likely needs `/gsd:research-phase` for OCR provider comparison.

---

### Phase 8: Expense-Calendar-Client Integration (UNCHANGED)
**Rationale:** Connect existing entities. Same patterns for both autonomo and SL (trip detection, client suggestions). Entity-scoped relationships.

**Delivers:** Trip entity, multi-expense linking, automatic client suggestions, billable marking, client profitability (entity-scoped), overhead allocation

**Addresses:** FEATURES differentiator (trip linking, profitability), PITFALLS #11 (attribution), #14 (dietas limits for autonomo)

**Avoids:** Missing deduction opportunities

**Research flag:** Skip research. Business logic.

---

### Phase 9: Tax Automation — Autonomo (Modelo 130 + IRPF)
**Rationale:** Preserve v1.1 autonomo tax engine. Add real data integration. Only for autonomo entities (SL uses different phase).

**Delivers:**
- Modelo 130 cumulative quarterly (Jan-Sep for Q3)
- Retenciones tracking
- Prior payment tracking
- Gastos dificil automatic (5%, max 2K)
- RETA regularization estimator
- Annual IRPF summary
- Dynamic projections (replace v1.1 scenarios)
- Tax calendar for autonomo

**Addresses:** FEATURES differentiator (tax automation), PITFALLS #7 (Modelo 130 cumulative), #13 (RETA projection)

**Avoids:** Quarterly calculation errors

**Research flag:** Skip research. Tax formulas validated in v1.1.

---

### Phase 10: Tax Automation — SL (Modelo 202 + 200 + IS) (NEW PHASE)
**Rationale:** Separate phase for SL tax complexity. Different regime (Impuesto de Sociedades), different forms (202, 200 vs 130), different rates (flat 15-25% vs progressive 19-47%).

**Delivers:**
- IS calculator: base imponible from P&L adjustments
- Rate detection: 25% general, 21-22% micro-empresa (<1M), 15% startup (first 4 years)
- Modelo 202 quarterly advances (18% of prior year, Q1/Q3/Q4 only)
- Modelo 200 annual corporate tax
- BINs (loss carry-forward) tracker: unlimited years, 70% offset limit
- Cuentas Anuales deadline reminders (formulation March 31, approval June 30, filing July 30)
- Tax calendar for SL (different from autonomo)
- Salary vs dividend optimizer (compare IS + IRPF effective rates)

**Addresses:** SL-FEATURES IS calculation, Modelo 202/200, PITFALLS #10 (Modelo 202 missed), #13 (BINs unutilized), #14 (incorrect rate)

**Avoids:** Missing 202 filings (penalties), BIN waste (tax overpayment), suboptimal extraction

**Research flag:** HIGH complexity for IS adjustments and BINs rules. Likely needs `/gsd:research-phase` for Modelo 200 calculation details.

---

### Phase 11: SL Accounting & Cuentas Anuales (NEW PHASE)
**Rationale:** SL mandatory accounting (libro diario, balance, P&L, cuentas anuales). Separate from tax automation. Critical deadline (July 30 RM filing) has severe penalties.

**Delivers:**
- P&L generator (cuenta de perdidas y ganancias) from transactions
- Balance sheet generator (balance de situacion, simplified PYME model)
- PYME eligibility detection (<2.85M assets, <5.7M turnover, <50 employees)
- Cuentas anuales workflow: Formulated (March 31) → Approved (June 30) → Filed (July 30)
- Deadline escalation: 60/30/15/7 day reminders
- Status tracker per SL entity
- Admin retribution documentation reminder (estatutos/junta requirement)
- Libro diario/mayor export (for gestor/accountant)

**Addresses:** SL-FEATURES accounting requirements, PITFALLS #7 (Cuentas Anuales missed), #11 (admin retribution undocumented)

**Avoids:** Missing filing (1,200-60,000 EUR fine + RM closure), undocumented salary (IS deduction lost)

**Research flag:** HIGH complexity for cuentas anuales generation from transactions. Likely needs `/gsd:research-phase` for PGC PYME standards and balance sheet rules.

---

### Phase 12: Cross-Entity Integration & Optimization (NEW PHASE)
**Rationale:** Users with both autonomo + SL need cross-entity awareness. Related party transaction detection, dual RETA calculation, salary vs dividend optimization across entities.

**Delivers:**
- Related party detection: autonomo invoicing own SL (same user owns both)
- Transfer pricing warnings: "Ensure market price, document contract (Art. 16 LSC)"
- Autonomo income source tracker: "% from own SL = X% (high % = audit risk)"
- Dual RETA calculation: autonomo + SL admin = autonomo societario base (1,000 EUR minimum overrides autonomo tramo)
- Salary vs dividend simulator: SL pays admin via salary (deductible IS, taxed IRPF 19-47%) vs dividend (not deductible IS, taxed 19-28% capital gains)
- Overhead allocation: split shared expenses (home office, phone) between entities proportionally
- Consolidated reports: optional combined view of both entities (total income, total tax)

**Addresses:** SL-FEATURES cross-entity scenarios, PITFALLS #12 (related party transactions), SL social security rules (societario vs autonomo)

**Avoids:** Transfer pricing adjustments, RETA miscalculation, suboptimal tax extraction

**Research flag:** MEDIUM complexity for transfer pricing rules and dual RETA logic. May need `/gsd:research-phase` for operaciones vinculadas regulations.

---

### Phase 13: Modelo 349 & Multi-Jurisdiction (UNCHANGED from v2.0)
**Rationale:** Same for both autonomo and SL. EU client operations require Modelo 349. UK/US treaty compliance.

**Delivers:** Modelo 349 calculation, W-8BEN tracking, multi-currency exchange rates, Modelo 360 Belgian IVA flag

**Addresses:** FEATURES differentiator (intra-community IVA), PITFALLS #5 (IVA rules), #9 (W-8BEN), #12 (Modelo 349)

**Avoids:** Missing 349 filings, 30% US withholding

**Research flag:** Same as v2.0. MODERATE for Modelo 349 operation codes.

---

### Phase 14: Permissions & Multi-User (NEW PHASE — deferred from "nice-to-have")
**Rationale:** Multi-entity system benefits from shared access. Gestor (tax advisor) needs read-only across multiple clients. Accountant needs write access for bookkeeping.

**Delivers:**
- User invitation: email-based, role selection (owner/gestor/accountant)
- Role-based permissions: owner (full), gestor (read-only), accountant (read-write transactions, no settings)
- Entity-specific access: user can be owner of Entity A, gestor of Entity B
- Permission enforcement at RLS level (database-enforced, not just UI)
- Activity log: track who did what (audit trail for shared access)
- Gestor dashboard: view-only mode with report export

**Addresses:** SL-FEATURES permissions model, multi-user scenarios

**Avoids:** Data leakage, unauthorized edits, accountability gaps

**Research flag:** MEDIUM complexity for RLS policy design with roles. May need `/gsd:research-phase` for Supabase auth patterns.

---

### Phase 15: Cloud Sync & Mobile Optimization (UNCHANGED)
**Rationale:** System works offline-first. Cloud sync adds cross-device value. Entity-scoped sync (only sync active entity's data to save bandwidth).

**Delivers:** Supabase auth, background sync with entity filtering, conflict resolution, RLS multi-tenant isolation, receipt backup, service worker PWA, mobile receipt upload, offline queue

**Addresses:** STACK recommendation (Supabase backend), PITFALLS #4 (sync conflicts), #18 (mobile offline)

**Avoids:** Data loss from sync conflicts, receipt loss from offline

**Research flag:** HIGH complexity. Likely needs `/gsd:research-phase` for PWA and sync patterns.

---

### Phase Ordering Rationale (Updated for SL)

**Dependencies drive order:**
1. **Data architecture** is foundation (no features without storage)
2. **Multi-entity architecture** must exist before entities created (FK dependencies)
3. **Clients** are core entity (scoped to entity_id)
4. **Calendar** extends v1.1, adds entity tagging
5. **Expenses** have entity-type specific rules
6. **Invoices** depend on clients, use entity-type templates
7. **Receipt OCR** enhances expenses (entity-agnostic)
8. **Integration** connects entities
9. **Tax automation split:** Autonomo (IRPF/130) separate from SL (IS/202/200) — different engines, different forms
10. **SL accounting** separate from tax (different obligations, different deadlines)
11. **Cross-entity** requires both autonomo and SL features built
12. **Modelo 349** same for both types (EU operations)
13. **Permissions** leverage multi-entity architecture
14. **Sync** adds cross-device value (system works offline-first)

**Grouping by architecture layers:**
- Phases 1-2: Infrastructure (data + multi-tenant)
- Phases 3-6: Core entities (clients, calendar, expenses, invoices) — entity-scoped
- Phases 7-8: Feature enhancements (OCR, integration)
- Phases 9-11: Tax/accounting engines (autonomo IRPF, SL IS, SL cuentas anuales)
- Phases 12-13: Cross-entity and multi-jurisdiction
- Phases 14-15: Multi-user and sync

**Pitfall mitigation:**
- Critical pitfalls (float, numbering, retention, IVA) addressed early (Phases 1, 3, 6)
- SL critical pitfalls (Cuentas Anuales, admin RETA, mixing money, Modelo 202, admin retribution) addressed in SL-specific phases (2, 10, 11)
- High-severity (Modelo 130, OCR dates, 183-day) addressed in relevant features (Phases 4, 7, 9)
- SL moderate (BINs, incorrect rate, notifications) addressed as enhancements (Phase 10)

**Build order preserves v1.1 value + adds SL:**
- Phase 4 migrates calendar without breaking 183-day tracking
- Phase 9 preserves autonomo tax engine (`calculateIRPF` unchanged)
- Phase 10 adds parallel SL engine (no interference)
- Throughout: single-file HTML, no frameworks, dark theme maintained, entity switcher for context

### Research Flags (Updated for SL)

**Phases needing deeper research:**
- **Phase 2 (Multi-Entity Architecture):** Supabase RLS multi-tenant patterns, entity-type polymorphism — HIGH complexity, RECOMMEND `/gsd:research-phase`
- **Phase 3 (Client Management):** VIES API integration (same as v2.0) — MODERATE complexity, may need `/gsd:research-phase`
- **Phase 6 (Invoice Generation):** VeriFactu QR URL format (when published) — LOW urgency (Jan/Jul 2027 deadlines), defer research until 2026 H2
- **Phase 7 (Receipt OCR):** Mindee API vs alternatives, confidence tuning (same as v2.0) — HIGH complexity, RECOMMEND `/gsd:research-phase`
- **Phase 10 (SL Tax Automation):** IS base imponible adjustments, BINs 70% rule details, Modelo 200 calculation — HIGH complexity, RECOMMEND `/gsd:research-phase`
- **Phase 11 (SL Accounting):** PGC PYME standards, balance sheet from transactions, cuentas anuales generation — HIGH complexity, RECOMMEND `/gsd:research-phase`
- **Phase 12 (Cross-Entity Integration):** Operaciones vinculadas (related party) regulations, dual RETA rules — MEDIUM complexity, may need `/gsd:research-phase`
- **Phase 13 (Multi-Jurisdiction):** Modelo 349 operation codes (same as v2.0) — MODERATE complexity, may need `/gsd:research-phase`
- **Phase 14 (Permissions):** RLS policies with roles, Supabase auth patterns — MEDIUM complexity, may need `/gsd:research-phase`
- **Phase 15 (Cloud Sync):** Conflict resolution, service worker, PWA (same as v2.0) — HIGH complexity, RECOMMEND `/gsd:research-phase`

**Phases with standard patterns (skip research):**
- **Phase 1 (Data Architecture):** Dexie.js schema design, CRUD patterns — well-documented
- **Phase 4 (Calendar Enhancement):** Extend existing v1.1 code — internal patterns known
- **Phase 5 (Expense Management):** Standard CRUD + entity-type rules — well-documented
- **Phase 8 (Expense-Calendar-Client Integration):** Business logic connecting entities — domain-specific, no external research needed
- **Phase 9 (Autonomo Tax Automation):** Tax formulas validated in v1.1 — integration only

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack (Multi-Tenant)** | HIGH | Supabase RLS for multi-tenant isolation verified with official docs. Row Level Security patterns documented. PostgreSQL foreign key constraints enforce entity separation. |
| **Autonomo Features** | HIGH | Same as v2.0: table stakes from CRM/invoicing norms, Spanish differentiators from official AEAT requirements (VeriFactu RD 254/2025, factura completa BOE). |
| **SL Tax Regime (IS)** | HIGH | Modelo 200/202 requirements from official AEAT source. Corporate tax rates verified (PWC Spain Corporate Tax). BINs rules from AEAT IS documentation. |
| **SL Social Security** | HIGH | Autonomo societario rules verified: 1,000 EUR minimum base (InfoAutonomos, Quipu), encuadramiento thresholds (Legalitas, Supralegit), 3% gastos dificil (official SS). |
| **SL Expense Deductions** | HIGH | Different rules documented: NO gastos dificil for IS (only for IRPF autonomos), company car 100% vs autonomo 50% (Esteve Fuchs). Client entertainment 1% cap confirmed. |
| **SL Accounting (Cuentas Anuales)** | HIGH | Libro diario/mayor requirements from AEAT Libros Obligatorios. Cuentas anuales deadlines and penalties from BOE PGC PYMES RD 1515/2007. PYME thresholds (2.85M assets, 5.7M turnover) verified. |
| **Cross-Entity Scenarios** | MEDIUM-HIGH | Related party transactions (operaciones vinculadas) from Art. 16 LSC, Art. 18 LIS. Salary vs dividend optimization from tax advisory consensus. Dual RETA calculation (societario overrides) from multiple sources. |
| **SL Pitfalls** | HIGH | Cuentas Anuales penalties verified (1,200-60,000 EUR). Admin RETA requirement from encuadramiento rules. Mixing personal/company from veil-piercing case law (GM Tax, GPA). |
| **Architecture (Polymorphism)** | MEDIUM-HIGH | Entity-type routing is standard pattern, but SL-specific implementation (dual tax engines, separate filing calendars) needs design validation. RLS multi-tenant patterns well-documented. |
| **Pitfalls (v2.0)** | MEDIUM-HIGH | Same as v2.0: VeriFactu penalties verified (RD 254/2025), float precision known issue, sync conflicts from PWA patterns, IVA rules from AEAT official, 4-year retention from LGT. |

**Overall confidence:** HIGH for SL tax/accounting requirements and multi-tenant architecture patterns. MEDIUM-HIGH for cross-entity implementation details and dual-engine integration.

### Gaps to Address

**SL-specific gaps:**

**Micro-empresa rate transition:** Exact rates for 2027+ (currently transitioning from 25% → 19-21%). Research identifies 21% up to 50K EUR, 22% rest for 2026, but 2027+ trajectory needs confirmation from AEAT when published.

**SL admin with A1 certificate (Belgium work):** Does the A1 certificate for autonomo working in Belgium also cover the same person as admin of an SL? EU Regulation 883/2004 application to dual roles needs validation during Phase 2 (entity setup). May require separate SS registration.

**Dual activity RETA edge cases:** Research confirms autonomo + SL admin = autonomo societario (higher base), but edge cases (what if SL is dormant? what if <25% shares but admin functions?) need gestor validation during implementation.

**Operaciones vinculadas (related party) thresholds:** Transfer pricing documentation requirements vary by transaction size. Research identifies concern, but exact thresholds and documentation formats need validation from AEAT guidelines during Phase 12.

**Cuentas anuales auto-generation from transactions:** Generating balance sheet and P&L from transaction data follows PGC PYME standards, but mapping expense categories to chart of accounts needs accounting expertise during Phase 11. May require accountant role input.

**Salary vs dividend optimization formulas:** Tax advisory consensus on optimal mix, but specific formulas considering MEI (Mecanismo de Equidad Intergeneracional) 0.9% on both salary (via RETA) and dividends (via Renta Ahorros) need refinement during Phase 10.

**Existing v2.0 gaps (still apply):**
- VeriFactu QR URL format (AEAT spec expected 2026 H2)
- OCR accuracy on real data (needs testing with representative sample)
- Modelo 349 operation codes (full list and edge cases)
- Google Calendar API quotas (daily sync frequency limits)
- Conflict resolution strategy for financial data (needs user testing)
- Mobile PWA manifest requirements (iOS home screen install specifics)

---

## Sources

### Primary (HIGH confidence)

**Official Spanish Government (SL-specific):**
- AEAT - Impuesto de Sociedades: https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades.html
- AEAT - Modelo 200 (Annual Corporate Tax): https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GE04.shtml
- AEAT - Modelo 202 Instructions 2025: https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-sociedades/modelo-202-is-i_____resencia-territorio-fraccionado_/instrucciones/Instrucciones-para-2025.html
- AEAT - Libros Obligatorios (Accounting Books): https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/gestion-impuesto-sobre-sociedades/obligaciones-contables-registrales/libros-obligatorios.html
- BOE - PGC PYMES RD 1515/2007 (Accounting Standards): https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966
- AEAT - NIF Juridica (Company Tax ID): https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/solicitar-nif/nif-juridica.html
- PWC Spain - Corporate Tax Summary: https://taxsummaries.pwc.com/spain/corporate/taxes-on-corporate-income

**Official Spanish Government (autonomo, from v2.0):**
- AEAT - VeriFactu Systems: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html
- AEAT - Modelo 130 Instructions: https://sede.agenciatributaria.gob.es/Sede/en_gb/impuestos-tasas/impuesto-sobre-renta-personas-fisicas/modelo-130-irpf______esionales-estimacion-directa-fraccionado_/instrucciones.html
- BOE - Article 66 LGT (4-year retention): https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186
- BOE - Real Decreto 254/2025 (VeriFactu QR): https://www.boe.es/boe/dias/2025/

**Official EU/International (from v2.0):**
- VIES VAT Number Validation: https://ec.europa.eu/taxation_customs/vies
- IRS Form W-8BEN: https://www.irs.gov/forms-pubs/about-form-w-8-ben
- GDPR Hub - AEPD Spain Rulings: https://gdprhub.eu

**Technology Official Docs (from v2.0):**
- Supabase Docs: https://supabase.com/docs
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Dexie.js: https://dexie.org/
- pdfmake GitHub: https://github.com/bpampuch/pdfmake
- Mindee Receipt OCR: https://www.mindee.com/product/receipt-ocr-api
- FullCalendar Docs: https://fullcalendar.io/docs

### Secondary (MEDIUM-HIGH confidence)

**SL Tax & Social Security:**
- InfoAutonomos - Cuota Autonomos Societarios 2026: https://www.infoautonomos.com/seguridad-social/cuota-autonomos-societarios/
- Quipu - Cuotas Autonomos Societarios: https://getquipu.com/blog/cuotas-de-autonomos-societarios/
- Legalitas - Alta RETA Obligaciones (Admin with control): https://www.legalitas.com/actualidad/alta-en-reta-obligaciones-para-socios-y-administradores
- Legalitas - Modelo 202: https://www.legalitas.com/actualidad/modelo-202
- Lloret Asesores - Modelo 200 Guide: https://www.gestoresyasesoreslloret.com/modelo-200-guia-completa-impuesto-de-sociedades/
- Consultax - Sueldo o Dividendos 2025 (Salary vs dividend): https://consult.tax/sueldo-o-dividendos-en-2025-o-la-decision-inteligente-del-administrador-socio-de-una-pyme-en-espana/
- Supralegit - Encuadramiento SS (Social security categorization): https://www.supralegit.com/blog/encuadramiento-socios-administradores-seguridad-social/

**SL Expense Deductions & Accounting:**
- Esteve Fuchs - Gastos Deducibles Autonomo vs SL: https://estevefuchs.com/fiscalidad/gastos-deducibles-autonomo-vs-sl-principales-divergencias/
- ICAC - PGC PYMES PDF: https://www.icac.gob.es/sites/default/files/2023-04/PLAN_GENERAL_DE_CONTABILIDAD_Pymes%20(1).pdf
- Taxadora - Corporate Tax Guide 2025: https://taxadora.com/blog/the-ultimate-guide-to-corporate-tax-in-spain-2025-edition/

**SL Cross-Entity & Pitfalls:**
- Billin - Facturar Propia Empresa (Invoice own company): https://www.billin.net/blog/facturar-propia-empresa/
- OpenGes - Autonomo Societario Facturar: https://www.openges.es/blog/autonomo-societario-facturar-a-otra-empresa/
- GM Tax - 5 Mistakes SL Founding: https://gmtaxconsultancy.com/en/law/5-mistakes-to-avoid-in-the-founding-of-a-spanish-s-l/
- GPA - Common Tax Mistakes Startups: https://gpasoc.com/en/common-tax-mistakes-of-startups-in-spain-and-how-to-avoid-them/

**SL General Comparisons:**
- Facturaz - Autonomo vs SL: https://www.facturaz.es/resources/guides/autonomo-vs-sl
- NIM Extranjeria - Autonomo vs SL: https://nimextranjeria.com/autonomo-vs-sl-spain/
- Abad Abogados - SL vs Autonomo: https://abadabogados.com/en/s-l-or-autonomo-which-is-better/
- Shopify - NIF SL Guide: https://www.shopify.com/es/blog/nif-sociedad-limitada

**SL Invoicing:**
- Reixmor - VeriFactu SL Guide 2025: https://www.reixmor.com/verifactu-para-sl-guia-definitiva-2025/
- Quipu - VeriFactu: https://getquipu.com/es/sistema-verifactu

**Architecture & Patterns (from v2.0):**
- LogRocket: Offline-first frontend apps 2025: https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/
- Medium: Offline-First Architecture: https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79
- DEV.to: Frontend Architecture Patterns 2026: https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo

**Spanish Autonomo Guidance (from v2.0):**
- Getrenn: VeriFactu Dates, QR, Penalties: https://getrenn.com/blog/verifactu
- Getrenn: Mandatory Invoice Details: https://getrenn.com/blog/mandatory-invoice-details
- Getrenn: Self-Employed Invoicing Guide: https://getrenn.com/blog/self-employed-invoicing
- Declarando: Modelo 130 Guide: https://declarando.es/modelo-130
- Declarando: Modelo 349 Guide: https://declarando.es/modelo-349
- TuKonta: IVA Intracomunitario: https://tukonta.com/asesoramiento/iva-intracomunitario/
- Marosa VAT: Reverse Charge Spain: https://marosavat.com/manual/vat/spain/reverse-charge/

**Technology Comparisons (from v2.0):**
- Supabase vs Firebase vs PocketBase: https://www.supadex.app/blog/supabase-vs-firebase-vs-pocketbase-which-one-should-you-choose-in-2025
- Supabase Pricing 2026: https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance
- pdfmake vs jsPDF: https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p
- OCR Accuracy Benchmarks: https://research.aimultiple.com/ocr-accuracy/
- Currency.js: https://currency.js.org/

**Financial Precision (from v2.0):**
- DEV.to: Handle Money in JavaScript: https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc
- Robin Wieruch: JavaScript Rounding Errors: https://www.robinwieruch.de/javascript-rounding-errors/

### Tertiary (needs validation)

**Migration & Soft Delete (from v2.0):**
- Medium: Replacing LocalStorage with IndexedDB: https://xon5.medium.com/replacing-localstorage-with-indexeddb-2e11a759ff0c
- Marty Friedel: Deleting data - soft, hard or audit: https://www.martyfriedel.com/blog/deleting-data-soft-hard-or-audit

**PWA Patterns (from v2.0):**
- GTCSys: Data Synchronization in PWAs: https://gtcsys.com/comprehensive-faqs-guide-data-synchronization-in-pwas-offline-first-strategies-and-conflict-resolution/
- Monterail: Make Your PWA Work Offline Part 2: https://www.monterail.com/blog/pwa-offline-dynamic-data

---

*Research completed: 2026-02-03 (SL expansion integrated)*
*Ready for roadmap: YES*
*Next step: Use for v2.0 requirements definition and 12-phase roadmap creation (updated from 10 phases to include SL features)*
