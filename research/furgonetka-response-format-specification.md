# Furgonetka API Response Format Specification

**Date:** 2026-05-14
**Chunk:** sang-logium-9sg (Chunk 4: Response Format Verification for Furgonetka)
**Purpose:** Document exact response format from Furgonetka rate calculation endpoint

---

## Endpoint

**URL:** `https://api.sandbox.furgonetka.pl/packages`
**Method:** POST
**Response Content-Type:** `application/json`

---

## Response Structure Overview

**Status 200 OK:** Returns complete package object with pricing, address details, and status information

**Root-Level Fields:**
- `package_id` - Unique package identifier
- `service` - Carrier name (e.g., "inpost", "dpd")
- `pricing` - Pricing information object
- `delivery_time` - **ALWAYS NULL** (not provided by API)
- `state` - Package state (e.g., "waiting")
- `pickup` - Pickup location details
- `sender` - Sender address details
- `receiver` - Recipient address details
- `parcels` - Package dimensions and weight
- `additional_services` - Additional service flags
- `type` - Package type
- `service_id` - Carrier service ID
- And many metadata fields

---

## Key Data Extraction Fields

### For Rate Calculation Realism Experiment:

**Cost Data (AVAILABLE):**
- `pricing.price_gross` - Total price including tax (PLN)
- `pricing.price_net` - Price excluding tax (PLN)
- `pricing.price_base_net` - Base price before adjustments (PLN)
- `pricing.tax` - Tax rate percentage (e.g., 23)
- `pricing.details` - Array of price breakdown items (e.g., fuel surcharge)

**Delivery Time Data (NOT AVAILABLE):**
- `delivery_time` - **ALWAYS NULL** regardless of distance or carrier
- This field is present in response but never populated with actual data
- Critical limitation: Cannot verify delivery time differences between carriers or distances

**Carrier Identification:**
- `service` - Carrier name (e.g., "inpost", "dpd")
- `service_id` - Carrier service ID from request

---

## Complete Response Field Definitions

### Root-Level Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `package_id` | integer | Unique package identifier | `20126195` |
| `group_id` | integer/null | Group identifier for multiple packages | `null` |
| `service` | string | Carrier name (lowercase) | `"inpost"`, `"dpd"` |
| `service_id` | integer | Carrier service ID from request | `11597700` |
| `transport_service` | string | Transport service subtype | `""` |
| `transport_service_description` | string/null | Description of transport service | `null` |
| `type` | string | Package type | `"package"` |
| `state` | string | Package state | `"waiting"` |
| `delivery_time` | null | **ALWAYS NULL** - delivery time not provided | `null` |
| `pricing` | object | Pricing information (see below) | Object |
| `pickup` | object | Pickup location details (see below) | Object |
| `sender` | object | Sender address details (see below) | Object |
| `receiver` | object | Recipient address details (see below) | Object |
| `parcels` | array | Package dimensions and weight (see below) | Array |
| `additional_services` | object | Additional service flags (see below) | Object |
| `user_reference_number` | string/null | User reference | `null` |
| `service_contract` | string | Service contract status | `"provided"` |
| `cancel_available` | boolean | Whether cancellation is available | `false` |
| `complaint_available` | boolean | Whether complaint can be filed | `false` |
| `edit_url` | string | URL to edit package in panel | `"https://sandbox.furgonetka.pl/..."` |
| `documents_url` | string/null | URL to documents | `null` |
| `add_similar_url` | string | URL to add similar package | `"https://sandbox.furgonetka.pl/..."` |
| `datetime_order` | string/null | Order datetime | `null` |
| `datetime_add` | string | Package creation datetime | `"2026-05-14T15:52:14+02:00"` |
| `datetime_delivery` | string/null | Expected delivery datetime | `null` |
| `tracking_url` | string (in parcels) | Tracking URL | `"https://sandbox.furgonetka.pl/zlokalizuj/..."` |

---

