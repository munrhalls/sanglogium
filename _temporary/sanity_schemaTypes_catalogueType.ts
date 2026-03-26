import { defineField, defineType } from "sanity";

export const catalogueType = defineType({
  name: "catalogue",
  title: "Catalogue",
  type: "document",
  fields: [
    defineField({
      name: "catalogue",
      title: "Catalogue",
      description: "This tree defines the site URL structure and visual menu.",
      type: "array",
      of: [{ type: "catalogueItem" }],
    }),
  ],
});
