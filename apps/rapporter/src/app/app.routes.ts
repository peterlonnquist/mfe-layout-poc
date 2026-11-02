import { Route } from '@angular/router';
import { RapportOversikt } from './rapport-oversikt';

// Sökvägar är relativa till appens baseHref (/rapporter/).
export const appRoutes: Route[] = [
  { path: '', component: RapportOversikt, title: 'Rapporter – Verksamhetsportal' },
  { path: '**', redirectTo: '' },
];
