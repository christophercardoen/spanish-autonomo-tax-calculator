# Phase 13: Multi-Entity Architecture - Research

**Researched:** 2026-02-03
**Domain:** Multi-entity data isolation with IndexedDB/Dexie.js, Spanish business entity types, entity context switching UI
**Confidence:** HIGH (Dexie.js patterns), HIGH (Spanish entity types), MEDIUM (UI patterns for vanilla JS)

## Summary

This phase implements multi-entity architecture allowing users to manage multiple Spanish business entities (Autonomo and/or Sociedad Limitada) from a single account. The research confirms that the existing Phase 12 data architecture with Dexie.js compound indexes provides the foundation for entity isolation via `entity_id` filtering - this is the standard pattern for client-side multi-tenancy.

The critical finding is that Spanish business entities have distinct legal requirements that affect data modeling: **Autonomo** uses NIF (personal) + domicilio fiscal + IAE codes, while **Sociedad Limitada** uses CIF (corporate) + Registro Mercantil reference (Tomo/Folio/Hoja/Inscripcion) + share capital. The system must validate NIF/CIF formats differently and store entity-type-specific fields.

For entity switching, the established pattern is a **context switcher dropdown** in the header/masthead area with clear indication of the active entity. All queries must be scoped to `entity_id` using compound indexes. A global `EntityContext` singleton manages the current entity and notifies observers when it changes.

Dual activity detection (user is both autonomo + SL administrador) is a business logic concern: when a user owns entities of both types, the system should flag this and in Phase 23 calculate combined RETA implications.

**Primary recommendation:** Extend existing Dexie schema with entity-type-specific fields (discriminated union pattern), create EntityContext singleton with observer pattern for reactive UI updates, build accessible dropdown entity switcher, and ensure all data queries filter by current `entity_id`.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie.js | 4.3.0 | IndexedDB wrapper (existing) | Already integrated in Phase 12. Compound indexes enable efficient entity_id filtering. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (No new libraries) | - | - | All requirements achievable with vanilla JS patterns |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla JS Observer | Zustand/Jotai | Overkill for single-file HTML; adds dependency. Observer pattern is simple and sufficient. |
| Custom dropdown | accessible-menu library | Adds dependency. Custom accessible dropdown achievable with proper ARIA attributes. |
| Entity table polymorphism | Separate autonomo_entities/sl_entities tables | More complex schema, harder to query "all entities". Single table with type field is cleaner. |

**Installation:**
No new libraries required. Phase 12 already includes Dexie.js v4.3.0.

## Architecture Patterns

### Recommended Data Model

```javascript
// Entity table schema (extend existing Phase 12 schema)
// Uses discriminated union pattern - common fields + type-specific fields

const ENTITY_TYPE = {
  AUTONOMO: 'autonomo',
  SL: 'sociedad_limitada'
};

// Autonomo entity fields
const autonomoEntity = {
  id: 1,
  type: 'autonomo',

  // Common fields
  name: 'Juan García López',              // Nombre completo

  // Autonomo-specific
  nif: '12345678A',                       // NIF personal (8 digits + letter)
  domicilio_fiscal: 'Calle Mayor 1, 28001 Madrid',
  iae_codes: ['841', '842'],              // Can have multiple IAE codes
  iae_primary: '841',                     // Primary activity code
  fecha_alta: '2024-01-15',               // Date of registration with RETA

  // Metadata
  is_active: true,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  deleted_at: null
};

// SL entity fields
const slEntity = {
  id: 2,
  type: 'sociedad_limitada',

  // Common fields
  name: 'Consultoria Tech SL',            // Razon social

  // SL-specific
  cif: 'B12345678',                       // CIF (letter + 8 chars)
  domicilio_social: 'Paseo de la Castellana 100, 28046 Madrid',

  // Registro Mercantil reference
  registro_mercantil: {
    provincia: 'Madrid',
    tomo: '45097',
    libro: '0',                           // Not always used
    folio: '195',
    seccion: '8',
    hoja: 'M-452031',                     // Province prefix + number
    inscripcion: '1'                      // Inscription number
  },

  fecha_constitucion: '2023-06-01',       // Date of incorporation
  capital_social_cents: 300000,           // 3000 EUR in cents (minimum)

  // Metadata
  is_active: true,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  deleted_at: null
};
```

### Pattern 1: Entity Context Singleton with Observer

**What:** Global singleton that tracks current entity and notifies observers on change

**When to use:** Managing which entity is active, updating UI when entity changes

