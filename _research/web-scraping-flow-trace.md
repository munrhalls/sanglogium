# Web Scraping Flow Trace - From Target to Verification

## Complete Flow: One Product Journey

### Bus Stop 0: Origin - Target Website
**Location**: `https://www.worldwidestereo.com/products/sony-wh-1000xm5-wireless-over-ear-noise-canceling-headphones-black`

**What exists**:
- HTML page with product data
- Structured markup (h1, prices, specifications)
- Image assets on CDN
- Brand information
- SKU/Model numbers

---

### Bus Stop 1: Extraction Initiation
**Trigger**: Manual start or automated queue

**Console Log**:
```
=== STARTING EXTRACTION ===
URL: https://www.worldwidestereo.com/products/sony-wh-1000xm5-wireless-over-ear-noise-canceling-headphones-black
Expected: fetchPageHTML(url)
Actual: fetchPageHTML(url)
Expectation Met: true
```

**Action**: Fetch HTML content
- Network request to target URL
- Handle anti-bot measures
- Rate limiting applied (2 second delay)

---

### Bus Stop 2: Raw Data Extraction
**Location**: Memory/DOM Parser

**Console Log**:
```
1. Extraction: Parse HTML
Expected: extractRawData(htmlDocument)
Actual: extractRawData(htmlDocument)
Expectation Met: true
   Fields found: 8/10
   Missing: gallery (0 items), overviewFields (0 items)
```

**Raw Data Object**:
```javascript
{
  name: "Sony WH-1000XM5 Wireless Over-Ear Noise Canceling Headphones (Black)",
  displayPrice: 399.99,
  sku: "SONY-WH1000XM5-BLK",
  brand: "Sony",
  image: "https://cdn.shopify.com/...",
  gallery: [],
  overviewFields: [],
  specifications: [
    { title: "Battery Life", value: "30 hours" },
    { title: "Driver Size", value: "30mm" },
    { title: "Weight", value: "250g" }
  ]
}
```

---

### Bus Stop 3: Schema Contract Application
**Location**: Transform Engine

**Console Log**:
```
2. Transform: Apply Schema Contract
Expected: transformToSchema(rawData, ProductSchema)
Actual: transformToSchema(rawData, ProductSchema)
Expectation Met: true
   Fields transformed: 8/10
   Generated fields added: 2
```

**Transform Action**:
- Map raw fields to schema structure
- Add required _type fields
- Generate _key values for arrays
- Convert brand string to reference object

**Transformed Data**:
```javascript
{
  name: "Sony WH-1000XM5 Wireless Over-Ear Noise Canceling Headphones (Black)",
  displayPrice: 399.99,
  sku: "SONY-WH1000XM5-BLK",
  brand: { _ref: "sony", _type: "reference" },
  image: { _type: "image" },
  gallery: [],
  overviewFields: [],
  specifications: [
    { title: "Battery Life", value: "30 hours", _type: "spec", _key: "key-0" },
    { title: "Driver Size", value: "30mm", _type: "spec", _key: "key-1" },
    { title: "Weight", value: "250g", _type: "spec", _key: "key-2" }
  ]
}
```

---

### Bus Stop 4: Validation Check
**Location**: Validation Engine

**Console Log**:
```
3. Validation: Schema Compliance
Expected: validateAgainstContract(transformedData)
Actual: validateAgainstContract(transformedData)
Expectation Met: true
   Required fields: 5/5 present
   Type checks: 8/8 passed
   Shape validation: passed
   Errors: 0
```

**Validation Actions**:
- Check required fields (name, displayPrice, sku, brand, image)
- Verify field types
- Ensure no extra fields
- Validate array structures

---

### Bus Stop 5: Generated Fields Addition
**Location**: Generation Engine

**Console Log**:
```
4. Generation: Add System Fields
Expected: addGeneratedFields(validatedData)
Actual: addGeneratedFields(validatedData)
Expectation Met: true
   Stock: 10 (default)
   Reserved Stock: 0 (default)
   Stripe Price ID: price_placeholder_1744192000000
   Catalogue Keys: ["headphones", "over-ear", "noise-cancelling"]
```

