# Phase 4: Belgium Calendar - Research

**Researched:** 2026-02-01
**Domain:** Interactive calendar UI, date manipulation, localStorage persistence, export formats
**Confidence:** HIGH

## Summary

This phase implements an interactive calendar for Feb-Dec 2026 to track Belgium presence days with 183-day threshold awareness. The calendar allows users to mark days as Belgium/Spain/Travel, see automatic counts per month and annually, and receive tiered warnings as they approach or exceed the tax residency threshold.

The implementation uses vanilla JavaScript (no frameworks) consistent with the existing codebase. Key challenges include: calendar grid rendering with proper day-of-week alignment, state management with localStorage persistence, drag/shift-click range selection, contracted pattern pre-filling, and multi-format export (ICS, CSV, clipboard).

**Primary recommendation:** Build a single-month view calendar with prev/next navigation, using the existing dialog pattern for day status selection and the established localStorage pattern for persistence. Implement export using native Blob/createObjectURL APIs without external dependencies.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JavaScript | ES2020+ | Calendar logic, DOM manipulation | Project requirement (no frameworks) |
| HTML5 `<dialog>` | Native | Day status picker modal | Already used in Phase 3; native focus trap, Esc handling |
| localStorage | Web API | Calendar state persistence | Already used for expenses and scenarios |
| Blob API | Web API | File generation for export | Native, no dependencies needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.DateTimeFormat | Native | Month/day name formatting | Locale-aware date display |
| URL.createObjectURL | Web API | Download link generation | ICS and CSV export |
| structuredClone | Native | Deep copy of calendar state | Prevent mutation, same as existing patterns |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom calendar | flatpickr, Vanilla Calendar Pro | External dependency; project requires no frameworks |
| Custom date logic | Temporal API (ES2026) | Browser support still incomplete in early 2026 |
| Custom ICS generation | ics.js library | Adds dependency for simple text file format |

**Installation:**
No external packages required. All functionality uses native browser APIs.

## Architecture Patterns

### Recommended Data Structure
```javascript
// Calendar state structure (matches existing localStorage patterns)
const CALENDAR_STORAGE_KEY = 'autonomo_calendar_v1';

const DEFAULT_CALENDAR_STATE = Object.freeze({
  version: 1,
  year: 2026,
  startMonth: 1,  // February (0-indexed)
  endMonth: 11,   // December (0-indexed)
  days: {},       // { "2026-02-15": { status: "belgium", contracted: true } }
  contractedPatternApplied: false,
  lastModified: null
});

// Day status enum
const DAY_STATUS = Object.freeze({
  UNSET: 'unset',
  BELGIUM: 'belgium',
  SPAIN: 'spain',
  TRAVEL: 'travel'
});
```

### Pattern 1: ISO Date Keys for Day Storage
**What:** Use ISO 8601 date strings (YYYY-MM-DD) as object keys for day data
**When to use:** Always for calendar day storage
**Example:**
```javascript
// Source: Established pattern for date-keyed data
const days = {
  "2026-02-02": { status: "belgium", contracted: true },
  "2026-02-03": { status: "belgium", contracted: true },
  "2026-02-16": { status: "spain", contracted: false }
};

// Helper to create ISO key from Date object
function toISODateKey(date) {
  return date.toISOString().split('T')[0];
}
```

### Pattern 2: Month Grid Generation
**What:** Generate calendar grid with proper day-of-week alignment
**When to use:** Rendering monthly calendar view
**Example:**
```javascript
// Source: MDN Date API documentation
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week for first day (0=Sunday, adjust for Monday start)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

  const grid = [];
  let currentWeek = [];

  // Pad start of month with empty cells
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Fill in days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad end of month
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    grid.push(currentWeek);
  }

  return grid;
}
```

