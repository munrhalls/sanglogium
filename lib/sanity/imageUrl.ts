import { client } from "@/sanity-cms/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
const builder = imageUrlBuilder(client);

export const generateBlurDataURL = (source: SanityImageSource): string => {
  return builder.image(source).width(20).blur(10).quality(10).format("webp").url();
};

export const imageUrl = (source: SanityImageSource) => {
  return builder.image(source).auto("format").quality(65).fit("max");
};
export const heroImageUrl = (source: SanityImageSource) => {
  return imageUrl(source).quality(65).format("webp");
};
export const thumbnailImageUrl = (source: SanityImageSource) => {
  return imageUrl(source).width(400).quality(75);
};
export const brandImageUrl = (source: SanityImageSource) => {
  console.log("brand image url", source);
  return builder.image(source).auto("format").quality(85);
};
