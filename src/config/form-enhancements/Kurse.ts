// Auto-generated. Per-entity form-enhancements config for "Kurse".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["kursname", {"row": ["yogastil", "niveau"], "cols": "1fr 1fr"}, "kursleiter", {"row": ["startdatum", "wochentag"], "cols": "2fr 1fr"}, {"row": ["dauer_minuten", "anzahl_termine"], "cols": "1fr 1fr"}, {"row": ["raum", "max_teilnehmer"], "cols": "2fr 1fr"}, "preis", "status", "beschreibung"],
  defaults: {
    'startdatum': { kind: 'today', withTime: true },
    'anzahl_termine': { kind: 'literal', value: 1 },
    'status': { kind: 'lookup', key: 'geplant', label: 'Geplant' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
