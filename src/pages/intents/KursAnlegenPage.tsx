/**
 * Kurs anlegen und öffnen — 3-Schritt-Wizard + Prüfen.
 * Steps: 1) Kursdaten und Kursleiter wählen → 2) Termin, Raum, Teilnehmerzahl und Preis → 3) Optional Instagram-/TikTok-Links → Prüfen & anlegen.
 * Reads: yogalehrer. Writes: kurse (Status fest „Anmeldung offen"), marketing (nur wenn Links eingetragen).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookups, optionsOf } from '@/lib/journey';
import { useKursAnlegenFlow } from '@/lib/journey/flows/KursAnlegen';
import { tx } from '@/i18n';

export default function KursAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useKursAnlegenFlow({
    steps: {
      kursleiter: 1, kursname: 1, yogastil: 1, niveau: 1, beschreibung: 1,
      startdatum: 2, wochentag: 2, dauer_minuten: 2, anzahl_termine: 2, raum: 2, max_teilnehmer: 2, preis: 2,
      insta_url: 3, tiktok_url: 3,
    },
    items: {
      kursleiter: r => ({
        id: r.id,
        title: `${fieldText(r, 'lehrer_firstname')} ${fieldText(r, 'lehrer_lastname')}`.trim(),
        subtitle: fieldLookups(r, 'schwerpunkte').map(s => s.label).join(', '),
      }),
    },
  });

  const statusLabel = optionsOf('kurse', 'status').find(o => o.key === 'anmeldung_offen')?.label ?? '';

  return (
    <IntentWizardShell
      title={tx('Kurs anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Lege einen neuen Kurs an und öffne direkt die Anmeldung.'),
        needs: [tx('Kursname und Yogastil'), tx('Kursleiter'), tx('Starttermin, Raum und Preis')],
      }}
    >
      <WizardStep label={tx('Kurs & Kursleiter')} description={tx('Wie heißt der Kurs und wer unterrichtet?')}>
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.kursleiter.select}
            {...flow.pick('kursleiter')}
            avatar="initials"
            searchPlaceholder={tx('Kursleiter suchen …')}
          />
          <Bound form={flow.forms.kurse} name="kursname" />
          <Bound form={flow.forms.kurse} name="yogastil" />
          <Bound form={flow.forms.kurse} name="niveau" />
          <Bound form={flow.forms.kurse} name="beschreibung" rows={3} />
          <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Termin & Preis')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Termin & Preis')} description={tx('Wann, wo und für wie viele Teilnehmer findet der Kurs statt?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.kurse} name="startdatum" />
          <Bound form={flow.forms.kurse} name="wochentag" />
          <Bound form={flow.forms.kurse} name="dauer_minuten" />
          <Bound form={flow.forms.kurse} name="anzahl_termine" />
          <Bound form={flow.forms.kurse} name="raum" />
          <Bound form={flow.forms.kurse} name="max_teilnehmer" />
          <Bound form={flow.forms.kurse} name="preis" />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Marketing')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Marketing')} description={tx('Optional: Links zu den Beiträgen für diesen Kurs.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.marketing} name="insta_url" placeholder={tx('https://instagram.com/…')} />
          <Bound form={flow.forms.marketing} name="tiktok_url" placeholder={tx('https://tiktok.com/…')} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Kursstatus'), value: statusLabel }]}
            whatHappensNext={tx('Der Kurs wird mit offener Anmeldung angelegt. Links zu Instagram oder TikTok werden als Marketing-Eintrag gespeichert.')}
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
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Der Kurs ist sichtbar und die Anmeldung ist geöffnet.')}
        />
      )}
    </IntentWizardShell>
  );
}
