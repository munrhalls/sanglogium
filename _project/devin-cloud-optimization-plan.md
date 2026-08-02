> **Addendum (v3, local-resource-risk check):** A concern was raised that DeepWiki indexing might consume local PC memory/resources and cause lag. Checked against Cognition's own docs and confirmed as a **false positive**: DeepWiki indexing is a server-side operation on Cognition's cloud infrastructure — the same cloud infra behind Devin cloud sessions. Submitting a public GitHub URL at deepwiki.com causes Cognition's servers to pull from GitHub and compute the wiki entirely remotely; no local git clone, no local indexing process, no local compute or storage. The only local footprint is a normal browser tab loading a webpage — the same "resource cost" as visiting any website. There is no local artifact to isolate into a separate folder, because nothing is written to the local disk by the indexing process itself. DVO-1 below is unchanged and remains the correct, minimal-risk path. Full reasoning in the reply to this addendum's originating request.

# Devin Cloud Optimization — Execution Plan (v2, friction-corrected)

Source: `research/devin-cloud-workflow-position.md`, corrected after a friction-scan that killed most of v1. See the correction note at the top of that file for what changed and why.

---

## What v1 got wrong

v1 made "enable Devin Review as a live check" the centerpiece, and to make that work it proposed adopting GitHub PR-based delivery instead of direct `git push`. That's the flaw: PR-gating isn't a one-time cost, it's a **recurring tax on every future Devin task** — branch, push, open PR, wait, merge — replacing a single `git push`. It directly contradicts this project's own established rule (`sang-logium-direct-access` skill: GitHub friction is listed under "Forbidden — Work destruction, resource drain, lag"). Optimizing for a free tool by adding a permanent process bottleneck is backwards — friction was the thing to protect, and v1 traded it away for a "free" line item.

Devin Review only operates on PRs/MRs — there's no way to point it at a plain branch or direct-push diff. So there's no version of "use Devin Review as a live check" that doesn't require the friction. Given friction is the actual priority, the tool is disqualified, not deferred.

## What "live check" already means here, correctly, at zero friction

Already established in this repo and unchanged by any of this: Devin's own **done signal** (screenshot, test output, recording — as specified per-task) reviewed directly by you, no GitHub, no PRs, no new infrastructure. This was correct before v1 and remains correct. Nothing to add here.

---

## Friction-Scan Table

| Step (v1) | Friction identified | Verdict |
|---|---|---|
| Adopt PR delivery for future Devin tasks | Recurring process tax on *every* future task, forever — not a one-time cost. Replaces one `git push` with branch+push+PR+wait+merge. Contradicts the project's own zero-friction/local-first rule. | **Cut.** |
| Verify GitHub App connection type | Existed only to support PR-gated review enrollment below. No independent value once that's cut. | **Cut** (orphaned dependency). |
| Self-enroll Devin Review, "On PR creation" | Requires PRs to exist at all — functionally dead without the cut step above. | **Cut.** |
| Verify $0 cost on first reviewed PR | Downstream of the enrollment step. Moot. | **Cut.** |
| Scale up to full auto-review | Downstream of the verification step. Moot. | **Cut.** |
| Trigger DeepWiki indexing | One-time action on an external website. No git change, no new process, no recurring cost, nothing to wait on afterward. | **Keep.** |
| Conditional `.devin/wiki.json` steering | A single file, committed through the existing normal direct-push flow already in use for everything else — introduces no new process. Only fires if a real, observed gap exists (not speculative). | **Keep, still conditional.** |

Net effect: five of seven v1 steps are cut because they all traced back to a single flawed premise. The two survivors were never dependent on that premise.

---

## Phases & Tasks — Exact Delegation (corrected, minimal)

**DVO-1 — Trigger DeepWiki indexing** *(Human, ~2 min, no dependency, no blocker)*

Visit `deepwiki.com/munrhalls/sang-logium` and submit/confirm indexing (public repo, no login needed). One click, one page load, done — no waiting on anything else, no follow-up step required.

Done signal: the wiki page shows generated content instead of "Loading... Index your code with Devin."

---

