import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products, calculateTotal } from './catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};

export function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (request.method === 'GET' && pathname === '/health') {
        return json(response, 200, { status: 'ok', app: 'ShopEasy Lite', version: process.env.APP_VERSION || '1.0.0' });
      }
      if (request.method === 'GET' && pathname === '/api/products') {
        return json(response, 200, products);
      }
      if (request.method === 'POST' && pathname === '/api/cart') {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (Buffer.byteLength(body) > 16384) {
            json(response, 413, { error: 'Cart payload too large' });
            return;
          }
        }
        try {
          return json(response, 200, { totalPaise: calculateTotal(JSON.parse(body).items), currency: 'INR' });
        } catch {
          return json(response, 400, { error: 'Invalid cart' });
        }
      }
      if (request.method === 'GET' && (pathname === '/' || pathname === '/app.js')) {
        const filename = pathname === '/' ? 'index.html' : 'app.js';
        const content = await readFile(path.join(root, 'public', filename));
        response.writeHead(200, {
          'Content-Type': filename.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8',
          'X-Content-Type-Options': 'nosniff'
        });
        response.end(content);
        return;
      }
      json(response, 404, { error: 'Not found' });
    } catch {
      json(response, 500, { error: 'Internal server error' });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  server.listen(port, '0.0.0.0', () => console.log(`ShopEasy Lite listening on port ${port}`));
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}
