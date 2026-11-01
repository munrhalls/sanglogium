import { defineType, defineField } from "sanity";
import { PICKABLE } from "./pickableFields";

// One list per slice, and one for all products (the /products page). The choices sit on the items, not on the list: Studio then draws sortable rows (drag to reorder) instead of checkboxes.
// No list has an initial value: the all-products list starts empty, so /products shows only the always-on fields until the owner adds some.
const SLICE_HELP = "Fields that become filter controls for this slice, in this order. Drag to reorder. The always-on fields above are controls in every slice.";
const ALL_PRODUCTS_HELP =
  "Fields that become filter controls on the all-products page (/products), in this order. Drag to reorder. It starts empty, so only the always-on fields show there until you add some. A field added here narrows the products of every slice, so add only fields shoppers should use across them. The always-on fields above are controls here too.";

const listField = (name: keyof typeof PICKABLE, title: string, description = SLICE_HELP) =>
  defineField({
    name,
    title,
    type: "array",
    of: [{ type: "string", options: { list: PICKABLE[name].map((path) => ({ title: path, value: path })) } }],
    validation: (Rule) => Rule.unique(),
    description,
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
      description: "Fields that are controls in every slice and on the all-products page. Not a choice, so not editable here.",
    }),
    listField("headphones", "Headphones"),
    listField("audioElectronics", "Audio electronics"),
    listField("accessories", "Accessories"),
    listField("allProducts", "All products (/products)", ALL_PRODUCTS_HELP),
  ],
});
