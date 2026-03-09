import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight2() {
  console.log(`[SRIP Trace] Product Spotlight 2 Contract validated: "${data.id}". Theme: Secondary Accent.`);

  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="order-2 lg:order-1">
          <SpotlightDetails
            data={data}
            accentColor="text-secondary-400"
            buttonClass="bg-secondary-400 text-brand-900 hover:bg-secondary-300"
          />
        </div>
        <div className="order-1 lg:order-2">
          <SpotlightHero image={data.mainImage} tier="standard" />
        </div>
      </div>
    </section>
  );
}
