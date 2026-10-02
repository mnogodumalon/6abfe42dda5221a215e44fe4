import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Yogalehrer {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    lehrer_firstname?: string;
    lehrer_lastname?: string;
    email?: string;
    telefon?: string;
    schwerpunkte?: LookupValue[];
    kurzbeschreibung?: string;
  };
}

export interface Teilnehmer {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer_firstname?: string;
    teilnehmer_lastname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    erfahrungslevel?: LookupValue;
    gesundheitliche_hinweise?: string;
  };
}

export interface Kurse {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    kursname?: string;
    yogastil?: LookupValue;
    niveau?: LookupValue;
    kursleiter?: RecordUrl; // applookup -> URL zu 'Yogalehrer' Record
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    dauer_minuten?: number;
    anzahl_termine?: number;
    wochentag?: LookupValue;
    raum?: string;
    max_teilnehmer?: number;
    preis?: number;
    status?: LookupValue;
  };
}

export interface Anmeldungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer?: RecordUrl; // applookup -> URL zu 'Teilnehmer' Record
    kurs?: RecordUrl; // applookup -> URL zu 'Kurse' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    anmeldestatus?: LookupValue;
    zahlungsstatus?: LookupValue;
    bemerkung?: string;
  };
}

export interface Marketing {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    kurs?: RecordUrl; // applookup -> URL zu 'Kurse' Record
    insta_url?: string;
    insta_foto?: string;
    tiktok_url?: string;
    tiktok_foto?: string;
  };
}

