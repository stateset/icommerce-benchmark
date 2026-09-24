import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const product = await commerce.products.create({ name: 'Mug kit', slug: 'mug-kit' });
const componentSku = 'MUG-001';
const finishedSku = 'KIT-001';
await commerce.inventory.createItem({
  sku: componentSku, name: 'Ceramic mug', initialQuantity: 20,
});
await commerce.inventory.createItem({
  sku: finishedSku, name: 'Mug kit', initialQuantity: 0,
});

const bom = await commerce.bom.create({
  name: 'Two-mug kit', productId: product.id, revision: 'A',
});
await commerce.bom.addComponent(bom.id, {
  componentSku, name: 'Ceramic mug', quantity: 2, unitOfMeasure: 'each',
});
const components = await commerce.bom.getComponents(bom.id);
await commerce.bom.activate(bom.id);
const activeBom = await commerce.bom.get(bom.id);

const workOrder = await commerce.workOrders.create({
  productId: product.id, bomId: bom.id, quantityToBuild: 3,
});
await commerce.workOrders.start(workOrder.id);
const startStatus = (await commerce.workOrders.get(workOrder.id)).status;

await commerce.workOrders.complete(workOrder.id, 1);
const partial = await commerce.workOrders.get(workOrder.id);
await commerce.workOrders.complete(workOrder.id, 2);
const completed = await commerce.workOrders.get(workOrder.id);

const componentStock = await commerce.inventory.getStock(componentSku);
const finishedStock = await commerce.inventory.getStock(finishedSku);

console.log(JSON.stringify({
  bomStatus: activeBom.status,
  bomRevision: activeBom.revision,
  componentLines: components.length,
  componentQty: components[0]?.quantity ?? null,
  targetQty: workOrder.quantityToBuild,
  startStatus,
  partialStatus: partial.status,
  partialCompleted: partial.quantityCompleted,
  finalStatus: completed.status,
  finalCompleted: completed.quantityCompleted,
  componentOnHand: componentStock.totalOnHand,
  finishedOnHand: finishedStock.totalOnHand,
  workOrderCount: await commerce.workOrders.count(),
}));
