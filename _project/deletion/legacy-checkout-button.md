# Legacy Code Marked for Deletion

## File: `app\(store)\basket\CheckoutButton.tsx`

**Reason:** Legacy checkout implementation
**Replacement:** `components\checkout\reservation\CheckoutButton.tsx`

## Evidence
- Old implementation uses different checkout flow
- New implementation follows guest checkout inventory reservation pattern
- Reference implementation shows 15 files created with proper reservation flow

## Action Required
Delete this file when confident new implementation is fully functional.
