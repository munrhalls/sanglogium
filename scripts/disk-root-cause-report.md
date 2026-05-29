# Root Cause Analysis: Disk Space Exhaustion

## Executive Summary

**Claim:** `.logs/checkout-traces/` and `scripts/research/` accumulate without rotation, causing disk exhaustion.
**Verdict:** FALSE. These directories are NOT the root cause.

**Actual Root Cause:**
1. **Manual backup folder** (`sang-logium-backup`) — ~2.5 GB of duplicated project files
2. **Next.js webpack cache** (`.next/cache/webpack/`) — ~890 MB of unbounded `.pack` file accumulation
3. **System-level bloat** — OneDrive (104 GB), Downloads (46 GB), Games (36 GB)

---

## Evidence

### Claim 1: `.logs/checkout-traces/` is unbounded
**Status:** ❌ FALSE — Directory is EMPTY
```
CHECKOUT-TRACES: 0 MB, Files: 0
```
The `verify-transaction-trace.mjs` script writes to `latest-checkout-trace.json` (single file, overwritten each run), not to a traces subdirectory. No accumulation occurs.

### Claim 2: `scripts/research/` output accumulates
**Status:** ❌ FALSE — Directory is 0.11 MB
```
SCRIPTS/RESEARCH: 0.11 MB, Files: 7
```
The `autoresearch.mjs` script writes to `_project/research/autoresearch/` (not `scripts/research/`). It has deduplication logic and bounded output (one file per iteration).

### Actual Finding 1: `sang-logium-backup` folder
**Status:** ✅ CONFIRMED — ~2.5 GB bloat source
- Complete copy of the entire project
- Included: `.git/` (250 MB), `node_modules/` (1 GB+), `.next/cache/` (1.1 GB), `.venv/` (222 MB)
- **Deleted:** Freed ~2.5 GB

### Actual Finding 2: `.next/cache/webpack/` accumulation
**Status:** ✅ CONFIRMED — ~890 MB and growing
```
.next/cache/webpack/
├── client-production/
│   ├── 0.pack              259 MB
│   ├── index.pack           31 MB
│   ├── index.pack.old       31 MB
│   └── ...
└── server-production/
    ├── 1.pack              231 MB
    ├── 2.pack              126 MB
    ├── 0.pack               85 MB
    ├── index.pack           54 MB
    ├── index.pack.old       54 MB
    └── ...
```
**Problem:** Webpack generates `.pack` files on each build. Old `.pack` files and `.pack.old` backups are NOT automatically cleaned up. Over time this accumulates to hundreds of MB per build mode.

### Actual Finding 3: System-level bloat (outside project)
```
C:\Users\janpi\OneDrive          104 GB
C:\Users\janpi\Downloads           46 GB
C:\Riot Games\League of Legends   36 GB
C:\Program Files (x86)             23 GB
C:\Program Files                   17 GB
```

---

## Recommendations

### Immediate (fixes the recurrence)

1. **Add webpack cache cleanup to build process**
   ```json
   // package.json
   "scripts": {
     "prebuild": "node scripts/build-catalogue-index.mjs && rimraf .next/cache/webpack",
     ...
   }
   ```

2. **Add scheduled cleanup script**
   ```powershell
   # scripts/cleanup-build-cache.ps1
   $cachePath = ".next/cache/webpack"
   if (Test-Path $cachePath) {
       Get-ChildItem $cachePath -Recurse -Filter "*.pack.old" | Remove-Item -Force
       Get-ChildItem $cachePath -Recurse -Filter "*.pack" | 
           Sort-Object LastWriteTime -Descending | 
           Select-Object -Skip 3 | 
           Remove-Item -Force
   }
   ```

3. **Never create full project backups in-place**
   - Use git for version control
   - Use external drives or cloud for backups
   - If temporary copy needed, delete immediately after use

### Medium-term (prevention)

4. **Add disk space monitoring**
   - GitHub Action or local cron to check C: drive free space
   - Alert when < 10% free (currently at ~4%)

5. **Clean up system folders**
   - OneDrive: Review sync settings, move to cloud-only
   - Downloads: Clear old installers and archives
   - Games: Uninstall if not playing

6. **Use `npm ci` instead of `npm install` in CI**
   - Prevents node_modules bloat from lockfile drift

---

## Checks Performed

| Check | Result |
|-------|--------|
| `.logs/checkout-traces/` size | 0 MB — NOT a cause |
| `scripts/research/` size | 0.11 MB — NOT a cause |
| `sang-logium-backup/` size | ~2,500 MB — ROOT CAUSE #1 |
| `.next/cache/webpack/` size | ~890 MB — ROOT CAUSE #2 |
| `node_modules/` size | ~1,052 MB — Normal, not unbounded |
| Sanity CMS backups | ~12 MB — Normal |
| System-level bloat | OneDrive 104 GB, Downloads 46 GB — Contributing factor |

---

## Conclusion

The disk space issue was caused by:
1. A **manual backup copy** of the entire project (~2.5 GB)
2. **Unbounded webpack cache accumulation** (~890 MB)

The suspected logging/research directories were NOT contributing. The fix requires cache cleanup automation and backup discipline, not log rotation.
