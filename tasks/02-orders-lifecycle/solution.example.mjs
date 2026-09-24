import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const customer = await commerce.customers.create({
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
});
await commerce.inventory.createItem({
  sku: 'MUG-001', name: 'Ceramic mug', initialQuantity: 10,
});
const input = {
  customerId: customer.id,
  currency: 'USD',
  stockPolicy: 'reject_if_insufficient',
  items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
};
const order = await commerce.orders.createExact(input);
const afterCreate = await commerce.inventory.getStock('MUG-001');

let rejectionCode = null;
try {
  await commerce.orders.createExact({
    ...input,
    items: [{ ...input.items[0], quantity: 9 }],
  });
} catch (error) {
  rejectionCode = error.code ?? null;
}
const orderCountAfterReject = await commerce.orders.count();
await commerce.orders.updateStatus(order.id, 'confirmed');
const cancelled = await commerce.orders.cancel(order.id);
const final = await commerce.inventory.getStock('MUG-001');

console.log(JSON.stringify({
  afterCreateAllocated: afterCreate.totalAllocated,
  afterCreateAvailable: afterCreate.totalAvailable,
  rejectionCode,
  orderCountAfterReject,
  finalStatus: cancelled.status,
  finalAllocated: final.totalAllocated,
  finalAvailable: final.totalAvailable,
}));
