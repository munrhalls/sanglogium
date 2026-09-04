/**
 * Turn a raw facet slug into a human-readable label.
 *
 * Filter option values are stored as lowercase slugs (`over-ear`,
 * `planar-magnetic`, `audio-electronics`, `usb-c`). Every filter surface —
 * the sidebar option lists (F5) and the active-filter chips (F6) — must show
 * the same normal-case, space-separated form. Brand labels are the one
 * exception: they come from Sanity's `brand.name` and are passed through
 * untouched by the callers.
 *
 * Rules:
 *  - split on hyphens and whitespace
 *  - known acronyms are upper-cased (`dac` -> `DAC`, `usb` -> `USB`)
 *  - tokens containing a digit are kept verbatim (`3.5mm`, `4.4mm`, `2-pin`)
 *  - every other token is capitalised (`over` -> `Over`)
 */

const ACRONYMS = new Set([
  'dac',
  'amp',
  'usb',
  'rca',
  'xlr',
  'mmcx',
  'dap',
  'us',
  'eu',
  'uk',
  'hd',
  'led',
  'anc',
]);

const capitalize = (word: string): string =>
  word.length === 0 ? word : word[0].toUpperCase() + word.slice(1);

const humanizeToken = (token: string): string => {
  const lower = token.toLowerCase();
  if (ACRONYMS.has(lower)) return lower.toUpperCase();
  if (/\d/.test(token)) return token; // "3.5mm", "4-pin", "2.5mm"
  return capitalize(lower);
};

export function humanizeFacetValue(value: string): string {
  if (!value) return value;
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(humanizeToken)
    .join(' ');
}
