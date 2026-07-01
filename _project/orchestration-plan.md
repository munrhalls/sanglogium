# Parallel Orchestration Execution Plan

## System Overview

Three roles, one pipeline:

- **Orchestrator (You):** Issue instructions, manage handoffs, do human-only work
- **Claude (Power model):** Intelligence scanning, gap analysis, phase + task preparation
- **Devin IDE (Cloud agent):** Mechanical execution of prepared task instructions

Core rule: While Devin executes Track A, Claude preps Track B, and you handle Track C (human-only). Dead time = wasted capacity.

---

## Track Definitions

| Track | Name | Scope | Interference Boundary | Done Signal |
|-------|------|-------|----------------------|-------------|
| **SL** | Sanglogium Completion | `C:\webdev\sang-logium` | Nothing else touches this repo during active phases | All M1 criteria pass |
| **PF** | Portfolio Homepage | `C:\webdev\portfolio` | Nothing else touches this repo during active phases | Homepage live, video placeholder in place |
| **CV** | Curriculum Vitae | CV document only | Zero file interference — always safe to run | CV is send-ready |
| **VID** | Video Production | Human + screen recorder | Depends on SL; human-only execution | 90-sec video exported |
| **LI** | LinkedIn Article 1 | LinkedIn platform | Depends on VID complete | Article published |
| **TR** | Technical Review | Human study only | None — runs daily in block 3 | TS, React, Next.js gaps closed |
| **STAR** | Interview Stories | Document | None — starts when applying begins | 5 rehearsed stories written |
| **DSA** | Daily Algo | Human practice | None — runs every day in block 3 | Ongoing (1 problem/day) |

---

## Dependency Graph

```
SL ──────────────────────────────────────────────► VID ──► PF-6 ──► PF-7 (deploy)
                                                              │
                                                              └──────► LI

PF-1 ──► PF-2 ──► PF-3 ──► PF-4 ──► PF-5          ← independent of SL/VID until PF-6

CV ────────────────────────────────────────────────  independent of everything

DSA ───────────────────────────────────────────────  daily, independent

TR ────────────────────────────────────────────────  daily, independent

STAR ──────────────────────────────────────────────  starts when applying begins
```

**Hard dependencies:**
- SL complete → VID can start (store must be filmable)
- VID complete → PF-6 (video embed) and LI-1 can start
- PF-6 complete → PF-7 (final deploy)
- PF-7 live → Apply at volume (portfolio must exist before applying)

**Independent of everything:** CV, TR, DSA, STAR (STAR starts when applying, not before)

---

## Phase Breakdown by Track

---

### Track SL — Sanglogium Completion

**SL-1 — Intelligence Scan** *(Claude, ~45 min)*

Audit:
- Accessories section: product count, visual gaps, what "looks full" means quantitatively
- Mobile: which breakpoints are broken or borderline
- Search: speed + relevance current state
- Checkout: last known blockers, Stripe test mode status
- Sanity CMS: what's messy/unpublished/draft clutter

Output: Gap report + phased Devin task list

---

**SL-2 — Accessories Population** *(Devin)*

Task: Populate accessories section until the grid reads "full" — no visible empty slots.

Scope: Sanity Studio + `sang-logium` product data

Steps:
1. Count current accessories products
2. Add products until grid has ≥20 items and looks visually complete at 1440px
3. Ensure all products have images, titles, prices

Acceptance criteria:
- [ ] Accessories grid ≥20 products, no empty slots at 1440px
- [ ] All products have image + title + price in Sanity

Do not touch: checkout flow, search logic, mobile CSS, any other section

Done signal: Screenshot of accessories grid at 1440px confirms full appearance

---

**SL-3 — Mobile QA Pass** *(Devin)*

Task: Test and fix all responsive breakpoints across the store.

Scope: CSS/Tailwind in components — layout only, no logic changes

Steps:
1. Test at 375px, 768px, 1024px using browser devtools
2. Document every broken layout (list them)
3. Fix each broken layout — CSS/Tailwind changes only

