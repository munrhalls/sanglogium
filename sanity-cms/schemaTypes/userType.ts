import { UserIcon } from "@sanity/icons";
import { defineType, defineField, defineArrayMember } from "sanity";

export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: UserIcon,
  fields: [
    // --- IDENTITY ---
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
      description: "The immutable link to Clerk.",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
      readOnly: true,
    }),
    defineField({
      name: "displayName",
      title: "Display Name",
      type: "string",
    }),
    defineField({
      name: "avatarUrl",
      title: "Avatar URL",
      type: "url",
    }),

    // --- DATA ---
    defineField({
      name: "addresses",
      title: "Saved Addresses",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "address",
          title: "Address",
          fields: [
            {
              name: "isDefault",
              title: "Default?",
              type: "boolean",
              initialValue: false,
            },
            { name: "line1", title: "Address Line 1", type: "string" },
            { name: "line2", title: "Address Line 2", type: "string" },
            { name: "city", title: "City", type: "string" },
            { name: "postalCode", title: "Postal Code", type: "string" },
            { name: "country", title: "Country", type: "string" },
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "line1",
              isDefault: "isDefault",
            },
            prepare({ title, subtitle, isDefault }) {
              return {
                title: isDefault ? `${title} (Default)` : title,
                subtitle: subtitle,
              };
            },
          },
        }),
      ],
    }),

    // --- METADATA ---
    defineField({
      name: "lastSynced",
      title: "Last Synced with Clerk",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "isActive",
      title: "Account Active",
      type: "boolean",
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: "displayName",
      subtitle: "email",
    },
  },
});
