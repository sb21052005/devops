import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from '../src/server.mjs';
import { products, calculateTotal } from '../src/catalog.mjs';

test('catalog contains three products with positive integer prices', () => {
  assert.equal(products.length, 3);
  assert.ok(products.every((product) => Number.isInteger(product.pricePaise) && product.pricePaise > 0));
});
test('empty cart has zero total', () => assert.equal(calculateTotal([]), 0));
test('cart computes exact totals without floating point rounding', () => {
  assert.equal(calculateTotal([{ id: 'notebook', quantity: 2 }, { id: 'pen', quantity: 3 }]), 22000);
});
test('unknown product and invalid quantities are rejected', () => {
  for (const item of [{ id: 'missing', quantity: 1 }, { id: 'pen', quantity: -1 }, { id: 'pen', quantity: 1.5 }, { id: 'pen', quantity: 100 }]) {
    assert.throws(() => calculateTotal([item]), TypeError);
  }
});
test('non-array cart is rejected', () => assert.throws(() => calculateTotal(null), TypeError));
test('HTTP routes return health, storefront and catalog', async (context) => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.status, 'ok');
  assert.equal(health.catalogSize, 3);
  assert.equal((await (await fetch(`${base}/api/products`)).json()).length, 3);
  assert.match(await (await fetch(base)).text(), /ShopEasy Lite/);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});
test('HTTP cart endpoint accepts valid input and rejects malformed data', async (context) => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${base}/api/cart`, { method: 'POST', body: JSON.stringify({ items: [{ id: 'pen', quantity: 2 }] }) });
  assert.deepEqual(await response.json(), { totalPaise: 4000, currency: 'INR' });
  assert.equal((await fetch(`${base}/api/cart`, { method: 'POST', body: '{bad' })).status, 400);
});
