// What a listing route needs from the filter feature: the panel and the pieces drawn from it, and the narrowing the host's products request embeds.

import type { Chip } from '@/features/product-filtering/core/types/chips';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Narrowing } from '@/features/product-filtering/core/types/narrowing';
import type { Panel } from '@/features/product-filtering/core/types/panel';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { SortSelection } from '@/features/product-filtering/core/types/urlState';

/** What the views draw, all from one decoded URL state: the control model (the clients build the URL contract from it), the panel, the chips and the current sort. Plain data, safe to pass to client components. */
export type FilterPanelData = { scope: PicklistScope; model: ControlModel; panel: Panel; chips: Chip[]; sort: SortSelection | null };

/** The data above and the narrowing of the same state, which the server uses for its products request and does not pass on to the views. */
export type FilterPanelResult = FilterPanelData & { narrowing: Narrowing };
