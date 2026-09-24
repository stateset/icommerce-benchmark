# Task 09 — Fulfillment shipping

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that keeps shipment state, order state, and inventory separate:

1. Create customer `ada@example.com` / Ada Lovelace, inventory item `MUG-001`
   (`Ceramic mug`, quantity `10`), and a two-unit `MUG-001` order at `12.50`
   with `reject_if_insufficient`.
2. Create a shipment: that order ID, recipient `Example recipient`, address
   `123 Example Street, Example City`, carrier `other`, method `standard`.
   Report the shipment status (`pending`).
3. Implement an application policy helper: read the shipment, and only call
   `deliver` when its status is `shipped`; otherwise throw
   `Application policy: only a shipped record can be delivered`. Calling it on
   the pending shipment must throw; report whether it was blocked and that the
   stored status is still `pending`.
4. Call `ship` with tracking `DEMO-TRACKING-001`. Report the status
   (`shipped`) and the stored tracking number.
5. Call the policy helper again and report the delivered status.
6. Read the order back: report its status, `fulfillmentStatus`, and
   `paymentStatus` (delivery does not fulfill the order or take payment:
   expect `pending` / `unfulfilled` / `pending`).
7. Read stock and report on-hand, allocated, available (`10` / `2` / `8`),
   plus the shipment count (`1`).

Print exactly one line of JSON to stdout as the last line:

```json
{"createdStatus":"pending","earlyDeliveryBlocked":true,"afterBlocked":"pending","shippedStatus":"shipped","tracking":"DEMO-TRACKING-001","deliveredStatus":"delivered","orderStatus":"pending","fulfillmentStatus":"unfulfilled","paymentStatus":"pending","onHand":"10","allocated":"2","available":"8","shipmentCount":1}
```

Rules:

- The engine accepts out-of-sequence shipment changes; your policy helper is
  what blocks early delivery.
- Shipment state never implicitly fulfills the order or consumes reservations.
- Local engine only. No carrier, no labels, no notifications, no keys.
