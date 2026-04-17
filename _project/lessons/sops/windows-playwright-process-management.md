# Windows Playwright Process Management

**Date:** 2026-04-16
**Source:** Playwright Integration Test Conversion
**Severity:** Critical
**Frequency:** Systemic (Windows environments)

## The Problem
Windows PowerShell commands hanging for 30+ minutes due to zombie Node.js processes from previous Playwright test runs, blocking all development work.

## Root Cause
1. **Zombie Processes**: Playwright test runs left Node.js processes that never terminated
2. **No Process Cleanup**: No automatic cleanup of background processes
3. **Resource Consumption**: Zombie processes consumed CPU and blocked subsequent commands
4. **Redis Connection Loops**: Failed Redis connections created retry storms

## The Fix
```powershell
# Pre-flight check
Get-Process node | Where-Object {$_.CPU -gt 10}
redis-cli ping

# Clean execution
npx playwright test --maxWorkers=1 --timeout=30000

# Post-flight cleanup
Get-Process node | Where-Object {$_.ProcessName -eq "node" -and $_.CPU -gt 5} | Stop-Process -Force
```

## Prevention

### Process Management SOP
1. **Pre-flight Check**: Always check for running Node processes before starting tests
2. **Kill Zombies**: Use `Stop-Process -Id <PID> -Force` for stuck processes
3. **Limit Workers**: Use `--maxWorkers=1` for Playwright to prevent process multiplication
4. **Set Timeouts**: Explicit timeout limits prevent infinite hangs

### Redis Connection SOP
1. **Version Requirement**: Use Redis 6.2.0+ (not 5.0.14)
2. **Connection Verification**: Run `redis-cli ping` before tests
3. **Timeout Configuration**: Set proper connection timeouts
4. **Retry Limits**: Prevent connection storms with retry caps

### Test Environment SOP
1. **Isolate Processes**: Separate test and development environments
2. **Clean Resources**: Automatic cleanup before/after test runs
3. **Monitor Resources**: Track CPU/memory during execution
4. **Dedicated Configs**: Use .env.test for test-specific settings

## Applicability
**When to apply:**
- Any Playwright test execution on Windows
- Long-running command execution
- Redis-dependent test environments
- CI/CD pipeline setup for Windows

**Keywords:** ["windows", "playwright", "process-hanging", "zombie-processes", "redis", "test-environment", "sop"]
