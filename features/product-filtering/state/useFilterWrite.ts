"use client";

// The panel's one write to the URL. A click becomes the address it leads to (core/rules/clickAddress, on the URL contract of the model) and the address is pushed:
// in a transition, so the old page stays visible while the new one renders; without scrolling; as one history entry per click, so Back undoes it.
// A push commits later than the click. Until the page shows the address this hook last wrote, the next click starts from that address and not from the page's older one,
// so two quick clicks add up instead of the second undoing the first. Nothing else is kept.

import { startTransition, useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildUrlContract } from "@/features/product-filtering/url/controlUrl";
import { clickAddress } from "@/features/product-filtering/core/rules/clickAddress";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";
import type { PanelClick } from "@/features/product-filtering/core/types/panel";

export function useFilterWrite(model: ControlModel): (click: PanelClick) => void {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const current = query ? `?${query}` : "";
  const contract = useMemo(() => buildUrlContract(model), [model]);
  const written = useRef<string | null>(null);

  useEffect(() => {
    written.current = null;
  }, [current]);

  return useCallback(
    (click: PanelClick) => {
      const next = clickAddress(contract, written.current ?? current, click);
      written.current = next;
      startTransition(() => router.push(`${pathname}${next}`, { scroll: false }));
    },
    [contract, current, pathname, router],
  );
}
