import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGridSkeleton } from '../ProductGridSkeleton';
import { ProductCardSkeleton } from '../ProductCardSkeleton';
import { ShopHeaderSkeleton } from '../ShopHeaderSkeleton';

describe('L4 Skeleton: Structural Components', () => {

  describe('ProductGridSkeleton', () => {
    it('L4-01: Renders correct number of skeleton items', () => {
      render(<ProductGridSkeleton count={4} />);
      const items = screen.getAllByTestId('product-card-skeleton');
      expect(items).toHaveLength(4);
    });

    it('L4-02: Uses grid layout classes', () => {
      render(<ProductGridSkeleton count={4} />);
      const grid = screen.getByTestId('product-grid-skeleton');
      expect(grid.className).toContain('grid');
    });

    it('L4-03: Responsive column classes present', () => {
      render(<ProductGridSkeleton count={4} />);
      const grid = screen.getByTestId('product-grid-skeleton');
      // Should have responsive grid classes
      expect(grid.className).toMatch(/grid-cols-2|grid-cols-1/);
    });
  });

  describe('ProductCardSkeleton', () => {
    it('L4-04: Has image placeholder with correct aspect ratio', () => {
      render(<ProductCardSkeleton />);
      const image = screen.getByTestId('skeleton-image');
      expect(image).toBeInTheDocument();
      // Should have aspect ratio class
      expect(image.className).toMatch(/aspect-/);
    });

    it('L4-05: Has brand text placeholder', () => {
      render(<ProductCardSkeleton />);
      expect(screen.getByTestId('skeleton-brand')).toBeInTheDocument();
    });

    it('L4-06: Has title text placeholder', () => {
      render(<ProductCardSkeleton />);
      expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
    });

    it('L4-07: Has price text placeholder', () => {
      render(<ProductCardSkeleton />);
      expect(screen.getByTestId('skeleton-price')).toBeInTheDocument();
    });

    it('L4-08: Uses animate-pulse for loading effect', () => {
      render(<ProductCardSkeleton />);
      const root = screen.getByTestId('product-card-skeleton');
      expect(root.className).toContain('animate-pulse');
    });
  });

  describe('ShopHeaderSkeleton', () => {
    it('L4-09: Has title placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-title')).toBeInTheDocument();
    });

    it('L4-10: Has count placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-count')).toBeInTheDocument();
    });
  });

});
