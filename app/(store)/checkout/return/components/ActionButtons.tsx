"use client";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Link
        href="/account/orders"
        className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        View My Orders
        <ArrowRight className="ml-2" size={20} />
      </Link>
      <Link
        href="/"
        className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
