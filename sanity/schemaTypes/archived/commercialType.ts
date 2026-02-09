// TODO COMMERCIAL CARD - NEW SCHEMA TYPE FOR REUSABLE COMMERCIAL CARD COMPONENT
// MARKDOWN!!! NOT FREAKIN' RICH TEXT/BLOCK CONTENT TEXT FOR A FEW LINES OF TEXT...
// - OUTPUT: just an array of objects
// object: content row and dropdown-selectable "role" per content row (e.g., headline, subhead, body, cta-link, cta-button, image, product-grid, etc.)
// - then the commercial schema type can have an array of these commercial card objects
// - and dropdown-selectable is what I deal with on frontend in terms of "how to render it"
import { defineField, defineType, defineArrayMember } from "sanity";

export const commercialType = defineType({
  name: "commercial",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "feature",
      type: "string",
      options: {
        list: [
          { title: "Hero Main", value: "hero-main" },
          { title: "Hero Secondary", value: "hero-secondary" },
          { title: "Bestsellers", value: "bestsellers" },
          { title: "ExtremeQuality", value: "extreme-quality" },
          { title: "MVPMonth", value: "mvp-month" },
          { title: "Newest Release", value: "newest-release" },
          { title: "Featured Products", value: "featured-products" },
          { title: "Main Categories", value: "main-categories" },
          { title: "inactive", value: "inactive" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "variant",
      type: "string",
      options: {
        list: [
          { title: "Text", value: "text" },
          { title: "Products", value: "products" },
        ],
      },
    }),
    defineField({
      name: "displayOrder",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
    }),
    // defineField({
    //   name: "text",
    //   type: "array",
    //   of: [
    //     defineArrayMember({
    //       type: "block",
    //       marks: {
    //         annotations: [
    //           {
    //             type: "textColor",
    //           },
    //           {
    //             type: "highlightColor",
    //           },
    //         ],
    //       },
    //     }),
    //   ],
    // }),
    defineField({
      name: "sale",
      title: "Reference to sale advertised by the commercial (optional)",
      type: "reference",
      to: [{ type: "sale" }],
    }),
    defineField({
      name: "ctaLink",
      title: "What URL the commercial links to (optional)",
      type: "string",
    }),
    defineField({
      name: "products",
      title: "Products featured in commercial (optional)",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
        }),
      ],
    }),
  ],
});

// INITIAL PROPOSITION
// import { defineField, defineType } from "sanity";

// export const heroOverlay = defineType({
//   name: "heroOverlay",
//   title: "Hero Overlay Card",
//   type: "document",
//   fields: [
//     defineField({
//       name: "internalName",
//       title: "Internal Name (For you only)",
//       type: "string",
//     }),

//     // 1. THE "SMART" DATA SOURCE
//     // Instead of typing "Price: $50", reference the product.
//     // Your frontend can pull the live price/image automatically.
//     defineField({
//       name: "linkedProduct",
//       title: "Linked Product (Auto-fills data)",
//       type: "reference",
//       to: [{ type: "product" }],
//     }),

//     // 2. THE "MANUAL" CONTENT (Your Request)
//     // Simple array of text fields with types.
//     // Replaces the "Block Content" garbage.
//     defineField({
//       name: "contentRows",
//       title: "Card Content Rows",
//       type: "array",
//       of: [
//         {
//           type: "object",
//           fields: [
//             {
//               name: "role",
//               title: "Role (How frontend renders it)",
//               type: "string",
//               options: {
//                 list: [
//                   { title: "Big Title (H1)", value: "title" },
//                   { title: "Subtitle / Tagline", value: "subtitle" },
//                   { title: "Discount Badge (e.g. -50%)", value: "badge" },
//                   { title: "Price Override", value: "price" },
//                   { title: "Tiny Note", value: "note" },
//                 ],
//                 layout: "radio" // Makes it a nice visible list
//               },
//               validation: (Rule) => Rule.required(),
//             },
//             {
//               name: "text",
//               title: "Text Content (Markdown Allowed)",
//               type: "text", // Simple text area, NOT block content
//               rows: 2,
//             }
//           ],
//           preview: {
//             select: {
//               title: "text",
//               subtitle: "role",
//             },
//           },
//         },
//       ],
//     }),
//   ],
// });

// Frontend Component
// {data.contentRows.map((row) => (
//   <div className={getStylesForRole(row.role)}>
//     <Markdown>{row.text}</Markdown>
//   </div>
// ))}
