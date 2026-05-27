# Operational Rhythm Board Model: Experiment Results & Brutal Evaluation

## Experiment 1: Testing the Upstreamness Hypothesis

### Hypothesis
Changing `NODE_ENV` from `production` to `development` and adding `CHECKOUT_SEED_SECRET` will unblock the seed route, which will enable testing of the payment page runtime state.

### Prediction
After the change, `GET /checkout-seed?scenario=grand-total-zero&secret=dev-secret` will return HTTP 307 redirect to `/checkout/payment`.

### Falsification Condition
Any response other than 307 (e.g., 404, 403, 500) means the upstreamness scoring misidentified the blocker.

### Procedure
1. Edit `.env.local`: change `NODE_ENV=production` to `development`, add `CHECKOUT_SEED_SECRET=dev-secret`
2. Start dev server: `npm run dev`
3. Curl seed route: `curl -I "http://localhost:3001/checkout-seed?scenario=grand-total-zero&secret=dev-secret"`
4. Follow redirect with session cookie: `curl -b cookies.txt "http://localhost:3001/checkout/payment"`

### Results

**Step 3 — Seed Route:**
```
HTTP/1.1 307 Temporary Redirect
location: http://localhost:3001/checkout/payment
set-cookie: checkout_session=Fe26.2*1*c04fa181... [encrypted session cookie]
```
**Result: ✅ HYPOTHESIS CONFIRMED.** The seed route works. It set a session cookie and redirected to `/checkout/payment`.

**Step 4 — Payment Page Runtime:**
The payment page HTML contains a full Next.js error boundary stack trace. The page shell (layout, header, footer) renders, but the payment page content crashes with a server-side error.

**Result: 🔴 RUNTIME ERROR REVEALED.** The payment page does not render correctly. There is a runtime error in the Server Component.

### What This Proves

The Board State Model correctly identified that `NODE_ENV=production` was the upstream blocker preventing ALL checkout runtime testing. Fixing it unblocked the seed route. The payment page has a runtime error that was previously invisible because the seed route was dead.

---

## Brutal Evaluation: Does the Framework Actually Help?

### Criterion 1: Does it make Q&A / intelligence gathering easier?

**Verdict: ⚠️ PARTIALLY — with a major caveat**

**What worked:**
- The three-layer gate (compile → runtime → verify) forced me to check compilation FIRST, which saved time. Without it, I might have tried to run tests or fix lint first.
- The "board scan" concept (listing what you actually know) prevented assumption cascades.

**What didn't work:**
- The "scoring function" `(Upstreamness × Certainty Delta) / Risk` is **theoretical**. I didn't actually calculate scores for multiple moves and compare. I just looked at the board and intuitively knew `NODE_ENV` was the blocker. The math adds complexity without proven benefit.
- The color-coded board (GREEN/RED/YELLOW) is useful, but maintaining it in a file is overhead. In practice, you keep it in your head.

**Gap:** No evidence that the scoring function produces better decisions than developer intuition. Needs A/B testing against "just fix what feels wrong."

---

### Criterion 2: Does it make setting the next objective easier?

**Verdict: ✅ YES — but not because of the framework itself**

**What worked:**
- The "position after" concept is valuable. Asking "what becomes possible after this move?" is a genuine insight.
- In this case: "After fixing NODE_ENV, the seed route works → payment page becomes testable → I can see the first runtime error."

**What didn't work:**
- The objective was already obvious from `bd ready` (top issue: Stripe idempotency) and the docs (payment page is the critical path). The framework didn't 

 generate the objective — it just provided a way to think about dependencies.

**Red flag:** The framework is descriptive, not generative. It doesn't tell you WHAT to work on, only HOW to think about blockers. If you don't know the objective, the board is useless.

---

### Criterion 3: Does it make task decomposition easier?

**Verdict: ❌ NO — this is a gap**

The framework has NOTHING to say about task decomposition. It tells you:
- "Fix the first runtime error"
- But NOT: "What files to touch, what functions to change, what tests to write"

