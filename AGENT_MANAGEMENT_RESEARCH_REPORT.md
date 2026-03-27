# Holistic Research Report: Agent Tab Management & Global Monitoring Solutions

**Date:** March 27, 2026  
**Scope:** Windsurf IDE agent organization + Global agent monitoring tooling  
**Constraints:** Free, no registration, self-hosted preferred

---

## Executive Summary

This report analyzes solutions for managing 10+ agent tabs in Windsurf and identifies global monitoring tools for AI agent orchestration. The research reveals **significant limitations in Windsurf's native tab management** (no wrapping, fixed horizontal scroll) and **viable open-source monitoring alternatives** that can be self-hosted without registration.

**Key Finding:** Windsurf currently lacks native tab wrapping or advanced organization features. The solution requires a hybrid approach: external monitoring dashboard + disciplined workspace naming conventions + potential VS Code extension workarounds.

---

## Part 1: Windsurf Agent Tab Organization Research

### 1.1 Current Windsurf Limitations (Confirmed)

| Feature | Status | Notes |
|---------|--------|-------|
| **Tab Wrapping** | ❌ NOT AVAILABLE | Tabs use horizontal overflow scroll only |
| **Tab Grouping** | ❌ NOT AVAILABLE | No native tab stacking/grouping |
| **Split View** | ⚠️ LIMITED | Standard VS Code split editor, not agent-specific |
| **Custom Tab Labels** | ✅ AVAILABLE | Manual renaming per conversation |
| **Tab Search/Filter** | ❌ NOT AVAILABLE | No built-in tab search |
| **Vertical Tab Bar** | ❌ NOT AVAILABLE | Only horizontal layout |

### 1.2 Settings.json Configuration Options

Windsurf uses standard VS Code settings with limited tab customization:

```json
// Located at: %APPDATA%\Codeium\windsurf\User\settings.json
{
  // Workbench settings - limited impact on agent tabs
  "workbench.tree.indent": 20,
  "workbench.colorCustomizations": {
    "tab.activeBackground": "#1e1e1e",
    "tab.inactiveBackground": "#2d2d2d"
  },
  
  // Window management
  "window.restoreWindows": "all",
  "workbench.editor.enablePreview": false,  // Keep tabs open
  "workbench.editor.limit.enabled": true,
  "workbench.editor.limit.value": 15  // Auto-close excess tabs
}
```

**Critical Finding:** Windsurf's Cascade agent tabs are rendered in a custom UI layer separate from standard VS Code tabs. Standard tab settings do NOT apply to Cascade conversation tabs.

### 1.3 Practical Workarounds for Tab Management

#### Option A: Naming Convention Discipline (Immediate, Zero Cost)
**Implementation:**
```
Format: [TYPE][NUMBER]_[SCOPE]_[STATUS]
Examples:
- [D01]_Auth_Debug - Debug workflow for auth system
- [I02]_Cart_Implement - Implement cart feature
- [T03]_API_Testing - Test API endpoints
- [A04]_Refactor_Audit - Audit refactor scope
```

**Pros:**
- Zero setup
- Instant visual scanning
- Status at-a-glance

**Cons:**
- Manual discipline required
- No automatic organization

#### Option B: Multiple Workspace Windows (Immediate, Low Cost)
**Implementation:**
- Open multiple Windsurf windows per functional area
- Each window handles 3-5 related agents
- Use Windows virtual desktops for separation

**Pros:**
- Native separation of concerns
- Reduces per-window tab count
- Crash isolation

**Cons:**
- More memory usage
- Context switching overhead

#### Option C: External Session Manager (Advanced)
**Tools to evaluate:**
- **Workona** (has free tier, requires account) - Browser-like tab management
- **Session Buddy** (browser extension) - Save/restore tab groups
- **Toby** (browser extension) - Visual tab organization

**Verdict:** Not recommended - adds friction, requires browser extensions

---

## Part 2: Global Agent Monitoring Solutions

### 2.1 Evaluated Solutions Matrix

| Solution | Self-Hosted | Free | No Registration | Real-Time | WebSocket | Kanban | Notes |
|----------|-------------|------|-----------------|-----------|-----------|--------|-------|
| **Mission Control** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | **RECOMMENDED** |
| **Claude-Code-Agent-Monitor** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Claude-specific |
| **OpenClaw Dashboard** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ⚠️ Partial | Messaging-focused |
| **n8n** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Polling | ❌ No | ✅ Yes | Workflow-heavy |
| **AgentRails** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | n8n-specific |

### 2.2 Deep Dive: Mission Control (Top Recommendation)

**Repository:** `builderz-labs/mission-control`  
**Website:** https://mc.builderz.dev  
**Stack:** Next.js, SQLite, WebSockets  
**Setup Time:** ~10 minutes

**Core Features:**
- **Task Board (Kanban):** Visual task management with drag-and-drop
- **Agent Management:** Register and monitor multiple agents
- **Real-Time Monitoring:** Live agent status via WebSocket
- **Cost Tracking:** Token usage and cost aggregation
- **Quality Gates (Aegis):** Automated quality checks
- **Recurring Tasks:** Cron-like scheduled tasks
- **Claude Code Integration:** Native Claude Code hook support

