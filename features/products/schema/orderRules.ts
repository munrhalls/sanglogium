// What the proof's rules say about ONE document, as Studio validators. The rules over the whole set live in tools/product-rules.mjs;
// the create gate (tools/create-product.mjs) runs those. A validator sees one document, so only these parts can be here:
//   rule 3  a closed list stays closed: a value is one of the list, so it has one spelling
//   rule 4  a name or sku is used by one product
//   rule 5  a filter field does not hold one value twice
// Rule 1 (one form) is the declared type of each field, which Studio already checks.
// Rule 2 (one way to say no value) is not here, and cannot be: it relates products at a place (some write [] there, some null),
// so one document cannot break it alone. Only the gate, which sees the whole set, can judge it.

// A field whose options.list is only a placeholder: the values are free text.
const OPEN_LIST = ["compatibility"];

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const inList = (list: string[]) => (Rule: any) =>
  Rule.custom((v: unknown) => v === undefined || (Array.isArray(v) ? v : [v]).every((x) => list.includes(x as string)) || `Pick from the list: ${list.join(", ")}`);

// Rule 4 for a text field: no other product has the same value, case and punctuation ignored.
export const usedOnce = (key: "name" | "sku") => (Rule: any) =>
  Rule.custom(async (v: unknown, context: any) => {
    if (typeof v !== "string" || !norm(v)) return true;
    const id = String(context.document?._id ?? "").replace(/^drafts\./, "");
    const others: unknown[] = await context
      .getClient({ apiVersion: "2024-11-14" })
      .fetch(`*[_type == "product" && !(_id in [$id, "drafts." + $id])].${key}`, { id });
    return !others.some((other) => typeof other === "string" && norm(other) === norm(v)) || `Another product already has this ${key}.`;
  });

// A field definition with rules 3 and 5 added, and its subfields too. filterAttributes.sourcing is not read by the proof, so it is left alone.
export function ordered(field: any, path = ""): any {
  const here = path ? `${path}.${field.name}` : field.name;
  if (here === "sourcing") return field;
  const list: string[] | undefined = field.options?.list ?? (field.type === "array" ? field.of?.find((m: any) => m.options?.list)?.options.list : undefined);
  const ofValues = field.type === "array" && field.of?.every((m: any) => m.type !== "object");
  const own = field.validation;
  const closed = list && !OPEN_LIST.includes(here);
  return {
    ...field,
    ...(field.type === "object" && field.fields ? { fields: field.fields.map((f: any) => ordered(f, here)) } : {}),
    ...(closed || ofValues
      ? {
          validation: (Rule: any) => [
            ...(own ? [own(Rule)].flat() : []),
            ...(closed ? [inList(list)(Rule)] : []),
            ...(ofValues ? [Rule.unique()] : []),
          ],
        }
      : {}),
  };
}
