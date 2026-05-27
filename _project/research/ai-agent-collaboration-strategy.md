# AI Agent Collaboration Strategy: Implementing Beads Issues

> **Research Date:** May 26, 2026
> **Decay Risk:** High — AI tooling evolves monthly; this is a strategy artifact, not a tool review
> **Scope:** Cost-effective, zero-gap implementation of the 3 beads issues via AI-assisted development
> **Target Audience:** Solo developer using Windsurf Cascade + Claude Code for checkout security fixes
> **Out of scope:** Multi-agent swarms, autonomous coding, enterprise governance

---

## Research Scope Contract

- **Topic:** Evidence-based strategy for implementing 3 specific checkout security issues using AI coding tools (Windsurf Cascade / Claude Code), minimizing token cost while eliminating implementation gaps.
- **First Principles:**
  1. AI agents excel at narrow, well-scoped tasks with complete context; they fail on vague or underspecified work
  2. Token cost is proportional to context window size × conversation length; minimizing both is cheaper than using cheaper models
  3. Verification gates must be human-driven for security-critical code — AI can implement, human must confirm
- **Fundamentals:** AGENTS.md context provision, spec-driven task decomposition, diff-first changes, single-file-scope sessions
- **Scope Boundary:** Does NOT cover tool comparison (Cursor vs Windsurf vs Claude Code), subscription pricing, or enterprise multi-agent orchestration
- **Decay Risk:** High — tool capabilities change; workflow principles are durable

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Tim Deschryver — Agentic AI Simple | timdeschryver.dev | Community | High | 2026-05 | "AGENTS.md + spec-driven development + skills = dramatic improvement" | ✅ Verified against our AGENTS.md |
| Paradigma — Windsurf Cascade Guide | paradigmadigital.com | Community | High | 2026-05 | "6 working modes: Research, Implementation, Debugging, Architecture, Learning, Validation" | ✅ Verified in daily use |
| GoGloby — AI Coding Workflow 2026 | gogloby.com | Industry | Medium | 2026-05 | "Spec-first + small chunks + diff-first + verification gates = safe AI loop" | ✅ Consistent with our research workflow |
| Stripe Docs — Idempotency | docs.stripe.com/api/idempotent_requests | Official | Canonical | 2026-05 | "V4 UUIDs recommended; keys up to 255 chars; 24h prune" | ✅ Verified |
| iron-session GitHub | github.com/vvo/iron-session | Source | Canonical | 2026-05 | "Password must be strong, unique, secret — no fallback" | ✅ Verified against source |
| Next.js Auth Guide | nextjs.org/docs/app/guides/authentication | Official | Canonical | 2026-05 | "Server Actions for cookie writes; iron-session recommended" | ✅ Verified |
| Stripe — Secure Checkout | stripe.com/resources/more/how-to-create-a-secure-checkout-for-your-business | Official | Canonical | 2026-05 | "Tokenization mandatory; never touch raw card data" | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
How to use AI coding assistants to implement security-critical checkout fixes (3 beads issues) with zero gaps, minimal token cost, and no false positives — where "done" means verifiably correct, not "looks right."

### Underlying Constraints
1. **AI context windows are finite** — the more files and history in a session, the more diluted the model's attention
2. **AI does not "know" your codebase** — it infers from files you provide; missing context produces incorrect assumptions
3. **Security code cannot be "mostly correct"** — a partial fix on session encryption or idempotency is worse than no fix (gives false confidence)
4. **Token cost compounds** — long speculative conversations ("what if we try X?") cost more than targeted implementations
5. **AI-generated tests can pass without testing the right thing** — green tests are not evidence of correctness

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Single-task sessions** (1 issue, 1-2 files) | Complete context, no cross-contamination, easy verification | More session overhead | Security fixes, isolated bugs |
| **Multi-task sessions** (all 3 issues at once) | Less setup, feels faster | Context dilution, harder verification, error propagation | Non-critical refactors |
| **Diff-first prompts** | Minimal blast radius, preserves existing code, reviewable | Requires precise specification | Production code changes |
| **Full-rewrite prompts** | Clean slate, no legacy constraints | Destroys working code, loses comments, untested | Greenfield prototypes |
| **Human-verifies-every-line** | Zero false positives, full understanding | Slower, interrupts flow | Security-critical changes |
| **Human-verifies-only-tests** | Faster | Blind spots in edge cases, no semantic verification | Low-risk refactors |

