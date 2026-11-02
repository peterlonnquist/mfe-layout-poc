import { Component, inject } from '@angular/core';
import { MfeLank, SessionService } from '@mfe-layout-poc/delat/layout';

@Component({
  selector: 'app-start',
  imports: [MfeLank],
  template: `
    <h1>God dag, {{ session.anvandare() }}</h1>
    <p class="ingress">Du arbetar mot enhet {{ session.valdEnhet().namn }}. Byt enhet i sidhuvudet.</p>
    <ul class="genvagar">
      <li><a [mfeLank]="{ app: 'arenden' }">Gå till ärenden</a><span>Nya och pågående ärenden för din enhet</span></li>
      <li><a [mfeLank]="{ app: 'arenden', sokvag: 'A-1041' }">Öppna senaste ärendet, A-1041</a><span>Djuplänk direkt in i en annan app</span></li>
      <li><a [mfeLank]="{ app: 'rapporter' }">Visa rapporter</a><span>Inflöde och avslut per månad</span></li>
    </ul>
  `,
  styles: `
    .ingress { color: var(--farg-dampad); margin-bottom: 2rem; }
    .genvagar { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; max-width: 32rem; }
    .genvagar li { display: grid; background: var(--farg-panel); border: 1px solid var(--farg-linje); border-radius: var(--radie); padding: 0.9rem 1.1rem; }
    .genvagar a { font-weight: 600; font-size: 1.1rem; }
    .genvagar span { color: var(--farg-dampad); }
  `,
})
export class Start {
  protected readonly session = inject(SessionService);
}
