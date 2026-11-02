# mfe-layout-poc – Nx-monorepo med fristående Angular-appar och delat layoutbibliotek

Alternativ till `mfe-poc` (shell + Native Federation). Här finns **ingen shell och ingen runtime-federation**. Varje microfrontend är en vanlig, fristående Angular-app på en egen sökväg bakom en gateway. Alla appar importerar samma layoutbibliotek vid bygget: sidhuvud, meny och enhetsväljare.

Versioner: Nx 24.0, Angular 22.2.

## Struktur

```
apps/
  start/        Startsida på /. Serverar även /meny.json. Dev-proxy till övriga.   :4200
  arenden/      Fristående app på /arenden/                                        :4201
  rapporter/    Fristående app på /rapporter/                                      :4202
libs/delat/layout/
  sidlayout     <mfe-sidlayout> – sidhuvud, meny, innehållsyta
  app-lank      mfeLank-direktivet: intern eller extern navigering
  meny.service  Läser menyns innehåll från /meny.json vid runtime
  session       Vald enhet, sparad i localStorage
  stil/         Designtokens + cross-document view transitions
deploy/
  app/          Generisk Dockerfile + nginx-mall per app
  gateway/      nginx som routar sökväg -> app, plus felsida
azure-pipelines.yml
```

## Kom igång

```bash
npm install
npm start                 # alla tre, öppna http://localhost:4200
npm run start:arenden     # en app fristående: http://localhost:4201/arenden/
```

Lokalt fungerar start-appens dev-server som gateway: `apps/start/proxy.conf.json` skickar `/arenden` till 4201 och `/rapporter` till 4202. Därför delar allt origin, precis som i drift. Kör du en app fristående saknas `/meny.json`, och menyn visar då bara länken till Start.

Kör som i drift, med separata containrar bakom gatewayn:

```bash
npm run build
docker compose -f deploy/docker-compose.yml up --build   # http://localhost:8080
```

## Hur det hänger ihop

**Varje app** har en egen `baseHref` (`/arenden/`) i `project.json` och ser likadan ut:

```ts
// app.config.ts
providers: [provideRouter(appRoutes), provideSidlayout('arenden')]

// app.ts
template: `<mfe-sidlayout><router-outlet /></mfe-sidlayout>`
```

**`mfeLank`** avgör hur en länk ska navigera:

```html
<a [mfeLank]="{ app: 'arenden', sokvag: 'A-1041' }">A-1041</a>
```

- Målet ligger i samma app: klientnavigering via routern, utan sidladdning.
- Målet ligger i en annan app: vanlig länk, webbläsaren laddar den appen.

`href` är alltid den fullständiga adressen. Mittenklick, ctrl/cmd-klick och "öppna i ny flik" fungerar därför i båda fallen. Inom en app går det lika bra att använda vanlig `routerLink`.

**Menyn** hämtas från `/meny.json` vid runtime. Biblioteket äger bara utseende och logik. En ny menypost kräver alltså bara en deploy av `start`, inte av alla appar. Den aktiva posten är den med längst matchande sökväg i aktuell app. `/arenden/nya` markerar därför "Nya ärenden" och inte "Ärenden".

**Delat tillstånd** (vald enhet) ligger i `localStorage`, eftersom ett appbyte är en full sidladdning. Det fungerar för att alla appar delar origin bakom gatewayn. Andra öppna flikar hålls i synk via `storage`-eventet.

**Övergångar**: `@view-transition { navigation: auto; }` i tokens ger en mjuk övergång mellan appar. Sidhuvud och meny har egna `view-transition-name` och står still medan innehållet tonas över. I dev-läge loggar Chromium att övergången avbryts, eftersom Vite laddar stilarna efter sidan. Det påverkar inte produktionsbygget.

**När en app är nere** visar gatewayn `deploy/gateway/otillganglig.html` i stället för en 502. Övriga appar påverkas inte. **Om `meny.json` inte går att hämta** visar menyn bara Start och ett meddelande.

## Oberoende deploy

| Ändring i | Påverkade appar |
|---|---|
| `apps/arenden/**` | `arenden` |
| `apps/start/public/meny.json` | `start` |
| `libs/delat/layout/**` | alla tre |

```bash
npm run affected:appar
```

Pipeline (`azure-pipelines.yml`) bygger en matris med en deploy-jobbinstans per påverkad app.

Varje app kan deployas som egen container (`deploy/app/Dockerfile`) eller som statiska filer i en egen mapp på samma host, t.ex. `$web/arenden/` i ett Azure Storage-konto. Gatewayn, eller Front Door eller en ingress, är den enda som behöver veta var apparna bor.

## Jämfört med mfe-poc (shell + Native Federation)

| | mfe-poc | mfe-layout-poc |
|---|---|---|
| Koppling mellan appar | Runtime (manifest, remoteEntry) | Bara via URL |
| Byte mellan områden | SPA-navigering | Full sidladdning (med view transition) |
| Delat tillstånd | Singleton-tjänst i minnet | localStorage / cookie / backend |
| Angular-version | Måste vara samma i alla appar | Kan skilja under en uppgradering |
| Ändring i header/meny | Bara shell deployas | Alla appar byggs och deployas (menyinnehåll undantaget) |
| Header-version i drift | Alltid en | Kan skilja mellan appar tills alla deployats |
| Felisolering | Shell fångar laddfel per remote | Helt separata sidor, gatewayn visar felsida |
| Infrastruktur | CORS, manifest per miljö | Gateway med sökvägsrouting |
| Felsökning | Federation, delade chunks | Vanlig Angular-app |

## Regler som håller isär teamen

1. **Sökvägskonventionen är kontraktet.** `start` på `/`, alla andra på `/<appnamn>/`. Den finns på tre ställen som måste hållas i synk: `appBas()`, gatewayn och `baseHref`.
2. **Länka till andra appar med `mfeLank`**, aldrig med hårdkodade `href`.
3. **Layoutändringar ska vara bakåtkompatibla.** Så länge alla appar inte har deployats om visas olika versioner av headern i olika appar.
4. **`index.html` och `meny.json` får aldrig cachas.** Se `deploy/app/default.conf.template`.
5. **Delat tillstånd som måste överleva ett appbyte** ska ligga i URL, cookie, `localStorage` eller backend, aldrig bara i minnet.

## Lägga till en ny app

```bash
npx nx g @nx/angular:application apps/fakturor --name=fakturor --bundler=esbuild --style=scss --prefix=app
```

Sedan:

- Sätt `baseHref: "/fakturor/"` och en port i `project.json`.
- Använd samma `app.ts`, `app.config.ts` och `styles.scss` som de andra apparna, med `provideSidlayout('fakturor')`.
- Lägg till en rad i `apps/start/proxy.conf.json` och en `location` i gatewayn.
- Lägg till menyposten i `meny.json`.

## Nästa steg utanför PoC:n

- Autentisering med sessionscookie på gatewayns domän, så att alla appar är inloggade utan egen inloggning.
- Modulgränser med `@nx/eslint-plugin`. Taggarna `typ:app` och `typ:delat` finns redan. Förbjud t.ex. import mellan appar.
- Publicera layoutbiblioteket som versionerat npm-paket om apparna senare ska kunna ligga i separata repon.
