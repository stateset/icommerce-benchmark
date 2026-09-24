import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const customer = await commerce.customers.create({
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
});
await commerce.inventory.createItem({
  sku: 'MUG-001', name: 'Ceramic mug', initialQuantity: 10,
});
const order = await commerce.orders.createExact({
  customerId: customer.id,
  currency: 'USD',
  stockPolicy: 'reject_if_insufficient',
  items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
});
const stock = await commerce.inventory.getStock('MUG-001');
const canCover9 = Number(stock.totalAvailable) >= 9;
console.log(JSON.stringify({
  orderStatus: order.status,
  totalAmountExact: order.totalAmountExact,
  currency: order.currency,
  onHand: stock.totalOnHand,
  allocated: stock.totalAllocated,
  available: stock.totalAvailable,
  canCover9,
}));
