import Footer from "../components/layout/footer/Footer";
import HeroSegment from "../components/features/homepage/aggregate/HeroSegment";
import MainSegment from "../components/features/homepage/aggregate/MainSegment";
import BottomSegment from "../components/features/homepage/aggregate/BottomSegment";
import Hero from "@/app/components/features/homepage/aggregate/HeroSegment";
export const revalidate = 5400;
export const dynamic = "force-static";

export default async function Page() {
  return (
    <main className="relative h-full overflow-x-hidden">
      <Hero />
      {/* <HeroSegment /> */}
      <MainSegment />
      <BottomSegment />
      <Footer />
    </main>
  );
}
