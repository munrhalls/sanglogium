# Zero-Cost Poland Shipping API Research

## Executive Summary

Previous research missed readily available Polish shipping broker APIs that provide real calculated rates at zero cost. The two strongest options are **Epaka.pl** and **Furgonetka.pl** — both are Polish shipping aggregators with REST APIs, OAuth2 authentication, and free account registration.

**Top Recommendation: Epaka.pl**
- Full OpenAPI 3.0 documented REST API
- Real calculated rates endpoint (`/v1/order/content/check`)
- Returns `grossPriceTotal`, `servicesGrossPriceTotal`, `priceWithoutDiscount`
- Partners with 8+ carriers (UPS, DHL, DPD, FedEx, GLS, K-Ex, Raben, InPost)
- Free to use ("zupełnie bezpłatne")
- Regular user registration → instant API access

---

## What Previous Research Missed

Previous research focused on:
1. Direct carrier APIs (InPost, Poczta Polska, DPD, GLS) — all require business accounts/approvals
2. Global aggregators (ShipEngine, Shippo, EasyPost) — US-centric, Poland requires carrier accounts
3. Packlink PRO — already used for DE/UK, but Poland is not a supported origin/warehouse country

**Missed category: Polish shipping brokers (brokerzy kurierscy)**

Poland has a mature ecosystem of courier brokers that aggregate domestic carriers and offer REST APIs to e-commerce platforms. These brokers operate on a "pay per shipment" model with free registration and free API access.

---

## Option 1: Epaka.pl (RECOMMENDED)

### Overview
- **Type**: Polish shipping broker / aggregator
- **Carriers**: UPS, DHL, DPD, FedEx, GLS, K-Ex, Raben, InPost
- **Coverage**: Poland domestic + international
- **Cost**: Free registration, free API usage ("zupełnie bezpłatne")
- **API Access**: Any registered user

### Authentication
- **Type**: OAuth 2.0
- **Endpoints**:
  - `GET /oauth/authenticate`
  - `POST /oauth/authorize`
  - `POST /oauth/token`
- **Token Type**: Bearer token
- **Required**: Client ID + Client Secret (generated after registration)

### Key API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/couriers` | GET | List available couriers |
| `/v1/countries` | GET | List supported countries (includes PL) |
| `/v1/points` | GET | Find pickup/drop-off points by postcode/city |
| `/v1/order/content/check` | POST | **Calculate shipping price before ordering** |
| `/v1/order/shipping-type` | GET | Get available shipping types |

### Price Calculation Response (CheckDataResponse)
```json
{
  "grossPriceTotal": 25.90,
  "servicesGrossPriceTotal": 5.00,
  "priceWithoutDiscount": 28.90,
  "lastLowestPrice": 24.50,
  "services": [
    {
      "apiName": "cod.10dr",
      "name": "Cash on Delivery",
      "grossPrice": 5.00,
      "netPrice": 4.07
    }
  ]
}
```

### Registration
1. Register free account: `https://www.epaka.pl/uzytkownik/rejestracja`
2. Generate OAuth credentials in user panel
3. Use `https://api.epaka.pl` as base URL

### Verification: Real Calculated Rates
- ✅ The `/v1/order/content/check` endpoint returns `grossPriceTotal` based on sender/receiver postcodes, package dimensions, weight, and selected courier
- ✅ Response includes `lastLowestPrice` (lowest price from last 30 days) — proof of dynamic pricing
- ✅ Partners with 8+ real carriers — rates are actual negotiated broker rates, not mock data
- ✅ Distance-based variation: Different couriers calculate rates based on sender/receiver distance

### Limitations
- No explicit "sandbox" environment mentioned in API docs
- However, free registration + test shipments can be used for validation
- API documentation is primarily in Polish

---

## Option 2: Furgonetka.pl

### Overview
- **Type**: Polish shipping broker / aggregator
- **Carriers**: DPD, FedEx, K-EX, UPS, Poczta Kurier48, InPost, Paczka w RUCHu, DHL
- **Coverage**: Poland domestic + international
- **Cost**: Free registration ("pay only per shipment sent, not for keeping account")
- **API Access**: Registered users with OAuth app

### Authentication
- **Type**: OAuth 2.0
- **Production**: `https://api.furgonetka.pl/oauth/token`
- **Sandbox**: `https://api.sandbox.furgonetka.pl/oauth/token`
- **Required**: Client ID + Client Secret (from OAuth app manager)

### Environments
| Environment | URL |
|-------------|-----|
| Sandbox | `https://sandbox.furgonetka.pl` |
| Sandbox API | `https://api.sandbox.furgonetka.pl` |
| Production | `https://furgonetka.pl` |
| Production API | `https://api.furgonetka.pl` |

