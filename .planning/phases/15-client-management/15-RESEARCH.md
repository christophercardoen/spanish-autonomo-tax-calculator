# Phase 15: Client Management - Research

**Researched:** 2026-02-04
**Domain:** Client CRM with Tax ID Validation (Spanish + EU), Country Categorization, Project Management
**Confidence:** HIGH

## Summary

Phase 15 implements client management for a Spanish SME application with multi-jurisdiction tax requirements. The core challenges are: (1) validating Spanish tax IDs (NIF/CIF/NIE) already solved in Phase 13, (2) validating EU VAT numbers via VIES which has CORS restrictions preventing browser-side calls, (3) categorizing clients by country for correct IVA treatment, and (4) managing projects with multiple rate types.

The existing codebase already has `SpanishTaxIdValidator` from Phase 13, Dexie.js database schema with `clients` and `projects` tables, and Supabase integration for authentication. The VIES API cannot be called directly from the browser due to CORS; a Supabase Edge Function proxy is the recommended solution, with graceful degradation to format-only validation when offline.

**Primary recommendation:** Extend SpanishTaxIdValidator with EU VAT format validation, implement VIES proxy via Supabase Edge Function, and build client/project CRUD with existing Dexie patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie.js | 4.x | IndexedDB wrapper | Already used for all data persistence |
| Supabase JS | 2.x | Backend services | Already used for auth; Edge Functions for VIES proxy |
| currency.js | 2.0.4 | Money handling | Already used via MoneyUtils |
| SpanishTaxIdValidator | N/A | NIF/CIF/NIE validation | Built in Phase 13, fully tested |

### New for Phase 15
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| None | N/A | EU VAT format validation | Hand-roll regex patterns - simple, well-documented |
| None | N/A | Country flag emoji | Hand-roll - 2-line vanilla JS function, no library needed |

### Not Using (Considered But Rejected)
| Library | Reason Not Used |
|---------|-----------------|
| jsvat npm | Project is single-file HTML, no npm; EU VAT regex patterns are simple to implement |
| validate-vat | Node.js only, CORS prevents browser-side VIES calls anyway |
| Third-party VIES APIs | Adds external dependency, costs; Supabase Edge Function is free tier friendly |

**Installation:** No new dependencies required. Supabase Edge Function to be deployed separately.

## Architecture Patterns

### Recommended Data Structure

```javascript
// Client record structure
const client = {
  id: 1,                              // Auto-increment
  entity_id: 1,                       // FK to entities table
  name: 'ACME Corp',                  // Required
  email: 'billing@acme.be',           // Optional
  phone: '+32 2 123 4567',            // Optional
  address: 'Rue de la Loi 1, Brussels', // Optional

  // Tax identification
  tax_id: 'BE0411905847',             // Raw tax ID (with country prefix for EU)
  tax_id_type: 'eu_vat',              // 'nif' | 'cif' | 'nie' | 'eu_vat' | 'third_country'
  tax_id_validated: true,             // VIES validation status
  tax_id_validated_at: '2026-02-04',  // Last validation date

  // Country and categorization
  country_code: 'BE',                 // ISO 3166-1 alpha-2
  category: 'eu_b2b',                 // 'spain' | 'eu_b2b' | 'eu_b2c' | 'uk' | 'third_country'

  // EU B2B/B2C distinction (only for EU clients)
  is_b2b: true,                       // true = inversion sujeto pasivo eligible

  // US-specific (W-8BEN)
  w8ben_uploaded: false,              // Has W-8BEN on file
  w8ben_uploaded_at: null,            // Upload date

  // Metadata
  created_at: '2026-02-04T10:00:00Z',
  updated_at: '2026-02-04T10:00:00Z',
  deleted_at: null                    // Soft delete
};

// Contact record structure (multiple per client)
const contact = {
  id: 1,
  client_id: 1,
  name: 'Jan Janssen',
  email: 'jan@acme.be',
  phone: '+32 2 123 4568',
  role: 'billing',                    // 'billing' | 'project_manager' | 'technical' | 'general'
  is_primary: true,
  created_at: '2026-02-04T10:00:00Z'
};

// Project record structure
const project = {
  id: 1,
  client_id: 1,
  entity_id: 1,                       // Denormalized for faster queries
  name: 'IT Consulting Q1 2026',

  // Rate configuration
  rate_type: 'daily',                 // 'daily' | 'hourly' | 'fixed' | 'monthly_retainer'
  rate_cents: 65000,                  // 650 EUR (stored as cents)

  // Duration
  start_date: '2026-02-01',
  end_date: '2026-06-30',

  // Status (auto-calculated from dates or manual override)
  status: 'active',                   // 'upcoming' | 'active' | 'completed' | 'cancelled'
  status_override: null,              // Manual override (e.g., 'cancelled')

  // Metadata
  notes: 'Main consulting engagement',
  created_at: '2026-02-04T10:00:00Z',
  updated_at: '2026-02-04T10:00:00Z',
  deleted_at: null
};
```

