# Phase 16: Calendar Enhancement - Research

**Researched:** 2026-02-04
**Domain:** Calendar management, work pattern scheduling, Google Calendar sync, data migration
**Confidence:** MEDIUM-HIGH

## Summary

Phase 16 enhances the existing v1.1 calendar from a simple localStorage-based Belgium presence tracker to a full-featured entity-scoped calendar with client tagging, expense linking, work patterns, and Google Calendar sync. The existing codebase has solid foundations: ICS export already works, the calendar_days IndexedDB table is defined but unused, and the v1.1 calendar has working month navigation, bulk selection, and 183-day tracking.

Key challenges include: (1) migrating localStorage data to entity-scoped IndexedDB, (2) implementing OAuth flow for Google Calendar in a single-file HTML app, (3) defining flexible work patterns that can be stored on projects, and (4) handling bidirectional sync conflicts. The recommended approach uses Google Identity Services (GIS) for OAuth, rrule.js for recurring patterns, and a "last-write-wins with manual override" conflict strategy.

**Primary recommendation:** Migrate to IndexedDB first (offline-first foundation), then layer on client tagging and work patterns, then add Google Calendar sync as the final feature since it requires external OAuth setup.

## Standard Stack

### Core (No External Libraries Needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS | ES2020+ | Calendar rendering, date manipulation | Project constraint - no frameworks |
| Dexie.js | Already in app | IndexedDB wrapper for calendar_days | Already integrated in Phase 12 |
| Blob API | Native | ICS/CSV file generation | Already working in v1.1 |

### For Google Calendar Sync (External Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Google Identity Services (GIS) | Latest | OAuth 2.0 token management | Google's recommended library for SPAs |
| Google API Client (gapi) | Latest | Calendar API calls | Required for Calendar API access |

### For Work Patterns (Optional Enhancement)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| rrule.js | 2.8+ | Recurring pattern generation | If complex patterns needed beyond Mon-Tue |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GIS OAuth | Manual implicit flow | GIS handles FedCM, token refresh prompts, more secure |
| rrule.js | Custom pattern logic | Custom is simpler for basic Mon-Tue patterns, rrule better for arbitrary recurrence |
| Full bidirectional sync | One-way export to GCal | Export is simpler but user asked for bidirectional |

**Installation (if using rrule.js):**
```html
<!-- CDN for single-file HTML -->
<script src="https://cdn.jsdelivr.net/npm/rrule@2.8.1/dist/es5/rrule.min.js"></script>
```

**Installation (for Google Calendar sync):**
```html
<!-- Google Identity Services -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
<!-- Google API Client -->
<script src="https://apis.google.com/js/api.js" async defer></script>
```

## Architecture Patterns

### Recommended Data Structure for calendar_days

```javascript
// IndexedDB calendar_days table (already defined in schema)
{
  id: 1,                          // Auto-increment
  entity_id: 1,                   // Scoped to business entity
  date: '2026-02-15',             // ISO date key
  location: 'belgium',            // 'belgium' | 'spain' | 'travel' | 'other'
  client_id: 5,                   // FK to clients table (nullable)
  project_id: 12,                 // FK to projects table (nullable)
  notes: 'Client meeting in Brussels',
  gcal_event_id: 'abc123...',     // Google Calendar event ID for sync
  gcal_sync_status: 'synced',     // 'synced' | 'pending' | 'conflict'
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-15T08:30:00Z'
}
```

### Pattern 1: Work Pattern Template Storage

**What:** Store recurring work patterns on the project record
**When to use:** When a project has a predictable schedule (e.g., "Mon-Tue every week")

```javascript
// projects table extension (add to schema)
{
  // ... existing project fields
  work_pattern: {
    type: 'weekly',              // 'weekly' | 'monthly' | 'custom'
    days: [1, 2],                // Day of week (1=Mon, 2=Tue)
    first_week_extra: [3, 4, 5], // Optional: extra days first week of month
    location: 'belgium',          // Default location for pattern days
    active: true                  // Can be toggled off without deleting
  }
}
```

### Pattern 2: Day Editor Modal

**What:** Click-to-edit modal for individual calendar days
**When to use:** For tagging days with client, project, location, and notes

```javascript
// Day editor state management
function openDayEditor(dateKey) {
  const dayData = await CalendarManager.getDay(dateKey) || {};

  modal.show({
    date: dateKey,
    location: dayData.location || 'unset',
    client_id: dayData.client_id || null,
    project_id: dayData.project_id || null,
    notes: dayData.notes || '',
    linkedExpenses: await ExpenseManager.getByDate(dateKey)
  });
}
```

