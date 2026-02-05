# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Complete business management for Spanish SMEs (autonomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and tax automation
**Current focus:** v2.0 Multi-Entity Business Management - Phase 17 in progress (Expense Management)

## Current Position

Milestone: v2.0 Multi-Entity Business Management
Phase: 17 of 29 (Expense Management) - In progress
Plan: 6 of 7 in current phase (17-01 through 17-06 complete)
Status: In progress
Last activity: 2026-02-05 - Completed 17-06-PLAN.md (Dietas Validation & Billable/Receipt Protection)

Progress: Phases 12-16 complete (26 plans) + Phase 17: 6/7 plans complete
[################################################################----------] ~42%

## Performance Metrics

**Velocity (from v1.1):**
- Total plans completed: 54
- Average duration: 3.5 min
- Total execution time: 304 min

**v2.0 Metrics:**
- Phases: 18 (Phases 12-29)
- Total requirements: 223
- Plans completed: 32 (Phase 12: 3, Phase 13: 5, Phase 14: 6, Phase 15: 5, Phase 16: 7, Phase 17: 6)
- Phase 17: In progress (6/7 plans)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1]: Single-file HTML preserved, vanilla JS, no frameworks
- [v1.1]: RETA fixed cuota (428.40 EUR/month) from registration
- [v1.1]: 4-phase minimo method (AEAT official methodology)
- [v2.0]: Supabase + Dexie.js for offline-first with cloud sync
- [v2.0]: Entity-type polymorphism (single codebase, type-based routing)
- [v2.0]: Dual tax engines (preserve v1.1 IRPF, add parallel IS engine)
- [12-01]: Store all monetary values as integer cents, convert at UI boundary
- [12-01]: 12 tables defined upfront for v2.0 schema consistency
- [12-01]: Banker's rounding for tax calculations via MoneyUtils
- [12-02]: 30-day restore window for soft-deleted records
- [12-02]: 4-year retention policy for Spanish tax compliance
- [12-02]: SyncQueue thresholds at 100/500/1000 for progressive warnings
- [12-03]: Invoice format {series}-{year}-{4-digit} with F/R/S series separation
- [12-03]: Only draft invoices can be archived; sent/paid require factura rectificativa
- [13-01]: All tax ID error messages in Spanish for AEAT compliance
- [13-01]: CIF control type varies by organization letter (A/B/E/H=number, K/P/Q/S=letter)
- [13-01]: Tax ID auto-detect by format prefix (X/Y/Z=NIE, A-W=CIF, digit=NIF)
- [13-02]: EntityContext.initialize() as Step 5 in initializeDatabase()
- [13-02]: Session state persisted via db.settings table with key 'current_entity_id'
- [13-03]: Entity modal uses HTML entity codes for cross-browser icon compatibility
- [13-03]: SL minimum capital social 3000 EUR (Spanish legal minimum)
- [13-03]: Duplicate tax ID detection prevents creating entities with same NIF/CIF
- [13-04]: ARIA combobox pattern for entity switcher accessibility
- [13-04]: EntityContext.subscribe() for reactive UI updates
- [13-05]: Session-based dismissal for dual activity warning (resets on new session)
- [13-05]: DualActivityDetector triggers on entity create/archive/restore for immediate feedback
- [14-01]: owner_id nullable initially for v1-to-v2 migration compatibility
- [14-01]: profiles.id is UUID (not auto-increment) to match auth.users
- [14-01]: Three-tier roles: gestor (read-only), accountant (read-write), partner (full admin)
- [14-01]: 7-day invitation expiry period for security
- [14-02]: Supabase CDN for single-file HTML architecture
- [14-02]: Graceful degradation to offline mode when SUPABASE_CONFIG empty
- [14-02]: Permission matrix: owner > partner > accountant > gestor
- [14-02]: New entities get owner_id from current authenticated user
- [14-03]: Auth screen blocks dashboard until authenticated or offline mode selected
- [14-03]: Profile accessed via user menu dropdown, hides tab navigation
- [14-03]: NIF/CIF validation reuses SpanishTaxIdValidator from Phase 13
- [14-03]: Offline mode shows 'O' avatar and 'Offline' label in user menu
- [14-04]: MFA uses Supabase AAL (Authenticator Assurance Level) for session security
- [14-04]: 6-digit code input with auto-advance and paste support for UX
- [14-04]: MFA challenge intercepts auth state before dashboard access
- [14-04]: Sessions list shows device name and relative time (Just now, 5m ago, etc.)
- [14-04]: 2FA toggle hidden in offline mode (requires Supabase)
- [14-04]: XSS prevention via escapeHtml on session device names
- [14-05]: InviteUI creates both shareable link and code for flexibility
- [14-05]: Sharing section located in profile tab (accessed via user menu)
- [14-05]: Only owner and partner roles can invite or revoke users
- [14-05]: Pending invitations shown with dashed border and expiry countdown
- [14-05]: EntityContext subscriber updates sharing section on entity change
- [14-06]: PermissionUI caches current role to avoid repeated DB queries
- [14-06]: Interactive elements disabled (not hidden) to show permission awareness
- [14-06]: Offline mode grants full access (local data only)
- [14-06]: Gestor read-only banner prominently indicates restricted access
- [14-06]: Entity list shows role badges for non-owner entities
- [15-01]: Greece uses EL country code per EU VIES specification (not GR)
- [15-01]: UK and XI categorized as non-EU post-Brexit
- [15-01]: EU countries return intermediate 'eu' value requiring B2B/B2C clarification
- [15-02]: VIES validation via Edge Function proxy to bypass CORS
- [15-02]: VIESValidator gracefully degrades to format-only when offline
- [15-02]: ClientManager routes tax ID validation by country code (ES/EU/third)
- [15-02]: EU VAT format validation immediate; VIES API validation deferred to UI button
- [15-02]: Third country tax IDs stored as-is with no external validation
- [15-03]: Contact roles fixed to four: billing, project_manager, technical, general
- [15-03]: Project status auto-calculated from dates, manual override takes precedence
- [15-03]: Projects denormalize entity_id for faster entity-level queries
- [15-03]: Four rate types: daily, hourly, fixed, monthly_retainer
- [15-04]: Client row click opens detail view (not edit form)
- [15-04]: VIES verification optional with confirmation prompt for EU B2B clients
- [15-05]: Database version 3 adds contacts table with client_id index
- [15-05]: Contact entity_id denormalized for faster entity-scoped queries
- [15-05]: Custom checkbox styling with green checkmark when checked
- [15-05]: All UI text must be in English (user requirement)
- [16-01]: LOCATION_TYPE keeps UNSET value for v1 compatibility during migration
- [16-01]: Migration is per-entity via localStorage flag (calendar_migrated_v2_entity_{entityId})
- [16-01]: getLinkedExpenseCount is placeholder returning 0 until Phase 17
- [16-01]: Calendar migration runs in Step 5.5 of initializeDatabase()
- [16-02]: Radio buttons for location selection (visual feedback, single selection)
- [16-02]: Client abbreviation shows first 3 letters uppercase for compact display
- [16-02]: Shift+click for multi-select toggle, regular click opens day editor
- [16-02]: renderCalendarAsync with renderCalendarSync fallback for graceful degradation
- [16-03]: ISO day format (1=Mon, 7=Sun) for pattern day selection
- [16-03]: First week defined as days 1-7 of month for extra day patterns
- [16-03]: Pattern application skips days with existing location (respects manual edits)
- [16-03]: Preview shows up to 15 dates inline, remainder as count
- [16-04]: CALENDAR_RANGE object defines year-specific month boundaries
- [16-04]: Calendar state version 2 adds currentYear for multi-year support
- [16-04]: Belgium + Travel days count toward 183-day threshold (conservative approach)
- [16-04]: Progressive WARNING_LEVELS at 170 (caution), 180 (warning), 183 (danger)
- [16-05]: Auto-detect v2 data and fall back to legacy export when IndexedDB empty
- [16-05]: Batch expense count loading for efficient month rendering
- [16-05]: Graceful degradation when expenses table not ready
- [16-06]: App calendar entries win in sync conflicts, external events read-only (CALENDAR-16)
- [16-06]: OAuth 2.0 implicit flow via Google Identity Services for single-file HTML
- [16-06]: Sync to user's primary calendar by default
- [17-01]: EXPENSE_CATEGORY uses Object.freeze() with ENTITY_TYPE constants as rule keys
- [17-01]: No gastos_dificil category - automatic IRPF deduction, not user expense
- [17-01]: ExpenseManager follows ProjectManager pattern (entity scoping, soft delete, audit, sync)
- [17-01]: calculateDeductible auto-recalculates on update when amount/category/metadata change
- [17-01]: DEPRECIATION category sl_only: true (autonomo uses per-asset simplified table)
- [17-02]: Tesseract.js lazy-loaded via dynamic script injection (no static script tag)
- [17-02]: Image compression to max 1024px JPEG 0.7 before IndexedDB storage
- [17-02]: European date/number formats prioritized in receipt text parsing
- [17-02]: compressImage graceful degradation returns original file on error
- [17-03]: Separate conditional field groups for Travel vs Meals for cleaner UX
- [17-03]: Home office deductible % field only shown for autonomo entities (max 30%)
- [17-03]: OCR auto-fill only overwrites empty fields (preserves manual edits)
- [17-03]: Receipt file stored after expense creation to get expense ID for linking
- [17-03]: XSS prevention via _escapeHtml helper for all user-generated content display
- [17-03]: Form dialog dual mode via data-edit-id attribute (empty = create, populated = edit)
- [17-04]: Client names batch-loaded via _loadClientNameCache with entity-scoped cache invalidation
- [17-04]: Dual rendering: table for desktop (>768px), cards for mobile (<768px) using CSS display toggle
- [17-04]: Empty state differentiates 'no expenses yet' vs 'no matches for current filters'
- [17-04]: Category filter is entity-type-aware (hides SL-only categories for autonomo)
- [17-04]: Tab activation (tab-expenses change event) triggers filter population and list render
- [17-05]: Day editor always shows expenses section (Add button visible even with 0 expenses)
- [17-05]: Trip expenses displayed via getExpensesForDateRange overlap query with 'trip' badge
- [17-05]: Deduction hints are entity-type-aware (Autonomo vs SL rules per category)
- [17-05]: Deduction summary collapsible by default to keep expense list clean
- [17-05]: Client calculateTotals now queries real expense data (invoices still placeholder for Phase 18)
- [17-06]: validateDietas is standalone function (separate from ExpenseManager CRUD)
- [17-06]: Dietas warnings are advisory (do not block save), cash shows error-level warning
- [17-06]: Receipt preview uses DOM overlay (not dialog) for backdrop click dismiss
- [17-06]: renderArchivedExpenses uses forceShow parameter for re-render without toggle
- [17-06]: All expense deletes remain soft delete via DataManager.softDelete (EXPENSE-15)