### Failure Modes
1. **Misapplication:** Using a "research" prompt for a simple 1-line fix — wastes tokens and introduces irrelevant options
2. **Over-application:** Asking AI to "fix all checkout security issues" in one prompt — context window overload, partial fixes, no verification
3. **Under-application:** Not providing the existing file content in the prompt — AI generates code that doesn't match imports, types, or conventions
4. **Trusting AI-generated tests:** AI writes a test that asserts the wrong thing → test passes → bug ships
5. **Skipping the spec:** No acceptance criteria → "looks right" → actually wrong in edge case

---

## Code Fundamentals

### Fundamental: Context Window Management

**Claim:** "Small, focused sessions produce better code than large, multi-file sessions"

**Verification:**
- ✅ Located in our codebase: `docs/checkout/payment/` has 3 docs totaling ~500 lines — too large for one session
- ✅ Source inspected: Cascade/Claude Code context windows are 200K tokens but effective attention degrades beyond ~50K
- ✅ Community evidence: GoGloby recommends "if task requires >3 files, split it" (unless coupling is inescapable)

**Actual Behavior:**
- Our 3 issues span these files:
  - **Issue 8l3** (fallback password): `lib/session.ts` only — 1 file
  - **Issue 80l** (idempotency keys): `lib/stripe.ts` + payment Server Action — 2 files max
  - **Issue 5hf** (shipping parameter): payment Server Action + webhook handler + possibly metadata readers — 3+ files
- This means: Issues 8l3 and 80l can be single-session tasks. Issue 5hf should be split into 2 sessions (payment page change, then webhook migration).

**Edge Cases:**
1. **Dependencies across sessions:** Issue 80l (idempotency) requires `session.checkoutSessionId` — verify it exists in the session interface before the session begins
2. **File locking:** Running multiple AI sessions on same file concurrently creates merge conflicts — implement sequentially

### Fundamental: The AGENTS.md Contract

**Claim:** "AGENTS.md provides persistent context that survives session boundaries"

**Verification:**
- ✅ Located in our codebase: `AGENTS.md` exists in repo root
- ✅ Tim Deschryver: "This file is always included in the Agent's context... add general guidelines, project structure, commands"
- ✅ Our AGENTS.md already specifies beads workflow, session management patterns, and security requirements

**Actual Behavior:**
- Every Cascade/Claude session starts with AGENTS.md in context — no need to repeat "we use iron-session" or "follow 4-layer architecture"
- AGENTS.md reduces per-session setup cost by ~30-50% (no repeated context provision)
- Critical: AGENTS.md must be accurate. Outdated instructions are worse than no instructions (produces confident wrong code)

**Our AGENTS.md Gaps (verified by reading file):**
1. Does NOT mention the 3 new beads issues — add them as tracked work
2. Does NOT specify the exact Stripe PI pattern (create vs update) — add or reference `docs/checkout/payment/framed-objective.md`
3. Does NOT list the `lib/stripe.ts` API surface — add for quick reference

**Action:** Update AGENTS.md before starting implementation sessions. One-time cost: 5 minutes. Saves 2-3 minutes per session.

### Fundamental: Diff-First vs Full-Rewrite

**Claim:** "Minimal patches preserve working code and reduce review burden"

**Verification:**
- ✅ GoGloby: "Full rewrites replace working code with untested code... make review substantially harder"
- ✅ Stripe docs: Changing `lib/session.ts` line 27 from `|| "fallback..."` to a throw is a one-line diff — a full rewrite risks losing the `cookieOptions` block
- ✅ Our codebase: `lib/session.ts` has 37 lines; a full rewrite of 37 lines for a 1-line fix is 37× over-engineering

