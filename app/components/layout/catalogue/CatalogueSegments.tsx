import type { CatalogueItem } from "./data";

export default function CatalogueSegments({ data }: { data: CatalogueItem }) {
  return (
    <div className="w-full max-w-screen-xl px-8">
      <div className="flex flex-col flex-nowrap justify-start gap-12 sm:grid-cols-2 sm:gap-8 md:grid lg:col-span-8 lg:grid-cols-3">
        {data.sections.map((section, idx) => (
          <div
            key={section.title}
            className="space-y-4 duration-700 animate-in fade-in slide-in-from-right-4"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <h3 className="text-h4 uppercase text-brand-400">
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="pl-2 text-body text-secondary-300 transition-colors hover:text-brand-200 active:text-brand-400"
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