**Example:**
```javascript
// Source: Observer pattern (patterns.dev/vanilla/observer-pattern)

const EntityContext = (() => {
  let currentEntity = null;
  const observers = new Set();

  return {
    // Get current entity
    get current() {
      return currentEntity;
    },

    // Get current entity ID (convenience)
    get entityId() {
      return currentEntity?.id ?? null;
    },

    // Set current entity and notify observers
    async setEntity(entityId) {
      if (entityId === currentEntity?.id) return;

      const entity = await db.entities.get(entityId);
      if (!entity) throw new Error(`Entity ${entityId} not found`);
      if (entity.deleted_at) throw new Error(`Entity ${entityId} is deleted`);

      currentEntity = entity;

      // Persist selection
      await db.settings.put({
        key: 'current_entity_id',
        value: entityId,
        updated_at: new Date().toISOString()
      });

      // Notify all observers
      this.notify();
    },

    // Clear entity (logout/no entity state)
    clear() {
      currentEntity = null;
      this.notify();
    },

    // Subscribe to changes
    subscribe(callback) {
      observers.add(callback);
      return () => observers.delete(callback); // Unsubscribe function
    },

    // Notify all observers
    notify() {
      observers.forEach(callback => {
        try {
          callback(currentEntity);
        } catch (error) {
          console.error('Observer callback error:', error);
        }
      });
    },

    // Initialize from persisted selection
    async initialize() {
      const setting = await db.settings.get('current_entity_id');
      if (setting?.value) {
        try {
          await this.setEntity(setting.value);
        } catch (error) {
          console.warn('Could not restore entity:', error);
        }
      }
    }
  };
})();

// Usage: Subscribe to entity changes
EntityContext.subscribe((entity) => {
  updateHeaderEntityName(entity);
  refreshCurrentView();
});
```

### Pattern 2: Entity-Scoped Queries with Compound Index

**What:** All data queries filter by current entity_id using compound indexes

**When to use:** Every query for clients, invoices, expenses, calendar, etc.

**Example:**
```javascript
// Source: Dexie.js Compound Index documentation (dexie.org/docs/Compound-Index)

// Schema already defined in Phase 12 with compound indexes:
// clients: '++id, entity_id, ..., [entity_id+deleted_at]'

// Entity-scoped query helpers
const EntityQueries = {
  // Get active records for current entity
  async getActiveClients() {
    const entityId = EntityContext.entityId;
    if (!entityId) return [];

    return db.clients
      .where('[entity_id+deleted_at]')
      .equals([entityId, null])
      .toArray();
  },

  // Get invoices with multiple filters
  async getInvoices({ status, dateFrom, dateTo } = {}) {
    const entityId = EntityContext.entityId;
    if (!entityId) return [];

    let collection = db.invoices
      .where('[entity_id+deleted_at]')
      .equals([entityId, null]);

    // Apply additional filters
    if (status) {
      collection = collection.filter(inv => inv.status === status);
    }
    if (dateFrom) {
      collection = collection.filter(inv => inv.date_issued >= dateFrom);
    }
    if (dateTo) {
      collection = collection.filter(inv => inv.date_issued <= dateTo);
    }

    return collection.toArray();
  },

  // Count pattern for dashboard
  async getEntityStats() {
    const entityId = EntityContext.entityId;
    if (!entityId) return null;

    const [clients, invoices, expenses] = await Promise.all([
      db.clients.where('[entity_id+deleted_at]').equals([entityId, null]).count(),
      db.invoices.where('[entity_id+deleted_at]').equals([entityId, null]).count(),
      db.expenses.where('[entity_id+deleted_at]').equals([entityId, null]).count()
    ]);

    return { clients, invoices, expenses };
  }
};
```

### Pattern 3: NIF/CIF Validation

**What:** Validate Spanish tax identification numbers with check digit algorithm

**When to use:** Creating or editing entity NIF/CIF

