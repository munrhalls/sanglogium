import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = (fn: Function): Function => {
  try {
    // Dynamic import to avoid breaking in non-React environments
    const { cache } = require('react');
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface Product {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
  };
  displayPrice: number;
  image: any;
  slug: {
    current: string;
  };
  catalogueLocationKeys: string[];
}

const getProductsByVfsKeysFn = async (keys: string[]): Promise<Product[]> => {
  if (!keys.length) {
    return [];
  }

  return sanityFetch({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
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
      },
      catalogueLocationKeys
    }`,
    params: { keys }
  });
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (keys: string[]) => Promise<Product[]>;