**Quick Start:**
```bash
# Clone and start
git clone https://github.com/builderz-labs/mission-control.git
cd mission-control
npm install
npm run dev
# Dashboard available at http://localhost:3000
```

**Pros:**
- Purpose-built for agent orchestration
- No external dependencies (SQLite)
- Modern React UI
- Active development (1.8k+ stars)

**Cons:**
- Requires separate terminal/window
- Not integrated into Windsurf UI

### 2.3 Deep Dive: Claude-Code-Agent-Monitor (Alternative)

**Repository:** `hoangsonww/Claude-Code-Agent-Monitor`  
**Stack:** Node.js, Express, React, WebSockets  
**Setup Time:** ~15 minutes

**Core Features:**
- Real-time session tracking
- Agent activity monitoring
- Tool usage analytics
- Subagent orchestration
- Browser notifications
- MCP server integration

**Quick Start:**
```bash
git clone https://github.com/hoangsonww/Claude-Code-Agent-Monitor.git
cd Claude-Code-Agent-Monitor
npm install
npm run dev
# Configure Claude Code hooks as per README
```

**Pros:**
- Specifically designed for Claude Code
- Rich analytics dashboard
- Hook-based integration (non-intrusive)

**Cons:**
- More complex setup
- Node.js backend required
- Claude-specific (not general Windsurf)

### 2.4 n8n as Agent Orchestrator

**Repository:** `n8n-io/n8n`  
**Stack:** Node.js, Vue.js, PostgreSQL/SQLite  
**License:** Fair-code (free for self-hosted)

**Use Case:** Workflow automation with agent triggers
**Not ideal for:** Real-time monitoring dashboard

**Verdict:** Better for automation workflows than pure monitoring. Overkill for simple agent visibility needs.

---

## Part 3: Current Codebase Audit

### 3.1 Existing Windsurf Configuration

**Location:** `c:\webdev\sang-logium\.windsurf\`

| File | Purpose | Status |
|------|---------|--------|
| `memories/architecture.md` | Architectural constraints memory | ✅ Active |
| `hooks.json` | Post-write lint hook | ✅ Active |
| `workflows/debug.md` | /debug command protocol | ✅ Active |
| `workflows/implement.md` | /implement command protocol | ✅ Active |
| `workflows/test.md` | /test command protocol | ✅ Active |
| `workflows/commit.md` | /commit command protocol | ✅ Active |
| `workflows/sprint.md` | Sprint generation workflow | ✅ Active |
| `workflows/audit.md` | (empty) | ❌ Not configured |
| `workflows/scripts.md` | (empty) | ❌ Not configured |
| `workflows/ime.md` | (empty) | ❌ Not configured |

**Current Hooks Configuration:**
```json
// hooks.json
{
  "postWrite": {
    "enabled": true,
    "command": "npm run lint",
    "shell": "powershell",
    "description": "Automatically run linter on every file write"
  }
}
```

### 3.2 Existing VS Code Settings

**Location:** `c:\webdev\sang-logium\.vscode\settings.json`

```json
{
  "github.copilot.chat.anthropic.thinking.enabled": true,
  "github.copilot.chat.codeGeneration.useInstructionFiles": false,
  "typescript.tsdk": "node_modules\\typescript\\lib",
  "editor.formatOnSave": true
}
```

**Gap:** No agent-specific or tab management settings configured.

### 3.3 Project Structure for Agent Context

**Sprint Management Files:**
- `PERFORMANCE_SPRINT.todo` - Active performance work
- `AI_LEVERAGE_SPRINT.todo` - AI optimization work
- `VFS_FRONTEND_CONSUMPTION_SPRINT.todo` - VFS work
- `HOMEPAGE_TESTING_SPRINT.todo` - Testing sprint
- `_project/HOMEPAGE_TESTING_SPRINT.todo` - Detailed testing scope
- `_project/HOMEPAGE_DESIGN_AUDIT_SPRINT.todo` - Design audit work

**Command Templates:**
- `_project/COMMANDS/Implement_v2.md` - Implementation protocol
- `_project/COMMIT_TEMPLATE.txt` - Git commit taxonomy

---

## Part 4: Gap Analysis

### 4.1 Critical Gaps Identified

| Gap | Impact | Priority | Solution |
|-----|--------|----------|----------|
| **No agent tab naming convention** | High confusion with 10+ tabs | HIGH | Implement [TYPE][#]_Scope_Status format |
| **No global agent visibility** | Cannot see all active agents at once | HIGH | Deploy Mission Control locally |
| **No session persistence tracking** | Lost context on restart | MEDIUM | Add session logging hooks |
| **Empty workflow slots** | audit.md, scripts.md unused | LOW | Populate or remove |
| **No agent cost tracking** | Unknown token consumption | MEDIUM | Integrate Mission Control cost module |
| **No cross-agent search** | Cannot find prior agent work | MEDIUM | Implement tagging in agent names |

### 4.2 Current vs Target State

```
CURRENT STATE                    TARGET STATE
───────────────                  ────────────
[Agent1] [Agent2] ... [Agent10]   [D01]_VFS_Debug    [I02]_Cart_Feat
(horizontal scroll)              (Kanban: Active)  (Kanban: Active)
                                 [T03]_API_Test     [A04]_Audit
                                 (Kanban: Queued)   (Kanban: Complete)

