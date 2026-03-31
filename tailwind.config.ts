import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";

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

const surface = {
  page: brand[700],
  card: secondary[900],
  elevated: secondary[800],
  subtle: brand[800],
  highlight: brand[200],
  productImage: brand[200],
} as const;

const textTokens = {
  primary: brand[400],
  secondary: secondary[400],
  caption: secondary[500],
  heroHeadline: brand[400],
  heroSubHeadline: secondary[300],
  headline: brand[400],
  subtitle: secondary[300],
  body: brand[200],
  accent: accent[500],
  overline: accent[500],
  priceTag: secondary[300],
  inverse: secondary[700],
} as const;

const border = {
  primary: secondary[300],
  secondary: secondary[700],
} as const;

const typographyDefaultsPlugin = plugin(function ({ addUtilities }) {
  addUtilities({
    ".text-cap": {
      "text-box": "trim-both cap alphabetic",
    },
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
      fontWeight: theme("fontWeight.bold") as string,
      borderRadius: theme("borderRadius.md") as string,
      boxShadow: theme("boxShadow.button") as string,
      transition: "background-color 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        backgroundColor: theme("colors.brand.500") as string,
        boxShadow: theme("boxShadow.buttonHover") as string,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme("colors.brand.600")}`,
        outlineOffset: "2px",
      },
      "&:active": {
        backgroundColor: theme("colors.brand.600") as string,
      },
      "&:disabled": {
        opacity: "0.4",
        cursor: "not-allowed",
      },
    },
    ".btn-cart": {
      display: "inline-flex",
      alignItems: "center",
      gap: theme("spacing.2") as string,
      backgroundColor: theme("colors.brand.400") as string,
      color: theme("colors.brand.700") as string,
      fontWeight: theme("fontWeight.bold") as string,
      fontSize: theme("fontSize.action[0]") as string,
      lineHeight: theme("fontSize.action[1].lineHeight") as string,
      padding: `${theme("spacing.2")} ${theme("spacing.2")}`,
      borderRadius: theme("borderRadius.sm") as string,
      boxShadow: theme("boxShadow.button") as string,
      transition: "background-color 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        backgroundColor: theme("colors.brand.500") as string,
        boxShadow: theme("boxShadow.buttonHover") as string,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme("colors.brand.500")}`,
        outlineOffset: "2px",
      },
      "&:active": {
        backgroundColor: theme("colors.brand.500") as string,
      },
      "&:disabled": {
        opacity: "0.4",
        cursor: "not-allowed",
      },
    },
    ".btn-secondary": {
      backgroundColor: "transparent",
      border: `1px solid ${theme("colors.brand.200")}`,
      color: theme("colors.brand.100") as string,
      borderRadius: theme("borderRadius.md") as string,
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
      color: theme("colors.brand.400") as string,
      fontWeight: theme("fontWeight.light") as string,
      fontSize: theme("fontSize.cta-hero[0]") as string,
      lineHeight: theme("fontSize.cta-hero[1].lineHeight") as string,
      letterSpacing: theme("letterSpacing.editorial") as string,
      textTransform: "uppercase",
      textDecoration: "underline",
      textUnderlineOffset: "9px",
      borderRadius: theme("borderRadius.sm") as string,
      transition: "color 0.2s ease",
      "&:hover": {
        color: theme("colors.brand.100") as string,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme("colors.brand.100")}`,
        outlineOffset: "2px",
      },
    },
    ".card-base": {
      backgroundColor: theme("colors.surface.card") as string,
      padding: theme("spacing.6") as string,
      borderRadius: theme("borderRadius.lg") as string,
      boxShadow: theme("boxShadow.card") as string,
      border: `1px solid ${theme("colors.border.secondary")}`,
    },
    ".card-product": {
      backgroundColor: "transparent",
      padding: theme("spacing.6") as string,
      borderRadius: theme("borderRadius.lg") as string,
      boxShadow: theme("boxShadow.card") as string,
      border: `1px solid ${theme("colors.border.secondary")}`,
      transition: "box-shadow 0.3s ease, transform 0.3s ease",
      "&:hover": {
        boxShadow: theme("boxShadow.cardHover") as string,
        transform: "translateY(-2px)",
      },
    },
    ".card-product-dark": {
      backgroundColor: "transparent",
      padding: theme("spacing.6") as string,
      borderRadius: theme("borderRadius.lg") as string,
      boxShadow: theme("boxShadow.cardDark") as string,
      border: `1px solid ${theme("colors.border.secondary")}`,
      transition: "all 300ms ease-out",
      "&:hover": {
        boxShadow: theme("boxShadow.cardHoverDark") as string,
        borderColor: theme("colors.brand.400") as string,
        transform: "translateY(-2px)",
      },
    },
    ".input-base": {
      backgroundColor: theme("colors.surface.elevated") as string,
      border: `1px solid ${theme("colors.border.primary")}`,
      borderRadius: theme("borderRadius.md") as string,
      padding: `${theme("spacing.3")} ${theme("spacing.4")}`,
      fontSize: theme("fontSize.body[0]") as string,
      lineHeight: theme("fontSize.body[1].lineHeight") as string,
      fontWeight: theme("fontWeight.regular") as string,
      color: theme("colors.text.body") as string,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "&::placeholder": {
        color: theme("colors.text.caption") as string,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme("colors.brand.600")}`,
        outlineOffset: "2px",
        borderColor: theme("colors.brand.400") as string,
      },
      "&:disabled": {
        opacity: "0.4",
        cursor: "not-allowed",
        backgroundColor: theme("colors.surface.subtle") as string,
      },
    },
    ".input-field": {
      backgroundColor: theme("colors.surface.elevated") as string,
      border: `1px solid ${theme("colors.border.primary")}`,
      borderRadius: theme("borderRadius.md") as string,
      padding: `${theme("spacing.3")} ${theme("spacing.4")}`,
      fontSize: theme("fontSize.body[0]") as string,
      lineHeight: theme("fontSize.body[1].lineHeight") as string,
      fontWeight: theme("fontWeight.regular") as string,
      color: theme("colors.text.body") as string,
      width: "100%",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "&::placeholder": {
        color: theme("colors.text.caption") as string,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme("colors.brand.600")}`,
        outlineOffset: "2px",
        borderColor: theme("colors.brand.400") as string,
      },
      "&:disabled": {
        opacity: "0.4",
        cursor: "not-allowed",
        backgroundColor: theme("colors.surface.subtle") as string,
      },
    },
    ".input-select": {
      backgroundColor: theme("colors.surface.elevated") as string,
      border: `1px solid ${theme("colors.border.primary")}`,
      borderRadius: theme("borderRadius.md") as string,
      padding: `${theme("spacing.3")} ${theme("spacing.4")}`,
      fontSize: theme("fontSize.body[0]") as string,
      lineHeight: theme("fontSize.body[1].lineHeight") as string,
      fontWeight: theme("fontWeight.regular") as string,
      color: theme("colors.text.body") as string,
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${theme("colors.text.body").slice(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: `right ${theme("spacing.3")} center`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "1.5em 1.5em",
      paddingRight: `calc(${theme("spacing.4")} + 1.5em)`,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "&::placeholder": {
        color: theme("colors.text.caption") as string,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme("colors.brand.600")}`,
        outlineOffset: "2px",
        borderColor: theme("colors.brand.400") as string,
      },
      "&:disabled": {
        opacity: "0.4",
        cursor: "not-allowed",
        backgroundColor: theme("colors.surface.subtle") as string,
      },
    },
    ".type-hero-headline": {
      fontSize: theme("fontSize.display-1[0]") as string,
      lineHeight: theme("fontSize.display-1[1].lineHeight") as string,
      letterSpacing: theme("fontSize.display-1[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.bold") as string,
      color: theme("colors.text.heroHeadline") as string,
    },
    ".type-hero-sub": {
      fontSize: theme("fontSize.h2[0]") as string,
      lineHeight: theme("fontSize.h2[1].lineHeight") as string,
      letterSpacing: theme("fontSize.h2[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.medium") as string,
      color: theme("colors.text.heroSubHeadline") as string,
    },
    ".type-section-caption": {
      fontSize: theme("fontSize.small[0]") as string,
      lineHeight: theme("fontSize.small[1].lineHeight") as string,
      letterSpacing: theme("letterSpacing.editorial") as string,
      fontWeight: theme("fontWeight.light") as string,
      color: theme("colors.text.caption") as string,
    },
    ".type-section-hed": {
      fontSize: theme("fontSize.h1[0]") as string,
      lineHeight: theme("fontSize.h1[1].lineHeight") as string,
      letterSpacing: theme("fontSize.h1[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.semibold") as string,
      color: theme("colors.text.headline") as string,
    },
    ".type-section-sub": {
      fontSize: theme("fontSize.h2[0]") as string,
      lineHeight: theme("fontSize.h2[1].lineHeight") as string,
      letterSpacing: theme("fontSize.h2[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.medium") as string,
      color: theme("colors.text.subtitle") as string,
    },
    ".type-card-title": {
      fontSize: theme("fontSize.h3[0]") as string,
      lineHeight: theme("fontSize.h3[1].lineHeight") as string,
      letterSpacing: theme("fontSize.h3[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.semibold") as string,
      color: theme("colors.text.headline") as string,
    },
    ".type-metadata": {
      fontSize: theme("fontSize.h4[0]") as string,
      lineHeight: theme("fontSize.h4[1].lineHeight") as string,
      letterSpacing: theme("fontSize.h4[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.medium") as string,
      color: theme("colors.text.secondary") as string,
    },
    ".type-price": {
      fontSize: theme("fontSize.h4[0]") as string,
      lineHeight: theme("fontSize.h4[1].lineHeight") as string,
      letterSpacing: theme("fontSize.h4[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.semibold") as string,
      color: theme("colors.text.priceTag") as string,
    },
    ".type-overline": {
      fontSize: theme("fontSize.small[0]") as string,
      lineHeight: theme("fontSize.small[1].lineHeight") as string,
      letterSpacing: theme("letterSpacing.editorial") as string,
      fontWeight: theme("fontWeight.medium") as string,
      textTransform: "uppercase",
      color: theme("colors.text.overline") as string,
    },
    ".type-body": {
      fontSize: theme("fontSize.body[0]") as string,
      lineHeight: theme("fontSize.body[1].lineHeight") as string,
      letterSpacing: theme("fontSize.body[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.regular") as string,
      color: theme("colors.text.body") as string,
    },
    ".type-caption": {
      fontSize: theme("fontSize.small[0]") as string,
      lineHeight: theme("fontSize.small[1].lineHeight") as string,
      letterSpacing: theme("fontSize.small[1].letterSpacing") as string,
      fontWeight: theme("fontWeight.regular") as string,
      color: theme("colors.text.body") as string,
    },
    ".section-header-anchor": {
      display: "flex",
      alignItems: "center",
      gap: theme("spacing.3") as string,
      "&::before": {
        content: '""',
        display: "block",
        width: "32px",
        height: "1px",
        backgroundColor: theme("colors.brand.400") as string,
        flexShrink: "0",
      },
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
        small: ["12px", { lineHeight: "16px", letterSpacing: "0.05em" }],
        "cta-hero": [
          "clamp(1.125rem, 1vw + 0.9rem, 1.75rem)",
          { lineHeight: "1.15", letterSpacing: "0.03em" },
        ],
        spotlight: ["28px", { lineHeight: "32px", letterSpacing: "0.1em" }],
      }),
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
      maxWidth: {
        content: "1280px",
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