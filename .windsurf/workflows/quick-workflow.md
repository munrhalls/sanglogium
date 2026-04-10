---
description: Quick workflow for simple, human-verified development
---

# Quick Workflow - Simple Development Pattern

## When to Use
- Any feature development that risks over-complication
- When you need to prevent cargo cult patterns
- When human verification checkpoints are critical
- Time-sensitive development (4-hour windows)

## The 5 Chess Moves Pattern

### 1. Define UX Flows First (15 minutes)
**What to do:**
- Document the exact user interaction sequence
- Use simple "User does X -> system does Y" format
- Nothing else, just the user interaction

**Example:**
- User adds item to basket
- User clicks checkout
- System reserves stock for 15 seconds
- User goes to Stripe payment
- Stock releases if payment fails

### 2. Create Manual Verification Plan (15 minutes)
**What to do:**
- Write simple, human-verifiable steps
- Use concrete numbers and actions
- No automation, just manual checks

**Example:**
- Check stock is 10
- Click checkout button
- Check stock is now 8
- Wait 15 seconds
- Check stock is back to 10

### 3. Draw Simple Architecture (15 minutes)
**What to do:**
- Event-driven pattern only
- Clear boxes and arrows
- No complexity, no vague terms

**Pattern:**
```
Event -> State Change -> Function Call -> Result Event -> New State
```

**Example:**
- CLICK_CHECKOUT -> PROCESSING -> validateBasket() -> VALIDATION_SUCCESS -> SUCCESS

### 4. Define Guardrails (10 minutes)
**What to do:**
- Write rules to prevent over-complication
- Focus on simplicity and human verification
- Make them mandatory, not optional

**Standard Guardrails:**
- No test unless needed
- Tests must be human-readable
- Manual verification first
- No mocking core functionality
- Directness principle only

### 5. Create Sprint Template (10 minutes)
**What to do:**
- Simple structure based on above
- No cargo cult patterns
- Direct and minimal
- Include verification steps

**Template Sections:**
- UX Flow (from step 1)
- Manual Verification (from step 2)
- Architecture (from step 3)
- Guardrails (from step 4)
- Implementation tasks (minimal)

## Execution Protocol

### Before Starting
1. Ask: "Is this feature at risk of over-complication?"
2. If yes, use this workflow
3. If no, use standard workflow

### During Execution
1. Complete each step fully before next
2. Get human approval after each step
3. Don't skip steps, even if tempted
4. Keep to time limits

### After Completion
1. Review for simplicity
2. Ensure manual verification works
3. Archive old complex attempts
4. Document lessons learned

## Anti-Patterns to Avoid

- **Don't** combine steps
- **Don't** add complexity to "be thorough"
- **Don't** skip manual verification
- **Don't** write tests before manual verification
- **Don't** create abstractions too early

## Success Criteria

- Feature works and can be verified manually in 5 minutes
- Architecture is simple enough to draw on one page
- Tests (if any) can be read and understood by humans
- No cargo cult patterns present
- Human verification checkpoints exist

## Variations

### For Bug Fixes
- Skip UX flow (already exists)
- Focus on manual verification of fix
- Keep architecture simple

### For Refactoring
- UX flow stays same
- Manual verification stays same
- Only architecture changes

### For Complex Features
- Break into multiple quick-workflows
- Each workflow handles one user flow
- Combine at the end if needed
