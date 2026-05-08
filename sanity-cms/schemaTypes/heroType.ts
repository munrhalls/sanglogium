import { defineField, defineType } from "sanity";

export const heroType = defineType({
  name: "hero",
  title: "Hero Section",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Big Title (Display 1)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subtitle (Display 2)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaText",
      title: "Call to Action Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      // ESSENTIAL - needed for sanity vs next 'handshake' on image URLs (non-conflicting optimizations)
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt Text" })],
    }),
    defineField({
      name: "mobileBackgroundImage",
      title: "Mobile Background Image",
      type: "image",
      // ESSENTIAL - needed for sanity vs next 'handshake' on image URLs (non-conflicting optimizations)
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt Text" })],
    }),
  ],
  preview: {
    select: { title: "headline", media: "backgroundImage" },
    prepare({ title, media }) {
      return { title: title || "Hero", subtitle: "Hero Section", media };
    },
  },
});
