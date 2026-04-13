---
description: Explicit work mode declaration - prevents forced deep work when shallow is appropriate
---

# /Mode Command Protocol

**Role:** Explicit state declaration for work mode. Prevents "shallow work filling the day" and "forced deep work when exhausted."

**Trigger:** At start of every work day, or when switching contexts.

**Time:** 60 seconds

**Output:** Clear mode declaration that guides all decisions until next declaration.

---

## RELIABILITY PROOF

**Why this works:**
- Cognitive load varies by hour/day — matching work to state prevents waste
- Explicit declaration prevents "accidental shallow day"
- Permission to do shallow work when tired prevents forced bad decisions
- Deep mode becomes intentional, protected, and rare (high value)

**Failure modes (and how to prevent):**
| Failure | Prevention |
|---------|------------|
| Always declaring SHALLOW (procrastination) | Weekly review: If DEEP < 20% of time, investigate |
| Forcing DEEP when exhausted | Honest energy assessment — bad deep work = bad decisions |
| Mode drift during day | Explicit re-declaration required to switch modes |
| No mode declared | Default = SHALLOW (safe fallback) |

---

## MODES

### DEEP MODE
**When:** High energy, clear 4-hour block, single complex task identified

**Characteristics:**
- 4-12 hour focus block
- No Slack, no email, no notifications
- Single task only
- Architecture decisions, complex debugging, new feature design

**Entry ritual:**
```
1. Close all non-essential apps
2. Set Slack status: "Deep mode until [time]"
3. Write single task on paper: "Today I will [specific outcome]"
4. Set timer for 4 hours minimum
5. Phone in another room
```

**Exit criteria:**
- Task complete, OR
- 12 hours elapsed, OR
- Physical/mental exhaustion (forced exit)

---

### SHALLOW MODE
**When:** Medium energy, fragmented time, maintenance tasks

**Characteristics:**
- 1-4 hour blocks
- Notifications allowed
- Multiple small tasks
- Bug fixes, code review, documentation, test updates

**Entry ritual:**
```
1. Open progress.txt, review TODOs
2. Pick 3 tasks max for the day
3. Check email/Slack once per hour max
4. Keep apps open (shallow allows interruption)
```

**Exit criteria:**
- 3 tasks complete, OR
- Day end, OR
- Energy surge → consider DEEP switch

---

### STOP MODE
**When:** Low energy, illness, external stress

**Characteristics:**
- No work
- Or: absolute minimum (clear inbox, respond to urgent only)

**Entry ritual:**
```
1. Declare: "Today is STOP mode"
2. Set auto-responder if needed
3. Do minimum or nothing
4. Do not feel guilty
```

**Rule:** STOP mode is better than bad work. Bad work creates debt.

---

## PROTOCOL

### Morning Declaration (60 seconds)
```
MODE DECLARATION: 2026-04-13

State: [DEEP / SHALLOW / STOP]
Energy: [1-10]
Sleep: [hours]
Blocks: [how many hours available]

Today I will: [one specific outcome for DEEP / three tasks for SHALLOW]

Conditions for DEEP switch: [what would trigger mode change]
```

**Write this in:**
- Terminal file: `echo "MODE: DEEP" > ~/.mode`
- Sticky note on monitor
- Top of progress.txt for the day

### Mode Switch Protocol
To switch modes, must re-declare:
```
MODE SWITCH: 2026-04-13 14:30
From: SHALLOW
To: DEEP
Reason: [specific trigger]
New focus: [specific outcome]
```

**Rule:** No implicit mode switches. Explicit or it didn't happen.

---

## MODE-DECISION MATRIX

| Task Type | DEEP | SHALLOW | STOP |
|-----------|------|---------|------|
| Architecture design | ✅ | ❌ | ❌ |
| Complex debugging | ✅ | ❌ | ❌ |
| New feature spec | ✅ | ❌ | ❌ |
| Bug fixes | ⚠️ (if root cause) | ✅ | ❌ |
| Code review | ❌ | ✅ | ❌ |
| Documentation | ❌ | ✅ | ❌ |
| Test updates | ❌ | ✅ | ❌ |
| Email/Slack | ❌ | ✅ | ❌ |
| Production deploy | ✅ | ❌ | ❌ |
| Hotfix | ⚠️ | ✅ | ❌ |

---

## ANTI-PATTERNS

❌ **Always SHALLOW:** 2 weeks without DEEP = avoidance  
❌ **Forced DEEP:** Exhausted but "should do deep work" = bad decisions  
❌ **Mode drift:** No declaration, just drift through day = neither deep nor shallow  
❌ **DEEP without ritual:** Notifications on, Slack open = interrupted deep = shallow  

---

## METRICS (Review Weekly)

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| DEEP % | 20-30% | <15% | <10% |
| SHALLOW % | 60-70% | >80% | >90% |
| STOP % | 5-10% | >15% | >20% |
| Mode switches/day | <2 | 3-4 | >4 |

**Review in:** `progress.txt` weekly summary section

---

## INTEGRATION WITH OTHER WORKFLOWS

| Mode | Workflows |
|------|-----------|
| DEEP | `/sprint`, `/implement`, `/harden` (architecture-heavy) |
| SHALLOW | `/prototype` (optional), `/trace`, `/test`, `/contain` |
| STOP | `/learn` (optional, if energy for reflection) |

---

## SUCCESS INDICATORS

- Daily declaration happens without fail
- DEEP mode 20-30% of days
- No forced DEEP when exhausted
- Clear mode switches (not drifting)

## FAILURE INDICATORS

- No declaration = default shallow
- 2+ weeks without DEEP
- Multiple mode switches per day
- DEEP sessions < 2 hours (interrupted)
