import { cn } from "@/lib/utils/tailwind";
import type { CatalogueItem } from "../data";
import DetailWatermark from "./DetailWatermark";
import DetailSection from "./DetailSection";

export default function SliceDetails({ data }: { data: CatalogueItem }) {
  console.log('[SRIP Trace] Overwrote border-radius to 0px in:', 'SliceDetails');
  return (
    <div
      className={cn(
        "relative h-full max-h-full w-full max-w-screen-xl",
        "overflow-hidden",
        "lg-desktop:landscape:w-2/3"
      )}
    >
      <DetailWatermark imageUrl={data.imageUrl} />

      {/* Content Layer */}
      <div
        className={cn(
          "relative h-full max-h-full w-full max-w-screen-xl",
          "landscape:no-scrollbar overflow-y-auto overflow-x-hidden",
          "no-scrollbar",
          "px-8 pt-8"
        )}
      >
        <div
          className={cn(
            "relative z-10 min-h-full w-full max-w-screen-xl",
            "space-y-4 pb-12 pl-8 sm:pl-12",
            "flex flex-col landscape:justify-center"
          )}
        >
          <div
            className={cn(
              "mx-auto my-auto flex flex-col flex-nowrap items-start gap-8",
              "w-fit max-w-full",
              "sm:gap-12 md:gap-16",
              "lg-touch:flex-row lg-touch:flex-wrap lg-touch:justify-around lg-touch:gap-x-20"
            )}
          >
            {data.sections.map((section, idx) => (
              <DetailSection key={idx} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
