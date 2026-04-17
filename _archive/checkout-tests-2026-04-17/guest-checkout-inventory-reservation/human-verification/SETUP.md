# Guest Checkout Human Verification: Setup Guide

Professional environment preparation guide for manual verification of the guest checkout → reserved basket flow.

**Prerequisites:** Basic familiarity with command line, browser DevTools, and the project's tech stack (Next.js, Redis, Sanity).

---

## Phase 1: Prerequisites (One-Time Setup)

### Required Software

| Tool | Version | Purpose | Verification Command |
|------|---------|---------|---------------------|
| Node.js | 18+ | Runtime | `node --version` |
| npm | 9+ | Package manager | `npm --version` |
| Redis | 6.2+ | Queue & state | `redis-cli --version` |
| Stripe CLI | Latest | Webhook testing | `stripe --version` |
| Git | 2.30+ | Version control | `git --version` |

### Environment Variables

Create `.env.local` in project root:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token

# Redis
REDIS_URL=redis://localhost:6379

# Stripe (for webhook testing)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Verification:**
```bash
# Check all env vars are set
cat .env.local | grep -E "^(NEXT_PUBLIC_SANITY|SANITY_API_TOKEN|REDIS_URL|STRIPE)" | wc -l
# Should output: 7
```

---

## Phase 2: One-Time Environment Setup (15 min)

### Step 1: Install Dependencies

```bash
# From project root
cd c:\webdev\sang-logium
npm install
```

**Verify:** `node_modules/` directory exists with `next`, `redis`, `@sanity/client` packages.

### Step 2: Start Redis Server

**Windows (PowerShell as Admin):**
```powershell
# Option A: Docker (recommended)
docker run -d --name redis-checkout -p 6379:6379 redis:7-alpine

# Option B: Windows Service
# Download from https://github.com/tporadowski/redis/releases
# Or use WSL2 with Ubuntu
```

**Verification:**
```bash
redis-cli ping
# Expected: PONG
```

### Step 3: Stripe CLI Setup

```bash
# Download from https://stripe.com/docs/stripe-cli
# Login (one-time)
stripe login

# Verify
stripe --version
# Expected: stripe version x.x.x
```

### Step 4: Sanity Studio Access

1. Navigate to `https://<project-id>.sanity.studio/`
2. Verify login credentials work
3. Bookmark the Products section for stock verification

---

## Phase 3: Pre-Verification Checklist (Per Session)

Run this checklist before EVERY verification session (2 min).

### System Check

- [ ] Redis running: `redis-cli ping` → PONG
- [ ] Node modules installed: `ls node_modules/next`
- [ ] Environment variables loaded: `cat .env.local | head -5`
- [ ] Development server port (3000) available: `netstat -ano | findstr :3000` (should be empty)

### Test Data Preparation

- [ ] Test products exist in Sanity with `stock` > 0
- [ ] Test products have `stripePriceId` configured
- [ ] No stale reservations in Redis from previous runs

**Clear stale data:**
```bash
# Flush Redis test data
redis-cli FLUSHDB

# Or selective cleanup
redis-cli KEYS "reservation:*" | xargs redis-cli DEL
redis-cli KEYS "idempotency:*" | xargs redis-cli DEL
```

### Browser Setup

- [ ] Chrome/Edge/Firefox (latest version)
- [ ] DevTools console visible (F12)
- [ ] Network tab ready for inspection
- [ ] localStorage cleared from previous sessions

**Clear browser data:**
```javascript
// In browser console before testing
localStorage.clear();
console.log('Browser storage cleared');
```

---

## Phase 4: Launch Verification Environment (3 min)

### Terminal 1: Development Server

```bash
cd c:\webdev\sang-logium
npm run dev
```

**Wait for:** `Ready on http://localhost:3000`

### Terminal 2: Stripe Webhook Listener (Optional)

Only needed if testing payment webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Wait for:** `Ready! Your webhook signing secret is whsec_...`

### Terminal 3: Redis Monitor (Optional)

For real-time Redis debugging:

```bash
redis-cli monitor
```

---

## Phase 5: Navigate to Test Page

Open browser to:

```
http://localhost:3000/basket
```

**Verify page loads:**
- [ ] No 404 errors
- [ ] Basket component renders
- [ ] Console shows no critical errors
- [ ] Network tab shows successful API calls (if basket has items)

---

## Quick Setup Script

Save as `scripts/verify-setup.ts` for automated pre-flight:

```typescript
import { execSync } from 'child_process';
import { createClient } from 'redis';

async function verifySetup() {
  console.log('🔍 Verifying human verification setup...\n');
  
  // Check Redis
  try {
    const redis = createClient({ url: 'redis://localhost:6379' });
    await redis.connect();
    await redis.ping();
    console.log('✅ Redis: Running');
    await redis.disconnect();
  } catch {
    console.error('❌ Redis: Not running. Start with: docker run -d -p 6379:6379 redis:7-alpine');
    process.exit(1);
  }
  
  // Check env vars
  const required = ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'SANITY_API_TOKEN', 'REDIS_URL'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length) {
    console.error(`❌ Environment: Missing ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Environment: All required vars set');
  
  console.log('\n🚀 Setup verified. Ready for human verification.');
}

verifySetup();
```

---

## Troubleshooting Common Setup Issues

### Issue: Redis Connection Refused

**Symptom:** `redis-cli ping` returns `Could not connect`

**Solutions:**
1. Redis not started: `docker start redis-checkout` or start service
2. Wrong port: Check `redis-cli -p 6380 ping` if using non-default port
3. WSL2 networking: Use `redis-cli -h 127.0.0.1 ping` instead of localhost

### Issue: Environment Variables Not Loading

**Symptom:** `undefined` for `process.env.SANITY_API_TOKEN`

**Solutions:**
1. File location: Ensure `.env.local` is in project root (not `app/`)
2. Server restart: Stop and restart `npm run dev` after editing .env
3. Variable names: Check for typos against required list above

### Issue: Stripe CLI Not Found

**Symptom:** `stripe: command not found`

**Solutions:**
1. Windows: Add `C:\Users\<username>\scoop\shims` or install path to PATH
2. macOS: `brew install stripe/stripe-cli/stripe`
3. Download directly: https://github.com/stripe/stripe-cli/releases

### Issue: Port 3000 Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
```powershell
# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### Issue: Sanity API Token Permissions

**Symptom:** Stock updates fail with "Insufficient permissions"

**Solutions:**
1. Check token has `write` access in Sanity project settings
2. Verify token is set in `.env.local` (not just public vars)
3. Test with: `curl -H "Authorization: Bearer $SANITY_API_TOKEN" https://<project>.api.sanity.io/v1/data/query/production`

---

## Ready to Verify

Once all checkboxes above are complete, proceed to:

**[DOD_CHECKLIST.md](./DOD_CHECKLIST.md)** — Ordered verification steps for all PRD DoD items.

---

**Setup Time Estimate:** 15 minutes (one-time) + 2 minutes (per session pre-flight)
