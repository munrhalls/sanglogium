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

// ---------------------------------------------------------------------------
// PALETTE TOKENS (Layer 1)
// ---------------------------------------------------------------------------

const brand = {
  50: "#FEFCFB",
  100: "#FDF9F7",
  200: "#FAEEE6",
  300: "#F8E6D9",
  400: "#F6E3D5",
  500: "#E8C9B5",
  600: "#C9A18A",
  700: "#151B1B",
  800: "#0D0F0F",
  900: "#070808",
};

const secondary = {
  50: "#FCFCFC",
  100: "#F5F5F4",
  200: "#ECECEB",
  300: "#E5E4E2",
  400: "#C7C6C4",
  500: "#9A9997",
  600: "#6E6D6B",
  700: "#4A4948",
  800: "#2E2E2D",
  900: "#1A1A19",
};

const accent = {
  100: "#FBF6E8",
  200: "#F5E9C8",
  300: "#EEDB9F",
  400: "#E5C158",
  500: "#D4AF37",
  600: "#B8952E",
  700: "#8F7324",
  800: "#6B561C",
};

const success = {
  500: "#4ADE80",
  700: "#15803D",
};

const error = {
  500: "#EF4444",
  700: "#991B1B",
};

const warning = {
  500: "#F59E0B",
  700: "#92400E",
};

// ---------------------------------------------------------------------------
// SEMANTIC TOKENS (Layer 2)
// ---------------------------------------------------------------------------

const surface = {
  page: brand[700],
  card: secondary[900],
  elevated: secondary[800],
  subtle: brand[800],
  highlight: brand[200],
} as const;

const textTokens = {
  primary: brand[400],
  secondary: secondary[400],
  headline: brand[50],
  subtitle: secondary[500],
  body: secondary[400],
  accent: accent[500],
  overline: accent[500],
  priceTag: secondary[300],
  inverse: secondary[700],
} as const;

const border = {
  primary: secondary[300],
  secondary: secondary[700],
} as const;

// ---------------------------------------------------------------------------
// PLUGINS
// ---------------------------------------------------------------------------

const typographyDefaultsPlugin = plugin(function ({ addUtilities }) {
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
});

const uiComponentsPlugin = plugin(function ({ addComponents, theme }) {
  addComponents({
    ".btn-primary": {
      backgroundColor: theme("colors.brand.400") as string,
      color: theme("colors.brand.700") as string,
      padding: `${theme("spacing.3")} ${theme("spacing.6")}`,
      borderRadius: theme("borderRadius.md") as string,
      fontWeight: theme("fontWeight.medium") as string,
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: theme("colors.brand.600") as string,
      },
      "&:active": {
        backgroundColor: theme("colors.brand.700") as string,
      },
      "&:disabled": {
        backgroundColor: theme("colors.brand.200") as string,
        opacity: "0.4",
        cursor: "not-allowed",
      },
    },
    ".btn-secondary": {
      backgroundColor: "transparent",
      border: `1px solid ${theme("colors.brand.200")}`,
      color: theme("colors.brand.100") as string,
      borderRadius: "0px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: theme("colors.brand.300") as string,
        color: theme("colors.brand.700") as string,
      },
      "&:active": {
        backgroundColor: theme("colors.brand.500") as string,
      },
    },
    ".btn-ghost": {
      backgroundColor: "transparent",
      border: "none",
      color: theme("colors.accent.500") as string,
      textDecoration: "underline",
      textUnderlineOffset: "4px",
      letterSpacing: theme("letterSpacing.editorial") as string,
      borderRadius: "0px",
      transition: "color 0.2s ease",
      "&:hover": {
        color: theme("colors.accent.300") as string,
      },
    },
    ".card-base": {
      backgroundColor: theme("colors.surface.card") as string,
      padding: theme("spacing.6") as string,
      borderRadius: theme("borderRadius.lg") as string,
      boxShadow: theme("boxShadow.sm") as string,
      border: `1px solid ${theme("colors.border.secondary")}`,
    },
  });
});

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
    borderRadius: {
      lg: "0px",
      md: "0px",
      sm: "0px",
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
        editorial: "0.25em",
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
      // tailwind.config.ts

      fontSize: () => ({
        // ----------------------------------------------------------------------
        // FLUID HEADINGS (Responsive Luxury Scale)
        // Logic: Linear interpolation from Mobile (375px) to Desktop (1440px)
        // ----------------------------------------------------------------------

        // Desktop: 90px (5.625rem) | Mobile: 48px (3rem)
        // Line-Height: 1.1 (was 100px) | Tracking: -2%
        "display-1": [
          "clamp(3rem, 4vw + 2rem, 5.625rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        // base color brand-400

        // Desktop: 68px (4.25rem) | Mobile: 36px (2.25rem)
        // Line-Height: 1.12 (was 76px) | Tracking: -1.5%
        "display-2": [
          "clamp(2.25rem, 3vw + 1.5rem, 4.25rem)",
          { lineHeight: "1.12", letterSpacing: "-0.015em" },
        ],
        // base color secondary-300

        // Desktop: 51px (3.18rem) | Mobile: 32px (2rem)
        // Line-Height: 1.2 (was 60px) | Tracking: -1%
        h1: [
          "clamp(1.6875rem, 2.25vw + 1.16rem, 3.1875rem)",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],


        // Desktop: 38px (2.375rem) | Mobile: 28px (1.75rem)
        // Line-Height: 1.25 (was 48px) | Tracking: -0.5%
        h2: [
          "clamp(1.25rem, 1.69vw + 0.854rem, 2.375rem)",
          { lineHeight: "1.25", letterSpacing: "-0.005em" },
        ],

        // ----------------------------------------------------------------------
        // FIXED SIZES (Structural Utility)
        // These sizes are small enough to remain static across viewports.
        // ----------------------------------------------------------------------

        // 28px / 36px (Tracking: 0)
        h3: [
          "clamp(1.125rem, 1.03vw + 0.883rem, 1.8125rem)",
          { lineHeight: "1.2", letterSpacing: "0.05em" },
        ],

        // 21px / 28px (Tracking: 0)
        h4: [
          "clamp(1rem, 0.56vw + 0.868rem, 1.375rem)",
          { lineHeight: "1.2", letterSpacing: "0.1em" },
        ],

        // ----------------------------------------------------------------------
        // BODY COPY & UTILITIES
        // ----------------------------------------------------------------------

        // 16px / 24px
        body: ["16px", { lineHeight: "24px", letterSpacing: "0em" }],

        // 12px / 16px
        small: ["12px", { lineHeight: "16px", letterSpacing: "0.05em" }],

        // ----------------------------------------------------------------------
        // SPECIFIC UI ACTIONS
        // ----------------------------------------------------------------------

        // CTA Hero: 28px fixed
        "cta-hero": [
          "clamp(1.125rem, 1vw + 0.9rem, 1.75rem)",
          { lineHeight: "1.15", letterSpacing: "0.03em" },
        ],

        // Spotlight: 28px fixed (Luxury uppercase)
        spotlight: ["28px", { lineHeight: "32px", letterSpacing: "0.1em" }],
      }),
      // Weights separately - can be combined with any size
      fontWeight: {
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
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.03)',
        cardHover: '0 8px 30px rgba(0, 0, 0, 0.08)'
      },
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
