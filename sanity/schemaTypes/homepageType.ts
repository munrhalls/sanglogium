import { defineField, defineType } from "sanity";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "featured",
      title: "Featured Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "spotlight1",
      title: "Product Spotlight 1",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({
      name: "spotlight2",
      title: "Product Spotlight 2",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({
      name: "spotlight3",
      title: "Product Spotlight 3",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({
      name: "iemsGallery",
      title: "IEMs Gallery",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "newestRelease",
      title: "Newest Release",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({
      name: "dacs",
      title: "DACs",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "accessoriesCables",
      title: "Accessories: Cables",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "accessoriesEarpads",
      title: "Accessories: Earpads",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "accessoriesStorage",
      title: "Accessories: Storage",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage Settings",
      };
    },
  },
});
