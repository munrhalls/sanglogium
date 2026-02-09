// should be 88px height
// full width
// bg brand-800
// should only have 3 catalogue action items - Headphones / Audio Electronics / Accessories
// should have a dropdown on hover for each of the 3 categories, showing the subcategories
// should have a nice icon or little "hitch" or whatever looks nice as indicator for the dropdown
// should not be concerned with mobile responsiveness, as this will be hidden on mobile and replaced with the mobile menu, which will be triggered by the hamburger menu in the mobile menu
// should be concerned with accessibility, so the dropdown should be accessible via keyboard navigation and screen readers
// should be concerned with performance, so the dropdown should not cause any jank or lag when hovering over the categories
// should be concerned with SEO, so the dropdown should be crawlable by search engines and should not use any techniques that would prevent it from being indexed
// should be concerned with maintainability, so the code should be well-structured and easy to understand for other developers who may work on it in the future
// the catalogue navbar should be separate from the dropdown component, so that it's easier to manage
// the catalogue navbar should have only 3 items and they should be hardcoded for now, as integrating with backend fetch is a separate latern concern and step
// should have style - bg is brand 800, text is accent-600, hover text is accent-500 with nice underline that is not full width of the item
// the navbar should split space into 3 sections and each item should be centered in its section, so that it looks balanced and visually appealing
// the dropdown is a separate concern, for now, it should just be navbar implemented nicely
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
