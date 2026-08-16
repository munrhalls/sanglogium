const { chromium } = require("@playwright/test");

const vpArg = process.argv[2] || "desktop";

const viewports = {
  desktop: { name: "desktop", width: 1440, height: 900 },
  touch: { name: "lg-touch", width: 1366, height: 768 },
  tablet: { name: "tablet", width: 834, height: 1112 },
  mobile: { name: "mobile", width: 390, height: 844 },
  narrow: { name: "narrow320", width: 320, height: 700 },
};

async function run() {
  const vp = viewports[vpArg];
  if (!vp) { console.error("unknown viewport", vpArg); process.exit(1); }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  page.setDefaultTimeout(20000);
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(4000);

  const sections = page.locator("article", { has: page.locator("h2.type-section-hed") });
  const count = await sections.count();
  console.log(`=== VERIFY ${vp.name} (${vp.width}x${vp.height}) — ${count} matched articles ===\n`);

  for (let i = 0; i < count; i++) {
    const box = sections.nth(i).locator("div.bg-surface-subtle").first();
    if (!(await box.count())) continue;
    const brand = await sections.nth(i).locator("span").first().textContent().catch(() => "");
    const info = await sections.nth(i).evaluate((article) => {
      const box = article.querySelector(".bg-surface-subtle");
      const boxR = box.getBoundingClientRect();
      const get = (sel) => {
        const el = article.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        let lines = 1;
        if (el.clientHeight && parseFloat(cs.lineHeight)) lines = Math.round(el.clientHeight / parseFloat(cs.lineHeight));
        return {
          text: (el.textContent || "").slice(0, 40),
          fs: cs.fontSize,
          lh: cs.lineHeight,
          ls: cs.letterSpacing,
          w: parseInt(cs.fontWeight),
          lines,
          top: Math.round(r.top - boxR.top),
          h: Math.round(r.height),
          webkitClamp: cs.webkitLineClamp,
        };
      };
      const link = article.querySelector("a");
      const lcs = getComputedStyle(link);
      const lr = link.getBoundingClientRect();
      return {
        box: `${Math.round(boxR.width)}x${Math.round(boxR.height)}`,
        pad: getComputedStyle(box).paddingTop,
        overline: get("span"),
        hed: get("h2"),
        sub: get("h3"),
        body: get("p"),
        cta: {
          fs: lcs.fontSize,
          ls: lcs.letterSpacing,
          tt: lcs.textTransform,
          w: parseInt(lcs.fontWeight),
          bg: lcs.backgroundColor,
          border: lcs.borderColor,
          display: lcs.display,
          size: `${Math.round(lr.width)}x${Math.round(lr.height)}`,
          left: Math.round(lr.left - boxR.left),
        },
      };
    });
    console.log(`--- Spotlight ${i} [${brand}] ---`);
    console.log(`BOX ${info.box} pad ${info.pad}`);
    console.log(`  OVERLINE ${JSON.stringify(info.overline)}`);
    console.log(`  HED      ${JSON.stringify(info.hed)}`);
    console.log(`  SUB      ${JSON.stringify(info.sub)}`);
    console.log(`  BODY     ${JSON.stringify(info.body)}`);
    console.log(`  CTA      ${JSON.stringify(info.cta)}`);
    console.log("");
  }

  await browser.close();
  console.log("done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
