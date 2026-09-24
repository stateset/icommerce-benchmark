# Task 16 — Restart replay

Using `@stateset/embedded` in Node.js, write a program that proves a payment
retry reuses its original record even after the creating process exits:

1. Open `new Commerce('./restart.db')` in the current working directory.
2. Create customer `ada@example.com` / Ada Lovelace and a two-unit `MUG-001`
   order at `12.50` in USD.
3. Build the payment input from the created records: that customer ID and
   order ID, amount = the order total, currency `USD`, method `card`,
   idempotencyKey `'restart-payment-001'`.
4. Call `payments.createExact` with that input.

Print exactly one line of JSON to stdout as the last line, echoing the input
so a second process can replay it verbatim:

```json
{"input":{"customerId":"<id>","orderId":"<id>","amount":"25.00","currency":"USD","paymentMethod":"card","idempotencyKey":"restart-payment-001"},"paymentId":"<id>","amount":"25.00","status":"pending","paymentCount":1,"orderCount":1}
```

Rules:

- Use the relative path `./restart.db` so the grader can replay against the
  same file from a second process after yours exits. Do not use `:memory:`.
- A separate verification process will call `createExact` with your echoed
  `input` and require the same payment ID with counts still at 1.
- The key is fixed only because the grader uses a fresh directory per run;
  in an application, persist one key per intended operation.
- Local engine only. No keys, no network.
