export default function FeaturedHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <span className="text-small uppercase tracking-widest text-brand-400 font-bold">
        {subtitle}
      </span>
      <h2 className="text-display-2 font-light text-brand-100 uppercase italic">
        {title}
      </h2>
    </div>
  );
}
