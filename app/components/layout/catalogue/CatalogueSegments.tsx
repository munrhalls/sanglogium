import type { CatalogueItem } from "./data";

export default function CatalogueSegments({ data }: { data: CatalogueItem }) {
  return (
    <div className="mx-auto w-fit">
      <div className="flex flex-col flex-nowrap justify-start gap-8 sm:grid-cols-2 sm:gap-8 md:grid lg:col-span-8 lg:grid-cols-3">
        {data.sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-400">
              {section.title}
            </h3>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="pl-2 text-base text-secondary-300 transition-colors hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
