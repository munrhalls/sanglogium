# AlleKurier Rate Validation Criteria and Test Scenarios

## Executive Summary

This document defines validation criteria and test scenarios to verify that shipping rates returned by the AlleKurier API for Poland are accurate and professionally suitable for the shipping page.

**Key Finding:** Current implementation has gaps that prevent comprehensive validation. The AlleKurier integration uses hardcoded sender data instead of .env configuration, and Poland sender address variables are missing from .env.

## Current State Analysis

### Implementation Status

**File: `lib/shipping/allekurier.ts`**
- Uses hardcoded sender data (lines 89-93): "Test Sender", "Warsaw"
- Does NOT read from .env sender address variables
- API endpoint: `https://allekurier.pl/api_v1/order_create`
- Returns: `hid`, `number`, `cost` (PLN), `status`

**File: `scripts/test-allekurier.mjs`**
- Single test case: Warsaw (00-001) → Krakow (30-001)
- Package: 1000g, 30x20x10cm
- Service: DPD

**File: `.env`**
- Has: ALLEKURIER_EMAIL, ALLEKURIER_PASSWORD ✓
- Has: SENDER_ADDRESS_NL_*, SENDER_ADDRESS_DE_*, SENDER_ADDRESS_GB_* ✓
- Missing: SENDER_ADDRESS_PL_* ✗

### Rate Calculation Factors (from API Documentation)

AlleKurier rates are calculated based on:
1. **Service type** (e.g., dpd, inpost, fedex)
2. **Package dimensions** (weight, width, height, length)
3. **Distance** (sender postal code → recipient postal code)
4. **Additional services** (COD amount, insurance amount)
5. **Package type** (parcel, package)

## Validation Criteria: "Accurate and Professionally Correct"

### Definition

Rates are **accurate and professionally correct** when:

1. **Real Carrier Rates**: Rates returned are actual carrier rates (not mock/sandbox data)
   - Verified by: Using AlleKurier test account with confirmed test mode status
   - Evidence: Test account returns real carrier rates per AlleKurier documentation

2. **Distance Sensitivity**: Rates change based on distance between sender and recipient
   - Expected behavior: Longer distance = higher rate (for same service and parcel)
   - Test: Compare rates for same parcel to different recipient postal codes

3. **Dimension Sensitivity**: Rates change based on package weight and dimensions
   - Expected behavior: Heavier/larger packages = higher rate (for same service and route)
   - Test: Compare rates for different parcel sizes on same route

4. **Service Differentiation**: Different carriers have different rates for same shipment
   - Expected behavior: DPD ≠ InPost ≠ FedEx for same shipment
   - Test: Request rates for same shipment with different service names

5. **Reasonable Range**: Rates fall within expected market range for Poland domestic shipping
   - Expected range: ~10-30 PLN for standard parcels (1-5kg) within Poland
   - Outlier detection: Rates <5 PLN or >50 PLN for standard parcels are suspicious

6. **Currency Consistency**: All rates returned in PLN (Polish Złoty)
   - Expected format: Numeric string (e.g., "12.76")
   - Validation: Check currency field or response format

7. **Response Completeness**: Response includes all required fields
   - Required fields: `hid`, `cost`, `status`
   - Optional fields: `number` (tracking number)

### When Rates Are FLAWED

Rates are flawed when:
- Using sandbox/mock API that returns sample data (not applicable to AlleKurier test account)
- Package dimensions/weight are estimated vs actual measured
- Sender/recipient addresses are incomplete or inaccurate
- Fuel surcharges, rural area surcharges not included (carrier-specific)
- Rates are cached and not refreshed (carrier rates change periodically)
- Additional services (COD, insurance) not properly calculated
- Account not marked as test (causes actual charges)

## Test Matrix

### Test Matrix Structure

The test matrix covers three dimensions:
1. **Parcel Data Variations** (weight, dimensions)
2. **Recipient Address Variations** (postal codes across Poland)
3. **Sender Address Variations** (if SENDER_ADDRESS_PL_* added to .env)

### Test Scenarios

#### Scenario 1: Distance Sensitivity (Same Parcel, Different Recipients)

| Test ID | Sender Postal Code | Recipient Postal Code | City | Distance | Expected Rate Behavior |
|---------|-------------------|----------------------|------|----------|------------------------|
| D1-1 | 00-001 (Warsaw) | 00-002 (Warsaw) | Warsaw | Local | Lowest rate |
| D1-2 | 00-001 (Warsaw) | 30-001 (Krakow) | Krakow | ~300km | Medium rate |
| D1-3 | 00-001 (Warsaw) | 80-001 (Gdansk) | Gdansk | ~350km | Medium-high rate |
| D1-4 | 00-001 (Warsaw) | 50-001 (Wroclaw) | Wroclaw | ~350km | Medium-high rate |
| D1-5 | 00-001 (Warsaw) | 53-001 (Wroclaw outskirts) | Wroclaw | ~350km | Similar to D1-4 |

