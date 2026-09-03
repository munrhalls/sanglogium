# Product × Facet Applicability Rules

D1 deliverable for `sang-logium-u8w.2`.

## Output files

- `product-facet-applicability-matrix.json` — machine-readable matrix.
- `product-facet-applicability-matrix.csv` — spreadsheet view.
- `build-applicability-matrix.cjs` — script used to generate the matrix from live Sanity data.

## Matrix shape

- One row per catalogue-visible product (products with at least one `catalogueLocationKeys` in the 23 leaf catalogue categories).
- One column per canonical facet from `_project/filters/facet-map.json`.
- Each cell is either `needs value` or `N/A`.
- Total: 708 products × 22 facets, reconciled against the live `/products` count.

## Category rules

The matrix is generated from the canonical facet map and the product's leaf category.

1. **Universal facets** (`Price`, `Brand`, `Availability`, `Category`) are `needs value` for every visible product.
2. **Headphone facets** are `needs value` only for products in the `headphones` root category.
3. **Audio-electronics facets** are `needs value` only for products in the `audio-electronics` root category.
4. **Accessory facets** are `needs value` only for products in the `accessories` root category.

## Specific N/A rules

| Facet | When it is N/A | Reason |
|-------|----------------|--------|
| **Back design** | Product is in `Universal IEMs` (`monitors-iems`) | IEMs have no ear cup / back design. |
| **Connector / termination** | Product is an `earpad`, `eartip`, `stand`, `case`, or `care` accessory | These accessories have no connector or termination. |

## Traceability

Every `N/A` cell in the JSON carries a `reason` field. The CSV renders each `N/A` cell as `N/A: <reason>`.

## Out of scope & sequence

- **In scope:** deciding which facets apply to each product.
- **Out of scope:** filling any actual values (D2), defining vocabulary (D0).
- **Sequence:** after D0; blocks D2 (`sang-logium-u8w.3`).
