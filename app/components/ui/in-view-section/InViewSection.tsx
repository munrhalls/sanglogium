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
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}
