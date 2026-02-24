"use client";

import { motion } from "framer-motion";

export function InViewSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.2,
        delay: delay + 0.1,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
