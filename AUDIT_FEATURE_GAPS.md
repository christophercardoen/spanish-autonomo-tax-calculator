# AUDIT: Feature Gaps & Implementation Plan

**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**File:** AUDIT_FEATURE_GAPS.md

---

## 1. CURRENT FEATURE TESTING RESULTS

### Tax Calculation Engine (Verified Correct)
- IRPF brackets: 19%, 24%, 30%, 37%, 45%, 47% - matches AEAT 2025/2026
- 4-phase Cuota Integra: Minimos reduce tax, not base - correct methodology
- Gastos dificil: 5% with 2,000 EUR cap - correct
- RETA: Fixed 428.40 EUR/month - correct (personal registration amount)
- Minimo personal: 5,550 EUR - correct
- Minimo descendientes: 2,400 EUR (1 child) - correct
- Modelo 130 quarterly estimation: Working correctly

### Input Validation Issues
- `calculateFullIRPFWithFiscal()` accepts NaN, negative numbers, and strings without validation
- No max value guard - entering 999,999,999 doesn't trigger warnings
- No decimal precision control - floating point arithmetic visible in intermediate calculations
- Division by zero possible when annual revenue = 0 and calculating percentages

### Belgium-Specific Limitations (Blocks Generalization)
| Feature | Current (Belgium-only) | Needed (Any Country) |
|---------|----------------------|---------------------|
| Dietas limits | 91.35/48.08 EUR hardcoded | Country-specific per diem rates from AEAT tables |
| Calendar locations | Belgium/Spain/Travel | Dynamic country selection |
| 183-day tracking | Belgium days only | Per-country day counting |
| Compliance | Spain-Belgium treaty only | All 90+ Spanish tax treaties |
| Landing page | "in Belgium" branding | Generic "cross-border" or country-aware |
| OG meta tags | Mentions Belgium | Generic description |
| Work patterns | Belgium commute | Client-location-aware patterns |

### Scenario Engine Testing
- 5 presets (A-E): All calculate correctly
- Custom scenarios: Create/edit/delete working
- Comparison table: Sorting and highlighting working
- Reset to defaults: Working
- **Issue:** Preset values (3K/6K/9K/12K/18K revenue) are user-specific, not generalized templates
- **Issue:** Belgium travel costs hardcoded (1K or 2.5K patterns)

### Calendar Testing
- Month navigation: Working (Feb-Dec range, multi-year)
- Day toggle: Working (Belgium/Spain/Travel)
- 183-day warnings: Working (170/180/183 levels)
- Multi-select: Working (shift-click + checkboxes)
- ICS/CSV export: Working
- Client tagging: Working via IndexedDB
- Work patterns: Working (custom + apply)
- **Issue:** Legacy localStorage coexists with IndexedDB - dual data source

### Expense Tracking Testing
- Create/edit/delete: Working
- Category-aware deductions: Working (autonomo vs SL rules)
- Receipt upload + OCR: Working (Tesseract.js local)
- Dietas validation: Working (advisory warnings)
- Calendar linking: Working
- **Issue:** Expense list pagination missing - will slow with 1000+ expenses

### Client Management Testing
- CRUD: Working
- NIF/CIF validation: Working (format check)
- Country categorization: Working (Spain/EU/UK/US/third)
- Projects per client: Working
- Contacts per client: Working
- Detail view: Working with tabs
- **Issue:** VIES API not connected (Edge Function not deployed)
- **Issue:** W-8BEN upload referenced but no file storage for it

### Invoice Management Testing
- Create with line items: Working
- Sequential numbering: Working (VeriFactu compliant)
- IVA treatment per client category: Working
- IRPF retention for autonomo: Working
- PDF generation: Working (jsPDF + QR)
- Status workflow (Draft/Sent/Paid): Working
- Payment recording: Working
- Factura rectificativa: Working
- **Issue:** Invoice email requires Supabase Edge Function deployment
- **Issue:** No invoice duplication feature (common need)

---

## 2. SPAIN-SPECIFIC REQUIREMENTS AUDIT

