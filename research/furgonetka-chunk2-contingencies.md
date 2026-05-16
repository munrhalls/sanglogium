# Chunk 2 Contingency Plan

**Date:** 2026-05-14
**Chunk:** sang-logium-brj (Chunk 2: API Endpoint Discovery for Furgonetka)
**Purpose:** Systematic contingency planning to mitigate risks and avoid getting lost

---

## Contingency Framework

**Decision Rule:** If any step fails or complications arise, follow the contingency for that step before proceeding. If contingency fails, STOP and escalate to user.

---

## Step 2: Pre-flight check 1 - Test authentication is working

**Risk:** Authentication fails (401 Unauthorized, invalid token)

**Contingencies:**
1. Verify environment variables are loaded correctly (`FURGONETKA_USERNAME`, `FURGONETKA_PASSWORD`)
2. Try alternative auth method (client credentials grant as fallback)
3. Check if credentials expired (password grant tokens expire in 30 days)
4. Re-run existing auth test script: `scripts/test-furgonetka-auth.mjs`

**Stop Condition:** If both auth methods fail, STOP - credentials issue requires user intervention

---

## Step 3: Pre-flight check 2 - Test basic API connectivity

**Risk:** API unreachable (network errors, DNS failures, timeout)

**Contingencies:**
1. Verify base URL is correct: `https://api.sandbox.furgonetka.pl`
2. Test with simple GET request to root endpoint
3. Check if sandbox environment is down (try production as diagnostic only)
4. Verify network connectivity (can reach other external APIs)

**Stop Condition:** If sandbox API is completely unreachable, STOP - infrastructure issue

---

## Step 4: Pre-flight check 3 - Test known working endpoint (/account/services)

**Risk:** Known endpoint fails (403 Forbidden, 404 Not Found, 500 error)

**Contingencies:**
1. Verify token has correct scope (should have shipping permissions)
2. Check if endpoint path changed (try variations: `/account/services`, `/services`, `/couriers`)
3. Verify Accept header: `application/vnd.furgonetka.v1+json`
4. Check if sandbox account has services configured

**Stop Condition:** If `/account/services` fails with valid auth, STOP - account/permission issue

---

## Step 5: Research existing Furgonetka documentation in workspace

**Risk:** Documentation outdated, incomplete, or misleading

**Contingencies:**
1. Cross-reference multiple research files (don't rely on single source)
2. Check dates on research files - prioritize recent findings
3. If docs contradict each other, test endpoints directly to verify
4. Note any discrepancies in documentation for later clarification

**Stop Condition:** If no useful documentation exists, proceed to endpoint testing (Step 7) directly

---

## Step 6: Test /account/services endpoint to get carrier list

**Risk:** Endpoint returns unexpected data structure or errors

**Contingencies:**
1. Log full response to diagnose structure
2. Handle empty response gracefully (no carriers configured)
3. Parse response flexibly (handle different JSON structures)
4. If response format changed, update parsing logic and document change

**Stop Condition:** If endpoint returns 500 error consistently, STOP - API issue

---

## Step 7: Identify rate calculation endpoint through testing/documentation

**Risk:** Cannot find rate calculation endpoint (all tested endpoints return 405)

**Contingencies:**
1. Review existing endpoint test results from `research/furgonetka-pricing-endpoint-discovery.md`
2. Try Polish endpoint names (based on changelog): `/przesylka`, `/kalkulacja`
3. Use PHP client as reference (Kwarcek/furgonetka-rest-api-php)
4. Test POST `/packages` endpoint (known to exist but auth issues in past)
5. If still not found, consider switching to Epaka.pl API (documented alternative)

**Stop Condition:** If 30+ endpoint patterns tested and none work, STOP - requires official documentation access or support contact

---

## Step 8: Determine if single endpoint or multiple endpoints needed

**Risk:** Complex multi-endpoint flow discovered (carrier list separate from pricing)

**Contingencies:**
1. Document the multi-endpoint flow clearly
2. Assess if complexity is acceptable for experiment scope
3. If too complex, consider simplifying experiment (fewer carriers, single scenario)
4. If multi-endpoint is unavoidable, document each endpoint's purpose

**Stop Condition:** If flow requires >3 endpoints or complex orchestration, STOP - assess with user if scope is viable

---

## Step 9: Define carrier selection strategy based on available carriers

**Risk:** Popular carriers (InPost, DPD, DHL, Poczta Kurier48) unavailable

**Contingencies:**
1. Use fallback list: UPS, FedEx, K-EX, Paczka w RUCHu
2. Adjust selection criteria: use any 4 available carriers
3. If fewer than 4 carriers available, use what's available and note limitation
4. If no carriers available, STOP - account configuration issue

**Stop Condition:** If 0 carriers available from `/account/services`, STOP - account needs carrier configuration

---

## Step 10: Define how to input selected carriers into API request

**Risk:** Request format unclear (how to specify carriers in pricing request)

**Contingencies:**
1. Test with single carrier first (simplest case)
2. Try common patterns: `carrier_id`, `service_id`, `courier`, `carrier`
3. Examine PHP client source code for carrier selection examples
4. If unclear, test with empty carrier list to see if API returns all carriers

**Stop Condition:** If cannot determine carrier input method after testing, document as unknown and proceed to Step 11

---

## Step 11: Document all findings in endpoint discovery report

**Risk:** Documentation incomplete or inconsistent with Chunk 1 requirements

**Contingencies:**
1. Cross-reference with Chunk 1 data requirements document
2. Validate all required fields (carrier_id, delivery_time, cost, currency) are addressed
3. If gaps found, note them clearly in documentation
4. Have peer review if possible (user review)

**Stop Condition:** None - documentation can be incomplete if endpoints not found, but must clearly state what was discovered vs what remains unknown

---

## Escalation Triggers (STOP conditions)

**Stop immediately and escalate to user if:**
- Authentication fails with both methods (credentials issue)
- Sandbox API completely unreachable (infrastructure issue)
- Known working endpoint `/account/services` fails (account/permission issue)
- `/account/services` returns 500 error consistently (API issue)
- 30+ endpoint patterns tested and pricing endpoint not found (requires official docs)
- Multi-endpoint flow requires >3 endpoints (scope complexity)
- 0 carriers available from `/account/services` (account configuration)

**Do not sink time on:** Endless endpoint guessing, credential troubleshooting beyond basic checks, complex multi-endpoint orchestration without user approval

---

## Success Criteria

Chunk 2 is successful if:
- Pre-flight checks pass (auth, connectivity, known endpoint)
- Rate calculation endpoint identified OR documented as not accessible
- Carrier list retrieved from `/account/services`
- Single vs multi-endpoint determination made
- Carrier selection strategy defined
- Carrier input method defined OR documented as unknown
- All findings documented clearly

**Partial success acceptable:** If pricing endpoint not found but carrier list and auth working, document as BLOCKED and move to alternative API consideration (Epaka.pl)
