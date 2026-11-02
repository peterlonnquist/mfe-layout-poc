import { Component, computed, inject } from '@angular/core';
import { SessionService, appUrl } from '@mfe-layout-poc/delat/layout';

type Manadsvarde = { manad: string; inkomna: number; avslutade: number };

const STATISTIK: Record<string, Manadsvarde[]> = {
  STH: [
    { manad: 'Juni', inkomna: 48, avslutade: 41 },
    { manad: 'Juli', inkomna: 31, avslutade: 37 },
    { manad: 'Augusti', inkomna: 52, avslutade: 44 },
    { manad: 'September', inkomna: 39, avslutade: 30 },
  ],
  GBG: [
    { manad: 'Juni', inkomna: 29, avslutade: 30 },
    { manad: 'Juli', inkomna: 18, avslutade: 22 },
    { manad: 'Augusti', inkomna: 33, avslutade: 25 },
    { manad: 'September', inkomna: 27, avslutade: 26 },
  ],
  MLM: [
    { manad: 'Juni', inkomna: 21, avslutade: 19 },
    { manad: 'Juli', inkomna: 12, avslutade: 16 },
    { manad: 'Augusti', inkomna: 24, avslutade: 20 },
    { manad: 'September', inkomna: 19, avslutade: 17 },
  ],
};

@Component({
  selector: 'rapporter-oversikt',
  template: `
    <h1>Rapporter</h1>
    <p class="ingress">
      Inkomna och avslutade ärenden per månad, {{ session.valdEnhet().namn }}.
      <a [href]="appUrl({ app: 'arenden', sokvag: 'nya' })">Visa nya ärenden</a>
    </p>

    <section class="diagram" aria-label="Ärenden per månad">
      @for (rad of statistik(); track rad.manad) {
        <div class="rad">
          <span class="manad">{{ rad.manad }}</span>
          <div class="staplar">
            <span class="stapel inkomna" [style.width.%]="(rad.inkomna / max()) * 100">{{ rad.inkomna }} inkomna</span>
            <span class="stapel avslutade" [style.width.%]="(rad.avslutade / max()) * 100">{{ rad.avslutade }} avslutade</span>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .ingress { color: var(--farg-dampad); margin: 0 0 1.5rem; }
    .diagram { background: var(--farg-panel); border: 1px solid var(--farg-linje); border-radius: var(--radie); padding: 1.25rem; max-width: 48rem; display: grid; gap: 1rem; }
    .rad { display: grid; grid-template-columns: 6rem 1fr; align-items: center; gap: 1rem; }
    .manad { font-weight: 600; }
    .staplar { display: grid; gap: 0.25rem; }
    .stapel { display: block; min-width: max-content; padding: 0.1rem 0.5rem; font-size: 0.85rem; border-radius: 3px; white-space: nowrap; }
    .inkomna { background: var(--farg-profil); color: #fff; }
    .avslutade { background: var(--farg-profil-ljus); color: var(--farg-profil); }
  `,
})
export class RapportOversikt {
  protected readonly session = inject(SessionService);
  protected readonly appUrl = appUrl;
  protected readonly statistik = computed(() => STATISTIK[this.session.valdEnhet().kod] ?? []);
  protected readonly max = computed(() =>
    Math.max(1, ...this.statistik().flatMap((r) => [r.inkomna, r.avslutade])),
  );
}
