// Builds the URL contract of one control model: a `decode` that reads an address into the model's
// selections and an `encode` that writes a change back into an address. A control's key is its field
// path and its value is the stored value; `sort` and `page` are the two reserved keys (a sort is
// `field:asc|desc`, a filter/sort write always resets `page`). A value that cannot be used is
// ignored: it reads as the parser's default and is never written.
import {
  createLoader,
  createMultiParser,
  createParser,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
} from 'nuqs/server';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type {
  RangeSelection,
  SortSelection,
  UrlContract,
  UrlState,
} from '@/features/product-filtering/core/types/urlState';

const SORT_KEY = 'sort';
const PAGE_KEY = 'page';

const NUMBER = /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i;

/** The `decode`/`encode` pair of one control model. */
export function buildUrlContract(model: ControlModel): UrlContract {
  const parsers: Record<string, any> = {};
  for (const control of model.controls) {
    if (control.kind === 'checkbox') {
      // A selection is a repeated key (?brand=A&brand=B) in the model's option order, each once.
      const values = control.options.map((o) => o.value);
      parsers[control.path] = createMultiParser<string[]>({
        parse: (items) => {
          const selected = values.filter((v) => items.includes(v));
          return selected.length > 0 ? selected : null;
        },
        serialize: (selected) => values.filter((v) => selected.includes(v)),
        eq: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
      }).withDefault([]);
    } else if (control.kind === 'toggle') {
      // On or off; `true` when written.
      parsers[control.path] = parseAsBoolean.withDefault(false);
    } else {
      // Written as `min,max`; a range at the full span is still a filter and is written as it is.
      parsers[control.path] = createParser<RangeSelection>({
        parse: (query) => {
          const parts = query.split(',');
          if (parts.length !== 2 || !NUMBER.test(parts[0]) || !NUMBER.test(parts[1])) return null;
          const min = Number(parts[0]);
          const max = Number(parts[1]);
          return min <= max ? { min, max } : null;
        },
        serialize: ({ min, max }) => `${min},${max}`,
        eq: (a, b) => a.min === b.min && a.max === b.max,
      });
    }
  }
  // `field:asc|desc` where field is one of the model's sorts; no default (absent means the route's own order).
  const fields = model.sorts.map((s) => s.value);
  parsers[SORT_KEY] = createParser<SortSelection>({
    parse: (query) => {
      const at = query.lastIndexOf(':');
      const field = query.slice(0, at);
      const direction = query.slice(at + 1);
      return at > 0 && fields.includes(field) && (direction === 'asc' || direction === 'desc')
        ? { field, direction }
        : null;
    },
    serialize: ({ field, direction }) => `${field}:${direction}`,
    eq: (a, b) => a.field === b.field && a.direction === b.direction,
  });

  const load = createLoader(parsers);
  const write = createSerializer({ ...parsers, [PAGE_KEY]: parseAsInteger });
  return {
    decode: (input) => load(input) as UrlState,
    encode: (base, patch) => write(base, { ...patch, [PAGE_KEY]: null }),
  };
}
