"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";

export default function DrawerManager() {
  const { drawer, isOpen } = useDrawer();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 z-50 mb-14 mt-[var(--header-h)] w-full overflow-y-auto bg-white shadow-lg lg:w-1/4"
        >
          {drawer === "catalogue" && <MobileCatalogue />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
