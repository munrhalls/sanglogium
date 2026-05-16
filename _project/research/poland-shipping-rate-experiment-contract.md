# Poland Shipping Rate Calculation Experiment Contract

**Date:** 2026-05-14
**Status:** Experiment Design Complete — Ready for Execution
**Selected API:** epaka.pl

---

## 1. Objective

Find and validate a zero-cost shipping API for Poland that provides real calculated rates and delivery timelines, with rates that vary based on distance between sender and receiver.

---

## 2. Test Configuration

| Parameter | Value |
|-----------|-------|
| Package dimensions | 15 × 15 × 15 cm |
| Package weight | 1.5 kg |
| Sender | Warszawa, 00-533 |
| Receiver — CLOSE | Warszawa, 00-001 (~2 km) |
| Receiver — MEDIUM | Warszawa Praga, 03-001 (~8 km) |
| Receiver — FAR | Kraków, 30-001 (~300 km) |

---

## 3. API Selection: epaka.pl

### Why epaka.pl

After evaluating 12+ candidates, **epaka.pl** is the only platform that satisfies all hard constraints:

- **Zero cost:** Free registration, no subscription, no business account required
- **Real rates:** Live broker platform with negotiated carrier rates (not mock data)
- **Distance-based:** `POST /v1/order/prices` accepts `senderPostCode` and `receiverPostCode`
- **Multiple carriers:** DPD, DHL, UPS, FedEx, GLS, InPost, K-Ex, Raben
- **Public REST API:** Full OpenAPI 3.0 spec at `https://api.epaka.pl/epaka-api.json`

### Why others were rejected

| Candidate | Rejection Reason |
|-----------|-----------------|
| Packlink PRO | Returns 0 services for PL→PL (already tested) |
| bliskapaczka.pl | Pricing API is flat-rate by operator (no postcode distance factor) |
| InPost ShipX | Requires business subscription for API access |
| Poczta Polska eNadawca | Requires registration form + approval |
| DPD Poland | No rate calculation endpoint (only shipment creation) |
| DHL MyDHL | Requires existing DHL customer account |
| Easyship / Shippo / EasyPost | Sandbox returns mock data; Poland requires carrier accounts |
| ShipEngine | Sandbox only supports US carriers |

---

## 4. API Endpoints

### Authentication
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id=...&client_secret=...&username=...&password=...
```

### Price Calculation
```
POST /v1/order/prices
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingType": "package",
  "senderCountry": "PL",
  "senderPostCode": "00-533",
  "receiverCountry": "PL",
  "receiverPostCode": "00-001",
  "onlyAvailable": true,
  "packages": [{ "weight": 1.5, "height": 15, "width": 15, "length": 15, "type": 0 }]
}
```

### Expected Response
```json
{
  "couriers": [
    {
      "courier": { "id": 1, "name": "DPD" },
      "courierDeliveryType": "door",
      "shipmentFromDoor": true,
      "shipmentFromPoint": false,
      "available": true,
      "netPriceTotal": 12.50,
      "grossPriceTotal": 15.38
    }
  ]
}
```

---

## 5. Validation Criteria

### Criterion 1: Real API Data
- [ ] Response comes from live `api.epaka.pl` endpoint (not hardcoded)
- [ ] `netPriceTotal` and `grossPriceTotal` are non-null numbers
- [ ] Multiple couriers return prices

### Criterion 2: Distance-Based Variation
- [ ] CLOSE cheapest < FAR cheapest (higher distance → higher price)
- [ ] CLOSE cheapest ≤ MEDIUM cheapest ≤ FAR cheapest (monotonic trend)

### Criterion 3: Delivery Timelines
- [ ] Response includes estimated delivery date or transit time
- [ ] FAR delivery time > CLOSE delivery time

> **Note:** The `/v1/order/prices` endpoint does **not** explicitly return transit time in its documented schema. If delivery timelines are missing from the price response, a follow-up call to `POST /v1/order/check-data` (which returns more detailed order data including services) may be needed.

---

## 6. Execution Steps

1. Register free account at `https://www.epaka.pl/uzytkownik/rejestracja` (social login available)
2. Log in → User Panel → Integracje / API → Generate OAuth Client ID + Client Secret
3. Set environment variables:
   ```bash
   export EPAKA_CLIENT_ID="your-client-id"
   export EPAKA_CLIENT_SECRET="your-client-secret"
   export EPAKA_USERNAME="your-username"
   export EPAKA_PASSWORD="your-password"
   ```
4. Run validation script:
   ```bash
   node scripts/validate-poland-shipping-rates.mjs
   ```

---

## 7. Script Location

`scripts/validate-poland-shipping-rates.mjs`

The script:
- Authenticates via OAuth2 password grant
- Queries `/v1/order/prices` for all 3 receiver addresses
- Prints full courier pricing for each distance
- Validates that FAR > CLOSE
- Exits with code 0 on pass, 1 on fail

---

## 8. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| OAuth grant type is not `password` | Medium | Script will print the exact error; user can adjust grant type |
| `prices` endpoint requires additional fields | Low | Script prints raw error response for debugging |
| API returns 0 couriers for some postcodes | Medium | Experiment documents "no services available" as a valid finding |
| No explicit transit time in price response | High | Documented; may require follow-up with `/v1/order/check-data` |

---

## 9. Sources

- epaka.pl OpenAPI Spec: `https://api.epaka.pl/epaka-api.json` (188 KB, fetched 2026-05-14)
- epaka.pl Integrations: `https://www.epaka.pl/biznes/integracje`
- Previous codebase research: `research/Poland_Shipping_API_Research.md`
