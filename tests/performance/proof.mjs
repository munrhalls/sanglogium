#!/usr/bin/env node
// Performance proof book: every question in docs/features/performance/proof-book.md, answered YES or NO.
// Usage (repo root):
//   node tests/performance/proof.mjs            live shop: exact checks + Google PageSpeed bands (about 30 min)
//   node tests/performance/proof.mjs --exact    live shop: exact checks only (under a minute)
//   node tests/performance/proof.mjs --local    this checkout: production build (once per commit), served on :3100, exact checks,
//                                               then a local Lighthouse band for before/after only (never a verdict)
//   --runs N (runs per page and device, default 5)   --only id,id
// One clock: Lighthouse 13.6.0 simulated throttling, the method PageSpeed uses. Phone = PageSpeed mobile (moto g power,
// slow 4G, 4x CPU); computer = PageSpeed desktop. Green lines are Google's: score >= 90, LCP <= 2.5 s, TBT <= 200 ms, CLS <= 0.1.
// Every distinct PageSpeed run (PageSpeed returns a cached result for a repeat it saw recently; a repeated fetchTime is dropped
// and retried) is kept per deployed build in ~/.cache/sanglogium-performance/, and each line is judged over all runs of that
// build: YES only if every run passes. More runs can only make a verdict stricter, so repeating the command repeats the verdict
// unless a new run fails. "On the line" = the median passes but some run fails: not green.

import { spawn, spawnSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { parseEnv } from "node:util";

const args = process.argv.slice(2);
const opt = (f) => { const i = args.indexOf(f); return i < 0 ? null : args[i + 1]; };
const LOCAL = args.includes("--local");
const EXACT = args.includes("--exact");
const RUNS = +(opt("--runs") || 5);
const ONLY = opt("--only")?.split(",");
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
// Only the PageSpeed key is read from .env.local: loading the whole file would hand its NODE_ENV to the build.
const ENV_FILE = path.join(root, ".env.local");
const PAGE_SPEED = process.env.PAGE_SPEED || (fs.existsSync(ENV_FILE) ? parseEnv(fs.readFileSync(ENV_FILE, "utf8")).PAGE_SPEED : undefined);
const CHILD_ENV = { ...process.env };
delete CHILD_ENV.NODE_ENV; // next build / next start set it themselves
// The build must fit beside other work on a 16 GB laptop: 1 page worker (Next reads CIRCLE_NODE_TOTAL - 1) and a 4 GB heap.
// Both change only how fast it builds, not what it builds.
const BUILD_ENV = { ...CHILD_ENV, CIRCLE_NODE_TOTAL: "2", NODE_OPTIONS: "--max-old-space-size=4096" };

const LIVE = "https://www.sanglogium.com";
const BARE = "https://sanglogium.com/";
const PORT = 3100;
const PAGES = { home: "/", all: "/products", category: "/products/headphones", product: "/product/audioquest-dragontail-carbon-usb-a-to-c-adapter" };
const UA = "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36";
const LIMITS = { score: [90, ">="], lcp: [2500, "<="], tbt: [200, "<="], cls: [0.1, "<="] };
const LH = "lighthouse@13.6.0";

// ---------- HTTP ----------
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { "user-agent": UA, accept: "text/html,*/*", "accept-encoding": "br, gzip", ...headers } }, (r) => {
      const chunks = [];
      r.on("data", (c) => chunks.push(c));
      r.on("end", () => {
        const raw = Buffer.concat(chunks);
        const enc = r.headers["content-encoding"];
        const body = enc === "br" ? zlib.brotliDecompressSync(raw) : enc === "gzip" ? zlib.gunzipSync(raw) : raw;
        resolve({ status: r.statusCode, headers: r.headers, wire: raw.length, text: body.toString("utf8") });
      });
    });
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error(`timeout ${url}`)));
  });
}
const kb = (n) => `${Math.round(n / 1024)} KB`;
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i")) || [])[1];
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) || [];

