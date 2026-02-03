# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Complete business management for Spanish SMEs (autonomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and tax automation
**Current focus:** v2.0 Multi-Entity Business Management - Phase 14 COMPLETE (all 6 plans)

## Current Position

Milestone: v2.0 Multi-Entity Business Management
Phase: 14 of 29 (Authentication & Permissions) - COMPLETE
Plan: 6 of 6 in current phase (14-06 complete)
Status: Phase complete
Last activity: 2026-02-03 - Completed 14-06-PLAN.md (Permission Enforcement in UI)

Progress: [############------] 70% (14/20 v2.0 plans complete)

## Performance Metrics

**Velocity (from v1.1):**
- Total plans completed: 40
- Average duration: 3.4 min
- Total execution time: 196 min

**v2.0 Metrics:**
- Phases: 18 (Phases 12-29)
- Total requirements: 223
- Plans completed: 14 (Phase 12 complete, Phase 13 complete, Phase 14 complete)
- Phase 14 duration: ~22 min (6 plans)

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

### Pending Todos

None - Phase 14 complete. Ready for Phase 15.

### Blockers/Concerns

None - Phase 14 completed successfully with full permission enforcement.

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
| 14-02 | Supabase client, AuthManager (magic link, OAuth, password reset), EntityAccessManager | `be1e7f7`, `6cb7184` |
| 14-03 | Login screen UI, AuthUI controller, User menu, Profile page | `89bfcb3`, `7396717`, `08c3bb5` |
| 14-04 | MFAManager, MFAUI, SessionsUI, 2FA profile toggle | `7f4005d`, `92df45d`, `9119a1c` |
| 14-05 | Invite modal, InviteUI, SharingUI, team access section | `3aad83b`, `242e1eb`, `d9da2e5` |
| 14-06 | PermissionUI, data-permission attributes, entity list filtering | `da52869`, `f877736`, `d7643e4` |

**Phase 14 Success Criteria:**
- [x] Database schema extended with auth tables
- [x] owner_id added to entities table
- [x] ProfileManager module functional
- [x] EntityShareManager module with role constants
- [x] InvitationManager module with expiry handling
- [x] SessionManager module with device detection
- [x] Supabase client with offline fallback
- [x] AuthManager with magic link, Google OAuth, password reset
- [x] EntityAccessManager with role-based permissions
- [x] Magic link authentication UI
- [x] Google OAuth integration UI
- [x] TOTP 2FA enrollment UI (AUTH-05)
- [x] Active sessions list with revocation (AUTH-06)
- [x] Entity sharing invitation UI (PERM-01, PERM-02, PERM-03)
- [x] Sharing management with revocation (PERM-05)
- [x] Permission enforcement in UI (PERM-04, PERM-06, PERM-07)

## Session Continuity

Last session: 2026-02-03 21:08 UTC
Stopped at: Completed 14-06-PLAN.md (Permission Enforcement in UI)
Resume file: None - Phase 14 complete

---
*Plan 14-06 completed: 2026-02-03*
*Phase 14 complete*
*Next step: /gsd:plan-phase 15 or /gsd:execute-phase 15*