## Pricing Object

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `price_gross` | number | Total price including tax (PLN) | `19.31` |
| `price_net` | number | Price excluding tax (PLN) | `15.7` |
| `price_base_net` | number | Base price before adjustments (PLN) | `13.89` |
| `price_org` | number | Original price (PLN) | `19.31` |
| `adjusted_price` | number | Adjusted price (PLN) | `19.31` |
| `tax` | number | Tax rate percentage | `23` |
| `price_info` | string | Additional price information | `""` |
| `details` | array | Price breakdown items | Array of objects |
| `details[].service` | string | Service name (e.g., "fuel_surcharge") | `"fuel_surcharge"` |
| `details[].price_net` | number | Additional service price (PLN) | `1.81` |
| `details[].description` | string | Description in Polish | `"Opłata paliwowa"` |
| `rates` | array/null | Rate breakdown (always null in tests) | `null` |

**Cost Extraction Method:**
```javascript
const cost = {
  gross: response.pricing.price_gross,    // Total with tax
  net: response.pricing.price_net,        // Without tax
  taxRate: response.pricing.tax,         // Tax percentage
  breakdown: response.pricing.details    // Additional fees
};
```

---

## Pickup Object

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Contact name | `"Test Sender"` |
| `company` | string | Company name | `"Test Company"` |
| `street` | string | Street address | `"Marszałkowska 1"` |
| `postcode` | string | Postal code | `"00-533"` |
| `city` | string | City | `"Warszawa"` |
| `country_code` | string | Country code | `"PL"` |
| `county` | string/null | County/region | `null` |
| `email` | string | Contact email | `"test@example.com"` |
| `phone` | string | Contact phone | `"600123456"` |
| `point` | string/null | Pickup point code | `null` |
| `point_label` | string/null | Pickup point label | `null` |
| `point_data` | object/null | Pickup point details | `null` |

---

## Sender Object

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Contact name | `"Test Sender"` |
| `company` | string | Company name | `"Test Company"` |
| `street` | string | Street address | `"Marszałkowska 1"` |
| `postcode` | string | Postal code | `"00-533"` |
| `city` | string | City | `"Warszawa"` |
| `country_code` | string | Country code | `"PL"` |
| `county` | string/null | County/region | `null` |
| `email` | string | Contact email | `"test@example.com"` |
| `phone` | string | Contact phone | `"600123456"` |
| `point_data` | object/null | Pickup point details | `null` |
| `only_pickup_provided` | boolean | Whether only pickup provided | `false` |

---

## Receiver Object

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `uuid` | string/null | Unique receiver ID | `null` |
| `name` | string | Contact name | `"Test Receiver"` |
| `company` | string | Company name | `"Test Company"` |
| `street` | string | Street address | `"Nowy Świat 1"` |
| `postcode` | string | Postal code | `"00-001"` |
| `city` | string | City | `"Warszawa"` |
| `country_code` | string | Country code | `"PL"` |
| `county` | string/null | County/region | `null` |
| `email` | string | Contact email | `"test@example.com"` |
| `phone` | string | Contact phone | `"600123456"` |
| `point` | string/null | Delivery point code | `null` |
| `point_data` | object/null | Delivery point details | `null` |
| `point_label` | string/null | Delivery point label | `null` |
| `building_number` | string/null | Building number | `null` |
| `flat_number` | string/null | Flat/apartment number | `null` |

---

## Parcels Array

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `package_no` | string/null | Package number | `null` |
| `description` | string | Package description | `""` |
| `state_description` | string | State description in Polish | `"Oczekuję na aktualizację statusu"` |
| `state` | string | Package state | `"waiting"` |
| `station` | string/null | Current station | `null` |
| `width` | number | Width in cm | `15` |
| `depth` | number | Depth in cm | `15` |
| `height` | number | Height in cm | `15` |
| `weight` | number | Weight in kg | `1.5` |
| `dimensional_weight` | number/null | Dimensional weight | `null` |
| `pallet_info` | object/null | Pallet information | `null` |
| `value` | number | Declared value | `0` |
| `service` | string | Carrier name | `"inpost"` |
| `delivery_time` | null | **ALWAYS NULL** | `null` |
| `gauge` | string/null | Gauge/size class | `null` |
| `preset` | string/null | Preset type | `null` |
| `datetime_status` | string/null | Last status update datetime | `null` |
| `quantity` | number/null | Quantity | `null` |
| `tracking_url` | string | Tracking URL | `"https://sandbox.furgonetka.pl/zlokalizuj/..."` |

