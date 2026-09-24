import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const customer = await commerce.customers.create({
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
});
const sku = 'MUG-001';
await commerce.inventory.createItem({ sku, name: 'Ceramic mug', initialQuantity: 10 });
const order = await commerce.orders.createExact({
  customerId: customer.id,
  currency: 'USD',
  stockPolicy: 'reject_if_insufficient',
  items: [{ sku, name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
});
const shipment = await commerce.shipments.create({
  orderId: order.id,
  recipientName: 'Example recipient',
  shippingAddress: '123 Example Street, Example City',
  carrier: 'other',
  shippingMethod: 'standard',
});

async function recordDelivery(id) {
  const current = await commerce.shipments.get(id);
  if (!current || current.status !== 'shipped') {
    throw new Error('Application policy: only a shipped record can be delivered');
  }
  return commerce.shipments.deliver(id);
}

let earlyDeliveryBlocked = false;
try {
  await recordDelivery(shipment.id);
} catch (error) {
  earlyDeliveryBlocked = /Application policy: only a shipped record can be delivered/.test(error.message);
}
const afterBlocked = await commerce.shipments.get(shipment.id);

const shipped = await commerce.shipments.ship(shipment.id, 'DEMO-TRACKING-001');
const storedShipped = await commerce.shipments.get(shipment.id);
const delivered = await recordDelivery(shipment.id);

const storedOrder = await commerce.orders.get(order.id);
const stock = await commerce.inventory.getStock(sku);

console.log(JSON.stringify({
  createdStatus: shipment.status,
  earlyDeliveryBlocked,
  afterBlocked: afterBlocked.status,
  shippedStatus: shipped.status,
  tracking: storedShipped.trackingNumber,
  deliveredStatus: delivered.status,
  orderStatus: storedOrder.status,
  fulfillmentStatus: storedOrder.fulfillmentStatus,
  paymentStatus: storedOrder.paymentStatus,
  onHand: stock.totalOnHand,
  allocated: stock.totalAllocated,
  available: stock.totalAvailable,
  shipmentCount: await commerce.shipments.count(),
}));
