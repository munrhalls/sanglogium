// Playwright-specific time mocking
let currentTime = Date.now();

export const mockTime = {
  now: () => currentTime,
  advance: (ms: number) => {
    currentTime += ms;
    return currentTime;
  },
  reset: () => {
    currentTime = Date.now();
  },
  set: (timestamp: number) => {
    currentTime = timestamp;
  }
};

// Helper to inject time mock into page
export async function injectTimeMock(page: any) {
  await page.evaluate(() => {
    const originalDate = window.Date;
    window.Date = {
      ...originalDate,
      now: () => mockTime.now()
    };
  });
}
