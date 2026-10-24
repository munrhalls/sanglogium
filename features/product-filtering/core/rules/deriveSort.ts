import { SORT_FIELDS } from '@/features/product-filtering/core/definitions/sortFields';
import type { ControlsByCategory } from '@/features/product-filtering/core/types/controlsAndOptions';
import type { DerivedSortOption, SortByCategory } from '@/features/product-filtering/core/types/derivedSort';
import { humanizeFieldName } from './humanizeFieldName';

const DIRECTION_WORDS = {
  range: { asc: 'Low to High', desc: 'High to Low' },
  checkbox: { asc: 'A to Z', desc: 'Z to A' },
} as const;

/** Gives each category an ascending and a descending option per sort field it has a control for, and its first option as the default. */
export function deriveSort(
  controls: ControlsByCategory,
  sortFields: string[] = SORT_FIELDS,
): SortByCategory {
  const result: SortByCategory = {};
  for (const [category, fields] of Object.entries(controls)) {
    const options: DerivedSortOption[] = [];
    for (const field of sortFields) {
      const control = fields[field];
      if (!control) continue;
      for (const direction of ['asc', 'desc'] as const) {
        options.push({
          value: `${field}-${direction}`,
          field,
          direction,
          text: `${humanizeFieldName(field)}: ${DIRECTION_WORDS[control.control][direction]}`,
        });
      }
    }
    if (options.length > 0) result[category] = { options, default: options[0].value };
  }
  return result;
}
