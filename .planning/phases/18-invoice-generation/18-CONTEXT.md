# Phase 18: Invoice Generation - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate compliant Spanish invoices with entity-type-specific templates (Autonomo: NIF header, SL: Razon social + Registro Mercantil), sequential numbering per VeriFactu, correct IVA treatment by client category, VeriFactu QR code, PDF generation, and invoice status lifecycle. Factura rectificativa support for corrections to sent invoices.

</domain>

<decisions>
## Implementation Decisions

### Invoice Layout & Template
- Branded header style with color accent bar and entity identity prominent
- Left-right split layout: entity info (name, NIF/CIF, address) on left, client info on right, invoice number/date between or above
- Company logo support: optional upload per entity, stored in IndexedDB, displayed in header if present, text-only fallback if no logo
- All invoice text in English always (labels, legal text, terms) — matches app UI language
- Autonomo header shows: NIF, nombre, domicilio fiscal
- SL header shows: CIF, razon social, Registro Mercantil (Tomo/Folio/Hoja), domicilio social

### Status Workflow & Actions
- Three-state flow: Draft -> Sent -> Paid
- Overdue is a visual flag on Sent invoices past due date, not a separate status
- Draft invoices are fully editable
- Sent invoices are immutable — any correction requires factura rectificativa (strict VeriFactu compliance)
- Partial payment tracking: multiple payments against one invoice, shows remaining balance
- Overdue handling: visual badge in invoice list + in-app alert/counter showing overdue count and total outstanding amount

### Line Items & Pricing
- Line items can optionally link to a client project — auto-pulls rate from project, description from project name
- Free-text line items also supported (no project link required)
- Each line item: description, quantity, unit price, IVA rate
- Invoice-level discount: single discount field (% or fixed amount) applied to subtotal before IVA
- IRPF retention: optional toggle per invoice (15% standard, 7% first 2 years for autonomo), not auto-applied
- Multi-currency support: can invoice in EUR, USD, GBP; exchange rate shown on invoice; all tax calculations in EUR

### PDF Output & Delivery
- Client-side PDF generation using jsPDF (+ html2canvas if needed)
- VeriFactu QR code positioned in bottom-right corner of invoice
- Download PDF to device + option to send via email (Supabase Edge Function for SMTP)
- Filename convention: invoice number based (e.g., F-2026-0001.pdf)

### Claude's Discretion
- Exact color scheme for branded header accent bar
- Paper size and margin details (A4 assumed)
- Font choices for PDF (within jsPDF capabilities)
- Email template design for invoice delivery
- Due date default (e.g., 30 days from issue)
- QR code library choice for VeriFactu
- Exchange rate source for multi-currency
- Invoice preview UI in the dashboard

</decisions>

<specifics>
## Specific Ideas

- Existing invoice numbering format from Phase 12: {series}-{year}-{4-digit} with F/R/S series separation (F=factura, R=rectificativa, S=proforma)
- Existing rule from Phase 12: only draft invoices can be archived; sent/paid require factura rectificativa
- Client categories from Phase 15 determine IVA treatment: Spain 21%, EU B2B inversion sujeto pasivo, EU B2C 21%, third country no IVA
- Project rate types from Phase 15: daily, hourly, fixed, monthly_retainer — line items should map to these

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-invoice-generation*
*Context gathered: 2026-02-05*
