import { defineField, defineType } from "sanity";
import { COLOR_OPTIONS } from "@/sanity/schemaTypes/colors";

export const promotionType = defineType({
  name: "promotion",
  title: "Promotion",
  type: "document",
  fields: [
    defineField({
      name: "internalTitle",
      title: "Internal Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "promotion_text",
      title: "Promotion text",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "H1", value: "h1" },
            { title: "H2", value: "h2" },
          ],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "color",
                type: "object",
                title: "Color",
                icon: () => "🎨",
                fields: [
                  {
                    name: "hex",
                    type: "string",
                    title: "Color",
                    options: {
                      list: COLOR_OPTIONS,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image_background",
      title: "Image background",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "cta_text",
      title: "CALL TO ACTION button text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "cta_background",
      title: "CALL TO ACTION button background color",
      type: "string",
      options: {
        list: COLOR_OPTIONS,
        layout: "dropdown",
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const validValues = COLOR_OPTIONS.map((option) => option.value);
          if (!value || validValues.includes(value)) {
            return true;
          }
          return "Please select a color from the list";
        }),
    }),
  ],
  preview: {
    select: {
      title: "internalTitle",
      media: "visual",
    },
  },
});
