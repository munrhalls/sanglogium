import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/platform/utils/tailwind";
import HeaderView from "@/features/shell/view/HeaderView";
import { CatalogueNavbarView } from "@/features/catalogue/server";
import DrawersManager from "@/features/shell/ui/DrawersManager";
import ActionBar from "@/features/shell/ui/ActionBar";
import Footer from "@/features/shell/ui/Footer";
import { WebVitals } from "@/platform/analytics/WebVitals";
import { SpeedInsights } from "@/platform/analytics/SpeedInsights";
import { Suspense } from "react";
import type { ComponentProps, ReactNode } from "react";

interface StoreShellProps {
  children: ReactNode;
  catalogueDataRaw: ComponentProps<typeof CatalogueNavbarView>["catalogueDataRaw"];
  isAuthenticated: boolean;
}

export default function StoreShellView({ children, catalogueDataRaw, isAuthenticated }: StoreShellProps) {
  return (
    <NuqsAdapter>
      <div
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden",
          "bg-brand-800",
          "h-full w-full flex-1",
          "shadow-[0_0_40px_rgba(246,227,213,0.015)]"
        )}
      >
        <HeaderView isAuthenticated={isAuthenticated} />
        <CatalogueNavbarView catalogueDataRaw={catalogueDataRaw} />
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
          <ActionBar isAuthenticated={isAuthenticated} />
          <WebVitals />
          <SpeedInsights />
        </Suspense>
      </div>
    </NuqsAdapter>
  );
}
