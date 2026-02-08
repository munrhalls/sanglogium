export default function HomePage() {
  return (
    <div>
      <section className="px-6 py-36">
        <div className="bg-secondary-100 mx-auto max-w-4xl rounded-lg p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            <span className="bg-accent-600 text-brand-100 text-small rounded-sm px-3 py-1 font-medium uppercase tracking-widest">
              Spotlight
            </span>
            <span className="text-secondary-600 text-small">
              Case Study . 2026
            </span>
          </div>

          <h1 className="text-h1 text-brand-800 mb-4 font-bold">
            Perfect Fourth Scale
          </h1>

          <h2 className="text-h2 text-brand-700 mb-6 font-medium">
            Validating the 38px Subheading
          </h2>

          <p className="text-body text-secondary-600 mb-8">
            This paragraph uses the 16/24px standard body rule. The gap below
            this paragraph is a Macro Scale .8 (32px), providing significant
            "breathing room" to avoid a cheap UI feel.
          </p>

          <button className="bg-accent-600 hover:bg-accent-500 text-brand-800 text-cta-hero rounded-md px-8 py-4 font-bold uppercase transition-colors">
            Explore the Void
          </button>
        </div>
      </section>
    </div>
  );
}
