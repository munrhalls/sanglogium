"use client";

import { Checkbox } from "./Checkbox";
import type { PanelClick, PanelControl } from "@/features/product-filtering/core/types/panel";

// A toggle control as drawn: one box with its name. A click reports the new state, never writes it here.

export function ToggleField({
  control,
  onClick,
}: {
  control: Extract<PanelControl, { kind: "toggle" }>;
  onClick: (click: PanelClick) => void;
}) {
  return (
    <Checkbox
      name={control.path}
      value="true"
      checked={control.on}
      label={control.label}
      onChange={() => onClick({ kind: "toggle", path: control.path, on: !control.on })}
    />
  );
}
