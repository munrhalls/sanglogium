import { defineField, defineType } from "sanity";

export const promotionContent = defineType({
  name: "promotionContent",
  title: "Promotion Overlay Content",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow (small uppercase text)",
      type: "string",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subhead",
      title: "Subhead (Markdown supported)",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
      initialValue: "Shop Now",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Destination URL",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https", "mailto", "tel"],
        }),
    }),
  ],
  preview: {
    select: {
      title: "headline",
      subtitle: "eyebrow",
    },
  },
});

export const heroSlide = defineType({
  name: "heroSlide",
  title: "Hero Carousel Slide",
  type: "object",
  fields: [
    defineField({
      name: "backgroundImage",
      title: "Desktop Background Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "content",
      title: "Overlay Content",
      type: "promotionContent",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Overlay (text over image)", value: "overlay" },
          { title: "Split (text beside image)", value: "split" },
        ],
      },
      initialValue: "overlay",
    }),
  ],
  preview: {
    select: {
      title: "content.headline",
      subtitle: "layout",
      media: "backgroundImage",
    },
  },
});

export const homeSection = defineType({
  name: "homeSection",
  title: "Homepage Section",
  type: "object",
  fields: [
    defineField({
      name: "sectionType",
      title: "Section Type",
      type: "string",
      options: {
        list: [
          { title: "Bestsellers", value: "bestsellers" },
          { title: "Extreme Quality", value: "extremeQuality" },
          { title: "MVP / Month Product", value: "mvpMonth" },
          { title: "Newest Release", value: "newestRelease" },
          { title: "Featured Products", value: "featuredProducts" },
          { title: "Main Categories", value: "mainCategories" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Shared: simple product grid sections
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [{ type: "reference", to: { type: "product" } }],
      hidden: ({ parent }) =>
        !["bestsellers", "featuredProducts"].includes(parent?.sectionType),
    }),

    // Extreme Quality — enriched products
    defineField({
      name: "enrichedProducts",
      title: "Products (with overrides)",
      type: "array",
      of: [
        defineType({
          type: "object",
          fields: [
            defineField({
              name: "product",
              type: "reference",
              to: { type: "product" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "displayPrice",
              title: "Override Price (optional)",
              type: "number",
            }),
            defineField({
              name: "descriptionOverride",
              title: "Description Override (Markdown)",
              type: "text",
              rows: 6,
            }),
          ],
          preview: {
            select: {
              title: "product.name",
              media: "product.image",
            },
          },
        }),
      ],
      hidden: ({ parent }) => parent?.sectionType !== "extremeQuality",
    }),

    // MVP / Month Product
    defineField({
      name: "featuredProduct",
      title: "Featured Product",
      type: "reference",
      to: { type: "product" },
      hidden: ({ parent }) => parent?.sectionType !== "mvpMonth",
    }),
    defineField({
      name: "discountPercent",
      title: "Discount %",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
      hidden: ({ parent }) => parent?.sectionType !== "mvpMonth",
    }),
    defineField({
      name: "validUntil",
      title: "Valid Until",
      type: "datetime",
      hidden: ({ parent }) => parent?.sectionType !== "mvpMonth",
    }),

    // Newest Release
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string" }],
      hidden: ({ parent }) => parent?.sectionType !== "newestRelease",
    }),
    defineField({
      name: "body",
      title: "Body Text (Markdown, supports headings)",
      type: "text",
      rows: 10,
      hidden: ({ parent }) => parent?.sectionType !== "newestRelease",
    }),
    defineField({
      name: "ctaProduct",
      title: "CTA Product (for Shop Now link)",
      type: "reference",
      to: { type: "product" },
      hidden: ({ parent }) => parent?.sectionType !== "newestRelease",
    }),

    // Main Categories
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [
        defineType({
          type: "object",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({
              name: "backgroundImage",
              type: "image",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string" }],
            }),
            defineField({
              name: "catalogueItem",
              title: "Linked Catalogue Item",
              type: "reference",
              to: [{ type: "catalogueItem" }], // adjust if name differs
            }),
          ],
          preview: {
            select: { title: "title", media: "backgroundImage" },
          },
        }),
      ],
      hidden: ({ parent }) => parent?.sectionType !== "mainCategories",
    }),
  ],
  preview: {
    select: { type: "sectionType" },
    prepare: ({ type }) => ({
      title: `${type ? type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1") : "Section"}`,
    }),
  },
});

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "main", title: "Main Sections" },
    { name: "bottom", title: "Bottom Sections" },
  ],
  fields: [
    // Hero Group
    defineField({
      name: "mainHeroBackground",
      title: "Main Hero Background Image",
      type: "image",
      options: { hotspot: true },
      group: "hero",
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "mainHeroContent",
      title: "Main Hero Overlay Content",
      type: "promotionContent",
      group: "hero",
    }),
    defineField({
      name: "heroCarousel",
      title: "Hero Carousel Slides (5 recommended)",
      type: "array",
      of: [{ type: "heroSlide" }],
      group: "hero",
      validation: (Rule) => Rule.min(1).max(10),
    }),

    // Main Sections
    defineField({
      name: "mainSections",
      title: "Main Content Sections (orderable)",
      description:
        "Add, reorder, or recreate sections here. Currently used: Bestsellers, Newest Release, Extreme Quality, Featured Products (BrandsWall is static/code-driven)",
      type: "array",
      of: [{ type: "homeSection" }],
      group: "main",
    }),

    // Bottom Sections
    defineField({
      name: "bottomSections",
      title: "Bottom Content Sections (orderable)",
      description:
        "Add, reorder, or recreate sections here. Currently used: MVP/Month Product, Main Categories",
      type: "array",
      of: [{ type: "homeSection" }],
      group: "bottom",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Homepage" }),
  },
});
