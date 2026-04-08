# Sprint Failure Archive - April 8, 2026

## What This Is
Complete archive of the failed sprint attempt at basket-to-checkout handshake.

## Why It Failed
- Tests were cargo cult (100% pass, 0% reality)
- No human verification checkpoints
- Over-complicated before basic flow worked
- 3 days wasted on non-functional code

## What's Archived
- `/manual-verification/` - All manual verification attempts
- `/tests/` - All test files (unit, integration, e2e)
- `sprint_basket_to_checkout_handshake_hyper_specific.todo` - The sprint document

## Key Learnings
1. **Human verification first** - Tests document, don't create
2. **Directness principle** - No indirect verification blind spots
3. **Simple before complex** - Basic flow must work before edge cases
4. **No cargo cult testing** - Tests must anchor in reality

## For Future Reference
When tempted to repeat this pattern:
- Look at this archive
- Read the lessons in `_project/lessons/`
- Remember: 3 days wasted on tests that passed while system failed

## Date Archived
2026-04-08
