import type { Anmeldungen, Kurse, Marketing } from './app';

export type EnrichedKurse = Kurse & {
  kursleiterName: string;
};

export type EnrichedAnmeldungen = Anmeldungen & {
  teilnehmerName: string;
  kursName: string;
};

export type EnrichedMarketing = Marketing & {
  kursName: string;
};
