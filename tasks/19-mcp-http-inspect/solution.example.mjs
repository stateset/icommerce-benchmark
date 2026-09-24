const [baseUrl, orderId] = process.argv.slice(2);
if (!baseUrl || !orderId) {
  console.error('Usage: node solution.mjs <baseUrl> <orderId>');
  process.exit(1);
}

let nextId = 1;
let sessionId;
async function post(message, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, ...message }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${baseUrl}`);
    const sid = res.headers.get('mcp-session-id');
    if (sid) sessionId = sid;
    const body = await res.text();
    const payloads = body.split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => JSON.parse(line.slice('data:'.length).trim()));
    const reply = payloads.find((p) => p.id !== undefined) ?? payloads[0];
    if (!reply) throw new Error('No JSON-RPC payload in SSE response');
    if (reply.error) throw new Error(`JSON-RPC error: ${JSON.stringify(reply.error).slice(0, 300)}`);
    return reply.result;
  } finally {
    clearTimeout(timer);
  }
}

function toolJson(result) {
  const text = result?.content?.[0]?.text;
  if (result?.isError || text === undefined) {
    throw new Error(`Tool call failed: ${JSON.stringify(result).slice(0, 500)}`);
  }
  return JSON.parse(text);
}

await post({ method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'benchmark', version: '0.1.0' } } });
const listing = await post({ method: 'tools/list', params: {} });
const tools = listing?.tools ?? [];
for (const name of ['list_orders', 'get_order', 'get_stock']) {
  if (!tools.some((t) => t.name === name)) {
    throw new Error(`Required tool missing from tools/list: ${name}`);
  }
}

const listed = toolJson(await post({ method: 'tools/call', params: { name: 'list_orders', arguments: {} } }));
if (!(listed.orders ?? []).some((o) => o.id === orderId)) {
  throw new Error(`Order ${orderId} not present in list_orders output`);
}
const detail = toolJson(await post({ method: 'tools/call', params: { name: 'get_order', arguments: { identifier: orderId } } }));
const stock = toolJson(await post({ method: 'tools/call', params: { name: 'get_stock', arguments: { sku: 'MUG-001' } } }));

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
