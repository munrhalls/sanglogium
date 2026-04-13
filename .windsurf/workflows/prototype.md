---
description: Rapid exploration workflow - 30 minute prototype, no scope contracts, no tests, just working code
---

# /Prototype Command Protocol

**Role:** Rapid exploration mode. Speed over rigor. Working code over perfect code.

**Trigger:** When you have a new idea, UI experiment, or greenfield feature and want to test direction quickly.

**Time Budget:** 30 minutes max. If not working by 30 min, discard or pivot.

**Output:** Working code in `/_prototypes/` folder. Not production. Not tested. Just proves direction.

---

## RELIABILITY PROOF

**Why this works:**
- Time-box prevents over-investment in bad directions
- Isolation in `/_prototypes/` prevents pollution of production codebase
- No tests = no test maintenance burden for throwaway code
- Kimi/Haiku = fast generation, cheap iteration

**Failure modes (and how to prevent):**
| Failure | Prevention |
|---------|------------|
| Prototype goes to production | `/harden` command REQUIRED before merge |
| 30 min becomes 3 hours | Hard stop at timer, assess: discard/iterate/harden |
| Prototype code copied into production | `/_prototypes/` is git-ignored, forces explicit hardening |
| No learning captured | MANDATORY: Document in `progress.txt` and optionally `/learn` if pattern discovered |

---

## PROTOCOL

### Step 1: Declare Mode (30 seconds)
```
PROTOTYPE MODE ACTIVATED
- Goal: [One sentence]
- Time limit: 30 minutes
- Success criteria: [What "works" means]
```

### Step 2: Single-Sentence Prompt (2 minutes)
Write ONE sentence describing what you want. Not a spec. Not requirements. Just intent.

**Example:**
- GOOD: "Make a 3D flying game in browser with skyscrapers"
- BAD: "Create a flight simulator with Three.js, implement physics engine, add multiplayer support, ensure mobile compatibility..."

### Step 3: AI Generation (15 minutes)
Use Kimi or Haiku (NOT Opus). Fast, cheap, good enough.

**Prompt template:**
```
Create a working prototype: [your one-sentence]

Constraints:
- Working code that demonstrates the concept
- No error handling needed
- No tests needed
- No documentation needed
- Can use placeholder data
- Just needs to "work" in browser/dev environment

Output to: /_prototypes/[name]/
```

### Step 4: Test (10 minutes)
Manually verify it works. No automated tests.

**Checklist:**
- [ ] Concept is demonstrated
- [ ] Core interaction works
- [ ] No showstopper crashes

### Step 5: Decision (3 minutes)
**Must choose one:**

| Decision | Action | Time Budget |
|----------|--------|-------------|
| **DISCARD** | Delete `/_prototypes/[name]/` | 0 min |
| **ITERATE** | Another 30-min cycle | 30 min |
| **HARDEN** | Run `/harden` workflow | 2-4 hours |

**Rule:** You CANNOT skip this decision. No "I'll harden it later" without explicit `/harden` trigger.

---

## ANTI-PATTERNS (These Will Break You)

❌ **Prototype creep:** Adding tests, docs, or polish during prototype phase  
❌ **Prototype merge:** Copying code directly to production without hardening  
❌ **No decision:** Leaving prototype in limbo without discard/iterate/harden choice  
❌ **Prototype stack:** Accumulating 10+ prototypes none of which get hardened  

---

## SUCCESS INDICATORS

- Prototype completed in ≤30 min
- Clear decision made (discard/iterate/harden)
- `progress.txt` updated with outcome
- If hardened: clean production code within 4 hours

## FAILURE INDICATORS

- Prototype took >30 min
- No decision after 30 min (limbo)
- Code copied to production without hardening
- Multiple abandoned prototypes in `/_prototypes/`

---

## POST-PROTOTYPE: /harden Trigger

If decision = HARDEN:
```
/harden /_prototypes/[name]/
```

This transfers control to systematic workflow with full rigor.
