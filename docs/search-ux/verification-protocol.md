# Search UX — Verification Protocol (real-app-only credibility rule)

Applies to `sang-logium-d5m` EPIC Search UX and all children. Referenced, not repeated,
in each child issue.

## Credibility rule (non-negotiable)

- The ONLY credible source of UX intel about a running app — sanglogium itself, or a
  competitor retailer's live search — is real interaction with that live app: actually
  typing a query and observing what actually happens.
- Source code (sanglogium's own) is a legitimate SECONDARY cross-check for *why*
  something behaves a certain way. It is never a substitute for observing the actual
  behavior first.
- Marketing copy, About/FAQ pages, or "the code suggests it would…" are NOT credible
  intel. Never cite them as evidence of actual behavior.
- Baymard / NN/g research is the one exception — they ARE the credible source for
  industry-standard *expectations*, not for what sanglogium or a specific retailer's
  search actually does today.
- No finding goes into a deliverable unless it's backed by an exact query -> exact
  observed result (DOM/text excerpt), not a paraphrased confidence claim.

## Lean Playwright method (cheap, no waste)

1. One browser session per batch, not per query. Script the full query list up front,
   run it in one session.
2. Read results via DOM text / accessibility snapshot — never screenshot by default.
   Screenshot ONLY when the question is inherently visual (layout, overlap, spacing,
   breakpoint behavior).
3. No dev-server builds, no lint/test runs, no fresh deploys. Interact with whatever's
   already running — sanglogium's local dev server at `localhost:3000`, or the
   competitor's live production site.
4. Batch breakpoints too: set viewport size per breakpoint (mobile/tablet/desktop)
   within the same script/session rather than three separate runs, where practical.

## Zero-waste execution discipline

- No redundant re-runs of a query already tested.
- No re-verifying a competitor's site behavior more than once unless the first result
  looked wrong.
- No exploratory wandering — script the query list up front, run it, done.
- No self-verification build/lint/test commands, ever (repo-wide hard limit).
