# Task 15 — Error handling

Using `@stateset/embedded` in Node.js, write a program that turns one
expected rejection into a result while preserving every unexpected failure:

1. Implement `reserveForCheckout(inventory, sku, quantity, checkoutId)`:
   - Try `inventory.reserve(sku, quantity, 'checkout', checkoutId, 300)`.
     On success return `{ kind: 'reserved', reservationId }`.
   - If the error's `code` is `INSUFFICIENT_STOCK`, read fresh stock with
     `inventory.getStock(sku)` and return
     `{ kind: 'out_of_stock', available }` where `available` is the observed
     `totalAvailable`.
   - Re-throw anything else. Never retry automatically.
2. Against a fresh in-memory database holding `MUG-001` (`Ceramic mug`,
   quantity `2`), call it with quantity `3`. Report the outcome kind
   (`out_of_stock`), the observed available stock (`2`), and the stock triple
   afterward (`2`/`0`/`2` — nothing allocated).
3. Call it with quantity `1`. Report the kind (`reserved`) and whether a
   reservation ID came back, then `releaseReservation` and report the
   available stock (`2`).
4. Prove unexpected errors propagate: call the helper with a stub inventory
   whose `reserve` throws a synthetic error (count attempts) and whose
   `getStock` fails the program if called. Report whether the original error
   propagated unchanged and the attempt count (`1` — no retry, no lookup).

Print exactly one line of JSON to stdout as the last line:

```json
{"oversizedKind":"out_of_stock","oversizedAvailable":"2","stockAfterReject":["2","0","2"],"holdKind":"reserved","hasReservationId":true,"afterReleaseAvailable":"2","unexpectedPropagated":true,"unexpectedAttempts":1}
```

Rules:

- Branch on `error.code`, never on message text.
- The stub in step 4 tests your handler, not the engine; label it as such.
- A manual hold must not wrap an order flow that already reserves the units.
- Local engine only. No keys, no network.
