// Human sign-off ledger for option-set divergences between the frozen declared
// snapshot and product data. `added` = values data carries that were never
// declared (new options appear in filters); `dropped` = declared values no
// product carries (options disappear). Recording a divergence marks it
// reviewed; any NEW divergence still trips the parity law — silence traces to
// recorded verdicts, never a mute. Dropped entries double as the
// fill-missing-data queue: adding products with the value resolves them
// naturally. Temporary migration artifact — deleted with the declared set and
// the snapshot.
export const ACCEPTED_OPTION_DELTAS: Record<string, { added?: string[]; dropped?: string[] }> = {
  'connectivity': { added: ['true-wireless'] },
  'inputs': { added: ['bluetooth'] },
};
