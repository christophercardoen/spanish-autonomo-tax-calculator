# Feature Landscape: v2.0 Business Management System

**Domain:** Business management tools for self-employed professionals (Spanish autonomo context)
**Researched:** 2026-02-03
**Mode:** Ecosystem research for subsequent milestone
**Overall Confidence:** HIGH (based on industry analysis + Spanish regulatory research)

---

## Executive Summary

This research covers the feature landscape for transforming the existing tax calculator into a comprehensive business management system. The focus is on six interconnected feature categories: Client Management (CRM), Invoice Generation, Receipt Upload & OCR, Calendar Integration, Expense-Client Linking, and Tax Automation.

**Key insight:** The competitive advantage lies not in building a generic small-business tool, but in deep Spanish autonomo compliance integration. Table stakes features follow industry patterns; differentiators come from VeriFactu compliance, intra-community IVA handling, and Modelo 130 automation.

**Build order recommendation:** Clients first (foundation for everything), then Invoices (depend on clients), then Calendar-Client integration, then Expense linking, then Tax automation (requires all prior data).

---

## 1. Client Management (CRM)

### Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Basic contact storage** | Fundamental CRM function - name, email, phone, address | Low | CRUD operations |
| **Client list view** | Need to see all clients at a glance | Low | Sortable, searchable list |
| **Client detail view** | Deep dive into single client | Low | All fields + activity history |
| **Quick add flow** | Add client without friction | Low | Modal or inline form |
| **Search and filter** | Find clients fast | Low | By name, company, country |
| **Edit and delete** | Basic data management | Low | With confirmation for delete |
| **Client notes** | Free-text context about relationship | Low | Text field with history |

**Expected UX patterns:**
- List view with cards or table rows
- Click to expand/open detail view
- Inline quick-edit for common fields
- Search bar at top of list

### Differentiators

Features that set product apart for Spanish autonomo context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **NIF/CIF/VAT ID field** | Required for Spanish invoicing compliance | Low | Validation against format rules |
| **EU vs non-EU categorization** | Determines IVA treatment (reverse charge vs not) | Medium | Auto-detect from country, affects invoice generation |
| **VIES validation** | Verify EU VAT numbers are valid for intra-community | Medium | API call to EU VIES database |
| **Contract/rate tracking** | Store hourly/daily rate, contract period | Medium | Multiple contracts per client |
| **Work pattern templates** | "Mon-Tue every week" recurring patterns | Medium | Template library per client |
| **Client profitability view** | Revenue - expenses per client | High | Aggregation across invoices + expenses |
| **Activity timeline** | All invoices, expenses, calendar days in one view | Medium | Reverse-chronological activity feed |
| **Country-based tax treaty flags** | Alert for 183-day considerations by country | Medium | Ties into Belgium calendar |

**Spanish autonomo specifics:**
- NIF format: 8 digits + letter OR letter + 7 digits + letter (foreigners)
- CIF format: letter + 8 characters (companies)
- EU VAT format: ES + NIF for Spanish, country prefix + number for EU
- Non-EU clients: no VAT ID required, different invoice rules

### Anti-Features

Things to deliberately NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full sales pipeline/funnel** | Overcomplication for autonomo context | Simple "active/inactive" status |
| **Lead scoring** | Enterprise feature, not relevant | Focus on existing client management |
| **Email marketing integration** | Scope creep, not core need | External tool if needed |
| **Team collaboration/permissions** | Single-user tool | No multi-user complexity |
| **Social media integration** | Not relevant to autonomo workflow | Skip entirely |

### Dependencies

- None (foundational feature)

### Complexity Notes

- **Data model:** Client, Contract, Note entities
- **Validation:** NIF/CIF format validation, VIES API for EU VAT
- **Storage:** IndexedDB for offline capability, potential cloud sync later
- **Import:** Consider CSV import for existing client lists

---

