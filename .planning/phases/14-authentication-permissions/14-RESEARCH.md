# Phase 14: Authentication & Permissions - Research

**Researched:** 2026-02-03
**Domain:** Supabase Auth, Row-Level Security, Multi-Tenant Entity Access Control
**Confidence:** HIGH

## Summary

This phase implements multi-user authentication and role-based entity permissions using Supabase Auth (already in the project stack from v2.0 decisions). The research confirms that Supabase Auth provides all required capabilities: magic link (passwordless), Google OAuth, TOTP-based 2FA, and session management. Row-Level Security (RLS) at the PostgreSQL level is the recommended approach for enforcing entity-level permissions.

Key findings:
1. **Supabase Auth** handles authentication natively with magic links via `signInWithOtp()`, Google OAuth via `signInWithOAuth()`, and TOTP MFA via the `supabase.auth.mfa.*` API
2. **Custom Access Token Hooks** can inject role claims into JWTs for efficient RLS policy checks
3. **Entity sharing** requires a custom `entity_shares` junction table with RLS policies - Supabase does not provide built-in team/organization invitation features
4. **Invitation system** must be custom-built using Edge Functions and the admin API or SECURITY DEFINER functions for anonymous invite token validation

**Primary recommendation:** Use Supabase Auth for all authentication (magic link primary, Google OAuth secondary), implement TOTP 2FA via built-in MFA API, create custom `entity_shares` table with RLS policies for permission enforcement, and build invitation flow using a combination of Edge Functions and database triggers.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.x | Auth client, RLS-aware queries | Already in stack (v2.0 decision) |
| Supabase Auth | GoTrue | Magic link, OAuth, MFA, sessions | Built-in, no additional dependencies |
| PostgreSQL RLS | Native | Row-level permission enforcement | Database-level security, cannot be bypassed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jose | 6.x | JWT verification in Edge Functions | When validating JWTs server-side |
| jwt-decode | 4.x | Decode JWT claims in client | When reading role from access token |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | Auth0, Clerk | Additional cost, not integrated with Supabase RLS |
| Magic link | Password auth | User decided magic link is preferred (CONTEXT.md) |
| TOTP MFA | SMS MFA | User decided TOTP only (CONTEXT.md), SMS has costs |

**Installation:**
```bash
# No additional packages needed - Supabase client already installed
npm install jwt-decode  # Optional: for client-side JWT inspection
```

## Architecture Patterns

### Recommended Database Schema

