# Task 07 — Supplier purchase order

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that walks a purchase order through its approval path:

1. Create a supplier with `createSupplier`: name `Example supplier`,
   supplierCode `DEMO-SUPPLIER`, email `purchasing@example.com`. Read it back
   with `getSupplier` and report its supplier code.
2. Create a PO: that supplier, one line
   `{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 10, unitCost: 5 }`, notes
   `'Local onboarding example; no supplier delivery'`. Report the initial
   status (`draft`) and total (`50`).
3. Call `send` on the draft. It must be rejected with code `CONFLICT`; report
   the code and confirm the stored status is still `draft`.
4. Call `submit` (expect `pending_approval`), then `approve` with approver
   `'demo-approver'` (expect `approved`), then `send` (expect `sent`).
   Report each status and the final stored total (`50`).
5. Create a second PO with the same input, `cancel` it, then call `submit`.
   It must be rejected with code `CONFLICT`; report the code, the stored
   status (`cancelled`), and the PO count (`2`).

Print exactly one line of JSON to stdout as the last line:

```json
{"supplierCode":"DEMO-SUPPLIER","initialStatus":"draft","poTotal":"50","sendDraftRejectionCode":"CONFLICT","afterFailedSend":"draft","submittedStatus":"pending_approval","approvedStatus":"approved","sentStatus":"sent","finalTotal":"50","submitCancelledRejectionCode":"CONFLICT","cancelledStatus":"cancelled","poCount":2}
```

Rules:

- Catch each expected rejection; do not let the program crash.
- `send` records local state only; it performs no supplier delivery.
- Do not invent currency or line-item fields on the PO input or output.
- Local engine only. No keys, no network.
