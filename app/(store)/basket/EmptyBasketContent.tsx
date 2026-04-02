import { ArrowLeft, ShoppingCart } from "@phosphor-icons/react";
import Link from "next/link";

export default function EmptyBasketContent() {
  return (
    <div className="card-base flex flex-col items-center justify-center p-8 lg-desktop:p-12 lg-touch:p-12">
      <ShoppingCart className="mb-6 text-secondary-600" size={64} />
      <h2 className="type-section-sub text-center">Your basket is empty</h2>
      <p className="type-body text-body mb-8 max-w-md text-center">
        Looks like you haven&apos;t added any products to your basket yet.
        Browse our collection to find something you&apos;ll love.
      </p>
      <Link href="/products" className="btn-primary flex items-center gap-2 py-3 px-6">
        <ArrowLeft size={16} />
        Browse Products
      </Link>
    </div>
  );
}
