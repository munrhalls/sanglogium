import "./../globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";

// Fonts & Config
import { metadata } from "./configuration";
import { montserrat } from "./configuration";

// Global Components
import Header from "@/app/components/layout/header/Header";
import Footer from "@/app/components/layout/footer/Footer";
import DrawersManager from "@/app/components/layout/drawers/DrawersManager";
import MobileMenu from "@/app/components/layout/mobile/MobileMenu";
import CatalogueNavbar from "@/app/components/layout/catalogue/CatalogueNavbar";
import { Suspense } from "react";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className="selection:bg-brand-accent-600 flex h-dvh flex-col overflow-hidden bg-brand-700 font-sans text-brand-100 selection:text-brand-800">
        <ClerkProvider>
          <NuqsAdapter>
            <Header />
            <CatalogueNavbar />
            <main className="relative flex h-full w-full flex-1 flex-col overflow-y-auto overflow-x-hidden pb-[var(--mobile-menu-h)]">
              {children}
              <Footer />
            </main>

            <Suspense fallback={null}>
              <DrawersManager />
              <MobileMenu />
            </Suspense>
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