### Autonomo Tax Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| RETA contributions (all tranches) | Partial | Fixed cuota only, no tramo calculation |
| Tarifa plana (flat rate, new autonomos) | Missing | No support for 80 EUR reduced rate |
| IRPF quarterly (Modelo 130) | Working | Estimation with cumulative method |
| IRPF quarterly (Modelo 131) | Missing | Modulos system not supported |
| IVA quarterly (Modelo 303) | Missing | Planned for Phase 24 |
| Annual IVA summary (Modelo 390) | Missing | Planned for Phase 24 |
| Annual income tax (Renta) | Partial | IRPF calculation exists, no filing helper |
| Professional retention (15% / 7%) | Working | On invoices to Spanish clients |
| Deductible expenses (30% supply rule) | Working | Home office, vehicle, etc. |
| IAE activity classification | Stored | In entity, but no validation or guidance |
| SII (turnover > threshold) | Missing | Not relevant for most autonomos |
| Recargo de equivalencia | Missing | Retail sector specific |

### SL (Sociedad Limitada) Tax Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| Impuesto de Sociedades (25%/15%) | Missing | Planned for Phase 21 |
| Modelo 200 (annual IS) | Missing | Planned for Phase 21 |
| Modelo 202 (advance IS) | Missing | Planned for Phase 21 |
| Reduced rates (micro-empresa) | Missing | Planned for Phase 21 |
| Director salary vs dividends | Missing | Planned for Phase 23 |
| Employee management | Missing | Out of current scope |
| RETA obligatorio (admin) | Missing | Planned for Phase 23 |
| Annual accounts (Registro Mercantil) | Missing | Planned for Phase 22 |
| Cuentas Anuales (P&L + Balance) | Missing | Planned for Phase 22 |

### International Operations

| Requirement | Status | Notes |
|-------------|--------|-------|
| EU intra-community (ROI) | Partial | Client categorization exists |
| Modelo 349 (recapitulative) | Missing | Planned for Phase 24 |
| Reverse charge mechanism | Working | Invoice shows "inversion sujeto pasivo" |
| IVA rates (21%/10%/4%) | Partial | 21% default, no reduced rates |
| Non-EU operations | Partial | Client category exists, no specific guidance |
| 183-day rule (general) | Working | But Belgium-specific |
| A1 certificate guidance | Missing | Social security coordination |
| Per diem by country | Missing | Only Belgium rates |
| Multi-currency invoicing | Working | EUR/USD/GBP with exchange rate |
| W-8BEN tracking | Stub | Client field exists, no file upload |
| OSS (One-Stop Shop) | Missing | B2C digital services in EU |

### Common Scenarios Coverage

| Scenario | Supported? | Gap |
|----------|-----------|-----|
| 1. Autonomo, Spain-only clients | Mostly | No Modelo 303/390 |
| 2. Autonomo, EU B2B clients | Yes | VIES not connected |
| 3. Autonomo, EU B2C (digital) | No | No OSS support |
| 4. Autonomo, non-EU clients | Partial | No country-specific guidance |
| 5. Autonomo, travel to EU client sites | Belgium only | Need any-country support |
| 6. Autonomo, travel outside EU | No | No non-EU per diem |
| 7. SL, Spain-only | No | No IS calculation |
| 8. SL, EU operations | No | No IS + IVA combined |
| 9. SL, worldwide | No | Depends on Phases 21-24 |
| 10. SL with employees | No | Out of scope |
| 11. SL with subcontractors | No | No contractor management |
| 12. Both autonomo + SL | Partial | Dual activity detected, no optimization |
| 13. New business (tarifa plana) | No | No tarifa plana support |
| 14. Seasonal business | No | No variable income modeling |
| 15. Autonomo-to-SL transition | No | No migration wizard |

---

## 3. FEATURE GAP ANALYSIS

### CRITICAL (Must Have for MVP Launch)

| # | Feature | Why Critical | Effort | Priority |
|---|---------|-------------|--------|----------|
| C-1 | Input validation on tax calculations | Wrong results = legal liability | S | P0 |
| C-2 | Generalize from Belgium to any country | Blocks entire addressable market | XL | P0 |
| C-3 | Connect Supabase authentication | Auth UI built but dead code | M | P0 |
| C-4 | Modelo 303 (IVA quarterly) | Every autonomo must file this | L | P0 |
| C-5 | Modelo 390 (IVA annual summary) | Required annual filing | M | P0 |
| C-6 | Country-specific per diem rates | Belgian rates hardcoded, need AEAT table | M | P0 |
| C-7 | VIES API connection | Edge Function exists but not deployed | S | P0 |
| C-8 | Error messages for users (not console) | Silent failures = lost data | S | P0 |
| C-9 | Data backup/export (JSON) | Users need to protect their data | M | P0 |
| C-10 | GDPR account deletion | Legal requirement in EU | M | P0 |

