import type {
  ControlsByCategory,
  DerivableProduct,
  Scalar,
} from '@/features/product-filtering/core/types/controlsAndOptions';

/** Derives a control (range or checkbox with options) per picklist field, per category, from product field values. */
export function deriveControlsAndOptions(
  products: DerivableProduct[],
  picklist: string[],
): ControlsByCategory {
  const lists = new Map<string, Map<string, Scalar[]>>();

  for (const product of products) {
    let category = lists.get(product.category);
    if (!category) {
      category = new Map();
      lists.set(product.category, category);
      for (const name of picklist) category.set(name, []);
    }
    for (const name of picklist) {
      const raw = product.fields[name];
      if (raw === undefined) continue;
      const items = Array.isArray(raw) ? raw : [raw];
      const list = category.get(name) as Scalar[];
      for (const item of items) {
        list.push(typeof item === 'object' ? item.id : item);
      }
    }
  }

  const result: ControlsByCategory = {};
  for (const [categoryName, fields] of lists) {
    const controls: Record<string, ControlsByCategory[string][string]> = {};
    for (const [name, list] of fields) {
      if (list.length === 0) continue;
      if (list.every((v) => typeof v === 'number')) {
        let min = list[0] as number;
        let max = list[0] as number;
        for (const v of list) {
          const n = v as number;
          if (n < min) min = n;
          if (n > max) max = n;
        }
        controls[name] = { control: 'range', min, max };
      } else {
        controls[name] = { control: 'checkbox', options: [...new Set(list)] };
      }
    }
    result[categoryName] = controls;
  }
  return result;
}
