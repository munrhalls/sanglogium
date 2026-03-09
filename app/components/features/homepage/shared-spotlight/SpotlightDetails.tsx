export default function SpotlightDetails({ data, accentColor }: any) {
  // NORMALIZATION: Handle both flat string and Sanity block content
  const descriptionText = typeof data.description === "string" 
    ? data.description 
    : data.description?.[0]?.children?.[0]?.text || "";

  // NORMALIZATION: Handle headline splitting for the "Display" effect
  const headlineParts = data.headline?.split(" ") || ["Product", "Feature"];

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-12">
      <div className="flex flex-col gap-6">
        <span className={`text-small font-bold uppercase tracking-widest ${accentColor}`}>
          {data.brand}
        </span>
        
        <div className="flex flex-col">
          <h2 className="text-display-2 font-bold text-brand-50 uppercase leading-[0.9] text-cap">
            {headlineParts[0]}
          </h2>
          {headlineParts.length > 1 && (
            <h2 className="text-display-2 font-bold text-secondary-500 uppercase leading-[0.9] text-cap">
              {headlineParts.slice(1).join(" ")}
            </h2>
          )}
        </div>

        <h3 className="text-spotlight text-brand-50 font-regular">
          {data.subheadline || data.name}
        </h3>

        <p className="text-body text-secondary-400 leading-relaxed max-w-lg italic">
          "{descriptionText}"
        </p>
      </div>

      <button className="w-fit text-small font-bold uppercase tracking-widest text-brand-50 border-b border-brand-400 pb-1 transition-all hover:text-brand-400">
        See More
      </button>
    </div>
  );
}
