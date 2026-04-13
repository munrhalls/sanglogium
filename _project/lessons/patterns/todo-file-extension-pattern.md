# File Extension Pattern: .todo for Task-Oriented Content

**Date:** 2026-04-13
**Source:** Human verification file organization
**Severity:** Medium
**Frequency:** Universal (applies to all task-oriented documentation)

## The Problem
Human verification guides were using .md extension despite being task-oriented checklists, not documentation.

## Root Cause
- Default assumption to use .md for all text files
- No clear distinction between documentation and task lists
- File extension didn't match content purpose

## The Fix
```typescript
// Before
human-verification/request-formation.md
human-verification/queue-operations.md
human-verification/error-handling.md

// After
human-verification/request-formation.todo
human-verification/queue-operations.todo
human-verification/error-handling.todo
```

## Prevention
**FILE EXTENSION RULES:**

1. **Use .todo for task-oriented content**
   - Checklists and verification procedures
   - Step-by-step instructions
   - Action items and tasks

2. **Use .md for documentation**
   - Explanatory content
   - Reference material
   - Architectural decisions

3. **Match extension to purpose**
   - Content determines extension, not vice versa
   - Extension should signal file type at a glance

## Applicability
**When to apply:**
- Creating verification checklists
- Writing task-oriented guides
- Organizing procedural documentation
- Any file containing actionable steps

**Keywords:** ["file-extensions", "todo-files", "task-oriented", "documentation-organization", "file-naming"]
