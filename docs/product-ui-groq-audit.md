# Product UI Locations and GROQ Queries Audit

This document catalogs all UI locations where products are displayed and their associated GROQ queries.

## 1. Homepage (`/app/(store)/page.tsx`)

### UI Components:
- **Featured Products** - `/app/components/features/homepage/featured/`
- **Product Spotlight 1, 2, 3** - `/app/components/features/homepage/product-spotlight-[1,2,3]/`
- **IEMs Gallery** - `/app/components/features/homepage/iems-gallery/`
- **Newest Release** - `/app/components/features/homepage/newest-release/`
- **DACs** - `/app/components/features/homepage/dacs/`
- **Accessories** - `/app/components/features/homepage/accessories/`

### GROQ Query Location: `/app/lib/data/homepageBatch.ts`

#### Homepage Data Query (lines 198-329):
```groq
*[_type == "homepageData"][0] {
  // Featured products section
  "featured": featuredProducts[] {
    productPromo,
    ...productRef->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      "slug": slug.current,
      image { asset->{url} }
    }
  },

  // Spotlight 1 section
  "spotlight1": spotlight1Data {
    promoTitle,
    promoSubtitle,
    promoText,
    productRef->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      "slug": slug.current,
      image { asset->{url} },
      gallery[] { asset->{url} }
    }
  },

  // Spotlight 2 section
  "spotlight2": spotlight2Data {
    promoTitle,
    promoSubtitle,
    promoText,
    productRef->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      "slug": slug.current,
      image { asset->{url} },
      gallery[] { asset->{url} }
    }
  },

  // Spotlight 3 section
  "spotlight3": spotlight3Data {
    promoTitle,
    promoSubtitle,
    promoText,
    productRef->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      "slug": slug.current,
      image { asset->{url} },
      gallery[] { asset->{url} }
    }
  },

  // IEMs gallery section
  "iemsGallery": iemsGallery[]->{
    _id,
    name,
    brand->{ _id, name, slug },
    displayPrice,
    stock,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    image { asset->{url} }
  },

  // Newest release section
  "newestRelease": newestReleaseData {
    promoTitle,
    promoSubtitle,
    promoText,
    productRef->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      "slug": slug.current,
      image { asset->{url} },
      gallery[] { asset->{url} }
    }
  },

  // DACs section
  "dacs": dacs[]->{
    _id,
    name,
    brand->{ _id, name, slug },
    displayPrice,
    stock,
    "slug": slug.current,
    image { asset->{url} }
  },

  // Accessories - cables section
  "accessoriesCables": accessoriesCables[]->{
    _id,
    name,
    brand->{ _id, name, slug },
    displayPrice,
    stock,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    image { asset->{url} }
  },

  // Accessories - earpads section
  "accessoriesEarpads": accessoriesEarpads[]->{
    _id,
    name,
    brand->{ _id, name, slug },
    displayPrice,
    stock,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    image { asset->{url} }
  }
}
```

## 2. Product Detail Page (`/app/(store)/product/[slug]/page.tsx`)

### UI Component:
- **ProductDetail** - `/app/components/features/products/`

### GROQ Query Location: `/sanity/lib/products/getProductBySlug.ts`

#### Product By Slug Query (lines 22-46):
```groq
*[_type == "product" && slug.current == $slug] {
  _id,
  name,
  brand->{ _id, name, slug },
  displayPrice,
  stock,
  sku,
  image,
  gallery,
  slug {
    current
  },
  description,
  overviewFields[] {
    title,
    value,
    information
  },
  specifications[] {
    title,
    value,
    information
  },
  catalogueLocationKeys
}
```

### Related Products Query:
#### Related Products Query (lines 23-38):
```groq
*[_type == "product"
  && _id != $currentId
  && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
] | order(displayPrice asc) [0...$limit] {
  _id,
  name,
  brand {
    _id,
    name
  },
  displayPrice,
  image,
  slug {
    current
  }
}
```

