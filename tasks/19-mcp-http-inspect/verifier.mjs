import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Commerce } from '@stateset/embedded';

// Usage: node verifier.mjs <candidate-file>
// Boots stateset-mcp-http against a fixture DB, runs the candidate as
// `node <file> <baseUrl> <orderId>`, then independently re-reads the database.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const candidate = resolve(process.argv[2] ?? join(
  dirname(fileURLToPath(import.meta.url)), 'solution.example.mjs',
));
const directory = mkdtempSync(join(tmpdir(), 'benchmark-19-'));
let server;

function freePort() {
  return new Promise((resolvePort, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolvePort(port));
    });
  });
}

async function waitReady(url, deadlineMs = 15_000) {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'ready', version: '0' } } }),
      });
      if (res.ok) return;
    } catch {
      // Server not up yet; retry until the deadline.
    }
    if (Date.now() - start > deadlineMs) throw new Error('MCP HTTP server did not become ready');
    await new Promise((r) => setTimeout(r, 250));
  }
}

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

  const port = await freePort();
  server = spawn('stateset-mcp-http', ['--db', database, '--profile', 'core', '--port', String(port)], {
    env: { ...process.env, PATH: `${join(root, 'node_modules', '.bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}` },
    stdio: 'ignore',
  });
  const baseUrl = `http://127.0.0.1:${port}/mcp`;
  await waitReady(baseUrl);

  const result = spawnSync(process.execPath, [candidate, baseUrl, order.id], {
    cwd: directory,
    encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`candidate exited ${result.status}: ${(result.stderr || '').slice(0, 2000)}`);
  }
  const lines = String(result.stdout || '').trim().split('\n').filter(Boolean);
  if (lines.length === 0) throw new Error('no stdout; expected a final JSON line');
  const actual = JSON.parse(lines[lines.length - 1]);
  assert.deepEqual(actual, {
    orderId: order.id,
    orderStatus: 'pending',
    orderTotal: 25,
    currency: 'USD',
    onHand: '10',
    allocated: '2',
    available: '8',
    canCover9: false,
  });

  const check = new Commerce(database);
  assert.equal((await check.orders.get(order.id)).status, 'pending');
  assert.equal(await check.orders.count(), 1);
  console.log('PASS 19-mcp-http-inspect');
} catch (error) {
  console.error(`FAIL 19-mcp-http-inspect: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (server && !server.killed) server.kill();
  rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
}
