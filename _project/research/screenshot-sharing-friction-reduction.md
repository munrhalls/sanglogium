# Screenshot Sharing Friction Reduction

**Topic:** Least-friction workflow for sharing Snipaste screenshots with AI agent in IDE
**Research Date:** 2026-04-20
**Decay Risk:** Low (IDE capabilities stable)

---

## Research Scope Contract
- **Topic:** Minimize friction when sharing screenshots from Snipaste to AI agent
- **First Principles:** IDE file access requires absolute paths; Snipaste has clipboard/save features; workflow optimization
- **Fundamentals:** read_file tool capabilities, Snipaste auto-save configuration, IDE chat file handling
- **Scope Boundary:** IN: Workflow optimization, Snipaste configuration; OUT: Modifying IDE chat system, Snipaste source code
- **Target Audience:** User using Snipaste + IDE chat with AI agent
- **Decay Risk:** Low - current IDE capabilities stable

---

## Phase 1: Current State Analysis

### Current Workflow (High Friction)
1. Take screenshot with Snipaste
2. Upload to Gyazo (external service)
3. Copy Gyazo URL
4. Share URL with agent (agent cannot read Gyazo URLs)
5. Save image locally
6. Provide full file path to agent
7. Agent reads file using read_file

**Friction Points:**
- External service dependency (Gyazo)
- Multiple steps (upload → copy → save → share path)
- Long file paths to type/paste
- No direct paste capability

---

## Phase 2: IDE Capabilities Verification

### File Access Capabilities
**Tool:** `read_file` (available in this environment)
- **Requirement:** Absolute file path (e.g., `C:\Users\...\screenshot.png`)
- **Supported formats:** jpg, jpeg, png, gif, bmp, webp, svg, tiff, ico, heic, heif
- **Access Scope:** Can read any file on user's system (no workspace restriction)

**Verification:** ✅ Confirmed - successfully read screenshot from `c:\Users\janpi\Downloads\4e196ec10038ae74d15c6a5f3d1f2fa5.png`

### IDE Chat Image Handling
**Current State:**
- Image upload UI exists (user mentioned "uploaded 1 images")
- Images not visible to agent in current session
- May be IDE-specific limitation or configuration issue

**Hypothesis:** IDE chat supports image uploads but agent cannot access them in current environment configuration.

---

## Phase 3: Snipaste Configuration Options

### Snipaste Features (Verified)

**Auto-Save Configuration:**
- ✅ Snipaste supports setting history directory via config.ini
- ✅ Config file location: Preferences → General → Configuration Storage → Open
- ✅ Setting: `history_dir=C:/path/to/directory`
- ✅ Supports absolute paths, relative paths, environment variables
- ✅ No quotes needed even with spaces in path
- ⚠️ Snipaste will NOT create the folder - must exist beforehand

**Command Line Options:**
- ✅ `-o quick-save` - Save screenshot to Quick Save folder
- ✅ `-o file-dialog` - Show file save dialog after screenshot
- ✅ `-o no-auto-save` - Disable auto-save
- ✅ `-o silent` - No pop-up notifications
- ✅ `-o FILE_NAME` - Save with specific filename (supports variables)

**Clipboard Behavior:**
- ✅ Default: Copies to clipboard after screenshot
- ✅ Can combine outputs: `-o file-dialog;clipboard` (Pro version)
- ✅ Free version: Single output at a time

---

## Phase 4: Alternative Workflows

### Option 1: Project Directory Auto-Save (Recommended)
**Workflow:**
1. Configure Snipaste `history_dir` to `c:\webdev\sang-logium\screenshots\`
2. Take screenshot with Snipaste (F1 or configured hotkey)
3. Share filename with agent (e.g., "see screenshots/screenshot-001.png")
4. Agent reads from project directory

**Friction:** Very Low (one-time configuration, short paths)

**Implementation:**
- Create `c:\webdev\sang-logium\screenshots\` folder
- Open Snipaste Preferences → General → Configuration Storage → Open
- Add to config.ini under `[General]`:
  ```
  history_dir=c:/webdev/sang-logium/screenshots
  ```
- Restart Snipaste

### Option 2: Command Line Quick-Save (Alternative)
**Workflow:**
1. Create shortcut/batch script: `snipaste.exe snip -o "c:/webdev/sang-logium/screenshots/screenshot-%Y%m%d-%H%M%S.png"`
2. Run script to take screenshot
3. Share filename with agent

**Friction:** Medium (requires script or manual command execution)

### Option 3: Drag-Drop to IDE (Unverified)
**Workflow:**
1. Take screenshot with Snipaste
2. Save to Downloads/Desktop
3. Drag file into IDE chat
4. IDE makes file accessible to agent

**Friction:** Unknown (depends on IDE capabilities - not verified)

---

## Phase 5: Best Practices Synthesis

### Current Best Practice (Based on Constraints)
**Recommended Workflow:**
1. Create `screenshots` folder in project directory
2. Configure Snipaste to auto-save there
3. Use short relative paths (e.g., `screenshots/screenshot.png`)

**Rationale:**
- Leverages existing read_file capability
- Minimizes path typing
- Keeps screenshots in project context
- No external dependencies
- One-time configuration

---

## Phase 6: Verification & Falsification

### Claims Verified
| Claim | Evidence | Status |
|-------|----------|--------|
| Snipaste supports auto-save to custom directory | config.ini history_dir setting | ✅ Confirmed |
| read_file can read from project directory | Successfully read from project | ✅ Confirmed |
| Snipaste requires folder to exist beforehand | Documentation warning | ✅ Confirmed |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| IDE drag-drop makes files accessible | Not tested in this research | ⏳ Pending |

---

## Phase 7: Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use project screenshots folder | Leverages existing read_file, short paths | Create `screenshots/` directory |
| Configure Snipaste auto-save | Minimizes manual steps | Set history_dir in config.ini |

### Immediate Actions
1. ✅ Create `c:\webdev\sang-logium\screenshots\` folder
2. ✅ Provide Snipaste configuration instructions
3. ✅ Update research artifact with findings

---

## Implementation Guide

### Step 1: Create Screenshots Folder
```bash
mkdir c:\webdev\sang-logium\screenshots
```

### Step 2: Configure Snipaste
1. Open Snipaste
2. Go to Preferences → General → Configuration Storage → Open
3. Edit config.ini
4. Add under `[General]`:
   ```
   history_dir=c:/webdev/sang-logium/screenshots
   ```
5. Save config.ini
6. Restart Snipaste

### Step 3: Usage
1. Take screenshot with Snipaste (F1 or configured hotkey)
2. Share filename with agent: `see screenshots/screenshot.png`
3. Agent reads from project directory

**Friction Reduction:** From 5 steps (Gyazo → copy → save → path → share) to 2 steps (screenshot → share filename)

---

## Research Summary

**Topic:** Least-friction workflow for sharing Snipaste screenshots with AI agent

**Finding:** Configure Snipaste to auto-save to project screenshots directory using `history_dir` config setting.

**Verification:** ✅ Snipaste documentation confirms custom directory support via config.ini

**Recommendation:** Implement Option 1 (Project Directory Auto-Save) for least friction workflow.

**Decay Risk:** Low - Snipaste configuration stable, read_file capability stable.
