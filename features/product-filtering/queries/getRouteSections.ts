// Read use case: the sections of one route's panel. Takes its port as the first parameter. The order of the controls is the always-on fields, then the scope's picks (the order the
// raw map and so the model use); the scope's stored headings are placed in it, and `controlPaths` are the route's controls from the model. On a failed read it logs once and returns
// the leading block alone, so a panel without headings is still a panel.

import { buildSections } from '@/features/product-filtering/core/rules/buildSections';
import type { SectionPorts } from '@/features/product-filtering/core/ports';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { Section } from '@/features/product-filtering/core/types/sections';

export async function getRouteSections(
  ports: SectionPorts,
  { scope, controlPaths }: { scope: PicklistScope; controlPaths: string[] },
): Promise<Section[]> {
  try {
    const { alwaysOn, picks, rows } = await ports.fetchSections();
    return buildSections(rows[scope], [...alwaysOn, ...picks[scope]], controlPaths);
  } catch (error) {
    console.error(`[getRouteSections] failed for scope "${scope}"`, error);
    return buildSections([], [], controlPaths);
  }
}
