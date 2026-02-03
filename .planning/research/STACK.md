# Technology Stack - v2.0 Business Management System

**Project:** Spanish Autonomo Tax Calculator - Belgium Edition
**Version:** v2.0 Transformation
**Researched:** 2026-02-03
**Overall Confidence:** HIGH

---

## Executive Summary

Transform the v1.1 single-file HTML calculator (8,980 lines, localStorage) into a production business management system with cross-device sync, receipt OCR, PDF invoicing, and calendar integration. The recommended architecture uses **Supabase** as the backend (PostgreSQL + Auth + Storage + Edge Functions), **Dexie.js** for offline-first IndexedDB, **pdfmake** for invoice generation with QR codes, **Mindee** for receipt OCR, and **FullCalendar** with Google Calendar API for calendar sync.

**Key architecture decision:** Hybrid offline-first with cloud sync. Local data in IndexedDB (via Dexie.js) synced to Supabase PostgreSQL. This preserves the "works offline" experience while adding cross-device sync.

---

## Recommended Architecture

```
+------------------+     +-------------------+     +------------------+
|   Browser/PWA    |     |    Supabase       |     |  External APIs   |
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
| autonomo_v2.html |<--->| PostgreSQL DB     |     | Google Calendar  |
|   (single file)  |     |   - clients       |     |   API            |
|                  |     |   - invoices      |     |                  |
| Dexie.js         |     |   - expenses      |     | Mindee OCR       |
|   (IndexedDB)    |     |   - calendar_days |     |   API            |
|                  |     |                   |     |                  |
| pdfmake          |     | Auth (email/pwd)  |     |                  |
|   (PDF gen)      |     |                   |     |                  |
|                  |     | Storage (receipts)|     |                  |
| FullCalendar     |     |                   |     |                  |
|   (calendar UI)  |     | Edge Functions    |     |                  |
|                  |     |   - OCR proxy     |     |                  |
+------------------+     |   - PDF backup    |     +------------------+
                         +-------------------+
```

### Data Flow

1. **User interaction** happens in browser with immediate IndexedDB writes (offline-capable)
2. **Background sync** pushes changes to Supabase when online
3. **Receipt upload** goes to Supabase Storage, triggers Edge Function for OCR
4. **Invoice PDF** generated client-side with pdfmake, optionally backed up to Storage
5. **Calendar sync** bidirectional with Google Calendar via API

---

## Data Persistence Solution

### Recommendation: Supabase (PostgreSQL) + Dexie.js (IndexedDB)

**Why Supabase over Firebase/PocketBase:**

| Criteria | Supabase | Firebase | PocketBase |
|----------|----------|----------|------------|
| Database | PostgreSQL (SQL, relational) | Firestore (NoSQL) | SQLite |
| Self-host option | Yes | No | Yes (primary) |
| Free tier | 500MB DB, 1GB storage, 50K MAUs | Generous but complex pricing | Free (self-host) |
| Auth built-in | Yes | Yes | Yes |
| Row Level Security | Native PostgreSQL RLS | Custom rules | Basic |
| File storage | Yes, with CDN | Yes | Yes |
| Edge Functions | Yes (Deno) | Cloud Functions | No |
| European data residency | Yes (EU regions) | Limited | Self-host only |
| Single-user cost | $0-25/month | $0-25/month | VPS cost (~$5/month) |

**Winner: Supabase** because:
1. **PostgreSQL is relational** - Perfect for clients -> invoices -> expenses relationships
2. **Row Level Security** - Native database-level security for single-user data isolation
3. **Free tier sufficient** - 500MB database + 1GB storage covers years of invoices/receipts
4. **CDN for JS client** - Works with single-file HTML via `<script>` tag, no build tools needed
5. **Edge Functions** - Can proxy OCR API calls to hide API keys from browser
6. **EU data residency** - Critical for GDPR compliance with financial data

