import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService, appUrl } from '@mfe-layout-poc/delat/layout';
import { ARENDEN, ArendeStatus } from './arenden.data';

@Component({
  selector: 'arenden-lista',
  imports: [RouterLink],
  template: `
    <h1>{{ endastStatus() ? 'Nya ärenden' : 'Ärenden' }}</h1>
    <p class="ingress">
      {{ arenden().length }} ärenden för {{ session.valdEnhet().namn }}.
      <a [href]="appUrl({ app: 'rapporter' })">Se statistik i Rapporter</a>
    </p>

    @if (arenden().length === 0) {
      <p class="tomt">Inga ärenden att visa för {{ session.valdEnhet().namn }}. Byt enhet i sidhuvudet för att se fler.</p>
    } @else {
      <table>
        <thead>
          <tr><th scope="col">Nummer</th><th scope="col">Rubrik</th><th scope="col">Status</th><th scope="col">Inkom</th></tr>
        </thead>
        <tbody>
          @for (arende of arenden(); track arende.id) {
            <tr>
              <!-- Inom appen räcker vanlig routerLink -->
              <td><a [routerLink]="['/', arende.id]">{{ arende.id }}</a></td>
              <td>{{ arende.rubrik }}</td>
              <td><span class="status" [attr.data-status]="arende.status">{{ arende.status }}</span></td>
              <td>{{ arende.inkom }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: `
    .ingress { color: var(--farg-dampad); margin: 0 0 1.5rem; }
    table { width: 100%; border-collapse: collapse; background: var(--farg-panel); border: 1px solid var(--farg-linje); border-radius: var(--radie); overflow: hidden; }
    th, td { text-align: left; padding: 0.65rem 1rem; border-bottom: 1px solid var(--farg-linje); }
    th { font-weight: 600; color: var(--farg-dampad); font-size: 0.9rem; }
    tbody tr:last-child td { border-bottom: 0; }
    .status { font-size: 0.85rem; padding: 0.1rem 0.5rem; border-radius: 999px; background: var(--farg-profil-ljus); }
    .status[data-status='Ny'] { background: #f5e6c8; }
    .status[data-status='Avslutad'] { background: transparent; color: var(--farg-dampad); }
    .tomt { color: var(--farg-dampad); }
  `,
})
export class ArendeLista {
  /** Från route data, via withComponentInputBinding(). */
  readonly endastStatus = input<ArendeStatus>();

  protected readonly session = inject(SessionService);
  protected readonly appUrl = appUrl;
  protected readonly arenden = computed(() =>
    ARENDEN.filter((a) => a.enhet === this.session.valdEnhet().kod).filter(
      (a) => !this.endastStatus() || a.status === this.endastStatus(),
    ),
  );
}