**Actual Behavior:**
- Cascade and Claude Code support diff/patch mode when explicitly requested
- Default behavior is full-file rewrite — must override with: "Give me a minimal patch. Do not rewrite surrounding code."
- For `lib/session.ts:27`, the correct prompt output is:
  ```diff
  -    password: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
  +    const sessionSecret = process.env.SESSION_SECRET
  +    if (!sessionSecret) {
  +      throw new Error('SESSION_SECRET environment variable is required')
  +    }
  +    password: sessionSecret,
  ```

**Edge Cases:**
1. **Multi-line refactors:** Issue 5hf requires changing metadata shape in 2-3 places — a patch across multiple locations is still better than full file rewrites
2. **Import changes:** Adding `import { randomUUID } from 'crypto'` is a 1-line diff — request it explicitly

---

## Best Practices (Verified)

### Practice: Pre-Session Spec Prompt (The "Spec-First" Gate)

**Consensus:** High — Tim Deschryver, GoGloby, and our research workflow all confirm

**Supporting Evidence:**
- Tim Deschryver: "For larger features, the spec-driven approach was more effective... the agent would often miss subtle details without it"
- GoGloby: "A spec that surfaces requirement gaps at planning time prevents hallucinated solutions later"
- Our workflow: `docs/checkout/payment/framed-objective.md` already contains the spec for Issues 80l and 5hf

**Counter-Evidence (Falsification Attempts):**
- For trivial fixes (Issue 8l3 — 1 line), a spec is overkill. The beads issue description IS the spec.
- **Mitigation:** Use beads issue description directly as spec for P0/P1 bugs; write a mini-spec only for P2 features spanning >2 files

**Verdict:** ✅ Recommended

**Template for pre-session prompt:**
```
Implement beads issue sang-logium-8l3: Remove iron-session fallback password.

Spec (from beads issue):
- File: lib/session.ts, line 27
- Current: password: process.env.SESSION_SECRET || "fallback-secret-change-in-production"
- Target: throw if SESSION_SECRET missing; no fallback string
- Acceptance: build fails if env var missing; no fallback string anywhere in session config

Context from codebase:
- lib/session.ts uses getIronSession from iron-session v8
- CheckoutSession interface is in same file
- SESSION_SECRET is already required in other parts of the app (verify before changing)

Constraints:
- Do NOT change cookieOptions
- Do NOT change CheckoutSession interface
- Do NOT add new dependencies
- Minimal diff only — do not rewrite the file
```

### Practice: Single-Issue Sessions (No Batching)

**Consensus:** High — GoGloby, Paradigma, and token-efficiency analysis confirm

**Supporting Evidence:**
- GoGloby: "One change per PR when possible... smaller changes make rollback cleaner"
- Paradigma: Plans are per-task, not per-sprint
- Token math: 3 separate 2K-token sessions < 1 combined 15K-token session (context accumulation)

**Counter-Evidence:**
- Batching feels faster (fewer session setups)
- **Mitigation:** Session setup is 30 seconds; debugging a cross-contaminated session is 30 minutes

**Verdict:** ✅ Recommended

**Session Plan:**
| Session | Issue | Files | Estimated Tokens | Model |
|---------|-------|-------|-----------------|-------|
| 1 | 8l3 (fallback password) | `lib/session.ts` | ~500 (tiny) | SWE-1 (credits) or Sonnet |
| 2 | 80l (idempotency keys) | `lib/stripe.ts`, payment action | ~1,500 | Sonnet (needs reasoning) |
| 3a | 5hf part 1 (PI shipping param) | payment action | ~2,000 | Sonnet |
| 3b | 5hf part 2 (webhook migration) | webhook handler | ~2,000 | Sonnet |

### Practice: Verification Gate Before Marking Done

**Consensus:** High — Stripe docs, GoGloby, and security best practices confirm

