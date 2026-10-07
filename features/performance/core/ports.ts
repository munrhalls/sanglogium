import type { LighthouseReport } from "./rules/lighthouse";

export type LighthouseResults = { readLighthouseReport: () => Promise<LighthouseReport> };
