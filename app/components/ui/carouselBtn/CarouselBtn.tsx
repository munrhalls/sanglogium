import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface CarouselBtnProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}

export const CarouselBtn = ({
  direction,
  onClick,
  disabled,
}: CarouselBtnProps) => {
  const isLeft = direction === "prev";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:h-12 md:w-12 ${
        isLeft ? "left-2 md:left-4" : "right-2 md:right-4"
      }`}
      aria-label={`${direction} slide`}
    >
      {isLeft ? (
        <CaretLeftIcon size={32} weight="light" />
      ) : (
        <CaretRightIcon size={32} weight="light" />
      )}
    </button>
  );
};
