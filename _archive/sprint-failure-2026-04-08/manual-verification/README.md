# Manual Verification - Reservation System

## Quick Start

1. **Setup test products:**
   ```bash
   node tests/manual/setup-test-products.js
   ```

2. **Run scenarios:**
   - Open `tests/manual/reservation-system.md`
   - Follow each scenario step-by-step
   - Check stock/reservation status with:
     ```bash
     node tests/manual/check-reservations.js
     ```

3. **Cleanup:**
   ```bash
   node tests/manual/cleanup-test-products.js
   ```

## What You'll Verify

- Stock is reserved when checkout is initiated
- Stock is released after 15 seconds (expiration time)
- Reservations persist across browser navigation
- No double reservations on rapid retries
- Background job cleans expired reservations

## Tips

- Use browser dev tools to inspect network requests
- Check console for reservation logs
- Take screenshots for evidence
- Run `check-reservations.js` before and after each scenario