**Sources:**
- [Supabase vs Firebase vs PocketBase Comparison](https://www.supadex.app/blog/supabase-vs-firebase-vs-pocketbase-which-one-should-you-choose-in-2025)
- [Supabase Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Offline-First Layer: Dexie.js

**Why Dexie.js over raw IndexedDB/localForage:**

| Criteria | Dexie.js | Raw IndexedDB | localForage |
|----------|----------|---------------|-------------|
| Learning curve | Low | High | Low |
| Schema versioning | Built-in migrations | Manual | Manual |
| Query API | Promise-based, intuitive | Callback-based, verbose | Simple get/set only |
| Storage limit | Browser limit (~unlimited) | Same | Same |
| PWA support | Excellent | Manual | Good |
| TypeScript | Full support | Manual | Partial |

**Winner: Dexie.js v4.0** because:
1. **Built-in versioning** - Schema migrations handled automatically
2. **Promise-based API** - Clean async/await syntax
3. **100,000+ sites** use it, battle-tested
4. **Works with any sync backend** - Not locked to CouchDB like PouchDB

**Sync Strategy:**

```javascript
// Simplified sync flow
async function syncToSupabase() {
  // 1. Get all unsynced local records
  const unsynced = await db.expenses.where('synced').equals(0).toArray();

  // 2. Push to Supabase
  const { error } = await supabase.from('expenses').upsert(unsynced);

  // 3. Mark as synced locally
  if (!error) {
    await db.expenses.where('id').anyOf(unsynced.map(e => e.id))
      .modify({ synced: 1 });
  }

  // 4. Pull remote changes (last_modified > last_sync)
  const { data } = await supabase.from('expenses')
    .select('*')
    .gt('updated_at', lastSyncTime);

  // 5. Update local DB
  await db.expenses.bulkPut(data);
}
```

**Sources:**
- [Dexie.js Official](https://dexie.org/)
- [IndexedDB vs localStorage](https://dev.to/armstrong2035/9-differences-between-indexeddb-and-localstorage-30ai)

---

## Receipt OCR Implementation

### Recommendation: Mindee (Primary) + Tesseract.js (Fallback)

**OCR API Comparison:**

| Provider | Accuracy | European Receipts | Pricing | Privacy |
|----------|----------|-------------------|---------|---------|
| Mindee | 90-95% | Excellent (50+ countries) | $0.10-0.01/page | Cloud (GDPR compliant) |
| Google Cloud Vision | 98% | Good | $1.50/1000 (free tier: 1000/month) | Cloud |
| AWS Textract | 95% | Good | $1.50/1000 | Cloud |
| Tesseract.js | 85-90% | Basic | Free | Local (browser) |
| Klippa | 95-99% | Excellent | Enterprise pricing | Cloud (EU-based) |

**Winner: Mindee** because:
1. **Trained on European receipts** - 50+ countries including Spain, Belgium, Netherlands
2. **Receipt-specific extraction** - Merchant, total, taxes, date, category (not just raw text)
3. **Reasonable pricing** - $0.10/page decreasing to $0.01 at volume
4. **GDPR compliant** - SOC II certified, EU data processing
5. **Free tier** - Enough for development and light production use

**Extracted Fields (automatic):**
- Merchant name and address
- Total amount (including tax breakdown)
- Date and time
- Payment method
- Currency
- Category (food, transport, accommodation, etc.)
- Line items (when structured)

**Implementation Architecture:**

```
Receipt Photo → Supabase Storage → Edge Function → Mindee API → Parse Response → Update DB
```

```javascript
// Edge Function: /functions/v1/ocr-receipt
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'

serve(async (req) => {
  const { imageUrl } = await req.json();

  const response = await fetch('https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${Deno.env.get('MINDEE_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ document: imageUrl })
  });

  const result = await response.json();
  return new Response(JSON.stringify(result.document.inference.prediction));
});
```

**Fallback: Tesseract.js (Local)**

For privacy-sensitive users or offline scenarios:

```javascript
import Tesseract from 'tesseract.js';

async function localOCR(imageFile) {
  const { data: { text } } = await Tesseract.recognize(imageFile, 'spa+nld+fra+eng');
  // Manual parsing required - less accurate but fully private
  return parseReceiptText(text);
}
```

**Cost Analysis (100 receipts/month):**
- Mindee: ~$10/month (at $0.10/receipt)
- Google Cloud Vision: Free (under 1000/month limit)
- Tesseract.js: $0

**Recommendation:** Start with Mindee for accuracy, offer Tesseract.js as "private mode" option.

**Sources:**
- [Mindee Receipt OCR](https://www.mindee.com/product/receipt-ocr-api)
- [Mindee Pricing](https://www.mindee.com/pricing)
- [Klippa OCR Comparison](https://www.klippa.com/en/blog/information/best-ocr-api/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)

---

## PDF Invoice Generation

### Recommendation: pdfmake + qrcode-generator

**PDF Library Comparison:**

| Library | Approach | Tables | Custom Fonts | QR Codes | Browser | Server |
|---------|----------|--------|--------------|----------|---------|--------|
| pdfmake | Declarative JSON | Excellent | Yes | Via addon | Yes | Yes |
| jsPDF | Imperative API | Basic | Yes | Via addon | Yes | Yes |
| PDF-lib | Programmatic | Manual | Yes | Via addon | Yes | Yes |
| html2pdf.js | HTML to PDF | Via HTML | CSS fonts | Via HTML | Yes | No |

**Winner: pdfmake v0.3.2** because:
1. **Declarative JSON** - Define document structure, not drawing commands
2. **Excellent tables** - Perfect for invoice line items
3. **Consistent layouts** - Invoices need pixel-perfect consistency
4. **Active development** - v0.3.2 released January 2026
5. **No build tools** - Works via CDN `<script>` tag

**VeriFactu QR Code Requirements:**

Per Spanish regulations (Real Decreto 1007/2023), invoices must include:
- QR code size: 30x30mm to 40x40mm
- Label: "QR tributario" above the code
- Content: Validation URL for AEAT verification
- Text: "Factura verificable en la sede electronica de la AEAT" or "VERI*FACTU"

**IMPORTANT:** VeriFactu compliance deadline extended to **July 1, 2027** for autonomos (Real Decreto-ley 15/2025). Software must be compliant by July 29, 2025.

**Implementation:**

```javascript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import QRCode from 'qrcode-generator';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function generateInvoicePDF(invoice) {
  // Generate VeriFactu QR code
  const qr = QRCode(0, 'M');
  qr.addData(generateVeriFactuURL(invoice));
  qr.make();
  const qrDataUrl = qr.createDataURL(4);

  const docDefinition = {
    content: [
      { text: 'FACTURA', style: 'header' },
      { text: `N: ${invoice.number}`, style: 'invoiceNumber' },

      // Client details
      { text: invoice.client.name, bold: true },
      { text: invoice.client.nif },
      { text: invoice.client.address },

      // Line items table
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Descripcion', 'Cantidad', 'Precio', 'Total'],
            ...invoice.items.map(item => [
              item.description,
              item.quantity,
              formatCurrency(item.price),
              formatCurrency(item.quantity * item.price)
            ])
          ]
        }
      },

      // Totals
      { text: `Base Imponible: ${formatCurrency(invoice.subtotal)}`, alignment: 'right' },
      { text: `IVA (21%): ${formatCurrency(invoice.vat)}`, alignment: 'right' },
      { text: `TOTAL: ${formatCurrency(invoice.total)}`, style: 'total', alignment: 'right' },

      // VeriFactu QR section
      { text: 'QR tributario', style: 'qrLabel', margin: [0, 20, 0, 5] },
      { image: qrDataUrl, width: 100, height: 100 },
      { text: 'VERI*FACTU', style: 'verifactu' }
    ],
    styles: {
      header: { fontSize: 22, bold: true },
      invoiceNumber: { fontSize: 14, margin: [0, 0, 0, 20] },
      total: { fontSize: 16, bold: true },
      qrLabel: { fontSize: 10, color: '#666' },
      verifactu: { fontSize: 10, color: '#666' }
    }
  };

  return pdfMake.createPdf(docDefinition);
}
```

**CDN Installation (single-file HTML compatible):**

```html
<script src="https://cdn.jsdelivr.net/npm/pdfmake@0.3.2/build/pdfmake.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pdfmake@0.3.2/build/vfs_fonts.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
```

**Sources:**
- [pdfmake npm](https://www.npmjs.com/package/pdfmake)
- [pdfmake vs jsPDF Comparison](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
- [VeriFactu Spain Guide](https://marosavat.com/verifactu-spain-2026-guide/)
- [VeriFactu QR Requirements](https://www.invoicevista.com/blog/en/spanish-invoice-qr-code-requirements/)

---

## Calendar Sync Design

### Recommendation: FullCalendar + Google Calendar API

**Calendar Approach Comparison:**

| Approach | Bidirectional | Complexity | Google Support | iCal Support |
|----------|---------------|------------|----------------|--------------|
| Google Calendar API | Yes | Medium | Native | Export only |
| CalDAV | Yes | High | Limited RFC compliance | Native |
| iCal file export | No (export only) | Low | Import | Native |
| FullCalendar | Display only | Low | Plugin | Plugin |

**Recommendation: Hybrid approach**

1. **FullCalendar v6** for UI (already calendar-like in v1.1)
2. **Google Calendar API** for sync (most users have Google accounts)
3. **iCal export** for other calendar apps (Outlook, Apple Calendar)

**Why Google Calendar API over CalDAV:**
- Google's CalDAV implementation "doesn't come close to following the RFC"
- Google Calendar API is well-documented with OAuth 2.0
- Better for real-time sync and push notifications
- Most autonomos use Google Workspace

**Implementation Architecture:**

```javascript
// Initialize FullCalendar with Google Calendar source
const calendar = new FullCalendar.Calendar(el, {
  plugins: [dayGridPlugin, googleCalendarPlugin],
  googleCalendarApiKey: 'YOUR_API_KEY',
  eventSources: [
    // Local events (from IndexedDB)
    { events: (info, success) => loadLocalEvents(info.start, info.end, success) },
    // Google Calendar events
    { googleCalendarId: 'primary' }
  ],
  eventClick: (info) => handleEventClick(info),
  dateClick: (info) => handleDateClick(info)
});

// Sync local calendar_days to Google Calendar
async function syncToGoogleCalendar() {
  const unsyncedDays = await db.calendar_days.where('synced').equals(0).toArray();

  for (const day of unsyncedDays) {
    const event = {
      summary: `${day.type === 'belgium' ? 'Belgium' : day.type === 'travel' ? 'Travel' : 'Spain'}`,
      start: { date: day.date },
      end: { date: day.date },
      extendedProperties: {
        private: {
          autonomo_app: 'true',
          day_type: day.type,
          client_id: day.client_id
        }
      }
    };

    await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    await db.calendar_days.update(day.id, { synced: 1 });
  }
}
```

**Client Tagging in Calendar:**

Use Google Calendar's `extendedProperties` to tag events with client IDs:

```javascript
extendedProperties: {
  private: {
    client_id: 'client_123',
    project_id: 'project_456',
    billable: 'true'
  }
}
```

**iCal Export (for non-Google users):**

```javascript
import ical from 'ical-generator';

function exportToICS(calendarDays) {
  const calendar = ical({ name: 'Autonomo Work Calendar' });

  calendarDays.forEach(day => {
    calendar.createEvent({
      start: new Date(day.date),
      end: new Date(day.date),
      allDay: true,
      summary: `${day.type} - ${day.client_name || 'Work'}`,
      categories: [{ name: day.type }]
    });
  });

  return calendar.toString();
}
```

**CDN Installation:**

```html
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fullcalendar/google-calendar@6.1.17/index.global.min.js"></script>
```

**Sources:**
- [FullCalendar Google Calendar Plugin](https://fullcalendar.io/docs/google-calendar)
- [FullCalendar iCalendar Plugin](https://fullcalendar.io/docs/icalendar)
- [Google Calendar API vs CalDAV](https://www.tutorialpedia.org/blog/difference-between-google-caldav-api-and-google-calendar-api/)

---

## Migration Strategy from v1.1

### Current localStorage Structure

```javascript
// v1.1 localStorage keys
const STORAGE_KEYS = {
  scenarios: 'autonomo_scenarios_v1',
  expenses: 'autonomoExpenses',
  calendar: 'autonomoCalendarState',
  income: 'autonomo_income_v1'
};
```

### Target Database Schema

```sql
-- Supabase PostgreSQL schema

-- Users (managed by Supabase Auth)
-- No custom table needed, uses auth.users

-- Clients (NEW in v2.0)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  nif TEXT,
  vat_number TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'BE',
  payment_terms INTEGER DEFAULT 30,
  default_rate DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (NEW in v2.0)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue
  subtotal DECIMAL(10,2),
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  vat_amount DECIMAL(10,2),
  total DECIMAL(10,2),
  notes TEXT,
  pdf_url TEXT, -- Supabase Storage path
  verifactu_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses (migrated from localStorage)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL, -- spain_deductible, work_travel, private
  subcategory TEXT, -- huur, gsm, elektriciteit, flight, hotel, dietas, etc.
  deductible_percentage INTEGER DEFAULT 100,
  receipt_url TEXT, -- Supabase Storage path
  ocr_data JSONB, -- Raw OCR response for audit
  client_id UUID REFERENCES clients(id), -- Link expense to client
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Days (migrated from localStorage)
CREATE TABLE calendar_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  day_type TEXT NOT NULL, -- belgium, spain, travel
  client_id UUID REFERENCES clients(id),
  is_contractual BOOLEAN DEFAULT false,
  google_event_id TEXT, -- For sync
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Scenarios (migrated from localStorage)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  monthly_revenue DECIMAL(10,2),
  monthly_expenses DECIMAL(10,2),
  belgium_costs DECIMAL(10,2),
  is_preset BOOLEAN DEFAULT false,
  preset_letter CHAR(1), -- A, B, C, D, E
  custom_overrides JSONB, -- Fiscal overrides
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income entries (migrated from localStorage)
CREATE TABLE income_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  invoice_id UUID REFERENCES invoices(id),
  date DATE NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, received
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users access own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- (Similar policies for all tables)
```

### Migration Flow

```javascript
// Migration script embedded in v2.0 HTML

async function migrateFromV1() {
  // 1. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showLoginPrompt();
    return;
  }

  // 2. Check if migration already done
  const migrationKey = 'autonomo_v2_migration_done';
  if (localStorage.getItem(migrationKey)) {
    console.log('Migration already completed');
    return;
  }

  // 3. Load v1.1 localStorage data
  const v1Data = {
    scenarios: JSON.parse(localStorage.getItem('autonomo_scenarios_v1') || '{}'),
    expenses: JSON.parse(localStorage.getItem('autonomoExpenses') || '{}'),
    calendar: JSON.parse(localStorage.getItem('autonomoCalendarState') || '{}'),
    income: JSON.parse(localStorage.getItem('autonomo_income_v1') || '{}')
  };

  // 4. Transform and insert into Supabase
  // Scenarios
  if (v1Data.scenarios.scenarios) {
    const transformed = v1Data.scenarios.scenarios.map(s => ({
      user_id: user.id,
      name: s.name,
      monthly_revenue: s.monthlyRevenue,
      monthly_expenses: s.monthlyExpenses,
      belgium_costs: s.belgiumCosts,
      is_preset: s.isPreset || false,
      preset_letter: s.letter || null
    }));
    await supabase.from('scenarios').insert(transformed);
  }

  // Calendar days
  if (v1Data.calendar.days) {
    const transformed = Object.entries(v1Data.calendar.days).map(([date, type]) => ({
      user_id: user.id,
      date: date,
      day_type: type,
      is_contractual: v1Data.calendar.contractualDays?.includes(date) || false
    }));
    await supabase.from('calendar_days').insert(transformed);
  }

  // Expenses
  if (v1Data.expenses.entries) {
    const transformed = v1Data.expenses.entries.map(e => ({
      user_id: user.id,
      date: e.date,
      description: e.description,
      amount: e.amount,
      category: e.category,
      subcategory: e.subcategory,
      deductible_percentage: e.deductiblePercentage || 100
    }));
    await supabase.from('expenses').insert(transformed);
  }

  // 5. Also sync to local IndexedDB for offline use
  await syncToIndexedDB();

  // 6. Mark migration complete
  localStorage.setItem(migrationKey, new Date().toISOString());

  // 7. Optionally clear old localStorage (or keep as backup)
  // localStorage.removeItem('autonomo_scenarios_v1');
  // ...

  console.log('Migration complete!');
}
```

### Backward Compatibility

For users who don't want to create an account, v2.0 will:
1. Continue working with IndexedDB (Dexie.js) locally
2. Show "Create Account to Sync" prompt periodically
3. Keep localStorage migration available if they sign up later
4. Export all data to JSON as backup option

---

## Cost Analysis

### Monthly Costs (Single User, Light Production)

| Service | Free Tier | Expected Usage | Monthly Cost |
|---------|-----------|----------------|--------------|
| Supabase | 500MB DB, 1GB storage, 50K MAUs | ~50MB DB, ~500MB storage | $0 |
| Mindee OCR | 250 pages free, then $0.10/page | ~50 receipts | $0-5 |
| Google Calendar API | Free | Unlimited events | $0 |
| **Total** | | | **$0-5/month** |

### Growth Scenario (Heavy Usage)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Supabase Pro | Need daily backups, more storage | $25 |
| Mindee | 200 receipts/month | $20 |
| Google Calendar API | Still free | $0 |
| **Total** | | **$45/month** |

### Self-Hosted Alternative (PocketBase)

If costs become concern:
- VPS (Hetzner/DigitalOcean): ~$5/month
- PocketBase: Free (single binary)
- Tesseract.js: Free (local OCR)
- **Total: $5/month** (but more maintenance)

---

## Security Considerations

### Financial Data Protection

1. **Supabase RLS** - All tables have Row Level Security enabled
2. **HTTPS only** - Supabase enforces HTTPS for all connections
3. **EU data residency** - Choose EU region for Supabase project (Frankfurt or London)
4. **API keys in Edge Functions** - OCR API keys never exposed to browser

### Authentication

```javascript
// Recommended: Email/password with email verification
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback'
  }
});
```

### Receipt Image Security

1. **Private bucket** - Receipts stored in private Supabase Storage bucket
2. **Signed URLs** - Generate time-limited URLs for viewing
3. **User isolation** - RLS on storage.objects table

```sql
-- Storage RLS policy
CREATE POLICY "Users can access own receipts" ON storage.objects
  FOR ALL USING (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### GDPR Compliance

1. **Data export** - User can export all their data (JSON + receipts)
2. **Data deletion** - User can delete account and all associated data
3. **Data processing agreement** - Supabase has DPA for EU customers
4. **Mindee GDPR** - SOC II and GDPR compliant

---

## Complete Technology Stack

### Core Stack (Required)

| Technology | Version | Purpose | CDN/Package |
|------------|---------|---------|-------------|
| Supabase JS | 2.90.1 | Backend client | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` |
| Dexie.js | 4.0.10 | IndexedDB wrapper | `cdn.jsdelivr.net/npm/dexie@4` |
| pdfmake | 0.3.2 | PDF generation | `cdn.jsdelivr.net/npm/pdfmake@0.3.2` |
| qrcode-generator | 1.4.4 | QR codes for VeriFactu | `cdn.jsdelivr.net/npm/qrcode-generator@1.4.4` |
| FullCalendar | 6.1.17 | Calendar UI | `cdn.jsdelivr.net/npm/fullcalendar@6.1.17` |

### OCR (Choose One)

| Technology | Version | Purpose | Integration |
|------------|---------|---------|-------------|
| Mindee API | v5 | Receipt OCR (recommended) | Via Edge Function |
| Tesseract.js | 5.1.1 | Local OCR (fallback) | Browser-side |

### Calendar Sync (Choose One)

| Technology | Purpose | Complexity |
|------------|---------|------------|
| Google Calendar API | Bidirectional sync | Medium |
| iCal export | One-way export | Low |

### Existing v1.1 Stack (Keep)

| Technology | Purpose | Status |
|------------|---------|--------|
| Vanilla JavaScript | Core logic | Keep |
| DM Sans + JetBrains Mono | Typography | Keep |
| ExcelJS | Excel export | Keep |
| Dark theme CSS | Styling | Keep |

### CDN Installation Block

```html
<!-- v2.0 Dependencies (add to existing v1.1) -->

<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Dexie.js (IndexedDB) -->
<script src="https://cdn.jsdelivr.net/npm/dexie@4/dist/dexie.min.js"></script>

<!-- PDF Generation -->
<script src="https://cdn.jsdelivr.net/npm/pdfmake@0.3.2/build/pdfmake.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pdfmake@0.3.2/build/vfs_fonts.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>

<!-- Calendar (optional, only if replacing current calendar) -->
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js"></script>

<!-- OCR (optional, local fallback) -->
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js"></script>
```

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Supabase architecture | HIGH | Official docs verified, widely used, free tier confirmed |
| Dexie.js for offline | HIGH | Mature library (v4.0), 100K+ sites, official docs |
| pdfmake for invoices | HIGH | Active development (0.3.2), excellent table support |
| VeriFactu requirements | MEDIUM | Deadline extended to 2027, technical spec evolving |
| Mindee OCR accuracy | MEDIUM-HIGH | 90-95% reported, need real-world testing with Spanish receipts |
| Google Calendar sync | MEDIUM | API well-documented but bidirectional sync complex |
| Migration from v1.1 | HIGH | localStorage structure known, transformation straightforward |

---

## Open Questions for Phase Research

1. **VeriFactu technical spec** - Need exact QR code data format from AEAT when available
2. **Belgian receipts with Dutch** - Test Mindee accuracy on Belgian receipts in Dutch
3. **Conflict resolution** - Define strategy when same data edited on multiple devices
4. **PWA installability** - Research manifest.json requirements for home screen install
5. **Modelo 130 automation** - Research AEAT API for quarterly tax submission (if exists)

---

## Sources

### Official Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Dexie.js](https://dexie.org/)
- [pdfmake GitHub](https://github.com/bpampuch/pdfmake)
- [FullCalendar Docs](https://fullcalendar.io/docs)
- [Mindee Receipt OCR](https://www.mindee.com/product/receipt-ocr-api)
- [Tesseract.js](https://tesseract.projectnaptha.com/)

### Pricing & Comparisons
- [Supabase Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Supabase vs Firebase vs PocketBase](https://www.supadex.app/blog/supabase-vs-firebase-vs-pocketbase-which-one-should-you-choose-in-2025)
- [Mindee Pricing](https://www.mindee.com/pricing)
- [OCR Accuracy Benchmark](https://research.aimultiple.com/ocr-accuracy/)

### VeriFactu Spain
- [VeriFactu Complete Guide](https://marosavat.com/verifactu-spain-2026-guide/)
- [VeriFactu QR Requirements](https://www.invoicevista.com/blog/en/spanish-invoice-qr-code-requirements/)
- [VeriFactu Deadline Extension](https://getrenn.com/blog/verifactu)

### Calendar Integration
- [Google Calendar API](https://developers.google.com/workspace/calendar)
- [CalDAV vs Google Calendar API](https://www.tutorialpedia.org/blog/difference-between-google-caldav-api-and-google-calendar-api/)

---

*Last updated: 2026-02-03*
*Research confidence: HIGH*