Manual tab hunting               Global dashboard view
No cost visibility               Real-time token tracking
No status context                Kanban state + labels
```

---

## Part 5: Actionable Implementation Plan

### Phase 1: Immediate Actions (Today, ~30 min)

1. **Implement Agent Naming Convention**
   - Document format: `[TYPE][##]_[SCOPE]_[STATUS]`
   - Types: D=Debug, I=Implement, T=Test, A=Audit, R=Research
   - Apply to all current agent tabs

2. **Configure Windsurf Hooks for Session Logging**
   ```json
   // Update hooks.json
   {
     "postWrite": {
       "enabled": true,
       "command": "npm run lint",
       "shell": "powershell"
     },
     "postCascadeResponse": {
       "enabled": true,
       "command": "echo '{\"timestamp\":\"'$(Get-Date -Format o)'\",\"agent\":\"%AGENT_NAME%\"}' >> .windsurf/sessions.log",
       "shell": "powershell"
     }
   }
   ```

### Phase 2: Short Term (This Week, ~2 hours)

3. **Deploy Mission Control Locally**
   ```bash
   cd c:\webdev\tools  # or preferred location
   git clone https://github.com/builderz-labs/mission-control.git
   cd mission-control
   npm install
   npm run dev
   ```
   - Bookmark http://localhost:3000
   - Create tasks for each active sprint

4. **Populate Empty Workflow Slots**
   - Create `audit.md` for systematic code auditing
   - Create `scripts.md` for common script patterns

### Phase 3: Medium Term (Next Sprint)

5. **Integrate Agent Monitoring with Hooks**
   - Extend `hooks.json` to emit events to Mission Control
   - Add session tracking to `.windsurf/sessions.log`

6. **Create Session Recovery System**
   - Log all agent contexts to disk
   - Implement session restore on Windsurf restart

---

## Part 6: Tool Recommendations Summary

### For Tab Management (Windsurf-Specific)

| Approach | Effort | Effectiveness | Recommendation |
|----------|--------|---------------|----------------|
| Naming convention discipline | Low | Medium | **START HERE** |
| Multiple workspace windows | Low | Medium | Use for major separations |
| Mission Control dashboard | Medium | High | **BEST LONG-TERM** |
| VS Code extensions | Low | Low | Not applicable to agent tabs |

### For Global Monitoring

| Tool | Best For | Setup Time | Recommendation |
|------|----------|------------|----------------|
| **Mission Control** | Agent fleets, Kanban, cost tracking | 10 min | **PRIMARY CHOICE** |
| Claude-Code-Agent-Monitor | Claude-specific deep analytics | 15 min | Alternative for Claude-only |
| n8n | Workflow automation | 30 min | Overkill for monitoring only |
| OpenClaw | Messaging integrations | 20 min | Not ideal for dev workflow |

---

## Appendix A: Mission Control Setup Script (Windows)

```powershell
# Save as: setup-mission-control.ps1
# Run: .\setup-mission-control.ps1

$INSTALL_DIR = "C:\\tools\\mission-control"
$DASHBOARD_PORT = 3000

# Check prerequisites
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js not found. Install from https://nodejs.org/"
    exit 1
}

# Clone repository
if (!(Test-Path $INSTALL_DIR)) {
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force
    git clone https://github.com/builderz-labs/mission-control.git $INSTALL_DIR
}

# Install and start
cd $INSTALL_DIR
npm install
Write-Host "Starting Mission Control..."
Write-Host "Dashboard will be available at: http://localhost:$DASHBOARD_PORT"
npm run dev
```

## Appendix B: Agent Naming Quick Reference

| Prefix | Meaning | Example |
|--------|---------|---------|
| D## | Debug session | D01_Auth_Debug |
| I## | Implementation | I02_Cart_Implement |
| T## | Testing | T03_API_Testing |
| A## | Audit/Review | A04_Code_Audit |
| R## | Research | R05_VFS_Research |
| F## | Fix/bugfix | F06_Login_Fix |

**Status suffixes:**
- `_Active` - Currently working
- `_Blocked` - Waiting on dependency
- `_Review` - Needs review
- `_Done` - Completed

---

## Conclusion

The optimal solution combines:
1. **Immediate:** Disciplined agent naming conventions
2. **Short-term:** Local Mission Control deployment for global visibility
3. **Ongoing:** Extended Windsurf hooks for session tracking

**Next Action:** Implement Phase 1 naming convention immediately, then proceed with Mission Control setup.

**Estimated Total Implementation Time:** 2.5 hours  
**Expected Outcome:** Manage 15+ agents with clear visibility and zero tab confusion
