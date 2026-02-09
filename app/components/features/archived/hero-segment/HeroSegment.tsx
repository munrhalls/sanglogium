// import { HeroPayload } from "@/types";
// import { HeroSlide } from "./../hero-slide/HeroSlide";
// import {
//   Carousel,
//   CarouselItem,
//   CarouselContent,
// } from "@/app/components/ui/carousel/Carousel";
// import fetchHeroCommercials from "@/sanity/lib/commercials/...";

// export default async function HeroSegment() {
//   const data = await fetchHeroCommercials();
//   const { layout, slides } = data;

//   // A. Carousel Layout
//   if (layout === "carousel") {
//     // Map data to the format your generic carousel expects,
//     // OR update your carousel to accept children/components.
//     // Here we wrap our nice HeroSlide in the carousel.
//     const carouselSlides = slides.map((slide, index) => (
//       <CarouselItem key={slide._id}>
//         <HeroSlide slide={slide} layout="overlay" priority={index === 0} />
//       </CarouselItem>
//     ));

//     return (
//       <section className="h-[600px] w-full">
//         {/* <CarouselSingleSlide
//           prebuiltSlides={carouselSlides}
//           keys={slides.map((s) => s._id)}
//         /> */}
//         <Carousel>
//           <CarouselContent>{carouselSlides}</CarouselContent>
//         </Carousel>
//       </section>
//     );
//   }

//   // B. Static Layout (Split or Overlay)
//   // We just take the first slide since static heroes only show one thing.
//   const activeSlide = slides[0];

//   if (!activeSlide) return null;

//   return (
//     <section className="h-[600px] w-full border-b">
//       <HeroSlide slide={activeSlide} layout={layout} priority={true} />
//     </section>
//   );
// }
