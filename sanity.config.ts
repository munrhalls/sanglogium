import { dataset, projectId } from "./sanity-cms/env";
import { schema } from "./sanity-cms/schemaTypes";
import { structure } from "./sanity-cms/structure";
// import { colorInput } from "@sanity/color-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

const sanityConfig = defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [...schema.types],
  },
  plugins: [
    structureTool({
      structure,
      defaultDocumentNode: (S, { schemaType }) => {
        if (schemaType === 'catalogueItem') {
          return S.document().views([
            S.view.form(),
            S.view.component(() => null).title('Preview'),
          ]);
        }
      },
    }),
    visionTool()
  ],
  initialTemplates: [
    {
      templateId: 'catalogueItem-with-parent',
      title: 'Catalogue Item with Parent',
      schemaType: 'catalogueItem',
      parameters: [
        {
          name: 'parentId',
          title: 'Parent ID',
          type: 'string',
          description: 'ID of the parent catalogue item'
        }
      ],
      value: (params) => ({
        parent: params.parentId ? {
          _type: 'reference',
          _ref: params.parentId
        } : undefined
      })
    }
  ]
});

export default sanityConfig;
