import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

export type Enhet = { kod: string; namn: string };

export const ENHETER: readonly Enhet[] = [
  { kod: 'STH', namn: 'Stockholm' },
  { kod: 'GBG', namn: 'Göteborg' },
  { kod: 'MLM', namn: 'Malmö' },
];

const NYCKEL = 'mfe.valdEnhet';

function lasEnhet(): Enhet {
  try {
    const kod = localStorage.getItem(NYCKEL);
    return ENHETER.find((e) => e.kod === kod) ?? ENHETER[0];
  } catch {
    return ENHETER[0];
  }
}

/**
 * Delat tillstånd mellan apparna.
 *
 * Apparna är separata SPA:er – ett appbyte är en full sidladdning och allt i minnet
 * försvinner. Därför ligger vald enhet i localStorage (samma origin bakom gatewayn).
 * 'storage'-eventet håller dessutom andra öppna flikar i synk.
 *
 * Inloggad användare kommer i en riktig lösning från sessionscookie/OIDC, inte härifrån.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly anvandare = signal('Peter Andersson');
  readonly valdEnhet = signal<Enhet>(lasEnhet());
  readonly initialer = computed(() =>
    this.anvandare()
      .split(' ')
      .map((del) => del.charAt(0))
      .join(''),
  );

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(NYCKEL, this.valdEnhet().kod);
      } catch {
        /* privat läge e.d. – tillståndet lever då bara i den här sidan */
      }
    });

    const vidAndring = (e: StorageEvent) => {
      if (e.key === NYCKEL) this.valdEnhet.set(lasEnhet());
    };
    window.addEventListener('storage', vidAndring);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', vidAndring));
  }

  valjEnhet(kod: string): void {
    const enhet = ENHETER.find((e) => e.kod === kod);
    if (enhet) this.valdEnhet.set(enhet);
  }
}
