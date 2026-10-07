import "./../globals.css";
import "@/platform/utils/suppressWarnings";
import { cn } from "@/platform/utils/tailwind";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

// Global Components
import { StoreShell } from "@/features/shell/server";
import GoogleAnalytics from "@/platform/analytics/GoogleAnalytics";
import { getCatalogueForNavigation } from "@/features/catalogue/server";
import { hasSessionCookie } from "@/features/auth/server";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  alternates: {
    canonical: "https://sanglogium.com",
  },
  title: "Sang Logium Audio Shop",

  description: "E-commerce store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get catalogue data from pre-built VFS
  const catalogueDataRaw = { catalogue: getCatalogueForNavigation() };
  const isAuthenticated = await hasSessionCookie();

  return (
    <html lang="en" className={cn(montserrat.variable, "antialiased")}>
      <head>
        {/* Performance: Preconnect to Sanity CDN for faster image loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "flex h-dvh w-full flex-col overflow-hidden",
          "bg-brand-800 font-sans text-brand-100",
          "selection:bg-brand-accent-600 selection:text-brand-800"
        )}
      >
        <StoreShell catalogueDataRaw={catalogueDataRaw} isAuthenticated={isAuthenticated}>{children}</StoreShell>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
