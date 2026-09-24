import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const supported = await commerce.inboundShipments.isSupported();
const supplier = await commerce.purchaseOrders.createSupplier({ name: 'Example supplier' });
const product = await commerce.products.create({ name: 'Ceramic mug', slug: 'ceramic-mug' });
const sku = 'MUG-001';
await commerce.inventory.createItem({ sku, name: 'Ceramic mug', initialQuantity: 0 });

const input = {
  supplierId: supplier.id,
  items: [{ productId: product.id, sku, quantityExpected: '10' }],
};
const shipment = await commerce.inboundShipments.create(input);
const itemId = shipment.items[0].id;

await commerce.inboundShipments.markInTransit(shipment.id);
const arrived = await commerce.inboundShipments.markArrived(shipment.id);

const partial = await commerce.inboundShipments.receiveLine(shipment.id, itemId, '4');

let excessRejectionCode = null;
try {
  await commerce.inboundShipments.receiveLine(shipment.id, itemId, '7');
} catch (error) {
  excessRejectionCode = error.code ?? null;
}
const afterRejection = await commerce.inboundShipments.get(shipment.id);

const received = await commerce.inboundShipments.receiveLine(shipment.id, itemId, '6');
const stock = await commerce.inventory.getStock(sku);

const abandoned = await commerce.inboundShipments.create({
  ...input,
  items: [{ ...input.items[0], quantityExpected: '2' }],
});
await commerce.inboundShipments.cancel(abandoned.id);
let cancelledRejectsReceipt = false;
try {
  await commerce.inboundShipments.receiveLine(abandoned.id, abandoned.items[0].id, '1');
} catch {
  cancelledRejectsReceipt = true;
}
const cancelled = await commerce.inboundShipments.get(abandoned.id);

console.log(JSON.stringify({
  supported,
  createdStatus: shipment.status,
  createdReceived: shipment.items[0].quantityReceived,
  arrivalStatus: arrived.status,
  partialStatus: partial.status,
  partialReceived: partial.items[0].quantityReceived,
  excessRejectionCode,
  afterRejectReceived: afterRejection.items[0].quantityReceived,
  finalStatus: received.status,
  finalReceived: received.items[0].quantityReceived,
  stockOnHand: stock.totalOnHand,
  stockAllocated: stock.totalAllocated,
  stockAvailable: stock.totalAvailable,
  cancelledRejectsReceipt,
  cancelledReceived: cancelled.items[0].quantityReceived,
}));