```sql
-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  nif_cif TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity sharing/permissions
CREATE TABLE public.entity_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('gestor', 'accountant', 'partner')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(entity_id, user_id)
);

-- Entity invitations (pending, not yet accepted)
CREATE TABLE public.entity_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  email TEXT,  -- NULL if using invite code
  invite_code TEXT UNIQUE,  -- NULL if using email
  role TEXT NOT NULL CHECK (role IN ('gestor', 'accountant', 'partner')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id)
);

-- Active sessions tracking (custom, supplements auth.sessions)
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT,
  user_agent TEXT,
  ip_address TEXT,
  location TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pattern 1: RLS Policy for Entity Access
**What:** Users see only entities they own or have been granted access to
**When to use:** All entity-scoped tables (clients, invoices, expenses, calendar)
**Example:**
```sql
-- Source: Supabase RLS documentation
-- Add owner_id to entities table
ALTER TABLE entities ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- RLS policy: User can access entity if owner OR has share
CREATE POLICY "Users access own or shared entities"
ON entities FOR SELECT
TO authenticated
USING (
  owner_id = (SELECT auth.uid())
  OR id IN (
    SELECT entity_id FROM entity_shares
    WHERE user_id = (SELECT auth.uid())
    AND accepted_at IS NOT NULL
  )
);
```

### Pattern 2: Role-Based Action Restrictions
**What:** Different roles have different write permissions
**When to use:** When enforcing Gestor (read-only) vs Accountant (no delete) vs Partner (full)
**Example:**
```sql
-- Source: Supabase RBAC documentation
-- Function to check user's role for an entity
CREATE OR REPLACE FUNCTION public.get_entity_role(p_entity_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if owner
  SELECT 'owner' INTO v_role
  FROM entities
  WHERE id = p_entity_id AND owner_id = (SELECT auth.uid());

  IF v_role IS NOT NULL THEN
    RETURN v_role;
  END IF;

  -- Check entity_shares
  SELECT role INTO v_role
  FROM entity_shares
  WHERE entity_id = p_entity_id
    AND user_id = (SELECT auth.uid())
    AND accepted_at IS NOT NULL;

  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy: Only owner/partner can delete
CREATE POLICY "Only owner and partner can delete invoices"
ON invoices FOR DELETE
TO authenticated
USING (
  (SELECT get_entity_role(entity_id)) IN ('owner', 'partner')
);

-- Policy: Gestor cannot modify (SELECT only)
CREATE POLICY "Gestor can only read"
ON invoices FOR UPDATE
TO authenticated
USING (
  (SELECT get_entity_role(entity_id)) IN ('owner', 'partner', 'accountant')
);
```

### Pattern 3: Invitation Token Validation via SECURITY DEFINER
**What:** Allow unauthenticated users to validate invite tokens
**When to use:** When invited user clicks link before creating account
**Example:**
```sql
-- Source: boardshape.com RLS team invite pattern
CREATE OR REPLACE FUNCTION public.get_invitation(p_invite_code TEXT)
RETURNS SETOF entity_invitations
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM entity_invitations
  WHERE invite_code = p_invite_code
    AND used_at IS NULL
    AND expires_at > NOW();
$$;
```

### Anti-Patterns to Avoid
- **Storing role in user_metadata:** Can be modified by user, use app_metadata or dedicated table
- **Checking permissions in frontend only:** Always enforce with RLS at database level
- **Using SELECT * in RLS policies:** Performance impact, use specific columns
- **Forgetting to wrap auth.uid() in SELECT:** Missing optimization causes per-row evaluation

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Magic link authentication | Custom email tokens | `supabase.auth.signInWithOtp()` | Handles expiry, rate limits, PKCE |
| Google OAuth | Custom OAuth flow | `supabase.auth.signInWithOAuth({provider: 'google'})` | Token management, refresh, identity linking |
| TOTP 2FA | Custom TOTP library | `supabase.auth.mfa.*` API | QR generation, verification, factor management |
| Session persistence | localStorage tokens | Supabase client auto-manages | Secure refresh, cross-tab sync |
| JWT verification | Manual HMAC | Supabase JWKS or jose library | Handles key rotation automatically |
| Password hashing | bcrypt/argon2 | Supabase Auth handles internally | Never store raw passwords |

**Key insight:** Authentication has too many security edge cases (timing attacks, token leakage, session fixation) to implement safely. Supabase Auth handles these by default.

## Common Pitfalls

### Pitfall 1: RLS Not Enabled on Tables
**What goes wrong:** Data exposed to all authenticated users
**Why it happens:** Forgetting to enable RLS after creating tables
**How to avoid:** Always run `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY` after CREATE
**Warning signs:** Users seeing other users' data in development

### Pitfall 2: Using user_metadata for Authorization
**What goes wrong:** Users can modify their own permissions
**Why it happens:** Confusion between `raw_user_meta_data` and `raw_app_meta_data`
**How to avoid:** Store roles in dedicated table with RLS, or use Custom Access Token Hook for app_metadata
**Warning signs:** Console shows user can edit metadata fields

### Pitfall 3: auth.uid() Performance in RLS Policies
**What goes wrong:** Queries become slow with large datasets
**Why it happens:** `auth.uid()` evaluated per-row instead of once per query
**How to avoid:** Wrap in SELECT: `(SELECT auth.uid())` not just `auth.uid()`
**Warning signs:** Dashboard queries taking >500ms

### Pitfall 4: Trigger Failures Blocking Signup
**What goes wrong:** Users cannot register, no error message
**Why it happens:** Profile trigger throws exception on required field
**How to avoid:** Make all profile fields nullable, validate separately
**Warning signs:** Signup API returns 500, no user created

### Pitfall 5: Invitation Link Expiry Not Enforced
**What goes wrong:** Old invitations remain valid indefinitely
**Why it happens:** Only checking expiry in application code, not database
**How to avoid:** Add `expires_at > NOW()` to RLS policy and SECURITY DEFINER functions
**Warning signs:** Expired invitations still work

### Pitfall 6: MFA Not Enforced After Enrollment
**What goes wrong:** Users can skip 2FA after setting it up
**Why it happens:** Only checking MFA status in UI, not RLS
**How to avoid:** Add AAL2 check to sensitive RLS policies: `(SELECT auth.jwt()->>'aal') = 'aal2'`
**Warning signs:** User can access sensitive data without completing MFA challenge

## Code Examples

Verified patterns from official sources:

### Magic Link Sign In
```typescript
// Source: Supabase Auth docs - auth-email-passwordless
async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,  // Allow new signups
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return { success: true, message: 'Check your email for the login link' };
}
```

### Google OAuth Sign In
```typescript
// Source: Supabase Auth docs - auth-google
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  // User will be redirected to Google, then back to redirectTo
}
```

### OAuth Callback Handler
```typescript
// Source: Supabase Auth docs - auth-google callback
async function handleAuthCallback() {
  const { searchParams } = new URL(window.location.href);
  const code = searchParams.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback error:', error);
      // Redirect to login with error
    }
    // Redirect to dashboard
  }
}
```

### TOTP MFA Enrollment
```typescript
// Source: Supabase Auth docs - auth-mfa/totp
async function enrollMFA() {
  // Step 1: Enroll - get QR code
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Authenticator App',
  });

  if (error) throw error;

  // data.totp contains: qr_code (SVG data URI), secret (for manual entry), uri
  return {
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
  };
}

