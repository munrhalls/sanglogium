// import { getCommercialsByFeature } from "@/sanity/lib/commercials/getCommercialsByFeature";
// import { imageUrl } from "@/lib/sanity/imageUrl";
// import Image from "next/image";
// import { GET_COMMERCIALS_BY_FEATURE_QUERYResult } from "@/sanity.types";
// import { PortableText } from "@portabletext/react";
// import { PortableTextComponents } from "@portabletext/react";
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";

// export default async function MainCategories() {
//   const commercials = await getCommercialsByFeature("main-categories");
//   if (!commercials || !commercials.length) return null;
//   const verified = commercials.filter(
//     (
//       commercial
//     ): commercial is NonNullable<
//       GET_COMMERCIALS_BY_FEATURE_QUERYResult[number] & {
//         image: NonNullable<string>;
//         ctaLink: NonNullable<string>;
//         text: NonNullable<
//           GET_COMMERCIALS_BY_FEATURE_QUERYResult[number]["text"]
//         >;
//         order: number;
//       }
//     > => {
//       return (
//         commercial.image !== null &&
//         commercial.text !== null &&
//         commercial.ctaLink !== null
//       );
//     }
//   );
//   verified.sort((a, b) => a.order - b.order);
//   const components: PortableTextComponents = {
//     block: {
//       h1: ({ children }) => (
//         <h1
//           className={`z-50 rounded-xl p-3 pt-4 text-3xl font-black tracking-wider text-white md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
//         >
//           {children}
//         </h1>
//       ),
//       h2: ({ children }) => (
//         <h2 className="text-xl font-bold lg:text-3xl">{children}</h2>
//       ),
//       normal: ({ children }) => (
//         <p className="text-xl lg:text-3xl">{children}</p>
//       ),
//     },
//     marks: {
//       textColor: ({ value, children }) => (
//         <span style={{ color: value?.value || "inherit" }}>{children}</span>
//       ),
//     },
//   };
//   return (
//     <div className="relative grid h-full grid-rows-3 place-items-center bg-black lg:grid-cols-3 lg:grid-rows-1">
//       {verified &&
//         verified.map((commercial, index) => (
//           <div
//             key={commercial._id + "_mainCategory"}
//             className="relative z-30 grid h-full max-h-[300px] min-h-[350px] w-full max-w-[400px] place-content-center bg-black lg:min-h-[375px] lg:max-w-[600px] xl:min-h-[450px]"
//           >
//             <Link
//               href={commercial.ctaLink}
//               className="z-50 grid h-full w-full place-content-center rounded-xl"
//             >
//               <div
//                 className={`z-50 ${index < 2 ? "bg-black/30" : ""} rounded-xl p-4`}
//               >
//                 <PortableText value={commercial.text} components={components} />
//               </div>
//               <div
//                 className={`z-20 grid w-full cursor-pointer place-content-center rounded-sm px-6 text-center text-xl font-black text-white ${index < 2 ? "mt-4 py-2" : "mb-8 text-2xl"}`}
//               >
//                 <ArrowRight size={64} />
//               </div>
//             </Link>
//             <Image
//               src={imageUrl(commercial.image).url()}
//               priority={index === 0}
//               loading={index === 0 ? "eager" : "lazy"}
//               fill
//               className="absolute inset-0 aspect-square h-full w-full"
//               quality={60}
//               sizes="(max-width: 1023px) 400px, 600px"
//               alt={commercial.title || "Sale"}
//             />
//           </div>
//         ))}
//     </div>
//   );
// }
