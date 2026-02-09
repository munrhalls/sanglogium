import { defineType, defineField, defineArrayMember } from "sanity";
import { TagIcon } from "@sanity/icons";

export const saleType = defineType({
  name: "sale",
  title: "Sale",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Sale Title",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "products",
      type: "array",
      title: "Products on Sale",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    defineField({
      name: "discount",
      type: "number",
      title: "Discount Percentage",
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "validFrom",
      type: "datetime",
      title: "Valid From",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "validUntil",
      type: "datetime",
      title: "Valid Until",
      validation: (Rule) => Rule.required().min(Rule.valueOfField("validFrom")),
    }),
    defineField({
      name: "isActive",
      type: "boolean",
      title: "Is Active",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      discount: "discount",
      isActive: "isActive",
    },
    prepare(selection) {
      const { title, discount, isActive } = selection;
      const status = isActive ? "Active" : "Inactive";
      return {
        title: `${title} (${status})`,
        subtitle: `${discount}% off`,
      };
    },
  },
});