### Pattern 3: Google Calendar Sync Flow

**What:** Bidirectional sync with conflict detection
**When to use:** For CALENDAR-15/16 requirements

```javascript
// Sync architecture
const GCalSync = {
  // Token management
  tokenClient: null,
  accessToken: null,

  // Initialize OAuth
  async init(clientId) {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response) => this.handleTokenResponse(response)
    });
  },

  // Request authorization (user gesture required)
  authorize() {
    this.tokenClient.requestAccessToken();
  },

  // Sync strategy: app calendar wins, external events read-only
  async sync() {
    // 1. Push local changes to GCal
    const localChanges = await this.getLocalChanges();
    for (const change of localChanges) {
      await this.pushToGCal(change);
    }

    // 2. Pull GCal events (mark as external/read-only)
    const gcalEvents = await this.pullFromGCal();
    for (const event of gcalEvents) {
      await this.importAsReadOnly(event);
    }
  }
};
```

### Pattern 4: localStorage to IndexedDB Migration

**What:** One-time migration of v1.1 calendar data
**When to use:** On first load after upgrade

```javascript
// Migration function
async function migrateCalendarToIndexedDB() {
  const MIGRATION_KEY = 'calendar_migrated_v2';

  // Check if already migrated
  if (localStorage.getItem(MIGRATION_KEY)) return;

  // Load old data
  const oldData = localStorage.getItem('autonomo_calendar_v1');
  if (!oldData) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return;
  }

  const parsed = JSON.parse(oldData);
  const entityId = EntityContext.entityId;

  // Migrate each day
  const operations = Object.entries(parsed.days || {}).map(([dateKey, dayData]) => ({
    entity_id: entityId,
    date: dateKey,
    location: dayData.status === 'unset' ? null : dayData.status,
    client_id: null,  // No client data in v1
    project_id: null,
    notes: dayData.contracted ? 'Contracted day (migrated from v1)' : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  // Bulk insert
  await db.calendar_days.bulkPut(operations);

  // Mark migrated
  localStorage.setItem(MIGRATION_KEY, 'true');
}
```

### Anti-Patterns to Avoid

- **Don't keep dual storage:** Once migrated to IndexedDB, stop writing to localStorage for calendar data
- **Don't auto-sync without consent:** Google Calendar sync must be explicitly enabled by user
- **Don't store OAuth tokens in localStorage:** GIS handles token management; tokens live in memory only
- **Don't sync while offline:** Queue sync operations; only execute when online
- **Don't overwrite user edits with GCal data:** App calendar always wins for locally-created events

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth 2.0 flow | Manual redirect/callback handling | Google Identity Services (GIS) | Handles FedCM, PKCE, token refresh, security |
| ICS generation | String concatenation | Keep existing generateICS() | Already working, RFC 5545 compliant |
| Recurring dates | Manual date loops | rrule.js (optional) | Handles edge cases (DST, month boundaries) |
| Date manipulation | Raw Date objects | toISODateKey() already exists | Avoids timezone bugs |
| Conflict resolution | Complex merge logic | Last-write-wins + manual flag | Simple, predictable, user-controlled |

**Key insight:** Google Calendar API complexity is in authentication, not the API calls themselves. Use GIS to handle the hard parts.

## Common Pitfalls

### Pitfall 1: OAuth Token Expiration Mid-Session
**What goes wrong:** User starts sync, token expires, API calls fail silently
**Why it happens:** Access tokens only last 1 hour; no refresh tokens in browser flow
**How to avoid:** Check token validity before each sync; re-request if expired; handle 401 errors gracefully
**Warning signs:** "Sync failed" errors after ~1 hour of usage

### Pitfall 2: Entity Scope Leakage in Migration
**What goes wrong:** Calendar data from one entity appears in another
**Why it happens:** Migration assigns all data to current entity without checking
**How to avoid:** Only migrate when user has selected their entity; mark migration per-entity
**Warning signs:** Days appearing that user didn't enter

### Pitfall 3: Work Pattern Overwrites Manual Edits
**What goes wrong:** User marks a day differently, pattern reapply resets it
**Why it happens:** Pattern application doesn't check for existing data
**How to avoid:** Patterns only fill empty days; user edits always take precedence
**Warning signs:** User complains "my changes keep disappearing"

