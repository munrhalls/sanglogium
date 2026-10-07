import { defineField } from "sanity";
import { sharedFields } from "./shared";
import { headphonesFields } from "./headphones";
import { audioElectronicsFields } from "./audioElectronics";
import { accessoriesFields } from "./accessories";

export const filterAttributesField = defineField({
      name: "filterAttributes",
      title: "Filter Attributes",
      type: "object",
      description:
        "Closed, machine-readable attributes used by the catalogue filter controls and GROQ predicates. One field per facet in the product-filtering feature's core/definitions/facetMap.ts.",
      fields: ([...sharedFields, ...headphonesFields, ...audioElectronicsFields, ...accessoriesFields] as any[]).map(({ categories, domain, domainField, ...field }) =>
        defineField({
          ...field,
          hidden: ({ document }) => {
            if (categories.includes("*") || categories.includes("all-products")) {
              return false;
            }
            const keys = (document as any)?.catalogueLocationKeys ?? [];
            const inCategory = keys.some((k: string) =>
              categories.some((c: string) => k === c || k.startsWith(c + "/"))
            );
            if (!inCategory) return true;
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