### Client Category Constants

```javascript
const CLIENT_CATEGORY = Object.freeze({
  SPAIN: 'spain',
  EU_B2B: 'eu_b2b',
  EU_B2C: 'eu_b2c',
  UK: 'uk',
  THIRD_COUNTRY: 'third_country'
});

// Country code to category mapping
const CATEGORY_BY_COUNTRY = {
  ES: CLIENT_CATEGORY.SPAIN,
  // EU member states (default B2B, user can switch to B2C)
  AT: 'eu', BE: 'eu', BG: 'eu', CY: 'eu', CZ: 'eu',
  DE: 'eu', DK: 'eu', EE: 'eu', EL: 'eu', FI: 'eu',
  FR: 'eu', HR: 'eu', HU: 'eu', IE: 'eu', IT: 'eu',
  LT: 'eu', LU: 'eu', LV: 'eu', MT: 'eu', NL: 'eu',
  PL: 'eu', PT: 'eu', RO: 'eu', SE: 'eu', SI: 'eu',
  SK: 'eu',
  // UK is third country post-Brexit
  GB: CLIENT_CATEGORY.UK,
  XI: CLIENT_CATEGORY.UK,  // Northern Ireland
  // Everything else
  default: CLIENT_CATEGORY.THIRD_COUNTRY
};
```

### EU VAT Format Validation Patterns

```javascript
// EU VAT number format patterns by country
// Source: European Commission VIES FAQ + Wikipedia VAT Identification Number
const EU_VAT_PATTERNS = {
  AT: /^ATU\d{8}$/,                        // Austria: ATU + 8 digits
  BE: /^BE[01]\d{9}$/,                     // Belgium: BE + 0 or 1 + 9 digits
  BG: /^BG\d{9,10}$/,                      // Bulgaria: 9-10 digits
  CY: /^CY\d{8}[A-Z]$/,                    // Cyprus: 8 digits + letter
  CZ: /^CZ\d{8,10}$/,                      // Czech: 8-10 digits
  DE: /^DE\d{9}$/,                         // Germany: 9 digits
  DK: /^DK\d{8}$/,                         // Denmark: 8 digits
  EE: /^EE\d{9}$/,                         // Estonia: 9 digits
  EL: /^EL\d{9}$/,                         // Greece: EL (not GR!) + 9 digits
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,         // Spain: letter/digit + 7 digits + letter/digit
  FI: /^FI\d{8}$/,                         // Finland: 8 digits
  FR: /^FR[A-Z0-9]{2}\d{9}$/,              // France: 2 chars + 9 digits
  HR: /^HR\d{11}$/,                        // Croatia: 11 digits
  HU: /^HU\d{8}$/,                         // Hungary: 8 digits
  IE: /^IE(\d{7}[A-Z]{1,2}|\d[A-Z+*]\d{5}[A-Z])$/,  // Ireland: complex
  IT: /^IT\d{11}$/,                        // Italy: 11 digits
  LT: /^LT(\d{9}|\d{12})$/,                // Lithuania: 9 or 12 digits
  LU: /^LU\d{8}$/,                         // Luxembourg: 8 digits
  LV: /^LV\d{11}$/,                        // Latvia: 11 digits
  MT: /^MT\d{8}$/,                         // Malta: 8 digits
  NL: /^NL\d{9}B\d{2}$/,                   // Netherlands: 9 digits + B + 2 digits
  PL: /^PL\d{10}$/,                        // Poland: 10 digits
  PT: /^PT\d{9}$/,                         // Portugal: 9 digits
  RO: /^RO\d{2,10}$/,                      // Romania: 2-10 digits
  SE: /^SE\d{12}$/,                        // Sweden: 12 digits
  SI: /^SI\d{8}$/,                         // Slovenia: 8 digits
  SK: /^SK\d{10}$/,                        // Slovakia: 10 digits
  XI: /^XI\d{9}(\d{3})?$/                  // Northern Ireland: 9 or 12 digits
};
```

### Country Flag Emoji Function

