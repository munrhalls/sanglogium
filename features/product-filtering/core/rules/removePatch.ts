import { clickPatch } from '@/features/product-filtering/core/rules/clickPatch';
import type { Chip } from '@/features/product-filtering/core/types/chips';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { UrlPatch, UrlState } from '@/features/product-filtering/core/types/urlState';

// What takes selections away, as patches for the URL contract's `encode`. `removePatch` takes out the one selection a chip stands for and nothing else:
// an option is unticked, a toggle is set off, a range is removed (null). `clearPatch` takes out every selection of every control of the model; the sort and any key
// the model does not own are not in it, so they stay.

export function removePatch(state: UrlState, chip: Chip): UrlPatch {
  if (chip.kind === 'option') return clickPatch(state, { kind: 'option', path: chip.path, value: chip.value, checked: false });
  if (chip.kind === 'toggle') return clickPatch(state, { kind: 'toggle', path: chip.path, on: false });
  return { [chip.path]: null };
}

export function clearPatch(model: ControlModel): UrlPatch {
  return Object.fromEntries(model.controls.map((control) => [control.path, null]));
}
