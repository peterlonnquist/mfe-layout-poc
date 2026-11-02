import { Route } from '@angular/router';
import { ArendeDetalj } from './arende-detalj';
import { ArendeLista } from './arende-lista';

// Sökvägar är relativa till appens baseHref (/arenden/).
export const appRoutes: Route[] = [
  { path: '', component: ArendeLista, title: 'Ärenden – Verksamhetsportal' },
  { path: 'nya', component: ArendeLista, data: { endastStatus: 'Ny' }, title: 'Nya ärenden – Verksamhetsportal' },
  { path: ':id', component: ArendeDetalj, title: 'Ärende – Verksamhetsportal' },
];
