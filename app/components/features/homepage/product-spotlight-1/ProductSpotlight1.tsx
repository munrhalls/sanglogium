import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import spotlightSource from "./prod.json";
import { SpotlightProduct } from "./types";

const data = spotlightSource as SpotlightProduct;

export default function ProductSpotlight1() {
  console.log("[SRIP Trace] Foundation Leveling: Height Parity Restored. Padding Normalized to .20 Scale.");

  return (
    <section className="relative w-full bg-brand-950 overflow-hidden min-h-[600px] flex items-center justify-center">

      {/* THE APERTURE: Constellation Background Layer
        Z-0 ensures it stays strictly behind the z-10 content.
      */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          /* 1. THE CONSTELLATION (Top-to-Bottom Array) */
          backgroundImage: `
            url('/backgrounds/fractal_ring.webp'),
            url('/backgrounds/fractal_ring.webp'),
            url('/backgrounds/fractal_ring.webp'),
            url('/backgrounds/fractal_ring.webp')
          `,

          /* 2. THE 3D HIERARCHY (Scale) */
          backgroundSize: `
            1400px,  /* Layer 1: Atmosphere (Deep Background) */
            550px,   /* Layer 2: Structure (Top Left - Image Orbit) */
            650px,   /* Layer 3: Structure (Bottom Right - Text Orbit) */
            200px    /* Layer 4: Focal (Center Bridge) */
          `,

          /* 3. RESPONSIVE ORBITING (Positioning)
             Using calc() ensures the rings float around the 42/58 split on desktop,
             and stack nicely on mobile.
          */
          backgroundPosition: `
            calc(50% + 20vw) center,                /* Atmosphere: Anchored deep behind the text block */
            calc(0% - 10vw) calc(0% - 10vh),        /* Structure Left: Orbiting top-left of the hero image */
            calc(100% + 5vw) calc(100% + 15vh),     /* Structure Right: Orbiting bottom-right of the text */
            calc(42% - 50px) calc(50% + 120px)      /* Focal: Placed exactly at the 42% split line, shifted down */
          `,

          backgroundRepeat: "no-repeat",
          opacity: 0.6,
          mixBlendMode: "screen", /* The Logic of Light: Keeps the white lines, drops the darks */

          /* 4. THE GLOBAL FADE (Masking)
             Creates a soft gradient at the top and bottom edges so the fractal doesn't
             hard-cut where the section ends.
          */
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* THE CONTENT LAYER
        Max-w-[1440px] enforces your Global 8pt grid structural scale,
        allowing the background to bleed edge-to-edge behind it.
      */}
      <div className="relative z-10 group flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto overflow-hidden bg-transparent min-h-[600px]">
        <SpotlightHero
          image={data.mainImage}
          tier="standard"
          className="lg:flex-[0.42]"
        />
        <SpotlightDetails
          data={data}
          accentColor="text-accent-500"
          className="lg:flex-[0.58]"
        />
      </div>
    </section>
  );
}
