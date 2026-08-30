# Issue Risk Protocol

**Invoke with:** "run the risk protocol on `<issue>`", "risk-assess `<issue>`", or just
"risk protocol". Any of these means exactly this document.

**What it produces:** a two-part risk assessment **appended to the beads issue's NOTES**
(`bd update <id> --append-notes`) — never touching the description.

**When:** before any agent (this chat, CLI, cloud, or Devin) starts implementing a beads
issue. It is the pre-flight, not the build. The build method is
`_project/00-MOST-IMPORTANT-lean-tracer-bullet-methodology.md`; its step 5 "Lean Execution
Guard Rail" is the same rule as Part B below.

---

## Part A — Outcome risks (is the RESULT right?)

List 4–8 **key** risks for this specific issue, each with a one-line mitigation. Tailored,
not a generic dump. Draw from these categories:

1. **Scope creep / SRP violation** — the change does more than the issue's single
   responsibility, or bleeds into a sibling issue or a later layer.
   *Mitigate:* restate the issue's OUT OF SCOPE before starting; if a step needs something
   out of scope, stop and flag — don't cross.

2. **Layer / boundary crossing** — a piece reaches past its defined inputs (e.g. a
   URL-only control importing the product grid, data, counts, or streaming).
   *Mitigate:* name the allowed inputs; if it can't be built within them, the boundary is
   wrong — stop, don't work around it.

3. **Hallucination** — invented Tailwind tokens, class names, API signatures, file paths,
   or props that look plausible in the diff and are wrong at runtime.
   *Mitigate:* read the real config / source first; reuse verbatim from a real sibling;
   never guess a name.

4. **Mix-up / wrong reference** — wrong file, wrong commit, wrong archived copy, or a stale
   doc treated as authority (AI_LESSONS L10).
   *Mitigate:* verify the reference exists and is the one the issue names before building
   on it.

5. **False positive** — claiming something is verified or working when only the human's
   live check on :3000 can confirm it (visual parity, "feels instant", perceptible
   transition).
   *Mitigate:* state what was done and which sibling it mirrors; hand the verdict to the
   human — don't assert a pass.

6. **Professional-quality drop** — native-looking controls, janky transitions, full white
   reloads, broken in-between breakpoints, layout/height regressions (the `h-full` vs
   `aspect` ownership trap — CLAUDE.md review gate).
   *Mitigate:* run the mandatory height-sizing diff review; match the design system.

Append as `== A. OUTCOME RISKS ==` with `MITIGATE:` lines.

---

## Part B — Execution risks (is the PATH lean?)

**The lean path: edit source files only, then hand off to the human's dev server on
`localhost:3000`. Nothing else.**

Append the list below to the issue as `== B. EXECUTION RISKS ==`, adjusted only where the
issue genuinely needs an exception — and say so explicitly when it does.

**Hard NO — never run these to "verify" or as a reflex:**

- No `npm run build` / `next build`
- No `tsc`, `ts-check`, `npm run ts-check`, or any typecheck
- No `ts-node` / running TS scripts just to "check"
- No project-wide ESLint / Prettier / `npm run lint`
- No test runs (Vitest, Playwright) and no writing tests — unless the issue's deliverable
  *is* tests
- No agent-run dev server (`npm run dev`), no starting the app
- No browser automation, Lighthouse, or crawls for verification
- No `npm install` / new dependency — unless the issue explicitly calls for one
- No `git` — no branch, no commit, no push, no "which commit is this on" analysis beyond
  grabbing one named reference file; don't mention git in the report
- No subagents for routine research — read files inline
- No new docs, audits, or long written analysis — unless asked
- No reformatting or "improving" untouched code — minimal diff, new files where possible

**The live check is the human's.** Never ask the user to "verify manually" as if flagging a
gap — just hand off with a one-line summary of what changed.

**Escape hatch:** if one of these NOs genuinely blocks the task, stop and say so in one
plain-text line. Do not work around it, and do not open a blocking question widget.

---

## Output shape

Appended to the issue (`bd update <id> --append-notes`), never the description:

```
RISK ASSESSMENT (added <date>)

== A. OUTCOME RISKS ==
A1. <risk>. MITIGATE: <one line>.
...

== B. EXECUTION RISKS ==
Lean path = edit source only, hand off to the human on :3000.
B1. No build / tsc / lint / test.
... (the Hard NO list, issue-adjusted)

Expected footprint: <n new/changed files, which dirs>. No deps / config / tooling changes.
```

The **Expected footprint** line is the tripwire: if the executor is well past it, it's
over-building — stop.
