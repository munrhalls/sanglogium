import { RefObject } from "react";

export interface CarouselBreakpoints {
  readonly mobilePortrait?: number;
  readonly mobileLandscape?: number;
  readonly xsPortrait?: number;
  readonly xsLandscape?: number;
  readonly smPortrait?: number;
  readonly smLandscape?: number;
  readonly mdPortrait?: number;
  readonly mdLandscape?: number;
  readonly lgTouch?: number;
  readonly lgDesktop?: number;
  readonly xl?: number;
}

export interface CarouselContextType {
  scrollRef: RefObject<HTMLDivElement | null>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  activeIndex: number;
  goTo: (index: number) => void;
  itemsCount: number;
  visibleCount: number;
  dotsCount: number;
}

export interface CarouselProviderProps {
  children: React.ReactNode;
  itemsCount: number;
  breakpointMap?: CarouselBreakpoints;
}

export interface NavbarManagerProps {
  navLinks: { id: string; label: string }[];
  children: React.ReactNode[];
}
