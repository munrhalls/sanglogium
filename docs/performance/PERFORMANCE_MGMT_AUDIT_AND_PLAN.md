# Performance Management: Verified Gaps + Execution Plan for Devin

sang-logium · 2026-07-11

## 1. Audit verdict

I checked every claim in the SWE 1.7 audit against the actual code (not docs, not intentions). **The audit is accurate.** Every specific file reference and behavioral claim checked out. Four points need sharper framing than the audit gave them:

| Audit claim | Verdict | Correction |
|---|---|---|
| "No performance budgets or CI gates" | Overstated | `lighthouserc.cjs` already has resource budgets (`total-byte-weight`, `unused-javascript`, `uses-long-cache-ttl`, `uses-responsive-images`). They're real, just set to `warn` not `error`, so they don't fail CI. The gap is enforcement, not existence. |
| "Does not assert INP directly, uses TBT as proxy" | Misleading as a "gap" | Lighthouse is a lab tool; INP is fundamentally a field/interaction metric CrUX and RUM measure, not something a lab run can produce without synthetic interaction scripting. TBT-as-lab-proxy + `onINP()` in the RUM collector *is* the standard two-pronged approach. This stops being a problem the moment RUM data is actually persisted (it already isn't a problem on the lab side). |
| "tests/e2e/performance/ is empty" | Understated | The directory doesn't exist at all — `find`/glob returned zero results. Same practical conclusion (no performance test automation runs), just worth being precise. |
| "No historical trending" | Slightly overstated | `lighthouse-ci.yml` does upload `.lighthouseci/` as a GitHub Actions artifact on every run, so *some* history exists (default 90-day retention). There's no trend *view* over it, which is the real gap — the admin page renders only the latest committed run. |

One finding the audit didn't call out explicitly but matters most for "sellable": **README.md line 33 lists Sentry as wired infrastructure** ("Sentry (error monitoring)"). It isn't — `@sentry/react` is a dependency with zero `Sentry.init`, zero `instrumentation.ts`, zero config files anywhere in the repo. That's not a missing feature, it's a documentation claim that doesn't match the code. If anyone evaluating this project checks, that's the first thing that erodes trust.

## 2. What's actually required — and what isn't

The audit was written as if this must become an enterprise observability stack. That's the wrong bar. The actual bar: **would a technical reviewer evaluating this as a hire/client signal see real, working, professional practice — not a checklist of enterprise tool names.** Judged against that bar:

**Required (closes a real credibility or functional gap, cheap to do right):**

1. Persist RUM somewhere that survives serverless cold starts and shows percentiles. → Vercel Speed Insights (project is already deployed on Vercel — `vercel.json` confirms it). Near-zero config, and it's the option an interviewer would actually expect for a Vercel-hosted Next.js app.
2. Wire the Sentry dependency that's already claimed in the README, or remove the claim. Wiring it is barely more work than removing it, and it's the more valuable signal.
3. Add `web-vitals/attribution` so CWV data says *which* element/interaction caused a regression, not just the number.
4. Load GA4 site-wide (currently only loads in the checkout layout), so the RUM collector and purchase events actually reach it as the code already assumes.
5. Turn the unused Playwright performance template into real tests that run against a production build, with an npm script. Right now the docs describe a capability that doesn't exist in code — same credibility problem as the Sentry line.
6. Add a mobile Lighthouse pass. Ecommerce traffic skews mobile; a desktop-only lab suite is a real, not cosmetic, gap.
7. Promote the two budgets that matter (bundle weight, unused JS) from `warn` to `error` so they actually gate CI. This is a one-line config change, not new infrastructure.
8. Fix the redundant double-build in `lighthouserc.cjs` (`npm run build && npm run start` when CI already built). Small, but it's a real bug wasting CI time.
9. Write down the budget as a short SLA doc and a one-page regression runbook. This is the cheapest, highest-leverage item on the list for "looks professional" — it's what turns scattered thresholds into a documented practice.
10. Document the two env vars (`NEXT_PUBLIC_DISABLE_WEB_VITALS`, `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE`) that the code already reads but `.env.example` never mentions.

**Explicitly not required — skipping these on purpose, not by oversight:**

- **Self-hosted LHCI server + SQL trend dashboard.** Needs its own hosting and DB for a project with no real traffic. The GitHub Actions artifact history plus a simple committed JSON trend (folded into the existing admin page) gets 90% of the value for near-zero infrastructure.
- **CrUX / PageSpeed Insights API field-data integration.** CrUX only reports for origins with sufficient real-world Chrome traffic (a 28-day rolling threshold). A portfolio site won't clear that bar, so this would return empty data — not a demonstrable feature, just a dead integration.
- **PagerDuty/on-call alerting.** A GitHub PR comment on Lighthouse assertion failure plus the runbook doc covers the "we have a regression process" signal without standing up an alerting product for a project with no on-call rotation.
- **Datadog or a second APM.** Sentry (tracing + errors) plus Vercel Speed Insights (field RUM) plus GA4 (business-metric correlation) already covers the three legs professional practice needs. A second APM is redundant, not more professional.

## 3. Model choice for Devin execution

Recommendation: **SWE-1.7** (not Kimi K2.7, not GLM-5.2), and it's currently free in Devin as a preview through Aug 8, 2026.

Reasoning: SWE-1.7 is RL post-trained specifically inside Devin's own agentic harness — the tool-use/plan/execute loop these tasks will actually run through — on top of Kimi K2.7 Code as a base. On FrontierCode 1.1 it currently scores 42.3% vs Kimi K2.7 Code's 30.1%. GLM-5.2 posts a stronger raw open-weights benchmark number, largely on the strength of its 1M-token context window, but that's a different optimization target (long-context, self-hosted control) than short, well-scoped agentic edits inside an IDE harness — which is exactly what the task list below is. For chunked, low-ambiguity tasks like these, harness-native RL tuning matters more than raw context length.

Source: [Cognition SWE-1.7: Devin Coding Model Near Frontier Benchmarks at Lower Cost](https://mer.vin/2026/07/cognition-swe-1-7-devin-coding-model-near-frontier-benchmarks-at-lower-cost/), [SWE-1.7: Cognition Devin Model at 1000 TPS](https://www.explainx.ai/blog/swe-1-7-cognition-devin-frontier-code-july-2026), [GLM 5.2 vs Kimi K2.7 Code](https://regolo.ai/glm-5-2-vs-kimi-k2-7-code-the-definitive-guide-for-coding/)

## 4. Devin task chunks

Each task is scoped to 1–3 files with an explicit acceptance check, so a free-tier model has no room to wander into unrelated parts of the codebase. Feed these to Devin **one at a time, in order** — don't paste the whole plan into one session.

### Phase 1 — RUM pipeline (no dependencies, do first)

**Task 1.1 — Vercel Speed Insights**
Install `@vercel/speed-insights`. Import `SpeedInsights` from `@vercel/speed-insights/next` and render it once in `app/(store)/layout.tsx` inside the `<body>` (next to where `WebVitals` is already mounted) and once in `app/checkout/layout.tsx`.
Acceptance: `npm run build` succeeds; `<SpeedInsights />` appears in both layout files; no changes to any other file.

**Task 1.2 — web-vitals attribution build**
In `app/components/analytics/WebVitals.tsx`, change the import from `"web-vitals"` to `"web-vitals/attribution"` (`onCLS`, `onINP`, `onLCP` etc. keep the same names in that entry point). In `sendToAnalytics`, add `attribution: metric.attribution` to the JSON payload sent to `/api/analytics/vitals`.
Acceptance: import path changed, payload includes `attribution`, `npm run build` succeeds, no other file touched.

**Task 1.3 — Document RUM env vars**
In `.env.example`, add these two lines near the existing `NEXT_PUBLIC_GA_MEASUREMENT_ID` line, each with a one-line comment: `NEXT_PUBLIC_DISABLE_WEB_VITALS` (set to `true` to disable RUM collection) and `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE` (0–1, defaults to 1 if unset).
Acceptance: only `.env.example` changes.

### Phase 2 — GA4 site-wide (depends on nothing, can run parallel to Phase 1)

**Task 2.1 — Shared GA4 loader**
Extract the two `<Script>` tags currently inline in `app/checkout/layout.tsx` (lines 20–30) into a new client component `app/components/analytics/GoogleAnalytics.tsx` that takes no props and reads `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` itself. Replace the inline block in `app/checkout/layout.tsx` with `<GoogleAnalytics />`. Add `<GoogleAnalytics />` to `app/(store)/layout.tsx` as well, inside `<body>`.
Acceptance: GA4 loads in both layouts via the same component; `npm run build` succeeds; no other analytics behavior changed.

**Task 2.2 — Push CWV to GA4**
In `app/components/analytics/WebVitals.tsx`, in `sendToAnalytics`, after the existing beacon call, add a guarded call: if `window.gtag` exists, call `gtag('event', 'web_vitals', { metric_name: name, value: metric.value, metric_rating: metric.rating })`. Must not throw if `gtag` is absent.
Acceptance: existing beacon behavior unchanged; GA4 event only fires when `gtag` exists.

### Phase 3 — Sentry (depends on nothing, do after Phase 1/2 or parallel)

**Task 3.1 — Sentry wizard install**
Run `npx @sentry/wizard@latest -i nextjs` (or if that requires interactive login unavailable in this environment, manually add `@sentry/nextjs` as a dependency and create `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` following the current Sentry Next.js docs, wrapping `next.config.ts`'s export with `withSentryConfig`). Enable error monitoring and tracing only — skip session replay for now. Set a conservative `tracesSampleRate` (0.1–0.2).
Acceptance: `npm run build` succeeds; the four Sentry init files exist; `next.config.ts` is wrapped with `withSentryConfig`; `@sentry/react` (the old unused dependency) is removed from `package.json` in favor of `@sentry/nextjs`.

**Task 3.2 — README accuracy**
No code change. Confirm README.md's "Sentry (error monitoring)" line in the Infrastructure section is now accurate given Task 3.1, and add "Vercel Speed Insights" to that same line.
Acceptance: one line in README.md updated.

### Phase 4 — Playwright performance tests (depends on nothing)

**Task 4.1 — Real performance specs**
Create `tests/e2e/performance/` with three spec files (`home.spec.ts`, `product.spec.ts`, `category.spec.ts`), each adapting the pattern already documented in `docs/performance/PERFORMANCE_TEST_FLOW.md` and `docs/performance/PERFORMANCE_TEST_TEMPLATE.ts`. Each spec navigates to its page, waits for `networkidle`, reads LCP/FCP/TTFB/CLS via `PerformanceObserver` in `page.evaluate`, and asserts against the same thresholds already defined in `lighthouserc.cjs` (LCP < 3000ms, FCP < 2000ms, TTFB < 600ms, CLS < 0.1).
Acceptance: three spec files exist under `tests/e2e/performance/`, each with real assertions (not `test.skip`), following the existing template's structure.

**Task 4.2 — Production-build config + script**
Create `playwright.performance.config.ts` (copy `playwright.config.ts` as a base) with `testDir: './tests/e2e/performance'` and `webServer.command` set to `'npm run build && npm run start'` instead of `npm run dev`. In `package.json`, add `"test:performance": "npx playwright test --config=playwright.performance.config.ts"`.
Acceptance: new config file exists; `npm run test:performance` is a valid script; existing `playwright.config.ts` is untouched.

### Phase 5 — Lighthouse CI hardening (do after Phase 4, references the same thresholds)

**Task 5.1 — Fix redundant build**
In `lighthouserc.cjs`, change `startServerCommand: 'npm run build && npm run start'` to `startServerCommand: 'npm run start'`.
Acceptance: one-line change, nothing else in the file touched.

**Task 5.2 — Mobile config**
Create `lighthouserc.mobile.cjs` as a copy of `lighthouserc.cjs` with `settings.preset` and `settings.formFactor` changed to `'mobile'`, and `screenEmulation.mobile` set to `true` with mobile width/height (e.g. 360×640). Keep the same assert thresholds. In `.github/workflows/lighthouse-ci.yml`, add a second step (or a matrix) that also runs `lhci autorun --config=lighthouserc.mobile.cjs`.
Acceptance: new mobile config file exists; CI workflow runs both desktop and mobile configs; existing desktop config unchanged.

**Task 5.3 — Enforce budgets**
In `lighthouserc.cjs` (and the new mobile config from 5.2), change `'total-byte-weight'` and `'unused-javascript'` assertion levels from `'warn'` to `'error'`.
Acceptance: exactly those two assertion levels changed, in both config files.

### Phase 6 — Documentation (do last, references the finished state of Phases 1–5)

**Task 6.1 — Performance budget doc**
Create `docs/performance/PERFORMANCE_BUDGET.md` listing every threshold currently enforced in `lighthouserc.cjs`/`lighthouserc.mobile.cjs` as a table (metric, budget, level, rationale), plus one paragraph stating these are the project's performance SLA.
Acceptance: new doc file, values match the actual config files exactly (no invented numbers).

**Task 6.2 — Regression runbook**
Create `docs/performance/RUNBOOK.md`: what to do when a Lighthouse CI assertion fails on a PR (bisect via the uploaded `.lighthouseci/` artifact, check the admin `/manager/performance` page, common causes checklist), and what to do when Vercel Speed Insights or Sentry shows a field regression.
Acceptance: new doc file, references only tooling that exists after Phases 1–5.

## 5. Final alignment check

- Every "required" item traces to a claim I personally verified against the current code (Section 1), not the audit's wording — so the task list fixes real things, not audit artifacts.
- Every task in Section 4 touches a named, already-verified file or a clearly-scoped new file — no task asks Devin to "figure out the architecture" or make an undocumented judgment call.
- Nothing in Section 4 builds toward an item explicitly excluded in Section 2 (no LHCI server, no CrUX integration, no on-call product, no second APM) — so there's no scope creep between the requirements analysis and the execution plan.
- Tasks are ordered so each phase is independently buildable and testable (`npm run build` / `npm run test:performance` / CI green) before the next phase depends on it — Phase 5 needs Phase 4's thresholds to exist as a reference point, Phase 6 needs Phases 1–5 finished so the docs don't describe vaporware, everything else is parallelizable.
- Total surface: 6 phases, 14 tasks, each 1–3 files. That's the chunk size a free-tier harness-tuned model can execute without losing context mid-task.
