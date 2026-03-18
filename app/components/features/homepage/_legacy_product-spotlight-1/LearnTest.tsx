import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight1() {
  return (
    <section className="relative w-full bg-brand-950 overflow-hidden min-h-[700px] flex items-center justify-center">

      {/* 1. THE APERTURE (The Window) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none border-4 border-dashed border-white/5"
        style={{
          /* 2. THE CONSTELLATION (The Stamps) */
          backgroundImage: "url('/backgrounds/fractal_ring.webp'), url('/backgrounds/fractal_ring.png'), url('/backgrounds/fractal_ring.png')",
          backgroundSize: '150px, 350px, 800px',
          backgroundPosition: 'left 20% top 20%, right 10% bottom 10%, center center',

          /* 3. THE PHYSICS (Logic of Light) */
          backgroundRepeat: 'no-repeat',

          /* STAMP LAB: Start your micro-sprints here */
          // mixBlendMode: 'screen',
          // maskImage: 'linear-gradient(to bottom, transparent, black)',
        }}
        aria-hidden="true"
      />

      {/* 4. THE CONTENT SLAB */}
      <div className="relative z-10 w-full max-w-[1440px] flex flex-col lg:flex-row pointer-events-none">
        {/* We use opacity-20 on hero/details to see the 'flow' of the background more clearly during the lab */}
        <div className="flex-1 opacity-20 border border-blue-500/20">
          <SpotlightHero image={data.mainImage} tier="standard" />
        </div>
        <div className="flex-1 opacity-20 border border-red-500/20">
          <SpotlightDetails data={data} accentColor="text-accent-500" />
        </div>
      </div>
    </section>
  );
}
