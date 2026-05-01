# Pragmatic Thinking & Learning: Refactor Your Wetware

## Research Scope Contract
- **Topic:** Cognitive optimization for software developers
- **First Principles:** Brain is dual-mode (R/L); memory is context-dependent; expertise is pattern recognition
- **Fundamentals:** R/L-mode switching, SQ3R, diffused/focused thinking, deliberate practice, spaced repetition
- **Target Audience:** Developers who want to learn faster, debug smarter, and sustain deep work
- **Decay Risk:** Low

---

## Multi-Source Triangulation

| Source | Type | Key Claim | Verification |
|--------|------|-----------|--------------|
| Hunt (2008) | Canonical | R-mode feeds L-mode; insight cannot be forced | Verified |
| Oakley (2014) | Authoritative | Diffused/focused modes mirror R/L modes | Confirmed |
| Kahneman (2011) | Academic | System 1 (fast) vs System 2 (slow) | Confirmed |
| Brown et al. (2014) | Academic | Retrieval > re-reading; spaced repetition works | Confirmed |
| Dreyfus & Dreyfus (1980) | Academic | 5 stages: novice to expert | Confirmed |
| Ericsson (1993+) | Academic | Deliberate practice, not just time, builds expertise | Confirmed |

---

## First Principles Analysis

### Core Problem
Software development demands continuous learning and complex problem-solving — but we rarely train the organ doing the work.

### Constraints
1. Working memory is severely limited (~4+-1 chunks)
2. Cognitive modes are mutually exclusive
3. Memory is reconstructive, not photographic
4. Attention depletes under sustained load
5. Expertise = pattern recognition, not rule-following

### Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Deep focus (L-mode) | Precise analysis, debugging | No creativity; tunnel vision | Writing code, tracing logic |
| Diffused attention (R-mode) | Insight, pattern matching | No precision; cannot verify | When stuck, designing architecture |
| Spaced repetition | Long-term retention | Upfront effort; feels slower | Facts, APIs, syntax |
| Cramming / re-reading | Feels productive | No durable learning; illusion of competence | Never |
| Solo deep work | Uninterrupted flow | Missing collaborative insight | Complex problem blocks |
| Pairing / discussion | Multiple perspectives | Context switching cost | When stuck, code review |

### Failure Modes
1. **Misapplication:** L-mode brute force on problems requiring insight
2. **Over-application:** Always being "on" — no diffused time means no insight generation
3. **Under-application:** Never deliberately practicing weak areas

---

## Thematic Principles

### Theme 1: Dual-Mode Thinking (R-mode vs L-mode)

| Mode | Characteristics | Best For | Danger |
|------|-----------------|----------|--------|
| **R-mode** | Parallel, intuitive, holistic, pattern-matching | Insight, design, stuck problems | Cannot explain itself; may be wrong confidently |
| **L-mode** | Sequential, verbal, analytical, symbolic | Implementation, verification, debugging trace | Tunnel vision; brute-forces wrong paths |

**Key principles:**
- R-mode is always on but cannot be commanded; L-mode dominates attention
- Step away to let R-mode deliver the "aha!" moment
- Capture R-mode output immediately — it is fleeting and non-verbal
- Feed R-mode, verify with L-mode: input -> diffuse -> insight -> analyze -> repeat

---

### Theme 2: The Dreyfus Model of Skill Acquisition

| Stage | Characteristics | How to Advance | Danger |
|-------|-----------------|---------------|--------|
| **Novice** | Needs rules, context-free | Follow recipes exactly | Following rules that do not apply |
| **Advanced Beginner** | Uses context, wants info fast | Try tasks independently | Dunning-Kruger |
| **Competent** | Sets goals, troubleshoots deliberately | Tackle harder problems deliberately | "Good enough" trap |
| **Proficient** | Sees situations holistically | Study experts' intuitions | Abandons rigor too early |
| **Expert** | Intuits solutions, sees the invisible | Teach; challenge assumptions | Wrong with high confidence |
| **Master** | Transcends rules, operates at principle level | Mentor across domains | Rarely achieved |

**For developers:**
- A senior React dev may be a novice in distributed systems
- Moving to a new language/framework drops you a level — expect it
- Deliberate practice is the only path past Competent

