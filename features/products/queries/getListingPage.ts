import {
  sanitizeFilterState,
  isFiltersActive,
  resolvePriceBounds,
  isCategory,
  type FilterQuery,
  type Category,
  type CatalogueFacets,
} from '@/features/product-filtering';
import { isFacetedQuery, canonicalCategoryPath } from '@/features/catalogue';
import type { CatalogPorts } from '@/features/products/core/ports';
import type { CategoryMetadata } from '@/features/products/core/types/productDataTypes';
import type { Product } from '@/features/products/core/types/productTypes';
import { CHUNK_SIZE } from '@/features/products/core/definitions/gridLayout';
import { pageWindow } from '@/features/products/core/rules/pageWindow';

const PER_PAGE = 24;

type SearchParams = Record<string, string | string[] | undefined>;

export interface ListingPorts {
  catalogue: {
    resolveSlugToId: (slug: string) => string | undefined;
    unrollDescendantKeys: (nodeId: string) => string[];
    getAllLeafKeys: () => string[];
    getBreadcrumbLabels: (parts: string[]) => string[];
  };
  filtering: {
    getFilterFacets: (options: { keys: string[]; query: FilterQuery; category?: Category }) => Promise<CatalogueFacets>;
  };
  catalog: CatalogPorts;
}

type ListingPageResult =
  | { notFound: true }
  | {
      notFound?: false;
      title: string;
      overline?: string;
      breadcrumbs?: string[];
      breadcrumbLabels?: string[];
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

export async function getListingPage(ports: ListingPorts, input: {
  slug: string[] | null;
  query: SearchParams;
}): Promise<ListingPageResult> {
    const { slug, query } = input;
    const nodeId = slug ? ports.catalogue.resolveSlugToId(slug[slug.length - 1]) : undefined;

    if (slug && !nodeId) {
      return { notFound: true };
    }

    // slug[0] is always the top-level category (headphones/audio-electronics/
    // accessories), including for nested category pages -- picks which slice's
    // facets getFilterFacets derives for the sidebar (sang-logium-3rv.6).
    const rawCategory = slug ? slug[0] : undefined;
    const category: Category | undefined =
      rawCategory !== undefined ? (isCategory(rawCategory) ? rawCategory : 'headphones') : undefined;

    const keys = slug ? ports.catalogue.unrollDescendantKeys(nodeId!) : ports.catalogue.getAllLeafKeys();

    const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
    const page = typeof pageValue === 'string' ? Number(pageValue) : 1;

    // The raw query goes to getFilterFacets, which decodes it and vets the URL
    // filter values against this route's own facet set — a bogus deep link
    // (?driverType=banana) is inert there, before it can touch counts or the
    // product query (jw8.3). Brand is vetted below: its values live on
    // brandRef, so its vocab is the counted brand set.
    const [metadata, facets] = await Promise.all([
      slug ? ports.catalog.getCategoryMetadata(nodeId!) : Promise.resolve(null),
      ports.filtering.getFilterFacets({ keys, query, category }),
    ]);

    if (slug && !metadata) {
      return { notFound: true };
    }

    const state = sanitizeFilterState(facets.state, facets.facetSet, {
      brand: Object.keys(facets.brandLabels),
    });

    const filtersActive = isFiltersActive(state);

    const totalCount = await ports.catalog.getProductsCount({ keys, state, facetSet: facets.facetSet });
    const priceBounds = resolvePriceBounds(facets.priceRange); // full category span, not narrowed by filters: the max handle can always be dragged back up

    const overline =
      slug && slug.length > 1
        ? slug[0].split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : undefined;

    const { totalPages, effectivePage, chunkOffsets } = pageWindow(totalCount, page, PER_PAGE);

    // Fire one chunk fetch per CHUNK_SIZE slice of the page, in parallel and
    // unawaited — each is streamed in independently via ChunkedProductGrid's
    // own Suspense boundaries.
    const chunkPromises = chunkOffsets.map((offset) =>
      ports.catalog.getProductsChunk({ keys, offset, limit: CHUNK_SIZE, state, facetSet: facets.facetSet }),
    );

    return {
      title: slug ? (metadata as CategoryMetadata).name : 'All Products',
      overline,
      breadcrumbs: slug ?? undefined,
      breadcrumbLabels: slug ? ports.catalogue.getBreadcrumbLabels(slug) : undefined,
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
}

export async function getListingMetadata(ports: Pick<ListingPorts, 'catalogue' | 'catalog'>, input: { slug: string[] | null; query: SearchParams }) {
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
}
