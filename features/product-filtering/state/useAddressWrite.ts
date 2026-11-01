"use client";

// The one write to the URL for every part of the filter UI (the panel's clicks, the chips' removals). A change becomes the address it leads to and the address is pushed:
// in a transition, so the old page stays visible while the new one renders; without scrolling; as one history entry per change, so Back undoes it.
// A push commits later than the click. Until the page shows the address last written, the next change starts from it and not from the page's older address,
// so quick changes add up instead of undoing each other. That address is one fact about the one URL, so it is kept once for the page, not once per hook:
// a chip clicked right after a panel click still starts from the panel's address.

import { startTransition, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildUrlContract } from "@/features/product-filtering/url/controlUrl";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";
import type { UrlContract } from "@/features/product-filtering/core/types/urlState";

/** A change: the address it leads to, from the address it starts at. */
export type AddressChange = (contract: UrlContract, address: string) => string;

let lastWritten: string | null = null;

export function useAddressWrite(model: ControlModel): (change: AddressChange) => void {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const current = query ? `?${query}` : "";
  const contract = useMemo(() => buildUrlContract(model), [model]);

  useEffect(() => {
    lastWritten = null;
  }, [current]);

  return useCallback(
    (change: AddressChange) => {
      const next = change(contract, lastWritten ?? current);
      lastWritten = next;
      startTransition(() => router.push(`${pathname}${next}`, { scroll: false }));
    },
    [contract, current, pathname, router],
  );
}
