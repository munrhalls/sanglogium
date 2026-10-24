export type Scalar = string | number | boolean;
/** A reference to another document: its id is the value, its name is for labels (not used here). */
export type ReferenceValue = { id: string; name: string };
export type FieldValue = Scalar | ReferenceValue;
export interface DerivableProduct {
  category: string;
  /** field name -> one value or a list of values (single-valued = list of one). */
  fields: Record<string, FieldValue | FieldValue[]>;
}
export type DerivedControl =
  | { control: 'checkbox'; options: Scalar[] }
  | { control: 'range'; min: number; max: number };
/** category -> field name -> derived control */
export type ControlsByCategory = Record<string, Record<string, DerivedControl>>;
