import { ArrowLeft, ShoppingCart } from "@phosphor-icons/react";
import Link from "next/link";

export default function EmptyBasketContent() {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm bg-white p-12 shadow-sm">
      <ShoppingCart className="mb-6 text-gray-400" size={80} />
      <h2 className="text-2xl font-medium text-gray-800">
        Your basket is empty
      </h2>
      <p className="mb-8 mt-3 max-w-md text-center text-gray-600">
        Looks like you haven&apos;t added any products to your basket yet.
        Browse our collection to find something you&apos;ll love.
      </p>
      <Link
        href="/products"
        className="flex items-center gap-2 rounded-sm bg-black px-8 py-3 text-white transition-colors hover:bg-gray-800"
      >
        <ArrowLeft size={16} />
        Browse Products
      </Link>
    </div>
  );
}
