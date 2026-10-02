// Auto-generated. Per-entity form-enhancements config for "Anmeldungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["teilnehmer", "kurs"], "cols": "1fr 1fr"}, "anmeldedatum", {"row": ["anmeldestatus", "zahlungsstatus"], "cols": "1fr 1fr"}, "bemerkung"],
  defaults: {
    'anmeldedatum': { kind: 'today' },
    'anmeldestatus': { kind: 'lookup', key: 'angemeldet', label: 'Angemeldet' },
    'zahlungsstatus': { kind: 'lookup', key: 'offen', label: 'Offen' },
  },
  computed: {
    '_anmeldung_preis': { kind: 'applookup', ownKey: 'kurs', lookupKey: 'preis' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
