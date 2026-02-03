# Phase 14: Authentication & Permissions - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Secure multi-user access with role-based permissions per entity. Users can sign up, log in (magic link or Google), enable 2FA, and manage sessions. Entity owners invite users with specific roles (Gestor/Accountant/Partner). Invited users see only entities they have access to, with permissions enforced based on role.

</domain>

<decisions>
## Implementation Decisions

### Auth Provider Strategy
- Use Supabase Auth (already in stack)
- Primary method: Magic link (passwordless)
- Social login: Google only
- Unauthenticated users: Redirect immediately to login page (no landing/preview)

### Role Definitions
- **Gestor (read-only):** Can view everything, export all visible data (reports, invoices, expenses). Cannot modify anything.
- **Accountant (read-write):** View clients only (no create/edit). No invoice creation — can only view invoices. Works primarily on categorizing expenses, reconciliation.
- **Partner (full admin):** Full data access. Can invite users, change roles, manage everything except delete the entity itself. Same as owner minus entity deletion.
- **Owner (implicit):** Entity creator. Full admin plus can delete entity and transfer ownership.

### Invitation Flow
- Two methods available: email invitation link OR shareable code
- Invitations expire after 7 days
- Users can belong to unlimited entities (with potentially different roles)
- New users (no account): Invite link leads to signup flow, then auto-joins entity after account creation

### Session & Security UX
- 2FA: TOTP app only (Google Authenticator, Authy, etc.)
- Session duration: Never expires (logout manually or on new device)
- Active sessions: Visible list showing all devices, with remote logout capability
- Failed login: Account lockout after 5 failed attempts (15-minute lockout)

### Claude's Discretion
- Login page design and branding
- Email templates for magic links and invitations
- Session metadata stored (device name, location, last active)
- Exact 2FA enrollment flow
- Password recovery flow (if user loses TOTP device)

</decisions>

<specifics>
## Specific Ideas

- Magic link is preferred because business users (gestors, accountants) often forget passwords
- Google login covers the Spanish SME ecosystem where Gmail is common
- Accountant role is intentionally restrictive — they should categorize and verify, not create business data
- Partner role exists for SL socios who need full visibility but aren't the primary admin

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-authentication-permissions*
*Context gathered: 2026-02-03*
