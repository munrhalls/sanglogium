"use client";

import { useEffect } from "react";
import { useBasketStore } from "@/features/basket";

export function ClearBoughtBasket() {
  useEffect(() => {
    useBasketStore.getState().clear();
  }, []);
  return null;
}
