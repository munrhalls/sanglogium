import BasketItem from "./BasketItem";

interface BasketViewProps {
  basket: Array<{
    productId: string
    quantity: number
  }>
  cmsBasketItems: Array<{
    productId: string
    name: string
    displayPrice: number
    availableStock: number
  }>
}

export default function BasketView({ basket, cmsBasketItems }: BasketViewProps) {
  return (
    <div>
      {/* Header row - desktop only */}
      <div className="hidden lg-desktop:grid lg-touch:grid lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] border-b border-border-secondary px-6 py-3">
        <div className="type-caption uppercase tracking-editorial text-secondary-500">Product</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Price</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Quantity</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-right">Total</div>
      </div>

      {basket
        .map((item) => {
          const cmsItem = cmsBasketItems.find(cms => cms.productId === item.productId);
          if (!cmsItem) return null;
          return (
            <BasketItem
              key={item.productId}
              productId={item.productId}
              name={cmsItem.name}
              quantity={item.quantity}
              displayPrice={cmsItem.displayPrice}
            />
          );
        })
        .filter(Boolean)}
    </div>
  );
}
