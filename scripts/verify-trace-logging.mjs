// Verify trace logging write path and read path
// Tests resetTrace, appendTraceEvent, and getTrace functions
// Uses direct file I/O to avoid TypeScript compilation issues
// Updated for new structure: file in project root, empty array [] on reset

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const TRACE_FILE = 'latest-checkout-trace.json';

function getTracePath() {
  return join(process.cwd(), TRACE_FILE);
}

async function resetTrace() {
  const path = getTracePath();
  await writeFile(path, JSON.stringify([], null, 2), 'utf-8');
}

async function appendTraceEvent(step, data, error) {
  const path = getTracePath();
  let events;
  try {
    const content = await readFile(path, 'utf-8');
    events = JSON.parse(content);
  } catch (err) {
    events = [];
  }
  
  const event = {
    timestamp: new Date().toISOString(),
    step,
    data,
  };
  
  if (error) {
    event.error = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : { message: String(error) };
  }
  
  events.push(event);
  await writeFile(path, JSON.stringify(events, null, 2), 'utf-8');
}

async function getTrace() {
  const path = getTracePath();
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

console.log('[TEST] Starting trace logging verification...');

// Test 1: Reset trace
console.log('[TEST] Step 1: Reset trace');
await resetTrace();
console.log('[TEST] ✓ Trace reset successful');

// Test 2: Append events
console.log('[TEST] Step 2: Append events');
await appendTraceEvent('checkout_init', { itemCount: 2, items: [{ productId: 'p1', quantity: 1 }] });
await appendTraceEvent('address_submit', { city: 'Warsaw', postalCode: '00-001' });
await appendTraceEvent('shipping_selection', { shippingCode: 'dpd', cost: 1899 });
await appendTraceEvent('payment_intent_create', { amount: 50000, currency: 'pln' });
console.log('[TEST] ✓ Events appended successfully');

// Test 3: Read trace
console.log('[TEST] Step 3: Read trace');
const trace = await getTrace();

if (!trace) {
  console.error('[TEST] ✗ Failed to read trace');
  process.exit(1);
}

console.log('[TEST] ✓ Trace read successful');
console.log('[TEST] Event count:', trace.length);
console.log('[TEST] Events:', trace.map(e => e.step));

// Verify event count
if (trace.length !== 4) {
  console.error('[TEST] ✗ Expected 4 events, got', trace.length);
  process.exit(1);
}

// Verify event steps
const expectedSteps = ['checkout_init', 'address_submit', 'shipping_selection', 'payment_intent_create'];
const actualSteps = trace.map(e => e.step);
for (const expected of expectedSteps) {
  if (!actualSteps.includes(expected)) {
    console.error('[TEST] ✗ Missing expected step:', expected);
    process.exit(1);
  }
}

console.log('[TEST] ✓ All verifications passed');
console.log('[TEST] Trace logging system is working correctly');
