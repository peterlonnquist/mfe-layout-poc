import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { MfeLank } from './app-lank';
import { MenyService } from './meny.service';
import { ENHETER, SessionService } from './session.service';

/**
 * Hela sidramen: sidhuvud, meny och innehållsyta. Varje app lägger sitt innehåll i:
 *
 *   <mfe-sidlayout><router-outlet /></mfe-sidlayout>
 */
@Component({
  selector: 'mfe-sidlayout',
  imports: [MfeLank],
  template: `
    <a class="hoppa" href="#innehall">Hoppa till innehåll</a>
    <header class="sidhuvud">
      <a class="varumarke" [mfeLank]="{ app: 'start' }">Verksamhetsportal</a>
      <label class="enhet">
        <span>Enhet</span>
        <select (change)="session.valjEnhet($any($event.target).value)">
          @for (enhet of enheter; track enhet.kod) {
            <option [value]="enhet.kod" [selected]="enhet.kod === session.valdEnhet().kod">{{ enhet.namn }}</option>
          }
        </select>
      </label>
      <span class="anvandare">
        <span class="initialer" aria-hidden="true">{{ session.initialer() }}</span>
        <span class="sr">Inloggad som </span>{{ session.anvandare() }}
      </span>
    </header>

    <div class="ram">
      <nav class="meny" aria-label="Huvudmeny">
        <ul>
          @for (post of meny.poster(); track post.app + post.sokvag) {
            <li>
              <a [mfeLank]="post" [class.aktiv]="post === aktiv()" [attr.aria-current]="post === aktiv() ? 'page' : null">
                {{ post.etikett }}
              </a>
            </li>
          }
        </ul>
        @if (meny.fel(); as fel) {
          <p class="menyfel" role="status">{{ fel }}. Ladda om sidan om en stund.</p>
        }
      </nav>
      <main id="innehall" tabindex="-1"><ng-content /></main>
    </div>
  `,
  styleUrl: './sidlayout.scss',
})
export class Sidlayout {
  protected readonly session = inject(SessionService);
  protected readonly meny = inject(MenyService);
  protected readonly enheter = ENHETER;

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly aktiv = () => this.meny.aktivPost(this.url());
}
