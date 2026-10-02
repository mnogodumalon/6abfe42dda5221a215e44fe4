/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - yogalehrer: lehrer_firstname (Vorname), lehrer_lastname (Nachname)
 *   - teilnehmer: teilnehmer_firstname (Vorname), teilnehmer_lastname (Nachname), email (E-Mail)
 *   - kurse: kursname (Kursname), yogastil (Yogastil), kursleiter (Kursleiter), startdatum (Startdatum mit Uhrzeit)
 *   - anmeldungen: teilnehmer (Teilnehmer), kurs (Kurs), anmeldedatum (Anmeldedatum)
 *   - marketing: kurs (Kurs)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "yogalehrer": "lehrer_firstname" | "lehrer_lastname" | "email" | "telefon" | "schwerpunkte" | "kurzbeschreibung";
  "teilnehmer": "teilnehmer_firstname" | "teilnehmer_lastname" | "email" | "telefon" | "strasse" | "hausnummer" | "plz" | "ort" | "erfahrungslevel" | "gesundheitliche_hinweise";
  "kurse": "kursname" | "yogastil" | "niveau" | "kursleiter" | "beschreibung" | "startdatum" | "dauer_minuten" | "anzahl_termine" | "wochentag" | "raum" | "max_teilnehmer" | "preis" | "status";
  "anmeldungen": "teilnehmer" | "kurs" | "anmeldedatum" | "anmeldestatus" | "zahlungsstatus" | "bemerkung";
  "marketing": "kurs" | "insta_url" | "tiktok_url";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  yogalehrer: { lehrer_firstname: "Bitte den Vornamen eingeben.", lehrer_lastname: "Bitte den Nachnamen eingeben." },
  teilnehmer: { teilnehmer_firstname: "Bitte den Vornamen eingeben.", teilnehmer_lastname: "Bitte den Nachnamen eingeben.", email: "Bitte die E-Mail-Adresse eingeben." },
  kurse: { kursname: "Bitte einen Kursnamen eingeben.", yogastil: "Bitte einen Yogastil wählen.", kursleiter: "Bitte einen Kursleiter auswählen.", startdatum: "Bitte Startdatum und Uhrzeit wählen." },
  anmeldungen: { teilnehmer: "Bitte einen Teilnehmer auswählen.", kurs: "Bitte einen Kurs auswählen.", anmeldedatum: "Bitte das Anmeldedatum wählen." },
  marketing: { kurs: "Bitte einen Kurs auswählen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
