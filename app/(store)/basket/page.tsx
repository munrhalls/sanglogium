import { Loader } from "@/features/basket";
import { BasketCheckout } from "@/features/checkout";
import { Suspense } from "react";
import Shelf from "@/platform/design/ui/Shelf";

export default function BasketPage() {
  return (
    <Shelf data-testid="basket-page" className="py-20">
      <div className="mt-12 mb-8 text-center lg:text-left">
        <h1 className="type-section-hed uppercase tracking-widest">
          Basket
        </h1>
      </div>
      <Suspense fallback={<Loader />}>
        <BasketCheckout />
      </Suspense>
    </Shelf>
  );
}
