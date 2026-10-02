import type { Kurse, Yogalehrer, Anmeldungen, Marketing } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface KurseDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Kurse;
  /** N:1-Ziel „Yogalehrer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  yogalehrerList: Yogalehrer[];
  /** Klick auf die Yogalehrer-Relation → overlay.push auf dessen Detail. */
  onOpenYogalehrer?: (record: Yogalehrer) => void;
  /** 1:N „Anmeldungen" (kurs): VOLLE Liste — der Block filtert auf diesen Record. */
  anmeldungenList: Anmeldungen[];
  /** Zeilen-Klick → overlay.push auf das Anmeldungen-Detail (nie der Edit-Dialog). */
  onOpenAnmeldungen: (record: Anmeldungen) => void;
  /** Kontextuelles „+": öffnet den Anmeldungen-Dialog mit diesem Record vorgesetzt. */
  onAddAnmeldungen: () => void;
  /** 1:N „Marketing" (kurs): VOLLE Liste — der Block filtert auf diesen Record. */
  marketingList: Marketing[];
  /** Zeilen-Klick → overlay.push auf das Marketing-Detail (nie der Edit-Dialog). */
  onOpenMarketing: (record: Marketing) => void;
  /** Kontextuelles „+": öffnet den Marketing-Dialog mit diesem Record vorgesetzt. */
  onAddMarketing: () => void;
}

export function KurseDetails({
  record,
  yogalehrerList,
  onOpenYogalehrer,
  anmeldungenList,
  onOpenAnmeldungen,
  onAddAnmeldungen,
  marketingList,
  onOpenMarketing,
  onAddMarketing,
}: KurseDetailsProps) {
  const kursleiterTarget = yogalehrerList.find(r => r.record_id === extractRecordId(record.fields.kursleiter));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('kurse', 'kursname')} value={record.fields.kursname} format="text" />
        <RecordField label={fieldLabel('kurse', 'yogastil')} value={record.fields.yogastil} format="pill" />
        <RecordField label={fieldLabel('kurse', 'niveau')} value={record.fields.niveau} format="pill" />
        <RecordField label={fieldLabel('kurse', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('kurse', 'startdatum')} value={record.fields.startdatum} format="datetime" />
        <RecordField label={fieldLabel('kurse', 'dauer_minuten')} value={record.fields.dauer_minuten} format="text" />
        <RecordField label={fieldLabel('kurse', 'anzahl_termine')} value={record.fields.anzahl_termine} format="text" />
        <RecordField label={fieldLabel('kurse', 'wochentag')} value={record.fields.wochentag} format="pill" />
        <RecordField label={fieldLabel('kurse', 'raum')} value={record.fields.raum} format="text" />
        <RecordField label={fieldLabel('kurse', 'max_teilnehmer')} value={record.fields.max_teilnehmer} format="text" />
        <RecordField label={fieldLabel('kurse', 'preis')} value={record.fields.preis} format="text" />
        <RecordField label={fieldLabel('kurse', 'status')} value={record.fields.status} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('kurse', 'kursleiter')}
          name={kursleiterTarget?.fields.lehrer_firstname ?? '—'}
          meta={[kursleiterTarget?.fields.email, kursleiterTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={kursleiterTarget && onOpenYogalehrer ? () => onOpenYogalehrer!(kursleiterTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anmeldungen')}
        items={anmeldungenList.filter(r => extractRecordId(r.fields.kurs) === record.record_id)}
        map={r => ({ name: appLabel('anmeldungen'), meta: r.fields.anmeldedatum })}
        onOpen={onOpenAnmeldungen}
        onAdd={onAddAnmeldungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('marketing')}
        items={marketingList.filter(r => extractRecordId(r.fields.kurs) === record.record_id)}
        map={() => ({ name: appLabel('marketing'), meta: undefined })}
        onOpen={onOpenMarketing}
        onAdd={onAddMarketing}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.KURSE} recordId={record.record_id} />
    </>
  );
}
