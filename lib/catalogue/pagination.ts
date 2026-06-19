// Pure pagination helpers for the catalogue's numbered page controls (T3.4).
// Isomorphic and dependency-free so both the server and the client UI can use
// them, and so the page-window logic stays unit-testable.

export type PageItem = number | "ellipsis";

/** Total number of pages for a filtered set of `totalCount` items. */
export function totalPagesFor(totalCount: number, perPage: number): number {
  if (totalCount <= 0 || perPage <= 0) return 0;
  return Math.ceil(totalCount / perPage);
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

/**
 * Build the visible page list with ellipsis truncation. Always shows the first
 * and last page plus `siblingCount` neighbours around the current page.
 */
export function getPageList(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): PageItem[] {
  if (totalPages <= 0) return [];

  // first + last + current + 2 ellipsis + (2 * siblings)
  const totalSlots = siblingCount * 2 + 5;
  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const left = Math.max(currentPage - siblingCount, 1);
  const right = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;

  const items: PageItem[] = [1];
  if (showLeftEllipsis) items.push("ellipsis");
  for (let page = Math.max(left, 2); page <= Math.min(right, totalPages - 1); page++) {
    items.push(page);
  }
  if (showRightEllipsis) items.push("ellipsis");
  items.push(totalPages);
  return items;
}
