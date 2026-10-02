import { defineField } from "sanity";

export const shippingAddressField = defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: "name",
          type: "string",
          title: "Full Name",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "line1",
          type: "string",
          title: "Address Line 1",
          validation: (Rule) => Rule.required(),
        },
        { name: "line2", type: "string", title: "Address Line 2" },
        {
          name: "city",
          type: "string",
          title: "City",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "state",
          type: "string",
          title: "State/Province",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "postalCode",
          type: "string",
          title: "Postal Code",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "country",
          type: "string",
          title: "Country",
          validation: (Rule) => Rule.required(),
        },
        { name: "phone", type: "string", title: "Phone" },
      ],
    });

export const billingAddressField = defineField({
      name: "billingAddress",
      title: "Billing Address",
      type: "object",
      description: "Leave empty if same as shipping",
      fields: [
        { name: "name", type: "string", title: "Full Name" },
        { name: "line1", type: "string", title: "Address Line 1" },
        { name: "line2", type: "string", title: "Address Line 2" },
        { name: "city", type: "string", title: "City" },
        { name: "state", type: "string", title: "State/Province" },
        { name: "postalCode", type: "string", title: "Postal Code" },
        { name: "country", type: "string", title: "Country" },
      ],
    });
