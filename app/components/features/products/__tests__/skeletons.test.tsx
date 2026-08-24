import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCardReveal } from '../ProductCardReveal';
import { ShopHeaderSkeleton } from '../ShopHeaderSkeleton';

describe('L4 Skeleton: Structural Components', () => {

  describe('ProductCardReveal (no product = skeleton state)', () => {
    it('L4-04: Has image placeholder with correct aspect ratio', () => {
      render(<ProductCardReveal />);
      const image = screen.getByTestId('skeleton-image');
      expect(image).toBeInTheDocument();
      const figure = image.closest('figure');
      expect(figure?.className).toMatch(/aspect-/);
    });

    it('L4-05: Has brand text placeholder', () => {
      render(<ProductCardReveal />);
      expect(screen.getByTestId('skeleton-brand')).toBeInTheDocument();
    });

    it('L4-06: Has title text placeholder', () => {
      render(<ProductCardReveal />);
      expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
    });

    it('L4-07: Has price text placeholder', () => {
      render(<ProductCardReveal />);
      expect(screen.getByTestId('skeleton-price')).toBeInTheDocument();
    });

    it('L4-08: Uses animate-pulse for loading effect', () => {
      render(<ProductCardReveal />);
      const root = screen.getByTestId('product-card-skeleton');
      expect(root.className).toContain('animate-pulse');
    });
  });

  describe('ShopHeaderSkeleton', () => {
    it('L4-09: Has title placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-title')).toBeInTheDocument();
    });

    it('L4-10: Has header skeleton wrapper', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('shop-header-skeleton')).toBeInTheDocument();
    });
  });

});
