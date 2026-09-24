import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const customer = await commerce.customers.create({
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
});
const order = await commerce.orders.createExact({
  customerId: customer.id,
  currency: 'USD',
  items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
});
await commerce.orders.ship(order.id, 'DEMO-OUTBOUND-001');
const shipped = await commerce.orders.get(order.id);

const request = {
  orderId: shipped.id,
  reason: 'damaged',
  reasonDetails: 'One mug arrived cracked',
  idempotencyKey: `return-${shipped.id}-mug-1`,
  items: [{ orderItemId: shipped.items[0].id, quantity: 1 }],
};
const rma = await commerce.returns.create(request);
const replay = await commerce.returns.create(request);

const approved = await commerce.returns.approve(rma.id);
const inTransit = await commerce.returns.addTracking(rma.id, 'DEMO-RETURN-001');
const received = await commerce.returns.markReceived(rma.id);

let completeRejectionCode = null;
try {
  await commerce.returns.complete(rma.id);
} catch (error) {
  completeRejectionCode = error.code ?? null;
}
const final = await commerce.returns.get(rma.id);

console.log(JSON.stringify({
  orderStatus: shipped.status,
  returnStatus: rma.status,
  replaySameId: replay.id === rma.id,
  returnCount: await commerce.returns.count(),
  approvedStatus: approved.status,
  trackingStatus: inTransit.status,
  receivedStatus: received.status,
  completeRejectionCode,
  finalStatus: final.status,
}));
