import type { Section, SectionRow } from '@/features/product-filtering/core/types/sections';

// The sections of one route. Each stored heading sits at the position of its control in `order` (the always-on fields, then the scope's picks: the order the controls are drawn in).
// A section is the route's controls from its heading's position down to the next heading's; the controls above the first heading form a leading block that has no heading.
// A heading above an unknown control is ignored; a section with no control on the route is left out.

export function buildSections(rows: SectionRow[], order: string[], controlPaths: string[]): Section[] {
  const taken = new Set<string>();
  const headings: { index: number; row: SectionRow }[] = [];
  for (const row of rows) {
    const index = order.indexOf(row.before);
    if (index < 0 || taken.has(row.before)) continue;
    taken.add(row.before);
    headings.push({ index, row });
  }
  headings.sort((a, b) => a.index - b.index);

  const sections: Section[] = [
    { key: '', label: '', icon: '', paths: [] },
    ...headings.map(({ row }) => ({ key: row.before, label: row.title, icon: row.icon ?? '', paths: [] as string[] })),
  ];
  for (const path of controlPaths) {
    const at = order.indexOf(path);
    let owner = 0;
    headings.forEach((heading, i) => {
      if (heading.index <= at) owner = i + 1;
    });
    sections[owner].paths.push(path);
  }
  return sections.filter((section) => section.paths.length > 0);
}
