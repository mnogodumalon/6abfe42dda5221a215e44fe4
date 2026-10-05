/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'yogalehrer'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.yogalehrer.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.yogalehrer.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.yogalehrer.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.yogalehrer              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   yogalehrer: lehrer_firstname, lehrer_lastname, email, telefon, schwerpunkte, kurzbeschreibung  ·  ← kurse (list + contextual +)
 *   teilnehmer: teilnehmer_firstname, teilnehmer_lastname, email, telefon, strasse, hausnummer, plz, ort, …  ·  ← anmeldungen (list + contextual +)
 *   kurse: kursname, yogastil, niveau, kursleiter, beschreibung, startdatum, dauer_minuten, anzahl_termine, …  ·  → yogalehrer · ← anmeldungen (list + contextual +) · ← marketing (list + contextual +)
 *   anmeldungen: teilnehmer, kurs, anmeldedatum, anmeldestatus, zahlungsstatus, bemerkung  ·  → teilnehmer · → kurse
 *   marketing: kurs, insta_url, insta_foto, tiktok_url, tiktok_foto  ·  → kurse
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Yogalehrer, Teilnehmer, Kurse, Anmeldungen, Marketing } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichKurse, enrichAnmeldungen, enrichMarketing } from '@/lib/enrich';
import type { EnrichedKurse, EnrichedAnmeldungen, EnrichedMarketing } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { YogalehrerDialog, type YogalehrerDialogDefaults } from '@/components/dialogs/YogalehrerDialog';
import { YogalehrerDetails } from '@/components/details/YogalehrerDetails';
import { TeilnehmerDialog, type TeilnehmerDialogDefaults } from '@/components/dialogs/TeilnehmerDialog';
import { TeilnehmerDetails } from '@/components/details/TeilnehmerDetails';
import { KurseDialog, type KurseDialogDefaults } from '@/components/dialogs/KurseDialog';
import { KurseDetails } from '@/components/details/KurseDetails';
import { AnmeldungenDialog, type AnmeldungenDialogDefaults } from '@/components/dialogs/AnmeldungenDialog';
import { AnmeldungenDetails } from '@/components/details/AnmeldungenDetails';
import { MarketingDialog, type MarketingDialogDefaults } from '@/components/dialogs/MarketingDialog';
import { MarketingDetails } from '@/components/details/MarketingDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'yogalehrer'; record: Yogalehrer }
  | { type: 'teilnehmer'; record: Teilnehmer }
  | { type: 'kurse'; record: EnrichedKurse }
  | { type: 'anmeldungen'; record: EnrichedAnmeldungen }
  | { type: 'marketing'; record: EnrichedMarketing };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  yogalehrer: EntityCrudApi<Yogalehrer, YogalehrerDialogDefaults>;
  teilnehmer: EntityCrudApi<Teilnehmer, TeilnehmerDialogDefaults>;
  kurse: EntityCrudApi<Kurse, KurseDialogDefaults>;
  anmeldungen: EntityCrudApi<Anmeldungen, AnmeldungenDialogDefaults>;
  marketing: EntityCrudApi<Marketing, MarketingDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { yogalehrer: Yogalehrer[]; teilnehmer: Teilnehmer[]; kurse: EnrichedKurse[]; anmeldungen: EnrichedAnmeldungen[]; marketing: EnrichedMarketing[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [yogalehrerDialog, setYogalehrerDialog] = useState<{ defaults?: YogalehrerDialogDefaults; editing?: Yogalehrer } | null>(null);
  const [teilnehmerDialog, setTeilnehmerDialog] = useState<{ defaults?: TeilnehmerDialogDefaults; editing?: Teilnehmer } | null>(null);
  const [kurseDialog, setKurseDialog] = useState<{ defaults?: KurseDialogDefaults; editing?: Kurse } | null>(null);
  const [anmeldungenDialog, setAnmeldungenDialog] = useState<{ defaults?: AnmeldungenDialogDefaults; editing?: Anmeldungen } | null>(null);
  const [marketingDialog, setMarketingDialog] = useState<{ defaults?: MarketingDialogDefaults; editing?: Marketing } | null>(null);
  const enrichedKurse = useMemo(() => enrichKurse(data.kurse, { yogalehrerMap: data.yogalehrerMap }), [data.kurse, data.yogalehrerMap]);
  const enrichedAnmeldungen = useMemo(() => enrichAnmeldungen(data.anmeldungen, { teilnehmerMap: data.teilnehmerMap, kurseMap: data.kurseMap }), [data.anmeldungen, data.teilnehmerMap, data.kurseMap]);
  const enrichedMarketing = useMemo(() => enrichMarketing(data.marketing, { kurseMap: data.kurseMap }), [data.marketing, data.kurseMap]);

  function detailYogalehrer(record: Yogalehrer, push = false) {
    const item: OverlayItem = { type: 'yogalehrer', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitYogalehrer(fields: Yogalehrer['fields']) {
    const editing = yogalehrerDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setYogalehrer(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateYogalehrerEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('yogalehrer')} — ${t('crud_updated')}`, async () => {
        data.setYogalehrer(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateYogalehrerEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createYogalehrerEntry(fields);
      undoToast(`${appLabel('yogalehrer')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailTeilnehmer(record: Teilnehmer, push = false) {
    const item: OverlayItem = { type: 'teilnehmer', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTeilnehmer(fields: Teilnehmer['fields']) {
    const editing = teilnehmerDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTeilnehmer(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTeilnehmerEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('teilnehmer')} — ${t('crud_updated')}`, async () => {
        data.setTeilnehmer(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTeilnehmerEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTeilnehmerEntry(fields);
      undoToast(`${appLabel('teilnehmer')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailKurse(record: Kurse, push = false) {
    const rec = enrichedKurse.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'kurse', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitKurse(fields: Kurse['fields']) {
    const editing = kurseDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setKurse(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateKurseEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('kurse')} — ${t('crud_updated')}`, async () => {
        data.setKurse(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateKurseEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createKurseEntry(fields);
      undoToast(`${appLabel('kurse')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAnmeldungen(record: Anmeldungen, push = false) {
    const rec = enrichedAnmeldungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'anmeldungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAnmeldungen(fields: Anmeldungen['fields']) {
    const editing = anmeldungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAnmeldungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAnmeldungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('anmeldungen')} — ${t('crud_updated')}`, async () => {
        data.setAnmeldungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAnmeldungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAnmeldungenEntry(fields);
      undoToast(`${appLabel('anmeldungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailMarketing(record: Marketing, push = false) {
    const rec = enrichedMarketing.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'marketing', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitMarketing(fields: Marketing['fields']) {
    const editing = marketingDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setMarketing(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateMarketingEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('marketing')} — ${t('crud_updated')}`, async () => {
        data.setMarketing(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateMarketingEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createMarketingEntry(fields);
      undoToast(`${appLabel('marketing')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <YogalehrerDialog
        open={yogalehrerDialog !== null}
        onClose={() => setYogalehrerDialog(null)}
        onSubmit={submitYogalehrer}
        defaultValues={yogalehrerDialog?.defaults}
        recordId={yogalehrerDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Yogalehrer']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Yogalehrer']}
      />
      <TeilnehmerDialog
        open={teilnehmerDialog !== null}
        onClose={() => setTeilnehmerDialog(null)}
        onSubmit={submitTeilnehmer}
        defaultValues={teilnehmerDialog?.defaults}
        recordId={teilnehmerDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Teilnehmer']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Teilnehmer']}
      />
      <KurseDialog
        open={kurseDialog !== null}
        onClose={() => setKurseDialog(null)}
        onSubmit={submitKurse}
        defaultValues={kurseDialog?.defaults}
        recordId={kurseDialog?.editing?.record_id}
        yogalehrerList={data.yogalehrer}
        enablePhotoScan={AI_PHOTO_SCAN['Kurse']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Kurse']}
      />
      <AnmeldungenDialog
        open={anmeldungenDialog !== null}
        onClose={() => setAnmeldungenDialog(null)}
        onSubmit={submitAnmeldungen}
        defaultValues={anmeldungenDialog?.defaults}
        recordId={anmeldungenDialog?.editing?.record_id}
        teilnehmerList={data.teilnehmer}
        kurseList={data.kurse}
        enablePhotoScan={AI_PHOTO_SCAN['Anmeldungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Anmeldungen']}
      />
      <MarketingDialog
        open={marketingDialog !== null}
        onClose={() => setMarketingDialog(null)}
        onSubmit={submitMarketing}
        defaultValues={marketingDialog?.defaults}
        recordId={marketingDialog?.editing?.record_id}
        kurseList={data.kurse}
        enablePhotoScan={AI_PHOTO_SCAN['Marketing']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Marketing']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'yogalehrer') {
            return (
              <>
                <RecordHeader title={top.record.fields.lehrer_firstname ?? appLabel('yogalehrer')} subtitle={undefined} />
                <YogalehrerDetails
                  record={top.record}
                  kurseList={data.kurse}
                  onOpenKurse={(r) => detailKurse(r, true)}
                  onAddKurse={perms.canWrite('kurse') ? () => setKurseDialog({ defaults: { kursleiter: createRecordUrl(APP_IDS.YOGALEHRER, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'teilnehmer') {
            return (
              <>
                <RecordHeader title={top.record.fields.teilnehmer_firstname ?? appLabel('teilnehmer')} subtitle={undefined} />
                <TeilnehmerDetails
                  record={top.record}
                  anmeldungenList={data.anmeldungen}
                  onOpenAnmeldungen={(r) => detailAnmeldungen(r, true)}
                  onAddAnmeldungen={perms.canWrite('anmeldungen') ? () => setAnmeldungenDialog({ defaults: { teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'kurse') {
            return (
              <>
                <RecordHeader title={top.record.fields.kursname ?? appLabel('kurse')} subtitle={top.record.fields.startdatum ? formatDate(top.record.fields.startdatum) : undefined} />
                <KurseDetails
                  record={top.record}
                  yogalehrerList={data.yogalehrer}
                  onOpenYogalehrer={(r) => detailYogalehrer(r, true)}
                  anmeldungenList={data.anmeldungen}
                  onOpenAnmeldungen={(r) => detailAnmeldungen(r, true)}
                  onAddAnmeldungen={perms.canWrite('anmeldungen') ? () => setAnmeldungenDialog({ defaults: { kurs: createRecordUrl(APP_IDS.KURSE, top.record.record_id) } }) : undefined}
                  marketingList={data.marketing}
                  onOpenMarketing={(r) => detailMarketing(r, true)}
                  onAddMarketing={perms.canWrite('marketing') ? () => setMarketingDialog({ defaults: { kurs: createRecordUrl(APP_IDS.KURSE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'anmeldungen') {
            return (
              <>
                <RecordHeader title={appLabel('anmeldungen')} subtitle={top.record.fields.anmeldedatum ? formatDate(top.record.fields.anmeldedatum) : undefined} />
                <AnmeldungenDetails
                  record={top.record}
                  teilnehmerList={data.teilnehmer}
                  onOpenTeilnehmer={(r) => detailTeilnehmer(r, true)}
                  kurseList={data.kurse}
                  onOpenKurse={(r) => detailKurse(r, true)}
                />
              </>
            );
          }
          if (top.type === 'marketing') {
            return (
              <>
                <RecordHeader title={appLabel('marketing')} subtitle={undefined} />
                <MarketingDetails
                  record={top.record}
                  kurseList={data.kurse}
                  onOpenKurse={(r) => detailKurse(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'yogalehrer') return perms.canWrite('yogalehrer');
          if (top.type === 'teilnehmer') return perms.canWrite('teilnehmer');
          if (top.type === 'kurse') return perms.canWrite('kurse');
          if (top.type === 'anmeldungen') return perms.canWrite('anmeldungen');
          if (top.type === 'marketing') return perms.canWrite('marketing');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'yogalehrer') setYogalehrerDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'teilnehmer') setTeilnehmerDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'kurse') setKurseDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'anmeldungen') setAnmeldungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'marketing') setMarketingDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    yogalehrer: {
      openCreate: (defaults?: YogalehrerDialogDefaults) => (perms.canWrite('yogalehrer') ? setYogalehrerDialog({ defaults }) : refuse()),
      openEdit: (record: Yogalehrer) => (perms.canWrite('yogalehrer') ? setYogalehrerDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Yogalehrer) => detailYogalehrer(record, false),
      canWrite: perms.canWrite('yogalehrer'),
    },
    teilnehmer: {
      openCreate: (defaults?: TeilnehmerDialogDefaults) => (perms.canWrite('teilnehmer') ? setTeilnehmerDialog({ defaults }) : refuse()),
      openEdit: (record: Teilnehmer) => (perms.canWrite('teilnehmer') ? setTeilnehmerDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Teilnehmer) => detailTeilnehmer(record, false),
      canWrite: perms.canWrite('teilnehmer'),
    },
    kurse: {
      openCreate: (defaults?: KurseDialogDefaults) => (perms.canWrite('kurse') ? setKurseDialog({ defaults }) : refuse()),
      openEdit: (record: Kurse) => (perms.canWrite('kurse') ? setKurseDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Kurse) => detailKurse(record, false),
      canWrite: perms.canWrite('kurse'),
    },
    anmeldungen: {
      openCreate: (defaults?: AnmeldungenDialogDefaults) => (perms.canWrite('anmeldungen') ? setAnmeldungenDialog({ defaults }) : refuse()),
      openEdit: (record: Anmeldungen) => (perms.canWrite('anmeldungen') ? setAnmeldungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Anmeldungen) => detailAnmeldungen(record, false),
      canWrite: perms.canWrite('anmeldungen'),
    },
    marketing: {
      openCreate: (defaults?: MarketingDialogDefaults) => (perms.canWrite('marketing') ? setMarketingDialog({ defaults }) : refuse()),
      openEdit: (record: Marketing) => (perms.canWrite('marketing') ? setMarketingDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Marketing) => detailMarketing(record, false),
      canWrite: perms.canWrite('marketing'),
    },
    enriched: { yogalehrer: data.yogalehrer, teilnehmer: data.teilnehmer, kurse: enrichedKurse, anmeldungen: enrichedAnmeldungen, marketing: enrichedMarketing },
  };
}
