import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Set test environment
process.env.NODE_ENV = 'test';

// Import and setup time mocking
import './tests/setup/time-mock';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}));

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve({
    redirectToCheckout: vi.fn(),
  }),
}));

// Mock Sanity client
vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: vi.fn(),
}));

vi.mock('@/sanity/lib/checkoutClient', () => ({
  checkoutClient: {
    fetch: vi.fn(),
    transaction: vi.fn(),
  },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
