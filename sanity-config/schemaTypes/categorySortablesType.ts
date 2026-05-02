import { defineType, defineField, defineArrayMember } from "sanity";
import { SortIcon } from "@sanity/icons";

export const categorySortablesType = defineType({
  name: "categorySortables",
  title: "Category Sortables",
  type: "document",
  icon: SortIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Human-readable name for this sortable set (e.g., 'Headphones')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categoryKey",
      title: "VFS Category Key",
      type: "string",
      description: "The VFS slot ID this sortable set applies to (e.g., 'ugyeto8653n495dpf89nzoar')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sortOptions",
      title: "Sort Options",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "sortOption",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              description: "Machine name for this sort option (e.g., 'price', 'name')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "displayName",
              title: "Display Name",
              type: "string",
              description: "Human-readable name (e.g., 'Price', 'Product Name')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Alphabetic", value: "alphabetic" },
                  { title: "Numeric", value: "numeric" },
                  { title: "Date", value: "date" },
                  { title: "Boolean", value: "boolean" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "field",
              title: "Field",
              type: "string",
              description: "The product field to sort by (e.g., 'price', 'name', 'releaseDate')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "defaultDirection",
              title: "Default Direction",
              type: "string",
              options: {
                list: [
                  { title: "Ascending", value: "asc" },
                  { title: "Descending", value: "desc" },
                ],
              },
              initialValue: "asc",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "categoryMappings",
      title: "Category Mappings",
      type: "array",
      description: "Legacy field - now handled by categoryKey",
      of: [
        defineArrayMember({
          type: "object",
          name: "categoryMapping",
          fields: [
            defineField({
              name: "path",
              title: "Path",
              type: "string",
            }),
            defineField({
              name: "sortOptions",
              title: "Sort Options",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      categoryKey: "categoryKey",
    },
    prepare(selection) {
      return {
        title: `${selection.title}`,
        subtitle: `VFS Key: ${selection.categoryKey || "Not set"}`,
      };
    },
  },
});
