import { vocabFor } from "../../../product-filtering/core/definitions/facetMap";

export const accessoriesFields: any[] = [
        {
          name: "compatibleProductType",
          title: "Compatible product type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: vocabFor("compatibleProductType"),
              },
            },
          ],
          categories: ["accessories"],
        },
        {
          name: "cableFunction",
          title: "Cable function",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: vocabFor("cableFunction"),
              },
            },
          ],
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "connectorTermination",
          title: "Termination / connector type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: vocabFor("connectorTermination"),
              },
            },
          ],
          description: "Critical filter.",
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "lengthM",
          title: "Length (m)",
          type: "number",
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "conductorMaterial",
          title: "Conductor material",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: vocabFor("conductorMaterial") },
            },
          ],
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "balancedUnbalanced",
          title: "Balanced / unbalanced",
          type: "string",
          options: { list: ["balanced", "unbalanced"] },
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "furnitureType",
          title: "Furniture type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "speaker-stand",
                  "equipment-rack-shelf",
                  "isolation-platform-feet-pucks",
                  "turntable-wall-shelf",
                  "wall-mount",
                ],
              },
            },
          ],
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "material",
          title: "Material",
          type: "array",
          of: [
            { type: "string", options: { list: ["wood", "metal", "acrylic", "composite-mdf"] } },
          ],
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "adjustableHeight",
          title: "Adjustable height",
          type: "boolean",
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "weightCapacityKg",
          title: "Weight / load capacity (kg)",
          type: "number",
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "cleaningProductType",
          title: "Cleaning product type",
          type: "string",
          options: {
            list: [
              "record-cleaning-fluid",
              "record-cleaning-machine",
              "stylus-brush-cleaner",
              "carbon-fiber-brush",
              "anti-static-gun",
              "demagnetizer",
              "screen-lens-cloth",
            ],
          },
          categories: ["accessories"],
          domain: ["cleaning-maintenance"],
        },
        {
          name: "formatCompatibility",
          title: "Format compatibility",
          type: "array",
          of: [
            { type: "string", options: { list: ["vinyl", "cd", "stylus-cartridge", "optical-lens"] } },
          ],
          categories: ["accessories"],
          domain: ["cleaning-maintenance"],
        },
        {
          name: "partType",
          title: "Part type",
          type: "string",
          options: {
            list: vocabFor("partType"),
          },
          categories: ["accessories"],
          domain: ["replacement-parts"],
        },
        {
          name: "compatibility",
          title: "Compatible model / brand",
          type: "array",
          of: [{ type: "string", options: { list: ["<compatible-model>"] } }],
          description: "Critical filter.",
          categories: ["accessories"],
          domain: ["replacement-parts"],
        },
        {
          name: "adapterFunction",
          title: "Adapter function",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "bluetooth-transmitter-receiver",
                  "headphone-impedance-attenuator-adapter",
                  "connector-adapter",
                  "standalone-phono-preamp",
                  "usb-dac-dongle",
                ],
              },
            },
          ],
          categories: ["accessories"],
          domain: ["adapters-converters"],
        },

];
