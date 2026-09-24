import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const tasks = [
  '01-order-inspect',
  '02-orders-lifecycle',
  '03-inventory-holds',
  '04-sdk-check',
  '05-persisted-order',
  '06-customers',
  '07-supplier-po',
  '08-warehouse-receiving',
  '09-fulfillment-shipping',
  '10-returns-rma',
  '11-manufacturing',
  '12-warranties',
  '13-payments-refunds',
  '14-integration-suite',
  '15-error-handling',
  '16-restart-replay',
  '17-mcp-order-inspect',
  '18-mcp-write-preview',
];

let failed = 0;
for (const name of tasks) {
  const result = spawnSync(
    process.execPath,
    [join(root, 'tasks', name, 'verifier.mjs'), join(root, 'tasks', name, 'solution.example.mjs')],
    { encoding: 'utf8', timeout: 60_000 },
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    failed += 1;
    console.error(`FAIL ${name}`);
  }
}
if (failed > 0) {
  console.error(`\n${failed}/${tasks.length} benchmark tasks failed.`);
  process.exitCode = 1;
} else {
  console.log(`\nPassed: ${tasks.length}/${tasks.length} benchmark tasks.`);
}
