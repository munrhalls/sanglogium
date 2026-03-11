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
    <div className={cn("flex flex-col justify-center gap-8 p-20 lg:p-20", className)}>
      <div className="flex flex-col gap-8">
        <span className={`text-small font-bold uppercase tracking-signature ${accentColor}`}>
          {data.brand}
        </span>

        <div className="flex flex-col">
          <h2 className="text-display-2 font-regular tracking-editorial text-brand-400 uppercase text-cap">
            {headlineParts[0]}
          </h2>
          {headlineParts.length > 1 && (
            <h2 className="text-display-2 font-regular tracking-editorial text-brand-600 uppercase text-cap">
              {headlineParts.slice(1).join(" ")}
            </h2>
          )}
        </div>

        <h3 className="text-spotlight text-brand-50 font-thin">
          {data.subheadline || data.name}
        </h3>

        <p className="text-body text-secondary-400 font-regular not-italic leading-normal max-w-lg">
          {descriptionText}
        </p>
      </div>

      <button className="w-fit text-small font-bold uppercase tracking-signature text-brand-50 border-b border-accent-500 pb-2 transition-all hover:text-accent-500">
        See More
      </button>
    </div>
  );
}
