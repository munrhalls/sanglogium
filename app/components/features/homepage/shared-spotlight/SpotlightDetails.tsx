import { cn } from "@/lib/utils/tailwind";

export default function SpotlightDetails({ data, accentColor, buttonClass }: any) {
  // Extract text safely: handle both Sanity block arrays and standard strings
  const descriptionText = Array.isArray(data.description)
    ? data.description[0]?.children[0]?.text
    : data.description;

  return (
    <div className="flex flex-col gap-6">
      <span className={cn("text-small uppercase tracking-widest font-bold block", accentColor || "text-brand-400")}>
        Spotlight
      </span>
      <h2 className="text-display-1 font-light text-brand-100 uppercase italic leading-none">
        {data.name}
      </h2>
      <p className="text-body text-brand-300 max-w-md leading-relaxed line-clamp-4">
        {descriptionText}
      </p>
      <button className={cn(
        "w-fit px-8 py-4 font-bold uppercase tracking-widest text-small transition-colors duration-300",
        buttonClass || "bg-brand-400 text-brand-700 hover:bg-white"
      )}>
        Explore {data.brand || "Collection"}
      </button>
    </div>
  );
}
