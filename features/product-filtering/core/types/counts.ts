// The counts of one control model under one URL state: how many products each option of each checkbox control stands for.

/** One entry per checkbox control of the model, in the model's order (a toggle and a range have none). `options` lists every option of that control as the model holds it, in the model's order, zero counts included; `value` is the option's value. */
export type Counts = { path: string; options: { value: string; count: number }[] }[];
