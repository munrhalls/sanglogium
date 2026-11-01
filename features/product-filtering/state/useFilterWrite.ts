"use client";

// The panel's write to the URL: a click becomes the address it leads to (core/rules/clickAddress) and goes through the one shared writer (useAddressWrite),
// which pushes it in a transition without scrolling and starts each change from the address last written.

import { useCallback } from "react";
import { useAddressWrite } from "@/features/product-filtering/state/useAddressWrite";
import { clickAddress } from "@/features/product-filtering/core/rules/clickAddress";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";
import type { PanelClick } from "@/features/product-filtering/core/types/panel";

export function useFilterWrite(model: ControlModel): (click: PanelClick) => void {
  const write = useAddressWrite(model);
  return useCallback((click: PanelClick) => write((contract, address) => clickAddress(contract, address, click)), [write]);
}
