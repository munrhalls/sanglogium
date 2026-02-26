"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import formatSortName from "./helpers/formatSortName";
import { SortOption } from "./SortTypes";

function SortClientContent({
  initialSortOptions = [],
  currentSort = "",
}: {
  initialSortOptions?: SortOption[];
  currentSort?: string;
}) {
  const _ = currentSort;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<SortOption[]>(initialSortOptions);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentSortName = searchParams.get("sort") || "";
  const currentSortDir = searchParams.get("dir") || "asc";
  useEffect(() => {
    if (initialSortOptions && initialSortOptions.length > 0) {
      const processedOptions = initialSortOptions.map((option) => ({
        name: option.name,
        displayName: option.displayName || formatSortName(option.name),
        type: option.type || "alphabetic",
        field: option.field || option.name,
        defaultDirection: option.defaultDirection || "asc",
      }));
      setOptions(processedOptions);
    }
  }, [initialSortOptions]);
  function handleSortChange(
    sortName: string,
    direction: "asc" | "desc" = "asc",
  ) {
    setIsTransitioning(true);
    const params = new URLSearchParams(searchParams);
    if (sortName) {
      params.set("sort", sortName);
      params.set("dir", direction);
    } else {
      params.delete("sort");
      params.delete("dir");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeout(() => setIsTransitioning(false), 600);
  }
  function handleClearSort() {
    setIsTransitioning(true);
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    params.delete("dir");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeout(() => setIsTransitioning(false), 600);
  }
  function getDirectionIcon(isActive: boolean, direction: string) {
    if (!isActive)
      return <ArrowUp className="h-5 w-5 text-slate-500 opacity-40" />;
    return (
      <>
        {direction === "asc" ? (
          <div className="flex items-center">
            <ArrowDown className="h-5 w-5 text-white" />
            <ArrowUp className="h-5 w-5  text-orange-500" />
          </div>
        ) : (
          <div className="flex items-center">
            <ArrowDown className="h-5 w-5 text-orange-500" />
            <ArrowUp className="h-5 w-5 text-white" />
          </div>
        )}
      </>
    );
  }
  function getSortLabel(option: SortOption) {
    const { displayName, type } = option;
    switch (type) {
      case "alphabetic":
        return `${displayName} (A-Z)`;
      case "numeric":
        return `${displayName} (Low-High)`;
      case "date":
        return `${displayName} (Newest)`;
      case "boolean":
        return `${displayName}`;
      default:
        return displayName;
    }
  }
  if (!options || options.length === 0) {
    return <div className="p-4 text-gray-500">No sort options available</div>;
  }
  return (
    <div className="sort-options space-y-4 relative">
      {isTransitioning && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-md">
          <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="sort-buttons space-y-2">
        {options.map((option) => {
          const isActive = option.name === currentSortName;
          return (
            <button
              key={option.name}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "bg-white hover:bg-blue-400 text-black"
              }`}
              onClick={() => {
                const newDirection =
                  isActive && currentSortDir === "asc"
                    ? "desc"
                    : option.defaultDirection || "asc";
                handleSortChange(option.name, newDirection);
              }}
            >
              <span>{getSortLabel(option)}</span>
              <div className="flex items-center">
                {getDirectionIcon(isActive, currentSortDir)}
              </div>
            </button>
          );
        })}
      </div>
      {currentSortName && (
        <button
          onClick={handleClearSort}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded text-center hover:bg-gray-100"
        >
          Clear Sort
        </button>
      )}
    </div>
  );
}

export default function SortClient(props: {
  initialSortOptions?: SortOption[];
  currentSort?: string;
}) {
  return (
    <Suspense fallback={null}>
      <SortClientContent {...props} />
    </Suspense>
  );
}
