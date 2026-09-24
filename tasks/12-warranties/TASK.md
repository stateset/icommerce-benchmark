# Task 12 — Warranty claims

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that separates coverage decisions from downstream fulfillment:

1. Create customer `ada@example.com` / Ada Lovelace.
2. Create a warranty `{ customerId, warrantyType: 'standard',
   durationMonths: 12, serialNumber: 'DEMO-MUG-001' }`. Read it back and
   report its status (`active`), the warranty count (`1`), and the coverage
   length in days computed from the stored start/end dates (this version uses
   30-day months: expect `360`).
3. Create a claim `{ warrantyId, issueDescription:
   'Mug handle cracked during normal use', contactEmail: 'ada@example.com' }`.
   Report its status (`submitted`) and resolution (`none`).
4. Call `approveClaim` (expect `approved`).
5. Call `completeClaim(claim.id, 'replacement')` (expect `completed` /
   `replacement`). Confirm it created nothing downstream: report the order
   count (`0`) and shipment count (`0`).
6. Create a second claim with an excluded issue, `denyClaim` it with reason
   `'Excluded by the demonstration coverage policy'` (expect `denied` /
   `denied`), then call `approveClaim` on it. It must be rejected with code
   `CONFLICT`; report the code.

Print exactly one line of JSON to stdout as the last line:

```json
{"warrantyStatus":"active","warrantyCount":1,"durationDays":360,"claimStatus":"submitted","claimResolution":"none","approvedStatus":"approved","completedStatus":"completed","completedResolution":"replacement","orderCount":0,"shipmentCount":0,"deniedStatus":"denied","deniedResolution":"denied","approveDeniedRejectionCode":"CONFLICT"}
```

Rules:

- A `replacement` resolution records the decision only; it creates no order,
  shipment, refund, or notification.
- There is no claim read-back method on this binding; use mutation responses.
- Do not treat any `CONFLICT` as proof the requested action succeeded.
- Local engine only. No keys, no network.
