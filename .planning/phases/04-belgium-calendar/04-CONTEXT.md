# Phase 4: Belgium Calendar - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive Feb-Dec 2026 calendar for tracking Belgium presence days with 183-day threshold awareness. Users can mark days as Belgium/Spain/Travel, see automatic counts, and receive warnings when approaching residency thresholds. The contracted work pattern (Mon-Tue weekly, first-week Wed-Fri) pre-fills but remains editable.

</domain>

<decisions>
## Implementation Decisions

### Day toggling interaction
- Click on day opens modal picker (not cycle-through or right-click menu)
- Modal shows both current counts (month/annual Belgium days) and day details (date, day of week, contracted status)
- Contracted days can be overridden (allows marking sick days, vacation, etc.)
- Bulk selection supported: click-drag or Shift-click to select range, then modal applies status to all
- Days can be cleared to 'unset' status (allows planning flexibility)
- Visual feedback is instant update (no animation delay)
- Save button required (changes are temporary until user saves, allows experimentation)

### Visual design & layout
- Single month view with prev/next navigation (not all months visible at once)
- Days display status using flag emojis: 🇧🇪 Belgium, 🇪🇸 Spain, ✈️ Travel
- Contracted days have badge or indicator (e.g., small 'C' badge in corner)
- Month navigation controls at top with month name (prev/next arrows flanking month name)

### Counting & warnings
- Display both per-month count and annual total simultaneously
- Warning levels: Yellow at 170 days, Orange at 180 days, Red at 183+ days
- Warning displayed as both banner (at top) and badge (on count number)
- Belgium + Travel days both count toward 183 threshold (conservative compliance approach)

### Contracted pattern handling
- First-time wizard asks to apply contracted pattern on initial calendar load
- "First week" defined as: Monday through Sunday calendar week where Wed-Fri fall
- Belgian holidays NOT included in contracted pattern (user marks manually)
- When Belgian holiday falls day before contracted day:
  - User manually marks these days as Belgium
  - They count toward 183 threshold but are not auto-filled
  - Wizard/docs explain this rule to user

### Claude's Discretion
- Exact modal styling and animation
- Calendar grid spacing and typography
- Save button placement and styling
- Exact wording of warning messages
- Belgian holiday date list for reference/documentation

</decisions>

<specifics>
## Specific Ideas

- Belgium holidays before contracted days: "I don't have to work on Belgium holidays but if they fall a day before a next office day I have to be in Belgium. So, they don't count as contracted days but do count for the 183 days threshold."
- First week definition: "Like a regular calendar starting on Monday and ending on Sunday"
- Save workflow allows experimentation before committing changes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-belgium-calendar*
*Context gathered: 2026-02-01*
