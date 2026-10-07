import "server-only";
import { promises as fs } from "fs";
import path from "path";

import type { Assertion, LighthouseReport } from "@/features/performance/core/rules/lighthouse";

export async function readLighthouseReport(): Promise<LighthouseReport> {
  const dataDir = path.join(process.cwd(), ".lighthouseci");
  let assertions: Assertion[] = [];
  let links: Record<string, string> = {};

  try {
    const [assertionsRaw, linksRaw] = await Promise.all([
      fs.readFile(path.join(dataDir, "assertion-results.json"), "utf8"),
      fs.readFile(path.join(dataDir, "links.json"), "utf8"),
    ]);
    assertions = JSON.parse(assertionsRaw) as Assertion[];
    links = JSON.parse(linksRaw) as Record<string, string>;
  } catch {
    // Keep defaults; the UI will show the empty state.
  }

  return { assertions, links };
}
