import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";
import { brand, secondary, accent, success, error, warning, surface, textTokens, border } from "./shared/styles/tokens";
import { typographyDefaultsPlugin, uiComponentsPlugin } from "./shared/styles/componentsPlugin";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./sanity/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    backgroundImage: {
      'fractal-ring': "url('/backgrounds/fractal_ring.webp')",
    },
    borderRadius: {
      lg: "4px",
      md: "3px",
      sm: "2px",
    },
    extend: {
      screens: {
        "xs": "475px",
        "3xl": "1920px",
        "lg-touch": { raw: "(min-width: 1024px) and (max-height: 850px)" },
        "lg-desktop": { raw: "(min-width: 1024px) and (min-height: 851px)" },
        "pointer-fine": { raw: "(pointer: fine)" },
        "pointer-coarse": { raw: "(pointer: coarse)" },
      },
      spacing: {
        "12": "3rem",
        "16": "4rem",
        "112": "28rem",
        "128": "32rem",
        "desktop-header-h": "var(--desktop-header-h)",
        "mobile-menu-h": "var(--mobile-menu-h)",
        "feature-media": "450px",
      },
      letterSpacing: {
        editorial: "0.260em",
        signature: "0.4em",
      },
      flex: {
        hero: "0 0 42%",
        details: "0 0 58%",
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
        ],
      },
      fontSize: () => ({
        "display-1": [
          "clamp(3rem, 4vw + 2rem, 5.625rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-2": [
          "clamp(2.25rem, 3vw + 1.5rem, 4.25rem)",
          { lineHeight: "1.12", letterSpacing: "-0.015em" },
        ],
        h1: [
          "clamp(1.6875rem, 2.25vw + 1.16rem, 3.1875rem)",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        h2: [
          "clamp(1.25rem, 1.69vw + 0.854rem, 2.375rem)",
          { lineHeight: "1.25", letterSpacing: "-0.005em" },
        ],
        h3: [
          "clamp(1.125rem, 1.03vw + 0.883rem, 1.8125rem)",
          { lineHeight: "1.2", letterSpacing: "0.05em" },
        ],
        h4: [
          "clamp(1rem, 0.56vw + 0.868rem, 1.375rem)",
          { lineHeight: "1.2", letterSpacing: "0.1em" },
        ],
        body: ["16px", { lineHeight: "24px", letterSpacing: "0em" }],
        action: ["14px", { lineHeight: "21px", letterSpacing: "0.05em" }],
        actionLarge: ["clamp(1.125rem, 1.03vw + 0.883rem, 1.8125rem)", { lineHeight: "1.2", letterSpacing: "0.05em" }],
        small: ["12px", { lineHeight: "16px", letterSpacing: "0.05em" }],
        tiny: ["10px", { lineHeight: "14px", letterSpacing: "0.05em" }],
        "cta-hero": [
          "clamp(1.125rem, 1vw + 0.9rem, 1.75rem)",
          { lineHeight: "1.15", letterSpacing: "0.03em" },
        ],
        spotlight: ["24px", { lineHeight: "28px", letterSpacing: "0.1em" }],
      }),
      fontWeight: {
        thin: "100",
        light: "300",
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      colors: {
        brand,
        secondary,
        accent,
        success,
        error,
        warning,
        surface,
        text: textTokens,
        border,
      },
      maxWidth: {
        content: "1280px",
        // Product-listing + search wrappers only — a touch wider than `content`
        // so wide screens can reach 4 (sidebar pages) / 5 (search) card columns.
        // Deliberately conservative; see issue sang-logium-dbu risk A9.
        catalogue: "1536px",
      },
      gridTemplateColumns: {
        // Product grid: fit as many ~13.5rem cards as the grid's OWN box allows
        // (viewport - sidebar - gutter), never the raw viewport. auto-fill (not
        // auto-fit) so a short last row is not stretched. See gridLayout.ts.
        products: "repeat(auto-fill, minmax(13.5rem, 1fr))",
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.03)',
        cardHover: '0 8px 30px rgba(0, 0, 0, 0.08)',
        cardDark: '0 4px 20px rgba(255, 255, 255, 0.03), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        cardHoverDark: '0 8px 30px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        button: '0 2px 8px rgba(0, 0, 0, 0.15)',
        buttonHover: '0 4px 16px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [
    animatePlugin,
    typographyPlugin,
    typographyDefaultsPlugin,
    uiComponentsPlugin,
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