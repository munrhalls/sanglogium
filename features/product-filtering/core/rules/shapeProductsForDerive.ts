import type {
  DerivableProduct,
  FieldValue,
  RawPicklistDoc,
  RawProductDoc,
} from '@/features/product-filtering/core/types/controlsAndOptions';

/** Shapes the CMS documents for derive: one entry per product per catalogue key, unset fields dropped. */
export function shapeProductsForDerive(
  productDocs: RawProductDoc[],
  picklistDoc: RawPicklistDoc | null,
): { products: DerivableProduct[]; picklist: string[] } {
  const products: DerivableProduct[] = [];
  for (const doc of productDocs) {
    const fields: DerivableProduct['fields'] = {};
    for (const [name, value] of Object.entries(doc.filterAttributes ?? {})) {
      if (value !== null && value !== undefined) fields[name] = value as FieldValue | FieldValue[];
    }
    for (const category of doc.catalogueLocationKeys ?? []) products.push({ category, fields });
  }
  return { products, picklist: picklistDoc?.fields ?? [] };
}
