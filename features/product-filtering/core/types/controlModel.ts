// The control model: what one route's answer (RouteControls) becomes for the steps that read it (URL keys, products, counts, drawing).
// It holds only what those steps need. The route's products are not in it: the counts read them from the answer.

/** One option of a checkbox control: `value` is the value as stored (it is also the URL value), `text` is what the shopper reads. */
export type ControlOption = { value: string; text: string };

/** One control. `path` is the field path as the picklist writes it (the URL key follows it); `label` is the control's name. The kind follows the type of the control's values: text is a checkbox, true/false a toggle, numbers a range. A toggle is on or off; a range is its lowest and highest value. */
export type Control =
  | { path: string; kind: 'checkbox'; label: string; options: ControlOption[] }
  | { path: string; kind: 'toggle'; label: string }
  | { path: string; kind: 'range'; label: string; span: { min: number; max: number } };

/** One sort the shopper can choose: `value` is the field path (the URL value), `text` is the sort's name. Directions are not part of the model. */
export type SortChoice = { value: string; text: string };

/** The control model of one route: its controls and its sorts, each in the order of the answer. */
export type ControlModel = { controls: Control[]; sorts: SortChoice[] };
