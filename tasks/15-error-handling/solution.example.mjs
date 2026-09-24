import { Commerce } from '@stateset/embedded';

async function reserveForCheckout(inventory, sku, quantity, checkoutId) {
  try {
    const reservation = await inventory.reserve(
      sku, quantity, 'checkout', checkoutId, 300,
    );
    return { kind: 'reserved', reservationId: reservation.id };
  } catch (error) {
    if (error?.code !== 'INSUFFICIENT_STOCK') throw error;
    const stock = await inventory.getStock(sku);
    return {
      kind: 'out_of_stock',
      available: stock?.totalAvailable ?? null,
    };
  }
}

const commerce = new Commerce(':memory:');
await commerce.inventory.createItem({
  sku: 'MUG-001', name: 'Ceramic mug', initialQuantity: 2,
});

const oversized = await reserveForCheckout(commerce.inventory, 'MUG-001', 3, 'checkout-001');
const rejectedStock = await commerce.inventory.getStock('MUG-001');

const hold = await reserveForCheckout(commerce.inventory, 'MUG-001', 1, 'checkout-002');
await commerce.inventory.releaseReservation(hold.reservationId);
const afterReleaseAvailable = (await commerce.inventory.getStock('MUG-001')).totalAvailable;

// A test double verifies the handler's failure path; it does not simulate engine internals.
const failure = new Error('Synthetic unexpected failure');
let attempts = 0;
const stubInventory = {
  async reserve() { attempts++; throw failure; },
  async getStock() { throw new Error('Unexpected errors must not become stock results'); },
};
let unexpectedPropagated = false;
try {
  await reserveForCheckout(stubInventory, 'MUG-001', 1, 'checkout-003');
} catch (error) {
  unexpectedPropagated = error === failure;
}

console.log(JSON.stringify({
  oversizedKind: oversized.kind,
  oversizedAvailable: oversized.available,
  stockAfterReject: [
    rejectedStock.totalOnHand,
    rejectedStock.totalAllocated,
    rejectedStock.totalAvailable,
  ],
  holdKind: hold.kind,
  hasReservationId: hold.reservationId != null,
  afterReleaseAvailable,
  unexpectedPropagated,
  unexpectedAttempts: attempts,
}));
