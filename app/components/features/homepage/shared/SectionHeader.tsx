import Link from "next/link";
import { cn } from "@/lib/utils/tailwind";

interface SectionHeaderProps {
  overline: string;
  title: string;
  href?: string;
  className?: string;
}

export default function SectionHeader({ overline, title, href, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="mb-2 md:mb-4">
        <p className="type-overline mb-2 md:mb-3">{overline}</p>
        <h2 className="section-header-anchor type-section-hed">{title}</h2>
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
