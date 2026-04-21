# Checkout Queue Implementation Tree

```
app/api/checkout-queue/
  route.ts                    # Main API endpoint
  clear-trace/
    route.ts                  # Clear trace endpoint
  trace/
    route.ts                  # Get trace endpoint

app/(store)/basket/
  Basket.tsx                  # Basket page
  BasketClientWrapper.tsx     # Client wrapper for basket
  BasketSummary.tsx           # Basket summary component
  EmptyBasketContent.tsx      # Empty basket state

app/components/features/basket/checkout/
  CheckoutPanel.tsx           # Checkout panel with button

app/(test)/checkout-queue-e2e-test-page/
  layout.tsx                  # Test page layout
  page.tsx                    # E2E test page

lib/queue/
  constants.ts                # Queue constants
  health.ts                   # Health check
  processor.ts                # Queue processor logic
  redis.ts                    # Redis client
  trace.ts                    # Trace logging
  types.ts                    # TypeScript types

tests/checkout-queue/
  integration/
    basket-reservation-flow.test.ts
    sequential-fifo.test.ts
    type-mismatch.test.ts
  e2e/
    checkout-queue-e2e-test-page/
```
