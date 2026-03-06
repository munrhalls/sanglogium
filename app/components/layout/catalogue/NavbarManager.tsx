"use client";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/tailwind";

export default function NavbarManager({
  navLinks,
  children,
}: {
  navLinks: { id: string; label: string }[];
  children: React.ReactNode[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeIndex = useMemo(() =>
    navLinks.findIndex(link => link.id === activeId),
    [activeId, navLinks]
  );

  const toggleId = (id: string) => {
    // Logika przełączania: jeśli ten sam -> zamknij (null), jeśli inny -> zmień
    setActiveId(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-full">
      {/* 1. Navbar buttons */}
      <div className="flex justify-center gap-8 h-[var(--desktop-catalogue-nav-h)] items-center">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => toggleId(link.id)}
            className={cn(
              "text-sm font-medium tracking-[0.2em] uppercase transition-colors relative",
              activeId === link.id ? "text-brand-200" : "text-brand-400 hover:text-brand-300"
            )}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* 2. Dropdown Viewport */}
      <div
        className={cn(
          "absolute left-0 right-0 top-[calc(var(--desktop-header-h)+var(--desktop-catalogue-nav-h))] bottom-0 z-50",
          "bg-brand-700 shadow-2xl transition-[grid-template-rows,opacity] duration-300 ease-in-out grid",
          // Używamy opacity dodatkowo, by uniknąć glitchu przy pierwszym montowaniu
          activeId ? "grid-rows-[1fr] opacity-100 border-t border-brand-500/20" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
      >
        <div className="min-h-0 overflow-hidden"> {/* To usuwa scrollbar przy slide */}
          {/* 3. The Track */}
          <div
            className="flex w-full h-full transition-transform duration-500 ease-out no-scrollbar"
            style={{ transform: `translateX(-${activeIndex === -1 ? 0 : activeIndex * 100}%)` }}
          >
            {children.map((child, idx) => (
              <div
                key={navLinks[idx].id}
                className="w-full shrink-0 group/animation-settle overflow-hidden no-scrollbar"
                // KLUCZ: data-active musi być na tym samym poziomie co group/animation-settle
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