import { Loader } from "@/features/basket";
import { BasketCheckout, BasketTotalRefusal } from "@/features/checkout";
import { Suspense } from "react";
import Shelf from "@/platform/design/ui/Shelf";

export default async function BasketPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <Shelf data-testid="basket-page" className="py-20">
      <div className="mt-12 mb-8 text-center lg:text-left">
        <h1 className="type-section-hed uppercase tracking-widest">
          Basket
        </h1>
      </div>
      {error === "invalid_total" ? <BasketTotalRefusal /> : null}
      <Suspense fallback={<Loader />}>
        <BasketCheckout />
      </Suspense>
    </Shelf>
  );
}
