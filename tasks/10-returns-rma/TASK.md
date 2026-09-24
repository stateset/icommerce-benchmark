# Task 10 — Returns RMA

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that walks a return through request, approval, tracking, and
receipt — stopping where the binding stops:

1. Create customer `ada@example.com` / Ada Lovelace and a two-unit `MUG-001`
   order at `12.50` in USD.
2. Ship the order with `orders.ship(order.id, 'DEMO-OUTBOUND-001')` (a local
   simulation; no carrier). Report the order status (`shipped`).
3. Create a return with `returns.create`: that order ID, reason `damaged`,
   reasonDetails `One mug arrived cracked`, idempotencyKey
   `` `return-${orderId}-mug-1` ``, one item
   `{ orderItemId: <the order's first line-item ID>, quantity: 1 }`.
   Report the return status (`requested`).
4. Create the exact same return request again. Report whether the returned ID
   matches the first return and the return count (still `1`).
5. Call `approve` (expect `approved`), `addTracking` with `DEMO-RETURN-001`
   (expect `in_transit`), and `markReceived` (expect `received`). Report each.
6. Call `complete`. It must be rejected with code `POLICY_REJECTED` because no
   item disposition was recorded; report the code and the stored status
   (still `received`).

Print exactly one line of JSON to stdout as the last line:

```json
{"orderStatus":"shipped","returnStatus":"requested","replaySameId":true,"returnCount":1,"approvedStatus":"approved","trackingStatus":"in_transit","receivedStatus":"received","completeRejectionCode":"POLICY_REJECTED","finalStatus":"received"}
```

Rules:

- Use the order's actual line-item ID, not a SKU or product ID.
- Only a shipped order is eligible for a return in this flow.
- Repeating `complete` without dispositions fails again; do not retry it.
- An RMA state change is not a refund; no money moves here.
- Local engine only. No keys, no network.
