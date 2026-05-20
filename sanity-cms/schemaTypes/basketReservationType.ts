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
            defineField({
              name: "parcel",
              title: "Parcel Data",
              type: "object",
              fields: [
                defineField({
                  name: "length",
                  title: "Length (cm)",
                  type: "number",
                }),
                defineField({
                  name: "width",
                  title: "Width (cm)",
                  type: "number",
                }),
                defineField({
                  name: "height",
                  title: "Height (cm)",
                  type: "number",
                }),
                defineField({
                  name: "weight",
                  title: "Weight (g)",
                  type: "number",
                }),
                defineField({
                  name: "distance_unit",
                  title: "Distance Unit",
                  type: "string",
                }),
                defineField({
                  name: "mass_unit",
                  title: "Mass Unit",
                  type: "string",
                }),
              ],
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
