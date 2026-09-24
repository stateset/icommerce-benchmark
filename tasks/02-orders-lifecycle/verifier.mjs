import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// Usage: node verifier.mjs <candidate-file>
const candidate = process.argv[2] ?? './solution.example.mjs';
const expected = {
  afterCreateAllocated: '2',
  afterCreateAvailable: '8',
  rejectionCode: 'INSUFFICIENT_STOCK',
  orderCountAfterReject: 1,
  finalStatus: 'cancelled',
  finalAllocated: '0',
  finalAvailable: '10',
};

try {
  const result = spawnSync(process.execPath, [candidate], {
    encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`candidate exited ${result.status}: ${(result.stderr || '').slice(0, 2000)}`);
  }
  const lines = String(result.stdout || '').trim().split('\n').filter(Boolean);
  if (lines.length === 0) throw new Error('no stdout; expected a final JSON line');
  const actual = JSON.parse(lines[lines.length - 1]);
  assert.deepEqual(actual, expected);
  console.log('PASS 02-orders-lifecycle');
} catch (error) {
  console.error(`FAIL 02-orders-lifecycle: ${error.message}`);
  process.exitCode = 1;
}
