import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Commerce } from '@stateset/embedded';

// Usage: node verifier.mjs <candidate-file>
// Runs the candidate in a fresh temp dir (process 1), then replays its echoed
// payment input from this (second) process against the same database file.
const candidate = resolve(process.argv[2] ?? join(
  dirname(fileURLToPath(import.meta.url)), 'solution.example.mjs',
));
const directory = mkdtempSync(join(tmpdir(), 'benchmark-16-'));

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
  const created = JSON.parse(lines[lines.length - 1]);
  assert.equal(created.amount, '25.00');
  assert.equal(created.status, 'pending');
  assert.equal(created.paymentCount, 1);
  assert.equal(created.orderCount, 1);
  assert.ok(created.paymentId, 'missing paymentId');
  assert.ok(created.input, 'missing echoed input for replay');

  const commerce = new Commerce(join(directory, 'restart.db'));
  const replayed = await commerce.payments.createExact(created.input);
  assert.equal(replayed.paymentId ?? replayed.id, created.paymentId);
  assert.equal(replayed.amountExact, '25.00');
  assert.equal(await commerce.payments.count(), 1);
  assert.equal(await commerce.orders.count(), 1);
  console.log('PASS 16-restart-replay');
} catch (error) {
  console.error(`FAIL 16-restart-replay: ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
}
