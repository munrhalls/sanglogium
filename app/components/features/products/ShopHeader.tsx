import React from 'react';

interface ShopHeaderProps {
  title: string;
  overline?: string;
}

export const SHOP_HEADER_WRAPPER_CLASSES = 'flex flex-col gap-2 mb-8';
export const SHOP_HEADER_OVERLINE_CLASSES = 'type-overline tracking-editorial uppercase';
export const SHOP_HEADER_TITLE_CLASSES = 'type-section-hed uppercase';

export function ShopHeader({ title, overline }: ShopHeaderProps) {
  return (
    <header className={SHOP_HEADER_WRAPPER_CLASSES} data-testid="shop-header">
      <span
        className={`${SHOP_HEADER_OVERLINE_CLASSES} text-secondary-400 section-header-anchor ${overline ? '' : 'invisible'}`}
        aria-hidden={!overline}
      >
        {overline || ' '}
      </span>
      <h1 className={SHOP_HEADER_TITLE_CLASSES}>{title}</h1>
    </header>
  );
}
