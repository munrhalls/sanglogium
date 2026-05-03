"use client";

import { ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { NavActionItem } from "@/app/components/layout/header/NavbarActions";
import useBasketStore, { selectTotalItemsCount } from "@/store/basketStore";

export function BasketButton() {
  const itemCount = useBasketStore(selectTotalItemsCount);

  return (
    <Link href="/basket" data-testid="basket-button">
      <NavActionItem
        icon={<ShoppingCartIcon size={24} />}
        label="Cart"
        badgeCount={itemCount}
      />
    </Link>
  );
}
