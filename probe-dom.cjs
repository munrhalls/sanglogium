const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 834, height: 1112 } });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector("article h2.type-section-hed", { timeout: 40000 });
  const info = await p.evaluate(() => {
    const h2 = document.querySelector("article h2.type-section-hed");
    const cls = h2 ? h2.className : "none";
    const hasRule = (sel) => {
      for (const sheet of document.styleSheets) {
        let rules = [];
        try { rules = sheet.cssRules || []; } catch { continue; }
        for (const r of rules) {
          if (r.cssRules) for (const rr of r.cssRules) if (rr.selectorText && rr.selectorText.includes(sel)) return rr.cssText.slice(0, 200);
          if (r.selectorText && r.selectorText.includes(sel)) return r.cssText.slice(0, 200);
        }
      }
      return null;
    };
    return {
      h2Class: cls,
      mdMaxLgTextH3: hasRule("md\\:max-lg\\:text-h3") || hasRule("max-lg\\:text-h3"),
      maxLgAny: hasRule("max-lg\\:h-9"),
      textH3: hasRule("\\:text-h3"),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
