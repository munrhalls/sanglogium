import { CATEGORY_SUGGESTIONS } from './searchLinks';

/**
 * Non-product suggestions shown above the product rows: a category the shopper
 * may be typing ("head" → Headphones) and the brands of the matching products
 * ("sen" → Sennheiser). Derived on the client from the query and the product
 * suggestions already fetched, so it costs no extra request and can never
 * disagree with the products below it.
 */
export interface SuggestionEntry {
  kind: 'category' | 'brand';
  label: string;
  href: string;
}

const MAX_CATEGORIES = 2;
const MAX_BRANDS = 2;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function words(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

interface BrandLike {
  name: string;
  slug?: string | { current?: string } | null;
}

export function buildSuggestionEntries(
  query: string,
  products: Array<{ brand: BrandLike | null }>
): SuggestionEntry[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const entries: SuggestionEntry[] = [];

  for (const category of CATEGORY_SUGGESTIONS) {
    if (entries.length >= MAX_CATEGORIES) break;
    if (words(category.label).some((w) => w.startsWith(q))) {
      entries.push({ kind: 'category', label: category.label, href: category.href });
    }
  }

  const seen = new Set<string>();
  let brands = 0;
  for (const { brand } of products) {
    if (brands >= MAX_BRANDS) break;
    if (!brand?.name) continue;
    const brandNorm = normalize(brand.name);
    if (seen.has(brandNorm)) continue;
    const matches =
      words(brand.name).some((w) => w.startsWith(q)) || (q.length >= 3 && brandNorm.includes(q));
    if (!matches) continue;
    const slug = typeof brand.slug === 'string' ? brand.slug : brand.slug?.current;
    if (!slug) continue;
    seen.add(brandNorm);
    brands += 1;
    entries.push({
      kind: 'brand',
      label: brand.name,
      href: `/products?brand=${encodeURIComponent(slug)}`,
    });
  }

  return entries;
}
