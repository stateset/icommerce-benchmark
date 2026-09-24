import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const supplier = await commerce.purchaseOrders.createSupplier({
  name: 'Example supplier',
  supplierCode: 'DEMO-SUPPLIER',
  email: 'purchasing@example.com',
});
const storedSupplier = await commerce.purchaseOrders.getSupplier(supplier.id);

const input = {
  supplierId: supplier.id,
  items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 10, unitCost: 5 }],
  notes: 'Local onboarding example; no supplier delivery',
};
const po = await commerce.purchaseOrders.create(input);

let sendDraftRejectionCode = null;
try {
  await commerce.purchaseOrders.send(po.id);
} catch (error) {
  sendDraftRejectionCode = error.code ?? null;
}
const afterFailedSend = await commerce.purchaseOrders.get(po.id);

const submitted = await commerce.purchaseOrders.submit(po.id);
const approved = await commerce.purchaseOrders.approve(po.id, 'demo-approver');
const sent = await commerce.purchaseOrders.send(po.id);
const stored = await commerce.purchaseOrders.get(po.id);

const abandoned = await commerce.purchaseOrders.create(input);
await commerce.purchaseOrders.cancel(abandoned.id);
let submitCancelledRejectionCode = null;
try {
  await commerce.purchaseOrders.submit(abandoned.id);
} catch (error) {
  submitCancelledRejectionCode = error.code ?? null;
}
const cancelled = await commerce.purchaseOrders.get(abandoned.id);

console.log(JSON.stringify({
  supplierCode: storedSupplier.supplierCode,
  initialStatus: po.status,
  poTotal: po.totalExact,
  sendDraftRejectionCode,
  afterFailedSend: afterFailedSend.status,
  submittedStatus: submitted.status,
  approvedStatus: approved.status,
  sentStatus: sent.status,
  finalTotal: stored.totalExact,
  submitCancelledRejectionCode,
  cancelledStatus: cancelled.status,
  poCount: await commerce.purchaseOrders.count(),
}));
