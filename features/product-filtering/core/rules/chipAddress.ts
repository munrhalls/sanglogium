import { clearPatch, removePatch } from '@/features/product-filtering/core/rules/removePatch';
import type { Chip } from '@/features/product-filtering/core/types/chips';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { UrlContract } from '@/features/product-filtering/core/types/urlState';

// The addresses the chips lead to, written by the URL contract over the given address: every other key stays, `page` is dropped.
// `removeChipAddress` takes one selection out of the address; `clearAllAddress` takes out every selection of the model's controls. As in clickAddress,
// a caller that acts again before the page shows the last address passes the last address it wrote.

export function removeChipAddress(contract: UrlContract, address: string, chip: Chip): string {
  return contract.encode(address, removePatch(contract.decode(address), chip));
}

export function clearAllAddress(contract: UrlContract, address: string, model: ControlModel): string {
  return contract.encode(address, clearPatch(model));
}
