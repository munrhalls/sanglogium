import type { Control, ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';

// The control model of one route, built from the answer's raw, labels and sorts maps.
// Per control, the values' type picks the widget: all text a checkbox, all true/false a toggle, all numbers a range.
// A control whose values are empty or of mixed types has no single widget, so it is left out.

/** Reshapes one route's answer into its control model, in the answer's order. */
export function buildControlModel({ raw, labels, sorts }: Pick<RouteControls, 'raw' | 'labels' | 'sorts'>): ControlModel {
  const controls: Control[] = [];
  for (const [path, values] of Object.entries(raw)) {
    if (values.length === 0) continue;
    const label = labels[path].label;
    if (values.every((v): v is string => typeof v === 'string')) {
      controls.push({ path, kind: 'checkbox', label, options: values.map((value) => ({ value, text: labels[path].options[value] })) });
    } else if (values.every((v): v is boolean => typeof v === 'boolean')) {
      controls.push({ path, kind: 'toggle', label });
    } else if (values.every((v): v is number => typeof v === 'number')) {
      controls.push({ path, kind: 'range', label, span: { min: values[0], max: values[values.length - 1] } });
    }
  }
  return { controls, sorts: Object.entries(sorts).map(([value, text]) => ({ value, text })) };
}
