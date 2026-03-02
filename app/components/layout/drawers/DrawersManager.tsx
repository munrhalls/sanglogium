"use client";

import { Drawer } from "vaul";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";
import { cn } from "@/lib/utils/tailwind";

export default function DrawerManager() {
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
            "bottom-[var(--mobile-menu-h)] top-[var(--mobile-header-h)]"
          )}
        />

        <Drawer.Content
          className={cn(
            "fixed right-0 z-50 flex w-full outline-none",
            "bottom-[var(--mobile-menu-h)] top-[var(--mobile-header-h)]",
            // on lg width but md height w-3/4
            "@media(min-width:1024px)and(max-height:850px):!w-3/4"
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col bg-brand-700 shadow-lg",
              "overflow-y-auto"
            )}
          >
            <Drawer.Title className="sr-only">Drawer Content</Drawer.Title>
            {drawer === "catalogue" && <MobileCatalogue />}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