Acceptance criteria:
- [ ] No horizontal scroll at any tested breakpoint
- [ ] No broken/overlapping layouts at 375px, 768px, 1024px
- [ ] Navigation usable on mobile

Do not touch: Sanity schema, checkout, search, accessories data

Done signal: Screenshots at 375px and 768px showing clean layouts

---

**SL-4 — Search Verification** *(Devin)*

Task: Test search speed and result relevance; fix if degraded.

Scope: Search component + Sanity GROQ query

Steps:
1. Test 5 representative search queries, record response times
2. If any query > 500ms, profile and optimize the GROQ query
3. If top results are irrelevant, adjust scoring/filter logic

Acceptance criteria:
- [ ] All test queries return results in < 500ms
- [ ] Top result for each test query is the most relevant product
- [ ] No search errors in console

Do not touch: mobile CSS, accessories data, checkout

Done signal: List of 5 queries tested with response times, all passing

---

**SL-5 — Checkout E2E** *(Devin)*

Task: Run full checkout flow in Stripe test mode; fix any blockers.

Scope: Checkout components, Stripe integration, cart logic

Steps:
1. Add a product to cart
2. Proceed through checkout to Stripe payment
3. Use Stripe test card 4242 4242 4242 4242
4. Confirm success screen displays
5. Fix any step that fails

Acceptance criteria:
- [ ] Add-to-cart → checkout → Stripe test payment → success screen completes without error
- [ ] No console errors during checkout flow
- [ ] Success page renders correctly

Do not touch: search, mobile CSS, accessories content

Done signal: Screen recording or step-by-step confirmation that full flow completed

---

**SL-6 — Sanity CMS Cleanup** *(Devin)*

Task: Organize Sanity dashboard so it looks clean and intentional in a screen recording.

Scope: Sanity Studio config, document organization

Steps:
1. Delete or archive all draft/unpublished junk documents
2. Organize document types so the sidebar is clean
3. Confirm all published products are in good state

Acceptance criteria:
- [ ] No obvious junk/draft clutter visible in Sanity dashboard
- [ ] Document list looks curated and organized
- [ ] All products visible in the CMS have images and complete data

Do not touch: frontend code

Done signal: Screenshot of clean Sanity dashboard

---

### Track PF — Portfolio Homepage

Note: PF-1 through PF-5 are independent of SL and VID. PF-6 requires VID complete.

---

**PF-1 — Intelligence Scan** *(Claude, ~30 min)*

Read `C:\webdev\portfolio\src\latest-design-intelligence\design.md` fully.

Audit:
- Current homepage vs the design spec — what exists, what's missing, what needs removal
- Current stats bar copy and commit count (needs updating)
- Current animation placement
- Mobile layout current state

Output: Precise change delta list + phased Devin task instructions

---

**PF-2 — Hero Section Structure** *(Devin)*

Task: Implement the hero section per spec.

