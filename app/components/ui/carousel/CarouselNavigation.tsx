// "use client";

// import React from "react";
// import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
// import { useCarousel } from "./Carousel"; // Changed import source
// import { cn } from "@/lib/utils/tailwind";

// // REMOVED: absolute positioning, top/left coordinates, translate.
// // KEPT: Visual styling (colors, shape, blur, interaction).
// const BTN_BASE =
//   "flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:h-12 md:w-12";

// interface NavBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   className?: string;
// }

// export function CarouselPrevious({ className, ...props }: NavBtnProps) {
//   // Consuming from the centralized hook
//   const { scrollPrev, canScrollPrev } = useCarousel();

//   return (
//     <button
//       type="button"
//       onClick={scrollPrev}
//       disabled={!canScrollPrev}
//       // We pass `className` last so you can add 'absolute' back conditionally if needed
//       className={cn(BTN_BASE, className)}
//       aria-label="Previous slide"
//       {...props}
//     >
//       <CaretLeftIcon size={32} weight="light" />
//     </button>
//   );
// }

// export function CarouselNext({ className, ...props }: NavBtnProps) {
//   const { scrollNext, canScrollNext } = useCarousel();

//   return (
//     <button
//       type="button"
//       onClick={scrollNext}
//       disabled={!canScrollNext}
//       className={cn(BTN_BASE, className)}
//       aria-label="Next slide"
//       {...props}
//     >
//       <CaretRightIcon size={32} weight="light" />
//     </button>
//   );
// }
