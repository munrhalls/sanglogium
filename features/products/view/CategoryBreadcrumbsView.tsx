import Link from "next/link";

interface BreadcrumbsProps {
  categoryParts: string[];
  labels: string[];
}

export default function CategoryBreadcrumbsView({
  categoryParts,
  labels,
}: BreadcrumbsProps) {
  // Build href for each part
  const buildHref = (index: number) => {
    return `/products/${categoryParts.slice(0, index + 1).join("/")}`;
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
                  {labels[index]}
                </span>
              ) : (
                <>
                  <Link
                    href={href}
                    className="type-caption text-secondary hover:text-primary hover:underline transition-colors"
                  >
                    {labels[index]}
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

