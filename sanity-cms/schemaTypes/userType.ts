import { UserIcon } from "@sanity/icons";
import { defineType, defineField } from "sanity";

export const userType = defineType({
  name: "userProfile",
  title: "User Profile",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "authId",
      title: "Auth ID",
      type: "string",
      description: "Better Auth user ID (foreign key to auth system)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "addresses",
      title: "Addresses",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "firstName", type: "string", title: "First Name" },
            { name: "lastName", type: "string", title: "Last Name" },
            { name: "street", type: "string", title: "Street" },
            { name: "streetNumber", type: "string", title: "Street Number" },
            { name: "city", type: "string", title: "City" },
            { name: "postalCode", type: "string", title: "Postal Code" },
            { name: "regionCode", type: "string", title: "Region Code" },
            { name: "country", type: "string", title: "Country" },
            { name: "phone", type: "string", title: "Phone" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
});
