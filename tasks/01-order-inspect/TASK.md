# Task 01 — Order inspect

Using `@stateset/embedded` in Node.js, write a program that:

1. Opens a fresh in-memory database: `new Commerce(':memory:')`.
2. Creates a customer: email `ada@example.com`, firstName `Ada`, lastName `Lovelace`.
3. Creates inventory item: sku `MUG-001`, name `Ceramic mug`, initialQuantity `10`.
4. Creates an order with `createExact`: currency `USD`,
   `stockPolicy: 'reject_if_insufficient'`, one line item
   `{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }`.
5. Reads the order back and reads stock with `inventory.getStock('MUG-001')`.
6. Decides whether available stock can cover an additional request for 9 mugs.

Print exactly one line of JSON to stdout as the last line:

```json
{"orderStatus":"pending","totalAmountExact":"25.00","currency":"USD","onHand":"10","allocated":"2","available":"8","canCover9":false}
```

Rules:

- Quantities and totals are strings, exactly as the engine returns them.
- No hosted API calls, no keys, no filesystem writes required.
- Do not create extra orders or reservations.
