import { defineArrayMember, defineField, defineType } from "sanity";
import { FilterLabelsInput } from "./FilterLabelsInput";

// The owner never types a field or a value: the input lists every control and option of the picklist, one section per slice, and stores a row per wording typed.
// A row that names nothing (a product's value changed since) is ignored by the labels map.
export const filterLabelsType = defineType({
  name: "filterLabels",
  title: "Filter labels",
  type: "document",
  fields: [
    defineField({
      name: "labels",
      title: "Labels",
      type: "array",
      description: "Every control of the picklist and its options, one section per slice. The grey text is the automatic wording; type in a line to replace it, empty the line to go back to it. A wording is stored once, so a control or option that several slices share shows the same wording in each.",
      components: { input: FilterLabelsInput },
      of: [
        defineArrayMember({
          name: "label",
          type: "object",
          fields: [
            defineField({ name: "field", title: "Field", type: "string" }),
            defineField({ name: "value", title: "Option value", type: "string" }),
            defineField({ name: "text", title: "Text", type: "string" }),
          ],
        }),
      ],
    }),
  ],
});
