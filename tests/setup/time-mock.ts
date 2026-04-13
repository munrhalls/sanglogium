// Time mocking utilities for tests
import { vi } from 'vitest';

// Mock Date.now if needed for tests
export const mockDateNow = (timestamp: number) => {
  vi.setSystemTime(new Date(timestamp));
};

// Reset time mocking
export const resetTimeMock = () => {
  vi.useRealTimers();
};
