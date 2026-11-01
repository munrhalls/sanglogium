"use client";

import { OptionList } from "./OptionList";
import type { PanelClick, PanelControl } from "@/features/product-filtering/core/types/panel";

// A checkbox control as drawn: its name and its option list. A click on an option is reported, never written here.

export function CheckboxField({
  control,
  onClick,
}: {
  control: Extract<PanelControl, { kind: "checkbox" }>;
  onClick: (click: PanelClick) => void;
}) {
  return (
    <div role="group" aria-label={control.label} className="flex flex-col gap-3">
      <span className="type-overline">{control.label}</span>
      <OptionList
        name={control.path}
        options={control.options}
        onSet={(value, checked) => onClick({ kind: "option", path: control.path, value, checked })}
      />
    </div>
  );
}
