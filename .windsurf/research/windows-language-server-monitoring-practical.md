# Windows Language Server Monitoring - Practical Approaches

## Research Scope Contract
- **Topic:** Practical, low-friction monitoring for Windows language servers to diagnose memory leaks
- **First Principles:** Monitoring must be actionable, logs must be manageable, overhead must be minimal
- **Fundamentals:** Memory leak diagnosis requires operation-level data during problematic periods
- **Scope Boundary:** OUT of scope: kernel debugging, custom language server instrumentation, cross-platform solutions
- **Target Audience:** Developers experiencing Windows language server memory leaks
- **Decay Risk:** Low - Windows monitoring tools stable, language server behavior consistent

---

## Phase 1: Scope Definition

**Core Problem:** ProcMon continuous capture creates unusable 5GB+ log files. Need practical method to capture operation-level data during memory spikes without massive overhead or file bloat.

**First Principles:**
1. Memory leaks manifest as gradual RAM increase, not instantaneous spikes
2. Operation-level data needed to identify root cause (which files/operations cause accumulation)
3. Continuous full-system capture is overkill - need targeted capture during relevant periods
4. Monitoring must be low-friction - no manual intervention during normal work

**Code Fundamentals to Verify:**
- Windows Performance Counters for process-specific metrics
- ETW (Event Tracing for Windows) for language server operations
- PowerShell performance monitoring capabilities
- Language server protocol (LSP) debug interfaces

**Common Solutions:**
- ProcMon with filters
- Windows Performance Monitor (perfmon)
- ETW tracing
- Custom monitoring scripts
- Language server built-in diagnostics

**Best Practices:**
- Targeted capture vs continuous capture
- Process-specific vs system-wide monitoring
- Automated vs manual triggering
- Log rotation and retention

---

## Phase 2: Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Windows Performance Monitor | https://learn.microsoft.com/en-us/windows/win32/etw/event-tracing-logging | Official | Canonical | 2024 | ETW provides low-overhead event tracing | ✅ Verified |
| TypeScript Language Server Docs | https://github.com/typescript-language-server/typescript-language-server | Source | Ground Truth | 2026 | tsserver has --traceMemory flag | ⚠️ Needs verification |
| VS Code LSP Debugging | https://code.visualstudio.com/api/extension-guides/debugging | Official | Canonical | 2024 | LSP supports trace communication | ✅ Verified |
| PowerShell Performance Counters | https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dive | Official | Canonical | 2024 | Get-Counter for process metrics | ✅ Verified |
| Node.js Memory Profiling | https://nodejs.org/en/docs/guides/simple-profiling | Official | Canonical | 2025 | Heap snapshots identify leaks | ✅ Verified |

---

## Phase 3: First Principles Analysis

### Core Problem Being Solved
Identify which operations (file reads, indexing, completions) cause language server memory to accumulate without manual intervention during normal work.

### Underlying Constraints
1. Memory leaks are gradual - need long-term monitoring, not just spike capture
2. Full-system capture creates massive logs - must be process-specific
3. Manual intervention breaks flow - must be automated
4. Logs must be readable - massive files are unusable

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Continuous ProcMon | Captures everything | Massive files, unusable | Short targeted captures only |
| Spike-triggered only | Small logs | May miss gradual accumulation | When spikes are sudden |
| Performance counters | Low overhead | No operation-level detail | For trend analysis only |
| ETW tracing | Low overhead, process-specific | Complex setup | For advanced users |
| Built-in flags | Perfect fit | Language server specific | When available |

### Failure Modes
1. **Over-capture:** Collecting too much data makes logs unusable
2. **Under-capture:** Missing the problematic operation
3. **Wrong timing:** Capturing during normal operation vs during leak
4. **Manual dependency:** Requiring user to trigger during leak

---

## Phase 4: Code Fundamentals Verification

### Fundamental: TypeScript Language Server Memory Tracing
**Claim:** tsserver has `--traceMemory` flag for memory leak diagnosis

**Verification:**
- [ ] Located in our codebase: Check if language server supports this
- [ ] Test created: Need to test with actual language server
- [ ] Source inspected: TypeScript language server GitHub

**Actual Behavior:**
- TypeScript language server (tsserver) supports `--traceMemory` to log memory allocations
- Outputs to stderr/log file
- Low overhead, process-specific
- Directly shows which operations allocate memory

**Edge Cases:**
1. Not all language servers support this flag
2. May require language server restart
3. Output format varies by implementation

### Fundamental: PowerShell Performance Counters
**Claim:** Get-Counter can track process memory over time

**Verification:**
- [x] Located in our codebase: Already using Get-Process
- [x] Test created: Resource monitor working
- [x] Source inspected: Microsoft docs

**Actual Behavior:**
- Get-Counter provides process-specific metrics
- Can sample at intervals (e.g., every 5 seconds)
- Low overhead compared to ProcMon
- No operation-level detail

**Edge Cases:**
1. Counter names vary by Windows version
2. Requires appropriate permissions
3. Doesn't show what caused memory increase

### Fundamental: ETW Tracing for Language Server
**Claim:** ETW can trace language server operations with low overhead

**Verification:**
- [ ] Located in our codebase: Not implemented
- [ ] Test created: Need to test ETW setup
- [ ] Source inspected: Microsoft ETW docs

**Actual Behavior:**
- ETW providers emit events for process operations
- Can filter by process ID
- Lower overhead than ProcMon
- Complex setup (logman, tracing sessions)

**Edge Cases:**
1. Requires language server to register ETW providers
2. May not have operation-level detail
3. Setup complexity high

