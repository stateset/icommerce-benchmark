import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cases = [
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

function runVerifier(name, solution) {
  return spawnSync(
    process.execPath,
    [join(root, 'tasks', name, 'verifier.mjs'), solution],
    { encoding: 'utf8', timeout: 60_000 },
  );
}

for (const name of cases) {
  test(`${name}: example solution passes its verifier`, () => {
    const result = runVerifier(name, join(root, 'tasks', name, 'solution.example.mjs'));
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(String(result.stdout), /PASS/);
  });
}

test('verifiers reject a wrong answer (negative control)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'benchmark-negative-'));
  try {
    const broken = join(dir, 'solution.mjs');
    writeFileSync(broken, 'console.log(JSON.stringify({wrong: true}));\n');
    const result = runVerifier(cases[0], broken);
    assert.notEqual(result.status, 0, 'verifier must fail a wrong answer');
    assert.match(String(result.stderr) + String(result.stdout), /FAIL/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
