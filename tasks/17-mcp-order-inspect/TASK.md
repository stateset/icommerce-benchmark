# Task 17 — MCP order inspect

Your program is run as `node solution.mjs <dbPath> <orderId>`, where `<dbPath>`
is the absolute path to a SQLite commerce database and `<orderId>` is an order
in it (two `MUG-001` Ceramic mugs at `12.50`, stock `10` on hand / `2`
allocated / `8` available). The `stateset-mcp` executable is available on
`PATH`. Write a program that answers an operational question using **only MCP
tool calls** — no `@stateset/embedded` import, no direct database access:

1. Start the server as a child process:
   `stateset-mcp --db <dbPath> --profile core`. Speak JSON-RPC 2.0 over stdio
   with newline-delimited messages. Never pass `--apply`.
2. Send `initialize` with `protocolVersion: '2024-11-05'`, then the
   `notifications/initialized` notification.
3. Call `tools/list` and find the order and stock tools from the listing.
   Do not guess tool names or argument shapes: read each tool's
   `inputSchema`, and fail loudly if the listing lacks what you need.
4. List orders, find the order matching `<orderId>`, read its full details,
   and read stock for SKU `MUG-001`.
5. Decide whether available stock can cover an additional request for 9 mugs.

Print exactly one line of JSON to stdout as the last line. Note the MCP layer
has its own response schema: the order total arrives as a number, while stock
quantities arrive as strings.

```json
{"orderId":"<the inspected order id>","orderStatus":"pending","orderTotal":25,"currency":"USD","onHand":"10","allocated":"2","available":"8","canCover9":false}
```

Rules:

- MCP tools only. Opening the database file directly is a failure.
- A plausible answer without tool calls is a failure; the harness cannot see
  your reasoning, only the protocol transcript your program produces by
  running the server as its child.
- If the records or tools are unavailable, exit nonzero with the blocker on
  stderr instead of guessing.
- A separate verification process reopens the database afterward; perform no
  business writes.
