import type { Marketing, Kurse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface MarketingDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Marketing;
  /** N:1-Ziel „Kurse": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  kurseList: Kurse[];
  /** Klick auf die Kurse-Relation → overlay.push auf dessen Detail. */
  onOpenKurse?: (record: Kurse) => void;
}

export function MarketingDetails({
  record,
  kurseList,
  onOpenKurse,
}: MarketingDetailsProps) {
  const kursTarget = kurseList.find(r => r.record_id === extractRecordId(record.fields.kurs));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('marketing', 'insta_url')} value={record.fields.insta_url} format="url" />
        <RecordField label={fieldLabel('marketing', 'insta_foto')} className="md:col-span-2">
          {record.fields.insta_foto ? (
            <MediaThumbnail src={record.fields.insta_foto as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('marketing', 'tiktok_url')} value={record.fields.tiktok_url} format="url" />
        <RecordField label={fieldLabel('marketing', 'tiktok_foto')} className="md:col-span-2">
          {record.fields.tiktok_foto ? (
            <MediaThumbnail src={record.fields.tiktok_foto as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('marketing', 'kurs')}
          name={kursTarget?.fields.kursname ?? '—'}
          meta={[kursTarget?.fields.raum].filter(Boolean).join(' · ') || undefined}
          onClick={kursTarget && onOpenKurse ? () => onOpenKurse!(kursTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.MARKETING} recordId={record.record_id} />
    </>
  );
}
