import { clickPatch } from '@/features/product-filtering/core/rules/clickPatch';
import type { PanelClick } from '@/features/product-filtering/core/types/panel';
import type { UrlContract } from '@/features/product-filtering/core/types/urlState';

// The address a click leads to: the selections are read from `address`, the click is applied to them, and the result is written back into `address` by the URL contract.
// Every other key of the address stays as it is and `page` is dropped (the contract's rule). A caller that clicks again before the page shows the last address passes the
// last address it wrote, never the page's older one, so the clicks add up instead of undoing each other.

export function clickAddress(contract: UrlContract, address: string, click: PanelClick): string {
  return contract.encode(address, clickPatch(contract.decode(address), click));
}
