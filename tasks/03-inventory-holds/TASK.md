# Task 03 — Inventory holds

Using `@stateset/embedded` in Node.js, write a program that:

1. Opens a fresh in-memory database: `new Commerce(':memory:')`.
2. Creates inventory item `MUG-001` / `Ceramic mug` with quantity `10`.
3. Reserves 3 units: `inventory.reserve(sku, 3, 'checkout', 'demo-checkout-001', 300)`.
   Stock becomes `10` on hand / `3` allocated / `7` available.
4. Attempts to reserve 8 more units (`demo-checkout-too-large`). It must be
   rejected with code `INSUFFICIENT_STOCK`; stock stays `10` / `3` / `7`.
5. Releases the first reservation. Stock returns to `10` / `0` / `10`.
6. Reserves 2 units (`demo-checkout-002`) and confirms the reservation.
   Stock becomes `10` / `2` / `8`.
7. Adjusts by `-1` (`Damaged during stock count`). Final stock is
   `9` on hand / `2` allocated / `7` available.

Print exactly one line of JSON to stdout as the last line:

```json
{"rejectionCode":"INSUFFICIENT_STOCK","finalOnHand":"9","finalAllocated":"2","finalAvailable":"7"}
```

Rules:

- Catch the oversized-hold rejection; do not crash.
- Quantities are strings, exactly as `getStock` returns them.
- Local engine only. No keys, no network.
