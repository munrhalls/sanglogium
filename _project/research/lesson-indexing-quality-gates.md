# Lesson Indexing System - Quality Gates & Architecture Contracts (v+1)

**Purpose:** Compound lesson → index system that compounds knowledge without bloat.

**Core Principle:** Only lessons that are verified, actionable, and retrievable enter the system.

---

## The Three Quality Gates

### Gate 1: Is This Real? (Verification)

**Question:** Is this based on actual verified work?

**Check:**
- Root cause identified (not symptom)
- Evidence exists (code change, bug fix, test failure)
- Source work unit referenced
- No assumptions ("might be", "probably")

**Reject if:** ANY check fails.

---

### Gate 2: Can I Use This? (Actionability)

**Question:** Is this specific and actionable?

**Check:**
- Prevention rule is clear
- Explainable in <2 sentences
- Not generic advice ("be more careful")
- Has clear when-to-apply conditions

**Reject if:** ANY check fails.

---

### Gate 3: Can I Find This? (Retrieval)

**Question:** Can this be found when needed?

**Check:**
- 3-5 specific keywords
- Keywords match search patterns
- Mapped to ONE theme
- Indexed in INDEX.md

**Reject if:** ANY check fails.

---

## Organization: Thematic (Not Role-Based)

**Why Thematic:**
- Patterns cross roles (e.g., "GROQ reference syntax" affects everyone)
- Pattern discovery across contexts
- Future-proof (roles change, patterns persist)

**Why Not Role-Based:**
- Silos knowledge
- Duplicates lessons
- Retrieval friction (must know role to find)

### Thematic Schema

```
_project/lessons/
├── patterns/          # Architectural patterns
├── failures/          # Root cause analyses
├── prompting/         # AI interaction optimization
├── workflows/         # Process improvements
├── sops/              # Standard procedures
├── anti-patterns/     # What NOT to do
└── INDEX.md           # Keyword map
```

**Theme Definitions:**

| Theme | What It Holds | Example |
|-------|---------------|---------|
| patterns | Reusable solutions | "Use ES modules only" |
| failures | Root causes + prevention | "GROQ reference on non-reference field" |
| prompting | AI optimization | "Provide context before asking for code" |
| workflows | Process improvements | "Add pre-flight to /sprint" |
| sops | Step-by-step procedures | "How to debug GROQ" |
| anti-patterns | Dangerous defaults | "Don't assume SVGR" |

---

## Three Anti-Bloat Mechanisms

### Mechanism 1: Single Theme Rule

**Rule:** Every lesson maps to EXACTLY ONE theme.

**Why:** Prevents duplication and over-organization.

**Enforcement:** Gate 3 requires "Mapped to ONE theme"

---

### Mechanism 2: Keyword Limit

**Rule:** Every lesson has 3-5 keywords, no more.

**Why:** Prevents keyword spam that makes retrieval noisy.

**Enforcement:** Gate 3 requires "3-5 specific keywords"

---

### Mechanism 3: Simplicity Limit

**Rule:** Every lesson <2 sentences.

**Why:** Verbose lessons are never read.

**Enforcement:** Gate 2 requires "Explainable in <2 sentences"

---

## INDEX.md Contract

**Purpose:** Single source of truth for lesson retrieval.

**Structure:**

```markdown
# Lesson Index

**Last Updated:** YYYY-MM-DD
**Total Lessons:** [count]

## Keyword Map

| Keyword | Lesson File | Theme |
|---------|-------------|-------|
| groq | groq-reference-syntax.md | failures |
| reference | groq-reference-syntax.md | failures |
| es-modules | es-modules-only.md | patterns |
```

**Update Rules:**
1. Add when lesson created
2. Remove when lesson deleted
3. Update timestamp on every change

**Retrieval:**
1. Query INDEX.md for keywords
2. Load lesson from mapped theme
3. Return prevention rule

---

## System Contract

### Entry Points

```
/learn              → Extracts lessons → _project/lessons/ (Gates 1-3)
/lesson-capture     → Simple capture → .windsurf/memories/ (Gates 1-2)
/organic-learn      → Raw sessions → _training/real-time/ (no gates)
```

### Quality Gate Application

| Entry Point | Gates Applied |
|-------------|---------------|
| /learn | 1-3 (full) |
| /lesson-capture | 1-2 (verification, actionability) |
| /organic-learn | None (raw preservation) |

### Storage Strategy

| Type | Storage | Indexing |
|------|---------|----------|
| Codified | `_project/lessons/` | INDEX.md |
| Memory | `.windsurf/memories/` | Memory system |
| Organic | `_training/real-time/` | Manual |

---

## Implementation

### Phase 1: Create INDEX.md

Create `_project/lessons/INDEX.md` with empty structure.

### Phase 2: Migrate Existing Lessons

Move from `.windsurf/memories/` to `_project/lessons/` by theme:
- `architecture.md` → patterns/
- `compound-development-lessons.md` → patterns/, failures/
- `ide-ram-leak-lesson.md` → failures/

Apply Gates 1-3 to each.

### Phase 3: Update Workflows

Update `/learn.md` and `/retrieve-lessons.md` to reference INDEX.md.

---

## Success Criteria

**System succeeds when:**
- INDEX.md exists and is updated
- All lessons pass Gates 1-3
- Lessons retrievable by keyword in <10 seconds
- Lesson count grows slowly (compound, not bloat)

**System fails when:**
- Lessons accumulate without retrieval
- INDEX.md outdated or missing
- Lessons vague or unverified
- Keywords spammy or irrelevant

---

## Verification

**Claims Verified:**
- Thematic > role-based: Cross-cutting patterns
- 3 gates prevent bloat: Filters vague/unverified
- INDEX.md enables retrieval: Single source of truth

**Falsification Attempts:**
- Role-based faster: Silos prevent discovery (survived)
- More keywords = better: Spam makes retrieval noisy (survived)
- Longer lessons = detail: Verbose lessons unread (survived)

---

## Synthesis

**Decisions:**
| Decision | Rationale |
|----------|-----------|
| Thematic organization | Cross-cutting patterns, future-proof |
| 3 quality gates | Simpler than 5, prevents bloat |
| INDEX.md | Single source of truth for retrieval |
| 3 anti-bloat mechanisms | Minimal but effective |

**Immediate Actions:**
1. Create `_project/lessons/INDEX.md`
2. Migrate existing lessons
3. Update workflows to reference INDEX.md
