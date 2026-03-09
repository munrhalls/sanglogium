import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight1() {
  console.log("[SRIP Trace] Parity Audit: 42/58 split, Editorial tracking, and Platinum zone restored.");

  return (
    <section className="w-full bg-brand-950 overflow-hidden">
      <div className="group flex flex-col lg:flex-row w-full overflow-hidden">
        <SpotlightHero image={data.mainImage} tier="standard" />
        <SpotlightDetails
          data={data}
          accentColor="text-accent-500"
        />
      </div>
    </section>
  );
}