### Pending Todos

None.

### Blockers/Concerns

None - Phase 17 progressing smoothly.

User setup required:
- Deploy vies-validate Edge Function to Supabase for online EU VAT validation
- Configure GCAL_CONFIG.CLIENT_ID for Google Calendar sync (see 16-06-SUMMARY.md)

### Research Flags

Phases needing `/gsd:research-phase`:
- Phase 16: Calendar Enhancement - COMPLETE (research done)
- Phase 19: Receipt OCR (Mindee API) - HIGH
- Phase 21: Tax Automation - SL (IS calculation, BINs) - HIGH
- Phase 22: SL Accounting (Cuentas Anuales generation) - HIGH
- Phase 27: Cloud Sync (PWA, conflict resolution) - HIGH

## Phase 16 Deliverables Summary

| Plan | Deliverable | Commit |
|------|-------------|--------|
| 16-01 | CalendarManager, LOCATION_TYPE, migrateCalendarToIndexedDB | `6e91bf8` |
| 16-02 | Day editor modal, bulk tag modal, async calendar rendering | `26a1420` |
| 16-03 | WorkPatternManager, pattern form fields, Apply Pattern modal | `e32f234` |
| 16-04 | calculateThresholdCounts, WARNING_LEVELS, multi-year navigation | `7ec08db` |
| 16-05 | generateEnhancedICS, generateEnhancedCSV, getLinkedExpenseCounts | `59ac3de`, `0294cda` |
| 16-06 | GCalSync module, OAuth integration, sync UI | `a3704df`, `6bdcfed`, `e10853d` |
| 16-07 | Verification + bug fixes (year summary, counts, emojis) | `49c8407`, `c157c70` |

## Phase 17 Deliverables Summary

| Plan | Deliverable | Commit |
|------|-------------|--------|
| 17-01 | EXPENSE_CATEGORY config, ExpenseManager singleton with CRUD + deduction calc | `a01ffde`, `304264c` |
| 17-02 | ReceiptManager singleton, compressImage, lazy Tesseract.js OCR | `ea30959` |
| 17-03 | Expense form dialog HTML + JS handlers (create/edit, OCR, conditional fields) | `be26446`, `e743df1` |
| 17-04 | Expense list with filters, summary bar, dual-layout table+cards | `4ade847`, `5a0e99e` |
| 17-05 | Calendar-expense linking, deduction indicators/hints/summary, client expenses tab | `dab43a2`, `296d136` |
| 17-06 | validateDietas, receipt preview, enhanced archive, archived expenses toggle | `296d136`, `aa1dd0f` |

## Session Continuity

Last session: 2026-02-05
Stopped at: Completed 17-06-PLAN.md (Dietas Validation & Billable/Receipt Protection)
Resume file: None

---
*Phase 17 in progress: 2026-02-05*
*Next step: Continue Phase 17 plans (17-07 next)*