### Pitfall 4: Google Calendar Sync Creates Duplicates
**What goes wrong:** Same day appears multiple times after sync
**Why it happens:** No stable ID linking local days to GCal events
**How to avoid:** Store gcal_event_id on each calendar_day record; use it for updates
**Warning signs:** Calendar shows duplicate entries for same date

### Pitfall 5: 183-Day Count Breaks After Migration
**What goes wrong:** Threshold warnings stop working or show wrong numbers
**Why it happens:** New IndexedDB query doesn't match old counting logic
**How to avoid:** Write comprehensive tests for calculateCounts() against both storage backends
**Warning signs:** Warning banner shows different number than before migration

### Pitfall 6: Year Navigation Breaks Multi-Year Support
**What goes wrong:** Can't navigate from Dec 2026 to Jan 2027
**Why it happens:** startMonth/endMonth are 0-11, not year-aware
**How to avoid:** Change to year+month tuple or absolute month index
**Warning signs:** "Next" button disabled at year boundary

## Code Examples

### Calendar Day CRUD Operations

```javascript
// Source: Based on existing DataManager pattern in codebase
const CalendarManager = {
  /**
   * Get or create a calendar day record
   */
  async getDay(dateKey) {
    const entityId = EntityContext.entityId;
    return db.calendar_days
      .where('[entity_id+date]')
      .equals([entityId, dateKey])
      .first();
  },

  /**
   * Save calendar day (upsert pattern)
   */
  async saveDay(dateKey, data) {
    const entityId = EntityContext.entityId;
    const existing = await this.getDay(dateKey);

    const record = {
      entity_id: entityId,
      date: dateKey,
      location: data.location || null,
      client_id: data.client_id || null,
      project_id: data.project_id || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      await db.calendar_days.update(existing.id, record);
    } else {
      record.created_at = new Date().toISOString();
      await db.calendar_days.add(record);
    }
  },

  /**
   * Get days for a month (for rendering)
   */
  async getDaysForMonth(year, month) {
    const entityId = EntityContext.entityId;
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    return db.calendar_days
      .where('entity_id').equals(entityId)
      .and(d => d.date >= startDate && d.date <= endDate)
      .toArray();
  },

  /**
   * Calculate presence counts (183-day tracking)
   */
  async calculateCounts() {
    const entityId = EntityContext.entityId;
    const days = await db.calendar_days
      .where('entity_id').equals(entityId)
      .toArray();

    let belgium = 0, spain = 0, travel = 0;
    days.forEach(d => {
      if (d.location === 'belgium') belgium++;
      else if (d.location === 'spain') spain++;
      else if (d.location === 'travel') travel++;
    });

    return {
      annualBelgium: belgium,
      annualSpain: spain,
      annualTravel: travel,
      annualThreshold: belgium + travel  // Both count toward 183
    };
  }
};
```

### Google Identity Services Token Request

```javascript
// Source: https://developers.google.com/identity/oauth2/web/guides/use-token-model
const GCalAuth = {
  tokenClient: null,
  accessToken: null,

  init(clientId) {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response) => {
        if (response.error) {
          console.error('OAuth error:', response.error);
          return;
        }
        this.accessToken = response.access_token;
        // Token obtained, can now make API calls
        this.onAuthorized();
      }
    });
  },

  // Must be called from user gesture (click handler)
  authorize() {
    this.tokenClient.requestAccessToken();
  },

  onAuthorized() {
    // Enable sync button, start initial sync, etc.
    document.getElementById('gcalSyncBtn').disabled = false;
  }
};
```

### Work Pattern Application

```javascript
// Apply work pattern to calendar (respects existing entries)
async function applyWorkPattern(project, startDate, endDate) {
  const pattern = project.work_pattern;
  if (!pattern || !pattern.active) return;

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = toISODateKey(d);
    const dayOfWeek = d.getDay();  // 0=Sun, 1=Mon, etc.

    // Check if this day matches pattern
    const isPatternDay = pattern.days.includes(dayOfWeek === 0 ? 7 : dayOfWeek);

    // Check for first-week extra days
    const isFirstWeek = d.getDate() <= 7;
    const isExtraDay = isFirstWeek && pattern.first_week_extra?.includes(dayOfWeek === 0 ? 7 : dayOfWeek);

    if (isPatternDay || isExtraDay) {
      // Only fill if day is empty
      const existing = await CalendarManager.getDay(dateKey);
      if (!existing || !existing.location) {
        await CalendarManager.saveDay(dateKey, {
          location: pattern.location || 'belgium',
          client_id: project.client_id,
          project_id: project.id,
          notes: 'Auto-filled from work pattern'
        });
      }
    }
  }
}
```

