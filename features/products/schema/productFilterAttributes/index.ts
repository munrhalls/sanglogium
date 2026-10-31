import { defineField } from "sanity";
import { headphonesFields } from "./headphones";
import { audioElectronicsFields } from "./audioElectronics";
import { accessoriesFields } from "./accessories";
import { ordered } from "../orderRules";

export const filterAttributesField = defineField({
      name: "filterAttributes",
      title: "Filter Attributes",
      type: "object",
      description:
        "Closed, machine-readable attributes used by the catalogue filter controls and GROQ predicates. Option lists editors pick from live in ./vocab.ts.",
      fields: ([...headphonesFields, ...audioElectronicsFields, ...accessoriesFields] as any[])
        // awards is listed by two slices; Studio gets it once
        .filter((field, i, all) => all.findIndex((other) => other.name === field.name) === i)
        .map(({ domain, domainField, ...field }) =>
        defineField({
          ...ordered(field),
          hidden: ({ document }) => {
            if (domain) {
              // domainField names which filterAttributes field this field is
              // gated by (defaults to accessoryType for backward compat —
              // accessories fields predate this parameter). Audio-electronics
              // fields gate off deviceType or deviceConnectivity instead,
              // since one product can have two independent gate axes (what
              // kind of device it is, and how it connects).
              const gateValue = (document as any)?.filterAttributes?.[domainField ?? "accessoryType"];
              return !domain.includes(gateValue);
            }
            return false;
          },
        })
      ),
    });

export const filterAttributeGroups = {
  headphones: [...headphonesFields],
  audioElectronics: [...audioElectronicsFields],
  accessories: [...accessoriesFields],
};