**Example:**
```javascript
// Source: GitHub amnesty/dataquality NIF-NIE-CIF validation algorithms

const SpanishTaxIdValidator = {
  // NIF letters for check digit
  NIF_LETTERS: 'TRWAGMYFPDXBNJZSQVHLCKE',

  // CIF control letters
  CIF_CONTROL_LETTERS: 'JABCDEFGHI',

  // CIF types that require letter control digit
  CIF_LETTER_CONTROL: ['K', 'P', 'Q', 'S'],
  // CIF types that require numeric control digit
  CIF_NUMBER_CONTROL: ['A', 'B', 'E', 'H'],

  // Validate NIF (personal - 8 digits + 1 letter)
  validateNIF(nif) {
    if (!nif || typeof nif !== 'string') return { valid: false, error: 'NIF requerido' };

    const cleaned = nif.toUpperCase().replace(/[\s-]/g, '');

    // Check format: 8 digits + 1 letter
    const match = cleaned.match(/^(\d{8})([A-Z])$/);
    if (!match) return { valid: false, error: 'Formato NIF inválido (8 dígitos + letra)' };

    const [, digits, letter] = match;
    const expectedLetter = this.NIF_LETTERS[parseInt(digits) % 23];

    if (letter !== expectedLetter) {
      return { valid: false, error: `Letra de control incorrecta (esperada: ${expectedLetter})` };
    }

    return { valid: true, formatted: cleaned };
  },

  // Validate NIE (foreigner - X/Y/Z + 7 digits + 1 letter)
  validateNIE(nie) {
    if (!nie || typeof nie !== 'string') return { valid: false, error: 'NIE requerido' };

    const cleaned = nie.toUpperCase().replace(/[\s-]/g, '');

    // Check format: X/Y/Z + 7 digits + 1 letter
    const match = cleaned.match(/^([XYZ])(\d{7})([A-Z])$/);
    if (!match) return { valid: false, error: 'Formato NIE inválido (X/Y/Z + 7 dígitos + letra)' };

    const [, prefix, digits, letter] = match;

    // Convert prefix to number: X=0, Y=1, Z=2
    const prefixValue = { X: 0, Y: 1, Z: 2 }[prefix];
    const fullNumber = parseInt(prefixValue + digits);
    const expectedLetter = this.NIF_LETTERS[fullNumber % 23];

    if (letter !== expectedLetter) {
      return { valid: false, error: `Letra de control incorrecta (esperada: ${expectedLetter})` };
    }

    return { valid: true, formatted: cleaned };
  },

  // Validate CIF (corporate - letter + 7 digits + control)
  validateCIF(cif) {
    if (!cif || typeof cif !== 'string') return { valid: false, error: 'CIF requerido' };

    const cleaned = cif.toUpperCase().replace(/[\s-]/g, '');

    // Check format: 1 letter + 7 digits + 1 alphanumeric
    const match = cleaned.match(/^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/);
    if (!match) return { valid: false, error: 'Formato CIF inválido' };

    const [, orgType, digits, control] = match;

    // Calculate control digit
    let sumEven = 0;
    let sumOdd = 0;

    for (let i = 0; i < 7; i++) {
      const digit = parseInt(digits[i]);
      if (i % 2 === 0) {
        // Odd positions (1,3,5,7 in 1-indexed): multiply by 2, sum digits
        const doubled = digit * 2;
        sumOdd += doubled > 9 ? doubled - 9 : doubled;
      } else {
        // Even positions (2,4,6 in 1-indexed): just sum
        sumEven += digit;
      }
    }

    const total = sumEven + sumOdd;
    const lastDigit = total % 10;
    const controlNumber = lastDigit === 0 ? 0 : 10 - lastDigit;
    const controlLetter = this.CIF_CONTROL_LETTERS[controlNumber];

    // Check control based on organization type
    let expectedControl;
    if (this.CIF_LETTER_CONTROL.includes(orgType)) {
      expectedControl = controlLetter;
    } else if (this.CIF_NUMBER_CONTROL.includes(orgType)) {
      expectedControl = String(controlNumber);
    } else {
      // Can be either
      expectedControl = control.match(/\d/) ? String(controlNumber) : controlLetter;
    }

    if (control !== expectedControl) {
      return { valid: false, error: `Dígito de control incorrecto` };
    }

    return {
      valid: true,
      formatted: cleaned,
      organizationType: this.getOrganizationType(orgType)
    };
  },

  // Get organization type from CIF letter
  getOrganizationType(letter) {
    const types = {
      A: 'Sociedad Anónima',
      B: 'Sociedad de Responsabilidad Limitada',
      C: 'Sociedad Colectiva',
      D: 'Sociedad Comanditaria',
      E: 'Comunidad de Bienes',
      F: 'Sociedad Cooperativa',
      G: 'Asociación',
      H: 'Comunidad de Propietarios',
      J: 'Sociedad Civil',
      K: 'Formato antiguo',
      L: 'Formato antiguo',
      M: 'Formato antiguo',
      N: 'Entidad Extranjera',
      P: 'Corporación Local',
      Q: 'Organismo Público',
      R: 'Congregación Religiosa',
      S: 'Órgano de la Administración',
      U: 'Unión Temporal de Empresas',
      V: 'Otros',
      W: 'Establecimiento permanente de entidad no residente'
    };
    return types[letter] || 'Desconocido';
  },

  // Auto-detect and validate
  validate(taxId) {
    const cleaned = (taxId || '').toUpperCase().replace(/[\s-]/g, '');

    // NIF: 8 digits + letter
    if (/^\d{8}[A-Z]$/.test(cleaned)) {
      return { ...this.validateNIF(cleaned), type: 'NIF' };
    }

    // NIE: X/Y/Z + 7 digits + letter
    if (/^[XYZ]\d{7}[A-Z]$/.test(cleaned)) {
      return { ...this.validateNIE(cleaned), type: 'NIE' };
    }

    // CIF: letter + 7 digits + control
    if (/^[A-W]\d{7}[0-9A-J]$/.test(cleaned)) {
      return { ...this.validateCIF(cleaned), type: 'CIF' };
    }

    return { valid: false, error: 'Formato de identificador fiscal no reconocido' };
  }
};
```

