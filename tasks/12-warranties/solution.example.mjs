import { Commerce } from '@stateset/embedded';

const commerce = new Commerce(':memory:');
const customer = await commerce.customers.create({
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
});
const warranty = await commerce.warranties.create({
  customerId: customer.id,
  warrantyType: 'standard',
  durationMonths: 12,
  serialNumber: 'DEMO-MUG-001',
});
const storedWarranty = await commerce.warranties.get(warranty.id);
const durationDays = Math.round(
  (Date.parse(storedWarranty.endDate) - Date.parse(storedWarranty.startDate)) / 86_400_000,
);

const claim = await commerce.warranties.createClaim({
  warrantyId: warranty.id,
  issueDescription: 'Mug handle cracked during normal use',
  contactEmail: 'ada@example.com',
});
const approved = await commerce.warranties.approveClaim(claim.id);
const completed = await commerce.warranties.completeClaim(claim.id, 'replacement');

const secondClaim = await commerce.warranties.createClaim({
  warrantyId: warranty.id,
  issueDescription: 'Example issue excluded by the demonstration policy',
});
const denied = await commerce.warranties.denyClaim(
  secondClaim.id,
  'Excluded by the demonstration coverage policy',
);
let approveDeniedRejectionCode = null;
try {
  await commerce.warranties.approveClaim(secondClaim.id);
} catch (error) {
  approveDeniedRejectionCode = error.code ?? null;
}

console.log(JSON.stringify({
  warrantyStatus: storedWarranty.status,
  warrantyCount: await commerce.warranties.count(),
  durationDays,
  claimStatus: claim.status,
  claimResolution: claim.resolution,
  approvedStatus: approved.status,
  completedStatus: completed.status,
  completedResolution: completed.resolution,
  orderCount: await commerce.orders.count(),
  shipmentCount: await commerce.shipments.count(),
  deniedStatus: denied.status,
  deniedResolution: denied.resolution,
  approveDeniedRejectionCode,
}));