async function verifyMFAEnrollment(factorId: string, code: string) {
  // Step 2: Challenge and verify
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) throw error;
  // Factor is now active
}
```

### MFA Login Challenge
```typescript
// Source: Supabase Auth docs - auth-mfa/totp
async function checkAndChallengeMFA() {
  // Check if MFA is required
  const { data: { currentLevel, nextLevel } } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (currentLevel === 'aal1' && nextLevel === 'aal2') {
    // MFA enrolled but not verified for this session
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors.totp[0];

    if (totpFactor) {
      // Show MFA verification UI
      return { requiresMFA: true, factorId: totpFactor.id };
    }
  }

  return { requiresMFA: false };
}

async function verifyMFAChallenge(factorId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) throw error;
  // Session upgraded to AAL2
}
```

### Session Sign Out
```typescript
// Source: Supabase Auth signOut documentation
async function signOut(scope: 'local' | 'global' | 'others' = 'local') {
  const { error } = await supabase.auth.signOut({ scope });

  // scope options:
  // 'local' - current device only (default)
  // 'global' - all devices/sessions
  // 'others' - all other devices, keep current

  if (error) throw error;
}
```

### Auto-Create Profile on Signup (Database Trigger)
```sql
-- Source: Supabase User Management docs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Entity Sharing with Role Check
```typescript
// Client-side: Invite user to entity
async function inviteUserToEntity(
  entityId: number,
  email: string,
  role: 'gestor' | 'accountant' | 'partner'
) {
  // Generate invite code for shareable link
  const inviteCode = crypto.randomUUID();

  const { data, error } = await supabase
    .from('entity_invitations')
    .insert({
      entity_id: entityId,
      email,
      invite_code: inviteCode,
      role,
      // invited_by populated by RLS default
    })
    .select()
    .single();

  if (error) throw error;

  // Return both email link and shareable code
  return {
    emailLink: `${window.location.origin}/invite?token=${inviteCode}`,
    inviteCode,
  };
}
```

### Accept Invitation
```typescript
// Accept invitation after signup/login
async function acceptInvitation(inviteCode: string) {
  // Use RPC to safely accept (handles validation server-side)
  const { data, error } = await supabase.rpc('accept_entity_invitation', {
    p_invite_code: inviteCode,
  });

  if (error) throw error;
  return data;
}
```

