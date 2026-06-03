---
description: Get verified folder/file tree overview for a given feature using native Windows commands
---

# /get-tree - Feature Structure Overview

**Purpose:** Show complete folder/file tree for a given feature with verification.

**Input:** Feature path (e.g., `lib/checkout`, `components/basket`)

**Output:** Indented tree showing parent-child relationships, file sizes, type detection, and counts.

---

## Execution Steps

### Step 1: Ask for Feature Path
Ask: "What is the feature path to analyze?"

### Step 2: Get File Tree
```powershell
Get-ChildItem -Path <path> -Recurse | Select-Object FullName, Length, PSIsContainer | Format-Table -AutoSize
```

### Step 3: Verify Paths Exist
```powershell
Get-ChildItem -Path <path> -Recurse | ForEach-Object { Test-Path $_.FullName }
```

### Step 4: Generate Tree Structure
Format output as indented tree:
- Show depth levels with indentation
- Mark directories with `/`
- Show file sizes in bytes
- Count total files and directories

### Step 5: Output Summary
```
Total Directories: N
Total Files: N
Total Size: N bytes
```

---

**Last Updated:** 2026-04-23