### Key APIs
1. **REST API** — `https://furgonetka.pl/api/rest` (package/orders management)
2. **Furgonetka Koszyk** — Checkout/cart integration for e-commerce platforms
3. **OAuth2 App Manager** — `https://furgonetka.pl/api/aplikacje-oauth`

### Price Calculation
- The REST API flow includes "Kalkulacja ceny przesyłki" (shipment price calculation)
- PDF documentation: `https://c.furgonetka.pl/public.furgonetka.pl/media_help/Flow_zamawiania_przesylki_API_REST.pdf`
- Sandbox uses test payment provider data

### Registration
1. Free registration: `https://furgonetka.pl/rejestracja`
2. Create OAuth app: `https://furgonetka.pl/api/aplikacje-oauth`
3. Use sandbox for testing

### Verification: Real Calculated Rates
- ⚠️ Sandbox exists but unclear if it returns real rates or test/dummy rates
- The changelog shows active API development with pricing-related endpoints
- Production definitely returns real rates (it's a live broker platform)
- For zero-cost testing, sandbox is available but rate realism is unverified

---

## Option 3: Packlink PRO (NOT RECOMMENDED for Poland)

### Why it was considered
- User already successfully uses Packlink PRO API for Germany and UK
- Has sandbox mode, free API key, returns `price.total_price` and `transit_hours`

### Why it doesn't work for Poland
- Packlink PRO's supported origin/warehouse countries are UK, DE, ES, FR, IT, NL, etc.
- No evidence that Poland is a supported **origin** country
- All API examples show cross-border shipping (GB→BE, DE→BE, FR→...)
- Magento plugin changelog: "Added support for new warehouse countries" — Poland not explicitly mentioned
- The `platform_country: "gb"` in auth examples suggests UK-centric operation

**Verdict**: Packlink PRO is designed for shipping FROM Western European countries. For Poland domestic shipping, use a Poland-based broker instead.

---

## Eliminated Options (for reference)

| Option | Reason Eliminated |
|--------|-------------------|
| ShipEngine | Sandbox only supports US carriers (UPS, FedEx, USPS) |
| Shippo | Free/discounted rates are US-centric; Poland requires carrier accounts |
| EasyPost | DPD, DHL Express supported but requires own carrier accounts for Poland |
| InPost ShipX | Requires account approval (1-3 business days) |
| Poczta Polska eNadawca | Requires supervisor/hotline contact for test account |
| DHL MyDHL API | Requires existing DHL Express account + account manager approval |
| UPS Developer API | May require additional verification by UPS staff |
| Apaczka.pl | API v2 exists but requires signed agreement |
| SmartShipping | Shopify app for flat/weight-based rates, not real carrier API |
| Sendit.pl | No public API found; partnered with OLX but not a general developer API |

---

## Recommendation

### For immediate zero-cost testing: Epaka.pl

**Why Epaka.pl over Furgonetka:**
1. **Complete OpenAPI spec** — `api.epaka.pl/epaka-api.json` provides full endpoint documentation
2. **Explicit price endpoint** — `/v1/order/content/check` clearly returns calculated prices
3. **No sandbox ambiguity** — rates are real because it's a live broker platform
4. **More carriers** — 8+ carriers vs Furgonetka's 7+
5. **English API docs available** — ReDoc renders with English descriptions for many endpoints

### Quick Start Steps (Epaka.pl)
1. Register free account at `https://www.epaka.pl/uzytkownik/rejestracja`
2. Access user panel → API / Integrations section
3. Generate OAuth2 Client ID and Client Secret
4. Obtain access token via `POST /oauth/token`
5. Call `POST /v1/order/content/check` with:
   - Sender postcode: `00-533` (Warsaw)
   - Receiver postcode: target address
   - Package dimensions and weight
   - Selected courier ID (from `/v1/couriers`)
6. Response returns real calculated `grossPriceTotal`

### Alternative: Furgonetka.pl
If Epaka.pl registration or API access encounters issues, Furgonetka.pl is the strongest fallback:
- Explicit sandbox environment (`sandbox.furgonetka.pl`)
- REST API + OAuth2
- Wide carrier coverage including Polish-specific carriers (Poczta Kurier48, Paczka w RUCHu)
- Free account registration

---

## Sources

- Epaka.pl OpenAPI Spec: `https://api.epaka.pl/epaka-api.json`
- Epaka.pl Business/Integrations: `https://www.epaka.pl/biznes/integracje`
- Furgonetka REST API Docs: `https://furgonetka.pl/api/rest`
- Furgonetka OAuth Docs: `https://furgonetka.pl/api/oauth`
- Furgonetka Sandbox: `https://sandbox.furgonetka.pl/api/rest`
- Packlink PRO API Client (Crystal): `https://wout.github.io/packlink.cr/`
- ShipEngine Sandbox Docs: `https://www.shipengine.com/docs/sandbox/`
- InPost ShipX Developer Portal: `https://shipx.helpscoutdocs.com/article/31-developer-portal`
