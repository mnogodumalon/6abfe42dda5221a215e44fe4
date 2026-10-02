import type { Teilnehmer, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface TeilnehmerDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Teilnehmer;
  /** 1:N „Anmeldungen" (teilnehmer): VOLLE Liste — der Block filtert auf diesen Record. */
  anmeldungenList: Anmeldungen[];
  /** Zeilen-Klick → overlay.push auf das Anmeldungen-Detail (nie der Edit-Dialog). */
  onOpenAnmeldungen: (record: Anmeldungen) => void;
  /** Kontextuelles „+": öffnet den Anmeldungen-Dialog mit diesem Record vorgesetzt. */
  onAddAnmeldungen: () => void;
}

export function TeilnehmerDetails({
  record,
  anmeldungenList,
  onOpenAnmeldungen,
  onAddAnmeldungen,
}: TeilnehmerDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('teilnehmer', 'teilnehmer_firstname')} value={record.fields.teilnehmer_firstname} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'teilnehmer_lastname')} value={record.fields.teilnehmer_lastname} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('teilnehmer', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'plz')} value={record.fields.plz} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'ort')} value={record.fields.ort} format="text" />
        <RecordField label={fieldLabel('teilnehmer', 'erfahrungslevel')} value={record.fields.erfahrungslevel} format="pill" />
        <RecordField label={fieldLabel('teilnehmer', 'gesundheitliche_hinweise')} value={record.fields.gesundheitliche_hinweise} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anmeldungen')}
        items={anmeldungenList.filter(r => extractRecordId(r.fields.teilnehmer) === record.record_id)}
        map={r => ({ name: appLabel('anmeldungen'), meta: r.fields.anmeldedatum })}
        onOpen={onOpenAnmeldungen}
        onAdd={onAddAnmeldungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.TEILNEHMER} recordId={record.record_id} />
    </>
  );
}