### Pattern 4: Entity Switcher UI Component

**What:** Accessible dropdown for switching between entities

**When to use:** Header/masthead area for entity context selection

**Example:**
```javascript
// Source: WAI-ARIA menu role (MDN), Context Selector pattern (PatternFly)

function createEntitySwitcher(containerId) {
  const container = document.getElementById(containerId);

  const template = `
    <div class="entity-switcher" role="combobox" aria-expanded="false"
         aria-haspopup="listbox" aria-labelledby="entity-switcher-label">
      <span id="entity-switcher-label" class="visually-hidden">Seleccionar entidad</span>

      <button class="entity-switcher__trigger"
              aria-describedby="entity-switcher-label"
              type="button">
        <span class="entity-switcher__icon" aria-hidden="true"></span>
        <span class="entity-switcher__name">Seleccionar entidad...</span>
        <span class="entity-switcher__type"></span>
        <svg class="entity-switcher__chevron" aria-hidden="true"
             viewBox="0 0 24 24" width="16" height="16">
          <path d="M7 10l5 5 5-5z" fill="currentColor"/>
        </svg>
      </button>

      <ul class="entity-switcher__menu" role="listbox"
          aria-labelledby="entity-switcher-label" hidden>
        <!-- Entity options populated dynamically -->
      </ul>
    </div>
  `;

  container.innerHTML = template;

  const trigger = container.querySelector('.entity-switcher__trigger');
  const menu = container.querySelector('.entity-switcher__menu');
  const nameEl = container.querySelector('.entity-switcher__name');
  const typeEl = container.querySelector('.entity-switcher__type');
  const iconEl = container.querySelector('.entity-switcher__icon');
  const wrapper = container.querySelector('.entity-switcher');

  let entities = [];
  let isOpen = false;

  // Load entities
  async function loadEntities() {
    entities = await db.entities
      .filter(e => !e.deleted_at && e.is_active)
      .toArray();
    renderMenu();
  }

  // Render menu options
  function renderMenu() {
    const currentId = EntityContext.entityId;

    menu.innerHTML = entities.map(entity => `
      <li class="entity-switcher__option ${entity.id === currentId ? 'entity-switcher__option--active' : ''}"
          role="option"
          data-entity-id="${entity.id}"
          aria-selected="${entity.id === currentId}"
          tabindex="-1">
        <span class="entity-switcher__option-icon" aria-hidden="true">
          ${entity.type === 'autonomo' ? '👤' : '🏢'}
        </span>
        <span class="entity-switcher__option-name">${escapeHtml(entity.name)}</span>
        <span class="entity-switcher__option-type">
          ${entity.type === 'autonomo' ? 'Autónomo' : 'S.L.'}
        </span>
        ${entity.id === currentId ? '<span class="entity-switcher__check" aria-hidden="true">✓</span>' : ''}
      </li>
    `).join('');

    // Add "Create entity" option
    menu.innerHTML += `
      <li class="entity-switcher__divider" role="separator"></li>
      <li class="entity-switcher__option entity-switcher__option--action"
          role="option"
          data-action="create"
          tabindex="-1">
        <span class="entity-switcher__option-icon" aria-hidden="true">➕</span>
        <span class="entity-switcher__option-name">Crear nueva entidad</span>
      </li>
    `;
  }

  // Update trigger display
  function updateTrigger(entity) {
    if (entity) {
      nameEl.textContent = entity.name;
      typeEl.textContent = entity.type === 'autonomo' ? 'Autónomo' : 'S.L.';
      iconEl.textContent = entity.type === 'autonomo' ? '👤' : '🏢';
    } else {
      nameEl.textContent = 'Seleccionar entidad...';
      typeEl.textContent = '';
      iconEl.textContent = '📋';
    }
  }

  // Toggle menu
  function toggleMenu(open) {
    isOpen = open ?? !isOpen;
    wrapper.setAttribute('aria-expanded', isOpen);
    menu.hidden = !isOpen;

    if (isOpen) {
      // Focus first option
      const firstOption = menu.querySelector('[role="option"]');
      if (firstOption) firstOption.focus();
    }
  }

  // Handle selection
  async function selectEntity(entityId) {
    toggleMenu(false);
    trigger.focus();

    if (entityId) {
      await EntityContext.setEntity(entityId);
    }
  }

  // Event listeners
  trigger.addEventListener('click', () => toggleMenu());

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      toggleMenu(true);
    }
  });

  menu.addEventListener('click', (e) => {
    const option = e.target.closest('[role="option"]');
    if (!option) return;

    const action = option.dataset.action;
    if (action === 'create') {
      toggleMenu(false);
      showCreateEntityDialog();
      return;
    }

    const entityId = parseInt(option.dataset.entityId);
    selectEntity(entityId);
  });

  menu.addEventListener('keydown', (e) => {
    const options = Array.from(menu.querySelectorAll('[role="option"]'));
    const currentIndex = options.indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        options[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        options[prevIndex]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        document.activeElement.click();
        break;
      case 'Escape':
        e.preventDefault();
        toggleMenu(false);
        trigger.focus();
        break;
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !container.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Subscribe to entity changes
  EntityContext.subscribe(updateTrigger);

  // Initialize
  loadEntities();
  updateTrigger(EntityContext.current);

  return {
    refresh: loadEntities
  };
}
```

