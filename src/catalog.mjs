export const products = Object.freeze([
  Object.freeze({ id: 'notebook', name: 'Notebook', pricePaise: 8000 }),
  Object.freeze({ id: 'pen', name: 'Pen', pricePaise: 2000 }),
  Object.freeze({ id: 'bottle', name: 'Water Bottle', pricePaise: 25000 })
]);

export function calculateTotal(items) {
  if (!Array.isArray(items) || items.length > 100) {
    throw new TypeError('Cart must be an array of at most 100 items');
  }
  return items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item?.id);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new TypeError('Each item needs a valid product and quantity from 1 to 99');
    }
    return sum + product.pricePaise * item.quantity;
  }, 0);
}
