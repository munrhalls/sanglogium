import { defineField, defineType } from "sanity";

export const homepageDataType = defineType({
  name: "homepageData",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "featuredProducts",
      title: "Featured Products",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "productRef", type: "reference", to: [{ type: "product" }] },
            { name: "productPromo", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "spotlight1Data",
      title: "Product Spotlight 1",
      type: "object",
      fields: [
        { name: "productRef", type: "reference", to: [{ type: "product" }], title: "Product" },
        { name: "promoTitle", type: "string", title: "Promo Title" },
        { name: "promoSubtitle", type: "string", title: "Promo Subtitle" },
        { name: "promoText", type: "text", title: "Promo Text" },
      ],
    }),
    defineField({
      name: "spotlight2Data",
      title: "Product Spotlight 2",
      type: "object",
      fields: [
        { name: "productRef", type: "reference", to: [{ type: "product" }], title: "Product" },
        { name: "promoTitle", type: "string", title: "Promo Title" },
        { name: "promoSubtitle", type: "string", title: "Promo Subtitle" },
        { name: "promoText", type: "text", title: "Promo Text" },
      ],
    }),
    defineField({
      name: "spotlight3Data",
      title: "Product Spotlight 3",
      type: "object",
      fields: [
        { name: "productRef", type: "reference", to: [{ type: "product" }], title: "Product" },
        { name: "promoTitle", type: "string", title: "Promo Title" },
        { name: "promoSubtitle", type: "string", title: "Promo Subtitle" },
        { name: "promoText", type: "text", title: "Promo Text" },
      ],
    }),
    defineField({
      name: "iemsGallery",
      title: "IEMs Gallery",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "newestReleaseData",
      title: "Newest Release",
      type: "object",
      fields: [
        { name: "productRef", type: "reference", to: [{ type: "product" }], title: "Product" },
        { name: "promoTitle", type: "string", title: "Promo Title" },
        { name: "promoSubtitle", type: "string", title: "Promo Subtitle" },
        { name: "promoText", type: "text", title: "Promo Text" },
      ],
    }),
    defineField({
      name: "dacs",
      title: "DACs",
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