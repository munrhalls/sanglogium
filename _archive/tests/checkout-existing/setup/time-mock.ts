import { vi } from 'vitest';

// Mock Date.now() and new Date() for consistent test results
const mockDate = new Date('2024-01-01T00:00:00.000Z');

vi.useFakeTimers();
vi.setSystemTime(mockDate);
