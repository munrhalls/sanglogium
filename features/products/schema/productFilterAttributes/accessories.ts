import { vocabFor } from "./vocab";
import { awardsField } from "./shared";

export const accessoriesFields: any[] = [
        awardsField,
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
          domain: ["cables-interconnects"],
        },
        {
          name: "lengthM",
          title: "Length (m)",
          type: "number",
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
          domain: ["cables-interconnects"],
        },
        {
          name: "balancedUnbalanced",
          title: "Balanced / unbalanced",
          type: "string",
          options: { list: ["balanced", "unbalanced"] },
          domain: ["cables-interconnects"],
        },
        {
          name: "material",
          title: "Material",
          type: "array",
          of: [
            { type: "string", options: { list: ["wood", "metal", "acrylic", "composite-mdf"] } },
          ],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "adjustableHeight",
          title: "Adjustable height",
          type: "boolean",
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "weightCapacityKg",
          title: "Weight / load capacity (kg)",
          type: "number",
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "partType",
          title: "Part type",
          type: "string",
          options: {
            list: vocabFor("partType"),
          },
          domain: ["replacement-parts"],
        },
        {
          name: "compatibility",
          title: "Compatible model / brand",
          type: "array",
          of: [{ type: "string", options: { list: ["<compatible-model>"] } }],
          description: "Critical filter.",
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
          domain: ["adapters-converters"],
        },
        {
          name: "accessoryType",
          title: "Accessory category",
          type: "string",
          options: { list: vocabFor("accessoryType") },
          description:
            "Gates every domain-specific field via each field's `domain`.",
        },
];
