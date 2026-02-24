"use client";

import { motion } from "framer-motion";
import { useCarousel } from "@/app/components/ui/carousel/Carousel";

export function SlideActiveTrigger({
  index,
  children,
  delay = 0,
}: {
  index: number;
  children: React.ReactNode;
  delay?: number;
}) {
  // const { activeIndex } = useCarousel();
  // const isActive = activeIndex === index;

  return (
    <motion.div
      // Animate based on the BOOLEAN state, not the mount cycle
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay + 0.4, // Hard-coded wait for Drawer entrance (0.4s)
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