```javascript
// Convert ISO 3166-1 alpha-2 country code to flag emoji
// Source: https://www.bqst.fr/country-code-to-flag-emoji/
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Usage: getFlagEmoji('BE') => '🇧🇪'
// Usage: getFlagEmoji('ES') => '🇪🇸'
```

### VIES Validation Architecture

```
+------------------+     +-------------------------+     +------------------+
|  Browser Client  | --> | Supabase Edge Function  | --> |  VIES SOAP API   |
|                  |     |    (CORS-free proxy)    |     |  (ec.europa.eu)  |
+------------------+     +-------------------------+     +------------------+
        |                           |
        v                           v
  Format validation          Full VIES validation
  (always works)             (requires Supabase config)
```

**VIES Proxy Edge Function (Deno/TypeScript):**
```typescript
// supabase/functions/vies-validate/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const VIES_ENDPOINT = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const { countryCode, vatNumber } = await req.json();

  // Build SOAP request
  const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soapenv:Body>
        <urn:checkVat>
          <urn:countryCode>${countryCode}</urn:countryCode>
          <urn:vatNumber>${vatNumber}</urn:vatNumber>
        </urn:checkVat>
      </soapenv:Body>
    </soapenv:Envelope>`;

  const response = await fetch(VIES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body: soapRequest
  });

  const xml = await response.text();

  // Parse response (extract valid, name, address)
  const valid = xml.includes('<valid>true</valid>');
  const nameMatch = xml.match(/<name>([^<]*)<\/name>/);
  const addressMatch = xml.match(/<address>([^<]*)<\/address>/);

  return new Response(JSON.stringify({
    valid,
    name: nameMatch?.[1] || null,
    address: addressMatch?.[1] || null,
    requestDate: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
});
```

### Project Status Auto-Calculation

```javascript
function calculateProjectStatus(project) {
  // Manual override takes precedence
  if (project.status_override) {
    return project.status_override;
  }

  const today = new Date().toISOString().split('T')[0];

  if (!project.start_date) return 'upcoming';
  if (project.start_date > today) return 'upcoming';
  if (!project.end_date || project.end_date >= today) return 'active';
  return 'completed';
}
```

### Anti-Patterns to Avoid

- **Calling VIES from browser:** Will fail with CORS error. Always use Edge Function proxy.
- **Storing tax ID without normalization:** Always uppercase, remove spaces/hyphens.
- **Mixing country code in tax_id:** For EU VAT, store with prefix (BE0411905847). For Spanish NIF/CIF, store without prefix.
- **Hardcoding EU member list:** Keep as config constant, EU membership changes rarely but does change.
- **Assuming VIES always available:** Service has maintenance windows, rate limits. Implement graceful degradation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spanish NIF/CIF/NIE validation | Custom regex | SpanishTaxIdValidator (Phase 13) | Already built, tested, handles all edge cases |
| Money arithmetic | Floating point math | MoneyUtils / currency.js | Already in project, handles rounding correctly |
| Soft delete | Custom deletion logic | Existing pattern with deleted_at | Consistent with entities, invoices, expenses |
| Date handling | Manual string manipulation | ISO 8601 strings | Already the project standard |
| UUID generation | Manual implementation | crypto.randomUUID() | Built into browsers |

**Key insight:** This phase builds on Phase 12-14 patterns. Reuse DataManager.softDelete(), auditFields(), SyncQueue, and MoneyUtils.

## Common Pitfalls

### Pitfall 1: VIES CORS Errors
**What goes wrong:** fetch() to ec.europa.eu fails with "No 'Access-Control-Allow-Origin' header"
**Why it happens:** EU VIES server doesn't send CORS headers, browsers block cross-origin requests
**How to avoid:** Always proxy VIES calls through Supabase Edge Function
**Warning signs:** Works in Node.js/Postman but fails in browser

### Pitfall 2: Greek VAT Country Code
**What goes wrong:** Using 'GR' for Greece VAT numbers fails validation
**Why it happens:** Greece uses 'EL' (Greek language code) not 'GR' (ISO country code) for VAT
**How to avoid:** Map 'GR' to 'EL' when constructing VAT numbers, use 'EL' in patterns
**Warning signs:** Greek clients' VAT numbers always show as invalid

### Pitfall 3: Spanish VAT vs NIF/CIF
**What goes wrong:** Spanish client VAT stored as 'ES12345678A' but SpanishTaxIdValidator expects '12345678A'
**Why it happens:** EU VAT includes country prefix, Spanish domestic NIF doesn't
**How to avoid:** For Spanish clients, use SpanishTaxIdValidator (no prefix). For EU VAT including Spanish, strip 'ES' prefix before validation.
**Warning signs:** Spanish VAT numbers fail validation or are double-prefixed

### Pitfall 4: VIES Service Unavailability
**What goes wrong:** VIES validation fails with MS_UNAVAILABLE or TIMEOUT
**Why it happens:** VIES is federated, individual member state databases can be down
**How to avoid:** Cache successful validations (24-48 hours), allow format-only validation with warning, retry logic
**Warning signs:** Validation fails for entire countries, intermittent failures

### Pitfall 5: Northern Ireland Post-Brexit
**What goes wrong:** XI prefix not recognized, UK clients miscategorized
**Why it happens:** XI is new prefix since Brexit for Northern Ireland goods
**How to avoid:** Include XI in EU VAT patterns, treat XI as special UK case for services
**Warning signs:** Northern Ireland clients can't be validated

### Pitfall 6: Empty States in Detail Page
**What goes wrong:** Client detail page crashes or shows broken UI with no projects/invoices
**Why it happens:** No null checks, assuming arrays always exist
**How to avoid:** Always provide empty state UI, defensive programming
**Warning signs:** New clients cause errors

## Code Examples

Verified patterns from project codebase and official sources:

### Client CRUD with Existing Patterns
```javascript
// Source: Existing EntityManager pattern from Phase 13
const ClientManager = {
  async createClient(clientData) {
    const entityId = EntityContext.entityId;
    if (!entityId) throw new Error('No entity selected');

    // Validate tax ID based on type
    let taxIdValidation;
    if (clientData.country_code === 'ES') {
      taxIdValidation = SpanishTaxIdValidator.validate(clientData.tax_id);
      if (!taxIdValidation.valid) {
        throw new Error(taxIdValidation.error);
      }
      clientData.tax_id = taxIdValidation.normalized;
      clientData.tax_id_type = taxIdValidation.type.toLowerCase();
    } else if (EU_VAT_PATTERNS[clientData.country_code]) {
      // EU VAT format validation
      const normalized = clientData.tax_id.toUpperCase().replace(/[\s-]/g, '');
      if (!EU_VAT_PATTERNS[clientData.country_code].test(normalized)) {
        throw new Error('Formato de NIF-IVA inválido');
      }
      clientData.tax_id = normalized;
      clientData.tax_id_type = 'eu_vat';
    }

    // Build client record
    const client = {
      entity_id: entityId,
      ...clientData,
      deleted_at: null,
      ...auditFields(true)
    };

    const id = await db.clients.add(client);
    await SyncQueue.queueChange('clients', id, 'CREATE', client);

    return id;
  },

  async getClients(options = {}) {
    const entityId = EntityContext.entityId;
    if (!entityId) return [];

    let clients = await db.clients
      .where('[entity_id+deleted_at]')
      .equals([entityId, null])
      .toArray();

    // Sort alphabetically by name (per CONTEXT.md)
    clients.sort((a, b) => a.name.localeCompare(b.name, 'es'));

    return clients;
  },

  async archiveClient(clientId) {
    return DataManager.softDelete('clients', clientId);
  }
};
```

### VIES Validation with Fallback
```javascript
// Source: Architecture pattern for VIES integration
const VIESValidator = {
  // Format-only validation (always works, offline-safe)
  validateFormat(countryCode, vatNumber) {
    const normalized = vatNumber.toUpperCase().replace(/[\s-]/g, '');
    const fullVat = countryCode + normalized;
    const pattern = EU_VAT_PATTERNS[countryCode];

    if (!pattern) {
      return { valid: false, error: 'País no soportado para validación IVA' };
    }

    if (!pattern.test(fullVat)) {
      return { valid: false, error: 'Formato de NIF-IVA inválido' };
    }

    return { valid: true, formatted: fullVat, formatOnly: true };
  },

  // Full VIES validation (requires Supabase Edge Function)
  async validateWithVIES(countryCode, vatNumber) {
    // First, format validation
    const formatResult = this.validateFormat(countryCode, vatNumber);
    if (!formatResult.valid) return formatResult;

    // Check if Supabase is configured
    if (!supabase) {
      return { ...formatResult, warning: 'VIES no disponible en modo offline' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('vies-validate', {
        body: {
          countryCode,
          vatNumber: vatNumber.replace(/[\s-]/g, '')
        }
      });

      if (error) throw error;

      return {
        valid: data.valid,
        formatted: formatResult.formatted,
        name: data.name,
        address: data.address,
        validatedAt: data.requestDate
      };
    } catch (err) {
      console.warn('VIES validation failed:', err);
      // Graceful degradation: return format validation with warning
      return {
        ...formatResult,
        warning: 'VIES no disponible, validación de formato solamente'
      };
    }
  }
};
```

### Client List Rendering with Filters
```javascript
// Source: Pattern from existing scenario cards rendering
function renderClientList(clients, filters = {}) {
  // Apply filters
  let filtered = clients;

  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.tax_id?.toLowerCase().includes(term)
    );
  }

  if (filters.country) {
    filtered = filtered.filter(c => c.country_code === filters.country);
  }

  if (filters.hasActiveProject) {
    // Requires join with projects
    filtered = filtered.filter(c => c._activeProjectCount > 0);
  }

  return filtered.map(client => `
    <div class="client-row" data-id="${client.id}">
      <span class="client-flag">${getFlagEmoji(client.country_code)}</span>
      <span class="client-name">${escapeHtml(client.name)}</span>
      <span class="client-projects">${client._activeProjectCount || 0} projects</span>
      <span class="client-invoiced">${MoneyUtils.formatEuros(client._totalInvoicedCents || 0)}</span>
      <span class="client-last-invoice">${client._lastInvoiceDate || '-'}</span>
    </div>
  `).join('');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct VIES SOAP calls | Edge Function proxy | 2023+ (CORS restrictions) | Must proxy all VIES calls |
| GB for UK VAT | XI for Northern Ireland | 2021 (Brexit) | New country code for NI trade |
| Manual EU country list | Programmatic patterns | Ongoing | Must update when EU membership changes |

**Deprecated/outdated:**
- **GB VAT prefix for NI:** Since Brexit, Northern Ireland uses XI for goods with EU
- **VIES v1 WSDL:** The endpoint is stable but consider retry logic for availability

## Open Questions

Things that couldn't be fully resolved:

1. **Supabase Edge Function deployment without CLI**
   - What we know: Edge Functions require Supabase CLI for deployment
   - What's unclear: How to deploy in single-file HTML project workflow
   - Recommendation: Document Edge Function separately, deploy via Supabase Dashboard or CLI as one-time setup

2. **W-8BEN file storage**
   - What we know: CLIENT-06 requires W-8BEN upload for US clients
   - What's unclear: Whether to store in IndexedDB (base64) or Supabase Storage
   - Recommendation: Store in Supabase Storage if configured, IndexedDB as base64 fallback. Phase 19 (Receipt OCR) will establish file storage patterns.

3. **VIES rate limits**
   - What we know: VIES has undocumented rate limits per IP/session
   - What's unclear: Exact thresholds before MS_MAX_CONCURRENT_REQ errors
   - Recommendation: Cache successful validations for 24 hours, implement exponential backoff

## Sources

### Primary (HIGH confidence)
- SpanishTaxIdValidator implementation in autonomo_dashboard.html (lines 14606-14840)
- Dexie.js database schema in autonomo_dashboard.html (lines 11036-11093)
- [VIES SOAP WSDL](https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl) - Official endpoint documentation
- [EU VAT number formats - Wikipedia](https://en.wikipedia.org/wiki/VAT_identification_number) - Comprehensive format reference

### Secondary (MEDIUM confidence)
- [Getting emoji from country codes with vanilla JavaScript](https://gomakethings.com/getting-emoji-from-country-codes-with-vanilla-javascript/) - Flag emoji function
- [Using the European Commission EU VAT Number validation API](https://ar.al/2021/05/14/using-the-european-commission-eu-vat-number-validation-api-with-node.js) - VIES integration pattern
- [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions) - Proxy architecture
- [jsvat GitHub](https://github.com/se-panfilov/jsvat) - EU VAT regex patterns reference

### Tertiary (LOW confidence)
- [CORS header missing issue](https://github.com/viruschidai/validate-vat/issues/38) - Confirms VIES CORS limitation
- [EU VAT Rates Table 2025](https://www.eurofiscalis.com/en/vat-rates-in-ue/) - Current EU context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project patterns (Dexie, Supabase, SpanishTaxIdValidator)
- Architecture: HIGH - VIES CORS limitation well-documented, proxy pattern standard
- Pitfalls: HIGH - Multiple sources confirm Greek EL code, VIES availability issues
- EU VAT patterns: MEDIUM - Patterns from multiple sources, should verify against VIES FAQ

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, EU membership unlikely to change)
