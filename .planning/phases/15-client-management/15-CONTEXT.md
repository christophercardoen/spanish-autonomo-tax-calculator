# Phase 15: Client Management - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage clients with proper tax ID validation and categorization. Includes NIF/CIF validation for Spanish clients, VIES validation for EU VAT numbers, automatic country categorization (Spain, EU B2B, EU B2C, UK, Third Country), project management per client, and client profitability tracking. Calendar work-day tagging and expense linking happen in later phases.

</domain>

<decisions>
## Implementation Decisions

### Client List Display
- Default sort: Alphabetical (A-Z) by client name
- Row info: Name, country flag, active projects count, last invoice date
- No visual grouping by country category — flat list
- Search with multi-filter: search box plus filters for country, has active project, has outstanding invoice

### Client Detail Page
- Tabbed interface with tabs for Projects, Invoices, Expenses
- Contact info always visible in header area
- Header shows: Name, tax ID, country flag, total invoiced, outstanding balance
- Profitability: Simple total (total invoiced minus linked expenses = profit)
- Include mini calendar view showing days worked for this client

### Tax ID Validation UX
- Validation timing: On blur (when user leaves field)
- VIES check: Manual button — user clicks "Verify with VIES" after entering EU VAT number
- VIES failure: Block save — cannot create EU B2B client without valid VIES (critical for inversion sujeto pasivo)
- Auto-detect country from tax ID format and pre-fill country field

### Project Management
- Rate types: Multiple — daily, hourly, fixed project fee, monthly retainer
- Status tracking: Detailed with dates — start date, end date, auto-status based on dates (upcoming/active/completed)
- No recurring work pattern support (one-off projects, dates define engagement)
- Multiple active projects per client: Yes, unlimited

### Claude's Discretion
- Exact filter UI implementation (dropdowns vs chips vs sidebar)
- Tab order on detail page
- Mini calendar styling and interaction
- Error message wording for validation failures
- Empty states for new clients with no data

</decisions>

<specifics>
## Specific Ideas

- VIES validation is critical for tax compliance — blocking on invalid EU VAT protects against incorrect inversion sujeto pasivo claims
- Mini calendar view ties into Phase 16 calendar enhancement — foundation for work day tracking
- Multi-filter on client list supports the common workflow of "show me all EU clients with outstanding invoices"

</specifics>

<deferred>
## Deferred Ideas

- Recurring work patterns for projects — Phase 16 Calendar Enhancement may revisit
- Client import from CSV/Excel — could be Phase 26 Data Migration scope
- Client merge/deduplication — future enhancement

</deferred>

---

*Phase: 15-client-management*
*Context gathered: 2026-02-04*
