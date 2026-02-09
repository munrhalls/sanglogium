import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";
/**
 * REFERENCE: 8pt GRID SPACING SYSTEM (Tailwind Defaults)
 * 4px   -> .1
 * 8px   -> .2
 * 12px  -> .3
 * 16px  -> .4
 * 24px  -> .6
 * 32px  -> .8
 * 80px  -> .20
 * 144px -> .36
 */

// STRATEGIC IMPLEMENTATION
// 1. The Micro-Scale (4px - 16px)
// Use these for Internal Spacing. If you change a .2 to a .4, you are telling the user's brain that the two elements are becoming independent pieces of information.

// 2. The Macro-Scale (24px - 32px)
// Use these for Component Layouts. This is the "breathing room" for your main content area. If you use a gap smaller than .6 between major cards, the UI will feel cluttered and "cheap."

// 3. The Structural Scale (80px - 144px)
// Use these for Vertical Hierarchy.

// 80px (.20): Use for alternating background color sections.

// 144px (.36): Use exclusively for your Hero or the very end of a landing page to signal "The End."

// TABLE Value, PX, Tailwind Class, Recommended Use Case
// 0.1,4px,"p-1, m-1, gap-1","Micro: Icons next to text, breadcrumb separators."
// 0.2,8px,"p-2, m-2, gap-2","Micro: Labels above inputs, small tags."
// 0.3,12px,"p-3, m-3, gap-3","Micro: Card metadata, sidebar list items."
// 0.4,16px,"p-4, m-4, gap-4","Micro: Paragraph spacing, inner card padding."
// 0.6,24px,"p-6, m-6, gap-6","Macro: Gaps between cards, navigation links."
// 0.8,32px,"p-8, m-8, gap-8","Macro: Luxury button padding, standard grid gaps."
// 20,80px,"p-20, m-20",Structural: Vertical padding for page sections.
// 36,144px,"p-36, m-36","Structural: Hero sections, landing page footers."

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./sanity/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xs": "450px",
        "2xl": "1600px",
        "3xl": "1920px",
      },
      spacing: {
        "header-h": "var(--header-h)",
        "catalogue-nav-h": "var(--catalogue-nav-h)",
        "site-header-h": "var(--site-header-h)",
      },
      height: {
        "view-content": "calc(100vh - var(--header-total-h))",
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "ui-sans-serif",
          "system-ui",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // ----------------------------------------------------------------------
        // HEADINGS (Perfect Fourth Scale: 1.333)
        // ----------------------------------------------------------------------

        // 90px / 100px (Tracking: -2%)
        "display-1": [
          "90px",
          { lineHeight: "100px", letterSpacing: "-0.02em" },
        ],

        // 68px / 76px (Tracking: -1.5%)
        "display-2": [
          "68px",
          { lineHeight: "76px", letterSpacing: "-0.015em" },
        ],

        // 51px / 60px (Tracking: -1%)
        h1: ["51px", { lineHeight: "60px", letterSpacing: "-0.01em" }],

        // 38px / 48px (Tracking: -0.5%)
        h2: ["38px", { lineHeight: "48px", letterSpacing: "-0.005em" }],

        // 28px / 36px (Tracking: 0)
        h3: ["28px", { lineHeight: "36px", letterSpacing: "0em" }],

        // 21px / 28px (Tracking: 0)
        h4: ["21px", { lineHeight: "28px", letterSpacing: "0em" }],

        // ----------------------------------------------------------------------
        // BODY COPY & UTILITIES
        // ----------------------------------------------------------------------

        // 16px / 24px (Standard Body)
        body: ["16px", { lineHeight: "24px", letterSpacing: "0em" }],

        // 12px / 16px (Small / Legal)
        small: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],

        // ----------------------------------------------------------------------
        // SPECIFIC UI ACTIONS (Luxury Treatments)
        // ----------------------------------------------------------------------

        // CTA Hero: 28px.
        "cta-hero": ["28px", { lineHeight: "32px", letterSpacing: "0.03em" }],

        // Spotlight: Wide tracking (0.1em) for uppercase luxury feel
        spotlight: ["28px", { lineHeight: "32px", letterSpacing: "0.1em" }],
      },
      // Weights separately - can be combined with any size
      fontWeight: {
        regular: "400",
        medium: "500",
        bold: "700",
      },
      colors: {
        // 1. BRAND (Warmth & Void) - The core identity
        brand: {
          100: "#FEFCFB", // Paper White (Body Text)
          200: "#FAEEE6", // Soft Highlight (Hover)
          400: "#F6E3D5", // Peach Rose Base (Skin Tone)
          700: "#151B1B", // The Void (Main Background)
          800: "#0D0F0F", // Deep Void (Footer/Contrast)
        },
        // 2. SECONDARY (Structure) - The scaffolding
        secondary: {
          100: "#FCFCFC", // Card Background (Clean White)
          300: "#E5E4E2", // Divider (Platinum Base)
          600: "#5C5B5A", // Subtext (Readable Grey)
        },
        // 3. ACCENT (Action) - The Gold
        accent: {
          600: "#D4AF37", // Main Gold (Buttons/CTAs)
          500: "#E5C158", // Optional Lighter Gold (Hover state)
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    animatePlugin,
    typographyPlugin,
    plugin(function ({ addUtilities }) {
      addUtilities({
        // Trims top to Cap-Height, bottom to Baseline.
        ".text-cap": {
          "text-box": "trim-both cap alphabetic",
        },
        // Trims top to x-Height (good for lowercase), bottom to Baseline.
        ".text-ex": {
          "text-box": "trim-both ex alphabetic",
        },
      });
    }),
  ],
  corePlugins: {
    preflight: true,
    container: false,
  },
  safelist: [
    "hero-image",
    "absolute",
    "inset-0",
    "object-cover",
    "object-center",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
