// The narrowing builder: a control model and a URL state become the `where`, `order` and `params` the host embeds in its own products request. The two `narrow_` rule: every param name starts with `narrow_`.
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Narrowing } from '@/features/product-filtering/core/types/narrowing';
import type { UrlState } from '@/features/product-filtering/core/types/urlState';
import { BRAND_NAME } from './routeMapData';

/** Newest first; `_id` last so the order is total and paging is stable. */
const DEFAULT_ORDER = '_createdAt desc, _id asc';

/** A path read from the product itself when `onProduct` names it, else from `filterAttributes`. */
function readAt(path: string, onProduct: string[]): string {
  if (onProduct.includes(path)) return path === 'brand' ? BRAND_NAME : path;
  return `filterAttributes.${path}`;
}

/** A product holds a value alone or in a list: `test` runs on both shapes. */
function holds(e: string, test: (x: string) => string): string {
  return `(${test(e)} || count((${e})[${test('@')}]) > 0)`;
}

/** Turns a control model and a URL state into the three parts the host's products request embeds. */
export function buildNarrowing(model: ControlModel, state: UrlState, onProduct: string[]): Narrowing {
  const parts: string[] = [];
  const params: Record<string, string[] | number> = {};

  model.controls.forEach((control, i) => {
    const value = state[control.path];
    const e = readAt(control.path, onProduct);
    if (control.kind === 'checkbox' && Array.isArray(value) && value.length > 0) {
      params[`narrow_${i}_in`] = value;
      parts.push(holds(e, (x) => `${x} in $narrow_${i}_in`));
    } else if (control.kind === 'toggle' && value === true) {
      parts.push(holds(e, (x) => `${x} == true`));
    } else if (
      control.kind === 'range' &&
      typeof value === 'object' &&
      value !== null &&
      'min' in value &&
      'max' in value &&
      typeof value.min === 'number' &&
      typeof value.max === 'number'
    ) {
      params[`narrow_${i}_min`] = value.min;
      params[`narrow_${i}_max`] = value.max;
      parts.push(holds(e, (x) => `(${x} >= $narrow_${i}_min && ${x} <= $narrow_${i}_max)`));
    }
  });

  const where = parts.length > 0 ? parts.map((p) => `(${p})`).join(' && ') : 'true';

  const sort = state.sort;
  let order = DEFAULT_ORDER;
  if (
    typeof sort === 'object' &&
    sort !== null &&
    'field' in sort &&
    'direction' in sort &&
    typeof sort.field === 'string' &&
    (sort.direction === 'asc' || sort.direction === 'desc')
  ) {
    const e = readAt(sort.field, onProduct);
    order = `defined(${e}) desc, coalesce(lower(${e}), ${e}) ${sort.direction}, ${DEFAULT_ORDER}`;
  }

  return { where, order, params };
}