### Pattern 5: Dual Activity Detection

**What:** Detect when user owns both Autonomo and SL entities (administrador societario)

**When to use:** Dashboard display, Phase 23 RETA calculations

**Example:**
```javascript
// Source: Spanish Social Security regulations (RETA)

const DualActivityDetector = {
  // Check if user has both entity types
  async detectDualActivity() {
    const entities = await db.entities
      .filter(e => !e.deleted_at && e.is_active)
      .toArray();

    const hasAutonomo = entities.some(e => e.type === 'autonomo');
    const hasSL = entities.some(e => e.type === 'sociedad_limitada');

    if (hasAutonomo && hasSL) {
      return {
        isDualActivity: true,
        autonomoEntities: entities.filter(e => e.type === 'autonomo'),
        slEntities: entities.filter(e => e.type === 'sociedad_limitada'),
        warning: 'Actividad dual detectada: Autónomo + Administrador SL. ' +
                 'La cotización RETA se calcula sobre la base conjunta de ambas actividades.'
      };
    }

    return { isDualActivity: false };
  },

  // Get combined RETA implications (for Phase 23)
  async getDualActivityRETAImplications() {
    const detection = await this.detectDualActivity();

    if (!detection.isDualActivity) {
      return null;
    }

    // Autonomo societario has higher minimum base (€1,000/month as of 2025)
    // Regular autonomo minimum base varies by tramo
    return {
      type: 'autonomo_societario',
      minimumBase: 100000,          // 1000 EUR in cents
      minimumCuota: 31400,          // 314 EUR in cents (31.4% of 1000)
      note: 'Como administrador de SL con participación significativa, ' +
            'la base mínima de cotización es de 1.000 EUR/mes.'
    };
  }
};
```

### Pattern 6: Entity Archive/Restore

**What:** Soft archive entities (hide from active list, preserve data)

**When to use:** ENTITY-07 requirement - archiving inactive entities

**Example:**
```javascript
// Source: Phase 12 soft delete patterns

const EntityManager = {
  // Archive entity (soft deactivate)
  async archiveEntity(entityId) {
    const entity = await db.entities.get(entityId);
    if (!entity) throw new Error('Entity not found');
    if (!entity.is_active) throw new Error('Entity already archived');

    // Check if this is the current entity
    if (EntityContext.entityId === entityId) {
      // Switch to another active entity first
      const otherEntity = await db.entities
        .filter(e => e.id !== entityId && !e.deleted_at && e.is_active)
        .first();

      if (otherEntity) {
        await EntityContext.setEntity(otherEntity.id);
      } else {
        EntityContext.clear();
      }
    }

    // Archive (set is_active = false)
    await db.entities.update(entityId, {
      is_active: false,
      updated_at: new Date().toISOString()
    });

    // Queue for sync
    await SyncQueue.queueChange('entities', entityId, 'UPDATE', { is_active: false });

    return true;
  },

  // Restore archived entity
  async restoreEntity(entityId) {
    const entity = await db.entities.get(entityId);
    if (!entity) throw new Error('Entity not found');
    if (entity.is_active) throw new Error('Entity already active');
    if (entity.deleted_at) throw new Error('Entity is deleted, cannot restore');

    await db.entities.update(entityId, {
      is_active: true,
      updated_at: new Date().toISOString()
    });

    await SyncQueue.queueChange('entities', entityId, 'UPDATE', { is_active: true });

    return true;
  },

  // Get archived entities
  async getArchivedEntities() {
    return db.entities
      .filter(e => !e.deleted_at && !e.is_active)
      .toArray();
  }
};
```

