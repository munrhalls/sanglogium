export type Scalar = string | number | boolean;
/** A reference to another document: its id is the value, its name is for labels (not used here). */
export type ReferenceValue = { id: string; name: string };
export type FieldValue = Scalar | ReferenceValue;
export interface DerivableProduct {
  category: string;
  /** field name -> one value or a list of values (single-valued = list of one). */
  fields: Record<string, FieldValue | FieldValue[]>;
}
/** A product document as the CMS read returns it: its catalogue keys and its filterAttributes. */
export interface RawProductDoc {
  catalogueLocationKeys?: string[];
  filterAttributes?: Record<string, FieldValue | FieldValue[] | null> | null;
}
/** The picklist document as the CMS read returns it. */
export interface RawPicklistDoc {
  fields?: string[] | null;
}
export type DerivedControl =
  | { control: 'checkbox'; options: Scalar[] }
  | { control: 'range'; min: number; max: number };
/** category -> field name -> derived control */
export type ControlsByCategory = Record<string, Record<string, DerivedControl>>;
