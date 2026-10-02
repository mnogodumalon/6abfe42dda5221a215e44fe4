/**
 * Anmeldung stornieren — 3-Schritt-Wizard + Prüfen.
 * Steps: 1) Anmeldung wählen → 2) Stornierung bestätigen (Bemerkung) → 3) Wartelisten-Eintrag wählen → Prüfen.
 * Reads: anmeldungen (Teilnehmer, Kurs, Status). Writes: anmeldungen (Status storniert, Bemerkung; optional Nachrücker → angemeldet).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, StatusBadge, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldLookup } from '@/lib/journey';
import { useAnmeldungStornierenFlow } from '@/lib/journey/flows/AnmeldungStornieren';
import { tx } from '@/i18n';

export default function AnmeldungStornierenPage() {
  const [step, setStep] = useState(1);
  const flow = useAnmeldungStornierenFlow({
    steps: { anmeldungen: 1, bemerkung: 2, anmeldungen2: 3 },
    items: {
      anmeldungen: (r, ctx) => {
        const status = fieldLookup(r, 'anmeldestatus');
        return {
          id: r.id,
          title: ctx.ref('teilnehmer') ?? tx('Ohne Teilnehmer'),
          subtitle: ctx.ref('kurs'),
          status: status ?? undefined,
        };
      },
      anmeldungen2: (r, ctx) => {
        const status = fieldLookup(r, 'anmeldestatus');
        return {
          id: r.id,
          title: ctx.ref('teilnehmer') ?? tx('Ohne Teilnehmer'),
          subtitle: ctx.ref('kurs'),
          status: status ?? undefined,
        };
      },
    },
  });

  const picked = flow.forms.anmeldungen;
  const pickedLabel = picked.labels.anmeldungen;

  return (
    <IntentWizardShell
      title={tx('Anmeldung stornieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Anmeldung stornieren und optional jemanden von der Warteliste nachrücken lassen.'),
        needs: [tx('Die Anmeldung, die storniert wird'), tx('Optional: den Wartelisten-Eintrag des Kurses')],
      }}
    >
      <WizardStep label={tx('Anmeldung')} description={tx('Welche Anmeldung soll storniert werden?')}>
        <EntitySelectStep
          {...flow.picks.anmeldungen.select}
          {...flow.pick('anmeldungen')}
          avatar="initials"
          searchPlaceholder={tx('Anmeldung suchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Stornierung')} description={tx('Prüfe die Anmeldung und halte optional den Grund fest.')}>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-secondary/40 p-4 overflow-hidden">
            <p className="text-sm text-muted-foreground">{tx('Wird storniert')}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-medium truncate min-w-0">{pickedLabel ?? tx('Keine Anmeldung gewählt')}</span>
              <StatusBadge statusKey="storniert" label={tx('Storniert')} tone="danger" />
            </div>
          </div>
          <Bound form={flow.forms.anmeldungen} name="bemerkung" hint={tx('z. B. Grund der Stornierung')} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Warteliste')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Warteliste')}
        description={tx('Wer von der Warteliste rückt nach? Ohne Auswahl wird nur storniert.')}
      >
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.anmeldungen2.select}
            {...flow.pick('anmeldungen2')}
            create={false}
            avatar="initials"
            searchPlaceholder={tx('Wartelisten-Eintrag suchen …')}
            emptyText={tx('Keine Wartelisten-Einträge vorhanden — du kannst direkt weiter zur Prüfung.')}
          />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'anmeldestatus', label: tx('Neuer Status'), value: tx('Storniert') }]}
            whatHappensNext={tx('Die Anmeldung wird storniert; ein gewählter Wartelisten-Eintrag rückt als angemeldet nach.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Teilnehmer anmelden'), href: '#/intents/teilnehmer-anmelden' },
            { label: tx('Zahlung erfassen'), href: '#/intents/zahlung-erfassen' },
            { label: tx('Kurs anlegen und öffnen'), href: '#/intents/kurs-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
