"use client";

import Link from "next/link";
import { FaRegCircle } from "react-icons/fa";
import { CatalogueTree } from "@/data/catalogue";

interface SubcategoryListProps {
  items: CatalogueTree;
  parentPath: string;
}

export const SubcategoryList = ({
  items,
  parentPath,
}: SubcategoryListProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="pl-4">
      {items.map((item) => {
        const isHeader = item.type === "header";
        const slug = item.slug?.current;

        const href = slug ? `${parentPath}/${slug}` : "#";

        return (
          <div key={item._key}>
            {isHeader ? (
              <h3 className="px-4 py-2 font-black text-gray-500">
                {item.title}
              </h3>
            ) : (
              <Link
                href={href}
                className="group flex min-w-0 items-center rounded-md px-4 py-2 text-gray-800 transition-all duration-100 hover:bg-gray-300 hover:text-yellow-600"
              >
                <FaRegCircle className="mr-2 text-sm" />
                <span className="block overflow-hidden whitespace-nowrap">
                  {item.title}
                </span>
              </Link>
            )}

            {item.children && item.children.length > 0 && (
              <SubcategoryList
                items={item.children}
                parentPath={isHeader ? parentPath : href}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
