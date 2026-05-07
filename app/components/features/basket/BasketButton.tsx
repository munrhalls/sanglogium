"use client";

import { ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { NavActionItem } from "@/app/components/layout/header/NavbarActions";
import useBasketStore, { selectTotalItemsCount, selectHasHydrated } from "@/store/basketStore";

export function BasketButton() {
  const itemCount = useBasketStore(selectTotalItemsCount);
  const hasHydrated = useBasketStore(selectHasHydrated);

  const displayCount = hasHydrated ? itemCount : 0;

  return (
    <Link href="/basket" data-testid="basket-button">
      <NavActionItem
        icon={<ShoppingCartIcon size={24} />}
        label="Cart"
        badgeCount={displayCount}
      />
    </Link>
  );
}