### Anti-Patterns to Avoid

- **Querying without entity_id filter:** Every data query MUST filter by `EntityContext.entityId`. Forgetting this leaks data between entities.
- **Storing entity_id in global variable:** Use EntityContext singleton with observer pattern, not a raw global variable.
- **Separate tables per entity type:** Use discriminated union (single table with `type` field). Separate tables complicate queries for "all entities".
- **Validating NIF as CIF or vice versa:** Autonomo uses NIF (personal), SL uses CIF (corporate). Different validation algorithms.
- **Hard-deleting entities:** Always soft archive (is_active = false). Entity data includes linked invoices/expenses with 4-year retention.
- **Blocking UI during entity switch:** Entity switch should be instant (local IndexedDB). Don't show loading spinner for local operations.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| NIF/CIF validation | Basic regex check | Full algorithm with check digit | Check digit catches typos, required for legal compliance |
| Entity isolation queries | Ad-hoc .filter() calls | Compound indexes with .where() | Performance: compound index is O(log n), filter is O(n) |
| Context state propagation | Manual DOM updates | Observer pattern with subscribe() | Automatic updates, no forgotten stale UI |
| Dropdown accessibility | Custom keyboard handling | WAI-ARIA roles + standard keyboard events | Accessibility compliance, screen reader support |
| Entity type determination | String comparison | ENTITY_TYPE constants | Typo-proof, IDE autocomplete |

**Key insight:** Entity isolation is a cross-cutting concern. Every feature in subsequent phases (clients, invoices, expenses, calendar) must filter by entity_id. Establishing the EntityContext pattern now ensures consistency.

## Common Pitfalls

### Pitfall 1: Entity Data Leakage

**What goes wrong:** User sees data from another entity (invoices, clients, etc.)

**Why it happens:** Developer forgot to filter by entity_id in a query

**How to avoid:**
1. Use EntityQueries helper for all data access
2. Add entity_id to compound indexes (already done in Phase 12)
3. Code review checklist: "Does this query filter by entity_id?"

**Warning signs:** User reports seeing "wrong" data, data disappears when switching entities

### Pitfall 2: Invalid NIF/CIF Accepted

**What goes wrong:** System accepts invalid tax ID, later rejected by AEAT/VeriFactu

**Why it happens:** Using regex-only validation without check digit verification

**How to avoid:**
1. Use full SpanishTaxIdValidator with check digit algorithm
2. Validate on input (blur event) with visual feedback
3. Re-validate before saving

**Warning signs:** Users complaining about "invalid NIF" errors from external systems

### Pitfall 3: Current Entity Lost on Refresh

**What goes wrong:** User refreshes page, loses entity context, sees blank state

**Why it happens:** Entity selection not persisted to IndexedDB

**How to avoid:**
1. EntityContext.setEntity() persists to settings table
2. EntityContext.initialize() restores on app load
3. Call initialize() in initializeDatabase() after db.open()

**Warning signs:** Users reporting "I have to select my entity every time"

### Pitfall 4: Entity Switcher Not Accessible

**What goes wrong:** Keyboard users can't switch entities, screen readers don't announce options

**Why it happens:** Missing ARIA attributes, no keyboard event handlers

**How to avoid:**
1. Use role="combobox" + role="listbox" + role="option"
2. Implement ArrowUp/ArrowDown/Enter/Escape keyboard handling
3. Use aria-selected for current option
4. Test with screen reader (VoiceOver, NVDA)

**Warning signs:** Accessibility audit failures, keyboard navigation doesn't work

### Pitfall 5: Dual Activity Not Detected

**What goes wrong:** User owns both Autonomo + SL but system doesn't flag RETA implications

**Why it happens:** Detection logic not run, or run only on dashboard

**How to avoid:**
1. Run DualActivityDetector on entity creation/restore
2. Show persistent banner when dual activity detected
3. Include warning in tax calculation views (Phase 20/21)

**Warning signs:** User surprised by RETA regularization, gestor complains about incorrect calculations

### Pitfall 6: Archived Entity Still Appears

**What goes wrong:** Archived entity shows in entity switcher or is accidentally selected

