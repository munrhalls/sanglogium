"use client";
import { CheckCircle } from "@phosphor-icons/react";

export default function StockIndicator() {
  return (
    <div className="my-2 flex items-center gap-1">
      <span className="rounded-sm text-xl font-bold text-green-700">
        In stock & shipping
      </span>
      <CheckCircle className="text-green-700" size={16} weight="fill" />
    </div>
  );
}
