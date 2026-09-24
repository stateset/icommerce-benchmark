import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// Usage: node verifier.mjs <candidate-file>
// Candidate must print one JSON object on its last stdout line.
const candidate = process.argv[2] ?? './solution.example.mjs';
const expected = {
  orderStatus: 'pending',
  totalAmountExact: '25.00',
  currency: 'USD',
  onHand: '10',
  allocated: '2',
  available: '8',
  canCover9: false,
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
  console.log('PASS 01-order-inspect');
} catch (error) {
  console.error(`FAIL 01-order-inspect: ${error.message}`);
  process.exitCode = 1;
}
