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

const paymentInput = {
  orderId: order.id,
  customerId: customer.id,
  amount: order.totalAmountExact,
  currency: 'USD',
  paymentMethod: 'card',
  idempotencyKey: `payment-${order.id}-1`,
};
const payment = await commerce.payments.createExact(paymentInput);
const paymentReplay = await commerce.payments.createExact(paymentInput);

let earlyRefundRejectionCode = null;
try {
  await commerce.payments.createRefundExact({
    paymentId: payment.id, amount: '12.50', idempotencyKey: `early-${payment.id}`,
  });
} catch (error) {
  earlyRefundRejectionCode = error.code ?? null;
}

const completed = await commerce.payments.markCompleted(payment.id);

const refundInput = {
  paymentId: payment.id,
  amount: '12.50',
  reason: 'One mug returned',
  idempotencyKey: `refund-${payment.id}-1`,
};
const refund = await commerce.payments.createRefundExact(refundInput);
const refundReplay = await commerce.payments.createRefundExact(refundInput);

let overRefundRejectionCode = null;
try {
  await commerce.payments.createRefundExact({
    ...refundInput, amount: '20.00', idempotencyKey: `too-large-${payment.id}`,
  });
} catch (error) {
  overRefundRejectionCode = error.code ?? null;
}

const storedPayment = await commerce.payments.get(payment.id);
const storedOrder = await commerce.orders.get(order.id);

console.log(JSON.stringify({
  paymentStatus: payment.status,
  paymentAmount: payment.amountExact,
  paymentReplaySameId: paymentReplay.id === payment.id,
  paymentCount: await commerce.payments.count(),
  earlyRefundRejectionCode,
  completedStatus: completed.status,
  refundStatus: refund.status,
  refundAmount: refund.amountExact,
  refundReplaySameId: refundReplay.id === refund.id,
  overRefundRejectionCode,
  storedPaymentStatus: storedPayment.status,
  orderPaymentStatus: storedOrder.paymentStatus,
}));
