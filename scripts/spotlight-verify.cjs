/* Lean verification of Product Spotlight copy-box typography fixes.
   One browser, sequential viewports, minimal waits. Output goes to stdout. */
const { chromium } = require("@playwright/test");

const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "narrow-320", width: 320, height: 700 },
  { name: "tablet-834", width: 834, height: 1112 },
  { name: "lg-touch-1366", width: 1366, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
];
const filterArg = process.argv[2];
const list = filterArg ? viewports.filter((v) => v.name === filterArg) : viewports;

(async () => {
  const browser = await chromium.launch();
  for (const vp of list) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.setDefaultTimeout(45000);
    const t0 = Date.now();
    try {
      await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector("article .bg-surface-subtle", { timeout: 40000 });
    } catch (e) {
      console.log(`\n===== ${vp.name} LOAD_FAIL ${e.message.split("\n")[0]} (${Date.now() - t0}ms)`);
      await page.close();
      continue;
    }
    const data = await page.evaluate(() => {
      const articles = [...document.querySelectorAll("article")].filter((a) => a.querySelector("h2.type-section-hed"));
      return articles.map((a) => {
        const box = a.querySelector("div.bg-surface-subtle");
        if (!box) return null;
        const boxR = box.getBoundingClientRect();
        const q = (s) => box.querySelector(s);
        const read = (el) => {
          if (!el) return null;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const lh = parseFloat(cs.lineHeight) || 0;
          return {
            fs: cs.fontSize, lh: cs.lineHeight, ls: cs.letterSpacing, w: parseInt(cs.fontWeight),
            lines: lh ? Math.round(el.clientHeight / lh) : 1, clamp: cs.webkitLineClamp || "none",
            top: Math.round(r.top - boxR.top), h: Math.round(r.height),
            overflow: el.scrollHeight > el.clientHeight,
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 46),
          };
        };
        const cta = a.querySelector("a");
        const ctaR = cta ? cta.getBoundingClientRect() : null;
        return {
          brand: q(".type-overline") ? q(".type-overline").textContent.trim() : "",
          box: `${Math.round(boxR.width)}x${Math.round(boxR.height)}`,
          contentFits: !(box.scrollHeight > box.clientHeight + 2),
          overline: read(q(".type-overline")),
          h2: read(q("h2")), h3: read(q("h3")), p: read(q("p")),
          cta: cta ? { size: `${Math.round(ctaR.width)}x${Math.round(ctaR.height)}`, top: Math.round(ctaR.top - boxR.top), bottom: Math.round(ctaR.bottom - boxR.bottom) } : null,
        };
      }).filter(Boolean);
    });
    console.log(`\n===== ${vp.name} (load ${Date.now() - t0}ms)`);
    for (const s of data) {
      console.log(`[${s.brand}] box=${s.box} fits=${s.contentFits}`);
      for (const k of ["overline", "h2", "h3", "p"]) {
        const e = s[k];
        if (e) console.log(`   ${k.padEnd(8)} fs=${e.fs} ls=${e.ls} w=${e.w} lines=${e.lines} clamp=${e.clamp} top=${e.top} h=${e.h} ovf=${e.overflow} "${e.text}"`);
      }
      if (s.cta) console.log(`   cta      size=${s.cta.size} top=${s.cta.top} bottom=${s.cta.bottom}`);
    }
    await page.close();
  }
  await browser.close();
  console.log("\nVERIFY_DONE");
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
