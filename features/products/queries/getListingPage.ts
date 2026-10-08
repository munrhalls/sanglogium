import {
  sanitizeFilterState,
  loadFilterSort,
  isFiltersActive,
  resolvePriceBounds,
  isCategory,
  type ProductQueryState,
  type Category,
  type CatalogueFacets,
  type PriceRangeData,
} from '@/features/product-filtering';
import { isFacetedQuery, canonicalCategoryPath } from '@/features/catalogue';
import type { CatalogPorts } from '@/features/products/core/ports';
import type { CategoryMetadata } from '@/features/products/core/types/productDataTypes';
import type { Product } from '@/features/products/core/types/productTypes';
import { CHUNK_SIZE } from '@/features/products/core/definitions/gridLayout';

const PER_PAGE = 24;

type SearchParams = Record<string, string | string[] | undefined>;

export interface ListingPorts {
  catalogue: {
    resolveSlugToId: (slug: string) => string | undefined;
    unrollDescendantKeys: (nodeId: string) => string[];
    getAllLeafKeys: () => string[];
  };
  filtering: {
    getFilterFacets: (options: { keys: string[]; state: ProductQueryState }) => Promise<CatalogueFacets>;
    getCategoryPriceRange: (options: { keys: string[] }) => Promise<PriceRangeData>;
  };
  catalog: CatalogPorts;
}

export type ListingPageResult =
  | { notFound: true }
  | {
      notFound?: false;
      title: string;
      overline?: string;
      breadcrumbs?: string[];
      category?: Category;
      facets: CatalogueFacets;
      priceBounds: { min: number; max: number };
      filtersActive: boolean;
      totalCount: number;
      totalPages: number;
      effectivePage: number;
      perPage: number;
      chunkPromises: Promise<Product[]>[];
    };

export function createGetListingPage(ports: ListingPorts) {
  return async function getListingPage(input: {
    slug: string[] | null;
    query: SearchParams;
  }): Promise<ListingPageResult> {
    const { slug, query } = input;
    const nodeId = slug ? ports.catalogue.resolveSlugToId(slug[slug.length - 1]) : undefined;

    if (slug && !nodeId) {
      return { notFound: true };
    }

    // slug[0] is always the top-level category (headphones/audio-electronics/
    // accessories), including for nested category pages -- picks which of the
    // three per-category facet modules drives the sidebar (sang-logium-3rv.6).
    const rawCategory = slug ? slug[0] : undefined;
    const category: Category | undefined =
      rawCategory !== undefined ? (isCategory(rawCategory) ? rawCategory : 'headphones') : undefined;

    const keys = slug ? ports.catalogue.unrollDescendantKeys(nodeId!) : ports.catalogue.getAllLeafKeys();

    const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
    const page = typeof pageValue === 'string' ? Number(pageValue) : 1;

    // Drop URL filter values that match nothing valid for this route (e.g.
    // ?brand=notabrand, ?driverType=banana) so a junk deep link is inert instead
    // of a dead-end empty page. Closed-vocab facets are vetted purely up front;
    // brand is data-derived, so it is vetted below against the brand slugs the
    // facet computation finds on this route. (jw8.3)
    const preState = sanitizeFilterState(
      loadFilterSort(query) as ProductQueryState,
    );

    const [metadata, facets, priceRange] = await Promise.all([
      slug ? ports.catalog.getCategoryMetadata(nodeId!) : Promise.resolve(null),
      ports.filtering.getFilterFacets({ keys, state: preState }),
      // FULL category price span — not narrowed by active filters, so the max
      // handle can always be dragged back up past the current selection.
      ports.filtering.getCategoryPriceRange({ keys }),
    ]);

    if (slug && !metadata) {
      return { notFound: true };
    }

    const state = sanitizeFilterState(preState, {
      brand: Object.keys(facets.brandLabels),
    });

    const filtersActive = isFiltersActive(state);

    const totalCount = await ports.catalog.getProductsCount({ keys, state });
    const priceBounds = resolvePriceBounds(priceRange);

    const overline =
      slug && slug.length > 1
        ? slug[0].split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : undefined;

    const totalPages = Math.ceil(totalCount / PER_PAGE);
    const effectivePage = totalPages > 0 ? Math.min(Math.max(1, page || 1), totalPages) : Math.max(1, page || 1);
    const pageStart = (effectivePage - 1) * PER_PAGE;

    // Fire one chunk fetch per CHUNK_SIZE slice of the page, in parallel and
    // unawaited — each is streamed in independently via ChunkedProductGrid's
    // own Suspense boundaries.
    const chunkPromises = Array.from(
      { length: Math.ceil(PER_PAGE / CHUNK_SIZE) },
      (_, i) => ports.catalog.getProductsChunk({ keys, offset: pageStart + i * CHUNK_SIZE, limit: CHUNK_SIZE, state }),
    );

    return {
      title: slug ? (metadata as CategoryMetadata).name : 'All Products',
      overline,
      breadcrumbs: slug ?? undefined,
      category,
      facets,
      priceBounds: { min: priceBounds.min, max: priceBounds.max },
      filtersActive,
      totalCount,
      totalPages,
      effectivePage,
      perPage: PER_PAGE,
      chunkPromises,
    };
  };
}

export function createGetListingMetadata(ports: Pick<ListingPorts, 'catalogue' | 'catalog'>) {
  return async function getListingMetadata(input: { slug: string[] | null; query: SearchParams }) {
    const { slug, query } = input;

    if (!slug) {
      return {
        title: 'All Products — Sang Logium',
        description: 'Browse the full Sang Logium catalogue of headphones, audio electronics, and accessories',
        alternates: { canonical: '/products' },
        robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
      };
    }

    const leafSlug = slug[slug.length - 1];
    const nodeId = ports.catalogue.resolveSlugToId(leafSlug);

    if (!nodeId) {
      return { title: 'Category Not Found' };
    }

    const metadata = await ports.catalog.getCategoryMetadata(nodeId);

    if (!metadata) {
      return { title: 'Category Not Found' };
    }

    return {
      title: `${metadata.name} — Sang Logium`,
      description: `Browse ${metadata.name} headphones and audio equipment`,
      alternates: { canonical: canonicalCategoryPath(slug) },
      robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
    };
  };
}