## 2. Invoice Generation & Tracking

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Create invoice from client** | Core invoicing workflow | Medium | Pre-fill client data |
| **Sequential invoice numbering** | Legal requirement in Spain | Low | Auto-increment with annual reset option |
| **Line items (services/products)** | Standard invoice structure | Medium | Add/remove/reorder lines |
| **Tax calculation (IVA)** | Required for compliance | Medium | 21%, 10%, 4%, 0% rates |
| **Invoice totals** | Base + tax = total | Low | Auto-calculate |
| **PDF generation** | Primary output format | Medium | Clean, printable design |
| **Invoice list view** | See all invoices | Low | Filter by status, date, client |
| **Invoice status tracking** | Draft/sent/paid/overdue | Medium | Status workflow with dates |
| **Due date and payment terms** | Standard invoice fields | Low | 30/60/90 day options |
| **Send via email** | Common delivery method | Medium | Email integration or copy link |

**Expected invoice lifecycle:**
```
Draft --> Sent --> Paid
           |
           +--> Overdue (if past due date and not paid)
           |
           +--> Cancelled (if voided)
```

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Spanish factura completa format** | Legal compliance - 10+ mandatory fields | High | See detailed requirements below |
| **VeriFactu QR code** | July 2027 mandatory for autonomos | High | QR with URL to AEAT verification |
| **IRPF retention line** | 7%/15% withholding for Spanish B2B | Medium | Optional line item, reduces total |
| **Inversion del sujeto pasivo** | Reverse charge for EU B2B clients | Medium | Auto-detect from client EU status |
| **Multi-currency support** | EUR, USD, GBP for global clients | Medium | Exchange rate handling |
| **Days worked calculation** | Invoice from calendar days | High | Pull days tagged to this client |
| **Expense pass-through** | Add client-linked expenses to invoice | High | Billable vs non-billable marking |
| **Recurring invoice templates** | Monthly retainer invoicing | Medium | Clone with new dates |
| **Payment reminders** | Automated overdue alerts | Medium | Email or in-app notification |
| **Invoice correction (rectificativa)** | Fix errors per Spanish rules | Medium | Separate numbering series required |

### Spanish Factura Completa Requirements

**Mandatory fields per Spanish law:**

1. Invoice number (sequential, unique)
2. Issue date
3. Operation date (if different from issue)
4. Supplier name/legal name
5. Supplier NIF
6. Supplier address
7. Recipient name/legal name
8. Recipient NIF (required for B2B, some B2C exceptions)
9. Recipient address
10. Description of goods/services
11. Taxable base (base imponible)
12. IVA rate(s) applied
13. IVA amount per rate
14. Total invoice amount

**Additional for specific cases:**
- IRPF retention amount (if applicable)
- "Inversion del sujeto pasivo" text (for EU reverse charge)
- VeriFactu QR code (from July 2027)
- "VERI*FACTU" or "Factura verificable en la sede electronica de la AEAT" text

### VeriFactu QR Code Specifications

Per RD 254/2025 and technical specifications:

| Requirement | Specification |
|-------------|---------------|
| Size | 30x30mm to 40x40mm |
| Label | "QR tributario" above the code |
| Content | URL to AEAT verification page |
| Placement | First page if multi-page |
| Additional text | "VERI*FACTU" label on invoice |

**Timeline (as of Feb 2026):**
- July 2025: Software developers must comply
- January 2027: Companies (SL, SA) must comply
- July 2027: Autonomos must comply (extended from July 2026)

**Penalties for non-compliance:**
- Missing QR: 150 EUR per invoice, up to 6,000 EUR/quarter
- Non-certified software: up to 50,000 EUR/year

### Intra-Community (EU B2B) Invoice Rules

For services to EU business clients:

| Field | Requirement |
|-------|-------------|
| Your VAT number | ES + NIF (must be registered in ROI/VIES) |
| Client VAT number | Must verify in VIES database |
| IVA charge | 0% (exempt, reverse charge) |
| Required text | "Inversion del sujeto pasivo, art. 84.Uno.2 Ley 37/1992" or "Reverse charge - Art 194 Directive 2006/112/EC" |
| Modelo 303 | Report in exempt operations section |
| Modelo 349 | Report intra-community operations summary |

