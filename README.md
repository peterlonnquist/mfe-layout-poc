# mfe-layout-poc – plattform för fristående Angular-appar med delat layoutbibliotek

Alternativ till `mfe-poc` (shell + Native Federation). Här finns **ingen shell och ingen runtime-federation**. Varje microfrontend är en vanlig, fristående Angular-app i ett eget repo, på en egen sökväg bakom en gateway. Alla appar installerar samma layoutbibliotek som npm-paket: sidhuvud, meny och enhetsväljare.

Versioner: Nx 24.0, Angular 22.2.

Det här repot är plattformen. Microfrontendarna ligger i egna repon bredvid det:

| Repo | App | Sökväg | Port lokalt |
|---|---|---|---|
| `mfe-layout-poc` (det här) | `huvudapplikation`, startsidan | `/` | 4200 |
| `mfe-arenden` | `arenden` | `/arenden/` | 4201 |
| `mfe-rapporter` | `rapporter` | `/rapporter/` | 4202 |

## Struktur

```
apps/
  backend-for-frontend/  Node-tjänst, API under /bff/api/1.0/              :4300
  huvudapplikation/      Startsida på /                                    :4200
libs/delat/layout/       npm-paketet @mfe-layout-poc/delat-layout
  sidlayout     <mfe-sidlayout> – sidhuvud, meny, innehållsyta
  app-lank      appUrl(): adress till en annan app enligt sökvägskonventionen
  meny.service  Läser menyns innehåll från /bff/api/1.0/meny vid runtime
  session       Vald enhet, sparad i localStorage
  stil/         Designtokens + cross-document view transitions
deploy/
  app/          Dockerfile + nginx-mall för huvudapplikationen
  backend-for-frontend/  Dockerfile för Node-tjänsten
  gateway/      nginx som routar sökväg -> app, plus felsida
  register/     Lokalt npm-register (Verdaccio) på :4873
tools/
  dev-gateway/  Lokal gateway på :4000, samma routing som deploy/gateway
azure-pipelines.yml
```

## Kom igång

Klona `mfe-arenden` och `mfe-rapporter` bredvid det här repot. I det här repot:

```bash
npm install
npm run register          # startar det lokala npm-registret (Docker), http://localhost:4873
npm run publicera:layout  # bygger biblioteket och publicerar det till registret
npm start                 # dev-gateway, bff och huvudapplikation, öppna http://localhost:4000
```

I `mfe-arenden` och `mfe-rapporter`:

```bash
npm install               # hämtar @mfe-layout-poc/delat-layout från registret (se .npmrc)
npm start                 # 4201 respektive 4202, nås via http://localhost:4000/arenden/ och /rapporter/
```

Lokalt surfar du alltid via `tools/dev-gateway` på 4000. Den routar som nginx-gatewayn i drift: `/bff/` till 4300, `/arenden/` till 4201, `/rapporter/` till 4202 och allt annat till `huvudapplikation` på 4200. Därför delar alla appar origin, precis som i drift, så länkar mellan appar och vald enhet i `localStorage` fungerar. En app som inte är igång ger gatewayns felsida, övriga fungerar. Varje apps dev-server proxar dessutom `/bff` till 4300, så en app på sin egen port (t.ex. 4201) får också menyn, men länkar till andra appar fungerar bara via gatewayn.

Kör som i drift, med separata containrar bakom gatewayn:

```bash
npm run build                                            # och npm run build i mfe-arenden och mfe-rapporter
docker compose -f deploy/docker-compose.yml up --build   # http://localhost:8080
```

## Hur det hänger ihop

**Varje app** har en egen `baseHref` (`/arenden/`) i `angular.json` och ser likadan ut:

```ts
// app.config.ts
providers: [provideRouter(appRoutes), provideSidlayout('arenden')]

// app.ts
template: `<mfe-sidlayout><router-outlet /></mfe-sidlayout>`
```

**Layoutbiblioteket** är ett vanligt Angular-bibliotek som byggs med ng-packagr till `@mfe-layout-poc/delat-layout`. `mfe-arenden` och `mfe-rapporter` installerar paketet och tar in designtokens med `@use '@mfe-layout-poc/delat-layout/stil/tokens';`. Huvudapplikationen ligger i samma repo och använder biblioteket direkt från källkoden via `tsconfig.base.json`.

