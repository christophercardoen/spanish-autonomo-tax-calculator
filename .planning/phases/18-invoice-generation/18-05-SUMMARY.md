---
phase: 18-invoice-generation
plan: 05
subsystem: invoicing
tags: [jsPDF, AutoTable, QRCode, VeriFactu, PDF, A4, invoice-generation, logo-upload]

# Dependency graph
requires:
  - phase: 18-01
    provides: InvoiceManager with getInvoice, generateVeriFactuQRUrl, MoneyUtils, IVA_TREATMENT
  - phase: 18-04
    provides: Invoice detail view with action buttons (PDF stub replaced)
  - phase: 13
    provides: EntityManager, EntityModal, entity modal HTML, ENTITY_TYPE constants
provides:
  - InvoicePDFGenerator singleton with generatePDF method
  - Professional A4 PDF generation with jsPDF + AutoTable + QRCode.js
  - Entity logo upload with compression (compressLogoImage function)
  - handleGeneratePDF function wired to invoice detail PDF buttons
  - VeriFactu QR code rendering per Real Decreto 1007/2023
affects: [18-06, 18-07, 18-08]

# Tech tracking
tech-stack:
  added: [jsPDF 2.5.1 (CDN lazy-load), jspdf-autotable 3.8.2 (CDN lazy-load), qrcodejs 1.0.0 (CDN lazy-load)]
  patterns: [lazy-loaded CDN scripts via _loadScript pattern, canvas-based image compression]

key-files:
  created: []
  modified: [autonomo_dashboard.html]

key-decisions:
  - "jsPDF built-in fonts only (Helvetica, Courier) - no custom font embedding to avoid 300-500KB bloat"
  - "Logo stored per entity (not per invoice) - PDF reads current entity logo at generation time"
  - "QR code rendered via temporary hidden DOM element, extracted as canvas data URL"
  - "VeriFactu QR non-fatal: generation failure logs warning but PDF still completes"
  - "Logo compression to max 200x200px JPEG 0.8 quality for IndexedDB storage efficiency"
  - "Notes section skipped if it would overlap QR code area (y > 248mm)"

patterns-established:
  - "InvoicePDFGenerator singleton: section drawing methods return Y position for sequential layout"
  - "compressLogoImage: canvas-based resize with graceful fallback to original on error"
  - "PDF button handler pattern: disable + text change during generation, auto-reset after 2 seconds"

# Metrics
duration: 11min
completed: 2026-02-05
---

# Phase 18 Plan 05: Invoice PDF Generation Summary

**Professional A4 PDF generation with jsPDF + AutoTable, entity-type-specific headers (NIF/CIF + Registro Mercantil), VeriFactu QR code, and entity logo upload with canvas compression**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-05T19:38:56Z
- **Completed:** 2026-02-05T19:49:41Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- InvoicePDFGenerator singleton generating professional A4 PDFs with all required Spanish factura completa elements
- Lazy-loaded jsPDF + AutoTable + QRCode.js from CDN (not loaded on page start)
- Entity-type-specific PDF headers: Autonomo shows NIF + domicilio fiscal; SL shows CIF + Registro Mercantil + domicilio social
- Line items table with AutoTable (blue header, alternating rows, right-aligned numeric columns)
- Complete totals breakdown: subtotal, discount, IVA (with rate %), IRPF (with rate %), and bold TOTAL
- Legal text rendered for EU B2B ("Inversion del sujeto pasivo") and export invoices
- VeriFactu QR code in bottom-right corner per Real Decreto 1007/2023
- Entity logo upload with canvas compression (max 200x200px, JPEG 0.8)
- All 4 invoice status PDF buttons replaced from stubs to working handleGeneratePDF calls

## Task Commits

Each task was committed atomically:

1. **Task 1: InvoicePDFGenerator singleton with lazy-loaded jsPDF + QR** - `f32c86c` (feat)
2. **Task 2: Logo upload per entity and PDF logo integration** - `e686523` (feat)

## Files Created/Modified

- `autonomo_dashboard.html` - InvoicePDFGenerator singleton (~470 lines), compressLogoImage function, handleGeneratePDF handler, logo upload HTML in entity modal, EntityModal logo state management, EntityManager logo_data persistence

## Decisions Made

- **jsPDF built-in fonts only:** Helvetica for body/labels, Courier for monetary values (monospace alignment). Custom fonts (DM Sans, JetBrains Mono) avoided due to 300-500KB embedding overhead and rendering issues.
- **Logo per entity, not per invoice:** Entity's logo_data read at PDF generation time. Future logo changes affect all future PDFs without changing stored invoices.
- **VeriFactu QR via temporary DOM:** QRCode.js renders to a hidden div's canvas, extracted as PNG data URL, then embedded in PDF. Hidden div cleaned up after extraction.
- **Non-fatal QR generation:** If QR rendering fails, warning logged but PDF still generated and downloaded.
- **Logo compression strategy:** Canvas resize to 200x200px max, JPEG 0.8 quality. Graceful fallback uses original data URL if compression fails.
- **Notes overflow protection:** If notes box would extend past y=248mm (overlapping QR code area), notes section is skipped rather than breaking layout.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - all CDN libraries are lazy-loaded from public CDNs (cdnjs.cloudflare.com). No environment variables or API keys required.

## Next Phase Readiness

- PDF generation fully operational for all invoice statuses (draft, sent, paid, archived)
- Ready for Plan 18-06 (Email/Print integration) and 18-07/08 (verification, polish)
- Logo upload functional but entity edit flow does not exist yet (only on creation); updateEntity already accepts logo_data if entity editing is added later

---
*Phase: 18-invoice-generation*
*Completed: 2026-02-05*