**Generated Object**:
```javascript
{
  // ... previous fields ...
  stock: 10,
  reservedStock: 0,
  stripePriceId: "price_placeholder_1744192000000",
  catalogueLocationKeys: ["headphones", "over-ear", "noise-cancelling"]
}
```

---

### Bus Stop 6: Human Verification Display
**Location**: Verification UI

**Console Log**:
```
5. Display: Prepare for Human Review
Expected: displayProductJSON(finalData)
Actual: displayProductJSON(finalData)
Expectation Met: true
   JSON size: 1.2KB
   Display format: raw JSON only
```

**UI Shows**:
```html
<div class="verification">
  <h2>Verify Product Data</h2>
  <pre class="json-display">{
  "name": "Sony WH-1000XM5 Wireless Over-Ear Noise Canceling Headphones (Black)",
  "displayPrice": 399.99,
  "sku": "SONY-WH1000XM5-BLK",
  "brand": {
    "_ref": "sony",
    "_type": "reference"
  },
  "image": {
    "_type": "image"
  },
  "stock": 10,
  "reservedStock": 0,
  "stripePriceId": "price_placeholder_1744192000000",
  "catalogueLocationKeys": ["headphones", "over-ear", "noise-cancelling"],
  "specifications": [
    {
      "title": "Battery Life",
      "value": "30 hours",
      "information": null,
      "_type": "spec",
      "_key": "key-0"
    },
    {
      "title": "Driver Size",
      "value": "30mm",
      "information": null,
      "_type": "spec",
      "_key": "key-1"
    },
    {
      "title": "Weight",
      "value": "250g",
      "information": null,
      "_type": "spec",
      "_key": "key-2"
    }
  ]
}</pre>
  <button onclick="approve()">Approve</button>
  <button onclick="reject()">Reject</button>
</div>
```

---

### Bus Stop 7: Human Decision
**Location**: Human Interface

**Console Log**:
```
=== HUMAN REVIEW ===
Expected: humanDecision(approve/reject)
Waiting for human action...
```

**Human Actions**:
- Review JSON data
- Compare with source page (optional)
- Click Approve or Reject

---

### Bus Stop 8A: Approval Path (If Approved)
**Location**: Submission Pipeline

**Console Log**:
```
6. Approval: Submit to Sanity
Expected: submitToSanity(approvedData)
Actual: submitToSanity(approvedData)
Expectation Met: true
   Sanity ID: generated-xyz123
   Upload images: 1/1 successful
=== PRODUCT APPROVED ===
```

**Actions**:
- Upload images to Sanity CDN
- Update image asset references
- Create product document in Sanity
- Return generated Sanity ID

---

### Bus Stop 8B: Rejection Path (If Rejected)
**Location**: Error Handling

**Console Log**:
```
6. Rejection: Log and Discard
Expected: logRejection(data, reason)
Actual: logRejection(data, "Invalid specifications")
Expectation Met: true
   Reason: Human rejected
   Data discarded
=== PRODUCT REJECTED ===
```

**Actions**:
- Log rejection reason
- Discard extracted data
- Mark URL as reviewed (optional)

---

## Complete Flow Summary

### Success Path (7 Bus Stops)
1. **Origin** -> Fetch HTML
2. **Extraction** -> Parse raw data
3. **Transform** -> Apply schema
4. **Validation** -> Check compliance
5. **Generation** -> Add system fields
6. **Display** -> Show JSON for review
7. **Approval** -> Submit to Sanity

### Failure Points
- **Bus Stop 1**: Network failure, blocked access
- **Bus Stop 2**: Missing required fields
- **Bus Stop 3**: Schema transformation errors
- **Bus Stop 4**: Validation failures
- **Bus Stop 6**: Human rejection

### Key Characteristics
- **Linear flow**: Each stop depends on previous
- **Expectation logging**: Every step logs expected vs actual
- **Human gate**: Only approval allows progression
- **Zero drift**: Schema contract enforced throughout
- **Simple verification**: Only raw JSON shown to human
