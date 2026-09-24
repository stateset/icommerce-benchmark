import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const customer = await commerce.customers.create({
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
});
const saved = await commerce.customers.get(customer.id);
console.log(JSON.stringify({
  email: saved?.email ?? null,
  found: saved != null,
  firstName: saved?.firstName ?? null,
}));
