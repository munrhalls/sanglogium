# Human Verification Guide

This directory contains manual verification protocols for the Guest Checkout Inventory Reservation flow.

## Files

- **human-verification-report.md** - Complete 8-bus-stop verification protocol with manual steps
- **verification-script.js** - Automated browser script that runs through all verification steps
- **README.md** - This file

## Quick Start

### 1. Pre-Flight Setup

```bash
# Verify Redis is running
redis-cli ping

# Start development server
npm run dev

# Navigate to basket page
http://localhost:3000/basket
```

### 2. Run Automated Verification

1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy and paste the entire content of `verification-script.js`
4. Press Enter to run

The script will automatically:
- Verify basket state
- Click checkout button
- Intercept API requests
- Check localStorage
- Verify UI state transitions
- Generate a pass/fail report

### 3. Manual Verification Steps

Follow the detailed steps in `human-verification-report.md`:
- Bus Stop 1: Basket page load
- Bus Stop 2: Request formation
- Bus Stop 3: API request
- Bus Stop 4: Redis queue
- Bus Stop 5: Stock reservation
- Bus Stop 6: Client state update
- Bus Stop 7: UI state transition
- Bus Stop 8: Status classification

## Error Scenarios

The verification report includes 4 error scenario tests:
1. Idempotency key reuse
2. Concurrent checkout attempts
3. Network failure/retry
4. Cancel button rollback

## Expected Results

- **Full Pass**: All 8 bus stops pass + 2 error scenarios pass
- **Partial Pass**: Core flow (stops 1-6) passes with documented issues
- **Fail**: Any core stop fails - do not proceed to deployment

## Time Estimate

- Pre-flight: 2 minutes
- Core flow: 8 minutes
- Error scenarios: 5 minutes
- Documentation: 2 minutes
- **Total: 17 minutes**

## Data-testid Attributes

The verification script relies on these data-testid attributes in the UI:

- `[data-testid="checkout-button"]` - Main checkout button
- `[data-testid^="basket-item-"]` - Basket items (dynamic ID)
- `[data-testid="reserved-basket"]` - Reserved basket panel
- `[data-testid="expiry-timer"]` - Expiry countdown
- `[data-testid="cancel-button"]` - Cancel button
- `[data-testid="proceed-button"]` - Proceed button (full status)
- `[data-testid="approve-button"]` - Approve button (decremented status)
- `[data-testid="loading-spinner"]` - Loading indicators

## Troubleshooting

### Script Not Running
- Ensure you're on the basket page
- Check browser console for JavaScript errors
- Make sure you copied the entire script

### Missing Elements
- Verify data-testid attributes exist in components
- Check if components are rendered (look in React DevTools)

### Redis Issues
- Ensure Redis server is running: `redis-cli ping`
- Check correct database (DB 15 for tests)

### API Not Responding
- Check development server is running
- Verify API endpoint exists: `/api/checkout/reserve`
- Check server logs for errors
