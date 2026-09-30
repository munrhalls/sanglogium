// Static search suggestion data: category shortcuts and popular terms.

export const CATEGORY_SUGGESTIONS = [
  { label: 'Headphones', href: '/products/headphones' },
  { label: 'IEMs', href: '/products/headphones/monitors-iems' },
  { label: 'Audio Electronics', href: '/products/audio-electronics' },
  { label: 'Accessories', href: '/products/accessories' },
] as const;

// Brand / product-type terms only. Category names live in CATEGORY_SUGGESTIONS
// (they link straight to the category page), so they are not repeated here.
export const POPULAR_SEARCHES = ['Sennheiser', 'FiiO', 'DACs & Amps', 'Cables'] as const;
