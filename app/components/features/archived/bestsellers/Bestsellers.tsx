import CarouselMultiSlide from "../../../../ui/carousel-multi-slide/carouselMultiSlide";
import SegmentTitle from "../../../../ui/segment-title/SegmentTitle";
import Price from "../../../../ui/commercials/minor/price";
import BrandTitle from "../../../../ui/commercials/minor/brandTitle";
import ProductName from "../../../../ui/commercials/minor/productName";
import { getCommercialsByFeature } from "@/sanity/lib/commercials/getCommercialsByFeature";
import Image from "next/image";
import { imageUrl } from "@/lib/sanity/imageUrl";
import Link from "next/link";
import { BlockContent } from "@/sanity.types";
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
export default async function Bestsellers() {
  const [commercial] = await getCommercialsByFeature("bestsellers");
  const bestsellers = commercial.products;
  const verified = bestsellers?.filter(isProduct);
  verified?.sort((a, b) => b.price - a.price);
  const keys: string[] =
    verified?.map((bestseller) => bestseller._id + "_carousel") || [];
  const prebuilt = verified?.map((bestseller) => {
    return (
      <div
        key={bestseller._id + "_bestseller"}
        className="group relative grid h-full w-full place-items-center p-4"
      >
        <Link
          className="grid h-full w-full max-w-[300px] grid-rows-[auto_2fr_auto] border border-black group-hover:border-[1px] group-hover:border-orange-500"
          href={`/product/${bestseller._id}`}
        >
          <BrandTitle brand={bestseller.brand} />
          <div className="h-full w-full">
            <Image
              src={imageUrl(bestseller.image).url()}
              height={300}
              width={300}
              alt={bestseller.brand}
              className="h-full w-full object-cover"
            />
          </div>
          <ProductName name={bestseller.name} />
          <Price price={bestseller.price} priceColor="rgb(242 132 0)" />
        </Link>
      </div>
    );
  });
  return (
    <div className="grid w-full grid-rows-[1fr_4fr]">
      <SegmentTitle title="Bestsellers" />
      <div className="h-full min-h-[400px] w-full">
        {prebuilt && (
          <CarouselMultiSlide prebuiltSlides={prebuilt} keys={keys} />
        )}
      </div>
    </div>
  );
}
