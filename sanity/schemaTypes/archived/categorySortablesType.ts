import { defineType, defineField } from "sanity";

export const categorySortablesType = defineType({
  name: "categorySortables",
  title: "Category Sortables",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Name of this category sortables collection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sortOptions",
      title: "Sort Options",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Sort Name",
              type: "string",
              description: "Unique identifier for this sort option",
              validation: (rule) => rule.required(),
            },
            {
              name: "displayName",
              title: "Display Name",
              type: "string",
              description: "User-facing name for this sort option",
              validation: (rule) => rule.required(),
            },
            {
              name: "type",
              title: "Sort Type",
              type: "string",
              options: {
                list: ["alphabetic", "numeric", "date", "boolean"],
              },
              validation: (rule) => rule.required(),
            },
            {
              name: "field",
              title: "Field to Sort",
              type: "string",
              description: "Field path in the document that will be sorted",
              validation: (rule) => rule.required(),
            },
            {
              name: "defaultDirection",
              title: "Default Direction",
              type: "string",
              options: {
                list: ["asc", "desc"],
              },
              description: "Default sort direction",
              validation: (rule) => rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "categoryMappings",
      title: "Category Path Mappings",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "path",
              title: "Category Path",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "sortOptions",
              title: "Sort Options",
              type: "array",
              of: [{ type: "string" }],
              description: "Names of sort options to apply to this category",
            },
          ],
        },
      ],
    }),
  ],
});
