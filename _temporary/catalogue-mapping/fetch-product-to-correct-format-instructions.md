# Fetch Product to Correct Format Instructions

## Optimized GROQ Query

To export products from Sanity in the clean, semantic format required for AI routing decisions, use this exact GROQ query:

```groq
*[_type == "product"][0] {
  _id,
  name,
  brand,
  categoryPath,
  catalogueLocationKeys,
  "description": pt::text(description),
  "overviewFields": overviewFields[]{ title, value },
  "specifications": specifications[]{ title, value }
}
```

## Why This Format?

This stripped-down version reduces token count by over 80% while retaining 100% of the semantic meaning required for AI routing decisions.

### Fields Included:
- `_id`: Product identifier
- `name`: Product name
- `brand`: Brand name
- `categoryPath`: Legacy category path array
- `catalogueLocationKeys`: VFS catalogue slot IDs (currently empty arrays after reset)
- `description`: Full product description as plain text (via `pt::text()`)
- `overviewFields`: Key product attributes (title/value pairs only)
- `specifications`: Technical specifications (title/value pairs only)

### Fields Stripped (And Why):

| Stripped Field | Reason |
|----------------|--------|
| `gallery`, `image` | AI text models cannot see Sanity asset references |
| `_createdAt`, `_updatedAt`, `_rev`, `_type` | System tracking data, irrelevant for classification |
| `stripePriceId`, `displayPrice`, `stock`, `sku` | E-commerce operational data, not needed for routing |
| `slug` | URL path is often repetition of name, adds no semantic context |
| Portable Text metadata (`_key`, `children`, `markDefs`) | Stripped via `pt::text()` projection |

## Example Output Format

```json
{
  "_id": "3O1ZNp54LWQGln4uEAU7Vs",
  "brand": "Meze",
  "name": "Meze Audio 99 Series 2.5mm or 4.4mm Replacement Cable",
  "categoryPath": [
    "audio/cables"
  ],
  "catalogueLocationKeys": [],
  "overviewFields": [
    {
      "title": "Type",
      "value": "Audio Cable"
    }
  ],
  "description": "2.5mm or 4.4mm balanced upgrade cable for 99 Classics and 99 Neo...",
  "specifications": []
}
```

## The pt::text() Function

Sanity stores `description` as Portable Text (array of blocks, spans, keys). This is massive token bloat for an AI. The `pt::text()` function converts that entire array into a single, clean paragraph string **on the server side** before it ever reaches you.

## Usage Script

See `../scripts/fetch-product-semantic.mjs` for the implementation.
