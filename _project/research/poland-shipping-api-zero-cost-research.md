# Poland Zero-Cost Shipping API — Gap Analysis & New Research

**Date:** 2026-05-14
**Status:** Packlink PRO Ruled Out — Pivoting to epaka.pl
**Decay Risk:** Medium (API policies change; re-verify every 6 months)

---

## 1. What Previous Research Missed

The prior research (`eu-aggregate-carrier-test-api.md`) correctly identified the "Sandbox Paradox" and the Packlink PRO read-only workaround. However, it left critical gaps:

### Gap 1: Packlink PRO Polish Account Never Tested — NOW RESOLVED

The research explicitly stated:
> "Test PL→PL and GB→GB domestic rates with existing API key"

**RESOLUTION (2026-05-14):** Packlink PRO has a single global account type — there are no country-specific accounts. The existing API key was tested and returned **0 services for PL→PL**. This is definitive: **Packlink PRO does not support Poland domestic shipping.** No further testing needed.

### Gap 2: Polish-Native Aggregators Completely Overlooked

The research focused on global/US-centric aggregators (Easyship, EasyPost, Shippo, ShipEngine) and direct carrier APIs. It completely missed Poland-native shipping platforms:

- **epaka.pl** — Major Polish courier broker with public REST API
- **tanieprzesylkikurierskie.pl** — Polish shipping platform with REST API and beta environment
- **Apaczka** — Polish shipping aggregator (requires contract, not zero-cost)

### Gap 3: DHL Express MyDHL API Not Investigated

The DHL developer portal (`developer.dhl.com`) offers free registration. The legacy XML API path may provide sandbox credentials without requiring a DHL business account. This was never checked.

### Gap 4: Sendcloud Free Tier API Access Not Verified

Sendcloud has a free plan ("use Sendcloud for free, forever") and a shipping rates API. Whether the free plan includes API access was never determined. Poland is not a fully supported origin country but may work with a direct carrier contract.

---

## 2. Candidate Evaluation Matrix

| Platform | Zero-Cost | Self-Service | Real Rates | PL Domestic | API Status |
|----------|-----------|-------------|------------|-------------|------------|
| **Packlink PRO** | ✅ Free registration | ✅ Yes | ✅ Confirmed (DE→DE) | ❌ **RULED OUT (0 PL→PL)** | Unofficial/reverse-engineered |
| **epaka.pl** | ✅ Free registration | ✅ Yes (social login) | ⚠️ Likely | ✅ Yes (Polish broker) | Public REST API |
| **tanieprzesylkikurierskie.pl** | ⚠️ Free registration | ❌ API key via email | ⚠️ Likely | ✅ Yes (Polish platform) | REST API + beta env |
| **DHL Express MyDHL (legacy XML)** | ✅ Free registration | ⚠️ May need account | ✅ Yes (sandbox) | ✅ Yes | Official but deprecated |
| **DHL Express MyDHL (REST)** | ❌ Needs DHL account | ❌ Needs account mgr | ✅ Yes | ✅ Yes | Official |
| **Sendcloud** | ✅ Free plan | ✅ Yes | ⚠️ Unverified for PL | ❌ PL not fully supported | Official |
| **Apaczka** | ❌ Requires contract | ❌ Sales contact | ✅ Yes | ✅ Yes | Official |
| **InPost ShipX** | ❌ Requires form | ❌ Support form | ✅ Yes (sandbox) | ✅ Yes | Official |
| **Poczta Polska** | ❌ Requires form | ❌ Registration form | ✅ Yes (test env) | ✅ Yes | Official |
| **UPS API** | ❌ Broken sandbox | ❌ No test creds | ❌ No | ❌ No | Official but broken |
| **FedEx API** | ❌ Needs CC | ❌ Business account | ❌ No | ❌ No | Official |
| **ShipEngine** | ✅ Free sandbox | ✅ Yes | ❌ US-only sandbox | ❌ No | Official |

---

## 3. Top Candidates — Detailed Analysis

### 3.1 Packlink PRO — ❌ RULED OUT

**Why it failed:** Packlink PRO has a single global account type. The existing API key was tested with PL→PL parameters and returned 0 services. There are no country-specific accounts to try.

**Verdict:** Packlink PRO does not support Poland domestic shipping. No further testing needed.

---

### 3.2 epaka.pl API — ⭐ HIGHEST PRIORITY (NOW PRIMARY)

**Why it was missed:** Poland-native platform, not on the radar of global aggregator research.

**What we know:**
- Public REST API at `https://api.epaka.pl/`
- OpenAPI 3.0 spec at `https://api.epaka.pl/epaka-api.json`
- Free registration via Facebook, Allegro, Apple, or Google
- OAuth authentication (`/oauth/token`)
- Has "Wycena indywidualna" (Individual Valuation) tag group in API spec
- Has courier listing endpoint: `GET /v1/couriers`
- Has points/locations endpoint: `GET /v1/points`
- Has order checking/valuation: `POST /v1/order/content/check`
- Supported carriers include major Polish couriers (InPost, DPD, DHL, GLS, etc.)

