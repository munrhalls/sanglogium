import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";
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
        "display-1": [
          "90px",
          { lineHeight: "100px", letterSpacing: "-0.02em" },
        ],
        "display-2": [
          "68px",
          { lineHeight: "76px", letterSpacing: "-0.015em" },
        ],
        h1: ["51px", { lineHeight: "60px", letterSpacing: "-0.01em" }],
        h2: ["38px", { lineHeight: "48px", letterSpacing: "-0.005em" }],
        h3: ["28px", { lineHeight: "36px", letterSpacing: "0em" }],
        h4: ["21px", { lineHeight: "28px", letterSpacing: "0em" }],
        body: ["16px", { lineHeight: "24px", letterSpacing: "0em" }],
        small: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        "cta-hero": ["28px", { lineHeight: "32px", letterSpacing: "0.03em" }],
        spotlight: ["28px", { lineHeight: "32px", letterSpacing: "0.1em" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        bold: "700",
      },
      colors: {
        brand: {
          100: "#FEFCFB",
          200: "#FAEEE6",
          400: "#F6E3D5",
          700: "#151B1B",
          800: "#0D0F0F",
        },
        secondary: {
          100: "#FCFCFC",
          300: "#E5E4E2",
          600: "#5C5B5A",
        },
        accent: {
          600: "#D4AF37",
          500: "#E5C158",
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
    plugin(function ({ addBase, addUtilities }) {
      addBase({
        "h1, h2, h3, h4, h5, h6, p, blockquote, ul, ol, dl, dt, dd, pre": {
          "text-box-trim": "both",
          "text-box-edge": "cap alphabetic",
        },
      });
      addUtilities({
        ".trim-both": {
          "text-box-trim": "both",
          "text-box-edge": "cap alphabetic",
        },
        ".trim-none": {
          "text-box-trim": "none",
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
