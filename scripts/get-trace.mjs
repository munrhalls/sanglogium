// Get latest checkout trace
// Reads latest-checkout-trace.json from project root and outputs to stdout
// Uses direct file I/O to avoid TypeScript compilation issues

import { readFile } from 'fs/promises';
import { join } from 'path';

const TRACE_FILE = 'latest-checkout-trace.json';

function getTracePath() {
  return join(process.cwd(), TRACE_FILE);
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

const trace = await getTrace();

if (trace) {
  console.log(JSON.stringify(trace, null, 2));
} else {
  console.log('No trace found. Start a checkout to generate a trace.');
  process.exit(1);
}
