export default function FeaturedHeader() {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-small uppercase tracking-[0.3em] text-brand-400 font-bold">
                Curated
            </span>
            <h2 className="text-display-2 font-light text-brand-100 uppercase italic leading-[1.1]">
                Featured <span className="text-brand-400 font-bold not-italic">Spotlight</span>
            </h2>
        </div>
    );
}