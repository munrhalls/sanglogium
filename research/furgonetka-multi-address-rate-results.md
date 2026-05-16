# Multi-Address Rate Calculation Results

**Issue:** sang-logium-tts
**Date:** 2026-05-15
**Purpose:** Test carrier pricing across 5 geographically diverse Polish recipient addresses

---

## Test Addresses

| City | Postcode | Region |
|------|----------|--------|
| Warszawa | 00-001 | Central Poland |
| Kraków | 30-001 | Southern Poland |
| Gdańsk | 80-001 | Northern Poland |
| Wrocław | 50-001 | Western Poland |
| Poznań | 61-001 | Western Poland |

**Sender:** Warszawa (00-533)
**Package:** 15x15x15 cm, 1.5 kg

---

## Carrier Pricing Comparison by Address

| Carrier | Warszawa | Kraków | Gdańsk | Wrocław | Poznań |
|---------|----------|--------|--------|---------|--------|
| InPost | 19.31 PLN | 19.31 PLN | 19.31 PLN | 19.31 PLN | 19.31 PLN |
| FedEx | 22.62 PLN | 22.62 PLN | 22.62 PLN | 22.62 PLN | 22.62 PLN |
| DHL | FAILED | 24.20 PLN | 24.20 PLN | 24.20 PLN | 24.20 PLN |
| DPD | 27.17 PLN | 27.17 PLN | 27.17 PLN | 27.17 PLN | 27.17 PLN |
| UPS | 53.46 PLN | 53.46 PLN | 53.46 PLN | 53.46 PLN | 53.46 PLN |
| Ambro Express | 121.37 PLN | 121.37 PLN | 121.37 PLN | 121.37 PLN | 121.37 PLN |

---

## Carrier Consistency Analysis

### InPost
- **Success Rate:** 5/5 (100%)
- **Failed Addresses:** None
- **Status:** ✓ Consistent across all addresses
- **Pricing:** Flat-rate (19.31 PLN)

### FedEx
- **Success Rate:** 5/5 (100%)
- **Failed Addresses:** None
- **Status:** ✓ Consistent across all addresses
- **Pricing:** Flat-rate (22.62 PLN)

### DHL
- **Success Rate:** 4/5 (80%)
- **Failed Addresses:** Warszawa (00-001)
- **Error:** "Podany kod pocztowy jest niedostępny" (Postcode unavailable)
- **Status:** ⚠ Inconsistent - fails for Warsaw postcode
- **Pricing:** Flat-rate (24.20 PLN) where successful

### DPD
- **Success Rate:** 5/5 (100%)
- **Failed Addresses:** None
- **Status:** ✓ Consistent across all addresses
- **Pricing:** Flat-rate (27.17 PLN)

### UPS
- **Success Rate:** 5/5 (100%)
- **Failed Addresses:** None
- **Status:** ✓ Consistent across all addresses
- **Pricing:** Flat-rate (53.46 PLN)

### Ambro Express
- **Success Rate:** 5/5 (100%)
- **Failed Addresses:** None
- **Status:** ✓ Consistent across all addresses
- **Pricing:** Flat-rate (121.37 PLN)

---

## Price Variance Analysis

All carriers show **flat-rate pricing** with zero geographic variance:

| Carrier | Price Range (PLN) | Variance (PLN) |
|---------|-------------------|----------------|
| InPost | 19.31 - 19.31 | 0.00 |
| FedEx | 22.62 - 22.62 | 0.00 |
| DHL | 24.20 - 24.20 | 0.00 |
| DPD | 27.17 - 27.17 | 0.00 |
| UPS | 53.46 - 53.46 | 0.00 |
| Ambro Express | 121.37 - 121.37 | 0.00 |

**Finding:** Sandbox environment uses flat-rate pricing regardless of geographic distance. Production API may use distance-based pricing.

---

## Inconsistent Carriers

### DHL (service_id: 11597702)
**Issue:** Fails for Warsaw postcode (00-001) with error "Podany kod pocztowy jest niedostępny"
**Impact:** Cannot use DHL for Warsaw recipients in sandbox
**Workaround:** Use alternative carriers for Warsaw addresses
**Note:** DHL works correctly for Kraków, Gdańsk, Wrocław, and Poznań postcodes

---

## Acceptance Criteria Status

✓ Script executes successfully for all 5 addresses
✓ Output shows carrier pricing comparison per address
✓ Identifies carriers with inconsistent pricing or failures

**Status:** ACCEPTED

---

## Key Findings

1. **Flat-Rate Pricing:** All carriers use flat-rate pricing in sandbox (no geographic variance)
2. **Carrier Reliability:** 5 of 6 carriers are 100% consistent across all test addresses
3. **DHL Limitation:** DHL has postcode validation issues with Warsaw (00-001)
4. **Price Ranking:** InPost (cheapest) → FedEx → DHL → DPD → UPS → Ambro Express (most expensive)

---

## Recommendations

1. **For Warsaw Addresses:** Use InPost, FedEx, DPD, UPS, or Ambro Express (avoid DHL)
2. **For Other Polish Cities:** All 6 carriers are available
3. **For Production:** Verify that production API uses distance-based pricing
4. **For Cost Optimization:** InPost is consistently the cheapest option

---

## Script Location

**File:** `scripts/multi-address-rate-calculation.mjs`
**Usage:** `node scripts/multi-address-rate-calculation.mjs`
