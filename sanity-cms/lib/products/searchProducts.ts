'use server';

import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import catalogueData from '@/data/catalogue-index.json';

const slotMetadataMap: Record<string, { children?: string[] }> =
  (catalogueData as any).slotMetadataMap || {};

const parentByChild = new Map<string, string>();
for (const [parentId, meta] of Object.entries(slotMetadataMap)) {
  for (const childId of meta.children || []) {
    parentByChild.set(childId, parentId);
  }
}

const slugToIdMap: Record<string, string> = (catalogueData as any).slugToIdMap || {};
const ROOT_HEADPHONES = slugToIdMap.headphones;
const ROOT_AUDIO_ELECTRONICS = slugToIdMap['audio-electronics'];
const ROOT_ACCESSORIES = slugToIdMap.accessories;

const MAX_AUTOCOMPLETE = 6;
const MAX_AUTOCOMPLETE_CANDIDATES = MAX_AUTOCOMPLETE * 8;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  sku?: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
  catalogueLocationKeys?: string[];
}

export interface SearchProduct {
  _id: string;
  name: string;
  sku?: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
  catalogueLocationKeys: string[];
}

export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
}

const MAX_SORT_WINDOW = 2000;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function deriveSpacedQuery(value: string): string {
  // Produce a spacing-normalised variant of the raw query so GROQ match
  // can hit both concatenated models ("hd800s") and dashed variants
  // ("HD-800-S"). "SennheiserHD800S" becomes "Sennheiser HD 800S".
  return value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
    .replace(/(\d+)\s+([a-zA-Z]+)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRootCategory(key: string): 'headphones' | 'audio-electronics' | 'accessories' | null {
  let current = key;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    if (current === ROOT_HEADPHONES) return 'headphones';
    if (current === ROOT_AUDIO_ELECTRONICS) return 'audio-electronics';
    if (current === ROOT_ACCESSORIES) return 'accessories';
    current = parentByChild.get(current) || '';
  }
  return null;
}

function categoryScore(keys?: string[]): number {
  if (!keys || keys.length === 0) return 0;
  const roots = new Set<'headphones' | 'audio-electronics' | 'accessories' | null>();
  for (const key of keys) {
    roots.add(getRootCategory(key));
  }
  if (roots.has('headphones') || roots.has('audio-electronics')) return 50;
  if (roots.has('accessories')) return -50;
  return 0;
}

function buildFullName(name: string, brandName: string): string {
  const nameNorm = normalizeText(name);
  const brandNorm = normalizeText(brandName);
  if (!brandNorm || nameNorm.startsWith(brandNorm)) {
    return name;
  }
  return `${brandName} ${name}`.trim();
}

function positionBonus(index: number): number {
  return Math.max(0, 1000 - Math.min(index, 1000));
}

function scoreProduct(
  product: {
    name: string;
    brand?: { name?: string } | null;
    sku?: string;
    catalogueLocationKeys?: string[];
  },
  rawQuery: string
): number {
  const queryNorm = normalizeText(rawQuery);
  if (!queryNorm) return 0;

  const name = product.name || '';
  const brandName = product.brand?.name || '';
  const sku = product.sku || '';

  const nameNorm = normalizeText(name);
  const fullName = buildFullName(name, brandName);
  const fullNameNorm = normalizeText(fullName);
  const skuNorm = normalizeText(sku);

  const cat = categoryScore(product.catalogueLocationKeys);

  if (fullNameNorm === queryNorm) {
    return 1000 * 1000 + positionBonus(0) + cat;
  }
  if (fullNameNorm.startsWith(queryNorm)) {
    return 900 * 1000 + positionBonus(0) + cat;
  }
  if (nameNorm === queryNorm) {
    return 850 * 1000 + positionBonus(0) + cat;
  }
  if (skuNorm === queryNorm) {
    return 820 * 1000 + positionBonus(0) + cat;
  }
  if (nameNorm.startsWith(queryNorm)) {
    return 800 * 1000 + positionBonus(0) + cat;
  }
  if (skuNorm.startsWith(queryNorm)) {
    return 700 * 1000 + positionBonus(0) + cat;
  }

  const nameIdx = nameNorm.indexOf(queryNorm);
  if (nameIdx !== -1) {
    return 600 * 1000 + positionBonus(nameIdx) + cat;
  }

  const fullNameIdx = fullNameNorm.indexOf(queryNorm);
  if (fullNameIdx !== -1) {
    return 500 * 1000 + positionBonus(fullNameIdx) + cat;
  }

  const skuIdx = skuNorm.indexOf(queryNorm);
  if (skuIdx !== -1) {
    return 400 * 1000 + positionBonus(skuIdx) + cat;
  }

  // Loose brand-name token match for partial brand queries.
  if (brandName) {
    const brandNorm = normalizeText(brandName);
    const queryTokens = rawQuery.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (const token of queryTokens) {
      if (token.length >= 2 && brandNorm.includes(token)) {
        return 100 * 1000 + cat;
      }
    }
  }

  return cat;
}

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return [];
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  try {
    const candidates = await sanityFetch<AutocompleteProduct[]>({
      query: groq`*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
        name match $query ||
        name match $spacedQuery ||
        sku match $query ||
        brand._ref in *[_type == "brand" && (name match $query || name match $spacedQuery)]._id ||
        specifications[].value match $query ||
        specifications[].value match $spacedQuery ||
        overviewFields[].value match $query ||
        overviewFields[].value match $spacedQuery
      )] {
        _id,
        name,
        sku,
        catalogueLocationKeys,
        price_data,
        "brand": brand->{ _id, name, slug },
        slug,
        image
      } | order(_id asc) [0...${MAX_AUTOCOMPLETE_CANDIDATES}]`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    return (candidates ?? [])
      .map((product) => ({ product, score: scoreProduct(product, rawQuery) }))
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, MAX_AUTOCOMPLETE)
      .map(({ product }) => product);
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}

export async function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
): Promise<SearchResult> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return { products: [], totalCount: 0 };
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  const safePage = Math.max(1, Math.floor(page) || 1);
  const effectivePerPage = Math.max(1, Math.floor(perPage) || DEFAULT_PER_PAGE);

  const filterClause = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
    name match $query ||
    name match $spacedQuery ||
    sku match $query ||
    brand._ref in *[_type == "brand" && (name match $query || name match $spacedQuery)]._id ||
    specifications[].value match $query ||
    specifications[].value match $spacedQuery ||
    overviewFields[].value match $query ||
    overviewFields[].value match $spacedQuery
  )`;

  try {
    const countResult = await sanityFetch<number>({
      query: groq`count(*[${filterClause}])`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    const totalCount = countResult ?? 0;
    if (totalCount === 0) {
      return { products: [], totalCount: 0 };
    }

    const sortWindow = Math.min(totalCount, MAX_SORT_WINDOW);
    const matchedProducts = await sanityFetch<SearchProduct[]>({
      query: groq`*[${filterClause}] {
        _id,
        name,
        sku,
        price_data,
        stock,
        reservedStock,
        "availableStock": stock - reservedStock,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        catalogueLocationKeys
      } | order(_id asc) [0...${sortWindow}]`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    const products = (matchedProducts ?? []).slice().sort((a, b) => {
      const scoreA = scoreProduct(a, rawQuery);
      const scoreB = scoreProduct(b, rawQuery);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    });

    const totalPages = Math.max(1, Math.ceil(totalCount / effectivePerPage));
    const effectivePage = Math.min(safePage, totalPages);
    const offset = (effectivePage - 1) * effectivePerPage;

    return {
      products: products.slice(offset, offset + effectivePerPage),
      totalCount,
    };
  } catch (error) {
    console.error(`[searchProductsFull] Failed for query "${query}", sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0 };
  }
}
