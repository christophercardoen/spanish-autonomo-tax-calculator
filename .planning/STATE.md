# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Complete business management for Spanish SMEs (autonomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and tax automation
**Current focus:** v2.0 Multi-Entity Business Management - Phase 14 IN PROGRESS

## Current Position

Milestone: v2.0 Multi-Entity Business Management
Phase: 14 of 29 (Authentication & Permissions)
Plan: 1 of 3 in current phase (14-01 complete)
Status: In progress
Last activity: 2026-02-03 - Completed 14-01-PLAN.md (Auth Database Schema)

Progress: [########----------] 50% (9/18 v2.0 plans complete)

## Performance Metrics

**Velocity (from v1.1):**
- Total plans completed: 35
- Average duration: 3.4 min
- Total execution time: 176 min

**v2.0 Metrics:**
- Phases: 18 (Phases 12-29)
- Total requirements: 223
- Plans completed: 9 (Phase 12 complete, Phase 13 complete, 14-01 complete)
- Phase 14 duration: ~2 min (1 plan so far)

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

### Pending Todos

None - continue with Phase 14-02.

### Blockers/Concerns

None - 14-01 completed successfully.

### Research Flags

Phases needing `/gsd:research-phase`:
- Phase 14: Authentication & Permissions - COMPLETE (research done)
- Phase 19: Receipt OCR (Mindee API) - HIGH
- Phase 21: Tax Automation - SL (IS calculation, BINs) - HIGH
- Phase 22: SL Accounting (Cuentas Anuales generation) - HIGH
- Phase 27: Cloud Sync (PWA, conflict resolution) - HIGH

## Phase 14 Deliverables Summary

| Plan | Deliverable | Commit |
|------|-------------|--------|
| 14-01 | DB schema v2, ProfileManager, EntityShareManager, InvitationManager, SessionManager | `a9b59c5`, `d404650` |
| 14-02 | (pending) Login UI implementation |
| 14-03 | (pending) Permission UI and enforcement |

**Phase 14 Success Criteria:**
- [x] Database schema extended with auth tables
- [x] owner_id added to entities table
- [x] ProfileManager module functional
- [x] EntityShareManager module with role constants
- [x] InvitationManager module with expiry handling
- [x] SessionManager module with device detection
- [ ] Magic link authentication UI
- [ ] Google OAuth integration
- [ ] TOTP 2FA enrollment UI
- [ ] Entity sharing UI
- [ ] Permission enforcement in UI

## Session Continuity

Last session: 2026-02-03 20:11 UTC
Stopped at: Completed 14-01-PLAN.md (Auth Database Schema)
Resume file: None - continue with 14-02-PLAN.md

---
*Plan 14-01 completed: 2026-02-03*
*Next step: /gsd:execute-plan 14-02*
