import { defineArrayMember, defineField, defineType } from "sanity";

export const makeFilterLabelsType = (paths: string[]) =>
  defineType({
    name: "filterLabels",
    title: "Filter labels",
    type: "document",
    fields: [
      defineField({
        name: "labels",
        title: "Labels",
        type: "array",
        description:
          "Wording that replaces the automatic one. No row, or an empty text, means the automatic wording. If two rows name the same field and value, the first one counts.",
        of: [
          defineArrayMember({
            name: "label",
            type: "object",
            fields: [
              defineField({
                name: "field",
                title: "Field",
                type: "string",
                options: { list: paths.map((path) => ({ title: path, value: path })) },
              }),
              defineField({
                name: "value",
                title: "Option value",
                type: "string",
                description: "Leave empty to rename the control itself. To rename one option, type the stored value (capitals do not matter).",
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
