import { beforeMount, afterEach } from '@playwright/experimental-ct-react/hooks';

beforeMount(async ({ appDir }) => {
  // Next.js module resolution setup
  process.env.NODE_ENV = 'test';
});

afterEach(async ({ page }) => {
  // Cleanup after each test
});
