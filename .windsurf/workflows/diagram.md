---
description: Diagram standards and conventions for Mermaid diagrams
---

## Location Convention

**If file provided:** Place diagram in `diagrams/` subdirectory next to the attached file
- Example: `tests/basket/unit/basketLatestCheck.spec.ts` → `tests/basket/unit/diagrams/diagram-basket-latest-check.md`
- Create `diagrams/` directory if it doesn't exist

**If no file provided:** Place diagram in `docs/diagrams/` directory
- Example: `diagram-checkout-flow.md` → `docs/diagrams/diagram-checkout-flow.md`

## Naming Convention

**If file provided:** Derive diagram name from the test/spec file name
- Format: `diagram-{kebab-case-name}.md`
- Example: `basketStoreFreshness.spec.ts` → `diagram-basket-store-freshness.md`

**If no file provided:** Use descriptive name following the same format
- Format: `diagram-{kebab-case-name}.md`
- Example: `diagram-checkout-flow.md`

## Diagram Standards

1. Structural Foundation
Direction: Use graph LR (Left-Right) for flows and graph TD (Top-Down) for hierarchies. Horizontal layout aligns with natural left-to-right eye scanning, improving readability for sequential information.

Node Count: Maximum 7-9 nodes per flow. Beyond this limit, split into multiple diagrams stacked vertically to respect cognitive load limits (working memory capacity: 7±2 items).

Isolation: If an executable spec has more than three distinct logic branches or logical layers (e.g., UI, State, API), it must be split into separate, focused diagrams.

Grouping: Use subgraphs to group related elements (enclosure principle). This reduces cognitive load by creating visual "chunks" of information.

2. Visual Configuration (Global Standard)
Every diagram must include a classDef block using these specific CSS constraints to override default tiny scaling:

```mermaid
classDef large font-size:18px,padding:12px,stroke-width:2px;
classDef logic fill:#fff4dd,stroke:#d4a017,font-size:18px;
classDef state fill:#e1f5fe,stroke:#01579b,font-size:18px;
classDef action fill:#e8f5e9,stroke:#2e7d32,font-size:18px;
```

Font Size: Minimum 18px. Below this requires conscious decoding effort and increases cognitive load.

Color Palette: Limit to 3-5 colors maximum. More colors increase cognitive load and violate similarity principle. Use color to encode meaning, not decoration.

White Space: Use padding: 12px intentionally as "breathing room" that guides attention, not empty space.

3. Labeling Constraints
Verb-Noun Only: Labels must not exceed 4 words.

Bad: "Check if the productId is currently present in the items array"

Good: "Check Product ID"

Shape Semantics:
- {} Rhombus for Logic/Conditions.
- ([]) Stadium for Entry/Exit.
- [[]] Double Border for terminal UI states (Null/Errors).

4. Content Constraints
**NO EXPLANATORY TEXT**: Do NOT add any text summaries, flow descriptions, or explanations after the diagram. The diagram file must contain ONLY the title and the mermaid code block. No "Flow Summary", no "Entry Point", no "Main Branches", no "Terminal States" sections.
