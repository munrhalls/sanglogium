"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDownIcon } from "@phosphor-icons/react";

interface CatalogueWrapperProps {
  label: string;
  children: React.ReactNode;
}

export function CatalogueWrapper({ label, children }: CatalogueWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="static h-full"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Dropdown Trigger */}
      <button
        className="group relative flex h-full items-center gap-2 px-6 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium tracking-[0.2em] text-brand-400 transition-colors group-hover:text-accent-500">
          {label}
        </span>
        <CaretDownIcon
          weight="light"
          size={14}
          className={`text-brand-400 transition-transform duration-300 group-hover:text-accent-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        <div
          className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-accent-500 transition-all duration-300 ${
            isOpen ? "w-full" : "w-0 group-hover:w-8"
          }`}
        />
      </button>

      {/* The Mega Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-[var(--site-header-h)] z-50 h-[calc(100vh-var(--site-header-h))] w-full border-t border-gray-100 bg-white shadow-xl"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
