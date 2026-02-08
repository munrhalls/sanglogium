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

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className="bg-brand-700 text-brand-100 selection:bg-brand-accent-600 selection:text-brand-800 flex min-h-screen flex-col font-sans">
        <ClerkProvider>
          <NuqsAdapter>
            <Header />

            <main className="relative flex w-full flex-1 flex-col">
              {children}
            </main>

            <DrawersManager />
            <MobileMenu />

            <Footer />
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
