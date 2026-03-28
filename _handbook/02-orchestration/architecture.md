# Orchestration: Agent Team Architecture

---

## Executive Summary

Sang-Logium employs a **hybrid agent architecture** combining:
- **Deterministic command agents** (specialized by function)
- **Human-in-the-loop governance** (you maintain control)
- **Orchestration via structured workflows** (not autonomous agent swarms)

**Current Maturity Score: 7.2/10** (Tier 2-3 per 2026 standards)

---

## 1. Agent Team Structure

### 1.1 The Current Agent Roster

| Agent Role | Workflow File | Purpose | Status |
|------------|---------------|---------|--------|
| **Implement Agent** | `implement.md` | Feature implementation with zero regression | ✅ Active |
| **Debug Agent** | `debug.md` | Root-cause analysis via Component Archaeology | ✅ Active |
| **Test Agent** | `test.md` | Test creation and verification | ✅ Active |
| **Commit Agent** | `commit.md` | Autonomous commit execution | ✅ Active |
| **Sprint Agent** | `sprint.md` | Sprint planning and DoD generation | ✅ Active |
| **Audit Agent** | `audit.md` | Codebase auditing | ❌ Empty (Gap) |
| **Research Agent** | `research.md` | Research and learning tasks | ❌ Empty (Gap) |
| **Scripts Agent** | `scripts.md` | Script automation | ❌ Empty (Gap) |

### 1.2 Agent Specialization Pattern

Each agent has:
- **Explicit Scope:** What it does and doesn't do
- **Input Protocol:** Required information format
- **Output Format:** Standardized deliverable structure
- **Verification Method:** How success is proven
- **Failure Mode:** What happens when things go wrong

---

## 2. Coordination Architecture

### 2.1 The Human-AI Partnership Model

```
┌─────────────────────────────────────────────────────────────┐
│                    HUMAN WEB DEVELOPER                        │
│              (Strategic decisions, approval)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │Sprint   │   │Implement│   │Debug    │
    │Agent    │   │Agent    │   │Agent    │
    │(Plan)   │   │(Build)  │   │(Fix)    │
    └────┬────┘   └────┬────┘   └────┬────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
               ┌────────▼────────┐
               │  Verification   │
               │  (Human + Auto)   │
               └────────┬────────┘
                        │
               ┌────────▼────────┐
               │   Commit Agent  │
               │   (Execute)     │
               └─────────────────┘
```

### 2.2 Command Flow

1. **Human decides** what needs to happen (strategic)
2. **Sprint Agent** creates plan with DoDs (planning)
3. **Implement Agent** executes to DoDs (building)
4. **Human verifies** visual/functional outcome (approval)
5. **Commit Agent** executes git commands (automation)

---

## 3. The Missing Pieces (Critical Gaps)

### 3.1 Gap 1: MCP Retrieval Server [CRITICAL - P0]

**Current State:** MCP server provides static resources only
**Target State:** Tier 3 Knowledge Retrieval Service

**Required Tools:**
```typescript
type RetrievalTools = {
  list_subsystems(): string[];
  get_files_for_subsystem(key: string): string[];
  find_relevant_context(task: string): ContextDocument[];
  search_context_documents(query: string): SearchResult[];
  suggest_agent(task: string): AgentSpec;
};
```

**Impact:** 60-80% reduction in routine implementation errors (per research)

### 3.2 Gap 2: Agent Tab Management

**Current State:** 10+ agent tabs in horizontal scroll (Windsurf limitation)
**Target State:** Organized, named, globally visible agents

**Solution:**
- Naming convention: `[TYPE][##]_[SCOPE]_[STATUS]`
- Types: D=Debug, I=Implement, T=Test, A=Audit, R=Research, F=Fix
- Example: `D01_VFS_Debug`, `I02_Cart_Feat`, `T03_API_Test`

**Status Suffixes:**
- `_Active` - Currently working
- `_Blocked` - Waiting on dependency
- `_Review` - Needs review
- `_Done` - Completed

### 3.3 Gap 3: Global Monitoring Dashboard

**Current State:** No visibility into all active agents
**Target State:** Mission Control dashboard (self-hosted)

**Recommended Tool:** Mission Control
- Self-hosted: ✅
- Free: ✅
- No registration: ✅
- Kanban board: ✅
- Real-time monitoring: ✅

**Setup:**
```bash
git clone https://github.com/builderz-labs/mission-control.git
cd mission-control
npm install
npm run dev
# Dashboard at http://localhost:3000
```

---

## 4. Agent Selection Decision Matrix

| Task Type | Primary Agent | Secondary | Human Checkpoints |
|-----------|---------------|-----------|-------------------|
| New feature implementation | Implement | Test | Visual verification |
| Bug investigation | Debug | Test | Root cause approval |
| Production hotfix | Debug | Implement | Urgent review |
| Refactoring | Implement | Audit | Regression testing |
| Test creation | Test | Implement | Coverage review |
| Sprint planning | Sprint | Human | Scope approval |
| Code auditing | Audit | Human | Finding review |
| Documentation | Research | Human | Accuracy check |
| Git operations | Commit | Human | Pre-commit review |

---

