import type { ControlLabels, OptionValue, RawMap } from '@/features/product-filtering/core/types/optionMaps';
import { compareOptionValues } from './buildRawMap';
import { buildLabelsMap } from './buildLabelsMap';

/**
 * The list the Studio draws: every control of any slice once, in the order the slices give them, with the options any slice holds
 * (sorted) and the automatic text of the control and of each option. A label key has no slice, so a control that several slices
 * share is one entry. Curated rows are not applied here: the Studio shows them from the stored rows.
 */
export function listControlLabels(raw: RawMap): ControlLabels[] {
  const merged: Record<string, OptionValue[]> = {};
  for (const controls of Object.values(raw)) {
    for (const [field, values] of Object.entries(controls)) {
      const seen = (merged[field] ??= []);
      for (const v of values) if (!seen.some((x) => String(x) === String(v))) seen.push(v);
    }
  }
  for (const values of Object.values(merged)) values.sort(compareOptionValues);
  const automatic = buildLabelsMap({ all: merged }, []).all;
  return Object.entries(merged).map(([field, values]) => ({
    field,
    label: automatic[field].label,
    options: values.map((v) => ({ value: String(v), text: automatic[field].options[String(v)] })),
  }));
}
