const BUILT_IN_FILTER_FIELDS = ["priceRange", "stockMin"] as const;

export interface MinimalFilterGroup {
  field: string;
}

export function buildValidFilterFields(filterGroups: MinimalFilterGroup[]): Set<string> {
  return new Set([
    ...BUILT_IN_FILTER_FIELDS,
    ...filterGroups.map((g) => g.field),
  ]);
}

export function stripUnknownFilters(entries: string[], validFields: Set<string>): string[] {
  return entries.filter((entry) => {
    const i = entry.indexOf(":");
    if (i === -1) return false;
    return validFields.has(entry.slice(0, i));
  });
}
