import { defineType, defineField, defineArrayMember } from "sanity";

export const basketReservationType = defineType({
  name: "basketReservation",
  title: "Basket Reservation",
  type: "document",
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
      name: "expiresAt",
      title: "Expires At",
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
    defineField({
      name: "shippingChoice",
      title: "Shipping Choice",
      type: "object",
      fields: [
        defineField({
          name: "provider",
          title: "Provider",
          type: "string",
        }),
        defineField({
          name: "serviceLevel",
          title: "Service Level",
          type: "string",
        }),
        defineField({
          name: "rateId",
          title: "Rate ID",
          type: "string",
        }),
        defineField({
          name: "amount",
          title: "Amount",
          type: "number",
        }),
        defineField({
          name: "currency",
          title: "Currency",
          type: "string",
        }),
        defineField({
          name: "estimatedDays",
          title: "Estimated Days",
          type: "number",
        }),
      ],
    }),
  ],
});
