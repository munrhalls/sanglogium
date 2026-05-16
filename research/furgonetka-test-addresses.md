# Furgonetka Experiment Test Addresses

**Date:** 2026-05-14
**Chunk:** sang-logium-cvj (Chunk 6: Test Data Preparation for Furgonetka Experiment)
**Purpose:** Define realistic test addresses for Furgonetka rate calculation experiment

---

## Test Address Strategy

**Objective:** Provide realistic Polish addresses to test rate calculation differences between geographically close and far recipients.

**Note:** Due to the critical finding that `delivery_time` is always null (see issue sang-logium-nuu), the experiment will focus on cost differences only. Distance-based delivery time verification is not possible with the current API.

---

## Fixed Sender Address

**Location:** Warsaw (Warszawa) - Central Poland

**Address Details:**
- Name: Test Sender
- Email: test@example.com
- Phone: 600123456
- Street: Marszałkowska 1
- Postcode: 00-533
- City: Warszawa
- Country: PL

**Validation:**
- Marszałkowska is a major street in Warsaw
- Postcode 00-533 is valid Warsaw postal code
- Phone format validated in Chunk 3 (9 digits, Polish mobile format)
- Used successfully in Chunk 3 tests

---

## Recipient A (Close to Sender)

**Location:** Warsaw (Warszawa) - Same city as sender

**Address Details:**
- Name: Test Receiver Close
- Email: test@example.com
- Phone: 600123456
- Street: Nowy Świat 1
- Postcode: 00-001
- City: Warszawa
- Country: PL

**Geographic Context:**
- Distance from sender: ~2 km (within same city)
- Same postal code district (00-XXX range)
- Intra-city delivery scenario

**Validation:**
- Nowy Świat is a famous street in Warsaw
- Postcode 00-001 is valid Warsaw postal code
- Used successfully in Chunk 3 tests
- Returns same pricing as sender in sandbox (flat-rate behavior)

---

## Recipient B (Far from Sender)

**Location:** Kraków - Southern Poland

**Address Details:**
- Name: Test Receiver Far
- Email: test@example.com
- Phone: 600123456
- Street: Floriańska 1
- Postcode: 30-001
- City: Kraków
- Country: PL

**Geographic Context:**
- Distance from sender (Warsaw): ~300 km
- Different region (southern Poland vs central Poland)
- Inter-city delivery scenario
- Major Polish city with significant distance

**Validation:**
- Floriańska is a historic street in Kraków
- Postcode 30-001 is valid Kraków postal code
- Used successfully in Chunk 3 tests
- Returns same pricing as sender in sandbox (flat-rate behavior)

---

## Address Validation Summary

All addresses are realistic, valid Polish addresses:

| Address | City | Street | Postcode | Validated |
|---------|------|--------|----------|-----------|
| Sender | Warszawa | Marszałkowska 1 | 00-533 | ✓ (Chunk 3) |
| Recipient A | Warszawa | Nowy Świat 1 | 00-001 | ✓ (Chunk 3) |
| Recipient B | Kraków | Floriańska 1 | 30-001 | ✓ (Chunk 3) |

---

## Geographic Distance Context

**Sender (Warsaw):**
- Central Poland
- Capital city
- Population: ~1.8 million
- Major transportation hub

**Recipient A (Warsaw - Same City):**
- Distance: ~2 km
- Scenario: Intra-city delivery
- Expected: Minimal cost difference (if any)

**Recipient B (Kraków - Different Region):**
- Distance: ~300 km
- Scenario: Inter-city delivery
- Region: Southern Poland (Lesser Poland Voivodeship)
- Population: ~800,000
- Expected: Higher cost (if distance-based pricing)

---

## API Test Results (from Chunk 3)

**Pricing Results (InPost):**
- Sender to Recipient A (same city): 19.31 PLN
- Sender to Recipient B (Kraków): 19.31 PLN
- **Finding:** Sandbox API returns flat-rate pricing regardless of distance

**Pricing Results (DPD):**
- Sender to Recipient B (Kraków): 27.17 PLN
- Carrier pricing varies as expected

**Note:** The sandbox environment may use simplified pricing models. Production pricing may be distance-based.

---

## Test Data Format

All addresses use the same format for consistency (B2C e-commerce - no company field):

```javascript
{
  name: "string",
  email: "test@example.com",
  phone: "600123456",
  street: "string",
  postcode: "XX-XXX",
  city: "string",
  country: "PL"
}
```

---

## Usage in Experiment

These addresses will be used in Chunk 7 (Implementation) to:
1. Test rate calculation with close recipient (same city)
2. Test rate calculation with far recipient (different region)
3. Compare cost differences between scenarios
4. Verify that different carriers return different pricing

**Note:** Due to delivery_time API limitation, the experiment will focus on cost verification only.

---

## Alternative Addresses (if needed)

If additional test scenarios are required, these realistic addresses are available:

**Gdańsk (Northern Poland):**
- Street: Długa 1
- Postcode: 80-001
- Distance from Warsaw: ~300 km

**Wrocław (Western Poland):**
- Street: Rynek 1
- Postcode: 50-001
- Distance from Warsaw: ~350 km

**Poznań (Western Poland):**
- Street: Półwiejska 1
- Postcode: 61-001
- Distance from Warsaw: ~300 km

---

## **Status**

**Completed:**
- Fixed sender address defined (Warsaw)
- Recipient A defined (Warsaw - close)
- Recipient B defined (Kraków - far)
- All addresses validated as realistic Polish addresses
- Geographic context documented
- Company field removed (optional per API, not needed for B2C e-commerce)

**Next Steps:**
- Use these addresses in Chunk 7 (Implementation)
- Test with multiple carriers (InPost, DPD, DHL, Poczta Polska)
- Compare cost differences between close and far scenarios
