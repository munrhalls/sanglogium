import { defineType, defineField } from "sanity";

export const filterPicklistType = defineType({
  name: "filterPicklist",
  title: "Filter picklist",
  type: "document",
  fields: [
    defineField({
      name: "fields",
      title: "Filter fields",
      type: "array",
      description: "The product fields that become filter controls, by field name (e.g. price, brand).",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.unique(),
    }),
  ],
});
