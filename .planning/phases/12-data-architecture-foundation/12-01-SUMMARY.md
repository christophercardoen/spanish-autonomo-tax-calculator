---
phase: 12-data-architecture-foundation
plan: 01
subsystem: database
tags: [indexeddb, dexie.js, currency.js, offline-first, money-handling]

# Dependency graph
requires:
  - phase: v1.1 (11-milestone-completion)
    provides: Single-file HTML dashboard with IRPF calculations
provides:
  - IndexedDB database with 12 entity tables
  - MoneyUtils module for integer cents conversion
  - Loading screen for database migrations
  - Audit fields helper for timestamps
affects: [12-02, 12-03, 13, 15, 16, 17, 18, 19, 27]

# Tech tracking
tech-stack:
  added: [Dexie.js v4.x, currency.js v2.0.4]
  patterns: [integer-cents-storage, soft-delete-with-retention, sync-queue-prep]

key-files:
  created: []
  modified: [autonomo_dashboard.html]

key-decisions:
  - "Store all monetary values as integer cents, convert at UI boundary"
  - "12 tables defined upfront for v2.0 schema consistency"
  - "Loading screen with fade transition for database initialization"
  - "Banker's rounding implementation for tax calculations"

patterns-established:
  - "MoneyUtils.eurosToCents() for all user input conversion"
  - "MoneyUtils.formatEuros() for Spanish locale display"
  - "auditFields() helper for created_at/updated_at timestamps"
  - "AppDatabase class extends Dexie for typed table access"

# Metrics
duration: 3min
completed: 2026-02-03
---

# Phase 12 Plan 01: Database Foundation Summary

**IndexedDB offline-first data layer with Dexie.js v4, 12 entity tables, and MoneyUtils for integer cents precision**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-03T14:22:47Z
- **Completed:** 2026-02-03T14:25:04Z
- **Tasks:** 2 (combined into 1 commit as interdependent)
- **Files modified:** 1

## Accomplishments

- Dexie.js v4.x and currency.js CDN dependencies added
- Complete v2.0 database schema with 12 tables (entities, clients, projects, invoices, invoice_lines, invoice_sequences, expenses, receipts, calendar_days, tax_calculations, sync_queue, settings)
- MoneyUtils module with eurosToCents, centsToEuros, formatEuros, banker's rounding
- Loading screen with spinner and status text for database migrations
- auditFields() helper for consistent timestamps across all records

## Task Commits

Each task was committed atomically:

1. **Task 1 + Task 2: Database Schema + Loading Screen + MoneyUtils** - `5d59b3e` (feat)
   - Tasks combined as they share same file modifications and are interdependent

**Plan metadata:** Pending

## Files Created/Modified

- `autonomo_dashboard.html` - Added CDN scripts, loading screen CSS/HTML, AppDatabase class, MoneyUtils module, initializeDatabase function

## Decisions Made

- **Combined tasks:** Task 1 (CDN + schema) and Task 2 (loading screen + MoneyUtils) were implemented in a single commit since they're interdependent and modify the same file
- **Database name:** Used 'AutonomoBusinessDB' for clear identification in DevTools
- **Spanish locale:** MoneyUtils.formatEuros() defaults to 'es-ES' for proper euro formatting (1.234,56 EUR)
- **Async DOMContentLoaded:** Changed handler to async to await database initialization before UI rendering

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Database foundation complete, ready for Plan 02 (CRUD operations)
- MoneyUtils available for expense/invoice amount handling
- Loading screen infrastructure ready for migration feedback
- Tables indexed for efficient queries (compound indexes on entity_id + deleted_at)

### Verification Checklist (for browser testing)

1. Open DevTools > Application > IndexedDB > 'AutonomoBusinessDB'
2. Verify all 12 tables visible
3. Console should show: "Database opened: AutonomoBusinessDB version: 1"
4. Test MoneyUtils in console:
   - `MoneyUtils.eurosToCents('1234.56')` returns 123456
   - `MoneyUtils.centsToEuros(123456)` returns 1234.56
   - `MoneyUtils.formatEuros(123456)` returns "1.234,56 EUR"

---
*Phase: 12-data-architecture-foundation*
*Completed: 2026-02-03*
