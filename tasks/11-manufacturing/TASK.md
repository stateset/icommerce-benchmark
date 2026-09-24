# Task 11 — Manufacturing

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that models production progress separately from inventory:

1. Create a product `{ name: 'Mug kit', slug: 'mug-kit' }` and two inventory
   items: `MUG-001` (`Ceramic mug`, quantity `20`) and `KIT-001`
   (`Mug kit`, quantity `0`).
2. Create a BOM `{ name: 'Two-mug kit', productId, revision: 'A' }` (expect
   `draft`), add one component `{ componentSku: 'MUG-001', name: 'Ceramic mug',
   quantity: 2, unitOfMeasure: 'each' }`, confirm one component line with
   quantity `2`, then `activate` it. Report the active status and revision.
3. Create a work order `{ productId, bomId, quantityToBuild: 3 }` (expect
   `planned`, completed `0`). Report target and completed.
4. Call `start` (expect `in_progress`).
5. Call `complete(id, 1)` (expect `partially_completed`, completed `1`).
6. Call `complete(id, 2)` — the argument is the additional batch quantity,
   not the cumulative total (expect `completed`, completed `3`, target `3`).
7. Read both stocks: components must be unchanged (`20`/`0`/`20`) and finished
   kits `0`/`0`/`0` — completion records progress, it moves no inventory.
   Report component on-hand, finished on-hand, and the work-order count (`1`).

Print exactly one line of JSON to stdout as the last line:

```json
{"bomStatus":"active","bomRevision":"A","componentLines":1,"componentQty":2,"targetQty":3,"startStatus":"in_progress","partialStatus":"partially_completed","partialCompleted":1,"finalStatus":"completed","finalCompleted":3,"componentOnHand":"20","finishedOnHand":"0","workOrderCount":1}
```

Rules:

- Never pass a cumulative total to `complete`; each call adds its batch.
- Do not treat the BOM as a stock movement or finished-goods receipt.
- Local engine only. No keys, no network.
