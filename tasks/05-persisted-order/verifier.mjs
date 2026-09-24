import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Commerce } from '@stateset/embedded';

// Usage: node verifier.mjs <candidate-file>
// Runs the candidate in a fresh temp dir, then reopens its ./store.db from
// this (second) process to prove persistence across processes.
const candidate = resolve(process.argv[2] ?? join(
  dirname(fileURLToPath(import.meta.url)), 'solution.example.mjs',
));
const directory = mkdtempSync(join(tmpdir(), 'benchmark-05-'));

try {
  const result = spawnSync(process.execPath, [candidate], {
    cwd: directory,
    encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`candidate exited ${result.status}: ${(result.stderr || '').slice(0, 2000)}`);
  }
  const lines = String(result.stdout || '').trim().split('\n').filter(Boolean);
  if (lines.length === 0) throw new Error('no stdout; expected a final JSON line');
  const actual = JSON.parse(lines[lines.length - 1]);
  assert.equal(actual.status, 'pending');
  assert.equal(actual.total, '25.00');
  assert.equal(actual.currency, 'USD');
  assert.ok(actual.orderId, 'missing orderId');

  const commerce = new Commerce(join(directory, 'store.db'));
  const reopened = await commerce.orders.get(actual.orderId);
  assert.ok(reopened, 'order not found in reopened database');
  assert.equal(reopened.totalAmountExact, '25.00');
  assert.equal(reopened.status, 'pending');
  console.log('PASS 05-persisted-order');
} catch (error) {
  console.error(`FAIL 05-persisted-order: ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
}
