export const brand = {
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

export const secondary = {
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

export const accent = {
  100: "#FBF6E8",
  200: "#F5E9C8",
  300: "#EEDB9F",
  400: "#E5C158",
  500: "#D4AF37",
  600: "#B8952E",
  700: "#8F7324",
  800: "#6B561C",
};

export const success = {
  500: "#4ADE80",
  700: "#15803D",
  800: "#10642D",
};

export const error = {
  500: "#EF4444",
  700: "#991B1B",
};

export const warning = {
  500: "#F59E0B",
  700: "#92400E",
};

export const surface = {
  page: brand[700],
  card: secondary[900],
  elevated: secondary[800],
  subtle: brand[800],
  highlight: brand[200],
  productImage: brand[200],
} as const;

export const textTokens = {
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

export const border = {
  primary: secondary[300],
  secondary: secondary[700],
} as const;