### Pattern 3: Contracted Pattern Generation
**What:** Generate contracted work pattern (Mon-Tue weekly, first-week Wed-Fri)
**When to use:** Initial calendar setup / pattern application
**Example:**
```javascript
// Source: User requirements from CONTEXT.md
function generateContractedPattern(year, startMonth, endMonth) {
  const contractedDays = [];

  for (let month = startMonth; month <= endMonth; month++) {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    let isFirstWeek = true;

    for (let day = 1; day <= lastOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.

      // Monday or Tuesday = always contracted
      if (dayOfWeek === 1 || dayOfWeek === 2) {
        contractedDays.push(toISODateKey(date));
      }

      // First week: Wed-Fri also contracted
      // "First week" = calendar week (Mon-Sun) containing days of this month
      if (isFirstWeek && (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5)) {
        contractedDays.push(toISODateKey(date));
      }

      // End of first week when we hit Sunday
      if (dayOfWeek === 0 && day > 1) {
        isFirstWeek = false;
      }
    }
  }

  return contractedDays;
}
```

### Pattern 4: Warning Threshold Logic
**What:** Multi-level warnings based on Belgium + Travel day count
**When to use:** Calculating and displaying 183-day warnings
**Example:**
```javascript
// Source: CONTEXT.md decisions
const WARNING_THRESHOLDS = Object.freeze({
  YELLOW: 170,   // Approaching threshold
  ORANGE: 180,   // Very close
  RED: 183       // At or exceeded
});

function getWarningLevel(belgiumDays, travelDays) {
  const total = belgiumDays + travelDays;  // Conservative approach

  if (total >= WARNING_THRESHOLDS.RED) return 'red';
  if (total >= WARNING_THRESHOLDS.ORANGE) return 'orange';
  if (total >= WARNING_THRESHOLDS.YELLOW) return 'yellow';
  return null;
}

function getWarningMessage(level, total) {
  const messages = {
    yellow: `Warning: ${total} days in Belgium (approaching 183-day threshold)`,
    orange: `Caution: ${total} days in Belgium (very close to 183-day threshold)`,
    red: `Alert: ${total} days in Belgium (exceeds 183-day threshold)`
  };
  return messages[level] || null;
}
```

### Anti-Patterns to Avoid
- **Storing Date objects in localStorage:** Always serialize to ISO strings; Date objects cannot be JSON stringified
- **Using setMonth() for navigation:** Can cause date overflow; create new Date(year, month, 1) instead
- **Mutating frozen state:** Always use structuredClone() before modifying calendar data
- **Zero-indexed month display:** Always add 1 when showing to user (February = month 1 internally, display as "February")

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting | Custom string manipulation | Intl.DateTimeFormat | Handles locale, edge cases |
| File download | Custom form submission | Blob + createObjectURL | Standard pattern, cleaner |
| Modal focus trap | Manual tabindex management | Native `<dialog>` element | Already used in Phase 3 |
| Deep clone | Manual recursive clone | structuredClone() | Already established pattern |
| Pointer events for drag | mousedown/mouseup | pointerdown/pointerup | Works with touch and mouse |

**Key insight:** The project already has established patterns for modals, localStorage, and data management. Reuse these patterns for calendar implementation.

## Common Pitfalls

### Pitfall 1: Month/Day Index Confusion
**What goes wrong:** JavaScript months are 0-indexed (Jan=0, Dec=11), but days are 1-indexed (1-31)
**Why it happens:** Inconsistent API design in JavaScript Date
**How to avoid:** Use named constants and helper functions:
```javascript
const MONTHS = { FEB: 1, MAR: 2, /*...*/ DEC: 11 };
function monthName(index) {
  return new Date(2026, index, 1).toLocaleString('default', { month: 'long' });
}
```
**Warning signs:** "January" appearing when expecting "February", off-by-one errors in month display

### Pitfall 2: Day-of-Week Start Assumptions
**What goes wrong:** Calendar shows wrong day alignment because Sunday vs Monday week start
**Why it happens:** getDay() returns 0=Sunday, but user expects Monday-start calendar
**How to avoid:** Transform day index: `const mondayStart = (date.getDay() + 6) % 7;`
**Warning signs:** Days shifted by one column, weekend appearing in wrong position