Scope: `C:\webdev\portfolio\src\` — hero component only

Target structure:
- Headline: "3,641 COMMITS. 18 MONTHS. SOLO." — dominant, top
- Video placeholder: centered, correct aspect ratio (16:9), black fill, labeled "VIDEO"
- Stats bar below video: commit count, duration, solo flag
- Two CTAs: "View Live Site" (links to sang-logium prod URL) and "View GitHub" (links to repo)

Acceptance criteria:
- [ ] Headline renders at dominant size above video
- [ ] Video placeholder visible, centered, 16:9 aspect ratio
- [ ] Stats bar renders below video
- [ ] Both CTAs render and link correctly
- [ ] No layout breaks at 1440px

Do not touch: Tech section, other pages, 3D animation components

Done signal: Screenshot at 1440px showing full hero section

---

**PF-3 — Remove Diamond from Homepage** *(Devin)*

Task: Remove the 3D diamond animation from the homepage entirely.

Scope: Homepage component only

Steps:
1. Locate the 3D canvas/diamond component import on the homepage
2. Remove it from the homepage render — do not delete the component file itself

Acceptance criteria:
- [ ] Homepage loads with no 3D canvas element in the DOM
- [ ] No console errors from missing canvas
- [ ] Page load noticeably faster (no WebGL init on homepage)

Do not touch: The diamond component file itself, Tech section, any other page

Done signal: Homepage screenshot showing no animation, clean load

---

**PF-4 — Diamond to Tech Section Opening** *(Devin, after PF-3)*

Task: Add the 3D diamond animation as the opening visual of the Tech section.

Scope: Tech section component

Steps:
1. Import the diamond component into the Tech section
2. Place it as the first visual element — above the tech list/grid
3. Ensure it renders correctly and doesn't break the section layout

Acceptance criteria:
- [ ] Diamond renders at the top of the Tech section
- [ ] Tech section content still readable below it
- [ ] No console errors

Do not touch: Homepage, other sections

Done signal: Screenshot of Tech section with diamond at top

---

**PF-5 — Mobile Layout** *(Devin)*

Task: Mobile view of homepage — no animation, simplified layout.

Scope: Homepage responsive CSS only

Target at 375px:
- No canvas/3D animation (none to show — homepage diamond already removed)
- Headline visible and readable
- Video placeholder visible and full-width
- Single CTA only ("View Live Site" — remove GitHub CTA on mobile)
- Stats bar hidden on mobile (or collapsed to one line)

Acceptance criteria:
- [ ] At 375px: no canvas element, headline visible, video placeholder full-width
- [ ] Single CTA renders, second CTA hidden
- [ ] No horizontal scroll
- [ ] Text readable without zoom

Do not touch: Desktop layout (≥1024px must be unchanged)

Done signal: Screenshot at 375px showing mobile layout

---

**PF-6 — Video Embed** *(Devin, after VID complete)*

Task: Replace video placeholder with actual embedded video.

Scope: Hero component video slot

Pre-requisite input from orchestrator: The hosted video URL (Vimeo or YouTube unlisted link)

Steps:
1. Replace the placeholder div with a video embed (iframe or video tag)
2. Configure: no autoplay, no loop, centered, responsive width
3. Test that video loads and plays on click

Acceptance criteria:
- [ ] Video plays inline on click, centered
- [ ] No autoplay
- [ ] Video responsive (fills container at all desktop breakpoints)
- [ ] Poster/thumbnail visible before play

Do not touch: Mobile layout, stats bar, CTAs

Done signal: Screenshot + video plays on click confirmation

---

**PF-7 — Stats Update + Deploy** *(Devin, after PF-6)*

Task: Update commit count in stats bar to current; push to production.

Steps:
1. Run `git log --oneline | wc -l` on the sang-logium repo to get current commit count
2. Update the stats bar headline and commit counter in the portfolio component
3. Push to production (Vercel deploy or equivalent)
4. Confirm live URL renders correctly

Acceptance criteria:
- [ ] Stats bar shows current commit count (not 3,641 if that's stale)
- [ ] Live URL loads the updated homepage
- [ ] Video plays on the live URL
- [ ] Both CTAs link to correct destinations

Done signal: Live URL confirmed working

---

### Track CV — Curriculum Vitae

**CV-1 — Intelligence Scan** *(Claude, ~30 min)*

Research:
- What strong frontend/fullstack CVs look like in 2026 (ATS-passing format, recruiter scan patterns)
- What hiring managers skip (objectives, references, fluff)
- How to frame "solo 18-month project" as a strength, not a red flag

Extract from Sanglogium:
- Stack: Next.js 15, React 19, Sanity v3, Stripe, TypeScript, Tailwind
- Features owned: search, checkout, CMS, product catalog, mobile
- Scale indicators: commit count, months, solo

Output: CV template recommendation + pre-written bullet points ready to paste

---

**CV-2 — Draft** *(Claude)*

Write full CV from CV-1 output.

Format constraints:
- 1 page preferred, 2 max
- ATS-safe: no tables, no columns, no images
- Sanglogium as primary project — headline position
- Stack listed explicitly with versions where impressive

Acceptance criteria:
- [ ] 1-2 pages
- [ ] Sanglogium described in 3-5 bullet points with specific technical details
- [ ] Stack section accurate and specific
- [ ] No filler sentences

---

**CV-3 — Polish** *(Human + Claude review)*

Human reads the draft and identifies anything that feels off. Claude suggests edits.

Done signal: You say "this is send-ready"

---

### Track VID — Video Production

Human-only execution. Claude role is script finalization only.

**VID-1 — Script Finalization** *(Claude, ~20 min)*

Task:
- Clean up the script from `design.md`
- Move script content to a new file: `C:\webdev\portfolio\src\latest-design-intelligence\tasks.md`
- Organize into scene markers with exact lines

Script rule (from design.md): Never narrate what is visible. Narrate what was hard to build.

Output: Clean 90-second script with scene markers, ready to rehearse

---

**VID-2 — Rehearsal** *(Human)*

Run through script 3 times against the live store. Narration must feel natural and match what's on screen.

Done signal: You complete 3 clean run-throughs without fumbling

---

**VID-3 — Recording** *(Human)*

Screen recording + voiceover. Capture at least one clean take.

Done signal: Raw recording file exists on disk

---

**VID-4 — Editing** *(Human)*

Trim dead air from start/end. Add background music at low volume (under voice). Export at 1080p.

Done signal: Final 90-sec video file exported, ready to upload

---

### Track LI — LinkedIn Article 1

**LI-1 — Intelligence + Draft** *(Claude, after VID complete)*

Research: What LinkedIn articles get traction from devs in job search mode?

Draft structure:
- Hook: open with the video embed
- 2-3 paragraphs on what the store is and what was hard to build
- CTA: link to portfolio, invite connection

Done signal: Draft ready to copy-paste into LinkedIn

---

**LI-2 — Publish** *(Human, 15 min)*

Paste draft, embed video, publish.

Done signal: Article live on LinkedIn

---

### Track TR — Technical Review

Background track. 30 min/day in block 3 after DSA.

| Week | Focus |
|------|-------|
| 1 | TypeScript: generics, utility types, strict mode patterns |
| 2 | React 19: new patterns, concurrent features, hooks edge cases |
| 3 | Next.js 15: App Router internals, caching model, RSC patterns |
| 4 | System design vocab using Sanglogium as the case study |

No Devin involvement. Claude can generate study notes per week if needed.

---

### Track STAR — Interview Stories

5 stories from Sanglogium. Write one per day once applying. Format: Situation (1 sentence) → Task (1 sentence) → Action (3 sentences, specifics) → Result (1 sentence, measurable if possible).

Suggested stories:
1. Hardest technical problem solved (search? Sanity schema design?)
2. Architecture decision made under uncertainty
3. Feature shipped without being sure it would work
4. How you changed direction when something wasn't working
5. Most complex feature you designed and built alone

Claude can draft all 5 once applying begins (no earlier — you need the story, not just a template).

---

## Handoff Protocol

### What Claude Produces (every phase)

```
INTELLIGENCE SCAN OUTPUT
========================
Track: [name]
Phase: [number + title]
---
CURRENT STATE
[What exists now, quantified. No opinions — facts.]

