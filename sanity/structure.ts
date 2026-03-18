import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sang Logium E-commerce Web App")

    .items([
      S.listItem()
        .title("Catalogue")
        .child(
          S.document()
            .schemaType("catalogue")
            .documentId("catalogue")
            .title("Catalogue")
        ),
      S.listItem()
        .title("Homepage")
        .child(
          S.document()
            .schemaType("homepage")
            .documentId("homepage")
            .title("Homepage")
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !["catalogue", "homepage"].includes(item.getId()!)
      ),
    ]);
