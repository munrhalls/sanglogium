import { defineType, defineField, defineArrayMember } from "sanity";
import { FilterIcon } from "@sanity/icons";

export const categoryFiltersType = defineType({
  name: "categoryFilters",
  title: "Category Filters",
  type: "document",
  icon: FilterIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Human-readable name for this filter set (e.g., 'Headphones')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categoryKey",
      title: "VFS Category Key",
      type: "string",
      description: "The VFS slot ID this filter set applies to (e.g., 'ugyeto8653n495dpf89nzoar')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "filters",
      title: "Filters",
      type: "object",
      fields: [
        defineField({
          name: "filterItems",
          title: "Filter Items",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "filterItem",
              fields: [
                defineField({
                  name: "name",
                  title: "Filter Name",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "type",
                  title: "Filter Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Checkbox", value: "checkbox" },
                      { title: "Radio", value: "radio" },
                      { title: "Multiselect", value: "multiselect" },
                      { title: "Range", value: "range" },
                      { title: "Boolean", value: "boolean" },
                    ],
                  },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "filterCategory",
                  title: "Filter Category",
                  type: "string",
                  options: {
                    list: [
                      { title: "Regular", value: "regular" },
                      { title: "Overview", value: "overview" },
                      { title: "Specifications", value: "specifications" },
                      { title: "Range", value: "range" },
                    ],
                  },
                }),
                defineField({
                  name: "field",
                  title: "Field Name",
                  type: "string",
                  description: "The product field this filter applies to",
                }),
                defineField({
                  name: "options",
                  title: "Options",
                  type: "array",
                  of: [{ type: "string" }],
                  description: "For checkbox, radio, or multiselect filters",
                }),
                defineField({
                  name: "defaultValue",
                  title: "Default Value",
                  type: "string",
                }),
                defineField({
                  name: "min",
                  title: "Min Value",
                  type: "number",
                  description: "For range filters",
                }),
                defineField({
                  name: "max",
                  title: "Max Value",
                  type: "number",
                  description: "For range filters",
                }),
                defineField({
                  name: "isMinOnly",
                  title: "Min Only",
                  type: "boolean",
                  description: "For range filters that only have a minimum",
                  initialValue: false,
                }),
                defineField({
                  name: "step",
                  title: "Step",
                  type: "number",
                  description: "Step increment for range filters",
                  initialValue: 1,
                }),
              ],
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
              name: "filters",
              title: "Filters",
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
