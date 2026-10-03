import { BasketManager, Loader } from "@/features/basket";
import { Suspense } from "react";
import Shelf from "@/app/components/layout/shelf/Shelf";

export default function BasketPage() {
  return (
    <Shelf data-testid="basket-page" className="py-20">
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
