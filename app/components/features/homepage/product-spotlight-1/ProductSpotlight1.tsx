import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight1() {
  return (
    <section className="relative w-full bg-brand-950 overflow-hidden min-h-[600px]">
      {/* Fractal Decor Layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/fractal_ring.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "1400px", // Larger size creates the "airy/rarefied" feel
          backgroundPosition: "10% 5%",
          opacity: 1, // Base vividness
          mixBlendMode: "lighten", // Helps "burn" it into the dark background
        }}
        aria-hidden="true"
      />

      {/* Content Layer */}
      <div className="relative z-10 group flex flex-col lg:flex-row w-full overflow-hidden">
        <SpotlightHero image={data.mainImage} tier="standard" />
        <SpotlightDetails
          data={data}
          accentColor="text-accent-500"
        />
      </div>
    </section>
  );
}