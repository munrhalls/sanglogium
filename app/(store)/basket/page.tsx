import BasketManager from "@/app/components/features/basket/BasketManager";
import { Suspense } from "react";
import Loader from "@/app/components/common/Loader";
import Shelf from "@/app/components/layout/general/Shelf";

export default function BasketPage() {
  return (
    <Shelf data-testid="basket-page">
      <div className="mt-12 mb-8 text-center lg:text-left">
        <h1 className="type-section-hed uppercase tracking-widest">
          Basket
        </h1>
      </div>
      <Suspense fallback={<Loader />}>
        <BasketManager />
      </Suspense>
    </Shelf>
  );
}
