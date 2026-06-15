import Link from "next/link";

interface SectionHeaderProps {
  overline: string;
  title: string;
  href: string;
}

export default function SectionHeader({ overline, title, href }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <p className="type-overline mb-2">{overline}</p>
      <div className="flex items-center justify-between">
        <h2 className="section-header-anchor type-section-hed">{title}</h2>
        <Link href={href} className="btn-ghost text-sm">
          View All
        </Link>
      </div>
    </div>
  );
}
