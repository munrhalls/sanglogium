import { SpotlightProduct } from "../product-spotlight-1/types";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightDetailsProps {
  data: SpotlightProduct;
  accentColor: string;
  buttonClass?: string;
  className?: string;
}

export default function SpotlightDetails({ data, accentColor, className }: SpotlightDetailsProps) {
  const descriptionText = typeof data.description === "string"
    ? data.description
    : data.description?.[0]?.children?.[0]?.text || "";

  const headlineParts = data.headline?.split(" ") || ["Product", "Feature"];

  return (
    <div className={cn("flex flex-col justify-center gap-10 p-20 lg:p-20", className)}>
      <div className="flex flex-col gap-8">
        {/* BRAND TAG: Signature Luxury Tracking */}
        <span className={cn("text-small font-bold uppercase tracking-signature", accentColor)}>
          {data.brand}
        </span>

        {/* HEADLINE: Locked Editorial Axis */}
        <div className="flex flex-col">
          <h2 className="text-display-2 font-regular tracking-editorial text-brand-400 uppercase text-cap leading-tight">
            {headlineParts[0]}
          </h2>
          {headlineParts.length > 1 && (
            <h2 className="text-display-2 font-regular tracking-editorial text-brand-600 uppercase text-cap leading-tight">
              {headlineParts.slice(1).join(" ")}
            </h2>
          )}
        </div>

        {/* SUBHEADLINE: Purge Serif -> Modern Sans Light */}
        <h3 className="text-h3 text-brand-50 font-sans font-light tracking-wide">
          {data.subheadline || data.name}
        </h3>

        {/* BODY: Clean Editorial Leading */}
        <p className="text-body text-secondary-400 font-regular not-italic leading-relaxed max-w-lg">
          {descriptionText}
        </p>
      </div>

      {/* CTA: Signature Alignment */}
      <button className="w-fit text-small font-bold uppercase tracking-signature text-brand-50 border-b border-accent-500/50 pb-1 transition-all hover:text-accent-500 hover:border-accent-500">
        See More
      </button>
    </div>
  );
}
