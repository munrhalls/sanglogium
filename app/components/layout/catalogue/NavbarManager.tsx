"use client";
import React, { useState, createContext, useEffect } from "react";
import { NavbarManagerProps } from "@/app/components/layout/carousel/types";
import { cn } from "@/lib/utils/tailwind";
import { CaretDownIcon } from "@phosphor-icons/react";

// Context for providing closeMenu to nested components
const NavContext = createContext<{ closeMenu: () => void }>({ closeMenu: () => {} });

export const useNavContext = () => React.useContext(NavContext);

// BACKLOG TODO - make sure navbar manager is hidden on anything less than lg-desktop (including lg-touch)
// BACKLOG TODO - make sure catalogue carousel drawer is not accessible on lg-desktop -> should result in normal homepage with navbar on lg-desktop

export default function NavbarManager({
  navLinks,
  children,
}: NavbarManagerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  const toggleId = (id: string) => {
    setActiveId(prev => {
      const isClosing = prev === id;
      if (!isClosing) {
        const newIndex = navLinks.findIndex((l: { id: string }) => l.id === id);
        setDisplayIndex(newIndex);
      }
      return isClosing ? null : id;
    });
  };

  const closeMenu = () => setActiveId(null);

  const isOpen = activeId !== null;

  return (
    <NavContext.Provider value={{ closeMenu }}>
      <div className="w-full">
      {/* 1. Navbar buttons */}
      <div className="flex justify-center gap-10 h-[var(--desktop-catalogue-nav-h)] items-center">
        {navLinks.map((link: { id: string; label: string }) => {
          const isActive = activeId === link.id;
          return (
            <button
              key={link.id}
              onClick={() => toggleId(link.id)}
              className={cn(
                "group flex items-center gap-2 text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300 rounded-none",
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
          "absolute left-0 right-0 top-[calc(var(--desktop-header-h)+var(--desktop-catalogue-nav-h))] bottom-0 z-50 rounded-none",
          "bg-brand-700 shadow-2xl transition-[grid-template-rows,opacity] duration-300 ease-in-out grid",
          "overflow-hidden !scrollbar-none",
          isOpen ? "grid-rows-[1fr] opacity-100 border-t border-brand-500/20" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
      >
        <div className="min-h-0 overflow-hidden no-scrollbar">
          {/* 3. The Track */}
          <div
            className={cn(
              "flex w-full h-full no-scrollbar rounded-none",
              "transition-transform duration-500 ease-out"
            )}
            style={{
              transform: `translateX(-${displayIndex * 100}%)`
            }}
          >
            {children?.map((child: React.ReactNode, idx: number) => (
              <div
                key={navLinks[idx]?.id}
                className="w-full shrink-0 group/animation-settle overflow-hidden no-scrollbar"
                data-active={activeId === navLinks[idx]?.id}
              >
                <div className="h-full overflow-hidden no-scrollbar">
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 4. Fixed Bottom Close Bar - Teraz jest jeden, stabilny */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8 pt-4 bg-gradient-to-t from-brand-700 via-brand-700/80 to-transparent pointer-events-none">
          <button
            onClick={closeMenu}
            className="pointer-events-auto group flex items-center gap-2 px-6 py-2 text-[10px] tracking-[0.3em] uppercase text-brand-500 transition-colors hover:text-accent-500 rounded-none"
          >
            <span>
              Close
            </span>
            <CaretDownIcon
              size={14}
              weight="bold"
              className="rotate-180 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
      </div>
    </NavContext.Provider>
  );
}
