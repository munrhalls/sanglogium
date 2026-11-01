// The shapes of the URL contract (url/controlUrl.ts): what a page address is read into and what a change to it is written from.

/** A range selection: the lowest and highest value the shopper wants, both included. */
export type RangeSelection = { min: number; max: number };

/** A sort selection: a field of the model's sorts and a direction. */
export type SortSelection = { field: string; direction: 'asc' | 'desc' };

/** One key's selection: the chosen option values of a checkbox (the model's option order, none repeated), on or off for a toggle, a range, a sort; null when nothing is selected (a checkbox is [] and a toggle false, never null, when read). */
export type UrlValue = string[] | boolean | RangeSelection | SortSelection | null;

/** What an address says: one entry per control path and one for `sort`; a key the address does not carry holds its default. */
export type UrlState = Record<string, UrlValue>;

/** A change to write: only the keys named change; null removes a key; a default (an empty checkbox, an off toggle) also removes it. */
export type UrlPatch = Record<string, UrlValue>;

/** An address in any of the forms the callers hold: a query string, a URLSearchParams, or the object Next gives a page as `searchParams`. */
export type UrlInput = string | URLSearchParams | Record<string, string | string[] | undefined>;

/** The contract of one control model. `decode` never throws: a value it cannot use is ignored. `encode` takes a query string (`?a=1` or empty) as the base, keeps every key it does not own, always removes `page`, and returns a query string (`?...` or empty). */
export type UrlContract = {
  decode: (input: UrlInput) => UrlState;
  encode: (base: string, patch: UrlPatch) => string;
};
