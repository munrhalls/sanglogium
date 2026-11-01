import { scopeOf, type FilterPanelData, type FilterPanelResult } from '@/features/product-filtering';
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
    getFilterPanel: (options: { keys: string[]; scope: ReturnType<typeof scopeOf>; query: SearchParams }) => Promise<FilterPanelResult>;
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
      filter: FilterPanelData;
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
    // accessories), including for nested category pages: it picks the slice whose
    // picklist the filter feature reads (scopeOf); /products reads the all-products list.
    const scope = scopeOf(slug);

    const keys = slug ? ports.catalogue.unrollDescendantKeys(nodeId!) : ports.catalogue.getAllLeafKeys();

    const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
    const page = typeof pageValue === 'string' ? Number(pageValue) : 1;

    // The raw query goes to the filter feature, which decodes it under this route's
    // own control model: a key or value the model does not know is inert there, before
    // it can touch the counts or the products request. Its narrowing (where, order,
    // params) is then embedded in the count and in every chunk below.
    const [metadata, { narrowing, ...filter }] = await Promise.all([
      slug ? ports.catalog.getCategoryMetadata(nodeId!) : Promise.resolve(null),
      ports.filtering.getFilterPanel({ keys, scope, query }),
    ]);

    if (slug && !metadata) {
      return { notFound: true };
    }

    const totalCount = await ports.catalog.getNarrowedCount({ keys, narrowing });

    const overline =
      slug && slug.length > 1
        ? slug[0].split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : undefined;

    const { totalPages, effectivePage, chunkOffsets } = pageWindow(totalCount, page, PER_PAGE);

    // Fire one chunk fetch per CHUNK_SIZE slice of the page, in parallel and
    // unawaited — each is streamed in independently via ChunkedProductGrid's
    // own Suspense boundaries.
    const chunkPromises = chunkOffsets.map((offset) =>
      ports.catalog.getNarrowedChunk({ keys, narrowing, offset, limit: CHUNK_SIZE }),
    );

    return {
      title: slug ? (metadata as CategoryMetadata).name : 'All Products',
      overline,
      breadcrumbs: slug ?? undefined,
      breadcrumbLabels: slug ? ports.catalogue.getBreadcrumbLabels(slug) : undefined,
      filter,
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