**API Authentication:**
- OAuth 2.0 flow
- Endpoints: `/oauth/authenticate`, `/oauth/authorize`, `/oauth/token`
- Bearer token for authenticated requests

**Key Endpoints for Rate Quotes:**
- `POST /v1/order/content/check` — Check order content and get pricing info
- `GET /v1/couriers` — List available couriers with delivery types
- `GET /v1/points` — List pickup/dropoff points by location

**Action needed:** Register a free account, obtain OAuth token, test rate quote endpoints with PL→PL parameters.

**Risk:** Low-Medium. Official API, free registration. But rate quote endpoint behavior needs verification — may require pre-funded balance or have limitations.

---

### 3.3 tanieprzesylkikurierskie.pl API — THIRD PRIORITY

**Why it was missed:** Poland-native platform, not on the radar.

**What we know:**
- REST API at `https://api.tanieprzesylkikurierskie.pl/`
- Beta/test environment at `https://api-beta.tanieprzesylkikurierskie.pl/`
- Has Offers endpoint: `POST /user/orders/offers` — "creates offers for given order parameters, allows determining which available courier returns the best conditions"
- API key required in `X-Api-Key` header
- Token auth for some resources: `Authorization: Bearer {token}`
- **CRITICAL LIMITATION:** API key must be requested via email to IT department — NOT self-service

**API Authentication:**
- API key via `X-Api-Key` header
- Token via `POST /token` for authenticated resources

**Key Endpoint:**
- `POST /user/orders/offers` — Rate quotes with package dimensions, weight, product type

**Action needed:** Email IT department for API key, then test Offers endpoint.

**Risk:** High. Not self-service. Requires human approval. Uncertain if free test access is granted without business relationship.

---

### 3.4 DHL Express MyDHL API (Legacy XML) — FOURTH PRIORITY

**Why it was missed:** The research focused on aggregators, not direct carrier developer programs.

**What we know:**
- Legacy XML API (deprecated in late 2024, but still functional)
- Registration at `https://xmlportal.dhl.com/login`
- DHL provides XML-PI toolkit and API credentials for both Sandbox and Production
- "It takes around 24 hours for the API credentials to be activated"
- Credentials: Site ID + Password
- The new MyDHL REST API requires a DHL account number and account manager

**API Authentication:**
- Site ID + Password (legacy XML)
- API Key + API Secret (new REST, requires DHL account)

**Key Endpoint:**
- Rate request with shipper/receiver address, returns product capabilities, services, estimated delivery time, and prices

**Action needed:** Register at XML portal, indicate integration purpose, wait for credentials.

**Risk:** High. Deprecated API. May require business verification. 24-hour activation delay.

---

## 4. Definitively Ruled Out

| Platform | Reason |
|----------|--------|
| **ShipEngine** | Sandbox only supports US carriers (UPS, FedEx, USPS). "This is the case no matter which country your account is in." |
| **UPS API** | GitHub issue #201 confirms: as of Dec 2025, developers cannot generate test OAuth credentials for REST API sandbox. |
| **FedEx API** | Requires business account with credit card for test credentials. |
| **InPost ShipX** | Production access requires support form submission. Sandbox likely requires credentials too. |
| **Poczta Polska** | Test environment requires registration form submission. Not self-service. |
| **Apaczka** | Requires signed contract with apaczka.pl. Must contact customer support to enable Web API. |
| **Easyship** | Free plan does NOT include API access. Rates API is metered pay-as-you-go. Sandbox returns mock data. |
| **EasyPost** | Requires billing setup. Test mode returns static rates. US-centric. |
| **Shippo** | Test mode returns mock/empty for EU. Requires billing for full carrier list. |
| **Sendcloud** | Poland not a fully supported origin country. Free plan API access unverified. |

---

## 5. Recommended Action Plan

### Immediate (Today)

1. **Register at epaka.pl** and test their API
   - Create free account at `https://www.epaka.pl/uzytkownik/rejestracja` (social login available)
   - Obtain OAuth token via `/oauth/token`
   - Test `POST /v1/order/content/check` with PL→PL parameters
   - Test `GET /v1/couriers` to confirm available Polish carriers

### If epaka.pl Works

- Build a new `lib/shipping/epaka-rates.ts` module following the same pattern as `packlink-rates.ts`
- Integrate into the existing 3-tier architecture (replace Packlink for PL origin, keep for DE/GB)
- Remove the Tier 3 mock fallback for Poland

---

## 6. Key Insight

The previous research's core methodology was sound (use production API read-only for rate quoting), but it assumed Packlink PRO might support Poland domestic through a country-specific account. This assumption was incorrect — Packlink PRO has a single global account type and definitively returns 0 services for PL→PL.

The research was also globally-scoped and missed Poland-native platforms. **epaka.pl** is now the primary candidate — a purpose-built Polish courier broker with a public REST API and free registration.
