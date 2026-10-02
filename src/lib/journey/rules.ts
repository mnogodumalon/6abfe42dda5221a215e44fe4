/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'yogalehrer' | 'teilnehmer' | 'kurse' | 'anmeldungen' | 'marketing';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "yogalehrer": "lehrer_firstname" | "lehrer_lastname" | "email" | "telefon" | "kurzbeschreibung";
  "teilnehmer": "teilnehmer_firstname" | "teilnehmer_lastname" | "email" | "telefon" | "strasse" | "hausnummer" | "plz" | "ort" | "gesundheitliche_hinweise";
  "kurse": "kursname" | "beschreibung" | "raum";
  "anmeldungen": "bemerkung";
  "marketing": "insta_url" | "tiktok_url";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "yogalehrer": never;
  "teilnehmer": never;
  "kurse": "kursleiter";
  "anmeldungen": "teilnehmer" | "kurs";
  "marketing": "kurs";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "yogalehrer": {
    "key": "yogalehrer",
    "appId": "6abfe407caf4e0e7dee7d3ee",
    "label": "Yogalehrer",
    "pascal": "Yogalehrer",
    "single": "YogalehrerEntry"
  },
  "teilnehmer": {
    "key": "teilnehmer",
    "appId": "6abfe40d8a183c7a6eb1b497",
    "label": "Teilnehmer",
    "pascal": "Teilnehmer",
    "single": "TeilnehmerEntry"
  },
  "kurse": {
    "key": "kurse",
    "appId": "6abfe40d0129453afb27a8f3",
    "label": "Kurse",
    "pascal": "Kurse",
    "single": "KurseEntry"
  },
  "anmeldungen": {
    "key": "anmeldungen",
    "appId": "6abfe40e2337507fb03ee83a",
    "label": "Anmeldungen",
    "pascal": "Anmeldungen",
    "single": "AnmeldungenEntry"
  },
  "marketing": {
    "key": "marketing",
    "appId": "6abfe40f69b64081afc23880",
    "label": "Marketing",
    "pascal": "Marketing",
    "single": "MarketingEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "yogalehrer": {
    "lehrer_firstname": {
      "key": "lehrer_firstname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "lehrer_lastname": {
      "key": "lehrer_lastname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "schwerpunkte": {
      "key": "schwerpunkte",
      "fulltype": "multiplelookup/checkbox",
      "kind": "multilookup",
      "required": false,
      "label": "Yogastil-Schwerpunkte",
      "writable": true,
      "options": [
        "hatha",
        "vinyasa",
        "ashtanga",
        "yin",
        "kundalini",
        "pilates_yoga",
        "schwangeren_yoga"
      ]
    },
    "kurzbeschreibung": {
      "key": "kurzbeschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Kurzbeschreibung",
      "writable": true
    }
  },
  "teilnehmer": {
    "teilnehmer_firstname": {
      "key": "teilnehmer_firstname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "teilnehmer_lastname": {
      "key": "teilnehmer_lastname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": true,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "strasse": {
      "key": "strasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Straße",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-line1"
    },
    "hausnummer": {
      "key": "hausnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Hausnummer",
      "writable": true,
      "maxLength": 4000
    },
    "plz": {
      "key": "plz",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Postleitzahl",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "postal-code"
    },
    "ort": {
      "key": "ort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Ort",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "erfahrungslevel": {
      "key": "erfahrungslevel",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Erfahrungslevel",
      "writable": true,
      "options": [
        "anfaenger",
        "fortgeschritten",
        "profi"
      ]
    },
    "gesundheitliche_hinweise": {
      "key": "gesundheitliche_hinweise",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Gesundheitliche Hinweise",
      "writable": true
    }
  },
  "kurse": {
    "kursname": {
      "key": "kursname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Kursname",
      "writable": true,
      "maxLength": 4000
    },
    "yogastil": {
      "key": "yogastil",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Yogastil",
      "writable": true,
      "options": [
        "hatha",
        "vinyasa",
        "ashtanga",
        "yin",
        "kundalini",
        "pilates_yoga",
        "schwangeren_yoga"
      ]
    },
    "niveau": {
      "key": "niveau",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Niveau",
      "writable": true,
      "options": [
        "anfaenger",
        "mittelstufe",
        "fortgeschritten",
        "alle_level"
      ]
    },
    "kursleiter": {
      "key": "kursleiter",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Kursleiter",
      "writable": true,
      "targetAppId": "6abfe407caf4e0e7dee7d3ee",
      "targetEntity": "yogalehrer"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "startdatum": {
      "key": "startdatum",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Startdatum mit Uhrzeit",
      "writable": true
    },
    "dauer_minuten": {
      "key": "dauer_minuten",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Dauer pro Termin in Minuten",
      "writable": true
    },
    "anzahl_termine": {
      "key": "anzahl_termine",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Anzahl der Termine",
      "writable": true
    },
    "wochentag": {
      "key": "wochentag",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Wochentag",
      "writable": true,
      "options": [
        "montag",
        "dienstag",
        "mittwoch",
        "donnerstag",
        "freitag",
        "samstag",
        "sonntag"
      ]
    },
    "raum": {
      "key": "raum",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Raum oder Ort",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "max_teilnehmer": {
      "key": "max_teilnehmer",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Maximale Teilnehmerzahl",
      "writable": true
    },
    "preis": {
      "key": "preis",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Preis in Euro",
      "writable": true,
      "format": "currency"
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Kursstatus",
      "writable": true,
      "options": [
        "geplant",
        "anmeldung_offen",
        "ausgebucht",
        "laufend",
        "abgeschlossen",
        "abgesagt"
      ]
    }
  },
  "anmeldungen": {
    "teilnehmer": {
      "key": "teilnehmer",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Teilnehmer",
      "writable": true,
      "targetAppId": "6abfe40d8a183c7a6eb1b497",
      "targetEntity": "teilnehmer"
    },
    "kurs": {
      "key": "kurs",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Kurs",
      "writable": true,
      "targetAppId": "6abfe40d0129453afb27a8f3",
      "targetEntity": "kurse"
    },
    "anmeldedatum": {
      "key": "anmeldedatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Anmeldedatum",
      "writable": true
    },
    "anmeldestatus": {
      "key": "anmeldestatus",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Anmeldestatus",
      "writable": true,
      "options": [
        "angemeldet",
        "bestaetigt",
        "warteliste",
        "storniert"
      ]
    },
    "zahlungsstatus": {
      "key": "zahlungsstatus",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Zahlungsstatus",
      "writable": true,
      "options": [
        "offen",
        "teilweise_bezahlt",
        "bezahlt",
        "erstattet"
      ]
    },
    "bemerkung": {
      "key": "bemerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    }
  },
  "marketing": {
    "kurs": {
      "key": "kurs",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Kurs",
      "writable": true,
      "targetAppId": "6abfe40d0129453afb27a8f3",
      "targetEntity": "kurse"
    },
    "insta_url": {
      "key": "insta_url",
      "fulltype": "string/url",
      "kind": "url",
      "required": false,
      "label": "Instagram-URL",
      "writable": true,
      "autoComplete": "url"
    },
    "insta_foto": {
      "key": "insta_foto",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Instagram-Foto",
      "writable": false
    },
    "tiktok_url": {
      "key": "tiktok_url",
      "fulltype": "string/url",
      "kind": "url",
      "required": false,
      "label": "TikTok-URL",
      "writable": true,
      "autoComplete": "url"
    },
    "tiktok_foto": {
      "key": "tiktok_foto",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "TikTok-Foto",
      "writable": false
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "yogalehrer": [],
  "teilnehmer": [
    {
      "kind": "choice",
      "field": "erfahrungslevel",
      "count": 3
    }
  ],
  "kurse": [
    {
      "kind": "choice",
      "field": "niveau",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 6
    },
    {
      "kind": "record",
      "field": "kursleiter",
      "targetEntity": "yogalehrer"
    }
  ],
  "anmeldungen": [
    {
      "kind": "choice",
      "field": "anmeldestatus",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "zahlungsstatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "teilnehmer",
      "targetEntity": "teilnehmer"
    },
    {
      "kind": "record",
      "field": "kurs",
      "targetEntity": "kurse"
    }
  ],
  "marketing": [
    {
      "kind": "record",
      "field": "kurs",
      "targetEntity": "kurse"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "yogalehrer": [
    "lehrer_firstname"
  ],
  "teilnehmer": [
    "teilnehmer_firstname"
  ],
  "kurse": [
    "kursname"
  ],
  "anmeldungen": [
    "bemerkung"
  ],
  "marketing": [
    "insta_url"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
