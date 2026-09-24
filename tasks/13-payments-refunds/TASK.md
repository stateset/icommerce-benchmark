# Task 13 — Payments and refunds

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that keeps local payment records distinct from provider money
movement:

1. Create customer `ada@example.com` / Ada Lovelace and a two-unit `MUG-001`
   order at `12.50` in USD (total `25.00`).
2. Create a payment with `createExact`: that order ID and customer ID, amount
   = the order total, currency `USD`, method `card`, idempotencyKey
   `` `payment-${orderId}-1` ``. Report its status (`pending`) and amount
   (`25.00`).
3. Replay the identical payment input. Report whether the returned ID matches
   and the payment count (still `1`).
4. Call `createRefundExact` with that payment ID, amount `12.50`, and a fresh
   key. It must be rejected with code `VALIDATION` (a pending payment is not
   refundable); report the code.
5. Call `markCompleted` — a local simulation of a verified provider success —
   and report the status (`completed`).
6. Create a refund `{ paymentId, amount: '12.50', reason: 'One mug returned',
   idempotencyKey: `refund-${paymentId}-1` }`. Report its status (`pending`)
   and amount, then replay it and report whether the ID matches.
7. Attempt another `20.00` refund with a new key. It must be rejected with
   code `VALIDATION` (the pending refund already uses the balance); report
   the code.
8. Read the payment and the order back. Report the stored payment status
   (`completed`) and the order's `paymentStatus` (still `pending`: completing
   a payment does not auto-reconcile the order).

Print exactly one line of JSON to stdout as the last line:

```json
{"paymentStatus":"pending","paymentAmount":"25.00","paymentReplaySameId":true,"paymentCount":1,"earlyRefundRejectionCode":"VALIDATION","completedStatus":"completed","refundStatus":"pending","refundAmount":"12.50","refundReplaySameId":true,"overRefundRejectionCode":"VALIDATION","storedPaymentStatus":"completed","orderPaymentStatus":"pending"}
```

Rules:

- Use decimal strings for money; never float-convert exact fields.
- Reuse the original key and payload for replays; a new key is a new operation.
- Nothing here charges a card or moves a refund; the refund ends `pending`.
- Local engine only. No keys, no network.
