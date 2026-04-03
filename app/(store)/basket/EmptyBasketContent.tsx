"use client";
import { ArrowLeftIcon, ShoppingCartIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function EmptyBasketContent() {
  const router = useRouter();
  return (
    <div className="card-base flex flex-col items-center justify-center p-8 lg-desktop:p-12 lg-touch:p-12">
      <ShoppingCartIcon className="mb-6 text-secondary-600" size={64} />
      <h2 className="type-section-sub text-center">Your basket is empty</h2>
      <p className="type-body text-body mb-8 max-w-md text-center">
        Looks like you haven&apos;t added any products to your basket yet.
        Browse our collection to find something you&apos;ll love.
      </p>
      <button
        type="button"
        onClick={() => router.back()}
        className="btn-primary flex items-center gap-2 py-3 px-6"
      >
        <ArrowLeftIcon size={16} />
        Browse Products
      </button>
    </div>
  );
}