### ICS Export with Client Tags (Enhanced)

```javascript
// Enhanced ICS generation with client information
function generateEnhancedICS(days) {
  const events = days
    .filter(d => d.location && d.location !== 'unset')
    .map(d => {
      const date = new Date(d.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const locationText = {
        belgium: 'Belgium Work Day',
        spain: 'Spain',
        travel: 'Travel Day',
        other: 'Other'
      }[d.location];

      const clientName = d.client_name ? ` - ${d.client_name}` : '';
      const projectName = d.project_name ? ` (${d.project_name})` : '';

      return `BEGIN:VEVENT
UID:${d.date}-${d.entity_id}@autonomo-calculator
DTSTAMP:${formatICSTimestamp(new Date())}
DTSTART;VALUE=DATE:${d.date.replace(/-/g, '')}
DTEND;VALUE=DATE:${toISODateKey(nextDay).replace(/-/g, '')}
SUMMARY:${locationText}${clientName}${projectName}
DESCRIPTION:${d.notes || locationText}
END:VEVENT`;
    });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Autonomo Tax Calculator//Work Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Work Calendar
${events.join('\n')}
END:VCALENDAR`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Implicit OAuth flow | GIS tokenClient | 2022 | More secure, handles FedCM transition |
| Store refresh tokens | Stateless tokens | 2023 | Tokens not persisted, re-auth on expiry |
| localStorage for calendar | IndexedDB (Dexie) | 2024 | Better query performance, larger storage |
| Manual ICS generation | Keep existing approach | N/A | RFC 5545 spec unchanged, existing code works |

**Deprecated/outdated:**
- **Google Sign-In library (gapi.auth2):** Deprecated 2023, replaced by GIS
- **Implicit flow without PKCE:** Still works but GIS handles this automatically
- **FullCalendar library:** Overkill for this use case; vanilla JS calendar already exists

## Open Questions

1. **Google Cloud Project Setup**
   - What we know: Need Client ID from Google Cloud Console
   - What's unclear: Who creates this? User or app developer?
   - Recommendation: Document setup steps for users; consider making GCal sync optional/disabled by default

2. **Conflict Resolution UX**
   - What we know: App calendar wins per requirement CALENDAR-16
   - What's unclear: How to display external events as "read-only suggestions"?
   - Recommendation: Show external events with different styling (gray, dotted border); clicking shows "This event is from Google Calendar" message

3. **Multi-Entity Calendar Separation**
   - What we know: Each entity has separate calendar_days records
   - What's unclear: Can same day have entries for multiple entities?
   - Recommendation: Yes, allow multiple - user might do consulting for two business entities on same day

4. **Expense Linking Implementation**
   - What we know: CALENDAR-11 requires linking expenses to calendar days
   - What's unclear: Is this a join table or foreign key on expense?
   - Recommendation: Add `calendar_date` field to expenses table; query by date when displaying day

## Sources

### Primary (HIGH confidence)
- Google OAuth 2.0 Token Model: https://developers.google.com/identity/oauth2/web/guides/use-token-model
- Google Calendar API Sync: https://developers.google.com/workspace/calendar/api/guides/sync
- Google Calendar API Scopes: https://developers.google.com/workspace/calendar/api/auth
- Existing codebase: autonomo_dashboard.html lines 7840-8920 (v1.1 calendar implementation)
- Existing schema: autonomo_dashboard.html lines 12190-12300 (IndexedDB calendar_days table)

### Secondary (MEDIUM confidence)
- rrule.js GitHub: https://github.com/jkbrzt/rrule
- iCal format libraries: https://github.com/adamgibbons/ics
- Bidirectional sync patterns: https://calendhub.com/blog/implement-bidirectional-calendar-sync-2025/

### Tertiary (LOW confidence - needs validation)
- FedCM migration timeline (affects OAuth): https://developers.googleblog.com/en/updates-to-google-identity-services-gis-and-migration-to-the-credential-manager-api/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing codebase patterns verified, Google docs authoritative
- Architecture: MEDIUM-HIGH - Based on existing code patterns, Google sync requires user setup
- Pitfalls: MEDIUM - Common issues identified from docs, real-world sync requires testing
- Multi-year support: MEDIUM - Year boundary navigation needs careful implementation

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, but GCal API changes should be monitored)
