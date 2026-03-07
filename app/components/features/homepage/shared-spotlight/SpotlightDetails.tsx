import { cn } from "@/lib/utils/tailwind";

interface SpotlightDetailsProps {
  tag: string;
  title: string;
  description: string;
  ctaText?: string;
}

export default function SpotlightDetails({ tag, title, description, ctaText = "Explore Collection" }: SpotlightDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <span className="text-small uppercase tracking-[0.3em] text-brand-400 font-bold block">
          {tag}
        </span>
        <h2 className="text-display-1 font-light text-brand-100 uppercase italic leading-[0.9]">
          {title}
        </h2>
        <p className="text-body text-brand-300 max-w-md leading-relaxed line-clamp-4">
          {description}
        </p>
      </div>
      <button className="w-fit px-8 py-4 bg-brand-400 text-brand-700 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors duration-300">
        {ctaText}
      </button>
    </div>
  );
}
