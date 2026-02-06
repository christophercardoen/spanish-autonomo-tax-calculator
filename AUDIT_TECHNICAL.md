# AUDIT: Technical Assessment

**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**File:** AUDIT_TECHNICAL.md

---

## 1. ARCHITECTURE OVERVIEW

### File Structure
- **Single-file monolith:** `autonomo_dashboard.html` (32,560 lines, ~1.1 MB)
  - Lines 1-9,260: CSS (~9,260 lines)
  - Lines 9,261-11,602: HTML (~2,340 lines)
  - Lines 11,603-32,413: JavaScript (~20,810 lines)
  - Lines 32,415-32,560: Entity modal + toast container

### Technology Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | None (vanilla JS) | Intentional choice per CLAUDE.md |
| Database | Dexie.js v4 (IndexedDB) | 18 tables, 4 schema versions |
| Auth | Supabase Auth | Built but not connected (empty config) |
| PDF | jsPDF + jspdf-autotable | Invoice generation |
| OCR | Tesseract.js | Local receipt scanning |
| PWA | Service worker + manifest | Network-first HTML, cache-first static |
| Analytics | Plausible | Privacy-focused |
| Errors | Sentry | Error monitoring (CDN loaded) |
| Calendar | Google Calendar API | OAuth2 sync (built, not deployed) |

### External Dependencies (CDN-loaded)
```
unpkg.com      - Dexie.js, Supabase, UUID, CSV libraries
cdn.jsdelivr.net - Additional libraries
accounts.google.com - OAuth2
apis.google.com - Google Calendar API
js.sentry-cdn.com - Error monitoring
plausible.io   - Analytics
```

**Risk:** No Subresource Integrity (SRI) hashes on CDN scripts. A CDN compromise could inject malicious code.

---

## 2. SECURITY AUDIT

### 2.1 XSS Vulnerabilities

| # | Location | Severity | Description |
|---|----------|----------|-------------|
| 1 | Line 25330 | MEDIUM | `innerHTML` with concatenated `items` string in archived expenses. Individual fields are escaped but the concatenation pattern is fragile. |
| 2 | Line 19354 | MEDIUM | QR code data URI injected via `innerHTML`. If `enrollmentData.qrCode` contains a `javascript:` URI, it could execute. |
| 3 | Multiple | LOW | 178 inline `onclick` handlers in HTML strings. Hardcoded (not user-supplied) but violates best practice. |

### 2.2 escapeHtml() Coverage

**Three separate definitions exist:**
- Line 14361: `escapeHtml(text)` -- uses `textContent` trick
- Line 24627: `_escapeHtml(text)` -- identical implementation, different name
- Line 28659: Another `escapeHtml(text)` -- duplicate in different scope

**Coverage estimate:** ~85% of innerHTML assignments with user data are properly escaped. Major gaps:
- Line 25330: Archived expenses concatenation
- Line 19354: QR code data URI
- Various `renderInlineSource()` results

### 2.3 Content Security Policy

```
script-src 'self' 'unsafe-inline' [5 CDN domains]
style-src 'self' 'unsafe-inline' [2 domains]
connect-src 'self' [6 wildcard domains]
```

| Issue | Severity | Detail |
|-------|----------|--------|
| `'unsafe-inline'` in script-src | MEDIUM | Weakens XSS protection. Required by single-file format. |
| `'unsafe-inline'` in style-src | MEDIUM | Allows style injection. Required by inline CSS. |
| Wildcard connect-src | MEDIUM | `https://*.supabase.co` allows any Supabase subdomain |
| No SRI hashes | MEDIUM | CDN scripts loaded without integrity verification |

### 2.4 Other Security Findings

| Finding | Status |
|---------|--------|
| `eval()` usage | NONE FOUND |
| `Function()` constructor | NONE FOUND |
| `setTimeout` with strings | NONE FOUND (all use function expressions) |
| Hardcoded secrets | NONE FOUND |
| SQL injection | NOT APPLICABLE (IndexedDB, not SQL) |
| CSRF tokens | NONE (not needed for current local-only architecture, but required before backend) |

### 2.5 Security Score

**Overall: 7/10** -- No critical issues. Medium-severity items relate to the single-file architecture constraint.

---

## 3. CODE ARCHITECTURE AUDIT

### 3.1 Global State Management

