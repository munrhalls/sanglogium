// import Image from "next/image";
// import { imageUrl } from "@/lib/sanity/imageUrl";
// export default function ProductImage({
//   src,
//   brand,
// }: {
//   src: string;
//   brand: string;
// }) {
//   return (
//     <div className="relative mx-auto h-full w-full">
//       <Image
//         loading="lazy"
//         decoding="async"
//         quality={100}
//         sizes="(max-width: 768px) 36vw, 25vw"
//         src={imageUrl(src).url()}
//         alt={brand}
//         height={60}
//         width={60}
//         className="absolute inset-0 z-40 aspect-square h-full w-full rounded-sm object-contain"
//       />
//     </div>
//   );
// }
