// Pure scan of a slice's products: per filterAttributes path, the kinds of value
// stored, how many products carry it, its distinct values and its numeric span.

import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import type { FieldInventory, ObservedKind } from '@/features/product-filtering/core/types/facetProjection';

interface Acc {
  kinds: Set<ObservedKind>;
  count: number;
  values: Set<string>;
  min: number | null;
  max: number | null;
}

export function fieldInventory(products: RawProduct[]): FieldInventory {
  const map = new Map<string, Acc>();

  const record = (acc: Acc, v: unknown) => {
    if (typeof v === 'number' && Number.isFinite(v)) {
      acc.min = acc.min === null || v < acc.min ? v : acc.min;
      acc.max = acc.max === null || v > acc.max ? v : acc.max;
    } else if (typeof v === 'string' || typeof v === 'boolean') {
      acc.values.add(String(v));
    }
  };

  const walk = (obj: Record<string, unknown>, prefix: string) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue;
      const attribute = prefix ? `${prefix}.${key}` : key;
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'number' && !Number.isFinite(value))
      ) continue;

      let acc = map.get(attribute);
      if (!acc) {
        acc = { kinds: new Set(), count: 0, values: new Set(), min: null, max: null };
        map.set(attribute, acc);
      }
      acc.count += 1;

      if (Array.isArray(value)) {
        acc.kinds.add('array');
        for (const el of value) record(acc, el);
      } else if (typeof value === 'object') {
        acc.kinds.add('object');
        walk(value as Record<string, unknown>, attribute);
      } else {
        acc.kinds.add(typeof value as ObservedKind);
        record(acc, value);
      }
    }
  };

  for (const product of products) {
    if (product.filterAttributes && typeof product.filterAttributes === 'object') {
      walk(product.filterAttributes, '');
    }
  }

  const result: FieldInventory = {};
  for (const attribute of [...map.keys()].sort()) {
    const acc = map.get(attribute)!;
    result[attribute] = {
      attribute,
      kinds: [...acc.kinds].sort(),
      count: acc.count,
      values: [...acc.values].sort(),
      min: acc.min,
      max: acc.max,
    };
  }
  return result;
}
