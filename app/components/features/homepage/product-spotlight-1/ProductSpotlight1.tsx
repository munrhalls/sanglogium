import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight1() {
  console.log("[SRIP Trace] Phase 2: Typographic Alignment. Serif Purged. Editorial Axis Locked.");

  return (
    <section className="relative w-full bg-brand-950 overflow-hidden">

      {/* THE APERTURE: Constellation Background Layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/fractal_ring.webp'), url('/backgrounds/fractal_ring.webp'), url('/backgrounds/fractal_ring.webp'), url('/backgrounds/fractal_ring.webp')",
          backgroundSize: '1400px, 550px, 650px, 200px',
          backgroundPosition: 'calc(50% + 20vw) center, calc(0% - 10vw) calc(0% - 10vh), calc(100% + 5vw) calc(100% + 15vh), calc(42% - 50px) calc(50% + 120px)',
          backgroundRepeat: "no-repeat",
          opacity: 0.6,
          mixBlendMode: "screen",
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* THE CONTENT LAYER: Unified Void with Intrinsic Anchor */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch overflow-hidden bg-transparent min-h-[600px] lg:min-h-[700px]">
        <SpotlightHero
          image={data.mainImage}
          tier="standard"
          className="lg:flex-[0.42] w-full self-stretch"
        />
        <SpotlightDetails
          data={data}
          accentColor="text-accent-500"
          className="lg:flex-[0.58] flex-1"
        />
      </div>
    </section>
  );
}
