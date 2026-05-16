# Furgonetka Pricing Endpoint Discovery Report

**Date:** 2026-05-14
**Objective:** Locate the exact Furgonetka pricing endpoint and extract its request/response schema

---

## Executive Summary

**Status:** **BLOCKED - Authentication Required**

The Furgonetka pricing endpoint exists at `POST /packages` but requires authentication that is not available through standard OAuth flows. The API documentation at https://sandbox.furgonetka.pl/api/rest appears to be a landing page, not interactive API documentation.

---

## Testing Results

### Endpoints Tested

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/packageCheckPrice` | GET | 405 Method Not Allowed | From PHP wrapper, doesn't work |
| `/packageCheckPrice` | POST | 405 Method Not Allowed | From PHP wrapper, doesn't work |
| `/v1/packageCheckPrice` | GET/POST | 405 Method Not Allowed | API version v1 |
| `/v2/packageCheckPrice` | POST | 405 Method Not Allowed | API version v2 |
| `/package/check-price` | GET/POST | 405 Method Not Allowed | Alternative naming |
| `/packages/costs` | POST | 405 Method Not Allowed | Resource-based naming |
| `/packages/evaluate` | POST | 405 Method Not Allowed | Resource-based naming |
| `/packages/calculate` | POST | 405 Method Not Allowed | Resource-based naming |
| `/pricing/calculate` | POST | 405 Method Not Allowed | Resource-based naming |
| `/packages` | GET | 400 Bad Request | "JSON decode error" - expects POST |
| **`/packages`** | **POST** | **401 Unauthorized** | **ENDPOINT EXISTS - AUTH REQUIRED** |
| `/order/check` | POST | 405 Method Not Allowed | Order-based naming |
| `/order/price` | POST | 405 Method Not Allowed | Order-based naming |

### Authentication Methods Tested

| Method | Status | Notes |
|--------|--------|-------|
| OAuth Client Credentials | Failed on `/packages` | Returns 401 Unauthorized |
| OAuth Password Grant | Failed to get token | Invalid username/password |
| No Authentication | 401 Unauthorized | Expected |

### Swagger/OpenAPI Documentation

Checked standard paths for API specification:
- `/swagger.json`, `/swagger.yaml`
- `/openapi.json`, `/openapi.yaml`
- `/api-docs`, `/api-docs.json`
- `/docs.json`
- `/swagger-ui.html`
- `/api/swagger.json`, `/api/openapi.json`

**Result:** All returned 405 Method Not Allowed - no Swagger/OpenAPI documentation available at standard paths.

---

## Key Finding: POST /packages

The endpoint `POST /packages` exists and returns **401 Unauthorized**, which indicates:

1. **Endpoint exists** - 401 means the endpoint is recognized but authentication failed
2. **Authentication required** - Both client credentials and password grant fail
3. **Expected JSON body** - GET request to same endpoint returns "JSON decode error"

**Likely Request Payload Structure** (based on PHP wrapper patterns):
```json
{
  "type": "package",
  "width": 15,
  "height": 15,
  "depth": 15,
  "weight": 1.5,
  "sender": {
    "postcode": "00-533",
    "city": "Warszawa",
    "country": "PL"
  },
  "receiver": {
    "postcode": "00-001",
    "city": "Warszawa",
    "country": "PL"
  }
}
```

---

## Documentation Access Issues

### Problem: Landing Page vs. API Documentation

The URL https://sandbox.furgonetka.pl/api/rest returns a landing page with navigation links, not interactive API documentation. This suggests:

1. **Interactive documentation requires authentication** - May need to log into Furgonetka panel first
2. **Documentation is PDF-based** - Research mentions PDF: `https://c.furgonetka.pl/public.furgonetka.pl/media_help/Flow_zamawiania_przesylki_API_REST.pdf`
3. **Documentation is behind authentication** - Actual API docs may only be accessible after OAuth login
4. **Documentation uses JavaScript** - May be a SPA that requires browser execution

### Attempted Documentation Access

- https://sandbox.furgonetka.pl/api/rest - Landing page
- https://sandbox.furgonetka.pl/api/rest?lang=en_GB - Landing page
- https://furgonetka.pl/api/rest - Landing page
- https://demo.furgonetka.pl/api/rest - Landing page
- https://sandbox.furgonetka.pl/api/rest-internal - 403 Forbidden
- PDF documentation - Binary content, not readable via URL content tool

---

## PHP Wrapper Analysis

### Source: ablypl/furgonetka (Laravel)

**Endpoint:** `packageCheckPrice`
**Method:** GET (via `client->get()`)
**Parameters:**
```php
$query = [
  'type' => 'package',
  'width' => 20,
  'weight' => 1,
  'height' => 10,
  'depth' => 10,
  'sender_*' => ..., // company, email, name, surname, city, street, postcode, phone
  'receiver_*' => ..., // company, email, name, surname, city, street, postcode, phone
];
```

**Issue:** This wrapper uses an older API structure that no longer works (405 errors).

---

## Next Steps

### Option 1: Access Documentation Through Furgonetka Panel

1. Log into https://sandbox.furgonetka.pl with valid credentials
2. Navigate to API documentation section
3. Look for interactive Swagger UI or downloadable API spec
4. Extract pricing endpoint schema from documentation

### Option 2: Contact Furgonetka Support

Request:
- Access to API documentation
- Authentication requirements for `/packages` endpoint
- Correct OAuth scopes or authentication method
- API specification file (OpenAPI/Swagger)

### Option 3: Use Alternative API (Epaka.pl)

Per existing research, Epaka.pl has:
- Full OpenAPI 3.0 documented REST API
- Explicit price endpoint: `/v1/order/content/check`
- Free registration and API access
- Real calculated rates

**Recommendation:** Switch to Epaka.pl if Furgonetka documentation cannot be accessed.

---

## Conclusion

The Furgonetka pricing endpoint (`POST /packages`) exists but is blocked by authentication requirements that cannot be resolved with current credentials. The API documentation is not publicly accessible and appears to require panel login or special access.

**Immediate Action Required:** Either access the Furgonetka panel to view authenticated documentation, or switch to Epaka.pl which has publicly documented pricing endpoints.

---

## Test Script Location

`scripts/test-furgonetka-pricing-endpoint.mjs` - Comprehensive endpoint testing script

## Environment Variables Required

- `FURGONETKA_SANDBOX_CLIENT_ID`
- `FURGONETKA_SANDBOX_CLIENT_SECRET`
- `FURGONETKA_USERNAME` (for password grant)
- `FURGONETKA_PASSWORD` (for password grant)
