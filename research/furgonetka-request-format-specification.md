# Furgonetka API Request Format Specification

**Date:** 2026-05-14
**Chunk:** sang-logium-fkj (Chunk 3: Request Format Verification for Furgonetka)
**Purpose:** Document exact request format for Furgonetka rate calculation endpoint

---

## Endpoint

**URL:** `https://api.sandbox.furgonetka.pl/packages`
**Method:** POST
**Authentication:** OAuth 2.0 Password Grant

---

## Headers

```
Authorization: Bearer {access_token}
Accept: application/vnd.furgonetka.v1+json
Content-Type: application/json
```

---

## Request Body Structure

```json
{
  "type": "package",
  "service_id": 11597700,
  "parcels": [
    {
      "width": 15,
      "height": 15,
      "depth": 15,
      "weight": 1.5
    }
  ],
  "pickup": {
    "type": "sender",
    "name": "string",
    "company": "string",
    "email": "string",
    "street": "string",
    "postcode": "string",
    "city": "string",
    "phone": "string"
  },
  "sender": {
    "postcode": "string",
    "city": "string",
    "country": "PL",
    "name": "string",
    "company": "string",
    "phone": "string",
    "email": "string",
    "street": "string"
  },
  "receiver": {
    "postcode": "string",
    "city": "string",
    "country": "PL",
    "name": "string",
    "company": "string",
    "phone": "string",
    "email": "string",
    "street": "string"
  }
}
```

---

## Required Fields

| Field | Type | Description | Format |
|-------|------|-------------|--------|
| `type` | string | Package type | `"package"` |
| `service_id` | integer | Carrier service ID from `/account/services` | e.g., `11597700` (InPost) |
| `parcels` | array | Package dimensions and weight | Array of package objects |
| `parcels[].width` | number | Package width in cm | Numeric |
| `parcels[].height` | number | Package height in cm | Numeric |
| `parcels[].depth` | number | Package depth in cm | Numeric |
| `parcels[].weight` | number | Package weight in kg | Numeric |
| `pickup` | object | Pickup location details | Object |
| `pickup.type` | string | Pickup type | `"sender"` |
| `pickup.name` | string | Contact name | String |
| `pickup.company` | string | Company name | String (OPTIONAL - can be omitted for B2C e-commerce) |
| `pickup.email` | string | Contact email | Valid email format |
| `pickup.street` | string | Street address | String |
| `pickup.postcode` | string | Postal code | Polish format (XX-XXX) |
| `pickup.city` | string | City | String |
| `pickup.phone` | string | Contact phone | 9 digits (Polish mobile format) |
| `sender` | object | Sender address details | Object |
| `sender.postcode` | string | Postal code | Polish format (XX-XXX) |
| `sender.city` | string | City | String |
| `sender.country` | string | Country code | `"PL"` |
| `sender.name` | string | Contact name | String |
| `sender.company` | string | Company name | String (OPTIONAL - can be omitted for B2C e-commerce) |
| `sender.phone` | string | Contact phone | 9 digits (Polish mobile format) |
| `sender.email` | string | Contact email | Valid email format |
| `sender.street` | string | Street address | String |
| `receiver` | object | Recipient address details | Object |
| `receiver.postcode` | string | Postal code | Polish format (XX-XXX) |
| `receiver.city` | string | City | String |
| `receiver.country` | string | Country code | `"PL"` |
| `receiver.name` | string | Contact name | String |
| `receiver.company` | string | Company name | String (OPTIONAL - can be omitted for B2C e-commerce) |
| `receiver.phone` | string | Contact phone | 9 digits (Polish mobile format) |
| `receiver.email` | string | Contact email | Valid email format |
| `receiver.street` | string | Street address | String |

---

## Phone Number Format

**Valid Format:** 9 digits (Polish mobile format)
- Example: `600123456`
- No country code prefix
- No spaces or special characters
- Tested formats that failed: `+48123456789`, `123456789`, `+48 123 456 789`

---

## Complete Example Request

