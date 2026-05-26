// Get recent checkout events to find traceIds
import { getRecentCheckoutEvents } from '../lib/dev/event-logger.js';

const recent = await getRecentCheckoutEvents();

console.log('Recent checkout events:');
console.log(JSON.stringify(recent, null, 2));

if (recent.length > 0) {
  const latestTraceId = recent[0].correlationId;
  console.log('\nLatest traceId:', latestTraceId);
  console.log(`\nTo get full logs: curl http://localhost:3000/api/checkout-logs/${latestTraceId}`);
} else {
  console.log('\nNo recent checkout events found.');
}