**DVO-2 — CONDITIONAL: steer DeepWiki coverage** *(Claude, direct file write, ~5 min — only if DVO-1's result visibly skips important folders)*

Not delegated to Devin cloud — it's one small JSON file, written directly with Claude's existing repo access, committed via the normal `git push` flow already in use. No PR, no new process, no build step.

Done signal: `.devin/wiki.json` added with `repo_notes` covering the gap; wiki regenerated.

---

That's the entire plan for the DeepWiki thread. No Devin cloud agent execution phase, no GitHub process change, no blocking wait states, nothing that touches the existing `git push` flow.

---

> **v4 is retracted.** I didn't have visibility into branch-protection/Vercel gating behavior from static file reads — the person operating the repo does, and confirmed CI in the push path actually blocks smooth deploys/live-checks in practice, which directly conflicts with the higher priority here: a tight, direct, immediate push→live-check feedback loop, especially pre-launch (sang-logium isn't shown to employers yet, so iteration speed beats deploy-gate safety right now). Nothing from v4 should be built. See v5 for the corrected, concrete deliverable.

## v4 — Verification/audit thread (RETRACTED, kept for record)

Re-examined whether Devin cloud has a legitimate role in "professional audits" of the codebase. Verdict: **not for judgment-based review** (architecture/security reasoning — that stays with Claude, already free, already has the `sang-logium-review` skill built for it) — **but yes for objective, mechanical verification** (build/lint/typecheck/test), because that category is explicitly forbidden to run locally in this Cowork sandbox (`sang-logium-direct-access` skill: "MOST EXPENSIVE: npm run build, linting, typescript checks") and is exactly what Devin cloud sessions are built to run.

**Existing state, verified, not assumed:** `.github/workflows/lighthouse-ci.yml` already runs `npm run build` + Lighthouse (desktop+mobile) on every push to `main`/`develop`, free (GitHub Actions is free/unlimited-minutes for public repos), push-triggered — **no PR required**, so none of the friction that killed the Devin Review idea applies here. `playwright.yml` (E2E) and `daily-rebuild.yml` exist but are **fully commented out/disabled**. `package.json` has real, working scripts for everything needed: `lint` (eslint), `ts-check` (tsc --noEmit), `test:ci` (vitest run --coverage) — none of these run in CI today.

**Phase V-1 — Ask, don't investigate** *(Human, ~30 sec, no dependency)*: why is `playwright.yml` disabled? A `git log`/`git blame` check on that file timed out in this sandbox (git itself is slow here), so the fast path is just asking the person who turned it off, before spending anything to reverse-engineer it.