### Pitfall 3: Selection State Not Persisting
**What goes wrong:** User toggles days, but changes lost on page refresh
**Why it happens:** Forgetting to call save function after state mutation
**How to avoid:** Follow established pattern - every mutation must trigger saveCalendarState():
```javascript
function setDayStatus(dateKey, status) {
  calendarState.days[dateKey] = { ...calendarState.days[dateKey], status };
  calendarState.lastModified = new Date().toISOString();
  saveCalendarState();  // CRITICAL
  renderCalendar();
}
```
**Warning signs:** Data correct during session but reset after refresh

### Pitfall 4: Shift-Click Range Selection Edge Cases
**What goes wrong:** Range selects wrong days when clicking in reverse order
**Why it happens:** Not using Math.min/Math.max for start/end determination
**How to avoid:** Always normalize the range:
```javascript
function selectRange(dateKey1, dateKey2, status) {
  const dates = Object.keys(calendarState.days)
    .concat([dateKey1, dateKey2])
    .filter(d => d >= Math.min(dateKey1, dateKey2) && d <= Math.max(dateKey1, dateKey2));
  // ...
}
```
**Warning signs:** Reverse selection excludes clicked days or selects wrong range

### Pitfall 5: ICS Date Format Errors
**What goes wrong:** Calendar apps can't import generated ICS files
**Why it happens:** Wrong date/time format (ICS requires YYYYMMDD or YYYYMMDDTHHMMSS)
**How to avoid:** Use all-day event format with VALUE=DATE:
```
DTSTART;VALUE=DATE:20260215
DTEND;VALUE=DATE:20260216
```
**Warning signs:** Import fails silently, events show wrong times

### Pitfall 6: Count Calculation Excludes Partial Selections
**What goes wrong:** Day counts don't match visible selected days
**Why it happens:** Filtering logic excludes 'unset' status incorrectly
**How to avoid:** Explicit status checks:
```javascript
function countDays(status) {
  return Object.values(calendarState.days)
    .filter(d => d.status === status)
    .length;
}
```
**Warning signs:** Count shows 0 when days are visibly selected

## Code Examples

Verified patterns from official sources and existing codebase:

### Calendar Grid Rendering
```javascript
// Source: Established codebase patterns + MDN Date API
function renderMonthCalendar(year, month) {
  const grid = getMonthGrid(year, month);
  const monthName = new Date(year, month, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  let html = `
    <div class="calendar-header">
      <button onclick="navigateMonth(-1)" class="nav-btn">&lt;</button>
      <h3>${monthName}</h3>
      <button onclick="navigateMonth(1)" class="nav-btn">&gt;</button>
    </div>
    <div class="calendar-grid">
      <div class="day-header">Mon</div>
      <div class="day-header">Tue</div>
      <div class="day-header">Wed</div>
      <div class="day-header">Thu</div>
      <div class="day-header">Fri</div>
      <div class="day-header">Sat</div>
      <div class="day-header">Sun</div>
  `;

  grid.forEach(week => {
    week.forEach(date => {
      if (date === null) {
        html += '<div class="day-cell empty"></div>';
      } else {
        const dateKey = toISODateKey(date);
        const dayData = calendarState.days[dateKey] || { status: 'unset', contracted: false };
        const statusEmoji = getStatusEmoji(dayData.status);
        const contractedBadge = dayData.contracted ? '<span class="contracted-badge">C</span>' : '';

        html += `
          <div class="day-cell ${dayData.status}"
               data-date="${dateKey}"
               onclick="openDayPicker('${dateKey}')">
            <span class="day-number">${date.getDate()}</span>
            ${contractedBadge}
            <span class="status-emoji">${statusEmoji}</span>
          </div>
        `;
      }
    });
  });

  html += '</div>';
  return html;
}

function getStatusEmoji(status) {
  const emojis = {
    belgium: '\u{1F1E7}\u{1F1EA}',  // Flag of Belgium
    spain: '\u{1F1EA}\u{1F1F8}',    // Flag of Spain
    travel: '\u{2708}\u{FE0F}',     // Airplane
    unset: ''
  };
  return emojis[status] || '';
}
```