---

## Additional Services Object

Contains boolean flags for various additional services. All flags are `false` by default unless explicitly enabled in request.

**Key Services:**
- `cod` - Cash on Delivery (null if not set)
- `rod` - Return on Delivery
- `cud` - Change on Delivery
- `private_shipping` - Private shipping
- `guarantee_0900`, `guarantee_0930`, `guarantee_1200` - Delivery time guarantees
- `saturday_delivery` - Saturday delivery
- `additional_handling` - Additional handling
- `sms_predelivery_information` - SMS notification
- `documents_supply` - Documents supply
- `insurance` - Insurance
- `fragile` - Fragile items
- And many more carrier-specific services

---

## Response Variations

### By Carrier

**InPost (service_id: 11597700):**
- `service`: `"inpost"`
- `price_gross`: `19.31` PLN (Warszawa to Kraków)
- `price_net`: `15.7` PLN
- Standard response structure

**DPD (service_id: 11597695):**
- `service`: `"dpd"`
- `price_gross`: `27.17` PLN (Warszawa to Kraków)
- `price_net`: `22.09` PLN
- Standard response structure
- Different pricing as expected

### By Distance (No Impact on delivery_time)

**Same City (Warszawa to Warszawa):**
- `delivery_time`: `null`
- `price_gross`: `19.31` PLN (InPost)
- No delivery time difference

**Different City (Warszawa to Kraków):**
- `delivery_time`: `null`
- `price_gross`: `19.31` PLN (InPost)
- No delivery time difference

**Different Region (Warszawa to Gdańsk):**
- `delivery_time`: `null`
- `price_gross`: `19.31` PLN (InPost)
- No delivery time difference

**Finding:** Distance does not affect pricing or delivery_time in sandbox environment. Pricing appears to be flat-rate for InPost within Poland.

---

## Critical Limitation: Delivery Time

**Finding:** The `delivery_time` field is always null regardless of:
- Distance (same city vs different city vs different region)
- Carrier (InPost vs DPD)
- Service configuration

**Tested Scenarios:**
- Same city (Warszawa to Warszawa): `delivery_time = null`
- Different city (Warszawa to Kraków): `delivery_time = null`
- Different region (Warszawa to Gdańsk): `delivery_time = null`
- Different carrier (DPD): `delivery_time = null`

**Impact on Experiment:**
- Original experiment goal: Verify rate calculation realism using delivery time and cost differences
- Only cost data is available from API
- Cannot verify delivery time differences between carriers or distances
- Experiment scope must be adjusted to cost-only verification

**Related Issue:** sang-logium-nuu (Furgonetka API delivery_time field is null - investigate alternative data sources)

---

## Complete Example Response

