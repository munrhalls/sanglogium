import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import data from "./prod.json";

export default function ProductSpotlight3() {
  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="order-2 lg:order-2">
          <SpotlightDetails
            data={data}
            accentColor="text-accent-500"
            buttonClass="bg-accent-500 text-brand-900 hover:bg-accent-400"
          />
        </div>
        <div className="order-1 lg:order-1">
          <SpotlightHero image={data.mainImage} tier="gold" />
        </div>
      </div>
    </section>
  );
}