### Multi-Currency Handling

| Feature | Implementation |
|---------|---------------|
| Invoice currency | EUR, USD, GBP, CAD, AUD as options |
| Exchange rate source | ECB rates or manual entry |
| Rate date | Date of invoice or payment date |
| Display | Both currencies shown (invoiced + EUR equivalent) |
| Accounting | Record in EUR for Spanish tax purposes |

**Best practice:** Show exchange rate on invoice with date applied.

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full e-invoicing (FacturaE XML)** | Not mandatory until late 2026 for B2B | PDF with VeriFactu QR first |
| **Payment gateway integration** | Scope creep, banks vary | Link to bank details, manual reconciliation |
| **Credit notes/debit notes** | Complex, rectificativa simpler | Corrective invoice (factura rectificativa) |
| **Inventory management** | Services-focused autonomo | Skip entirely |
| **Multi-company** | Single autonomo user | No complexity |

### Dependencies

- Clients (must exist before invoice creation)
- Calendar integration (optional, for days-worked invoicing)
- Expense linking (optional, for billable expense pass-through)

### Complexity Notes

- **PDF generation:** Use jsPDF or similar client-side library
- **QR code:** qrcode.js or similar for VeriFactu QR
- **Numbering:** Support formats like "2026-001", "F2026/001", user-configurable
- **Templates:** Allow logo, bank details, terms customization
- **Validation:** Enforce mandatory fields before "Send" status

---

## 3. Receipt Upload & OCR

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Photo upload from device** | Primary capture method | Low | File input accepting images |
| **PDF upload** | Received invoices often PDF | Low | File input for PDFs |
| **Receipt list view** | See all uploaded receipts | Low | Thumbnail gallery or list |
| **Manual data entry** | Fallback when OCR fails | Low | Form with key fields |
| **Receipt preview** | View uploaded image/PDF | Low | Lightbox or inline viewer |
| **Basic categorization** | Travel, meals, supplies, etc. | Low | Dropdown selection |
| **Date and amount fields** | Core expense data | Low | With currency |
| **Vendor/merchant name** | Who was paid | Low | Text field, auto-suggest from history |
| **Delete receipt** | Remove incorrect uploads | Low | With confirmation |

**Supported formats:**
- Images: JPG, PNG, HEIC (iPhone)
- Documents: PDF (single and multi-page)
- Size limit: 10-20MB reasonable for mobile photos

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Automatic OCR extraction** | Save time vs manual entry | High | Extract date, amount, vendor, IVA |
| **Confidence scoring** | Know when to verify | Medium | HIGH = auto-fill, MEDIUM = suggest, LOW = manual |
| **IVA extraction** | Spanish autonomo need: IVA amount for Modelo 303 | High | Recognize Spanish IVA rates (21%, 10%, 4%) |
| **Multi-page receipt handling** | Hotel bills often multi-page | Medium | Process all pages, aggregate |
| **Duplicate detection** | Prevent double-counting | Medium | Hash comparison or amount+date+vendor match |
| **4-year retention tracking** | Spanish legal requirement | Low | Flag receipts approaching retention expiry |
| **Factura completa validation** | Flag missing autonomo data | Medium | Check for your NIF on receipt |
| **Belgian IVA detection** | For Modelo 360 IVA recovery | Medium | Recognize Belgian VAT (6%, 12%, 21%) |
| **Mobile-optimized upload** | On-the-go capture | Medium | Camera integration, offline queue |

### OCR Accuracy Expectations

Based on 2025-2026 industry benchmarks:

| Field | Expected Accuracy | Notes |
|-------|------------------|-------|
| Total amount | 95-99% | High confidence field |
| Date | 95-99% | Well-structured typically |
| Vendor name | 90-95% | Logos, varied fonts |
| Tax/IVA amount | 85-95% | Depends on receipt format |
| Line items | 80-90% | Complex, often not needed |

