import { Carousel } from "@/app/components/ui/carousel/Carousel";
import SanityImage from "@/app/components/ui/sanity-image/SanityImage";
import { SmartLink } from "@/app/components/ui/smart-link/SmartLink";

export default function HeroSegment({ data }: { data: HeroSectionData }) {
  // 1. One Layout Switcher
  if (data.layout === "carousel") {
    return <Carousel>{data}</Carousel>;
  }

  // 2. Single Slide Logic (Split or Overlay)
  const activeSlide = data.slides[0];
  const isSplit = data.layout === "split";

  return (
    <section className={`relative h-[600px] ${isSplit ? "flex" : "block"}`}>
      {/* Background */}
      <div className={isSplit ? "w-1/2" : "absolute inset-0"}>
        <SanityImage
          src={activeSlide.assets.desktopImage}
          alt={activeSlide.content.headline}
          fill
          className="object-cover"
        />
      </div>

      {/* Content Overlay */}
      <div
        className={`z-10 flex flex-col justify-center p-12 ${isSplit ? "w-1/2 bg-white text-black" : "absolute inset-0 bg-black/40 text-white"} `}
      >
        {activeSlide.content.eyebrow && (
          <span className="mb-2 text-sm font-bold uppercase tracking-widest">
            {activeSlide.content.eyebrow}
          </span>
        )}
        <h1 className="mb-4 text-5xl font-black">
          {activeSlide.content.headline}
        </h1>
        <p className="mb-6 max-w-lg text-xl">{activeSlide.content.subhead}</p>

        <SmartLink linkData={activeSlide.link} className="btn-primary">
          {activeSlide.content.ctaText}
        </SmartLink>
      </div>
    </section>
  );
}
