# Task 18 — MCP write preview

Your program is run as `node solution.mjs <dbPath> <orderId>`, where `<dbPath>`
is the absolute path to a SQLite commerce database holding one pending order.
The `stateset-mcp` executable is available on `PATH`. Write a program that
proves it understands the server's write-safety model using **only MCP tool
calls**:

1. Start the server as a child process:
   `stateset-mcp --db <dbPath> --profile core` — exactly so, with no
   `--apply` flag and no kernel configuration. Speak JSON-RPC 2.0 over stdio
   with newline-delimited messages.
2. Send `initialize` with `protocolVersion: '2024-11-05'`, then the
   `notifications/initialized` notification.
3. Call `tools/list`, confirm the order-status update tool is present, and
   read its `inputSchema` to shape the call. Do not guess argument names.
4. Call it with `<orderId>` and status `confirmed`.
5. Inspect the response envelope: determine whether the server executed the
   write or returned a preview, and report which.

Print exactly one line of JSON to stdout as the last line:

```json
{"tool":"update_order_status","previewed":true}
```

Rules:

- `previewed` must be derived from the tool response, not assumed. A write
  without `--apply` must never mutate data; the harness reopens the database
  afterward and requires the order to still be `pending` with no new records.
- Do not enable writes, now or ever, in this task. Configuring `--apply`,
  kernel files, or any bypass is a failure.
- If the tools are unavailable, exit nonzero with the blocker on stderr.
