# Windsurf IDE: Latest Community & Industry Improvements

## Research Scope Contract
- **Topic:** Windsurf IDE best practices and improvements for building and shipping apps faster and more reliably (2025-2026)
- **First Principles:** 
  1. Agentic AI requires explicit context management
  2. Reproducible workflows beat one-off prompts
  3. Directory-scoped instructions > global rules
- **Fundamentals:** Cascade modes, Context management, MCP integration, Workflow automation
- **Scope Boundary:** Does not cover pricing comparisons, IDE installation basics, or non-Windsurf alternatives
- **Target Audience:** Developers using Windsurf for production development
- **Decay Risk:** High — AI IDE features evolve rapidly; review quarterly

---

## Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Status |
|--------|-----|------|-------------|------|-----------|--------|
| Windsurf Docs | docs.windsurf.com | Official | Canonical | 2026-04 | Cascade modes, AGENTS.md, MCP | ✅ Verified |
| Reddit r/windsurf | reddit.com/r/windsurf | Community | Pain points | 2026-04 | Workflow patterns, limitations | ✅ Verified |
| DataCamp Tutorial | datacamp.com | Educational | Secondary | 2026 | Feature overview | ✅ Verified |
| Builder.io Blog | builder.io | Comparison | Analysis | 2026 | IDE comparison | ⚠️ Context |

---

## First Principles Analysis

### Core Problem Being Solved
Windsurf addresses the **context fragmentation** problem in AI-assisted coding — where AI assistants lose track of project conventions, architectural decisions, and workflow patterns across sessions and files.

### Underlying Constraints
1. **LLM context windows are finite** — cannot hold entire large codebases
2. **AI needs explicit guidance** — cannot infer project conventions without documentation
3. **Repetitive tasks waste tokens** — same explanations repeated across sessions
4. **Directory-specific rules differ** — frontend vs backend have different patterns

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Global Rules | Consistent everywhere | Not specific enough | Universal conventions |
| AGENTS.md | Directory-scoped precision | Maintenance overhead | Different patterns per folder |
| Workflows | Repeatable, documented | Upfront setup cost | Repetitive tasks |
| MCP Tools | Extended capabilities | External dependencies | Integration-heavy projects |

### Failure Modes
1. **Vague AGENTS.md files** — "write good code" provides zero value
2. **Too many global rules** — overwhelm the context window
3. **Workflows without verification steps** — automation without validation
4. **MCP tools without error handling** — cascading failures from external tools

---

## Code Fundamentals (Windsurf-Specific)

### Fundamental: Cascade Modes
**Claim:** Three distinct modes (Code, Plan, Ask) optimize for different tasks

**Verification:**
- ✅ Documented in official docs
- ✅ Toggle available in Cascade panel (⌘+. / Ctrl+.)

**Actual Behavior:**
| Mode | Tools Available | Use Case |
|------|-----------------|----------|
| **Code** | All tools (file edits, terminal, etc.) | Complex features, refactoring |
| **Plan** | All tools | Complex features requiring planning |
| **Ask** | Search tools only | Learning, planning, questions |

**Best Practice:** Start complex features in **Plan Mode** to establish architecture before execution.

---

### Fundamental: AGENTS.md
**Claim:** Directory-scoped instructions automatically apply based on file location

**Verification:**
- ✅ Auto-discovered in root/subdirectories
- ✅ Fed into same Rules engine as `.windsurf/rules/`
- ✅ Location-based scoping works as documented

**Actual Behavior:**
- **Root directory**: Always-on rule (every message)
- **Subdirectories**: Glob rule (`<directory>/**`) — applies only when editing files in that directory

**Example Structure:**
```
my-project/
├── AGENTS.md              # Global (always-on)
├── frontend/
│   └── AGENTS.md          # Frontend-specific
├── backend/
│   └── AGENTS.md          # Backend-specific
└── .windsurf/
    └── workflows/         # Reusable workflows
```

