// Controls a slice hides because the slice already fixes their value
// (e.g. the Open-Back slice does not offer Acoustic Design). Keyed by the
// slice's URL path under /products; ids are facet ids from ./categories/.

export const HIDDEN_FACETS_BY_SLICE: Record<string, string[]> = {
  'headphones/open-back': ['acousticDesign'],
  'headphones/closed-back': ['acousticDesign'],
  'headphones/semi-open': ['acousticDesign'],
  'headphones/planar-magnetic': ['driverType'],
  'headphones/dynamic': ['driverType'],
  'headphones/electrostatic': ['driverType'],
  'accessories/headphone-cables': ['accessoryType'],
  'accessories/interconnects': ['accessoryType'],
  'accessories/adapters': ['accessoryType'],
  'accessories/earpads': ['accessoryType', 'partType'],
  'accessories/eartips': ['accessoryType', 'partType'],
  'accessories/care-cleaning': ['accessoryType'],
  'accessories/headphone-stands': ['accessoryType'],
  'accessories/carrying-cases': ['accessoryType'],
};

export function hiddenFacetIds(slicePath: string | undefined): string[] {
  return slicePath ? HIDDEN_FACETS_BY_SLICE[slicePath] ?? [] : [];
}
