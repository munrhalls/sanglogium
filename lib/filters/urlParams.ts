import { ReadonlyURLSearchParams } from 'next/navigation';

export interface FilterState {
  sort: string;
  filters: string[]; // ['brand:sennheiser', 'driverType:dynamic']
}

export function parseFilterParams(searchParams: URLSearchParams) {
  const rawFilters = searchParams.getAll('f');
  return rawFilters.flatMap(f => {
    const parts = f.split(',');
    const result = [];
    let currentField = null;

    for (const part of parts) {
      if (part.includes(':')) {
        const [field, value] = part.split(':');
        // If this is a sub-value like "max:500" and we have a currentField,
        // treat it as currentField:max:500
        if (currentField && (field === 'min' || field === 'max')) {
          result.push(`${currentField}:${field}:${value}`);
        } else {
          result.push(part);
          currentField = field;
        }
      } else if (currentField) {
        // This is just a value, prepend with current field
        result.push(`${currentField}:${part}`);
      } else {
        // No current field, treat as-is
        result.push(part);
      }
    }

    return result;
  });
}

/**
 * Parse URL search params into filter state
 * URL format: ?sort=displayPrice:asc&f=brand:sennheiser&f=driverType:dynamic
 */
export function parseFilterState(searchParams: ReadonlyURLSearchParams | URLSearchParams): FilterState {
  // Sort: ?sort=displayPrice:asc
  const sort = searchParams.get('sort') || 'featured';

  // Filters: ?f=brand:sennheiser&f=driverType:dynamic
  // Handle both array and single value
  const filterParams = searchParams.getAll('f');
  const filters = filterParams.length > 0 ? filterParams : [];

  return { sort, filters };
}

/**
 * Build a new URL with filter changes
 */
export function buildFilterUrl(
  pathname: string,
  currentParams: URLSearchParams,
  changes: {
    sort?: string | null;
    addFilter?: string;
    removeFilter?: string;
    clearFilters?: boolean;
  }
): string {
  const params = new URLSearchParams(currentParams);

  // Handle sort
  if (changes.sort !== undefined) {
    if (changes.sort === null || changes.sort === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', changes.sort);
    }
  }

  // Handle add filter
  if (changes.addFilter) {
    const existing = params.getAll('f');
    if (!existing.includes(changes.addFilter)) {
      params.append('f', changes.addFilter);
    }
  }

  // Handle remove filter
  if (changes.removeFilter) {
    const existing = params.getAll('f');
    params.delete('f');
    existing
      .filter(f => f !== changes.removeFilter)
      .forEach(f => params.append('f', f));
  }

  // Handle clear all filters
  if (changes.clearFilters) {
    params.delete('f');
  }

  // Clean up empty params
  const cleanParams = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (value) cleanParams.append(key, value);
  }

  const queryString = cleanParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Check if a filter is active
 */
export function isFilterActive(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  field: string,
  value: string
): boolean {
  const filterKey = `${field}:${value}`;
  const filters = searchParams.getAll('f');
  return filters.includes(filterKey);
}

/**
 * Toggle a filter in URL params
 */
export function toggleFilter(
  pathname: string,
  currentParams: URLSearchParams,
  field: string,
  value: string
): string {
  const filterKey = `${field}:${value}`;
  const isActive = isFilterActive(currentParams, field, value);

  if (isActive) {
    return buildFilterUrl(pathname, currentParams, { removeFilter: filterKey });
  } else {
    return buildFilterUrl(pathname, currentParams, { addFilter: filterKey });
  }
}