**7 mutable global variables scattered across 17,000+ lines:**

| Variable | Line | Purpose | Risk |
|----------|------|---------|------|
| `calendarState` | 12059 | Calendar day data | HIGH -- read/written by 50+ functions |
| `lastClickedDate` | 12062 | UI state | LOW |
| `selectedDates` | 12063 | Multi-select state | LOW |
| `unsavedChanges` | 12064 | Dirty flag | LOW |
| `scenarioState` | 14525 | Scenario engine data | MEDIUM -- read/written by 30+ functions |
| `currentEditScenarioId` | 16536 | Modal state | LOW |
| `entitySwitcher` | 28892 | UI component reference | LOW |

**Assessment:** No centralized state management (no reducer, no state machine, no event bus). State changes are tracked only via direct mutation. Debugging state issues requires searching the entire 32K-line file.

### 3.2 Event Listener Management

**Critical finding: 79 addEventListener calls, 0 removeEventListener calls.**

Only ONE use of `AbortController` for cleanup (entity switcher, line 28608-28622). All other listeners accumulate:

| Listener | Line | Risk |
|----------|------|------|
| Tab radio change | 29104 | Runs in DOMContentLoaded, added without cleanup |
| Window hashchange | 29112 | Added without cleanup |
| Income dialog backdrop | 29230 | Added without cleanup |
| Tooltip modal backdrop | 29240 | Added without cleanup |
| Expense dialog backdrop | 29250 | Added without cleanup |
| Expense list filters (4x) | 25434-25444 | Added in _initExpenseListListeners() without cleanup |
| Global document click | 19090 | Multiple times throughout code |

**Impact:** In the current single-page app, this is mitigated by the `_appInitialized` guard (line 29087) which prevents re-initialization. However, listeners on repeatedly-created elements (dialogs, lists) can accumulate.

### 3.3 Initialization Flow

**Triple initialization pattern:**
```
Line 29085: DOMContentLoaded handler (main init, ~200 lines)
Line 29295: window.load handler (hash activation)
Line 29302: window.pageshow handler (bfcache restoration)
```

`activateTabFromHash()` is called up to 4 times per page load:
1. Line 29100 (DOMContentLoaded)
2. Line 29287 (DOMContentLoaded fallback)
3. Line 29297 (window.load)
4. Line 29304 (pageshow)

**Assessment:** Redundant but not harmful (function is idempotent). Still, it indicates unclear initialization ordering.

**Sequential init chain (lines 29093-29288):**
- Service Worker registration with empty `.catch(() => {})` -- silent failure
- 30+ sequential init() calls with inconsistent error handling
- No dependency enforcement -- if step N fails, step N+1 still runs

### 3.4 Error Handling Patterns

| Pattern | Count | Quality |
|---------|-------|---------|
| try-catch blocks | 122 | Mostly good -- fallback values provided |
| console.error logging | 87 | Errors logged but rarely shown to users |
| showToast() for errors | ~15 | Only ~12% of error paths notify users |
| Empty catch blocks | 2 | Line 29095 (SW registration), line 11646 (Sentry fallback) |
| Global error handler | 1 | ErrorTracker with unhandledrejection (good) |

**Key gap:** Most async errors only reach the console. Users see silent failures.

### 3.5 Code Organization

**Three organizational patterns coexist:**
1. **Singleton objects with methods:** ErrorTracker, Analytics, DataManager, ClientManager, InvoiceManager (good encapsulation)
2. **Loose functions:** activateTabFromHash, showToast, calendar functions (~200 loose functions)
3. **Inline initialization with closures:** Theme toggle IIFE (line 9257)

**Assessment:** The singleton pattern (used in Phase 13+) is cleaner than the loose functions (Phase 1-7). Refactoring the older code to match would improve consistency.

---

## 4. DATABASE ARCHITECTURE

### 4.1 Schema (Dexie.js v4)

