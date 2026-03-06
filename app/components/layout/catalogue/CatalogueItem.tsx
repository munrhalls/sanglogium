"use client";

import { useState } from "react";
import { CaretDownIcon, XCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";

interface CatalogueItemProps {
  label: string;
  children: React.ReactNode;
}

const NavbarLink = function ({
  label,
  toggleCatalogue,
  isOpen,
}: {
  label: string;
  toggleCatalogue: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      onClick={toggleCatalogue}
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
          "bg-brand-400 transition-all duration-300",
          isOpen ? "w-full" : "w-0 group-hover:w-8"
        )}
      />
    </button>
  );
};

export function CatalogueItem({ label, children }: CatalogueItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleCatalogue = () => setIsOpen((prev) => !prev);
  const closeCatalogue = () => setIsOpen(false);

  return (
    <div
      className={cn("static h-full")}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <NavbarLink
        label={label}
        toggleCatalogue={toggleCatalogue}
        isOpen={isOpen}
      />

      {isOpen && (
        <div
          className={cn(
            "top-[var(--desktop-header-h) - var(--desktop-catalogue-nav-h)] absolute left-0 z-50",
            "lg:h-[calc(100dvh-var(--desktop-header-h) - var(--desktop-catalogue-nav-h))]",
            "h-full w-full",
            "border-t border-gray-100 bg-brand-700 shadow-xl",
            "group/animation-settle"
          )}
          data-active={isOpen}
        >
          <div
            className={cn(
              "duration-450 h-full w-full opacity-15 transition-all ease-in-out will-change-transform",
              "group-data-[active=true]/animation-settle:opacity-100"
            )}
          >
            {children}
          </div>
          {/* <div
            className={cn(
              "absolute bottom-12 left-0",
              "flex w-full justify-center"
            )}
          >
            <button
              onClick={closeCatalogue}
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
          </div> */}
        </div>
      )}
    </div>
  );
}
