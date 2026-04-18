# Lessons Organization Schema

**Purpose:** Thematic organization of accumulated knowledge for compound engineering — each lesson makes future work easier.

**Core Principle:** Every lesson is tagged, categorized, and retrievable. Agents query relevant themes before work begins.

---

## Directory Structure

```
_project/lessons/
├── README.md              # This file — organization schema
├── auto-lessons.md        # Chronological log (machine/appended)
├── INDEX.md               # Searchable index of all lessons by keyword
│
├── patterns/              # Architectural decisions, structural wisdom
│   ├── README.md
│   └── [pattern-name].md
│
├── failures/              # Root cause analyses of bugs and errors
│   ├── README.md
│   └── [failure-name].md
│
├── prompting/             # AI agent interaction optimization
│   ├── README.md
│   └── [prompting-lesson].md
│
├── workflows/             # Process improvements to slash commands
│   ├── README.md
│   └── [workflow-update].md
│
├── sops/                  # Standard operating procedures
│   ├── README.md
│   └── [procedure-name].md
│
└── anti-patterns/         # What NOT to do, dangerous defaults
    ├── README.md
    └── [anti-pattern-name].md
```

---

## Theme Definitions

### `patterns/` — Structural Wisdom
**When to store here:** Architectural decisions, code organization principles, design patterns that worked.

**Examples:**
- Functional grouping pattern for component development
- Server-first data fetching in Next.js 15
- VFS (Virtual File System) catalog architecture

**Retrieval triggers:** New feature development, architecture decisions, refactoring

---

### `failures/` — Root Cause Analyses
**When to store here:** Bugs, errors, surprises that cost time. The "never again" lessons.

**Examples:**
- ES Module/CommonJS mismatch causing build failures
- GROQ reference syntax on non-reference fields
- SVG import assumptions without SVGR config

**Retrieval triggers:** Debugging, similar tech stack work, pre-implementation checklists

---

### `prompting/` — Agent Interaction
**When to store here:** How to better prompt AI agents, context engineering discoveries.

**Examples:**
- Context compression techniques that maintain quality
- When to use structured vs free-form prompts
- Effective use of examples in prompts

**Retrieval triggers:** Writing new prompts, debugging agent behavior, workflow design

---

### `workflows/` — Process Evolution
**When to store here:** Improvements to slash commands, process optimizations.

**Examples:**
- Adding pre-flight checks to `/implement`
- Improving `/sprint` regression containment
- Branch management automation

**Retrieval triggers:** Updating workflow files, creating new commands

---

### `sops/` — Standard Operating Procedures
**When to store here:** Step-by-step procedures for recurring tasks.

**Examples:**
- How to run a diagnostic sprint
- Sanity schema migration procedure
- Performance audit methodology

**Retrieval triggers:** Recurring tasks, onboarding, checklist creation

---

### `anti-patterns/` — Dangerous Defaults
**When to store here:** What NOT to do. Patterns that consistently cause problems.

**Examples:**
- "All components L1 before any L2" — creates isolated islands
- "Assuming build passing = bug fixed" — need runtime verification
- "Reference syntax without checking schema" — silent GROQ failures

**Retrieval triggers:** Code review, design decisions, pre-implementation warnings

---

## Lesson Entry Schema

Every lesson file follows this structure:

```markdown
# [Theme]: [Concise Title — Max 5 words]

**Date:** YYYY-MM-DD
**Source:** [Sprint name / Debug session / Task ID]
**Severity:** [Critical | High | Medium | Low]
**Frequency:** [One-time | Recurring | Systemic]
**Status:** [Active | Superseded | Archived]

---

## The Problem
[Clear description of what went wrong or what was suboptimal]

## Root Cause
[Actual underlying cause, not just symptom]

## The Fix
```[code or process change that resolved it]```

## Prevention
[Actionable rule, check, or process change that prevents recurrence]

## Applicability

**When to apply this lesson:**
- [Specific situation 1]
- [Specific situation 2]

**Keywords for retrieval:**
- "keyword1"
- "keyword2"
- "keyword3"

**Related lessons:**
- [Link to related lesson]
- [Link to another related lesson]

---

## Codification Log

**Integrated into:**
- [ ] `.windsurfrules` (universal constraint)
- [ ] `workflows/[name].md` (process update)
- [ ] Memory system (auto-retrieval)
- [ ] Test suite (regression prevention)

**Date integrated:** YYYY-MM-DD
```

---

## Retrieval System

### Pre-Work Query Protocol

Before starting work, agents execute:

```markdown
## Pre-Work Context Loading

**Task type:** [e.g., "Sanity GROQ query modification"]
**Technologies involved:** ["sanity", "groq", "nextjs"]
**Risk areas:** ["data fetching", "type safety"]

### Query Plan:
1. Check INDEX.md for keywords: ["groq", "reference", "schema"]
2. Read relevant failure analyses
3. Load applicable patterns

### Relevant Lessons:
- [Lesson 1] — [Brief summary]
- [Lesson 2] — [Brief summary]

### Active Constraints:
- [Constraint derived from lessons]
```

### INDEX.md Structure

The INDEX.md is a searchable keyword → lesson mapping:

```markdown
# Lessons Index

## Keyword: groq
- [failures/groq-reference-syntax.md] — Reference syntax on non-reference fields
- [patterns/server-first-fetching.md] — Server component data patterns

## Keyword: sanity
- [failures/schema-migration-scope-drift.md] — Migration scope management
- [patterns/vfs-architecture.md] — Virtual file system design

## Keyword: svg
- [failures/svg-import-assumption.md] — SVGR configuration requirements
```

---

## Maintenance Rules

### Monthly
- Review `auto-lessons.md` and promote lessons to thematic storage
- Update INDEX.md with new keywords
- Archive superseded lessons

### Quarterly
- Audit lesson applicability (are they still relevant?)
- Consolidate duplicate/similar lessons
- Verify codification (lessons integrated into workflows)

### Per Sprint
- `/learn` command execution post-completion
- Immediate thematic storage of valuable lessons
- INDEX.md update for new keywords

---

## Quality Metrics

**Good Lesson:**
- Specific situation, not generic advice
- Clear root cause analysis
- Actionable prevention step
- Retrievable via keywords
- Integrated into workflows or rules

**Bad Lesson:**
- "Be more careful" — not actionable
- Only in auto-lessons.md — not organized
- No keywords — not retrievable
- Not codified — won't be applied

---

## Compound Engineering Principle

> "We codify all the learnings from everything we've done... and we codify them back into all the prompts and all the subagents and all the slash commands."
> — Dan Shipper

**The Loop:**
```
Work → Learn → Codify → Retrieve → Better Work → Learn → ...
```

Each iteration makes the agent more effective, the codebase more robust, and future work more predictable.
