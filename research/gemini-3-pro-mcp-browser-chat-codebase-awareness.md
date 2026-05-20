# MCP for Gemini 3 Pro - Browser Chat Codebase Awareness

## Research Scope Contract
- **Topic:** MCP integration for Gemini 3 Pro browser chat to enable local codebase awareness
- **First Principles:** MCP is open protocol for AI-to-system connectivity; browser sandbox prevents local server connections
- **Fundamentals:** MCP server configuration, transport mechanisms, client support matrix
- **Scope Boundary:** Browser-based Gemini chat interface ONLY (not CLI, not desktop apps)
- **Target Audience:** Developer seeking codebase awareness in Gemini web interface
- **Decay Risk:** HIGH - Google may add MCP support to web interface at any time

---

## Critical Finding

**Gemini's web browser interface (gemini.google.com) does NOT currently support custom MCP servers.**

### Evidence
| Source | URL | Type | Claim | Status |
|--------|-----|------|-------|--------|
| Reddit Community | https://www.reddit.com/r/Bard/comments/1mftsj1/gemini_web_interface_why_no_option_to_add_remote/ | Community | "Gemini web interface why no option to add remote MCP servers" | ✅ Confirmed - feature missing |
| Google Support | https://support.google.com/gemini/thread/368009900 | Official | Empty thread - no guidance exists | ✅ Confirmed - no official support |

---

## What DOES Support MCP

| Platform | MCP Support | Local Codebase Access |
|----------|-------------|----------------------|
| **Gemini CLI** | ✅ YES | ✅ YES (via filesystem server) |
| **Claude Desktop** | ✅ YES | ✅ YES (via filesystem server) |
| **VS Code** | ✅ YES | ✅ YES (via filesystem server) |
| **Gemini Web (browser)** | ❌ NO | ❌ NO |

---

## If You Want Codebase Awareness with Gemini

### Option 1: Use Gemini CLI (Not Browser)

**Setup:**
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Configure MCP server in ~/.gemini/settings.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "c:\\webdev\\sang-logium"
      ]
    }
  }
}
```

**Usage:**
```bash
gemini
# Then use @ syntax to reference files
```

### Option 2: Use Claude Desktop (Not Gemini)

**Setup:**
```json
// Windows: %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "c:\\webdev\\sang-logium"
      ]
    }
  }
}
```

---

## Why Browser Chat Cannot Support Local MCP

### First Principles
1. **Browser Sandbox:** Web browsers cannot execute local processes or connect to localhost servers
2. **Security Model:** Allowing browser-based AI to access local filesystem would be security violation
3. **Transport Constraints:** MCP uses stdio (local process) or SSE (localhost) - both blocked in browser

### Remote MCP Servers (Possible Future)
Google hosts remote MCP servers for Google services:
- Developer Knowledge MCP: `developerknowledge.googleapis.com`
- Google Workspace MCP: Remote access to Google services
- Google Analytics MCP: Remote access to Analytics data

**But these are for Google services, NOT local codebases.**

---

## Minimal Verdict

**You cannot use Gemini's web browser interface with MCP to access your local codebase.**

**To get codebase awareness with Gemini, you must use Gemini CLI (terminal-based), not the web interface.**

---

## Verification Date
2026-05-20

## Re-Check Date
2026-08-20 (Google may add web MCP support)
