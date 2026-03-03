import { cn } from "@/lib/utils/tailwind";
import type { CatalogueItem } from "../data";

type CatalogueSection = CatalogueItem["sections"][number];

export default function DetailSection({
  section,
}: {
  section: CatalogueSection;
}) {
  return (
    <div
      className={cn(
        "translate-y-2 opacity-0",
        "space-y-4 md:space-y-6",
        "transition-[opacity,transform] delay-0 duration-300 ease-in",
        "group-data-[active=true]/animation-settle:translate-y-0 group-data-[active=true]/animation-settle:opacity-100 group-data-[active=true]/animation-settle:delay-150"
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
            style={{ "--index": linkIdx } as React.CSSProperties}
            className={cn(
              "translate-y-2 opacity-0",
              "transition-[opacity,transform] delay-0 duration-300 ease-in",
              "group-data-[active=true]/animation-settle:translate-y-0 group-data-[active=true]/animation-settle:opacity-100",
              "group-data-[active=true]/animation-settle:[transition-delay:calc(150ms+(var(--index)*100ms))]"
            )}
          >
            <a
              href="#"
              className={cn(
                "pl-2 text-body text-secondary-300",
                "transition-colors hover:text-brand-200 active:text-brand-400"
              )}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
