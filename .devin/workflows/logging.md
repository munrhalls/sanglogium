# /logging

## Checkout Flow Logging Commands

### Commands

**Get latest trace:**
```bash
node scripts/get-trace.mjs
```

**Get specific trace:**
```bash
node scripts/get-trace.mjs <traceId>
```

**List all available traces:**
```bash
node scripts/get-trace.mjs --list
```

**Get recent events (to find traceIds):**
```bash
node scripts/get-recent-checkout-logs.mjs
```

**Clear all Redis logs:**
```bash
node scripts/clear-redis-logs.mjs
```

**Delete local log files:**
```powershell
Remove-Item -Force .logs/latest-checkout-trace.json
Remove-Item -Force -Recurse .logs/checkout-traces/*
```

**Delete all logs (Redis + local):**
```powershell
node scripts/clear-redis-logs.mjs
Remove-Item -Force .logs/latest-checkout-trace.json
Remove-Item -Force -Recurse .logs/checkout-traces/*
```

## Debugging Workflow

1. **Start fresh checkout** - Navigate through basket → address → shipping → payment
2. **Capture traceId** - Check browser console for `chk_<timestamp>_<random>` pattern in log output
3. **Retrieve logs** - Run `node scripts/get-trace.mjs <traceId>` after encountering bug
4. **Match to beads issue** - Search beads for error patterns from logs
5. **Or create new issue** - Use `/add-beads-issue` workflow if no match exists

## System Details

- Events stored in Redis keyed by `traceId` (correlationId)
- Each checkout flow generates unique trace ID
- Trace ID persists across all slices: basket, address, shipping, payment, webhook
- Event logger: `lib/dev/event-logger.ts`
- TTL: 24 hours (prevents memory leaks)
