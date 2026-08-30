# HUMAN LESSONS

Takeaways for the human — workflow, judgement, and process — from issues that cost real
time. Terse bullets only. Keep it lean.

_AI-agent traps live in `_project/AI_LESSONS.md`._

---

## sang-logium-7j8 · Streaming POC: images "pop" instead of gradually revealing

**SEVERITY: WORST. EXTREME CRISIS, MASSIVE TIME SINK.**

**What it was:** On the `/streaming-poc` grid every product image had to ease from its
LQIP blur to sharp over a short, visible transition. Instead each image snapped in the
frame its bytes finished downloading, and on a slow link the whole grid un-blurred as one
wall after a long wait. The fix also had to preserve the row-by-row streaming and the
uniform, un-staggered motion from the parent issue (sang-logium-7ao).

**Time cost:** all of Saturday, plus Sunday 06:00–12:00. ~16+ hours over one weekend.

**Resolution (reference):** the reveal trigger was gated on React hydration; the dev
server hydrates ~15 s in, by which point every image is already loaded, so all of them
un-blurred in one pass. Fixed by moving the trigger to an inline `<script>` in the
streamed shell that catches each image's `load` event before hydration. Full trail:
`_project/audits/streaming-poc/`.

### Lessons

* figuring out should be of small professional end user ux portion

* reps of higher order thinking + smallest experiments / q & a -> gradually clearer seeing of what should be
   * doing J. Sung think on paper reps
* -> communicating to AI -> AI execution
* real time monitor Q's:
   * am I seeing my mind's motions clearly?
   * am doing higher order think reps? (select keywords, schema, org simplest, compare, in priority connections, simplifying)

* diagnosis-complete gate: no fixes, no option lists, until the one decisive measurement is done.
* treat every claim — mine or the AI's — as a hypothesis needing a cheap test; run it on turn 1, not after a fix has already failed.