**Phase V-2 — Add lint/typecheck/unit-test to CI** *(Devin cloud, bounded, no dependency on V-1)*: new sibling workflow file (don't touch the already-working `lighthouse-ci.yml`), triggered on push to `main` exactly like Lighthouse already is. Steps: run `npm run lint`, `npm run ts-check`, `npm run test:ci`; report only, no code fixes in this task. Do not touch `lighthouse-ci.yml`, app code, or Playwright enablement. Done signal: a completed (pass-or-fail, just *completed*) GitHub Actions run link. Good candidate for the free SWE-1.7 model (window closes Aug 8, 2026).

**Phase V-3 — Re-enable Playwright E2E in CI** *(Devin cloud, conditional on V-1's answer being "safe to re-enable," likely on a lighter trigger than every push given suite size)*: deferred, not committed to yet.

**Habit, not a task:** when starting future Devin cloud sessions, use the "Ask Devin" search/explore entry point in the Devin webapp rather than a blank session — per Cognition's own docs this carries DeepWiki-grounded context into the session, free, no setup. (Confirmed for that specific launch path; not confirmed to happen automatically for every autonomous session otherwise — stated at that confidence level deliberately.)

---

## v5 — The real Devin Cloud deliverable: audit-and-maintain the `bd` tracker (one bounded trial, not a standing system yet)

Corrected core deliverable, entirely decoupled from push/deploy/CI: Devin Cloud reads the codebase, thematically organizes and prioritizes findings, and **writes them into the live `bd` tracker** — not a report file that sits unread, the actual system the person already works from (`bd ready`, `bd show`).

**Why Devin Cloud specifically, not Claude (concrete, not cost-based):** this Cowork sandbox does not have the `bd` binary installed — confirmed (`bash: bd: command not found`) — so Claude here can read `.beads/issues.jsonl` (a passive export) but cannot properly *write* new tracked issues into the live Dolt-backed tracker; that requires the `bd` CLI. Devin Cloud's own sandbox clones the repo fresh and can install `bd` (documented, one command, already referenced in the prior beads-cleanup task) and run real `bd create`/`bd update`/`bd dolt push` commands. This is a genuine tool-access gap, not a preference — the first honest reason in this whole thread that Devin Cloud, not Claude, is the right executor for an audit-type deliverable.

**Scope discipline (per "don't take on too much at once"):** one bounded trial, not a recurring system commitment yet. Prove output quality and that the `bd`-write mechanics work cleanly before deciding whether this becomes a standing cadence.

**DV-1 — Trial audit-and-file session** *(Devin Cloud, single bounded session)*

Scope: `bd doctor` / install `bd` if missing → re-verify the 7 currently-open issues (Return page, Basket page, Cookie consent, Newest Release scale-down, Filters/Sorting, Logging, Payment) against current code state using the same method as the prior cleanup audit (grep + file-mtime diffing, not guesswork) → scan **one bounded, high-value area only** — checkout + payment + auth (security/money-sensitive, and the `sang-logium-review` skill already defines concrete violation criteria there, e.g. missing checkout session guards) — for genuinely new, evidence-backed issues (file:line citations required, no vague "could be improved" noise) → thematically group and priority-order findings → file them into `bd` (create/update with evidence + priority) → `bd dolt push` + commit/push `.beads/issues.jsonl` (same sync mechanism every bd change already uses — not new process).

Do not touch: app code, CI workflows, anything outside checkout/payment/auth for new-issue scanning.

Done signal: a `bd ready`/`bd show` output the person can read directly, showing what was created/updated, each with evidence.

Note: this does involve one `git push` (the existing, already-accepted bd sync mechanism, same as the prior cleanup task). ~~Will incidentally trigger `lighthouse-ci.yml`~~ — **fixed**: `lighthouse-ci.yml` now has `paths-ignore: ['.beads/**']` on both `push` and `pull_request` triggers, so a bd-only push (this task, and any future one) no longer fires it. Small, surgical, single-file fix — doesn't touch the check itself for real app-code changes, just stops it firing on tracker-only commits.

**After DV-1:** the person reviews real output quality before any decision to make this recurring. No standing cadence proposed yet.

---

## v6 — Acceptance tests for DV-1 (prepared before launch, run after)

Nothing in this thread has actually been run through Devin yet. Four small, single-purpose, pass/fail checks — each verifies one distinct core premise this whole investigation has been built on, not vibes. Run all four once DV-1 completes; no new Devin tasks required, these are human/Claude checks against real output.

| # | Premise being tested | Check (simple, minutes not hours) | Fail means |
|---|---|---|---|
| **T1 — Capability** | Devin Cloud can actually write real entries into the live `bd` tracker (the whole reason it was chosen over Claude) | `bd show <id>` on each new/updated issue ID from DV-1's done signal — do real, correctly-fielded issues exist? | The core tool-access premise is false. Don't scale this pattern up; fall back to Claude-drafts/human-files. |
| **T2 — No CI leakage** | Today's `paths-ignore` fix actually works, and the bd-sync push doesn't touch the push/deploy loop | Check the GitHub Actions tab after DV-1's push — did `lighthouse-ci.yml` **not** run for that commit? | The fix didn't work or DV-1's push touched more than `.beads/`. Re-check what got pushed before repeating. |
| **T3 — Real evidence, not noise** | Findings are evidence-backed and sanely organized, not vague or hallucinated (whether DV-1 filed new issues or just re-verified the existing 7) | Pick 2 filed/updated issues at random, open the cited file:line directly — does it actually say what's claimed? Are theme/priority labels non-absurd on a quick look? | Output is decorative, not substantive. The audit idea itself is illusory value — don't repeat regardless of cost. |
| **T4 — Bounded cost** | A single-area trial audit is cheap, not a runaway spend | Check Session Insights for DV-1's session — is consumption a small, bounded slice of weekly quota, matching a one-area/7-issue-recheck scope? | Cost doesn't match scope. Either the task was under-scoped in this plan, or per-session cost is higher than assumed — revisit sizing before any recurring cadence. |

If all four pass: the pattern is real, worth considering as a recurring (not per-push) cadence. If any fail: that specific premise is what needs fixing before trying again — not a reason to abandon the others.

## One-Paragraph Summary (for your verification)

The corrected plan is one two-minute click: visit DeepWiki and trigger indexing for sang-logium, which is free, permanent, and touches nothing about how you build or ship code. There's a second step only if that indexed wiki turns out to skip something important, in which case I write one small config file the normal way you already commit everything — no PR, no new process. Everything else from the last version (PR-based delivery, Devin Review enrollment, the consumption-cost verification, scaling to full auto-review) is cut outright, not postponed, because it all depended on replacing your direct `git push` with a GitHub PR cycle, which is exactly the recurring friction you don't want. Nothing here changes your workflow, adds a wait state, or touches Devin's cloud agent at all.