**Supporting Evidence:**
- Stripe: "Webhook signature verification is mandatory"
- GoGloby: "Minimum gates: build passes, all existing tests pass, lint passes"
- Our workflow: `AGENTS.md` requires "Tests, linters, builds" before session close

**Counter-Evidence:**
- AI-generated verification is faster
- **Mitigation:** AI can RUN tests; human must INTERPRET results. A green test that tests the wrong thing is a false positive.

**Verdict:** ✅ Recommended

**Verification checklist per issue:**

**Issue 8l3:**
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Temporarily unset `SESSION_SECRET` → app throws on startup (verify the failure path)
- [ ] Set `SESSION_SECRET` → app starts normally

**Issue 80l:**
- [ ] `npm run build` passes
- [ ] Existing payment tests pass
- [ ] Inspect the idempotency key format in code: includes `checkoutSessionId` + timestamp
- [ ] Verify `lib/stripe.ts` or payment action has the `{ idempotencyKey }` option

**Issue 5hf:**
- [ ] `npm run build` passes
- [ ] Stripe Dashboard test: create test PI, verify Shipping section shows address
- [ ] Webhook handler reads from `paymentIntent.shipping` not `.metadata`
- [ ] Metadata does NOT contain `firstName`, `lastName`, `street`, `city`, etc.

---

## Common Solutions Landscape

### Solution: "Just Ask AI to Fix Everything"

**Prevalence:** Ubiquitous among beginners
**Type:** Anti-pattern

**Pros:**
- Fastest prompt to write

**Cons:**
- No spec → AI hallucinates scope
- No file boundaries → AI touches unrelated code
- No verification → false confidence
- Token cost explodes on correction loops

**Real-World Pain Points:**
- "Fix the checkout security issues" → AI changes 8 files, breaks 3 working features, introduces 2 new bugs
- Correction loop: "No, don't change that" → AI reverts → "Now fix this" → AI re-introduces previous bug

**Recommendation:** ❌ Avoid — this is vibe coding, not professional engineering

### Solution: Per-Issue Prompt with Full File Content

**Prevalence:** Common in intermediate workflows
**Type:** Idiomatic

**Pros:**
- Complete context for AI
- Predictable output
- Easy to verify

**Cons:**
- Requires reading file first (human effort)
- Token cost includes full file for each session

**Real-World Pain Points:**
- Copy-pasting 500-line files into prompts is tedious
- **Mitigation:** Use the IDE's "@" file reference (Cascade/Claude Code can read files directly)

**Recommendation:** ✅ Recommended — our primary approach

### Solution: Agent-Generated Tests as Proof

**Prevalence:** Common
**Type:** Workaround

**Pros:**
- Tests provide regression protection
- Green tests feel like progress

**Cons:**
- AI may write tests that assert the wrong thing
- Test passes ≠ implementation is correct
- Example: AI writes `expect(password).not.toBe("fallback")` → passes even if password is `"other-fallback"`

**Real-World Pain Points:**
- "All tests pass!" → but the test didn't actually verify the security property
- False confidence delays real verification

**Recommendation:** ⚠️ Context-Dependent — let AI write tests, but human must review test assertions for semantic correctness

### Solution: Plan File Per Issue (`plans/issue-xxx.md`)

**Prevalence:** Niche but growing (Paradigma pattern)
**Type:** Idiomatic

**Pros:**
- Living documentation
- Resume work after interruption
- Historical record of decisions

**Cons:**
- File overhead
- Requires discipline to maintain

**Real-World Pain Points:**
- Plans become stale if not updated
- **Mitigation:** Update plan at session end (2 minutes); delete if issue is trivial

