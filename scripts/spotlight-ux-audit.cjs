/* Product Spotlight copy-box typography UX audit — renders real page, measures every
   text element in the copy box across viewports, screenshots each. */
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "audit-out");
fs.mkdirSync(OUT, { recursive: true });

const ALL_VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "narrow-320", width: 320, height: 700 },
  { name: "tablet-834", width: 834, height: 1112 },
  { name: "lg-touch-1366", width: 1366, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
];
const filterArg = process.argv[2];
const viewports = filterArg ? ALL_VIEWPORTS.filter((v) => v.name === filterArg) : ALL_VIEWPORTS;

const log = (s) => {
  console.log(s);
  fs.appendFileSync(path.join(OUT, "audit.log"), s + "\n");
};

function parseColor(c) {
  const m = String(c).match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [0, 1, 2].map((i) => parseInt(m[i + 1], 10));
  const h = String(c).replace("#", "");
  if (h.length === 6) return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return null;
}
function luminance(color) {
  const ch = parseColor(color);
  if (!ch) return null;
  const [r, g, b] = ch.map((v) => v / 255);
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
const contrast = (a, b) => {
  const l1 = luminance(a), l2 = luminance(b);
  if (l1 == null || l2 == null) return "n/a";
  const [hi, lo] = [Math.max(l1, l2), Math.min(l1, l2)];
  return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
};

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const vp of viewports) {
    log(`\n========== VIEWPORT ${vp.name} (${vp.width}x${vp.height}) ==========`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.setDefaultTimeout(30000);
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("article .bg-surface-subtle", { timeout: 30000 }).catch(() => log("  !! no copy boxes found"));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, `shot-${vp.name}.png`), fullPage: false }).catch((e) => log("  !! screenshot fail " + e.message));

    const data = await page.evaluate(() => {
      const articles = [...document.querySelectorAll("article")].filter((a) => a.querySelector("h2.type-section-hed"));
      const out = [];
      for (const article of articles) {
        const box = article.querySelector("div.bg-surface-subtle");
        if (!box) continue;
        const boxR = box.getBoundingClientRect();
        const grid = article.querySelector(".grid");
        const gridChildren = grid ? [...grid.children].map((c) => {
          const r = c.getBoundingClientRect();
          return { cls: c.className.split(" ").slice(0, 3).join(" "), w: Math.round(r.width), h: Math.round(r.height), aspect: (r.width / r.height).toFixed(2) };
        }) : [];

        const read = (el) => {
          if (!el) return null;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const lh = parseFloat(cs.lineHeight) || 0;
          const lines = lh ? Math.round(el.clientHeight / lh) : 1;
          return {
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
            fs: cs.fontSize, lh: cs.lineHeight, ls: cs.letterSpacing, weight: cs.fontWeight,
            color: cs.color, tt: cs.textTransform, w: Math.round(r.width), h: Math.round(r.height),
            lines, clamp: cs.webkitLineClamp || "none", top: Math.round(r.top - boxR.top),
            bottom: Math.round(r.bottom - boxR.bottom), overflowY: el.scrollHeight > el.clientHeight,
          };
        };

        const cta = article.querySelector("a");
        const ctaCs = cta ? getComputedStyle(cta) : null;
        const ctaR = cta ? cta.getBoundingClientRect() : null;
        const overline = box.querySelector(".type-overline");
        out.push({
          brand: overline ? overline.textContent.trim() : "",
          box: { w: Math.round(boxR.width), h: Math.round(boxR.height), padTop: getComputedStyle(box).paddingTop, padBottom: getComputedStyle(box).paddingBottom, padLeft: getComputedStyle(box).paddingLeft },
          gridChildren,
          overline: read(overline),
          h2: read(box.querySelector("h2")),
          h3: read(box.querySelector("h3")),
          p: read(box.querySelector("p")),
          contentScroll: box.scrollHeight > box.clientHeight,
          cta: cta ? {
            text: cta.textContent.trim(), fs: ctaCs.fontSize, ls: ctaCs.letterSpacing, weight: ctaCs.fontWeight,
            tt: ctaCs.textTransform, color: ctaCs.color, bg: ctaCs.backgroundColor, border: ctaCs.borderColor,
            display: ctaCs.display, size: `${Math.round(ctaR.width)}x${Math.round(ctaR.height)}`,
            top: Math.round(ctaR.top - boxR.top), bottom: Math.round(ctaR.bottom - boxR.bottom),
          } : null,
        });
      }
      return out;
    });
    for (const s of data) {
      log(`\n--- Spotlight [${s.brand}] ---`);
      log(`BOX ${s.box.w}x${s.box.h} pad(T${s.box.padTop}/B${s.box.padBottom}/L${s.box.padLeft}) innerOverflow=${s.contentScroll}`);
      log(`  grid: ${JSON.stringify(s.gridChildren)}`);
      for (const key of ["overline", "h2", "h3", "p"]) {
        const e = s[key];
        if (!e) { log(`  ${key}: MISSING`); continue; }
        log(`  ${key.padEnd(9)} fs=${e.fs} lh=${e.lh} ls=${e.ls} weight=${e.weight} color=${e.color} tt=${e.tt} w=${e.w}px h=${e.h}px lines=${e.lines} clamp=${e.clamp} top=${e.top} bottomOffset=${e.bottom} overflow=${e.overflowY}`);
      }
      if (s.cta) log(`  cta       text="${s.cta.text}" fs=${s.cta.fs} ls=${s.cta.ls} weight=${s.cta.weight} tt=${s.cta.tt} color=${s.cta.color} bg=${s.cta.bg} border=${s.cta.border} size=${s.cta.size} top=${s.cta.top} bottom=${s.cta.bottom}`);
      const bg = "#0D0F0F";
      for (const key of ["overline", "h2", "h3", "p"]) {
        if (s[key] && s[key].color) log(`  ${key} contrast vs ${bg} = ${contrast(s[key].color, bg)}:1`);
      }
      if (s.cta && s.cta.color) log(`  cta text contrast vs ${bg} = ${contrast(s.cta.color, bg)}:1`);
    }
    results.push({ vp: vp.name, data });
    await page.close();
  }

  fs.writeFileSync(path.join(OUT, "audit.json"), JSON.stringify(results, null, 2));
  await browser.close();
  log("\nDONE");
}

run().catch((e) => {
  console.error("FATAL", e);
  fs.appendFileSync(path.join(OUT, "audit.log"), "FATAL " + (e && e.stack) + "\n");
  process.exit(1);
});
