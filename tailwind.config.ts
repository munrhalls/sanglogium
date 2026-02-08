import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";

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
      // TODO this is tailwind.config.ts, need the color palette here?
      // ...
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
  plugins: [animatePlugin, typographyPlugin],
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
