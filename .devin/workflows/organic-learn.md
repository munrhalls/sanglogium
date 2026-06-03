---
description: Save organic learning lessons with exact content preservation and automated file naming
---

# Organic Learn Command

## Purpose
Automates the process of saving organic learning lessons with exact content preservation and systematic file organization.

## Usage
```
/organic-learn
```

## Automation Rules

### Folder Structure
- **Location**: `_training/real-time/`
- **Folder naming**: `{YYYY-MM-DD}` (current date)
- **Auto-create**: Creates date folder if not present

### File Naming
- **Format**: `{HH--MM to-HH-MM}.md`
- **Time extraction**: Automatically extracts start time and duration from content
- **Calculation**: End time = start time + duration

### Content Preservation
- **Exact preservation**: Original content unchanged
- **No modifications**: Content saved exactly as typed by user
- **Formatting**: Maintains all markdown formatting and structure

## Implementation Steps

### 1. Extract Time Information
- Parse content for "X hours Y minutes" duration
- Parse content for start time (if present)
- Calculate end time from start + duration

### 2. Create File Structure
```bash
# Create date folder if needed
mkdir -p _training/real-time/YYYY-MM-DD

# Create file with calculated time range
touch _training/real-time/YYYY-MM-DD/HH--MM to-HH-MM.md
```

### 3. Save Content
- Write original content exactly as provided
- No formatting changes
- No content modifications
- Preserve all whitespace and structure

## Time Extraction Logic

### Duration Pattern
```
"- X hours Y minutes"
```

### Start Time Pattern
```
Current timestamp when command is called
```

### File Name Calculation
```
Start: HH-MM (current time)
End: HH-MM (start + duration)
File: HH--MM to-HH-MM.md
```

## Example

### Input Content
```
# Organic Lessons - Real Time

## Event Data:
- 2 hours 16 minutes
- extremely little progress...
```

### Generated File
```
_training/real-time/2026-04-09/08-30 to-10-46.md
```

### File Contents
Exact copy of original content, unchanged.

## Error Handling

### Missing Duration
- Default to 1 hour if duration not found
- Log warning about missing duration

### Invalid Time Format
- Use current time as fallback
- Continue with file creation

### Folder Creation Failure
- Log error and continue
- Try alternative location

## Success Criteria

- [ ] Date folder created automatically
- [ ] File named with calculated time range
- [ ] Content preserved exactly
- [ ] No modifications to original text
- [ ] Proper markdown formatting maintained
