// # Execution Specs: Pagination page-list helper
//
// Phase 3 / T3.4: the numbered pagination UI renders from a pure, testable
// helper that produces the visible page numbers with ellipsis truncation.

import { describe, it, expect } from "vitest";
import { getPageList, totalPagesFor } from "@/lib/catalogue/pagination";

describe("totalPagesFor", () => {
  it("returns 0 when there are no items", () => {
    expect(totalPagesFor(0, 100)).toBe(0);
  });

  it("returns 1 when items fit on a single page", () => {
    expect(totalPagesFor(100, 100)).toBe(1);
    expect(totalPagesFor(1, 100)).toBe(1);
  });

  it("rounds up to cover every item", () => {
    expect(totalPagesFor(101, 100)).toBe(2);
    expect(totalPagesFor(250, 100)).toBe(3);
  });

  it("guards against a non-positive perPage", () => {
    expect(totalPagesFor(50, 0)).toBe(0);
  });
});

describe("getPageList", () => {
  it("returns an empty list when there are no pages", () => {
    expect(getPageList(1, 0)).toEqual([]);
  });

  it("lists every page when the total is small", () => {
    expect(getPageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("truncates the right side near the start", () => {
    expect(getPageList(1, 10)).toEqual([1, 2, "ellipsis", 10]);
  });

  it("truncates both sides in the middle", () => {
    expect(getPageList(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("truncates the left side near the end", () => {
    expect(getPageList(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});
