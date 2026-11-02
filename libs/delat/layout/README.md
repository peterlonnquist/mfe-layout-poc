# delat-layout

Gemensam sidram för alla appar: sidhuvud, meny, enhetsväljare, `mfeLank`-direktivet och designtokens.

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
@use '../../../libs/delat/layout/src/stil/tokens';
```
