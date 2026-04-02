import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';
import { cache } from 'react';
import type { Product as SanityProduct } from '@/sanity.types';

// Pagination safety limit - prevents unbounded queries
const MAX_PRODUCTS_LIMIT = 100;

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

// Product type using generated Sanity types - brand is now reference (SC8 complete)
export type Product = Pick<SanityProduct, '_id' | 'name' | 'displayPrice' | 'image' | 'catalogueLocationKeys' | 'brand'> & {
  slug: { current: string };
};

export interface GetProductsOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  limit?: number; // Optional override (capped at MAX_PRODUCTS_LIMIT)
}

const getProductsByVfsKeysFn = async ({
  keys,
  sort = 'featured',
  filters = [],
  limit = MAX_PRODUCTS_LIMIT
}: GetProductsOptions): Promise<Product[]> => {
  if (!keys.length) {
    return [];
  }

  // Cap limit at MAX_PRODUCTS_LIMIT for pagination safety
  const effectiveLimit = Math.min(limit, MAX_PRODUCTS_LIMIT);

  // Build sort clause
  const [sortField, sortDir] = sort.split(':');
  const orderClause = sort === 'featured'
    ? ''
    : `| order(${sortField} ${sortDir === 'asc' ? 'asc' : 'desc'})`;

  // Build filter clause
  const filterClause = filters.length > 0
    ? filters.map(f => {
        const [field, value] = f.split(':');
        console.log('=== FILTER DEBUG ===');
        console.log('raw filter:', f);
        console.log('field:', field);
        console.log('value:', value);

        // Brand is now a reference - filter by brand name via dereference (case-insensitive)
        if (field === 'brand') {
          const clause = `&& lower(brand->name) == lower("${value}")`;
          console.log('brand clause:', clause);
          return clause;
        }
        // Other filters check both overviewFields and specifications arrays
        const clause = `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
        console.log('other clause:', clause);
        return clause;
      }).join(' ')
    : '';

  console.log('=== FINAL FILTER CLAUSE ===');
  console.log('filterClause:', filterClause);

  const finalQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [0...${effectiveLimit}] {
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
    }`;

  console.log('=== FINAL GROQ QUERY ===');
  console.log('query:', finalQuery);
  console.log('params:', { keys });

  const result = await sanityFetch({
    query: finalQuery,
    params: { keys }
  });

  console.log('=== BRAND DATA DEBUG ===');
  console.log('products returned:', result.length);
  result.forEach(product => {
    console.log('product:', product.name);
    console.log('brand object:', product.brand);
    console.log('brand name:', product.brand?.name);
    console.log('brand _id:', product.brand?._id);
    console.log('brand slug:', product.brand?.slug);
    console.log('---');
  });

  // Debug: Query without brand filter to see what brands exist
  const debugQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] [0...20] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const debugResult = await sanityFetch({
    query: debugQuery,
    params: { keys }
  });

  console.log('=== ALL BRANDS DEBUG ===');
  console.log('all products in category:', debugResult.length);
  const brands = new Set();
  debugResult.forEach(product => {
    if (product.brand?.name) {
      brands.add(product.brand.name);
      console.log('brand found:', product.brand.name, 'for product:', product.name);
    }
  });
  console.log('unique brands:', Array.from(brands));

  // Debug: Test if brand reference works at all
  const testQuery3 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(brand->{name})] [0...10] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const testResult3 = await sanityFetch({
    query: testQuery3,
    params: { keys }
  });

  console.log('=== TEST BRAND REFERENCE DEBUG ===');
  console.log('products with defined brand name:', testResult3.length);
  testResult3.forEach(product => {
    console.log('product:', product.name, 'brand:', product.brand?.name);
  });

  // Debug: Test brand reference without dereferencing
  const testQuery4 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(brand)] [0...10] {
    _id,
    name,
    brand
  }`;

  const testResult4 = await sanityFetch({
    query: testQuery4,
    params: { keys }
  });

  console.log('=== TEST BRAND RAW DEBUG ===');
  console.log('products with brand reference:', testResult4.length);
  testResult4.forEach(product => {
    console.log('product:', product.name, 'brand ref:', product.brand);
  });

  // Debug: Test character-by-character comparison
  const testQuery6 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand->{name} == "Audeze" && count(brand->{name}) == 6] [0...10] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const testResult6 = await sanityFetch({
    query: testQuery6,
    params: { keys }
  });

  console.log('=== TEST BRAND LENGTH DEBUG ===');
  console.log('exact match with length check:', testResult6.length);

  // Debug: Check actual brand name characters
  const testQuery7 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
    _id,
    name,
    "brandName": brand->name,
    "brandNameLength": count(brand->name),
    "brandNameLower": lower(brand->name),
    "brandNameTrimmed": brand->name,
    "brandNameBytes": string::split(brand->name, "")
  }`;

  const testResult7 = await sanityFetch({
    query: testQuery7,
    params: { keys }
  });

  console.log('=== BRAND NAME ANALYSIS DEBUG ===');
  testResult7.forEach(product => {
    console.log('brand:', product.brandName);
    console.log('length:', product.brandNameLength);
    console.log('lower:', product.brandNameLower);
    console.log('trimmed:', JSON.stringify(product.brandNameTrimmed));
    console.log('bytes:', product.brandNameBytes);
    console.log('---');
  });

  // Test with proper dereferencing
  const testQuery9 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand->name == "Audeze"] [0...10] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const testResult9 = await sanityFetch({
    query: testQuery9,
    params: { keys }
  });

  console.log('=== TEST PROPER DEREF DEBUG ===');
  console.log('proper deref results:', testResult9.length);
  testResult9.forEach(product => {
    console.log('matched product:', product.name);
  });

  // Debug: Try the reference _ref approach
  const audezeRef = 'SRbPduY0SDJBJIcsBHIwsa'; // From the debug output
  const testQuery8 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand._ref == "${audezeRef}"] [0...10] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const testResult8 = await sanityFetch({
    query: testQuery8,
    params: { keys }
  });

  console.log('=== TEST BRAND REF DEBUG ===');
  console.log('ref query results:', testResult8.length);
  testResult8.forEach(product => {
    console.log('matched by ref:', product.name);
  });

  // Debug: Test the exact brand filter query
  const testQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && lower(brand->{name}) == lower("Audeze")] [0...10] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const testResult = await sanityFetch({
    query: testQuery,
    params: { keys }
  });

  console.log('=== TEST BRAND FILTER DEBUG ===');
  console.log('test query results:', testResult.length);
  testResult.forEach(product => {
    console.log('matched product:', product.name);
    console.log('matched brand:', product.brand?.name);
  });

  // Debug: Test without lower() function
  const testQuery2 = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand->{name} == "Audeze"] [0...10] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    }
  }`;

  const testResult2 = await sanityFetch({
    query: testQuery2,
    params: { keys }
  });

  console.log('=== TEST BRAND FILTER NO LOWER DEBUG ===');
  console.log('test query2 results:', testResult2.length);
  testResult2.forEach(product => {
    console.log('matched product:', product.name);
    console.log('matched brand:', product.brand?.name);
  });

  return result;
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
