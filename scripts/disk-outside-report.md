# C: Drive Space Analysis — OUTSIDE sang-logium

**Scan Date:** 2026-05-28
**Scope:** C: drive excluding Windows system folders and `C:\webdev\sang-logium`
**Method:** Read-only recursive file enumeration

---

## Summary — Top Space Consumers

| Rank | Location | Size | Category |
|------|----------|------|----------|
| 1 | `C:\Users\janpi\AppData` | **107.54 GB** | User application data |
| 2 | `C:\Users\janpi\OneDrive` | **104.03 GB** | Cloud sync |
| 3 | `C:\Users\janpi\Downloads` | **45.97 GB** | Downloads |
| 4 | `C:\Program Files (x86)` | ~19 GB | Applications (32-bit) |
| 5 | `C:\Program Files` | ~17 GB | Applications (64-bit) |
| 6 | `C:\Riot Games` | ~36 GB | Games |
| 7 | `C:\webdev` (excl. sang-logium) | ~2.5 GB | Development |

**Total identifiable non-system space: ~340+ GB**

---

## Detailed Breakdown

### 1. AppData — 107.54 GB

| Subfolder | Size | Notes |
|-----------|------|-------|
| `AppData\Local` | **90.00 GB** | Application caches, temp data, package managers |
| `AppData\Roaming` | **17.18 GB** | App settings, profiles |
| `AppData\LocalLow` | 0.37 GB | Low-integrity app data |

**Likely large consumers in AppData\Local (common patterns, not individually scanned):**
- `npm-cache` — npm package cache (can be 5-20 GB)
- `pip` / `pipx` — Python package caches
- `Microsoft` — Edge/Teams/Office caches
- `Docker` — Container images and volumes
- `Temp` / `TEMP` — Windows temp files
- `Programs` / `Programs\Python` — Installed local apps
- `Cursor` / `VS Code` — Editor caches and extensions
- `Yarn` / `pnpm` — Alternative package manager caches

**Recommendations:**
- ⭐ **Run `npm cache clean --force`** — Can free 5-15 GB
- ⭐ **Run `pip cache purge`** — Can free 1-5 GB
- ⭐ **Clear `%LOCALAPPDATA%\Temp`** — Can free 2-10 GB
- ⭐ **Docker Desktop: prune unused images** — Can free 5-20 GB
- Check `AppData\Local\Microsoft\Teams` — Known to balloon to 10+ GB

---

### 2. OneDrive — 104.03 GB

**Location:** `C:\Users\janpi\OneDrive`

**Analysis:**
- OneDrive syncs cloud files to local disk
- Files are accessible offline (taking local space)
- **NOT duplicates** — these are your actual documents/photos/files

**Recommendations:**
- ⭐ **Configure OneDrive to "Files On-Demand"** — Keeps files in cloud, only downloads on access
  - Right-click OneDrive tray icon → Settings → Sync and backup → "Free up space"
  - Or: right-click OneDrive folder → "Free up space"
- ⭐ **Review `OneDrive\Documents` and `OneDrive\Pictures`** — May contain old large files
- **DO NOT blindly delete** — these may be your only copies

---

### 3. Downloads — 45.97 GB

**File types found:**

| Type | Count | Size | Action |
|------|-------|------|--------|
| `.zip` | 46 files | **25.23 GB** | ⭐ Review and delete old archives |
| `.exe` | 77 files | **5.74 GB** | ⭐ Delete installers after use |
| `.msi` | 6 files | 0.29 GB | Delete installers |
| `.rar` | 1 file | 0.10 GB | Review and delete if old |

**Recommendations:**
- ⭐ **Sort Downloads by date** — Delete anything older than 3 months
- ⭐ **Delete `.zip`/`.exe`/`.msi` files** — These are almost always disposable installers
- Potential savings: **~31 GB**

---

### 4. Program Files — ~17 GB

