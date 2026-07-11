# Performance Regression Runbook

This runbook covers how to respond when Lighthouse CI, Vercel Speed Insights, or Sentry reports a performance regression. It only references tooling that is part of the project after Phases 1–5.

## Lighthouse CI assertion fails on a PR

1. **Identify the failure**
   - Check the failing PR check to see whether `lighthouserc.cjs` or `lighthouserc.mobile.cjs` produced the failure.
   - Note the exact audit name and the measured value versus the budget.

2. **Inspect the artifact**
   - Download the `.lighthouseci/` artifact from the GitHub Actions run.
   - Open the HTML report to see the full audit details, screenshots, and opportunities.

3. **Reproduce locally**
   ```bash
   npm run build
   npm install -g @lhci/cli
   lhci autorun --config=lighthouserc.cjs
   lhci autorun --config=lighthouserc.mobile.cjs
   ```
   Compare the local result with the CI result.

4. **Check field data**
   - Open the admin `/manager/performance` page to see if real users are also affected.
   - If only the lab test fails, the regression may be environment-specific or caused by a flaky third-party script.

5. **Bisect the change**
   - Use `git bisect` or manually check recent commits that touched assets, fonts, images, or bundle imports.
   - Re-run `lhci autorun` after each candidate commit.

6. **Common causes checklist**
   - New or unoptimized image/video asset.
   - Added render-blocking script or stylesheet.
   - Layout shift from dynamic content, ads, or late-loading images.
   - JavaScript bundle growth from a new dependency or unused code.
   - Third-party script (analytics, Sentry, Stripe, etc.) added or changed.
   - Custom image loader or Sanity URL parameters changed.

7. **Fix and verify**
   - Address the root cause, then re-run `lhci autorun` for both desktop and mobile configs.
   - Do not merge until the PR check is green.

## Vercel Speed Insights shows a field regression

1. **Open the Vercel dashboard** and navigate to the project's Speed Insights page.
2. **Filter by page and metric** (LCP, FCP, TTFB, CLS, INP) to find the regression.
3. **Correlate with deployments** to identify the release that introduced the change.
4. **Check the code**
   - Verify `app/components/analytics/WebVitals.tsx` is still collecting and sending metrics.
   - Confirm `NEXT_PUBLIC_DISABLE_WEB_VITALS` is not set to `true` in production.
   - Confirm `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE` is appropriate for the traffic volume.
5. **Run the local performance suite**
   ```bash
   npm run test:performance
   ```
   This will build and run the Playwright performance tests in `tests/e2e/performance/`.
6. **Fix the underlying issue** using the common causes checklist above.

## Sentry shows an error or performance regression

1. **Open the Sentry project** and filter by the suspect release.
2. **Check issues**
   - Look for new error events or spikes in existing issues.
   - Check performance transactions for increased duration or failure rate.
3. **Verify the integration**
   - Confirm `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` are in place.
   - Confirm `process.env.NEXT_PUBLIC_SENTRY_DSN` is set in production.
   - Note the `tracesSampleRate` is set to `0.1`, so only a subset of transactions is captured.
4. **Correlate with other signals**
   - Cross-reference Sentry spikes with Vercel Speed Insights and Lighthouse CI trends.
   - Use Sentry's distributed trace to find the slow transaction or error source.
5. **Fix and monitor**
   - Deploy the fix, then watch the Sentry issue/performance trend for the next release.

## General escalation

- If the regression is caused by an external dependency or environment change (e.g., a CDN issue, API latency spike), document it and set a remediation ticket.
- Do not relax a budget in `lighthouserc.cjs` or `lighthouserc.mobile.cjs` to make CI pass without fixing the root cause.
- If a regression cannot be reproduced locally, run the Playwright tests and compare the artifacts before escalating.