GAPS IDENTIFIED
1. [specific gap]
2. [specific gap]

DECISIONS MADE
[Choices Claude made with brief rationale]

CONSTRAINTS
[What Devin must not touch]
---
DEVIN TASK INSTRUCTIONS
=======================
Title: [short name]
Repo/Scope: [exact path]
Do not touch: [explicit list]

Steps:
1. [Concrete action — no ambiguity]
2. [Concrete action]
...

Acceptance Criteria:
- [ ] [Testable condition]
- [ ] [Testable condition]

Done signal: [Single sentence — how Devin proves it's done]
```

### Rules for Every Devin Task

Every task must be fully self-contained. No "as discussed" or "you know the project." Write every task as if Devin has never seen this codebase before. Always include:
- Exact file paths or directory scope
- Any environment/config context it needs
- What "done" looks like, testably
- What NOT to change (explicit interference boundary)

---

## Maximum Parallelism Summary

| Window | Devin | Claude | You |
|--------|-------|--------|-----|
| W1: SL executing | SL phases 2–6 (sequential) | PF-1 intel scan | Feed prompts, monitor, DSA |
| W2: PF building | PF phases 2–5 (parallel possible) | CV-1 intel scan | CV review, VID rehearsal, DSA |
| W3: Video window | PF-4, PF-5 polish | LI-1 draft, VID-1 script | VID recording + editing |
| W4: Deploy + launch | PF-6, PF-7, LI-2 | STAR story drafts | Apply 10+/day, TR review |
| W5: Applying | STAR polish (if needed) | TR study materials | Interviews, DSA, STAR rehearsal |

---

## Sample Day in the Life

### Day: Window 1 — SL executing, PF and CV prepping

**Block 1 (morning):**

| Actor | Action |
|-------|--------|
| Devin | SL-2: Accessories population (executing) |
| Claude | PF-1: Portfolio intelligence scan |
| You | Feed both prompts, monitor Devin progress, review Claude PF-1 output when done |

When PF-1 output arrives → review (5 min) → queue PF-2 task for Devin's next slot.

---

**Block 2 (afternoon):**

| Actor | Action |
|-------|--------|
| Devin | PF-2: Hero section structure (executing) |
| Claude | CV-1: Intelligence scan + CV draft |
| You | Feed CV-1 prompt, review SL-2 output, confirm accessories look right |

When CV-1 draft arrives → review (10 min) → mark CV-2 ready for next Claude session.

---

**Block 3 (evening, last 45 min):**

| Actor | Action |
|-------|--------|
| You | DSA: 1 pattern (30 min) |
| You | Review CV draft, make notes for polish (15 min) |

End-of-day state: SL phase 2 done, PF phase 2 in Devin, CV draft in hand, DSA day 1 done.

---

### Day: Window 3 — Video recording day

**Block 1 (morning):**

| Actor | Action |
|-------|--------|
| You | VID-3: Record the video (human-only — clear the decks) |
| Devin | PF-5: Mobile layout polish (non-blocking) |

When video captured → upload to Vimeo/YouTube unlisted → copy URL → queue PF-6 task for Devin with the URL.

---

**Block 2 (afternoon):**

| Actor | Action |
|-------|--------|
| Devin | PF-6: Video embed + PF-7: deploy |
| Claude | LI-1: Article draft (video exists now) |
| You | CV-3: Polish with Claude feedback |

When PF-7 deploys → portfolio is live → confirm URL → applying starts tomorrow.

---

**Block 3 (evening):**

| Actor | Action |
|-------|--------|
| You | DSA: Day N |
| You | Review LI-1 draft (15 min) |

End-of-day state: Portfolio live. CV send-ready. Article draft in hand. Apply phase starts tomorrow morning.

---

## Track Isolation Rules

1. Never run two Devin tasks on the same repo simultaneously
2. SL and PF are different repos — always safe to run in parallel in separate Devin sessions
3. CV is always safe to run in parallel with anything (no code)
4. VID-1 (script finalization) can run while Devin executes any other track
5. LI-1 only starts after VID-4 completes — needs the actual video content
6. PF-6 only starts after VID-4 completes — needs the hosted video URL
7. STAR stories only start when applying begins — don't write stories before you're ready to use them

---

## Orchestrator Checklist Per Phase Handoff

Before firing a Devin task:
- [ ] Claude intelligence output reviewed and approved
- [ ] Task is fully self-contained (no implicit context)
- [ ] Interference boundary explicitly stated in the task
- [ ] Acceptance criteria are testable (not "looks good")
- [ ] Done signal is a single unambiguous sentence

After Devin signals done:
- [ ] Acceptance criteria verified (not just "Devin says so")
- [ ] Screenshots or test output reviewed
- [ ] Next phase task queued or dependency flag updated
