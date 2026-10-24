import { OPTION_LABEL_OVERRIDES } from '@/features/product-filtering/core/definitions/optionLabelOverrides';
import type { ControlsByCategory } from '@/features/product-filtering/core/types/controlsAndOptions';
import type { LabelledControlsByCategory } from '@/features/product-filtering/core/types/labelledControls';
import { humanizeFacetValue } from './humanizeFacetValue';
import { humanizeFieldName } from './humanizeFieldName';

/** Gives every control a name and every checkbox option its text: the override for that field and value, else humanized. */
export function deriveLabels(
  controls: ControlsByCategory,
  overrides: Record<string, Record<string, string>> = OPTION_LABEL_OVERRIDES,
): LabelledControlsByCategory {
  const result: LabelledControlsByCategory = {};
  for (const [category, fields] of Object.entries(controls)) {
    const labelled: LabelledControlsByCategory[string] = {};
    for (const [field, control] of Object.entries(fields)) {
      const name = humanizeFieldName(field);
      labelled[field] =
        control.control === 'range'
          ? { ...control, name }
          : {
              ...control,
              name,
              options: control.options.map((value) => ({
                value,
                text: overrides[field]?.[String(value)] ?? humanizeFacetValue(String(value)),
              })),
            };
    }
    result[category] = labelled;
  }
  return result;
}
