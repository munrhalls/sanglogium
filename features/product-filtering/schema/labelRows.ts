// The rows of the filterLabels document, and the one way the Studio input changes them. No imports: a studio-plane module the proof also runs.

/** One stored row. No value: the control's own name. With a value: that option, written exactly as stored. */
export type LabelRow = { _key: string; _type: "label"; field?: string; value?: string; text?: string };

const names = (row: LabelRow, field: string, value: string) => row.field === field && (row.value ?? "") === value;

/** The wording stored for a control's name (value "") or for one option, or "" when there is none. */
export const rowText = (rows: LabelRow[], field: string, value: string): string => rows.find((row) => names(row, field, value))?.text ?? "";

/**
 * The rows after the owner typed `text` at a line (a control's name, or one of its options): that line's row is replaced or added,
 * or removed when the text is blank. Every other row stays as it is.
 */
export function setRowText(rows: LabelRow[], field: string, value: string, text: string): LabelRow[] {
  if (!text.trim()) return rows.filter((row) => !names(row, field, value));
  const first = rows.find((row) => names(row, field, value));
  const row: LabelRow = { _key: first?._key ?? Math.random().toString(36).slice(2, 14), _type: "label", field, text, ...(value ? { value } : {}) };
  if (!first) return [...rows, row];
  return rows.flatMap((r) => (r === first ? [row] : names(r, field, value) ? [] : [r]));
}
