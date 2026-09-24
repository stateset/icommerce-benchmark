# Task 02 — Orders lifecycle

Using `@stateset/embedded` in Node.js, write a program that:

1. Opens a fresh in-memory database: `new Commerce(':memory:')`.
2. Creates customer `ada@example.com` / Ada Lovelace and inventory item
   `MUG-001` / `Ceramic mug` with quantity `10`.
3. Creates a two-unit order at `12.50` with `reject_if_insufficient`
   (total must be `25.00 USD`, stock `2` allocated / `8` available).
4. Attempts a second order for 9 units of the same SKU. It must be rejected
   with code `INSUFFICIENT_STOCK` and must not create a second order
   (order count stays `1`).
5. Confirms the first order (`confirmed`), then cancels it (`cancelled`).
   After cancellation stock is `10` available with `0` allocated.

Print exactly one line of JSON to stdout as the last line:

```json
{"afterCreateAllocated":"2","afterCreateAvailable":"8","rejectionCode":"INSUFFICIENT_STOCK","orderCountAfterReject":1,"finalStatus":"cancelled","finalAllocated":"0","finalAvailable":"10"}
```

Rules:

- Catch the rejection; do not let the program crash.
- Quantities are strings; the order count is a number.
- Local engine only. No keys, no network.
