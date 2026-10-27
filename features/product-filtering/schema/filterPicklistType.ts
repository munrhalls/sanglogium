import { defineType, defineField } from "sanity";

export const FIXED_IN_CODE = ["brand", "inStock", "price"];

export function filterFieldPaths(fields: any[], prefix = ""): string[] {
  const paths: string[] = [];
  for (const field of fields) {
    const path = prefix ? prefix + "." + field.name : field.name;
    if (field.type === "object" && Array.isArray(field.fields)) {
      paths.push(...filterFieldPaths(field.fields, path));
    } else {
      paths.push(path);
    }
  }
  return [...new Set(paths)].filter((path) => !FIXED_IN_CODE.includes(path));
}

const listField = (name: string, title: string, paths: string[]) =>
  defineField({
    name,
    title,
    type: "array",
    of: [{ type: "string" }],
    options: { list: paths.map((path) => ({ title: path, value: path })) },
    validation: (Rule) => Rule.unique(),
    description:
      "Fields that become filter controls for this slice. A field with no values among this slice's products draws nothing.",
  });

export const makeFilterPicklistType = (paths: string[]) =>
  defineType({
    name: "filterPicklist",
    title: "Filter picklist",
    type: "document",
    fields: [
      listField("headphones", "Headphones", paths),
      listField("audioElectronics", "Audio electronics", paths),
      listField("accessories", "Accessories", paths),
    ],
  });
