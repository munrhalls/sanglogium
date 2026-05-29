"use client";

import Link from "next/link";

export default function CheckoutError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-gray-600">
        We could not complete your checkout. Please try again or return to your basket.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Try again
        </button>
        <Link
          href="/basket"
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          Back to basket
        </Link>
      </div>
    </div>
  );
}
