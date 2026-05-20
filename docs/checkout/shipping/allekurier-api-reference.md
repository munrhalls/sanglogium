# AlleKurier API Reference

> Source: PHP client library (`GetServicesAction.php`, `AKAPI.php`, `GetServicesResponse.php`)
> from https://github.com/AlleKurier/api_v1

## Endpoint

```
POST https://allekurier.pl/api_v1/service_list
```

## Authentication

Username/password in form-encoded body. No additional headers beyond `Accept: application/json` and `Content-Type: application/x-www-form-urlencoded`.

**Env vars:** `ALLEKURIER_EMAIL`, `ALLEKURIER_PASSWORD`

**Test account:** Register at allekurier.pl, then email `it@allekurier.pl` to mark as test (avoids charges, returns real rates).

## Request Parameters

| Parameter | Required | Type | Example |
|---|---|---|---|
| `User[email]` | Yes | string | `test@example.com` |
| `User[password]` | Yes | string | `mypassword` |
| `Order[package]` | Yes | string | `parcel`, `envelope`, `europallet`, `isopallet`, `bigpallet` |
| `Order[cod]` | No | number | `0` |
| `Order[insurance]` | No | number | `0` |
| `Sender[country]` | Yes | string | `PL` (ISO 3166-1 alpha-2) |
| `Sender[postal_code]` | No | string | `00-001` (only for pallets) |
| `Recipient[country]` | Yes | string | `PL` |
| `Recipient[postal_code]` | No | string | `30-001` (only for pallets) |
| `Packages[N][weight]` | Yes | number | `2.5` (kg) |
| `Packages[N][width]` | Yes | number | `30` (cm) |
| `Packages[N][height]` | Yes | number | `20` (cm) |
| `Packages[N][length]` | Yes | number | `40` (cm) |
| `Packages[N][custom]` | No | number | `0` or `1` |

## Response Format

```json
{
  "Error": [],
  "Response": [
    {
      "Carrier": { "code": "dpd", "name": "DPD Polska" },
      "Service": { "code": "dpd_classic", "name": "DPD Classic" },
      "Order": { "net": "12.76", "gross": "15.69" },
      "Time": { "days": "1", "description": "1 dzień roboczy" }
    }
  ]
}
```

## TypeScript Types

```ts
interface AlleKurierService {
  Carrier: { code: string; name: string };
  Service: { code: string; name: string };
  Order: { net: string; gross: string };
  Time: { days: string; description: string };
}

interface AlleKurierResponse {
  Error: string[];
  Response: AlleKurierService[];
}
```

## cURL Example

```bash
curl -X POST https://allekurier.pl/api_v1/service_list \
  -H 'accept: application/json' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d 'User[email]=test@example.com' \
  -d 'User[password]=mypassword' \
  -d 'Order[package]=parcel' \
  -d 'Order[cod]=0' \
  -d 'Order[insurance]=0' \
  -d 'Sender[country]=PL' \
  -d 'Sender[postal_code]=00-001' \
  -d 'Recipient[country]=PL' \
  -d 'Recipient[postal_code]=30-001' \
  -d 'Packages[0][weight]=2.5' \
  -d 'Packages[0][width]=30' \
  -d 'Packages[0][height]=20' \
  -d 'Packages[0][length]=40' \
  -d 'Packages[0][custom]=0'
```

## Package Types

| Value | Description |
|---|---|
| `parcel` | Standard package |
| `envelope` | Envelope |
| `europallet` | Euro pallet |
| `isopallet` | ISO pallet |
| `bigpallet` | Large pallet |

## Preflight Script

`scripts/experiment-allekurier-preflight.mjs` — self-contained verification script.

## Known Issues in Existing Code

`lib/shipping/allekurier.ts` has three bugs vs verified source:
1. **Wrong endpoint:** `/api_v1/services` → should be `/api_v1/service_list`
2. **Wrong param names:** `Order[package_type]`, `Sender[zip_code]`, etc. → should be `Order[package]`, `Sender[postal_code]`, etc.
3. **Wrong response parsing:** Expects flat `{name, price}` → actual is nested `{Carrier, Service, Order}`