**18 tables across 4 schema versions:**

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| entities | id, owner_id, type | Business entities (autonomo/SL) |
| clients | id, entity_id | Client management |
| client_contacts | id, client_id | Client contact persons |
| client_projects | id, client_id | Projects per client |
| expenses | id, entity_id | Expense tracking |
| expense_receipts | id, expense_id | Receipt attachments |
| invoices | id, entity_id | Invoice management |
| invoice_items | id, invoice_id | Invoice line items |
| invoice_payments | id, invoice_id | Payment tracking |
| income_entries | id, entity_id | Income records |
| profiles | id | User profiles |
| entity_shares | id, entity_id | Multi-user sharing |
| invites | id, entity_id | Invite management |
| calendar_entries | id, entity_id | Calendar day data |
| calendar_clients | id, entity_id | Calendar client tags |
| work_patterns | id, entity_id | Work pattern templates |
| tax_years | id, entity_id | Fiscal year data |
| archived_items | id, entity_id | Soft-deleted items |

### 4.2 Dual Data Storage

**Legacy localStorage coexists with IndexedDB:**
- Theme preference: localStorage (appropriate)
- Onboarding state: localStorage (appropriate)
- Calendar state: localStorage (should migrate to IndexedDB)
- Scenario custom data: localStorage (should migrate to IndexedDB)
- Entity context: localStorage (should migrate to IndexedDB)

**Risk:** Calendar data exists in both localStorage (old) and IndexedDB (new). No migration path documented. Could lead to data inconsistencies.

### 4.3 Data Integrity

| Check | Status |
|-------|--------|
| Foreign key enforcement | None (IndexedDB limitation) |
| Cascade deletes | Manual (soft-delete via archived_items) |
| Data validation on write | Partial (some fields validated, others not) |
| Backup/export | Print/clipboard only, no JSON export |
| GDPR deletion | Not implemented |

---

## 5. PERFORMANCE ANALYSIS

### 5.1 File Size

| Component | Size | Assessment |
|-----------|------|------------|
| HTML file | ~1.1 MB | LARGE for a single file |
| CSS | ~9,260 lines | LARGE -- many unused styles from iterative development |
| JavaScript | ~20,810 lines | LARGE -- but comprehensive feature set |
| External JS (CDN) | ~500 KB estimated | Dexie, Supabase, jsPDF, Tesseract |

**Total page weight:** ~1.6 MB + fonts + CDN libraries. Acceptable for a dashboard app, but the single-file format prevents code-splitting.

### 5.2 Rendering Performance

| Concern | Status |
|---------|--------|
| Virtual scrolling for lists | NOT IMPLEMENTED -- expense list will slow at 1,000+ items |
| Debounced search | YES -- expense search has 300ms debounce |
| DOM batch updates | PARTIAL -- some use DocumentFragment, others don't |
| CSS containment | NOT USED |
| Lazy loading | NOT IMPLEMENTED -- all tabs render eagerly |

### 5.3 Memory Concerns

| Concern | Risk | Detail |
|---------|------|--------|
| Event listener accumulation | MEDIUM | 79 listeners, 0 removals |
| Large DOM size | LOW | ~2,340 lines of HTML, most hidden |
| Timer cleanup | LOW | Timers are short-lived, promise-based |
| Observer cleanup | LOW | No MutationObserver/ResizeObserver found |
| IndexedDB growth | LOW | Bounded by user activity |

---

## 6. ACCESSIBILITY AUDIT

| Aspect | Status | Evidence |
|--------|--------|----------|
| **Focus styles** | PARTIAL | `:focus-visible` defined globally with `outline: 2px solid var(--accent)` |
| **ARIA labels** | MINIMAL | 40 `aria-label` attributes for ~200+ interactive elements (20% coverage) |
| **ARIA roles** | MINIMAL | 15 `role=` attributes |
| **Focus trapping** | MISSING | No focus trap in any modal/dialog |
| **Skip navigation** | MISSING | No skip link |
| **Screen reader** | UNTESTED | No `aria-live` regions except toast container |
| **Keyboard navigation** | PARTIAL | Tab key works, no custom shortcuts |
| **Color contrast** | MOSTLY PASSING | `--text-faint` at 3.7:1 fails WCAG AA for small text |
| **Touch targets** | PARTIAL | Some buttons < 44px height |
| **prefers-reduced-motion** | MISSING | No `prefers-reduced-motion` media query |
| **forced-colors** | MISSING | No high contrast mode support |

**Accessibility score: 3/10** -- Significant work needed for WCAG AA compliance.

---

## 7. PWA ASSESSMENT

### Service Worker (sw.js, 64 lines)

