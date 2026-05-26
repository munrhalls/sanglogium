/**
 * File-based checkout trace logger - Single ephemeral file
 * Stores complete checkout journey in single latest-checkout-trace.json in project root
 * Zero-gap logging: direct file I/O, no external dependencies
 * Blank slate: file is reset with empty array [] on each new checkout initiation
 */

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const TRACE_FILE = 'latest-checkout-trace.json';

export interface TraceEvent {
  timestamp: string;
  step: string;
  data?: Record<string, unknown>;
  error?: { message: string; stack?: string; name?: string };
}

/**
 * Get file path for trace (project root)
 */
function getTracePath(): string {
  return join(process.cwd(), TRACE_FILE);
}

/**
 * Reset trace file (blank slate) - called on checkout initiation
 * Overwrites with empty array []
 */
export async function resetTrace(): Promise<void> {
  const path = getTracePath();
  await writeFile(path, JSON.stringify([], null, 2), 'utf-8');
}

/**
 * Append event to trace file
 */
export async function appendTraceEvent(
  step: string,
  data?: Record<string, unknown>,
  error?: Error | unknown
): Promise<void> {
  const path = getTracePath();
  
  // Read existing trace
  let events: TraceEvent[];
  try {
    const content = await readFile(path, 'utf-8');
    events = JSON.parse(content);
  } catch (err) {
    // If file doesn't exist or is corrupted, start with empty array
    events = [];
  }
  
  // Create event
  const event: TraceEvent = {
    timestamp: new Date().toISOString(),
    step,
    data,
  };
  
  if (error) {
    event.error = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : {
      message: String(error),
    };
  }
  
  // Append event
  events.push(event);
  
  // Write back
  await writeFile(path, JSON.stringify(events, null, 2), 'utf-8');
}

/**
 * Get complete trace (latest checkout)
 */
export async function getTrace(): Promise<TraceEvent[] | null> {
  const path = getTracePath();
  
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}