**Best Practice Guidelines:**
```markdown
# Good — Specific, actionable
- Use TypeScript strict mode
- All API responses must include error handling
- Follow REST naming conventions

# Bad — Vague, unhelpful
- Write good code
- Be careful with errors
- Use best practices
```

---

### Fundamental: Fast Context
**Claim:** 20x faster code retrieval than traditional agentic search

**Verification:**
- ✅ Documented in official docs
- ✅ Uses SWE-grep models for rapid retrieval

**Actual Behavior:**
- Specialized subagent retrieves relevant code from large codebases
- Powers Cascade's ability to understand large codebases quickly
- Maintains frontier model intelligence while being faster

**Use When:**
- Working with large codebases (>100 files)
- Need to understand cross-file dependencies quickly
- Initial project onboarding

---

### Fundamental: Workflows
**Claim:** Reusable slash commands for repetitive tasks

**Verification:**
- ✅ Stored as markdown in `.windsurf/workflows/`
- ✅ Invoked via `/[workflow-name]`
- ✅ Can call other workflows from within workflows

**Structure:**
```markdown
---
description: Deploy the application
---

1. Run tests: `npm test`
2. Build project: `npm run build`
3. Deploy to production
```

**Discovery Locations:**
- Current workspace and sub-directories (`.windsurf/workflows/`)
- Git repository structure (searches up to git root)
- Multiple workspaces (deduplicated, shortest path shown)

---

### Fundamental: MCP (Model Context Protocol)
**Claim:** Extend Cascade with custom tools via MCP servers

**Verification:**
- ✅ Native integration in Windsurf
- ✅ Supports stdio, HTTP, SSE transports
- ✅ OAuth support for each transport

**Configuration:**
File: `~/.codeium/windsurf/mcp_config.json`
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<TOKEN>" }
    }
  }
}
```

**Limit:** Cascade has max 100 total tools across all MCPs.

**Tool Toggling:** Each MCP's tools can be enabled/disabled individually in settings.

---

### Fundamental: Memories & Rules
**Claim:** Two mechanisms for persisting context across conversations

**Actual Behavior:**
| Mechanism | Generation | Scope |
|-----------|------------|-------|
| **Memories** | Auto-generated by Cascade | User preferences, project patterns |
| **Rules** | Manually defined | Global, workspace, or system level |

**Rules Storage:**
- `.windsurf/rules/` — user-defined rules
- Global rules — IDE-wide settings
- System-level — Enterprise deployment

---

### Fundamental: Cascade Hooks
**Claim:** Execute custom shell commands at key workflow points

**Use Cases:**
- Logging Cascade operations
- Blocking dangerous commands
- Running formatters after edits
- Setting up worktrees

**Hook Events:**
- `pre_read_code`, `post_read_code`
- `pre_write_code`, `post_write_code`
- `pre_run_command`, `post_run_command`
- `pre_mcp_tool_use`, `post_mcp_tool_use`
- `pre_user_prompt`, `post_cascade_response`

---

### Fundamental: Skills
**Claim:** Reusable capabilities defined via SKILL.md files

**Format:**
```markdown
---
name: deployment
version: 1.0.0
description: Deploy to production
---

