import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { IconAlertTriangle, IconCash, IconHourglass, IconPlus, IconUsers } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { Anmeldungen, Kurse } from '@/types/app';
import { lookupOption } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { formatDate, formatCurrency, lookupKey } from '@/lib/formatters';
import { tx, dateFnsLocale } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { Button } from '@/components/ui/button';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';

type Filter = 'all' | 'unpaid' | 'wait';

const OPEN_STATES = ['anmeldung_offen', 'ausgebucht', 'laufend'];
const DONE_STATES = ['abgeschlossen', 'abgesagt'];

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { kurse, anmeldungen, marketing, fetchAll, setKurse, setAnmeldungen } = data;
  const clock = useClock();
  const [filter, setFilter] = useState<Filter>('all');

  // ONE write path per entity — used by hero, work lists, board and overlay footer.
  const patchAnmeldung = (rec: Anmeldungen, patch: { anmeldestatus?: string; zahlungsstatus?: string }, msg: string) => {
    const prevFields = rec.fields;
    const next = { ...rec.fields };
    if (patch.anmeldestatus) next.anmeldestatus = lookupOption('anmeldungen', 'anmeldestatus', patch.anmeldestatus);
    if (patch.zahlungsstatus) next.zahlungsstatus = lookupOption('anmeldungen', 'zahlungsstatus', patch.zahlungsstatus);
    setAnmeldungen(list => list.map(a => (a.record_id === rec.record_id ? { ...a, fields: next } : a)));
    LivingAppsService.updateAnmeldungenEntry(rec.record_id, patch).catch(() => fetchAll());
    undoToast(msg, () => {
      setAnmeldungen(list => list.map(a => (a.record_id === rec.record_id ? { ...a, fields: prevFields } : a)));
      const back: { anmeldestatus?: string; zahlungsstatus?: string } = {};
      if (patch.anmeldestatus) back.anmeldestatus = lookupKey(prevFields.anmeldestatus);
      if (patch.zahlungsstatus) back.zahlungsstatus = lookupKey(prevFields.zahlungsstatus);
      LivingAppsService.updateAnmeldungenEntry(rec.record_id, back).catch(() => fetchAll());
    });
  };

  const setKursStatus = (rec: Kurse, status: string, msg: string): string | undefined => {
    const prevFields = rec.fields;
    setKurse(list => list.map(k => (k.record_id === rec.record_id
      ? { ...k, fields: { ...k.fields, status: lookupOption('kurse', 'status', status) } } : k)));
    LivingAppsService.updateKurseEntry(rec.record_id, { status }).catch(() => fetchAll());
    undoToast(msg, () => {
      setKurse(list => list.map(k => (k.record_id === rec.record_id ? { ...k, fields: prevFields } : k)));
      LivingAppsService.updateKurseEntry(rec.record_id, { status: lookupKey(prevFields.status) }).catch(() => fetchAll());
    });
    return undefined;
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'anmeldungen') {
        const r = top.record;
        if (lookupKey(r.fields.anmeldestatus) === 'warteliste') {
          return { label: tx('Von Warteliste bestätigen'), onClick: () => patchAnmeldung(r, { anmeldestatus: 'bestaetigt' }, tx('Anmeldung bestätigt')) };
        }
        const pay = lookupKey(r.fields.zahlungsstatus);
        if (lookupKey(r.fields.anmeldestatus) !== 'storniert' && (pay === 'offen' || pay === 'teilweise_bezahlt')) {
          return { label: tx('Als bezahlt markieren'), onClick: () => patchAnmeldung(r, { zahlungsstatus: 'bezahlt' }, tx('Zahlung verbucht')) };
        }
      }
      if (top.type === 'kurse' && lookupKey(top.record.fields.status) === 'geplant') {
        const r = top.record;
        return { label: tx('Anmeldung öffnen'), onClick: () => setKursStatus(r, 'anmeldung_offen', tx('Anmeldung geöffnet')) };
      }
      return undefined;
    },
  });
  const enrichedKurse = crud.enriched.kurse;
  const enrichedAnmeldungen = crud.enriched.anmeldungen;

  const today = format(clock, 'yyyy-MM-dd');

  // Per-course counters
  const stats = useMemo(() => {
    const m = new Map<string, { active: number; wait: number; unpaid: number }>();
    for (const a of anmeldungen) {
      const id = extractRecordId(a.fields.kurs);
      if (!id) continue;
      const s = m.get(id) ?? { active: 0, wait: 0, unpaid: 0 };
      const st = lookupKey(a.fields.anmeldestatus);
      const pay = lookupKey(a.fields.zahlungsstatus);
      if (st === 'warteliste') s.wait++;
      else if (st !== 'storniert') {
        s.active++;
        if (pay === 'offen' || pay === 'teilweise_bezahlt') s.unpaid++;
      }
      m.set(id, s);
    }
    return m;
  }, [anmeldungen]);
  const statOf = (id: string) => stats.get(id) ?? { active: 0, wait: 0, unpaid: 0 };

  const kurseMitMarketing = useMemo(() => {
    const s = new Set<string>();
    marketing.forEach(m => { const id = extractRecordId(m.fields.kurs); if (id) s.add(id); });
    return s;
  }, [marketing]);

  const kursById = useMemo(() => new Map(kurse.map(k => [k.record_id, k])), [kurse]);

  const unpaid = enrichedAnmeldungen.filter(a => {
    const st = lookupKey(a.fields.anmeldestatus);
    const pay = lookupKey(a.fields.zahlungsstatus);
    return st !== 'storniert' && st !== 'warteliste' && (pay === 'offen' || pay === 'teilweise_bezahlt');
  });
  const unpaidSum = unpaid.reduce((sum, a) => sum + (kursById.get(extractRecordId(a.fields.kurs) ?? '')?.fields.preis ?? 0), 0);
  const waiting = enrichedAnmeldungen.filter(a => lookupKey(a.fields.anmeldestatus) === 'warteliste');

  const openCourses = enrichedKurse.filter(k => OPEN_STATES.includes(lookupKey(k.fields.status) ?? ''));
  const belegt = openCourses.reduce((s, k) => s + statOf(k.record_id).active, 0);
  const kapazitaet = openCourses.reduce((s, k) => s + (k.fields.max_teilnehmer ?? 0), 0);

  const fullOpen = enrichedKurse.filter(k => {
    const max = k.fields.max_teilnehmer ?? 0;
    return lookupKey(k.fields.status) === 'anmeldung_offen' && max > 0 && statOf(k.record_id).active >= max;
  });

  const ohneMarketing = enrichedKurse
    .filter(k => !DONE_STATES.includes(lookupKey(k.fields.status) ?? '') && !kurseMitMarketing.has(k.record_id))
    .sort((a, b) => (a.fields.startdatum ?? '').localeCompare(b.fields.startdatum ?? ''));

  const upcoming = enrichedKurse
    .filter(k => (k.fields.startdatum ?? '').slice(0, 10) >= today && !DONE_STATES.includes(lookupKey(k.fields.status) ?? ''))
    .sort((a, b) => (a.fields.startdatum ?? '').localeCompare(b.fields.startdatum ?? ''));

  // Board
  const columns: KanbanColumn[] = ['geplant', 'anmeldung_offen', 'ausgebucht', 'laufend', 'abgeschlossen', 'abgesagt']
    .map(k => { const o = lookupOption('kurse', 'status', k); return { key: o.key, label: o.label }; });

  const toneFor = (status: string | undefined): KanbanTone => {
    if (status === 'anmeldung_offen') return 'primary';
    if (status === 'ausgebucht' || status === 'laufend') return 'success';
    return 'default';
  };

  const cards: KanbanCard[] = enrichedKurse
    .filter(k => {
      const s = statOf(k.record_id);
      if (filter === 'unpaid') return s.unpaid > 0;
      if (filter === 'wait') return s.wait > 0;
      return true;
    })
    .sort((a, b) => (a.fields.startdatum ?? '').localeCompare(b.fields.startdatum ?? ''))
    .map(k => {
      const s = statOf(k.record_id);
      const max = k.fields.max_teilnehmer;
      const belegung = max ? `${s.active}/${max}` : `${s.active}`;
      const parts = [
        formatDate(k.fields.startdatum),
        tx`${belegung} angemeldet`,
        s.wait > 0 ? tx`${s.wait} auf Warteliste` : '',
      ].filter(Boolean);
      const status = lookupKey(k.fields.status) ?? 'geplant';
      return {
        id: `kurs:${k.record_id}`,
        column: status,
        title: k.fields.kursname ?? '—',
        subtitle: parts.join(' · '),
        tone: toneFor(status),
      };
    });

  const moveCard = (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    const rec = kursById.get(rid ?? '');
    if (!rec || lookupKey(rec.fields.status) === newColumn) return;
    setKursStatus(rec, newColumn, tx`${rec.fields.kursname ?? ''} → ${lookupOption('kurse', 'status', newColumn).label}`);
  };

  // Context line — names in every branch
  const next = upcoming[0];
  const nextDay = next?.fields.startdatum
    ? format(parseISO(next.fields.startdatum), 'EEEE', { locale: dateFnsLocale() }) : '';
  const wartNamen = namen(waiting.map(a => a.teilnehmerName));
  const unpaidNamen = namen(unpaid.map(a => a.teilnehmerName));
  let context: string;
  if (waiting.length > 0) context = tx`Auf der Warteliste stehen ${wartNamen} — ein Platz frei?`;
  else if (unpaid.length > 0) context = tx`Bei ${unpaidNamen} ist die Zahlung noch offen.`;
  else if (next) context = tx`Als Nächstes startet ${next.fields.kursname ?? ''} (${nextDay}).`;
  else context = tx`Noch kein Kurs geplant — lege den ersten Kurs an.`;

  const empty = kurse.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        <Button onClick={() => crud.kurse.openCreate({ status: 'geplant' })} className="shrink-0">
          <IconPlus size={16} className="shrink-0" />
          <span>{empty ? tx('Ersten Kurs anlegen') : tx('Neuer Kurs')}</span>
        </Button>
      </div>

      <DashboardGrid
        variant="wide"
        hero={fullOpen.length > 0 && (
          <HeroBanner
            icon={<IconAlertTriangle size={18} />}
            action={{
              label: tx('Als ausgebucht markieren'),
              onClick: () => setKursStatus(fullOpen[0], 'ausgebucht', tx`${fullOpen[0].fields.kursname ?? ''} ist ausgebucht`),
            }}
          >
            <b>{namen(fullOpen.map(k => k.fields.kursname ?? ''), 3)}</b> {fullOpen.length === 1 ? tx('ist voll, die Anmeldung steht aber noch offen.') : tx('sind voll, die Anmeldung steht aber noch offen.')}
          </HeroBanner>
        )}
        kpis={!empty && (
          <StatStrip>
            <StatStripItem
              title={tx('Belegung offener Kurse')}
              value={kapazitaet > 0 ? `${belegt} / ${kapazitaet}` : String(belegt)}
              icon={<IconUsers size={18} className="text-muted-foreground" />}
              tone="primary"
            />
            <StatStripItem
              title={unpaid.length > 0 ? tx`Offene Zahlungen · ${formatCurrency(unpaidSum)}` : tx('Offene Zahlungen')}
              value={unpaid.length}
              icon={<IconCash size={18} className="text-muted-foreground" />}
              tone={unpaid.length > 0 ? 'warning' : 'default'}
              onClick={() => setFilter(f => (f === 'unpaid' ? 'all' : 'unpaid'))}
              active={filter === 'unpaid'}
            />
            <StatStripItem
              title={tx('Warteliste')}
              value={waiting.length}
              icon={<IconHourglass size={18} className="text-muted-foreground" />}
              tone={waiting.length > 0 ? 'primary' : 'default'}
              onClick={() => setFilter(f => (f === 'wait' ? 'all' : 'wait'))}
              active={filter === 'wait'}
            />
          </StatStrip>
        )}
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['abgeschlossen', 'abgesagt']}
            onCardClick={card => {
              const rec = kursById.get(card.id.split(':')[1] ?? '');
              if (rec) crud.kurse.openDetail(rec);
            }}
            onCardMove={moveCard}
            onAddCard={column => crud.kurse.openCreate({ status: column })}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Offene Zahlungen')}
              items={unpaid
                .sort((a, b) => (a.fields.anmeldedatum ?? '').localeCompare(b.fields.anmeldedatum ?? ''))
                .map(a => ({
                  id: a.record_id,
                  title: a.teilnehmerName || '—',
                  secondLine: (
                    <>
                      <span className="font-medium text-amber-600">{a.fields.zahlungsstatus?.label ?? tx('Offen')}</span>
                      <span className="text-muted-foreground"> · {a.kursName}</span>
                    </>
                  ),
                  action: { label: tx('✓ Bezahlt'), onClick: () => patchAnmeldung(a, { zahlungsstatus: 'bezahlt' }, tx`${a.teilnehmerName} hat bezahlt`) },
                }))}
              max={5}
              onItemClick={id => { const r = enrichedAnmeldungen.find(a => a.record_id === id); if (r) crud.anmeldungen.openDetail(r); }}
              empty={{ text: tx('Alle Zahlungen sind eingegangen.') }}
            />
            <WorkList
              title={tx('Warteliste')}
              items={waiting.map(a => {
                const kid = extractRecordId(a.fields.kurs) ?? '';
                const kurs = kursById.get(kid);
                const max = kurs?.fields.max_teilnehmer ?? 0;
                const hasRoom = max === 0 || statOf(kid).active < max;
                return {
                  id: a.record_id,
                  title: a.teilnehmerName || '—',
                  secondLine: (
                    <>
                      <span className={hasRoom ? 'font-medium text-emerald-600' : 'font-medium text-muted-foreground'}>
                        {hasRoom ? tx('Platz frei') : tx('Kurs voll')}
                      </span>
                      <span className="text-muted-foreground"> · {a.kursName}</span>
                    </>
                  ),
                  action: hasRoom
                    ? { label: tx('✓ Bestätigen'), onClick: () => patchAnmeldung(a, { anmeldestatus: 'bestaetigt' }, tx`${a.teilnehmerName} ist bestätigt`) }
                    : undefined,
                };
              })}
              max={5}
              onItemClick={id => { const r = enrichedAnmeldungen.find(a => a.record_id === id); if (r) crud.anmeldungen.openDetail(r); }}
              empty={{ text: tx('Niemand wartet auf einen Platz.') }}
            />
            <WorkList
              title={tx('Kurse ohne Marketing-Eintrag')}
              items={ohneMarketing.map(k => ({
                id: k.record_id,
                title: k.fields.kursname ?? '—',
                secondLine: (
                  <>
                    <span className="font-medium text-amber-600">{k.fields.status?.label ?? ''}</span>
                    <span className="text-muted-foreground"> · {formatDate(k.fields.startdatum)}</span>
                  </>
                ),
                action: { label: tx('+ Marketing'), onClick: () => crud.marketing.openCreate({ kurs: k.record_id }) },
              }))}
              max={5}
              onItemClick={id => { const r = enrichedKurse.find(k => k.record_id === id); if (r) crud.kurse.openDetail(r); }}
              empty={{ text: tx('Jeder Kurs hat einen Marketing-Eintrag.') }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
