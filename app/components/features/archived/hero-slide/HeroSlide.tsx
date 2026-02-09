import Image from "next/image";
import { urlFor } from "@/sanity/lib/image"; // Your sanity image helper
import { SmartLink } from "@/app/components/ui/smart-link/SmartLink";

interface HeroSlideProps {
  slide: HeroPayload["slides"][0];
  layout: "split" | "overlay";
  priority?: boolean;
}

export const HeroSlide = ({
  slide,
  layout,
  priority = false,
}: HeroSlideProps) => {
  const isSplit = layout === "split";
  const { content, assets, link } = slide;

  const isMock = assets.desktopImage.asset._ref?.includes("MOCK");
  const imgSrc = isMock
    ? `https://images.unsplash.com/photo-1511497584788-8767fe771d21?q=80&w=1920`
    : urlFor(assets.desktopImage).url();
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${isSplit ? "flex flex-col md:flex-row" : ""}`}
    >
      {/* 1. The Media Layer */}
      <div
        className={`relative h-full ${isSplit ? "order-2 md:w-1/2" : "w-full"}`}
      >
        <Image
          // TODO restore after mock test
          // src={urlFor(assets.desktopImage).url()}
          src={imgSrc}
          alt={content.headline}
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay for text readability in 'overlay' mode */}
        {!isSplit && <div className="absolute inset-0 bg-black/30" />}
      </div>

      {/* 2. The Content Layer */}
      <div
        className={`relative z-10 flex flex-col justify-center ${
          isSplit
            ? "order-1 bg-background p-8 text-foreground md:w-1/2 md:p-12"
            : "absolute inset-0 items-center p-4 text-center text-white"
        } `}
      >
        <div className="max-w-xl space-y-4">
          {content.eyebrow && (
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">
              {content.eyebrow}
            </p>
          )}

          <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            {content.headline}
          </h2>

          {content.subhead && (
            <p
              className={`text-lg md:text-xl ${isSplit ? "text-muted-foreground" : "text-gray-200"}`}
            >
              {content.subhead}
            </p>
          )}

          <div className="pt-4">
            <SmartLink
              link={link}
              className={`inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors ${
                isSplit
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white text-black hover:bg-gray-100"
              } `}
            >
              {content.ctaText}
            </SmartLink>
          </div>
        </div>
      </div>
    </div>
  );
};