export const APP_IDS = {
  YOGALEHRER: '6abfe407caf4e0e7dee7d3ee',
  TEILNEHMER: '6abfe40d8a183c7a6eb1b497',
  KURSE: '6abfe40d0129453afb27a8f3',
  ANMELDUNGEN: '6abfe40e2337507fb03ee83a',
  MARKETING: '6abfe40f69b64081afc23880',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'yogalehrer': {
    schwerpunkte: [{ key: "hatha", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "hatha") ?? "Hatha"; } }, { key: "vinyasa", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "vinyasa") ?? "Vinyasa"; } }, { key: "ashtanga", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "ashtanga") ?? "Ashtanga"; } }, { key: "yin", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "yin") ?? "Yin Yoga"; } }, { key: "kundalini", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "kundalini") ?? "Kundalini"; } }, { key: "pilates_yoga", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "pilates_yoga") ?? "Pilates-Yoga"; } }, { key: "schwangeren_yoga", get label() { return lookupLabel('yogalehrer', 'schwerpunkte', "schwangeren_yoga") ?? "Schwangerenyoga"; } }],
  },
  'teilnehmer': {
    erfahrungslevel: [{ key: "anfaenger", get label() { return lookupLabel('teilnehmer', 'erfahrungslevel', "anfaenger") ?? "Anfänger"; } }, { key: "fortgeschritten", get label() { return lookupLabel('teilnehmer', 'erfahrungslevel', "fortgeschritten") ?? "Fortgeschritten"; } }, { key: "profi", get label() { return lookupLabel('teilnehmer', 'erfahrungslevel', "profi") ?? "Profi"; } }],
  },
  'kurse': {
    yogastil: [{ key: "hatha", get label() { return lookupLabel('kurse', 'yogastil', "hatha") ?? "Hatha"; } }, { key: "vinyasa", get label() { return lookupLabel('kurse', 'yogastil', "vinyasa") ?? "Vinyasa"; } }, { key: "ashtanga", get label() { return lookupLabel('kurse', 'yogastil', "ashtanga") ?? "Ashtanga"; } }, { key: "yin", get label() { return lookupLabel('kurse', 'yogastil', "yin") ?? "Yin Yoga"; } }, { key: "kundalini", get label() { return lookupLabel('kurse', 'yogastil', "kundalini") ?? "Kundalini"; } }, { key: "pilates_yoga", get label() { return lookupLabel('kurse', 'yogastil', "pilates_yoga") ?? "Pilates-Yoga"; } }, { key: "schwangeren_yoga", get label() { return lookupLabel('kurse', 'yogastil', "schwangeren_yoga") ?? "Schwangerenyoga"; } }],
    niveau: [{ key: "anfaenger", get label() { return lookupLabel('kurse', 'niveau', "anfaenger") ?? "Anfänger"; } }, { key: "mittelstufe", get label() { return lookupLabel('kurse', 'niveau', "mittelstufe") ?? "Mittelstufe"; } }, { key: "fortgeschritten", get label() { return lookupLabel('kurse', 'niveau', "fortgeschritten") ?? "Fortgeschritten"; } }, { key: "alle_level", get label() { return lookupLabel('kurse', 'niveau', "alle_level") ?? "Alle Level"; } }],
    wochentag: [{ key: "montag", get label() { return lookupLabel('kurse', 'wochentag', "montag") ?? "Montag"; } }, { key: "dienstag", get label() { return lookupLabel('kurse', 'wochentag', "dienstag") ?? "Dienstag"; } }, { key: "mittwoch", get label() { return lookupLabel('kurse', 'wochentag', "mittwoch") ?? "Mittwoch"; } }, { key: "donnerstag", get label() { return lookupLabel('kurse', 'wochentag', "donnerstag") ?? "Donnerstag"; } }, { key: "freitag", get label() { return lookupLabel('kurse', 'wochentag', "freitag") ?? "Freitag"; } }, { key: "samstag", get label() { return lookupLabel('kurse', 'wochentag', "samstag") ?? "Samstag"; } }, { key: "sonntag", get label() { return lookupLabel('kurse', 'wochentag', "sonntag") ?? "Sonntag"; } }],
    status: [{ key: "geplant", get label() { return lookupLabel('kurse', 'status', "geplant") ?? "Geplant"; } }, { key: "anmeldung_offen", get label() { return lookupLabel('kurse', 'status', "anmeldung_offen") ?? "Anmeldung offen"; } }, { key: "ausgebucht", get label() { return lookupLabel('kurse', 'status', "ausgebucht") ?? "Ausgebucht"; } }, { key: "laufend", get label() { return lookupLabel('kurse', 'status', "laufend") ?? "Laufend"; } }, { key: "abgeschlossen", get label() { return lookupLabel('kurse', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "abgesagt", get label() { return lookupLabel('kurse', 'status', "abgesagt") ?? "Abgesagt"; } }],
  },
  'anmeldungen': {
    anmeldestatus: [{ key: "angemeldet", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "angemeldet") ?? "Angemeldet"; } }, { key: "bestaetigt", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "bestaetigt") ?? "Bestätigt"; } }, { key: "warteliste", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "warteliste") ?? "Warteliste"; } }, { key: "storniert", get label() { return lookupLabel('anmeldungen', 'anmeldestatus', "storniert") ?? "Storniert"; } }],
    zahlungsstatus: [{ key: "offen", get label() { return lookupLabel('anmeldungen', 'zahlungsstatus', "offen") ?? "Offen"; } }, { key: "teilweise_bezahlt", get label() { return lookupLabel('anmeldungen', 'zahlungsstatus', "teilweise_bezahlt") ?? "Teilweise bezahlt"; } }, { key: "bezahlt", get label() { return lookupLabel('anmeldungen', 'zahlungsstatus', "bezahlt") ?? "Bezahlt"; } }, { key: "erstattet", get label() { return lookupLabel('anmeldungen', 'zahlungsstatus', "erstattet") ?? "Erstattet"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'yogalehrer': {
    'lehrer_firstname': 'string/text',
    'lehrer_lastname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'schwerpunkte': 'multiplelookup/checkbox',
    'kurzbeschreibung': 'string/textarea',
  },
  'teilnehmer': {
    'teilnehmer_firstname': 'string/text',
    'teilnehmer_lastname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'erfahrungslevel': 'lookup/radio',
    'gesundheitliche_hinweise': 'string/textarea',
  },
  'kurse': {
    'kursname': 'string/text',
    'yogastil': 'lookup/select',
    'niveau': 'lookup/radio',
    'kursleiter': 'applookup/select',
    'beschreibung': 'string/textarea',
    'startdatum': 'date/datetimeminute',
    'dauer_minuten': 'number',
    'anzahl_termine': 'number',
    'wochentag': 'lookup/select',
    'raum': 'string/text',
    'max_teilnehmer': 'number',
    'preis': 'number',
    'status': 'lookup/radio',
  },
  'anmeldungen': {
    'teilnehmer': 'applookup/select',
    'kurs': 'applookup/select',
    'anmeldedatum': 'date/date',
    'anmeldestatus': 'lookup/radio',
    'zahlungsstatus': 'lookup/radio',
    'bemerkung': 'string/textarea',
  },
  'marketing': {
    'kurs': 'applookup/select',
    'insta_url': 'string/url',
    'insta_foto': 'file',
    'tiktok_url': 'string/url',
    'tiktok_foto': 'file',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateYogalehrer = StripLookup<Yogalehrer['fields']>;
export type CreateTeilnehmer = StripLookup<Teilnehmer['fields']>;
export type CreateKurse = StripLookup<Kurse['fields']>;
export type CreateAnmeldungen = StripLookup<Anmeldungen['fields']>;
export type CreateMarketing = StripLookup<Marketing['fields']>;