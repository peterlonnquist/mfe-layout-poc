import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ARENDEN } from './arenden.data';

@Component({
  selector: 'arenden-detalj',
  imports: [RouterLink],
  template: `
    <a routerLink="/">Tillbaka till ärenden</a>
    @if (arende(); as a) {
      <h1>{{ a.rubrik }}</h1>
      <dl>
        <dt>Nummer</dt><dd>{{ a.id }}</dd>
        <dt>Status</dt><dd>{{ a.status }}</dd>
        <dt>Enhet</dt><dd>{{ a.enhet }}</dd>
        <dt>Inkom</dt><dd>{{ a.inkom }}</dd>
      </dl>
    } @else {
      <h1>Ärendet finns inte</h1>
      <p>Det finns inget ärende med nummer {{ id() }}. Kontrollera numret och försök igen.</p>
    }
  `,
  styles: `
    a { display: inline-block; margin-bottom: 1rem; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.4rem 1.5rem; background: var(--farg-panel); border: 1px solid var(--farg-linje); border-radius: var(--radie); padding: 1rem 1.25rem; max-width: 36rem; }
    dt { color: var(--farg-dampad); }
    dd { margin: 0; }
  `,
})
export class ArendeDetalj {
  readonly id = input.required<string>();
  protected readonly arende = computed(() => ARENDEN.find((a) => a.id === this.id()));
}
