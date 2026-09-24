import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const input = {
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  acceptsMarketing: false,
};
const customer = await commerce.customers.findOrCreate(input);
const existing = await commerce.customers.findOrCreate({
  ...input, firstName: 'Changed name',
});
const countAfterReuse = await commerce.customers.count();

let duplicateRejectionCode = null;
try {
  await commerce.customers.create(input);
} catch (error) {
  duplicateRejectionCode = error.code ?? null;
}
const countAfterDuplicate = await commerce.customers.count();

await commerce.customers.update(customer.id, {
  phone: '+12025550123',
  tags: ['wholesale'],
});
const saved = await commerce.customers.get(customer.id);

await commerce.customers.addAddress({
  customerId: customer.id,
  addressType: 'shipping',
  firstName: 'Ada',
  lastName: 'Lovelace',
  line1: '123 Example Street',
  city: 'Portland',
  state: 'OR',
  postalCode: '97205',
  country: 'US',
  isDefault: true,
});
const addresses = await commerce.customers.getAddresses(customer.id);

const order = await commerce.orders.createExact({
  customerId: customer.id,
  currency: 'USD',
  items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 1, unitPrice: '12.50' }],
});
const missing = await commerce.customers.getByEmail('missing@example.com');

console.log(JSON.stringify({
  reusedSameId: existing.id === customer.id,
  nameUnchanged: existing.firstName === 'Ada',
  countAfterReuse,
  duplicateRejectionCode,
  countAfterDuplicate,
  phone: saved.phone,
  addressCount: addresses.length,
  defaultAddress: addresses[0]?.isDefault === true,
  orderTotal: order.totalAmountExact,
  missingEmailNull: missing === null,
}));
