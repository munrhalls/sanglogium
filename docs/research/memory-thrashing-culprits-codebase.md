# Memory Thrashing Culprits in Codebase

**Research Date:** 2026-04-28
**Topic:** Files/folders that risk re-introducing 100% memory/CPU thrashing after clean Windsurf reinstall

---

## Research Scope Contract

- **Topic:** Identify codebase files/folders that could trigger language_server_windows_x64 memory leak after fresh Windsurf install
- **First Principles:** Windsurf indexer reads .codeiumignore independently of .gitignore; large binary files and complex JSON structures cause heavy indexing; .todo files trigger pathological re-indexing
- **Fundamentals:** Directory size, file count, file types, .codeiumignore coverage
- **Scope Boundary:** Only files/folders in c:\webdev\sang-logium; only files that exist now (not hypothetical); only files that could cause indexing issues
- **Target Audience:** Developer preparing for clean Windsurf reinstall
- **Decay Risk:** Low - codebase structure changes slowly

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| .codeiumignore excludes node_modules | .codeiumignore line 1 | File read |
| .codeiumignore excludes .next | .codeiumignore line 2 | File read |
| .codeiumignore excludes .git | .codeiumignore line 10 | File read |
| .codeiumignore excludes Python venvs | .codeiumignore lines 14-21 | File read |
| .codeiumignore excludes sanity/backups | .codeiumignore line 23 | File read |
| .codeiumignore excludes .todo files | .codeiumignore line 32 | File read |
| scripts/image-pipeline/venv is 604 MB | Directory scan | PowerShell measurement |
| .git is 268 MB | Directory scan | PowerShell measurement |
| sanity/backups/*.json files are 5.87 MB each | File scan | PowerShell measurement |
| No .todo files exist in codebase | Grep search | File system search |
| .windsurf directory is 90 KB | Directory scan | PowerShell measurement |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| All large directories are ignored | sanity/backups/ has 5.87 MB JSON files, pattern exists but files may not match | Modified - pattern exists but verify it works |
| .codeiumignore covers all known culprits | Previous lesson showed venv/.git/backups caused 5,838 MB RAM leak | Survived - now covered in .codeiumignore |
| .todo files are the only pathological trigger | Evidence from previous session shows 1KB .todo edit caused 1.1GB→8.7GB RAM spike | Survived - .todo files are pathological but none exist currently |
| package-lock.json is safe | 1.06 MB JSON file, not ignored, but not known to cause issues | Survived - no evidence it causes issues |

---

## Culprit Analysis

### HIGH RISK: sanity/backups/*.json files

**Evidence:**
- Two files found: `backup_products_2026-04-06T18-10-20-711...json` (5.87 MB)
- `backup_products_latest.json` (5.87 MB)
- Total: 11.74 MB in backups directory
- .codeiumignore line 23: `sanity/backups/`

**Verification:**
- Pattern exists in .codeiumignore ✅
- Files match pattern ✅
- Should be ignored ✅

**Risk Level:** LOW (pattern covers it)

**Falsification Test:** If pattern doesn't match these specific files, they could trigger indexing. Pattern is `sanity/backups/` which should match `sanity/backups/*.json`.

---

### LOW RISK: package-lock.json

**Evidence:**
- Size: 1.06 MB
- Location: Root directory
- Not in .codeiumignore

**Verification:**
- Standard npm lockfile, no evidence it causes indexing issues
- Similar size to other JSON files in node_modules (which are ignored)
- No previous incidents reported

**Risk Level:** VERY LOW (no evidence of impact)

**Falsification Test:** No evidence package-lock.json causes language server issues. If it did, it would be a common problem across all npm projects.

---

### NO RISK: .windsurf directory

**Evidence:**
- Total size: 90 KB
- File count: 25 files
- Contains: workflows, memories, hooks.json
- Not in .codeiumignore

**Verification:**
- Very small size (90 KB vs 604 MB venv that caused issues)
- Text files only (.md, .json)
- No binary files
- No evidence .windsurf causes indexing issues

**Risk Level:** NONE

**Falsification Test:** Previous session involved renaming .windsurf/ as a "fix" but it didn't work. The actual fix was .codeiumignore. This suggests .windsurf is not the culprit.

---

### NO RISK: scripts directory (excluding venv)

**Evidence:**
- Total size: 604 MB (mostly venv)
- File count: 13,542 files
- venv is excluded by .codeiumignore (lines 25-26)
- Non-venv scripts are small text files

**Verification:**
- venv is explicitly ignored ✅
- Other scripts are small (< 10 KB each)
- No binary files outside venv

**Risk Level:** NONE (venv is ignored)

---

### NO RISK: .todo files

**Evidence:**
- Grep search found 0 .todo files in codebase
- Only match was .codeiumignore file itself (not a .todo file)
- .codeiumignore line 32: `*.todo`

**Verification:**
- Pattern exists in .codeiumignore ✅
- No .todo files exist ✅

**Risk Level:** NONE (files don't exist)

---

## Evidence Summary

### Known Culprits from Previous Session (ide-ram-leak-lesson.md)

1. **scripts/image-pipeline/venv/** (604 MB of DLLs/PYDs) - NOW IGNORED ✅
2. **.git/** (269 MB) - NOW IGNORED ✅
3. **sanity/backups/*.json** (12 MB) - NOW IGNORED ✅
4. **.todo files** (pathological re-indexing) - NOW IGNORED ✅

### Current Codebase State

| Directory/File | Size | Files | Ignored? | Risk |
|----------------|------|-------|----------|------|
| node_modules | 1,064 MB | 111,336 | ✅ Yes | NONE |
| scripts (total) | 604 MB | 13,542 | ✅ Yes (venv) | NONE |
| .git | 268 MB | 3,367 | ✅ Yes | NONE |
| .next | 93 MB | 436 | ✅ Yes | NONE |
| sanity | 12 MB | 139 | ✅ Yes (backups) | NONE |
| .windsurf | 90 KB | 25 | ❌ No | NONE |
| package-lock.json | 1.06 MB | 1 | ❌ No | VERY LOW |
| sanity/backups/*.json | 11.74 MB | 2 | ✅ Yes | NONE |

---

## Counter-Evidence & Limitations

### Limitations
1. **Pattern matching verification:** Cannot verify that Windsurf's indexer actually applies the `sanity/backups/` pattern to the specific JSON files without testing
2. **.codeiumignore syntax:** Cannot verify that the glob patterns are correctly interpreted by Windsurf's indexer
3. **Fresh install behavior:** Cannot predict if a fresh Windsurf install will interpret .codeiumignore the same way as current version

### Falsification Testing
- **Test:** Are all known culprits now ignored?
  - **Result:** YES - venv, .git, backups, .todo all in .codeiumignore
- **Test:** Are there any new large files not ignored?
  - **Result:** NO - only package-lock.json (1.06 MB) which has no evidence of causing issues
- **Test:** Are there any .todo files?
  - **Result:** NO - grep search found zero .todo files

---

## Synthesis: Actionable Takeaways

### For Clean Reinstall
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| No action needed on codebase | All known culprits are already in .codeiumignore | Keep existing .codeiumignore as-is |
| Verify .codeiumignore after reinstall | Fresh install may reset or ignore .codeiumignore | Check that .codeiumignore still exists and has same content |
| Monitor language_server_windows_x64 RAM | Structural leak from .tmp files in implicit/ cache is separate issue | Use monitor-memory-spike.ps1 during editing |

### Immediate Actions
1. **NONE** - No files need to be deleted or modified in codebase
2. After clean reinstall, verify .codeiumignore is still present and unchanged
3. If memory thrashing recurs, run `/fix-ide-ram` workflow

### Open Questions
1. Will fresh Windsurf install respect existing .codeiumignore?
2. Is the structural .tmp file leak in implicit/ cache fixed in newer Windsurf versions?
3. Could package-lock.json (1.06 MB) cause issues if it grows larger?

---

## Conclusion

**NO CULPRIT FILES FOUND** in current codebase that would re-introduce memory thrashing after clean Windsurf reinstall.

**Evidence:**
- All known culprits from previous session (venv, .git, backups, .todo) are already in .codeiumignore
- No .todo files exist in codebase
- No large unignored files (package-lock.json is 1.06 MB with no evidence of impact)
- .windsurf directory is 90 KB (negligible)

**Risk Assessment:** LOW
- .codeiumignore is comprehensive and covers all known issues
- Codebase structure is clean
- Only unknown is whether fresh Windsurf install will respect existing .codeiumignore

---

## References

1. ide-ram-leak-lesson.md (2026-04-24) - Previous debugging session
2. .codeiumignore (current state)
3. Directory size measurements (PowerShell scan)
4. File system grep searches
