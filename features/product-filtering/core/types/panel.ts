// The filter panel as the views draw it: what is shown, what a click means, and how a long option list is windowed. The rules that make them are in core/rules/ (buildPanel, clickPatch, windowOptions).

import type { RangeSelection } from '@/features/product-filtering/core/types/urlState';

/** One option the shopper can click. `ticked` is whether the state selects it; `count` is above 0 (an option with no product is not in the panel). */
export type PanelOption = { value: string; text: string; count: number; ticked: boolean };

/** One control as drawn. A checkbox holds only the options that have a product; a toggle is on or off; a range holds its span and the selection (null when none). */
export type PanelControl =
  | { path: string; kind: 'checkbox'; label: string; options: PanelOption[] }
  | { path: string; kind: 'toggle'; label: string; on: boolean }
  | { path: string; kind: 'range'; label: string; span: { min: number; max: number }; selected: RangeSelection | null };

/** One section as drawn: its heading (label and icon empty for the leading block, which has none) and its controls in order. */
export type PanelSection = { key: string; label: string; icon: string; controls: PanelControl[] };

/** The whole panel: the sections that have something to draw, in order. */
export type Panel = { sections: PanelSection[] };

/** What the shopper did to one control: set an option, set a toggle, or commit a range. */
export type PanelClick =
  | { kind: 'option'; path: string; value: string; checked: boolean }
  | { kind: 'toggle'; path: string; on: boolean }
  | { kind: 'range'; path: string; min: number; max: number };

/** How one long option list is drawn: the options shown in place, the ticked options kept apart when the rest is hidden, and the button there is (null when none). */
export type OptionWindow = { head: PanelOption[]; pinned: PanelOption[]; toggle: 'more' | 'less' | null };
