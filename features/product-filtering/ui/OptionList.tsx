"use client";

import { useState } from "react";
import { Checkbox } from "./Checkbox";
import { windowOptions } from "@/features/product-filtering/core/rules/windowOptions";
import type { PanelOption } from "@/features/product-filtering/core/types/panel";

// One checkbox control's options as the window rule says: the options in place, the ticked ones kept apart while the rest is hidden, and the button.
// The only state here is whether the list is expanded; ticking an option moves nothing.

export function OptionList({
  name,
  options,
  onSet,
}: {
  name: string;
  options: PanelOption[];
  onSet: (value: string, checked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { head, pinned, toggle } = windowOptions(options, expanded);
  const row = (option: PanelOption) => (
    <Checkbox
      key={option.value}
      name={name}
      value={option.value}
      checked={option.ticked}
      label={option.text}
      count={option.count}
      onChange={() => onSet(option.value, !option.ticked)}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {head.map(row)}
      {pinned.length > 0 && <div className="flex flex-col gap-2 border-t border-border-secondary pt-2">{pinned.map(row)}</div>}
      {toggle && (
        <button
          type="button"
          onClick={() => setExpanded(toggle === "more")}
          className="self-start type-caption text-accent-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          {toggle === "more" ? "Show more" : "Show less"}
        </button>
      )}
    </div>
  );
}
