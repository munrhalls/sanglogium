"use client";

import { useEffect, useRef, useState } from "react";
import { DualRangeSlider } from "./DualRangeSlider";
import { formatRangeValue } from "@/features/product-filtering/core/rules/formatRangeValue";
import type { PanelClick, PanelControl } from "@/features/product-filtering/core/types/panel";
import type { RangeSelection } from "@/features/product-filtering/core/types/urlState";

// A range as the shopper drags it. The thumbs follow the pointer at once (a local draft); the selection is reported once, when the pointer or a key is released,
// because each report is a round trip to the server. The draft is dropped when the address shows another selection (Back, a shared link).

export function RangeField({
  control,
  onClick,
}: {
  control: Extract<PanelControl, { kind: "range" }>;
  onClick: (click: PanelClick) => void;
}) {
  const committed = control.selected ?? control.span;
  const [draft, setDraft] = useState<RangeSelection | null>(null);
  const sent = useRef("");

  useEffect(() => {
    setDraft(null);
    sent.current = "";
  }, [committed.min, committed.max]);

  const shown = draft ?? committed;
  const commit = () => {
    if (!draft) return;
    const key = `${draft.min},${draft.max}`;
    if (key === sent.current || (draft.min === committed.min && draft.max === committed.max)) return;
    sent.current = key;
    onClick({ kind: "range", path: control.path, min: draft.min, max: draft.max });
  };

  return (
    <div className="flex flex-col gap-2" onPointerUp={commit} onKeyUp={commit}>
      <span className="type-overline">{control.label}</span>
      <DualRangeSlider
        min={control.span.min}
        max={control.span.max}
        minValue={shown.min}
        maxValue={shown.max}
        minLabel={formatRangeValue(control.path, shown.min)}
        maxLabel={formatRangeValue(control.path, shown.max)}
        onChangeMin={(min) => setDraft({ min, max: shown.max })}
        onChangeMax={(max) => setDraft({ min: shown.min, max })}
      />
    </div>
  );
}
