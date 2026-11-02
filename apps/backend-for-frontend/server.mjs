// Backend for frontend: tjänster som alla appar behöver, oberoende av att någon app är igång.
// Alla endpoints ligger under /bff/api/<version>/, så proxy och gateway behöver bara en regel.
// Nås same-origin via dev-proxyn (proxy.conf.json) eller gatewayn, så ingen CORS behövs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.PORT ?? 4300);
const menyFil = new URL('./meny.json', import.meta.url);

const server = createServer(async (req, res) => {
  const sokvag = (req.url ?? '/').split('?')[0];

  if (req.method === 'GET' && sokvag === '/bff/api/1.0/meny') {
    try {
      // Läses vid varje anrop, så en ändrad meny.json syns utan omstart.
      const meny = await readFile(menyFil, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        // Får aldrig cachas, annars syns en ny meny inte.
        'Cache-Control': 'no-cache',
      });
      res.end(meny);
    } catch (fel) {
      console.error('Kunde inte läsa meny.json', fel);
      res.writeHead(500).end();
    }
    return;
  }

  if (req.method === 'GET' && sokvag === '/halsa') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    return;
  }

  res.writeHead(404).end();
});

server.listen(port, () => console.log(`backend-for-frontend lyssnar på http://localhost:${port}`));