**Recommendation:** Target 95%+ for total/date, accept lower for others with manual verification UI.

### OCR Implementation Options

| Approach | Pros | Cons | Cost |
|----------|------|------|------|
| **Cloud OCR API (Google Vision, Azure)** | High accuracy, no training | Privacy concerns, per-call cost | $1-3/1000 receipts |
| **Tesseract (client-side)** | Free, private | Lower accuracy, slow | Free |
| **Specialized receipt APIs (Veryfi, Taggun)** | Best accuracy, receipt-specific | Cost, vendor lock-in | $0.05-0.10/receipt |
| **LLM-based (GPT-4 Vision, Claude)** | Excellent understanding | Cost, latency | $0.01-0.05/receipt |

**Recommendation for autonomo context:** Start with manual entry + simple OCR (Tesseract for amount/date), upgrade to cloud API if volume justifies cost.

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Automatic bank reconciliation** | Requires bank API integration, security complexity | Manual matching or skip |
| **Multi-user receipt approval workflow** | Single-user tool | Skip entirely |
| **Auto-categorization ML training** | Over-engineering for scale | Simple category dropdown |
| **Bulk scan with document feeder** | Desktop scanner complexity | Photo/PDF upload sufficient |

### Dependencies

- None for basic upload
- Client linking (for expense attribution)
- Calendar (for trip date association)

### Complexity Notes

- **Storage:** Local file storage (IndexedDB/FileSystem API) or cloud storage
- **OCR:** Consider hybrid: basic Tesseract locally, cloud API opt-in
- **Mobile:** Test HEIC conversion, camera permissions
- **Offline:** Queue uploads for sync when online
- **Retention:** Track upload date, warn at 4-year mark

---

## 4. Calendar-Client Integration

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Monthly calendar view** | See work days at a glance | Low | Grid with day cells |
| **Day status indicator** | Visual for worked/not worked | Low | Color coding or icons |
| **Day detail view** | What happened on a specific day | Low | Click to expand |
| **Month navigation** | Browse past/future months | Low | Arrows or dropdown |
| **Today indicator** | Quick reference | Low | Highlight current day |
| **Basic day tagging** | Mark days as worked | Low | Toggle click |

**Note:** Basic calendar already exists in v1.1 with Belgium day tracking. This extends it.

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tag days with client** | Connect work to billing | Medium | Dropdown on day, auto-suggest |
| **Multiple clients per day** | Split days (morning Client A, afternoon Client B) | Medium | Fractional day support |
| **Work pattern templates** | "Mon-Tue every week at Client X" | High | Recurring rule engine |
| **Google Calendar sync (read)** | See external events | High | OAuth integration |
| **Google Calendar sync (write)** | Push work days to calendar | High | Two-way sync complexity |
| **iCal export** | Download for other apps | Medium | .ics file generation |
| **Trip grouping** | Days 1-5 = "Belgium trip Jan 2026" | Medium | Trip entity linking days |
| **Expense attachment to trip** | Link hotel/flight to trip dates | Medium | Cross-reference UI |
| **Belgium vs Spain vs Travel status** | 183-day rule compliance | Low | Already exists, ensure client tagging compatible |
| **Billable hours tracking** | Hours per day per client | Medium | Time entry per day |

### Calendar-Invoice Integration

Key workflow: Generate invoice from worked days.

```
1. Filter calendar by client + date range
2. Sum worked days (or hours)
3. Calculate at client's rate
4. Generate invoice line item: "Consulting services Jan 2026: 12 days @ 500 EUR/day"
5. Optionally add billable expenses from same period
```

**Required data connections:**
- Calendar day -> Client
- Client -> Rate
- Calendar day range -> Invoice line item

### External Calendar Integration

