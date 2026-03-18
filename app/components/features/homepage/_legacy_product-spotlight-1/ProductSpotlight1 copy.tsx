import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight1() {
  console.log("[SRIP Trace] Parity Audit: 42/58 split, Editorial tracking, and Platinum zone restored.");

  return (
    <section className="relative w-full bg-brand-950 overflow-hidden min-h-[600px]">
      {/* Fractal Decor Layer - Forced Repetition Mode */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/fractal_ring.png')",
          backgroundSize: '300px',
          backgroundPosition: 'center center',

        }}
        aria-hidden="true"
      />
      {/* <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/fractal_ring.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "100px",
          backgroundPosition: "right center",
          opacity: 0.4,
          mixBlendMode: "lighten",
        }}
        aria-hidden="true"
      /> */}

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
