# Furgonetka Sandbox API Pre-Flight Status Overview

## Exact Needs
Integrate Furgonetka shipping API for Poland shipping in Sang-logium e-commerce platform. Goal: Calculate shipping prices, create shipments, manage delivery options.

## Current Status

### Authentication
**Status:** WORKING ✓
- **Password grant:** WORKING ✓
  - Token acquired successfully
  - Token type: Bearer
  - Expires in: 2592000 seconds (30 days)
  - User credentials: antarcticdepths71@gmail.com / Furgonetkaguars77@
- **Client credentials grant:** WORKING ✓ (fallback)
  - Token acquired successfully
  - Token type: Bearer
  - Expires in: 3600 seconds (60 minutes)
  - Correct flow for OAuth app without user account

### API Access
**Status:** PARTIALLY WORKING
- **User-scoped endpoints:** WORKING ✓
  - `/account/services` - 200 OK - Returns carrier list (DPD, FedEx, etc.) with service IDs and configuration
- **Configuration endpoints:** WORKING ✓
  - `/configuration/allowed-countries` - 200 OK - Returns country list with codes and duty info
- **Shipment/Pricing endpoints:** UNKNOWN
  - All tested patterns return 405 Method Not Allowed
  - Documentation not accessible via web scraping

### Pre-Flight Problem: RESOLVED ✓

**Root Cause:**
- Initial attempt used client_credentials (app authentication) which lacks permissions for user-scoped shipping endpoints
- Sandbox account password was incorrect, preventing password grant (user authentication)

**Resolution:**
- Updated sandbox account password
- Switched to password grant flow with user credentials
- Successfully accessed user-scoped endpoints for shipping functionality

## Working Endpoints

### `/account/services`
**Method:** GET
**Authentication:** User token (password grant)
**Response:** Carrier/service list
**Sample Data:**
```json
{
  "services": [
    {
      "id": 11597695,
      "service": "dpd",
      "name": "DPD",
      "owner": "furgonetka",
      "configuration": {
        "additional_services": {
          "cod_enabled": true,
          "insurance_set_default_override_enabled": false
        },
        "national_only": false
      },
      "pricelist_id": 957
    }
  ]
}
```

### `/configuration/allowed-countries`
**Method:** GET
**Authentication:** User token (password grant)
**Response:** Country list with codes and duty info
**Sample Data:**
```json
{
  "shipment": [
    {
      "name": "Austria",
      "code": "AT",
      "duty": false
    },
    {
      "name": "Belgia",
      "code": "BE",
      "duty": false
    }
  ]
}
```

## Unknown Endpoints (Shipment Creation & Price Calculation)

### Tested Patterns (All Return 405 Method Not Allowed)

**English Patterns:**
- `/shipments`, `/orders`, `/pricing`, `/calculator` (GET and POST)
- `/shipment`, `/order` (GET and POST)
- `/account/shipments`, `/account/orders`, `/account/pricing`, `/account/calculator` (GET and POST)
- `/services/shipment`, `/services/order` (GET and POST)
- `/services/11597695`, `/services/dpd/shipment`, `/services/dpd/pricing` (GET and POST)

**API Versioned Patterns:**
- `/api/v1/price/calculate`, `/api/v1/shipment`, `/api/v1/shipments` (POST)
- `/api/v1/pricing`, `/api/v1/calculator` (POST)
- `/api/shipments`, `/v1/shipments` (GET and POST)

**Polish Patterns (Based on Changelog):**
- `/przesylka`, `/przesylki`, `/zamowienie` (POST)
- `/konto/przesylki`, `/konto/zamowienia` (POST)

**Total Patterns Tested:** 30+ endpoint variations
**Result:** All return 405 Method Not Allowed

### Documentation Research

**Attempted Access:**
- https://furgonetka.pl/api/rest - Returns navigation page only
- https://sandbox.furgonetka.pl/api/rest - Returns navigation page only
- https://c.furgonetka.pl/public.furgonetka.pl/media_help/Flow_zamawiania_przesylki_API_REST.pdf - Binary/corrupted content
- GitHub PHP client (Kwarcek/furgonetka-rest-api-php) - Source code not accessible via URL content tool

**Changelog Findings:**
- Changelog references endpoints like "Dodawanie przesyłki" (Adding shipment) and "Zamawiania przesyłek" (Ordering shipment)
- However, the actual endpoint paths are not documented in the changelog
- Documentation pages appear to require JavaScript rendering or authentication

## Integration Requirements

### Credentials (Sandbox)
- **Client ID:** sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7
- **Client Secret:** bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7
- **Username:** antarcticdepths71@gmail.com
- **Password:** Furgonetkaguars77@
- **OAuth URL:** https://api.sandbox.furgonetka.pl/oauth/token
- **Base API URL:** https://api.sandbox.furgonetka.pl

### Authentication Flow
1. Use password grant with user credentials for shipping operations
2. Token expires in 30 days (2592000 seconds)
3. Use Bearer token in Authorization header
4. Accept header: application/vnd.furgonetka.v1+json

### Working Endpoints for Integration
- `/account/services` - Get available carriers/services ✓
- `/configuration/allowed-countries` - Get allowed shipping countries ✓
- Shipment creation endpoints - UNKNOWN (documentation required)
- Price calculation endpoints - UNKNOWN (documentation required)

## Next Steps for Integration

1. **Access Furgonetka API documentation directly**
   - Log in to https://sandbox.furgonetka.pl/api/rest with user credentials
   - Access REST API documentation from authenticated session
   - Identify actual endpoint paths for shipment creation and price calculation

2. **Alternative: Contact Furgonetka support**
   - Request API documentation or endpoint specification
   - Ask for example requests for shipment creation and price calculation

3. **Alternative: Use PHP client as reference**
   - Download GitHub PHP client source code locally
   - Inspect source code to identify actual endpoint paths
   - Reverse-engineer endpoint structure from client implementation

4. **Alternative: Test with production credentials**
   - Switch to production API (https://api.furgonetka.pl)
   - Test if production has different endpoint structure
   - Access production documentation if available

## Success Criteria

**Achieved:**
- ✓ Working API call with password grant
- ✓ Ability to retrieve carrier list (/account/services)
- ✓ Ability to retrieve country list (/configuration/allowed-countries)
- ✓ Authentication flow documented

**Not Achieved:**
- ✗ Shipment creation endpoint path unknown
- ✗ Price calculation endpoint path unknown
- ✗ Complete flow not testable (Get carriers → Calculate price → Create shipment)

## Notes
- Client credentials works but lacks permissions for shipping endpoints
- Password grant (user authentication) is required for shipping operations
- Sandbox and production are separate environments with separate accounts
- Token expires in 30 days for password grant (vs 60 minutes for client_credentials)
- API documentation appears to require authentication or JavaScript rendering
- Blind endpoint testing has reached diminishing returns (30+ patterns tested)
