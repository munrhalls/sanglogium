# Furgonetka Rate Calculation Experiment Results

**Date:** 2026-05-14
**Chunk:** sang-logium-ztc (Chunk 7: Furgonetka Rate Calculation Experiment Implementation)
**Purpose:** Document results of Furgonetka rate calculation experiment

---

## Experiment Summary

**Objective:** Compare cost differences between geographically close and far recipients across multiple carriers.

**Scenarios:**
- Close: Warsaw to Warsaw (~2 km, same city)
- Far: Warsaw to Kraków (~300 km, different region)

**Carriers Tested:**
- InPost (service_id: 11597700)
- DPD (service_id: 11597695)
- DHL (service_id: 11597702)
- Poczta Polska (service_id: 11597699)

**Note:** Due to delivery_time API limitation (issue sang-logium-nuu), this experiment only validates cost realism.

---

## Test Results

### Close Scenario (Warsaw to Warsaw, ~2 km)

| Carrier | Price Gross (PLN) | Price Net (PLN) | Status |
|---------|-------------------|-----------------|--------|
| InPost | 19.31 | 15.70 | ✓ Success |
| DPD | 27.17 | 22.09 | ✓ Success |
| DHL | - | - | ✗ Postcode error |
| Poczta Polska | - | - | ✗ Dimension error |

**Errors:**
- DHL: "Podany kod pocztowy jest niedostępny" (Postal code not available) - likely sandbox limitation
- Poczta Polska: "Minimalne wymiary paczki to 16 x 10 cm" (Minimum package dimensions 16x10 cm) - test package too small

### Far Scenario (Warsaw to Kraków, ~300 km)

| Carrier | Price Gross (PLN) | Price Net (PLN) | Status |
|---------|-------------------|-----------------|--------|
| InPost | 19.31 | 15.70 | ✓ Success |
| DPD | 27.17 | 22.09 | ✓ Success |
| DHL | 24.20 | 19.67 | ✓ Success |
| Poczta Polska | - | - | ✗ Dimension error |

**Errors:**
- Poczta Polska: Same dimension error - requires minimum 16x10 cm package

---

## Cost Analysis

### Price Comparison by Carrier (Far Scenario)

1. InPost: 19.31 PLN (lowest)
2. DHL: 24.20 PLN
3. DPD: 27.17 PLN (highest)

**Price Variance:** 7.86 PLN (40.7% difference between lowest and highest)

### Distance Impact Analysis

| Carrier | Close (PLN) | Far (PLN) | Difference | % Change |
|---------|-------------|-----------|------------|----------|
| InPost | 19.31 | 19.31 | 0.00 | 0.00% |
| DPD | 27.17 | 27.17 | 0.00 | 0.00% |

**Average price difference (far vs close):** 0.00 PLN (0.00%)

---

## Realism Assessment

### ✓ Realistic: Carrier Price Differences

**Finding:** Carriers show meaningful price differences (7.86 PLN variance).

**Assessment:** This is realistic behavior. Different carriers have different pricing structures, and the variance between InPost (19.31 PLN) and DPD (27.17 PLN) reflects real-world carrier pricing differences.

### ⚠ Unrealistic: Distance Impact

**Finding:** Distance has zero impact on pricing in sandbox environment.

**Assessment:** In a real-world scenario, shipping costs typically increase with distance. The sandbox API shows flat-rate pricing regardless of distance (0.00 PLN difference between 2 km and 300 km). This is likely a simplification for sandbox testing purposes.

**Note:** Production API may use distance-based pricing. This should be verified before production deployment.

---

## Carrier-Specific Findings

### InPost
- **Pricing:** 19.31 PLN (flat rate regardless of distance)
- **Reliability:** 100% success rate in tests
- **Dimensions:** Works with 15x15x15 cm package
- **Verdict:** Reliable, consistent pricing

### DPD
- **Pricing:** 27.17 PLN (40.7% more expensive than InPost)
- **Reliability:** 100% success rate in tests
- **Dimensions:** Works with 15x15x15 cm package
- **Verdict:** Higher cost but reliable

### DHL
- **Pricing:** 24.20 PLN (25.4% more expensive than InPost)
- **Reliability:** 50% success rate (failed for close scenario)
- **Issue:** Postcode validation error for Warsaw postcode
- **Dimensions:** Works with 15x15x15 cm package
- **Verdict:** Mid-range pricing but has postcode validation issues in sandbox

### Poczta Polska
- **Pricing:** Unknown (dimension error blocked all tests)
- **Reliability:** 0% success rate
- **Issue:** Requires minimum package dimensions of 16x10 cm
- **Verdict:** Cannot test with current package size (15x15x15 cm)

---

## Experiment Script

**Location:** `scripts/run-furgonetka-experiment.mjs`

**Usage:**
```bash
node scripts/run-furgonetka-experiment.mjs
```

**Output:**
- Authentication status
- Pricing results for each carrier and scenario
- Price comparison analysis
- Realism assessment

---

## Limitations

1. **Delivery Time Not Available:** delivery_time field is always null (see issue sang-logium-nuu)
2. **Sandbox Flat-Rate Pricing:** Distance does not affect cost (may differ in production)
3. **Carrier Availability:** Some carriers have validation errors in sandbox (DHL postcode, Poczta Polska dimensions)
4. **Sample Size:** Only 2 distance scenarios tested (close vs far)

---

## Conclusions

### Cost Realism: PARTIALLY VERIFIED

**✓ Confirmed:**
- Carriers have different pricing structures
- Price differences are meaningful (7.86 PLN variance)
- InPost is cheapest, DPD is most expensive

**⚠ Not Confirmed:**
- Distance-based pricing (sandbox uses flat-rate)
- Production pricing behavior unknown

### Recommendation

1. **For Experiment Purpose:** The API provides sufficient cost data to verify carrier pricing differences. The experiment can proceed with cost-only verification.

2. **For Production:** Verify that production API uses distance-based pricing. The sandbox flat-rate behavior may not reflect production reality.

3. **For Carrier Selection:** InPost and DPD are reliable carriers in sandbox. DHL has postcode validation issues. Poczta Polska requires larger package dimensions.

---

## Next Steps

1. Proceed to Chunk 8 (Documentation) to document experiment methodology and results
2. Address delivery_time limitation (issue sang-logium-nuu) if delivery time data is required
3. Consider testing with larger package dimensions (16x10 cm minimum) to include Poczta Polska
4. Verify production API pricing behavior before production deployment
