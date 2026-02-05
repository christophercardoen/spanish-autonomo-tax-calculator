# Phase 18: Invoice Generation - Research

**Researched:** 2026-02-05
**Domain:** Invoice generation, PDF rendering, VeriFactu compliance, Spanish factura completa
**Confidence:** HIGH

## Summary

Phase 18 builds the invoice generation system for the existing single-file HTML dashboard. The codebase already has foundational infrastructure from Phase 12 (InvoiceManager with sequence numbering, rectificativa support, archive logic) and Phase 15 (client categories determining IVA treatment). This phase must extend InvoiceManager with full CRUD operations, add invoice form UI, build PDF generation with VeriFactu QR, and implement the status workflow (Draft -> Sent -> Paid with overdue flagging).

The standard approach uses jsPDF v2.5.1 for client-side PDF generation with manual text/drawing API (NOT html2canvas), QRCode.js for VeriFactu QR code rendering, and the Frankfurter API for exchange rates. The existing codebase patterns (dialog-based forms, MoneyUtils for cents arithmetic, auditFields(), SyncQueue, EntityContext entity-scoping) should be followed exactly. The database schema for `invoices`, `invoice_lines`, and `invoice_sequences` tables is already defined in Dexie -- no schema migration needed.

**Primary recommendation:** Extend the existing InvoiceManager singleton with full invoice CRUD, line item management, IVA/IRPF calculation, and payment tracking. Use jsPDF v2.5.1 (CDN) with manual drawing API for PDF generation (searchable text, no blurriness). Use QRCode.js for VeriFactu QR. Follow the established ExpenseManager/ReceiptManager patterns for code structure.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jsPDF | 2.5.1 | Client-side PDF generation | Most popular browser PDF lib, UMD build, CDN-ready, stable API. v2.5.1 is the widely-tested stable version; v4.x introduced breaking changes. |
| jsPDF-AutoTable | 3.8.x | Table generation in PDF | Plugin for jsPDF that handles line item tables with pagination, column sizing, and styling. Simpler than manual table drawing. |
| QRCode.js | 1.0.0 | VeriFactu QR code generation | Zero-dependency, renders to canvas/image, supports correction level. Only 4KB. |
| currency.js | 2.0.4 | Money arithmetic | Already in codebase (Phase 12). Handles cents conversion with MoneyUtils wrapper. |
| Dexie.js | 4.x | IndexedDB storage | Already in codebase. Invoice tables already defined in schema. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Frankfurter API | v1 | Exchange rates (EUR/USD/GBP) | When user creates invoice in non-EUR currency. Free, no API key, CORS-enabled, ECB data. |
| Resend API | - | Email delivery via Supabase Edge Function | When user emails invoice PDF to client. Edge Function approach already established for VIES. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsPDF 2.5.1 | jsPDF 4.x | v4 has breaking changes (path traversal security fix, module format changes). v2.5.1 is proven stable with CDN UMD build. Stick with 2.5.1. |
| jsPDF manual drawing | html2canvas + jsPDF | html2canvas produces blurry, non-searchable text. Manual drawing gives crisp, searchable PDF. |
| QRCode.js | qrcode-generator | QRCode.js has simpler API, renders directly to DOM element, better CDN support. |
| jsPDF-AutoTable | Manual table drawing | AutoTable handles column widths, page breaks, alternating rows automatically. Worth the 20KB. |
| Frankfurter API | fawazahmed0/exchange-api | Both are free/CORS-enabled. Frankfurter uses ECB data (authoritative for EUR), has no rate limits, simpler API. |

