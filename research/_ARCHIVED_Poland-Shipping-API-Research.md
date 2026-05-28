# Zero-Cost Poland Shipping API Research

## Executive Summary

**Finding:** No zero-cost Poland shipping API with real calculated rates and delivery timelines is readily available.

Previous research conclusion stands: zero-cost Poland shipping API with rate calculation is not readily available. Most Poland shipping APIs require business accounts, commercial relationships, or paid subscriptions.

## Detailed Findings

### Shipping Aggregators

#### AfterShip API
- **Claim:** Free API keys for DPD Poland, DHL Poland, and Poczta Polska without needing carrier developer accounts
- **Reality:**
  - AfterShip Shipping has 7-day free trial, then requires paid plans (per pricing FAQ)
  - Free plan only offers 10 free shipping labels, not ongoing free API access
  - Test mode available but unclear if rates are real or mock data
  - Pricing FAQ states: "We have a 7-day free trial for companies to test the app and proceed with the paid plans"
- **Conclusion:** NOT zero-cost ongoing access

#### Easyship API
- **Claim:** 550+ courier services globally with free API key generation
- **Reality:**
  - Sandbox environment returns sample data (mock rates), not real calculated rates
  - Documentation states: "All endpoints will remain the same, but the responses will contain sample data"
- **Conclusion:** NOT suitable - returns mock data

#### Shippo API
- **Claim:** 40+ carriers with sandbox testing
- **Reality:**
  - Test mode returns mock rates, not real calculated rates
  - Support documentation states: "Rates shown in Test Mode are 'mock' rates and may differ from the live (or 'real') rates"
- **Conclusion:** NOT suitable - returns mock data

### Direct Carrier APIs

#### DPD Poland
- **Previous Research:** Requires credentials, unclear if free test access available
- **New Finding:** Public test credentials found in GitHub repo:
  - Username: `test`
  - Password: `KqvsoFLT2M`
  - WSDL: `https://dpdservicesdemo.dpd.com.pl/DPDPackageObjServicesService/DPDPackageObjServices?WSDL`
- **Critical Limitation:** DPD documentation explicitly states:
  > "DPD do not provide web service that could provide exact price for specific parcel"
- **Conclusion:** Test credentials available but API does NOT provide rate calculation - requires customer-specific price lists

#### InPost (ShipX API)
- **Previous Research:** Requires access token via contact form
- **New Finding:**
  - Sandbox environment available: `https://sandbox-api-shipx-pl.easypack24.net`
  - Self-generation option available via Parcel Manager panel
  - However, requires business subscription (pricing mentioned "from as low as 11.89 PLN")
- **Conclusion:** Requires business account/subscription, NOT zero-cost

#### Poczta Polska
- **Previous Research:** Test environment available, unclear if registration is free
- **Finding:** Test environment at `https://en-testwebapi.poczta-polska.pl/`
- **Limitation:** Requires registration via form, unclear if free or requires business account
- **Conclusion:** Registration required, cost unclear

#### GLS Poland
- **Previous Research:** Test environment requires MyGLS account authentication
- **Finding:** Developer account requires business relationship or contact with IT department
- **Conclusion:** Requires business account, NOT zero-cost

#### UPS Poland
- **Finding:** Developer Resource Center available
- **Limitation:** Requires UPS developer account registration, unclear if free test access available
- **Conclusion:** Account registration required, cost unclear

#### FedEx Poland
- **Finding:** FedEx Developer Portal available
- **Limitation:** Requires FedEx account number for API access
- **Conclusion:** Requires account number, NOT zero-cost

#### DHL Express Poland
- **Finding:** MyDHL API available via DHL Developer Portal
- **Limitation:** Requires DHL Express customer account and consultant-provided credentials
- **Conclusion:** Requires customer account, NOT zero-cost

#### DHL eCommerce Europe (eConnect)
- **Previous Research:** Sandbox can be used for testing
- **New Finding:**
  - Sandbox environment can be used freely for testing
  - However, requires signing up through local sales representative contact
  - Client ID and password provided via secured channel after sales contact
- **Conclusion:** Not immediate zero-cost access - requires sales representative contact

## What Previous Research Missed

1. **DPD Poland public test credentials** - Found in GitHub repo, but API does not provide rate calculation
2. **AfterShip API** - Claims free API keys but requires paid plans after 7-day trial
3. **InPost self-generation option** - Available but requires business subscription
4. **DHL eCommerce Europe sandbox details** - Available but requires sales contact

## Conclusion

**No zero-cost Poland shipping API with real calculated rates and delivery timelines is available.**

All options either:
- Return mock/sample data (not real rates)
- Require paid subscriptions after trial period
- Require business accounts or commercial relationships
- Do not provide rate calculation functionality (e.g., DPD Poland)

The previous research conclusion was correct: zero-cost Poland shipping API with rate calculation is not readily available.

## Recommendations

For validation/testing purposes with real calculated rates, consider:
1. **Paid API access** to a shipping aggregator (AfterShip, Easyship, Shippo) with free trial period
2. **Direct carrier API** with business account setup (may require commercial relationship)
3. **Mock data** for development/testing if real rate accuracy is not critical
4. **Alternative approach** - Use a different country's shipping API with known zero-cost test access for development, then switch to Poland-specific API for production

## Sources

- AfterShip Pricing: https://www.aftership.com/pricing/shipping
- AfterShip Test Mode: https://shipping-helpcenter.aftership.com/en/article/try-aftership-shipping-in-test-mode-2x63u7/
- DPD Poland GitHub: https://github.com/msztorc/php-dpd-api
- DPD API Documentation: https://www.dpd.com/wp-content/uploads/sites/235/2023/04/DPD-API-documentation-v1-2-1.pdf
- InPost ShipX API: https://dokumentacja-inpost.atlassian.net/wiki/spaces/PL/pages/28639247
- InPost Self-Generation: https://inpost.pl/en/news-integration-self-generation-access-shipx-api
- GLS Poland API: https://www.jakimkurierem.pl/dokumentacja-api-kuriera-gls/
- DHL eCommerce Europe: https://developer.dhl.com/api-reference/ecommerce-europe?language_content_entity=en
- Easyship Sandbox: https://developers.easyship.com/docs/sandbox
- Shippo Test Mode: https://docs.goshippo.com/docs/Guides_general/testing
