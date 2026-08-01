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

That's the entire plan. No Devin cloud agent execution phase, no GitHub process change, no blocking wait states, nothing that touches the existing `git push` flow.

## One-Paragraph Summary (for your verification)

The corrected plan is one two-minute click: visit DeepWiki and trigger indexing for sang-logium, which is free, permanent, and touches nothing about how you build or ship code. There's a second step only if that indexed wiki turns out to skip something important, in which case I write one small config file the normal way you already commit everything — no PR, no new process. Everything else from the last version (PR-based delivery, Devin Review enrollment, the consumption-cost verification, scaling to full auto-review) is cut outright, not postponed, because it all depended on replacing your direct `git push` with a GitHub PR cycle, which is exactly the recurring friction you don't want. Nothing here changes your workflow, adds a wait state, or touches Devin's cloud agent at all.
