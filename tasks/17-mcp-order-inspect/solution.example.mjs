import { spawn } from 'node:child_process';

const [dbPath, orderId] = process.argv.slice(2);
if (!dbPath || !orderId) {
  console.error('Usage: node solution.mjs <dbPath> <orderId>');
  process.exit(1);
}

const server = spawn('stateset-mcp', ['--db', dbPath, '--profile', 'core'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
let nextId = 1;
const pending = new Map();
let buffer = '';
server.stdout.setEncoding('utf8');
server.stdout.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    if (msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

function request(method, params, timeoutMs = 20_000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`MCP request timed out: ${method}`));
    }, timeoutMs);
    pending.set(id, (msg) => { clearTimeout(timer); resolve(msg); });
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}

function toolText(response) {
  const text = response.result?.content?.[0]?.text;
  if (response.result?.isError || text === undefined) {
    throw new Error(`Tool call failed: ${JSON.stringify(response).slice(0, 500)}`);
  }
  return JSON.parse(text);
}

try {
  await request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'benchmark', version: '0.1.0' },
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

  const listing = await request('tools/list', {});
  const tools = listing.result?.tools ?? [];
  for (const name of ['list_orders', 'get_order', 'get_stock']) {
    if (!tools.some((t) => t.name === name)) {
      throw new Error(`Required tool missing from tools/list: ${name}`);
    }
  }

  const listed = toolText(await request('tools/call', { name: 'list_orders', arguments: {} }));
  const match = (listed.orders ?? []).find((o) => o.id === orderId);
  if (!match) throw new Error(`Order ${orderId} not present in list_orders output`);

  const detail = toolText(await request('tools/call', { name: 'get_order', arguments: { identifier: orderId } }));
  const stock = toolText(await request('tools/call', { name: 'get_stock', arguments: { sku: 'MUG-001' } }));

  console.log(JSON.stringify({
    orderId: detail.order.id,
    orderStatus: detail.order.status,
    orderTotal: detail.order.totalAmount,
    currency: detail.order.currency,
    onHand: stock.stock.totalOnHand,
    allocated: stock.stock.totalAllocated,
    available: stock.stock.totalAvailable,
    canCover9: Number(stock.stock.totalAvailable) >= 9,
  }));
} finally {
  server.kill();
}
