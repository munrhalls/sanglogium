#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SangLogiumMCPServer {
  constructor() {
    this.server = {
      name: "sang-logium-workflow",
      version: "1.0.0",
    };
    this.projectRoot = path.resolve(__dirname, "..");
  }

  // Get workflow instructions
  getInstructions() {
    try {
      const instructionsPath = path.join(
        this.projectRoot,
        "cursor-instructions.md",
      );
      return fs.readFileSync(instructionsPath, "utf8");
    } catch (error) {
      return `# Instructions Not Found\nPlease create cursor-instructions.md in your project root.\nError: ${error.message}`;
    }
  }

  // Get project structure context for sang-logium
  getProjectContext() {
    const context = [];

    context.push("# sang-logium Project Context\n");

    // Check key directories from your project structure
    const keyDirs = [
      "app",
      "sanity",
      "components/features",
      "components/ui",
      "actions",
      "services",
      "hooks",
    ];

    keyDirs.forEach((dir) => {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        context.push(`✅ /${dir} directory exists`);
      } else {
        context.push(`❌ /${dir} directory missing`);
      }
    });

    // Check specific sang-logium features
    const projectFeatures = [
      "app/(store)/basket - Basket functionality",
      "app/(store)/checkout - Checkout flow",
      "app/(store)/product - Product pages",
      "components/features/auth - Clerk authentication",
      "components/features/basket - Basket controls",
      "sanity/schemaTypes - CMS schemas",
    ];

    context.push("\n## Key Project Features:");
    projectFeatures.forEach((feature) => {
      const [dirPath, description] = feature.split(" - ");
      const fullPath = path.join(this.projectRoot, dirPath);
      if (fs.existsSync(fullPath)) {
        context.push(`✅ ${description} (${dirPath})`);
      }
    });

    context.push(`\n## Project Root: ${this.projectRoot}`);
    context.push(
      "\n## Remember: Follow specifications-first, test-driven workflow!",
    );

    return context.join("\n");
  }

  // Find relevant context based on task keywords
  findRelevantContext(task) {
    const taskLower = task.toLowerCase();
    const suggestions = [];

    // Subsystem mappings
    const subsystems = {
      vfs: {
        keywords: ["vfs", "catalogue", "category", "slug", "tree", "navigation", "slot"],
        files: [
          "data/catalogue-index.json",
          "scripts/build-catalogue-index.mjs",
          "lib/catalogue/semanticConfig.ts",
          "lib/catalogue/semanticMatching.ts",
          "scripts/context-for-vfs-task.mjs"
        ],
        runContext: "node scripts/context-for-vfs-task.mjs"
      },
      sanity: {
        keywords: ["sanity", "cms", "groq", "schema", "typegen", "product", "document"],
        files: [
          "sanity/schemaTypes/productType.ts",
          "sanity/schemaTypes/catalogueItemType.ts",
          "sanity/types.ts",
          "sanity/lib/client.ts",
          "scripts/context-for-sanity-task.mjs"
        ],
        runContext: "node scripts/context-for-sanity-task.mjs"
      },
      fsm: {
        keywords: ["fsm", "order", "status", "state", "lifecycle", "warehouse", "pack"],
        files: [
          "sanity/schemaTypes/orderType.ts",
          "sanity/ORDER_MANAGEMENT_SYSTEM.md",
          "app/(admin)/manager/",
          "app/(admin)/packer/",
          "scripts/context-for-fsm-task.mjs"
        ],
        runContext: "node scripts/context-for-fsm-task.mjs"
      },
      checkout: {
        keywords: ["checkout", "payment", "stripe", "address", "shipping", "cart"],
        files: [
          "app/actions/checkout/getOrderBySession.ts",
          "app/actions/address/address.ts",
          "app/api/webhook/stripe/route.ts",
          "app/(store)/checkout/",
          "scripts/context-for-checkout-task.mjs"
        ],
        runContext: "node scripts/context-for-checkout-task.mjs"
      },
      plp: {
        keywords: ["plp", "product list", "product grid", "category page", "filter"],
        files: [
          "app/(store)/brand/",
          "app/(store)/[...slug]/",
          "components/features/product/ProductCard.tsx"
        ]
      },
      pdp: {
        keywords: ["pdp", "product detail", "product page", "single product"],
        files: [
          "app/(store)/product/[slug]/",
          "components/features/product/ProductDetails.tsx"
        ]
      },
      basket: {
        keywords: ["basket", "cart", "add to cart", "remove from cart"],
        files: [
          "app/(store)/basket/",
          "components/features/basket/",
          "store/store.ts"
        ]
      }
    };

    // Match subsystems
    Object.entries(subsystems).forEach(([name, config]) => {
      const matches = config.keywords.filter(kw => taskLower.includes(kw));
      if (matches.length > 0) {
        suggestions.push({
          subsystem: name,
          confidence: matches.length,
          files: config.files,
          runContext: config.runContext || null
        });
      }
    });

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions;
  }

  // Suggest agent/tools based on task
  suggestAgent(task) {
    const context = this.findRelevantContext(task);

    let response = `# Task Analysis: "${task}"\n\n`;

    if (context.length === 0) {
      response += "No specific subsystem detected. General debugging workflow recommended.\n\n";
      response += "## Suggested Commands:\n";
      response += "• Run context scripts: `node scripts/context-for-*.mjs`\n";
      response += "• Check debug workflow: `/debug`\n";
    } else {
      response += "## Detected Subsystems:\n\n";

      context.slice(0, 3).forEach((match, i) => {
        response += `### ${i + 1}. ${match.subsystem.toUpperCase()} (confidence: ${match.confidence})\n`;
        response += "**Relevant Files:**\n";
        match.files.forEach(f => {
          response += `• ${f}\n`;
        });

        if (match.runContext) {
          response += `\n**Quick Context:** \`${match.runContext}\`\n`;
        }
        response += "\n";
      });
    }

    response += "## Next Steps:\n";
    response += "1. Review relevant files above\n";
    response += "2. Run context script for domain knowledge\n";
    response += "3. Use `/debug` workflow for root cause analysis\n";

    return response;
  }

  // Handle MCP requests
  handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case "resources/list":
        return {
          resources: [
            {
              uri: "workflow://instructions",
              name: "sang-logium Workflow & Methodology",
              description:
                "Specifications-first, test-driven workflow and component archaeology principles",
              mimeType: "text/markdown",
            },
            {
              uri: "workflow://project-context",
              name: "sang-logium Project Structure",
              description:
                "Audio equipment e-commerce project structure and available features",
              mimeType: "text/markdown",
            },
          ],
        };

      case "resources/read":
        if (params.uri === "workflow://instructions") {
          return {
            contents: [
              {
                uri: params.uri,
                mimeType: "text/markdown",
                text: this.getInstructions(),
              },
            ],
          };
        } else if (params.uri === "workflow://project-context") {
          return {
            contents: [
              {
                uri: params.uri,
                mimeType: "text/markdown",
                text: this.getProjectContext(),
              },
            ],
          };
        }
        throw new Error(`Unknown resource: ${params.uri}`);

      case "initialize":
        return {
          protocolVersion: "2025-03-26",
          capabilities: {
            resources: {},
          },
          serverInfo: this.server,
        };

      case "tools/list":
        return {
          tools: [
            {
              name: "find_relevant_context",
              description: "Find relevant files and context based on a task description",
              inputSchema: {
                type: "object",
                properties: {
                  task: {
                    type: "string",
                    description: "The task or problem description to analyze"
                  }
                },
                required: ["task"]
              }
            },
            {
              name: "suggest_agent",
              description: "Get suggested files and workflow based on a task",
              inputSchema: {
                type: "object",
                properties: {
                  task: {
                    type: "string",
                    description: "The task or problem to get suggestions for"
                  }
                },
                required: ["task"]
              }
            }
          ]
        };

      case "tools/call":
        if (params.name === "find_relevant_context") {
          const suggestions = this.findRelevantContext(params.arguments.task);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(suggestions, null, 2)
              }
            ]
          };
        } else if (params.name === "suggest_agent") {
          const suggestion = this.suggestAgent(params.arguments.task);
          return {
            content: [
              {
                type: "text",
                text: suggestion
              }
            ]
          };
        }
        throw new Error(`Unknown tool: ${params.name}`);

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  // Start stdio server
  start() {
    let buffer = "";

    process.stdin.on("data", (chunk) => {
      buffer += chunk.toString();

      // Process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      lines.forEach((line) => {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = this.handleRequest(request);

            console.log(
              JSON.stringify({
                jsonrpc: "2.0",
                id: request.id,
                result: response,
              }),
            );
          } catch (error) {
            console.log(
              JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                error: {
                  code: -1,
                  message: error.message,
                },
              }),
            );
          }
        }
      });
    });

    process.stdin.resume();
  }
}

const server = new SangLogiumMCPServer();
server.start();
