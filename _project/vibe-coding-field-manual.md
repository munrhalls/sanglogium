# The Sang Logium Vibe-Coding Field Manual

I read all twelve of your logged sessions (100 prompts), your last 20 commits, both AI-orchestration plans, CLAUDE.md, both `lg-touch`/homepage reference docs, and the ~30 methodology files sitting in `.devin/workflows/`. Then I checked git status directly. Here's what's actually going on — not what it felt like at prompt 14 of a 16-prompt session.

## The number that matters

One of your last twenty commits is tagged `Difficulty: 8 - A, Forward progress` in your own taxonomy — the PDP restructure (`ebcb0619`). Nine are `D, Configuration`. Ten are `E, Polish` — including, tellingly, the entire lg-touch/spotlight/trust-bar overhaul (`a248fbd0`, also Difficulty 8), filed as Polish rather than Forward progress by whoever wrote that message. All twenty, every single one, are tagged `DoD:0` — the "doesn't close out a tracked plan item" option your own `.devin/workflows/commit.md` defines as the alternative to a real `DoD:<SprintName>-<item>` tag. You built a taxonomy specifically so you could tell real progress from busywork. For three straight days, on every commit, you reached for the busywork tag.

That's measurable, and it's fixable, and it isn't the failure you're probably blaming.

## Where the 22 hours actually went

Forty-one of your 100 logged prompts — 41% — went to one mechanism: how `ProductSpotlight1/2/3` own their height. Round one ("Vertical Space Optimization," 9 prompts) fixed it, then lost the fix to a colliding mobile change. Round two — literally titled "Round 2" in your own log (16 prompts) — rediscovered the same mechanism from scratch: an element either owns its height (`aspect-*`) or inherits it (`h-full`/`min-h`/`max-h`), and you can't mix models across an ancestor chain without every link matching. A third session, "Copy Box Typography" (16 prompts), fought a sibling symptom of the identical root cause, re-diagnosing it four times before landing on the fix, with one full revert along the way.

Here's the part that should sting a little: `docs/vertical-space-lg-touch.md` — the doc that states this exact mechanism, cites the exact regression commit (`d8bb31ac`, confirmed in your log), and names the exact fix — got its `h-full`-vs-`aspect-ratio` section committed on 2026-08-05 (`bc25ea92`, also confirmed). "Round 2" and "Copy Box Typography" are both dated 2026-08-06. Thirty-two of the forty-one prompts happened *after* the fix was already correct, written down, and committed. This isn't a knowledge gap. The knowledge existed. It just wasn't the first thing read.

Compare that to your own CLAUDE.md, which now says the review gate is mandatory "precisely because reading the doc once was not sufficient to prevent a real regression." True — but the gate fires at *review* time, catching a bad diff before it lands. It doesn't fire at *start-of-task* time, which is where it would have saved you 16 prompts instead of one clean diff.

## The pattern under the sessions that went badly

Five of your twelve sessions say it explicitly, in their own words, before I add anything: "No target spacing values, color rules, or final design spec given upfront" (vertical rhythm); "No acceptance criteria, breakpoint, or size values were specified up front" (copy box typography); "no upfront spec (target sizes, breakpoints, mobile-vs-desktop behavior, acceptance criteria)" (mobile price/button sizing); "No initial breakdown; scope narrowed reactively, prompt by prompt" (featured background seam); "first request bundled explore, plan, and act into one pass..." (spotlight round 2).

None of that is a Claude problem or a Devin problem. It's a missing-first-step problem: the goal arrives as an adjective — harmonize, looks full, feels cramped — instead of a number, so the only way to find the number is to guess, get told "wrong," and guess again. Your own PDP session names the fix in its own retrospective: convergence only happened "once live DOM/browser verification replaced screenshot-guessing." That's the entire failure mode, correctly diagnosed by you, in session ten — and not applied going into sessions one through nine.

Now look at the sessions that went *well*, for the contrast. The homepage/PDP UX audit ran a 1-10 rubric with findings pinned to file:line before any fix was proposed — six prompts, two full audits. The carousel-dots fix was three prompts because the bug was mechanical (`lg:hidden` colliding with the `lg-touch`/`lg-desktop` split) and didn't need a taste call at all. Same author, same codebase, same week — the cost difference is entirely explained by whether a number or a mechanical root cause existed before the first edit, not by which tool held the keyboard.

You already have the instrument for this sitting available: the Chrome browser connection can read actual computed styles and actual rendered DOM. A screenshot you paste in tells me one pixel at a viewport width I have to guess. Computed styles tell me the truth in one read instead of four re-diagnoses.

## The other thing you're doing: building the same seatbelt twice

`.devin/workflows/` already has around 30 files covering this exact ground — `rabbit-hole-check.md` (a mandatory 3-question pre-flight: is this simple, is this clear, does it start from verified ground), `retrieve-lessons.md` (mandatory pre-work retrieval of prior failures before starting), plus `commit.md`, `gaps-scan.md`, `gap-close.md`, `framed-objective.md`, `core-building-pattern.md`, and more. This week you built `gaps-scan`, `gaps-close`, `checks`, and `act-dont-ask` as Cowork skills — a second, parallel copy of much of the same machinery, for a different execution context.

That duplication isn't automatically wasted — Devin's workflows and Cowork's skills don't share state, so some rebuilding is real work, not busywork. But look at what `retrieve-lessons.md` actually points at: `_project/lessons/INDEX.md` does not currently exist, so the workflow falls back to `.devin/memories/`, `.devin/research/`, and `_project/` for relevant write-ups. You built the mandatory protocol for retrieving lessons before you ever gave it lessons to retrieve. And `rabbit-hole-check.md` would have flagged nearly every low-scoring session in your log at the door — its own worked example fails a task for being exactly as vague as "harmonize the typography." Whether it never ran because it's Devin-scoped and never crossed over, or it exists and wasn't consulted, the fix is identical: that three-question check is cheap, already written, already proven relevant to this exact codebase, and it isn't running in your Cowork sessions. That's the single highest-leverage thing already sitting in your repo, unused.

