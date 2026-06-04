/**
 * ESLint Plugin for Sang-Logium
 *
 * Custom rules to catch common AI agent mistakes.
 * See AGENTS.md for rule documentation.
 */

"use strict";

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS module
module.exports = {
  rules: {
    // Rule 2: No cloneElement for prop injection
    "no-clone-element": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow cloneElement for prop injection",
          category: "Best Practices",
          recommended: true,
        },
        messages: {
          noCloneElement: "Use React Context instead of cloneElement. See AGENTS.md Critical Anti-Patterns.",
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === "Identifier" &&
              node.callee.name === "cloneElement"
            ) {
              context.report({
                node,
                messageId: "noCloneElement",
              });
            }
            // Also catch React.cloneElement
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.object.type === "Identifier" &&
              node.callee.object.name === "React" &&
              node.callee.property.type === "Identifier" &&
              node.callee.property.name === "cloneElement"
            ) {
              context.report({
                node,
                messageId: "noCloneElement",
              });
            }
          },
        };
      },
    },

    // Rule 4: GROQ reference syntax
    "groq-reference-syntax": {
      meta: {
        type: "problem",
        docs: {
          description: "Enforce correct GROQ reference dereferencing syntax",
          category: "Best Practices",
          recommended: true,
        },
        messages: {
          // eslint-disable-next-line sang-logium/groq-reference-syntax -- Error message contains example syntax
          wrongSyntax: "Use field->name NOT field with braces around single field. See AGENTS.md GROQ rules.",
        },
      },
      create(context) {
        function checkString(value, node) {
          // Match pattern like brand->{name} or category->{slug}
          // but not brand->{_id, name, slug} (multi-field projection is OK)
          // eslint-disable-next-line sang-logium/groq-reference-syntax -- Regex pattern for detection
          const wrongPattern = /\w+->\{\s*\w+\s*\}/g;
          const matches = value.match(wrongPattern);

          if (matches) {
            // Check if it's just a single field (wrong) vs multi-field (OK)
            for (const match of matches) {
              const content = match.match(/\{(.*)\}/)[1];
              // If there's only one field name with no commas, it's wrong
              if (!content.includes(",") && !content.includes("_id")) {
                context.report({
                  node,
                  messageId: "wrongSyntax",
                });
                break;
              }
            }
          }
        }

        return {
          Literal(node) {
            if (typeof node.value === "string") {
              checkString(node.value, node);
            }
          },
          TemplateElement(node) {
            if (node.value && node.value.cooked) {
              checkString(node.value.cooked, node);
            }
          },
        };
      },
    },

    // Rule 5: No direct Sanity queries in Client Components
    "no-direct-sanity-in-client": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow direct Sanity client usage in Client Components",
          category: "Architecture",
          recommended: true,
        },
        messages: {
          noDirectSanity: "Use Server Components for Sanity queries. See AGENTS.md Architecture Constraints.",
        },
      },
      create(context) {
        let hasUseClient = false;
        let hasSanityImport = false;

        return {
          // Check for 'use client'
          ExpressionStatement(node) {
            if (
              node.expression.type === "Literal" &&
              node.expression.value === "use client"
            ) {
              hasUseClient = true;
            }
          },
          // Check for sanity client import
          ImportDeclaration(node) {
            if (
              node.source.value.includes("sanity") &&
              node.source.value.includes("client")
            ) {
              hasSanityImport = true;
            }
          },
          // Check for sanityClient.fetch usage
          CallExpression(node) {
            if (
              hasUseClient &&
              node.callee.type === "MemberExpression" &&
              node.callee.object.type === "Identifier" &&
              (node.callee.object.name === "sanityClient" ||
               node.callee.object.name.includes("sanity")) &&
              node.callee.property.type === "Identifier" &&
              node.callee.property.name === "fetch"
            ) {
              context.report({
                node,
                messageId: "noDirectSanity",
              });
            }
          },
          "Program:exit"() {
            // Reset for next file
            hasUseClient = false;
            hasSanityImport = false;
          },
        };
      },
    },

    // Rule 3: useQueryState null check (simplified - checks for obvious direct usage)
    "useQueryState-null-check": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Warn about useQueryState usage without null check",
          category: "Best Practices",
          recommended: true,
        },
        messages: {
          addNullCheck: "Add null check: `const [filters = []] = useQueryState(...)` or `(filters || []).map()`. See AGENTS.md.",
        },
      },
      create(context) {
        const useQueryStateCalls = new Map();

        return {
          // Track useQueryState calls
          CallExpression(node) {
            if (
              node.callee.type === "Identifier" &&
              node.callee.name === "useQueryState"
            ) {
              // Get the variable name it's assigned to
              const parent = node.parent;
              if (
                parent.type === "VariableDeclarator" &&
                parent.id.type === "ArrayPattern"
              ) {
                const varName = parent.id.elements[0]?.name;
                if (varName) {
                  useQueryStateCalls.set(varName, {
                    hasDefault: !!parent.id.elements[0]?.right, // Check for = [] in destructuring
                    node: parent,
                  });
                }
              }
            }
          },
          // Check for .map() calls on useQueryState results without null check
          MemberExpression(node) {
            if (
              node.property.type === "Identifier" &&
              node.property.name === "map" &&
              node.object.type === "Identifier"
            ) {
              const varName = node.object.name;
              const tracked = useQueryStateCalls.get(varName);

              if (tracked && !tracked.hasDefault) {
                // Check if it's wrapped in optional chaining or null check
                const parent = node.parent;
                if (
                  parent.type !== "ChainExpression" && // Not using ?.
                  parent.type !== "LogicalExpression" // Not using || fallback
                ) {
                  context.report({
                    node,
                    messageId: "addNullCheck",
                  });
                }
              }
            }
          },
        };
      },
    },

    // Rule 8: Warn on unnecessary 'use client'
    "server-component-default": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Warn if 'use client' might be unnecessary",
          category: "Best Practices",
          recommended: false, // Advisory only
        },
        messages: {
          considerServer: "Consider if this needs to be a Client Component. Server Components are default. See AGENTS.md Architecture Constraints.",
        },
      },
      create(context) {
        let hasUseClient = false;
        let hasInteractivity = false;

        return {
          ExpressionStatement(node) {
            if (
              node.expression.type === "Literal" &&
              node.expression.value === "use client"
            ) {
              hasUseClient = true;
            }
          },
          // Check for signs of interactivity
          CallExpression(node) {
            if (
              node.callee.type === "Identifier" &&
              [
                "useState",
                "useEffect",
                "useReducer",
                "useCallback",
                "useMemo",
              ].includes(node.callee.name)
            ) {
              hasInteractivity = true;
            }
          },
          // Event handlers indicate interactivity
          JSXAttribute(node) {
            if (
              node.name.type === "JSXIdentifier" &&
              node.name.name.startsWith("on") &&
              node.name.name.length > 2 &&
              node.name.name[2] === node.name.name[2].toUpperCase()
            ) {
              hasInteractivity = true;
            }
          },
          "Program:exit"(node) {
            if (hasUseClient && !hasInteractivity) {
              context.report({
                node,
                messageId: "considerServer",
              });
            }
            // Reset
            hasUseClient = false;
            hasInteractivity = false;
          },
        };
      },
    },

    // Rule 6: Test import discipline (basic version - warns on suspicious patterns)
    "test-import-discipline": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Warn when test files may be copying instead of importing",
          category: "Testing",
          recommended: true,
        },
        messages: {
          mayBeCopying: "Ensure you're importing from source, not copying implementation. See AGENTS.md Testing Rules.",
        },
      },
      create(context) {
        // Only run in test files
        const filename = context.getFilename();
        if (!filename.includes(".test.") && !filename.includes(".spec.")) {
          return {};
        }

        return {
          // Warn on class definitions in test files
          ClassDeclaration(node) {
            // Skip if it's a test helper class that's exported
            if (node.parent.type === "ExportNamedDeclaration") {
              return;
            }

            context.report({
              node,
              messageId: "mayBeCopying",
            });
          },
          // Warn on function declarations that look like copies
          FunctionDeclaration(node) {
            // Skip if exported (might be legitimate helper)
            if (node.parent.type === "ExportNamedDeclaration") {
              return;
            }

            // Skip test lifecycle functions
            if (["beforeEach", "afterEach", "beforeAll", "afterAll"].includes(node.id.name)) {
              return;
            }

            // If function name looks like a utility (generate*, calculate*, etc.)
            const suspiciousPrefixes = ["generate", "calculate", "format", "parse", "validate", "transform"];
            if (suspiciousPrefixes.some(prefix => node.id.name.toLowerCase().startsWith(prefix))) {
              context.report({
                node,
                messageId: "mayBeCopying",
              });
            }
          },
        };
      },
    },
  },
};
