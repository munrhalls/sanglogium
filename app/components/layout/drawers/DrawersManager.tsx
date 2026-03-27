"use client";

import { Drawer } from "vaul";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import CarouselCatalogue from "@/app/components/layout/catalogue/CatalogueCarousel";
import { cn } from "@/lib/utils/tailwind";

// BACKLOG TODO - ensure the mobile catalogue / menu is not accessible when catalogue navbar is accessible (lg-touch/desktop related)
interface DrawerManagerProps {
  catalogueDataRaw: { catalogue: any[] };
}

export default function DrawerManager({ catalogueDataRaw }: DrawerManagerProps) {
  const { drawer, isOpen, closeDrawer } = useDrawer();

  return (
    <Drawer.Root
      direction="right"
      open={isOpen}
      onOpenChange={(open) => !open && closeDrawer()}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/10",
            "bottom-[var(--mobile-menu-h)] top-[var(--mobile-header-h)]",
            "lg-touch:bottom-[var(--mobile-menu-h)] lg-touch:top-[var(--desktop-header-h)]",
            "lg-desktop:bottom-0 lg-desktop:top-[calc(var(--desktop-header-h)_+_var(--desktop-catalogue-nav-h))]"
          )}
        />

        <Drawer.Content
          className={cn(
            "fixed right-0 z-50 flex w-full outline-none",
            "bottom-[var(--mobile-menu-h)] top-[var(--mobile-header-h)]",
            "lg-touch:bottom-[var(--mobile-menu-h)] lg-touch:top-[var(--desktop-header-h)]",
            "lg-touch:w-full",
            "lg-desktop:bottom-0 lg-desktop:top-[calc(var(--desktop-header-h)_+_var(--desktop-catalogue-nav-h))]"
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col bg-brand-700 shadow-lg",
              "overflow-y-auto"
            )}
          >
            <Drawer.Title className="sr-only">Drawer Content</Drawer.Title>
            {drawer === "catalogue" && <CarouselCatalogue catalogueDataRaw={catalogueDataRaw} />}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