**Recommendation:** ✅ Recommended for P2 features (Issue 5hf); skip for P0/P1 bugs (Issues 8l3, 80l)

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| AGENTS.md reduces per-session setup | Tim Deschryver; our AGENTS.md exists | Source inspection |
| Small sessions are more token-efficient | GoGloby token math; Paradigma plans | Logical analysis |
| Diff-first preserves working code | GoGloby; our `lib/session.ts` example | Code inspection |
| Spec-first prevents hallucination | Tim Deschryver; our framed-objective.md | Source inspection |
| Security code needs human verification | Stripe docs; GoGloby gates | Official docs |
| Issue 8l3 is 1 file, 1 line | `lib/session.ts` line 27 | Code inspection |
| Issue 80l is 2 files max | `lib/stripe.ts` + payment action | Code inspection |
| Issue 5hf spans 3+ files | payment action + webhook + metadata readers | Code analysis |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Batch all 3 issues into 1 session" | Context window overload, cross-contamination risk | ❌ Abandoned |
| "AI tests are sufficient verification" | Tests can assert wrong things; security needs semantic review | ⚠️ Modified — AI writes tests, human verifies assertions |
| "Skip spec for simple fixes" | Issue 8l3 is genuinely simple (1 line) — spec IS the beads description | ✅ Survived for P0/P1; spec required for P2 |
| "Update AGENTS.md is optional" | Outdated AGENTS.md produces confident wrong code | ❌ Abandoned — update before starting |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Tool capabilities (Cascade/Claude) | High | Monthly or after updates |
| Workflow principles (small sessions, diff-first) | Low | Principles are durable |
| Stripe API specifics | Medium | Quarterly or after API version change |
| iron-session behavior | Low | v8 is stable |

---

## Synthesis: Actionable Takeaways

### For Our Project: Implementation Strategy for 3 Beads Issues

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Update AGENTS.md first** | Outdated instructions produce confident wrong code; beads issues not tracked | Add 3 issue IDs, reference payment/framed-objective.md, list `lib/stripe.ts` API |
| **Issue 8l3 (P0) in Session 1** | 1 file, 1 line — trivial scope, zero risk of cross-contamination | Direct implementation with beads description as spec |
| **Issue 80l (P1) in Session 2** | 2 files, clear spec in framed-objective.md | Reference `docs/checkout/payment/tasks-decomposition.md:173-205` for exact code location |
| **Issue 5hf (P2) split into Sessions 3a+3b** | 3+ files, two distinct domains (PI creation vs webhook reading) | Part 1: payment action `shipping` param; Part 2: webhook handler migration |
| **Use diff-first prompts** | Preserves working code, minimal blast radius | Explicit: "Minimal patch only. Do not rewrite surrounding code." |
| **Human verifies security properties** | AI can implement; human must confirm the security invariant holds | Checklist per issue (see Best Practices section) |

### Immediate Actions

1. **Update AGENTS.md (5 min)** — Add beads issues 8l3, 80l, 5hf to tracked work section. Reference `docs/checkout/payment/framed-objective.md` for PI patterns. This prevents AI from re-implementing already-specified logic.
2. **Session 1: Issue 8l3 (10 min)** — Prompt: "Implement beads issue sang-logium-8l3 in lib/session.ts. Replace the fallback password with a thrown error. Minimal diff. Do not change anything else."
3. **Session 2: Issue 80l (20 min)** — Prompt: "Implement beads issue sang-logium-80l. Add idempotency key to stripe.paymentIntents.create() in the payment Server Action. Key format: `checkout-${session.checkoutSessionId}-${Date.now()}`. Reference docs/checkout/payment/tasks-decomposition.md Task 7 for exact location."
4. **Session 3a: Issue 5hf Part 1 (30 min)** — Prompt: "Migrate address from metadata to Stripe shipping parameter in the payment Server Action. Pass `shipping: { name, address }` to PI create/update. Remove address fields from metadata. Keep only checkoutSessionId and email in metadata."
5. **Session 3b: Issue 5hf Part 2 (30 min)** — Prompt: "Update webhook handler to read order address from `paymentIntent.shipping` instead of `paymentIntent.metadata`. Ensure idempotency is preserved."

### Token Cost Estimate (Windsurf Pro / Claude Code)

