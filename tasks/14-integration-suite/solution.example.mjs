import { Commerce } from '@stateset/embedded';

async function fixture() {
  const commerce = new Commerce(':memory:');
  const customer = await commerce.customers.create({
    email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
  });
  await commerce.inventory.createItem({
    sku: 'MUG-001', name: 'Ceramic mug', initialQuantity: 3,
  });
  const orderInput = {
    customerId: customer.id,
    currency: 'USD',
    stockPolicy: 'reject_if_insufficient',
    items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
  };
  return { commerce, customer, orderInput };
}

async function stockTriple(commerce) {
  const stock = await commerce.inventory.getStock('MUG-001');
  return [stock.totalOnHand, stock.totalAllocated, stock.totalAvailable];
}

// 1. Cancellation restores the allocation.
const first = await fixture();
const order = await first.commerce.orders.createExact(first.orderInput);
const cancelled = await first.commerce.orders.cancel(order.id);
const afterCancel = await stockTriple(first.commerce);

// 2. An oversized order leaves nothing behind.
const second = await fixture();
let oversizedRejectionCode = null;
try {
  await second.commerce.orders.createExact({
    ...second.orderInput,
    items: [{ ...second.orderInput.items[0], quantity: 4 }],
  });
} catch (error) {
  oversizedRejectionCode = error.code ?? null;
}
const countAfterReject = await second.commerce.orders.count();
const availableAfterReject = (await second.commerce.inventory.getStock('MUG-001')).totalAvailable;

// 3. Payment replay reuses the original record.
const third = await fixture();
const payOrder = await third.commerce.orders.createExact(third.orderInput);
const paymentInput = {
  customerId: third.customer.id,
  orderId: payOrder.id,
  amount: payOrder.totalAmountExact,
  currency: 'USD',
  paymentMethod: 'card',
  idempotencyKey: `payment-${payOrder.id}-1`,
};
const firstPayment = await third.commerce.payments.createExact(paymentInput);
const replayPayment = await third.commerce.payments.createExact(paymentInput);

console.log(JSON.stringify({
  cancelledStatus: cancelled.status,
  afterCancel,
  orderCount: await first.commerce.orders.count(),
  oversizedRejectionCode,
  countAfterReject,
  availableAfterReject,
  paymentReplaySameId: replayPayment.id === firstPayment.id,
  paymentAmount: replayPayment.amountExact,
  paymentCount: await third.commerce.payments.count(),
}));
