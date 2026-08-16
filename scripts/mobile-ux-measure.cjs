// Lightweight one-shot measurement of IEMs + Accessories sections at mobile viewport.
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(30000);

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('[data-testid^="add-to-basket-"]', { timeout: 60000 }).catch(() => {});

    const report = { viewport: '390x844', sections: {} };

    // ---------- IEMs section ----------
    const iemH2 = page.locator('h2:has-text("In-Ear Monitors")').first();
    await iemH2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const iemCard = page.locator('xpath=//h2[contains(text(),"In-Ear Monitors")]/ancestor::article[1]//article[contains(@class,"card-product-dark")]').first();
    const iem = {};
    const cardBox = await iemCard.boundingBox();
    iem.card = cardBox;
    if (cardBox) {
      iem.image = await iemCard.locator('.aspect-square').first().boundingBox();
      iem.name = await iemCard.locator('h3').first().boundingBox();
      const row = iemCard.locator('div.mt-auto');
      iem.bottomRow = await row.boundingBox();
      const addBtn = row.locator('[data-testid^="add-to-basket-"]');
      iem.addButton = await addBtn.boundingBox();
      iem.addButtonTextVisible = await addBtn.locator('span').isVisible().catch(() => false);
      iem.header = await iemH2.boundingBox();
    }
    report.sections.iems = iem;

    // Add first IEM to basket -> stepper appears
    const firstAdd = page.locator('xpath=//h2[contains(text(),"In-Ear Monitors")]/ancestor::article[1]//article[contains(@class,"card-product-dark")][1]//button[data-testid^="add-to-basket-"]');
    await firstAdd.click().catch(() => {});
    await page.waitForTimeout(600);
    const iemStepper = iemCard.locator('[data-testid^="increment-"]');
    const iemDec = iemCard.locator('[data-testid^="decrement-"]');
    const iemQty = iemCard.locator('[data-testid="quantity-display"]');
    const incBox = await iemStepper.boundingBox().catch(() => null);
    const decBox = await iemDec.boundingBox().catch(() => null);
    const qtyBox = await iemQty.boundingBox().catch(() => null);
    iem.stepper = { decrement: decBox, quantity: qtyBox, increment: incBox };
    if (incBox && iem.card) {
      iem.stepper.overflowsCardRightBy = Math.round((incBox.x + incBox.width - (iem.card.x + iem.card.width)) * 10) / 10;
      iem.stepper.width = Math.round((incBox.x + incBox.width - (decBox?.x ?? 0)) * 10) / 10;
    }

    // ---------- Accessories section ----------
    const accH2 = page.locator('h2:has-text("Accessories")').first();
    await accH2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const accCard = page.locator('xpath=//h2[contains(text(),"Accessories")]/ancestor::article[1]//article[contains(@class,"card-product-dark")]').first();
    const acc = {};
    const aCardBox = await accCard.boundingBox().catch(() => null);
    acc.card = aCardBox;
    if (aCardBox) {
      acc.image = await accCard.locator('.aspect-square').first().boundingBox().catch(() => null);
      acc.name = await accCard.locator('h3').first().boundingBox().catch(() => null);
      const aRow = accCard.locator('div.mt-auto');
      acc.bottomRow = await aRow.boundingBox().catch(() => null);
      const aAdd = aRow.locator('[data-testid^="add-to-basket-"]');
      acc.addButton = await aAdd.boundingBox().catch(() => null);
      acc.addButtonTextVisible = await aAdd.locator('span').isVisible().catch(() => false);
    }
    report.sections.accessories = acc;

    const accFirstAdd = page.locator('xpath=//h2[contains(text(),"Accessories")]/ancestor::article[1]//article[contains(@class,"card-product-dark")][1]//button[data-testid^="add-to-basket-"]');
    await accFirstAdd.click().catch(() => {});
    await page.waitForTimeout(600);
    const accInc = accCard.locator('[data-testid^="increment-"]');
    const accDec = accCard.locator('[data-testid^="decrement-"]');
    const accQty = accCard.locator('[data-testid="quantity-display"]');
    const aIncBox = await accInc.boundingBox().catch(() => null);
    const aDecBox = await accDec.boundingBox().catch(() => null);
    const aQtyBox = await accQty.boundingBox().catch(() => null);
    acc.stepper = { decrement: aDecBox, quantity: aQtyBox, increment: aIncBox };
    if (aIncBox && acc.card) {
      acc.stepper.overflowsCardRightBy = Math.round((aIncBox.x + aIncBox.width - (acc.card.x + acc.card.width)) * 10) / 10;
      acc.stepper.width = Math.round((aIncBox.x + aIncBox.width - (aDecBox?.x ?? 0)) * 10) / 10;
    }

    require('fs').writeFileSync('C:\\webdev\\sang-logium\\audit-out\\mobile-ux-report.json', JSON.stringify(report, null, 2));
    console.log('MEASURE_DONE');

    // Screenshots of both sections
    await page.evaluate(() => window.scrollTo(0, 0));
    await iemH2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:\\webdev\\sang-logium\\audit-out\\mobile-ux-iems.png' });
    await accH2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:\\webdev\\sang-logium\\audit-out\\mobile-ux-accessories.png' });
  } catch (err) {
    console.log('ERR', err.message.split('\n')[0]);
    try {
      await page.screenshot({ path: 'C:\\webdev\\sang-logium\\audit-out\\mobile-ux-error.png' });
    } catch {}
  } finally {
    await browser.close();
  }
})();
