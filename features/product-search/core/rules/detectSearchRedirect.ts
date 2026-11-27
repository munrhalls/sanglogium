/**
 * Detect product-type and feature queries (the whole query, never a phrase inside a longer one) that should redirect to a curated
 * catalogue category page with pre-applied filters instead of a plain keyword
 * search. Keeps /search as a fallback for model names and ambiguous queries.
 */

const PRODUCT_TYPE_REDIRECTS: Record<string, string> = {
  headphones: '/products/headphones',
  headphone: '/products/headphones',

  iem: '/products/headphones?wearingStyle=in-ear',
  iems: '/products/headphones?wearingStyle=in-ear',
  inear: '/products/headphones?wearingStyle=in-ear',
  inears: '/products/headphones?wearingStyle=in-ear',
  'in-ear': '/products/headphones?wearingStyle=in-ear',
  'in-ears': '/products/headphones?wearingStyle=in-ear',
  inearmonitor: '/products/headphones?wearingStyle=in-ear',
  inearmonitors: '/products/headphones?wearingStyle=in-ear',
  'in-ear-monitor': '/products/headphones?wearingStyle=in-ear',
  'in-ear-monitors': '/products/headphones?wearingStyle=in-ear',
  earbud: '/products/headphones?wearingStyle=in-ear',
  earbuds: '/products/headphones?wearingStyle=in-ear',
  'ear bud': '/products/headphones?wearingStyle=in-ear',
  'ear buds': '/products/headphones?wearingStyle=in-ear',
  earphone: '/products/headphones?wearingStyle=in-ear',
  earphones: '/products/headphones?wearingStyle=in-ear',

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
  { test: (words) => /^over[- ]?ear$/.test(words), target: '/products/headphones?wearingStyle=over-ear' },
  { test: (words) => /^on[- ]?ear$/.test(words), target: '/products/headphones?wearingStyle=on-ear' },
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
