# Research: Google Maps API 401 in Next.js Dev Server

## Research Scope Contract
- **Topic:** Google Maps Address Validation API returns 401 in Next.js dev server but works in standalone script
- **First Principles:** API key authentication, HTTP request formation, environment variable loading
- **Fundamentals:** fetch API, request headers, environment variables in Next.js
- **Scope Boundary:** Only server-side API calls, not client-side maps
- **Target Audience:** Developer debugging Google Maps API integration
- **Decay Risk:** Low (Google Maps API stable)

---

## Phase 1: Core Problem

**What we know:**
- Standalone script with same API key returns 200 OK
- Next.js API route with same API key returns 401 Unauthorized
- API key has no restrictions (IP, referer, API)
- API key length is correct (39 characters)

**What we need to verify:**
- Exact difference between standalone script request and Next.js request
- What Next.js is adding or modifying in the request
- Why Google Maps rejects the Next.js request but accepts the standalone request

---

## Phase 2: Cover and Move Plan

**Cover (Verification steps):**
1. Log exact request headers from standalone script
2. Log exact request headers from Next.js API route
3. Compare the two requests side-by-side
4. Identify the difference

**Move (Simplest fix):**
1. Make Next.js request identical to standalone script
2. Test if it works
3. If it works, we found the root cause

---

## Phase 3: Current Code Analysis

**Standalone script location:** `scripts/test-google-maps-api.mjs`

**Next.js API route location:** `app/api/shipping/route.ts`

**Both use:** Same API key `AIzaSyDSYZeJMFcpyVoVzDjx9fFbwv-FnjI8dFI`

---

## Phase 4: Hypothesis

**Most likely cause:** Next.js is adding or modifying request headers that Google Maps rejects.

**Possible differences:**
- User-Agent header
- Accept header
- Content-Type header format
- Connection header
- Host header
- Any other headers Next.js adds automatically

---

## Phase 5: Next Steps

1. Add logging to standalone script to capture all headers
2. Add logging to Next.js API route to capture all headers
3. Compare the two
4. Modify Next.js to match standalone script
5. Test

---

## Phase 6: Code Comparison

**Standalone script (works - 200 OK):**
```javascript
fetch(validationURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(validationRequestBody),
});
```

**Next.js API route (fails - 401):**
```typescript
fetch(validationURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(validationRequestBody),
});
```

**Observation:** The fetch calls are identical. Both use same API key, same headers, same body.

**Hypothesis:** Next.js is adding hidden headers that Google Maps rejects.

---

## Phase 7: Cover and Move Action

**Cover:** Fetch calls are identical in visible code. Next.js must be adding hidden headers or using different fetch implementation.

**Move:** Use undici or node-fetch explicitly in Next.js API route to match standalone script behavior exactly.

**Rationale:**
- Standalone script uses Node.js native fetch (works)
- Next.js might be using polyfilled fetch (fails)
- Using explicit Node.js fetch in Next.js should match standalone behavior

**Implementation:**
1. Install undici (native Node.js fetch)
2. Import undici in Next.js API route
3. Replace native fetch with undici.fetch
4. Test

---

## Phase 8: Test Result

**Result:** FAILED - undici fetch still returns 500 error

**Conclusion:** Hypothesis was wrong. The issue is not fetch implementation.

---

## Phase 9: Simplest Move

**Observation:**
- Standalone script works (200 OK)
- Next.js API route fails (401)
- Fetch calls are identical
- undici didn't fix it

**Simplest Move:** Copy exact working code from standalone script into Next.js API route.

**Implementation:**
1. Take the exact fetch code from standalone script
2. Paste it into Next.js API route
3. Test

**Rationale:** If the code is identical and the standalone script works, copying it verbatim should work in Next.js too. If it still fails, the issue is definitely the Next.js environment, not the code.

---

## Phase 10: Test Result

**Result:** FAILED - exact code copy still returns 500 error

**Conclusion:** The issue is NOT the code. The issue is the Next.js dev server environment.

**Root Cause Identified:** Google Maps API rejects requests from Next.js dev server environment but accepts requests from standalone Node.js script.

---

## Phase 11: Production Mode Test

**Test:** Ran Next.js in production mode (`npm run build && npm start`)

**Result:** FAILED - Still returns 500 error from `/api/shipping`

**Conclusion:** Hypothesis was WRONG. The issue is NOT the Next.js dev server environment. The issue is something else.

---

## Phase 12: Direct HTTP Test

**Test:** Called `/api/shipping` endpoint directly with curl/Invoke-WebRequest

**Result:** FAILED - Returns 500 error

**Conclusion:** The issue is NOT with Playwright. The issue is with the API route itself when called via HTTP.

---

## Phase 13: Server Log Analysis

**Test:** Checked server logs from production server

**Finding:** Google Maps API returns 200 OK! The API call is working perfectly.

**Actual Error:**
```
Error: Unauthorized - Session is expired, please re-authenticate
errorCode: "SIO-401-AEX"
```

**Root Cause Identified:** The 401 error is NOT from Google Maps API. It's from the Sanity write client. The Google Maps API call succeeds, but when the API route tries to write to Sanity, the Sanity write client fails with "Unauthorized - Session is expired".

---

## Phase 14: Conclusion

**The Issue:** Sanity write client authentication is failing in production mode, not Google Maps API.

**Evidence:**
- Google Maps API returns 200 OK (confirmed in logs)
- Sanity write fails with 401 (SIO-401-AEX error code)
- The 500 error from `/api/shipping` is caused by the Sanity write failure, not Google Maps

---

## Verification Status
- [x] API key confirmed working in standalone script
- [x] API key confirmed no restrictions
- [x] API key confirmed loaded correctly in Next.js
- [x] Fetch calls compared - identical visible headers
- [x] Test with undici fetch in Next.js - FAILED
- [x] Copy exact standalone script code into Next.js API route - FAILED
- [x] Test in production mode - FAILED
- [x] Test /api/shipping directly with curl - FAILED
- [x] Root cause NOT Playwright
- [x] Root cause NOT Google Maps API
- [x] Root cause IS Sanity write client authentication (SIO-401-AEX)
