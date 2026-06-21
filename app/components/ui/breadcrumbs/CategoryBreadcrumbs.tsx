import Link from "next/link";
import catalogueIndex from "@/data/catalogue-index.json";

interface BreadcrumbsProps {
  categoryParts: string[];
}

export default function Breadcrumbs({
  categoryParts,
}: BreadcrumbsProps) {
  // Build href for each part
  const buildHref = (index: number) => {
    return `/products/${categoryParts.slice(0, index + 1).join("/")}`;
  };

  // Format part for display (capitalize, replace hyphens with spaces)
  const formatPart = (part: string) => {
    return part
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Resolve a segment to its catalogue title via slugToIdMap + slotMetadataMap.
  // Tries path-qualified key first (e.g. "headphones/monitors-iems"), then bare slug.
  const resolveDisplayName = (part: string, index: number): string => {
    const pathQualifiedKey = categoryParts.slice(0, index + 1).join("/");
    const { slugToIdMap, slotMetadataMap } = catalogueIndex as any;

    const id =
      slugToIdMap[pathQualifiedKey as keyof typeof slugToIdMap] ??
      slugToIdMap[part as keyof typeof slugToIdMap];

    if (id) {
      const metadata = slotMetadataMap[id as keyof typeof slotMetadataMap];
      if (metadata?.title) return metadata.title;
    }

    return formatPart(part);
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6" data-testid="breadcrumb">
      <ol className="flex items-center gap-2">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="type-caption text-secondary hover:text-primary hover:underline transition-colors"
          >
            Home
          </Link>
        </li>

        {/* Separator */}
        <li>
          <span className="type-caption text-caption select-none">/</span>
        </li>

        {categoryParts.map((part, index) => {
          const isLast = index === categoryParts.length - 1;
          const href = buildHref(index);

          return (
            <li key={part} className="flex items-center gap-2">
              {isLast ? (
                <span className="type-caption text-primary font-medium">
                  {resolveDisplayName(part, index)}
                </span>
              ) : (
                <>
                  <Link
                    href={href}
                    className="type-caption text-secondary hover:text-primary hover:underline transition-colors"
                  >
                    {resolveDisplayName(part, index)}
                  </Link>
                  <span className="type-caption text-caption select-none">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

