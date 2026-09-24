# Task 05 — Persisted order

Using `@stateset/embedded` in Node.js, write a program that proves an order
survives its creating process by using a file-backed database:

1. Open `new Commerce('./store.db')` in the current working directory.
2. Reuse-or-create a customer with `findOrCreate`: email `ada@example.com`,
   firstName `Ada`, lastName `Lovelace`.
3. Create an order with `createExact`: currency `USD`, one line item
   `{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }`.
4. Read the order back with `orders.get(order.id)`.

Print exactly one line of JSON to stdout as the last line:

```json
{"orderId":"<the created order id>","status":"pending","total":"25.00","currency":"USD"}
```

Rules:

- Use the relative path `./store.db` so the grader can reopen the same file
  from a second process. Do not use `:memory:`.
- A separate verification process will open your `./store.db` and read the
  reported `orderId`; the total must read back as `25.00`.
- Local engine only. No keys, no network.
