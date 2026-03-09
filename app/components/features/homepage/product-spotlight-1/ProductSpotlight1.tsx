import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import data from "./prod.json";

export default function ProductSpotlight1() {
  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <SpotlightHero image={data.mainImage} tier="standard" />
        <SpotlightDetails
          data={data}
          accentColor="text-brand-400"
          buttonClass="bg-brand-400 text-brand-900 hover:bg-brand-300"
        />
      </div>
    </section>
  );
}
