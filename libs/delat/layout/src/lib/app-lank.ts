import { Directive, InjectionToken, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/** Namnet på appen som körs just nu, t.ex. 'arenden'. Sätts via provideSidlayout(). */
export const AKTUELL_APP = new InjectionToken<string>('AKTUELL_APP');

/** En adress i portalen: vilken app, och sökvägen inuti den appen. */
export type AppLank = { app: string; sokvag?: string };

/**
 * Konvention: appen 'start' ligger på /, alla andra på /<appnamn>/.
 * Samma konvention gäller i gatewayn (nginx) och i dev-proxyn.
 */
export function appBas(app: string): string {
  return app === 'start' ? '/' : `/${app}/`;
}

export function appUrl(lank: AppLank): string {
  return appBas(lank.app) + (lank.sokvag ?? '').replace(/^\//, '');
}

/**
 * Länk som fungerar oavsett om målet ligger i samma app eller i en annan.
 *
 *   <a [mfeLank]="{ app: 'arenden', sokvag: 'A-1041' }">A-1041</a>
 *
 * - Samma app:  klientnavigering via Angular-routern (ingen sidladdning).
 * - Annan app:  vanlig länk, webbläsaren laddar den andra appen.
 *
 * href sätts alltid till den fullständiga adressen, så mittenklick, ctrl/cmd-klick
 * och "öppna i ny flik" fungerar i båda fallen.
 */
@Directive({
  selector: 'a[mfeLank]',
  host: {
    '[attr.href]': 'href()',
    '(click)': 'klick($event)',
  },
})
export class MfeLank {
  readonly mfeLank = input.required<AppLank>();

  private readonly aktuellApp = inject(AKTUELL_APP);
  private readonly router = inject(Router);

  readonly arIntern = computed(() => this.mfeLank().app === this.aktuellApp);
  protected readonly href = computed(() => appUrl(this.mfeLank()));

  protected klick(event: MouseEvent): void {
    if (!this.arIntern()) return; // Annan app: låt webbläsaren följa href.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    const sokvag = (this.mfeLank().sokvag ?? '').replace(/^\//, '');
    void this.router.navigateByUrl('/' + sokvag);
  }
}
