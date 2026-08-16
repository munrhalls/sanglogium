> **Correction (friction-scan follow-up, see `_project/devin-cloud-optimization-plan.md`):** §5 Case C and §6 below originally recommended enabling Devin Review as an automatic "live check" layer. That recommendation is **retracted**. Devin Review only works on PRs/MRs, and enabling it would have required switching future Devin task delivery from a direct `git push` to a GitHub PR cycle — a recurring process tax on every future task, and a direct contradiction of this project's own zero-friction, local-first rule in `CLAUDE.md`. Devin Review remains a true, free fact for public repos (§2.2) — it just isn't worth adopting here given the friction cost of the only way to trigger it. The rest of this document (cost model, free-option ranking, disqualification of Devin-as-auditor) still holds.

# Devin Cloud: Cost Reality and Its Position in the Claude+Devin+Human Workflow

Scope: Devin Cloud only — its costs (Aug 2026) and where it belongs in the existing pipeline (`human → Claude Cowork → paragraph summary/approval → Devin executes → live check`). Sources are Devin's own docs (`docs.devin.ai`) plus real evidence already in this repo (`orchestration-plan.md`).

---

## 1. What Pro actually costs and how the meter runs

Devin's self-serve pricing (current as of this writing): Free ($0), **Pro ($20/mo — what you have)**, Max ($200/mo), Teams ($80/mo min). Enterprise is separately billed in ACUs (Agent Compute Units) — that unit and its ~$2.25 figure that shows up in third-party blog posts is an **Enterprise/legacy concept and does not apply to your Pro plan**. Ignore any "cost per ACU" number you see quoted for Pro — it's the wrong billing model.

Pro works like this:

- A **daily + weekly token quota**, shared across Devin cloud sessions, Devin CLI, and Devin Desktop. Resets on a calendar basis; daily allowance is deliberately >1/7 of weekly so weekend work doesn't get starved.
- Cost inside the quota is $0 marginal — it's what you already pay $20/mo for.
- Past quota, you draw **on-demand credits** billed at **API list price for the model's actual token usage** (pay-as-you-go, not a flat per-task fee).
- **Idle time is free.** Devin auto-sleeps after ~0.1 ACU-equivalent of inactivity and consumes nothing while asleep, while waiting for your reply, while a test suite runs, or while cloning a repo.
- Windows sessions cost ~9% more than Linux for equivalent work — default to Linux sessions.
- What drives cost: task complexity, prompt specificity, codebase/context size, number of files touched, session length, and back-and-forth chattiness. Tightly scoped, single-purpose sessions are cheap; vague, multi-topic, long-running sessions are expensive.
- **No concurrent-session limit.** Running 3 Devin sessions in parallel costs the same total tokens as running them sequentially — parallelism doesn't multiply price, it only drains the shared quota pool faster in wall-clock time. This is the direct mechanism behind your "why": parallel Devin sessions buy you calendar time, not extra spend.

## 2. Free / unlimited options — ranked, highest leverage first

You asked for free-unlimited to be top priority. Three things are structurally free regardless of plan, and two of them apply directly to sang-logium because **the repo is public** (confirmed: `github.com/munrhalls/sang-logium` is public and already indexed at `deepwiki.com/munrhalls/sang-logium`).

1. **DeepWiki + basic Ask Devin, free, unlimited, no account needed** — `deepwiki.com/munrhalls/sang-logium`. Auto-generated architecture diagrams, source-linked docs, and codebase-grounded Q&A. Costs nothing, ever, for a public repo. You can steer what it documents with a `.devin/wiki.json` file in the repo root (up to 30 pages, 100 notes) if the default coverage misses something.
2. **Devin Review on public PRs, free, unlimited, no account needed** — swap `github.com` → `devinreview.com` in any sang-logium PR URL, or use `npx devin-review <pr-url>` from a local clone. Full bug catcher (severity-rated), security scanner (CWE-classified), smart diff grouping, and codebase-aware chat — all at zero cost because the repo is public. This is the same engine Enterprise customers pay ACUs for; you get it free by virtue of being open source.
3. **Quota-free models** — SWE-1.7 and SWE-1.6 don't count against your Pro quota at all when used in Devin Desktop/CLI. **SWE-1.7's free window closes August 8, 2026 — 7 days from today.** If you have mechanical, non-judgment-heavy work queued (CSS pass, content population, boilerplate), running it before Aug 8 banks real quota. Re-check `docs.devin.ai/desktop/models` after that date since these promotional windows rotate.

Everything else (Devin cloud agent sessions doing real execution work) draws from the paid Pro quota — not free, but flat-rate up to the weekly/daily cap, which for scoped tasks like the ones already in `orchestration-plan.md` is normally enough.

## 3. What's already validated in this repo (don't reinvent it)

`orchestration-plan.md` already encodes a three-role split that matches your stated pipeline almost exactly:

| Role | Job | Cost basis |
|---|---|---|
| Orchestrator (you) | Issue instructions, approve, verify | Time |
| Claude (Power model) | Intelligence scanning, gap analysis, phase+task prep | Flat subscription, no metering |
| Devin (Cloud agent) | Mechanical execution of a fully self-contained task | Pro quota → on-demand $ |