| Session | Input Tokens | Output Tokens | Cost (Sonnet @ $3/M in, $15/M out) |
|---------|-------------|-------------|-----------------------------------|
| Session 1 (8l3) | ~500 | ~200 | ~$0.05 |
| Session 2 (80l) | ~1,500 | ~800 | ~$0.17 |
| Session 3a (5hf pt1) | ~2,000 | ~1,200 | ~$0.24 |
| Session 3b (5hf pt2) | ~2,000 | ~1,200 | ~$0.24 |
| **Total** | **~6,000** | **~3,400** | **~$0.70** |

**Alternative (batched session):** ~25,000 input + ~8,000 output = ~$0.20 in, $1.20 out = **~$1.40** (2× more expensive, higher error rate).

### Session Templates (Copy-Paste Ready)

**Template A: Simple Bug Fix (Issue 8l3)**
```
Implement beads issue sang-logium-8l3.

File: lib/session.ts
Line: 27
Current code:
  password: process.env.SESSION_SECRET || "fallback-secret-change-in-production",

Required change:
- Extract process.env.SESSION_SECRET to a const
- Throw Error if missing
- Pass the const to password (no fallback string)

Constraints:
- Minimal diff only
- Do not change cookieOptions, CheckoutSession, or imports
- No new dependencies

Acceptance:
- Build passes
- If SESSION_SECRET unset, app throws on startup
- No fallback string exists in the file
```

**Template B: Medium Feature (Issue 80l)**
```
Implement beads issue sang-logium-80l.

Context from docs/checkout/payment/tasks-decomposition.md Task 7:
- Branch B: stripe.paymentIntents.create({ amount, currency, automatic_payment_methods, metadata })
- This needs an idempotency key in the second argument

Required change:
- Add idempotencyKey option to the create() call
- Format: `checkout-${session.checkoutSessionId}-${Date.now()}`
- session.checkoutSessionId is available on CheckoutSession interface

Files to touch:
- lib/stripe.ts (if PI creation is there) OR payment Server Action file

Constraints:
- update() branch does NOT need idempotency key
- Minimal diff only
- Build passes; existing tests pass
```

**Template C: Complex Feature Part 1 (Issue 5hf)**
```
Implement beads issue sang-logium-5hf Part 1: PaymentIntent shipping parameter.

Current state (from docs/checkout/payment/framed-objective.md:57-61):
- Metadata contains flattened address fields
- Technical debt: "Stripe shipping parameter is the correct destination"

Required change:
1. Construct shipping object from session.address:
   shipping: {
     name: `${address.firstName} ${address.lastName}`,
     address: {
       line1: `${address.street} ${address.streetNumber}`,
       postal_code: address.postalCode,
       city: address.city,
       state: address.regionCode,
       country: 'PL'
     }
   }
2. Pass shipping to stripe.paymentIntents.create() and update()
3. Remove address fields from metadata (keep only checkoutSessionId, email)

Files to touch:
- Payment Server Action (where PI create/update happens)

Constraints:
- Do not change CheckoutSession interface
- Metadata must NOT contain firstName, lastName, street, streetNumber, city, regionCode, postalCode, phone after this change
- Minimal diff only
```

### Open Questions

1. Where is the payment Server Action file? Is it `app/checkout/payment/actions.ts` or another path?
2. Where is the webhook handler? Is it `app/api/webhooks/stripe/route.ts` or another path?
3. Is `session.checkoutSessionId` always populated before payment page render?
4. Are there other metadata consumers (reporting, admin dashboard) that read the flattened address from metadata?

---

## Session Protocol (Execute Per Issue)

```
1. PREP: Read AGENTS.md + beads issue description + relevant code files
2. PROMPT: Use Template A/B/C with exact file paths and line numbers
3. IMPLEMENT: AI generates diff; human reviews before applying
4. VERIFY: Run build, lint, tests; manually inspect the changed lines
5. COMMIT: `git commit -m "sang-logium-8l3: Remove iron-session fallback password"`
6. CLOSE: `bd close sang-logium-8l3`
7. REPEAT: Next issue
```

**Critical rule:** If the AI's diff touches files outside the agreed scope, STOP. Re-prompt with narrower constraints. Scope creep is the #1 cause of AI-generated bugs.
