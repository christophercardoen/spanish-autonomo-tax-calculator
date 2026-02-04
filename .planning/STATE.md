# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Complete business management for Spanish SMEs (autonomo + SL) with multi-entity support, client CRM, invoice generation, receipt OCR, and tax automation
**Current focus:** v2.0 Multi-Entity Business Management - Phase 15 IN PROGRESS (Client Management)

## Current Position

Milestone: v2.0 Multi-Entity Business Management
Phase: 15 of 29 (Client Management) - IN PROGRESS
Plan: 4 of 6 in current phase (15-04 complete)
Status: In progress
Last activity: 2026-02-04 - Completed 15-04-PLAN.md (Client List UI and Client Form Modal)

Progress: [#############-----] 85% (17/20 v2.0 plans complete)

## Performance Metrics

**Velocity (from v1.1):**
- Total plans completed: 43
- Average duration: 3.4 min
- Total execution time: 208 min

**v2.0 Metrics:**
- Phases: 18 (Phases 12-29)
- Total requirements: 223
- Plans completed: 17 (Phase 12 complete, Phase 13 complete, Phase 14 complete, Phase 15 in progress)
- Phase 15 duration: ~12 min (3 plans)

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
- [15-04]: Client row click opens edit form via stub until Plan 15-05 adds detail panel
- [15-04]: ProjectManager stub returns 0 active projects until Plan 15-03 implements CRUD
- [15-04]: VIES verification optional with confirmation prompt for EU B2B clients

### Pending Todos

None - continue with Phase 15 plans.

### Blockers/Concerns

None - Phase 15 Plan 04 completed successfully.

User setup required: Deploy vies-validate Edge Function to Supabase for online EU VAT validation.

### Research Flags

Phases needing `/gsd:research-phase`:
- Phase 15: Client Management - COMPLETE (research done)
- Phase 19: Receipt OCR (Mindee API) - HIGH
- Phase 21: Tax Automation - SL (IS calculation, BINs) - HIGH
- Phase 22: SL Accounting (Cuentas Anuales generation) - HIGH
- Phase 27: Cloud Sync (PWA, conflict resolution) - HIGH

## Phase 15 Deliverables Summary

| Plan | Deliverable | Commit |
|------|-------------|--------|
| 15-01 | EU_VAT_PATTERNS, getFlagEmoji, CLIENT_CATEGORY, getClientCategoryByCountry | `004dbc6`, `bd9cd7c` |
| 15-02 | VIESValidator, ClientManager, VIES Edge Function | `d1a4f49`, `fc0efaf`, `c97c24d` |
| 15-03 | ContactManager, ProjectManager, CONTACT_ROLE, RATE_TYPE, PROJECT_STATUS | `053d3c6`, `c6624a3` |
| 15-04 | ClientListUI, ClientFormUI, ProjectManager stub, Clientes tab | `2253f05`, `9676b6c` |

**Phase 15 Success Criteria (Progress):**
- [x] EU VAT format validation for all 27 EU countries plus XI
- [x] Greece uses EL country code per VIES specification
- [x] CLIENT_CATEGORY constants for IVA treatment routing
- [x] Country flag emoji function working
- [x] VIESValidator with format and API validation (15-02)
- [x] ClientManager CRUD operations (15-02)
- [x] ContactManager with roles and primary contact (15-03)
- [x] ProjectManager CRUD with auto-status calculation (15-03)
- [x] Client form UI with country-aware validation (15-04)
- [x] Client list with search and filters (15-04)
- [ ] Client detail panel (15-05)
- [ ] Project form and list UI (15-06)

## Session Continuity

Last session: 2026-02-04
Stopped at: Completed 15-04-PLAN.md (Client List UI and Client Form Modal)
Resume file: None - proceed to 15-05-PLAN.md

---
*Phase 15 started: 2026-02-04*
*Next step: /gsd:execute-phase 15 (continue with 15-05)*
