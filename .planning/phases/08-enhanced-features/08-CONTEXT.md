# Phase 8: Enhanced Features - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete v1 feature set with calendar UX improvements, intelligent expense handling, income tracking tab, and verified official source links. These enhancements improve existing systems without adding new major capabilities (invoicing, multi-user, reporting are separate phases).

</domain>

<decisions>
## Implementation Decisions

### Calendar Multi-Select UX
- Week selection ("W" buttons) selects all 7 days (full calendar week)
- Support multi-week selection across months with different weeks within those months
- Individual day selection remains available alongside bulk selection
- Month "Select All" button adds to existing week selections (cumulative)
- Visual feedback: checkmark overlay on selected days before status applied
- Deselection: Both "Clear Selection" button AND click-to-deselect individual days
- Date range display: Show both range text ("Feb 10 - Mar 15") and count ("25 days selected")
- Week toggle behavior: Click "W" once to select, click again to deselect same week
- Month toggle behavior: Smart toggle - if ALL month days selected, deselects month; otherwise selects all
- Dialog behavior: Claude's discretion (choose smoothest workflow for status assignment)

### Expense Auto-Detection
- Detection method: Predefined list of 100% deductible categories researched based on autonomo IT/consulting activity
- Keyword recognition: Add pattern matching for expense names/descriptions
- Manual override: User can add or delete categories from the list
- Pre-fill behavior: Show "100% (suggested)" badge when category matches, user can confirm or override
- List management: View and edit interface for managing 100% deductible category list
- Override handling: Show warning/confirmation when user changes from suggested 100% to different percentage ("Software is typically 100% deductible. Use 50%?")

### Income Tracking Interface
- Location: New dedicated "Income" tab (5th tab alongside Scenarios/Calendar/Expenses/Compliance)
- Fields per entry:
  - Client name + invoice number
  - Amount + date received
  - Service description
  - Additional fields for legal/invoice requirements (auto-populate invoice data, link client information)
- Scenario integration: Hybrid approach - user can manually enter revenue in scenarios OR import from income tab
- Organization: Chronological list with filter/sort options (by date, client, amount, etc.)

### Official Source Links
- Link coverage: All sources cited throughout the dashboard (IRPF/RETA rates, treaty provisions, dietas limits, ALL external sources)
- Link placement: Both inline clickable citations AND dedicated comprehensive Sources reference section
- Link styling: External link icon (↗) next to all official source links
- Link verification: Test all links during development to ensure validity and correct destination

### Claude's Discretion
- Dialog workflow for multi-select status assignment (open/closed during selection)
- Exact visual styling for checkmark overlays and selection highlighting
- Filter UI design for income tracking
- Auto-population logic for invoice fields from client data
- Sources reference section layout and organization

</decisions>

<specifics>
## Specific Ideas

- Calendar multi-select should feel intuitive like Google Calendar or spreadsheet range selection
- Expense auto-detection should be smart but not annoying - suggest, don't force
- Income tracking needs to support invoice generation downstream (field design considers this)
- Source links must go to official government sites (AEAT, BOE, Seguridad Social) not third-party summaries

</specifics>

<deferred>
## Deferred Ideas

- Invoice generation/export - separate phase
- Multi-user/collaboration features - separate phase
- Advanced reporting/analytics - separate phase
- Automated bank transaction import - future consideration

</deferred>

---

*Phase: 08-enhanced-features*
*Context gathered: 2026-02-02*
