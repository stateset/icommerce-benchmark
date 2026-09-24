# Task 06 — Customers

Using `@stateset/embedded` in Node.js against a fresh in-memory database,
write a program that:

1. Calls `findOrCreate` with `{ email: 'ada@example.com', firstName: 'Ada',
   lastName: 'Lovelace', acceptsMarketing: false }`.
2. Calls `findOrCreate` again with the same email but `firstName: 'Changed name'`.
   Report whether the returned ID matches the first customer, whether the stored
   first name is still `Ada`, and the customer count.
3. Calls `create` with the original input. It must be rejected with code
   `CONFLICT`; report the code and the customer count (still `1`).
4. Calls `update` with `{ phone: '+12025550123', tags: ['wholesale'] }`, then
   `get` and report the stored phone.
5. Calls `addAddress` with a shipping address (Ada Lovelace,
   `123 Example Street`, Portland, OR, `97205`, US, default), then
   `getAddresses` and report the address count and whether the first address
   is the default.
6. Creates a one-unit `MUG-001` order at `12.50` and reports its total.
7. Calls `getByEmail('missing@example.com')` and reports whether it is null.

Print exactly one line of JSON to stdout as the last line:

```json
{"reusedSameId":true,"nameUnchanged":true,"countAfterReuse":1,"duplicateRejectionCode":"CONFLICT","countAfterDuplicate":1,"phone":"+12025550123","addressCount":1,"defaultAddress":true,"orderTotal":"12.50","missingEmailNull":true}
```

Rules:

- Do not assume `findOrCreate` merges profiles; verify the stored name.
- Addresses are separate records; read them with `getAddresses`.
- Local engine only. No keys, no network.
