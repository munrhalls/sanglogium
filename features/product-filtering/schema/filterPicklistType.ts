import { defineType, defineField } from "sanity";
import { PICKABLE } from "./pickableFields";

// One list per slice. The choices sit on the items, not on the list: Studio then draws sortable rows (drag to reorder) instead of checkboxes.
const listField = (name: keyof typeof PICKABLE, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [{ type: "string", options: { list: PICKABLE[name].map((path) => ({ title: path, value: path })) } }],
    validation: (Rule) => Rule.unique(),
    description: "Fields that become filter controls for this slice, in this order. Drag to reorder. The always-on fields above are controls in every slice.",
  });

export const filterPicklistType = defineType({
  name: "filterPicklist",
  title: "Filter picklist",
  type: "document",
  fields: [
    defineField({
      name: "alwaysOn",
      title: "Always on",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
      description: "Fields that are controls in every slice. Not a choice, so not editable here.",
    }),
    listField("headphones", "Headphones"),
    listField("audioElectronics", "Audio electronics"),
    listField("accessories", "Accessories"),
  ],
});
