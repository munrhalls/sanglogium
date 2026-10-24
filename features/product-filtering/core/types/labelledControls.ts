import type { Scalar } from '@/features/product-filtering/core/types/controlsAndOptions';

/** A checkbox option: `value` is what the URL carries, `text` is what the shopper reads. */
export interface LabelledOption {
  value: Scalar;
  text: string;
}
export type LabelledControl =
  | { control: 'checkbox'; name: string; options: LabelledOption[] }
  | { control: 'range'; name: string; min: number; max: number };
/** category -> field name -> labelled control */
export type LabelledControlsByCategory = Record<string, Record<string, LabelledControl>>;
