import { defineField, defineType } from "sanity";

export default defineType({
  name: "spotlight",
  title: "Marketing Spotlight",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Marketing Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Promo Text",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "product",
      title: "Linked Product",
      type: "reference",
      to: [{ type: "product" }],
    }),
  ],
});