| Application | Size | Recommendation |
|-------------|------|----------------|
| Microsoft Office | 4.46 GB | Keep — essential |
| Docker | 3.14 GB | Prune images to reduce |
| Node.js | 1.89 GB | Keep — dev essential |
| Adobe | 1.36 GB | Review if unused apps installed |
| GIMP 2 | 1.16 GB | Keep if used |
| Common Files | 1.28 GB | System — do not touch |
| PowerToys | 0.84 GB | Keep if used |
| WSL | 0.80 GB | Keep if using Linux subsystem |

---

### 5. Program Files (x86) — ~19 GB

| Application | Size | Recommendation |
|-------------|------|----------------|
| StarCraft | **5.48 GB** | ⭐ Uninstall if not playing |
| Microsoft (x86) | 4.59 GB | System — review individual apps |
| Chessmaster | **3.90 GB** | ⭐ Uninstall if not playing |
| Ubisoft | **2.45 GB** | ⭐ Uninstall if not playing |
| Microsoft Visual Studio | 1.11 GB | Keep if used |
| Battle.net | 1.10 GB | Uninstall launcher if not playing |

**Game uninstall potential: ~13 GB**

---

### 6. Other Top-Level Folders

| Folder | Size | Recommendation |
|--------|------|----------------|
| `C:\Riot Games` | ~36 GB | ⭐ Uninstall League of Legends if not playing |
| `C:\Tools` | 2.60 GB | Review contents |
| `C:\Nowy folder` | 2.37 GB | ⭐ Review — generic name suggests temp dump |
| `C:\gl` | 2.11 GB | Review contents |
| `C:\webdev` (other projects) | ~0.5 GB | Review old projects |
| `C:\webdevtools` | 0.92 GB | Review — likely old dev tools |
| `C:\frontend` | 0.23 GB | Review — old project? |

---

## Prioritized Cleanup Recommendations

### 🔴 High Impact (30-100+ GB potential)

1. **Downloads cleanup** — 31 GB potential
   - Delete old `.zip`, `.exe`, `.msi` files
   - Sort by date, delete > 3 months old

2. **AppData\Local cache cleanup** — 20-50 GB potential
   - `npm cache clean --force`
   - `pip cache purge`
   - Clear `%TEMP%` folder
   - Docker prune (`docker system prune -a`)
   - Teams cache cleanup

3. **OneDrive "Files On-Demand"** — Up to 104 GB
   - Keeps files accessible but not locally stored
   - Right-click OneDrive → "Free up space"

4. **Game uninstalls** — ~49 GB potential
   - League of Legends (C:\Riot Games): ~36 GB
   - StarCraft: 5.48 GB
   - Chessmaster: 3.90 GB
   - Ubisoft games: 2.45 GB
   - Battle.net if unused: 1.10 GB

### 🟡 Medium Impact (5-20 GB potential)

5. **OneDrive duplicate/file review** — Review large files in OneDrive
6. **`C:\Nowy folder` review** — 2.37 GB with suspicious generic name
7. **`C:\gl` review** — 2.11 GB unknown contents
8. **Adobe apps** — 1.36 GB, uninstall unused Adobe products

### 🟢 Low Impact (< 5 GB)

9. **Old dev projects** in `C:\webdev`, `C:\frontend`, `C:\webdevtools`
10. **Python/Node tool caches** — Already covered in AppData cleanup

---

## Quick Wins Checklist

Run these commands to immediately free space:

```powershell
# npm cache (run in PowerShell as admin)
npm cache clean --force

# pip cache
pip cache purge

# Docker prune (if Docker installed)
docker system prune -a

# Windows temp files
Remove-Item "$env:LOCALAPPDATA\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
```

**Estimated quick win total: 30-60 GB**

---

## Notes

- All scans were **read-only** — no files were deleted
- System folders (`Windows`, `ProgramData`, etc.) were excluded
- `sang-logium` folder was excluded from this analysis
- Sizes are approximate due to file system overhead and permission-denied files
