"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";

export default function DrawerManager() {
  const { drawer, isOpen, closeDrawer } = useDrawer();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="
            fixed left-0 right-0 z-50
            top-[var(--header-h)] bottom-[var(--mobile-menu-h)]
            /* ANIMATION */
            data-[state=open]:animate-in data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          "
        />

        <Dialog.Content
          className="
            fixed right-0 z-50 w-full overflow-y-auto bg-transparent shadow-lg outline-none lg:w-1/4
            top-[var(--header-h)] bottom-[var(--mobile-menu-h)]
            /* ANIMATION */
            duration-500 ease-in-out
            data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full
            data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full
          "
        >
          <Dialog.Title className="sr-only">Drawer Content</Dialog.Title>
          <div className="flex min-h-full w-full flex-col bg-brand-700">
            {drawer === "catalogue" && <MobileCatalogue />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}