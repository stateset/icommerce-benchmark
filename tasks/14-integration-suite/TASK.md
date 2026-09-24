# Task 14 — Integration suite

Using `@stateset/embedded` in Node.js, write a program that proves three
failure invariants, each against its own fresh in-memory database holding one
customer (`ada@example.com` / Ada Lovelace) and one `MUG-001` item
(`Ceramic mug`, quantity `3`):

1. Create a two-unit order at `12.50` with `reject_if_insufficient` (total
   `25.00`), then `cancel` it. Report the cancelled status and the stock
   triple afterward (`3` on hand / `0` allocated / `3` available), plus the
   order count (`1`).
2. In a second database, attempt a four-unit order. It must be rejected with
   code `INSUFFICIENT_STOCK`; report the code, the order count (`0`), and the
   available stock (still `3`) — no partial write.
3. In a third database, create the two-unit order, then create a payment with
   `createExact` (that order ID and customer ID, amount = order total,
   currency `USD`, method `card`, idempotencyKey `` `payment-${orderId}-1` ``)
   twice with the identical input. Report whether the replay returned the
   same ID, the replayed amount (`25.00`), and the payment count (`1`).

Print exactly one line of JSON to stdout as the last line:

```json
{"cancelledStatus":"cancelled","afterCancel":["3","0","3"],"orderCount":1,"oversizedRejectionCode":"INSUFFICIENT_STOCK","countAfterReject":0,"availableAfterReject":"3","paymentReplaySameId":true,"paymentAmount":"25.00","paymentCount":1}
```

Rules:

- A rejection test must assert the error code AND the resulting stored state;
  catching any exception is not enough.
- A replay test must assert the returned ID AND the stored count.
- Each scenario gets its own database; tests must not share state.
- Local engine only. No keys, no network.
