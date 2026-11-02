const cart = new Map();
const money = (paise) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
const products = await fetch('/api/products').then((response) => response.json());
async function renderCart() {
  const items = Array.from(cart, ([id, quantity]) => ({ id, quantity }));
  const response = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
  const result = await response.json();
  document.querySelector('#cart').textContent = items.length ? items.map((item) => `${products.find((product) => product.id === item.id).name} × ${item.quantity}`).join(', ') : 'Your cart is empty.';
  document.querySelector('#total').textContent = `Total: ${money(result.totalPaise)}`;
}
for (const product of products) {
  const article = document.createElement('article');
  const heading = document.createElement('h3');
  heading.textContent = product.name;
  const price = document.createElement('p');
  price.textContent = money(product.pricePaise);
  const button = document.createElement('button');
  button.textContent = 'Add to cart';
  button.setAttribute('aria-label', `Add ${product.name} to cart`);
  button.addEventListener('click', async () => {
    cart.set(product.id, Math.min(99, (cart.get(product.id) || 0) + 1));
    await renderCart();
  });
  article.append(heading, price, button);
  document.querySelector('#products').append(article);
}
document.querySelector('#clear').addEventListener('click', async () => { cart.clear(); await renderCart(); });
const health = await fetch('/health').then((response) => response.json());
document.querySelector('#status').textContent = `Application health: ${health.status} · Version ${health.version}`;
