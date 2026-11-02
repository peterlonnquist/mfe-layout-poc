import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AKTUELL_APP } from './app-lank';

/** Registrera i varje apps app.config.ts: provideSidlayout('arenden'). */
export function provideSidlayout(app: string): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: AKTUELL_APP, useValue: app }]);
}
