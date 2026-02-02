# Phase 7.2: UI/UX Polish & Generalization - Implementation Plan

**Created:** 2026-02-02
**Status:** Draft
**Priority:** CRITICAL - Must complete before Phase 8

## Overview

Comprehensive UI/UX overhaul to fix bugs, improve visual design, remove hardcoded Belgium features, ensure full English localization, and test across all screen sizes. Creates a polished, professional foundation for Phase 8 enhancements.

## Problem Statement

Current dashboard has multiple issues blocking professional use:
1. **Design Quality:** Lacks visual polish, spacing is inconsistent, typography needs refinement
2. **Language:** Dutch terms like "Leefgeld" throughout codebase
3. **Bugs:** Tooltips broken, add expense issues, mobile layout problems
4. **Hardcoded Belgium:** Belgium costs are special-cased rather than generic expenses
5. **Cross-browser/screen:** Not tested comprehensively across devices

User feedback: "kind of ugly design wise and has a lot of bugs"

## Goals

1. **Visual Polish:** Professional financial dashboard aesthetic with refined dark theme
2. **Bug-Free:** All functionality works correctly across all screen sizes
3. **English Only:** Zero Dutch text in UI (code comments okay)
4. **Generic System:** Remove Belgium hardcoding, make expense categories user-driven
5. **Tested:** Verify functionality on desktop (1920x1080, 1440x900) and mobile (375x812, 428x926)

## Detailed Task Breakdown

### 1. Visual Design Overhaul (8-12 tasks)

**Typography & Spacing:**
- [ ] Audit all font sizes, weights, line-heights for consistency
- [ ] Implement consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
- [ ] Improve heading hierarchy (h1, h2, h3 clear visual distinction)
- [ ] Add letter-spacing to headings for sophistication
- [ ] Ensure all text has sufficient contrast (WCAG AAA where possible)