Paketet publiceras till ett lokalt npm-register, [Verdaccio](https://verdaccio.org/) i Docker (`deploy/register/`), som simulerar t.ex. Azure Artifacts. Apparna har `@mfe-layout-poc:registry=http://localhost:4873` i `.npmrc` och anger en vanlig version, `"^0.1.0"`. Övriga paket hämtas som vanligt från npmjs.org.

En ny version: höj `version` i `libs/delat/layout/package.json` och kör `npm run publicera:layout`. Samma version kan inte publiceras två gånger. Apparna tar in den med `npm update @mfe-layout-poc/delat-layout`, eller `npm install @mfe-layout-poc/delat-layout@0.2.0` vid en ny minor/major, när de själva vill. I drift byts bara adressen i `.npmrc` mot företagets register.

Registret måste vara igång när apparna kör `npm install`. Paketen ligger i Docker-volymen `paket`, så de finns kvar efter omstart men måste publiceras igen om volymen tas bort.

**Länkar** är vanliga Angular-länkar:

```html
<!-- Inom den egna appen: routern, utan sidladdning -->
<a [routerLink]="['/', arende.id]">{{ arende.id }}</a>

<!-- Till en annan app: vanlig länk, webbläsaren laddar den appen -->
<a [href]="appUrl({ app: 'arenden', sokvag: 'A-1041' })">A-1041</a>
```

`appUrl()` bygger adressen enligt sökvägskonventionen. Menyn i sidlayouten väljer `routerLink` eller `href` beroende på om menyposten hör till den aktuella appen.

**Menyn** hämtas från `/bff/api/1.0/meny` vid runtime. Den serveras av `backend-for-frontend`, en liten Node-tjänst utan beroenden som läser `apps/backend-for-frontend/meny.json`. Biblioteket äger bara utseende och logik. En ny menypost kräver alltså bara en deploy av `backend-for-frontend`, inte av alla appar. Den aktiva posten är den med längst matchande sökväg i aktuell app. `/arenden/nya` markerar därför "Nya ärenden" och inte "Ärenden".

**Delat tillstånd** (vald enhet) ligger i `localStorage`, eftersom ett appbyte är en full sidladdning. Det fungerar för att alla appar delar origin bakom gatewayn. Andra öppna flikar hålls i synk via `storage`-eventet.

**Övergångar**: `@view-transition { navigation: auto; }` i tokens ger en mjuk övergång mellan appar. Sidhuvud och meny har egna `view-transition-name` och står still medan innehållet tonas över. I dev-läge loggar Chromium att övergången avbryts, eftersom Vite laddar stilarna efter sidan. Det påverkar inte produktionsbygget.

**När en app är nere** visar gatewayn `deploy/gateway/otillganglig.html` i stället för en 502. Övriga appar påverkas inte. **Om menyn inte går att hämta** visar menyn bara Start och ett meddelande.

## Oberoende deploy

| Ändring i | Deployas |
|---|---|
| `apps/huvudapplikation/**` | `huvudapplikation` |
| `apps/backend-for-frontend/**` | `backend-for-frontend` |
| `libs/delat/layout/**` | `huvudapplikation`. Övriga appar tar in en ny paketversion när de själva vill. |
| `mfe-arenden`, `mfe-rapporter` | den appen, från sitt eget repo |

```bash
npm run affected:appar
```

Pipeline (`azure-pipelines.yml`) bygger en matris med en deploy-jobbinstans per påverkad app i det här repot.

Varje app deployas som egen container eller som statiska filer i en egen mapp på samma host, t.ex. `$web/arenden/` i ett Azure Storage-konto. Huvudapplikationen använder `deploy/app/Dockerfile`, övriga appar Dockerfilen i sitt eget repo. Gatewayn, eller Front Door eller en ingress, är den enda som behöver veta var apparna bor.

## Jämfört med mfe-poc (shell + Native Federation)

| | mfe-poc | mfe-layout-poc |
|---|---|---|
| Koppling mellan appar | Runtime (manifest, remoteEntry) | Bara via URL |
| Byte mellan områden | SPA-navigering | Full sidladdning (med view transition) |
| Delat tillstånd | Singleton-tjänst i minnet | localStorage / cookie / backend |
| Angular-version | Måste vara samma i alla appar | Kan skilja under en uppgradering |
| Ändring i header/meny | Bara shell deployas | Ny paketversion som varje app tar in och deployar (menyinnehåll undantaget) |
| Header-version i drift | Alltid en | Kan skilja mellan appar tills alla tagit in samma version |
| Felisolering | Shell fångar laddfel per remote | Helt separata sidor, gatewayn visar felsida |
| Infrastruktur | CORS, manifest per miljö | Gateway med sökvägsrouting |
| Felsökning | Federation, delade chunks | Vanlig Angular-app |

## Regler som håller isär teamen

1. **Sökvägskonventionen är kontraktet.** `huvudapplikation` på `/`, alla andra på `/<appnamn>/`. Den finns på fyra ställen som måste hållas i synk: `appBas()`, gatewayn, dev-gatewayn och `baseHref`.
2. **Länka till andra appar med `appUrl()`**, aldrig med hårdkodade `href`.
3. **Layoutändringar ska vara bakåtkompatibla och versioneras.** Varje app tar in en ny version av paketet i sin egen takt, så olika versioner av headern kan visas i olika appar.
4. **`index.html` och menyn får aldrig cachas.** Se `deploy/app/default.conf.template` och `apps/backend-for-frontend/server.mjs`.
5. **Delat tillstånd som måste överleva ett appbyte** ska ligga i URL, cookie, `localStorage` eller backend, aldrig bara i minnet.

## Lägga till en ny app

En ny app får ett eget repo, som `mfe-arenden`:

```bash
ng new fakturor --directory mfe-fakturor --style=scss --ssr=false --routing
cd mfe-fakturor
echo '@mfe-layout-poc:registry=http://localhost:4873' > .npmrc
npm install @mfe-layout-poc/delat-layout
```

Sedan:

- Sätt `baseHref: "/fakturor/"` i `angular.json` och en port under `serve`.
- Använd samma `app.ts`, `app.config.ts` och `styles.scss` som i `mfe-arenden`, med `provideSidlayout('fakturor')`.
- Ge appen en `proxy.conf.json` med `/bff` -> `http://localhost:4300` och peka ut den med `proxyConfig` i `serve`.
- Kopiera `Dockerfile` och `deploy/` från `mfe-arenden`.
- Lägg till en rutt i `tools/dev-gateway/server.mjs` och en `location` i `deploy/gateway/nginx.conf`.
- Lägg till menyposten i `apps/backend-for-frontend/meny.json`.

## Nästa steg utanför PoC:n

- Publicera layoutbiblioteket till ett riktigt register (Azure Artifacts eller GitHub Packages) i stället för Verdaccio, så att även apparnas CI kan installera det.
- Autentisering med sessionscookie på gatewayns domän, så att alla appar är inloggade utan egen inloggning.
