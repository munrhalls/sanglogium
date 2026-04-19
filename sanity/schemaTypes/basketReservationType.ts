import { defineType, defineField, defineArrayMember } from "sanity";
import { ShoppingCartIcon } from "@sanity/icons";

export const basketReservationType = defineType({
  name: "basketReservation",
  title: "Basket Reservation",
  type: "document",
  icon: ShoppingCartIcon,
  fields: [
    defineField({
      name: "publicBasket",
      title: "Public Basket",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "_id",
              title: "Product ID",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "stripePriceId",
              title: "Stripe Price ID",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