## 3. Category/Products Page (`/app/(store)/products/[...slug]/page.tsx`)

### UI Components:
- **ProductGrid** - `/app/components/features/products/`
- **FilterSidebar** - `/app/components/features/filters/`
- **ShopHeader** - `/app/components/features/products/`

### GROQ Query Location: `/sanity/lib/products/getProductsByVfsKeys.ts`

#### Products by VFS Keys Query (lines 54-72):
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [0...${effectiveLimit}] {
  _id,
  name,
  brand->{
    _id,
    name,
    slug
  },
  displayPrice,
  image {
    asset {
      _ref
    }
  },
  slug {
    current
  },
  catalogueLocationKeys
}
```

## 4. Search Page (`/app/(store)/search/page.tsx`)

### UI Components:
- **SearchHeader** - `/app/components/features/search/`
- **SearchResults** - `/app/(store)/search/SearchResults.tsx`

### GROQ Query Location: `/sanity/lib/products/searchProducts.ts`

#### Search Autocomplete Query (lines 34-52):
```groq
*[_type == "product" && (
  name match $query ||
  sku match $query ||
  brand._ref in *[_type == "brand" && name match $query]._id ||
  specifications[].value match $query ||
  overviewFields[].value match $query
)] {
  _id,
  name,
  displayPrice,
  "brand": brand->{ _id, name, slug },
  slug,
  image,
  "score": select(
    name match $query => 20,
    brand->name match $query => 15,
    10
  )
} | order(score desc, name asc) [0...${MAX_AUTOCOMPLETE}]
```

#### Full Search Query (lines 74-93):
```groq
*[_type == "product" && (
  name match $query ||
  sku match $query ||
  brand._ref in *[_type == "brand" && name match $query]._id ||
  specifications[].value match $query ||
  overviewFields[].value match $query
)] {
  _id,
  name,
  displayPrice,
  stock,
  "brand": brand->{ _id, name, slug },
  slug,
  image,
  "score": select(
    name match $query => 20,
    brand->name match $query => 15,
    10
  )
} | order(score desc, ${orderClause})
```

## 5. Brand Page (`/app/(store)/brand/[slug]/page.tsx`)

### UI Component:
- **BrandProducts** - (brand-specific product grid)

### GROQ Query Location: (Need to verify - likely similar to getProductsByVfsKeys with brand filter)

## 6. Basket/Cart (`/app/(store)/basket/page.tsx`)

### UI Components:
- **BasketItems** - Product display in cart
- **BasketSummary** - Product totals

### Note: Basket products come from client-side state, not direct GROQ queries

## Key Observations:

1. **Field Coverage Consistency**:
   - All queries include: `_id`, `name`, `brand`, `displayPrice`, `slug`, `image`
   - Search queries include: `stock` (for availability)
   - Product detail includes: `sku`, `description`, `overviewFields`, `specifications`, `catalogueLocationKeys`

2. **Brand Dereferencing**:
   - All queries use `brand->{ _id, name, slug }` pattern
   - Related products uses simplified `brand { _id, name }`

3. **Search Field Coverage**:
   - Searches across: `name`, `sku`, `brand.name`, `specifications[].value`, `overviewFields[].value`
   - Maintains consistency between autocomplete and full search

4. **Image Handling**:
   - Homepage: `image { asset->{url} }`
   - Product detail: `image`, `gallery[]`
   - Category pages: `image { asset { _ref } }` (for optimization)

5. **Sorting**:
   - Homepage: No sorting (uses Sanity order)
   - Category: Dynamic sorting via `orderClause`
   - Search: Score-based sorting, then user-selected sort

## Recommendations:

1. **Standardize field projections** across all queries for consistency
2. **Consider adding `stripePriceId`** to all product queries for checkout validation
3. **Review image projections** - category pages use `_ref` while others use full `url`
4. **Ensure search consistency** - both autocomplete and full search cover same fields