| Feature | Status |
|---------|--------|
| Network-first for HTML | YES |
| Cache-first for static assets | YES |
| Cache versioning | YES (`cache-v1`) |
| Background sync | NO |
| Push notifications | NO |
| Offline indicator | NO |
| Registration error handling | SILENT (empty `.catch(() => {})`) |

### Manifest (manifest.json)

| Field | Status |
|-------|--------|
| name/short_name | YES |
| icons | MISSING (only references favicon.svg) |
| display: standalone | YES |
| theme_color | YES (#1a1a2e) |
| start_url | YES (/) |
| scope | MISSING |

**PWA score: 4/10** -- Basic structure exists but missing proper icons, offline indicator, and sync.

---

## 8. CODE QUALITY METRICS

### Quantitative

| Metric | Value | Assessment |
|--------|-------|------------|
| Total lines | 32,560 | Large monolith |
| Functions | ~300+ | Difficult to count in single file |
| Global variables (mutable) | 7 | Acceptable for app size |
| addEventListener | 79 | High count |
| removeEventListener | 0 | POOR -- should match addEventListener |
| innerHTML assignments | 144 | High -- prefer textContent where possible |
| escapeHtml coverage | ~85% | Good but not complete |
| try-catch blocks | 122 | Good error handling effort |
| console.log/debug | 87 | Should be stripped for production |
| TODO/FIXME comments | ~15 | Technical debt markers |
| `var` declarations | 2 | Nearly fully modernized |
| Duplicate function defs | 3 | escapeHtml defined 3 times |

### Qualitative

| Aspect | Score | Notes |
|--------|-------|-------|
| Naming conventions | 7/10 | Consistent camelCase, descriptive names |
| Code comments | 5/10 | Phase markers good, inline comments sparse |
| Function length | 5/10 | Some functions 100+ lines |
| Separation of concerns | 4/10 | Business logic mixed with DOM manipulation |
| DRY principle | 5/10 | Some duplication (3 escapeHtml, similar render functions) |
| Error handling | 6/10 | Good coverage, poor user feedback |
| Test coverage | 0/10 | No tests exist |

---

## 9. TECHNICAL DEBT INVENTORY

### Critical (Blocks SaaS Launch)

| # | Debt | Impact | Effort |
|---|------|--------|--------|
| T-1 | No automated tests | Can't verify regressions | XL |
| T-2 | Supabase auth not connected | No user accounts | M |
| T-3 | No data backup/export | Users can lose all data | M |
| T-4 | Belgium-specific hardcoding | Blocks market expansion | XL |
| T-5 | No GDPR deletion | EU legal requirement | M |

### Important (Affects Quality)

| # | Debt | Impact | Effort |
|---|------|--------|--------|
| T-6 | 87 console.log statements | Production noise | S |
| T-7 | 3 duplicate escapeHtml functions | Maintenance confusion | S |
| T-8 | Event listener accumulation | Potential memory growth | M |
| T-9 | Dual localStorage/IndexedDB state | Data inconsistency risk | M |
| T-10 | No SRI hashes on CDN scripts | Supply chain attack risk | S |
| T-11 | Silent service worker failures | PWA features break silently | S |
| T-12 | 85% XSS escape coverage | 15% gap in user data handling | M |

### Maintenance (Affects Developer Experience)

| # | Debt | Impact | Effort |
|---|------|--------|--------|
| T-13 | 32K-line single file | Hard to navigate/edit | XL (split = architecture change) |
| T-14 | Mixed code organization patterns | Inconsistent developer experience | L |
| T-15 | No JSDoc or type annotations | Hard to understand function contracts | L |
| T-16 | 300+ hardcoded CSS values | Theme changes are painful | L |

---

## 10. SCORE SUMMARY

| Category | Score | Key Issue |
|----------|-------|-----------|
| Security | 7/10 | No critical issues, medium CSP concerns |
| Architecture | 4/10 | Global state, no listener cleanup, triple init |
| Database | 6/10 | Good schema, dual storage issue |
| Performance | 5/10 | No virtual scrolling, eager rendering |
| Accessibility | 3/10 | Minimal ARIA, no focus trap, no reduced-motion |
| PWA | 4/10 | Basic structure, missing offline/icons/sync |
| Code Quality | 5/10 | Good naming, poor test coverage, large functions |
| **Overall** | **4.9/10** | Solid prototype, significant work for production |

---

*Generated: 2026-02-06 by AUDIT Phase 4*