The Work Block Contract v3 was better at this ("fix the first error in the relevant file"). The Board Model needs to be PAIRED with a task decomposition method (like the framed objective docs or tasks-decomposition.md).

---

### Criterion 4: Does it make tracking completion easier?

**Verdict: ⚠️ PARTIALLY**

**What worked:**
- The three colors (GREEN/RED/YELLOW) create a simple state machine. You always know which gate you're at.
- "Commit after each GREEN square" creates rollback points.

**What didn't work:**
- Tracking the board in a file is overhead. In a 90-minute block, you don't want to maintain a markdown file.
- The "verification checklist" from v3 was more actionable: "[ ] Step 1 evidence exists, [ ] Step 2 evidence exists."

---

### Criterion 5: Does it make fixing objective flaws easier?

**Verdict: ❌ NO — not addressed**

The framework assumes the objective is correct. If the objective itself is wrong (e.g., "fix lint" when lint isn't blocking anything), the board will happily score "fix lint" as a candidate move. It has no mechanism for questioning whether the objective itself is valid.

This is a **breaking point**: the framework cannot catch upstream errors in objective selection.

---

### Criterion 6: Does it make minimal noise feedback easier?

**Verdict: ⚠️ PARTIALLY**

**What worked:**
- The "one error per block" rule (from v3, not the Board Model per se) prevents scope creep.
- The layer ordering prevents "test noise" from overwhelming you when compilation is broken.

**What didn't work:**
- The Board Model doesn't say HOW to get feedback. It says "verify runtime" but not "use browser screenshot" or "use curl" or "use test runner."
- The actual feedback mechanism (browser, curl, test) is project-specific and the framework is silent on it.

---

## First Principles Proof

### What IS proven

1. **Ordered dependency:** You cannot test runtime if compilation fails. This is a tautology (if the code doesn't compile, it can't run) but it's easy to forget in practice.
2. **Hidden blockers:** Environment variables can silently disable entire subsystems. The seed route being dead was a hidden blocker that no amount of code inspection would reveal.
3. **Upstream unblocking:** Fixing one root blocker can reveal multiple downstream issues. The framework correctly predicted that fixing `NODE_ENV` would make the payment page testable.

### What is NOT proven

1. **The scoring function:** `(Upstreamness × Certainty Delta) / Risk` has zero experimental validation. In this experiment, I didn't calculate it — I just intuitively picked the obvious move.
2. **Time savings:** No evidence that using the framework is faster than "just try things and see what breaks."
3. **Error reduction:** No evidence that the framework prevents more bugs than ad-hoc debugging.

---

## How the Framework Can Be Falsified

| Scenario | What It Would Prove |
|----------|---------------------|
| Fix the highest-scored move → nothing unblocks | The scoring function is wrong |
| Layer 1 passes but Layer 2 fails with a compilation error | The layer ordering is wrong |
| The board shows all GREEN but production is broken | The model misses production-specific state |
| Following the framework takes longer than ad-hoc debugging | The framework adds overhead without value |
| The framework causes developer to fix lint instead of runtime | The scoring function misranks moves |

**Current status:** Not falsified yet, but not strongly confirmed either. One experiment on one blocker is insufficient.

---

## Main Gaps, Red Flags, Breaking Points

### Gap 1: No Integration with Production Feedback

The framework is entirely local-dev focused. It has no concept of:
- Production logs (Vercel, Netlify)
- Error tracking (Sentry, LogRocket)
- User-reported bugs

**Production status is invisible to the board.** If the payment page works in dev but fails in production (e.g., Stripe publishable key mismatch), the board would show all GREEN locally.

### Gap 2: No Integration with AI-Assisted Development

The framework treats the developer as a solo actor. In Windsurf/Cascade:
- The AI can hallucinate files, APIs, and patterns
- The AI can generate code that compiles but has semantic errors
- The AI can confidently suggest wrong fixes

The board has no square for "AI reliability." It assumes the human is the only source of moves.

### Gap 3: Objective Selection Is Unverified

As noted above, the framework assumes the objective is correct. A wrong objective (e.g., "implement return page" when payment is broken) would produce a perfectly valid board that leads you astray.

### Red Flag 1: The Scoring Function Is Cargo Cult

`(Upstreamness × Certainty Delta) / Risk` looks scientific but is unvalidated. In the experiment, I didn't use it. I just knew `NODE_ENV` was the blocker. The formula adds complexity without proven benefit.

### Red Flag 2: Board Maintenance Overhead

Maintaining a markdown file with colored squares is work. In a 90-minute block, you'd rather spend time fixing code than updating a board. If the board lives only in your head, it's not a "model" — it's just intuition with fancy labels.

### Breaking Point: The Framework Collapses with Multiple Objectives

If you have two objectives (e.g., "fix payment page" AND "add shipping auto-select"), the board becomes a matrix. Which objective's squares take precedence? The framework has no answer.

---

## Overcomplications vs Signal

| Element | Verdict | Why |
|---------|---------|-----|
| Three-layer gate (compile → runtime → verify) | ✅ **SIGNAL** | Prevents assumption cascades; proven by experiment |
| Color-coded board (GREEN/RED/YELLOW) | ⚠️ **MIXED** | Useful mental model; file maintenance is noise |
| Scoring function | ❌ **NOISE** | Unvalidated; adds complexity; not used in practice |
| "Opposition pieces" metaphor | ❌ **NOISE** | Cute but doesn't change behavior |
| "Position after" concept | ✅ **SIGNAL** | Genuine insight about optionality |
| Move selection formula | ❌ **NOISE** | Not used in the experiment; intuition sufficed |
| Commit-after-GREEN rule | ✅ **SIGNAL** | Creates rollback points; standard good practice |

---

## What Actually Works (The Minimal Extract)

If I strip away the noise, here's what survived the experiment:

```
Before coding:
1. Does it compile? (npm run build)
2. What single thing is blocking runtime? (dev server + browser/curl)
3. Fix that one thing. Verify it. Commit.
```

That's it. The three-layer gate, the "position after" concept, and the commit rule are real. Everything else (colors, scoring, opposition) is decoration.

---

## The Honest Answer to Your Questions

**Does it make development easier in real-time practice?**

Partially. The core insight — "check compilation first, then runtime, then tests" — is genuinely useful. It saved me from fixing lint first. But the fancy scoring and color-coding are theoretical overhead.

**What is the experimental proof?**

One experiment on one blocker. The framework correctly identified `NODE_ENV` as the upstream blocker and the payment page runtime error as the next issue. But:
- The scoring function was NOT used (intuition picked the move)
- No control group (what would I have done without the framework?)
- One data point is not proof

**How can it be falsified?**

1. If the highest-scored move doesn't unblock anything → scoring is wrong
2. If following the framework takes longer than ad-hoc → framework is overhead
3. If the board shows GREEN but production is broken → missing production layer

**Main gaps:**
1. No production feedback integration
2. No AI-specific state (hallucination, wrong suggestions)
3. Objective selection is unverified
4. Scoring function is untested

**Main overcomplications:**
1. The scoring formula — intuition worked better
2. The opposition metaphor — doesn't change behavior
3. File-based board maintenance — overhead in real-time work

**Signal vs noise:**
- Signal: compile→runtime→verify ordering, position-after thinking, commit on GREEN
- Noise: colors, scoring, opposition, board files

---

## What to Do Next

1. **Keep the three-layer gate.** It's proven useful.
2. **Drop the scoring function.** Replace with: "Pick the move that unblocks the most downstream verification."
3. **Add a production layer.** Before coding, check: "Is this issue reproducible in production? Are there logs?"
4. **Add an AI-specific check.** "Did the AI suggest this move? Is it verified or assumed?"
5. **Integrate with existing tools.** Use `bd ready` for objective selection, `bd show` for context, not a separate board file.

The framework is not a silver bullet. It's a slightly better way to ask: "What do I actually know, and what's the simplest thing to verify next?"