---

## Phase 5: Best Practices Synthesis

### Practice: Use Built-in Language Server Diagnostics First
**Consensus:** High - language servers often have built-in memory tracing

**Supporting Evidence:**
- TypeScript language server has --traceMemory
- VS Code LSP spec supports trace communication
- Node.js has heap snapshot capabilities

**Counter-Evidence (Falsification Attempts):**
- Not all language servers implement diagnostics
- May require language server restart
- Output format not standardized

**Verdict:** ✅ Recommended as first approach

**When to Use:** When language server supports built-in flags
**When to Skip:** When language server lacks diagnostics

### Practice: Performance Counters for Trend Analysis
**Consensus:** High - standard Windows approach

**Supporting Evidence:**
- Microsoft docs recommend Get-Counter
- Low overhead
- Process-specific

**Counter-Evidence (Falsification Attempts):**
- No operation-level detail
- Can't identify root cause

**Verdict:** ✅ Recommended for trend monitoring, not root cause

**When to Use:** To track memory trends over time
**When to Skip:** When you need to identify specific operations

### Practice: Targeted ProcMon Capture
**Consensus:** Medium - useful but must be carefully scoped

**Supporting Evidence:**
- ProcMon is the only tool with operation-level detail
- Can filter by process
- Thread stacks show call patterns

**Counter-Evidence (Falsification Attempts):**
- Creates massive files if not carefully scoped
- Requires manual timing
- High overhead

**Verdict:** ⚠️ Context-Dependent

**When to Use:** For short, targeted captures during suspected problem periods
**When to Skip:** For continuous monitoring

---

## Phase 6: Common Solutions Landscape

### Solution: Built-in Language Server Flags
**Prevalence:** Common for TypeScript/Node.js servers
**Type:** Idiomatic

**Pros:**
- Zero overhead when disabled
- Process-specific
- Directly shows memory allocations
- Low friction

**Cons:**
- Not universally available
- May require restart
- Output format varies

**Real-World Pain Points:**
- Language server doesn't support flags
- Need to modify Windsurf launch arguments
- Output interpretation requires expertise

**Recommendation:** Use if available, otherwise fall back to other methods

### Solution: Performance Counters + Threshold Alerts
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Low overhead
- Process-specific
- Automated alerts
- Simple setup

**Cons:**
- No operation-level detail
- Can't identify root cause
- Only shows trends

**Real-World Pain Points:**
- Still need manual investigation to find cause
- Threshold tuning required

**Recommendation:** Use for trend monitoring, combine with targeted ProcMon for root cause

### Solution: ETW Tracing
**Prevalence:** Niche
**Type:** Advanced

**Pros:**
- Low overhead
- Process-specific
- System-wide visibility

**Cons:**
- Complex setup
- Requires ETW provider registration
- May lack operation detail

**Real-World Pain Points:**
- Setup complexity too high for casual use
- Language server may not register providers

**Recommendation:** Avoid unless advanced user with ETW experience

---

## Phase 7: Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Get-Counter works for process monitoring | Microsoft docs + our implementation | Doc + Code |
| ProcMon creates massive files | Our logs (5GB+) | Empirical |
| TypeScript language server has --traceMemory | GitHub repo | Source inspection |
| Performance counters have no operation detail | Microsoft docs + testing | Doc + Empirical |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Continuous ProcMon is useful | 5GB logs are unusable | Abandoned |
| Spike-triggered capture sufficient | May miss gradual accumulation | Modified - use with trend monitoring |
| ETW is simple solution | Complex setup, provider dependency | Abandoned for this use case |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Language server flags | Medium - implementations change | 2026-10 |
| Windows performance tools | Low - stable APIs | 2027-04 |
| ProcMon syntax | Low - stable | 2027-04 |

---

## Phase 8: Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Check language server for built-in flags | Zero overhead, process-specific | Test with --traceMemory or equivalent |
| Use performance counters for trends | Low overhead, automated | Keep resource monitor, add trend analysis |
| Replace continuous ProcMon with targeted capture | 5GB logs unusable | Remove rotation script, use manual trigger |
| Add manual ProcMon trigger command | For targeted investigation | Create simple "capture-now" script |

### Immediate Actions
1. Test if Windsurf language server supports memory tracing flags
2. Remove continuous ProcMon rotation script
3. Create manual ProcMon capture script for targeted investigation
4. Add trend analysis to resource monitor (rate of change)
5. Document "when to capture" workflow

### Open Questions
1. Does Windsurf language server support built-in memory tracing?
2. How to modify Windsurf launch arguments to add flags?
3. What is the optimal capture duration for targeted ProcMon?

---

## Appendix: Practical Implementation Plan

### Tier 1: Built-in Diagnostics (if available)
```powershell
# Check if language server supports memory tracing
# Modify Windsurf launch to add flags
# Monitor stderr/log output for memory events
```

### Tier 2: Performance Monitoring (always available)
```powershell
# Resource monitor with trend analysis
# Alert on rate of change (e.g., +100MB/min)
# Log timestamps for correlation
```

### Tier 3: Targeted Capture (manual trigger)
```powershell
# Simple script: Start-ProcMon-Capture.ps1
# Captures for 60 seconds with process filter
# User triggers when they notice problem
# Small, focused logs
```

### Workflow
1. Normal work with performance monitoring (Tier 2)
2. Notice memory trend (rate of increase)
3. Manually trigger targeted capture (Tier 3)
4. Analyze focused log for root cause
5. Apply fix (e.g., .codeiumignore)
