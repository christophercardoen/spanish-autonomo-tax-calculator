---
phase: 18-invoice-generation
plan: 07
subsystem: ui
tags: [email, pdf, print, supabase, resend, edge-function, invoice-delivery]

# Dependency graph
requires:
  - phase: 18-05
    provides: InvoicePDFGenerator with jsPDF + AutoTable + VeriFactu QR
  - phase: 18-06
    provides: Client detail integration, renderInvoiceDetailActions
  - phase: 14-02
    provides: SUPABASE_CONFIG, supabaseClient initialization
  - phase: 15-03
    provides: ContactManager with billing/primary contact roles
provides:
  - handleDownloadInvoice function (PDF file download)
  - handlePrintInvoice function (blob URL + print window)
  - handleEmailInvoice function (pre-filled email dialog from client/contact data)
  - handleSendInvoiceEmail function (Supabase Edge Function invocation)
  - InvoicePDFGenerator.generatePDF options parameter (returnBase64, returnBlobUrl)
  - emailInvoiceDialog HTML with To, CC, Subject, Body fields
  - Edge Function template documentation for send-invoice deployment
  - Graceful degradation for email without Supabase configuration
affects: [27-cloud-sync, invoice-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PDF output modes: save (default), base64 (email attachment), bloburl (print)"
    - "Graceful degradation: email dimmed without Supabase, shows setup instructions"
    - "Contact priority for email: billing contact > primary contact > client email field"
    - "Edge Function template as code comment block for user self-service deployment"

key-files:
  created: []
  modified:
    - autonomo_dashboard.html

key-decisions:
  - "Email via Supabase Edge Function + Resend API (not direct SMTP) for security and single-file HTML compatibility"
  - "PDF base64 extracted by stripping data URI prefix from jsPDF datauristring output"
  - "Email body converted from plaintext to simple HTML with paragraph tags for newlines"
  - "Contact priority chain: billing contact email > primary contact email > client.email field"
  - "Email button always visible (dimmed without Supabase) rather than hidden, to show capability exists"
  - "Edge Function template documented inline as code comment (no separate file needed)"
  - "Print uses window.open + blob URL approach for cross-browser compatibility"

patterns-established:
  - "PDF output options: generatePDF(id, { returnBase64: true }) for attachment, { returnBlobUrl: true } for print"
  - "Supabase availability check via _isSupabaseConfigured() centralizing config + client validation"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 18 Plan 07: Invoice Delivery Summary

**Invoice delivery via download PDF, browser print, and email with Supabase Edge Function + Resend API graceful degradation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T19:52:22Z
- **Completed:** 2026-02-05T19:57:38Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Download PDF, Print, and Email buttons on all invoice detail views (draft, sent, paid, archived)
- InvoicePDFGenerator extended with returnBase64 and returnBlobUrl output options
- Email dialog pre-fills recipient from billing contact, primary contact, or client email
- Professional email body template with invoice number, amount, due date, and entity name
- Graceful degradation: email shows setup instructions when Supabase not configured
- Complete Edge Function template documented for Resend API deployment

## Task Commits

Each task was committed atomically:

1. **Task 1: Email, download, and print handlers** - `4c1d0ce` + `f7d3180` (feat)
   - `4c1d0ce`: Core implementation (dialog HTML, generatePDF options, all handler functions, Edge Function docs)
   - `f7d3180`: renderInvoiceDetailActions updated with Download PDF, Print, Email buttons

## Files Created/Modified
- `autonomo_dashboard.html` - Email dialog HTML, InvoicePDFGenerator options, download/print/email handlers, action buttons

## Decisions Made
- **Email via Edge Function:** Direct SMTP not possible from browser; Supabase Edge Function + Resend provides secure server-side email delivery while keeping single-file HTML architecture
- **PDF base64 for attachment:** jsPDF datauristring output stripped of prefix gives raw base64 suitable for Resend attachment content field
- **Contact priority chain:** Billing contact email preferred over primary contact over client-level email, matching business invoice workflow expectations
- **Email button visibility:** Dimmed (opacity 0.7) rather than hidden when Supabase not configured, so users know the capability exists and can set it up
- **Print via blob URL:** Using window.open with bloburl and load event listener for print trigger provides better cross-browser support than jsPDF autoPrint
- **Inline Edge Function docs:** Full Deno/Resend template as code comment block rather than separate file, keeping the single-file architecture principle

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Email delivery is optional.** To enable email sending:

1. Create account at https://resend.com/signup
2. Get API key from Resend Dashboard -> API Keys
3. Deploy send-invoice Edge Function to Supabase (template in code comments)
4. Set secret: `supabase secrets set RESEND_API_KEY=re_xxxxx`
5. Optionally set: `supabase secrets set FROM_EMAIL=invoices@yourdomain.com`

Download PDF and Print always work without any configuration.

## Next Phase Readiness
- Invoice delivery complete (download, print, email)
- Ready for Phase 18-08 (final verification/testing)
- All Phase 18 functionality now in place: data layer, UI scaffold, form interactivity, list/detail views, PDF generation, client integration, and delivery

---
*Phase: 18-invoice-generation*
*Completed: 2026-02-05*