**Installation (CDN script tags):**
```html
<!-- Phase 18: PDF generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>

<!-- Phase 18: QR code for VeriFactu -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

**Note:** jsPDF and jsPDF-AutoTable should be lazy-loaded (not in static script tags) since they are only needed when generating PDFs. Use the existing `_loadScript()` pattern from ReceiptManager. QRCode.js is small enough (4KB) to include statically, or lazy-load as well.

## Architecture Patterns

### Recommended Code Structure

Follow the existing singleton pattern used by ExpenseManager, ClientManager, ProjectManager:

```
InvoiceManager (extend existing)
├── CRUD Operations
│   ├── createInvoice(invoiceData)     // Create draft with line items
│   ├── updateInvoice(id, changes)     // Edit draft only
│   ├── getInvoice(id)                 // Single invoice with line items
│   └── getInvoices(entityId, opts)    // List with filters (already exists)
│
├── Line Item Operations
│   ├── addLineItem(invoiceId, item)
│   ├── updateLineItem(lineId, changes)
│   ├── removeLineItem(lineId)
│   └── getLineItems(invoiceId)
│
├── Status Workflow
│   ├── markAsSent(id, dateSent)       // Draft -> Sent (locks invoice)
│   ├── recordPayment(id, payment)     // Partial/full payment
│   ├── getPayments(invoiceId)         // Payment history
│   └── isOverdue(invoice)             // Sent + past due date + unpaid
│
├── Calculations
│   ├── calculateInvoiceTotals(id)     // Subtotal, discount, IVA, IRPF, total
│   ├── getIVATreatment(clientCategory) // Returns rate + legal text
│   └── convertToEUR(amountCents, currency, rate) // Multi-currency
│
├── Existing Methods (Phase 12)
│   ├── getNextInvoiceNumber()         // Sequential F/R/S series
│   ├── archiveInvoice()               // Draft-only soft delete
│   └── createRectifyingInvoice()      // Factura rectificativa
│
└── VeriFactu
    └── generateQRUrl(invoice)         // AEAT verification URL

InvoicePDFGenerator (new singleton)
├── generatePDF(invoiceId)             // Main entry point
├── _drawHeader(doc, invoice, entity)  // Branded header with entity info
├── _drawClientInfo(doc, client)       // Client block (right side)
├── _drawLineItems(doc, lines)         // AutoTable for items
├── _drawTotals(doc, invoice)          // Subtotal/discount/IVA/IRPF/total
├── _drawVeriFactuQR(doc, qrUrl)       // QR code image
├── _drawFooter(doc, invoice)          // Bank details, terms, legal text
└── _loadFonts(doc)                    // Lazy-load & embed DM Sans/JetBrains Mono

InvoiceUI (new singleton)
├── Invoice List View
│   ├── renderInvoiceList()            // Filterable list with status badges
│   ├── renderInvoiceFilters()         // Client, date, status, project filters
│   └── renderOverdueAlert()           // Badge counter for overdue
│
├── Invoice Form (Dialog)
│   ├── openInvoiceForm(invoiceId?)    // Create or edit dialog
│   ├── renderLineItemsTable()         // Editable line items in form
│   ├── addLineItemRow()               // Dynamic row addition
│   ├── calculateFormTotals()          // Live recalculation
│   └── handleFormSubmit()             // Validate + save
│
├── Invoice Detail View
│   ├── renderInvoiceDetail(id)        // Full invoice view
│   ├── renderPaymentHistory(id)       // Payment records
│   └── renderStatusActions(invoice)   // Contextual action buttons
│
└── Integration Points
    ├── Client detail "Invoices" tab   // Replace "coming-soon" placeholder
    └── calculateTotals()              // Wire up client totals (TODO from Phase 17)
```

### Pattern 1: IVA Treatment by Client Category

**What:** Automatic IVA rate and legal text determination based on client.category
**When to use:** Every time a line item is added or client is selected on invoice
**Example:**
```javascript
// Source: CLIENT_CATEGORY constants (Phase 15) + RD 1619/2012
const IVA_TREATMENT = Object.freeze({
  spain: {
    rate: 0.21,
    label: 'IVA 21%',
    legalText: null // No special text needed
  },
  eu_b2b: {
    rate: 0,
    label: 'Exento - Inversión sujeto pasivo',
    legalText: 'Inversión del sujeto pasivo - Art. 84.Uno.2º Ley 37/1992 del IVA. Art. 196 Directiva 2006/112/CE.'
  },
  eu_b2c: {
    rate: 0.21,
    label: 'IVA 21%',
    legalText: null
  },
  uk: {
    rate: 0,
    label: 'Export - No IVA',
    legalText: 'Exportación de servicios. Operación no sujeta a IVA. Art. 69 Ley 37/1992.'
  },
  third_country: {
    rate: 0,
    label: 'Export - No IVA',
    legalText: 'Exportación de servicios. Operación no sujeta a IVA. Art. 69 Ley 37/1992.'
  }
});
```

### Pattern 2: Invoice Status State Machine

**What:** Strict state transitions with immutability enforcement
**When to use:** Every status change
**Example:**
```javascript
// Valid transitions only
const VALID_TRANSITIONS = {
  'draft': ['sent'],        // Draft -> Sent (locks invoice)
  'sent': ['paid'],         // Sent -> Paid (via payment recording)
  // No transition TO draft from sent/paid (use factura rectificativa)
  // 'overdue' is a computed visual flag, not a stored status
};

