# Sprint: Warehouse Addresses for Shipping

## Multi-Region Strategy

European audio equipment business with 5-warehouse network for comprehensive EU coverage:
- **Poland**: Eastern/Central EU coverage
- **Netherlands**: Western EU logistics hub
- **Germany**: Central EU / largest market
- **UK**: Post-Brexit UK/Ireland coverage
- **Spain**: Southern EU coverage

## Warehouse Addresses

### Poland Warehouse (Eastern EU)

```
Sang Logium Poland Sp. z o.o.
ul. Postępu 18B
02-676 Warszawa
Poland
Phone: +48 22 100 2000
```

**Location Context**:
- Mokotów business district (Warsaw's tech/commercial hub)
- 15km from Chopin Airport (WAW)
- Near S79 highway for distribution
- Covers: Poland, Czech Republic, Slovakia, Hungary, Romania, Bulgaria, Baltics

### Netherlands Warehouse (Western Logistics Hub)

```
Sang Logium Netherlands B.V.
Schipholweg 285
1171 PK Badhoevedorp
Netherlands
Phone: +31 20 794 8000
```

**Location Context**:
- Schiphol logistics area (Europe's 3rd largest cargo airport)
- 5km from Amsterdam Airport Schiphol
- Direct highway access to Rotterdam port
- Covers: Netherlands, Belgium, Luxembourg, North Germany, Scandinavia

### Germany Warehouse (Central EU)

```
Sang Logium Germany GmbH
Hanauer Landstraße 291
60314 Frankfurt am Main
Germany
Phone: +49 69 123 4567
```

**Location Context**:
- Ostend industrial/logistics district
- 15km from Frankfurt Airport (FRA - Europe's largest cargo hub)
- Central highway/rail intersection
- Covers: Germany, Austria, Switzerland, Denmark, South Sweden

### UK Warehouse (Post-Brexit)

```
Sang Logium UK Ltd.
Unit 42, Milton Keynes Distribution Centre
Bletchley, Milton Keynes MK1 1BA
United Kingdom
Phone: +44 1908 123 456
```

**Location Context**:
- Milton Keynes logistics hub (central UK)
- 80km north of London
- M1 motorway corridor
- Covers: UK, Ireland

### Spain Warehouse (Southern EU)

```
Sang Logium Spain S.L.
Carrer de la Botànica 72
08908 L'Hospitalet de Llobregat
Spain
Phone: +34 93 123 4567
```

**Location Context**:
- Barcelona metropolitan logistics zone
- 10km from Barcelona Port
- 15km from Barcelona-El Prat Airport (BCN)
- Covers: Spain, Portugal, South France, Italy, Greece

## Routing Logic

```
Customer Country → Warehouse
PL, CZ, SK, HU, RO, BG, LT, LV, EE → Poland
NL, BE, LU, DK, SE, NO, FI → Netherlands
DE, AT, CH → Germany
UK, IE → UK
ES, PT, IT, GR, FR (south), MT, CY → Spain
FR (north/north-east) → Netherlands or Germany

Default fallback: Germany (central, largest market)

## Shippo API Usage

```typescript
// Pseudo-code for address_from selection
const getWarehouseAddress = (customerCountry: string): Address => {
  const easternEU = ['PL', 'CZ', 'SK', 'HU', 'LT', 'LV', 'EE', 'FI', 'SE', 'NO', 'DK'];

  if (easternEU.includes(customerCountry)) {
    return polandWarehouseAddress; // Object ID from Shippo
  }
  return netherlandsWarehouseAddress; // Object ID from Shippo
};
```

## Implementation Notes

1. Create both addresses in Shippo dashboard (or via API) once
2. Store returned Shippo Address Object IDs in environment variables
3. At checkout, use customer country to select appropriate warehouse
4. Pass selected warehouse Object ID as `address_from` in Shipment request

## Portfolio Value

Demonstrates understanding of:
- Regional fulfillment strategy
- Logistics hub optimization (Netherlands)
- EU market coverage patterns
- Cost-effective shipping via proximity routing