Every real Devin task file in this repo (`SL-2` through `SL-6`, `PF-2` through `PF-7`, the diagram-creation task, the beads-cleanup task) follows the same shape: exact scope, numbered steps, testable acceptance criteria, an explicit "do not touch" list, and a one-sentence done signal. None of them ask Devin to decide what's wrong or what matters — that judgment call was already made by Claude (or you) before the task was written. The `Handoff Protocol` section formalizes this: Claude produces an "Intelligence Scan Output" *and* the resulting "Devin Task Instructions" in the same pass; Devin never sees a bare goal, only a pre-digested task.

## 4. Testing the speculative idea: Devin as auditor/gap-analyzer

Your idea — repurpose Devin for intelligence-gathering, source-vs-source sync checks, and audits against best practice — is worth testing directly against the above, because it's the opposite of how this repo currently uses it.

**Disqualified as a primary role, for three concrete reasons:**

- **Cost asymmetry.** Claude Cowork's audit work costs you nothing incremental (flat subscription); the same audit run through Devin cloud burns metered Pro quota for work that doesn't ship code. Spending metered capacity on judgment work when unmetered capacity already does it is the wrong trade.
- **Context loss.** Devin cloud sessions are fire-and-forget — no shared memory with the conversation where you defined the goal. Your own pipeline requires a "1 paragraph summary for human verification" step precisely because Claude *has* that context and can compress it; Devin would have to be re-briefed from scratch each time, which is exactly the overhead your workflow is designed to avoid.
- **The repo's own evidence disagrees with the idea.** No comparable audit file currently exists in this repo. Any prior audit work (diffing issue `updated_at` against file mtimes, grepping for drift) was done by the intelligence layer before handing execution to Devin — Devin's job was the execution phase, not the audit itself.

**Partially validated, in a narrower free form:** the two zero-cost tools from §2 — DeepWiki's codebase Q&A and Devin Review's bug/security scanner — genuinely are "intelligence gathering / source code checks" run by Devin's infrastructure. The difference from your original idea is that they should stay in their free, narrow, always-on form (documentation lookup, PR-level bug/security scan) rather than becoming a paid, general-purpose "run a full audit" Devin cloud session. Use them as a supplement to Claude's intelligence-scan phase, not a replacement for it.

## 5. Case studies (using real tasks already written in this repo)

**Case A — SL-2, Accessories Population.** Scoped, mechanical, ~20 products to add with images/titles/prices. This is squarely Pro-quota work: bounded file/data scope, clear done signal (screenshot at 1440px), low back-and-forth. Cheap by the cost drivers in §1. No change needed — this is the pattern working as intended.

**Case B — SL-6, Sanity CMS Cleanup, running in parallel with PF-2, Hero Section.** Different repos (`sang-logium` vs `portfolio`), so per the Track Isolation Rules these are safe to run as two concurrent Devin cloud sessions. Per §1, that costs the *same total quota* as running them sequentially — the only thing you buy with parallelism is calendar time, which is exactly the "doesn't eat PC resources, enables more parallel work" leverage you're after. This is already happening in the plan's "Maximum Parallelism Summary" table; the cost model confirms it's not accidentally expensive.

**Case C — the "live check result" step.** ~~Originally proposed enabling Devin Review auto-review here.~~ **Retracted** — see correction note at the top of this document. Devin Review requires PRs, and gating delivery through PRs trades a real, recurring friction cost for a free tool, which fails the project's own priority ordering. The existing mechanism — the orchestrator manually verifies acceptance criteria and reviews Devin's done-signal artifact (screenshot/test output/recording), per `Orchestrator Checklist Per Phase Handoff` — was already correct and zero-friction. No change needed.

## 6. Recommended position — minimal-step version (corrected)

No new role, no new paid step, and — after the friction-scan — no process change either:

1. `human → Claude Cowork (intelligence scan + task prep)` — **unchanged**. Optionally, Claude consults DeepWiki (§2.1) instead of re-deriving architecture context from scratch when a task needs orientation — same output, less of Claude's own context spent per scan.
2. `→ 1-paragraph summary → human approval` — **unchanged**.
3. `→ Devin executes`, in parallel across independent tracks/repos whenever the Track Isolation Rules allow it, delivering via direct `git push` exactly as today — **unchanged**, cost-neutral per §1.
4. `→ live check result` — **unchanged**: orchestrator verifies acceptance criteria against Devin's done-signal artifact. No automated PR-based layer added — see correction note.

The only real action item is `_project/devin-cloud-optimization-plan.md`: trigger DeepWiki indexing once (2 minutes, no workflow change). The SWE-1.7-before-Aug-8 idea was also dropped there — no current backlog item fit the objective, and inventing one would be scope creep.

---

### Sources
- [Plans and Usage](https://docs.devin.ai/desktop/accounts/usage)
- [Quota-Based Usage](https://docs.devin.ai/desktop/accounts/quota)
- [Billing](https://docs.devin.ai/admin/billing)
- [Self-serve plans](https://docs.devin.ai/admin/billing/self-serve)
- [Usage (metering mechanics)](https://docs.devin.ai/admin/billing/usage)
- [Devin Review](https://docs.devin.ai/work-with-devin/devin-review)
- [DeepWiki](https://docs.devin.ai/work-with-devin/deepwiki)
- [deepwiki.com/munrhalls/sang-logium](https://deepwiki.com/munrhalls/sang-logium) (confirmed live/public)
- In-repo: `orchestration-plan.md`
