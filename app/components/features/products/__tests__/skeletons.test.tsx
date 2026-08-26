import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShopHeaderSkeleton } from '../ShopHeaderSkeleton';

describe('L4 Skeleton: Structural Components', () => {

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
