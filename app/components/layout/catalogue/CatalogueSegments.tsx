import { cn } from "@/lib/utils/tailwind";
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
    <div
      className={cn(
        "relative h-full max-h-full w-full max-w-screen-xl",
        "landscape:no-scrollbar overflow-y-auto",
        "px-8 pt-8"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-0",
          "pointer-events-none overflow-hidden",
          "opacity-[0.05] grayscale"
        )}
      >
        <div
          className={cn(
            "relative h-full w-full",
            "translate-x-1/4 translate-y-1/4 scale-[3]"
          )}
        >
          <Image
            src={data.imageUrl}
            alt=""
            fill
            className={cn("object-contain object-center", "sm:object-bottom")}
            priority
          />
        </div>
      </div>
      {/* Content Layer */}
      <div
        className={cn(
          "relative z-10 min-h-full w-full max-w-screen-xl",
          "space-y-4 pb-12 pl-8 sm:pl-12",
          "flex flex-col landscape:justify-center"
        )}
      >
        <div
          className={cn(
            "mx-auto my-auto flex flex-col flex-nowrap items-start gap-8",
            "w-fit max-w-full",
            "sm:gap-12",
            "lg:grid lg:grid-cols-3"
          )}
        >
          {data.sections.map((section, idx) => (
            <div
              key={section.title}
              className={cn(
                "translate-y-2 opacity-0",
                "space-y-4",
                "transition-[opacity,transform] delay-0 duration-300 ease-in",
                "group-data-[active=true]/slide:translate-y-0 group-data-[active=true]/slide:opacity-100 group-data-[active=true]/slide:delay-150"
              )}
            >
              <h3
                className={cn(
                  "mx-auto uppercase",
                  "xs:max-w-[320px] max-w-[280px] text-h4",
                  "text-brand-400",
                  "sm:max-w-sm sm:text-h3"
                )}
              >
                {section.title}
              </h3>
              <ul className="space-y-4 pl-2">
                {section.links.map((link, linkIdx) => (
                  <li
                    key={link}
                    // pass the index to a CSS variable
                    style={{ "--index": linkIdx } as React.CSSProperties}
                    className={cn(
                      "translate-y-2 opacity-0",
                      "transition-[opacity,transform] delay-0 duration-300 ease-in",
                      "group-data-[active=true]/slide:translate-y-0 group-data-[active=true]/slide:opacity-100",
                      "group-data-[active=true]/slide:[transition-delay:calc(150ms+(var(--index)*100ms))]"
                    )}
                  >
                    <a
                      href="#"
                      className={cn(
                        "pl-2 text-body text-secondary-300",
                        "transition-colors hover:text-brand-200 active:text-brand-400",
                        "sm:text-h4"
                      )}
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
