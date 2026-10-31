import type { OptionValue, RawMap } from '@/features/product-filtering/core/types/optionMaps';

/** The picklist as the raw map needs it: the always-on fields are product paths, the picks are filterAttributes paths. */
type Picklist = { alwaysOn: string[]; picks: Record<string, string[]> };
type Product = { filterAttributes?: Record<string, unknown>; [key: string]: unknown };

const at = (object: unknown, path: string): unknown => path.split('.').reduce<any>((value, key) => value?.[key], object);
const rank = (v: OptionValue) => (typeof v === 'number' ? 0 : typeof v === 'boolean' ? 1 : 2);
const compare = (a: OptionValue, b: OptionValue) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0);

// A value is text, a number or true/false. Missing, null, blank text and an empty list are no value, so never an option. A list gives each item.
function valuesOf(raw: unknown, where: string): OptionValue[] {
  const found: OptionValue[] = [];
  for (const item of Array.isArray(raw) ? raw : [raw]) {
    if (item === undefined || item === null || (typeof item === 'string' && !item.trim())) continue;
    if (typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean') {
      throw new Error(`${where}: a value must be text, a number or true/false, got ${JSON.stringify(item)}`);
    }
    found.push(item);
  }
  return found;
}

/** Per slice and per control (the always-on fields plus the slice's picks): the sorted distinct values the slice's products hold. */
export function buildRawMap(picklist: Picklist, slices: Record<string, Product[]>): RawMap {
  return Object.fromEntries(
    Object.entries(picklist.picks).map(([slice, picks]) => {
      const products = slices[slice];
      if (!products) throw new Error(`no products for slice "${slice}"`);
      const control = (path: string, root: (p: Product) => unknown): [string, OptionValue[]] => [
        path,
        [...new Set(products.flatMap((p) => valuesOf(at(root(p), path), `${slice}: ${path}`)))].sort(compare),
      ];
      return [slice, Object.fromEntries([...picklist.alwaysOn.map((path) => control(path, (p) => p)), ...picks.map((path) => control(path, (p) => p.filterAttributes))])];
    }),
  );
}
