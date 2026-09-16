/**
 * Detect product-type and feature queries that should redirect to a curated
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

const FEATURE_REDIRECTS: FeatureRedirect[] = [
  {
    test: (raw) => /closed[- ]?back/.test(raw) || raw.includes('closedback'),
    target: '/products/headphones?acousticDesign=closed-back',
  },
  {
    test: (raw) => /open[- ]?back/.test(raw) || raw.includes('openback'),
    target: '/products/headphones?acousticDesign=open-back',
  },
  {
    test: (raw) => /semi[- ]?open/.test(raw) || raw.includes('semiopen'),
    target: '/products/headphones?acousticDesign=semi-open',
  },
  {
    test: (raw) => /planar[- ]?magnetic/.test(raw) || raw.includes('planarmagnetic'),
    target: '/products/headphones?driverType=planar-magnetic',
  },
  {
    test: (raw) => raw.includes('electrostatic'),
    target: '/products/headphones?driverType=electrostatic',
  },
  {
    test: (raw) => /\bdynamic\b/.test(raw),
    target: '/products/headphones?driverType=dynamic',
  },
  {
    test: (raw) => /over[- ]?ear/.test(raw) || raw.includes('overear'),
    target: '/products/headphones?wearingStyle=over-ear',
  },
  {
    test: (raw) => /on[- ]?ear/.test(raw) || raw.includes('onear'),
    target: '/products/headphones?wearingStyle=on-ear',
  },
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

  // Feature queries such as "closed-back headphones".
  for (const feature of FEATURE_REDIRECTS) {
    if (feature.test(raw)) {
      return feature.target;
    }
  }

  return null;
}
