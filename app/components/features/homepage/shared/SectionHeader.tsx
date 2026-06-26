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
    <div className={cn("", className)}>
      <div className="mb-6 md:mb-8">
        <p className="type-overline mb-2">{overline}</p>
        <div className="flex items-end justify-between gap-4">
          <h2 className="section-header-anchor type-section-hed">{title}</h2>
        </div>
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
