import type { CuratedLabel, LabelsMap, OptionValue, RawMap } from '@/features/product-filtering/core/types/optionMaps';
import { humanizeFacetValue } from './humanizeFacetValue';

/** A control's automatic name: its field path as words (freqResponseHz.min -> "Freq response hz min"). */
export function autoControlLabel(field: string): string {
  const words = field.replace(/[._]/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([a-z])(\d)/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** An option's automatic text: true/false as Yes/No, a number as it is, text with capitals as it is, any other text as readable words. */
export function autoOptionLabel(value: OptionValue): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  return /[A-Z]/.test(value) ? value : humanizeFacetValue(value);
}

const keyOf = (field: string, value: string) => `${field}\n${value}`;

/**
 * One text for every control and option of the raw map: the owner's curated text when a non-empty row names it, else the automatic one.
 * The match is exact. Rows that name nothing in the raw map are ignored here; the proof reports them. Rows are unique on (field, value).
 */
export function buildLabelsMap(raw: RawMap, curated: CuratedLabel[]): LabelsMap {
  const chosen = new Map<string, string>();
  for (const row of curated) {
    const text = row.text?.trim();
    if (row.field && text) chosen.set(keyOf(row.field, row.value ?? ''), text);
  }
  return Object.fromEntries(
    Object.entries(raw).map(([slice, controls]) => [
      slice,
      Object.fromEntries(
        Object.entries(controls).map(([field, values]) => [
          field,
          {
            label: chosen.get(keyOf(field, '')) ?? autoControlLabel(field),
            options: Object.fromEntries(values.map((v) => [String(v), chosen.get(keyOf(field, String(v))) ?? autoOptionLabel(v)])),
          },
        ]),
      ),
    ]),
  );
}
