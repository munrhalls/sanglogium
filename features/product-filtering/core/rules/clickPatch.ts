import type { PanelClick } from '@/features/product-filtering/core/types/panel';
import type { UrlPatch, UrlState } from '@/features/product-filtering/core/types/urlState';

// What a click writes: a patch for the URL contract's `encode`. Only the clicked control's key is in it, so every other key of the address is left as it is.
// An option click sets the option in or out of the control's selection (setting what is already set changes nothing); a toggle click sets it on or off;
// a range click commits {min, max} as it is, also at the full span (a range at full span is still a filter). The state is read, never changed.

export function clickPatch(state: UrlState, click: PanelClick): UrlPatch {
  if (click.kind === 'toggle') return { [click.path]: click.on };
  if (click.kind === 'range') return { [click.path]: { min: click.min, max: click.max } };
  const now = state[click.path];
  const current = Array.isArray(now) ? now.filter((value): value is string => typeof value === 'string') : [];
  if (click.checked) return { [click.path]: current.includes(click.value) ? current : [...current, click.value] };
  return { [click.path]: current.filter((value) => value !== click.value) };
}
