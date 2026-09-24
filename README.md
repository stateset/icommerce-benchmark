# StateSet iCommerce benchmark

Teach frontier models to use the StateSet embedded commerce engine with tasks
a script can verify. No API keys, no network, no hosted services. Everything
runs locally against `@stateset/embedded` 1.35.1.

Public home: [stateset/icommerce-benchmark](https://github.com/stateset/icommerce-benchmark).
This directory mirrors that repo so tasks stay in sync with the docs they came from.

## Provenance (nothing asserted that was not verified)

Each task is a rephrasing of a program the docs already execute in CI via
`scripts/check-embedded-examples.mjs`. Reference solutions copy the docs'
API calls; verifiers check the same states the docs assert.

| Task | Source program (this repo) | What the model proves |
| --- | --- | --- |
| 01-order-inspect | `guides/first-operation.mdx` | Order + stock read-back, cover-9 decision |
| 02-orders-lifecycle | `guides/orders-quickstart.mdx` | Create, oversized reject, confirm, cancel |
| 03-inventory-holds | `guides/inventory-quickstart.mdx` | Reserve, reject, release, confirm, adjust |
| 04-sdk-check | `guides/sdk-installation.mdx` | Install verification: create + read customer |
| 05-persisted-order | `stateset-icommerce/stateset-icommerce-quickstart.mdx` | File-DB order verified from a second process |
| 06-customers | `guides/customers-quickstart.mdx` | Reuse, CONFLICT, update, address, linked order |
| 07-supplier-po | `guides/supplier-quickstart.mdx` | PO approval path + invalid transitions |
| 08-warehouse-receiving | `guides/warehouse-quickstart.mdx` | Shipment lifecycle kept separate from stock |
| 09-fulfillment-shipping | `guides/commerce/fulfillment.mdx` | Shipment policy; order/stock stay separate |
| 10-returns-rma | `guides/returns-quickstart.mdx` | RMA lifecycle to received; disposition gate |
| 11-manufacturing | `guides/manufacturing-quickstart.mdx` | BOM + work-order progress, stock untouched |
| 12-warranties | `guides/warranties-quickstart.mdx` | Coverage math, approve/deny, no side effects |
| 13-payments-refunds | `guides/payments-quickstart.mdx` | Payment/replay identity, refundable balance |
| 14-integration-suite | `guides/api-testing.mdx` | Cancel-restore, no-partial-write, replay |
| 15-error-handling | `guides/error-handling-best-practices.mdx` | Expected rejection vs propagated failure |
| 16-restart-replay | `guides/comprehensive-testing-guide.mdx` | Payment replay across a process restart |
| 17-mcp-order-inspect | `guides/first-operation.mdx` agent step + `stateset-icommerce-mcp` first read | Order + stock over MCP stdio tools |
| 18-mcp-write-preview | `stateset-icommerce-mcp` permission profile | Preview-only write changes nothing |

Tasks 01–04, 06–15 use `:memory:` databases for hermetic runs. Tasks 05 and
16 use file-backed databases (`./store.db`, `./restart.db` in the working
directory) so a second process can verify persistence; verifiers run
candidates in fresh temp dirs and reopen the files themselves.

## Layout

```text
benchmark/
  run.mjs                 # runs every task verifier against its example solution
  tests/benchmark.test.mjs# node:test suite: examples pass, broken solutions fail
  .github/workflows/benchmark.yml # CI for the standalone repo
  tasks/<name>/
    TASK.md               # exact prompt handed to the model
    solution.example.mjs  # reference solution (must pass its verifier)
    verifier.mjs          # CLI: node verifier.mjs <candidate-file> -> PASS/FAIL
```

## Evaluate a model

1. Give the model `tasks/<name>/TASK.md`.
2. Ask it to write a single `solution.mjs` (Node ESM).
3. Run `node tasks/<name>/verifier.mjs /path/to/solution.mjs`.
4. Exit 0 with `PASS` = task solved. Anything else = fail; the verifier prints why.

```bash
npm ci
npm run benchmark   # checks all example solutions (18/18)
npm test            # node:test suite, including negative controls
node tasks/01-order-inspect/verifier.mjs tasks/01-order-inspect/solution.example.mjs
```

Tasks 01–16 use `@stateset/embedded` directly. Tasks 17–18 speak to the
`stateset-mcp` server (from `@stateset/cli`, same 1.35.1 pin) over stdio; the
verifier puts its binary on `PATH` and invokes the candidate as
`node solution.mjs <dbPath> <orderId>` with a 60s timeout.

## Rules for models (also stated in each TASK.md)

- Use only `@stateset/embedded` locally. No hosted hosts, keys, or MCP servers.
- The candidate program runs as `node solution.mjs` with a 30s timeout
  (tasks 05 and 16 run in a fresh temp working directory).
- It must print exactly one JSON object on its last stdout line; the verifier parses that line.
- Quantity and money fields are decimal strings (`"8"`, `"25.00"`); counts are numbers.
- Do not read other tasks, the example solution, or the verifier to shortcut the answer.

## Publishing

The public repo is live at [stateset/icommerce-benchmark](https://github.com/stateset/icommerce-benchmark).
To sync from here (dotfiles included, dependencies excluded):

```bash
rm -rf /tmp/icommerce-benchmark && mkdir /tmp/icommerce-benchmark
cp -r benchmark/. /tmp/icommerce-benchmark/
rm -rf /tmp/icommerce-benchmark/node_modules
```

Pin `@stateset/embedded` in lockstep with the docs
(`examples/embedded/package.json`). When a guide's program changes, update the
matching task + example + verifier together.

## Deliberately out of scope

Other MCP servers (ResponseCX, Sync, NSR, EDI, Voice) and hosted REST tasks.
Those are the right next expansion; every embedded onboarding program and the
core commerce MCP read/write-safety model are already covered here.
