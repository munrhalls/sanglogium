import { defineType, defineField } from "sanity";

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

export const makeFilterPicklistType = (paths: { headphones: string[]; audioElectronics: string[]; accessories: string[] }) =>
  defineType({
    name: "filterPicklist",
    title: "Filter picklist",
    type: "document",
    fields: [
      listField("headphones", "Headphones", paths.headphones),
      listField("audioElectronics", "Audio electronics", paths.audioElectronics),
      listField("accessories", "Accessories", paths.accessories),
    ],
  });
