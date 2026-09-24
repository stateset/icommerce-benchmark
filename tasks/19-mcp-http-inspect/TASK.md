# Task 19 — MCP over Streamable HTTP

Your program is run as `node solution.mjs <baseUrl> <orderId>`, where
`<baseUrl>` is the `/mcp` endpoint of a running StateSet commerce MCP server
(same tools as the stdio server, `core` profile, writes preview-only) and
`<orderId>` is an order in its database (two `MUG-001` Ceramic mugs at
`12.50`, stock `10` on hand / `2` allocated / `8` available). Answer the same
operational question as the stdio task, but over the **Streamable HTTP**
transport using **only MCP protocol calls** — no database access:

1. POST JSON-RPC 2.0 messages to `<baseUrl>` with
   `Content-Type: application/json` and
   `Accept: application/json, text/event-stream`. Responses arrive as
   Server-Sent Events: parse the `data:` payloads, not the raw body.
2. Send `initialize` with `protocolVersion: '2024-11-05'`. If the response
   carries an `mcp-session-id` header, send it back on later requests.
3. Call `tools/list` and find the order and stock tools from the listing.
   Read each tool's `inputSchema`; fail loudly if anything is missing.
4. Read the order matching `<orderId>` and stock for SKU `MUG-001`.
5. Decide whether available stock can cover an additional request for 9 mugs.

Print exactly one line of JSON to stdout as the last line (same MCP response
schema as the stdio server: order total is a number, stock is strings):

```json
{"orderId":"<the inspected order id>","orderStatus":"pending","orderTotal":25,"currency":"USD","onHand":"10","allocated":"2","available":"8","canCover9":false}
```

Rules:

- MCP protocol calls only. Opening the database or shelling to another
  transport is a failure.
- A plausible answer without HTTP tool calls is a failure.
- If the endpoint or tools are unavailable, exit nonzero with the blocker on
  stderr instead of guessing.
- Perform no business writes; the database is re-read afterward.
