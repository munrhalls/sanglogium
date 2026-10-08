import { vocabFor } from "../../../product-filtering/core/definitions/facetMap";

export const sharedFields: any[] = [
        {
          name: "price",
          title: "Price",
          type: "number",
          description:
            "Product price in cents; mirrors price_data.unit_amount for filter predicates.",
          categories: ["*"],
        },
        {
          name: "brand",
          title: "Brand",
          type: "array",
          of: [{ type: "string", options: { list: vocabFor("brand") } }],
          categories: ["*"],
        },
        {
          name: "inStock",
          title: "Availability",
          type: "boolean",
          categories: ["*"],
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
          categories: ["all-products"],
        },
        {
          name: "awards",
          title: "Awards / Recognition",
          type: "array",
          of: [{ type: "string" }],
          categories: ["headphones", "accessories", "audio-electronics"],
        },
];