---

### Theme 3: Learning How to Learn

**SQ3R — Verified reading protocol:**
1. **Survey** — Skim headings, summaries, diagrams. Build a map.
2. **Question** — Formulate questions you want answered.
3. **Read** — Actively seek answers. Do not highlight — write.
4. **Recite** — Summarize in your own words. Teach an imaginary audience.
5. **Review** — Spaced review: 1 day, 3 days, 1 week, 2 weeks, 1 month.

**Spaced repetition > Cramming:**
- Retrieval strengthens memory more than exposure
- Slight struggle during retrieval is more effective than easy recognition
- Tools: Anki, RemNote, Mochi

**Mind maps for R-mode:**
- Central concept in center; branch by association, not hierarchy
- Use color, images, spatial relationships
- Best for: exploring new domains, brainstorming design, connecting concepts

---

### Theme 4: The Exobrain (External Memory)

**Core insight:** Your brain is for having ideas, not holding them. Externalize everything.

**What to capture:**
- Bugs solved (with root cause and fix)
- Design decisions (with context and constraints)
- Learning notes (distilled, not copied)
- Ideas and insights (fleeting -> literature -> permanent)

**Capture -> Process -> Distill -> Apply cycle:**
1. **Capture** — Fast, low-friction, everywhere
2. **Process** — Daily/weekly review; decide: act, delegate, defer, delete
3. **Distill** — Rewrite in your own words; connect to existing knowledge
4. **Apply** — Use in code, teach to colleague, blog post

**Danger:** Digital hoarding — collecting without processing is procrastination with a productivity aesthetic.

---

### Theme 5: Attention Management

**Core insight:** You cannot run at 100% all the time. Attention is a depleting resource.

**The productivity formula:**
- **Focused work:** 90-120 min blocks, 1-2 per day maximum
- **Diffused time:** Walks, showers, chores, exercise — prime R-mode territory
- **Sleep:** Non-negotiable; memory consolidation happens during sleep
- **Environment:** Remove interruptions (phone, notifications, chat)

**Context switching cost:** Every interruption costs 10-20 minutes to recover deep focus.

---

## Actionable Steps

### Immediate (This Week)
1. **Audit your stuck-debugging pattern.** Next time you are stuck >30 min, set a timer and walk away for 10 min. Document whether insight arrived.
2. **Start one spaced repetition deck.** Pick one API or syntax area you keep looking up. Create 5 cards. Review daily for a week.
3. **Create a capture inbox.** One place (paper, app, IDE snippet) for all ideas, bugs, notes. Process it every Friday.

### Short-Term (This Month)
4. **Apply SQ3R to one technical book or spec.** Do not just read — survey, question, read, recite, review.
5. **Map one skill domain on the Dreyfus model.** Where are you Novice? Competent? Expert? Pick one Novice area and schedule deliberate practice.
6. **Design one 90-minute focus block.** Same time daily. No notifications, no chat, no email. Measure what you ship.

### Ongoing (This Quarter)
7. **Build a personal knowledge system.** Not a collection — a connected graph. Link notes bidirectionally. Review monthly.
8. **Teach something you learned.** Blog post, lunch talk, or pair-programming session. Teaching forces recitation and reveals gaps.
9. **Protect sleep as a work activity.** 7-8 hours. No screens 30 min before bed. Track correlation with problem-solving ability.

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence |
|-------|----------|
| R-mode delivers insight after stepping away | Hunt ch. 3; Oakley ch. 2 |
| Spaced repetition beats cramming | Brown et al. Make It Stick |
| Experts use pattern recognition | Dreyfus model; Gamma et al. |
| Working memory ~4 chunks | Cowan (2001) |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Mind maps are universally effective | Some learners prefer linear outlines | Context-dependent; visual/spatial thinkers benefit most |
| 10,000 hours = expertise | Ericsson: it is deliberate practice, not hours | Modified: quality and structure matter |
| Deep work requires isolation | Collaborative insight is real | Context-dependent; design phase vs implementation phase |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Tooling recommendations (Anki, etc.) | Medium | 2027-01 |
| Core cognitive principles | Low | 2028-01 |
