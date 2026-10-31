import { defineArrayMember, defineField, defineType } from "sanity";
import { apiVersion } from "../../../platform/sanity/env";

type Row = { field?: string; value?: string; text?: string };
type Reader = { fetch: (query: string, params?: Record<string, unknown>) => Promise<any> };

const PUBLISHED = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';

// The values the published products hold at a control, as the text the owner types: a number in digits, true or false, text as stored.
// An always-on field is a product path (brand is a reference, read as its name); a pick is a filterAttributes path.
async function heldValues(field: string, alwaysOn: boolean, client: Reader): Promise<string[]> {
  if (!/^[A-Za-z0-9_.]+$/.test(field)) return [];
  const path = alwaysOn ? `coalesce(${field}->name, ${field})` : `filterAttributes.${field}`;
  const rows: { v: unknown }[] = await client.fetch(`*[_type == "product" && ${PUBLISHED}]{ "v": ${path} }`);
  return rows.flatMap((r) => (Array.isArray(r.v) ? r.v : [r.v])).filter((x) => x !== null && x !== undefined).map(String);
}

/**
 * Why these rows cannot be saved, or true. A row must name a control of the stored picklist (an always-on field or any pick) and,
 * when it has a value, a value some published product holds, exactly as stored. A field and value can be named once.
 */
export async function checkLabelRows(rows: Row[] | undefined, client: Reader): Promise<true | string> {
  if (!rows?.length) return true;
  const picklist = await client.fetch(`*[_id == "filterPicklist"][0]`);
  const alwaysOn: string[] = Array.isArray(picklist?.alwaysOn) ? picklist.alwaysOn : [];
  const controls = new Set<string>(
    Object.entries(picklist ?? {}).flatMap(([key, list]) => (!key.startsWith("_") && Array.isArray(list) ? (list as string[]) : [])),
  );
  const problems: string[] = [];
  const named = new Set<string>();
  const held = new Map<string, string[]>();
  for (const [i, row] of rows.entries()) {
    const at = `Row ${i + 1}`;
    const field = row.field ?? "";
    const value = row.value ?? "";
    if (!controls.has(field)) {
      problems.push(`${at}: "${field}" is not a control of the picklist. The controls are: ${[...controls].join(", ")}.`);
      continue;
    }
    if (named.has(`${field}\n${value}`)) problems.push(`${at}: ${field}${value ? ` · ${value}` : " (control name)"} is already named by another row.`);
    named.add(`${field}\n${value}`);
    if (!value) continue;
    if (!held.has(field)) held.set(field, await heldValues(field, alwaysOn.includes(field), client));
    if (!held.get(field)!.includes(value)) problems.push(`${at}: no product holds "${value}" for ${field}. Type it exactly as stored.`);
  }
  return problems.length ? problems.join("\n") : true;
}

export const filterLabelsType = defineType({
  name: "filterLabels",
  title: "Filter labels",
  type: "document",
  fields: [
    defineField({
      name: "labels",
      title: "Labels",
      type: "array",
      description:
        "Wording that replaces the automatic one. No row, or an empty text, means the automatic wording. A field and value can appear in one row only.",
      validation: (Rule) =>
        Rule.custom(async (rows, context) => checkLabelRows(rows as Row[] | undefined, context.getClient({ apiVersion }))),
      of: [
        defineArrayMember({
          name: "label",
          type: "object",
          fields: [
            defineField({
              name: "field",
              title: "Field",
              type: "string",
              description: "A control of the picklist, written as the picklist writes it: an always-on field, a pick such as wearingStyle, or a nested one such as freqResponseHz.min.",
            }),
            defineField({
              name: "value",
              title: "Option value",
              type: "string",
              description: "Leave empty to rename the control itself. To rename one option, type the value exactly as stored: text as it is, a number in digits, true or false.",
            }),
            defineField({ name: "text", title: "Text", type: "string" }),
          ],
          preview: {
            select: { field: "field", value: "value", text: "text" },
            prepare: ({ field, value, text }) => ({
              title: value ? `${field} · ${value}` : `${field} (control name)`,
              subtitle: text,
            }),
          },
        }),
      ],
    }),
  ],
});
