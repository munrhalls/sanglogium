import { getProductById } from "@/sanity/lib/products/getProductById";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import ProductPageGallery from "./ProductPageGallery";
import StockIndicator from "./StockIndicator";
// import InfoToolTip from "@/app/components/ui/info-tool-tip/InfoToolTip";
import BasketControls from "@/app/components/features/basket/BasketControls";
import { BasketItem } from "@/store/store";
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const product = await getProductById(id);
  if (
    !product ||
    !product.name ||
    product.stock === undefined ||
    !product.price
  ) {
    return notFound();
  }
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const basketProduct: BasketItem = {
    _id: product._id,
    name: product.name,
    stock: product.stock,
    price: product.price,
    quantity: 1,
  };
  return (
    <div className="mx-auto grid max-w-[1400px] auto-rows-min justify-center gap-4 p-4 sm:grid-cols-2 lg:gap-12 xl:gap-16">
      <ProductPageGallery product={product} />
      <div className="grid items-center">
        <div>
          <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
          <div className="mb-4 text-3xl font-semibold">
            ${product.displayPrice.toFixed(2)}
          </div>
        </div>
        <div className="mb-6">
          {Array.isArray(product.description) && (
            <PortableText value={product.description} />
          )}
        </div>
        {isOutOfStock ? (
          <div className="">
            <span className="rounded-sm text-lg font-bold text-white">
              Out of stock
            </span>
          </div>
        ) : (
          <div>
            <StockIndicator />
            <BasketControls product={basketProduct} />
          </div>
        )}
      </div>
      {product.overviewFields && product.overviewFields.length > 0 && (
        <div className="mb-6 border-b-2 border-l-2 border-gray-400 pb-4 pl-4 md:max-w-[500px]">
          <h2 className="mb-4 text-center text-2xl font-bold">Overview</h2>
          <ul className="list-inside list-disc">
            {product.overviewFields.map((field, index) => (
              <li key={index}>
                <strong>{field.title}:</strong> {field.value}
                {field.information && (
                  <span className="ml-1 mt-1">
                    <InfoTooltip information={field.information} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mb-6 border-b-2 border-l-2 border-gray-400 pb-4 pl-4 md:max-w-[500px]">
          <h2 className="mb-4 text-center text-2xl font-bold">
            Specifications
          </h2>
          <ul className="list-inside list-disc">
            {product.specifications.map((spec, index) => (
              <li key={index}>
                <strong>{spec.title}:</strong> {spec.value}
                {spec.information && (
                  <span className="ml-1 mt-1">
                    <InfoTooltip information={spec.information} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
