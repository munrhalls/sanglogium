# Furgonetka API Data Requirements

**Date:** 2026-05-14
**Chunk:** sang-logium-97v (Chunk 1: Define Data Requirements for Furgonetka API)
**Purpose:** Define data requirements for Furgonetka rate calculation experiment

---

## Objective

Define exactly what data we need to receive from Furgonetka API to verify that rate calculations are realistic based on geographic distance between sender and recipient addresses.

---

## Required Data Fields

### Delivery Time Estimates Per Carrier

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `carrier_id` | string | Yes | Unique identifier for the carrier (e.g., service ID from `/account/services`) |
| `carrier_name` | string | No | Human-readable carrier name (e.g., "DPD", "InPost") |
| `estimated_delivery_time` | number | Yes | Estimated delivery time in hours/days |
| `estimated_delivery_date` | string (ISO 8601) | No | Estimated delivery date |
| `delivery_time_unit` | string | No | Unit of measurement (e.g., "hours", "days", "business_days") |

### Cost Per Carrier

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `carrier_id` | string | Yes | Unique identifier for the carrier |
| `carrier_name` | string | No | Human-readable carrier name |
| `total_cost` | number (decimal) | Yes | Total shipping cost in PLN |
| `currency` | string | Yes | Currency code (e.g., "PLN") |
| `cost_breakdown` | object | No | Breakdown of costs (base price, tax, fees) |

---

## Minimum Viable Data Set

For the rate calculation experiment to function, the absolute minimum required fields are:

**Per Carrier:**
- `carrier_id` - To identify which carrier the rate belongs to
- `estimated_delivery_time` - To compare time differences between close/far scenarios
- `total_cost` - To compare cost differences between close/far scenarios
- `currency` - To ensure cost comparison is valid

**Minimum Viable Response Structure:**
```json
[
  {
    "carrier_id": "string",
    "estimated_delivery_time": "number",
    "total_cost": "number",
    "currency": "string"
  }
]
```

**Optional Fields (Not Required for Experiment):**
- `carrier_name` - Can be derived from `carrier_id` via `/account/services`
- `estimated_delivery_date` - Time estimate is sufficient
- `cost_breakdown` - Total cost is sufficient
- `delivery_time_unit` - Can be inferred from value magnitude

---

## Success Criteria for "Realistic" Rate Differences

### Time Realism
- Far recipient (Recipient B) should have equal or longer delivery time than close recipient (Recipient A) for the same carrier
- Delivery time difference should be proportional to geographic distance (e.g., 2-5x longer for cross-country vs same-city)
- **Minimum requirement:** Far scenario time >= Close scenario time for each carrier

### Cost Realism
- Far recipient (Recipient B) should have equal or higher cost than close recipient (Recipient A) for the same carrier
- Cost difference should be proportional to geographic distance (e.g., 10-50% higher for cross-country vs same-city)
- **Minimum requirement:** Far scenario cost >= Close scenario cost for each carrier

### Carrier Consistency
- Different carriers should show similar patterns (all carriers should reflect distance-based pricing)
- If one carrier shows unrealistic rates (e.g., cheaper for far distance), investigate but don't fail entire experiment
- **Minimum requirement:** At least 3 of 4 selected carriers should show realistic patterns

### Failure Criteria
- All carriers show identical rates for close and far scenarios (no distance sensitivity)
- Far scenario is cheaper/faster than close scenario for all carriers
- API returns zero or null values for time/cost in one scenario but not the other

---

## Notes

- This document defines WHAT data we need, not HOW to get it (that's Chunk 2's responsibility)
- Carrier selection strategy has been moved to Chunk 2 (API Endpoint Discovery) since it depends on knowing the endpoint structure
- Success criteria are based on geographic distance logic: farther = slower and more expensive
- Experiment uses two recipient scenarios: close to sender vs far from sender

---

## Next Steps

- Chunk 2 (sang-logium-brj): API Endpoint Discovery - will identify the actual endpoint and request format
- Chunk 3 (sang-logium-fkj): Request Format Verification - will define exact request structure
- Chunk 4 (sang-logium-9sg): Response Format Verification - will validate actual API response matches these requirements