// ---------- pages as the shop sends them ----------
const cache = new Map();
async function page(base, key) {
  if (cache.has(key)) return cache.get(key);
  const url = base + PAGES[key];
  const doc = await get(url);
  if (doc.status !== 200) throw new Error(`${url} answered ${doc.status}`);
  const html = doc.text;
  const scriptUrls = new Set();
  for (const t of tags(html, "script")) { const s = attr(t, "src"); if (s) scriptUrls.add(new URL(s, url).href); }
  for (const t of tags(html, "link")) if (/rel="preload"/i.test(t) && /as="script"/i.test(t)) scriptUrls.add(new URL(attr(t, "href"), url).href);
  const scripts = [];
  for (const s of scriptUrls) {
    if (new URL(s).origin !== new URL(url).origin) { scripts.push({ url: s, wire: 0, text: "", outside: true }); continue; }
    const r = await get(s);
    scripts.push({ url: s, wire: r.wire, text: r.text, outside: false });
  }
  const p = { key, url, doc, html, scripts, head: html.split(/<\/head>/i)[0] };
  cache.set(key, p);
  return p;
}
const allPages = (base) => Promise.all(Object.keys(PAGES).map((k) => page(base, k)));
const short = (u) => u.replace(/^https?:\/\/[^/]+/, "").replace(/\/_next\/static\/chunks\//, "").slice(0, 60);
const markerCheck = (markers) => async (base) => {
  const hits = [];
  for (const p of await allPages(base)) for (const s of p.scripts) if (markers.some((m) => s.text.includes(m))) hits.push(`${PAGES[p.key]}: ${short(s.url)} ${kb(s.wire)}`);
  return { yes: hits.length === 0, evidence: hits.length ? hits.join("; ") : `no listed script on the 4 pages contains ${markers.map((m) => `"${m}"`).join(" or ")}` };
};
async function cached(base, key) {
  await get(base + PAGES[key]);
  const r = await get(base + PAGES[key]);
  const cc = r.headers["cache-control"] || "";
  const vc = r.headers["x-vercel-cache"] || r.headers["x-nextjs-cache"] || "none";
  const yes = !/no-store/.test(cc) && /HIT|STALE|PRERENDER/i.test(vc);
  return { yes, evidence: `${PAGES[key]}: cache "${vc}", cache-control "${cc}"` };
}

// ---------- exact checks: id -> (base) => { yes, evidence } ----------
const EXACT_CHECKS = {
  "home-pictures-first": async (base) => {
    const p = await page(base, "home");
    const preloads = tags(p.head, "link").filter((t) => /rel="preload"/i.test(t) && /as="image"/i.test(t));
    const eager = tags(p.html, "img").filter((t) => !/loading="lazy"/i.test(t) && attr(t, "fetchpriority")?.toLowerCase() !== "high");
    return { yes: preloads.length === 0 && eager.length === 0, evidence: `${preloads.length} pictures preloaded in the head; ${eager.length} pictures forced to load (${eager.map((t) => attr(t, "alt") || "?").slice(0, 6).join(", ") || "none"}); the top picture is the only one allowed` };
  },
  "home-ring-picture": async (base) => {
    const p = await page(base, "home");
    const n = (p.html.match(/bg-fractal-ring/g) || []).length;
    return { yes: n === 0, evidence: `${n} home sections carry the ring background in the first HTML (CSS backgrounds download when the section is first styled)` };
  },
  "no-editing-tools": markerCheck(["handshake/syn", "sanity.action.release.publish"]),
  "no-basket-validator": markerCheck(["ZodError"]),
  "main-picture-priority": async (base) => {
    const p = await page(base, "product");
    const main = tags(p.html, "img").find((t) => / - Image 1"/.test(t));
    const fp = main && attr(main, "fetchpriority");
    return { yes: fp?.toLowerCase() === "high", evidence: main ? `main photo "${attr(main, "alt")}" fetchpriority=${fp ?? "none"}` : "main photo not found" };
  },
  "list-picture-priority": async (base) => {
    const out = [];
    let yes = true;
    for (const key of ["all", "category"]) {
      const cards = tags((await page(base, key)).html, "img").filter((t) => /data-reveal/.test(t)).slice(0, 4);
      const high = cards.filter((t) => attr(t, "fetchpriority")?.toLowerCase() === "high").length;
      if (cards.length < 4 || high < 4) yes = false;
      out.push(`${PAGES[key]}: ${high} of the first ${cards.length} card pictures at high priority`);
    }
    return { yes, evidence: out.join("; ") };
  },
  "product-page-cache": (base) => cached(base, "product"),
  "pages-cache": async (base) => {
    const r = [await cached(base, "home"), await cached(base, "all"), await cached(base, "category")];
    return { yes: r.every((x) => x.yes), evidence: r.map((x) => x.evidence).join("; ") };
  },
  "text-before-font": async (base) => {
    const out = [];
    let yes = true;
    for (const p of await allPages(base)) {
      // Only rules that download a file can make text wait; next/font's metric-matched local("Arial") fallback downloads nothing.
      const faces = (p.html.match(/@font-face\{[^}]*\}/g) || []).filter((f) => f.includes("url("));
      const swap = faces.filter((f) => /font-display:swap/.test(f)).length;
      if (!faces.length || swap !== faces.length) yes = false;
      out.push(`${new URL(p.url).pathname}: ${swap} of ${faces.length} font files swap`);
    }
    return { yes, evidence: out.join("; ") };
  },
  "nothing-blocks-paint": async (base) => {
    const out = [];
    let yes = true;
    for (const p of await allPages(base)) {
      const sheets = tags(p.html, "link").filter((t) => /rel="stylesheet"/i.test(t)).length;
      const blocking = tags(p.head, "script").filter((t) => attr(t, "src") && !/\s(async|defer|nomodule)(=|\s|>|\/)/i.test(t) && !/type="module"/i.test(t));
      if (sheets || blocking.length) yes = false;
      out.push(`${new URL(p.url).pathname}: ${sheets} stylesheet files, ${blocking.length} blocking script files`);
    }
    return { yes, evidence: out.join("; ") };
  },
  "pictures-right-format": async (base) => {
    let n = 0;
    const bad = [];
    for (const p of await allPages(base)) for (const t of tags(p.html, "img")) {
      const src = attr(t, "src") || "";
      if (!src.includes("cdn.sanity.io")) continue;
      n++;
      const set = attr(t, "srcset") || "";
      if (!set || !attr(t, "sizes") || !set.split(",").every((c) => c.includes("auto=format"))) bad.push(attr(t, "alt"));
    }
    return { yes: n > 0 && bad.length === 0, evidence: `${n} product pictures checked; ${bad.length} without a size list or modern format${bad.length ? `: ${bad.slice(0, 4).join(", ")}` : ""}` };
  },
  "helpers-after-paint": async (base) => {
    const hits = [];
    for (const p of await allPages(base)) for (const s of p.scripts) if (/speed-insights|\/[0-9a-f]{16}\/script\.js/.test(s.url)) hits.push(short(s.url));
    const src = fs.readFileSync(path.join(root, "platform/analytics/WebVitals.tsx"), "utf8");
    const inEffect = /useEffect\(\(\) => \{[\s\S]*onLCP\(/.test(src);
    return { yes: !hits.length && inEffect, evidence: `Speed Insights in the page head: ${hits.length ? hits.join(", ") : "no"}; speed reporter starts inside a React effect (after first paint): ${inEffect ? "yes" : "no"}` };
  },
  "google-analytics-timing": async (base) => {
    const hits = [];
    for (const p of await allPages(base)) if (/googletagmanager\.com\/gtag/.test(p.head) || p.scripts.some((s) => s.url.includes("googletagmanager"))) hits.push(new URL(p.url).pathname);
    return { yes: hits.length === 0, evidence: hits.length ? `the analytics script is preloaded or listed in the page on ${hits.join(", ")}` : "no page lists the analytics script" };
  },
  "error-monitor-timing": markerCheck(["sentry.javascript."]),
  "no-redirect": async () => {
    if (LOCAL) return { yes: null, evidence: "domain setting: checked on the live shop only" };
    const r = await get(BARE);
    return { yes: r.status === 200, evidence: `${BARE} answered ${r.status}${r.headers.location ? ` -> ${r.headers.location}` : ""}` };
  },
  "returning-visitor-ring": async (base) => {
    const url = `${base}/backgrounds/fractal-ring.webp`;
    const a = await get(url);
    const etag = a.headers.etag;
    const b = etag ? await get(url, { "if-none-match": etag }) : { status: "-", wire: a.wire };
    return { yes: b.status === 304, evidence: `first visit ${kb(a.wire)}, cache-control "${a.headers["cache-control"]}"; asking again with its tag: ${b.status} (${b.wire} bytes)` };
  },
};
const BLOCKED = {
  taps: "out of scope: the owner's definition makes TBT the lab stand-in for taps (the *-tbt questions); real taps show only in real-user data",
  "real-user-data": "cannot be measured here: the Chrome UX Report API is disabled for the key's project, and Vercel Speed Insights data is only in the Vercel dashboard",
};

// ---------- timing: Google PageSpeed on the live shop ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function psiOnce(url, strategy) {
  const key = PAGE_SPEED;
  if (!key) throw new Error("PAGE_SPEED (Google API key) is not set in .env.local");
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&key=${key}`);
    const d = await r.json().catch(() => ({}));
    if (d.lighthouseResult) return d.lighthouseResult;
    await sleep(30000);
  }
  throw new Error(`PageSpeed gave no result for ${url} ${strategy}`);
}
const metricsOf = (L) => ({
  at: L.fetchTime, version: L.lighthouseVersion,
  score: Math.round(L.categories.performance.score * 100),
  lcp: L.audits["largest-contentful-paint"].numericValue,
  tbt: L.audits["total-blocking-time"].numericValue,
  cls: L.audits["cumulative-layout-shift"].numericValue,
});
async function psiBands() {
  const combos = [];
  for (const device of ["mobile", "desktop"]) for (const key of Object.keys(PAGES)) combos.push({ device, key, runs: [] });
  const GAP = 5 * 60 * 1000; // PageSpeed caches a URL's result for some minutes: repeats of one combo stay 5 min apart
  for (let round = 0; round < RUNS; round++) {
    const start = Date.now();
    let next = 0;
    await Promise.all([0, 1].map(async () => {
      while (next < combos.length) {
        const c = combos[next++];
        for (let t = 0; t < 3; t++) {
          const m = metricsOf(await psiOnce(LIVE + PAGES[c.key], c.device));
          if (!c.runs.some((x) => x.at === m.at)) { c.runs.push(m); break; }
          await sleep(60000);
        }
      }
    }));
    console.error(`  PageSpeed round ${round + 1}/${RUNS} done`);
    if (round < RUNS - 1) await sleep(Math.max(0, GAP - (Date.now() - start)));
  }
  return combos;
}
// The deployed build = the hash of the home page's own script files; it changes with every deploy.
async function buildKey() {
  const p = await page(LIVE, "home");
  return crypto.createHash("sha1").update(p.scripts.filter((x) => !x.outside).map((x) => new URL(x.url).pathname).sort().join("\n")).digest("hex").slice(0, 12);
}
const POOL_DIR = path.join(os.homedir(), ".cache", "sanglogium-performance");
function pooled(build, combos) {
  const file = path.join(POOL_DIR, `pagespeed-${build}.json`);
  const pool = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  for (const c of combos) for (const r of c.runs) if (!pool.some((p) => p.page === c.key && p.device === c.device && p.at === r.at)) pool.push({ page: c.key, device: c.device, ...r });
  fs.mkdirSync(POOL_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(pool));
  return pool;
}
// ---------- local Lighthouse band (before/after only) ----------
function lighthouseLocal(url, device) {
  const a = ["-y", LH, url, "--only-categories=performance", "--output=json", "--quiet", "--chrome-flags=--headless=new"];
  if (device === "desktop") a.push("--preset=desktop");
  const r = spawnSync("npx", a, { encoding: "utf8", maxBuffer: 1e9 });
  return metricsOf(JSON.parse(r.stdout));
}
const band = (xs, f) => { const v = xs.slice().sort((a, b) => a - b); return `${f(v[0])}/${f(v[Math.floor((v.length - 1) / 2)])}/${f(v[v.length - 1])}`; };
const pass = (k, v) => (LIMITS[k][1] === ">=" ? v >= LIMITS[k][0] : v <= LIMITS[k][0]);
const FMT = { score: (x) => String(x), lcp: (x) => (x / 1000).toFixed(2) + "s", tbt: (x) => Math.round(x) + "ms", cls: (x) => x.toFixed(3) };

// ---------- local server ----------
async function serveLocal() {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const dirty = execFileSync("git", ["status", "--porcelain", "--", ".", ":!data/catalogue-index.json"], { cwd: root, encoding: "utf8" }).trim();
  const mark = path.join(root, ".next", "proof-commit");
  if (dirty || !fs.existsSync(mark) || fs.readFileSync(mark, "utf8") !== sha) {
    console.error(`  building ${sha.slice(0, 9)}${dirty ? " (uncommitted changes)" : ""} for measurement`);
    const log = path.join(os.tmpdir(), `sanglogium-proof-build-${process.pid}.log`);
    // oom_score_adj 1000: if memory runs out, the kernel kills this build, never another program.
    const b = spawnSync("sh", ["-c", `echo 1000 > /proc/self/oom_score_adj; npm run build > "${log}" 2>&1`], { cwd: root, env: BUILD_ENV, stdio: "ignore" });
    if (b.status !== 0) throw new Error(`the production build failed (exit ${b.status ?? b.signal}); last lines of ${log}:\n${fs.readFileSync(log, "utf8").split("\n").slice(-25).join("\n")}`);
    if (!dirty) fs.writeFileSync(mark, sha);
  }
  const server = spawn(path.join(root, "node_modules/.bin/next"), ["start", "-p", String(PORT)], { cwd: root, env: CHILD_ENV, stdio: "ignore" });
  for (let i = 0; i < 120; i++) { try { if ((await get(`http://localhost:${PORT}/`)).status === 200) return { server, sha }; } catch {} await sleep(1000); }
  server.kill();
  throw new Error("the local server did not start");
}

// ---------- main ----------
const results = [];
const say = (id, yes, question, evidence) => results.push({ id, verdict: yes === null ? "N/A" : yes === "blocked" ? "BLOCKED" : yes ? "YES" : "NO", question, evidence });
const book = JSON.parse(fs.readFileSync(path.join(root, "tests/performance/questions.json"), "utf8"));
const want = (id) => !ONLY || ONLY.includes(id);
let local = null;
try {
  if (LOCAL) local = await serveLocal();
  const base = LOCAL ? `http://localhost:${PORT}` : LIVE;
  for (const q of book) {
    if (!want(q.id)) continue;
    if (BLOCKED[q.id]) { say(q.id, "blocked", q.question, BLOCKED[q.id]); continue; }
    const check = EXACT_CHECKS[q.id];
    if (!check) continue;
    const r = await check(base);
    say(q.id, r.yes, q.question, r.evidence);
  }
  const timing = book.filter((q) => /-(phone|computer)-(score|lcp|tbt|cls)$/.test(q.id) && want(q.id));
  if (timing.length && LOCAL) {
    console.error("  local Lighthouse band (laptop, before/after only)");
    for (const device of ["mobile", "desktop"]) for (const key of Object.keys(PAGES)) {
      const runs = Array.from({ length: 3 }, () => lighthouseLocal(base + PAGES[key], device));
      console.log(`LOCAL ${device.padEnd(7)} ${PAGES[key].padEnd(22)} ${Object.keys(LIMITS).map((k) => `${k} ${band(runs.map((r) => r[k]), FMT[k])}`).join("  ")}`);
    }
    for (const q of timing) say(q.id, null, q.question, "timing is judged only by PageSpeed on the live shop");
  } else if (timing.length && !EXACT) {
    console.error(`  PageSpeed: ${RUNS} rounds, 5 min apart`);
    const build = await buildKey();
    const pool = pooled(build, await psiBands());
    for (const q of timing) {
      const [, key, dev, k] = q.id.match(/^(\w+)-(phone|computer)-(\w+)$/);
      const runs = pool.filter((p) => p.page === key && p.device === (dev === "phone" ? "mobile" : "desktop"));
      const xs = runs.map((r) => r[k]);
      const fails = xs.filter((x) => !pass(k, x)).length;
      const median = xs.slice().sort((a, b) => a - b)[Math.floor((xs.length - 1) / 2)];
      const yes = xs.length >= RUNS && fails === 0;
      const tag = yes ? "every run passes" : xs.length < RUNS ? `only ${xs.length} runs` : pass(k, median) ? `on the line: the median passes, ${fails} of ${xs.length} runs fail` : `the median fails (${fails} of ${xs.length} runs fail)`;
      say(q.id, yes, q.question, `${xs.length} distinct runs of build ${build}, min/median/max ${band(xs, FMT[k])} (line ${LIMITS[k][1]} ${FMT[k](LIMITS[k][0])}): ${tag}; Lighthouse ${runs[0]?.version}`);
    }
  }
} finally {
  local?.server.kill();
}
for (const r of results) console.log(`${r.verdict.padEnd(7)} ${r.id.padEnd(24)} ${r.question}\n        ${r.evidence}`);
const count = (v) => results.filter((r) => r.verdict === v).length;
console.log(`\n${LOCAL ? `local build ${local.sha.slice(0, 9)}` : LIVE}: ${count("YES")} YES, ${count("NO")} NO, ${count("BLOCKED")} BLOCKED, ${count("N/A")} not judged here`);