## Before you score today 1-2/10, check this

Your most recent commit is dated 2026-08-05. Fifty-eight of your hundred logged prompts — seven sessions — are dated 2026-08-06, today. I grepped your working tree directly: `ProductSpotlight1/2/3`, `ProductInfo.tsx`, `Featured/*`, the `carousel/*` files, `CatalogueNavbar.tsx` — the exact components those sessions fought over — are sitting modified and uncommitted right now, out of 251 changed files total. Today's work is not missing. It exists, in your working tree, and simply hasn't crossed into a commit yet. Before you finalize a 1-2/10 score, close that loop: commit what's actually good, tag it honestly against your own taxonomy (a real `DoD` item if any of it closes one — not another blanket `DoD:0`), and re-score with that in front of you. Some of the low score may be a bookkeeping illusion. Whatever's left after that is the real number, and it's the one worth fixing.

## The question you actually asked: would Devin execution have helped?

No — for most of your twelve sessions, and your own `orchestration-plan.md` explains why without my help. It specifies that every Devin task needs a testable acceptance criterion and one unambiguous done signal, fixed *before* the task starts, because Devin can't sit in a live loop trading screenshots and taste calls with you — it clones, executes, and reports back once. Most of your sessions never had that criterion at the start; the criterion was the thing being discovered, turn by turn, through your reaction to each attempt. Routing that through Devin doesn't remove the guessing — it moves the same "no, still wrong" loop onto a slower rail (session spin-up, clone, build, screenshot, report), and you'd pay that tax every round instead of a chat-edit's worth. Your instinct here is correct, and it's correct for a reason you already wrote down yourself.

There's a real exception worth naming precisely, so you don't over-correct in the other direction: your photography fill-ratio session hit a genuine environment limit and had to shrink from a real at-scale fix down to a synthetic validation pass. That's not a taste problem — it's a resource/scale ceiling, exactly the category your own `devin-cloud-optimization-plan.md` already earmarks for Devin cloud (real compute, no sandbox walls) or for the acceptance-criteria-driven tasks already spec'd in `orchestration-plan.md` (accessories count ≥20, breakpoints pass/fail at three widths, search under 500ms, checkout end-to-end pass/fail — every one of those already has a number attached before the task starts).

So the dividing line was never Cowork versus Devin. It's: do you already have the number? If yes, it can leave the chat — Devin, a background subagent, whatever's free. If no, you're still in taste-discovery, and taste-discovery has to stay live and fast — but fast should mean grounded in real computed state, not fast-and-blind.

## What to actually do next session

Before the first edit on any layout/visual task, write the acceptance criterion as a number or a pass/fail check, not an adjective. If you can't state one yet, say so out loud and treat the next step as diagnosis, not execution — don't let a time-box turn a diagnostic question into a guessed edit.

Read the doc that already exists for the area before touching code, not after the second failed attempt: `docs/vertical-space-lg-touch.md` for anything sizing/height, `docs/homepage-structure.md` for anything data/composition. Both are one directory away and both are already correct.

When checking whether a fix worked, read computed styles and real DOM state through the Chrome tools before trusting a pasted screenshot. This is the one change your own PDP session already proved converges faster.

When you reject a fix, hand over one piece of new ground truth — a computed value, a specific viewport, a specific device — instead of "wrong" or "doesn't work." A vague rejection forces the exact blind re-guess that turned three sessions into 16-prompt ones.

Before opening a new session on a component family you've fought before, grep `docs/` and `_project/` for it first. And actually create `_project/lessons/` (and an `INDEX.md` once there are enough files) with even three or four short files in it — height-ownership, breakpoint non-inheritance, the buy-box/overview coupling from the PDP session — so `retrieve-lessons.md` has something to retrieve next time either agent runs it.

Route to Devin, or any background executor, only the work that already has a number attached or that hits a sandbox wall — bulk/scale operations, full builds, heavy git-history queries (two of mine timed out directly while narrow targeted reads didn't — not a one-off, it matches what your own Devin-optimization plan already found independently). Keep everything still in taste-discovery live, in chat, but grounded in real state, not screenshots.

Use your commit taxonomy honestly. If three days of commits are all `DoD:0`, that's not neutral bookkeeping — it's a signal the day's work wasn't chosen from a plan, it was chosen live, reactively, off the last screenshot.

## The one-paragraph version

You don't have a vibe-coding skill problem. You have a sequencing problem: the docs, the mechanism, and even the review gate all exist and are correct, and they're being consulted after the pain instead of before it. Forty-one of your hundred prompts fought variations of one mechanism across three sessions; thirty-two of those prompts happened after the fix was already correct and sitting committed in your own repo. Fix the sequencing — number before edit, doc before guess, computed style before screenshot, lessons file before the third rematch — and the same 22 hours produces the two-task version of this instead of the 16-prompt version. That's not a new tool. It's the tools you already built, actually switched on.

---
*Built from `vibe-challenges-4-6-08.md` (12 sessions, 100 prompts), `git log`/`git status` on sang-logium, `orchestration-plan.md`, `_project/devin-cloud-optimization-plan.md`, `docs/vertical-space-lg-touch.md`, `docs/homepage-structure.md`, and `.devin/workflows/` — 2026-08-06.*
