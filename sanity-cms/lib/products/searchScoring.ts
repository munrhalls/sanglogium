// The one relevance scorer for search. Used by the header suggestions
// (searchProductsAutocomplete) AND the /search results (searchProductsFull), so
// the popup's top rows and the results page's top rows always agree.
//
// Deliberately NOT a 'use server' module: those may only export async functions,
// and this is pure, synchronous and unit-testable.
//
// Design rules (each one fixes a real defect seen in QA):
//  - Brand and name are matched as separate fields. The old scorer searched
//    "brand+name" with spaces stripped, so a query could match across the seam
//    ("mcintosh|ds200" contains "hd").
//  - Multi-word queries score on every word (any order), not one blob.
//  - Word-prefix matches beat mid-word substrings ("amp" → "Headphone Amp",
//    not "Campfire").
//  - Products that matched only through specs/overview text sort last.
import catalogueData from '@/data/catalogue-index.json';

const slotMetadataMap: Record<string, { children?: string[] }> =
  (catalogueData as any).slotMetadataMap || {};

const parentByChild = new Map<string, string>();
for (const [parentId, meta] of Object.entries(slotMetadataMap)) {
  for (const childId of meta.children || []) {
    parentByChild.set(childId, parentId);
  }
}

const slugToIdMap: Record<string, string> = (catalogueData as any).slugToIdMap || {};
const ROOT_HEADPHONES = slugToIdMap.headphones;
const ROOT_AUDIO_ELECTRONICS = slugToIdMap['audio-electronics'];
const ROOT_ACCESSORIES = slugToIdMap.accessories;

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function tokenize(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export function deriveSpacedQuery(value: string): string {
  // Produce a spacing-normalised variant of the raw query so GROQ match
  // can hit both concatenated models ("hd800s") and dashed variants
  // ("HD-800-S"). "SennheiserHD800S" becomes "Sennheiser HD 800S".
  return value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
    .replace(/(\d+)\s+([a-zA-Z]+)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRootCategory(key: string): 'headphones' | 'audio-electronics' | 'accessories' | null {
  let current = key;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    if (current === ROOT_HEADPHONES) return 'headphones';
    if (current === ROOT_AUDIO_ELECTRONICS) return 'audio-electronics';
    if (current === ROOT_ACCESSORIES) return 'accessories';
    current = parentByChild.get(current) || '';
  }
  return null;
}

export type RootCategory = 'headphones' | 'audio-electronics' | 'accessories';

export const ROOT_CATEGORIES: { id: RootCategory; label: string }[] = [
  { id: 'headphones', label: 'Headphones' },
  { id: 'audio-electronics', label: 'Audio Electronics' },
  { id: 'accessories', label: 'Accessories' },
];

/** Every root category a product sits under (a product can sit under several). */
export function rootCategoriesOf(keys?: string[]): RootCategory[] {
  const roots = new Set<RootCategory>();
  for (const key of keys ?? []) {
    const root = getRootCategory(key);
    if (root) roots.add(root);
  }
  return [...roots];
}

function categoryScore(keys?: string[]): number {
  if (!keys || keys.length === 0) return 0;
  const roots = new Set<'headphones' | 'audio-electronics' | 'accessories' | null>();
  for (const key of keys) {
    roots.add(getRootCategory(key));
  }
  if (roots.has('headphones') || roots.has('audio-electronics')) return 50;
  if (roots.has('accessories')) return -50;
  return 0;
}

function positionBonus(index: number): number {
  return Math.max(0, 1000 - Math.min(index, 1000));
}

export interface ScorableProduct {
  name: string;
  brand?: { name?: string } | null;
  sku?: string;
  catalogueLocationKeys?: string[];
  availableStock?: number;
}

export function scoreProduct(product: ScorableProduct, rawQuery: string): number {
  const queryNorm = normalizeText(rawQuery);
  if (!queryNorm) return 0;

  const name = product.name || '';
  const brandName = product.brand?.name || '';
  const sku = product.sku || '';

  const nameNorm = normalizeText(name);
  const brandNorm = normalizeText(brandName);
  const skuNorm = normalizeText(sku);
  // "Brand Name" as one string, only for whole-query equality / prefix checks
  // (a prefix can never fake a match across the seam; a substring could).
  const fullNameNorm = brandNorm && !nameNorm.startsWith(brandNorm) ? brandNorm + nameNorm : nameNorm;

  // Small, additive tie-breakers that never outrank a better match tier:
  // headphones/electronics over accessories, in stock, shorter (closer) names.
  const tiebreak =
    categoryScore(product.catalogueLocationKeys) +
    (product.availableStock != null && product.availableStock > 0 ? 20 : 0) -
    Math.min(nameNorm.length, 500) / 100;

  if (fullNameNorm === queryNorm) return 1000 * 1000 + tiebreak;
  if (fullNameNorm.startsWith(queryNorm)) return 900 * 1000 + tiebreak;
  if (nameNorm === queryNorm) return 850 * 1000 + tiebreak;
  if (skuNorm === queryNorm) return 820 * 1000 + tiebreak;
  if (nameNorm.startsWith(queryNorm)) return 800 * 1000 + tiebreak;
  if (skuNorm.startsWith(queryNorm)) return 700 * 1000 + tiebreak;

  const tokens = tokenize(rawQuery);
  const nameWords = tokenize(name);

  // One word: a name word that starts with it beats a mid-word substring.
  if (tokens.length === 1 && nameWords.some((w) => w.startsWith(tokens[0]))) {
    return 650 * 1000 + positionBonus(nameNorm.indexOf(queryNorm)) + tiebreak;
  }

  // Several words, any order: every word must hit the name, brand or SKU.
  if (tokens.length > 1) {
    const brandWords = tokenize(brandName);
    let bonus = 0;
    let allFound = true;
    for (const token of tokens) {
      if (nameWords.some((w) => w.startsWith(token))) bonus += 30;
      else if (brandWords.some((w) => w.startsWith(token))) bonus += 25;
      else if (nameNorm.includes(token)) bonus += 15;
      else if (skuNorm.includes(token)) bonus += 10;
      else {
        allFound = false;
        break;
      }
    }
    if (allFound) return 640 * 1000 + bonus * 10 + tiebreak;
  }

  const nameIdx = nameNorm.indexOf(queryNorm);
  if (nameIdx !== -1) return 600 * 1000 + positionBonus(nameIdx) + tiebreak;

  const skuIdx = skuNorm.indexOf(queryNorm);
  if (skuIdx !== -1) return 400 * 1000 + positionBonus(skuIdx) + tiebreak;

  // Loose brand-name token match for partial brand queries.
  if (brandNorm) {
    for (const token of tokens) {
      if (token.length >= 2 && brandNorm.includes(token)) {
        return 100 * 1000 + tiebreak;
      }
    }
  }

  // Matched only through specifications / overview text.
  return tiebreak;
}
