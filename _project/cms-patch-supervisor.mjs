// Autonomous CMS-patch phase: watches the sourcing tree, and for every
// beads leaf that closes, deterministically converts its data/<slice>/<brand>/*.md
// files into Sanity filterAttributes.* patches via the existing engine.mjs.
// Idempotent (marker file per brand), resumable, no LLM involved in the
// patch step itself (pure mechanical YAML -> Sanity field copy).
// When nothing is left open/in_progress anywhere in the tree AND every
// closed brand has been patched, commits + pushes + deploys to prod, then exits.
import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { runProductPatch } from "/home/jan/work/sanglogium/sanity-cms/utils/migrations/headphonesFilterAttributes/engine.mjs";

const REPO = "/home/jan/work/sanglogium";
const STATE_DIR = path.join(REPO, "_project/cms-patch-state");
const LOG = path.join(REPO, "_project/cms-patch-supervisor.log");

const SLICES = {
  headphones: "sang-logium-zdb.1",
  "audio-electronics": "sang-logium-zdb.2",
  accessories: "sang-logium-zdb.3",
};

for (const s of Object.keys(SLICES)) fs.mkdirSync(path.join(STATE_DIR, s), { recursive: true });

function log(msg) {
  fs.appendFileSync(LOG, `${new Date().toISOString()} | ${msg}\n`);
}

function bd(args) {
  return execFileSync("bd", args, { cwd: REPO, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
}

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function patchBrandFolder(folder, fallbackBrand) {
  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".md")).sort();
  const results = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(folder, f), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) {
      results.push({ file: f, ok: false, error: "no frontmatter block found" });
      continue;
    }
    let fm;
    try {
      fm = yaml.load(m[1]);
    } catch (e) {
      results.push({ file: f, ok: false, error: `yaml parse error: ${e.message}` });
      continue;
    }
    if (!fm || !fm.product_id) {
      results.push({ file: f, ok: false, error: "missing product_id" });
      continue;
    }
    const filterAttributes = fm.spec_fields || {};
    if (Object.keys(filterAttributes).length === 0) {
      results.push({ file: f, ok: false, error: "empty spec_fields" });
      continue;
    }
    try {
      const r = await runProductPatch(
        { productId: fm.product_id, brand: fm.brand || fallbackBrand, name: fm.name, filterAttributes },
        { write: true }
      );
      results.push({ file: f, productId: fm.product_id, ok: true, rev: r.rev });
    } catch (err) {
      results.push({ file: f, productId: fm.product_id, ok: false, error: err.message });
    }
  }
  return results;
}

async function mainLoop() {
  log("=== CMS patch supervisor started ===");
  let totalPatched = 0;
  let totalFailed = 0;

  while (true) {
    let progressed = false;
    let anyReady = false;
    let anyInProgress = false;

    for (const [slice, epic] of Object.entries(SLICES)) {
      const readyOut = bd(["ready", "--parent", epic]);
      const readyMatch = readyOut.match(/Ready: (\d+) issues/);
      if (readyMatch && parseInt(readyMatch[1], 10) > 0) anyReady = true;

      const inProgArr = JSON.parse(bd(["list", "--parent", epic, "--status", "in_progress", "--json"]) || "[]");
      if (inProgArr.length > 0) anyInProgress = true;

      const closedArr = JSON.parse(bd(["list", "--parent", epic, "--status", "closed", "--json"]) || "[]");
      for (const issue of closedArr) {
        const brand = issue.title.replace(/^\[Sourcing\]\s*[^:]+:\s*/, "");
        const slug = slugify(brand);
        const marker = path.join(STATE_DIR, slice, `${slug}.json`);
        if (fs.existsSync(marker)) continue;

        const folder = path.join(REPO, "data", slice, slug);
        if (!fs.existsSync(folder)) {
          log(`SKIP ${issue.id} (${slice}/${brand}) -- no folder ${folder}`);
          continue;
        }

        log(`PATCHING ${issue.id} (${slice}/${brand}) ...`);
        const results = await patchBrandFolder(folder, brand);
        const ok = results.filter((r) => r.ok).length;
        const fail = results.filter((r) => !r.ok).length;
        totalPatched += ok;
        totalFailed += fail;
        fs.writeFileSync(
          marker,
          JSON.stringify({ issueId: issue.id, slice, brand, patchedAt: new Date().toISOString(), ok, fail, results }, null, 2)
        );
        log(`DONE ${issue.id} (${slice}/${brand}) -- ${ok} ok, ${fail} failed${fail ? " (see marker file for details)" : ""}`);
        progressed = true;
      }
    }

    if (!progressed && !anyReady && !anyInProgress) {
      log(`=== Sourcing + patching complete. Totals: ${totalPatched} patched, ${totalFailed} failed. Proceeding to commit/push/deploy. ===`);
      break;
    }

    if (!progressed) {
      await new Promise((r) => setTimeout(r, 120000));
    }
  }

  try {
    execSync("git add data/ _project/cms-patch-state/ _project/cms-patch-supervisor.log", { cwd: REPO });
    const status = execSync("git status --porcelain", { cwd: REPO, encoding: "utf8" });
    if (status.trim()) {
      const msg = `CMS patch phase: ${totalPatched} products patched to Sanity across headphones/audio-electronics/accessories\n\nAutomated sourcing + patch pipeline, ${totalFailed} failures (see _project/cms-patch-state/ for per-brand detail).\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`;
      fs.writeFileSync("/tmp/cms-patch-commit-msg.txt", msg);
      execSync('git commit -F /tmp/cms-patch-commit-msg.txt', { cwd: REPO });
      log("git commit created (includes any prior unpushed agent commits).");
    } else {
      log("Nothing new to commit at patch-phase end.");
    }
    execSync("git push origin main", { cwd: REPO, encoding: "utf8" });
    log("git push to origin/main complete.");
  } catch (err) {
    log(`GIT ERROR: ${err.message} -- stopping before deploy.`);
    return;
  }

  try {
    const out = execSync("npx --yes vercel deploy --prod --yes", { cwd: REPO, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    log(`vercel deploy output (tail):\n${out.slice(-3000)}`);
    log("=== PIPELINE COMPLETE: deployed to production. ===");
  } catch (err) {
    log(`VERCEL DEPLOY ERROR: ${err.message}\n${err.stdout || ""}\n${err.stderr || ""}`);
    log("=== PIPELINE STOPPED before successful prod deploy -- git push succeeded, deploy needs manual retry: npx vercel deploy --prod ===");
  }
}

mainLoop().catch((e) => log(`FATAL: ${e.stack}`));
