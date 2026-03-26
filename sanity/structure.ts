import type { StructureResolver } from "sanity/structure";

// Recursive function to build catalogue tree from parent references
function buildCatalogueTree(S: any, parentId: string | null = null) {
  const filter = parentId
    ? '_type == "catalogueItem" && parent._ref == $parentId'
    : '_type == "catalogueItem" && !defined(parent)';

  return S.documentList()
    .id(parentId ? `catalogue-node-${parentId}` : "catalogue-root")
    .title(parentId ? "Sub-Items" : "Catalogue")
    .schemaType("catalogueItem")
    .filter(filter)
    .params(parentId ? { parentId } : {})
    .defaultOrdering([{ field: "sortOrder", direction: "asc" }])
    .initialValueTemplates(
      parentId ? [S.initialValueTemplateItem("catalogueItem-with-parent", { parentId })] : []
    )
    .child((documentId: string) =>
      S.list()
        .title("Item Actions")
        .items([
          S.listItem()
            .title("Edit Details")
            .child(
              S.document()
                .documentId(documentId)
                .schemaType("catalogueItem")
            ),
          S.listItem()
            .title("View Sub-Items")
            .child(buildCatalogueTree(S, documentId))
        ])
    );
}

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
    S.list()
        .title("Sang Logium E-commerce Shop")

        .items([
            S.listItem()
                .title("Catalogue")
                .child(buildCatalogueTree(S)),
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
                (item) => item.getId() && !["catalogueItem", "homepageData"].includes(item.getId()!)
            ),
        ]);