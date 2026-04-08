# Windsurf IDE Peek Definition (Alt+F12) Debug Report

**Date:** 2026-04-08  
**Issue:** Alt+F12 Peek Definition doesn't work for @/ path imports  
**File:** `app\(store)\basket\CheckoutButton.tsx` line 3  

## Current State
- Cursor on line 3: `import { validateBasket } from "@/app/actions/checkout/validateBasket";`
- Alt+F12 doesn't open peek definition
- Target file exists: `c:\webdev\sang-logium\app\actions\checkout\validateBasket.ts`

## Root Cause Analysis

### 1. TypeScript Path Mapping Issue
The @/ alias requires TypeScript IntelliSense to resolve properly. When TS server isn't fully initialized or has indexing issues, Peek Definition fails.

### 2. Windsurf IDE Limitation
Windsurf may not have full VS Code IntelliSense features implemented yet, especially for TypeScript path aliases.

## Working Alternatives (Tested)

### 1. Ctrl+P Quick Open
- Press `Ctrl+P`
- Type `validateBasket`
- Opens file directly

### 2. F12 Go to Definition
- Press `F12` (not Alt+F12)
- Sometimes works when Peek doesn't

### 3. Right-click Menu
- Right-click on `validateBasket`
- Select "Go to Definition"

### 4. Command Palette
- Press `Ctrl+Shift+P`
- Type "Go to Definition"

## Immediate Solutions

1. **Use Ctrl+P** - Fastest working method
2. **Restart TS Server** - May restore Peek functionality
3. **Use F12 instead of Alt+F12** - Different command, same result

## Prevention
- Use relative imports for critical navigation:
  ```typescript
  import { validateBasket } from "../../../app/actions/checkout/validateBasket";
  ```
- This provides reliable Ctrl+click navigation

**Status:** Use Ctrl+P as primary navigation method
