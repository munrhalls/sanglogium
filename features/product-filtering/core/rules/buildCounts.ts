// The counts of one control model under one URL state: for each checkbox control, how many of the route's products each option stands for.
// A control's own selection is left out of its counts: an option's count is the products that satisfy every other control's selection and hold that option.

import type { Control, ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Counts } from '@/features/product-filtering/core/types/counts';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';
import type { UrlState } from '@/features/product-filtering/core/types/urlState';

type Product = RouteControls['products'][number];

/** The items a product holds at a path: the value is read from the product itself when `onProduct` names the path, else from `filterAttributes`; a list gives its items, anything else one item, a missing or non-object step none. */
function itemsAt(product: Product, path: string, onProduct: string[]): unknown[] {
  let node: unknown = onProduct.includes(path) ? product : product.filterAttributes;
  for (const key of path.split('.')) {
    if (typeof node !== 'object' || node === null) return [];
    node = (node as Record<string, unknown>)[key];
  }
  const items = Array.isArray(node) ? node : [node];
  return items.filter((item) => item !== undefined && item !== null);
}

/** The constraint one control's selection puts on a product, or null when the state's value at its path selects nothing (missing, null, an empty array, false, a wrong shape). */
function constraintOf(control: Control, state: UrlState, onProduct: string[]): ((product: Product) => boolean) | null {
  const value = state[control.path];
  if (control.kind === 'checkbox' && Array.isArray(value) && value.length > 0) {
    return (product) => itemsAt(product, control.path, onProduct).some((item) => value.some((v) => v === item));
  }
  if (control.kind === 'toggle' && value === true) {
    return (product) => itemsAt(product, control.path, onProduct).some((item) => item === true);
  }
  if (
    control.kind === 'range' &&
    typeof value === 'object' &&
    value !== null &&
    'min' in value &&
    'max' in value &&
    typeof value.min === 'number' &&
    typeof value.max === 'number'
  ) {
    const { min, max } = value;
    return (product) => itemsAt(product, control.path, onProduct).some((item) => typeof item === 'number' && min <= item && item <= max);
  }
  return null;
}

/** For each checkbox control of the model, the count of every option: the products that satisfy the other controls' selections and hold that option. */
export function buildCounts(
  model: ControlModel,
  state: UrlState,
  products: RouteControls['products'],
  onProduct: string[],
): Counts {
  const counts: Counts = [];
  for (const control of model.controls) {
    if (control.kind !== 'checkbox') continue;
    const constraints = model.controls
      .filter((other) => other !== control)
      .map((other) => constraintOf(other, state, onProduct))
      .filter((c): c is (product: Product) => boolean => c !== null);
    const kept = products.filter((product) => constraints.every((test) => test(product)));
    const tally = new Map<string, number>(control.options.map((option) => [option.value, 0]));
    for (const product of kept) {
      for (const item of new Set(itemsAt(product, control.path, onProduct))) {
        if (tally.has(item as string)) tally.set(item as string, tally.get(item as string)! + 1);
      }
    }
    counts.push({ path: control.path, options: control.options.map((option) => ({ value: option.value, count: tally.get(option.value) ?? 0 })) });
  }
  return counts;
}
