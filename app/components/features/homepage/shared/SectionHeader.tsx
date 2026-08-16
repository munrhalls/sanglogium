import Link from "next/link";
import { cn } from "@/lib/utils/tailwind";

interface SectionHeaderProps {
  overline: string;
  title: string;
  href?: string;
  className?: string;
  titleClassName?: string;
}

export default function SectionHeader({ overline, title, href, className, titleClassName }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-2 xs:gap-4", className)}>
      <div className="mb-2 md:mb-4 lg:mb-2">
        <p className="type-overline mb-2 md:mb-3 lg:mb-2 lg:tracking-widest">{overline}</p>
        <h2 className={cn("section-header-anchor type-section-hed lg:text-h3", titleClassName)}>{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs whitespace-nowrap text-brand-400 transition-colors hover:text-brand-100 tracking-widest uppercase font-light"
        >
          View All <span aria-hidden="true">&rsaquo;</span>
        </Link>
      )}
    </div>
  );
}
