"use client";

import { Product } from '@/sanity-cms/lib/products/getProductBySlug';
import { urlFor } from '@/sanity-cms/lib/image';
import { useState } from 'react';
import { Price } from '@/app/components/ui/Price';
import { ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { QuantitySelector } from '@/app/components/ui/QuantitySelector';
import { centsToDisplay } from '@/lib/utils/price';
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { WishlistButton } from "@/app/components/features/wishlist/WishlistButton";

// Fields at or above this word count are treated as narrative content (paragraphs,
// e.g. Description/Sustainability/Battery Life copy) and demoted into the collapsed
// "Full Details" section instead of the quick-scan grid. Word count, not character
// count — verified against live catalog data that a 142-character/27-word sentence
// ("Feel the incredible power of sound and bass with ULT WEAR. Press the ULT
// button...") was slipping under a character-based threshold; word count separates
// short facts ("Closed-Back", 7-11 word feature lines) from actual prose more
// reliably. Heuristic, not schema-derived — overviewFields titles/values are free
// text with no classification field in the Sanity schema.
const NARRATIVE_FIELD_MIN_WORDS = 20;

type OverviewFieldData = { _key?: string; title: string; value: string };

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function OverviewField({ field }: { field: OverviewFieldData }) {
  const paragraphs = field.value.split('\n\n').filter(Boolean);
  return (
    <div>
      <p className="type-caption uppercase text-secondary">{field.title}</p>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="type-body text-primary">{para}</p>
        ))}
      </div>
    </div>
  );
}

// Multiple catalog entries share the same literal title (e.g. many fields titled
// just "Feature") — repeating that caption once per entry reads as broken/repetitive.
// General rule, not hardcoded to any specific title: group fields by title, render
// a single caption + bullet list for any title that repeats, keep the normal
// label+value layout for titles that appear once.
function groupFieldsByTitle(fields: OverviewFieldData[]): { title: string; fields: OverviewFieldData[] }[] {
  const order: string[] = [];
  const groups = new Map<string, OverviewFieldData[]>();
  for (const field of fields) {
    if (!groups.has(field.title)) {
      order.push(field.title);
      groups.set(field.title, []);
    }
    groups.get(field.title)!.push(field);
  }
  return order.map((title) => ({ title, fields: groups.get(title)! }));
}

export function ProductInfo({ product, isInWishlist = false }: { product: Product; isInWishlist?: boolean }) {
  const [preAddQty, setPreAddQty] = useState(1);
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-error-500' };
    if (product.stock <= 5) return { text: `Only ${product.stock} left`, color: 'text-warning-500' };
    return { text: 'In Stock', color: 'text-success-500' };
  };
  const stockStatus = getStockStatus();

  const overviewFields = product.overviewFields || [];
  const quickFields = overviewFields.filter((field) => wordCount(field.value) < NARRATIVE_FIELD_MIN_WORDS);
  const narrativeFields = overviewFields.filter((field) => wordCount(field.value) >= NARRATIVE_FIELD_MIN_WORDS);
  const quickGroups = groupFieldsByTitle(quickFields);

  return (
    <div className="space-y-4 lg:space-y-5 lg-touch:space-y-3" data-testid="product-info">
      <div className="space-y-2">
        <p className="type-overline text-accent-500">{product.brand?.name || ''}</p>
        <h1 className="type-section-hed lg:text-h2 text-headline break-words">{product.name}</h1>
        <div className="flex items-center gap-4">
          <Price value={displayPrice} />
        </div>
        <p className={`type-caption ${stockStatus.color}`}>{stockStatus.text}</p>
      </div>

      {/* Buy box: placed directly after price/stock so it never depends on
          overview-field content length (previously pushed down by variable-length
          overview content; now first regardless of how much content follows). */}
      <div className="pt-2 lg:pt-4 lg-touch:pt-2 space-y-2">
        <div className="flex items-center gap-4">
          <BasketControls
            productId={product._id}
            isBasketPage={false}
            wrapperClassName="flex items-center gap-4"
          />
          <WishlistButton
            productId={product._id}
            initiallyInWishlist={isInWishlist}
          />
        </div>
        <p className="type-caption text-secondary">
          Domestic Multi-Carrier Shipping · 2-Year Warranty · Expert Support
        </p>
      </div>

      {overviewFields.length > 0 && (
        <div className="space-y-4 py-4 lg-touch:py-2 lg:mt-2 border-y border-border-secondary">
          {quickGroups.map(({ title, fields }, groupIndex) =>
            fields.length > 1 ? (
              <div key={title || groupIndex}>
                <p className="type-caption uppercase text-secondary">{title}</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  {fields.map((field, i) => (
                    <li key={field._key ?? i} className="type-body text-primary">{field.value}</li>
                  ))}
                </ul>
              </div>
            ) : null
          )}

          {quickGroups.some(({ fields }) => fields.length === 1) && (
            <div className="grid grid-cols-2 gap-4">
              {quickGroups
                .filter(({ fields }) => fields.length === 1)
                .map(({ fields }) => (
                  <OverviewField key={fields[0]._key ?? fields[0].title} field={fields[0]} />
                ))}
            </div>
          )}

          {narrativeFields.length > 0 && (
            <details>
              <summary className="type-caption uppercase text-secondary cursor-pointer select-none">
                Full Details
              </summary>
              <div className="mt-3 space-y-4">
                {narrativeFields.map((field, index) => (
                  <OverviewField key={field._key ?? index} field={field} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
