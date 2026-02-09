import React from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const CATALOGUE_ITEMS = [
  { id: "headphones", label: "Headphones" },
  { id: "audio-electronics", label: "Audio Electronics" },
  { id: "accessories", label: "Accessories" },
];

const CatalogueNavbar = () => {
  return (
    <nav
      className="hidden h-[88px] w-full shrink-0 items-center bg-brand-800 md:flex"
      aria-label="Catalogue Navigation"
    >
      <ul className="flex h-full w-full">
        {CATALOGUE_ITEMS.map((item) => (
          <li
            key={item.id}
            className="group relative flex h-full flex-1 cursor-pointer items-center justify-center focus-within:outline-none"
            tabIndex={0}
          >
            <div
              className="relative flex items-center gap-2 text-brand-400 transition-colors duration-300 group-hover:text-accent-500 group-focus:text-accent-500"
              aria-haspopup="true"
            >
              <span className="camelcase text-sm font-medium tracking-[0.2em]">
                {item.label}
              </span>

              <CaretDown
                weight="light"
                size={14}
                className="transition-transform duration-300 group-hover:rotate-180"
              />

              <div
                className="absolute -bottom-2 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-accent-500 transition-all duration-300 group-hover:w-8 group-focus:w-8"
                aria-hidden="true"
              />
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CatalogueNavbar;
