export type ArendeStatus = 'Ny' | 'Pågår' | 'Avslutad';

export type Arende = {
  id: string;
  rubrik: string;
  enhet: string;
  status: ArendeStatus;
  inkom: string;
};

export const ARENDEN: readonly Arende[] = [
  { id: 'A-1041', rubrik: 'Ansökan om parkeringstillstånd', enhet: 'STH', status: 'Ny', inkom: '2026-09-22' },
  { id: 'A-1038', rubrik: 'Bygglov, tillbyggnad garage', enhet: 'STH', status: 'Pågår', inkom: '2026-09-18' },
  { id: 'A-1032', rubrik: 'Klagomål på gatubelysning', enhet: 'GBG', status: 'Pågår', inkom: '2026-09-15' },
  { id: 'A-1027', rubrik: 'Serveringstillstånd, uteservering', enhet: 'MLM', status: 'Ny', inkom: '2026-09-12' },
  { id: 'A-1019', rubrik: 'Begäran om allmän handling', enhet: 'GBG', status: 'Avslutad', inkom: '2026-09-03' },
  { id: 'A-1011', rubrik: 'Tillstånd för markupplåtelse', enhet: 'STH', status: 'Avslutad', inkom: '2026-08-28' },
];
