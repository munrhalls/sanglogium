/**
 * Detect product-type and feature queries (the whole query, never a phrase inside a longer one) that should redirect to a curated
 * catalogue category page with pre-applied filters instead of a plain keyword
 * search. Keeps /search as a fallback for model names and ambiguous queries.
 */

// Every address here must be a page the listing reads: in-ear products are a category, and headphones have no wearing-style filter.
const PRODUCT_TYPE_REDIRECTS: Record<string, string> = {
  headphones: '/products/headphones',
  headphone: '/products/headphones',

  iem: '/products/headphones/monitors-iems',
  iems: '/products/headphones/monitors-iems',
  inear: '/products/headphones/monitors-iems',
  inears: '/products/headphones/monitors-iems',
  'in-ear': '/products/headphones/monitors-iems',
  'in-ears': '/products/headphones/monitors-iems',
  inearmonitor: '/products/headphones/monitors-iems',
  inearmonitors: '/products/headphones/monitors-iems',
  'in-ear-monitor': '/products/headphones/monitors-iems',
  'in-ear-monitors': '/products/headphones/monitors-iems',
  earbud: '/products/headphones/monitors-iems',
  earbuds: '/products/headphones/monitors-iems',
  'ear bud': '/products/headphones/monitors-iems',
  'ear buds': '/products/headphones/monitors-iems',
  earphone: '/products/headphones/monitors-iems',
  earphones: '/products/headphones/monitors-iems',

  dac: '/products/audio-electronics?deviceType=dac',
  dacs: '/products/audio-electronics?deviceType=dac',
  'digital-to-analog-converter': '/products/audio-electronics?deviceType=dac',
  'digital to analog converter': '/products/audio-electronics?deviceType=dac',

  accessories: '/products/accessories',
  accessory: '/products/accessories',
};

interface FeatureRedirect {
  test: (raw: string) => boolean;
  target: string;
}

// Each test sees the words with one leading or trailing "headphone(s)" removed, and must match ALL of them:
// a feature phrase inside longer words (a product name, a SKU) is a search, not a jump.
const FEATURE_REDIRECTS: FeatureRedirect[] = [
  { test: (words) => /^closed[- ]?back$/.test(words), target: '/products/headphones?acousticDesign=closed-back' },
  { test: (words) => /^open[- ]?back$/.test(words), target: '/products/headphones?acousticDesign=open-back' },
  { test: (words) => /^semi[- ]?open$/.test(words), target: '/products/headphones?acousticDesign=semi-open' },
  { test: (words) => /^planar[- ]?magnetic$/.test(words), target: '/products/headphones?driverType=planar-magnetic' },
  { test: (words) => /^electrostatic$/.test(words), target: '/products/headphones?driverType=electrostatic' },
  { test: (words) => /^dynamic$/.test(words), target: '/products/headphones?driverType=dynamic' },
];

function normalizeForLookup(value: string): string {
  // Preserve spaces and hyphens so "closed-back" and "in-ear" stay readable
  // for the regex tests, but collapse multiple separators.
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim();
}

function toCompactKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** The words without one leading or trailing "headphone"/"headphones" ("closed back headphones" -> "closed back"). */
function withoutHeadphoneWord(raw: string): string {
  return raw.replace(/^headphones?[ -]+/, '').replace(/[ -]+headphones?$/, '');
}

export function detectSearchRedirect(query: string): string | null {
  const raw = normalizeForLookup(query);
  if (!raw) return null;

  // Product-type exact matches first, so "closed-back headphones" is not
  // mistaken for the generic "headphones" redirect.
  const compact = toCompactKey(raw);
  if (PRODUCT_TYPE_REDIRECTS[compact]) {
    return PRODUCT_TYPE_REDIRECTS[compact];
  }
  if (PRODUCT_TYPE_REDIRECTS[raw]) {
    return PRODUCT_TYPE_REDIRECTS[raw];
  }

  // Feature queries: the feature phrase alone, or with "headphone(s)" ("closed-back headphones").
  const words = withoutHeadphoneWord(raw);
  for (const feature of FEATURE_REDIRECTS) {
    if (feature.test(words)) {
      return feature.target;
    }
  }

  return null;
}
