import { Route } from '@angular/router';
import { Start } from './start';

export const appRoutes: Route[] = [
  { path: '', component: Start, title: 'Start – Verksamhetsportal' },
  { path: '**', redirectTo: '' },
];
