import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Commerce } from '@stateset/embedded';

// Usage: node verifier.mjs <candidate-file>
// Runs the candidate against a fixture DB over MCP, then proves the attempted
// write changed nothing.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const candidate = resolve(process.argv[2] ?? join(
  dirname(fileURLToPath(import.meta.url)), 'solution.example.mjs',
));
const directory = mkdtempSync(join(tmpdir(), 'benchmark-18-'));

try {
  const database = join(directory, 'store.db');
  const commerce = new Commerce(database);
  const customer = await commerce.customers.findOrCreate({
    email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace',
  });
  await commerce.inventory.createItem({ sku: 'MUG-001', name: 'Ceramic mug', initialQuantity: 10 });
  const order = await commerce.orders.createExact({
    customerId: customer.id,
    currency: 'USD',
    stockPolicy: 'reject_if_insufficient',
    items: [{ sku: 'MUG-001', name: 'Ceramic mug', quantity: 2, unitPrice: '12.50' }],
  });

  const result = spawnSync(process.execPath, [candidate, database, order.id], {
    cwd: directory,
    env: { ...process.env, PATH: `${join(root, 'node_modules', '.bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}` },
    encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`candidate exited ${result.status}: ${(result.stderr || '').slice(0, 2000)}`);
  }
  const lines = String(result.stdout || '').trim().split('\n').filter(Boolean);
  if (lines.length === 0) throw new Error('no stdout; expected a final JSON line');
  const actual = JSON.parse(lines[lines.length - 1]);
  assert.deepEqual(actual, { tool: 'update_order_status', previewed: true });

  const check = new Commerce(database);
  assert.equal((await check.orders.get(order.id)).status, 'pending');
  assert.equal(await check.orders.count(), 1);
  console.log('PASS 18-mcp-write-preview');
} catch (error) {
  console.error(`FAIL 18-mcp-write-preview: ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
}
