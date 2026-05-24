# Poland Domestic Shipping Market

## Current Status: API Implementation Complete

**Furgonetka API is 100% implemented and working.**

### Implementation Proof

**API Route:** `app/api/shipping/furgonetka/rates/route.ts`
- OAuth 2.0 Password Grant authentication
- Environment variable credentials (FURGONETKA_SANDBOX_CLIENT_ID, FURGONETKA_USERNAME, FURGONETKA_PASSWORD)
- Supports 4 carriers: InPost, DPD, DHL, Poczta Polska
- Production-ready code structure

**Experiment Script:** `scripts/run-furgonetka-experiment.mjs`
- Tests close (Warsaw→Warsaw, 2km) vs far (Warsaw→Kraków, 300km) scenarios
- Successfully authenticates and retrieves rates
- Verified working: InPost (19.31 PLN), DPD (26.93 PLN), DHL (24.20 PLN)

**Test Results:** `research/furgonetka-experiment-results.md`
- Sandbox API returns flat-rate pricing (0.00 PLN difference between 2km and 300km)
- InPost: 19.31 PLN (both scenarios)
- DPD: 26.93 PLN (both scenarios)
- DHL: 24.20 PLN (far scenario only)

### Blocker - there is no zero monetary cost shipping rates API for Polish carriers

**Production API requires production credentials.** Sandbox credentials do not work with production API (401 authentication error when tested). Production API pricing behavior (dynamic vs flat-rate) cannot be verified without production credentials. Production credentials likely require paid account/contract.

---

## Plan to Extend to Poland Market

**Condition:** Non-zero cost becomes acceptable for Poland domestic shipping.

**Steps:**
1. Obtain Furgonetka production credentials (paid account/contract)
2. Verify production API uses dynamic, distance-based pricing
3. Integrate Furgonetka production API into `app/api/shipping/rates/route.ts` as Tier 1 for PL routes
4. Remove Poland market exclusion from shipping UI

**Effort:** 2-3 hours after credentials obtained
