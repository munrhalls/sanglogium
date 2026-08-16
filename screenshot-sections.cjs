const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  const sections = [
    { name: 'iems', selector: 'h2:has-text("In-Ear Monitors")' },
    { name: 'accessories', selector: 'h2:has-text("Accessories")' },
  ];

  for (const { name, selector } of sections) {
    const el = page.locator(selector).first();
    try {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `./_project/screenshots/homepage-${name}-after-normalize.png`, fullPage: false });
    } catch (err) {
      console.log(`Could not screenshot ${name}:`, err.message);
    }
  }

  await browser.close();
})();
