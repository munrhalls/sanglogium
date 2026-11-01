"use client";

import { useRef } from "react";
import { PanelSectionBlock } from "./PanelSectionBlock";
import { SectionRail, type RailTile } from "./SectionRail";
import type { Panel, PanelClick } from "@/features/product-filtering/core/types/panel";

// The panel as drawn: the rail (one tile per heading, none when no heading is authored) beside the scrolling sections.
// A tile scrolls this panel's own scroll box to its heading, found inside the box (never by a page-wide id: the sidebar and the sheet are mounted at once)
// and by exact offset (never scrollIntoView, which also moves the product grid).
// The host gives this component a bounded height to scroll in.

export function PanelBody({ panel, onClick }: { panel: Panel; onClick: (click: PanelClick) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const tiles: RailTile[] = panel.sections.filter((section) => section.label !== "").map((section) => ({ key: section.key, label: section.label, icon: section.icon }));

  const jump = (key: string) => {
    const scroller = box.current;
    if (!scroller) return;
    const target = Array.from(scroller.querySelectorAll<HTMLElement>("[data-section-key]")).find((element) => element.dataset.sectionKey === key);
    if (!target) return;
    scroller.scrollBy({ top: target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 16, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-0 flex-1">
      {tiles.length > 0 && <SectionRail tiles={tiles} onSelect={jump} />}
      <div
        ref={box}
        className="flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-12"
      >
        {panel.sections.map((section) => (
          <PanelSectionBlock key={section.key} section={section} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}
