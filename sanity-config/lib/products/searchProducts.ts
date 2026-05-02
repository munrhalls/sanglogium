import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

const MAX_AUTOCOMPLETE = 6;
const MIN_QUERY_LENGTH = 2;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
}

export interface SearchProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
}

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const searchTerm = `${query.trim()}*`;

  return sanityFetch<AutocompleteProduct[]>({
    query: groq`*[_type == "product" && defined(stripePriceId) && (
      name match $query ||
      sku match $query ||
      brand._ref in *[_type == "brand" && name match $query]._id ||
      specifications[].value match $query ||
      overviewFields[].value match $query
    )] {
      _id,
      name,
      price_data,
      stripePriceId,
      "brand": brand->{ _id, name, slug },
      slug,
      image,
      "score": select(
        name match $query => 20,
        brand->name match $query => 15,
        10
      )
    } | order(score desc, name asc) [0...${MAX_AUTOCOMPLETE}]`,
    params: { query: searchTerm },
  });
}

export async function searchProductsFull(query: string, sort?: string): Promise<SearchProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const searchTerm = `${query.trim()}*`;

  // Build sort clause
  let orderClause = 'name asc';
  if (sort) {
    const [field, dir] = sort.split(':');
    if (['name', 'unit_amount'].includes(field) && ['asc', 'desc'].includes(dir)) {
      orderClause = `${field} ${dir}`;
    }
  }

  return sanityFetch<SearchProduct[]>({
    query: groq`*[_type == "product" && defined(stripePriceId) && (
      name match $query ||
      sku match $query ||
      brand._ref in *[_type == "brand" && name match $query]._id ||
      specifications[].value match $query ||
      overviewFields[].value match $query
    )] {
      _id,
      name,
      price_data,
      stock,
      reservedStock,
      "availableStock": stock - reservedStock,
      stripePriceId,
      "brand": brand->{ _id, name, slug },
      slug,
      image,
      "score": select(
        name match $query => 20,
        brand->name match $query => 15,
        10
      )
    } | order(score desc, ${orderClause})`,
    params: { query: searchTerm },
  });
}
