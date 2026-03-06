"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/tailwind";
import { CaretDownIcon } from "@phosphor-icons/react";

export default function NavbarManager({
  navLinks,
  children,
}: {
  navLinks: { id: string; label: string }[];
  children: React.ReactNode[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  const toggleId = (id: string) => {
    setActiveId(prev => {
      const isClosing = prev === id;
      if (!isClosing) {
        const newIndex = navLinks.findIndex(l => l.id === id);
        setDisplayIndex(newIndex);
      }
      return isClosing ? null : id;
    });
  };

  const isOpen = activeId !== null;

  return (
    <div className="w-full">
      {/* 1. Navbar buttons */}
      <div className="flex justify-center gap-10 h-[var(--desktop-catalogue-nav-h)] items-center">
        {navLinks.map((link) => {
          const isActive = activeId === link.id;
          return (
            <button
              key={link.id}
              onClick={() => toggleId(link.id)}
              className={cn(
                "group flex items-center gap-2 text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300",
                isActive
                  ? "text-accent-500 font-semibold"
                  : "text-brand-400 hover:text-brand-200"
              )}
            >
              <span>{link.label}</span>
              <CaretDownIcon
                size={16}
                weight="bold"
                className={cn(
                  "transition-transform duration-300 ease-in-out",
                  isActive ? "rotate-180 text-accent-500" : "text-brand-500 group-hover:text-brand-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* 2. Dropdown Viewport */}
      <div
        className={cn(
          "absolute left-0 right-0 top-[calc(var(--desktop-header-h)+var(--desktop-catalogue-nav-h))] bottom-0 z-50",
          "bg-brand-700 shadow-2xl transition-[grid-template-rows,opacity] duration-300 ease-in-out grid",
          "overflow-hidden !scrollbar-none",
          isOpen ? "grid-rows-[1fr] opacity-100 border-t border-brand-500/20" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
      >
        <div className="min-h-0 overflow-hidden no-scrollbar">
          {/* 3. The Track */}
          <div
            className={cn(
               "flex w-full h-full no-scrollbar",
               "transition-transform duration-500 ease-out"
            )}
            style={{
              transform: `translateX(-${displayIndex * 100}%)`
            }}
          >
            {children.map((child, idx) => (
              <div
                key={navLinks[idx].id}
                className="w-full shrink-0 group/animation-settle overflow-hidden no-scrollbar"
                data-active={activeId === navLinks[idx].id}
              >
                <div className="h-full overflow-hidden no-scrollbar">
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}