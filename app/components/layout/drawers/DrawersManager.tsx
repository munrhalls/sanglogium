"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";

export default function DrawerManager() {
  const { drawer, isOpen, closeDrawer } = useDrawer();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* TARGETED OVERLAY
               - top: constrained by header
               - bottom: constrained by mobile menu (3.5rem / 14)
               - backdrop-blur-[2px]: customized subtle blur
            */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-[var(--mobile-menu-h)] left-0 right-0 top-[var(--header-h)] z-50 bg-black/10 backdrop-blur-[3px]"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-[var(--mobile-menu-h)] right-0 top-[var(--header-h)] z-50 w-full overflow-y-auto bg-transparent shadow-lg outline-none lg:w-1/4"
              >
                <Dialog.Title className="sr-only">Drawer Content</Dialog.Title>
                <div className="flex min-h-full w-full flex-col bg-brand-700">
                  {drawer === "catalogue" && <MobileCatalogue />}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
