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
            fixed inset-0 z-50 bg-black/10
            top-[var(--header-h)] bottom-[var(--mobile-menu-h)]
            /* FAST FEEDBACK OVERLAY */
            duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          "
        />

        <Dialog.Content
          className="
            fixed right-0 z-50 w-full overflow-y-auto bg-transparent shadow-lg outline-none lg:w-1/4
            top-[var(--header-h)] bottom-[var(--mobile-menu-h)]

            /* GENTLE GLIDE PHYSICS */
            /* 1. Long duration for 'slow' feel */
            duration-1500
            /* 2. Custom Bezier: High initial entry, long 'infinite' slowdown */
            [transition-timing-function:cubic-bezier(0.2,0,0,1)]

            /* 3. Perceptual 'Short-Slide': Materializes from 15% distance */
            data-[state=open]:animate-in
            data-[state=open]:fade-in-0
            data-[state=open]:slide-in-from-right-[15%]

            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=closed]:slide-out-to-right-[15%]
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