**Why it happens:** Query doesn't filter by is_active, or EntityContext allows archived entity

**How to avoid:**
1. Entity switcher loads only `is_active = true` entities
2. EntityContext.setEntity() rejects archived entities
3. Archive switches to another entity first if archiving current

**Warning signs:** Users can select archived entities, data appears from archived entities

## Code Examples

### Complete Entity Creation Flow

```javascript
// Source: Spanish business entity requirements, Phase 12 patterns

async function createEntity(entityData) {
  const { type, ...data } = entityData;

  // Validate type
  if (!Object.values(ENTITY_TYPE).includes(type)) {
    throw new Error(`Invalid entity type: ${type}`);
  }

  // Validate tax ID based on type
  if (type === ENTITY_TYPE.AUTONOMO) {
    const nifResult = SpanishTaxIdValidator.validateNIF(data.nif);
    if (!nifResult.valid) {
      throw new Error(`NIF inválido: ${nifResult.error}`);
    }
    data.nif = nifResult.formatted;
  } else {
    const cifResult = SpanishTaxIdValidator.validateCIF(data.cif);
    if (!cifResult.valid) {
      throw new Error(`CIF inválido: ${cifResult.error}`);
    }
    data.cif = cifResult.formatted;
  }

  // Check for duplicate NIF/CIF
  const existingTaxId = type === ENTITY_TYPE.AUTONOMO ? data.nif : data.cif;
  const duplicate = await db.entities
    .where('nif_cif')
    .equals(existingTaxId)
    .filter(e => !e.deleted_at)
    .first();

  if (duplicate) {
    throw new Error(`Ya existe una entidad con este ${type === ENTITY_TYPE.AUTONOMO ? 'NIF' : 'CIF'}`);
  }

  // Create entity
  const entity = {
    type,
    nif_cif: existingTaxId,  // Indexed field for lookups
    name: data.name,
    is_active: true,
    ...data,
    ...auditFields(true)
  };

  const id = await db.entities.add(entity);

  // Queue for sync
  await SyncQueue.queueChange('entities', id, 'CREATE', entity);

  // Check dual activity
  const dualActivity = await DualActivityDetector.detectDualActivity();
  if (dualActivity.isDualActivity) {
    showNotification({
      level: 'info',
      message: dualActivity.warning,
      duration: 10000
    });
  }

  // Auto-select if first entity
  const entityCount = await db.entities
    .filter(e => !e.deleted_at && e.is_active)
    .count();

  if (entityCount === 1) {
    await EntityContext.setEntity(id);
  }

  return id;
}
```

### Entity Switcher CSS

