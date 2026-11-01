"use client";

import { SelectionChips } from "./SelectionChips";
import { useAddressWrite } from "@/features/product-filtering/state/useAddressWrite";
import { clearAllAddress, removeChipAddress } from "@/features/product-filtering/core/rules/chipAddress";
import type { Chip } from "@/features/product-filtering/core/types/chips";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";

// The chips joined to the URL: the chips to draw, and the one shared write every removal goes through. The host places it where the active filters are shown.

export function ActiveFilters({ model, chips }: { model: ControlModel; chips: Chip[] }) {
  const write = useAddressWrite(model);
  return (
    <SelectionChips
      chips={chips}
      onRemove={(chip) => write((contract, address) => removeChipAddress(contract, address, chip))}
      onClear={() => write((contract, address) => clearAllAddress(contract, address, model))}
    />
  );
}
