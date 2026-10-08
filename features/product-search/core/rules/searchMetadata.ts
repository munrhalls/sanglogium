import { isFacetedQuery } from '@/features/catalogue';

export function getSearchMetadata(query: Record<string, string | string[] | undefined>) {
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  const baseMetadata = q
    ? {
        title: `${q} — Search Results | Sang Logium`,
        description: `Search results for "${q}" — headphones, IEMs, DACs and audio accessories at Sang Logium`,
      }
    : {
        title: 'Search — Sang Logium',
        description: 'Search for headphones, IEMs, DACs and audio accessories',
      };

  // Search-result permutations (?q=…?sort=…?page=…) are thin, transient content:
  // noindex them and point the canonical at the base /search page (G5).
  const hasSearchState = q.length > 0 || isFacetedQuery(query);
  if (hasSearchState) {
    return {
      ...baseMetadata,
      robots: { index: false, follow: true },
      alternates: { canonical: '/search' },
    };
  }

  return baseMetadata;
}
