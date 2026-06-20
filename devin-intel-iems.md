# Devin Intel Mission: IEM Category Data Verification

## Context (read this first)

The homepage has an "IEMs" section with a broken "VIEW ALL" button. The button
points to `/products/iems` which returns a 404 because `"iems"` is not a
registered slug in the catalogue. The correct slug is `monitors-iems`, which
maps to VFS node ID `t2anvkkjfz9knqi85kozuaze` ("Universal IEMs").

**Before fixing any code**, we need to verify the Sanity CMS data state.
Specifically: are the right products actually tagged with the right VFS key?
If not, fixing the URL alone gives a correct-looking button that navigates to
an empty or wrong product list.

This mission is **read-only Intel gathering only**. No writes. No code changes.

---

## Your job

Write and run a single `.mjs` script at:

```
sanity-cms/utils/intel-iems.mjs
```

The script must run three GROQ queries against the production Sanity dataset
and print the results clearly to the console. Then output a final summary that
answers the three intelligence questions at the bottom of this document.

---

## Environment setup

Load env from the project root `.env.local` using dotenv:

```js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
```

Create the client using these exact env var names (they match `.env.local`):

```js
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,  // read/write token — read is sufficient
});
```

If `NEXT_PUBLIC_SANITY_PROJECT_ID` is undefined after dotenv loads, also try
`process.env.SANITY_STUDIO_PROJECT_ID` as a fallback (older scripts used that
name). Print the resolved projectId to console before running queries so you
can confirm the client is configured.

---

## The three queries to run

### Query A — Homepage IEM gallery (what the section currently curates)

```groq
*[_type == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  "slug": slug.current,
  stock,
  catalogueLocationKeys
}
```

**Print:** total count, then for each product: `_id`, `name`, `slug`,
`stock`, and the full `catalogueLocationKeys` array.

---

### Query B — Products tagged with the IEM VFS key

The target VFS node ID for "Universal IEMs" is: `t2anvkkjfz9knqi85kozuaze`

```groq
*[_type == "product" && "t2anvkkjfz9knqi85kozuaze" in catalogueLocationKeys]{
  _id,
  name,
  "slug": slug.current,
  stock,
  catalogueLocationKeys
} | order(name asc)
```

**Print:** total count, then for each product: `_id`, `name`, `slug`, `stock`,
and the full `catalogueLocationKeys` array.

---

### Query C — All products that have ANY IEM-related VFS keys

This catches products that might be tagged with a legacy or alternative IEM
key rather than the current one.

```groq
*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys[@ match "*iem*" || @ match "*monitor*" || @ match "*ear*"]) > 0]{
  _id,
  name,
  "slug": slug.current,
  stock,
  catalogueLocationKeys
} | order(name asc)
```

**Print:** total count and full results.

---

## Final summary to print

After running all three queries, print a clearly labeled summary section:

```
=== INTEL SUMMARY ===

Q1: How many products are in the homepage iemsGallery?
    Answer: [count from Query A]

Q2: How many products are tagged with VFS key t2anvkkjfz9knqi85kozuaze (monitors-iems)?
    Answer: [count from Query B]

Q3: Are the Query A products also in Query B (do the gallery items carry the correct VFS key)?
    For each gallery product, print:
      name | has t2anvkkjfz9knqi85kozuaze? YES/NO | their actual catalogueLocationKeys

Q4: Are there any IEM products from Query C that are NOT in Query B?
    (products that may carry a legacy key but not the current one)
    Answer: list them, or "None — all IEM-tagged products use the current key"

Q5: If View All were fixed to /products/monitors-iems, would it show the same
    products as the homepage gallery?
    Answer: YES (all gallery items are in Query B) or NO (list the gaps)
```

---

## Safety rules

- This is a READ-ONLY operation. Do not call `client.patch`, `client.create`,
  `client.delete`, or any mutation method.
- Use only `client.fetch(query)` for all data retrieval.
- Do not modify any project source files other than creating the new script.
- Do not commit or push anything.

---

## How to run

From the project root:

```bash
node sanity-cms/utils/intel-iems.mjs
```

Paste the complete console output back as your result.