```sql
-- Database function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_entity_invitation(p_invite_code TEXT)
RETURNS entity_shares
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation entity_invitations;
  v_share entity_shares;
BEGIN
  -- Get and validate invitation
  SELECT * INTO v_invitation
  FROM entity_invitations
  WHERE invite_code = p_invite_code
    AND used_at IS NULL
    AND expires_at > NOW();

  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Create entity_share
  INSERT INTO entity_shares (entity_id, user_id, role, invited_by, accepted_at)
  VALUES (v_invitation.entity_id, auth.uid(), v_invitation.role, v_invitation.invited_by, NOW())
  RETURNING * INTO v_share;

  -- Mark invitation as used
  UPDATE entity_invitations
  SET used_at = NOW(), used_by = auth.uid()
  WHERE id = v_invitation.id;

  RETURN v_share;
END;
$$;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Symmetric JWT secrets | Asymmetric JWT (JWKS) | 2025 | Use jose library with JWKS endpoint for Edge Functions |
| verify_jwt flag | Explicit JWT verification in code | 2025 | More control, must implement manually |
| Manual MFA libraries | Supabase built-in MFA API | 2024 | No need for speakeasy/otplib |
| app_metadata via client | Custom Access Token Hook | 2024 | Safer role injection into JWT |

**Deprecated/outdated:**
- `supabase.auth.api.*` methods replaced by `supabase.auth.admin.*`
- `supabase.auth.session()` replaced by `supabase.auth.getSession()`
- Legacy `anon`/`service_role` keys being replaced by publishable keys (migration ongoing)

## Open Questions

Things that couldn't be fully resolved:

1. **Session listing API availability**
   - What we know: `signOut({ scope: 'global' | 'others' })` exists for revoking sessions
   - What's unclear: Whether Supabase provides a list of active sessions via API (AUTH-06 requirement)
   - Recommendation: Implement custom `user_sessions` table updated via triggers/middleware; official session listing may require admin API or custom tracking

2. **Account lockout after failed attempts**
   - What we know: Supabase has rate limits (configurable via dashboard), lockout exists per documentation
   - What's unclear: Exact configuration for "5 attempts, 15-minute lockout" as specified in CONTEXT.md
   - Recommendation: Test rate limit configuration in Supabase dashboard; may need custom tracking for precise control

3. **Password recovery when TOTP lost**
   - What we know: Users can unenroll MFA factors, but need to be authenticated first
   - What's unclear: Recovery flow for users who lose TOTP device and can't login
   - Recommendation: Admin intervention via dashboard, or add backup email verification flow

## Sources

### Primary (HIGH confidence)
- [Supabase Auth TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp) - MFA enrollment, verification, AAL levels
- [Supabase Auth Magic Link](https://supabase.com/docs/guides/auth/auth-email-passwordless) - signInWithOtp, PKCE flow
- [Supabase Auth Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google) - OAuth setup, callback handling
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS policies, helper functions, performance
- [Supabase RBAC Custom Claims](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) - Custom Access Token Hook, authorize function
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data) - Profiles table, triggers

### Secondary (MEDIUM confidence)
- [Supabase Rate Limits](https://supabase.com/docs/guides/auth/rate-limits) - Email, OTP, verification limits
- [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth) - JWT verification with jose
- [BoardShape Team Invite RLS Pattern](https://boardshape.com/engineering/how-to-implement-rls-for-a-team-invite-system-with-supabase) - SECURITY DEFINER for anonymous invite validation
- [Supabase Admin inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail) - Admin invitation API

### Tertiary (LOW confidence)
- GitHub discussions on session management and multi-tenant patterns - needs validation against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Supabase Auth is already in project stack, APIs verified against official docs
- Architecture: HIGH - RLS patterns verified against official Supabase documentation
- Pitfalls: HIGH - Documented in official security advisors and community patterns
- Session management: MEDIUM - Custom tracking recommended, official API capabilities unclear
- Rate limiting: MEDIUM - Configurable but exact lockout behavior needs testing

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - Supabase Auth is stable)
