"use client";

const TRACK_ACTIVE_FILL = "#D4AF37"; // accent-500
const TRACK_REST = "#4A4948"; // secondary-700

const THUMB_CLASSES =
  "price-range-input pointer-events-none absolute left-0 right-0 top-1/2 h-3 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 " +
  // Vertical centring: the input box is exactly thumb-height (12px) and is
  // itself centred on the track line (top-1/2 -translate-y-1/2). Both engines
  // then centre the 12px thumb on the equally-tall runnable track, so the disc
  // centre-y lands on the input mid-line — and thus the track centreline — with
  // no per-engine margin correction. Do NOT reintroduce a margin-top hack.
  "[&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  // NB: the -webkit-appearance:none reset + border-radius the WebKit thumb needs
  // to render as a disc lives in globals.css (.price-range-input) — Tailwind v3
  // emits only unprefixed `appearance` and won't compile that on this pseudo.
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-accent-500 [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb:hover]:border-accent-400 " +
  // Firefox centres ::-moz-range-thumb on ::-moz-range-track automatically.
  "[&::-moz-range-track]:h-full [&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent-500 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.5)]";

export function DualRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  minLabel,
  maxLabel,
  onChangeMin,
  onChangeMax,
  maxDisabled = false,
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  minLabel: string;
  maxLabel: string;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
  /** Premium tier active: the max handle is frozen and greyed, the track fill
   *  runs the full width, and only the minimum handle stays draggable. */
  maxDisabled?: boolean;
}) {
  const span = max > min ? max - min : 1;
  const startPercent = ((minValue - min) / span) * 100;
  const endPercent = maxDisabled ? 100 : ((maxValue - min) / span) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-6">
        <div
          className="rounded-full absolute left-1.5 right-1.5 top-1/2 h-0.5 -translate-y-1/2"
          style={{
            background: `linear-gradient(to right, ${TRACK_REST} 0%, ${TRACK_REST} ${startPercent}%, ${TRACK_ACTIVE_FILL} ${startPercent}%, ${TRACK_ACTIVE_FILL} ${endPercent}%, ${TRACK_REST} ${endPercent}%, ${TRACK_REST} 100%)`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          aria-label="Minimum price"
          onChange={(event) => onChangeMin(Math.min(Number(event.target.value), maxValue))}
          className={THUMB_CLASSES}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          aria-label="Maximum price"
          disabled={maxDisabled}
          title={
            maxDisabled
              ? "Set by the premium tier — untick it to use the slider maximum"
              : undefined
          }
          onChange={(event) => onChangeMax(Math.max(Number(event.target.value), minValue))}
          className={`${THUMB_CLASSES}${
            maxDisabled
              ? " cursor-not-allowed opacity-40 [&::-webkit-slider-thumb]:cursor-not-allowed [&::-moz-range-thumb]:cursor-not-allowed"
              : ""
          }`}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="type-caption text-text-caption">{minLabel}</span>
        <span className="type-caption text-text-caption">{maxLabel}</span>
      </div>
    </div>
  );
}
