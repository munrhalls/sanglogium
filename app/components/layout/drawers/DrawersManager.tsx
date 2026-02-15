"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";

export default function DrawerManager() {
  const { drawer, isOpen, closeDrawer } = useDrawer();

  return (
    // 1. Radix controls accessibility and focus
    // 2. We sync 'open' to nuqs state
    // 3. onOpenChange handles ESC key and overlay clicks
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* OVERLAY / BACKDROP */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            {/* CONTENT */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-50 mb-14 mt-[var(--header-h)] w-full overflow-y-auto bg-white shadow-lg outline-none lg:w-1/4"
              >
                {/* Accessibility Requirement:
                  Radix expects a Title. If you don't want it visible,
                  use VisuallyHidden (or sr-only class).
                */}
                <Dialog.Title className="sr-only">Mobile Menu</Dialog.Title>

                {drawer === "catalogue" && <MobileCatalogue />}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
