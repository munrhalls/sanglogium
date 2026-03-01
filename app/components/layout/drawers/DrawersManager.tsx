"use client";

import { Drawer } from "vaul";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";

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
          className="fixed inset-0 z-50 bg-black/10 top-[var(--mobile-header-h)] bottom-[var(--mobile-menu-h)]"
        />

        <Drawer.Content
          className="fixed right-0 z-50 flex w-full outline-none lg:w-1/4 top-[var(--mobile-header-h)] bottom-[var(--mobile-menu-h)]"
        >
          <div className="flex w-full flex-col overflow-y-auto bg-brand-700 shadow-lg">
            <Drawer.Title className="sr-only">Drawer Content</Drawer.Title>
            {drawer === "catalogue" && <MobileCatalogue />}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}