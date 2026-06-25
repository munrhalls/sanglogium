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
    <div className={cn("mb-10", className)}>
      <p className="type-overline mb-2">{overline}</p>
      <div className="flex items-end justify-between gap-4">
        <h2 className="section-header-anchor type-section-hed">{title}</h2>
        {href && (
          <Link
            href={href}
            className="type-overline whitespace-nowrap text-brand-400 transition-colors hover:text-brand-100"
          >
            View All <span aria-hidden="true">&rsaquo;</span>
          </Link>
        )}
      </div>
    </div>
  );
}
