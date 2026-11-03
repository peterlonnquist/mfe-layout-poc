# @mfe-layout-poc/delat-layout

Gemensam sidram för alla appar: sidhuvud, meny, enhetsväljare, `appUrl()` för länkar mellan appar och designtokens.

```bash
npm run publicera:layout  # i mfe-layout-poc: bygger med ng-packagr och publicerar till det lokala registret
```

```ts
// app.config.ts
providers: [provideRouter(routes), provideSidlayout('arenden')]
```

```html
<!-- app.ts -->
<mfe-sidlayout><router-outlet /></mfe-sidlayout>
```

```scss
// styles.scss
@use '@mfe-layout-poc/delat-layout/stil/tokens';
```

