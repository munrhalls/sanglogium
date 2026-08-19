// # Execution Specs: Search Feature — Shared Param Contract (G3)

// ## Selected Slice
// - Slice: lib/catalogue/searchParams.ts loadSearchSearchParams
// - Reason: One trusted q/sort/page parse shared client↔server (no drift)

import { describe, it, expect } from "vitest";
import { loadSearchSearchParams } from "@/lib/catalogue/searchParams";
import { buildSearchOrderClause } from "@/lib/catalogue/filterParams";

describe("loadSearchSearchParams", () => {
  it("round-trips q, sort and page from a plain record", () => {
    const parsed = loadSearchSearchParams({
      q: "sennheiser",
      sort: "price_data.unit_amount:asc",
      page: "2",
    });

    expect(parsed.q).toBe("sennheiser");
    expect(parsed.sort).toBe("price_data.unit_amount:asc");
    expect(parsed.page).toBe(2);
  });

  it("defaults q to empty, sort to relevance and page to 1 when absent", () => {
    const parsed = loadSearchSearchParams({});

    expect(parsed.q).toBe("");
    expect(parsed.sort).toBe("relevance");
    expect(parsed.page).toBe(1);
  });

  it("passes unknown sort values through for allowlist resolution downstream", () => {
    // nuqs loaders don't validate (documented) — the allowlist sanitization
    // happens in the data layer via buildSearchOrderClause/resolveSearchSort.
    const parsed = loadSearchSearchParams({ sort: "EVIL:; DROP", page: "abc" });

    expect(parsed.sort).toBe("EVIL:; DROP");
    expect(parsed.page).toBe(1);
    expect(buildSearchOrderClause(parsed.sort)).toBe("| order(score desc, name asc)");
  });

  it("accepts URLSearchParams input", () => {
    const parsed = loadSearchSearchParams(new URLSearchParams("q=hd+650&page=2"));

    expect(parsed.q).toBe("hd 650");
    expect(parsed.page).toBe(2);
  });
})