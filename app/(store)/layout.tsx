import "./../globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils/tailwind";

// Fonts & Config
import { metadata } from "./configuration";
import { montserrat } from "./configuration";

// Global Components
import Header from "@/app/components/layout/header/Header";
import Footer from "@/app/components/layout/footer/Footer";
import DrawersManager from "@/app/components/layout/drawers/DrawersManager";
import ActionBar from "@/app/components/layout/navigation/ActionBar";
import CatalogueNavbar from "@/app/components/layout/catalogue/CatalogueNavbar";
import { Suspense } from "react";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(montserrat.variable, "antialiased")}>
      <body
        className={cn(
          "flex h-dvh w-full flex-col overflow-hidden",
          "bg-brand-800 font-sans text-brand-100",
          "selection:bg-brand-accent-600 selection:text-brand-800"
        )}
      >
        <ClerkProvider>
          <NuqsAdapter>
            <div
              className={cn(
                "relative flex flex-1 flex-col overflow-hidden",
                "bg-brand-700",
                "mx-auto max-w-[1440px]",
                "h-full w-full flex-1"
              )}
            >
              <Header />
              <CatalogueNavbar />
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
                <DrawersManager />
                <ActionBar />
              </Suspense>
            </div>
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
