// Which products a listing page shows: the page number from the URL and the total of products that pass the filters
// -> the page to show and where the chunks it is cut into start. A page that is not a whole number from 1 up counts
// as page 1; a page past the end becomes the last page.

import { CHUNK_SIZE } from '@/features/products/core/definitions/gridLayout';

export interface PageWindow {
  totalPages: number;
  effectivePage: number;
  /** The offset of each chunk of the page, in order; each chunk is CHUNK_SIZE products. */
  chunkOffsets: number[];
}

export function pageWindow(totalCount: number, rawPage: number, perPage: number): PageWindow {
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const totalPages = Math.ceil(totalCount / perPage);
  const effectivePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const pageStart = (effectivePage - 1) * perPage;
  const chunkOffsets = Array.from({ length: Math.ceil(perPage / CHUNK_SIZE) }, (_, i) => pageStart + i * CHUNK_SIZE);
  return { totalPages, effectivePage, chunkOffsets };
}
