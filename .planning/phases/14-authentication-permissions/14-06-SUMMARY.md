---
phase: 14-authentication-permissions
plan: 06
subsystem: auth
tags: [permissions, rbac, role-based-access, ui-enforcement, gestor, accountant, partner, owner]

# Dependency graph
requires:
  - phase: 14-05
    provides: InviteUI, SharingUI, EntityShareManager, role infrastructure
  - phase: 14-02
    provides: EntityAccessManager.canPerformAction(), AuthManager.isOfflineMode()
  - phase: 13-02
    provides: EntityContext.subscribe() for reactive updates
provides:
  - PermissionUI module with role caching and permission checking
  - data-permission attribute system for UI element gating
  - withPermission() wrapper for programmatic permission checks
  - Role indicator badge in header with role-specific styling
  - Read-only banner for gestor role
  - Entity list filtering by accessible entities
  - Role badges in entity switcher list items
affects: [all-future-phases, entity-management, data-modification-features]

# Tech tracking
tech-stack:
  added: []
  patterns: ["data-permission attribute gating", "Role caching with EntityContext subscription", "withPermission() async wrapper"]

key-files:
  created: []
  modified: ["autonomo_dashboard.html"]

key-decisions:
  - "PermissionUI caches current role to avoid repeated DB queries"
  - "Interactive elements disabled (not hidden) to show permission awareness"
  - "Offline mode grants full access (local data only)"
  - "Gestor read-only banner prominently indicates restricted access"
  - "Entity list shows role badges for non-owner entities"

patterns-established:
  - "PermissionUI.canPerform(action, {type}) for permission checks"
  - "data-permission/data-permission-type attributes for declarative UI gating"
  - "withPermission(action, type, callback) wrapper for programmatic checks"
  - "PermissionUI.init() subscribes to EntityContext and AuthManager changes"

# Metrics
duration: 6min
completed: 2026-02-03
---

# Phase 14 Plan 06: Permission Enforcement in UI Summary

**Role-based UI restrictions with PermissionUI module, data-permission attributes, gestor read-only mode, and entity list filtering by accessible entities**

## Performance

- **Duration:** ~6 min (including user verification)
- **Started:** 2026-02-03T21:02:00Z (approx)
- **Completed:** 2026-02-03T21:08:07Z
- **Tasks:** 4 (3 auto + 1 checkpoint)
- **Files modified:** 1

## Accomplishments

- PermissionUI module with centralized role caching and permission matrix
- Four-tier permission system (owner > partner > accountant > gestor)
- Accountant restrictions: cannot delete anything, cannot create/edit invoices or clients
- Gestor restrictions: view and export only, read-only banner displayed
- data-permission attribute system for declarative UI element gating
- withPermission() async wrapper for programmatic permission enforcement
- Entity list filters by accessible entities (PERM-04)
- Role badges in entity switcher for shared entities
- Role indicator in header showing current permission level
- User-verified all authentication and permission flows working correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Add PermissionUI helper module** - `da52869` (feat)
2. **Task 2: Apply permission attributes to existing UI elements** - `f877736` (feat)
3. **Task 3: Filter entity list by accessible entities** - `d7643e4` (feat)
4. **Task 4: Human verification checkpoint** - User approved

## Files Modified

- `autonomo_dashboard.html` - Added:
  - PermissionUI module with PERMISSIONS matrix and ACCOUNTANT_RESTRICTIONS
  - Permission-related CSS (`.permission-disabled`, `.role-indicator`, `.read-only-banner`)
  - Role indicator span in header area
  - Read-only banner HTML for gestor notification
  - data-permission and data-permission-type attributes on action buttons
  - withPermission() wrapper function
  - Entity list filtering via EntityAccessManager.getAccessibleEntities()
  - Role badge rendering in entity switcher items
  - PermissionUI.init() in initialization sequence

## Decisions Made

1. **Role caching** - PermissionUI caches currentEntityRole to avoid repeated async lookups during UI rendering
2. **Disable vs hide** - Interactive elements (buttons, inputs) are disabled rather than hidden to show permission awareness
3. **Offline mode bypass** - Full permissions granted in offline mode since data is local-only
4. **Accountant fine-grained** - Accountant can create/edit expenses (their primary function) but not invoices or clients
5. **Permission refresh** - EntityContext and AuthManager subscribers trigger automatic permission re-evaluation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed established patterns from AuthUI/ProfileUI.

## Requirements Implemented

- **PERM-04:** User sees only entities they own or have been granted access to
- **PERM-06:** Accountant role cannot delete invoices/expenses (only edit expenses)
- **PERM-07:** Gestor role can view and export reports but not modify data

## Phase 14 Complete Summary

**All 6 plans in Phase 14 successfully completed:**

| Plan | Deliverable | Status |
|------|-------------|--------|
| 14-01 | DB schema v2, ProfileManager, EntityShareManager, InvitationManager, SessionManager | Complete |
| 14-02 | Supabase client, AuthManager (magic link, OAuth, password reset), EntityAccessManager | Complete |
| 14-03 | Login screen UI, AuthUI controller, User menu, Profile page | Complete |
| 14-04 | MFAManager, MFAUI, SessionsUI, 2FA profile toggle | Complete |
| 14-05 | Invite modal, InviteUI, SharingUI, team access section | Complete |
| 14-06 | PermissionUI, data-permission attributes, entity list filtering | Complete |

**All AUTH requirements implemented:**
- AUTH-01: Magic link authentication
- AUTH-02: Google OAuth integration
- AUTH-03: "Continue without sign in" offline mode
- AUTH-04: User profile with NIF/CIF validation
- AUTH-05: TOTP 2FA enrollment
- AUTH-06: Active sessions management

**All PERM requirements implemented:**
- PERM-01: Entity owner can create invitation with role
- PERM-02: Invitation via email link or shareable code
- PERM-03: Invited user can accept and gain access
- PERM-04: User sees only accessible entities
- PERM-05: Owner can revoke user access
- PERM-06: Accountant cannot delete (only edit expenses)
- PERM-07: Gestor can view and export but not modify

## User Setup Required

**Supabase configuration required for full functionality:**

1. Set `SUPABASE_CONFIG.url` and `SUPABASE_CONFIG.anonKey` in autonomo_dashboard.html
2. Configure Google OAuth provider in Supabase dashboard
3. Enable MFA (TOTP) in Supabase authentication settings

**Without configuration:** App works in offline mode with full local permissions.

## Next Phase Readiness

**Phase 14 Authentication & Permissions fully complete.**

**Ready for Phase 15+:**
- Complete authentication flow (magic link, OAuth, offline)
- User profile management with NIF/CIF validation
- 2FA enrollment and verification
- Session management
- Entity sharing with role-based invitations
- Permission enforcement in UI

**No blockers.**

---
*Phase: 14-authentication-permissions*
*Plan: 06*
*Completed: 2026-02-03*
