"use client";
import { Package } from "@phosphor-icons/react";

export function WhatHappensNext() {
  return (
    <div className="mb-8 rounded-lg border border-gray-200 p-6">
      <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
        <Package className="mr-2" size={24} />
        What happens next?
      </h2>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start">
          <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
            1
          </span>
          <span>You&apos;ll receive an order confirmation email shortly</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
            2
          </span>
          <span>
            We&apos;ll process and pack your order within 1-2 business days
          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
            3
          </span>
          <span>
            You&apos;ll receive a shipping notification with tracking details
          </span>
        </li>
      </ul>
    </div>
  );
}
