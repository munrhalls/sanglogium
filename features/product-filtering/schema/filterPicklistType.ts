import { defineType, defineField, defineArrayMember } from "sanity";
import { PICKABLE, SORTABLE, ALWAYS_ON } from "./pickableFields";
import { SECTION_ICONS } from "./sectionIcons";

// One document, three groups. Filters: which fields become filter controls. Sorting: which fields the shopper can sort by. Sections: where headings sit among the filter controls.
// Each group has one list per slice and one for all products (the /products page). The choices sit on the items, not on the list: Studio then draws sortable rows (drag to reorder) instead of checkboxes.
// No list has an initial value: the all-products filter list and every sorting list start empty, so /products shows only the always-on filters, and every scope only the always-on sorts (price and name), until the owner adds some.
const SLICE_HELP = "Fields that become filter controls for this slice, in this order. Drag to reorder. The always-on fields above are controls in every slice.";
const ALL_PRODUCTS_HELP =
  "Fields that become filter controls on the all-products page (/products), in this order. Drag to reorder. It starts empty, so only the always-on fields show there until you add some. A field added here narrows the products of every slice, so add only fields shoppers should use across them. The always-on fields above are controls here too.";
const SORT_HELP =
  "Fields shoppers can sort by in this slice, in this order, after the always-on sorts (price and name). Only fields that hold one plain number per product are offered. Drag to reorder.";
const SORT_ALL_PRODUCTS_HELP =
  "Fields shoppers can sort by on the all-products page (/products), in this order, after the always-on sorts (price and name). Only fields that hold one plain number per product are offered. Drag to reorder. It starts empty.";

const listField = (name: string, title: string, choices: string[], group: "filters" | "sorting", description: string) =>
  defineField({
    name,
    title,
    group,
    type: "array",
    of: [{ type: "string", options: { list: choices.map((path) => ({ title: path, value: path })) }, validation: (Rule) => Rule.required() }],
    validation: (Rule) => Rule.unique(),
    description,
  });

// A heading is a row: a title, an optional icon and the control it is shown above. Its controls are that control and the ones below it down to the next heading, in the order of the filter list; the position is the "Shown above" choice, so the rows are not sortable.
const SECTIONS_HELP =
  "Each row is a heading shown above one control. The controls below it, until the next heading, belong to it. Controls above the first heading have none. A heading may sit above any control, the always-on ones included; without one they stay on top. A heading whose control is not on the route is not shown. Rows are not reordered here: change 'Shown above' to move a heading.";

const sectionsField = (name: string, title: string, choices: string[]) =>
  defineField({
    name,
    title,
    group: "sections",
    type: "array",
    options: { sortable: false },
    of: [
      defineArrayMember({
        name: "section",
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: SECTION_ICONS.map((icon) => ({ title: icon, value: icon })) } }),
          defineField({
            name: "before",
            title: "Shown above",
            type: "string",
            options: { list: [...ALWAYS_ON, ...choices].map((path) => ({ title: path, value: path })) },
            validation: (Rule) => Rule.required(),
          }),
        ],
        preview: {
          select: { title: "title", subtitle: "before" },
          prepare: ({ title, subtitle }: { title?: string; subtitle?: string }) => ({ title: title ?? "", subtitle: subtitle ? `above ${subtitle}` : "" }),
        },
      }),
    ],
    description: SECTIONS_HELP,
  });

export const filterPicklistType = defineType({
  name: "filterPicklist",
  title: "Filter picklist",
  type: "document",
  groups: [
    { name: "filters", title: "Filters", default: true },
    { name: "sorting", title: "Sorting" },
    { name: "sections", title: "Sections" },
  ],
  fields: [
    defineField({
      name: "alwaysOn",
      title: "Always on",
      group: "filters",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
      description: "Fields that are controls in every slice and on the all-products page. Not a choice, so not editable here.",
    }),
    listField("headphones", "Headphones", PICKABLE.headphones, "filters", SLICE_HELP),
    listField("audioElectronics", "Audio electronics", PICKABLE.audioElectronics, "filters", SLICE_HELP),
    listField("accessories", "Accessories", PICKABLE.accessories, "filters", SLICE_HELP),
    listField("allProducts", "All products (/products)", PICKABLE.allProducts, "filters", ALL_PRODUCTS_HELP),
    defineField({
      name: "sortAlwaysOn",
      title: "Always-on sorts",
      group: "sorting",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
      description: "Sorts every slice and the all-products page have: price and name. Not a choice, so not editable here.",
    }),
    listField("sortHeadphones", "Headphones", SORTABLE.headphones, "sorting", SORT_HELP),
    listField("sortAudioElectronics", "Audio electronics", SORTABLE.audioElectronics, "sorting", SORT_HELP),
    listField("sortAccessories", "Accessories", SORTABLE.accessories, "sorting", SORT_HELP),
    listField("sortAllProducts", "All products (/products)", SORTABLE.allProducts, "sorting", SORT_ALL_PRODUCTS_HELP),
    sectionsField("sectionsHeadphones", "Headphones", PICKABLE.headphones),
    sectionsField("sectionsAudioElectronics", "Audio electronics", PICKABLE.audioElectronics),
    sectionsField("sectionsAccessories", "Accessories", PICKABLE.accessories),
    sectionsField("sectionsAllProducts", "All products (/products)", PICKABLE.allProducts),
  ],
});
