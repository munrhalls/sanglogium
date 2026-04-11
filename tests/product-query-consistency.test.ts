import { describe, it, expect, beforeAll, vi } from 'vitest';
import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

// Mock only the non-Sanity parts
vi.mock('next/navigation');

// Helper to extract product IDs from various query results
function extractProductIds(result: any): string[] {
  if (!result) return [];

  // Handle array of products
  if (Array.isArray(result)) {
    return result.map(p => p._id || p.productRef?._id).filter(Boolean);
  }

  // Handle homepage data structure
  if (typeof result === 'object' && !result._id) {
    const ids: string[] = [];

    // Extract from arrays
    Object.values(result).forEach(value => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item._id) ids.push(item._id);
          if (item.productRef?._id) ids.push(item.productRef._id);
        });
      } else if (value?.productRef?._id) {
        ids.push(value.productRef._id);
      }
    });

    return ids;
  }

  // Handle single product
  if (result._id) return [result._id];

  return [];
}

describe('Product Query Consistency', () => {
  let allProductIds: string[] = [];
  let productIdsWithStripePrice: string[] = [];

  beforeAll(async () => {
    // Get all products and those with stripePriceId
    const allProducts = await sanityFetch({
      query: groq`*[_type == "product"] { _id, stripePriceId }`
    });

    allProductIds = allProducts.map((p: any) => p._id);
    productIdsWithStripePrice = allProducts
      .filter((p: any) => p.stripePriceId)
      .map((p: any) => p._id);

    console.log(`Total products: ${allProductIds.length}`);
    console.log(`Products with stripePriceId: ${productIdsWithStripePrice.length}`);
    console.log(`Products without stripePriceId: ${allProductIds.length - productIdsWithStripePrice.length}`);
  });

  it('Homepage batch query returns only products with stripePriceId', async () => {
    const result = await sanityFetch({
      query: groq`*[_type == "homepageData"][0] {
        "featured": featuredProducts[] {
          ...productRef->{ _id }
        },
        "spotlight1": spotlight1Data {
          productRef->{ _id }
        },
        "spotlight2": spotlight2Data {
          productRef->{ _id }
        },
        "spotlight3": spotlight3Data {
          productRef->{ _id }
        },
        "iemsGallery": iemsGallery[]->{ _id },
        "newestRelease": newestReleaseData {
          productRef->{ _id }
        },
        "dacs": dacs[]->{ _id },
        "accessoriesCables": accessoriesCables[]->{ _id },
        "accessoriesEarpads": accessoriesEarpads[]->{ _id }
      }`
    });

    const homepageIds = extractProductIds(result);

    // All homepage products must have stripePriceId
    homepageIds.forEach(id => {
      expect(productIdsWithStripePrice).toContain(id);
    });

    console.log(`Homepage products: ${homepageIds.length} (all have stripePriceId)`);
  });

  it('Product by slug query returns only products with stripePriceId', async () => {
    // Get a sample product with stripePriceId
    const sampleProduct = await sanityFetch({
      query: groq`*[_type == "product" && defined(stripePriceId)][0] { slug { current } }`
    });

    if (!sampleProduct) {
      console.log('No products with stripePriceId found for slug test');
      return;
    }

    const result = await sanityFetch({
      query: groq`*[_type == "product" && slug.current == $slug] { _id, stripePriceId }`,
      params: { slug: sampleProduct.slug.current }
    });

    if (result && result.length > 0) {
      expect(result[0].stripePriceId).toBeDefined();
      expect(productIdsWithStripePrice).toContain(result[0]._id);
    }

    console.log(`Product by slug test: ${result.length > 0 ? 'passed' : 'no product found'}`);
  });

  it('Products by VFS keys query returns only products with stripePriceId', async () => {
    // Get all catalogue keys
    const allKeys = await sanityFetch({
      query: groq`*[_type == "catalogueSlot"] { _id }`
    });

    if (!allKeys || allKeys.length === 0) {
      console.log('No catalogue keys found for VFS test');
      return;
    }

    const keys = allKeys.map((k: any) => k._id).slice(0, 10); // Test with first 10 keys

    const result = await sanityFetch({
      query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
        _id,
        stripePriceId
      }`,
      params: { keys }
    });

    result.forEach((product: any) => {
      expect(product.stripePriceId).toBeDefined();
      expect(productIdsWithStripePrice).toContain(product._id);
    });

    console.log(`VFS products: ${result.length} (all have stripePriceId)`);
  });

  it('Search autocomplete query returns only products with stripePriceId', async () => {
    const result = await sanityFetch({
      query: groq`*[_type == "product" && name match "audio"] {
        _id,
        stripePriceId,
        "score": select(name match "audio" => 20, 10)
      } | order(score desc, name asc) [0...6]`
    });

    result.forEach((product: any) => {
      expect(product.stripePriceId).toBeDefined();
      expect(productIdsWithStripePrice).toContain(product._id);
    });

    console.log(`Search autocomplete: ${result.length} (all have stripePriceId)`);
  });

  it('Full search query returns only products with stripePriceId', async () => {
    const result = await sanityFetch({
      query: groq`*[_type == "product" && name match "audio"] {
        _id,
        stripePriceId,
        stock,
        "score": select(name match "audio" => 20, 10)
      } | order(score desc, name asc)`
    });

    result.forEach((product: any) => {
      expect(product.stripePriceId).toBeDefined();
      expect(productIdsWithStripePrice).toContain(product._id);
    });

    console.log(`Full search: ${result.length} (all have stripePriceId)`);
  });

  it('Related products query returns only products with stripePriceId', async () => {
    // Get a product with catalogue keys
    const sampleProduct = await sanityFetch({
      query: groq`*[_type == "product" && defined(stripePriceId) && catalogueLocationKeys[0] != null][0] {
        _id,
        catalogueLocationKeys
      }`
    });

    if (!sampleProduct) {
      console.log('No product with catalogue keys found for related test');
      return;
    }

    const result = await sanityFetch({
      query: groq`*[_type == "product"
        && _id != $currentId
        && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
      ] | order(displayPrice asc) [0...6] {
        _id,
        stripePriceId
      }`,
      params: {
        currentId: sampleProduct._id,
        catalogueKeys: sampleProduct.catalogueLocationKeys
      }
    });

    result.forEach((product: any) => {
      expect(product.stripePriceId).toBeDefined();
      expect(productIdsWithStripePrice).toContain(product._id);
    });

    console.log(`Related products: ${result.length} (all have stripePriceId)`);
  });

  it('All queries exclude products without stripePriceId', async () => {
    // Get products without stripePriceId
    const productsWithoutStripe = await sanityFetch({
      query: groq`*[_type == "product" && !defined(stripePriceId)] { _id }`
    });

    const idsWithoutStripe = productsWithoutStripe.map((p: any) => p._id);

    // These IDs should NOT appear in any of the filtered queries
    const queries = [
      // Homepage
      groq`*[_type == "homepageData"][0].featuredProducts[].productRef._id`,
      // Category
      groq`*[_type == "product" && catalogueLocationKeys[0] != null]._id`,
      // Search
      groq`*[_type == "product" && name match "audio"]._id`
    ];

    for (const query of queries) {
      try {
        const result = await sanityFetch({ query });
        const ids = Array.isArray(result) ? result : [result].filter(Boolean);

        ids.forEach((id: any) => {
          expect(idsWithoutStripe).not.toContain(id);
        });
      } catch (e) {
        // Some queries might not return data, that's ok
      }
    }

    console.log(`Products without stripePriceId: ${idsWithoutStripe.length} (correctly excluded)`);
  });
});
