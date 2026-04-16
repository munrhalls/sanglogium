# Failure: File Already Exists Blocking Progress

**Date:** 2026-04-14
**Source:** File creation attempt
**Severity:** Medium
**Frequency:** One-time (but systemic potential)

## The Problem
Cascade AI agent gets stuck when trying to create a file that already exists, halting progress on the task.

## Root Cause
The write_to_file tool returns an error when the target file already exists, and the agent doesn't have a default strategy to handle this common scenario.

## The Fix
```bash
# Instead of failing, check if file exists first
if (Test-Path $targetFile) {
    # Append or update existing file
    Add-Content $targetFile $newContent
} else {
    # Create new file
    New-Item $targetFile -Value $newContent
}
```

## Prevention
**MANDATORY:** Always check file existence before creation. If file exists, have a clear strategy:
1. **Append** - Add content to existing file
2. **Overwrite** - Replace entire file content
3. **Update** - Modify specific sections
4. **Version** - Create new version with timestamp

## Applicability
**When to apply:**
- Any file creation operation
- Log file generation
- Configuration file updates
- Report generation

**Keywords:** ["file-exists", "file-creation", "error-handling", "progress-blocking"]
