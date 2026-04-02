import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

const MAX_AUTOCOMPLETE = 6;
const MIN_QUERY_LENGTH = 2;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  displayPrice: number;
  slug: { current: string };
  image: any;
}

export interface SearchProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  displayPrice: number;
  stock: number;
  slug: { current: string };
  image: any;
}

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const searchTerm = `${query.trim()}*`;

  return sanityFetch<AutocompleteProduct[]>({
    query: groq`*[_type == "product" && (
      name match $query ||
      brand->name match $query ||
      sku match $query ||
      specifications[].value match $query ||
      overviewFields[].value match $query
    )] | order(name asc) [0...${MAX_AUTOCOMPLETE}] {
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      slug { current },
      image
    }`,
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
    if (['name', 'displayPrice'].includes(field) && ['asc', 'desc'].includes(dir)) {
      orderClause = `${field} ${dir}`;
    }
  }

  return sanityFetch<SearchProduct[]>({
    query: groq`*[_type == "product" && (
      name match $query ||
      brand->name match $query ||
      sku match $query ||
      specifications[].value match $query ||
      overviewFields[].value match $query
    )] | order(${orderClause}) {
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      slug { current },
      image
    }`,
    params: { query: searchTerm },
  });
}
