"use client";

import { useMemo } from "react";
import { SortSelect } from "./SortSelect";
import { useAddressWrite } from "@/features/product-filtering/state/useAddressWrite";
import { buildSortOptions } from "@/features/product-filtering/core/rules/buildSortOptions";
import { currentSortId } from "@/features/product-filtering/core/rules/currentSortId";
import { sortAddress } from "@/features/product-filtering/core/rules/sortAddress";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";
import type { SortSelection } from "@/features/product-filtering/core/types/urlState";

// The sort menu joined to the URL: the entries of the model's sorts, the one the URL's sort stands for, and the one shared writer every choice goes through.
// The host places it; the product count and the filter sheet's trigger are not its business.

export function SortControl({ model, sort }: { model: ControlModel; sort: SortSelection | null }) {
  const write = useAddressWrite(model);
  const options = useMemo(() => buildSortOptions(model), [model]);
  return (
    <SortSelect
      options={options}
      value={currentSortId(options, sort)}
      onChange={(id) => write((contract, address) => sortAddress(contract, address, options, id))}
    />
  );
}
