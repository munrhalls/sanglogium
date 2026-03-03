"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDownIcon, XCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";

interface CatalogueWrapperProps {
  label: string;
  children: React.ReactNode;
}

export function CatalogueWrapper({ label, children }: CatalogueWrapperProps) {
  const [isOpen2, setIsOpen2] = useState(true);
  const toggleMenu = () => setIsOpen2((prev) => !prev);
  const closeMenu = () => setIsOpen2(false);

  const isOpen = false;
  return (
    <div
      className={cn("static h-full")}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Dropdown Trigger */}
      <button
        onClick={toggleMenu}
        className={cn(
          "group relative flex h-full items-center gap-2",
          "px-6 focus:outline-none"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span
          className={cn(
            "text-sm font-medium tracking-[0.2em] text-brand-400",
            "transition-colors group-hover:text-accent-500"
          )}
        >
          {label}
        </span>
        <CaretDownIcon
          weight="light"
          size={14}
          className={cn(
            "text-brand-400 transition-colors duration-300",
            "group-hover:text-accent-500",
            isOpen && "rotate-180"
          )}
        />

        <div
          className={cn(
            "absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2",
            "bg-accent-500 transition-all duration-300",
            isOpen ? "w-full" : "w-0 group-hover:w-8"
          )}
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
            className={cn(
              "top-[var(--desktop-header-h) - var(--desktop-catalogue-nav-h)] absolute left-0 z-50 w-full",
              "border-t border-gray-100 bg-white shadow-xl",
              "lg:h-[calc(100dvh-var(--desktop-header-h) - var(--desktop-catalogue-nav-h))]"
            )}
          >
            {children}
            <div
              className={cn(
                "absolute bottom-12 left-0",
                "flex w-full justify-center"
              )}
            >
              <button
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 bg-transparent p-2",
                  "text-xs font-bold uppercase tracking-[0.3em] text-brand-400",
                  "transition-colors hover:text-secondary-100"
                )}
                aria-label="Close Menu"
              >
                <span>Close</span>
                <XCircleIcon size={20} weight="thin" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
