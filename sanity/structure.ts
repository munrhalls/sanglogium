import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
    S.list()
        .title("Sang Logium E-commerce Shop")

        .items([
            S.documentTypeListItem("catalogueItem").title("Catalogue"),
            S.listItem()
                .title("Homepage")
                .child(
                    S.document()
                        .schemaType("homepageData")
                        .documentId("homepageData")
                        .title("Homepage")
                ),
            S.divider(),
            ...S.documentTypeListItems().filter(
                (item) => item.getId() && !["catalogueItem", "homepage"].includes(item.getId()!)
            ),
        ]);