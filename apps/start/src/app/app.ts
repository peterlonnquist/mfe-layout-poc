import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidlayout } from '@mfe-layout-poc/delat/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidlayout],
  template: `<mfe-sidlayout><router-outlet /></mfe-sidlayout>`,
})
export class App {}
