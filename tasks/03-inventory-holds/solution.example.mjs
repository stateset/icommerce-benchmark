import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const sku = 'MUG-001';
await commerce.inventory.createItem({
  sku, name: 'Ceramic mug', initialQuantity: 10,
});

const hold = await commerce.inventory.reserve(sku, 3, 'checkout', 'demo-checkout-001', 300);
if (hold.status !== 'pending') throw new Error(`expected pending hold, got ${hold.status}`);

let rejectionCode = null;
try {
  await commerce.inventory.reserve(sku, 8, 'checkout', 'demo-checkout-too-large', 300);
} catch (error) {
  rejectionCode = error.code ?? null;
}

await commerce.inventory.releaseReservation(hold.id);
const accepted = await commerce.inventory.reserve(sku, 2, 'checkout', 'demo-checkout-002', 300);
await commerce.inventory.confirmReservation(accepted.id);
await commerce.inventory.adjust(sku, -1, 'Damaged during stock count');
const final = await commerce.inventory.getStock(sku);

console.log(JSON.stringify({
  rejectionCode,
  finalOnHand: final.totalOnHand,
  finalAllocated: final.totalAllocated,
  finalAvailable: final.totalAvailable,
}));
