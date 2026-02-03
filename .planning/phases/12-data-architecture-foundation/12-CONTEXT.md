# Phase 12: Data Architecture Foundation - Context

**Gathered:** 2026-02-03
**Status:** Ready for research and planning

<domain>
## Phase Boundary

Establish offline-first data layer using IndexedDB/Dexie.js for financial business data (invoices, expenses, receipts, clients, calendar, tax calculations). This phase creates the foundation for data persistence, monetary precision, soft deletion with audit retention, and sync queue infrastructure. Multi-entity architecture and actual cloud sync are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Schema design & versioning
- **Define complete schema upfront** - Create all entity tables now based on v2.0 requirements (clients, invoices, expenses, receipts, calendar, entities, etc.) for consistency
- **Auto-migrate on load** - App detects schema version mismatch and runs migrations automatically with loading screen (no user prompt)
- **Roll back on migration failure** - Keep pre-migration backup and restore if migration fails (browser crash, quota exceeded, etc.)
- **Standard audit fields everywhere** - All tables get: created_at, updated_at, created_by, updated_by (even though single-user for now, prepares for Phase 14 multi-user)

### Monetary precision handling
- **Convert at input field** - Input shows euros (e.g., "1234.56"), converts to cents integer (123456) on blur/change before storage
- **Round to nearest cent** - Amounts with >2 decimals (e.g., "10.567") round to nearest cent (10.57) using banker's rounding, no error shown
- **Store calculated values** - Save subtotal_cents, iva_cents, total_cents in database to ensure invoice totals never change even if rates update
- **Always 2 decimals in UI** - Display as €1,234.56 format. Even whole euros show .00 (e.g., €100.00) for consistent alignment

### Soft delete & retention
- **Deleted items move to separate view** - Soft-deleted records hidden from main lists but accessible in "Deleted Items" section
- **Exclude from all calculations** - Deleted invoices/expenses don't count toward revenue, taxes, or reports (clean separation)
- **Auto-purge on app load** - Check deleted_at dates on startup, permanently delete records older than 4 years (silent cleanup)
- **Restore within 30 days only** - User can restore accidentally deleted items within 30 days via "Deleted Items" view. After 30 days, restoration disabled but record retained for audit until 4-year purge

**CRITICAL: Spanish invoice deletion compliance** (REQUIRES RESEARCH)
- **Invoice number preservation** - Deleted invoices must preserve their sequential invoice number (VeriFactu/factura completa requires no gaps)
- **Archive vs deletion distinction** - User "deletes" → invoice archived with deleted_at timestamp, number stays in sequence. True deletion only via manual purge or 4-year auto-purge.
- **Invoice number reuse** - Invoice numbers can only be reused after true deletion from archive (manual purge by user OR 4-year auto-purge)
- **Tax filing implications** - Need research: Do deleted/cancelled invoices still appear in tax filings? Is there "factura rectificativa" (replacement invoice) concept for corrections?

**RESEARCH FLAG:** Phase researcher must investigate:
1. Spanish regulations on invoice deletion/cancellation (factura anulada vs factura rectificativa)
2. Whether deleted invoices must be reported in Modelo 303/390 tax filings
3. Invoice sequence gap rules (VeriFactu requirements)
4. Proper way to "undo" an invoice in Spain (cancellation, replacement, credit note?)

### Sync queue design
- **Queue all data changes** - Every create/update/delete operation goes in sync queue (including calculated fields, not just user input)
- **Warn at threshold** - Show warning at 100/500/1000 queued items: "You have many unsynced changes. Connect to sync."
- **Visible sync indicator** - Always-visible badge/icon showing status: "Synced", "X items pending", "Syncing...", "Offline". Clickable for queue details.
- **Queue every change** - If same record edited 5 times before sync, queue 5 operations (apply sequentially). Full audit trail preserved, not coalesced.

### Claude's Discretion
- Dexie.js configuration (compound indexes, key paths)
- IndexedDB store names and structure
- Migration runner implementation
- Sync queue priority/ordering logic
- Exact thresholds for queue size warnings (100/500/1000 is guideline)

</decisions>

<specifics>
## Specific Ideas

- Spain has strict invoice sequencing rules (VeriFactu compliance) - deletion cannot create gaps in invoice number sequence
- 4-year retention aligns with Spanish tax audit statute of limitations
- User mentioned: "deleted invoice will have an invoice number and you can't file taxes with missing invoice numbers" - this is the critical compliance requirement
- Single-file HTML preserved from v1.1, so IndexedDB initialization must work inline without build step

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope. Multi-entity RLS policies, actual Supabase sync, conflict resolution all belong in later phases.

</deferred>

---

*Phase: 12-data-architecture-foundation*
*Context gathered: 2026-02-03*
