import { Suspense } from "react";
import MonthProductSkeleton from "../product-showcase/month-product/MonthProductSkeleton";
import MonthProduct from "../product-showcase/month-product/MonthProduct";

const SectionGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto grid grid-cols-[auto_8fr_auto] xl:grid-cols-[1fr_8fr_1fr]">
    {children}
  </div>
);

const FullWidthCol = ({ children }: { children: React.ReactNode }) => (
  <div className="col-start-1 col-end-4 w-full">{children}</div>
);

export default function BottomSegment() {
  return (
    <SectionGrid>
      <FullWidthCol>
        <Suspense fallback={<MonthProductSkeleton />}>
          <MonthProduct />
        </Suspense>
      </FullWidthCol>
    </SectionGrid>
  );
}
