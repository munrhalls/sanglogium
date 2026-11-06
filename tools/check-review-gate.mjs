// Check "review-gate": an added or removed line touching height/sizing utilities under the
// reviewed surfaces requires a diff review — the h-full-vs-explicit-height ownership pattern in
// docs/features/vertical-space-lg-touch.md — before the task is done, even when nobody asked.
// Warns (does not block): the review is a judgment call, the reminder is the mechanism.

export const name = "review-gate";

const SURFACE = /^(features\/shell\/|platform\/design\/|features\/[^/]+\/ui\/)/;
const SIZING = /(?:^|[^\w-])(?:h-full|min-h-|max-h-|aspect-)/;

export function run(ctx) {
  const out = [];
  for (const file of ctx.changed) {
    if (!file.endsWith(".tsx") || !SURFACE.test(file)) continue;
    const { add, del } = ctx.diffLines(file);
    if ([...add, ...del].some((l) => SIZING.test(l)))
      out.push(`WARN: ${file} REVIEW REQUIRED — sizing class changed; review the diff against docs/features/vertical-space-lg-touch.md (h-full-vs-explicit-height ownership)`);
  }
  return out;
}
