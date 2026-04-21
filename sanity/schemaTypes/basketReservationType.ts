import { defineType, defineField, defineArrayMember } from "sanity";
import { ShoppingCartIcon } from "@sanity/icons";

export const basketReservationType = defineType({
  name: "basketReservation",
  title: "Basket Reservation",
  type: "document",
  icon: ShoppingCartIcon,
  fields: [
    defineField({
      name: "basketReservation",
      title: "Basket Reservation",
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
              name: "verifiedPrice",
              title: "Verified Price",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
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
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      fields: [
        defineField({
          name: "regionCode",
          title: "Region Code",
          type: "string",
        }),
        defineField({
          name: "postalCode",
          title: "Postal Code",
          type: "string",
        }),
        defineField({
          name: "street",
          title: "Street",
          type: "string",
        }),
        defineField({
          name: "streetNumber",
          title: "Street Number",
          type: "string",
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
        }),
      ],
    }),
  ],
});
