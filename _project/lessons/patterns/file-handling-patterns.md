# File Handling Patterns

**Date:** 2026-04-14
**Source:** File existence blocking issue
**Severity:** Medium
**Frequency:** Common

## Pattern: Safe File Creation

### Problem
Agents get stuck when trying to create files that already exist.

### Solution
Always implement file existence checks before creation.

### Implementation
```typescript
// Pattern 1: Check then create
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
} else {
    // Handle existing file
    fs.appendFileSync(filePath, content);
}

// Pattern 2: Use overwrite flag
fs.writeFileSync(filePath, content, { flag: 'w' });

// Pattern 3: Version with timestamp
if (fs.existsSync(filePath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filePath = filePath.replace(/(\.[^.]+)$`, `-${timestamp}$1`);
}
fs.writeFileSync(filePath, content);
```

### Variations
| Situation | Approach | Code |
|-----------|----------|------|
| Log files | Append | `fs.appendFileSync()` |
| Config files | Update | Read, modify, write |
| Reports | Version | Add timestamp to filename |
| Temporary files | Overwrite | Use `{ flag: 'w' }` |

## Pattern: File Operation Wrapper

### Implementation
```typescript
function safeFileWrite(filePath: string, content: string, strategy: 'append' | 'overwrite' | 'version' = 'append'): void {
    if (fs.existsSync(filePath)) {
        switch (strategy) {
            case 'append':
                fs.appendFileSync(filePath, content);
                break;
            case 'overwrite':
                fs.writeFileSync(filePath, content, { flag: 'w' });
                break;
            case 'version':
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const versionedPath = filePath.replace(/(\.[^.]+)$`, `-${timestamp}$1`);
                fs.writeFileSync(versionedPath, content);
                break;
        }
    } else {
        fs.writeFileSync(filePath, content);
    }
}
```

## Prevention Rules
1. **Never assume file doesn't exist**
2. **Always have a strategy for existing files**
3. **Use descriptive file naming for versions**
4. **Consider file permissions and locks**

## Applicability
**When to use:**
- Any file creation operation
- Log file management
- Configuration updates
- Report generation

**Keywords:** ["file-handling", "file-creation", "file-exists", "safe-operations"]
