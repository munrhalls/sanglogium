import { vocabFor } from "./vocab";

export const sharedFields: any[] = [
        {
          name: "brand",
          title: "Brand",
          type: "array",
          of: [{ type: "string", options: { list: vocabFor("brand") } }],
        },
        {
          name: "inStock",
          title: "Availability",
          type: "boolean",
        },
        {
          name: "category",
          title: "Category",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: vocabFor("category") },
            },
          ],
        },
        {
          name: "awards",
          title: "Awards / Recognition",
          type: "array",
          of: [{ type: "string" }],
        },
];