```json
{
  "package_id": 20126195,
  "group_id": null,
  "pickup": {
    "name": "Test Sender",
    "company": "Test Company",
    "street": "Marszałkowska 1",
    "postcode": "00-533",
    "city": "Warszawa",
    "country_code": "PL",
    "county": null,
    "email": "test@example.com",
    "phone": "600123456",
    "point": null,
    "point_label": null,
    "point_data": null
  },
  "sender": {
    "name": "Test Sender",
    "company": "Test Company",
    "street": "Marszałkowska 1",
    "postcode": "00-533",
    "city": "Warszawa",
    "country_code": "PL",
    "county": null,
    "email": "test@example.com",
    "phone": "600123456",
    "point_data": null,
    "only_pickup_provided": false
  },
  "receiver": {
    "uuid": null,
    "name": "Test Receiver",
    "company": "Test Company",
    "street": "Nowy Świat 1",
    "postcode": "00-001",
    "city": "Warszawa",
    "country_code": "PL",
    "county": null,
    "email": "test@example.com",
    "phone": "600123456",
    "point": null,
    "point_data": null,
    "point_label": null,
    "building_number": null,
    "flat_number": null
  },
  "parcels": [
    {
      "package_no": null,
      "description": "",
      "state_description": "Oczekuję na aktualizację statusu",
      "state": "waiting",
      "station": null,
      "width": 15,
      "depth": 15,
      "height": 15,
      "weight": 1.5,
      "dimensional_weight": null,
      "pallet_info": null,
      "value": 0,
      "tracking_url": "https://sandbox.furgonetka.pl/zlokalizuj//inpost",
      "service": "inpost",
      "delivery_time": null,
      "gauge": null,
      "preset": null,
      "datetime_status": null,
      "quantity": null,
      "brand": null,
      "model": null,
      "tires_details": null
    }
  ],
  "additional_services": {
    "cod": null,
    "rod": false,
    "cud": false,
    "private_shipping": false,
    "guarantee_0900": false,
    "guarantee_0930": false,
    "guarantee_1200": false,
    "saturday_delivery": false,
    "additional_handling": false,
    "sms_predelivery_information": false,
    "documents_supply": false,
    "saturday_sunday_delivery": false,
    "guarantee_next_day": false,
    "fedex_priority": false,
    "ups_saver": false,
    "ups_standard": false,
    "valuable_shipment": false,
    "fragile": false,
    "personal_delivery": false,
    "poczta_kurier24": false,
    "poczta_kurier48": false,
    "pocztex": false,
    "polecony": null,
    "weight_30_50": false,
    "delivery_on_day": "",
    "courier_drive_up": false,
    "registered_letter": false,
    "registered_letter_priority": null,
    "registered_company_letter": false,
    "registered_letter_international": false,
    "poczta_globalexpres": false,
    "delivery_confirmation": false,
    "selected_pickup_date": false,
    "valuable_package": false,
    "self_pickup": false,
    "insurance": false,
    "ambro_size20": null,
    "xpress_service": null,
    "xpress_service_name": null,
    "premium": false,
    "receiver_sms_notification": false,
    "inpost_letter": false,
    "standard": false,
    "mini": false,
    "mini_or_standard": false,
    "deligoo_express": false,
    "city_size_small": false,
    "srs": false,
    "sds": false,
    "service_description": "",
    "dox": false,
    "long_package": false,
    "large_package": false,
    "avizo_pickup_sms": false,
    "avizo_pickup_tel": false,
    "avizo_delivery_tel": false,
    "pickup_same_day": false,
    "oversized_package": false,
    "customs_clearance": false,
    "additional_manipulative_fee": false,
    "odb_sat": false,
    "ps": false,
    "destination_remote_area": false,
    "destination_extended_area": false,
    "origin_extended_area": false,
    "city_size_large": false,
    "city_size_medium": false,
    "delivery_to_door": false,
    "pickup_from_door": false,
    "energy_fee": false,
    "dimensional_weight_fee": false,
    "ups_ship_notification": false,
    "ups_exception_notification": false,
    "ups_delivery_notification": false,
    "digital_label": false,
    "low_cost": false,
    "letterprint_additional_page": null,
    "letterprint_copies_count": null,
    "letterprint_color_print": null,
    "letterprint_blackandwhite_print": null,
    "green_area": false,
    "food": null,
    "help_with_loading": false,
    "client_agreement_order": false,
    "declaredvalue": null,
    "receiver_email_notification": false,
    "vat_invoice": false,
    "load_assist": null,
    "unload_assist": null,
    "additional_handling_byweight": false,
    "ahs_dimensions": false,
    "ahs_weight": false,
    "ahs_packaging": false,
    "phone_package": null,
    "additional_insurance": false,
    "weekend_delivery": null,
    "road_tolls": false,
    "tires": false
  },
  "type": "package",
  "pricing": {
    "price_gross": 19.31,
    "price_net": 15.7,
    "price_base_net": 13.89,
    "price_org": 19.31,
    "adjusted_price": 19.31,
    "tax": 23,
    "price_info": "",
    "details": [
      {
        "service": "fuel_surcharge",
        "price_net": 1.81,
        "description": "Opłata paliwowa"
      }
    ],
    "rates": null
  },
  "user_reference_number": null,
  "service": "inpost",
  "transport_service": "",
  "transport_service_description": null,
  "service_id": 11597700,
  "state": "waiting",
  "service_contract": "provided",
  "cancel_available": false,
  "complaint_available": false,
  "cancel_details": {
    "available": false,
    "cancellation_done": false,
    "cancellation_date": null,
    "scheduled_cancel_date": null,
    "before_cancel_message_type": null,
    "pricelist_url": null
  },
  "edit_url": "https://sandbox.furgonetka.pl/konto/edycja-paczki/20126195",
  "documents_url": null,
  "add_similar_url": "https://sandbox.furgonetka.pl/konto/dodaj-podobna/20126195",
  "repickup": false,
  "pickup_available": false,
  "name": "Test Receiver",
  "pickup_number": null,
  "label": {
    "file_format": null
  },
  "documents": [],
  "pickup_date": null,
  "datetime_order": null,
  "datetime_add": "2026-05-14T15:52:14+02:00",
  "datetime_delivery": null,
  "machine_command_available": null,
  "point_command_available": null,
  "duty": null,
  "point_specific_details": null,
  "delivery_time": null,
  "changes": [],
  "related_packages": [],
  "changes_relations": [],
  "return_disposition": null,
  "readdressing_disposition": null,
  "system_fees": null,
  "digital_label": [],
  "group_size": null,
  "group_type": null,
  "courier_phone": null,
  "returns_data": null,
  "promotion_code": null,
  "order_uuid": null,
  "order_number": null,
  "auction": null,
  "pricelist": {
    "name": "InPost",
    "url": "/konto/moje/cenniki/inpost"
  },
  "self_collection_data": [],
  "return_url": null,
  "mpk": null,
  "additional_services_dictionary": null,
  "information": null
}
```