### Day Status Picker Dialog
```javascript
// Source: Existing Phase 3 dialog pattern
function openDayPicker(dateKey) {
  const dialog = document.getElementById('dayPickerDialog');
  const dayData = calendarState.days[dateKey] || { status: 'unset', contracted: false };
  const date = new Date(dateKey);

  // Populate dialog
  document.getElementById('pickerDateDisplay').textContent =
    date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('pickerContracted').textContent =
    dayData.contracted ? 'Contracted work day' : 'Flexible day';

  // Set radio buttons
  document.querySelector(`input[name="dayStatus"][value="${dayData.status}"]`).checked = true;

  // Show counts
  const counts = calculateCounts();
  document.getElementById('pickerMonthCount').textContent = `${counts.monthBelgium} days in Belgium this month`;
  document.getElementById('pickerAnnualCount').textContent = `${counts.annualBelgium} days in Belgium (annual)`;

  // Store current dateKey for save
  dialog.dataset.dateKey = dateKey;
  dialog.showModal();
}

function saveDayStatus() {
  const dialog = document.getElementById('dayPickerDialog');
  const dateKey = dialog.dataset.dateKey;
  const status = document.querySelector('input[name="dayStatus"]:checked').value;

  if (!calendarState.days[dateKey]) {
    calendarState.days[dateKey] = { contracted: false };
  }
  calendarState.days[dateKey].status = status;
  calendarState.lastModified = new Date().toISOString();

  saveCalendarState();
  renderCalendar();
  updateCountDisplays();
  dialog.close();
}
```

### ICS Export Generation
```javascript
// Source: iCalendar RFC 5545 specification
function generateICS() {
  const events = Object.entries(calendarState.days)
    .filter(([_, data]) => data.status && data.status !== 'unset')
    .map(([dateKey, data]) => {
      const date = new Date(dateKey);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const statusText = {
        belgium: 'Belgium Work Day',
        spain: 'Spain',
        travel: 'Travel Day'
      }[data.status];

      const contractedNote = data.contracted ? ' (Contracted)' : '';

      return `BEGIN:VEVENT
UID:${dateKey}-autonomo@tax-calculator
DTSTAMP:${formatICSDate(new Date())}
DTSTART;VALUE=DATE:${dateKey.replace(/-/g, '')}
DTEND;VALUE=DATE:${toISODateKey(nextDay).replace(/-/g, '')}
SUMMARY:${statusText}${contractedNote}
DESCRIPTION:${statusText} - Autonomo Tax Calendar
END:VEVENT`;
    });

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Autonomo Tax Calculator//Belgium Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join('\n')}
END:VCALENDAR`;

  return ics;
}