**Validation:** Rate should increase with distance. D1-1 should be cheapest, D1-2/D1-3/D1-4 should be higher and similar to each other.

#### Scenario 2: Parcel Dimension Sensitivity (Same Route, Different Parcels)

| Test ID | Weight (g) | Dimensions (cm) | Volume (cm³) | Expected Rate Behavior |
|---------|------------|-----------------|-------------|------------------------|
| P2-1 | 500 | 20x15x10 | 3000 | Lowest rate |
| P2-2 | 1000 | 30x20x10 | 6000 | Medium rate (baseline) |
| P2-3 | 2000 | 40x30x15 | 18000 | Higher rate |
| P2-4 | 5000 | 50x40x30 | 60000 | Highest rate |
| P2-5 | 1000 | 10x10x10 | 1000 | Similar to P2-2 (same weight) |

**Validation:** Rate should increase with weight and volume. P2-1 cheapest, P2-4 most expensive. P2-2 and P2-5 should be similar (same weight).

#### Scenario 3: Service Differentiation (Same Shipment, Different Carriers)

| Test ID | Service Name | Carrier | Expected Rate Behavior |
|---------|--------------|---------|------------------------|
| S3-1 | dpd | DPD | Baseline rate |
| S3-2 | inpost | InPost | May differ from DPD |
| S3-3 | fedex | FedEx | May differ from DPD/InPost |
| S3-4 | dhl | DHL | May differ from others |

**Validation:** Different carriers should have different rates for the same shipment. No two carriers should have identical rates (unlikely).

#### Scenario 4: Additional Services (COD and Insurance)

| Test ID | COD Amount (PLN) | Insurance Amount (PLN) | Expected Rate Behavior |
|---------|------------------|------------------------|------------------------|
| A4-1 | 0 | 0 | Baseline rate |
| A4-2 | 100 | 0 | Rate + COD fee |
| A4-3 | 0 | 500 | Rate + insurance fee |
| A4-4 | 100 | 500 | Rate + COD + insurance fees |

**Validation:** Additional services should increase rate. A4-1 should be cheapest, A4-4 most expensive.

#### Scenario 5: Sender Address Variations (Requires SENDER_ADDRESS_PL_* in .env)

| Test ID | Sender City | Sender Postal Code | Recipient Postal Code | Expected Rate Behavior |
|---------|-------------|-------------------|----------------------|------------------------|
| SA5-1 | Warsaw | 00-001 | 30-001 (Krakow) | Baseline |
| SA5-2 | Krakow | 30-001 | 00-001 (Warsaw) | Should be similar to SA5-1 (same route, reversed) |
| SA5-3 | Gdansk | 80-001 | 30-001 (Krakow) | Different from SA5-1/SA5-2 |

**Validation:** Rate should be symmetric for same route (Warsaw↔Krakow). Different sender locations should produce different rates.

### Baseline Test Configuration

**Default Test Parcel:**
- Weight: 1000g (1kg)
- Dimensions: 30x20x10cm
- Service: dpd
- COD: 0 PLN
- Insurance: 0 PLN

**Default Test Route:**
- Sender: Warsaw (00-001)
- Recipient: Krakow (30-001)

## Implementation Gaps and Recommendations

### Critical Gap 1: Missing Poland Sender Address in .env

**Current State:**
- .env has SENDER_ADDRESS_NL_*, SENDER_ADDRESS_DE_*, SENDER_ADDRESS_GB_*
- .env does NOT have SENDER_ADDRESS_PL_*

**Impact:**
- Cannot test sender address variations (Scenario 5)
- AlleKurier implementation uses hardcoded "Test Sender" in Warsaw
- Inconsistent with other country sender address configurations

**Recommendation:**
Add to .env:
```
# Poland (PL)
SENDER_ADDRESS_PL_NAME=Sang Logium PL
SENDER_ADDRESS_PL_STREET=Mokotowska 63
SENDER_ADDRESS_PL_CITY=Warszawa
SENDER_ADDRESS_PL_STATE=MZ
SENDER_ADDRESS_PL_ZIP=00-533
SENDER_ADDRESS_PL_COUNTRY=PL
SENDER_ADDRESS_PL_PHONE=+48123456789
SENDER_ADDRESS_PL_EMAIL=pl@sanglogium.com
```

### Critical Gap 2: AlleKurier Implementation Uses Hardcoded Sender Data

**Current State:**
- `lib/shipping/allekurier.ts` lines 89-93 use hardcoded values
- Does NOT read from .env sender address variables

**Impact:**
- Cannot test sender address variations
- Inconsistent with professional configuration pattern
- Hard to maintain if sender address changes

