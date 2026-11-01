"use client";

import { CheckboxField } from "./CheckboxField";
import { RangeField } from "./RangeField";
import { ToggleField } from "./ToggleField";
import type { PanelClick, PanelSection } from "@/features/product-filtering/core/types/panel";

// A section as drawn: its heading (the leading block has none) and its controls. `data-section-key` is how the rail finds it inside its own panel.

export function PanelSectionBlock({ section, onClick }: { section: PanelSection; onClick: (click: PanelClick) => void }) {
  return (
    <section data-section-key={section.key} className="flex flex-col gap-6 border-b border-border-secondary p-6 last:border-b-0">
      {section.label !== "" && <h3 className="type-body font-semibold text-text-primary">{section.label}</h3>}
      {section.controls.map((control) => {
        if (control.kind === "checkbox") return <CheckboxField key={control.path} control={control} onClick={onClick} />;
        if (control.kind === "toggle") return <ToggleField key={control.path} control={control} onClick={onClick} />;
        return <RangeField key={control.path} control={control} onClick={onClick} />;
      })}
    </section>
  );
}
