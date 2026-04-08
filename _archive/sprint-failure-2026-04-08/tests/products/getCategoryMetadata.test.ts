import { describe, it, expect } from 'vitest';
import { getCategoryMetadata } from '@/sanity/lib/products/getCategoryMetadata';

describe('L2 Data: getCategoryMetadata', () => {

  it('L2-05: Returns metadata for open-back category', async () => {
    const metadata = await getCategoryMetadata('o7c6baiuobsr7ni2y2vf22sh');

    expect(metadata).toBeDefined();
    expect(metadata.name).toBe('Open-Back');
    expect(metadata.slug).toBe('open-back');
    expect(metadata.parentId).toBeDefined();
    expect(metadata.type).toBe('link');
  });

  it('L2-06: Returns metadata with breadcrumb path', async () => {
    const metadata = await getCategoryMetadata('o7c6baiuobsr7ni2y2vf22sh');

    expect(metadata.breadcrumb).toBeDefined();
    expect(metadata.breadcrumb.length).toBeGreaterThan(0);
    expect(metadata.breadcrumb[0].label).toBe('Headphones');
  });

  it('L2-07: Returns null for invalid category key', async () => {
    const metadata = await getCategoryMetadata('invalid-key-123');
    expect(metadata).toBeNull();
  });

});
