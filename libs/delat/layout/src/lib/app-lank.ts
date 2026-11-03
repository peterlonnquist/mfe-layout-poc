import { InjectionToken } from '@angular/core';

/** Namnet på appen som körs just nu, t.ex. 'arenden'. Sätts via provideSidlayout(). */
export const AKTUELL_APP = new InjectionToken<string>('AKTUELL_APP');

/** En adress i portalen: vilken app, och sökvägen inuti den appen. */
export type AppLank = { app: string; sokvag?: string };

/**
 * Konvention: appen 'huvudapplikation' ligger på /, alla andra på /<appnamn>/.
 * Samma konvention gäller i gatewayn (nginx) och i dev-gatewayn.
 */
export function appBas(app: string): string {
  return app === 'huvudapplikation' ? '/' : `/${app}/`;
}

/**
 * Fullständig adress till en annan app, för en vanlig länk:
 *
 *   <a [href]="appUrl({ app: 'rapporter' })">Rapporter</a>
 *
 * Webbläsaren laddar då den andra appen. Inom den egna appen används routerLink.
 */
export function appUrl(lank: AppLank): string {
  return appBas(lank.app) + (lank.sokvag ?? '').replace(/^\//, '');
}
