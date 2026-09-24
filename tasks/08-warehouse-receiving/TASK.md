# Task 08 — Warehouse receiving

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that tracks an inbound shipment separately from inventory:

1. Report `inboundShipments.isSupported()`.
2. Create a supplier (`{ name: 'Example supplier' }`), a product
   (`{ name: 'Ceramic mug', slug: 'ceramic-mug' }`), and an inventory item
   (`MUG-001`, `Ceramic mug`, initial quantity `0`).
3. Create an inbound shipment for that supplier with one line
   `{ productId, sku: 'MUG-001', quantityExpected: '10' }`. Report its status
   (`pending`) and received quantity (`0`).
4. Call `markInTransit`, then `markArrived`. Report the arrival status.
5. Call `receiveLine(shipmentId, itemId, '4')` using the shipment line's own
   ID (not the product ID). Report the status (`partially_received`) and the
   cumulative received quantity (`4`).
6. Call `receiveLine` with `'7'`. It must be rejected with code `VALIDATION`;
   report the code and confirm the received quantity is still `4`.
7. Call `receiveLine` with `'6'`. Report the final status (`received`) and
   received quantity (`10`).
8. Read stock for `MUG-001` and report on-hand, allocated, available
   (receiving does not post inventory: expect `0`/`0`/`0`).
9. Create a second shipment expecting `'2'`, `cancel` it, then call
   `receiveLine` with `'1'`. It must be rejected; report whether a rejection
   occurred and the cancelled shipment's received quantity (`0`).

Print exactly one line of JSON to stdout as the last line:

```json
{"supported":true,"createdStatus":"pending","createdReceived":"0","arrivalStatus":"arrived","partialStatus":"partially_received","partialReceived":"4","excessRejectionCode":"VALIDATION","afterRejectReceived":"4","finalStatus":"received","finalReceived":"10","stockOnHand":"0","stockAllocated":"0","stockAvailable":"0","cancelledRejectsReceipt":true,"cancelledReceived":"0"}
```

Rules:

- Each `receiveLine` quantity is an additional delta; the received total is cumulative.
- Never infer sellable stock from the shipment status.
- Local engine only. No keys, no network.
