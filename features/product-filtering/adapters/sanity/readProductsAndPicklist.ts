import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import { groq } from 'next-sanity';
import type { RawPicklistDoc, RawProductDoc } from '@/features/product-filtering/core/types/controlsAndOptions';

interface ProductsAndPicklist {
  productDocs: RawProductDoc[];
  picklistDoc: RawPicklistDoc | null;
}

/** Reads every product (catalogue keys and filterAttributes) and the filter picklist document. Not cached: derive runs at build and on publish. */
export function readProductsAndPicklist(): Promise<ProductsAndPicklist> {
  const query = groq`{
    "productDocs": *[_type == "product"]{ catalogueLocationKeys, filterAttributes },
    "picklistDoc": *[_id == "filterPicklist"][0]{ fields }
  }`;
  return sanityFetch<ProductsAndPicklist>({ query });
}
