# Cascade "Invalid prefixed session ID" Fix

## Problem
Cascade panel shows blank/black screen with error: `Invalid prefixed session ID: 90a338a5-23a4-4cbe-9e7d-94fdf98cf705`

**Note:** This is a major bug that completely disables Cascade functionality.

## Root Cause
Invalid session ID is cached in multiple Windsurf cache locations (globalStorage, Cache, IndexedDB, Local Storage, Session Storage).

## Fix Steps (Ordered by Probability)

### 1. Nuclear Option - Clear All Cache (Highest Probability)
```powershell
# Close Windsurf completely first
Remove-Item -Path "$env:APPDATA\Windsurf\Cache" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\GPUCache" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\Code Cache" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\IndexedDB" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\Local Storage" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\Session Storage" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\WebStorage" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\blob_storage" -Recurse -Force
Remove-Item -Path "$env:APPDATA\Windsurf\User\globalStorage" -Recurse -Force
# Reopen Windsurf
```

### 2. Clear Cascade Folder (Official Recommendation)
```powershell
# Close Windsurf first
Remove-Item -Path "$env:USERPROFILE\.codeium\windsurf\cascade" -Recurse -Force
# Reopen Windsurf
```

### 3. Sign Out/Sign In
- Click profile icon (bottom left)
- Sign out
- Close Windsurf
- Reopen and sign in

### 4. Contact Support
If none above work, download diagnostic logs:
- Ctrl+Shift+P → "Download Windsurf Logs"
- Attach to support ticket with screen recording
