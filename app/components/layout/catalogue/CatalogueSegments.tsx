import type { CatalogueItem } from "./data";
import Image from "next/image";

export default function CatalogueSegments({
  data,
  index,
}: {
  data: CatalogueItem;
  index: number;
}) {
  return (
  <div className="sm:h-full relative w-full max-w-screen-xl px-8 landscape:overflow-y-auto landscape:no-scrollbar landscape:max-h-full landscape:h-full landscape:py-4 landscape:px-2 sm:h-1/2">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.05] grayscale">
        <div className="relative h-full w-full scale-[3] translate-x-1/4 translate-y-1/4">
          <Image
            src={data.imageUrl}
            alt=""
            fill
            className="object-contain object-center sm:object-bottom"
            priority
          />
        </div>
      </div>
      <div className="w-full max-w-screen-xl px-8 landscape:overflow-y-auto landscape:no-scrollbar landscape:max-h-full landscape:h-full landscape:py-4 landscape:px-4">
        <div className="mx-auto max-w-[184px]  flex flex-col flex-nowrap items-start gap-12 landscape:gap-8 sm:flex sm:flex-wrap sm:gap-4 lg:grid lg:gap-8 lg:grid-cols-3">
          {data.sections.map((section, idx) => (
              <div
                key={section.title}
                className=" opacity-0 translate-y-2 transition-[opacity,transform] duration-300 ease-in delay-0
    group-data-[active=true]/slide:opacity-100
    group-data-[active=true]/slide:translate-y-0
    group-data-[active=true]/slide:delay-150 space-y-4 landscape:min-h-0"
              >
                <h3 className="text-h4 uppercase text-brand-400 mx-auto max-w-[280px] xs:max-w-[320px] sm:max-w-sm">
                  {section.title}
                </h3>
                <ul className="space-y-4 pl-2">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={link}
                      // We pass the index to a CSS variable
                      style={{ "--index": linkIdx } as React.CSSProperties}
                      className="
                        /* 1. Base State */
                        opacity-0 translate-y-2
                        transition-[opacity,transform] duration-300 ease-in delay-0

                        /* 2. The Trigger: Slide becomes active */
                        group-data-[active=true]/slide:opacity-100
                        group-data-[active=true]/slide:translate-y-0

                        /* 3. The Calculated Stagger */
                        /* Base delay (150ms) + (Index * 50ms) */
                        /* This creates the 'waterfall' effect */
                        group-data-[active=true]/slide:[transition-delay:calc(150ms+(var(--index)*100ms))]
                      "
                    >
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
    </div>
  );
}
