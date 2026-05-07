import SegmentTitle from "@/app/components/ui/segment-title/SegmentTitle";
import BasketManager from "@/app/components/features/basket/BasketManager";
import { Suspense } from "react";
import Loader from "@/app/components/common/Loader";
import Shelf from "@/app/components/layout/general/Shelf";

export default function BasketPage() {
  return (
    <Shelf data-testid="basket-page">
      <div className="mb-12">
        <SegmentTitle title="Your Basket" />
      </div>
      <Suspense fallback={<Loader />}>
        <BasketManager />
      </Suspense>
    </Shelf>
  );
}
