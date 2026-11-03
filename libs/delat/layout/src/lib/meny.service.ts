import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { AKTUELL_APP, AppLank } from './app-lank';

export type Menypost = AppLank & { etikett: string };
type Meny = { poster: Menypost[] };

/**
 * Menyns INNEHÅLL hämtas vid runtime från /bff/api/1.0/meny (serveras av backend-for-frontend).
 * Bara utseende och logik ligger i biblioteket. En ny menypost kräver därför ingen
 * ombyggnad av apparna – bara en ny deploy av backend-for-frontend.
 */
@Injectable({ providedIn: 'root' })
export class MenyService {
  private readonly aktuellApp = inject(AKTUELL_APP);

  // Går via HttpClient, så interceptorer (t.ex. auth) gäller även menyn.
  private readonly meny = httpResource<Meny>(() => ({ url: '/bff/api/1.0/meny', cache: 'no-cache' }));

  /** Om menyn inte kan hämtas visas bara länken hem, så att användaren inte blir strandsatt. */
  readonly poster = computed<Menypost[]>(() =>
    this.meny.hasValue()
      ? this.meny.value().poster
      : [{ etikett: 'Start', app: 'huvudapplikation', sokvag: '' }],
  );

  readonly laddar = this.meny.isLoading;
  readonly fel = computed(() => (this.meny.error() ? 'Menyn kunde inte hämtas' : null));

  /**
   * Vilken post som är aktiv: bland poster i den aktuella appen, den med längst
   * sökväg som är ett prefix av nuvarande url. '/A-1041' -> 'Ärenden', '/nya' -> 'Nya ärenden'.
   */
  aktivPost(url: string): Menypost | undefined {
    const sokvag = url.split(/[?#]/)[0].replace(/^\//, '');
    return this.poster()
      .filter((p) => p.app === this.aktuellApp)
      .filter((p) => {
        const s = (p.sokvag ?? '').replace(/^\//, '');
        return s === '' || sokvag === s || sokvag.startsWith(s + '/');
      })
      .sort((a, b) => (b.sokvag ?? '').length - (a.sokvag ?? '').length)[0];
  }
}
