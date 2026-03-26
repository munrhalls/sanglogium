import { defineField, defineType } from "sanity";
import { TagIcon, FolderIcon } from "@sanity/icons";

export const catalogueItemType = defineType({
  name: "catalogueItem",
  title: "Catalogue Item",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Item Type",
      type: "string",
      options: {
        list: [
          { title: "Link (Clickable Slot)", value: "link" },
          { title: "Visual Header (Group)", value: "header" },
        ],
        layout: "radio",
      },
      initialValue: "link",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      hidden: ({ parent }) => parent?.type === "header",
    }),
    defineField({
      name: "icon",
      title: "Icon Name (Optional)",
      type: "string",
      description: "e.g., 'headphones', 'speaker' (Used for root items)",
    }),
    defineField({
      name: "children",
      title: "Sub-Items",
      type: "array",
      of: [{ type: "catalogueItem" }],
    }),
  ],
  // preview: {
  //   select: { title: "title", type: "type" },
  //   prepare({ title, type }) {
  //     // const isHeader = type === "header";
  //     return {
  //       title: title,
  //       // subtitle: isHeader ? "📂 Visual Group" : "🔗 Catalogue Slot",
  //       // media: isHeader ? FolderIcon : TagIcon,
  //     };
  //   },
  // },
});
