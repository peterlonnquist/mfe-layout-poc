// Lokal motsvarighet till deploy/gateway/nginx.conf: en origin framför alla dev-servrar,
// så att länkar mellan appar, localStorage och cookies fungerar som i drift.
// Bara för utveckling. I drift gör nginx, Front Door eller en ingress samma jobb.
import { createServer, request } from 'node:http';
import { connect } from 'node:net';
import { readFileSync } from 'node:fs';

const port = Number(process.env.PORT ?? 4000);

// Sökvägsprefix -> dev-server. Första träff vinner, så '/' (huvudapplikationen) måste ligga sist.
const rutter = [
  { prefix: '/bff/', mal: 4300 },
  { prefix: '/arenden/', mal: 4201 },
  { prefix: '/rapporter/', mal: 4202 },
  { prefix: '/', mal: 4200 },
];

const otillganglig = readFileSync(new URL('../../deploy/gateway/otillganglig.html', import.meta.url));

const malFor = (url) => rutter.find((r) => url.startsWith(r.prefix)).mal;

const server = createServer((req, res) => {
  const sokvag = req.url.split('?')[0];

  // Som `location = /arenden { return 301 /arenden/; }` i nginx.
  const utanSnedstreck = rutter.find((r) => r.prefix.length > 1 && sokvag + '/' === r.prefix);
  if (utanSnedstreck) {
    res.writeHead(301, { Location: utanSnedstreck.prefix }).end();
    return;
  }

  const mal = malFor(req.url);
  const vidare = request({ port: mal, path: req.url, method: req.method, headers: req.headers }, (svar) => {
    res.writeHead(svar.statusCode, svar.headers);
    svar.pipe(res);
  });

  // Appen är inte igång: samma felsida som gatewayn i drift visar, övriga appar påverkas inte.
  vidare.on('error', () => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(otillganglig);
  });

  req.pipe(vidare);
});

// Websockets (Vites HMR) skickas vidare rått till rätt dev-server.
server.on('upgrade', (req, klient, huvud) => {
  const vidare = connect(malFor(req.url), 'localhost', () => {
    const rader = [`${req.method} ${req.url} HTTP/${req.httpVersion}`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) rader.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    vidare.write(rader.join('\r\n') + '\r\n\r\n');
    vidare.write(huvud);
    vidare.pipe(klient).pipe(vidare);
  });
  vidare.on('error', () => klient.destroy());
  klient.on('error', () => vidare.destroy());
});

server.listen(port, () => console.log(`dev-gateway: öppna http://localhost:${port}`));
