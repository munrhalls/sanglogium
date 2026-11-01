// The active selections of a route as chips: one per selected option, per toggle that is on and per range that is set. A chip says what is selected and carries what is needed to take it out.

/** One active selection. `id` is unique among a route's chips. `label` is the control's name; `text` is the selection ('' for a toggle): the option's text, or the range as "low to high". */
export type Chip =
  | { id: string; kind: 'option'; path: string; value: string; label: string; text: string }
  | { id: string; kind: 'toggle'; path: string; label: string; text: string }
  | { id: string; kind: 'range'; path: string; label: string; text: string };
