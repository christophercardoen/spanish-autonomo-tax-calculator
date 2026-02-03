# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Complete business management for Spanish SMEs (autonomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and tax automation
**Current focus:** v2.0 Multi-Entity Business Management - Phase 13 in progress

## Current Position

Milestone: v2.0 Multi-Entity Business Management
Phase: 13 of 29 (Multi-Entity Architecture)
Plan: 4 of 5 in current phase (13-04 complete)
Status: In progress
Last activity: 2026-02-03 - Completed 13-04-PLAN.md (Entity Switcher UI)

Progress: [######------------] 39% (7/18 v2.0 plans complete)

## Performance Metrics

**Velocity (from v1.1):**
- Total plans completed: 33
- Average duration: 3.4 min
- Total execution time: 169 min

**v2.0 Metrics:**
- Phases: 18 (Phases 12-29)
- Total requirements: 223
- Plans completed: 7 (Phase 12 complete, Phase 13 at 4/5)
- Phase 13 duration: ~13 min (4 plans)

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

### Pending Todos

None - continue with Phase 13 plans.

### Blockers/Concerns

None - Phase 13 progressing smoothly.

### Research Flags

Phases needing `/gsd:research-phase`:
- Phase 15: Client Management (VIES API) - MEDIUM
- Phase 19: Receipt OCR (Mindee API) - HIGH
- Phase 21: Tax Automation - SL (IS calculation, BINs) - HIGH
- Phase 22: SL Accounting (Cuentas Anuales generation) - HIGH
- Phase 27: Cloud Sync (PWA, conflict resolution) - HIGH

## Phase 13 Deliverables Summary

| Plan | Deliverable | Commit |
|------|-------------|--------|
| 13-01 | SpanishTaxIdValidator, ENTITY_TYPE constants, EntityContext module | `aca2656` |
| 13-02 | EntityContext integration with initializeDatabase | `dee30a4` |
| 13-03 | EntityManager CRUD, EntityModal creation form | `aa7b354`, `fc79e3b` |
| 13-04 | EntitySwitcher UI component in header | `e2dc52f`, `d49fbdf` |
| 13-05 | (pending) Dual activity detection | - |

**Phase 13 Success Criteria:**
- [x] NIF validation with modulo 23 algorithm
- [x] CIF validation with organization-type-specific control
- [x] NIE validation with X/Y/Z prefix handling
- [x] ENTITY_TYPE constants for type-safe routing
- [x] EntityContext singleton with observer pattern
- [x] Session restoration from persisted entity selection
- [x] Entity creation forms
- [x] Entity CRUD operations
- [x] Entity type switching (via EntitySwitcher dropdown)
- [ ] Dual activity detection

## Session Continuity

Last session: 2026-02-03 16:45 UTC
Stopped at: Completed 13-04-PLAN.md (Entity Switcher UI)
Resume file: None - proceed to 13-05-PLAN.md

---
*Phase 13 started: 2026-02-03*
*Next step: Execute 13-05-PLAN.md*