**Recommendation:**
Update `lib/shipping/allekurier.ts` to read sender address from .env:
```typescript
// Read from .env or use defaults
const senderName = process.env.SENDER_ADDRESS_PL_NAME || 'Sang Logium PL';
const senderStreet = process.env.SENDER_ADDRESS_PL_STREET || 'Mokotowska 63';
const senderCity = process.env.SENDER_ADDRESS_PL_CITY || 'Warszawa';
const senderPostalCode = process.env.SENDER_ADDRESS_PL_ZIP || '00-533';
const senderPhone = process.env.SENDER_ADDRESS_PL_PHONE || '+48123456789';
const senderEmail = process.env.SENDER_ADDRESS_PL_EMAIL || 'pl@sanglogium.com';

params.set('Sender[name]', senderName);
params.set('Sender[address]', senderStreet);
params.set('Sender[city]', senderCity);
params.set('Sender[postal_code]', senderPostalCode);
params.set('Sender[phone]', senderPhone);
params.set('Sender[email]', senderEmail);
```

### Critical Gap 3: Limited Test Coverage

**Current State:**
- Only one test case in `scripts/test-allekurier.mjs`
- No systematic test matrix execution

**Recommendation:**
Create comprehensive test script that executes all test scenarios:
- `scripts/test-allekurier-validation.mjs`
- Iterates through test matrix
- Logs results for each scenario
- Validates expected rate behaviors
- Reports pass/fail for each validation criterion

## Validation Execution Plan

### Phase 1: Configuration Fixes (Pre-requisite)
1. Add SENDER_ADDRESS_PL_* variables to .env
2. Update `lib/shipping/allekurier.ts` to read from .env
3. Verify test account status with AlleKurier support

### Phase 2: Baseline Testing
1. Execute baseline test (Warsaw → Krakow, 1kg parcel, DPD)
2. Verify response format and fields
3. Confirm rate is within reasonable range (10-30 PLN)

### Phase 3: Distance Sensitivity Testing
1. Execute Scenario D1-1 through D1-5
2. Validate rate increases with distance
3. Document rate differences

### Phase 4: Dimension Sensitivity Testing
1. Execute Scenario P2-1 through P2-5
2. Validate rate increases with weight/volume
3. Document rate differences

### Phase 5: Service Differentiation Testing
1. Execute Scenario S3-1 through S3-4
2. Validate different carriers have different rates
3. Document rate differences

### Phase 6: Additional Services Testing
1. Execute Scenario A4-1 through A4-4
2. Validate additional services increase rate
3. Document fee amounts

### Phase 7: Sender Address Testing (if Phase 1 complete)
1. Execute Scenario SA5-1 through SA5-3
2. Validate rate symmetry for same route
3. Document rate differences

### Phase 8: Professional Validation
1. Compare rates with public carrier rate calculators
2. Verify rates are competitive with market rates
3. Confirm no outliers or suspicious values

## Success Criteria

Rates are considered validated when:
- ✓ All test scenarios execute without errors
- ✓ Distance sensitivity confirmed (rates increase with distance)
- ✓ Dimension sensitivity confirmed (rates increase with weight/volume)
- ✓ Service differentiation confirmed (different carriers have different rates)
- ✓ Additional services increase rates as expected
- ✓ All rates fall within reasonable market range (10-50 PLN for standard parcels)
- ✓ Response format is consistent and complete
- ✓ No API errors or unexpected status codes

## When to Trust the Rates

You can trust the rates when:
1. **Test account confirmed**: AlleKurier support confirms account is marked as test (no charges)
2. **All validation criteria met**: Phases 1-8 complete with all success criteria
3. **Consistent behavior**: Repeated tests produce consistent rates (±5% variance acceptable)
4. **Professional review**: Rates compared with public carrier calculators and deemed reasonable
5. **Production readiness**: Configuration gaps (SENDER_ADDRESS_PL_*, hardcoded data) resolved

## Risk Mitigation

### Risk: Test Account Not Marked as Test
**Mitigation:** Email [email protected] to confirm test status before extensive testing

### Risk: Rates Change Over Time
**Mitigation:** Document test date and rates. Re-validate quarterly or when carrier pricing changes.

### Risk: API Endpoint Changes
**Mitigation:** Monitor AlleKurier GitHub repository for API updates. Pin to specific API version if possible.

### Risk: Currency Fluctuations
**Mitigation:** All rates in PLN (domestic Poland). No currency conversion needed.

## Appendix: Sample Test Script Structure

```javascript
// scripts/test-allekurier-validation.mjs
const testScenarios = [
  // Distance sensitivity
  { id: 'D1-1', sender: '00-001', recipient: '00-002', parcel: { weight: 1000, w: 30, h: 20, l: 10 } },
  { id: 'D1-2', sender: '00-001', recipient: '30-001', parcel: { weight: 1000, w: 30, h: 20, l: 10 } },
  // ... more scenarios
];

for (const scenario of testScenarios) {
  const result = await fetchAlleKurierRates(scenario);
  console.log(`${scenario.id}: ${result.cost} PLN`);
  // Validate expected behavior
}
```

## Sources

- AlleKurier API Documentation: https://github.com/AlleKurier/api_v1
- AlleKurier Setup: `docs/checkout/address slice/ALLEKURIER_SETUP.md`
- Q&A on Poland Shipping: `docs/checkout/address slice/1. Q & A.md`
- Poland Shipping Research: `research/Poland-Shipping-API-Research.md`
