# Gemini 3 Pro - GitHub Repository Awareness in Browser Chat

## Research Scope Contract
- **Topic:** GitHub repository awareness for Gemini 3 Pro browser chat (gemini.google.com)
- **First Principles:** Gemini web app has native GitHub integration (not MCP-based)
- **Fundamentals:** Built-in feature vs MCP server distinction
- **Scope Boundary:** Gemini web browser interface ONLY (not CLI, not IDEs)
- **Target Audience:** Developer seeking codebase awareness in Gemini web interface
- **Decay Risk:** LOW - Native feature, stable

---

## Critical Finding

**Gemini web app has NATIVE GitHub integration - NO MCP setup required.**

This is a built-in feature, not an MCP server integration.

---

## How It Works (Native Feature)

### Setup Steps
1. Go to https://gemini.google.com
2. In text box, click **+** → **More uploads** → **Import code**
3. Paste GitHub repository or branch URL
4. Click **Import**
5. Follow on-screen instructions (link GitHub account if private repo)

### Requirements
- Gemini Advanced subscription ($20/month)
- Age 18+
- Keep Activity enabled
- Work/school accounts: Qualifying Workspace edition + admin enablement

### Limits
- **One repository per chat**
- **Max 5,000 files**
- **Max 100 MB total size**
- **No sync** - repository snapshot at import time
- **Desktop only** - not available on mobile

---

## What This Is NOT

| Technology | Purpose | Gemini Web Support |
|------------|---------|-------------------|
| **Native GitHub Integration** | Built-in Gemini feature | ✅ YES |
| **GitHub MCP Server** | MCP protocol for IDEs/CLIs | ❌ NO |
| **Local MCP Server** | Filesystem access via MCP | ❌ NO |

### GitHub MCP Server (For Reference Only)
- **Remote endpoint:** https://api.githubcopilot.com/mcp/
- **Supported hosts:** VS Code, Claude Desktop, Cursor, Windsurf
- **NOT supported:** Gemini web app (browser interface)

---

## Evidence

| Source | URL | Type | Claim | Status |
|--------|-----|------|-------|--------|
| Google Support | https://support.google.com/gemini/answer/16176929 | Official | "Import a GitHub repository & ask about it in the Gemini web app" | ✅ Verified |
| TechCrunch | https://techcrunch.com/2025/05/14/... | News | "Gemini Advanced customers can directly add a public or private codebase on GitHub" | ✅ Verified |
| GitHub MCP Docs | https://github.com/github/github-mcp-server | Official | "Install in VS Code, Claude Desktop, Cursor, Windsurf" (NOT Gemini web) | ✅ Verified |

---

## Minimal Verdict

**To get codebase awareness in Gemini browser chat:**

1. **Subscribe to Gemini Advanced** ($20/month)
2. **Use native "Import code" feature** (no MCP setup needed)
3. **Paste your GitHub repository URL** when prompted

**That's it.** No MCP server configuration required.

---

## Verification Date
2026-05-20

## Re-Check Date
2026-11-20 (feature is stable, but limits/pricing may change)
