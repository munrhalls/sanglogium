import { SpotlightProduct } from "../_legacy_product-spotlight-1/types";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightDetailsProps {
  data: SpotlightProduct;
  accentColor: string;
  className?: string;
}

export default function SpotlightDetails({ data, accentColor, className }: SpotlightDetailsProps) {
  const descriptionText = typeof data.description === "string"
    ? data.description
    : data.description?.[0]?.children?.[0]?.text || "";

  const headlineParts = data.headline?.split(" ") || ["Product", "Feature"];

  return (
    <div className={cn("flex flex-col justify-center gap-10", className)}>
      <div className="flex flex-col gap-8">
        <span className={cn("text-small font-bold uppercase tracking-signature", accentColor)}>
          {data.brand}
        </span>

        <div className="flex flex-col">
          <h2 className="text-display-2 font-regular tracking-editorial uppercase text-cap leading-tight">
            {headlineParts[0]}
          </h2>
          {headlineParts.length > 1 && (
            <h2 className="text-display-2 font-regular tracking-editorial uppercase text-cap leading-tight">
              {headlineParts.slice(1).join(" ")}
            </h2>
          )}
        </div>

        <h3 className="text-h3 font-sans font-light tracking-wide">
          {data.subheadline || data.name}
        </h3>

        <p className="text-body font-regular not-italic leading-relaxed max-w-lg">
          {descriptionText}
        </p>
      </div>

      {/* INTERACTIVE CTA: Animated Underline */}
      <button className="btn-ghost w-fit text-small font-bold uppercase pb-2">
        See More
      </button>
    </div>
  );
}
