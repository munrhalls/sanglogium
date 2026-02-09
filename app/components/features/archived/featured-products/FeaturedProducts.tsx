import CarouselMultiSlide from "../../../../ui/carousel-multi-slide/carouselMultiSlide";
import SegmentTitle from "../../../../ui/segment-title/SegmentTitle";
import Link from "next/link";
import Price from "../../../../ui/commercials/minor/price";
import BrandTitle from "../../../../ui/commercials/minor/brandTitle";
import ProductName from "../../../../ui/commercials/minor/productName";
import Image from "next/image";
import { imageUrl } from "@/lib/sanity/imageUrl";
import { BlockContent } from "@/sanity.types";
import { getCommercialsByFeature } from "@/sanity/lib/commercials/getCommercialsByFeature";
type Product = {
  _id: string;
  name: string;
  brand: string;
  description: BlockContent;
  price: number;
  image: string;
};
function isProduct(item: unknown): item is Product {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as Product)._id === "string" &&
    typeof (item as Product).name === "string" &&
    typeof (item as Product).brand === "string" &&
    typeof (item as Product).description === "object" &&
    typeof (item as Product).price === "number" &&
    typeof (item as Product).image === "string"
  );
}
export default async function FeaturedProducts() {
  const [commercial] = await getCommercialsByFeature("featured-products");
  if (!commercial || !commercial.products) return null;
  const products = commercial?.products;
  const verified = products?.filter(isProduct);
  const keys = verified.map((product) => product._id);
  const prebuilt = verified.map((product) => {
    return (
      <div
        key={product._id + "_bestseller"}
        className="group relative grid h-full w-full place-items-center p-4"
      >
        <Link
          className="grid h-full w-full max-w-[300px] grid-rows-[auto_2fr_auto] border border-black p-4 group-hover:border-[1px] group-hover:border-orange-500"
          href={`/product/${product._id}`}
        >
          <BrandTitle brand={product.brand} />
          <div className="h-full w-full">
            <Image
              src={imageUrl(product.image).url()}
              height={300}
              width={300}
              alt={product.brand}
              className="h-full w-full object-cover"
            />
          </div>
          <ProductName name={product.name} />
          <Price price={product.price} priceColor="#50C878" />
        </Link>
      </div>
    );
  });
  return (
    <div className="grid w-full grid-rows-[1fr_4fr]">
      <SegmentTitle title="Wireless Earbuds" />
      <div className="h-full min-h-[400px] w-full">
        {prebuilt && (
          <CarouselMultiSlide prebuiltSlides={prebuilt} keys={keys} />
        )}
      </div>
    </div>
  );
}
