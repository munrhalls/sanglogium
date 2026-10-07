import 'server-only';
// Server door: the Lighthouse CI baseline report for the admin area.

import { readLighthouseReport } from './adapters/lighthouse-ci/readLighthouseReport';
import type { LighthouseResults } from './core/ports';

export const getLighthouseReport: LighthouseResults['readLighthouseReport'] = readLighthouseReport;

export { default as PerformanceBaselineView } from './view/PerformanceBaselineView';
