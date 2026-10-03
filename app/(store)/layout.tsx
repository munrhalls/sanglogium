import "./../globals.css";
import "../suppress-warnings";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils/tailwind";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

// Global Components
import Header from "@/app/components/layout/header/Header";
import Footer from "@/app/components/layout/footer/Footer";
import DrawersManager from "@/app/components/layout/drawers/DrawersManager";
import ActionBarServer from "@/app/components/layout/navigation/ActionBarServer";
import { CatalogueNavbar } from "@/features/catalogue";
import { WebVitals } from "@/app/components/analytics/WebVitals";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import { getCatalogueForNavigation } from "@/features/catalogue/server";
import { Suspense } from "react";

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
        <NuqsAdapter>
            <div
              className={cn(
                "relative flex flex-1 flex-col overflow-hidden",
                "bg-brand-800",
                "h-full w-full flex-1",
                "shadow-[0_0_40px_rgba(246,227,213,0.015)]"
              )}
            >
              <Header />
              <CatalogueNavbar catalogueDataRaw={catalogueDataRaw} />
              <main
                className={cn(
                  "relative flex h-full w-full flex-1 flex-col",
                  "overflow-y-auto overflow-x-hidden",
                  "scrollbar-none",
                  "pb-[var(--mobile-menu-h)]",
                  "shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                )}
              >
                {children}
                <Footer />
              </main>

              <Suspense fallback={null}>
                <DrawersManager catalogueDataRaw={catalogueDataRaw} />
                <ActionBarServer />
                <WebVitals />
                <SpeedInsights />
              </Suspense>
            </div>
          </NuqsAdapter>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