---

## Data Extraction for Experiment

### Cost Data Extraction (Available)

```javascript
// Extract cost data from response
const extractCostData = (response) => ({
  carrier: response.service,
  serviceId: response.service_id,
  priceGross: response.pricing.price_gross,
  priceNet: response.pricing.price_net,
  priceBaseNet: response.pricing.price_base_net,
  taxRate: response.pricing.tax,
  additionalFees: response.pricing.details.map(d => ({
    service: d.service,
    price: d.price_net,
    description: d.description
  }))
});

// Example output for InPost
{
  carrier: "inpost",
  serviceId: 11597700,
  priceGross: 19.31,
  priceNet: 15.7,
  priceBaseNet: 13.89,
  taxRate: 23,
  additionalFees: [
    {
      service: "fuel_surcharge",
      price: 1.81,
      description: "Opłata paliwowa"
    }
  ]
}
```

### Delivery Time Data Extraction (Not Available)

```javascript
// Attempt to extract delivery time (will always be null)
const extractDeliveryTime = (response) => ({
  deliveryTime: response.delivery_time, // Always null
  parcelDeliveryTime: response.parcels[0].delivery_time // Always null
});

// Output: { deliveryTime: null, parcelDeliveryTime: null }
// This data cannot be used for the experiment
```

---

## Status

**Completed:**
- Response format documented with complete field definitions
- Cost extraction method documented
- Response variations identified (by carrier, by distance)
- Critical limitation documented (delivery_time always null)

**Blocked:**
- delivery_time data extraction not possible (API limitation)
- Original experiment goal cannot be completed as specified

**Next Steps:**
- Proceed to Chunk 5 (Authentication Verification) with adjusted experiment scope
- Address delivery_time limitation via separate issue (sang-logium-nuu)
