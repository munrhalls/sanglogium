const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 834, height: 1112 } });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector("article .bg-surface-subtle", { timeout: 40000 });
  const info = await p.evaluate(() => {
    const boxes = [...document.querySelectorAll("article .bg-surface-subtle")];
    return boxes.map((box) => {
      const h2 = box.querySelector("h2");
      const h3 = box.querySelector("h3");
      const pEl = box.querySelector("p");
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const h2c = cs(h2), h3c = cs(h3), pc = cs(pEl);
      return {
        brand: (box.querySelector(".type-overline") || {}).textContent || "",
        h2Class: h2 ? h2.className : null,
        h2fs: h2c ? h2c.fontSize : null,
        h3Class: h3 ? h3.className : null,
        h3fs: h3c ? h3c.fontSize : null,
        pClass: pEl ? pEl.className : null,
        pClamp: pc ? pc.webkitLineClamp : null,
      };
    });
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
