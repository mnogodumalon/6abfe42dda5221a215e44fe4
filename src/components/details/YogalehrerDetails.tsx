import type { Yogalehrer, Kurse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface YogalehrerDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Yogalehrer;
  /** 1:N „Kurse" (kursleiter): VOLLE Liste — der Block filtert auf diesen Record. */
  kurseList: Kurse[];
  /** Zeilen-Klick → overlay.push auf das Kurse-Detail (nie der Edit-Dialog). */
  onOpenKurse: (record: Kurse) => void;
  /** Kontextuelles „+": öffnet den Kurse-Dialog mit diesem Record vorgesetzt. */
  onAddKurse?: () => void;
}

export function YogalehrerDetails({
  record,
  kurseList,
  onOpenKurse,
  onAddKurse,
}: YogalehrerDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('yogalehrer', 'lehrer_firstname')} value={record.fields.lehrer_firstname} format="text" />
        <RecordField label={fieldLabel('yogalehrer', 'lehrer_lastname')} value={record.fields.lehrer_lastname} format="text" />
        <RecordField label={fieldLabel('yogalehrer', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('yogalehrer', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('yogalehrer', 'schwerpunkte')} value={Array.isArray(record.fields.schwerpunkte) ? record.fields.schwerpunkte.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('yogalehrer', 'kurzbeschreibung')} value={record.fields.kurzbeschreibung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('kurse')}
        items={kurseList.filter(r => extractRecordId(r.fields.kursleiter) === record.record_id)}
        map={r => ({ name: r.fields.kursname ?? appLabel('kurse'), meta: r.fields.startdatum })}
        onOpen={onOpenKurse}
        onAdd={onAddKurse}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.YOGALEHRER} recordId={record.record_id} readOnly={!perms.canWrite('yogalehrer')} />
    </>
  );
}
