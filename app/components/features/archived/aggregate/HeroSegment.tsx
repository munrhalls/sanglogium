import { Suspense } from "react";
import HeroMain from "../../archived/HeroMain";
import HeroCommercialsSkeleton from "../../archived/hero-commercials/HeroCommercialsSkeleton";
// import HeroCommercials from "../hero/hero-commercials/HeroCommercials";
// import HeroSegment from "@/app/components/features/hero-segment/HeroSegment";

export default function Hero() {
  return (
    <section className="h-full">
      <Suspense fallback={<HeroCommercialsSkeleton />}>
        <HeroMain />
        {/* <HeroSegment /> */}
      </Suspense>
    </section>
  );
}