```css
/* Entity Switcher Styles */
.entity-switcher {
  position: relative;
  font-family: 'DM Sans', sans-serif;
}

.entity-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary, #252525);
  border: 1px solid var(--border-color, #3a3a3a);
  border-radius: 6px;
  color: var(--text-primary, #fff);
  cursor: pointer;
  min-width: 200px;
  transition: border-color 0.15s, background-color 0.15s;
}

.entity-switcher__trigger:hover {
  background: var(--bg-hover, #2a2a2a);
  border-color: var(--border-hover, #4a4a4a);
}

.entity-switcher__trigger:focus {
  outline: 2px solid var(--accent-color, #3b82f6);
  outline-offset: 2px;
}

.entity-switcher__icon {
  font-size: 18px;
}

.entity-switcher__name {
  flex: 1;
  text-align: left;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entity-switcher__type {
  font-size: 11px;
  color: var(--text-secondary, #888);
  background: var(--bg-tertiary, #333);
  padding: 2px 6px;
  border-radius: 4px;
}

.entity-switcher__chevron {
  transition: transform 0.15s;
}

.entity-switcher[aria-expanded="true"] .entity-switcher__chevron {
  transform: rotate(180deg);
}

.entity-switcher__menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 4px 0;
  background: var(--bg-secondary, #252525);
  border: 1px solid var(--border-color, #3a3a3a);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}

.entity-switcher__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.entity-switcher__option:hover,
.entity-switcher__option:focus {
  background: var(--bg-hover, #2a2a2a);
  outline: none;
}

.entity-switcher__option--active {
  background: var(--bg-active, #1e3a5f);
}

.entity-switcher__option--action {
  color: var(--accent-color, #3b82f6);
}

.entity-switcher__option-name {
  flex: 1;
}

.entity-switcher__option-type {
  font-size: 11px;
  color: var(--text-secondary, #888);
}

.entity-switcher__check {
  color: var(--success-color, #22c55e);
}

.entity-switcher__divider {
  height: 1px;
  margin: 4px 0;
  background: var(--border-color, #3a3a3a);
}

/* Visually hidden for screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate databases per tenant | Shared database with tenant_id filter | Always for IndexedDB | Single database is simpler, compound indexes make filtering efficient |
| Global variables for context | Singleton with Observer pattern | ~2020 | Reactive UI updates, no stale state |
| Custom dropdown | ARIA combobox pattern | WAI-ARIA 1.2 (2021) | Accessibility compliance, consistent keyboard behavior |
| Regex-only NIF validation | Full check digit algorithm | Always required | Legal compliance, catches typos |

**Deprecated/outdated:**
- Web SQL for multi-tenant: Deprecated. Use IndexedDB via Dexie.js.
- localStorage for entity state: Too simple. Use IndexedDB settings table for persistence.
- iframes for entity isolation: Overkill for same-origin data. Use entity_id filtering.

## Open Questions

### 1. Registro Mercantil Data Entry UX

**What we know:** SL entities require Tomo/Folio/Hoja/Inscripcion from Registro Mercantil
**What's unclear:** Should we validate this data, or just store as entered?
**Recommendation:** Store as entered (no validation). This data comes from official documents; user transcribes. Validation would require API access to Registro Mercantil which doesn't exist publicly.

### 2. IAE Code Selection

**What we know:** Autonomo entities have IAE codes from AEAT list
**What's unclear:** Should we include full IAE code picker, or free-text entry?
**Recommendation:** Free-text entry for now with format hint (e.g., "841"). Full IAE picker is nice-to-have for Phase 29 (Settings) but not MVP for Phase 13.

### 3. Entity Switching During Form Edit

**What we know:** User might switch entity while editing an invoice/expense
**What's unclear:** Should we warn/block, or silently discard unsaved changes?
**Recommendation:** Warn with dialog: "You have unsaved changes. Switch entity anyway?" This is a UX concern for Phase 18 (Invoice Generation) to implement.

### 4. Maximum Entities per User

**What we know:** Most users will have 1-3 entities
**What's unclear:** Should we limit maximum entities?
**Recommendation:** No limit for now. IndexedDB can handle hundreds of entities. Revisit if performance issues arise.

## Sources

### Primary (HIGH confidence)

- [Dexie.js Compound Index Documentation](https://dexie.org/docs/Compound-Index) - Compound index syntax, query patterns
- [Dexie.js Table.where()](https://dexie.org/docs/Table/Table.where()) - Query syntax with arrays
- [GitHub: amnesty/dataquality NIF-NIE-CIF](https://github.com/amnesty/dataquality/wiki/NIF,-NIE-&-CIF) - Spanish tax ID validation algorithms
- [MDN: ARIA menu role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role) - Accessible dropdown patterns
- [patterns.dev Observer Pattern](https://www.patterns.dev/vanilla/observer-pattern/) - JavaScript observer pattern implementation

### Secondary (MEDIUM confidence)

- [Strong Abogados: Business Types in Spain](https://www.strongabogados.com/business) - Autonomo vs SL requirements
- [Lawants: Company Registration Spain 2026](https://www.lawants.com/en/company-registration-spain/) - SL registration process
- [Rosa Allegue: CIF Validation Algorithm](https://rosaallegue.com/2018/06/29/cif-tax-identification-number-for-legal-entities-in-spain-how-to-calculate-digit-control-and-to-validate/) - CIF check digit calculation
- [InfoAutonomos: IAE Epigrafes](https://www.infoautonomos.com/fiscalidad/los-epigrafes-iae/) - IAE code structure
- [Legalitas: Autonomo Societario](https://www.legalitas.com/actualidad/guia-completa-sobre-el-autonomo-societario) - Dual activity RETA implications

### Tertiary (LOW confidence)

- [Medium: Context Switcher UX](https://medium.com/ux-power-tools/breaking-down-the-ux-of-switching-accounts-in-web-apps-501813a5908b) - Account switcher UX patterns
- [PatternFly: Context Selector](https://pf3.patternfly.org/v3/pattern-library/navigation/context-selector/) - Enterprise context switching pattern

## Metadata

**Confidence breakdown:**
- Dexie.js patterns: HIGH - Official documentation, already using in Phase 12
- Spanish entity types: HIGH - Multiple official sources, legal requirements well-documented
- NIF/CIF validation: HIGH - Algorithm documented in multiple sources with code examples
- UI patterns: MEDIUM - No single authoritative source for vanilla JS, but WAI-ARIA is well-documented
- Dual activity detection: MEDIUM-HIGH - Business rules clear, implementation straightforward

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - Spanish regulations stable, Dexie.js mature)