## 5. Memory Management Strategy

### 5.1 Three-Tier Memory Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ TIER 1: HOT MEMORY (Every Session)                      │
│ • .windsurfrules (57 lines)                             │
│ • .windsurf/memories/architecture.md (187 lines)        │
│ • Current sprint context                                │
│ • Active scope contract                                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ TIER 2: WARM MEMORY (Per Task Type)                     │
│ • Workflow files (.windsurf/workflows/*.md)             │
│ • Command protocols (_project/COMMANDS/*.md)             │
│ • Scope templates (_project/SCOPE/*.md)                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ TIER 3: COLD MEMORY (Retrieved On Demand)               │
│ • Sprint documentation (_project/*.todo)               │
│ • Research findings (_contexts/)                        │
│ • Audit reports (_project/*AUDIT*.md)                  │
│ • Git history (retrieved via commands)                   │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Context Retrieval Protocol

**Rule:** Agents perform worse with oversized context; targeted retrieval outperforms dumping.

**Preferred Pattern:**
1. Identify task type → Load relevant Tier 2 workflow
2. Identify scope → Load specific Tier 3 documentation
3. Execute with minimal, targeted context

**Anti-Pattern (Avoid):**
- Loading all documentation "just in case"
- Including irrelevant file paths in context
- Passing entire git history

---

## 6. Quality Gates & Verification

### 6.1 Automated Gates (hooks.json)

```json
{
  "postWrite": {
    "enabled": true,
    "command": "npm run lint",
    "shell": "powershell",
    "description": "Automatically run linter on every file write"
  }
}
```

### 6.2 Manual Gates (Human Required)

1. **Visual Verification:** UI/DOM state review before commit
2. **Scope Approval:** Sprint plan review before execution
3. **Root Cause Approval:** Debug hypothesis before fix
4. **Regression Approval:** Test results review

### 6.3 Mathematical Proof Gates

Every agent must provide:
- **Verification Command:** Exact PowerShell command
- **Expected Output:** What success looks like
- **Failure Response:** Revert and re-evaluate protocol

---

## 7. Failure Modes & Recovery

### 7.1 Agent Failure Patterns

| Failure | Cause | Recovery |
|---------|-------|----------|
| Scope drift | Agent modifies files outside bounds | Revert, re-clarify boundaries |
| Verification fail | Command doesn't pass | Revert, fix, re-verify |
| Context overflow | Too much information provided | Refine context, re-target |
| Agent hallucination | Made-up file paths or APIs | Verify against actual codebase |
| Premature optimization | Agent "improves" outside scope | Revert to scoped change only |

### 7.2 Recovery Protocol

1. **Stop:** Do not continue with failed state
2. **Revert:** Undo any partial changes
3. **Analyze:** Determine root cause of failure
4. **Refine:** Adjust scope, context, or approach
5. **Retry:** Execute with corrected parameters

---

## 8. Performance Metrics

### 8.1 Current Velocity Indicators

From git history analysis (March 2026):
- **Commit velocity:** 50+ commits/day during active sprints
- **DoD closure rate:** Mix of "closes DoD items" and "closes 0 DoD items"
- **Category distribution:** Heavy on D (Configuration) and C (Refactor)
- **Difficulty distribution:** 1-5 (light to medium), few 8+ (heavy)

### 8.2 Target Velocity Profile

| Metric | Current | Target |
|--------|---------|--------|
| A-category commits | ~20% | ~40% |
| B-category commits | ~10% | ~15% |
| D-category commits | ~50% | ~30% |
| Mean difficulty | 3-5 | 3-5 |
| DoD closures | ~30% | ~60% |

### 8.3 Agent Efficiency Metrics

- **Context precision:** % of provided context actually used
- **Revert rate:** % of agent commits that get reverted
- **Verification pass rate:** % of first-attempt verifications passing
- **Scope adherence:** % of work staying within defined boundaries

---

## 9. Recommended Agent Configuration

### 9.1 Immediate Actions (Today)

1. **Implement naming convention** on all current agent tabs
2. **Populate empty workflow slots** (audit.md, research.md, scripts.md)
3. **Configure session logging** in hooks.json

### 9.2 Short Term (This Week)

1. **Deploy Mission Control** locally
2. **Create agent selection runbook**
3. **Implement MCP retrieval prototype**

### 9.3 Medium Term (This Month)

1. **Full MCP integration** with Windsurf/Cascade
2. **Automated agent context optimization**
3. **Cross-agent knowledge sharing system**

---

## 10. Agent Orchestration Checklist

- [ ] Agent naming convention applied to all tabs
- [ ] Each agent has explicit input/output protocol
- [ ] Verification commands defined and tested
- [ ] Tier 1 memory (.windsurfrules) current and accurate
- [ ] Tier 2 workflows complete (no empty files)
- [ ] Tier 3 documentation organized and retrievable
- [ ] Human checkpoints defined for each agent type
- [ ] Failure mode protocols documented
- [ ] Global monitoring dashboard deployed
- [ ] MCP retrieval server implemented

---

**Next:** [02-orchestration/coordination-patterns.md](coordination-patterns.md) - Multi-agent coordination and handoff patterns
