// The sections of a route's panel. A heading is stored in the CMS as a row (picklist document, tab Sections) and sits directly above one control; a section is a heading with the controls below it.

import type { Picklist, PicklistScope } from '@/features/product-filtering/core/types/picklist';

/** One stored heading: its title, an optional icon key, and `before`, the control it sits directly above (a field path as the picklist writes it, the same string as a control's `path`). */
export type SectionRow = { title: string; icon?: string; before: string };

/** Per scope, the stored heading rows in the order the owner stored them. */
export type SectionRows = Record<PicklistScope, SectionRow[]>;

/** What a route's sections are computed from: the always-on fields, the scope's picks (together the order the controls are drawn in) and the heading rows. */
export type SectionData = { alwaysOn: string[]; picks: Picklist; rows: SectionRows };

/** One section of a route's panel. `key` is the control its heading sits above ('' for the leading block, which has no heading); `label` is the heading's title ('' for the leading block); `icon` is the stored icon key ('' when there is none); `paths` are the route's controls in the section, in the model's order. */
export type Section = { key: string; label: string; icon: string; paths: string[] };
