Goal: capture major architectural decisions
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

// example only, don't take literally
# Major ADR: CMS Sync on Basket Page Load

## Context
Basket state exists but prices/stock might change when checked vs CMS. As customer, I want to know that prices/stock changed, see comparison of previous vs latest up-to-date state before I click checkout, not after.

## Decision
On basket page load, sync basket state (source of truth) to CMS. API returns current price_data/reserved stock/stock for each item. Processor turns it to CMSBasketItems format. UI displays comparison: previous displayPrice/availablStock vs current, highlights changes.

## Consequences
- Positive: Customer sees accurate info before checkout decision, no surprise failures, better UX
- Negative: Basket page load latency, network failure blocks basket view, requires optimistic UI handling
