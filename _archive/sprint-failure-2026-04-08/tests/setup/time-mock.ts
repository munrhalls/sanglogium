import { vi } from 'vitest';

// Global time tracking for tests
let currentTime = Date.now();

export const mockTime = {
  now: () => currentTime,
  advance: (ms: number) => {
    currentTime += ms;
    // Trigger any pending timers
    vi.runAllTimers();
  },
  reset: () => {
    currentTime = Date.now();
  },
  set: (timestamp: number) => {
    currentTime = timestamp;
  }
};

// Mock Date.now globally for all tests
beforeAll(() => {
  vi.stubGlobal('Date', {
    now: mockTime.now,
    parse: Date.parse,
    UTC: Date.UTC
  });
});

beforeEach(() => {
  mockTime.reset();
});
