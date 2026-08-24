import React from 'react';
import {
  SHOP_HEADER_WRAPPER_CLASSES,
  SHOP_HEADER_OVERLINE_CLASSES,
  SHOP_HEADER_TITLE_CLASSES,
} from './ShopHeader';

export function ShopHeaderSkeleton() {
  return (
    <header className={SHOP_HEADER_WRAPPER_CLASSES} data-testid="shop-header-skeleton">
      <span
        data-testid="skeleton-header-overline"
        className={`${SHOP_HEADER_OVERLINE_CLASSES} bg-secondary-800 rounded w-24 animate-pulse inline-block`}
      >
        &nbsp;
      </span>
      <div
        data-testid="skeleton-header-title"
        className={`${SHOP_HEADER_TITLE_CLASSES} bg-secondary-800 rounded w-1/3 animate-pulse`}
      >
        &nbsp;
      </div>
    </header>
  );
}