### IMPORTANT (Should Have for Competitive Position)

| # | Feature | Why Important | Effort | Priority |
|---|---------|-------------|--------|----------|
| I-1 | Impuesto de Sociedades (IS) calculation | 50% of target market is SL | XL | P1 |
| I-2 | Modelo 200/202 | SL quarterly + annual tax | L | P1 |
| I-3 | Tarifa plana support (new autonomos) | ~200K new autonomos/year | S | P1 |
| I-4 | RETA tramo system (not just fixed) | Most autonomos use variable tramos | M | P1 |
| I-5 | Modelo 349 (EU intra-community) | Required for EU B2B operations | M | P1 |
| I-6 | Reduced IVA rates (10%, 4%) | Certain activities use reduced rates | S | P1 |
| I-7 | Receipt OCR via Mindee API | Tesseract local = low accuracy | L | P1 |
| I-8 | Cloud sync (Supabase) | Multi-device access | XL | P1 |
| I-9 | Salary vs dividend optimizer (SL) | #1 SL owner pain point | L | P1 |
| I-10 | Tax calendar with deadlines | Modelo filing dates as reminders | M | P1 |
| I-11 | Invoice duplication | Common workflow shortcut | S | P1 |
| I-12 | Expense pagination/virtual scroll | Performance at scale | M | P1 |

### DIFFERENTIATORS (What Would Make This Special)

| # | Feature | Differentiator | Effort | Priority |
|---|---------|---------------|--------|----------|
| D-1 | AI expense categorization | Auto-detect category from receipt | L | P2 |
| D-2 | Proactive tax optimization tips | "You could save X by..." | L | P2 |
| D-3 | Cash flow forecasting | Project future balance based on patterns | M | P2 |
| D-4 | Upcoming obligation alerts | Push notifications for Modelo deadlines | M | P2 |
| D-5 | Gestor/accountant portal | Read-only access for tax advisor | L | P2 |
| D-6 | Multi-year comparison dashboard | Year-over-year tax trajectory | M | P2 |
| D-7 | Bank statement import (CSV/OFX) | Auto-match expenses to transactions | XL | P2 |
| D-8 | SII integration (direct filing) | Auto-submit to AEAT for large businesses | XL | P2 |
| D-9 | WhatsApp receipt capture | Send photo to WhatsApp bot, auto-creates expense | XL | P2 |
| D-10 | Autonomo-to-SL transition wizard | When revenue > 40K, guide through conversion | L | P2 |

### FUTURE VISION

| # | Feature | Timeline | Effort |
|---|---------|----------|--------|
| F-1 | Multi-language (EN/ES/CA/EU) | Month 3+ | XL |
| F-2 | White-label for gestoria firms | Month 6+ | XL |
| F-3 | Public API for integrations | Month 6+ | XL |
| F-4 | Native mobile app (React Native) | Month 9+ | XL |
| F-5 | Stripe integration for SaaS billing | Month 2 | L |
| F-6 | Bank API (PSD2/Open Banking) | Month 6+ | XL |
| F-7 | AI tax assistant chatbot | Month 6+ | XL |
| F-8 | Marketplace for accountant services | Month 12+ | XL |

---

## 4. EFFORT LEGEND

| Size | Hours | Description |
|------|-------|-------------|
| S | 2-6 | Small change, single function/component |
| M | 6-16 | Medium feature, multiple files/components |
| L | 16-40 | Large feature, new module/system |
| XL | 40-100+ | Major undertaking, architectural change |

---

## 5. RECOMMENDED IMPLEMENTATION ORDER

### Sprint 1 (Week 1-2): Security & Foundation
C-1, C-7, C-8, C-9

### Sprint 2 (Week 3-4): Core Tax Compliance
C-4 (Modelo 303), C-5 (Modelo 390), I-3 (Tarifa plana), I-6 (Reduced IVA)

### Sprint 3 (Week 5-6): Generalization
C-2 (Remove Belgium-specific), C-6 (Country per diem), I-10 (Tax calendar)

### Sprint 4 (Week 7-8): Auth & Cloud
C-3 (Connect Supabase), C-10 (GDPR deletion), I-8 (Cloud sync basics)

### Sprint 5 (Week 9-12): SL Support
I-1 (IS calculation), I-2 (Modelo 200/202), I-9 (Salary vs dividend)

### Sprint 6 (Month 4+): Differentiation
D-1 through D-10 as prioritized by user feedback

---

*Generated: 2026-02-06 by AUDIT Phase 3*
