import { formatRangeValue } from '@/features/product-filtering/core/rules/formatRangeValue';
import type { Chip } from '@/features/product-filtering/core/types/chips';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { RangeSelection, UrlState, UrlValue } from '@/features/product-filtering/core/types/urlState';

// The chips of a route: every active selection of the state, in the model's order (the options of a control in the control's option order).
// Only the model and the state are read, never the counts: a selected option that has no product in the current state (the panel hides it) still has its chip,
// so every selection that narrows the grid can be taken out. Defaults are not selections: an empty list, a toggle that is off, a range that is not set.

const isRange = (value: UrlValue | undefined): value is RangeSelection =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && typeof (value as RangeSelection).min === 'number' && typeof (value as RangeSelection).max === 'number';

export function buildChips(model: ControlModel, state: UrlState): Chip[] {
  const chips: Chip[] = [];
  for (const control of model.controls) {
    const selected = state[control.path];
    if (control.kind === 'checkbox') {
      if (!Array.isArray(selected)) continue;
      for (const option of control.options) {
        if (selected.includes(option.value))
          chips.push({ id: JSON.stringify([control.path, option.value]), kind: 'option', path: control.path, value: option.value, label: control.label, text: option.text });
      }
    } else if (control.kind === 'toggle') {
      if (selected === true) chips.push({ id: JSON.stringify([control.path]), kind: 'toggle', path: control.path, label: control.label, text: '' });
    } else if (isRange(selected)) {
      chips.push({
        id: JSON.stringify([control.path]),
        kind: 'range',
        path: control.path,
        label: control.label,
        text: `${formatRangeValue(control.path, selected.min)} to ${formatRangeValue(control.path, selected.max)}`,
      });
    }
  }
  return chips;
}
