"use client";

import { PanelBody } from "./PanelBody";
import { useFilterWrite } from "@/features/product-filtering/state/useFilterWrite";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";
import type { Panel } from "@/features/product-filtering/core/types/panel";

// The panel joined to the URL: the panel to draw, and the one write every click goes through. The sidebar mounts this; so does the sheet.

export function FilterPanel({ model, panel }: { model: ControlModel; panel: Panel }) {
  const write = useFilterWrite(model);
  return <PanelBody panel={panel} onClick={write} />;
}
