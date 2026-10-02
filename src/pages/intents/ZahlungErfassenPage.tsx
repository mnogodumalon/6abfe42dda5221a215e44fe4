/**
 * Zahlung erfassen — 3-Schritt-Wizard.
 * Steps: 1) Anmeldung wählen → 2) Zahlungsstatus setzen → 3) Prüfen & Anmeldung bestätigen.
 * Reads: anmeldungen (Teilnehmer, Kurs via ctx.ref). Writes: anmeldungen (update: zahlungsstatus, anmeldestatus = bestaetigt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldLookup, fieldDate, optionsOf } from '@/lib/journey';
import { useZahlungErfassenFlow } from '@/lib/journey/flows/ZahlungErfassen';
import { tx } from '@/i18n';

export default function ZahlungErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useZahlungErfassenFlow({
    steps: { anmeldungen: 1, zahlungsstatus: 2 },
    items: {
      anmeldungen: (r, ctx) => {
        const zahlung = fieldLookup(r, 'zahlungsstatus');
        const datum = fieldDate(r, 'anmeldedatum');
        return {
          id: r.id,
          title: ctx.ref('teilnehmer') ?? tx('Ohne Teilnehmer'),
          subtitle: [ctx.ref('kurs'), datum].filter(Boolean).join(' · '),
          status: zahlung ?? undefined,
        };
      },
    },
  });

  const bestaetigt = optionsOf('anmeldungen', 'anmeldestatus').find(o => o.key === 'bestaetigt');

  return (
    <IntentWizardShell
      title={tx('Zahlung erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Zahlungsstatus einer Anmeldung setzen und sie bestätigen.'),
        needs: [tx('Name des Teilnehmers oder Kurses')],
      }}
    >
      <WizardStep label={tx('Anmeldung')} description={tx('Welche Anmeldung hat eine Zahlung erhalten?')}>
        <EntitySelectStep
          {...flow.picks.anmeldungen.select}
          {...flow.pick('anmeldungen')}
          avatar="initials"
          searchPlaceholder={tx('Teilnehmer oder Kurs suchen …')}
        />
      </WizardStep>
      <WizardStep label={tx('Zahlungsstatus')} description={tx('Wie weit ist die Zahlung?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.anmeldungen} name="zahlungsstatus" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{
              key: 'anmeldestatus',
              label: tx('Anmeldestatus'),
              value: bestaetigt?.label ?? tx('Bestätigt'),
            }]}
            whatHappensNext={tx('Die Anmeldung wird mit dem neuen Zahlungsstatus als bestätigt gespeichert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          actions={{ copy: false, print: false }}
          next={[
            { label: tx('Weitere Zahlung erfassen'), onClick: () => flow.reset() },
            { label: tx('Teilnehmer anmelden'), href: '#/intents/teilnehmer-anmelden' },
            { label: tx('Anmeldung stornieren'), href: '#/intents/anmeldung-stornieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
