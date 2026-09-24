import { Commerce } from '@stateset/embedded';

const commerce = new Commerce('./store.db');
const customer = await commerce.customers.findOrCreate({
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
});
const order = await commerce.orders.createExact({
  customerId: customer.id,
  currency: 'USD',
  items: [
    { sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' },
  ],
});
const saved = await commerce.orders.get(order.id);
console.log(JSON.stringify({
  orderId: saved.id,
  status: saved.status,
  total: saved.totalAmountExact,
  currency: saved.currency,
}));
