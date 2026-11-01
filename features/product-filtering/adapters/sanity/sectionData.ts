import type { SectionData, SectionRow, SectionRows } from '@/features/product-filtering/core/types/sections';

/**
 * The one read the sections are computed from: the picklist document's always-on fields, its four pick lists and its four heading lists.
 * A plain module (no server-only) so the live proof runs the same query.
 */
export const SECTION_QUERY = `*[_id == "filterPicklist"][0]{ alwaysOn, headphones, audioElectronics, accessories, allProducts, sectionsHeadphones, sectionsAudioElectronics, sectionsAccessories, sectionsAllProducts }`;

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/** The rows of one stored list, in the owner's order. A row that is not an object with a text title and a text `before` is dropped; an icon that is not text is left off its row. */
function rowsOf(value: unknown): SectionRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): SectionRow[] => {
    if (item === null || typeof item !== 'object') return [];
    const { title, icon, before } = item as Record<string, unknown>;
    if (!isText(title) || !isText(before)) return [];
    return [isText(icon) ? { title, icon, before } : { title, before }];
  });
}

/** The result of SECTION_QUERY as the sections' input. The lists keep their camelCase names in the document; the slices are the category slugs and `allProducts` is the scope 'all-products'. A missing document means no controls and no headings. */
export function toSectionData(doc: any): SectionData {
  const rows: SectionRows = {
    headphones: rowsOf(doc?.sectionsHeadphones),
    'audio-electronics': rowsOf(doc?.sectionsAudioElectronics),
    accessories: rowsOf(doc?.sectionsAccessories),
    'all-products': rowsOf(doc?.sectionsAllProducts),
  };
  return {
    alwaysOn: strings(doc?.alwaysOn),
    picks: {
      headphones: strings(doc?.headphones),
      'audio-electronics': strings(doc?.audioElectronics),
      accessories: strings(doc?.accessories),
      'all-products': strings(doc?.allProducts),
    },
    rows,
  };
}