function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function downloadICS() {
  const ics = generateICS();
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'belgium-calendar-2026.ics';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### CSV Export Generation
```javascript
// Source: GeeksforGeeks CSV Blob pattern
function generateCSV() {
  const headers = ['Date', 'Day of Week', 'Status', 'Contracted'];
  const rows = Object.entries(calendarState.days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, data]) => {
      const date = new Date(dateKey);
      return [
        dateKey,
        date.toLocaleDateString('en-GB', { weekday: 'long' }),
        data.status || 'unset',
        data.contracted ? 'Yes' : 'No'
      ];
    });

  const csvContent = [headers, ...rows]
    .map(row => row.map(escapeCSVField).join(','))
    .join('\n');

  return csvContent;
}

function escapeCSVField(value) {
  const str = value == null ? '' : String(value);
  if (str.search(/("|,|\n)/g) >= 0) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function downloadCSV() {
  const csv = generateCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'belgium-calendar-2026.csv';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Clipboard Copy
```javascript
// Source: Native Clipboard API
async function copyToClipboard() {
  const counts = calculateCounts();
  const summary = `Belgium Calendar 2026 Summary
===========================
Total Belgium days: ${counts.annualBelgium}
Total Travel days: ${counts.annualTravel}
Total Spain days: ${counts.annualSpain}
Combined (Belgium + Travel): ${counts.annualBelgium + counts.annualTravel}
183-day threshold: ${counts.annualBelgium + counts.annualTravel >= 183 ? 'EXCEEDED' : 'OK'}

${generateTextTable()}`;

  try {
    await navigator.clipboard.writeText(summary);
    showNotification('Copied to clipboard!');
  } catch (err) {
    console.error('Clipboard write failed:', err);
    showNotification('Copy failed - try again', 'error');
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery date pickers | Native HTML5 date input + custom calendar | 2020+ | No jQuery dependency needed |
| moment.js for dates | Native Date + Intl.DateTimeFormat | 2022+ | Smaller bundle, native support |
| Manual focus traps | HTML5 `<dialog>` element | 2022+ | Better accessibility, less code |
| setTimeout debouncing | requestAnimationFrame | Established | Smoother updates, already used in codebase |

**Deprecated/outdated:**
- moment.js: Superseded by lighter alternatives and Temporal API
- jQuery UI datepicker: Not needed for vanilla JS project
- Pointer Events polyfills: No longer needed in 2026

## Open Questions

Things that couldn't be fully resolved:

1. **Belgian holiday replacement days**
   - What we know: When holidays fall on weekends, employers must provide substitute days
   - What's unclear: Specific substitute dates vary by employer
   - Recommendation: Document the 10 official holidays for 2026 but note that users must manually mark substitute days as Belgium days if applicable

2. **Entry/exit day counting ambiguity**
   - What we know: AEAT considers entry/exit days as days in BOTH countries
   - What's unclear: Exact UI representation for this (show warning vs special status)
   - Recommendation: Show info tooltip explaining this, but allow standard Belgium/Spain/Travel marking

3. **Save button vs auto-save behavior**
   - What we know: User decided on explicit Save button
   - What's unclear: Should partial changes in bulk selection be auto-reverted on cancel?
   - Recommendation: Track "dirty" state, warn on navigation away with unsaved changes

## Belgian Public Holidays 2026 (Reference)

For documentation and user reference:

| Date | Holiday | Notes |
|------|---------|-------|
| 2026-01-01 | New Year's Day | Before calendar range (Feb-Dec) |
| 2026-04-06 | Easter Monday | Monday |
| 2026-05-01 | Labour Day | Friday |
| 2026-05-14 | Ascension Day | Thursday |
| 2026-05-25 | Whit Monday | Monday |
| 2026-07-21 | Belgian National Holiday | Tuesday |
| 2026-08-15 | Assumption Day | Saturday (substitute required) |
| 2026-11-01 | All Saints' Day | Sunday (substitute required) |
| 2026-11-11 | Armistice Day | Wednesday |
| 2026-12-25 | Christmas Day | Friday |

**Note:** Holidays on weekends (Aug 15, Nov 1) require employer-designated substitute days. These are NOT auto-marked as contracted but DO count toward 183-day threshold if user is in Belgium.

## Sources

### Primary (HIGH confidence)
- MDN Web Docs - Date API: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- MDN Web Docs - Blob API: https://developer.mozilla.org/en-US/docs/Web/API/Blob
- Existing codebase (autonomo_dashboard.html) - localStorage, dialog, formatting patterns

### Secondary (MEDIUM confidence)
- Business Belgium - Belgian Public Holidays 2026: https://businessbelgium.be/news/official-public-holidays-2026-in-belgium/
- GeeksforGeeks - CSV Blob Export: https://www.geeksforgeeks.org/javascript/how-to-create-and-download-csv-file-in-javascript/
- WebDevTrick - Drag Date Selection: https://webdevtrick.com/drag-date-range-selector/

### Tertiary (LOW confidence)
- General WebSearch patterns for calendar UI (verified against MDN)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using established codebase patterns and native APIs
- Architecture: HIGH - Data structures follow existing localStorage patterns
- Date manipulation: HIGH - Verified against MDN documentation
- Export formats: MEDIUM - ICS format verified against RFC, but edge cases possible
- Pitfalls: HIGH - Common issues well-documented across sources

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable domain, no fast-moving dependencies)
