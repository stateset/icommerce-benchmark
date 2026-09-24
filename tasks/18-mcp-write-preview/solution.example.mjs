import { spawn } from 'node:child_process';

const [dbPath, orderId] = process.argv.slice(2);
if (!dbPath || !orderId) {
  console.error('Usage: node solution.mjs <dbPath> <orderId>');
  process.exit(1);
}
for (const flag of process.argv.slice(2)) {
  if (flag === '--apply' || flag.startsWith('--kernel')) {
    console.error('Write-enabling flags are forbidden in this task');
    process.exit(1);
  }
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

try {
  await request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'benchmark', version: '0.1.0' },
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

  const listing = await request('tools/list', {});
  const tool = (listing.result?.tools ?? []).find((t) => t.name === 'update_order_status');
  if (!tool) throw new Error('update_order_status missing from tools/list');
  const required = tool.inputSchema?.required ?? [];
  if (!required.includes('orderId') || !required.includes('status')) {
    throw new Error(`Unexpected input schema: ${JSON.stringify(tool.inputSchema).slice(0, 300)}`);
  }

  const response = await request('tools/call', {
    name: 'update_order_status',
    arguments: { orderId, status: 'confirmed' },
  });
  const text = response.result?.content?.[0]?.text ?? '';
  let previewed = false;
  try {
    previewed = JSON.parse(text).preview === true;
  } catch {
    previewed = false;
  }
  console.log(JSON.stringify({ tool: 'update_order_status', previewed }));
} finally {
  server.kill();
}
