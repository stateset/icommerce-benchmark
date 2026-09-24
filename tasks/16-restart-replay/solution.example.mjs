import { Commerce } from '@stateset/embedded';

const commerce = new Commerce('./restart.db');
const customer = await commerce.customers.create({
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
});
const order = await commerce.orders.createExact({
  customerId: customer.id,
  currency: 'USD',
  items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
});
const input = {
  customerId: customer.id,
  orderId: order.id,
  amount: order.totalAmountExact,
  currency: 'USD',
  paymentMethod: 'card',
  idempotencyKey: 'restart-payment-001',
};
const payment = await commerce.payments.createExact(input);
console.log(JSON.stringify({
  input,
  paymentId: payment.id,
  amount: payment.amountExact,
  status: payment.status,
  paymentCount: await commerce.payments.count(),
  orderCount: await commerce.orders.count(),
}));
