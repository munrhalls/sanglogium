import { describe, it, expect, vi } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('L3 Routes: Shop Category Pages', () => {

  it('L3-01: Route structure accepts slug arrays', async () => {
    // Import the page component
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');

    // Should not throw for valid slug array
    const params = Promise.resolve({ slug: ['headphones', 'open-back'] });
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-02: Single slug route works', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');

    const params = Promise.resolve({ slug: ['open-back'] });
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-03: Deep nested slug route works', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');

    const params = Promise.resolve({ slug: ['headphones', 'by-design', 'open-back'] });
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-04: Page returns ShopLayout with children', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');

    const params = Promise.resolve({ slug: ['open-back'] });
    const result = await CategoryPage({ params });

    // Result should be a React element (JSX structure)
    expect(result).toBeDefined();
    expect(result.type).toBeDefined(); // Should be ShopLayout component
  });

});
