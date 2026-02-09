import Image from "next/image";
import { useMemo } from "react";
import { generateBlurDataURL, heroImageUrl } from "@/lib/sanity/imageUrl";
import TextCommercial from "@/app/components/ui/commercials/textCommercial";
import ProductsCommercial from "@/app/components/ui/commercials/productCommercial";
import { GET_COMMERCIALS_BY_FEATURE_QUERYResult } from "@/sanity.types";
type ProductDescription = NonNullable<
  NonNullable<
    GET_COMMERCIALS_BY_FEATURE_QUERYResult[0]["products"]
  >[0]["description"]
>;
type SlideProps = {
  commercial: GET_COMMERCIALS_BY_FEATURE_QUERYResult[number];
  index: number;
};
type ProductVerified = {
  _id: string;
  brand: string;
  name: string;
  description: ProductDescription;
  price: number;
  image: string;
};
const isProductVerified = (product: unknown): product is ProductVerified => {
  if (!product || typeof product !== "object") return false;
  const p = product as Partial<ProductVerified>;
  return Boolean(
    p._id && p.brand && p.name && p.description && p.price != null && p.image
  );
};
const HeroCommercialItem = ({ commercial, index }: SlideProps) => {
  const {
    _id,
    variant,
    products,
    text,
    image,
    sale,
    ctaLink = null,
    title = "Hero commercial",
  } = commercial;
  const productsVerified = useMemo(
    () => products?.filter(isProductVerified) ?? [],
    [products]
  );
  const isFirstSlide = index === 0;
  const blurUrl = useMemo(
    () => (image ? generateBlurDataURL(image) : ""),
    [image]
  );
  const imageSrc = useMemo(
    () => (image ? heroImageUrl(image).url() : ""),
    [image]
  );
  const discount = sale?.discount ?? null;
  if (!image) return null;
  return (
    <div className="relative h-full flex-[0_0_100%]">
      <Image
        src={imageSrc}
        loading={"eager"}
        fetchPriority={"high"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
        style={{ objectFit: "cover", objectPosition: "right" }}
        className={`absolute inset-0 h-full w-full object-cover`}
        quality={65}
        placeholder="blur"
        blurDataURL={blurUrl}
        alt={title || "Hero commercial"}
      />
      {variant === "text" && text ? (
        <TextCommercial text={text} ctaLink={ctaLink} />
      ) : productsVerified.length > 0 ? (
        <ProductsCommercial
          products={productsVerified}
          discount={discount}
          text={text}
          ctaLink={ctaLink}
        />
      ) : null}
    </div>
  );
};
export default HeroCommercialItem;
