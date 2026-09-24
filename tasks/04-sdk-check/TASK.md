# Task 04 — SDK check

Using `@stateset/embedded` in Node.js, write a program that verifies the
installation against a fresh in-memory database:

1. Open `new Commerce(':memory:')`.
2. Create a customer: email `ada@example.com`, firstName `Ada`, lastName `Lovelace`.
3. Read the customer back with `customers.get(customer.id)`.

Print exactly one line of JSON to stdout as the last line:

```json
{"email":"ada@example.com","found":true,"firstName":"Ada"}
```

Rules:

- Local engine only. No keys, no network, no filesystem writes.
- `found` is whether the read-back returned a record.
