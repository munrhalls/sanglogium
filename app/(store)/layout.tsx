// @ts-expect-error: Type declarations for CSS imports are not present in this project
import "./../globals.css";
import { Suspense } from "react";
import { metadata } from "./configuration";
import { montserrat } from "./configuration";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";

import Loader from "@/app/components/common/Loader";

import Header from "@/app/components/layout/header/Header";
import CatalogueWrapper from "../components/layout/catalogue/CatalogueWrapper";
import DrawersManager from "../components/layout/drawers/DrawersManager";
import MobileMenu from "../components/layout/mobile/MobileMenu";

export { metadata };

// test
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  drawer: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.className} h-full w-full antialiased`}
    >
      <ClerkProvider>
        {/* layout should be separate from content */}
        {/* <body
          className={`relative grid w-full grid-rows-[auto_1fr_auto] overflow-x-hidden font-sans lg:grid-rows-[auto_auto_1fr_auto]`}
        > */}
        <body className="relative w-full">
          <Suspense fallback={<Loader />}>
            <NuqsAdapter>
              <Header />
              <CatalogueWrapper />
              {children}
              {/* <div className="relative h-full min-h-0 overflow-hidden">
                <div className="relative h-full min-h-0 overflow-y-auto">
                  {children}
                </div>
              </div> */}

              <MobileMenu />
              <DrawersManager />
            </NuqsAdapter>
          </Suspense>
        </body>
      </ClerkProvider>
    </html>
  );
}