**Color Refinement:**
- [ ] Keep dark background (#1a1a1a) but refine grays for better depth
- [ ] Refine green accent (#00ff88) - consider slightly desaturated for sophistication
- [ ] Create consistent color tokens for all states (hover, active, disabled, focus)
- [ ] Add subtle gradients or shadows for depth (avoid flat-looking cards)
- [ ] Ensure semantic colors are clear (success, error, warning, info)

**Component Polish:**
- [ ] Scenario cards: improve visual hierarchy, add subtle animations
- [ ] Buttons: consistent sizing, hover states, focus rings
- [ ] Input fields: better borders, focus states, error states
- [ ] Tabs: enhance active state, improve spacing
- [ ] Tables: better row hover, sticky headers on scroll
- [ ] Cards: subtle shadows, better border-radius consistency

### 2. Bug Fixes (6-10 tasks)

**Critical Bugs:**
- [ ] Fix tooltip modal positioning (ensure centered with backdrop blur)
- [ ] Fix add expense button functionality
- [ ] Test and fix mobile layout breakpoints (600px, 768px, 1024px)
- [ ] Verify calendar day selection works on touch devices
- [ ] Test all export functions (ICS, CSV, clipboard)

**Interaction Bugs:**
- [ ] Ensure all dialogs close properly (Esc key, backdrop click, X button)
- [ ] Fix any z-index issues with overlapping elements
- [ ] Verify form validation works correctly
- [ ] Test keyboard navigation through all interactive elements
- [ ] Check focus trap in modals

### 3. English Localization (3-5 tasks)

**Text Replacement:**
- [ ] Replace "Leefgeld" with "Disposable Income" or "Living Money" throughout
- [ ] Change subtitle from "Spain - Belgium Cross-Border 2025/2026" to "Self-Employed Tax Calculator 2025/2026"
- [ ] Audit all UI strings for Dutch terms
- [ ] Update all aria-labels and accessibility text to English
- [ ] Review all tooltips, placeholders, error messages

### 4. Remove Belgium Hardcoding (8-12 tasks)

**Generalize Expense System:**
- [ ] Remove "Belgium Labor Costs" as special category
- [ ] Remove Low (1K) / High (2.5K) toggle - make this a normal expense
- [ ] Convert Belgium costs to standard deductible expenses
- [ ] Remove Belgium-specific formula display
- [ ] Update expense data structure to be country-agnostic

**Generalize Calendar:**
- [ ] Keep calendar functionality (Belgium, Spain, Travel statuses)
- [ ] Remove Belgium-specific language from UI
- [ ] Make treaty warnings configurable (not hardcoded to Belgium)
- [ ] Allow "Work Location" to be any country (Belgium just becomes a label)
- [ ] Update 183-day threshold to be generic "foreign work days"

**Configuration Layer:**
- [ ] Create user preferences for "primary work country" (defaults to "Belgium")
- [ ] Make treaty disclaimers show based on calendar usage, not hardcoding
- [ ] Allow customization of expense categories
- [ ] Store user's country preferences in localStorage

### 5. Cross-Platform Testing (6-8 tasks)

**Desktop Testing:**
- [ ] Test on 1920x1080 (full HD)
- [ ] Test on 1440x900 (MacBook standard)
- [ ] Test on 2560x1440 (2K)
- [ ] Verify all tabs, modals, tooltips work correctly
- [ ] Test horizontal scrolling for scenario cards
- [ ] Test print/PDF export layout

**Mobile/Tablet Testing:**
- [ ] Test on 375x812 (iPhone SE/12/13/14)
- [ ] Test on 428x926 (iPhone 14 Pro Max)
- [ ] Test on 768x1024 (iPad portrait)
- [ ] Verify touch interactions (tap, swipe, pinch)
- [ ] Test mobile menu/navigation
- [ ] Verify all dialogs are mobile-friendly

**Browser Testing:**
- [ ] Chrome (primary)
- [ ] Safari (macOS/iOS)
- [ ] Firefox
- [ ] Edge

### 6. Accessibility Improvements (4-6 tasks)

**WCAG Compliance:**
- [ ] Verify all interactive elements have focus indicators
- [ ] Ensure proper heading hierarchy (no skipped levels)
- [ ] Add aria-labels where needed
- [ ] Test keyboard navigation (Tab, Shift+Tab, Enter, Esc)
- [ ] Verify screen reader compatibility
- [ ] Ensure sufficient color contrast everywhere

### 7. Performance & Code Quality (3-5 tasks)

**Optimization:**
- [ ] Audit JavaScript for performance bottlenecks
- [ ] Optimize re-renders (debounce where needed)
- [ ] Minimize CSS specificity conflicts
- [ ] Remove unused code/styles
- [ ] Add meaningful code comments for complex logic

## Success Criteria

### Visual Quality
✅ User says "This looks professional and polished"
✅ Consistent spacing throughout (no visual "gaps" or cramped areas)
✅ Clear visual hierarchy (important info stands out)
✅ Smooth, intentional interactions (no jarring transitions)

### Functionality
✅ All buttons, inputs, and interactive elements work correctly
✅ No console errors during normal use
✅ All exports (ICS, CSV, PDF) generate correctly
✅ Forms validate properly with clear error messages

### Localization
✅ Zero Dutch words in UI (grep for Leefgeld, Huur, etc. returns nothing in UI text)
✅ All tooltips, labels, and messages in English
✅ Subtitle reads "Self-Employed Tax Calculator 2025/2026"

### Generalization
✅ No "Belgium Labor Costs" section (moved to standard expenses)
✅ Calendar says "Work Location" not "Belgium Days"
✅ Treaty warnings appear based on usage, not hardcoded
✅ User can add Belgium costs as regular expenses

### Cross-Platform
✅ Works perfectly on desktop (1920x1080, 1440x900)
✅ Works perfectly on mobile (375x812, 428x926)
✅ All features accessible on touch devices
✅ Layouts adapt gracefully to all breakpoints

### Accessibility
✅ Keyboard navigation works for all features
✅ Focus indicators visible and clear
✅ Screen reader can announce all content correctly
✅ No WCAG violations

## Implementation Approach

### Option 1: Comprehensive Redesign (Recommended)
- Create new `autonomo_dashboard_v2.html` with redesigned components
- Migrate functionality section by section
- Test thoroughly before replacing original
- Allows rollback if issues arise

### Option 2: In-Place Refinement
- Update existing `autonomo_dashboard.html` incrementally
- Risk of breaking working features
- Faster but less safe

**Recommendation:** Option 1 - Create V2, test thoroughly, then replace

## Files to Create/Modify

### New Files
- `.planning/phases/07.2-ui-ux-polish/07.2-CONTEXT.md` - Design decisions
- `autonomo_dashboard_v2.html` - Polished version
- `.planning/phases/07.2-ui-ux-polish/07.2-TESTING.md` - Test results

### Modified Files
- `autonomo_dashboard.html` - Will be replaced by v2 once tested
- `.planning/ROADMAP.md` - Add Phase 7.2
- `.planning/STATE.md` - Update current phase

## Estimated Effort

- **Design refinement:** 3-4 hours
- **Bug fixes:** 2-3 hours
- **Localization:** 1 hour
- **Belgium removal:** 2-3 hours
- **Testing:** 2-3 hours
- **Total:** 10-16 hours (2-3 plans)

## Dependencies

- None (can start immediately)
- Should complete BEFORE Phase 8 (Enhanced Features)

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Create V2 file, test thoroughly before replacing |
| Design changes take longer than expected | Prioritize bugs/localization, polish iteratively |
| Belgium removal causes calculation errors | Write unit tests for calculations first |
| Mobile testing reveals major issues | Start with mobile-first approach in redesign |

## Next Steps

1. Run `/gsd:discuss-phase 7.2` to capture design decisions
2. Create 2-3 plans for implementation
3. Execute with thorough testing at each step
4. User acceptance testing before marking complete
5. Then proceed to Phase 8

---

*Phase: 07.2-ui-ux-polish*
*Plan created: 2026-02-02*