| Feature | Complexity | Notes |
|---------|------------|-------|
| **Google Calendar read** | High | OAuth 2.0, API calls, token refresh |
| **Google Calendar write** | High | Create events for work days |
| **iCal/CalDAV read** | Medium | URL subscription, periodic refresh |
| **Outlook/Exchange** | Very High | Different auth, skip for v2 |
| **Apple Calendar** | Medium | Via iCal export/import |

**Conflict handling:**
- External calendar = source of truth for personal events
- App calendar = source of truth for work tagging
- Show both overlaid, no auto-merging

**Recommendation for v2:** Start with iCal export. Google Calendar read as stretch goal. Skip write for complexity.

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full project management** | Scope creep, not core need | Simple client tagging sufficient |
| **Team scheduling** | Single-user tool | Skip |
| **Appointment booking for clients** | Different product category | Skip |
| **Automatic time tracking from computer activity** | Privacy, complexity | Manual day/hour entry |

### Dependencies

- Clients (to tag days with)
- Existing Belgium calendar (extend, don't replace)

### Complexity Notes

- **State management:** Day can have: location (Spain/Belgium/Travel), client(s), hours, notes
- **Multi-client days:** Consider simple split (50/50, custom %) vs hour-by-hour
- **Templates:** Recurring rules library similar to calendar apps (weekly, bi-weekly, first Monday, etc.)
- **Migration:** Existing Belgium days should preserve 183-day tracking

---

## 5. Expense-Client Linking

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Link expense to client** | Know who the expense was for | Low | Dropdown on expense |
| **Unlinked expense option** | General overhead (office supplies) | Low | "No client" or "General" |
| **View expenses by client** | See spending per client | Low | Filter on expense list |
| **Total expenses per client** | Summary number | Low | Aggregation |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Billable vs non-billable flag** | Know what to pass through to invoice | Low | Boolean per expense |
| **Project-level tracking** | Multiple projects per client | Medium | Project entity between client and expense |
| **Client profitability calculation** | Revenue - expenses = profit per client | Medium | Combine with invoice data |
| **Direct vs overhead allocation** | 100% direct vs shared overhead split | Medium | Percentage allocation rules |
| **Trip-expense linking** | Group expenses by trip | Medium | Trip entity + expense association |
| **Automatic client suggestion** | Based on expense date and calendar | Medium | If expense date = day worked for Client X, suggest |
| **Deductibility inheritance** | Client type affects deductibility rules | Medium | EU client = Modelo 360 IVA, etc. |

### Expense Categories for Autonomo

| Category | Typical Deductibility | Client-Linkable? |
|----------|----------------------|-----------------|
| **Flight** | 100% IRPF, 0% IVA (exempt) | Yes - trip to client |
| **Hotel** | 100% IRPF, IVA via M360 if foreign | Yes - trip to client |
| **Meals/Dietas** | Up to 91.35 EUR/day abroad | Yes - trip to client |
| **Local transport** | 100% IRPF, IVA varies | Yes - client visit |
| **Office supplies** | 100% | Usually no (overhead) |
| **Software/subscriptions** | 100% | Sometimes (client-specific tool) |
| **Phone/internet** | 50% typical | Usually no (overhead) |
| **Professional services** | 100% | Sometimes |

### Client Profitability Calculation

```
Client Profitability = Sum(Invoices Paid) - Sum(Linked Expenses)

Detailed view:
- Gross revenue: Total invoiced
- Direct expenses: Client-linked expenses (flights, hotels, etc.)
- Overhead allocation: Shared expenses * client revenue % (optional)
- Net profit: Gross - Direct - Overhead

Profit margin % = Net profit / Gross revenue * 100
```

**Display:** Per-client card showing revenue, expenses, profit, margin.

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex cost allocation rules** | Accounting software territory | Simple direct/overhead split |
| **Multi-currency expense tracking** | Complexity, convert to EUR | Always store expenses in EUR |
| **Reimbursement workflow** | Single-user, no employee expenses | Skip |
| **Expense policies/limits** | Corporate feature | Skip |

### Dependencies

- Clients (to link to)
- Receipts/Expenses (to be linked)
- Calendar (for trip association)
- Invoices (for profitability)

### Complexity Notes

- **Data model:** Expense.clientId, Expense.projectId, Expense.tripId, Expense.billable
- **UI:** Expense form with client dropdown, date auto-suggests trip
- **Aggregation:** Views for client profitability, trip cost summary

---

## 6. Tax Automation (Modelo 130)

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Quarterly period summary** | Q1/Q2/Q3/Q4 income and expenses | Medium | Aggregate by date range |
| **Income from invoices** | Total invoiced revenue for period | Low | Sum of invoice amounts |
| **Expenses for period** | Total deductible expenses | Low | Sum of expense amounts |
| **Net profit calculation** | Income - Expenses | Low | Simple arithmetic |
| **20% pago fraccionado calculation** | Core Modelo 130 calculation | Low | Net profit * 20% |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Retenciones tracking** | Deduct client withholdings from 130 | Medium | Sum IRPF retention from invoices |
| **Cumulative annual calculation** | Modelo 130 is cumulative Jan-to-quarter | Medium | Track prior quarters |
| **Prior quarter payments deduction** | Subtract already-paid 130s | Medium | Carryover tracking |
| **Zero/negative result handling** | Still required to file | Low | Show result, explain rules |
| **Cash flow projection** | Reserve 20% for next quarter | Medium | Forward-looking estimate |
| **Gastos dificil justificacion** | 5% deduction, max 2000 EUR | Low | Auto-calculate in tax |
| **Form pre-filling assistance** | Show which boxes to fill | Medium | Map calculations to form fields |
| **Deadline reminders** | Q1: Apr 20, Q2: Jul 20, Q3: Oct 20, Q4: Jan 30 | Low | Calendar notifications |
| **Year-to-date vs annual projection** | What's my estimated annual tax? | Medium | Extrapolate from current data |

### Modelo 130 Calculation

Per AEAT rules, Modelo 130 for autonomos in estimacion directa:

**Key fields:**

| Box | Description | Calculation |
|-----|-------------|-------------|
| 01 | Ingresos computables | Sum of invoiced income (year to date) |
| 02 | Gastos fiscalmente deducibles | Sum of deductible expenses (year to date) |
| 03 | Rendimiento neto | Box 01 - Box 02 |
| 04 | (minus depreciation if applicable) | Usually 0 for consultants |
| 05 | Rendimiento neto minorado | Box 03 - Box 04 |
| 06 | Gastos dificil justificacion | Box 05 * 5%, max 2000 EUR |
| 07 | Rendimiento neto total | Box 05 - Box 06 |
| 08 | 20% of Box 07 | Pago fraccionado base |
| 09 | Retenciones e ingresos a cuenta | Sum of IRPF retentions from clients |
| 10 | Box 08 - Box 09 | After retentions |
| 11 | Pagos fraccionados anteriores | Prior 130 payments this year |
| 12 | Box 10 - Box 11 | Result |
| 14 | Total ingreso/devolucion | Final amount (positive = pay, negative = credit) |

**Special rules:**
- Cumulative: Each quarter includes all prior quarters' data
- If retenciones > 70% of income, not required to file (but still track)
- Q4 Box 12 = annual result, may be negative if overpaid

### Quarterly Deadlines

| Quarter | Period | Deadline |
|---------|--------|----------|
| Q1 | Jan-Mar | April 20 |
| Q2 | Apr-Jun | July 20 |
| Q3 | Jul-Sep | October 20 |
| Q4 | Oct-Dec | January 30 (next year) |

### Related Tax Forms Awareness

Beyond Modelo 130, autonomos have other obligations. For v2, awareness (not full automation):

| Form | Purpose | Frequency | v2 Scope |
|------|---------|-----------|----------|
| **Modelo 130** | IRPF pago fraccionado | Quarterly | FULL - automate |
| **Modelo 303** | IVA declaration | Quarterly | PARTIAL - show IVA totals |
| **Modelo 349** | Intra-community operations | Quarterly/annual | AWARENESS - flag if EU clients |
| **Modelo 390** | Annual IVA summary | Annual | AWARENESS - show totals |
| **Modelo 100** | Annual IRPF declaration | Annual | AWARENESS - year-end summary |
| **Modelo 360** | Foreign IVA refund | Annual (by Sep 30) | AWARENESS - flag Belgian IVA |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Automatic AEAT submission** | Requires digital certificate, complex auth | Pre-fill help, user submits manually |
| **Full Modelo 303 automation** | Different complexity, IVA rules complex | Show IVA totals, awareness only |
| **Multi-year tax planning** | Scope creep, accountant territory | Focus on current year |
| **Tax optimization advice** | Liability concerns, gestor's job | Calculation only, no advice |

### Dependencies

- Invoices (for income data)
- Expenses (for deduction data)
- IRPF retention tracking (from invoices)
- Client EU/non-EU status (for 349 awareness)

### Complexity Notes

- **Data requirements:** Invoice date (for quarter assignment), invoice amount, retention amount
- **Cumulative tracking:** Need to know prior quarter results
- **Storage:** Store each quarter's calculation for audit trail
- **Edge cases:** Q4 negative result (overpaid during year), zero revenue quarters

---

## Feature Dependencies Graph

```
             [Clients] (foundational)
                |
     +----------+----------+
     |                     |
[Calendar]             [Invoices]
     |                     |
     +----+     +----------+
          |     |
        [Expense Linking]
                |
        [Tax Automation]
```

**Build order recommendation:**
1. **Clients** - Foundation, no dependencies
2. **Invoices** - Needs clients
3. **Calendar-Client** - Needs clients, extends existing calendar
4. **Receipt/Expense** - Can be parallel with invoices
5. **Expense Linking** - Needs clients, expenses, calendar
6. **Tax Automation** - Needs invoices, expenses, full data

---

## Spanish Autonomo Specifics Summary

Features that are specific to Spanish autonomo context vs generic small business tools:

| Feature | Spanish-Specific Aspect |
|---------|------------------------|
| **NIF/CIF validation** | Spanish format rules |
| **Factura completa format** | 13+ mandatory fields per Spanish law |
| **VeriFactu QR** | AEAT verification system, July 2027 deadline |
| **IRPF retention (7%/15%)** | Unique to Spanish B2B invoicing |
| **Inversion del sujeto pasivo** | EU reverse charge with Spanish references |
| **Modelo 130 calculation** | Spanish quarterly tax form |
| **Gastos dificil justificacion** | 5% rule unique to Spain |
| **Dietas limits (91.35 EUR/day)** | Spanish IRPF limits for foreign meals |
| **Modelo 360 awareness** | Belgian IVA recovery specific to cross-border |
| **183-day tracking** | Tax residency specific to user's situation |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| CRM features | HIGH | Well-established patterns |
| Invoice requirements | HIGH | Multiple official sources verified |
| VeriFactu specs | HIGH | RD 254/2025 and technical specs verified |
| OCR accuracy | HIGH | 2025-2026 benchmarks documented |
| Calendar integration | MEDIUM | Google Calendar API may change |
| Modelo 130 calculation | HIGH | AEAT documentation verified |
| Multi-currency handling | MEDIUM | Exchange rate sources vary |
| VeriFactu timeline | MEDIUM | May be extended again |

---

## Sources

### Official Spanish Government
- [AEAT - Modelo 130 Instructions](https://sede.agenciatributaria.gob.es/Sede/en_gb/impuestos-tasas/impuesto-sobre-renta-personas-fisicas/modelo-130-irpf______esionales-estimacion-directa-fraccionado_/instrucciones.html)
- [AEAT - VeriFactu System](https://sede.agenciatributaria.gob.es)

### VeriFactu and Invoicing
- [VeriFactu Dates and QR](https://getrenn.com/blog/verifactu) - Renn
- [VeriFactu Complete Guide](https://marosavat.com/verifactu-spain-2026-guide/) - Marosa VAT
- [Spain E-Invoicing Compliance](https://www.flick.network/en-es/verifactu-spain-e-invoicing) - Flick Network
- [GM Tax - RRSIF and VeriFactu](https://gmtaxconsultancy.com/en/news/rrsif-verifactu-application/)

### Invoicing Requirements
- [Spanish Invoice Requirements](https://getrenn.com/blog/mandatory-invoice-details) - Renn
- [Self-Employed Invoicing Guide](https://getrenn.com/blog/how-to-make-a-self-employed-invoice) - Renn
- [Intra-Community Operations](https://www.facturaz.es/resources/guides/understanding-intra-community-operations) - Facturaz
- [Reverse Charge Spain](https://marosavat.com/manual/vat/spain/reverse-charge/) - Marosa VAT

### CRM and Freelancer Tools
- [Best CRM for Freelancers 2026](https://saascrmreview.com/best-crm-for-freelancers/) - SaaS CRM Review
- [CRM for Freelancers](https://monday.com/blog/crm-and-sales/crm-for-freelancers/) - Monday.com
- [Best CRM for Solopreneurs](https://www.flowlu.com/blog/crm/what-is-the-best-crm-for-solopreneurs/) - Flowlu

### Receipt OCR
- [Receipt OCR Benchmark 2026](https://research.aimultiple.com/receipt-ocr/) - AI Multiple
- [OCR Accuracy Benchmarks](https://blog.receiptextract.com/2025/07/20/ocr-accuracy-benchmarks-why-receipt-specific-training-data-matters/) - ReceiptExtract
- [Top Receipt Scanner Apps](https://www.freshbooks.com/hub/productivity/receipt-scanning-apps) - FreshBooks

### Calendar Integration
- [Google Calendar Time Tracking](https://www.timecamp.com/integrations/google-calendar-time-tracking/) - TimeCamp
- [Freelance Time Tracking Tools](https://clickup.com/blog/freelance-time-tracking-software/) - ClickUp

### Multi-Currency Invoicing
- [Cross-Currency Billing for Freelancers](https://invoiceninja.com/cross-currency-billing-when-freelancing-for-international-clients/) - Invoice Ninja
- [Currency on Invoices Guide](https://www.quickbillmaker.com/blog/currency-on-invoices) - Quick Bill Maker

---

## Roadmap Implications

Based on this research, suggested phase structure for v2.0:

### Phase 1: Client Management Foundation
- Basic CRM (CRUD, list/detail views)
- NIF/CIF validation
- EU vs non-EU categorization
- Contract/rate storage

### Phase 2: Invoice Generation
- Spanish factura completa format
- PDF generation with all mandatory fields
- IRPF retention support
- Invoice lifecycle (draft/sent/paid)
- Sequential numbering

### Phase 3: Receipt Upload
- Photo/PDF upload
- Basic OCR (amount, date, vendor)
- Manual entry fallback
- Category assignment

### Phase 4: Calendar-Client Integration
- Extend existing calendar with client tagging
- Work day linking to clients
- Days-worked invoice generation

### Phase 5: Expense-Client Linking
- Link expenses to clients
- Billable marking
- Trip grouping
- Client profitability view

### Phase 6: Tax Automation
- Modelo 130 calculation
- Quarterly summaries
- Retenciones tracking
- Deadline reminders

### Phase 7: VeriFactu Compliance
- QR code generation
- Verification URL structure
- Compliance text on invoices
- (Target completion before July 2027)

**Research flags for phases:**
- Phase 2: VeriFactu QR implementation may need deeper research on exact URL format
- Phase 3: OCR provider selection needs cost-benefit analysis at scale
- Phase 4: Google Calendar API authentication complexity may require adjustment
- Phase 6: Modelo 349 intra-community reporting may warrant separate phase

---

*Research completed: 2026-02-03*
*Confidence: HIGH overall, MEDIUM for implementation-specific details*
*Next step: Use for v2.0 requirements definition*
