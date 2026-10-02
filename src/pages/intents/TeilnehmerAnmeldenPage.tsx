/**
 * Teilnehmer anmelden — 3-Schritt-Wizard.
 * Steps: 1) Kurs wählen → 2) Teilnehmer wählen oder neu erfassen → 3) Bestätigen & anmelden.
 * Reads: kurse, teilnehmer. Writes: teilnehmer (nur bei neuer Person), anmeldungen.
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldNumber, fieldDate } from '@/lib/journey';
import { useTeilnehmerAnmeldenFlow } from '@/lib/journey/flows/TeilnehmerAnmelden';
import { tx } from '@/i18n';

const NEW_PERSON_KEYS = ['teilnehmer_firstname', 'teilnehmer_lastname', 'email'];

export default function TeilnehmerAnmeldenPage() {
  const [step, setStep] = useState(1);
  const flow = useTeilnehmerAnmeldenFlow({
    steps: {
      kurs: 1,
      teilnehmer: 2,
      teilnehmer_firstname: 2,
      teilnehmer_lastname: 2,
      email: 2,
      telefon: 2,
      erfahrungslevel: 2,
      gesundheitliche_hinweise: 2,
      bemerkung: 2,
    },
    items: {
      kurs: k => {
        const start = fieldDate(k, 'startdatum');
        const wochentag = fieldLookup(k, 'wochentag')?.label;
        const max = fieldNumber(k, 'max_teilnehmer');
        const preis = fieldNumber(k, 'preis');
        return {
          id: k.id,
          title: fieldText(k, 'kursname'),
          subtitle: [wochentag, start ? format(parseISO(start), 'dd.MM.yyyy') : null].filter(Boolean).join(' · '),
          status: fieldLookup(k, 'status') ?? undefined,
          stats: [
            ...(max != null ? [{ label: tx('Max. Plätze'), value: max }] : []),
            ...(preis != null ? [{ label: tx('Preis'), value: `${preis} €` }] : []),
          ],
        };
      },
      teilnehmer: t => ({
        id: t.id,
        title: `${fieldText(t, 'teilnehmer_firstname')} ${fieldText(t, 'teilnehmer_lastname')}`.trim(),
        subtitle: fieldText(t, 'email'),
      }),
    },
  });

  const teilnehmerForm = flow.forms.teilnehmer;
  const anmeldungForm = flow.forms.anmeldungen;

  const validateTeilnehmerStep = () => {
    if (anmeldungForm.get('teilnehmer')) return true;
    return teilnehmerForm.validate(NEW_PERSON_KEYS);
  };

  return (
    <IntentWizardShell
      title={tx('Teilnehmer anmelden')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen Teilnehmer für einen Kurs anmelden.'),
        needs: [tx('Den Kurs'), tx('Name und E-Mail, falls der Teilnehmer neu ist')],
      }}
    >
      <WizardStep label={tx('Kurs')} description={tx('Für welchen Kurs soll die Anmeldung gelten?')}>
        <EntitySelectStep
          {...flow.picks.kurs.select}
          {...flow.pick('kurs')}
          searchPlaceholder={tx('Kursname suchen …')}
          emptyText={tx('Es gibt keinen Kurs mit offener Anmeldung.')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Teilnehmer')}
        description={tx('Wähle einen vorhandenen Teilnehmer oder erfasse einen neuen.')}
        needs={['kurs']}
      >
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.teilnehmer.select}
            {...flow.pick('teilnehmer')}
            create={false}
            avatar="initials"
            searchPlaceholder={tx('Name oder E-Mail …')}
          />
          <div className="space-y-4 rounded-2xl border p-4">
            <p className="text-sm font-medium">{tx('Oder neuen Teilnehmer erfassen')}</p>
            <Bound form={teilnehmerForm} name="teilnehmer_firstname" />
            <Bound form={teilnehmerForm} name="teilnehmer_lastname" />
            <Bound form={teilnehmerForm} name="email" />
            <Bound form={teilnehmerForm} name="telefon" />
            <Bound form={teilnehmerForm} name="erfahrungslevel" allowClear />
            <Bound form={teilnehmerForm} name="gesundheitliche_hinweise" rows={3} />
          </div>

          <Bound form={anmeldungForm} name="bemerkung" rows={2} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={validateTeilnehmerStep}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'anmeldestatus', label: tx('Anmeldestatus'), value: tx('Angemeldet') },
              { key: 'zahlungsstatus', label: tx('Zahlungsstatus'), value: tx('Offen') },
            ]}
            whatHappensNext={tx('Die Anmeldung wird mit dem heutigen Datum gespeichert. Eine neue Person wird dabei automatisch angelegt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Zahlung erfassen'), href: '#/intents/zahlung-erfassen' },
            { label: tx('Anmeldung stornieren'), href: '#/intents/anmeldung-stornieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Die Zahlung kannst du im nächsten Schritt erfassen.')}
        />
      )}
    </IntentWizardShell>
  );
}
