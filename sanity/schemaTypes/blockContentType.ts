// // TODO - this DELETE ENTIRELY, NONE OF THAT IN THIS PROJECT - only markdown

// import { ImageIcon } from "@sanity/icons";
// import { defineType, defineArrayMember, defineField } from "sanity";

// export const blockContentType = defineType({
//   title: "Block Content",
//   name: "blockContent",
//   type: "array",
//   of: [
//     defineArrayMember({
//       type: "block",
//       styles: [
//         { title: "Normal", value: "normal" } as const,
//         { title: "H1", value: "h1" } as const,
//         { title: "H2", value: "h2" } as const,
//         { title: "H3", value: "h3" } as const,
//         { title: "H4", value: "h4" } as const,
//         { title: "Quote", value: "blockquote" } as const,
//       ],
//       lists: [{ title: "Bullet", value: "bullet" } as const],
//       marks: {
//         decorators: [
//           { title: "Strong", value: "strong" } as const,
//           { title: "Emphasis", value: "em" } as const,
//           { title: "Orange", value: "orange" } as const,
//         ],
//         annotations: [
//           defineArrayMember({
//             title: "URL",
//             name: "link",
//             type: "object",
//             fields: [
//               defineField({
//                 title: "URL",
//                 name: "href",
//                 type: "url",
//               }),
//             ],
//           }),
//           defineArrayMember({
//             type: "textColor",
//           }),
//           defineArrayMember({
//             type: "highlightColor",
//           }),
//         ],
//       },
//     }),
//     defineArrayMember({
//       type: "image",
//       icon: ImageIcon,
//       options: { hotspot: true },
//       fields: [
//         defineField({
//           name: "alt",
//           type: "string",
//           title: "Alternative Text",
//         }),
//       ],
//     }),
//   ],
// });
