/**
 * useKursAnlegenFlow — the plumbing of the flow « Kurs anlegen und öffnen », generated from the plan.
 *
 * Writes `kurse`: asks `raum`, `preis`, `niveau`, `kursname`, `yogastil`, `wochentag`, `kursleiter`, `startdatum`, `beschreibung`, `dauer_minuten`, `anzahl_termine`, `max_teilnehmer`; sets `status` itself.
Writes `marketing` (only when the person fills it): asks `insta_url`, `tiktok_url`; links `kurs` ← the created `kurse`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useKursAnlegenFlow({
 *     steps: { kursleiter: 1, raum: 2, preis: 2, niveau: 2, kursname: 2, yogastil: 2, wochentag: 2, startdatum: 2, beschreibung: 2, dauer_minuten: 2, anzahl_termine: 2, max_teilnehmer: 2, insta_url: 2, tiktok_url: 2 },
 *     items: { kursleiter: r => ({ id: r.id, title: fieldText(r, 'lehrer_firstname') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.kursleiter.select} {...flow.pick('kursleiter')} />
 *     <Bound form={flow.forms.kurse} name="raum" />
 *     <Bound form={flow.forms.kurse} name="preis" />
 *     <Bound form={flow.forms.kurse} name="niveau" />
 *     <Bound form={flow.forms.kurse} name="kursname" />
 *     <Bound form={flow.forms.kurse} name="yogastil" />
 *     <Bound form={flow.forms.kurse} name="wochentag" />
 *     <Bound form={flow.forms.kurse} name="startdatum" />
 *     <Bound form={flow.forms.kurse} name="beschreibung" />
 *     <Bound form={flow.forms.kurse} name="dauer_minuten" />
 *     <Bound form={flow.forms.kurse} name="anzahl_termine" />
 *     <Bound form={flow.forms.kurse} name="max_teilnehmer" />
 *     <Bound form={flow.forms.marketing} name="insta_url" />
 *     <Bound form={flow.forms.marketing} name="tiktok_url" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type KursAnlegenFieldKey = 'anzahl_termine' | 'beschreibung' | 'dauer_minuten' | 'insta_url' | 'kursleiter' | 'kursname' | 'max_teilnehmer' | 'niveau' | 'preis' | 'raum' | 'startdatum' | 'tiktok_url' | 'wochentag' | 'yogastil';

export interface KursAnlegenForms {
  kurse: StepForm<'kurse'>;
  marketing: StepForm<'marketing'>;
}

// Alias so the option generics stay readable.
type Key = KursAnlegenFieldKey;

export interface KursAnlegenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    kursleiter?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"anzahl_termine": 2, "beschreibung": 2, "dauer_minuten": 2, "insta_url": 2, "kursleiter": 1, "kursname": 2, "max_teilnehmer": 2, "niveau": 2, "preis": 2, "raum": 2, "startdatum": 2, "tiktok_url": 2, "wochentag": 2, "yogastil": 2};
export const KURSANLEGEN_REVIEW_STEP = 3;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useKursAnlegenFlow(options: KursAnlegenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const kurse = useStepForm('kurse', {
    fields: ["raum", "preis", "niveau", "kursname", "yogastil", "wochentag", "kursleiter", "startdatum", "beschreibung", "dauer_minuten", "anzahl_termine", "max_teilnehmer"],
    steps: only(steps, ["raum", "preis", "niveau", "kursname", "yogastil", "wochentag", "kursleiter", "startdatum", "beschreibung", "dauer_minuten", "anzahl_termine", "max_teilnehmer"]) as Record<string, number>,
    // the plan builds a value from these — required here, whatever the app's base view says
    required: { anzahl_termine: true, max_teilnehmer: true, startdatum: true },
    initial: only(options.initial as FormValues | undefined, ["raum", "preis", "niveau", "kursname", "yogastil", "wochentag", "kursleiter", "startdatum", "beschreibung", "dauer_minuten", "anzahl_termine", "max_teilnehmer"]),
    messages: only(options.messages as Record<string, string> | undefined, ["raum", "preis", "niveau", "kursname", "yogastil", "wochentag", "kursleiter", "startdatum", "beschreibung", "dauer_minuten", "anzahl_termine", "max_teilnehmer"]),
  });
  const marketing = useStepForm('marketing', {
    fields: ["insta_url", "tiktok_url"],
    steps: only(steps, ["insta_url", "tiktok_url"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["insta_url", "tiktok_url"]),
    messages: only(options.messages as Record<string, string> | undefined, ["insta_url", "tiktok_url"]),
  });
  const forms: KursAnlegenForms = { kurse, marketing };
  const formList: StepForm[] = [kurse, marketing];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    kursleiter: useRecordSearch(servicePort, 'yogalehrer', withPickPolicy('kursleiter', {
      searchFields: ["lehrer_firstname", "lehrer_lastname"] as never,
      toItem: options.items?.kursleiter as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:kurs-anlegen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:kurs-anlegen:write:${entity}.${field}`,
  });
  const picks = {
    kursleiter: { ...searches.kursleiter, select: { ...searches.kursleiter.select, create: false as boolean, hint: hintFor('kursleiter', 'yogalehrer', null as PickWhere | null) } },
  };

  const marketingFilled = hasValues(marketing);
  const plan: PlanStep[] = [
    {
      key: 'kurse', entity: 'kurse', form: kurse, primary: true,
      values: (): FormValues => ({
        status: policyFixedValue('kurse', 'status') ?? "anmeldung_offen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('kurse', 'status', policyFixedValue('kurse', 'status') ?? "anmeldung_offen")],
    },
    ...(marketingFilled ? [{
      key: 'marketing', entity: 'marketing', form: marketing,      needs: ['kurse'],
      link: { kurs: 'kurse' },
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'kurs-anlegen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: KursAnlegenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: KursAnlegenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'kurs-anlegen' as const,
    draftKey: 'kurs-anlegen' as const,
    entity: 'kurse' as const,
    form: kurse,
    forms, formList, picks, submit, steps,    reviewStep: KURSANLEGEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type KursAnlegenFlow = ReturnType<typeof useKursAnlegenFlow>;