## Steps
1. Run pre-deploy checks
2. Build application
3. Deploy to production
```

**Storage:** `.windsurf/skills/` or `.windsurf/workflows/`

**Invocation:** Automatic (pattern match) or manual (`/[skill-name]`)

---

## Best Practices (Verified)

### Practice 1: Use AGENTS.md for Directory-Specific Rules
**Consensus:** High — officially recommended

**Evidence:**
- Windsurf docs: "ideal for providing targeted guidance without cluttering global config"

**Implementation:**
- Create `AGENTS.md` at project root for global conventions
- Create subdirectory `AGENTS.md` for folder-specific patterns
- Be specific, use code examples

---

### Practice 2: Start Complex Work in Plan Mode
**Consensus:** High — explicitly recommended

**When to Use:** Architecture decisions, complex features, refactoring planning
**When to Skip:** Simple edits, one-line changes, quick questions

---

### Practice 3: Use Workflows for Repetitive Tasks
**Consensus:** Medium — community pattern

**Examples:**
- `/deploy` — deployment workflow
- `/pr-review` — code review checklist
- `/test-and-build` — CI-style validation

---

### Practice 4: Leverage MCP for External Integrations
**Consensus:** Medium — emerging pattern

**Common MCPs:**
- GitHub — PR management, issues
- Supabase — database operations
- Figma — design integration
- Jira — ticket management

---

### Practice 5: Use Fast Context for Large Codebases
**Consensus:** High — explicitly documented

**When:** Projects with >100 files
**Why:** 20x faster than traditional search

---

## Common Solutions Landscape

### Solution: Vibe and Replace
**Prevalence:** Windsurf-native
**Type:** Idiomatic

**Pros:**
- Natural language transformations
- Multiple modes available

**Cons:**
- Requires clear instructions

---

### Solution: AI Commit Messages
**Prevalence:** Built-in feature
**Type:** Idiomatic

**Usage:**
1. Stage files in Git panel
2. Click ✨ icon next to commit message
3. Review and edit
4. Commit

**Limitations:**
- Large commits = generic messages
- Specialized terminology may not be captured

---

### Solution: App Deploys
**Prevalence:** Integrated feature
**Type:** Idiomatic

**Supported Providers:** Netlify (more coming)

**Process:**
1. One-click deploy from IDE
2. Project auto-detected
3. Claim deployment after build

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Cascade has 3 modes | Official docs | Documentation |
| AGENTS.md auto-discovery | Official docs | Documentation |
| Fast Context 20x faster | Official docs | Documentation |
| MCP 100 tool limit | Official docs | Documentation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| AGENTS.md replaces global rules | Works alongside, not replaces | Modified — complementary |
| Workflows are just aliases | Can call other workflows | Survived — more powerful |
| MCP requires enterprise | Available to all | Abandoned — available to all |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| MCP tools | High | 2026-07 |
| Cascade modes | Low | 2026-10 |
| AGENTS.md | Low | 2026-10 |
| Fast Context | Low | 2026-10 |
| Workflows | Medium | 2026-07 |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Adopt AGENTS.md | Directory-scoped guidance for different areas | Create at root and in `app/`, `lib/`, `sanity/` |
| Use Workflows | Repeatable patterns for /research, /debug, /test | Store in `.windsurf/workflows/` |
| Leverage Plan Mode | Complex checkout/basket flows need planning | Switch to Plan mode for architecture |
| Implement MCPs | Sanity, Stripe, deployment integrations | Configure `mcp_config.json` |

### Immediate Actions
1. **Create root AGENTS.md** — Project-wide conventions (Next.js 15, TypeScript strict)
2. **Create subdirectory AGENTS.md** — Specific patterns for `app/`, `lib/checkout/`, `sanity/`
3. **Convert existing workflows** — Move `.windsurf/workflows/*.md` to verified structure
4. **Evaluate MCP needs** — Identify external tools (GitHub, deployment, database)

### Open Questions
- Which MCP servers would benefit this project most?
- Should we use Cascade Hooks for pre-commit validation?
- How to structure AGENTS.md for maximum clarity?

---

## Summary

Windsurf's 2025-2026 improvements focus on **context management** and **workflow automation**:

1. **AGENTS.md** — Directory-scoped instructions (most impactful)
2. **Cascade Modes** — Plan mode for architecture, Code mode for execution
3. **Fast Context** — 20x faster codebase understanding
4. **Workflows** — Reusable slash commands
5. **MCP** — External tool integration
6. **Memories & Rules** — Persistent context across sessions

**Key Insight:** The shift from "prompt engineering" to "context engineering" — explicit, structured guidance beats clever prompting.

---

*Research completed: 2026-04-12*
*Next review: 2026-07-12 (quarterly)*
