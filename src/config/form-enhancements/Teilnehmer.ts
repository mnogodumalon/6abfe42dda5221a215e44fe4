// Auto-generated. Per-entity form-enhancements config for "Teilnehmer".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["teilnehmer_firstname", "teilnehmer_lastname"], "cols": "1fr 1fr"}, "email", "telefon", {"row": ["strasse", "hausnummer"], "cols": "3fr 1fr"}, {"row": ["plz", "ort"], "cols": "1fr 2fr"}, "erfahrungslevel", "gesundheitliche_hinweise"],
  defaults: {
    'erfahrungslevel': { kind: 'lookup', key: 'anfaenger', label: 'Anfänger' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