// Check overdue: sent invoice past due date with outstanding balance
function isOverdue(invoice) {
  if (invoice.status !== 'sent') return false;
  if (!invoice.date_due) return false;
  const now = new Date().toISOString().split('T')[0];
  return now > invoice.date_due && invoice.paid_cents < invoice.total_cents;
}
```

### Pattern 3: VeriFactu QR URL Generation

**What:** Generate AEAT verification URL for QR code
**When to use:** PDF generation and invoice preview
**Example:**
```javascript
// Source: AEAT technical specs + Orden HAC/1177/2024
function generateVeriFactuQRUrl(invoice, entity) {
  const baseUrl = 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR';
  const params = new URLSearchParams({
    nif: entity.nif_cif,
    numserie: invoice.invoice_number,  // e.g., F-2026-0001
    fecha: formatDateDDMMYYYY(invoice.date_issued), // DD-MM-YYYY
    importe: MoneyUtils.centsToEuros(invoice.total_cents).toFixed(2) // "." decimal
  });
  return `${baseUrl}?${params.toString()}`;
}

function formatDateDDMMYYYY(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}
```

### Pattern 4: Database Schema Extension for Payments

**What:** The existing invoice schema needs additional fields for payments and multi-currency
**When to use:** DB version upgrade
**Example:**
```javascript
// Need to add to existing invoice record (Dexie version 4):
// - currency: 'EUR' | 'USD' | 'GBP' (default 'EUR')
// - exchange_rate: number (1.0 for EUR)
// - discount_type: 'percentage' | 'fixed' | null
// - discount_value: number (cents for fixed, whole number for %)
// - irpf_rate: number (0, 7, or 15)
// - paid_cents: number (running total of payments)
// - notes: string (payment terms, bank details)
// - date_sent: string (ISO date)