```json
{
  "type": "package",
  "service_id": 11597700,
  "parcels": [
    {
      "width": 15,
      "height": 15,
      "depth": 15,
      "weight": 1.5
    }
  ],
  "pickup": {
    "type": "sender",
    "name": "Test Sender",
    "email": "test@example.com",
    "street": "Marszałkowska 1",
    "postcode": "00-533",
    "city": "Warszawa",
    "phone": "600123456"
  },
  "sender": {
    "postcode": "00-533",
    "city": "Warszawa",
    "country": "PL",
    "name": "Test Sender",
    "phone": "600123456",
    "email": "test@example.com",
    "street": "Marszałkowska 1"
  },
  "receiver": {
    "postcode": "00-001",
    "city": "Warszawa",
    "country": "PL",
    "name": "Test Receiver",
    "phone": "600123456",
    "email": "test@example.com",
    "street": "Nowy Świat 1"
  }
}
```

---

## Response Structure

**Status 200 OK:** Returns package object with pricing information

**Key Response Fields:**
- `package_id` - Unique package identifier
- `service` - Carrier name (e.g., "inpost", "dpd")
- `pricing.price_gross` - Total price including tax (PLN)
- `pricing.price_net` - Price excluding tax (PLN)
- `delivery_time` - **ALWAYS NULL** (not provided by API)
- `state` - Package state (e.g., "waiting")

---

## Critical Limitation: Delivery Time

**Finding:** The API does not provide delivery time estimates in the response.

**Tested Scenarios:**
- Same city (Warszawa to Warszawa): delivery_time = null
- Different city (Warszawa to Kraków): delivery_time = null
- Different region (Warszawa to Gdańsk): delivery_time = null
- Different carrier (DPD): delivery_time = null

**Impact on Original Experiment:**
The original experiment goal was to verify rate calculation realism by comparing delivery time and cost estimates for geographically close and far addresses. Since delivery_time is not available, the experiment cannot be completed as specified.

**Possible Workarounds:**
1. Adjust experiment to only verify cost differences (pricing is available)
2. Contact Furgonetka support to ask if delivery_time is available via different endpoint
3. Use carrier-specific delivery time estimates from carrier documentation (external data source)

---

## Carrier Selection

**Primary Carriers (from Chunk 2):**
- InPost (service_id: 11597700)
- DPD (service_id: 11597695)
- DHL (service_id: 11597702)
- Poczta Polska (service_id: 11597699)

**Pricing Difference Verified:**
- InPost: 19.31 PLN (Warszawa to Kraków)
- DPD: 27.17 PLN (Warszawa to Kraków)
- Pricing varies by carrier as expected

---

## Units

- **Dimensions:** centimeters (cm)
- **Weight:** kilograms (kg)
- **Currency:** Polish Złoty (PLN)

---

## Validation Errors

**Common Error Messages:**
- `"Proszę wybrać ofertę"` - Please select an offer (service_id missing)
- `"Pole nie może być puste"` - Field cannot be empty
- `"Nieprawidłowy numer telefonu"` - Invalid phone number

---

## Authentication

**Method:** OAuth 2.0 Password Grant

**Request:**
```
POST https://api.sandbox.furgonetka.pl/oauth/token
Authorization: Basic {base64(client_id:client_secret)}
Content-Type: application/x-www-form-urlencoded

grant_type=password&scope=api&username={username}&password={password}
```

**Response:** Bearer token (expires in 2592000 seconds = 30 days)

---

## Test Scripts

1. `scripts/test-furgonetka-request-format.mjs` - Incremental field testing
2. `scripts/test-furgonetka-realistic-scenarios.mjs` - Realistic address scenarios

---

## Status

**Completed:**
- Request format validated
- Phone number format resolved (9 digits, Polish mobile format)
- Pricing data verified (varies by carrier)
- Realistic address scenarios tested

**Blocked:**
- delivery_time not available in API response
- Original experiment goal cannot be completed as specified

**Next Steps:**
- Document findings in Chunk 3 deliverable
- Determine if experiment should be adjusted or alternative approach needed
- Proceed to Chunk 4 (Response Format Verification) with adjusted scope
