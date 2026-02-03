---
phase: 14-authentication-permissions
plan: 02
subsystem: auth
tags: [supabase, magic-link, oauth, google, session, permissions, entity-access]

# Dependency graph
requires:
  - phase: 14-01
    provides: Database schema with profiles, entity_shares, entity_invitations, user_sessions tables; owner_id column on entities
provides:
  - Supabase client initialization with offline-mode fallback
  - AuthManager module for magic link, Google OAuth, password reset
  - EntityAccessManager for ownership and permission checks
  - Auth state persistence and session tracking
  - Automatic owner_id assignment on entity creation
affects: [14-03 (login UI), 15 (entity sharing UI), 16 (permission enforcement)]

# Tech tracking
tech-stack:
  added: ["@supabase/supabase-js@2 (CDN)"]
  patterns: ["Auth state listener subscription pattern", "Graceful degradation to offline mode", "Permission matrix by role"]

key-files:
  created: []
  modified: ["autonomo_dashboard.html"]

key-decisions:
  - "Supabase CDN integration for single-file HTML architecture"
  - "Graceful degradation: auth features disabled when SUPABASE_CONFIG empty"
  - "Permission matrix: owner > partner > accountant > gestor"
  - "New entities get owner_id from current authenticated user"
  - "OrphanedEntities claimed on first auth for v1-to-v2 migration"

patterns-established:
  - "AuthManager.getUser()?.id pattern for current user access"
  - "Role-based permission checking via EntityAccessManager.canPerformAction()"
  - "Auth state change listeners via AuthManager.onAuthStateChange()"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 14 Plan 02: Auth Client Integration Summary

**Supabase Auth client with magic link, Google OAuth, password reset, and EntityAccessManager for role-based entity permission checks**

## Performance

- **Duration:** 2 min 24 sec
- **Started:** 2026-02-03T20:13:07Z
- **Completed:** 2026-02-03T20:15:31Z
- **Tasks:** 3 (Task 2 consolidated into Task 1)
- **Files modified:** 1

## Accomplishments

- Supabase client initialization with graceful offline-mode fallback
- AuthManager module with magic link (signInWithOtp), Google OAuth (signInWithOAuth), and password reset flows
- EntityAccessManager with role-based permission matrix (owner/partner/accountant/gestor)
- Automatic owner_id assignment when creating new entities
- Orphaned entity claiming for v1-to-v2 migration compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Supabase client and AuthManager module** - `be1e7f7` (feat)
   - Included password reset methods (Task 2 scope consolidated)
2. **Task 3: Add EntityAccessManager and owner_id injection** - `6cb7184` (feat)

_Note: Task 2 (password reset) was consolidated into Task 1 as a logical unit of AuthManager functionality._

## Files Created/Modified

- `autonomo_dashboard.html` - Added:
  - Supabase CDN script (`@supabase/supabase-js@2`)
  - SUPABASE_CONFIG constant for project URL and anon key
  - initializeSupabase() function with offline fallback
  - AuthManager module (magic link, Google OAuth, password reset, session management)
  - EntityAccessManager module (permission checks, ownership)
  - owner_id assignment in EntityManager.createEntity()
  - Step 0 in initializeDatabase() for auth initialization

## Decisions Made

1. **Consolidated Task 2 into Task 1** - Password reset methods are logically part of AuthManager, so included them in the initial module rather than a separate commit
2. **Graceful degradation pattern** - App works fully in offline mode when SUPABASE_CONFIG is empty; auth features simply disabled
3. **Permission matrix** - Four roles with increasing privileges:
   - `gestor`: view, export (read-only for fiscal advisors)
   - `accountant`: view, edit, create, export (no delete/invite)
   - `partner`: view, edit, create, delete, invite, manage, archive_entity, export
   - `owner`: full permissions including delete_entity
4. **owner_id nullable** - New entities get owner_id from current user, or null if not authenticated (supports offline creation)

## Deviations from Plan

None - plan executed as specified. Task 2 was consolidated into Task 1 for cleaner commit structure but all functionality was implemented.

## User Setup Required

**External services require manual configuration.** Before authentication will work:

1. **Supabase Project Setup:**
   - Create project at supabase.com
   - Get Project URL from: Dashboard > Project Settings > API
   - Get anon public key from: Dashboard > Project Settings > API

2. **Environment Configuration:**
   - Edit `SUPABASE_CONFIG` in autonomo_dashboard.html:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://your-project.supabase.co',
     anonKey: 'your-anon-key'
   };
   ```

3. **Supabase Dashboard Configuration:**
   - Authentication > Providers > Email: Enable, enable Magic Link
   - Authentication > Providers > Google: Enable, configure OAuth credentials
   - Authentication > URL Configuration: Set Site URL and Redirect URLs

4. **Verification:**
   - Open console: should see "Supabase client initialized"
   - `AuthManager.isOfflineMode()` should return `false`

## Issues Encountered

None - implementation straightforward following Supabase Auth patterns from research.

## Next Phase Readiness

**Ready for 14-03 (Login UI):**
- AuthManager.signInWithMagicLink() ready for email input
- AuthManager.signInWithGoogle() ready for OAuth button
- AuthManager.isAuthenticated() ready for conditional UI
- AuthManager.signOut() ready for logout button
- EntityAccessManager ready for permission-aware UI elements

**Blockers:**
- None

---
*Phase: 14-authentication-permissions*
*Plan: 02*
*Completed: 2026-02-03*