// NEW table: invoice_payments
// invoice_payments: '++id, invoice_id, amount_cents, date, method, reference, [invoice_id]'
```

### Anti-Patterns to Avoid
- **Using html2canvas for PDF:** Produces blurry, non-searchable text. Use jsPDF manual drawing + AutoTable.
- **Storing invoice totals without line items:** Always derive totals from line items. Store calculated totals for query performance but recalculate on any line item change.
- **Allowing edits to sent invoices:** VeriFactu compliance requires immutability. Create factura rectificativa instead.
- **Hardcoding IVA rates in line items:** Derive from client category. Store on the line item at creation time for historical accuracy.
- **Sequential number gaps:** VeriFactu requires no gaps. If a draft is deleted, the number is "consumed." Never reuse or reassign numbers.
- **Loading jsPDF on page load:** The library is ~280KB. Lazy-load only when user clicks "Generate PDF."

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF table layout | Manual line-by-line text positioning | jsPDF-AutoTable plugin | Handles column widths, page breaks, alternating row colors, cell padding automatically |
| QR code rendering | Canvas pixel manipulation | QRCode.js | Handles error correction, encoding, sizing. One line of code. |
| Money arithmetic | `Math.round(price * 1.21)` | MoneyUtils (currency.js) | Already in codebase. Handles floating point, banker's rounding, cents conversion. |
| Invoice numbering | `MAX(id) + 1` query | InvoiceManager.getNextInvoiceNumber() | Already in codebase. Transaction-safe, series-aware, format-compliant. |
| Date formatting (DD-MM-YYYY) | String concatenation | Simple helper function | VeriFactu requires exactly DD-MM-YYYY with leading zeros. |
| Exchange rates | Manual input only | Frankfurter API + manual override | Free API for live rates, with manual override for invoice-date accuracy. |
| Email sending | Browser `mailto:` link | Supabase Edge Function + Resend | `mailto:` can't attach PDF. Edge Function sends proper email with PDF attachment. |
| Soft delete | `DELETE FROM invoices` | DataManager.softDelete() | Already in codebase. 4-year retention, restore window, VeriFactu compliance. |

**Key insight:** The codebase already has 60%+ of the infrastructure needed. InvoiceManager has numbering, archiving, rectificativa. MoneyUtils has IVA calculation. ClientManager has category-based IVA treatment. The main work is connecting these pieces and building the UI/PDF layers.

## Common Pitfalls

### Pitfall 1: Invoice Number Gaps
**What goes wrong:** Developer deletes a draft invoice and its number, creating a gap in the sequence.
**Why it happens:** VeriFactu requires sequential numbering. A gap triggers AEAT audit flags.
**How to avoid:** Never reuse or "free up" invoice numbers. Deleted drafts consume their number permanently. The existing InvoiceManager.archiveInvoice() already handles this correctly (soft delete only, number stays consumed).
**Warning signs:** Any code that decrements invoice_sequences.last_number.

### Pitfall 2: Mutable Sent Invoices
**What goes wrong:** User edits a sent invoice to "fix a typo," breaking the audit trail.
**Why it happens:** Natural UX instinct to allow editing.
**How to avoid:** Enforce immutability in code: `if (invoice.status !== 'draft') throw new Error('Cannot edit...')`. The only way to correct a sent invoice is factura rectificativa (series R).
**Warning signs:** Any `updateInvoice()` call that doesn't check status first.

### Pitfall 3: IVA on EU B2B Invoices
**What goes wrong:** System charges 21% IVA to an EU B2B client instead of applying reverse charge.
**Why it happens:** IVA rate not properly derived from client category.
**How to avoid:** Always derive IVA rate from `client.category` via IVA_TREATMENT lookup. Never allow manual IVA rate entry that overrides the category-determined rate for EU B2B clients.
**Warning signs:** Line items with `iva_rate: 0.21` for `eu_b2b` clients.

### Pitfall 4: IRPF Retention on Wrong Client Types
**What goes wrong:** IRPF retention applied on invoices to foreign clients (only applies to Spanish B2B).
**Why it happens:** IRPF retention is a Spanish-only concept; foreign clients don't withhold Spanish IRPF.
**How to avoid:** Only show IRPF toggle when `client.category === 'spain'` AND entity type is autonomo. SL entities never apply IRPF retention on their invoices.
**Warning signs:** IRPF amount > 0 on invoices where client category is not 'spain'.

### Pitfall 5: PDF Font Embedding Bloat
**What goes wrong:** Embedding DM Sans and JetBrains Mono TTF files as base64 adds 500KB+ to the page.
**Why it happens:** Each font weight (regular, bold) is 100-200KB as base64.
**How to avoid:** Use jsPDF built-in fonts (Helvetica, Courier) for PDF generation. The dashboard uses DM Sans/JetBrains Mono for UI, but the PDF can use standard PDF fonts for simplicity and size. Alternatively, lazy-load font data only when generating PDF.
**Warning signs:** Base64 font strings in the main HTML file.

### Pitfall 6: VeriFactu QR Code Placement
**What goes wrong:** QR code placed in wrong position or wrong size.
**Why it happens:** AEAT specifies 30-40mm, positioned at top of invoice (before main content), with "QR tributario" label above.
**How to avoid:** Follow AEAT technical specifications exactly. Place QR in upper portion of first page, 30-40mm, with required label. Note: the CONTEXT.md says "bottom-right corner" which contradicts AEAT specs. The user decision takes priority, but flag this discrepancy.
**Warning signs:** QR code smaller than 30mm or missing "QR tributario" label.

### Pitfall 7: Multi-Currency Tax Calculation
**What goes wrong:** IVA calculated on USD amount instead of EUR equivalent.
**Why it happens:** Spanish tax obligations are always in EUR.
**How to avoid:** Store both invoice_currency amount and EUR equivalent. All tax calculations (IVA, IRPF) must use EUR amounts. Display both on invoice.
**Warning signs:** IVA percentage applied to non-EUR amounts.

## Code Examples

Verified patterns from the existing codebase and official sources:

### Creating an Invoice (extending InvoiceManager)
```javascript
// Follow pattern from ClientManager.createClient() and ExpenseManager.createExpense()
async createInvoice(invoiceData) {
  const entityId = EntityContext.entityId;
  if (!entityId) throw new Error('No entity selected');

  const entity = await EntityManager.getEntity(entityId);
  const client = await ClientManager.getClient(invoiceData.client_id);
  if (!client) throw new Error('Client not found');

  // Get IVA treatment from client category
  const ivaTreatment = IVA_TREATMENT[client.category];

  // Get next invoice number (uses existing Phase 12 method)
  const invoiceNumber = await this.getNextInvoiceNumber(entityId, this.SERIES.F);

  const invoice = {
    entity_id: entityId,
    client_id: invoiceData.client_id,
    series: this.SERIES.F,
    invoice_number: invoiceNumber,
    status: this.STATUS.DRAFT,
    date_issued: invoiceData.date_issued || new Date().toISOString().split('T')[0],
    date_due: invoiceData.date_due || null,
    currency: invoiceData.currency || 'EUR',
    exchange_rate: invoiceData.exchange_rate || 1,
    discount_type: invoiceData.discount_type || null,
    discount_value: invoiceData.discount_value || 0,
    irpf_rate: invoiceData.irpf_rate || 0,
    subtotal_cents: 0,  // Calculated from line items
    iva_cents: 0,
    irpf_cents: 0,
    total_cents: 0,
    paid_cents: 0,
    notes: invoiceData.notes || '',
    date_sent: null,
    deleted_at: null,
    ...auditFields(true)
  };

  const id = await db.invoices.add(invoice);
  await SyncQueue.queueChange('invoices', id, 'CREATE', invoice);
  return { id, invoice_number: invoiceNumber };
}
```

### Calculating Invoice Totals
```javascript
// All amounts in cents. Use MoneyUtils for rounding.
async calculateInvoiceTotals(invoiceId) {
  const invoice = await db.invoices.get(invoiceId);
  const lines = await db.invoice_lines.where('invoice_id').equals(invoiceId).toArray();

  // Sum line totals (each line: quantity * unit_price_cents)
  let subtotalCents = 0;
  let ivaCents = 0;

  for (const line of lines) {
    const lineTotal = MoneyUtils.roundCents(line.quantity * line.unit_price_cents);
    subtotalCents += lineTotal;
    ivaCents += MoneyUtils.calculateIVA(lineTotal, line.iva_rate);
  }

  // Apply discount to subtotal
  let discountCents = 0;
  if (invoice.discount_type === 'percentage') {
    discountCents = MoneyUtils.roundCents(subtotalCents * (invoice.discount_value / 100));
  } else if (invoice.discount_type === 'fixed') {
    discountCents = invoice.discount_value; // Already in cents
  }

  const discountedSubtotal = subtotalCents - discountCents;

  // Recalculate IVA on discounted subtotal
  const client = await db.clients.get(invoice.client_id);
  const treatment = IVA_TREATMENT[client.category];
  ivaCents = MoneyUtils.calculateIVA(discountedSubtotal, treatment.rate);

  // IRPF (only for autonomo invoicing Spanish clients)
  let irpfCents = 0;
  if (invoice.irpf_rate > 0) {
    irpfCents = MoneyUtils.roundCents(discountedSubtotal * (invoice.irpf_rate / 100));
  }

  // Total = subtotal - discount + IVA - IRPF
  const totalCents = discountedSubtotal + ivaCents - irpfCents;

  // Update invoice record
  await db.invoices.update(invoiceId, {
    subtotal_cents: discountedSubtotal,
    iva_cents: ivaCents,
    irpf_cents: irpfCents,
    total_cents: totalCents,
    ...auditFields(false)
  });

  return { subtotalCents: discountedSubtotal, discountCents, ivaCents, irpfCents, totalCents };
}
```

### PDF Generation with jsPDF
```javascript
// Lazy-load jsPDF and AutoTable, then generate
async generatePDF(invoiceId) {
  // Lazy load libraries (follow ReceiptManager._loadScript pattern)
  if (!window.jspdf) {
    await this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  }
  if (!window.jspdf?.jsPDF?.API?.autoTable) {
    await this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }); // 210 x 297 mm

  // A4 dimensions: 210mm width, 297mm height
  // Margins: 20mm left/right, 15mm top/bottom
  const margin = { top: 15, right: 20, bottom: 20, left: 20 };
  const pageWidth = 210;
  const contentWidth = pageWidth - margin.left - margin.right;

  // ... draw sections (header, client, line items, totals, QR, footer)

  // Save with invoice number filename
  doc.save(`${invoice.invoice_number}.pdf`);
}
```

### QR Code Generation for VeriFactu
```javascript
// Generate QR as data URL for embedding in PDF
async generateQRDataUrl(invoice, entity) {
  const qrUrl = this.generateVeriFactuQRUrl(invoice, entity);

  // Create temporary div for QR rendering
  const tempDiv = document.createElement('div');
  tempDiv.style.display = 'none';
  document.body.appendChild(tempDiv);

  const qr = new QRCode(tempDiv, {
    text: qrUrl,
    width: 128,
    height: 128,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  // Wait for rendering, extract canvas data URL
  await new Promise(resolve => setTimeout(resolve, 100));
  const canvas = tempDiv.querySelector('canvas');
  const dataUrl = canvas.toDataURL('image/png');

  // Cleanup
  document.body.removeChild(tempDiv);
  return dataUrl;
}
```

### Exchange Rate Fetch (Frankfurter API)
```javascript
// Source: https://frankfurter.dev/
async fetchExchangeRate(fromCurrency, toCurrency = 'EUR') {
  if (fromCurrency === toCurrency) return 1;
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=${toCurrency}`
    );
    if (!response.ok) throw new Error('Rate fetch failed');
    const data = await response.json();
    return data.rates[toCurrency];
  } catch (err) {
    console.warn('Exchange rate fetch failed, manual entry required:', err);
    return null; // Fallback to manual entry
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PDF via server-side (wkhtmltopdf) | Client-side jsPDF | Standard since ~2020 | No server dependency for PDF generation |
| html2canvas + jsPDF | jsPDF manual drawing + AutoTable | Best practice ~2023+ | Searchable text, crisp rendering, smaller file size |
| No QR on Spanish invoices | VeriFactu QR mandatory | RD 1007/2023, enforced Jan 2027 (SL) / Jul 2027 (autonomo) | All invoices must include QR for AEAT verification |
| IRPF retention 15% only | 7% for first 3 years, 15% standard | Long-standing rule, still current 2026 | Invoice form must support both rates |
| Factura simplificada for small amounts | Still valid <400 EUR | RD 1619/2012 (unchanged) | Could use series S for simplified invoices |

**Deprecated/outdated:**
- **jsPDF 4.x breaking changes:** v4 changed module format and added security restrictions. Stick with v2.5.1 for CDN/UMD usage.
- **VeriFactu deadline was July 2026:** Extended to January 2027 (SL) and July 2027 (autonomo) by Real Decreto-ley 15/2025. Software must still be ready by July 2025.

## VeriFactu Compliance Details

### QR Code URL Format (HIGH confidence)
```
Production: https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?nif={nif}&numserie={numserie}&fecha={fecha}&importe={importe}
Test:       https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif={nif}&numserie={numserie}&fecha={fecha}&importe={importe}
```

| Parameter | Format | Example |
|-----------|--------|---------|
| nif | 9 characters (NIF/CIF) | `B43752210` |
| numserie | Max 60 ASCII chars, URL-encoded | `F-2026-0001` |
| fecha | DD-MM-YYYY | `23-04-2026` |
| importe | "." decimal, max 12+2 digits | `1234.56` |

### QR Physical Requirements (MEDIUM confidence)
- Size: 30x30mm to 40x40mm
- Label above: "QR tributario"
- 2mm minimum white space around (6mm recommended)
- AEAT spec says "beginning of invoice" (top); CONTEXT.md says "bottom-right corner" -- **user decision overrides**
- First page only for multi-page invoices
- Must display "VERI*FACTU" or "Factura verificable en la sede electronica de la AEAT" text

### Factura Completa Fields (HIGH confidence)
Per RD 1619/2012 Art. 6, the 13 mandatory fields:

1. Invoice number (sequential, with series if applicable)
2. Date of issue (fecha de expedicion)
3. Issuer full name / razon social
4. Issuer NIF/CIF
5. Issuer address (domicilio fiscal/social)
6. Recipient full name / razon social
7. Recipient NIF (mandatory for B2B)
8. Recipient address
9. Description of goods/services
10. Taxable base (base imponible) per rate
11. IVA rate(s) applied (tipo impositivo)
12. IVA amount (cuota tributaria)
13. Total amount (contraprestacion total)

**Additional mandatory mentions by case:**
- EU B2B: "Inversion del sujeto pasivo - Art. 84.Uno.2 Ley 37/1992"
- Export: "Operacion no sujeta a IVA. Art. 69 Ley 37/1992"
- IRPF retention: Show retention % and amount as separate line
- Rectificativa: Reference to original invoice number and correction reason

### IRPF Retention Rules
- **15%** standard for established autonomo professionals (IAE sections 2/3)
- **7%** reduced rate for first 3 years of activity
- Only applies when: (a) entity type = autonomo, (b) client is Spanish business/professional
- Never applies to: SL entities, foreign clients, individual consumers
- Must communicate rate to client; defaults to 15% if not specified

## Database Schema Notes

### Existing Tables (Phase 12, no migration needed)
```
invoices: ++id, entity_id, client_id, series, invoice_number, status,
          date_issued, date_due, subtotal_cents, iva_cents, irpf_cents,
          total_cents, deleted_at,
          [entity_id+series+invoice_number], [entity_id+deleted_at], [entity_id+status]

invoice_lines: ++id, invoice_id, description, quantity, unit_price_cents,
               iva_rate, line_total_cents

invoice_sequences: ++id, entity_id, series, last_number, [entity_id+series]
```

### New Fields Needed (store as properties, no index change needed)
```
// On invoice record (Dexie stores any property, only indexed fields need schema):
currency: 'EUR',           // Invoice display currency
exchange_rate: 1.0,        // Rate to EUR at invoice date
discount_type: null,       // 'percentage' | 'fixed' | null
discount_value: 0,         // Percent or cents
irpf_rate: 0,              // 0, 7, or 15
paid_cents: 0,             // Running total of payments received
date_sent: null,           // ISO date when marked as sent
notes: '',                 // Payment terms, bank details
original_invoice_id: null, // For rectificativa (already in Phase 12)
logo_data: null,           // Base64 logo image (per entity, stored in entity record)

// On line items (additional properties):
project_id: null,          // Optional link to client project
sort_order: 0              // Display ordering
```

### New Table Needed: invoice_payments
```javascript
// Dexie version 4 (or next version):
invoice_payments: '++id, invoice_id, amount_cents, date, method, reference, created_at, [invoice_id]'
```

**Important:** Dexie allows storing any properties on a record even if they're not in the index schema. Only add to the `.stores()` definition if you need to query/filter by that field. The additional invoice fields (currency, discount, etc.) don't need index changes. Only `invoice_payments` requires a new table definition.

## Integration Points

### Existing Code to Wire Up
1. **Client detail view:** Replace `<p class="coming-soon">Invoices will be available in phase 18.</p>` at line 9185 with rendered invoice list for that client.
2. **ClientDetailUI.calculateTotals():** Replace TODO at line 22628 with actual invoice sum query.
3. **Tab navigation:** Add "Invoices" tab to main tab-nav (new tab-input radio + label + panel).
4. **Permission system:** Use existing `data-permission="create"` pattern. Accountant role has `canCreateInvoice: false` (line 17677).

### Calendar Integration (INVOICE-10)
```javascript
// Auto-populate invoice from calendar days tagged with client
async createInvoiceFromCalendar(clientId, dateRange, projectId) {
  const days = await db.calendar_days
    .where('[entity_id+date]')
    .between(
      [EntityContext.entityId, dateRange.start],
      [EntityContext.entityId, dateRange.end],
      true, true
    )
    .filter(d => d.client_id === clientId)
    .toArray();

  const project = await db.projects.get(projectId);
  const quantity = days.length; // Number of days
  const rate = project.rate_cents; // Daily rate

  return {
    description: `${project.name} - ${dateRange.start} to ${dateRange.end} (${quantity} days)`,
    quantity,
    unit_price_cents: rate,
    iva_rate: IVA_TREATMENT[client.category].rate
  };
}
```

## Open Questions

Things that couldn't be fully resolved:

1. **VeriFactu QR Placement Contradiction**
   - CONTEXT.md says: "bottom-right corner"
   - AEAT specs say: "beginning of invoice, before main content" (top)
   - **Recommendation:** Follow user decision (bottom-right) but add a note in the code. The AEAT placement rule is for mandatory VeriFactu mode; since VeriFactu is not yet mandatory for autonomos (July 2027), the current implementation can place it wherever the user prefers. Consider adding a settings toggle in the future.

2. **Custom Font Embedding in PDF**
   - DM Sans and JetBrains Mono require TTF-to-base64 conversion for jsPDF embedding
   - Adds ~300-500KB of base64 data per font weight
   - Some rendering issues reported with custom fonts in jsPDF across viewers
   - **Recommendation:** Use jsPDF built-in fonts (Helvetica for body, Courier for numbers) for PDF output. The PDF is a professional document, not the dashboard -- built-in PDF fonts are appropriate and avoid bloat and compatibility issues. If the user insists on matching fonts, implement as a future enhancement with lazy-loaded font files.

3. **Email Delivery Architecture**
   - Supabase Edge Function with Resend API is the recommended approach
   - Supabase blocks SMTP ports 587 and 465
   - Requires user to set up Resend account and configure API key
   - **Recommendation:** Implement email as optional feature. Default to download-only. Email requires Supabase Edge Function deployment (similar to VIES validation). Document setup steps.

4. **Logo Storage per Entity**
   - CONTEXT.md specifies logo upload per entity, stored in IndexedDB
   - Entity record currently has no logo field
   - **Recommendation:** Store as base64 data URL on entity record (similar to receipt file_data in ReceiptManager). Add `logo_data` field to entity. Compress to reasonable size (max 200x200px, JPEG 0.8).

5. **jsPDF Version Choice**
   - v2.5.1 is stable and well-documented for CDN/UMD usage
   - v4.x is latest but has breaking changes for browser/CDN usage
   - **Recommendation:** Use v2.5.1. It's proven, all tutorials reference it, and the UMD CDN build works reliably. If AutoTable v5.x requires jsPDF 3+, use AutoTable v3.8.x instead.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `autonomo_dashboard.html` lines 14590-14713 (DB schema), 18405-18647 (InvoiceManager), 19184-19250 (CLIENT_CATEGORY), 17932-17991 (MoneyUtils)
- [AEAT VeriFactu QR specs](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/informacion-tecnica/caracteristicas-qr-especificaciones-servicio-cotejo-factura.html) - QR URL format, parameter specs
- [BOE RD 1619/2012](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696) - Factura completa mandatory fields (Art. 6)
- [efsta.eu VeriFactu Receipt Layout](https://docs.efsta.eu/efr/ES/receipt-layout-verifactu/) - QR URL structure confirmation

### Secondary (MEDIUM confidence)
- [getrenn.com VeriFactu Guide](https://getrenn.com/blog/verifactu) - VeriFactu deadlines and penalties
- [marosavat.com VeriFactu Complete Guide](https://marosavat.com/verifactu-spain-2026-guide/) - Compliance overview
- [invoiceness.com Spain Invoice Guide](https://invoiceness.com/en/blog/how-to-create-invoice-in-spain) - Practical invoice creation
- [jsPDF GitHub](https://github.com/parallax/jsPDF) - Library capabilities and version info
- [jsPDF-AutoTable GitHub](https://github.com/simonbengtsson/jsPDF-AutoTable) - Table plugin documentation
- [QRCode.js GitHub](https://github.com/davidshimjs/qrcodejs) - QR library API
- [Frankfurter API](https://frankfurter.dev/) - Exchange rate API documentation
- [Supabase Email Guide](https://supabase.com/docs/guides/functions/examples/send-emails) - Edge Function email pattern
- [Resend + Supabase](https://resend.com/docs/send-with-supabase-edge-functions) - Email delivery integration

### Tertiary (LOW confidence)
- [pdfnoodle.com jsPDF 2026 Guide](https://pdfnoodle.com/blog/generating-pdfs-from-html-with-jspdf) - jsPDF best practices (blog post)
- [devlinpeck.com Custom Fonts jsPDF](https://www.devlinpeck.com/content/jspdf-custom-font) - Font embedding tutorial
- [dmitriiboikov.com PDF lib comparison](https://dmitriiboikov.com/posts/2025/01/pdf-generation-comarison/) - PDF library comparison

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified via GitHub/npm, CDN URLs confirmed, codebase patterns documented
- Architecture: HIGH - Extends existing patterns (InvoiceManager, ExpenseManager, dialog forms) with well-understood additions
- VeriFactu compliance: HIGH - QR URL format confirmed via AEAT specs and multiple sources; factura completa fields from BOE RD 1619/2012
- IVA treatment: HIGH - CLIENT_CATEGORY already in codebase, IVA rules confirmed from multiple official sources
- IRPF retention: HIGH - 15%/7% rates confirmed from multiple Spanish fiscal sources
- PDF generation: MEDIUM - jsPDF 2.5.1 API well-documented; AutoTable integration straightforward; font embedding has known quirks
- Email delivery: MEDIUM - Requires user setup of Resend/Supabase, port restrictions documented
- Pitfalls: HIGH - All pitfalls derived from codebase analysis and VeriFactu compliance requirements

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (30 days - stable domain, VeriFactu specs finalized)
