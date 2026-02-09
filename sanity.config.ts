import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
// import { colorInput } from "@sanity/color-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";

const sanityConfig = defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [...schema.types],
  },
  plugins: [structureTool({ structure }), visionTool()],
});

export default sanityConfig;
